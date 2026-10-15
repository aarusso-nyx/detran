import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import type {
  SyncAitNumberingRulePort,
  SyncEntityApplier,
  SyncEntityApplierItem,
} from '@detran/ops-core';
import { DetranError } from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';
import {
  OFFLINE_SYNC_CONSUMER_ATTRIBUTES_MAX_BYTES,
  type CTG9NumberingReservation,
  type CTG9ReserveNumberingInput,
  type CTG9SyncBatchItemInput,
  type OfflineSyncApplyResult,
  type OfflineSyncItemApplier,
  type OfflineSyncItemContext,
  type OfflineSyncPolicy,
  type OfflineSyncPolicyResolver,
  type OfflineSyncService,
} from '@stynx-nyx/offline-sync';

import type { ParameterPort, RequestContextPort } from './batch-protocol.js';
import { numberOf, validationFailed } from './batch-protocol.js';
import { CONCURRENCY_WINDOW_KEY, windowFrom } from './concurrency-detector.js';

function reject(code: string, context: Record<string, unknown> = {}): never {
  throw new DetranError(code, {
    status: code === 'TEAT.INTERNAL' ? 500 : 422,
    context,
  });
}

/** Inspect descriptors before reading externally supplied data. */
function dataRecord(value: unknown, code: string): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
    Object.getOwnPropertySymbols(value).length
  )
    reject(code);
  const copy: Record<string, unknown> = Object.create(null);
  for (const [key, entry] of Object.entries(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if (!entry.enumerable || !('value' in entry)) reject(code);
    Object.defineProperty(copy, key, { value: entry.value, enumerable: true });
  }
  return copy;
}

function jsonCopy(
  value: unknown,
  code: string,
  ancestors = new Set<object>(),
): unknown {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (Buffer.from(value, 'utf8').toString('utf8') !== value) reject(code);
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object' || ancestors.has(value)) reject(code);
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length) reject(code);
      const entries = Object.getOwnPropertyDescriptors(value);
      if (
        Object.keys(entries).some(
          (key) =>
            key !== 'length' &&
            (!/^(0|[1-9][0-9]*)$/u.test(key) ||
              !Number.isSafeInteger(Number(key)) ||
              Number(key) >= value.length),
        )
      )
        reject(code);
      return Array.from({ length: value.length }, (_, i) => {
        const entry = entries[String(i)];
        if (!entry?.enumerable || !('value' in entry)) reject(code);
        return jsonCopy(entry.value, code, ancestors);
      });
    }
    const source = dataRecord(value, code),
      copy: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      if (Buffer.from(key, 'utf8').toString('utf8') !== key) reject(code);
      Object.defineProperty(copy, key, {
        value: jsonCopy(source[key], code, ancestors),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return copy;
  } finally {
    ancestors.delete(value);
  }
}

function text(value: unknown, code: string): string {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    Buffer.from(value, 'utf8').toString('utf8') !== value
  )
    reject(code);
  return value;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

/** New effects only; replay is resolved by the SDK before this port is called. */
export class StynxOfflineItemApplier implements OfflineSyncItemApplier {
  constructor(private readonly appliers: readonly SyncEntityApplier[]) {}

  async apply(
    trx: Transaction,
    item: CTG9SyncBatchItemInput,
    context: OfflineSyncItemContext,
  ): Promise<OfflineSyncApplyResult> {
    const original = dataRecord(item, 'TEAT.SYNC_INVALID_CANONICAL_AIT');
    const code =
      original.entityType === 'crash-record'
        ? 'BOAT.SYNC_INVALID_CRASH_RECORD'
        : 'TEAT.SYNC_INVALID_CANONICAL_AIT';
    const scope = dataRecord(context, code);
    const entityType = text(original.entityType, code);
    const appliers = this.appliers.filter(
      (applier) => applier.entityType === entityType,
    );
    if (appliers.length !== 1)
      reject('TEAT.SYNC_DESTINATION_NOT_WIRED', { entityType });
    const payload = jsonCopy(original.payloadJson, code) as Record<
      string,
      unknown
    >;
    dataRecord(payload, code);
    const rejection = appliers[0]!.validate(payload);
    if (rejection) reject(rejection.code, { fields: [...rejection.fields] });
    const nativeKey = text(scope.receiptId ?? original.idempotencyKey, code);
    if (
      original.idempotencyKey !== undefined &&
      original.idempotencyKey !== nativeKey
    )
      reject(code);
    const reservationId = original.reservationId;
    if (
      reservationId !== undefined &&
      (typeof reservationId !== 'string' || !uuidPattern.test(reservationId))
    )
      reject(code);
    const receiptId = randomUUID();
    const handed: SyncEntityApplierItem = {
      id: text(original.queueItemId, code),
      tenantId: text(scope.tenantId, code),
      trafficAgencyId: text(scope.orgUnitId, code),
      deviceId: text(scope.deviceId, code),
      agentId: text(scope.agentId, code),
      entityType,
      localEntityId: text(original.localEntityId, code),
      idempotencyKey: nativeKey,
      payloadHash: text(original.payloadHash, code),
      createdLocallyAt: text(original.createdLocallyAt, code),
      concurrencySuspect: scope.concurrencySuspected === true,
      receiptId,
      storageMode: 'stynx-ctg9',
      payloadJson: payload,
      ...(reservationId === undefined
        ? {}
        : { reservationId: reservationId as string }),
    };
    const applied = await appliers[0]!.apply(handed, trx);
    const result = dataRecord(applied, 'TEAT.INTERNAL');
    const serverEntityId = text(result.serverEntityId, 'TEAT.INTERNAL');
    const detranOffline: Record<string, unknown> = {
      version: 1,
      receiptId,
      queueItemId: handed.id,
    };
    if (result.detailsJson !== undefined) {
      dataRecord(result.detailsJson, 'TEAT.INTERNAL');
      detranOffline.detailsJson = jsonCopy(result.detailsJson, 'TEAT.INTERNAL');
    }
    const consumerAttributes = { detranOffline };
    if (
      Buffer.byteLength(JSON.stringify(consumerAttributes), 'utf8') >
      OFFLINE_SYNC_CONSUMER_ATTRIBUTES_MAX_BYTES
    )
      reject('TEAT.INTERNAL');
    return { serverEntityId, consumerAttributes };
  }
}

interface NumberingRuleRow {
  reservation_id: string;
  tenant_id: string;
  device_id: string;
  org_unit_id: string;
  entity_type: string;
  shift_id: string | null;
  start_number: string;
  end_number: string;
  reservation_status: string;
  valid_until: string;
  consumption_number: string | null;
  consumption_status: string | null;
  server_entity_id: string | null;
}

/** Reads the SDK's already claimed reservation on the same item transaction. */
export class SqlStynxAitNumberingRulePort implements SyncAitNumberingRulePort {
  async assertAitNumbering(
    item: SyncEntityApplierItem,
    tx: Transaction,
    number: number,
    shiftId: string,
  ): Promise<void> {
    const foreign = 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT';
    if (
      !Number.isSafeInteger(number) ||
      typeof shiftId !== 'string' ||
      !shiftId.trim() ||
      item.storageMode !== 'stynx-ctg9'
    )
      reject(foreign);
    if (
      item.reservationId !== undefined &&
      (typeof item.reservationId !== 'string' ||
        !uuidPattern.test(item.reservationId))
    )
      reject(foreign);
    const { rows } = await tx.query<NumberingRuleRow>(
      `select r.id as reservation_id,r.tenant_id,r.device_id,r.org_unit_id,r.entity_type,r.shift_id,
        r.start_number,r.end_number,r.status as reservation_status,r.valid_until::text as valid_until,
        c.number as consumption_number,c.status as consumption_status,c.server_entity_id
       from offline.numbering_reservations r
       left join offline.numbering_consumption c
         on c.tenant_id=r.tenant_id and c.reservation_id=r.id and c.number=$5::bigint
       where r.tenant_id=$1::uuid and r.device_id=$2 and r.org_unit_id=$3 and r.entity_type=$4
         and r.start_number<=$5::bigint and r.end_number>=$5::bigint
         and ($6::uuid is null or r.id=$6::uuid)
         and (r.status<>'cancelled' or c.status in ('applied','claimed-locally'))
       order by r.id`,
      [
        item.tenantId,
        item.deviceId,
        item.trafficAgencyId,
        item.entityType,
        number,
        item.reservationId ?? null,
      ],
    );
    if (rows.length !== 1) reject(foreign);
    const row = rows[0]!;
    const integer = (value: unknown): bigint | null =>
      typeof value === 'string' && /^-?\d+$/u.test(value)
        ? BigInt(value)
        : null;
    const start = integer(row.start_number),
      end = integer(row.end_number),
      actualNumber = BigInt(number);
    if (
      row.tenant_id !== item.tenantId ||
      row.device_id !== item.deviceId ||
      row.org_unit_id !== item.trafficAgencyId ||
      row.entity_type !== item.entityType ||
      row.shift_id !== shiftId ||
      start === null ||
      end === null ||
      actualNumber < start ||
      actualNumber > end ||
      typeof row.reservation_id !== 'string' ||
      !uuidPattern.test(row.reservation_id) ||
      (item.reservationId !== undefined &&
        row.reservation_id.toLowerCase() !== item.reservationId.toLowerCase())
    )
      reject(foreign);
    if (row.consumption_status === 'applied')
      reject('TEAT.NUMBERING_NUMBER_ALREADY_APPLIED', {
        number,
        aitId: row.server_entity_id,
      });
    const expires = Date.parse(row.valid_until),
      created = Date.parse(item.createdLocallyAt);
    if (
      row.reservation_status !== 'reserved' ||
      !Number.isFinite(expires) ||
      !Number.isFinite(created) ||
      expires < created ||
      (row.consumption_status !== 'claimed-locally' &&
        row.consumption_status !== null)
    )
      reject('TEAT.NUMBERING_RESERVATION_EXPIRED', {
        number,
        reservationId: row.reservation_id,
      });
    if (
      row.consumption_status !== 'claimed-locally' ||
      integer(row.consumption_number) !== actualNumber
    )
      reject(foreign);
  }
}

interface ReservationFrame {
  readonly policies: StynxOfflinePolicyResolver;
  readonly tenantId: string;
  readonly orgUnitId: string;
  readonly operation: 'reserve-numbering';
  readonly validUntil?: string;
  readonly token: object;
}
const reservationFrames = new AsyncLocalStorage<ReservationFrame>();
const activeReservationTokens = new WeakSet<object>();
const invalidFrame = (): never => reject('TEAT.VALIDATION_FAILED');

export class StynxOfflinePolicyResolver implements OfflineSyncPolicyResolver {
  constructor(private readonly parameters: ParameterPort) {}
  async resolve(
    input: Parameters<OfflineSyncPolicyResolver['resolve']>[0],
  ): Promise<OfflineSyncPolicy> {
    const original = dataRecord(input, 'TEAT.VALIDATION_FAILED');
    const request = {
      tenantId: text(original.tenantId, 'TEAT.VALIDATION_FAILED'),
      orgUnitId: text(original.orgUnitId, 'TEAT.VALIDATION_FAILED'),
      operation: text(original.operation, 'TEAT.VALIDATION_FAILED'),
      at: text(original.at, 'TEAT.VALIDATION_FAILED'),
    };
    if (!Number.isFinite(Date.parse(request.at))) invalidFrame();
    const frame = reservationFrames.getStore();
    if (frame) {
      if (frame.tenantId !== request.tenantId) reject('TEAT.TENANT_MISMATCH');
      if (
        frame.policies !== this ||
        !activeReservationTokens.has(frame.token) ||
        frame.orgUnitId !== request.orgUnitId ||
        frame.operation !== request.operation
      )
        invalidFrame();
      if (frame.validUntil !== undefined) {
        const ttl = Date.parse(frame.validUntil) - Date.parse(request.at);
        if (!Number.isFinite(ttl) || ttl <= 0) invalidFrame();
        return { reservationTtlMs: ttl };
      }
    }
    if (request.operation === 'reserve-numbering') {
      const row = await this.parameters
        .get('teat.numbering.reservation_ttl_hours', {
          agencyId: request.orgUnitId,
        })
        .catch(() => undefined);
      const hours =
        row?.value_json == null ? Number.NaN : numberOf(row.value_json);
      if (!Number.isFinite(hours))
        throw validationFailed([{ path: 'valid_until', rule: 'required' }]);
      return { reservationTtlMs: hours * 3_600_000 };
    }
    const row = await this.parameters
      .get(CONCURRENCY_WINDOW_KEY, { agencyId: request.orgUnitId })
      .catch(() => undefined);
    return { concurrencyWindowMinutes: windowFrom(row ?? {}).minutes };
  }
}

export class StynxOfflineReservationPort {
  constructor(
    private readonly service: Pick<
      OfflineSyncService,
      'reserveDurableNumbering'
    >,
    private readonly policies: StynxOfflinePolicyResolver,
    private readonly requestContext: RequestContextPort,
  ) {}

  async reserve(
    input: CTG9ReserveNumberingInput,
  ): Promise<CTG9NumberingReservation> {
    if (!this.requestContext.hasActiveContext()) invalidFrame();
    const trusted = this.requestContext.snapshot();
    const tenantId = text(trusted.tenantId, 'TEAT.TENANT_MISMATCH');
    const source = dataRecord(input, 'TEAT.VALIDATION_FAILED');
    const detached: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(source)) {
      if (
        value !== undefined &&
        value !== null &&
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
      )
        invalidFrame();
      Object.defineProperty(detached, key, { value, enumerable: true });
    }
    const orgUnitId = text(source.orgUnitId, 'TEAT.VALIDATION_FAILED');
    if (
      source.validUntil !== undefined &&
      (typeof source.validUntil !== 'string' ||
        !Number.isFinite(Date.parse(source.validUntil)))
    )
      invalidFrame();
    const token = Object.freeze({});
    const frame = Object.freeze({
      policies: this.policies,
      tenantId,
      orgUnitId,
      operation: 'reserve-numbering' as const,
      ...(source.validUntil === undefined
        ? {}
        : { validUntil: source.validUntil as string }),
      token,
    });
    activeReservationTokens.add(token);
    try {
      return await reservationFrames.run(frame, () =>
        this.service.reserveDurableNumbering(
          Object.freeze(detached) as unknown as CTG9ReserveNumberingInput,
        ),
      );
    } finally {
      activeReservationTokens.delete(token);
    }
  }
}
