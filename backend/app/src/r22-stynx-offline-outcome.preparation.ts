type FailureStatus = 'received' | 'rejected' | 'conflict';
type ConflictType = 'domain' | 'concurrency';
type PreparationReason =
  | 'original-code-unavailable'
  | 'invalid-original-data'
  | 'missing-provenance'
  | 'source-identity-mismatch'
  | 'integrity-path-required'
  | 'stored-replay-required';

export interface R22DetachedDomainFailure {
  readonly origin: 'consumer-domain' | 'platform';
  readonly code: string;
  readonly httpStatus?: number;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface R22OutcomeProvenance {
  readonly source: 'failed-item-after-rollback' | 'stored-canonical-receipt';
  readonly tenantId: string;
  readonly auditActorId: string;
  readonly effectiveAgentId: string;
  readonly orgUnitId: string;
  readonly deviceId: string;
  readonly deviceBatchId: string;
  readonly queueItemId: string;
  readonly receiptId: string;
  readonly localEntityId: string;
  readonly idempotencyKey: string | null;
}

export interface R22RecordedFailureReceiptFacts {
  readonly origin: 'consumer-domain' | 'platform';
  readonly provenance: R22OutcomeProvenance;
  readonly status: FailureStatus;
  readonly code: string;
  readonly context?: Readonly<Record<string, unknown>>;
  readonly serverEntityId: string | null;
  readonly terminalReceived?: true;
  readonly retryable?: boolean;
}

export type R22OutcomePreparationResult<T> =
  | { readonly kind: 'prepared'; readonly value: T }
  | { readonly kind: 'protected-platform' }
  | { readonly kind: 'checkpoint'; readonly reason: PreparationReason };

interface LegacyOutcome {
  readonly status: FailureStatus;
  readonly conflictType?: ConflictType | 'integrity';
}
interface PreparedDomainOutcome {
  readonly legacyOutcome: LegacyOutcome;
  readonly candidateOutcome: {
    readonly status: FailureStatus;
    readonly conflict?: {
      readonly type: ConflictType;
      readonly description: string;
    };
  };
  readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly provenance: R22OutcomeProvenance;
}
interface ReceiptView {
  readonly local_entity_id: string | null;
  readonly idempotency_key: string | null;
  readonly status: FailureStatus | 'applied';
  readonly server_entity_id: string | null;
  readonly error_code: string | null;
  readonly error_message: string | null;
  readonly details_json: Record<string, unknown> | null;
}

type DataRecord = Record<string, unknown>;
type Json = null | string | boolean | number | Json[] | { [key: string]: Json };
const invalid = Symbol('invalid-original-data');
const provenanceKeys = [
  'source',
  'tenantId',
  'auditActorId',
  'effectiveAgentId',
  'orgUnitId',
  'deviceId',
  'deviceBatchId',
  'queueItemId',
  'receiptId',
  'localEntityId',
  'idempotencyKey',
] as const;
const receiptKeys = [
  'local_entity_id',
  'idempotency_key',
  'status',
  'server_entity_id',
  'error_code',
  'error_message',
  'details_json',
] as const;

// A160-19 permits these exact consumer vocabulary literals without loading the
// domain's DI-heavy public index. Own-key lookup preserves the unknown fallback.
const outcomes: Readonly<Record<string, LegacyOutcome>> = {
  'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED': { status: 'received' },
  'TEAT.SYNC_DESTINATION_NOT_WIRED': { status: 'received' },
  'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE': { status: 'rejected' },
  'TEAT.SYNC_INTEGRITY_ERROR': {
    status: 'rejected',
    conflictType: 'integrity',
  },
  'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT': {
    status: 'rejected',
    conflictType: 'domain',
  },
  'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED': {
    status: 'rejected',
    conflictType: 'domain',
  },
  'TEAT.NUMBERING_RESERVATION_EXPIRED': {
    status: 'conflict',
    conflictType: 'domain',
  },
  'TEAT.SYNC_ITEM_CONFLICT': { status: 'conflict', conflictType: 'domain' },
  'BOAT.SYNC_DUPLICATE_NATURAL_KEY': { status: 'conflict' },
  'TEAT.SYNC_CONCURRENCY_SUSPECT': {
    status: 'conflict',
    conflictType: 'concurrency',
  },
};
const descriptions: Record<ConflictType, string> = {
  domain: 'Divergência de negócio requer análise.',
  concurrency:
    'Mesmo agente com atos em dispositivos distintos na mesma janela.',
};

function checkpoint<T>(
  reason: PreparationReason,
): R22OutcomePreparationResult<T> {
  return { kind: 'checkpoint', reason };
}

function legalString(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}

function text(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim() && legalString(value);
}

// Reflect on all own descriptors before reading any external data value.
function dataRecord(
  value: unknown,
  keys?: readonly string[],
): DataRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const result: DataRecord = Object.create(null);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (
      typeof key !== 'string' ||
      !legalString(key) ||
      (keys && !keys.includes(key))
    )
      return null;
    const descriptor = descriptors[key];
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value'))
      return null;
    result[key] = descriptor.value;
  }
  return result;
}

function denseArray(value: unknown): unknown[] | null {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype)
    return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const length = Object.getOwnPropertyDescriptor(value, 'length');
  if (
    !length ||
    !Object.hasOwn(length, 'value') ||
    typeof length.value !== 'number'
  )
    return null;
  if (Reflect.ownKeys(descriptors).length !== length.value + 1) return null;
  const result: unknown[] = [];
  for (let index = 0; index < length.value; index++) {
    const descriptor = descriptors[String(index)];
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value'))
      return null;
    result.push(descriptor.value);
  }
  return result;
}

function copyJson(
  value: unknown,
  ancestors = new Set<object>(),
): Json | typeof invalid {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return legalString(value) ? value : invalid;
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : invalid;
  if (typeof value !== 'object' || ancestors.has(value)) return invalid;
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const entries = denseArray(value);
      if (!entries) return invalid;
      const result: Json[] = [];
      for (const entry of entries) {
        const copied = copyJson(entry, ancestors);
        if (copied === invalid) return invalid;
        result.push(copied);
      }
      return result;
    }
    const fields = dataRecord(value);
    if (!fields) return invalid;
    const result: { [key: string]: Json } = {};
    for (const [key, entry] of Object.entries(fields)) {
      const copied = copyJson(entry, ancestors);
      if (copied === invalid) return invalid;
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

function contextCopy(
  value: unknown,
  bounded: boolean,
): Record<string, unknown> | typeof invalid {
  const fields = dataRecord(value);
  if (!fields || (bounded && Object.hasOwn(fields, 'stynx'))) return invalid;
  const copied = copyJson(value);
  if (copied === invalid) return invalid;
  // Only detached legal data reaches serialization; a scalar toJSON key is data.
  if (bounded && Buffer.byteLength(JSON.stringify(copied), 'utf8') > 4096)
    return invalid;
  return copied as Record<string, unknown>;
}

function originalCode(value: unknown): R22OutcomePreparationResult<string> {
  if (value === undefined || (typeof value === 'string' && !value.trim()))
    return checkpoint('original-code-unavailable');
  if (!text(value) || Buffer.byteLength(value, 'utf8') > 255)
    return checkpoint('invalid-original-data');
  return { kind: 'prepared', value };
}

function provenanceCopy(
  value: unknown,
  source: R22OutcomeProvenance['source'],
): R22OutcomePreparationResult<R22OutcomeProvenance> {
  if (value === undefined) return checkpoint('missing-provenance');
  const fields = dataRecord(value, provenanceKeys);
  if (!fields) return checkpoint('invalid-original-data');
  if (provenanceKeys.some((key) => fields[key] === undefined))
    return checkpoint('missing-provenance');
  if (
    !['failed-item-after-rollback', 'stored-canonical-receipt'].includes(
      fields.source as string,
    ) ||
    provenanceKeys.some(
      (key) =>
        key !== 'source' && key !== 'idempotencyKey' && !text(fields[key]),
    ) ||
    !(
      fields.idempotencyKey === null ||
      (typeof fields.idempotencyKey === 'string' &&
        legalString(fields.idempotencyKey))
    )
  )
    return checkpoint('invalid-original-data');
  if (fields.source !== source) return checkpoint('stored-replay-required');
  return {
    kind: 'prepared',
    value: { ...fields } as unknown as R22OutcomeProvenance,
  };
}

/** A160-17: prepare vocabulary only; no rollback, persistence or marker creation. */
export function classifyR22DomainFailure(
  failure: R22DetachedDomainFailure,
  provenance: R22OutcomeProvenance,
): R22OutcomePreparationResult<PreparedDomainOutcome> {
  try {
    const fields = dataRecord(failure, [
      'origin',
      'code',
      'httpStatus',
      'context',
    ]);
    if (
      !fields ||
      !['consumer-domain', 'platform'].includes(fields.origin as string)
    )
      return checkpoint('invalid-original-data');
    if (fields.origin === 'platform') return { kind: 'protected-platform' };
    const original = originalCode(fields.code);
    if (original.kind !== 'prepared') return original;
    const code = original.value;
    if (code.startsWith('OFFLINE_SYNC')) return { kind: 'protected-platform' };
    const observed = provenanceCopy(provenance, 'failed-item-after-rollback');
    if (observed.kind !== 'prepared') return observed;
    const legacy = Object.hasOwn(outcomes, code)
      ? outcomes[code]
      : { status: 'rejected' as const };
    if (legacy.conflictType === 'integrity')
      return checkpoint('integrity-path-required');
    if (
      fields.httpStatus !== undefined &&
      (typeof fields.httpStatus !== 'number' ||
        !Number.isInteger(fields.httpStatus) ||
        fields.httpStatus < 100 ||
        fields.httpStatus > 599)
    )
      return checkpoint('invalid-original-data');
    const context =
      fields.context === undefined
        ? undefined
        : contextCopy(fields.context, true);
    if (context === invalid) return checkpoint('invalid-original-data');
    return {
      kind: 'prepared',
      value: {
        legacyOutcome: { ...legacy },
        candidateOutcome: {
          status: legacy.status,
          ...(legacy.conflictType
            ? {
                conflict: {
                  type: legacy.conflictType,
                  description: descriptions[legacy.conflictType],
                },
              }
            : {}),
        },
        code,
        ...(context === undefined ? {} : { context }),
        provenance: observed.value,
      },
    };
  } catch {
    return checkpoint('invalid-original-data');
  }
}

/** Project recorded facts only; never reclassify or fabricate canonical replay. */
export function projectR22RecordedFailureReceipt(
  facts: R22RecordedFailureReceiptFacts,
  expectedProvenance: R22OutcomeProvenance,
): R22OutcomePreparationResult<ReceiptView> {
  try {
    const fields = dataRecord(facts, [
      'origin',
      'provenance',
      'status',
      'code',
      'context',
      'serverEntityId',
      'terminalReceived',
      'retryable',
    ]);
    if (
      !fields ||
      !['consumer-domain', 'platform'].includes(fields.origin as string)
    )
      return checkpoint('invalid-original-data');
    if (fields.origin === 'platform') return { kind: 'protected-platform' };
    const original = originalCode(fields.code);
    if (original.kind !== 'prepared') return original;
    const code = original.value;
    if (code.startsWith('OFFLINE_SYNC')) return { kind: 'protected-platform' };
    const observed = provenanceCopy(
      fields.provenance,
      'stored-canonical-receipt',
    );
    if (observed.kind !== 'prepared') return observed;
    const expected = provenanceCopy(
      expectedProvenance,
      'stored-canonical-receipt',
    );
    if (expected.kind !== 'prepared') return expected;
    if (
      provenanceKeys.some((key) => observed.value[key] !== expected.value[key])
    )
      return checkpoint('source-identity-mismatch');
    if (code === 'TEAT.SYNC_INTEGRITY_ERROR')
      return checkpoint('integrity-path-required');
    if (
      !['received', 'rejected', 'conflict'].includes(fields.status as string) ||
      !(
        fields.serverEntityId === null ||
        (typeof fields.serverEntityId === 'string' &&
          legalString(fields.serverEntityId))
      ) ||
      (fields.retryable !== undefined &&
        typeof fields.retryable !== 'boolean') ||
      (fields.terminalReceived !== undefined &&
        !(
          fields.terminalReceived === true &&
          fields.status === 'received' &&
          fields.retryable === false
        ))
    )
      return checkpoint('invalid-original-data');
    const context =
      fields.context === undefined ? null : contextCopy(fields.context, true);
    if (context === invalid) return checkpoint('invalid-original-data');
    return {
      kind: 'prepared',
      value: {
        local_entity_id: observed.value.localEntityId,
        idempotency_key: observed.value.idempotencyKey,
        status: fields.status as FailureStatus,
        server_entity_id: fields.serverEntityId as string | null,
        error_code: code,
        error_message: null,
        details_json: context,
      },
    };
  } catch {
    return checkpoint('invalid-original-data');
  }
}

/** Schema-only count over projected receipts; this does not certify their facts. */
export function countR22AcceptedReceipts(
  receipts: readonly ReceiptView[],
): R22OutcomePreparationResult<number> {
  try {
    const entries = denseArray(receipts);
    if (!entries) return checkpoint('invalid-original-data');
    let accepted = 0;
    for (const entry of entries) {
      const fields = dataRecord(entry, receiptKeys);
      if (
        !fields ||
        receiptKeys.some((key) => !Object.hasOwn(fields, key)) ||
        !['applied', 'received', 'rejected', 'conflict'].includes(
          fields.status as string,
        ) ||
        receiptKeys.some(
          (key) =>
            key !== 'status' &&
            key !== 'details_json' &&
            !(
              fields[key] === null ||
              (typeof fields[key] === 'string' &&
                legalString(fields[key] as string))
            ),
        ) ||
        (fields.details_json !== null &&
          contextCopy(fields.details_json, false) === invalid)
      )
        return checkpoint('invalid-original-data');
      if (fields.status !== 'rejected' && fields.status !== 'conflict')
        accepted++;
    }
    return { kind: 'prepared', value: accepted };
  } catch {
    return checkpoint('invalid-original-data');
  }
}
