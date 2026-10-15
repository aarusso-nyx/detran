// R-0022 D-160 A160-04a: additive adapters for the published STYNX 1.6.0
// ports. These classes are deliberately absent from active composition until
// CTG-0008's characterization and migration obligations are complete.
import {
  outboxIdempotencyKey,
  type TeatEventEnvelope,
  type TeatEventOutbox,
} from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';
import type {
  OutboxDispatchFilter,
  OutboxEntitySelector,
  OutboxEventAckInput,
  OutboxEventListQuery,
  OutboxEventRetirementInput,
  OutboxQueueHealthQuery,
  OutboxService,
} from '@stynx-nyx/outbox';

/** Receipt/status events are log facts, never external transmission work. */
export const R22_OUTBOX_DESTINATION_SELECTORS = Object.freeze({
  renach: Object.freeze({
    entities: Object.freeze(['ch.renach.exam-result']),
  }),
  renaest: Object.freeze({
    entities: Object.freeze([
      'SINISTRO_TRANSMISSAO_PENDENTE',
      'SINISTRO_RETIFICACAO_PENDENTE',
    ]),
  }),
}) satisfies Readonly<Record<'renach' | 'renaest', OutboxEntitySelector>>;

/**
 * CTG-0008 §2.2 mapping on the caller's live transaction. The installed
 * append port validates the application role, SQL tenant and audit actor;
 * envelope fields cannot select an identity or a database connection.
 *
 * The immutable payload keeps its input id. A future reader/SSE adapter must
 * expose the returned event id in the envelope, without updating the log.
 * This appender alone does not establish C-08-09 or complete the cutover.
 */
export class R22StynxEventAppender implements TeatEventOutbox {
  constructor(
    private readonly outbox: Pick<OutboxService, 'appendInTransaction'>,
  ) {}

  async append(
    tx: Transaction,
    envelope: TeatEventEnvelope,
  ): Promise<{ id: string }> {
    const context = await tx.query<{ tenant_id: string | null }>(
      'select auth.current_tenant()::text as tenant_id',
    );
    const tenantId = context.rows[0]?.tenant_id;
    if (!tenantId) {
      throw new Error('DETRAN event append requires a SQL tenant context');
    }
    const event = await this.outbox.appendInTransaction(tx, {
      entity: envelope.type,
      entityId: envelope.aggregate.id,
      idempotencyKey: outboxIdempotencyKey(envelope),
      payload: { ...envelope, tenantId },
      metadata: { aggregateType: envelope.aggregate.kind },
    });
    return { id: event.id };
  }
}

type TenantControlPort = Pick<
  OutboxService,
  | 'dispatchTenantEventsDue'
  | 'ackTenantEvent'
  | 'listEvents'
  | 'getEventDelivery'
  | 'listEventAttempts'
  | 'getQueueHealth'
  | 'retryEvent'
  | 'retireEvent'
  | 'getEventRetirement'
>;

/**
 * Tenant controls delegate to the installed app-role ports. No owner path,
 * queue mechanism, ACK reconstruction or provider transport is introduced.
 * Dispatch is an inactive technical-job seam, not an operator HTTP handler.
 */
export class R22StynxOutboxTenantControl {
  constructor(private readonly outbox: TenantControlPort) {}

  dispatchTenantEventsDue(limit = 25, filter?: OutboxDispatchFilter) {
    const boundedLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(25, Math.floor(limit)))
      : 25;
    return this.outbox.dispatchTenantEventsDue(boundedLimit, filter);
  }

  ackTenantEvent(input: Omit<OutboxEventAckInput, 'tenantId'>) {
    // Keep the input intact: the published port rejects runtime tenantId
    // injection and owns HMAC/receipt handling without guessed identities.
    return this.outbox.ackTenantEvent(input);
  }

  listEvents(query?: OutboxEventListQuery) {
    return this.outbox.listEvents(query);
  }

  getEventDelivery(eventId: string) {
    return this.outbox.getEventDelivery(eventId);
  }

  listEventAttempts(eventId: string, options?: { includeBytes?: boolean }) {
    return this.outbox.listEventAttempts(eventId, options);
  }

  getQueueHealth(query?: OutboxQueueHealthQuery) {
    return this.outbox.getQueueHealth(query);
  }

  retryEvent(eventId: string, options?: { immediate?: boolean }) {
    return this.outbox.retryEvent(eventId, options);
  }

  retireEvent(eventId: string, input: OutboxEventRetirementInput) {
    return this.outbox.retireEvent(eventId, input);
  }

  getEventRetirement(eventId: string) {
    return this.outbox.getEventRetirement(eventId);
  }
}
