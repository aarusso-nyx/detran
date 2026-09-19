import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  addCalendarDays,
  createDeadlineEngine,
  isWeekend,
  StaticTimerCatalog,
  type Deadline,
  type DeadlineEngine,
  type DeadlineEvent,
  type LocalDate,
  type TimerCode,
} from '@detran/inf-deadlines';
import { DetranError, withTenantContext } from '@detran/shared';

import { RaitDocumentTrustVerifier } from './rait-document-trust.verifier.js';
import { RaitOperationClock } from './rait-operation-clock.js';

export interface CommandInput {
  command: string;
  targetId: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
}
export interface CommandResult {
  data: Record<string, unknown>;
  events: Record<string, unknown>[];
  etag: string;
}
type AuthenticatedPrincipal = {
  id: string;
  roles: readonly string[];
  tenants: readonly string[];
};
type Tx = Pick<Transaction, 'query'>;
type CaseRow = Record<string, unknown> & {
  id: string;
  tenant_id?: string;
  ait_id?: string;
  origin_case_id?: string | null;
  agency_jurisdiction_id?: string | null;
  intake_channel?: string;
  protocolled_at?: string | Date;
  state: string;
  version: number;
  instance: string;
  assignment_id?: string;
};
type DraftRow = Record<string, unknown> & {
  id: string;
  author_id: string;
  document_id: string | null;
  content_hash: string;
  status: string;
  submitted_at: string | null;
  return_count: number;
};
type Rule = {
  expected: readonly string[];
  next?: string;
  audit: string;
  entity: string;
  fields: readonly string[];
};

const RULES: Record<string, Rule> = {
  admit: {
    expected: ['TRIAGEM_ADMISSIBILIDADE'],
    next: 'ADMITIDO',
    audit: 'INF_RAIT_CASE_ADMIT',
    entity: 'inf.rait_case',
    fields: [],
  },
  'non-admission': {
    expected: ['TRIAGEM_ADMISSIBILIDADE'],
    next: 'NAO_CONHECIDO',
    audit: 'INF_RAIT_CASE_REJECT',
    entity: 'inf.rait_case',
    fields: ['reason', 'legalBasis'],
  },
  remit: {
    expected: ['ADMITIDO'],
    next: 'AGUARDANDO_REMESSA_JARI',
    audit: 'INF_RAIT_CASE_REMIT',
    entity: 'inf.rait_case',
    fields: [],
  },
  receive: {
    expected: ['AGUARDANDO_REMESSA_JARI', 'ADMITIDO', 'DISTRIBUIDO'],
    next: 'DISTRIBUIDO',
    audit: 'INF_RAIT_CASE_RECEIVE',
    entity: 'inf.rait_case',
    fields: ['receivedOn', 'body'],
  },
  ready: {
    expected: ['EM_INSTRUCAO'],
    next: 'PRONTO_P_DECISAO',
    audit: 'INF_RAIT_CASE_READY',
    entity: 'inf.rait_case',
    fields: ['draftId'],
  },
  decide: {
    expected: ['PRONTO_P_DECISAO'],
    next: 'DECIDIDO_AUTORIDADE',
    audit: 'INF_RAIT_DECISION_SIGN',
    entity: 'inf.rait_decision',
    fields: ['decisionKind', 'grounds', 'signatureRef'],
  },
  'return-draft': {
    expected: ['PRONTO_P_DECISAO'],
    next: 'PRONTO_P_DECISAO',
    audit: 'INF_RAIT_DECISION_RETURN_DRAFT',
    entity: 'inf.rait_draft',
    fields: ['draftId', 'guidance'],
  },
  withdraw: {
    expected: [
      'PROTOCOLADO',
      'TRIAGEM_ADMISSIBILIDADE',
      'ADMITIDO',
      'AGUARDANDO_REMESSA_JARI',
      'DISTRIBUIDO',
      'EM_INSTRUCAO',
      'DILIGENCIA',
      'PRONTO_P_DECISAO',
      'PAUTADO',
    ],
    next: 'ENCERRADO_DESISTENCIA',
    audit: 'INF_RAIT_CASE_WITHDRAW',
    entity: 'inf.rait_case',
    fields: ['withdrawalDocumentId'],
  },
  redirect: {
    expected: ['TRIAGEM_ADMISSIBILIDADE'],
    audit: 'INF_RAIT_CASE_REDIRECT',
    entity: 'inf.rait_redirect',
    fields: ['targetBody', 'reason', 'receiptDocumentId'],
  },
  'resolve-pending': {
    expected: ['TRIAGEM_ADMISSIBILIDADE'],
    next: 'TRIAGEM_ADMISSIBILIDADE',
    audit: 'INF_RAIT_CASE_RESOLVE_PENDING_CONTENT',
    entity: 'inf.rait_pending_content',
    fields: ['pendingId', 'documentIds'],
  },
  'claim-next': {
    expected: ['DISTRIBUIDO'],
    next: 'EM_INSTRUCAO',
    audit: 'INF_RAIT_CASE_CLAIM_NEXT',
    entity: 'inf.rait_case',
    fields: [],
  },
};
const COMMAND_AUDIT_ROLES: Record<string, string> = {
  admit: 'rait-analyst',
  'non-admission': 'rait-analyst',
  remit: 'rait-secretary',
  receive: 'rait-secretary',
  ready: 'rait-analyst',
  decide: 'rait-signing-authority',
  'return-draft': 'rait-signing-authority',
  withdraw: 'rait-secretary',
  redirect: 'rait-secretary',
  'resolve-pending': 'rait-secretary',
  'claim-next': 'rait-analyst',
};
const fail = (
  code: string,
  status: number,
  context: Record<string, unknown> = {},
  requestId?: string,
): never => {
  throw new DetranError(code, {
    status,
    messageKey: `rait.errors.${code.replace(/^RAIT\./u, '').toLowerCase()}`,
    message: 'O comando não pode ser executado.',
    context,
    requestId,
  });
};
const rows = <T>(result: { rows: T[] } | undefined): T[] => result?.rows ?? [];
const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
};
const fingerprint = (input: CommandInput) =>
  createHash('sha256')
    .update(
      JSON.stringify({
        command: input.command,
        targetId: input.targetId,
        payload: canonical(input.payload),
      }),
    )
    .digest('hex');
const today = () => new Date().toISOString().slice(0, 10);
const civilDate = (value: unknown): LocalDate => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const encoded = String(value);
  return encoded.includes('T') ? encoded.slice(0, 10) : encoded;
};
type CaseTimelinessInput = {
  code: TimerCode;
  ownerId: string;
  tenantId: string;
  pieceMarkOn: LocalDate;
  caseBinding?: {
    aitId: string;
    intakeChannel: unknown;
    protocolledAt: unknown;
  };
};
const instantLocalDate = (value: unknown, timeZone: string): LocalDate => {
  const instant = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(instant.valueOf()))
    fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
  const formatter = (() => {
    try {
      const candidate = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      if (candidate.resolvedOptions().timeZone !== timeZone)
        fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
      return candidate;
    } catch {
      return fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
    }
  })();
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  const result = `${parts.year}-${parts.month}-${parts.day}`;
  if (!isCivilDate(result)) fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
  return result;
};
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const isCivilDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value))
    return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
};
const isNonEmpty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

@Injectable()
export class RaitDeadlineEngineFactory {
  constructor() {}

  create(transaction: Tx): DeadlineEngine {
    const mapDeadline = (row: Record<string, unknown>): Deadline => ({
      id: String(row.id),
      tenantId: String(row.tenant_id),
      ownerKind: 'case',
      ownerId: String(row.case_id),
      code: String(row.timer_code) as TimerCode,
      instance: (row.instance as 'jari' | 'cetran' | null) ?? null,
      startBasis: String(row.start_basis),
      startedOn: civilDate(row.started_on),
      rawDueOn: civilDate(row.raw_due_on),
      dueOn: civilDate(row.due_on),
      ceilingOn: null,
      businessDays: Boolean(row.business_days),
      status: row.satisfied_at ? 'satisfeito' : 'armado',
      satisfiedAt: row.satisfied_at ? new Date(String(row.satisfied_at)) : null,
      expiredAt: null,
      cancelReason: null,
      suspendedByActId: row.suspended_by_act_id
        ? String(row.suspended_by_act_id)
        : null,
      suspendedDays: 0,
      extensionCount: Number(row.extension_count),
      extensionReason: null,
      legalBasis: String(row.legal_basis),
    });
    const mapInfractionDeadline = (row: Record<string, unknown>): Deadline => ({
      id: String(row.id),
      tenantId: String(row.tenant_id),
      ownerKind: 'infraction',
      ownerId: String(row.infraction_id),
      code: String(row.timer_code) as TimerCode,
      instance: (row.instance as 'jari' | 'cetran' | null) ?? null,
      startBasis: String(row.start_basis),
      startedOn: civilDate(row.started_on),
      rawDueOn: civilDate(row.raw_due_on),
      dueOn: civilDate(row.due_on),
      ceilingOn: row.ceiling_on ? civilDate(row.ceiling_on) : null,
      businessDays: Boolean(row.business_days),
      status: String(row.status) as Deadline['status'],
      satisfiedAt: row.satisfied_at ? new Date(String(row.satisfied_at)) : null,
      expiredAt: row.expired_at ? new Date(String(row.expired_at)) : null,
      cancelReason: row.cancel_reason ? String(row.cancel_reason) : null,
      suspendedByActId: row.suspended_by_act_id
        ? String(row.suspended_by_act_id)
        : null,
      suspendedDays: Number(row.suspended_days),
      extensionCount: Number(row.extension_count),
      extensionReason: null,
      legalBasis: String(row.legal_basis),
    });
    const select =
      'select deadline.*, item.instance from inf.rait_deadline deadline join inf.rait_case item on item.id = deadline.case_id and item.tenant_id = deadline.tenant_id';
    const engine = createDeadlineEngine({
      clock: {
        today: () => today(),
        now: () => new Date(),
      },
      calendar: {
        isBusinessDay: async (date, tenantId) => {
          if (isWeekend(date)) return false;
          const holiday = rows(
            await transaction.query(
              `${'select id from inf.rait_holiday'} where tenant_id = $1 and holiday_on = $2 limit 1`,
              [tenantId, date],
            ),
          );
          return holiday.length === 0;
        },
        nextBusinessDay: async function (date: LocalDate, tenantId: string) {
          let candidate = addCalendarDays(date, 1);
          while (!(await this.isBusinessDay(candidate, tenantId)))
            candidate = addCalendarDays(candidate, 1);
          return candidate;
        },
      },
      catalog: new StaticTimerCatalog(),
      store: {
        insert: async (deadline) => {
          const result = await transaction.query<Record<string, unknown>>(
            'insert into inf.rait_deadline (id, tenant_id, case_id, timer_code, start_basis, started_on, raw_due_on, due_on, business_days, extension_count, satisfied_at, suspended_by_act_id, legal_basis) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *',
            [
              deadline.id,
              deadline.tenantId,
              deadline.ownerId,
              deadline.code,
              deadline.startBasis,
              deadline.startedOn,
              deadline.rawDueOn,
              deadline.dueOn,
              deadline.businessDays,
              deadline.extensionCount,
              deadline.satisfiedAt,
              deadline.suspendedByActId,
              deadline.legalBasis,
            ],
          );
          return mapDeadline(rows(result)[0]!);
        },
        findById: async (id) => {
          const row = rows(
            await transaction.query<Record<string, unknown>>(
              `${select} where deadline.id = $1`,
              [id],
            ),
          )[0];
          return row ? mapDeadline(row) : null;
        },
        findOpen: async (tenantId, ownerId, code) => {
          if (['T-DEF', 'T-NP-VENC', 'T-R2'].includes(code)) {
            const timerRows = rows(
              await transaction.query<Record<string, unknown>>(
                `select * from inf.infraction_timer
                  where tenant_id = $1 and infraction_id = $2
                    and timer_code = $3 and status = 'armado'
                  for update`,
                [tenantId, ownerId, code],
              ),
            );
            return timerRows.length === 1
              ? mapInfractionDeadline(timerRows[0]!)
              : null;
          }
          const row = rows(
            await transaction.query<Record<string, unknown>>(
              `${select} where deadline.tenant_id = $1 and deadline.case_id = $2 and deadline.timer_code = $3 and deadline.satisfied_at is null`,
              [tenantId, ownerId, code],
            ),
          )[0];
          return row ? mapDeadline(row) : null;
        },
        findByArm: async (tenantId, ownerId, code, startedOn) => {
          const row = rows(
            await transaction.query<Record<string, unknown>>(
              `${select} where deadline.tenant_id = $1 and deadline.case_id = $2 and deadline.timer_code = $3 and deadline.started_on = $4`,
              [tenantId, ownerId, code, startedOn],
            ),
          )[0];
          return row ? mapDeadline(row) : null;
        },
        listDue: async (tenantId, onOrBefore, limit) =>
          rows(
            await transaction.query<Record<string, unknown>>(
              `${select} where deadline.tenant_id = $1 and deadline.due_on <= $2 and deadline.satisfied_at is null order by deadline.due_on, deadline.id for update skip locked limit $3`,
              [tenantId, onOrBefore, limit],
            ),
          ).map(mapDeadline),
        update: async (deadline) => {
          const result = await transaction.query<Record<string, unknown>>(
            'update inf.rait_deadline set started_on=$1, raw_due_on=$2, due_on=$3, business_days=$4, extension_count=$5, satisfied_at=$6, suspended_by_act_id=$7, legal_basis=$8, updated_at=clock_timestamp() where tenant_id=$9 and id=$10 returning *',
            [
              deadline.startedOn,
              deadline.rawDueOn,
              deadline.dueOn,
              deadline.businessDays,
              deadline.extensionCount,
              deadline.satisfiedAt,
              deadline.suspendedByActId,
              deadline.legalBasis,
              deadline.tenantId,
              deadline.id,
            ],
          );
          return mapDeadline(rows(result)[0]!);
        },
      },
      events: {
        publish: async (event: DeadlineEvent) => {
          await transaction.query(
            'insert into integration.outbox (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status) values ($1,$2,$3,$4,$5,$6,$7)',
            [
              event.tenantId,
              event.type,
              event.aggregate.kind,
              event.aggregate.id,
              JSON.stringify(event),
              `${event.type}:${event.aggregate.id}:${event.occurredAt}`,
              'pending',
            ],
          );
        },
      },
    });
    return {
      arm: (input) => engine.arm(input),
      satisfy: (id, reason) => engine.satisfy(id, reason),
      cancel: (id, reason) => engine.cancel(id, reason),
      reschedule: (id, act) => engine.reschedule(id, act),
      extend: (id, reason) => engine.extend(id, reason),
      computeDue: (code, startOn, tenantId, printedDeadline) =>
        engine.computeDue(code, startOn, tenantId, printedDeadline),
      sweep: (tenantId, limit) => engine.sweep(tenantId, limit),
      timeliness: async (rawInput) => {
        const input = rawInput as CaseTimelinessInput;
        if (!input.caseBinding) return engine.timeliness(input);
        if (
          !['balcao', 'portal', 'sne'].includes(
            String(input.caseBinding.intakeChannel),
          )
        )
          fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
        const tenantRows = rows(
          await transaction.query<{ timezone: string | null }>(
            'select timezone from auth.tenants where id = $1 for share',
            [input.tenantId],
          ),
        );
        if (tenantRows.length !== 1 || !tenantRows[0]?.timezone?.trim())
          fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
        const timeZone = tenantRows[0]!.timezone!;
        const pieceMarkOn = instantLocalDate(
          input.caseBinding.protocolledAt,
          timeZone,
        );
        const infractions = rows(
          await transaction.query<{ id: string }>(
            'select id from inf.infraction where tenant_id = $1 and ait_id = $2 for update',
            [input.tenantId, input.caseBinding.aitId],
          ),
        );
        if (infractions.length !== 1)
          fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
        const timerRows = rows(
          await transaction.query<{ id: string }>(
            `select id from inf.infraction_timer
              where tenant_id = $1 and infraction_id = $2
                and timer_code = $3 and status = 'armado'
              for update`,
            [input.tenantId, infractions[0]!.id, input.code],
          ),
        );
        if (timerRows.length !== 1)
          fail('RAIT.TRIAGE_TIMELINESS_READONLY', 422);
        return engine.timeliness({
          code: input.code,
          ownerId: infractions[0]!.id,
          tenantId: input.tenantId,
          pieceMarkOn,
        });
      },
    };
  }
}

@Injectable()
export class RaitCaseCommandService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    private readonly deadlines: RaitDeadlineEngineFactory,
    private readonly trust: RaitDocumentTrustVerifier,
    private readonly operationClock?: RaitOperationClock,
  ) {}

  async protocol(input: {
    payload: Record<string, unknown>;
    headers: Record<string, string>;
    principal?: AuthenticatedPrincipal;
  }): Promise<CommandResult> {
    const forbidden = [
      'tenantId',
      'tenant_id',
      'actor',
      'actorId',
      'assessed_by',
      'verified_by',
      'policy',
      'rank',
      'legal_priority',
      'state',
      'version',
      'id',
    ];
    if (forbidden.some((field) => field in input.payload))
      fail('RAIT.VALIDATION_FAILED', 400);
    const allowed = new Set([
      'ait_id',
      'origin_case_id',
      'protocol_number',
      'instance',
      'circuit',
      'intake_channel',
      'protocolled_at',
      'unit_id',
      'agency_jurisdiction_id',
      'documents',
      'proofs',
    ]);
    if (Object.keys(input.payload).some((field) => !allowed.has(field)))
      fail('RAIT.VALIDATION_FAILED', 400);
    this.validateProtocolPayload(input.payload);
    const key = input.headers['Idempotency-Key'];
    if (!key) fail('RAIT.VALIDATION_FAILED', 400);
    const context = this.protocolContext(input.principal);
    const operationClock: RaitOperationClock =
      this.operationClock ??
      fail('RAIT.PARAMETER_SOURCE_PENDING', 422, {}, context.requestId);

    return this.transaction(async (tx) => {
      const digest = createHash('sha256')
        .update(
          JSON.stringify({
            command: 'protocol',
            payload: canonical(input.payload),
          }),
        )
        .digest('hex');
      await tx.query(
        "select pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))",
        [context.tenantId, key],
      );
      const replay = rows(
        await tx.query<{
          request_fingerprint: string;
          response_body: CommandResult;
        }>(
          'select request_fingerprint, response_body from integration.idempotency_keys where tenant_id = $1 and idem_key = $2 for update',
          [context.tenantId, key],
        ),
      )[0];
      if (replay) {
        if (replay.request_fingerprint !== digest)
          fail('RAIT.IDEMPOTENCY_REPLAY', 409, { key }, context.requestId);
        return replay.response_body;
      }

      const payload = input.payload;
      const membership = rows(
        await tx.query(
          `select member.id
             from inf.rait_pool_member member
             join inf.rait_pool pool
               on pool.id = member.pool_id and pool.tenant_id = member.tenant_id
            where member.tenant_id = $1 and member.person_id = $2
              and member.member_role = 'secretaria' and member.status = 'ATIVO'
              and pool.active and pool.instance = $3
              and pool.unit_id is not distinct from $4::uuid
            for update of member, pool`,
          [
            context.tenantId,
            context.actorId,
            payload.instance,
            payload.unit_id ?? null,
          ],
        ),
      );
      if (membership.length !== 1)
        fail('RAIT.FORBIDDEN_CASE_SCOPE', 403, {}, context.requestId);
      const tenant = rows(
        await tx.query<{ timezone: string }>(
          'select timezone from auth.tenants where id = $1 for share',
          [context.tenantId],
        ),
      )[0];
      if (!tenant?.timezone)
        fail('RAIT.PARAMETER_SOURCE_PENDING', 422, {}, context.requestId);
      let snapshot: ReturnType<RaitOperationClock['capture']>;
      try {
        snapshot = operationClock.capture(tenant.timezone);
      } catch {
        return fail(
          'RAIT.PARAMETER_SOURCE_PENDING',
          422,
          {},
          context.requestId,
        );
      }
      const data = rows<CaseRow>(
        await tx.query(
          `insert into inf.rait_case
             (tenant_id, ait_id, origin_case_id, protocol_number, instance, circuit,
              intake_channel, protocolled_at, unit_id, agency_jurisdiction_id,
              last_movement_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           returning id, tenant_id, ait_id, origin_case_id, protocol_number, instance,
                     circuit, state, intake_channel, protocolled_at, unit_id,
                     agency_jurisdiction_id, version, created_at, updated_at`,
          [
            context.tenantId,
            payload.ait_id,
            payload.origin_case_id ?? null,
            payload.protocol_number,
            payload.instance,
            payload.circuit,
            payload.intake_channel,
            payload.protocolled_at,
            payload.unit_id ?? null,
            payload.agency_jurisdiction_id ?? null,
            snapshot.now(),
          ],
        ),
      )[0];
      if (!data) fail('RAIT.INTERNAL', 500, {}, context.requestId);
      for (const document of payload.documents as Array<
        Record<string, unknown>
      >) {
        await tx.query(
          `insert into inf.rait_document
             (id, tenant_id, case_id, kind, origin, storage_key, filename,
              content_hash, digitised_from_paper, attached_by)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            document.id,
            context.tenantId,
            data.id,
            document.kind,
            document.origin,
            document.storage_key,
            document.filename,
            document.content_hash,
            document.digitised_from_paper ?? false,
            context.actorId,
          ],
        );
      }
      await tx.query(
        'select inf.rait_record_initial_priority($1, $2, $3, $4::jsonb)',
        [
          data.id,
          context.actorId,
          snapshot.now(),
          JSON.stringify(payload.proofs),
        ],
      );
      await tx.query(
        'select audit.write($1, $2, $3, $4, $5, $6, $7, null, null, null)',
        [
          context.tenantId,
          context.actorId,
          context.role,
          'INF_RAIT_CASE_PROTOCOL',
          'inf.rait_case',
          data.id,
          JSON.stringify({ command: 'protocol' }),
        ],
      );
      const result = { data, events: [], etag: `"${data.version}"` };
      await tx.query(
        "insert into integration.idempotency_keys (tenant_id, idem_key, request_fingerprint, status_code, response_body, expires_at) values ($1, $2, $3, $4, $5, clock_timestamp() + interval '24 hours')",
        [context.tenantId, key, digest, 200, JSON.stringify(result)],
      );
      return result;
    });
  }

  async execute<T extends CommandInput>(input: T): Promise<CommandResult> {
    const rule = RULES[input.command];
    if (
      ['tenantId', 'actorId', 'roles', 'policy', 'tenant_id'].some(
        (field) => field in input.payload,
      )
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    if (input.command === 'claim-next' && 'caseId' in input.payload)
      fail('RAIT.ORDER_OVERRIDE_FORBIDDEN', 403);
    if (!rule) fail('RAIT.VALIDATION_FAILED', 400);
    if (
      Object.keys(input.payload).some((field) => !rule.fields.includes(field))
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    this.validatePayload(input);
    if (input.command !== 'claim-next' && !input.headers['If-Match'])
      fail('RAIT.IF_MATCH_REQUIRED', 428);
    const key = input.headers['Idempotency-Key'];
    if (!key) fail('RAIT.VALIDATION_FAILED', 400);
    const context = {
      ...this.context(),
      role: COMMAND_AUDIT_ROLES[input.command] ?? '',
    };
    return this.transaction(async (tx) => {
      const digest = fingerprint(input);
      await tx.query(
        "select pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))",
        [context.tenantId, key],
      );
      const replay = rows(
        await tx.query<{
          request_fingerprint: string;
          response_body: CommandResult;
        }>(
          'select request_fingerprint, response_body from integration.idempotency_keys where tenant_id = $1 and idem_key = $2 for update',
          [context.tenantId, key],
        ),
      )[0];
      if (replay) {
        if (replay.request_fingerprint !== digest)
          fail('RAIT.IDEMPOTENCY_REPLAY', 409, { key }, context.requestId);
        return replay.response_body;
      }
      const current =
        input.command === 'claim-next'
          ? await this.claim(
              tx,
              context.tenantId,
              context.actorId,
              input.targetId,
            )
          : rows(
              await tx.query<CaseRow>(
                'select id, state, version, instance, tenant_id, ait_id, origin_case_id, agency_jurisdiction_id, protocol_number, intake_channel, protocolled_at, pending_completion, judge_body_received_at, judge_body_received_on, cetran_received_at, cetran_received_on from inf.rait_case where tenant_id = $1 and id = $2 for update',
                [context.tenantId, input.targetId],
              ),
            )[0];
      if (!current)
        return fail(
          input.command === 'claim-next'
            ? 'RAIT.QUEUE_EMPTY'
            : 'RAIT.TENANT_MISMATCH',
          input.command === 'claim-next' ? 409 : 404,
          {},
          context.requestId,
        );
      if (
        input.command !== 'claim-next' &&
        input.headers['If-Match'] !== `"${current.version}"`
      )
        fail(
          'RAIT.VERSION_CONFLICT',
          412,
          { currentVersion: current.version },
          context.requestId,
        );
      this.stateGuard(input, rule, current, context.requestId);
      await this.domainGuards(tx, input, current, context);
      if (input.command === 'remit')
        await this.requireDeadlines().create(tx).arm({
          ownerKind: 'case',
          ownerId: current.id,
          code: 'T-REM10',
          startOn: today(),
          startBasis: 'remessa_jari',
          legalBasis: 'CTB art. 285 §2º',
          tenantId: context.tenantId,
          instance: 'jari',
        });
      await this.effects(tx, input, current, context);
      const changesCase = input.command !== 'redirect';
      const state = rule.next ?? current.state;
      const suspensiveEffect =
        input.command === 'admit' &&
        ['jari', 'cetran'].includes(current.instance);
      const data = changesCase
        ? rows(
            await tx.query<CaseRow>(
              `update inf.rait_case
                  set state = $1,
                      version = version + 1,
                      updated_at = clock_timestamp(),
                      last_movement_at = clock_timestamp(),
                      admitted_at = case when $5 = 'admit' then clock_timestamp() else admitted_at end,
                      suspensive_effect = case when $5 = 'admit' then $6 else suspensive_effect end,
                      non_admission_reason = case when $5 = 'non-admission' then $7 else non_admission_reason end,
                      archived = case when $5 = 'non-admission' then $7 = 'intempestivo' else archived end,
                      remitted_at = case when $5 = 'remit' then clock_timestamp() else remitted_at end,
                      judge_body_received_at = case when $5 = 'receive' and $8 = 'jari' then clock_timestamp() else judge_body_received_at end,
                      judge_body_received_on = case when $5 = 'receive' and $8 = 'jari' then $9::date else judge_body_received_on end,
                      cetran_received_at = case when $5 = 'receive' and $8 = 'cetran' then clock_timestamp() else cetran_received_at end,
                      cetran_received_on = case when $5 = 'receive' and $8 = 'cetran' then $9::date else cetran_received_on end,
                      decided_at = case when $5 = 'decide' then clock_timestamp() else decided_at end,
                      withdrawal_document_id = case when $5 = 'withdraw' then $10::uuid else withdrawal_document_id end,
                      closed_at = case when $5 = 'withdraw' then clock_timestamp() else closed_at end,
                      pending_completion = case when $5 = 'resolve-pending' then false else pending_completion end
                where tenant_id = $2 and id = $3 and version = $4
                returning id, state, version, instance, ait_id, admitted_at,
                          judge_body_received_at, judge_body_received_on,
                          cetran_received_at, cetran_received_on, closed_at`,
              [
                state,
                context.tenantId,
                current.id,
                current.version,
                input.command,
                suspensiveEffect,
                input.payload.reason ?? null,
                input.payload.body ?? null,
                input.payload.receivedOn ?? null,
                input.payload.withdrawalDocumentId ?? null,
              ],
            ),
          )[0]
        : current;
      if (!data)
        return fail(
          'RAIT.VERSION_CONFLICT',
          412,
          { currentVersion: current.version },
          context.requestId,
        );
      if (current.assignment_id && data)
        data.assignment_id = current.assignment_id;
      const events = this.events(input, { ...current, ...data }, state);
      for (const event of events) {
        if (event.type === 'rait.case.changed')
          await tx.query(
            'insert into inf.rait_case_event (tenant_id, case_id, event_type, from_state, to_state, actor_id, payload) values ($1, $2, $3, $4, $5, $6, $7)',
            [
              context.tenantId,
              current.id,
              'RAIT_CASO_ESTADO_ALTERADO',
              current.state,
              state,
              context.actorId,
              JSON.stringify(event),
            ],
          );
        await tx.query(
          'insert into integration.outbox (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status) values ($1, $2, $3, $4, $5, $6, $7)',
          [
            context.tenantId,
            event.type,
            event.type === 'rait.assignment.changed'
              ? 'inf.rait_assignment'
              : 'inf.rait_case',
            current.id,
            JSON.stringify(event),
            `${key}:${event.type}`,
            'pending',
          ],
        );
      }
      await tx.query(
        'select audit.write($1, $2, $3, $4, $5, $6, $7, null, null, null)',
        [
          context.tenantId,
          context.actorId,
          context.role,
          rule.audit,
          rule.entity,
          current.id,
          JSON.stringify({ command: input.command }),
        ],
      );
      const result = { data, events, etag: `"${data.version}"` };
      await tx.query(
        "insert into integration.idempotency_keys (tenant_id, idem_key, request_fingerprint, status_code, response_body, expires_at) values ($1, $2, $3, $4, $5, clock_timestamp() + interval '24 hours')",
        [context.tenantId, key, digest, 200, JSON.stringify(result)],
      );
      return result;
    });
  }

  private context() {
    if (!this.requestContext?.hasActiveContext?.())
      throw new Error(
        'RaitCaseCommandService requires an active request context',
      );
    const value = this.requestContext.snapshot();
    if (!value.tenantId || !value.actorId) fail('RAIT.FORBIDDEN_ACTION', 403);
    return {
      tenantId: value.tenantId!,
      actorId: value.actorId!,
      requestId: value.requestId,
    };
  }
  private protocolContext(principal: AuthenticatedPrincipal | undefined) {
    const context = this.context();
    if (
      !principal ||
      principal.id !== context.actorId ||
      !principal.tenants.includes(context.tenantId) ||
      !principal.roles.includes('rait-secretary')
    )
      fail('RAIT.FORBIDDEN_ACTION', 403, {}, context.requestId);
    return { ...context, role: 'rait-secretary' };
  }
  private transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }

  private validatePayload(input: CommandInput): void {
    const payload = input.payload;
    const uuid = (field: string) => {
      if (!UUID.test(String(payload[field] ?? '')))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: [field] });
    };
    const text = (field: string) => {
      if (!isNonEmpty(payload[field]))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: [field] });
    };
    if (input.command === 'non-admission') {
      if (
        ![
          'intempestivo',
          'ilegitimo',
          'sem_assinatura',
          'pedido_incompativel',
        ].includes(String(payload.reason))
      )
        fail('RAIT.ENUM_INVALID', 400, { field: 'reason' });
      text('legalBasis');
    }
    if (input.command === 'receive') {
      if (!isCivilDate(payload.receivedOn))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['receivedOn'] });
      if (!['jari', 'cetran'].includes(String(payload.body)))
        fail('RAIT.ENUM_INVALID', 400, { field: 'body' });
    }
    if (['ready', 'return-draft'].includes(input.command)) uuid('draftId');
    if (input.command === 'decide') {
      if (
        ![
          'acolhida',
          'indeferida',
          'provido',
          'negado',
          'nao_conhecido',
        ].includes(String(payload.decisionKind))
      )
        fail('RAIT.ENUM_INVALID', 400, { field: 'decisionKind' });
      text('signatureRef');
    }
    if (input.command === 'return-draft') text('guidance');
    if (input.command === 'withdraw') uuid('withdrawalDocumentId');
    if (input.command === 'redirect') {
      uuid('targetBody');
      uuid('receiptDocumentId');
      if (
        !['outro_orgao_autuador', 'orgao_incompetente'].includes(
          String(payload.reason),
        )
      )
        fail('RAIT.ENUM_INVALID', 400, { field: 'reason' });
    }
    if (input.command === 'resolve-pending') {
      uuid('pendingId');
      const documentIds = payload.documentIds;
      if (
        !Array.isArray(documentIds) ||
        documentIds.length === 0 ||
        documentIds.some((id) => !UUID.test(String(id))) ||
        new Set(documentIds).size !== documentIds.length
      )
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['documentIds'] });
    }
  }

  private validateProtocolPayload(payload: Record<string, unknown>): void {
    const required = [
      'ait_id',
      'protocol_number',
      'instance',
      'circuit',
      'intake_channel',
      'protocolled_at',
      'documents',
      'proofs',
    ];
    if (required.some((field) => !(field in payload)))
      fail('RAIT.VALIDATION_FAILED', 400);
    for (const field of [
      'ait_id',
      'origin_case_id',
      'unit_id',
      'agency_jurisdiction_id',
    ]) {
      if (payload[field] !== undefined && !UUID.test(String(payload[field])))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: [field] });
    }
    if (
      !isNonEmpty(payload.protocol_number) ||
      payload.protocol_number.length > 40
    )
      fail('RAIT.VALIDATION_FAILED', 400, { fields: ['protocol_number'] });
    if (!['defesa_previa', 'jari', 'cetran'].includes(String(payload.instance)))
      fail('RAIT.ENUM_INVALID', 400, { field: 'instance' });
    if (
      !Number.isInteger(payload.circuit) ||
      (payload.instance === 'defesa_previa'
        ? payload.circuit !== 1
        : payload.circuit !== 2)
    )
      fail('RAIT.ENUM_INVALID', 400, { field: 'circuit' });
    if (
      !['balcao', 'portal', 'sne', 'postal'].includes(
        String(payload.intake_channel),
      )
    )
      fail('RAIT.ENUM_INVALID', 400, { field: 'intake_channel' });
    if (
      typeof payload.protocolled_at !== 'string' ||
      Number.isNaN(new Date(payload.protocolled_at).valueOf())
    )
      fail('RAIT.VALIDATION_FAILED', 400, { fields: ['protocolled_at'] });
    const documents: unknown[] = Array.isArray(payload.documents)
      ? payload.documents
      : fail('RAIT.VALIDATION_FAILED', 400);
    const proofs: unknown[] = Array.isArray(payload.proofs)
      ? payload.proofs
      : fail('RAIT.VALIDATION_FAILED', 400);
    const documentIds = new Set<string>();
    for (const document of documents) {
      if (!document || typeof document !== 'object' || Array.isArray(document))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['documents'] });
      const item = document as Record<string, unknown>;
      const fields = new Set([
        'id',
        'kind',
        'origin',
        'storage_key',
        'filename',
        'content_hash',
        'digitised_from_paper',
      ]);
      if (
        Object.keys(item).some((field) => !fields.has(field)) ||
        [
          'id',
          'kind',
          'origin',
          'storage_key',
          'filename',
          'content_hash',
        ].some((field) => !(field in item)) ||
        !UUID.test(String(item.id)) ||
        !isNonEmpty(item.kind) ||
        !['requerente', 'oficio'].includes(String(item.origin)) ||
        !isNonEmpty(item.storage_key) ||
        !isNonEmpty(item.filename) ||
        !isNonEmpty(item.content_hash) ||
        (item.digitised_from_paper !== undefined &&
          typeof item.digitised_from_paper !== 'boolean')
      )
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['documents'] });
      if (documentIds.has(String(item.id)))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['documents'] });
      documentIds.add(String(item.id));
    }
    for (const proof of proofs) {
      if (!proof || typeof proof !== 'object' || Array.isArray(proof))
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['proofs'] });
      const item = proof as Record<string, unknown>;
      const fields = new Set([
        'basis_code',
        'source_kind',
        'source_ref',
        'document_id',
        'birth_date',
        'evidence_hash',
      ]);
      if (
        Object.keys(item).some((field) => !fields.has(field)) ||
        ['basis_code', 'source_kind', 'source_ref'].some(
          (field) => !(field in item),
        ) ||
        !['pcd', 'age_60_plus', 'age_80_plus'].includes(
          String(item.basis_code),
        ) ||
        !['attached_document', 'presented_document', 'presented_cnh'].includes(
          String(item.source_kind),
        ) ||
        !isNonEmpty(item.source_ref)
      )
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['proofs'] });
      if (
        item.document_id !== undefined &&
        (!UUID.test(String(item.document_id)) ||
          !documentIds.has(String(item.document_id)))
      )
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['proofs'] });
      if (
        item.basis_code === 'pcd' &&
        (item.source_kind !== 'attached_document' ||
          item.document_id === undefined ||
          !isNonEmpty(item.evidence_hash))
      )
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['proofs'] });
      if (
        item.basis_code !== 'pcd' &&
        (!isCivilDate(item.birth_date) ||
          ![
            'presented_document',
            'presented_cnh',
            'attached_document',
          ].includes(String(item.source_kind)))
      )
        fail('RAIT.VALIDATION_FAILED', 400, { fields: ['proofs'] });
    }
  }
  private stateGuard(
    input: CommandInput,
    rule: Rule,
    current: CaseRow,
    requestId?: string,
  ) {
    if (!rule.expected.includes(current.state)) {
      const code =
        input.command === 'remit'
          ? 'RAIT.REMIT_NOT_ADMITTED'
          : input.command === 'withdraw' &&
              current.state === 'DECIDIDO_AUTORIDADE'
            ? 'RAIT.WITHDRAWAL_AFTER_DECISION'
            : 'RAIT.CASE_STATE_INVALID';
      fail(
        code,
        409,
        {
          caseId: current.id,
          currentState: current.state,
          allowedStates: rule.expected,
          command: input.command,
        },
        requestId,
      );
    }
    if (input.command === 'remit' && current.instance !== 'jari')
      fail('RAIT.REMIT_NOT_ADMITTED', 409, { caseId: current.id }, requestId);
    if (input.command === 'decide') {
      const allowed =
        current.instance === 'defesa_previa' ? ['acolhida', 'indeferida'] : [];
      if (!allowed.includes(String(input.payload.decisionKind)))
        fail(
          'RAIT.DECISION_KIND_INVALID_FOR_INSTANCE',
          422,
          {
            caseId: current.id,
            decisionKind: input.payload.decisionKind,
            instance: current.instance,
          },
          requestId,
        );
    }
  }

  private async domainGuards(
    tx: Tx,
    input: CommandInput,
    current: CaseRow,
    context: { tenantId: string; actorId: string; requestId?: string },
  ) {
    const payload = input.payload;
    if (input.command === 'admit' || input.command === 'non-admission') {
      const triage = rows(
        await tx.query<Record<string, unknown>>(
          'select criterion, verdict from inf.rait_admissibility where tenant_id = $1 and case_id = $2',
          [context.tenantId, current.id],
        ),
      );
      if (triage.length !== 4)
        fail(
          'RAIT.TRIAGE_INCOMPLETE',
          422,
          { caseId: current.id },
          context.requestId,
        );
      if (input.command === 'admit') {
        if (
          triage.find((item) => item.criterion === 'assinatura')?.verdict !==
          true
        )
          fail(
            'RAIT.INTAKE_SIGNATURE_MISSING',
            422,
            { caseId: current.id },
            context.requestId,
          );
        const code = (
          {
            defesa_previa: 'T-DEF',
            jari: 'T-NP-VENC',
            cetran: 'T-R2',
          } as const
        )[current.instance as 'defesa_previa' | 'jari' | 'cetran'];
        if (!code || !current.ait_id)
          fail(
            'RAIT.TRIAGE_TIMELINESS_READONLY',
            422,
            { caseId: current.id },
            context.requestId,
          );
        const timely = await this.requireDeadlines()
          .create(tx)
          .timeliness({
            code,
            ownerId: current.id,
            tenantId: context.tenantId,
            pieceMarkOn: '' as LocalDate,
            caseBinding: {
              aitId: current.ait_id,
              intakeChannel: current.intake_channel,
              protocolledAt: current.protocolled_at,
            },
          } as CaseTimelinessInput);
        if (!timely.timely)
          fail(
            'RAIT.TRIAGE_TIMELINESS_READONLY',
            422,
            { caseId: current.id },
            context.requestId,
          );
        if (triage.some((item) => item.verdict !== true))
          fail(
            'RAIT.TRIAGE_INCOMPLETE',
            422,
            { caseId: current.id },
            context.requestId,
          );
      } else {
        const criterion = (
          {
            intempestivo: 'tempestividade',
            ilegitimo: 'legitimidade',
            sem_assinatura: 'assinatura',
            pedido_incompativel: 'pedido_compativel',
          } as Record<string, string>
        )[String(payload.reason)];
        if (
          !criterion ||
          triage.find((item) => item.criterion === criterion)?.verdict !== false
        )
          fail(
            'RAIT.NON_ADMISSION_REASON_REQUIRED',
            422,
            { caseId: current.id },
            context.requestId,
          );
      }
    }
    if (input.command === 'remit') await this.remitGuard(tx, current, context);
    if (input.command === 'receive') {
      if (payload.body !== current.instance)
        fail(
          'RAIT.FORBIDDEN_ORGAO',
          403,
          { caseId: current.id },
          context.requestId,
        );
      if (
        payload.body === 'jari' &&
        current.state !== 'AGUARDANDO_REMESSA_JARI'
      )
        fail(
          'RAIT.CASE_STATE_INVALID',
          409,
          { caseId: current.id, currentState: current.state },
          context.requestId,
        );
      if (payload.body === 'cetran') {
        if (!['ADMITIDO', 'DISTRIBUIDO'].includes(current.state))
          fail(
            'RAIT.CASE_STATE_INVALID',
            409,
            { caseId: current.id, currentState: current.state },
            context.requestId,
          );
        const origin = current.origin_case_id
          ? rows(
              await tx.query<CaseRow>(
                "select id, ait_id, instance, state from inf.rait_case where tenant_id = $1 and id = $2 and instance = 'jari' and state = 'REMETIDO_2A_INSTANCIA' for update",
                [context.tenantId, current.origin_case_id],
              ),
            )[0]
          : undefined;
        if (!origin || origin.ait_id !== current.ait_id)
          fail(
            'RAIT.FORBIDDEN_ORGAO',
            403,
            { caseId: current.id },
            context.requestId,
          );
      }
      if (
        payload.body === 'jari'
          ? current.judge_body_received_at || current.judge_body_received_on
          : current.cetran_received_at || current.cetran_received_on
      )
        fail(
          'RAIT.RECEIPT_ALREADY_REGISTERED',
          409,
          { caseId: current.id },
          context.requestId,
        );
    }
    if (['ready', 'decide', 'return-draft'].includes(input.command)) {
      if (input.command === 'decide') {
        if (!String(payload.grounds ?? '').trim())
          fail(
            'RAIT.DECISION_GROUNDS_REQUIRED',
            422,
            { caseId: current.id },
            context.requestId,
          );
        if (
          rows(
            await tx.query(
              'select id from inf.rait_decision where tenant_id = $1 and case_id = $2',
              [context.tenantId, current.id],
            ),
          ).length
        )
          fail(
            'RAIT.DECISION_ALREADY_SIGNED',
            409,
            { caseId: current.id },
            context.requestId,
          );
      }
      const draftId = input.command === 'decide' ? undefined : payload.draftId;
      const draft = rows(
        await tx.query<DraftRow>(
          `select id, author_id, document_id, content_hash, status, submitted_at, return_count from inf.rait_draft where tenant_id = $1 and case_id = $2${draftId ? ' and id = $3' : ''} order by version desc limit 1 for update`,
          draftId
            ? [context.tenantId, current.id, draftId]
            : [context.tenantId, current.id],
        ),
      )[0];
      if (input.command === 'return-draft' && draft?.return_count >= 1)
        fail(
          'RAIT.DRAFT_RETURN_LIMIT',
          422,
          { caseId: current.id },
          context.requestId,
        );
      const validStatus =
        input.command === 'return-draft'
          ? draft?.status === 'submetida'
          : draft?.status === 'submetida';
      if (
        !draft ||
        !draft.document_id ||
        !draft.content_hash ||
        !draft.submitted_at ||
        !validStatus
      )
        fail(
          'RAIT.DRAFT_INCOMPLETE',
          422,
          { caseId: current.id },
          context.requestId,
        );
      if (input.command === 'ready')
        await this.requireTrust().verifyDraftManifest({
          tenantId: context.tenantId,
          documentId: draft.document_id!,
          contentHash: draft.content_hash,
        });
      if (input.command === 'decide')
        await this.decisionGuard(tx, input, current, draft, context);
    }
    if (input.command === 'withdraw') {
      if (
        rows(
          await tx.query(
            'select id from inf.rait_decision where tenant_id = $1 and case_id = $2',
            [context.tenantId, current.id],
          ),
        ).length
      )
        fail(
          'RAIT.WITHDRAWAL_AFTER_DECISION',
          409,
          { caseId: current.id },
          context.requestId,
        );
      const agenda = rows(
        await tx.query<Record<string, unknown>>(
          `select item.id, session.id as session_id, session.state,
                  session.opened_at
             from inf.rait_agenda_item item
             join inf.rait_session session
               on session.tenant_id = item.tenant_id
              and session.id = item.session_id
            where item.tenant_id = $1 and item.case_id = $2
              and item.withdrawn = false
            for update of item, session`,
          [context.tenantId, current.id],
        ),
      )[0];
      if (
        agenda?.opened_at ||
        [
          'SESSAO_ABERTA',
          'RELATORIA_LIDA',
          'SUSTENTACAO_ORAL',
          'VOTACAO',
          'DESEMPATE_PRESIDENTE',
          'DECISAO_PROCLAMADA',
          'ATA_LAVRADA',
          'ATA_ASSINADA',
        ].includes(String(agenda?.state))
      )
        fail(
          'RAIT.CASE_STATE_INVALID',
          409,
          { caseId: current.id, currentState: current.state },
          context.requestId,
        );
      const parties = rows(
        await tx.query<Record<string, unknown>>(
          "select id, role, legitimacy_basis, representation_verified from inf.rait_party where tenant_id = $1 and case_id = $2 and (role = 'requerente' or (role = 'procurador' and representation_verified = true))",
          [context.tenantId, current.id],
        ),
      );
      const eligible = parties.filter(
        (party) =>
          (party.role === 'requerente' && Boolean(party.legitimacy_basis)) ||
          (party.role === 'procurador' &&
            party.representation_verified === true),
      );
      if (!eligible.length)
        fail(
          'RAIT.WITHDRAWAL_LEGITIMACY',
          422,
          { caseId: current.id },
          context.requestId,
        );
      const document = rows(
        await tx.query<Record<string, unknown>>(
          'select id, content_hash from inf.rait_document where tenant_id = $1 and case_id = $2 and id = $3 for update',
          [context.tenantId, current.id, payload.withdrawalDocumentId],
        ),
      )[0];
      if (!document)
        fail(
          'RAIT.WITHDRAWAL_LEGITIMACY',
          422,
          { caseId: current.id },
          context.requestId,
        );
      const attestation = await this.requireTrust().verifyWithdrawalEvidence({
        tenantId: context.tenantId,
        caseId: current.id,
        documentId: String(document.id),
        contentHash: String(document.content_hash),
        eligiblePartyIds: eligible.map((party) => String(party.id)),
      });
      await tx.query(
        `insert into inf.rait_withdrawal_attestation
           (tenant_id, case_id, document_id, signer_party_id,
            verification_method, evidence_ref, verified_at, recorded_by)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          context.tenantId,
          current.id,
          document.id,
          attestation.signerPartyId,
          attestation.verificationMethod,
          attestation.evidenceRef,
          attestation.verifiedAt,
          context.actorId,
        ],
      );
    }
    if (input.command === 'redirect') {
      const agency = rows(
        await tx.query<Record<string, unknown>>(
          'select traffic_agency_id from inf.ait_ait where tenant_id = $1 and id = $2',
          [context.tenantId, current.ait_id],
        ),
      )[0];
      if (payload.targetBody === agency?.traffic_agency_id)
        fail(
          'RAIT.REDIRECT_SAME_BODY',
          422,
          { caseId: current.id },
          context.requestId,
        );
      const receipt = rows(
        await tx.query(
          'select id from inf.rait_document where tenant_id = $1 and case_id = $2 and id = $3',
          [context.tenantId, current.id, payload.receiptDocumentId],
        ),
      )[0];
      if (!receipt)
        fail(
          'RAIT.TENANT_MISMATCH',
          404,
          { caseId: current.id },
          context.requestId,
        );
    }
    if (input.command === 'resolve-pending') {
      const pending = rows(
        await tx.query<Record<string, unknown>>(
          'select id, due_on from inf.rait_pending_content where tenant_id = $1 and id = $2 and case_id = $3 and closed_at is null for update',
          [context.tenantId, payload.pendingId, current.id],
        ),
      )[0];
      if (!pending || civilDate(pending.due_on) < today())
        fail(
          'RAIT.PENDING_CONTENT_EXPIRED',
          409,
          { caseId: current.id },
          context.requestId,
        );
      const documentIds = payload.documentIds as string[];
      const documents = rows(
        await tx.query<Record<string, unknown>>(
          'select id from inf.rait_document where tenant_id = $1 and case_id = $2 and id = any($3::uuid[]) for update',
          [context.tenantId, current.id, documentIds],
        ),
      );
      if (documents.length !== documentIds.length)
        fail(
          'RAIT.TENANT_MISMATCH',
          404,
          { caseId: current.id },
          context.requestId,
        );
      for (const documentId of documentIds)
        await tx.query(
          'insert into inf.rait_pending_document (tenant_id, pending_id, document_id, attached_by) values ($1,$2,$3,$4) on conflict (tenant_id, pending_id, document_id) do nothing',
          [context.tenantId, payload.pendingId, documentId, context.actorId],
        );
    }
  }

  private requireDeadlines(): RaitDeadlineEngineFactory {
    return this.deadlines;
  }

  private requireTrust(): RaitDocumentTrustVerifier {
    return this.trust;
  }

  private async remitGuard(
    tx: Tx,
    current: CaseRow,
    context: { tenantId: string; requestId?: string },
  ) {
    const missing: string[] = [];
    const ait = rows(
      await tx.query(
        'select id from inf.ait_ait where tenant_id = $1 and id = $2',
        [context.tenantId, current.ait_id],
      ),
    )[0];
    if (!ait) missing.push('AIT');

    const origin = current.origin_case_id
      ? rows(
          await tx.query<CaseRow>(
            'select id, ait_id, state, version, instance from inf.rait_case where tenant_id = $1 and id = $2',
            [context.tenantId, current.origin_case_id],
          ),
        )[0]
      : undefined;
    const validOrigin =
      origin?.ait_id === current.ait_id && origin?.instance === 'defesa_previa';
    const originId = validOrigin ? origin?.id : undefined;
    const evidenceLinks = rows(
      await tx.query<Record<string, unknown>>(
        `select link.mandatory, evidence.id as evidence_id,
                evidence.status, evidence.storage_uri,
                evidence.hash_algorithm, evidence.hash_value
           from ops.evidence_link link
           left join ops.evidence_evidence evidence
             on evidence.id = link.evidence_id
            and evidence.tenant_id = link.tenant_id
          where link.tenant_id = $1
            and link.entity_type = $2
            and link.entity_id = $3`,
        [context.tenantId, 'inf.ait_ait', current.ait_id],
      ),
    );
    const isValidEvidence = (link: Record<string, unknown>) =>
      Boolean(link.evidence_id) &&
      ['validated', 'linked', 'packaged'].includes(String(link.status)) &&
      typeof link.storage_uri === 'string' &&
      link.storage_uri.trim().length > 0 &&
      typeof link.hash_algorithm === 'string' &&
      link.hash_algorithm.trim().length > 0 &&
      typeof link.hash_value === 'string' &&
      link.hash_value.trim().length > 0;
    if (
      !evidenceLinks.some(isValidEvidence) ||
      evidenceLinks.some(
        (link) => link.mandatory === true && !isValidEvidence(link),
      )
    )
      missing.push('TEAT_EVIDENCE');
    const notices = rows(
      await tx.query<Record<string, unknown>>(
        `select notice.id, notice.kind, notice.status, notice.document_id,
                acknowledgement.id as acknowledgement_id
           from inf.notice notice
           left join inf.notice_acknowledgement acknowledgement
             on acknowledgement.tenant_id = notice.tenant_id
            and acknowledgement.notice_id = notice.id
          where notice.tenant_id = $1
            and notice.infraction_id =
                (select id from inf.infraction where tenant_id = $1 and ait_id = $2)
            and notice.kind in ($3, $4)`,
        [context.tenantId, current.ait_id, 'NA', 'NP'],
      ),
    );
    const noticeAvailable = (kind: string) =>
      notices.find(
        (item) =>
          item.kind === kind &&
          ['expedida', 'publicada', 'eficaz'].includes(String(item.status)) &&
          Boolean(item.document_id),
      );
    const na = noticeAvailable('NA');
    const np = noticeAvailable('NP');
    if (!na) missing.push('NA');
    if (!na?.acknowledgement_id) missing.push('NA_ACK');
    if (!np) missing.push('NP');
    if (!np?.acknowledgement_id) missing.push('NP_ACK');

    const defenseDecision = originId
      ? rows(
          await tx.query(
            `select id from inf.rait_decision
              where tenant_id = $1 and case_id = $2
                and signature_ref is not null
                and length(btrim(signature_ref)) > 0`,
            [context.tenantId, originId],
          ),
        )[0]
      : undefined;
    if (!defenseDecision) missing.push('DEFENSE_DECISION');
    const defenseDraft = originId
      ? rows(
          await tx.query(
            `select id from inf.rait_draft
              where tenant_id = $1 and case_id = $2 and status = 'assinada'
                and document_id is not null and length(btrim(content_hash)) > 0`,
            [context.tenantId, originId],
          ),
        )[0]
      : undefined;
    if (!defenseDraft) missing.push('DEFENSE_DRAFT');

    const petition = rows(
      await tx.query(
        `select id from inf.rait_document
          where tenant_id = $1 and case_id = $2
            and kind = 'requerimento' and origin = 'requerente'`,
        [context.tenantId, current.id],
      ),
    )[0];
    if (!petition) missing.push('PETITION');

    const admissibility = rows(
      await tx.query<Record<string, unknown>>(
        'select criterion, verdict from inf.rait_admissibility where tenant_id = $1 and case_id = $2',
        [context.tenantId, current.id],
      ),
    );
    const criteria = new Set(admissibility.map((item) => item.criterion));
    if (
      ![
        'tempestividade',
        'legitimidade',
        'assinatura',
        'pedido_compativel',
      ].every((criterion) => criteria.has(criterion))
    )
      missing.push('ADMISSIBILITY');
    if (missing.length)
      fail(
        'RAIT.REMIT_CHECKLIST_INCOMPLETE',
        422,
        { caseId: current.id, missing },
        context.requestId,
      );
  }

  private async decisionGuard(
    tx: Tx,
    input: CommandInput,
    current: CaseRow,
    draft: DraftRow,
    context: { tenantId: string; actorId: string; requestId?: string },
  ) {
    if (draft.author_id === context.actorId)
      fail(
        'RAIT.DRAFT_AUTHOR_CANNOT_SIGN',
        403,
        { caseId: current.id },
        context.requestId,
      );
    const deadline = rows(
      await tx.query<Record<string, unknown>>(
        'select id, due_on from inf.rait_deadline where tenant_id = $1 and case_id = $2 and timer_code = $3 and satisfied_at is null',
        [context.tenantId, current.id, 'T-DEC'],
      ),
    )[0];
    if (!deadline || String(deadline.due_on) < today())
      fail(
        'RAIT.EXTINCTION_DECISION_LATE',
        422,
        { caseId: current.id },
        context.requestId,
      );
    const authority = rows(
      await tx.query<Record<string, unknown>>(
        "select id, pool_id, agency_jurisdiction_id, is_substitute from inf.rait_pool_member where tenant_id = $1 and person_id = $2 and member_role = 'autoridade' and status = 'ATIVO'",
        [context.tenantId, context.actorId],
      ),
    )[0];
    if (
      !authority ||
      authority.agency_jurisdiction_id !== current.agency_jurisdiction_id
    )
      fail(
        'RAIT.DECISION_JURISDICTION',
        403,
        { caseId: current.id },
        context.requestId,
      );
    const ait = rows(
      await tx.query<Record<string, unknown>>(
        'select traffic_agency_id from inf.ait_ait where tenant_id = $1 and id = $2',
        [context.tenantId, current.ait_id],
      ),
    )[0];
    const jurisdiction = rows(
      await tx.query<Record<string, unknown>>(
        'select id, traffic_agency_id from ops.agency_jurisdiction where tenant_id = $1 and id = $2',
        [context.tenantId, current.agency_jurisdiction_id],
      ),
    )[0];
    if (
      !jurisdiction ||
      jurisdiction.traffic_agency_id !== ait?.traffic_agency_id
    )
      fail(
        'RAIT.DECISION_JURISDICTION',
        403,
        { caseId: current.id },
        context.requestId,
      );
    const schedule = rows(
      await tx.query<Record<string, unknown>>(
        'select id, availability from inf.rait_schedule where tenant_id = $1 and member_id = $2 and kind = $3 and period_start <= $4 and period_end >= $4 and published_at is not null',
        [context.tenantId, authority.id, 'escala_assinatura', today()],
      ),
    )[0];
    if (!schedule)
      fail(
        'RAIT.DECISION_NOT_ON_DUTY',
        422,
        { caseId: current.id },
        context.requestId,
      );
    const slot = rows(
      await tx.query<Record<string, unknown>>(
        'select slot.availability from inf.rait_schedule_slot slot where slot.tenant_id = $1 and slot.slot_on = $2 and slot.schedule_id = $3',
        [context.tenantId, today(), schedule.id],
      ),
    )[0];
    if (
      !slot ||
      !['DISPONIVEL', 'EM_PLANTAO'].includes(String(slot.availability))
    )
      fail(
        'RAIT.DECISION_NOT_ON_DUTY',
        422,
        { caseId: current.id },
        context.requestId,
      );
    await this.requireTrust().verifySignatureEvidence({
      tenantId: context.tenantId,
      signatureRef: String(input.payload.signatureRef),
      documentId: draft.document_id!,
      contentHash: draft.content_hash,
      expectedSignerPersonId: context.actorId,
    });
  }

  private async claim(
    tx: Tx,
    tenantId: string,
    actorId: string,
    poolId: string,
  ): Promise<CaseRow | undefined> {
    const pool = rows(
      await tx.query<Record<string, unknown>>(
        'select id, instance, unit_id, strategy, active from inf.rait_pool where tenant_id = $1 and id = $2 for update',
        [tenantId, poolId],
      ),
    )[0];
    if (!pool || pool.active !== true || pool.strategy !== 'pull')
      fail('RAIT.FORBIDDEN_CASE_SCOPE', 403, { poolId });
    const member = rows(
      await tx.query<Record<string, unknown>>(
        "select id, pool_id, status from inf.rait_pool_member where tenant_id = $1 and pool_id = $2 and person_id = $3 and member_role = 'analista' for update",
        [tenantId, poolId, actorId],
      ),
    )[0];
    if (!member) fail('RAIT.FORBIDDEN_CASE_SCOPE', 403, { poolId });
    if (member.status !== 'ATIVO')
      fail('RAIT.MEMBER_NOT_AVAILABLE', 422, {
        memberId: member.id,
        status: member.status,
      });
    const schedule = rows(
      await tx.query<Record<string, unknown>>(
        "select id, wip_limit, availability from inf.rait_schedule where tenant_id = $1 and pool_id = $2 and member_id = $3 and kind = 'escala_semanal' and period_start <= $4 and period_end >= $4 and published_at is not null order by period_start desc limit 1 for update",
        [tenantId, poolId, member.id, today()],
      ),
    )[0];
    if (!schedule)
      fail('RAIT.MEMBER_NOT_AVAILABLE', 422, { memberId: member.id });
    const slot = rows(
      await tx.query<Record<string, unknown>>(
        'select availability from inf.rait_schedule_slot where tenant_id = $1 and schedule_id = $2 and slot_on = $3',
        [tenantId, schedule.id, today()],
      ),
    )[0];
    const availability = slot?.availability;
    if (!slot || !['DISPONIVEL', 'EM_PLANTAO'].includes(String(availability)))
      fail('RAIT.MEMBER_NOT_AVAILABLE', 422, {
        memberId: member.id,
        availability,
      });
    if (schedule.wip_limit === null || schedule.wip_limit === undefined)
      fail('RAIT.PARAMETER_SOURCE_PENDING', 422, { poolId });
    const candidate = rows(
      await tx.query<CaseRow>(
        `select item.id, item.state, item.version, item.instance,
                item.tenant_id, item.ait_id, item.origin_case_id,
                item.agency_jurisdiction_id
           from inf.rait_case item
          where item.tenant_id = $1
            and item.state = 'DISTRIBUIDO'
            and item.instance = $2
            and item.unit_id is not distinct from $3::uuid
            and not exists (
              select 1 from inf.rait_assignment assignment
               where assignment.tenant_id = item.tenant_id
                 and assignment.case_id = item.id and assignment.active = true
            )
            and not exists (
              select 1 from inf.rait_impediment impediment
               where impediment.tenant_id = item.tenant_id
                 and impediment.case_id = item.id
                 and impediment.member_id = $4
            )
          order by case item.legal_priority
                     when 'level_2' then 2
                     when 'level_1' then 1
                     else 0
                   end desc,
                   item.protocolled_at asc, item.id asc
          for update skip locked limit 1`,
        [tenantId, pool.instance, pool.unit_id, member.id],
      ),
    )[0];
    if (!candidate || candidate.state !== 'DISTRIBUIDO')
      fail('RAIT.QUEUE_EMPTY', 409, { poolId });
    const existingAssignment = rows(
      await tx.query<Record<string, unknown>>(
        `select id, member_id from inf.rait_assignment
          where tenant_id = $1 and case_id = $2 and active = true
          for update`,
        [tenantId, candidate.id],
      ),
    )[0];
    if (existingAssignment)
      fail('RAIT.ASSIGNMENT_ALREADY_ACTIVE', 409, {
        caseId: candidate.id,
        assignmentId: existingAssignment.id,
        memberId: existingAssignment.member_id,
      });
    const active = rows(
      await tx.query<{ count: string }>(
        `select count(*)::text as count
           from inf.rait_assignment assignment
           join inf.rait_case item
             on item.tenant_id = assignment.tenant_id
            and item.id = assignment.case_id
          where assignment.tenant_id = $1
            and assignment.member_id = $2
            and assignment.active = true
            and item.state in ('EM_INSTRUCAO','DILIGENCIA')`,
        [tenantId, member.id],
      ),
    )[0];
    const wip = Number(active?.count ?? 0);
    const limit = Number(schedule.wip_limit);
    if (wip >= limit) fail('RAIT.ASSIGNMENT_WIP_LIMIT', 422, { wip, limit });
    const assignment = rows(
      await tx.query<{ id: string }>(
        'insert into inf.rait_assignment (tenant_id, case_id, pool_id, member_id, assigned_by, active) values ($1, $2, $3, $4, $5, true) returning id',
        [tenantId, candidate.id, poolId, member.id, actorId],
      ),
    )[0];
    return { ...candidate, assignment_id: assignment?.id };
  }

  private async effects(
    tx: Tx,
    input: CommandInput,
    current: CaseRow,
    context: { tenantId: string; actorId: string },
  ) {
    const payload = input.payload;
    if (input.command === 'decide') {
      await tx.query(
        'insert into inf.rait_decision (tenant_id, case_id, circuit, decision_kind, grounds, decided_by, signature_kind, signature_ref) values ($1, $2, 1, $3, $4, $5, $6, $7)',
        [
          context.tenantId,
          current.id,
          payload.decisionKind,
          payload.grounds,
          context.actorId,
          'PAdES-TSA',
          payload.signatureRef,
        ],
      );
      await tx.query(
        `update inf.rait_draft
            set status = 'assinada', updated_at = clock_timestamp()
          where tenant_id = $1 and case_id = $2 and status = 'submetida'
            and id = (
              select id from inf.rait_draft
               where tenant_id = $1 and case_id = $2
               order by version desc limit 1
            )`,
        [context.tenantId, current.id],
      );
    }
    if (input.command === 'return-draft')
      await tx.query(
        "update inf.rait_draft set status = 'devolvida', returned_at = clock_timestamp(), return_guidance = $1, return_count = return_count + 1 where tenant_id = $2 and id = $3",
        [payload.guidance, context.tenantId, payload.draftId],
      );
    if (input.command === 'withdraw') {
      await tx.query(
        "update inf.rait_inquiry set answered_at = clock_timestamp(), outcome = 'expirada', updated_at = clock_timestamp() where tenant_id = $1 and case_id = $2 and answered_at is null",
        [context.tenantId, current.id],
      );
      await tx.query(
        `update inf.rait_agenda_item item
            set withdrawn = true, withdrawn_reason = 'desistencia',
                updated_at = clock_timestamp()
           from inf.rait_session session
          where item.tenant_id = $1 and item.case_id = $2
            and session.tenant_id = item.tenant_id
            and session.id = item.session_id
            and session.opened_at is null
            and session.state in ('FORMANDO_PAUTA','PAUTA_FECHADA',
                                  'CONVOCACAO_ENVIADA','SESSAO_ADIADA')`,
        [context.tenantId, current.id],
      );
    }
    if (input.command === 'redirect')
      await tx.query(
        `insert into inf.rait_redirect
           (tenant_id, case_id, direction, reason, protocol_number, ait_number,
            counterpart_agency, deadline_restored, receipt_document_id, redirected_by)
         select $1, item.id, $2, $3, item.protocol_number, ait.ait_number,
                $4, $5, $6, $7
           from inf.rait_case item
           join inf.ait_ait ait
             on ait.id = item.ait_id and ait.tenant_id = item.tenant_id
          where item.tenant_id = $1 and item.id = $8
         on conflict (tenant_id, direction, protocol_number) do update
           set reason = excluded.reason,
               counterpart_agency = excluded.counterpart_agency,
               deadline_restored = excluded.deadline_restored,
               receipt_document_id = excluded.receipt_document_id,
               redirected_by = excluded.redirected_by,
               redirected_at = clock_timestamp(),
               updated_at = clock_timestamp()`,
        [
          context.tenantId,
          'saida',
          payload.reason,
          payload.targetBody,
          payload.reason === 'orgao_incompetente',
          payload.receiptDocumentId,
          context.actorId,
          current.id,
        ],
      );
    if (input.command === 'resolve-pending')
      await tx.query(
        "update inf.rait_pending_content set closed_at = clock_timestamp(), outcome = 'atendida', updated_at = clock_timestamp() where tenant_id = $1 and id = $2 and case_id = $3 and closed_at is null",
        [context.tenantId, payload.pendingId, current.id],
      );
  }

  private events(
    input: CommandInput,
    current: CaseRow,
    next: string,
  ): Record<string, unknown>[] {
    const command = input.command;
    if (command === 'redirect') return [];
    const changed = {
      type: 'rait.case.changed',
      aggregateId: current.id,
      caseId: current.id,
      fromState: current.state,
      toState: next,
      instance: current.instance,
    };
    if (command === 'admit' && ['jari', 'cetran'].includes(current.instance))
      return [
        changed,
        {
          type: 'rait.case.admitted',
          aggregateId: current.id,
          caseId: current.id,
          aitId: current.ait_id,
          instance: current.instance,
          admittedAt: current.admitted_at,
        },
      ];
    if (command === 'receive')
      return [
        changed,
        {
          type: 'rait.case.received',
          aggregateId: current.id,
          caseId: current.id,
          body: input.payload.body,
          receivedOn: input.payload.receivedOn,
        },
      ];
    if (command === 'withdraw')
      return [
        changed,
        {
          type: 'rait.case.withdrawn',
          aggregateId: current.id,
          caseId: current.id,
          instance: current.instance,
          withdrawnOn: current.closed_at,
          documentId: input.payload.withdrawalDocumentId,
        },
      ];
    if (command === 'claim-next')
      return [
        {
          type: 'rait.assignment.changed',
          aggregateId: current.assignment_id ?? current.id,
          caseId: current.id,
          assignmentId: current.assignment_id,
          poolId: input.targetId,
          active: true,
        },
        changed,
      ];
    return [changed];
  }
}
