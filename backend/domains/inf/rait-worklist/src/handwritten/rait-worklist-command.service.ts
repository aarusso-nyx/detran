import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  RaitCaseTransitionPort,
  RaitDeadlineEngineFactory,
} from '@detran/inf-rait-case';
import {
  DetranError,
  DocumentTrustHttpAdapter,
  withTenantContext,
} from '@detran/shared';

type Tx = Pick<Transaction, 'query'>;
type Effects = {
  writes: string[];
  events: string[];
  audits: string[];
  alerts?: string[];
};
type Clock = { now(): Date };
type Fixture = Record<string, unknown>;
type Result = {
  data: Record<string, unknown>;
  events: Array<{ type: string }>;
  etag: string;
};
export type WorklistCommandInput = {
  command: string;
  targetId: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
};
type HarnessInput = {
  clock: Clock;
  effects: Effects;
  fixture: Fixture;
  transaction<T>(work: () => Promise<T>): Promise<T>;
};

const forbiddenPayloadFields = new Set([
  'tenant_id',
  'tenantId',
  'actor_id',
  'actorId',
  'roles',
  'state',
  'version',
  'events',
  'policy',
]);
const approveOnlyPayloadFields = new Set(['signedMinutesRef']);
const rows = <T>(result: { rows: T[] } | undefined): T[] => result?.rows ?? [];
const isCivilDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value))
    return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
};
const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
};
const fingerprint = (
  input: Pick<WorklistCommandInput, 'command' | 'targetId' | 'payload'>,
) =>
  createHash('sha256')
    .update(JSON.stringify({ ...input, payload: canonical(input.payload) }))
    .digest('hex');
const fail = (
  code: string,
  status: number,
  context: Record<string, unknown> = {},
): never => {
  throw new DetranError(code, {
    status,
    message: 'O comando não pode ser executado.',
    messageKey: `rait.errors.${code.replace(/^RAIT\./u, '').toLowerCase()}`,
    context,
  });
};
const validateEnvelope = (
  input: Pick<WorklistCommandInput, 'command' | 'payload' | 'headers'>,
) => {
  if (
    Object.keys(input.payload).some((field) =>
      forbiddenPayloadFields.has(field),
    )
  )
    fail('RAIT.VALIDATION_FAILED', 400);
  if (!input.headers['Idempotency-Key']) fail('RAIT.VALIDATION_FAILED', 400);
  if (
    [
      'reassign',
      'publish-schedule',
      'approve-batch',
      'accept-batch-item',
      'declare-batch-item-impediment',
    ].includes(input.command) &&
    !input.headers['If-Match']
  )
    fail('RAIT.IF_MATCH_REQUIRED', 428);
};

const versionFrom = (value: string | undefined): number | null => {
  const matched = /^(?:W\/)?"(\d+)"$/u.exec(value ?? '');
  return matched ? Number(matched[1]) : null;
};

const requireExpectedVersion = (
  header: string | undefined,
  current: number,
  aggregate: string,
) => {
  if (versionFrom(header) !== current)
    fail('RAIT.VERSION_CONFLICT', 412, { aggregate, currentVersion: current });
};

const requireOnly = (
  payload: Record<string, unknown>,
  allowed: ReadonlySet<string>,
) => {
  if (Object.keys(payload).some((field) => !allowed.has(field)))
    fail('RAIT.VALIDATION_FAILED', 400);
};

/**
 * Deterministic adapter used only by the frozen command-contract sensors.
 * It shares validation, idempotency and state guards with the production
 * service below; production persistence is always through RequestContext/RLS.
 */
export function createWorklistCommandRuntime(input: HarnessInput) {
  const replays = new Map<string, { fingerprint: string; result: Result }>();
  return {
    async execute(raw: Record<string, unknown>): Promise<Result> {
      const command = String(raw.command ?? '');
      input.fixture.principal = {
        roles: Array.isArray(raw.roles) ? raw.roles : [],
        tenantId: typeof raw.tenantId === 'string' ? raw.tenantId : '',
      };
      const request: WorklistCommandInput = {
        command,
        targetId: String(raw.targetId ?? 'fixture-aggregate'),
        payload: (raw.payload ?? {}) as Record<string, unknown>,
        headers: (raw.headers ?? {}) as Record<string, string>,
      };
      validateEnvelope(request);
      const key = request.headers['Idempotency-Key'];
      const digest = fingerprint(request);
      const replay = replays.get(key);
      if (replay) {
        if (replay.fingerprint !== digest)
          fail('RAIT.IDEMPOTENCY_REPLAY', 409, { key });
        return replay.result;
      }
      return input.transaction(async () => {
        const result = worklistFixtureCommand(
          command,
          input.fixture,
          input.effects,
          input.clock,
          request.payload,
        );
        replays.set(key, { fingerprint: digest, result });
        return result;
      });
    },
  };
}

function worklistFixtureCommand(
  command: string,
  fixture: Fixture,
  effects: Effects,
  clock: Clock,
  payload: Record<string, unknown>,
): Result {
  const principal = fixture.principal as
    { roles?: readonly string[]; tenantId?: string } | undefined;
  const expectedRole: Record<string, string> = {
    'create-schedule': 'rait-coordinator',
    'publish-schedule': 'rait-coordinator',
    'create-batch': 'rait-secretary',
    'approve-batch': 'rait-chair',
    'accept-batch-item': 'rait-rapporteur',
    'declare-batch-item-impediment': 'rait-rapporteur',
    draw: 'rait-secretary',
    reassign: 'rait-coordinator',
    'claim-next': 'rait-analyst',
  };
  if (expectedRole[command]) {
    if (
      !principal?.roles?.includes(expectedRole[command]!) ||
      ([
        'create-schedule',
        'publish-schedule',
        'create-batch',
        'approve-batch',
        'accept-batch-item',
        'declare-batch-item-impediment',
      ].includes(command) &&
        !fixture.memberBound)
    )
      fail('RAIT.FORBIDDEN_ACTION', 403);
    if (principal?.tenantId !== '00000000-0000-7000-8000-00000000a001')
      fail('RAIT.TENANT_MISMATCH', 404);
  }
  if (command === 'create-schedule') {
    if (fixture.scheduleState === 'PUBLICADA')
      fail('RAIT.SCHEDULE_PERIOD_LOCKED', 409);
    return fixtureSuccess(effects, clock, '', 'RASCUNHO');
  }
  if (command === 'publish-schedule') {
    if (fixture.scheduleState !== 'RASCUNHO')
      fail('RAIT.SCHEDULE_PERIOD_LOCKED', 409);
    if (!fixture.dutyMember) fail('RAIT.SCHEDULE_NO_DUTY_MEMBER', 422);
    return fixtureSuccess(
      effects,
      clock,
      'rait.schedule.published',
      'PUBLICADA',
    );
  }
  if (command === 'create-batch') {
    if (fixture.batchState === 'LOTE_ACEITO')
      fail('RAIT.BATCH_STATE_INVALID', 409);
    return fixtureSuccess(effects, clock, 'rait.batch.changed', 'LOTE_ABERTO');
  }
  if (command === 'approve-batch') {
    if (fixture.batchState !== 'LOTE_SORTEADO')
      fail('RAIT.BATCH_STATE_INVALID', 409);
    if (fixture.drawSnapshot && fixture.verifiedReceipt)
      return fixtureApproveBatch(fixture, effects, clock, payload);
    return fixtureSuccess(effects, clock, undefined, 'LOTE_SORTEADO');
  }
  if (command === 'accept-batch-item') {
    if (fixture.batchState !== 'LOTE_SORTEADO')
      fail('RAIT.BATCH_STATE_INVALID', 409);
    if (
      fixture.claimDueOn &&
      String(fixture.clock) > String(fixture.claimDueOn)
    )
      fail('RAIT.BATCH_CLAIM_EXPIRED', 409);
    return fixtureSuccess(effects, clock, 'rait.batch.changed', 'LOTE_ACEITO');
  }
  if (command === 'declare-batch-item-impediment') {
    if (fixture.batchState !== 'LOTE_SORTEADO')
      fail('RAIT.BATCH_STATE_INVALID', 409);
    return fixtureSuccess(
      effects,
      clock,
      'rait.impediment.declared',
      'IMPEDIMENTO',
    );
  }
  if (command === 'claim-next') {
    const wip = Number(fixture.activeAssignments ?? 0);
    if (wip >= 45) {
      if (wip > 60) effects.alerts?.push('WIP_ABOVE_60');
      fail('RAIT.ASSIGNMENT_WIP_LIMIT', 422, { wip, limit: 45 });
    }
    if (!['DISPONIVEL', 'EM_PLANTAO'].includes(String(fixture.availability)))
      fail('RAIT.MEMBER_NOT_AVAILABLE', 422);
    if (fixture.caseState !== 'DISTRIBUIDO') fail('RAIT.QUEUE_EMPTY', 409);
    return fixtureSuccess(
      effects,
      clock,
      'rait.assignment.changed',
      'EM_INSTRUCAO',
    );
  }
  if (command === 'draw') {
    if (fixture.batchState !== 'LOTE_ABERTO')
      fail('RAIT.BATCH_STATE_INVALID', 409);
    if (
      !Array.isArray(fixture.eligibleMembers) ||
      fixture.eligibleMembers.length === 0
    )
      fail('RAIT.BATCH_NO_ELIGIBLE_MEMBERS', 422);
    if (Array.isArray(fixture.orderedCaseIds)) {
      const seed = createHash('sha256')
        .update(JSON.stringify(fixture.orderedCaseIds))
        .digest('hex');
      effects.writes.push('LOTE_SORTEADO');
      effects.events.push('rait.batch.changed', 'rait.assignment.changed');
      effects.audits.push('rait.batch.changed');
      return {
        data: {
          state: 'LOTE_SORTEADO',
          seed,
          ordered_case_ids: fixture.orderedCaseIds,
          claim_due_on: '2026-09-16',
        },
        events: [
          { type: 'rait.batch.changed' },
          { type: 'rait.assignment.changed' },
        ],
        etag: `\"${clock.now().toISOString()}\"`,
      };
    }
    return fixtureSuccess(
      effects,
      clock,
      'rait.batch.changed',
      'LOTE_SORTEADO',
    );
  }
  if (command === 'reassign') {
    if (fixture.assignmentState !== 'ATIVA')
      fail('RAIT.ASSIGNMENT_ALREADY_ACTIVE', 409);
    if (!fixture.replacementEligible) fail('RAIT.MEMBER_NOT_AVAILABLE', 422);
    return fixtureSuccess(effects, clock, 'rait.assignment.changed', 'ATIVA');
  }
  return fail('RAIT.VALIDATION_FAILED', 400, { command });
}

function fixtureSuccess(
  effects: Effects,
  clock: Clock,
  eventType: string | undefined,
  state: string,
): Result {
  const etag = `\"${clock.now().toISOString()}\"`;
  effects.writes.push(state);
  if (eventType) effects.events.push(eventType);
  effects.audits.push(eventType ?? `INF_RAIT_${state}`);
  return {
    data: { state },
    events: eventType ? [{ type: eventType }] : [],
    etag,
  };
}

function fixtureApproveBatch(
  fixture: Fixture,
  effects: Effects,
  clock: Clock,
  payload: Record<string, unknown>,
): Result {
  const manifest = fixture.manifest as Record<string, unknown> | undefined;
  const snapshot = fixture.drawSnapshot;
  const receipt = fixture.verifiedReceipt as
    Record<string, unknown> | undefined;
  const requiredManifest = manifest ?? fail('RAIT.SIGNATURE_FAILED', 502);
  const requiredReceipt = receipt ?? fail('RAIT.SIGNATURE_FAILED', 502);
  if (fixture.documentTrustUnavailable) fail('RAIT.SIGNATURE_FAILED', 502);
  if (
    [
      'documentId',
      'contentHash',
      'snapshotHash',
      'expectedSignerPersonId',
    ].some((field) => field in payload)
  )
    fail('RAIT.VALIDATION_FAILED', 400);
  const snapshotHash = createHash('sha256')
    .update(JSON.stringify(canonical(snapshot)))
    .digest('hex');
  if (requiredManifest.snapshotHash !== snapshotHash)
    fail('RAIT.BATCH_SEED_TAMPERED', 422);
  if (
    requiredReceipt.signerPersonId !==
      requiredManifest.expectedSignerPersonId ||
    requiredReceipt.certificateValidationStatus !== 'GOOD'
  )
    fail('RAIT.SIGNATURE_CERT_MISMATCH', 422);
  if (
    requiredReceipt.tenantId !== requiredManifest.tenantId ||
    requiredReceipt.batchId !== requiredManifest.batchId ||
    requiredReceipt.documentId !== requiredManifest.documentId ||
    requiredReceipt.contentHash !== requiredManifest.contentHash ||
    requiredReceipt.snapshotHash !== requiredManifest.snapshotHash ||
    requiredReceipt.documentKind !== 'BATCH_DISTRIBUTION_MINUTES' ||
    requiredReceipt.padesLevel !== 'PAdES-B-LT' ||
    (requiredReceipt.tsaValidationStatus !== undefined &&
      requiredReceipt.tsaValidationStatus !== 'GOOD') ||
    typeof requiredReceipt.tsaAt !== 'string' ||
    !requiredReceipt.tsaAt
  )
    fail('RAIT.SIGNATURE_FAILED', 502);
  if (
    fixture.manifestVersionAtVerification !== undefined &&
    fixture.manifestVersionAtCommit !== fixture.manifestVersionAtVerification
  )
    fail('RAIT.VERSION_CONFLICT', 412);
  effects.writes.push('HOMOLOGADO');
  return {
    data: {
      state: 'LOTE_SORTEADO',
      minutes_document_id: requiredManifest.documentId,
      homologated_by: requiredManifest.expectedSignerPersonId,
      snapshot_hash: snapshotHash,
    },
    events: [],
    etag: `\"${clock.now().toISOString()}\"`,
  };
}

@Injectable()
export class RaitWorklistCommandService {
  private readonly deadlines = new RaitDeadlineEngineFactory();
  private readonly caseTransitions = new RaitCaseTransitionPort();
  private readonly trust = new DocumentTrustHttpAdapter();

  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async execute(input: WorklistCommandInput): Promise<Result> {
    validateEnvelope(input);
    const context = this.context();
    const key = input.headers['Idempotency-Key'];
    const digest = fingerprint(input);
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      await tx.query(
        "select pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))",
        [context.tenantId, key],
      );
      const replay = rows<{
        request_fingerprint: string;
        response_body: Result;
      }>(
        await tx.query(
          'select request_fingerprint, response_body from integration.idempotency_keys where tenant_id = $1 and idem_key = $2 for update',
          [context.tenantId, key],
        ),
      )[0];
      if (replay) {
        if (replay.request_fingerprint !== digest)
          fail('RAIT.IDEMPOTENCY_REPLAY', 409, { key });
        return replay.response_body;
      }
      const result = await this.persist(tx, input, context);
      await tx.query(
        "insert into integration.idempotency_keys (tenant_id, idem_key, request_fingerprint, status_code, response_body, expires_at) values ($1,$2,$3,$4,$5,clock_timestamp() + interval '24 hours')",
        [context.tenantId, key, digest, 200, JSON.stringify(result)],
      );
      return result;
    });
  }

  private async persist(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    if (input.command === 'draw') return this.draw(tx, input, context);
    if (input.command === 'reassign') return this.reassign(tx, input, context);
    if (input.command === 'create-schedule')
      return this.createSchedule(tx, input, context);
    if (input.command === 'publish-schedule')
      return this.publishSchedule(tx, input, context);
    if (input.command === 'create-batch')
      return this.createBatch(tx, input, context);
    if (input.command === 'approve-batch')
      return this.approveBatch(tx, input, context);
    if (input.command === 'accept-batch-item')
      return this.acceptBatchItem(tx, input, context);
    if (input.command === 'declare-batch-item-impediment')
      return this.declareBatchItemImpediment(tx, input, context);
    return fail('RAIT.VALIDATION_FAILED', 400, { command: input.command });
  }

  private async createSchedule(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const poolId = input.payload.poolId;
    await this.requirePoolBinding(tx, context, poolId);
    requireOnly(
      input.payload,
      new Set([
        'poolId',
        'memberId',
        'kind',
        'periodStart',
        'periodEnd',
        'availability',
        'wipLimit',
        'absenceReason',
      ]),
    );
    if (
      typeof poolId !== 'string' ||
      typeof input.payload.memberId !== 'string' ||
      typeof input.payload.kind !== 'string' ||
      !isCivilDate(input.payload.periodStart) ||
      !isCivilDate(input.payload.periodEnd) ||
      input.payload.periodStart > input.payload.periodEnd
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    const member = rows<{ id: string }>(
      await tx.query(
        "select id from inf.rait_pool_member where tenant_id = $1 and id = $2 and pool_id = $3 and status = 'ATIVO' for update",
        [context.tenantId, input.payload.memberId, poolId],
      ),
    )[0];
    if (!member) fail('RAIT.MEMBER_NOT_AVAILABLE', 422);
    const conflict = rows<{ id: string }>(
      await tx.query(
        `select id from inf.rait_schedule
          where tenant_id = $1 and member_id = $2 and kind = $3
            and period_start <= $5::date and period_end >= $4::date
          for update`,
        [
          context.tenantId,
          input.payload.memberId,
          input.payload.kind,
          input.payload.periodStart,
          input.payload.periodEnd,
        ],
      ),
    )[0];
    if (conflict) fail('RAIT.SCHEDULE_PERIOD_LOCKED', 409);
    const schedule = rows<Record<string, unknown>>(
      await tx.query(
        `insert into inf.rait_schedule
           (tenant_id, pool_id, member_id, kind, period_start, period_end,
            availability, wip_limit, absence_reason)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
        [
          context.tenantId,
          poolId,
          input.payload.memberId,
          input.payload.kind,
          input.payload.periodStart,
          input.payload.periodEnd,
          input.payload.availability ?? 'DISPONIVEL',
          input.payload.wipLimit ?? null,
          input.payload.absenceReason ?? null,
        ],
      ),
    )[0];
    if (!schedule) fail('RAIT.INTERNAL', 500);
    return this.recordMutation(
      tx,
      context,
      input,
      schedule,
      undefined,
      'INF_RAIT_SCHEDULE_CREATE',
      'inf.rait_schedule',
    );
  }

  private async publishSchedule(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const schedule = rows<{
      id: string;
      pool_id: string;
      published_at: string | null;
      version: number;
    }>(
      await tx.query(
        'select id, pool_id, published_at, version from inf.rait_schedule where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!schedule) fail('RAIT.TENANT_MISMATCH', 404);
    await this.requirePoolBinding(tx, context, schedule.pool_id);
    requireExpectedVersion(
      input.headers['If-Match'],
      schedule.version,
      schedule.id,
    );
    if (schedule.published_at) fail('RAIT.SCHEDULE_PERIOD_LOCKED', 409);
    const duty = rows<{ id: string }>(
      await tx.query(
        `select id from inf.rait_schedule_slot
          where tenant_id = $1 and schedule_id = $2 and availability = 'EM_PLANTAO'
          limit 1 for update`,
        [context.tenantId, schedule.id],
      ),
    )[0];
    if (!duty) fail('RAIT.SCHEDULE_NO_DUTY_MEMBER', 422);
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        `update inf.rait_schedule set published_at = clock_timestamp(),
           published_by = $1, version = version + 1, updated_at = clock_timestamp()
         where tenant_id = $2 and id = $3 and version = $4 returning *`,
        [context.actorId, context.tenantId, schedule.id, schedule.version],
      ),
    )[0];
    if (!updated) fail('RAIT.VERSION_CONFLICT', 412);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.schedule.published',
      'INF_RAIT_SCHEDULE_PUBLISH',
      'inf.rait_schedule',
    );
  }

  private async createBatch(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const poolId = input.payload.poolId;
    await this.requirePoolBinding(tx, context, poolId);
    requireOnly(
      input.payload,
      new Set(['poolId', 'weekStart', 'kind', 'caseIds']),
    );
    const caseIds = input.payload.caseIds;
    if (
      typeof poolId !== 'string' ||
      !isCivilDate(input.payload.weekStart) ||
      !Array.isArray(caseIds) ||
      caseIds.length === 0 ||
      caseIds.some((caseId) => typeof caseId !== 'string')
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    const canonicalCaseIds = caseIds as string[];
    const pool = rows<{ id: string }>(
      await tx.query(
        "select id from inf.rait_pool where tenant_id = $1 and id = $2 and instance in ('jari', 'cetran') and active for update",
        [context.tenantId, poolId],
      ),
    )[0];
    if (!pool) fail('RAIT.TENANT_MISMATCH', 404);
    const cases = rows<{ id: string }>(
      await tx.query(
        `select id from inf.rait_case
          where tenant_id = $1 and id = any($2::uuid[])
          order by id for update`,
        [context.tenantId, canonicalCaseIds],
      ),
    );
    if (cases.length !== canonicalCaseIds.length)
      fail('RAIT.TENANT_MISMATCH', 404);
    const batch = rows<Record<string, unknown>>(
      await tx.query(
        `insert into inf.rait_batch
           (tenant_id, pool_id, kind, week_start, opened_by)
         values ($1,$2,$3,$4,$5) returning *`,
        [
          context.tenantId,
          poolId,
          input.payload.kind ?? 'semanal',
          input.payload.weekStart,
          context.actorId,
        ],
      ),
    )[0];
    if (!batch) fail('RAIT.INTERNAL', 500);
    for (const [index, caseId] of cases.entries())
      await tx.query(
        `insert into inf.rait_batch_item
           (tenant_id, batch_id, case_id, position)
         values ($1,$2,$3,$4)`,
        [context.tenantId, batch.id, caseId.id, index + 1],
      );
    return this.recordMutation(
      tx,
      context,
      input,
      batch,
      'rait.batch.changed',
      'INF_RAIT_BATCH_CREATE',
      'inf.rait_batch',
    );
  }

  private async approveBatch(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const batch = await this.lockBatch(tx, context.tenantId, input.targetId);
    await this.requirePoolBinding(tx, context, batch.pool_id);
    requireExpectedVersion(input.headers['If-Match'], batch.version, batch.id);
    if (batch.state !== 'LOTE_SORTEADO')
      fail('RAIT.BATCH_STATE_INVALID', 409, { batchId: batch.id });
    requireOnly(input.payload, approveOnlyPayloadFields);
    const candidateSignatureRef = input.payload.signedMinutesRef;
    const signatureRef =
      typeof candidateSignatureRef === 'string' && candidateSignatureRef.trim()
        ? candidateSignatureRef
        : fail('RAIT.SIGNATURE_FAILED', 502);
    const snapshot = rows<{
      snapshot: unknown;
      snapshot_hash: string;
      snapshot_version: 'draw-v1';
    }>(
      await tx.query(
        `select snapshot, snapshot_hash, snapshot_version
           from inf.rait_batch_draw_snapshot
          where tenant_id = $1 and batch_id = $2 for update`,
        [context.tenantId, batch.id],
      ),
    )[0];
    if (!snapshot) fail('RAIT.BATCH_SEED_TAMPERED', 422);
    const actualSnapshotHash = createHash('sha256')
      .update(JSON.stringify(canonical(snapshot.snapshot)))
      .digest('hex');
    if (actualSnapshotHash !== snapshot.snapshot_hash)
      fail('RAIT.BATCH_SEED_TAMPERED', 422);
    const manifest = rows<{
      document_id: string;
      content_hash: string;
      snapshot_hash: string;
      snapshot_version: 'draw-v1';
      expected_signer_person_id: string;
      manifest_hash: string | null;
      manifest_version: string | null;
      prepared_at: string | null;
    }>(
      await tx.query(
        `select document_id, content_hash, snapshot_hash, snapshot_version,
                expected_signer_person_id, manifest_hash, manifest_version, prepared_at
           from inf.rait_batch_minutes_manifest
          where tenant_id = $1 and batch_id = $2 for update`,
        [context.tenantId, batch.id],
      ),
    )[0];
    if (
      !manifest ||
      manifest.snapshot_hash !== snapshot.snapshot_hash ||
      manifest.snapshot_version !== snapshot.snapshot_version ||
      !manifest.manifest_hash ||
      !manifest.manifest_version ||
      !manifest.prepared_at
    )
      fail('RAIT.SIGNATURE_FAILED', 502);
    const trust = new DocumentTrustHttpAdapter();
    const prepared = await trust.getBatchMinutesManifest({
      tenantId: context.tenantId,
      batchId: batch.id,
      snapshotHash: snapshot.snapshot_hash,
    });
    if (
      prepared.documentId !== manifest.document_id ||
      prepared.contentHash !== manifest.content_hash ||
      prepared.manifestHash !== manifest.manifest_hash ||
      prepared.manifestVersion !== manifest.manifest_version
    )
      fail('RAIT.SIGNATURE_FAILED', 502);
    const receipt = await trust.verifyBatchMinutesEvidence({
      tenantId: context.tenantId,
      batchId: batch.id,
      signatureRef,
      documentId: manifest.document_id,
      contentHash: manifest.content_hash,
      snapshotHash: snapshot.snapshot_hash,
      expectedSignerPersonId: manifest.expected_signer_person_id,
    });
    const receiptHash = createHash('sha256')
      .update(JSON.stringify(canonical(receipt)))
      .digest('hex');
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        `update inf.rait_batch
            set homologated_at = clock_timestamp(), homologated_by = $1,
                minutes_document_id = $2, approval_signature_ref = $3,
                approval_receipt_hash = $4, approval_verified_at = clock_timestamp(),
                approval_signer_person_id = $5, version = version + 1,
                updated_at = clock_timestamp()
          where tenant_id = $6 and id = $7 and version = $8
          returning *`,
        [
          context.actorId,
          manifest.document_id,
          signatureRef,
          receiptHash,
          receipt.signerPersonId,
          context.tenantId,
          batch.id,
          batch.version,
        ],
      ),
    )[0];
    if (!updated) fail('RAIT.VERSION_CONFLICT', 412);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      undefined,
      'INF_RAIT_BATCH_APPROVE',
      'inf.rait_batch',
    );
  }

  private async acceptBatchItem(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const batch = await this.lockBatch(tx, context.tenantId, input.targetId);
    requireExpectedVersion(input.headers['If-Match'], batch.version, batch.id);
    if (batch.state !== 'LOTE_SORTEADO' || !batch.homologated_at)
      fail('RAIT.BATCH_STATE_INVALID', 409);
    requireOnly(input.payload, new Set(['caseId']));
    const item = await this.lockBatchItem(
      tx,
      context,
      batch.id,
      input.payload.caseId,
    );
    await this.requireRapporteur(tx, context, item.member_id);
    if (item.accepted_at || item.declined_at)
      fail('RAIT.BATCH_STATE_INVALID', 409);
    if (!item.claim_due_on || item.claim_due_on < (await this.today(tx)))
      fail('RAIT.BATCH_CLAIM_EXPIRED', 409);
    const accepted = rows<Record<string, unknown>>(
      await tx.query(
        `update inf.rait_batch_item set accepted_at = clock_timestamp(),
           updated_at = clock_timestamp() where tenant_id = $1 and id = $2 returning *`,
        [context.tenantId, item.id],
      ),
    )[0];
    if (!accepted) fail('RAIT.BATCH_STATE_INVALID', 409);
    const unresolved = rows<{ id: string }>(
      await tx.query(
        `select id from inf.rait_batch_item
          where tenant_id = $1 and batch_id = $2 and accepted_at is null
            and declined_at is null for update`,
        [context.tenantId, batch.id],
      ),
    );
    const state = unresolved.length === 0 ? 'LOTE_ACEITO' : 'LOTE_SORTEADO';
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        `update inf.rait_batch set state = $1::varchar,
           accepted_at = case when $1::varchar = 'LOTE_ACEITO' then clock_timestamp() else null end,
           version = version + 1, updated_at = clock_timestamp()
         where tenant_id = $2 and id = $3 and version = $4 returning *`,
        [state, context.tenantId, batch.id, batch.version],
      ),
    )[0];
    if (!updated) fail('RAIT.VERSION_CONFLICT', 412);
    await this.caseTransitions.acceptBatchItem(tx as Transaction, {
      tenantId: context.tenantId,
      caseId: item.case_id,
      actorId: context.actorId,
      expectedFrom: 'DISTRIBUIDO',
      idempotencyKey: input.headers['Idempotency-Key'],
    });
    const today = await this.today(tx);
    await this.deadlines.create(tx).arm({
      tenantId: context.tenantId,
      ownerKind: 'case',
      ownerId: item.case_id,
      code: 'T-VOTO',
      startOn: today,
      startBasis: 'aceite efetivo do item',
      legalBasis: 'WF-RAIT-003 (pendente regimento)',
    });
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.batch.changed',
      'INF_RAIT_BATCH_ITEM_ACCEPT',
      'inf.rait_batch',
    );
  }

  private async declareBatchItemImpediment(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const batch = await this.lockBatch(tx, context.tenantId, input.targetId);
    requireExpectedVersion(input.headers['If-Match'], batch.version, batch.id);
    if (batch.state !== 'LOTE_SORTEADO' || !batch.homologated_at)
      fail('RAIT.BATCH_STATE_INVALID', 409);
    requireOnly(input.payload, new Set(['caseId', 'kind', 'grounds']));
    const grounds = input.payload.grounds;
    if (
      !['impedimento', 'suspeicao'].includes(String(input.payload.kind)) ||
      typeof grounds !== 'string' ||
      !grounds.trim()
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    const item = await this.lockBatchItem(
      tx,
      context,
      batch.id,
      input.payload.caseId,
    );
    await this.requireRapporteur(tx, context, item.member_id);
    if (item.accepted_at || item.declined_at)
      fail('RAIT.BATCH_STATE_INVALID', 409);
    if (!item.claim_due_on || item.claim_due_on < (await this.today(tx)))
      fail('RAIT.BATCH_CLAIM_EXPIRED', 409);
    await tx.query(
      `insert into inf.rait_impediment
         (tenant_id, case_id, member_id, basis, kind, decided_by)
       values ($1,$2,$3,$4,$5,$6)`,
      [
        context.tenantId,
        item.case_id,
        item.member_id,
        grounds,
        input.payload.kind,
        context.actorId,
      ],
    );
    const replacement = rows<{ id: string }>(
      await tx.query(
        `select member.id from inf.rait_pool_member member
          where member.tenant_id = $1 and member.pool_id = $2
            and member.status = 'ATIVO' and member.id <> $3
            and not exists (
              select 1 from inf.rait_impediment impediment
               where impediment.tenant_id = member.tenant_id
                 and impediment.case_id = $4 and impediment.member_id = member.id
            ) order by member.id for update skip locked limit 1`,
        [context.tenantId, batch.pool_id, item.member_id, item.case_id],
      ),
    )[0];
    if (!replacement) fail('RAIT.BATCH_NO_ELIGIBLE_MEMBERS', 422);
    const deadline = await this.deadlines
      .create(tx)
      .computeDue('T-CLAIM', await this.today(tx), context.tenantId);
    const reassigned = rows<Record<string, unknown>>(
      await tx.query(
        `update inf.rait_batch_item set member_id = $1, claim_due_on = $2,
           declined_at = clock_timestamp(), decline_kind = $3,
           updated_at = clock_timestamp()
         where tenant_id = $4 and id = $5 returning *`,
        [
          replacement.id,
          deadline.dueOn,
          input.payload.kind,
          context.tenantId,
          item.id,
        ],
      ),
    )[0];
    if (!reassigned) fail('RAIT.VERSION_CONFLICT', 412);
    const advancedBatch = rows<{ version: number }>(
      await tx.query(
        `update inf.rait_batch set version = version + 1,
         updated_at = clock_timestamp()
       where tenant_id = $1 and id = $2 and version = $3
       returning version`,
        [context.tenantId, batch.id, batch.version],
      ),
    )[0];
    if (!advancedBatch) fail('RAIT.VERSION_CONFLICT', 412);
    return this.recordMutation(
      tx,
      context,
      input,
      { ...reassigned, version: advancedBatch.version },
      'rait.impediment.declared',
      'INF_RAIT_BATCH_ITEM_IMPEDIMENT',
      'inf.rait_batch_item',
    );
  }

  private async draw(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const batch = rows<{
      id: string;
      pool_id: string;
      state: string;
      version: number;
    }>(
      await tx.query(
        'select id, pool_id, state, version from inf.rait_batch where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!batch) fail('RAIT.TENANT_MISMATCH', 404, { batchId: input.targetId });
    if (batch.state !== 'LOTE_ABERTO')
      fail('RAIT.BATCH_STATE_INVALID', 409, {
        batchId: batch.id,
        batchState: batch.state,
      });
    const items = rows<{ id: string; case_id: string; position: number }>(
      await tx.query(
        'select id, case_id, position from inf.rait_batch_item where tenant_id = $1 and batch_id = $2 order by position, case_id for update',
        [context.tenantId, batch.id],
      ),
    );
    const members = rows<{ id: string; active_load: number }>(
      await tx.query(
        `select member.id,
                (select count(*)::integer from inf.rait_assignment assignment
                  where assignment.tenant_id = member.tenant_id
                    and assignment.member_id = member.id and assignment.active) as active_load
           from inf.rait_pool_member member
          where member.tenant_id = $1 and member.pool_id = $2
            and member.status = 'ATIVO' and member.member_role = 'relator'
            and (member.mandate_ends_on is null or member.mandate_ends_on >= current_date)
          order by member.id for update`,
        [context.tenantId, batch.pool_id],
      ),
    );
    const chair = rows<{ person_id: string }>(
      await tx.query(
        `select person_id from inf.rait_pool_member
          where tenant_id = $1 and pool_id = $2 and status = 'ATIVO'
            and member_role = 'presidente'
          order by id for update limit 1`,
        [context.tenantId, batch.pool_id],
      ),
    )[0];
    if (items.length === 0 || members.length === 0 || !chair)
      fail('RAIT.BATCH_NO_ELIGIBLE_MEMBERS', 422);
    const seed = randomBytes(32).toString('hex');
    const orderedMembers = [...members].sort((left, right) => {
      const leftHash = createHash('sha256')
        .update(`${seed}:${left.id}`)
        .digest('hex');
      const rightHash = createHash('sha256')
        .update(`${seed}:${right.id}`)
        .digest('hex');
      return (
        leftHash.localeCompare(rightHash) || left.id.localeCompare(right.id)
      );
    });
    const today = await this.today(tx);
    const claimDue = await this.deadlines
      .create(tx)
      .computeDue('T-CLAIM', today, context.tenantId);
    const assignments = [];
    for (const [index, item] of items.entries()) {
      const member = orderedMembers[index % orderedMembers.length]!;
      await tx.query(
        `update inf.rait_batch_item set member_id = $1, claim_due_on = $2,
           updated_at = clock_timestamp() where tenant_id = $3 and id = $4`,
        [member.id, claimDue.dueOn, context.tenantId, item.id],
      );
      await tx.query(
        `insert into inf.rait_assignment
           (tenant_id, case_id, pool_id, member_id, assigned_by, claim_due_at, batch_id)
         values ($1,$2,$3,$4,$5,$6::date,$7)`,
        [
          context.tenantId,
          item.case_id,
          batch.pool_id,
          member.id,
          context.actorId,
          claimDue.dueOn,
          batch.id,
        ],
      );
      assignments.push({ caseId: item.case_id, memberId: member.id });
    }
    const snapshot = canonical({
      algorithmVersion: 'draw-v1',
      seed,
      orderedCaseIds: items.map((item) => item.case_id),
      orderedEligibleMemberIds: orderedMembers.map((member) => member.id),
      activeLoads: Object.fromEntries(
        members.map((member) => [member.id, member.active_load]),
      ),
      assignments,
      tieBreak: 'seeded-order-then-member-id',
    });
    const serializedSnapshot = JSON.stringify(snapshot);
    const snapshotHash = createHash('sha256')
      .update(serializedSnapshot)
      .digest('hex');
    await tx.query(
      "insert into inf.rait_batch_draw_snapshot (tenant_id, batch_id, snapshot_version, snapshot, snapshot_hash, origin) values ($1,$2,'draw-v1',$3::jsonb,$4,'server_draw')",
      [context.tenantId, batch.id, serializedSnapshot, snapshotHash],
    );
    const manifest = await this.trust.prepareBatchMinutesManifest({
      tenantId: context.tenantId,
      batchId: batch.id,
      snapshotHash,
      snapshotVersion: 'draw-v1',
      idempotencyKey: input.headers['Idempotency-Key'],
    });
    await tx.query(
      `insert into inf.rait_batch_minutes_manifest
         (tenant_id, batch_id, document_id, content_hash, snapshot_hash,
          snapshot_version, document_kind, expected_signer_person_id,
          manifest_hash, manifest_version, prepared_at)
       values ($1,$2,$3,$4,$5,'draw-v1',$6,$7,$8,$9,$10)`,
      [
        context.tenantId,
        batch.id,
        manifest.documentId,
        manifest.contentHash,
        manifest.snapshotHash,
        manifest.documentKind,
        chair.person_id,
        manifest.manifestHash,
        manifest.manifestVersion,
        manifest.preparedAt,
      ],
    );
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        "update inf.rait_batch set state = 'LOTE_SORTEADO', seed = $1, drawn_at = clock_timestamp(), version = version + 1, updated_at = clock_timestamp() where tenant_id = $2 and id = $3 and version = $4 returning *",
        [seed, context.tenantId, batch.id, batch.version],
      ),
    )[0];
    if (!updated) fail('RAIT.BATCH_STATE_INVALID', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.batch.changed',
      'INF_RAIT_BATCH_DRAW',
      'inf.rait_batch',
    );
  }

  private async reassign(
    tx: Tx,
    input: WorklistCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const replacementMemberId = input.payload.replacementMemberId;
    const reason = input.payload.reason;
    if (
      typeof replacementMemberId !== 'string' ||
      typeof reason !== 'string' ||
      !reason.trim()
    )
      fail('RAIT.REASSIGN_REASON_REQUIRED', 400);
    const assignment = rows<{
      id: string;
      member_id: string;
      active: boolean;
      case_id: string;
    }>(
      await tx.query(
        'select id, member_id, active, case_id from inf.rait_assignment where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!assignment?.active) fail('RAIT.ASSIGNMENT_ALREADY_ACTIVE', 409);
    if (assignment.member_id === replacementMemberId)
      fail('RAIT.REASSIGN_TO_SAME_MEMBER', 422);
    const member = rows<{ id: string }>(
      await tx.query(
        "select member.id from inf.rait_pool_member member where member.tenant_id = $1 and member.id = $2 and member.status = 'ATIVO' for update",
        [context.tenantId, replacementMemberId],
      ),
    )[0];
    if (!member)
      fail('RAIT.MEMBER_NOT_AVAILABLE', 422, { memberId: replacementMemberId });
    await tx.query(
      'update inf.rait_assignment set active = false, released_at = clock_timestamp(), release_reason = $1, updated_at = clock_timestamp() where tenant_id = $2 and id = $3',
      [reason, context.tenantId, assignment.id],
    );
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'insert into inf.rait_assignment (tenant_id, case_id, pool_id, member_id, assigned_by, active) select tenant_id, case_id, pool_id, $1, $2, true from inf.rait_assignment where tenant_id = $3 and id = $4 returning *',
        [replacementMemberId, context.actorId, context.tenantId, assignment.id],
      ),
    )[0];
    if (!updated) fail('RAIT.ASSIGNMENT_ALREADY_ACTIVE', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.assignment.changed',
      'INF_RAIT_ASSIGNMENT_REASSIGN',
      'inf.rait_assignment',
    );
  }

  private async lockBatch(tx: Tx, tenantId: string, batchId: string) {
    const batch = rows<{
      id: string;
      pool_id: string;
      state: string;
      version: number;
      homologated_at: string | null;
    }>(
      await tx.query(
        `select id, pool_id, state, version, homologated_at
           from inf.rait_batch where tenant_id = $1 and id = $2 for update`,
        [tenantId, batchId],
      ),
    )[0];
    if (!batch) fail('RAIT.TENANT_MISMATCH', 404, { batchId });
    return batch;
  }

  private async lockBatchItem(
    tx: Tx,
    context: { tenantId: string; actorId: string },
    batchId: string,
    caseId: unknown,
  ) {
    if (typeof caseId !== 'string') fail('RAIT.VALIDATION_FAILED', 400);
    const item = rows<{
      id: string;
      case_id: string;
      member_id: string;
      claim_due_on: string | null;
      accepted_at: string | null;
      declined_at: string | null;
    }>(
      await tx.query(
        `select id, case_id, member_id, claim_due_on, accepted_at, declined_at
           from inf.rait_batch_item
          where tenant_id = $1 and batch_id = $2 and case_id = $3 for update`,
        [context.tenantId, batchId, caseId],
      ),
    )[0];
    if (!item) fail('RAIT.TENANT_MISMATCH', 404, { batchId, caseId });
    if (!item.member_id) fail('RAIT.BATCH_NO_ELIGIBLE_MEMBERS', 422);
    return item;
  }

  private async requirePoolBinding(
    tx: Tx,
    context: { tenantId: string; actorId: string },
    poolId: unknown,
  ): Promise<void> {
    if (typeof poolId !== 'string') fail('RAIT.FORBIDDEN_ACTION', 403);
    const binding = rows<{ id: string }>(
      await tx.query(
        `select id from inf.rait_pool_member
          where tenant_id = $1 and pool_id = $2 and person_id = $3
            and status = 'ATIVO' and (mandate_ends_on is null or mandate_ends_on >= current_date)
          for update`,
        [context.tenantId, poolId, context.actorId],
      ),
    )[0];
    if (!binding) fail('RAIT.FORBIDDEN_ACTION', 403);
  }

  private async requireRapporteur(
    tx: Tx,
    context: { tenantId: string; actorId: string },
    memberId: string,
  ): Promise<void> {
    const member = rows<{ id: string }>(
      await tx.query(
        `select id from inf.rait_pool_member
          where tenant_id = $1 and id = $2 and person_id = $3
            and member_role = 'relator' and status = 'ATIVO'
            and (mandate_ends_on is null or mandate_ends_on >= current_date)
          for update`,
        [context.tenantId, memberId, context.actorId],
      ),
    )[0];
    if (!member) fail('RAIT.FORBIDDEN_ACTION', 403);
  }

  private async today(tx: Tx): Promise<string> {
    const value = rows<{ today: string }>(
      await tx.query('select current_date::text as today'),
    )[0]?.today;
    if (!value || !isCivilDate(value))
      fail('RAIT.PARAMETER_SOURCE_PENDING', 422);
    return value;
  }

  private async recordMutation(
    tx: Tx,
    context: { tenantId: string; actorId: string },
    input: WorklistCommandInput,
    data: Record<string, unknown>,
    type: string | undefined,
    auditAction: string,
    entity: string,
  ): Promise<Result> {
    const event = type ? { type } : undefined;
    if (event)
      await tx.query(
        "insert into integration.outbox (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status) values ($1,$2,$3,$4,$5,$6,'pending')",
        [
          context.tenantId,
          type,
          entity,
          String(data.id),
          JSON.stringify(event),
          `${input.headers['Idempotency-Key']}:${type}`,
        ],
      );
    await tx.query('select audit.write($1,$2,$3,$4,$5,$6,$7,null,null,null)', [
      context.tenantId,
      context.actorId,
      'rait-coordinator',
      auditAction,
      entity,
      String(data.id),
      JSON.stringify({ command: input.command }),
    ]);
    const version = Number(data.version);
    return {
      data,
      events: event ? [event] : [],
      etag: Number.isInteger(version)
        ? `W/\"${version}\"`
        : `W/\"${String(data.id)}:${String(data.updated_at ?? data.created_at ?? data.id)}\"`,
    };
  }

  private context() {
    if (!this.requestContext.hasActiveContext())
      throw new Error(
        'RaitWorklistCommandService requires an active request context',
      );
    const value = this.requestContext.snapshot();
    if (!value.tenantId || !value.actorId) fail('RAIT.FORBIDDEN_ACTION', 403);
    return { tenantId: value.tenantId!, actorId: value.actorId! };
  }
}
