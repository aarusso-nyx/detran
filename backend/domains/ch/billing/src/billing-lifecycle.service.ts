import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { BillingItem } from './entities/billing-item.entity.js';
import type { BillingInvoice } from './entities/billing-invoice.entity.js';
import type { BillingDivergence } from './entities/billing-divergence.entity.js';
import type { FederalExamPublicPrice } from './entities/federal-exam-public-price.entity.js';
import { BillingItemRepository } from './repositories/billing-item.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type ExamKind = 'MEDICAL' | 'PSYCH';

export interface PublishExamPriceCommand {
  examKind: ExamKind;
  amountCents: number;
  effectiveFrom: string;
  effectiveTo?: string;
  ipcaReferenceYear: number;
  federalSourceReference: string;
  publishedAt: string;
}

export interface CreateBillingItemCommand {
  encounterId?: string;
  telehealthSessionId?: string;
  itemKind: 'PROTOCOL' | 'EXAM' | 'TELEHEALTH' | 'ADJUSTMENT';
  examKind?: ExamKind;
  amountCents?: number;
  referenceNumber?: string;
  payload?: Record<string, unknown>;
}

export interface BillingReportRow {
  reference_period: string;
  invoices: number;
  items: number;
  total_cents: number;
  paid_cents: number;
  divergent_items: number;
}

@Injectable()
export class BillingLifecycleService {
  constructor(
    private readonly items: BillingItemRepository,
    private readonly requestContext: RequestContext,
  ) {}

  publishExamPrice(
    command: PublishExamPriceCommand,
  ): Promise<FederalExamPublicPrice> {
    const actorId = this.requireActor();
    if (!['MEDICAL', 'PSYCH'].includes(command.examKind))
      throw new BadRequestException('Invalid exam kind');
    if (!Number.isInteger(command.amountCents) || command.amountCents < 0)
      throw new BadRequestException('Price must be non-negative cents');
    if (
      !Number.isInteger(command.ipcaReferenceYear) ||
      command.ipcaReferenceYear < 2026
    )
      throw new BadRequestException('An annual IPCA reference is required');
    if (!command.federalSourceReference.trim())
      throw new BadRequestException('Federal source reference is required');

    return this.items.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      await tx.query(
        `select pg_advisory_xact_lock(hashtextextended(
           auth.current_tenant()::text || ':exam-price:' || $1, 0))`,
        [command.examKind],
      );
      const overlap = await tx.query<{ id: string }>(
        `select id from ch.federal_exam_public_price
          where exam_kind = $1
            and daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[]')
                && daterange($2::date, coalesce($3::date, 'infinity'::date), '[]')
          limit 1`,
        [command.examKind, command.effectiveFrom, command.effectiveTo ?? null],
      );
      if (overlap.rows[0])
        throw new ConflictException('Federal exam price period overlaps');
      const result = await tx.query<
        FederalExamPublicPrice & Record<string, unknown>
      >(
        `insert into ch.federal_exam_public_price
          (exam_kind, amount_cents, effective_from, effective_to,
           ipca_reference_year, index_name, federal_source_reference,
           published_at, created_by)
         values ($1, $2, $3, $4, $5, 'IPCA', $6, $7, $8)
         returning *`,
        [
          command.examKind,
          command.amountCents,
          command.effectiveFrom,
          command.effectiveTo ?? null,
          command.ipcaReferenceYear,
          command.federalSourceReference.trim(),
          command.publishedAt,
          actorId,
        ],
      );
      return result.rows[0] as FederalExamPublicPrice;
    });
  }

  createItem(command: CreateBillingItemCommand): Promise<BillingItem> {
    const actorId = this.requireActor();
    if (!command.encounterId && !command.telehealthSessionId)
      throw new BadRequestException('A billing subject is required');
    if (command.itemKind === 'EXAM' && !command.encounterId)
      throw new BadRequestException('Exam billing requires an encounter');
    if (command.itemKind === 'TELEHEALTH' && !command.telehealthSessionId)
      throw new BadRequestException(
        'Telehealth billing requires a telehealth session',
      );
    if (command.itemKind === 'EXAM' && !command.examKind)
      throw new BadRequestException('Exam kind is required');
    if (command.itemKind === 'EXAM' && command.amountCents !== undefined)
      throw new BadRequestException(
        'Exam amount is derived from the federal public price',
      );
    if (command.itemKind !== 'EXAM' && command.examKind)
      throw new BadRequestException('Exam kind is valid only for exam items');
    if (
      command.itemKind !== 'EXAM' &&
      (!Number.isInteger(command.amountCents) || command.amountCents! < 0)
    )
      throw new BadRequestException('Amount must be non-negative cents');

    return this.items.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const price =
        command.itemKind === 'EXAM'
          ? await this.requireEffectivePrice(tx, command.examKind as ExamKind)
          : undefined;
      const result = await tx.query<BillingItem & Record<string, unknown>>(
        `insert into ch.billing_item
          (encounter_id, telehealth_session_id, federal_price_id, item_kind,
           exam_kind, amount_cents, reference_number, payload, created_by)
         values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
         returning *`,
        [
          command.encounterId ?? null,
          command.telehealthSessionId ?? null,
          price?.id ?? null,
          command.itemKind,
          command.examKind ?? null,
          price?.amount_cents ?? command.amountCents,
          command.referenceNumber?.trim() || null,
          JSON.stringify(command.payload ?? {}),
          actorId,
        ],
      );
      const item = result.rows[0];
      if (!item) throw new Error('Billing item insert returned no row');
      if (item.encounter_id) {
        await tx.query(
          `insert into ch.process_block
            (encounter_id, block_kind, source_system, message, active, created_by)
           values ($1, 'FINANCIAL', 'BILLING', 'Financial validation pending', true, $2)
           on conflict (tenant_id, encounter_id, block_kind, source_system)
             where active do nothing`,
          [item.encounter_id, actorId],
        );
      }
      return item;
    });
  }

  validatePayment(
    itemId: string,
    referenceNumber: string,
    amountPaidCents: number,
  ): Promise<BillingItem> {
    const actorId = this.requireActor();
    if (!referenceNumber.trim())
      throw new BadRequestException('Payment reference is required');
    return this.items.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const current = await tx.query<BillingItem & Record<string, unknown>>(
        `select * from ch.billing_item where id = $1 for update`,
        [itemId],
      );
      const item = current.rows[0];
      if (!item)
        throw new NotFoundException(`Billing item ${itemId} not found`);
      if (item.status === 'PAID') {
        if (
          item.reference_number === referenceNumber.trim() &&
          amountPaidCents === item.amount_cents
        )
          return item;
        throw new ConflictException(
          'Payment replay does not match the persisted fingerprint',
        );
      }
      if (item.status !== 'ISSUED')
        throw new BadRequestException(`Cannot pay item in ${item.status}`);
      if (amountPaidCents !== item.amount_cents)
        throw new BadRequestException('Paid amount must equal billed amount');
      const updated = await tx.query<BillingItem & Record<string, unknown>>(
        `update ch.billing_item
            set status = 'PAID', reference_number = $2,
                payment_validated_at = now(), updated_at = now()
          where id = $1 returning *`,
        [itemId, referenceNumber.trim()],
      );
      if (item.encounter_id) {
        await tx.query(
          `update ch.process_block block
              set active = false, resolved_by = $2, resolved_at = now(), updated_at = now()
            where block.encounter_id = $1 and block.block_kind = 'FINANCIAL'
              and block.source_system = 'BILLING' and block.active
              and not exists (
                select 1 from ch.billing_item pending
                 where pending.encounter_id = $1 and pending.id <> $3
                   and pending.status not in ('PAID','ATTESTED','CANCELLED')
              )`,
          [item.encounter_id, actorId, itemId],
        );
      }
      return updated.rows[0] as BillingItem;
    });
  }

  closeInvoice(
    referencePeriod: string,
    itemIds: string[],
    clinicId?: string,
  ): Promise<BillingInvoice> {
    const actorId = this.requireActor();
    const ids = [...new Set(itemIds)];
    if (!/^\d{4}-(0[1-9]|1[0-2])$/u.test(referencePeriod))
      throw new BadRequestException('Reference period must be YYYY-MM');
    if (!ids.length || ids.length !== itemIds.length)
      throw new BadRequestException(
        'Invoice item ids must be non-empty and unique',
      );
    return this.items
      .transaction(async (transaction) => {
        const tx = transaction as SqlTransaction;
        const selected = await tx.query<{
          item_count: number;
          total_cents: number;
        }>(
          `select count(*)::integer as item_count,
                  coalesce(sum(item.amount_cents), 0)::integer as total_cents
             from ch.billing_item item
             left join ch.encounter encounter on encounter.id = item.encounter_id
            where item.id = any($1::uuid[]) and item.status <> 'CANCELLED'
              and ($2::uuid is null or encounter.clinic_id = $2)`,
          [ids, clinicId ?? null],
        );
        const aggregate = selected.rows[0];
        if (!aggregate || aggregate.item_count !== ids.length)
          throw new BadRequestException(
            'Invoice contains missing or ineligible items',
          );
        const inserted = await tx.query<
          BillingInvoice & Record<string, unknown>
        >(
          `insert into ch.billing_invoice
            (clinic_id, reference_period, status, total_cents, payload,
             closed_at, created_by)
           values ($1, $2, 'CLOSED', $3, jsonb_build_object('itemIds', $4::uuid[]),
                   now(), $5)
           returning *`,
          [
            clinicId ?? null,
            referencePeriod,
            aggregate.total_cents,
            ids,
            actorId,
          ],
        );
        const invoice = inserted.rows[0];
        if (!invoice) throw new Error('Billing invoice insert returned no row');
        await tx.query(
          `insert into ch.billing_invoice_item (invoice_id, item_id, linked_by)
           select $1, item_id, $3 from unnest($2::uuid[]) item_id`,
          [invoice.id, ids, actorId],
        );
        return invoice;
      })
      .catch((error: unknown) => {
        if (isUniqueViolation(error))
          throw new ConflictException(
            'A billing item already belongs to an invoice',
          );
        throw error;
      });
  }

  transitionInvoice(
    invoiceId: string,
    status: 'ATTESTED' | 'PAID',
    payload: Record<string, unknown> = {},
  ): Promise<BillingInvoice> {
    this.requireActor();
    if (status !== 'ATTESTED' && status !== 'PAID')
      throw new BadRequestException('Invalid invoice transition');
    const expected = status === 'ATTESTED' ? 'CLOSED' : 'ATTESTED';
    const timestamp = status === 'ATTESTED' ? 'attested_at' : 'paid_at';
    return this.items.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        BillingInvoice & Record<string, unknown>
      >(
        `update ch.billing_invoice
            set status = $2, ${timestamp} = now(), payload = payload || $3::jsonb,
                updated_at = now()
          where id = $1 and status = $4 returning *`,
        [invoiceId, status, JSON.stringify(payload), expected],
      );
      const invoice = result.rows[0];
      if (!invoice)
        throw new BadRequestException(
          `Invoice ${invoiceId} must be ${expected} before ${status}`,
        );
      return invoice;
    });
  }

  createDivergence(
    reason: string,
    invoiceId?: string,
    itemId?: string,
    payload: Record<string, unknown> = {},
  ): Promise<BillingDivergence> {
    const actorId = this.requireActor();
    if (!invoiceId && !itemId)
      throw new BadRequestException('A divergence subject is required');
    if (reason.trim().length < 5)
      throw new BadRequestException('Divergence reason is too short');
    return this.items.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<
        BillingDivergence & Record<string, unknown>
      >(
        `insert into ch.billing_divergence
          (invoice_id, item_id, reason, payload, created_by)
         values ($1, $2, $3, $4::jsonb, $5) returning *`,
        [
          invoiceId ?? null,
          itemId ?? null,
          reason.trim(),
          JSON.stringify(payload),
          actorId,
        ],
      );
      if (itemId)
        await tx.query(
          `update ch.billing_item set status = 'DIVERGENT', updated_at = now()
            where id = $1 and status not in ('PAID','ATTESTED','CANCELLED')`,
          [itemId],
        );
      const divergence = result.rows[0];
      if (!divergence)
        throw new NotFoundException('Divergence subject not found');
      return divergence;
    });
  }

  resolveDivergence(
    divergenceId: string,
    status: 'RESOLVED' | 'REJECTED',
    resolution: string,
  ): Promise<BillingDivergence> {
    const actorId = this.requireActor();
    if (status !== 'RESOLVED' && status !== 'REJECTED')
      throw new BadRequestException('Invalid divergence resolution status');
    if (!resolution.trim())
      throw new BadRequestException('Divergence resolution is required');
    return this.items.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        BillingDivergence & Record<string, unknown>
      >(
        `update ch.billing_divergence
            set status = $2, resolution = $3, resolved_by = $4,
                resolved_at = now(), updated_at = now()
          where id = $1 and status = 'OPEN' returning *`,
        [divergenceId, status, resolution.trim(), actorId],
      );
      const divergence = result.rows[0];
      if (!divergence)
        throw new BadRequestException(
          `Open divergence ${divergenceId} not found`,
        );
      return divergence;
    });
  }

  report(
    referencePeriod: string,
    clinicId?: string,
  ): Promise<BillingReportRow> {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/u.test(referencePeriod))
      throw new BadRequestException('Reference period must be YYYY-MM');
    return this.items.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        BillingReportRow & Record<string, unknown>
      >(
        `select $1::text as reference_period,
                count(distinct invoice.id)::integer as invoices,
                count(distinct item.id)::integer as items,
                coalesce(sum(item.amount_cents), 0)::integer as total_cents,
                coalesce(sum(item.amount_cents)
                  filter (where item.status in ('PAID','ATTESTED')), 0)::integer as paid_cents,
                count(distinct item.id)
                  filter (where item.status = 'DIVERGENT')::integer as divergent_items
           from ch.billing_invoice invoice
           left join ch.billing_invoice_item membership
             on membership.invoice_id = invoice.id
           left join ch.billing_item item on item.id = membership.item_id
          where invoice.reference_period = $1
            and ($2::uuid is null or invoice.clinic_id = $2)`,
        [referencePeriod, clinicId ?? null],
      );
      return result.rows[0] as BillingReportRow;
    });
  }

  private async requireEffectivePrice(
    tx: SqlTransaction,
    examKind: ExamKind,
  ): Promise<FederalExamPublicPrice> {
    const result = await tx.query<
      FederalExamPublicPrice & Record<string, unknown>
    >(
      `select * from ch.federal_exam_public_price
        where exam_kind = $1 and current_date >= effective_from
          and (effective_to is null or current_date <= effective_to)
        order by effective_from desc limit 1`,
      [examKind],
    );
    const price = result.rows[0];
    if (!price)
      throw new BadRequestException(
        `No effective federal ${examKind} public price is configured`,
      );
    return price;
  }

  private requireActor(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return actorId;
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
