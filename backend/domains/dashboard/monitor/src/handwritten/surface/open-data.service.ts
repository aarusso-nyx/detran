// Datasets e dados abertos (CTG-0002 §3.7, §10.6 — [RN-DASH-151],
// [RN-DASH-161] verificação 5; plan M22): só conjuntos pré-agregados das
// tabelas próprias, publicados (`published_at`), com supressão §9.5 e marca
// d'água; nenhuma query string (`DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN`).
// Os três `dataset_key` são os declarados pelo contrato (OD-D53).
import { Inject, Injectable } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import type { Clock } from '@detran/inf-deadlines';

import { DASHBOARD_CLOCK } from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { readCellThreshold, tenantInfoOf } from './layer-gate.js';
import { suppress, type CountCell } from './suppression.js';
import { watermarkOf } from './watermark.js';
import {
  DashboardAuditService,
  datasetMissing,
  datasetView,
} from './audit.service.js';

/** `dataset_key` declarados (§10.6, OD-D53). */
export const OPEN_DATASET_KEYS = [
  'alerts-by-severity-month',
  'duties-compliance-year',
  'sources-availability-month',
] as const;
export type OpenDatasetKey = (typeof OPEN_DATASET_KEYS)[number];

interface DictionaryEntry {
  field: string;
  type: string;
  description: string;
}

const GROUP_DICTIONARY: readonly DictionaryEntry[] = [
  {
    field: 'cells',
    type: 'array',
    description: 'células do grupo (key, count, suppression)',
  },
  {
    field: 'total',
    type: 'integer|null',
    description: 'total publicado do grupo (nulo quando houve supressão)',
  },
  {
    field: 'totalSuppressed',
    type: 'boolean',
    description: 'total do grupo suprimido (RN-DASH-161)',
  },
];

const DICTIONARIES: Readonly<
  Record<OpenDatasetKey, readonly DictionaryEntry[]>
> = {
  'alerts-by-severity-month': [
    {
      field: 'period',
      type: 'string',
      description: 'mês civil (YYYY-MM) de detected_at',
    },
    {
      field: 'cells[].key',
      type: 'string',
      description: 'severidade (severity_ref)',
    },
    {
      field: 'cells[].count',
      type: 'integer|null',
      description: 'alertas detectados; nulo quando suprimido',
    },
    ...GROUP_DICTIONARY,
  ],
  'duties-compliance-year': [
    {
      field: 'period',
      type: 'string',
      description: 'ano civil (YYYY) do período do ciclo',
    },
    {
      field: 'cells[].key',
      type: 'string',
      description: 'estado do ciclo (duty_state_ref)',
    },
    {
      field: 'cells[].count',
      type: 'integer|null',
      description: 'ciclos; nulo quando suprimido',
    },
    ...GROUP_DICTIONARY,
  ],
  'sources-availability-month': [
    {
      field: 'period',
      type: 'string',
      description: 'mês civil (YYYY-MM) de last_seen_at',
    },
    {
      field: 'cells[].key',
      type: 'string',
      description: 'estado de frescor (freshness_state_ref)',
    },
    {
      field: 'cells[].count',
      type: 'integer|null',
      description: 'fontes; nulo quando suprimido',
    },
    ...GROUP_DICTIONARY,
  ],
};

interface AggregateRow extends Record<string, unknown> {
  period: string;
  key: string;
  count: string;
}

export interface OpenDataGroup {
  period: string;
  cells: CountCell[];
  total: number | null;
  totalSuppressed: boolean;
}

@Injectable()
export class DashboardOpenDataService {
  constructor(
    private readonly audit: DashboardAuditService,
    private readonly parameters: OpsParameterService,
    @Inject(DASHBOARD_CLOCK) private readonly clock: Clock,
  ) {}

  /** `GET datasets` — metadados (sete requisitos, licença, periodicidade, changelog, publicação). */
  async datasets(
    tx: DashboardSqlTransaction,
    tenantId: string,
  ): Promise<Record<string, unknown>[]> {
    const rows = await this.audit.datasets(tx, tenantId, false);
    return rows.map(datasetView);
  }

  /** `GET open-data/{dataset}` (§10.6). */
  async openData(
    tx: DashboardSqlTransaction,
    tenantId: string,
    datasetKey: string,
    user: { id: string; role: string },
  ): Promise<Record<string, unknown>> {
    if (!(OPEN_DATASET_KEYS as readonly string[]).includes(datasetKey)) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dataset: datasetKey },
      });
    }
    const key = datasetKey as OpenDatasetKey;
    const rows = await this.audit.datasets(tx, tenantId, false);
    const dataset = rows.find((row) => row.dataset_key === key);
    if (!dataset || dataset.published_at === null) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dataset: datasetKey },
      });
    }
    const missing = datasetMissing(dataset);
    if (missing.length > 0) {
      throw new DetranError('DASH.DATASET_REQUIREMENTS_UNMET', {
        status: 422,
        context: { dataset: datasetKey, missing },
      });
    }
    const threshold = await readCellThreshold(this.parameters);
    const aggregated = await this.aggregate(tx, tenantId, key);
    const groups = new Map<string, CountCell[]>();
    for (const row of aggregated) {
      const cells = groups.get(row.period) ?? [];
      cells.push({ key: row.key, count: Number(row.count) });
      groups.set(row.period, cells);
    }
    const result: OpenDataGroup[] = [];
    for (const [period, cells] of groups) {
      const suppressed = suppress(cells, threshold);
      result.push({
        period,
        cells: suppressed.rows,
        total: suppressed.total,
        totalSuppressed: suppressed.totalSuppressed,
      });
    }
    const now = this.clock.now();
    const tenant = await tenantInfoOf(tx, tenantId);
    return {
      dataset: key,
      name: dataset.name,
      classification: dataset.classification,
      license: dataset.license,
      periodicity: dataset.periodicity,
      dictionary: DICTIONARIES[key],
      generatedAt: now.toISOString(),
      watermark: watermarkOf({
        agency: tenant.agency,
        layer: 'N0',
        userRef: user.id,
        userRole: user.role,
        at: now,
        scope: key,
        filters: {},
        exportId: dataset.id,
      }),
      rows: result,
      changelog: dataset.changelog_json ?? [],
    };
  }

  private async aggregate(
    tx: DashboardSqlTransaction,
    tenantId: string,
    key: OpenDatasetKey,
  ): Promise<AggregateRow[]> {
    switch (key) {
      case 'alerts-by-severity-month': {
        const result = await tx.query<AggregateRow>(
          `select to_char(detected_at, 'YYYY-MM') as period, severity as key, count(*)::text as count
             from dashboard.alert where tenant_id = $1
            group by 1, 2 order by 1, 2`,
          [tenantId],
        );
        return result.rows;
      }
      case 'duties-compliance-year': {
        const result = await tx.query<AggregateRow>(
          `select substr(period, 1, 4) as period, state as key, count(*)::text as count
             from dashboard.duty_cycle where tenant_id = $1
            group by 1, 2 order by 1, 2`,
          [tenantId],
        );
        return result.rows;
      }
      case 'sources-availability-month': {
        const result = await tx.query<AggregateRow>(
          `select coalesce(to_char(last_seen_at, 'YYYY-MM'), 'sem-heartbeat') as period,
                  state as key, count(*)::text as count
             from dashboard.source where tenant_id = $1
            group by 1, 2 order by 1, 2`,
          [tenantId],
        );
        return result.rows;
      }
    }
  }
}
