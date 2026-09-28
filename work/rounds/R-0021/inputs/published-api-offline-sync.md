# Published API — @stynx-nyx/offline-sync 1.4.0 / 1.5.0-rc.2

Extracted from archived npm tarballs; byte-identical own JS and declarations across both versions. See published-api-metadata.json for archive and per-file hashes. This is an inspection input, not a local API implementation.

## package/dist/offline-sync/src/errors.d.ts

```text
import { HttpException } from '@nestjs/common';
export type OfflineSyncErrorCode = 'OFFLINE_SYNC_UNAUTHENTICATED' | 'OFFLINE_SYNC_FORBIDDEN' | 'OFFLINE_SYNC_CONTEXT_OVERRIDE' | 'OFFLINE_SYNC_INVALID_INPUT' | 'OFFLINE_SYNC_RANGE_NOT_FOUND' | 'OFFLINE_SYNC_RANGE_UNAVAILABLE' | 'OFFLINE_SYNC_RESERVATION_NOT_FOUND' | 'OFFLINE_SYNC_RESERVATION_STATE' | 'OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND' | 'OFFLINE_SYNC_QUEUE_ID_REUSED' | 'OFFLINE_SYNC_CONFLICT_NOT_FOUND' | 'OFFLINE_SYNC_CONFLICT_STATE';
export declare class OfflineSyncError extends HttpException {
    readonly code: OfflineSyncErrorCode;
    constructor(code: OfflineSyncErrorCode, status: number, message: string);
}
//# sourceMappingURL=errors.d.ts.map
```

## package/dist/offline-sync/src/in-memory-offline-sync.store.d.ts

```text
import type { CancelNumberingReservationInput, NumberingRange, NumberingReservation, OfflineSyncStore, OpenSyncConflictInput, ResolveSyncConflictInput, StoredSyncQueueItem, SubmitSyncBatchInput, SubmitSyncBatchResult, SyncConflict, TrustedOfflineSyncScope, ReserveNumberingInput } from './types';
/** Deterministic process-local store for tests and sandbox wiring. */
export declare class InMemoryOfflineSyncStore implements OfflineSyncStore {
    private readonly ranges;
    private readonly reservations;
    private readonly queueItems;
    private readonly payloadIndex;
    private readonly conflicts;
    seedNumberingRange(range: NumberingRange): void;
    reserveNumbering(scope: TrustedOfflineSyncScope, input: ReserveNumberingInput, _now: string, defaultValidUntil: string): Promise<NumberingReservation>;
    cancelNumberingReservation(scope: TrustedOfflineSyncScope, reservationId: string, _input: CancelNumberingReservationInput, _now: string): Promise<NumberingReservation>;
    submitSyncBatch(scope: TrustedOfflineSyncScope, input: SubmitSyncBatchInput, now: string): Promise<SubmitSyncBatchResult>;
    openConflict(scope: TrustedOfflineSyncScope, queueItemId: string, input: OpenSyncConflictInput, _now: string): Promise<SyncConflict>;
    resolveConflict(scope: TrustedOfflineSyncScope, conflictId: string, input: ResolveSyncConflictInput, now: string): Promise<SyncConflict>;
    getQueueItem(tenantId: string, queueItemId: string): StoredSyncQueueItem | undefined;
    private key;
}
//# sourceMappingURL=in-memory-offline-sync.store.d.ts.map
```

## package/dist/offline-sync/src/index.d.ts

```text
/**
 * Tenant-scoped numbering reservation and offline sync server primitives.
 *
 * @packageDocumentation
 */
export * from './errors';
export * from './in-memory-offline-sync.store';
export * from './offline-sync.controller';
export * from './offline-sync.module';
export * from './offline-sync.service';
export * from './postgres-offline-sync.store';
export * from './stynx-offline-sync.context';
export * from './tokens';
export * from './types';
//# sourceMappingURL=index.d.ts.map
```

## package/dist/offline-sync/src/offline-sync.controller.d.ts

```text
import { OfflineSyncService } from './offline-sync.service';
import type { CancelNumberingReservationInput, ReserveNumberingInput, ResolveSyncConflictInput, SubmitSyncBatchInput } from './types';
export declare class OfflineSyncController {
    private readonly service;
    constructor(service: OfflineSyncService);
    reserveNumbering(input: ReserveNumberingInput): Promise<import("./types").NumberingReservation>;
    cancelNumbering(id: string, input: CancelNumberingReservationInput): Promise<import("./types").NumberingReservation>;
    submitBatch(input: SubmitSyncBatchInput): Promise<import("./types").SubmitSyncBatchResult>;
    resolveConflict(id: string, input: ResolveSyncConflictInput): Promise<import("./types").SyncConflict>;
    private rejectContextOverrides;
}
//# sourceMappingURL=offline-sync.controller.d.ts.map
```

## package/dist/offline-sync/src/offline-sync.module.d.ts

```text
import { type DynamicModule } from '@nestjs/common';
import type { StynxOfflineSyncModuleOptions } from './types';
export declare class StynxOfflineSyncModule {
    static forRoot(options?: StynxOfflineSyncModuleOptions): DynamicModule;
    static inMemory(options?: Omit<StynxOfflineSyncModuleOptions, 'store'>): DynamicModule;
}
//# sourceMappingURL=offline-sync.module.d.ts.map
```

## package/dist/offline-sync/src/offline-sync.service.d.ts

```text
import type { CancelNumberingReservationInput, NumberingReservation, OfflineSyncContextPort, OfflineSyncStore, OpenSyncConflictInput, ReserveNumberingInput, ResolveSyncConflictInput, StynxOfflineSyncModuleOptions, SubmitSyncBatchInput, SubmitSyncBatchResult, SyncConflict } from './types';
export declare class OfflineSyncService {
    private readonly store;
    private readonly context;
    private readonly options;
    constructor(store: OfflineSyncStore, context: OfflineSyncContextPort, options: StynxOfflineSyncModuleOptions);
    reserveNumbering(input: ReserveNumberingInput): Promise<NumberingReservation>;
    cancelNumberingReservation(reservationId: string, input?: CancelNumberingReservationInput): Promise<NumberingReservation>;
    submitSyncBatch(input: SubmitSyncBatchInput): Promise<SubmitSyncBatchResult>;
    openConflict(queueItemId: string, input: OpenSyncConflictInput): Promise<SyncConflict>;
    resolveConflict(conflictId: string, input: ResolveSyncConflictInput): Promise<SyncConflict>;
    private now;
    private assertEntityType;
    private assertText;
    private invalid;
}
//# sourceMappingURL=offline-sync.service.d.ts.map
```

## package/dist/offline-sync/src/offline-sync.service.js

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
exports.OfflineSyncService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("./errors");
const tokens_1 = require("./tokens");
const sha256Pattern = /^sha256:[0-9a-f]{64}$/u;
let OfflineSyncService = class OfflineSyncService {
    store;
    context;
    options;
    constructor(store, context, options) {
        this.store = store;
        this.context = context;
        this.options = options;
    }
    async reserveNumbering(input) {
        this.assertText(input.orgUnitId, 'orgUnitId');
        this.assertText(input.deviceId, 'deviceId');
        this.assertText(input.shiftId, 'shiftId');
        this.assertEntityType(input.entityType);
        if (!Number.isSafeInteger(input.requestedSize) ||
            input.requestedSize < 1 ||
            input.requestedSize > 100) {
            this.invalid('requestedSize must be an integer between 1 and 100.');
        }
        const now = this.now();
        const validUntil = new Date(Date.parse(now) + (this.options.reservationTtlMs ?? 86_400_000)).toISOString();
        if (input.validUntil && Date.parse(input.validUntil) <= Date.parse(now)) {
            this.invalid('validUntil must be later than the current time.');
        }
        return this.store.reserveNumbering(this.context.current(), input, now, validUntil);
    }
    async cancelNumberingReservation(reservationId, input = {}) {
        this.assertText(reservationId, 'reservationId');
        if (input.reason !== undefined && input.reason.length > 500) {
            this.invalid('reason must not exceed 500 characters.');
        }
        return this.store.cancelNumberingReservation(this.context.current(), reservationId, input, this.now());
    }
    async submitSyncBatch(input) {
        this.assertText(input.orgUnitId, 'orgUnitId');
        this.assertText(input.deviceId, 'deviceId');
        this.assertText(input.deviceBatchId, 'deviceBatchId');
        if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 100) {
            this.invalid('items must contain between 1 and 100 queue items.');
        }
        const queueIds = new Set();
        for (const item of input.items) {
            this.assertText(item.queueItemId, 'queueItemId');
            this.assertEntityType(item.entityType);
            this.assertText(item.localEntityId, 'localEntityId');
            this.assertText(item.idempotencyKey, 'idempotencyKey');
            if (!sha256Pattern.test(item.payloadHash)) {
                this.invalid('payloadHash must be a canonical sha256-prefixed hexadecimal digest.');
            }
            if (!Number.isFinite(Date.parse(item.createdLocallyAt))) {
                this.invalid('createdLocallyAt must be an ISO-8601 timestamp.');
            }
            if (!item.payloadJson ||
                typeof item.payloadJson !== 'object' ||
                Array.isArray(item.payloadJson)) {
                this.invalid('payloadJson must be an object.');
            }
            if (queueIds.has(item.queueItemId)) {
                this.invalid(`queueItemId ${item.queueItemId} appears more than once in the batch.`);
            }
            queueIds.add(item.queueItemId);
        }
        return this.store.submitSyncBatch(this.context.current(), input, this.now());
    }
    async openConflict(queueItemId, input) {
        this.assertText(queueItemId, 'queueItemId');
        this.assertText(input.conflictType, 'conflictType');
        this.assertText(input.description, 'description');
        return this.store.openConflict(this.context.current(), queueItemId, input, this.now());
    }
    async resolveConflict(conflictId, input) {
        this.assertText(conflictId, 'conflictId');
        if (!['device-wins', 'server-wins', 'manual-review'].includes(input.resolution)) {
            this.invalid('resolution must be device-wins, server-wins or manual-review.');
        }
        return this.store.resolveConflict(this.context.current(), conflictId, input, this.now());
    }
    now() {
        return (this.options.now ?? (() => new Date().toISOString()))();
    }
    assertEntityType(value) {
        this.assertText(value, 'entityType');
        if (value.length > 100)
            this.invalid('entityType must not exceed 100 characters.');
    }
    assertText(value, field) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            this.invalid(`${field} is required.`);
        }
    }
    invalid(message) {
        throw new errors_1.OfflineSyncError('OFFLINE_SYNC_INVALID_INPUT', 400, message);
    }
};
exports.OfflineSyncService = OfflineSyncService;
exports.OfflineSyncService = OfflineSyncService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.STYNX_OFFLINE_SYNC_STORE)),
    __param(1, (0, common_1.Inject)(tokens_1.STYNX_OFFLINE_SYNC_CONTEXT)),
    __param(2, (0, common_1.Inject)(tokens_1.STYNX_OFFLINE_SYNC_OPTIONS)),
    __metadata("design:paramtypes", [Object, Object, Object])
], OfflineSyncService);
//# sourceMappingURL=offline-sync.service.js.map
```

## package/dist/offline-sync/src/postgres-offline-sync.store.d.ts

```text
import { ModuleRef } from '@nestjs/core';
import type { CancelNumberingReservationInput, NumberingReservation, OfflineSyncStore, OpenSyncConflictInput, ReserveNumberingInput, ResolveSyncConflictInput, SubmitSyncBatchInput, SubmitSyncBatchResult, SyncConflict, TrustedOfflineSyncScope } from './types';
export declare class PostgresOfflineSyncStore implements OfflineSyncStore {
    private readonly moduleRef;
    constructor(moduleRef: ModuleRef);
    reserveNumbering(scope: TrustedOfflineSyncScope, input: ReserveNumberingInput, now: string, defaultValidUntil: string): Promise<NumberingReservation>;
    cancelNumberingReservation(scope: TrustedOfflineSyncScope, reservationId: string, input: CancelNumberingReservationInput, now: string): Promise<NumberingReservation>;
    submitSyncBatch(scope: TrustedOfflineSyncScope, input: SubmitSyncBatchInput, now: string): Promise<SubmitSyncBatchResult>;
    openConflict(scope: TrustedOfflineSyncScope, queueItemId: string, input: OpenSyncConflictInput, now: string): Promise<SyncConflict>;
    resolveConflict(scope: TrustedOfflineSyncScope, conflictId: string, input: ResolveSyncConflictInput, now: string): Promise<SyncConflict>;
    private findQueueItemByPayload;
    private mapRange;
    private mapReservation;
    private mapQueueItem;
    private mapConflict;
    private get database();
}
//# sourceMappingURL=postgres-offline-sync.store.d.ts.map
```

## package/dist/offline-sync/src/postgres-offline-sync.store.js

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresOfflineSyncStore = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const data_1 = require("@stynx-nyx/data");
const errors_1 = require("./errors");
let PostgresOfflineSyncStore = class PostgresOfflineSyncStore {
    moduleRef;
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    async reserveNumbering(scope, input, now, defaultValidUntil) {
        return this.database.tx(async (trx) => {
            const result = await trx.query(`select id, tenant_id, org_unit_id, entity_type, series, start_number,
                end_number, next_number, status
           from offline.numbering_ranges
          where tenant_id = $1::uuid
            and ($2::uuid is null or id = $2::uuid)
            and ($2::uuid is not null or (
              org_unit_id = $3
              and entity_type = $4
              and ($5::text is null or series = $5)
            ))
          order by series
          limit 1
          for update`, [
                scope.tenantId,
                input.rangeId ?? null,
                input.orgUnitId,
                input.entityType,
                input.series ?? null,
            ]);
            const row = result.rows[0];
            if (!row) {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RANGE_NOT_FOUND', 404, 'No tenant-scoped numbering range matches this entity and organizational unit.');
            }
            const range = this.mapRange(row);
            if (range.status !== 'active' ||
                range.orgUnitId !== input.orgUnitId ||
                range.entityType !== input.entityType) {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RANGE_UNAVAILABLE', 409, 'The selected numbering range is not active for this entity and organizational unit.');
            }
            const endNumber = range.nextNumber + input.requestedSize - 1;
            if (endNumber > range.endNumber) {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RANGE_UNAVAILABLE', 409, 'The selected numbering range has insufficient capacity.');
            }
            await trx.query(`update offline.numbering_ranges
            set next_number = $3,
                status = case when $2 = end_number then 'exhausted' else status end,
                updated_at = $4::timestamptz
          where tenant_id = $1::uuid and id = $5::uuid`, [scope.tenantId, endNumber, endNumber + 1, now, range.id]);
            const reservationId = (0, node_crypto_1.randomUUID)();
            const inserted = await trx.query(`insert into offline.numbering_reservations (
           id, tenant_id, range_id, org_unit_id, entity_type, series, agent_id,
           device_id, shift_id, start_number, end_number, next_number,
           reserved_at, valid_until, status
         ) values (
           $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9,
           $10, $11, $10, $12::timestamptz, $13::timestamptz, 'reserved'
         )
         returning id, tenant_id, range_id, org_unit_id, entity_type, series,
                   agent_id, device_id, shift_id, start_number, end_number,
                   next_number, valid_until, status`, [
                reservationId,
                scope.tenantId,
                range.id,
                input.orgUnitId,
                input.entityType,
                range.series,
                scope.actorId,
                input.deviceId,
                input.shiftId,
                range.nextNumber,
                endNumber,
                now,
                input.validUntil ?? defaultValidUntil,
            ]);
            return this.mapReservation(inserted.rows[0]);
        });
    }
    async cancelNumberingReservation(scope, reservationId, input, now) {
        return this.database.tx(async (trx) => {
            const existing = await trx.query(`select id, tenant_id, range_id, org_unit_id, entity_type, series,
                agent_id, device_id, shift_id, start_number, end_number,
                next_number, valid_until, status
           from offline.numbering_reservations
          where tenant_id = $1::uuid and id = $2::uuid
          for update`, [scope.tenantId, reservationId]);
            const row = existing.rows[0];
            if (!row) {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RESERVATION_NOT_FOUND', 404, `Numbering reservation ${reservationId} was not found.`);
            }
            if (row.status !== 'reserved') {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RESERVATION_STATE', 409, `Numbering reservation ${reservationId} is ${row.status}; expected reserved.`);
            }
            const updated = await trx.query(`update offline.numbering_reservations
            set status = 'cancelled', cancellation_reason = $3,
                cancelled_by = $4, updated_at = $5::timestamptz
          where tenant_id = $1::uuid and id = $2::uuid
          returning id, tenant_id, range_id, org_unit_id, entity_type, series,
                    agent_id, device_id, shift_id, start_number, end_number,
                    next_number, valid_until, status`, [scope.tenantId, reservationId, input.reason ?? null, scope.actorId, now]);
            return this.mapReservation(updated.rows[0]);
        });
    }
    async submitSyncBatch(scope, input, now) {
        return this.database.tx(async (trx) => {
            const items = [];
            let duplicateItems = 0;
            for (const item of input.items) {
                const existing = await this.findQueueItemByPayload(trx, scope.tenantId, item.payloadHash);
                if (existing) {
                    duplicateItems += 1;
                    items.push(existing);
                    continue;
                }
                try {
                    const inserted = await trx.query(`insert into offline.sync_queue_items (
               id, tenant_id, device_batch_id, org_unit_id, agent_id, device_id,
               entity_type, local_entity_id, idempotency_key, payload_hash,
               payload_json, created_locally_at, reserved_number, status, received_at
             ) values (
               $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10,
               $11::jsonb, $12::timestamptz, $13, 'received', $14::timestamptz
             )
             on conflict (tenant_id, payload_hash) do nothing
             returning id, tenant_id, org_unit_id, agent_id, device_id, entity_type,
                       local_entity_id, idempotency_key, payload_hash, payload_json,
                       created_locally_at, reserved_number, status, received_at`, [
                        item.queueItemId,
                        scope.tenantId,
                        input.deviceBatchId,
                        input.orgUnitId,
                        scope.actorId,
                        input.deviceId,
                        item.entityType,
                        item.localEntityId,
                        item.idempotencyKey,
                        item.payloadHash,
                        JSON.stringify(item.payloadJson),
                        item.createdLocallyAt,
                        item.reservedNumber ?? null,
                        now,
                    ]);
                    const insertedRow = inserted.rows[0];
                    if (insertedRow) {
                        items.push(this.mapQueueItem(insertedRow));
                        continue;
                    }
                }
                catch (error) {
                    if (error.code === '23505') {
                        throw new errors_1.OfflineSyncError('OFFLINE_SYNC_QUEUE_ID_REUSED', 409, `Queue item ${item.queueItemId} was already used with another payload hash.`);
                    }
                    throw error;
                }
                const raced = await this.findQueueItemByPayload(trx, scope.tenantId, item.payloadHash);
                if (!raced) {
                    throw new Error('Payload-hash conflict did not resolve to a stored queue item.');
                }
                duplicateItems += 1;
                items.push(raced);
            }
            return {
                batchId: input.deviceBatchId,
                acceptedItems: input.items.length,
                duplicateItems,
                conflicts: items
                    .filter((item) => item.status === 'conflict')
                    .map((item) => item.queueItemId),
                items,
            };
        });
    }
    async openConflict(scope, queueItemId, input, now) {
        return this.database.tx(async (trx) => {
            const queueResult = await trx.query(`update offline.sync_queue_items
            set status = 'conflict', updated_at = $3::timestamptz
          where tenant_id = $1::uuid and id = $2
          returning id, tenant_id, org_unit_id, agent_id, device_id, entity_type,
                    local_entity_id, idempotency_key, payload_hash, payload_json,
                    created_locally_at, reserved_number, status, received_at`, [scope.tenantId, queueItemId, now]);
            const queueItem = queueResult.rows[0];
            if (!queueItem) {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND', 404, `Sync queue item ${queueItemId} was not found.`);
            }
            const result = await trx.query(`insert into offline.sync_conflicts (
           id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
           conflict_type, description, status, created_at
         ) values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, 'open', $8::timestamptz)
         returning id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
                   conflict_type, description, status, resolution, resolved_by, resolved_at`, [
                (0, node_crypto_1.randomUUID)(),
                scope.tenantId,
                queueItemId,
                queueItem.local_entity_id,
                queueItem.payload_hash,
                input.conflictType,
                input.description,
                now,
            ]);
            return this.mapConflict(result.rows[0]);
        });
    }
    async resolveConflict(scope, conflictId, input, now) {
        return this.database.tx(async (trx) => {
            const existing = await trx.query(`select id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
                conflict_type, description, status, resolution, resolved_by, resolved_at
           from offline.sync_conflicts
          where tenant_id = $1::uuid and id = $2::uuid
          for update`, [scope.tenantId, conflictId]);
            const row = existing.rows[0];
            if (!row) {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_CONFLICT_NOT_FOUND', 404, `Sync conflict ${conflictId} was not found.`);
            }
            if (row.status !== 'open') {
                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_CONFLICT_STATE', 409, `Sync conflict ${conflictId} is ${row.status}; expected open.`);
            }
            await trx.query(`update offline.sync_queue_items
            set status = $3, updated_at = $4::timestamptz
          where tenant_id = $1::uuid and id = $2`, [
                scope.tenantId,
                row.sync_queue_item_id,
                input.resolution === 'server-wins' ? 'rejected' : 'applied',
                now,
            ]);
            const updated = await trx.query(`update offline.sync_conflicts
            set status = 'resolved', resolution = $3, resolved_by = $4,
                resolved_at = $5::timestamptz,
                description = coalesce($6, description), updated_at = $5::timestamptz
          where tenant_id = $1::uuid and id = $2::uuid
          returning id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
                    conflict_type, description, status, resolution, resolved_by, resolved_at`, [
                scope.tenantId,
                conflictId,
                input.resolution,
                scope.actorId,
                now,
                input.description ?? null,
            ]);
            return this.mapConflict(updated.rows[0]);
        });
    }
    async findQueueItemByPayload(trx, tenantId, payloadHash) {
        const result = await trx.query(`select id, tenant_id, org_unit_id, agent_id, device_id, entity_type,
              local_entity_id, idempotency_key, payload_hash, payload_json,
              created_locally_at, reserved_number, status, received_at
         from offline.sync_queue_items
        where tenant_id = $1::uuid and payload_hash = $2
        limit 1`, [tenantId, payloadHash]);
        return result.rows[0] ? this.mapQueueItem(result.rows[0]) : undefined;
    }
    mapRange(row) {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            orgUnitId: row.org_unit_id,
            entityType: row.entity_type,
            series: row.series,
            startNumber: Number(row.start_number),
            endNumber: Number(row.end_number),
            nextNumber: Number(row.next_number),
            status: row.status,
        };
    }
    mapReservation(row) {
        return {
            reservationId: row.id,
            rangeId: row.range_id,
            tenantId: row.tenant_id,
            orgUnitId: row.org_unit_id,
            entityType: row.entity_type,
            series: row.series,
            agentId: row.agent_id,
            deviceId: row.device_id,
            shiftId: row.shift_id,
            startNumber: Number(row.start_number),
            endNumber: Number(row.end_number),
            nextNumber: Number(row.next_number),
            validUntil: new Date(row.valid_until).toISOString(),
            status: row.status,
        };
    }
    mapQueueItem(row) {
        return {
            queueItemId: row.id,
            tenantId: row.tenant_id,
            orgUnitId: row.org_unit_id,
            agentId: row.agent_id,
            deviceId: row.device_id,
            entityType: row.entity_type,
            localEntityId: row.local_entity_id,
            idempotencyKey: row.idempotency_key,
            payloadHash: row.payload_hash,
            payloadJson: row.payload_json,
            createdLocallyAt: new Date(row.created_locally_at).toISOString(),
            ...(row.reserved_number === null ? {} : { reservedNumber: Number(row.reserved_number) }),
            status: row.status,
            receivedAt: new Date(row.received_at).toISOString(),
        };
    }
    mapConflict(row) {
        return {
            conflictId: row.id,
            tenantId: row.tenant_id,
            queueItemId: row.sync_queue_item_id,
            localEntityId: row.local_entity_id,
            payloadHash: row.payload_hash,
            conflictType: row.conflict_type,
            description: row.description,
            status: row.status,
            ...(row.resolution === null ? {} : { resolution: row.resolution }),
            ...(row.resolved_by === null ? {} : { resolvedBy: row.resolved_by }),
            ...(row.resolved_at === null ? {} : { resolvedAt: new Date(row.resolved_at).toISOString() }),
        };
    }
    get database() {
        return this.moduleRef.get(data_1.Database, { strict: false });
    }
};
exports.PostgresOfflineSyncStore = PostgresOfflineSyncStore;
exports.PostgresOfflineSyncStore = PostgresOfflineSyncStore = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], PostgresOfflineSyncStore);
//# sourceMappingURL=postgres-offline-sync.store.js.map
```

## package/dist/offline-sync/src/stynx-offline-sync.context.d.ts

```text
import { ModuleRef } from '@nestjs/core';
import type { OfflineSyncContextPort, TrustedOfflineSyncScope } from './types';
export declare class StynxOfflineSyncContext implements OfflineSyncContextPort {
    private readonly moduleRef;
    constructor(moduleRef: ModuleRef);
    current(): TrustedOfflineSyncScope;
}
//# sourceMappingURL=stynx-offline-sync.context.d.ts.map
```

## package/dist/offline-sync/src/tokens.d.ts

```text
export declare const STYNX_OFFLINE_SYNC_OPTIONS: unique symbol;
export declare const STYNX_OFFLINE_SYNC_STORE: unique symbol;
export declare const STYNX_OFFLINE_SYNC_CONTEXT: unique symbol;
//# sourceMappingURL=tokens.d.ts.map
```

## package/dist/offline-sync/src/types.d.ts

```text
export type OfflineSyncQueueStatus = 'received' | 'applied' | 'conflict' | 'rejected';
export type OfflineSyncConflictResolutionStrategy = 'device-wins' | 'server-wins' | 'manual-review';
export interface TrustedOfflineSyncScope {
    readonly tenantId: string;
    readonly actorId: string;
}
export interface OfflineSyncContextPort {
    current(): TrustedOfflineSyncScope;
}
export interface NumberingRange {
    readonly id: string;
    readonly tenantId: string;
    readonly orgUnitId: string;
    readonly entityType: string;
    readonly series: string;
    readonly startNumber: number;
    readonly endNumber: number;
    readonly nextNumber: number;
    readonly status: 'active' | 'exhausted' | 'cancelled';
}
export interface NumberingReservation {
    readonly reservationId: string;
    readonly rangeId: string;
    readonly tenantId: string;
    readonly orgUnitId: string;
    readonly entityType: string;
    readonly series: string;
    readonly agentId: string;
    readonly deviceId: string;
    readonly shiftId: string;
    readonly startNumber: number;
    readonly endNumber: number;
    readonly nextNumber: number;
    readonly validUntil: string;
    readonly status: 'reserved' | 'consumed' | 'expired' | 'cancelled';
}
export interface ReserveNumberingInput {
    readonly orgUnitId: string;
    readonly deviceId: string;
    readonly shiftId: string;
    readonly entityType: string;
    readonly requestedSize: number;
    readonly rangeId?: string;
    readonly series?: string;
    readonly validUntil?: string;
}
export interface CancelNumberingReservationInput {
    readonly reason?: string;
}
export interface SyncBatchItemInput {
    readonly queueItemId: string;
    readonly entityType: string;
    readonly localEntityId: string;
    readonly idempotencyKey: string;
    readonly payloadHash: string;
    readonly payloadJson: Record<string, unknown>;
    readonly createdLocallyAt: string;
    readonly reservedNumber?: number;
}
export interface SubmitSyncBatchInput {
    readonly orgUnitId: string;
    readonly deviceId: string;
    readonly deviceBatchId: string;
    readonly items: readonly SyncBatchItemInput[];
}
export interface StoredSyncQueueItem extends SyncBatchItemInput {
    readonly tenantId: string;
    readonly agentId: string;
    readonly orgUnitId: string;
    readonly deviceId: string;
    readonly status: OfflineSyncQueueStatus;
    readonly receivedAt: string;
}
export interface SubmitSyncBatchResult {
    readonly batchId: string;
    readonly acceptedItems: number;
    readonly duplicateItems: number;
    readonly conflicts: readonly string[];
    readonly items: readonly StoredSyncQueueItem[];
}
export interface OpenSyncConflictInput {
    readonly conflictType: string;
    readonly description: string;
}
export interface ResolveSyncConflictInput {
    readonly resolution: OfflineSyncConflictResolutionStrategy;
    readonly description?: string;
}
export interface SyncConflict {
    readonly conflictId: string;
    readonly tenantId: string;
    readonly queueItemId: string;
    readonly localEntityId: string;
    readonly payloadHash: string;
    readonly conflictType: string;
    readonly description: string;
    readonly status: 'open' | 'resolved';
    readonly resolution?: OfflineSyncConflictResolutionStrategy;
    readonly resolvedBy?: string;
    readonly resolvedAt?: string;
}
export interface OfflineSyncStore {
    reserveNumbering(scope: TrustedOfflineSyncScope, input: ReserveNumberingInput, now: string, defaultValidUntil: string): Promise<NumberingReservation>;
    cancelNumberingReservation(scope: TrustedOfflineSyncScope, reservationId: string, input: CancelNumberingReservationInput, now: string): Promise<NumberingReservation>;
    submitSyncBatch(scope: TrustedOfflineSyncScope, input: SubmitSyncBatchInput, now: string): Promise<SubmitSyncBatchResult>;
    openConflict(scope: TrustedOfflineSyncScope, queueItemId: string, input: OpenSyncConflictInput, now: string): Promise<SyncConflict>;
    resolveConflict(scope: TrustedOfflineSyncScope, conflictId: string, input: ResolveSyncConflictInput, now: string): Promise<SyncConflict>;
}
export interface StynxOfflineSyncModuleOptions {
    readonly store?: OfflineSyncStore;
    readonly context?: OfflineSyncContextPort;
    readonly mountControllers?: boolean;
    readonly now?: () => string;
    readonly reservationTtlMs?: number;
}
//# sourceMappingURL=types.d.ts.map
```
