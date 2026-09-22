import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Action, Audit, etagOf, Resource } from '@detran/shared';
import type { CreateCollectionDocumentDto } from '../dto/create-collection-document.dto.js';
import type { CreateDebtHandoffDto } from '../dto/create-debt-handoff.dto.js';
import type { CreatePaymentDto } from '../dto/create-payment.dto.js';
import type { CreateRefundOrderDto } from '../dto/create-refund-order.dto.js';
import { CollectionDocumentService } from '../services/collection-document.service.js';
import { DebtHandoffService } from '../services/debt-handoff.service.js';
import { PaymentService } from '../services/payment.service.js';
import { RefundOrderService } from '../services/refund-order.service.js';

type Response = { setHeader(name: string, value: string): unknown };

@Controller('v1/inf/collection')
export class CollectionCommandsController {
  constructor(
    private readonly documents: CollectionDocumentService,
    private readonly payments: PaymentService,
    private readonly refunds: RefundOrderService,
    private readonly debts: DebtHandoffService,
    private readonly requestContext: RequestContext,
  ) {}
  private actorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new Error('Authenticated actor required');
    return actorId;
  }
  private reply<T>(response: Response, data: T, type: string) {
    response.setHeader('ETag', etagOf(1));
    return { data, events: [{ type, actorId: this.actorId() }] };
  }

  @Post('collection-documents')
  @HttpCode(201)
  @Resource('inf:rait-collection')
  @Action('issue')
  @Audit({
    action: 'INF_COLLECTION_DOCUMENT_ISSUE',
    entity: 'inf.collection_document',
  })
  async issueDocument(
    @Body() body: CreateCollectionDocumentDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (body.tier === 'desconto_40_fora_sne')
      throw new Error('OD-003 source_pending');
    const data = await this.documents.create({
      ...body,
      issued_by: this.actorId(),
    });
    return this.reply(response, data, 'inf.collection-document.issued');
  }

  @Post('payments/reconcile')
  @HttpCode(201)
  @Resource('inf:rait-payment')
  @Action('reconcile')
  @Audit({ action: 'INF_PAYMENT_RECONCILE', entity: 'inf.payment' })
  async reconcilePayment(
    @Body() body: CreatePaymentDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.payments.create({
      ...body,
      matched_at: new Date().toISOString(),
    });
    return this.reply(response, data, 'inf.payment.confirmed');
  }

  @Post('refund-orders')
  @HttpCode(201)
  @Resource('inf:rait-refund')
  @Action('order')
  @Audit({ action: 'INF_REFUND_ORDER', entity: 'inf.refund_order' })
  async orderRefund(
    @Body() body: CreateRefundOrderDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.reply(
      response,
      await this.refunds.create(body),
      'inf.refund.ordered',
    );
  }

  @Post('debt-handoffs')
  @HttpCode(201)
  @Resource('inf:rait-debt')
  @Action('handoff')
  @Audit({ action: 'INF_DEBT_HANDOFF', entity: 'inf.debt_handoff' })
  async handoffDebt(
    @Body() body: CreateDebtHandoffDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.reply(
      response,
      await this.debts.create(body),
      'inf.debt.handed-off',
    );
  }
}
