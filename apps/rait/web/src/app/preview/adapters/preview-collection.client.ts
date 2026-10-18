// Adapter de prévia do `CollectionClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6,
// D-06, D-11; inventário §2). Leituras sobre `collectionDocuments`, `payments`, `refundOrders` e
// `debtHandoffs` de `rait-fixtures.json`. D-06 (6): os modelos `CollectionDocument` (`amount`,
// `issued_for_state`), `Payment` (`amount`) e `RefundOrder` (`base_amount`) exigem número/token
// que nem a fixture nem o contrato gerado (`@default`) fornecem — nenhum valor é fabricado: esses
// registros ficam BLOQUEADOS (listas vazias; `get*` → `rait-preview-fixture-missing`) e a lacuna
// está no relatório de TASK-0003. `DebtHandoff` é mapeado (`prepared_at`/`created_at` →
// `source_pending`). Comandos: registram a string M8 e delegam ao cliente real, que lança.
import { Injectable, inject } from '@angular/core';
import { CollectionClient } from '../../data/api/collection.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  CollectionDocument,
  DebtHandoff,
  ListPage,
  ListQuery,
  Payment,
  RefundOrder,
} from '../../data/models';
import { PreviewActionLog } from '../preview-action-log';
import type { FixtureDebtHandoff, RaitFixturesJson } from '../preview-fixtures';
import {
  PreviewFixtureReader,
  notInFixture,
  sourcePending,
} from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/collection.client.ts`.
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

/** D-06 (6): registro bloqueado por campo numérico/token obrigatório sem fonte. */
const blockedByMissingRequiredValue = notInFixture;

function toDebtHandoff(
  record: FixtureDebtHandoff,
  tenantId: string,
): DebtHandoff {
  return {
    id: record.id,
    tenant_id: tenantId,
    infraction_id: record.infractionId,
    status: record.status,
    prepared_at: sourcePending(),
    cancel_reason: record.cancelReason ?? null,
    created_at: sourcePending(),
  };
}

const debtHandoffs = (f: RaitFixturesJson): readonly DebtHandoff[] =>
  f.debtHandoffs.map((record) => toDebtHandoff(record, f.tenant.id));

@Injectable({ providedIn: 'root' })
export class PreviewCollectionClient extends CollectionClient {
  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listCollectionDocument(
    query: ListQuery = {},
  ): Promise<ListPage<CollectionDocument>> {
    return this.previewReader.list(
      query,
      COLLECTION_DOCUMENT_SPEC,
      blockedByMissingRequiredValue,
    );
  }

  override getCollectionDocument(id: string): Promise<CollectionDocument> {
    return this.previewReader.get<CollectionDocument>(
      'collectionDocuments',
      id,
      blockedByMissingRequiredValue,
    );
  }

  override listPayment(query: ListQuery = {}): Promise<ListPage<Payment>> {
    return this.previewReader.list(
      query,
      PAYMENT_SPEC,
      blockedByMissingRequiredValue,
    );
  }

  override getPayment(id: string): Promise<Payment> {
    return this.previewReader.get<Payment>(
      'payments',
      id,
      blockedByMissingRequiredValue,
    );
  }

  override listRefundOrder(
    query: ListQuery = {},
  ): Promise<ListPage<RefundOrder>> {
    return this.previewReader.list(
      query,
      REFUND_ORDER_SPEC,
      blockedByMissingRequiredValue,
    );
  }

  override getRefundOrder(id: string): Promise<RefundOrder> {
    return this.previewReader.get<RefundOrder>(
      'refundOrders',
      id,
      blockedByMissingRequiredValue,
    );
  }

  override listDebtHandoff(
    query: ListQuery = {},
  ): Promise<ListPage<DebtHandoff>> {
    return this.previewReader.list(query, DEBT_HANDOFF_SPEC, debtHandoffs);
  }

  override getDebtHandoff(id: string): Promise<DebtHandoff> {
    return this.previewReader.get('debtHandoffs', id, debtHandoffs);
  }

  // --- comandos (contrato §6: registra a string M8 e delega; o cliente real lança) ------------

  override issueDocument(
    ...args: Parameters<CollectionClient['issueDocument']>
  ): ReturnType<CollectionClient['issueDocument']> {
    this.previewLog.record('rait-collection:issue');
    return super.issueDocument(...args);
  }

  override orderRefund(
    ...args: Parameters<CollectionClient['orderRefund']>
  ): ReturnType<CollectionClient['orderRefund']> {
    this.previewLog.record('rait-refund:order');
    return super.orderRefund(...args);
  }

  override handoffDebt(
    ...args: Parameters<CollectionClient['handoffDebt']>
  ): ReturnType<CollectionClient['handoffDebt']> {
    this.previewLog.record('rait-debt:handoff');
    return super.handoffDebt(...args);
  }

  override reconcilePayment(
    ...args: Parameters<CollectionClient['reconcilePayment']>
  ): ReturnType<CollectionClient['reconcilePayment']> {
    this.previewLog.record('rait-payment:reconcile');
    return super.reconcilePayment(...args);
  }
}
