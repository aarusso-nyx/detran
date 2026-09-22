// IntegrationClient (contrato CTG-0002b §3.3/§3.5; M9): 1 par list/get de
// `BP-INF-RAIT-INTEGRATION-001` (nome = `operationId`, URL literal do `paths`, ADR-0003) e 2
// métodos de comando com corpo M8 (`RaitCommandUnavailableError`) até R-0007 CTG-0004. Ver
// `case.client.ts` para as regras comuns.
import { Injectable, inject } from '@angular/core';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../list-query';
import type {
  CommandBody,
  CommandResult,
  ListPage,
  ListQuery,
  RaitReconciliation,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const RECONCILIATIONS_URL = '/v1/inf/rait/reconciliations';

const RECONCILIATION_SPEC: ListQuerySpec<RaitReconciliation> = {
  q: [],
  filtro: ['system', 'status'],
};

@Injectable({ providedIn: 'root' })
export class IntegrationClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  listRaitReconciliation(
    query: ListQuery = {},
  ): Promise<ListPage<RaitReconciliation>> {
    return this.http.getList(RECONCILIATIONS_URL, query, RECONCILIATION_SPEC);
  }

  getRaitReconciliation(id: string): Promise<RaitReconciliation> {
    return this.http.getOne(RECONCILIATIONS_URL, 'reconciliations', id);
  }

  /** §3.5 #58 (ficha 052; OD-R12-027) — `retry:<reconciliationId>`. */
  async retry(
    _reconciliationId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitReconciliation>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-INTEGRATION-001.commands
    throw new RaitCommandUnavailableError('rait-integration:retry');
  }

  /** §3.5 #59 (ficha 052; OD-R12-027) — `reconcile:<reconciliationId>`. */
  async reconcile(
    _reconciliationId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitReconciliation>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-INTEGRATION-001.commands
    throw new RaitCommandUnavailableError('rait-integration:reconcile');
  }
}
