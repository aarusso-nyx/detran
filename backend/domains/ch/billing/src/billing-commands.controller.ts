import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  BillingLifecycleService,
  type CreateBillingItemCommand,
  type PublishExamPriceCommand,
} from './billing-lifecycle.service.js';

@Controller('v1/ch/billing')
@Resource('ch:billing-event')
export class BillingCommandsController {
  constructor(private readonly billing: BillingLifecycleService) {}

  @Get('report')
  @Resource('ch:invoice')
  @Action('read')
  report(
    @Query('referencePeriod') referencePeriod: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.billing.report(referencePeriod, clinicId);
  }

  @Post('exam-prices')
  @Action('write')
  @Audit({
    action: 'CH_BILLING_EXAM_PRICE_PUBLISH',
    entity: 'ch.federal_exam_public_price',
  })
  publishPrice(@Body() command: PublishExamPriceCommand) {
    return this.billing.publishExamPrice(command);
  }

  @Post('items')
  @Action('write')
  @Audit({ action: 'CH_BILLING_ITEM_CREATE', entity: 'ch.billing_item' })
  createItem(@Body() command: CreateBillingItemCommand) {
    return this.billing.createItem(command);
  }

  @Post('items/:id/payments')
  @Action('write')
  @Audit({ action: 'CH_BILLING_PAYMENT_VALIDATE', entity: 'ch.billing_item' })
  pay(
    @Param('id') id: string,
    @Body() body: { referenceNumber: string; amountPaidCents: number },
  ) {
    return this.billing.validatePayment(
      id,
      body.referenceNumber,
      body.amountPaidCents,
    );
  }

  @Post('invoices/close')
  @Resource('ch:invoice')
  @Action('write')
  @Audit({ action: 'CH_BILLING_INVOICE_CLOSE', entity: 'ch.billing_invoice' })
  closeInvoice(
    @Body()
    body: {
      referencePeriod: string;
      itemIds: string[];
      clinicId?: string;
    },
  ) {
    return this.billing.closeInvoice(
      body.referencePeriod,
      body.itemIds,
      body.clinicId,
    );
  }

  @Post('invoices/:id/transition')
  @Resource('ch:invoice')
  @Action('write')
  @Audit({
    action: 'CH_BILLING_INVOICE_TRANSITION',
    entity: 'ch.billing_invoice',
  })
  transitionInvoice(
    @Param('id') id: string,
    @Body()
    body: { status: 'ATTESTED' | 'PAID'; payload?: Record<string, unknown> },
  ) {
    return this.billing.transitionInvoice(id, body.status, body.payload);
  }

  @Post('divergences')
  @Resource('ch:invoice')
  @Action('write')
  @Audit({
    action: 'CH_BILLING_DIVERGENCE_CREATE',
    entity: 'ch.billing_divergence',
  })
  createDivergence(
    @Body()
    body: {
      reason: string;
      invoiceId?: string;
      itemId?: string;
      payload?: Record<string, unknown>;
    },
  ) {
    return this.billing.createDivergence(
      body.reason,
      body.invoiceId,
      body.itemId,
      body.payload,
    );
  }

  @Post('divergences/:id/resolve')
  @Resource('ch:invoice')
  @Action('write')
  @Audit({
    action: 'CH_BILLING_DIVERGENCE_RESOLVE',
    entity: 'ch.billing_divergence',
  })
  resolveDivergence(
    @Param('id') id: string,
    @Body() body: { status: 'RESOLVED' | 'REJECTED'; resolution: string },
  ) {
    return this.billing.resolveDivergence(id, body.status, body.resolution);
  }
}
