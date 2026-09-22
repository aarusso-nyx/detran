// CollectionClient (contrato CTG-0002b §3.3/§3.5; M9): 4 pares list/get de
// `BP-INF-COLLECTION-001` (nome = `operationId`, URL literal do `paths`, ADR-0003) e 4 métodos
// de comando de ficha (OD-R12-027) com corpo M8 (`RaitCommandUnavailableError`) até R-0007
// CTG-0004. Ver `case.client.ts` para as regras comuns.
import { Injectable, inject } from '@angular/core';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../list-query';
import type {
  CollectionDocument,
  CommandBody,
  CommandResult,
  CreateCollectionDocumentDto,
  CreateDebtHandoffDto,
  DebtHandoff,
  ListPage,
  ListQuery,
  Payment,
  RefundOrder,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const COLLECTION_DOCUMENTS_URL = '/v1/inf/collection/collection-documents';
const PAYMENTS_URL = '/v1/inf/collection/payments';
const REFUND_ORDERS_URL = '/v1/inf/collection/refund-orders';
const DEBT_HANDOFFS_URL = '/v1/inf/collection/debt-handoffs';

const COLLECTION_DOCUMENT_SPEC: ListQuerySpec<CollectionDocument> = {
  q: [],
  filtro: ['infraction_id', 'tier', 'status'],
};
const PAYMENT_SPEC: ListQuerySpec<Payment> = {
  q: ['bank_reference'],
  filtro: ['document_id'],
};
const REFUND_ORDER_SPEC: ListQuerySpec<RefundOrder> = {
  q: [],
  filtro: ['infraction_id', 'status', 'reason'],
};
const DEBT_HANDOFF_SPEC: ListQuerySpec<DebtHandoff> = {
  q: [],
  filtro: ['infraction_id', 'status'],
};

@Injectable({ providedIn: 'root' })
export class CollectionClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  listCollectionDocument(
    query: ListQuery = {},
  ): Promise<ListPage<CollectionDocument>> {
    return this.http.getList(
      COLLECTION_DOCUMENTS_URL,
      query,
      COLLECTION_DOCUMENT_SPEC,
    );
  }

  getCollectionDocument(id: string): Promise<CollectionDocument> {
    return this.http.getOne(
      COLLECTION_DOCUMENTS_URL,
      'collection-documents',
      id,
    );
  }

  listPayment(query: ListQuery = {}): Promise<ListPage<Payment>> {
    return this.http.getList(PAYMENTS_URL, query, PAYMENT_SPEC);
  }

  getPayment(id: string): Promise<Payment> {
    return this.http.getOne(PAYMENTS_URL, 'payments', id);
  }

  listRefundOrder(query: ListQuery = {}): Promise<ListPage<RefundOrder>> {
    return this.http.getList(REFUND_ORDERS_URL, query, REFUND_ORDER_SPEC);
  }

  getRefundOrder(id: string): Promise<RefundOrder> {
    return this.http.getOne(REFUND_ORDERS_URL, 'refund-orders', id);
  }

  listDebtHandoff(query: ListQuery = {}): Promise<ListPage<DebtHandoff>> {
    return this.http.getList(DEBT_HANDOFFS_URL, query, DEBT_HANDOFF_SPEC);
  }

  getDebtHandoff(id: string): Promise<DebtHandoff> {
    return this.http.getOne(DEBT_HANDOFFS_URL, 'debt-handoffs', id);
  }

  /** §3.5 #60 (ficha 053; OD-R12-027) — `issue:<infraction_id>`. */
  async issueDocument(
    _body: CreateCollectionDocumentDto,
  ): Promise<CommandResult<CollectionDocument>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-COLLECTION-001.commands
    throw new RaitCommandUnavailableError('rait-collection:issue');
  }

  /** §3.5 #61 (ficha 054; OD-R12-027) — `order:<refundOrderId>`. */
  async orderRefund(
    _refundOrderId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RefundOrder>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-COLLECTION-001.commands
    throw new RaitCommandUnavailableError('rait-refund:order');
  }

  /** §3.5 #62 (ficha 055; OD-R12-027) — `handoff:<infraction_id>`. */
  async handoffDebt(
    _body: CreateDebtHandoffDto,
  ): Promise<CommandResult<DebtHandoff>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-COLLECTION-001.commands
    throw new RaitCommandUnavailableError('rait-debt:handoff');
  }

  /** §3.5 #63 (ficha 056; OD-R12-027) — `reconcile:<paymentId>`. */
  async reconcilePayment(
    _paymentId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<Payment>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-COLLECTION-001.commands
    throw new RaitCommandUnavailableError('rait-payment:reconcile');
  }
}
