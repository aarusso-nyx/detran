// Adapter de prévia do `IntegrationClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6,
// D-06, D-11; inventário §2). Leitura: `raitReconciliations` de `rait-fixtures.json`, mapeada sem
// inventar campo (D-06; `divergences_count` `@default 0` do contrato gerado
// `BP-INF-RAIT-INTEGRATION-001`; `requested_by`/`requested_at`/`created_at` sem coluna →
// `source_pending`). Comandos: registram a string M8 e delegam ao cliente real, que lança.
import { Injectable, inject } from '@angular/core';
import { IntegrationClient } from '../../data/api/integration.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  ListPage,
  ListQuery,
  RaitReconciliation,
} from '../../data/models';
import { PreviewActionLog } from '../preview-action-log';
import type {
  FixtureReconciliation,
  RaitFixturesJson,
} from '../preview-fixtures';
import { PreviewFixtureReader, sourcePending } from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/integration.client.ts`.
const RECONCILIATION_SPEC: ListQuerySpec<RaitReconciliation> = {
  q: [],
  filtro: ['system', 'status'],
};

/** `RaitReconciliation.divergences_count` `@default 0`. */
const RECONCILIATION_DEFAULT_DIVERGENCES = 0;

function toReconciliation(
  record: FixtureReconciliation,
  tenantId: string,
): RaitReconciliation {
  return {
    id: record.id,
    tenant_id: tenantId,
    system: record.system,
    window_from: record.windowFrom,
    window_to: record.windowTo,
    requested_by: sourcePending(),
    requested_at: sourcePending(),
    status: record.status,
    divergences_count: RECONCILIATION_DEFAULT_DIVERGENCES,
    created_at: sourcePending(),
  };
}

const reconciliations = (f: RaitFixturesJson): readonly RaitReconciliation[] =>
  f.raitReconciliations.map((record) => toReconciliation(record, f.tenant.id));

@Injectable({ providedIn: 'root' })
export class PreviewIntegrationClient extends IntegrationClient {
  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitReconciliation(
    query: ListQuery = {},
  ): Promise<ListPage<RaitReconciliation>> {
    return this.previewReader.list(query, RECONCILIATION_SPEC, reconciliations);
  }

  override getRaitReconciliation(id: string): Promise<RaitReconciliation> {
    return this.previewReader.get('raitReconciliations', id, reconciliations);
  }

  // --- comandos (contrato §6: registra a string M8 e delega; o cliente real lança) ------------

  override retry(
    ...args: Parameters<IntegrationClient['retry']>
  ): ReturnType<IntegrationClient['retry']> {
    this.previewLog.record('rait-integration:retry');
    return super.retry(...args);
  }

  override reconcile(
    ...args: Parameters<IntegrationClient['reconcile']>
  ): ReturnType<IntegrationClient['reconcile']> {
    this.previewLog.record('rait-integration:reconcile');
    return super.reconcile(...args);
  }
}
