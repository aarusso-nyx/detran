import { createHash } from 'node:crypto';
import { ConflictException, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  parsePeriodicToxicologyEvent,
  type PeriodicToxicologyEvent,
} from '@detran/senatran-adapter';
import { withTenantContext } from '@detran/shared';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

interface InboxReceipt {
  id: string;
  payload_sha256: string;
  status: 'received' | 'processed' | 'error';
}

export interface ToxicologyInboundResult {
  eventId: string;
  status: 'processed' | 'exception';
  duplicate: boolean;
  resultId?: string;
  suspensionId?: string;
  exception?: string;
}

@Injectable()
export class PecToxicologyInboundService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async receive(
    eventId: string,
    rawBody: Buffer,
    input: unknown,
  ): Promise<ToxicologyInboundResult> {
    const normalizedEventId = eventId.trim();
    const payloadSha256 = createHash('sha256').update(rawBody).digest('hex');
    const reserved = await this.transaction(async (tx) => {
      const inserted = await tx.query<{ id: string }>(
        `insert into integration.inbox_receipt
          (provider, event_id, payload_sha256, status)
         values ('RENACH_TOXICOLOGY', $1, $2, 'received')
         on conflict (tenant_id, provider, event_id) do nothing
         returning id`,
        [normalizedEventId, payloadSha256],
      );
      const receipt = await tx.query<InboxReceipt>(
        `select id, payload_sha256, status
           from integration.inbox_receipt
          where provider = 'RENACH_TOXICOLOGY' and event_id = $1
          for update`,
        [normalizedEventId],
      );
      const current = receipt.rows[0];
      if (!current || current.payload_sha256 !== payloadSha256) {
        throw new ConflictException(
          'RENACH toxicology event identity was reused with a different payload',
        );
      }
      return { receipt: current, inserted: Boolean(inserted.rows[0]) };
    });

    if (!reserved.inserted && reserved.receipt.status === 'processed') {
      const prior = await this.transaction((tx) =>
        tx.query<{ id: string }>(
          `select id from ch.periodic_toxicology_result
            where source_event_id = $1 limit 1`,
          [normalizedEventId],
        ),
      );
      return {
        eventId: normalizedEventId,
        status: 'processed',
        duplicate: true,
        ...(prior.rows[0] ? { resultId: prior.rows[0].id } : {}),
      };
    }

    let event: PeriodicToxicologyEvent;
    try {
      event = parsePeriodicToxicologyEvent(input);
    } catch (error) {
      return this.recordException(
        reserved.receipt.id,
        normalizedEventId,
        error instanceof Error ? error.message : String(error),
      );
    }
    if (new Date(event.occurredAt) > new Date(event.validUntil)) {
      return this.recordException(
        reserved.receipt.id,
        normalizedEventId,
        'RENACH toxicology event is stale',
      );
    }

    return this.transaction(async (tx) => {
      const receipt = await tx.query<InboxReceipt>(
        'select id, payload_sha256, status from integration.inbox_receipt where id = $1 for update',
        [reserved.receipt.id],
      );
      const current = receipt.rows[0];
      if (!current || current.payload_sha256 !== payloadSha256) {
        throw new ConflictException(
          'RENACH toxicology receipt changed during processing',
        );
      }
      if (current.status === 'processed') {
        const prior = await tx.query<{ id: string }>(
          'select id from ch.periodic_toxicology_result where source_event_id = $1 limit 1',
          [normalizedEventId],
        );
        return {
          eventId: normalizedEventId,
          status: 'processed',
          duplicate: true,
          ...(prior.rows[0] ? { resultId: prior.rows[0].id } : {}),
        };
      }
      const patient = await tx.query<{ id: string }>(
        'select id from ch.patient where national_id = $1 limit 1',
        [event.driverCpf],
      );
      const patientId = patient.rows[0]?.id;
      if (!patientId) {
        await this.markException(
          tx,
          current.id,
          'RENACH toxicology driver was not found',
        );
        return {
          eventId: normalizedEventId,
          status: 'exception',
          duplicate: false,
          exception: 'RENACH toxicology driver was not found',
        };
      }
      await tx.query(
        `update ch.toxicology_suspension
            set status = 'EXPIRED', released_at = ends_at, updated_at = now()
          where patient_id = $1 and status = 'ACTIVE' and ends_at <= $2`,
        [patientId, event.occurredAt],
      );
      if (event.result === 'POSITIVE') {
        const active = await tx.query<{ id: string }>(
          `select id from ch.toxicology_suspension
            where patient_id = $1 and status = 'ACTIVE' for update`,
          [patientId],
        );
        if (active.rows[0]) {
          const reason =
            'RENACH positive result conflicts with an active toxicology suspension';
          await this.markException(tx, current.id, reason);
          return {
            eventId: normalizedEventId,
            status: 'exception',
            duplicate: false,
            exception: reason,
          };
        }
      }
      const result = await tx.query<{ id: string }>(
        `insert into ch.periodic_toxicology_result
          (source_event_id, payload_sha256, patient_id, driver_cpf, category,
           result, collected_at, valid_until, occurred_at, laboratory_code,
           source_reference, driver_alert_status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         on conflict (tenant_id, source_event_id) do nothing
         returning id`,
        [
          normalizedEventId,
          payloadSha256,
          patientId,
          event.driverCpf,
          event.category,
          event.result,
          event.collectedAt,
          event.validUntil,
          event.occurredAt,
          event.laboratoryCode,
          event.sourceReference,
          event.driverAlertStatus,
        ],
      );
      const resultId = result.rows[0]?.id;
      if (!resultId) {
        throw new ConflictException(
          'Toxicology result replay did not match inbox state',
        );
      }

      let suspensionId: string | undefined;
      if (event.result === 'POSITIVE') {
        const suspension = await tx.query<{ id: string }>(
          `insert into ch.toxicology_suspension
            (patient_id, source_positive_result_id, starts_at, ends_at, status)
           values ($1, $2, $3, $3::timestamptz + interval '3 months', 'ACTIVE')
           returning id`,
          [patientId, resultId, event.occurredAt],
        );
        suspensionId = suspension.rows[0]?.id;
      } else {
        const released = await tx.query<{ id: string }>(
          `update ch.toxicology_suspension
              set status = 'RELEASED', released_by_result_id = $2,
                  released_at = $3, updated_at = now()
            where patient_id = $1 and status = 'ACTIVE' and starts_at < $3
           returning id`,
          [patientId, resultId, event.occurredAt],
        );
        suspensionId = released.rows[0]?.id;
      }
      await tx.query(
        `update integration.inbox_receipt
            set status = 'processed', processed_at = now(), error_details = null,
                updated_at = now()
          where id = $1`,
        [current.id],
      );
      return {
        eventId: normalizedEventId,
        status: 'processed',
        duplicate: false,
        resultId,
        ...(suspensionId ? { suspensionId } : {}),
      };
    });
  }

  private async recordException(
    receiptId: string,
    eventId: string,
    reason: string,
  ): Promise<ToxicologyInboundResult> {
    await this.transaction((tx) => this.markException(tx, receiptId, reason));
    return {
      eventId,
      status: 'exception',
      duplicate: false,
      exception: reason,
    };
  }

  private async markException(
    tx: SqlTransaction,
    receiptId: string,
    reason: string,
  ): Promise<{ rows: Record<string, unknown>[] }> {
    return tx.query(
      `update integration.inbox_receipt
          set status = 'error', error_details = $2, processed_at = now(), updated_at = now()
        where id = $1`,
      [receiptId, reason],
    );
  }

  private transaction<T>(
    work: (transaction: SqlTransaction) => Promise<T>,
  ): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      (transaction) => work(transaction as SqlTransaction),
    );
  }
}
