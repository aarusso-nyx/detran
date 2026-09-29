// CTG-0004 §3.1, §5.2 (R-0008, TASK-0009, RN-TEAT-133) —
// `POST procedures/{id}/tests`.
import { DetranError } from '@detran/shared';

import { classifyConsidered } from './classification.js';
import { alcoholTestRegisteredEvent } from './events.js';
import {
  appendEvent,
  assertAlcoholAllowed,
  findRow,
  lockRow,
  findRowsWhere,
  inTenantTransaction,
  insertRow,
  patchRow,
  scopeOf,
  stringOf,
  tenantMismatch,
  type AlcoholDeps,
  type AlcoholRow,
} from './alcohol-runtime.js';
import {
  consideredOf,
  isMetrologicalTableJson,
  maxErrorFor,
  type MetrologicalTableJson,
} from './metrological-table.js';

const ALLOWED = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'] as const;

/** `null` para ausente/vazio — `traffic_agency_id` é opcional em ambas as
 * tabelas (CTG-0004 §16.4). */
function agencyIdOf(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export interface RecordAlcoholTestInput {
  breathalyzer_id?: string;
  test_number?: string;
  tested_at?: string;
  result_mg_l?: number;
  counterproof?: boolean;
  result_image_evidence_id?: string;
  outcome?: string;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class RecordTestCommand {
  constructor(private readonly deps: AlcoholDeps) {}

  async execute(
    procedureId: string,
    input: RecordAlcoholTestInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    const testedAt = input.tested_at ?? scope.occurredAt;

    return inTenantTransaction(this.deps, async (tx) => {
      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
      if (!procedure) throw tenantMismatch({ procedureId });
      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-test');

      // 1. guard central ([WF-TEAT-005]): etilômetro com verificação vigente.
      const breathalyzerId = input.breathalyzer_id ?? '';
      const breathalyzer = breathalyzerId
        ? await findRow(this.deps, tx, 'breathalyzers', breathalyzerId)
        : undefined;
      const calibrationValidUntil = stringOf(
        breathalyzer?.calibration_valid_until,
      );
      const notVerified =
        !breathalyzer ||
        breathalyzer.status !== 'active' ||
        !calibrationValidUntil ||
        calibrationValidUntil.slice(0, 10) < testedAt.slice(0, 10);
      if (notVerified)
        throw new DetranError('TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED', {
          status: 422,
          context: { breathalyzerId, calibrationValidUntil, testedAt },
          message: 'Etilômetro sem verificação metrológica vigente.',
        });

      // 2. tabela metrológica ativa cujo catálogo TAMBÉM está ativo — e, se o
      // catálogo tiver `traffic_agency_id`, do mesmo órgão do procedimento
      // (CTG-0004 §5.2/§16.4, adenda iteração 3, achado #4 da
      // delivery-review ciclo 1: `status='active'` só na própria tabela não
      // basta se o catálogo dela já foi aposentado — `retired`).
      const procedureAgencyId = agencyIdOf(procedure.traffic_agency_id);
      const activeTables = await findRowsWhere(
        this.deps,
        tx,
        'metrologicalTables',
        'status',
        'active',
      );
      let tableRow: AlcoholRow | undefined;
      let firstCatalogId: string | null = null;
      for (const candidate of activeTables) {
        const catalogId = stringOf(candidate.catalog_id);
        if (!catalogId) continue;
        if (firstCatalogId === null) firstCatalogId = catalogId;
        const catalog = await findRow(this.deps, tx, 'catalogs', catalogId);
        if (!catalog || catalog.status !== 'active') continue;
        const catalogAgencyId = agencyIdOf(catalog.traffic_agency_id);
        if (catalogAgencyId && catalogAgencyId !== procedureAgencyId) continue;
        tableRow = candidate;
        break;
      }
      if (!tableRow || !isMetrologicalTableJson(tableRow.table_json))
        throw new DetranError('TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', {
          status: 422,
          context: { catalogId: firstCatalogId },
          message:
            'Nenhuma tabela metrológica ativa de catálogo vigente para o órgão.',
        });
      const table = tableRow.table_json as MetrologicalTableJson;

      // 3. `result_mg_l` obrigatório.
      if (typeof input.result_mg_l !== 'number')
        throw new DetranError('TEAT.ALCOHOL_RESULT_PAIR_REQUIRED', {
          status: 400,
          context: {},
          message: 'Resultado do teste é obrigatório.',
        });

      const resultMgL = input.result_mg_l;
      const maxErrorMgL = maxErrorFor(table, resultMgL);
      const consideredMgL = consideredOf(resultMgL, maxErrorMgL);
      const outcome = classifyConsidered(consideredMgL, table.thresholds);

      const test = await insertRow(this.deps, tx, 'tests', {
        procedure_id: procedureId,
        breathalyzer_id: breathalyzerId || null,
        test_number: input.test_number ?? null,
        tested_at: testedAt,
        result_mg_l: resultMgL,
        max_error_mg_l: maxErrorMgL,
        considered_mg_l: consideredMgL,
        counterproof: input.counterproof ?? false,
        result_image_evidence_id: input.result_image_evidence_id ?? null,
        status: 'recorded',
      });
      await patchRow(this.deps, tx, 'procedures', procedureId, {
        status: outcome,
        outcome,
      });
      await appendEvent(
        this.deps,
        tx,
        alcoholTestRegisteredEvent(scope, {
          procedureId,
          testId: stringOf(test.id),
          breathalyzerId: breathalyzerId || null,
          testedAt,
          resultMgL,
          maxErrorMgL,
          consideredMgL,
          outcome,
          toState: outcome,
        }),
      );

      return {
        id: stringOf(test.id),
        procedure_id: procedureId,
        result_mg_l: resultMgL,
        max_error_mg_l: maxErrorMgL,
        considered_mg_l: consideredMgL,
        procedure_status: outcome,
      };
    });
  }
}
