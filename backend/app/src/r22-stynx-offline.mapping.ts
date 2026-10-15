import type {
  NumberingConsumptionEntry,
  SyncItemReceipt,
  SyncQueueItemRecord,
} from '@stynx-nyx/offline-sync';

type CheckpointReason =
  | 'source-fact-unavailable'
  | 'identity-mismatch'
  | 'unsupported-outcome'
  | 'invalid-public-value';

export type R22OfflineMappingResult<T> =
  | { readonly kind: 'mapped'; readonly value: T }
  | { readonly kind: 'checkpoint'; readonly reason: CheckpointReason };

export interface R22AppliedReceiptIdentity {
  readonly tenantId: string;
  readonly deviceId: string;
  readonly deviceBatchId: string;
  readonly idempotencyKey: string;
  readonly localEntityId: string;
}

interface AppliedReceiptView {
  local_entity_id: string;
  idempotency_key: string;
  status: 'applied';
  server_entity_id: string;
  error_code: null;
  error_message: null;
  details_json: Record<string, unknown> | null;
}

type ConsumptionStatus =
  'aplicado' | 'consumido_localmente' | 'disponivel' | 'bloqueado' | 'expirado';

interface ConsumptionView {
  number: number;
  status: ConsumptionStatus;
  server_entity_id: string | null;
  finalized_at: string | null;
}

type Json = null | string | boolean | number | Json[] | { [key: string]: Json };
type DataRecord = Record<string, unknown>;
const invalidJson = Symbol('invalid-json');
const identityFields = [
  'tenantId',
  'deviceId',
  'deviceBatchId',
  'idempotencyKey',
  'localEntityId',
] as const;
const consumptionStatuses: Record<
  NumberingConsumptionEntry['status'],
  ConsumptionStatus
> = {
  applied: 'aplicado',
  'claimed-locally': 'consumido_localmente',
  available: 'disponivel',
  blocked: 'bloqueado',
  expired: 'expirado',
};

function checkpoint<T>(reason: CheckpointReason): R22OfflineMappingResult<T> {
  return { kind: 'checkpoint', reason };
}

// Inspect descriptors before reading values. Accessors and custom coercion
// representations never become sources of canonical facts.
function dataRecord(value: unknown): DataRecord | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return null;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const fields: DataRecord = Object.create(null);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string') return null;
    const descriptor = descriptors[key];
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value'))
      return null;
    fields[key] = descriptor.value;
  }
  return fields;
}

// A detached JSON copy, without JSON.stringify, getters, toJSON or coercion.
function copyJson(
  value: unknown,
  ancestors = new Set<object>(),
): Json | typeof invalidJson {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return value;
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : invalidJson;
  if (typeof value !== 'object' || ancestors.has(value)) return invalidJson;
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return invalidJson;
      const descriptors = Object.getOwnPropertyDescriptors(value);
      const length = Object.getOwnPropertyDescriptor(value, 'length');
      if (
        !length ||
        !Object.hasOwn(length, 'value') ||
        typeof length.value !== 'number'
      )
        return invalidJson;
      const size = length.value;
      if (Reflect.ownKeys(descriptors).length !== size + 1) return invalidJson;
      const result: Json[] = [];
      for (let index = 0; index < size; index++) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !Object.hasOwn(descriptor, 'value'))
          return invalidJson;
        const copied = copyJson(descriptor.value, ancestors);
        if (copied === invalidJson) return invalidJson;
        result.push(copied);
      }
      return result;
    }
    const fields = dataRecord(value);
    if (!fields) return invalidJson;
    const result: { [key: string]: Json } = {};
    for (const [key, field] of Object.entries(fields)) {
      const copied = copyJson(field, ancestors);
      if (copied === invalidJson) return invalidJson;
      Object.defineProperty(result, key, {
        value: copied,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}

function validValues(
  fields: DataRecord,
  separatelyChecked: readonly string[] = [],
): boolean {
  return Object.entries(fields).every(
    ([key, value]) =>
      separatelyChecked.includes(key) ||
      value === undefined ||
      copyJson(value) !== invalidJson,
  );
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function errorFact(fields: DataRecord): 'absent' | CheckpointReason {
  let present = false;
  for (const key of ['errorCode', 'reasonCode', 'errorMessage']) {
    if (fields[key] === undefined) continue;
    if (typeof fields[key] !== 'string') return 'invalid-public-value';
    present = true;
  }
  return present ? 'unsupported-outcome' : 'absent';
}

/** A160-16: inactive projection of an already applied canonical receipt only. */
export function projectR22AppliedSyncReceipt(
  receipt: SyncItemReceipt,
  item: SyncQueueItemRecord,
  identity: R22AppliedReceiptIdentity,
): R22OfflineMappingResult<AppliedReceiptView> {
  try {
    const received = dataRecord(receipt);
    const queued = dataRecord(item);
    const expected = dataRecord(identity);
    if (
      !received ||
      !queued ||
      !expected ||
      !validValues(received, ['context', 'stynx']) ||
      !validValues(queued, ['stynx']) ||
      !validValues(expected)
    )
      return checkpoint('invalid-public-value');
    for (const key of identityFields) {
      if (!text(expected[key]) || !text(queued[key]))
        return checkpoint('invalid-public-value');
      if (expected[key] !== queued[key]) return checkpoint('identity-mismatch');
      if (received[key] !== undefined) {
        if (!text(received[key])) return checkpoint('invalid-public-value');
        if (received[key] !== expected[key])
          return checkpoint('identity-mismatch');
      }
    }
    if (!text(received.queueItemId) || !text(queued.queueItemId))
      return checkpoint('invalid-public-value');
    if (received.queueItemId !== queued.queueItemId)
      return checkpoint('identity-mismatch');
    const statuses = ['pending', 'received', 'applied', 'conflict', 'rejected'];
    if (
      typeof received.status !== 'string' ||
      typeof queued.status !== 'string' ||
      !statuses.includes(received.status) ||
      !statuses.includes(queued.status)
    )
      return checkpoint('invalid-public-value');
    if (received.status !== 'applied' || queued.status !== 'applied')
      return checkpoint('unsupported-outcome');
    const platformRecords: DataRecord[] = [];
    for (const source of [received, queued]) {
      const error = errorFact(source);
      if (error !== 'absent') return checkpoint(error);
      if (source.stynx === undefined) continue;
      const platform = dataRecord(source.stynx);
      if (!platform || platform.version !== 1 || !validValues(platform))
        return checkpoint('invalid-public-value');
      platformRecords.push(platform);
      const platformError = errorFact(platform);
      if (platformError !== 'absent') return checkpoint(platformError);
      if (platform.receiptId !== undefined) {
        if (!text(platform.receiptId))
          return checkpoint('invalid-public-value');
        if (platform.receiptId !== expected.idempotencyKey)
          return checkpoint('identity-mismatch');
      }
      if (
        platform.serverEntityId !== undefined &&
        !text(platform.serverEntityId)
      )
        return checkpoint('invalid-public-value');
    }
    if (received.receiptId !== undefined) {
      if (!text(received.receiptId)) return checkpoint('invalid-public-value');
      if (received.receiptId !== expected.idempotencyKey)
        return checkpoint('identity-mismatch');
    }
    if (received.stynx === undefined)
      return checkpoint('source-fact-unavailable');
    // The first platform record is now necessarily the canonical receipt's.
    const serverEntityId = platformRecords[0].serverEntityId;
    if (serverEntityId === undefined)
      return checkpoint('source-fact-unavailable');
    if (!text(serverEntityId)) return checkpoint('invalid-public-value');
    if (
      platformRecords.some(
        (source) =>
          source.serverEntityId !== undefined &&
          source.serverEntityId !== serverEntityId,
      )
    )
      return checkpoint('identity-mismatch');
    let details: Record<string, unknown> | null = null;
    if (received.context !== undefined) {
      if (!dataRecord(received.context))
        return checkpoint('invalid-public-value');
      const copied = copyJson(received.context);
      if (copied === invalidJson) return checkpoint('invalid-public-value');
      details = copied as Record<string, unknown>;
    }
    return {
      kind: 'mapped',
      value: {
        local_entity_id: queued.localEntityId as string,
        idempotency_key: queued.idempotencyKey as string,
        status: 'applied',
        server_entity_id: serverEntityId,
        error_code: null,
        error_message: null,
        details_json: details,
      },
    };
  } catch {
    return checkpoint('invalid-public-value');
  }
}

/** A160-16: rename one existing consumption entry; no reconciliation or clock. */
export function projectR22NumberingConsumptionEntry(
  entry: NumberingConsumptionEntry,
): R22OfflineMappingResult<ConsumptionView> {
  try {
    const fields = dataRecord(entry);
    if (
      !fields ||
      !validValues(fields) ||
      typeof fields.number !== 'number' ||
      !Number.isSafeInteger(fields.number) ||
      typeof fields.status !== 'string' ||
      !Object.hasOwn(consumptionStatuses, fields.status) ||
      !(
        fields.serverEntityId === null ||
        typeof fields.serverEntityId === 'string'
      ) ||
      !(fields.finalizedAt === null || typeof fields.finalizedAt === 'string')
    )
      return checkpoint('invalid-public-value');
    return {
      kind: 'mapped',
      value: {
        number: fields.number,
        status:
          consumptionStatuses[
            fields.status as NumberingConsumptionEntry['status']
          ],
        server_entity_id: fields.serverEntityId,
        finalized_at: fields.finalizedAt,
      },
    };
  } catch {
    return checkpoint('invalid-public-value');
  }
}
