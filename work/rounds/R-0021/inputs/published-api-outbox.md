# Published API — @stynx-nyx/outbox 1.4.0 / 1.5.0-rc.2

Extracted from archived npm tarballs; byte-identical own JS and declarations across both versions. See published-api-metadata.json for archive and per-file hashes. This is an inspection input, not a local API implementation.

## package/dist/outbox/src/ack-signature.d.ts

```text
/**
 * Verifies an inbound outbox-ACK HMAC-SHA256 body signature.
 *
 * Expected header format: `sha256=<hex_digest>`.
 *
 * Promoted from pec's `domain/shared/api/src/webhook-signature.ts` (itself
 * ported from the deleted `apps/api/src/@core/security/webhook-signature.ts`).
 * Intended for the inbound ACK route a consuming app exposes for
 * `OutboxService.ack()` — mark that route `@Public()` (bearer auth bypassed)
 * and call this helper against the raw request body before trusting it.
 * Uses constant-time comparison to avoid timing side-channels.
 */
export declare function verifyOutboxAckSignature(secret: string, rawBody: Buffer, header: string): boolean;
/**
 * Computes the `sha256=<hex_digest>` header value for a given body and
 * secret. Not needed by the outbox's own ACK-verification path (the
 * *sender* of the ACK — the external system — computes this); provided so
 * tests and local dispatcher fakes can sign a synthetic ACK request without
 * hand-rolling HMAC each time.
 */
export declare function signOutboxAckPayload(secret: string, rawBody: Buffer): string;
//# sourceMappingURL=ack-signature.d.ts.map
```

## package/dist/outbox/src/backoff.d.ts

```text
import type { OutboxBackoffPolicy } from './types';
/**
 * Fixed-interval backoff — every retry waits the same duration regardless of
 * attempt count. Matches pec's hardcoded `now() + interval '15 minutes'`
 * exactly (default `intervalMs` is 15 minutes) and is the module's default
 * policy, so a straight port of pec's outbox behavior needs no configuration.
 */
export declare class FixedIntervalBackoffPolicy implements OutboxBackoffPolicy {
    private readonly intervalMs;
    constructor(intervalMs?: number);
    nextAttemptAt(_attempt: number, now?: Date): Date;
}
export interface ExponentialBackoffOptions {
    /** Delay before the first retry. Default 30s. */
    baseMs?: number;
    /** Multiplier applied per additional attempt. Default 2. */
    factor?: number;
    /** Upper bound on the computed delay, before jitter. Default 1 hour. */
    maxMs?: number;
    /** Uniform random jitter added on top of the capped delay, in [0, jitterMs). Default 5s. */
    jitterMs?: number;
}
/**
 * Exponential backoff with a cap and uniform jitter:
 * `delay = min(baseMs * factor^(attempt-1), maxMs) + random(0, jitterMs)`.
 * `attempt` is 1-indexed (the value already persisted on the row after a
 * claim/retry increments it).
 */
export declare class ExponentialBackoffPolicy implements OutboxBackoffPolicy {
    private readonly baseMs;
    private readonly factor;
    private readonly maxMs;
    private readonly jitterMs;
    constructor(options?: ExponentialBackoffOptions);
    nextAttemptAt(attempt: number, now?: Date): Date;
}
//# sourceMappingURL=backoff.d.ts.map
```

## package/dist/outbox/src/constants.d.ts

```text
export declare const STYNX_OUTBOX_OPTIONS: unique symbol;
export declare const STYNX_OUTBOX_DISPATCHER: unique symbol;
export declare const STYNX_OUTBOX_BACKOFF_POLICY: unique symbol;
export declare const STYNX_OUTBOX_METRICS: unique symbol;
export declare const DEFAULT_OUTBOX_TABLE = "outbox.messages";
export declare const DEFAULT_OUTBOX_ACK_TABLE = "outbox.acknowledgements";
export declare const DEFAULT_OUTBOX_DISPATCH_BATCH_SIZE = 25;
//# sourceMappingURL=constants.d.ts.map
```

## package/dist/outbox/src/errors.d.ts

```text
import { StynxError } from '@stynx-nyx/core';
export declare class StynxOutboxError extends StynxError {
}
export declare class OutboxNotFoundError extends StynxOutboxError {
    constructor(context: Record<string, unknown>);
}
export declare class OutboxAlreadyEnqueuedError extends StynxOutboxError {
    constructor(context: Record<string, unknown>);
}
/**
 * Raised by `ack()` when `(entity, entityId)` matches more than one tenant's
 * row and the caller did not supply `tenantId` to disambiguate. See the
 * ACK-resolution note in the contract doc — most integrations should have
 * the external system echo back a globally unique correlation id to avoid
 * this entirely.
 */
export declare class OutboxAmbiguousAckError extends StynxOutboxError {
    constructor(context: Record<string, unknown>);
}
//# sourceMappingURL=errors.d.ts.map
```

## package/dist/outbox/src/http-outbox-dispatcher.d.ts

```text
import type { OutboxDispatcherPort, OutboxRow } from './types';
export interface HttpOutboxDispatcherOptions {
    /** Absolute URL, or a function deriving one per row (e.g. by `entity`). */
    url: string | ((row: OutboxRow) => string);
    /** Static headers, or a function deriving them per row (e.g. a computed HMAC signature). */
    headers?: Record<string, string> | ((row: OutboxRow) => Record<string, string>);
    method?: 'POST' | 'PUT';
    timeoutMs?: number;
    /** Injectable for tests; defaults to the global `fetch`. */
    fetchImpl?: typeof fetch;
}
/**
 * Minimal HTTP implementation of `OutboxDispatcherPort` — the "HTTP now"
 * half of the pluggable dispatcher port. POSTs (or PUTs) the row's `payload`
 * as JSON and treats any non-2xx response, network error, or timeout as a
 * failure (`dispatchDue()` then reverts the row to `ERROR` and schedules a
 * retry through the backoff policy).
 *
 * This is intentionally thin — no retry/circuit-breaker logic lives here,
 * since `dispatchDue()` already owns retry scheduling. An app that wants
 * per-call resilience (timeouts aside) should wrap `fetchImpl` with
 * `@stynx-nyx/integration-adapter`. The EventBridge half of this port is
 * deferred to a future package; only the `OutboxDispatcherPort` interface
 * is shipped for it to implement against.
 */
export declare class HttpOutboxDispatcher implements OutboxDispatcherPort {
    private readonly options;
    constructor(options: HttpOutboxDispatcherOptions);
    send(row: OutboxRow): Promise<void>;
}
//# sourceMappingURL=http-outbox-dispatcher.d.ts.map
```

## package/dist/outbox/src/index.d.ts

```text
/**
 * Public exports for the transactional outbox: same-transaction `enqueue`,
 * claim-and-dispatch, pluggable dispatcher port, backoff policies, HMAC ACK
 * signature helpers, and NestJS module wiring.
 *
 * @packageDocumentation
 */
export * from './ack-signature';
export * from './backoff';
export * from './constants';
export * from './errors';
export * from './http-outbox-dispatcher';
export * from './metrics';
export * from './outbox.module';
export * from './outbox.service';
export * from './types';
//# sourceMappingURL=index.d.ts.map
```

## package/dist/outbox/src/metrics.d.ts

```text
import type { OutboxMetricsSink } from './types';
/** Default `OutboxMetricsSink` — in-process counters, useful for tests and `stynx doctor`-style introspection. */
export declare class InMemoryOutboxMetrics implements OutboxMetricsSink {
    private enqueued;
    private dispatched;
    private acked;
    incrementEnqueued(entity: string): void;
    incrementDispatched(entity: string, outcome: 'sent' | 'error'): void;
    incrementAcked(entity: string, outcome: 'acked' | 'error'): void;
    snapshot(): {
        enqueued: Record<string, number>;
        dispatched: Record<string, number>;
        acked: Record<string, number>;
    };
}
//# sourceMappingURL=metrics.d.ts.map
```

## package/dist/outbox/src/outbox.module.d.ts

```text
import { DynamicModule } from '@nestjs/common';
import type { OutboxModuleOptions } from './types';
export declare class StynxOutboxModule {
    static forRoot(options?: OutboxModuleOptions): DynamicModule;
}
//# sourceMappingURL=outbox.module.d.ts.map
```

## package/dist/outbox/src/outbox.service.d.ts

```text
import { Database } from '@stynx-nyx/data';
import type { OutboxAckInput, OutboxBackoffPolicy, OutboxDispatchOutcome, OutboxDispatcherPort, OutboxEnvelope, OutboxMetricsSink, OutboxModuleOptions, OutboxRow, OutboxSqlExecutor } from './types';
/**
 * Transactional outbox service.
 *
 * `enqueue()` is a pure function of a caller-supplied SQL executor (a
 * `@stynx-nyx/data` `Transaction`, or any object with a compatible
 * `query()`), so a caller composes it inside its own `database.tx(...)`
 * call and gets one atomic commit across the domain write and the outbox
 * row — the generalization pec's `TransmissionsService.enqueue` did not
 * offer (pec always opened its own transaction).
 *
 * Every other method (`dispatchDue`, `ack`, `retry`, `getOne`) owns its own
 * transaction via the injected `Database`, matching pec's shape 1:1.
 */
export declare class OutboxService {
    private readonly database;
    private readonly options;
    private readonly dispatcher?;
    private readonly metrics?;
    private readonly table;
    private readonly ackTable;
    private readonly dispatchBatchSize;
    private readonly backoffPolicy;
    constructor(database: Database, options: OutboxModuleOptions, dispatcher?: OutboxDispatcherPort | undefined, injectedBackoffPolicy?: OutboxBackoffPolicy, metrics?: OutboxMetricsSink | undefined);
    /**
     * Enqueues (or, for a repeat call against the same `(entity, entityId)`,
     * touches) an outbox row inside the caller's own transaction. Tenant is
     * read from the active `app.tenant_id` session GUC — the same value RLS
     * itself checks — so the row can never be enqueued under a tenant the
     * transaction isn't already scoped to.
     */
    enqueue(trx: OutboxSqlExecutor, envelope: OutboxEnvelope): Promise<OutboxRow>;
    /** Reads one row by `(entity, entityId)`, scoped to the caller's active tenant via RLS. */
    getOne(entity: string, entityId: string): Promise<OutboxRow>;
    /**
     * Claims up to `limit` due rows (`PENDING`/`ERROR` whose `next_attempt_at`
     * has passed) via `FOR UPDATE SKIP LOCKED`, marks them `SENT`, and — when a
     * dispatcher port is configured — hands each one to it. A dispatch failure
     * reverts that row to `ERROR` and schedules its next attempt through the
     * configured `OutboxBackoffPolicy`; it does not affect the other claimed
     * rows. Claiming spans all tenants (system context, `owner` role) so one
     * scheduler sweep drains the whole platform, matching the E3 "per-(tenant,
     * aggregate) ordering" spec note — rows are claimed oldest-`created_at`
     * first within that global sweep.
     *
     * With no dispatcher configured, this behaves exactly like pec's
     * `dispatchDue`: it claims and marks `SENT` without sending anything,
     * leaving actual delivery to the caller (or a future ack). Exposed as a
     * plain injectable method so `@stynx-nyx/jobs` or an app-level poller can
     * drive it on an interval — this package has no dependency on a job
     * runner.
     */
    dispatchDue(limit?: number): Promise<OutboxDispatchOutcome[]>;
    private claimDue;
    private recordDispatchFailure;
    /**
     * Manually resets a row to `PENDING` for redelivery — an operator action,
     * distinct from the automatic retry `dispatchDue()` performs on a
     * dispatcher failure. `immediate: true` makes it eligible right away;
     * otherwise the next attempt is scheduled through the backoff policy.
     */
    retry(id: string, options?: {
        immediate?: boolean;
    }): Promise<OutboxRow>;
    /**
     * Records an inbound ACK (positive or negative) for a message, keyed by
     * `(entity, entityId)` — the shape the external system's webhook body
     * naturally carries. Runs under system context / `owner` role because an
     * inbound webhook has no authenticated tenant context of its own (verify
     * `verifyOutboxAckSignature()` against the raw body before calling this).
     *
     * `(entity, entityId)` alone is only unique when the external system's
     * identifier space is; when it isn't, pass `tenantId` (e.g. echoed back by
     * the external system as a correlation field) to disambiguate. Two or more
     * tenants matching without a supplied `tenantId` raises
     * `OutboxAmbiguousAckError` rather than guessing.
     */
    ack(input: OutboxAckInput): Promise<OutboxRow>;
    private resolveAckTarget;
}
//# sourceMappingURL=outbox.service.d.ts.map
```

## package/dist/outbox/src/outbox.service.js

```text
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxService = void 0;
const common_1 = require("@nestjs/common");
const data_1 = require("@stynx-nyx/data");
const backoff_1 = require("./backoff");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const row_mapper_1 = require("./row-mapper");
/**
 * Transactional outbox service.
 *
 * `enqueue()` is a pure function of a caller-supplied SQL executor (a
 * `@stynx-nyx/data` `Transaction`, or any object with a compatible
 * `query()`), so a caller composes it inside its own `database.tx(...)`
 * call and gets one atomic commit across the domain write and the outbox
 * row — the generalization pec's `TransmissionsService.enqueue` did not
 * offer (pec always opened its own transaction).
 *
 * Every other method (`dispatchDue`, `ack`, `retry`, `getOne`) owns its own
 * transaction via the injected `Database`, matching pec's shape 1:1.
 */
let OutboxService = class OutboxService {
    database;
    options;
    dispatcher;
    metrics;
    table;
    ackTable;
    dispatchBatchSize;
    backoffPolicy;
    constructor(database, options, dispatcher, injectedBackoffPolicy, metrics) {
        this.database = database;
        this.options = options;
        this.dispatcher = dispatcher;
        this.metrics = metrics;
        this.table = (0, row_mapper_1.assertQualifiedIdentifier)(options.table ?? constants_1.DEFAULT_OUTBOX_TABLE, 'table');
        this.ackTable = (0, row_mapper_1.assertQualifiedIdentifier)(options.ackTable ?? constants_1.DEFAULT_OUTBOX_ACK_TABLE, 'ackTable');
        this.dispatchBatchSize = options.dispatchBatchSize ?? constants_1.DEFAULT_OUTBOX_DISPATCH_BATCH_SIZE;
        this.backoffPolicy = injectedBackoffPolicy ?? options.backoffPolicy ?? new backoff_1.FixedIntervalBackoffPolicy();
    }
    /**
     * Enqueues (or, for a repeat call against the same `(entity, entityId)`,
     * touches) an outbox row inside the caller's own transaction. Tenant is
     * read from the active `app.tenant_id` session GUC — the same value RLS
     * itself checks — so the row can never be enqueued under a tenant the
     * transaction isn't already scoped to.
     */
    async enqueue(trx, envelope) {
        const idempotencyKey = envelope.idempotencyKey ?? `${envelope.entity}:${envelope.entityId}`;
        try {
            const result = await trx.query(`insert into ${this.table} (id, tenant_id, entity, entity_id, payload, metadata, status, idempotency_key, next_attempt_at)
         values (
           gen_random_uuid(),
           nullif(current_setting('app.tenant_id', true), '')::uuid,
           $1, $2, $3::jsonb, $4::jsonb, 'PENDING', $5, null
         )
         on conflict (tenant_id, entity, entity_id)
         do update set updated_at = now(), idempotency_key = excluded.idempotency_key
         returning ${(0, row_mapper_1.outboxColumns)()}`, [
                envelope.entity,
                envelope.entityId,
                JSON.stringify(envelope.payload ?? {}),
                envelope.metadata ? JSON.stringify(envelope.metadata) : null,
                idempotencyKey,
            ]);
            const row = (0, row_mapper_1.toRows)(result)[0];
            if (!row) {
                throw new errors_1.OutboxNotFoundError({ entity: envelope.entity, entityId: envelope.entityId });
            }
            this.metrics?.incrementEnqueued(envelope.entity);
            return row;
        }
        catch (error) {
            // The (tenant_id, entity, entity_id) conflict is absorbed by the
            // upsert above; only a *different* entity reusing an explicit
            // `idempotencyKey` can still violate the (tenant_id, idempotency_key)
            // unique constraint. Surface that as a typed conflict.
            if ((0, row_mapper_1.isUniqueViolation)(error)) {
                throw new errors_1.OutboxAlreadyEnqueuedError({
                    entity: envelope.entity,
                    entityId: envelope.entityId,
                    idempotencyKey,
                });
            }
            throw error;
        }
    }
    /** Reads one row by `(entity, entityId)`, scoped to the caller's active tenant via RLS. */
    async getOne(entity, entityId) {
        return this.database.tx(async (trx) => {
            const result = await trx.query(`select ${(0, row_mapper_1.outboxColumns)()} from ${this.table} where entity = $1 and entity_id = $2`, [entity, entityId]);
            const row = (0, row_mapper_1.toRows)(result)[0];
            if (!row) {
                throw new errors_1.OutboxNotFoundError({ entity, entityId });
            }
            return row;
        }, { role: 'reader', readonly: true });
    }
    /**
     * Claims up to `limit` due rows (`PENDING`/`ERROR` whose `next_attempt_at`
     * has passed) via `FOR UPDATE SKIP LOCKED`, marks them `SENT`, and — when a
     * dispatcher port is configured — hands each one to it. A dispatch failure
     * reverts that row to `ERROR` and schedules its next attempt through the
     * configured `OutboxBackoffPolicy`; it does not affect the other claimed
     * rows. Claiming spans all tenants (system context, `owner` role) so one
     * scheduler sweep drains the whole platform, matching the E3 "per-(tenant,
     * aggregate) ordering" spec note — rows are claimed oldest-`created_at`
     * first within that global sweep.
     *
     * With no dispatcher configured, this behaves exactly like pec's
     * `dispatchDue`: it claims and marks `SENT` without sending anything,
     * leaving actual delivery to the caller (or a future ack). Exposed as a
     * plain injectable method so `@stynx-nyx/jobs` or an app-level poller can
     * drive it on an interval — this package has no dependency on a job
     * runner.
     */
    async dispatchDue(limit = this.dispatchBatchSize) {
        const claimed = await this.claimDue(limit);
        if (claimed.length === 0) {
            return [];
        }
        if (!this.dispatcher) {
            return claimed.map((row) => ({ row, dispatched: false }));
        }
        const outcomes = [];
        for (const row of claimed) {
            try {
                await this.dispatcher.send(row);
                this.metrics?.incrementDispatched(row.entity, 'sent');
                outcomes.push({ row, dispatched: true });
            }
            catch (error) {
                const message = (0, row_mapper_1.errorMessage)(error);
                const updated = await this.recordDispatchFailure(row, message);
                this.metrics?.incrementDispatched(row.entity, 'error');
                outcomes.push({ row: updated, dispatched: false, error: message });
            }
        }
        return outcomes;
    }
    async claimDue(limit) {
        return this.database.withSystemContext('outbox claim', () => this.database.tx(async (trx) => {
            const result = await trx.query(`with due as (
               select id
                 from ${this.table}
                where status in ('PENDING', 'ERROR')
                  and coalesce(next_attempt_at, created_at) <= now()
                order by created_at asc
                limit $1
                for update skip locked
             )
             update ${this.table} o
                set status = 'SENT',
                    attempts = attempts + 1,
                    last_error = null,
                    next_attempt_at = null,
                    updated_at = now()
               from due
              where o.id = due.id
              returning ${(0, row_mapper_1.outboxColumns)('o')}`, [limit]);
            return (0, row_mapper_1.toRows)(result);
        }, { role: 'owner', readonly: false }));
    }
    async recordDispatchFailure(row, message) {
        const nextAttemptAt = this.backoffPolicy.nextAttemptAt(row.attempts, new Date());
        return this.database.withSystemContext('outbox dispatch failure', () => this.database.tx(async (trx) => {
            const result = await trx.query(`update ${this.table}
                set status = 'ERROR',
                    last_error = $2,
                    next_attempt_at = $3,
                    updated_at = now()
              where id = $1
              returning ${(0, row_mapper_1.outboxColumns)()}`, [row.id, message.slice(0, 4000), nextAttemptAt]);
            const updated = (0, row_mapper_1.toRows)(result)[0];
            if (!updated) {
                throw new errors_1.OutboxNotFoundError({ id: row.id });
            }
            return updated;
        }, { role: 'owner', readonly: false }));
    }
    /**
     * Manually resets a row to `PENDING` for redelivery — an operator action,
     * distinct from the automatic retry `dispatchDue()` performs on a
     * dispatcher failure. `immediate: true` makes it eligible right away;
     * otherwise the next attempt is scheduled through the backoff policy.
     */
    async retry(id, options = {}) {
        return this.database.withSystemContext('outbox retry', () => this.database.tx(async (trx) => {
            const current = await trx.query(`select attempts from ${this.table} where id = $1`, [id]);
            const currentRow = (0, row_mapper_1.toRows)(current)[0];
            if (!currentRow) {
                throw new errors_1.OutboxNotFoundError({ id });
            }
            const attempts = currentRow.attempts + 1;
            const nextAttemptAt = options.immediate
                ? new Date()
                : this.backoffPolicy.nextAttemptAt(attempts, new Date());
            const result = await trx.query(`update ${this.table}
                set attempts = $2,
                    status = 'PENDING',
                    last_error = null,
                    next_attempt_at = $3,
                    updated_at = now()
              where id = $1
              returning ${(0, row_mapper_1.outboxColumns)()}`, [id, attempts, nextAttemptAt]);
            const updated = (0, row_mapper_1.toRows)(result)[0];
            if (!updated) {
                throw new errors_1.OutboxNotFoundError({ id });
            }
            return updated;
        }, { role: 'owner', readonly: false }));
    }
    /**
     * Records an inbound ACK (positive or negative) for a message, keyed by
     * `(entity, entityId)` — the shape the external system's webhook body
     * naturally carries. Runs under system context / `owner` role because an
     * inbound webhook has no authenticated tenant context of its own (verify
     * `verifyOutboxAckSignature()` against the raw body before calling this).
     *
     * `(entity, entityId)` alone is only unique when the external system's
     * identifier space is; when it isn't, pass `tenantId` (e.g. echoed back by
     * the external system as a correlation field) to disambiguate. Two or more
     * tenants matching without a supplied `tenantId` raises
     * `OutboxAmbiguousAckError` rather than guessing.
     */
    async ack(input) {
        return this.database.withSystemContext('outbox ack', () => this.database.tx(async (trx) => {
            const target = await this.resolveAckTarget(trx, input);
            const result = await trx.query(`update ${this.table}
                set status = $2::outbox.message_status,
                    ack_time = now(),
                    last_error = case when $2::text = 'ERROR' then $3 else null end,
                    updated_at = now()
              where id = $1
              returning ${(0, row_mapper_1.outboxColumns)()}`, [target.id, input.status, input.detail ?? null]);
            const row = (0, row_mapper_1.toRows)(result)[0];
            if (!row) {
                throw new errors_1.OutboxNotFoundError({ entity: input.entity, entityId: input.entityId });
            }
            try {
                await trx.query(`insert into ${this.ackTable} (id, tenant_id, message_id, ack_status, ack_message, ack_time)
               values (gen_random_uuid(), $1, $2, $3, $4, now())
               on conflict (message_id) do nothing`, [row.tenantId, row.id, input.status, input.detail ?? null]);
            }
            catch (error) {
                if (!(0, row_mapper_1.isUniqueViolation)(error)) {
                    throw error;
                }
            }
            this.metrics?.incrementAcked(row.entity, input.status === 'ACKED' ? 'acked' : 'error');
            return row;
        }, { role: 'owner', readonly: false }));
    }
    async resolveAckTarget(trx, input) {
        const params = [input.entity, input.entityId];
        let whereTenant = '';
        if (input.tenantId) {
            params.push(input.tenantId);
            whereTenant = 'and tenant_id = $3::uuid';
        }
        const result = await trx.query(`select id, tenant_id as "tenantId" from ${this.table} where entity = $1 and entity_id = $2 ${whereTenant}`, params);
        const rows = (0, row_mapper_1.toRows)(result);
        if (rows.length === 0) {
            throw new errors_1.OutboxNotFoundError({ entity: input.entity, entityId: input.entityId });
        }
        const [first] = rows;
        if (rows.length > 1 || !first) {
            throw new errors_1.OutboxAmbiguousAckError({
                entity: input.entity,
                entityId: input.entityId,
                matches: rows.length,
            });
        }
        return first;
    }
};
exports.OutboxService = OutboxService;
exports.OutboxService = OutboxService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_OPTIONS)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_DISPATCHER)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_BACKOFF_POLICY)),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_METRICS)),
    __metadata("design:paramtypes", [data_1.Database, Object, Object, Object, Object])
], OutboxService);
//# sourceMappingURL=outbox.service.js.map
```

## package/dist/outbox/src/row-mapper.d.ts

```text
/**
 * Column projection shared by every query that returns full outbox rows.
 * Aliasing to camelCase in SQL means the driver row already matches
 * `OutboxRow` — no separate JS-side mapping step, matching pec's
 * `OUTBOX_COLUMNS` convention.
 */
export declare function outboxColumns(alias?: string): string;
/** Normalizes a pg-style `{ rows }` or bare-array result into a row array. */
export declare function toRows<T>(result: {
    rows: T[];
} | T[]): T[];
/** Validates a `schema.table` identifier used to interpolate a table name into SQL text. */
export declare function assertQualifiedIdentifier(value: string, name: string): string;
export declare function isPgError(error: unknown): error is {
    code?: string;
};
export declare function isUniqueViolation(error: unknown): boolean;
export declare function errorMessage(error: unknown): string;
//# sourceMappingURL=row-mapper.d.ts.map
```

## package/dist/outbox/src/types.d.ts

```text
/**
 * Public types for the transactional outbox: envelope, row shape, dispatcher
 * port, backoff policy, and the minimal SQL executor duck-type that lets
 * `enqueue()` accept either a `@stynx-nyx/data` `Transaction` or any other
 * object exposing a compatible `query()` method.
 */
/** Lifecycle states for one outbox row. */
export type OutboxStatus = 'PENDING' | 'SENT' | 'ACKED' | 'ERROR';
/**
 * Entity-agnostic envelope for one outbox message. `entity` + `entityId`
 * identify the aggregate the message represents (e.g. `'renach.encounter'`,
 * `12`); `payload` is the wire body handed to the dispatcher. A second
 * `enqueue()` call for the same `(tenantId, entity, entityId)` upserts in
 * place (matching pec's `renach_outbox` semantics) rather than appending a
 * new row, so at most one outstanding message exists per aggregate.
 */
export interface OutboxEnvelope {
    /** Aggregate/domain type this message represents. Free-form, dot-namespaced by convention. */
    entity: string;
    /** Aggregate identifier, scoped to `entity` (and, implicitly, tenant). */
    entityId: string;
    /** Wire payload delivered to the dispatcher. Serialized as `jsonb`. */
    payload: Record<string, unknown>;
    /**
     * Overrides the default idempotency key (`${entity}:${entityId}`). Set this
     * when the same `(entity, entityId)` pair may legitimately need more than
     * one in-flight message (rare — most callers should rely on the default).
     */
    idempotencyKey?: string;
    /**
     * Free-form linkage back to the originating domain record (replaces pec's
     * hardcoded `encounterId` FK). Stored as `jsonb`; not interpreted by this
     * package.
     */
    metadata?: Record<string, unknown>;
}
/** Persisted shape of one outbox row, as returned by every service method. */
export interface OutboxRow {
    id: string;
    tenantId: string;
    entity: string;
    entityId: string;
    payload: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
    status: OutboxStatus;
    attempts: number;
    lastError: string | null;
    ackTime: string | null;
    nextAttemptAt: string | null;
    idempotencyKey: string;
    createdAt: string;
    updatedAt: string;
}
/** Input to `OutboxService.ack()` — normally sourced from an inbound webhook body. */
export interface OutboxAckInput {
    entity: string;
    entityId: string;
    status: 'ACKED' | 'ERROR';
    detail?: string;
    /**
     * Disambiguates `(entity, entityId)` across tenants. Required when the
     * external system does not guarantee `entityId` is globally unique;
     * omitting it while more than one tenant holds a matching row raises
     * `OutboxAmbiguousAckError`.
     */
    tenantId?: string;
}
/** Result of one `dispatchDue()` claim-and-send attempt. */
export interface OutboxDispatchOutcome {
    row: OutboxRow;
    /** `true` when a dispatcher port was invoked and returned without throwing. */
    dispatched: boolean;
    error?: string;
}
/**
 * Pluggable transport for claimed outbox rows. `send()` should throw (or
 * reject) to signal delivery failure; `dispatchDue()` catches the rejection,
 * reverts the row to `ERROR`, and schedules the next attempt via the
 * configured `OutboxBackoffPolicy`. Ship an HTTP implementation today
 * (`HttpOutboxDispatcher`); an EventBridge implementation is deferred —
 * this port is the seam a later package hangs it on.
 */
export interface OutboxDispatcherPort {
    send(row: OutboxRow): Promise<void>;
}
/**
 * Computes when a failed (or manually retried) row becomes eligible again.
 * pec hardcoded `now() + 15 minutes`; this package makes that a policy so
 * consumers can choose fixed-interval (pec-compatible default) or
 * exponential-with-jitter backoff.
 */
export interface OutboxBackoffPolicy {
    nextAttemptAt(attempt: number, now?: Date): Date;
}
/** Minimal SQL surface `OutboxService` needs from a transaction/executor. */
export interface OutboxSqlExecutor {
    query<T extends object = object>(sql: string, params?: ReadonlyArray<unknown>): Promise<{
        rows: T[];
        rowCount?: number | null;
    }>;
}
/** Optional metrics hook; no-op by default. */
export interface OutboxMetricsSink {
    incrementEnqueued(entity: string): void;
    incrementDispatched(entity: string, outcome: 'sent' | 'error'): void;
    incrementAcked(entity: string, outcome: 'acked' | 'error'): void;
}
export interface OutboxModuleOptions {
    /** Qualified table name for messages. Defaults to `outbox.messages`. */
    table?: string;
    /** Qualified table name for acknowledgements. Defaults to `outbox.acknowledgements`. */
    ackTable?: string;
    dispatcher?: OutboxDispatcherPort;
    backoffPolicy?: OutboxBackoffPolicy;
    metrics?: OutboxMetricsSink;
    /** Default `limit` for `dispatchDue()` when the caller doesn't pass one. */
    dispatchBatchSize?: number;
}
//# sourceMappingURL=types.d.ts.map
```
