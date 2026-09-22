// FinanceFacade (contrato CTG-0002b §4.3; M9): financeiro/* (páginas L0). Quatro listas por
// `CollectionClient` e 4 comandos de ficha (OD-R12-027) M8 até R-0007 CTG-0004. Sem linha na
// tabela §4.2 → só `tick$`/`resync$`.
import { Injectable, inject } from '@angular/core';
import { CollectionClient } from '../api/collection.client';
import { RaitClock } from '../clock';
import type {
  CollectionDocument,
  CommandBody,
  CreateCollectionDocumentDto,
  CreateDebtHandoffDto,
  DebtHandoff,
  ListQuery,
  Payment,
  RefundOrder,
} from '../models';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { bindStream } from './stream';

@Injectable({ providedIn: 'root' })
export class FinanceFacade {
  private readonly collection = inject(CollectionClient);
  private readonly clock = inject(RaitClock);

  readonly documentos = createListFacade<CollectionDocument>(
    (query) => this.collection.listCollectionDocument(query),
    this.clock,
  );
  readonly pagamentos = createListFacade<Payment>(
    (query) => this.collection.listPayment(query),
    this.clock,
  );
  readonly restituicoes = createListFacade<RefundOrder>(
    (query) => this.collection.listRefundOrder(query),
    this.clock,
  );
  readonly cobrancas = createListFacade<DebtHandoff>(
    (query) => this.collection.listDebtHandoff(query),
    this.clock,
  );
  readonly command = createCommandRunner();

  constructor() {
    bindStream({
      types: [],
      onEvent: () => undefined,
      slots: [
        this.documentos,
        this.pagamentos,
        this.restituicoes,
        this.cobrancas,
      ],
    });
  }

  loadCollectionDocuments(query: ListQuery = {}): Promise<void> {
    return this.documentos.load(query);
  }

  loadPayments(query: ListQuery = {}): Promise<void> {
    return this.pagamentos.load(query);
  }

  loadRefundOrders(query: ListQuery = {}): Promise<void> {
    return this.restituicoes.load(query);
  }

  loadDebtHandoffs(query: ListQuery = {}): Promise<void> {
    return this.cobrancas.load(query);
  }

  issueDocument(
    body: CreateCollectionDocumentDto,
  ): Promise<CommandOutcome<CollectionDocument>> {
    return this.command.run('rait-collection:issue', () =>
      this.collection.issueDocument(body),
    );
  }

  orderRefund(
    refundOrderId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RefundOrder>> {
    return this.command.run('rait-refund:order', () =>
      this.collection.orderRefund(
        refundOrderId,
        body,
        this.collection.etagOf('refund-orders', refundOrderId),
      ),
    );
  }

  handoffDebt(
    body: CreateDebtHandoffDto,
  ): Promise<CommandOutcome<DebtHandoff>> {
    return this.command.run('rait-debt:handoff', () =>
      this.collection.handoffDebt(body),
    );
  }

  reconcilePayment(
    paymentId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<Payment>> {
    return this.command.run('rait-payment:reconcile', () =>
      this.collection.reconcilePayment(
        paymentId,
        body,
        this.collection.etagOf('payments', paymentId),
      ),
    );
  }
}
