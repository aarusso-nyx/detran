import { createHash } from 'node:crypto';

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
type Effects = { writes: string[]; events: string[]; audits: string[] };
type Clock = { now(): Date };
type Fixture = Record<string, unknown>;
type Result = {
  data: Record<string, unknown>;
  events: Array<{ type: string }>;
  etag: string;
};
export type SessionCommandInput = {
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
  'oral_argument',
  'outcome',
  'result',
  'document_id',
  'documentId',
  'content_hash',
  'contentHash',
  'snapshot_hash',
  'snapshotHash',
  'signer_person_ids',
  'signerPersonIds',
  'required_signer_person_ids',
  'requiredSignerPersonIds',
]);
const rows = <T>(result: { rows: T[] } | undefined): T[] => result?.rows ?? [];
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
  input: Pick<SessionCommandInput, 'command' | 'targetId' | 'payload'>,
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
  input: Pick<SessionCommandInput, 'payload' | 'headers'>,
) => {
  if (
    Object.keys(input.payload).some((field) =>
      forbiddenPayloadFields.has(field),
    )
  )
    fail('RAIT.VALIDATION_FAILED', 400);
  if (!input.headers['Idempotency-Key']) fail('RAIT.VALIDATION_FAILED', 400);
  if (!input.headers['If-Match']) fail('RAIT.IF_MATCH_REQUIRED', 428);
};

/** Frozen sensor adapter; the wired service below is the production path. */
export function createSessionCommandRuntime(input: HarnessInput) {
  const replays = new Map<string, { fingerprint: string; result: Result }>();
  return {
    async execute(raw: Record<string, unknown>): Promise<Result> {
      const request: SessionCommandInput = {
        command: String(raw.command ?? ''),
        targetId: String(raw.targetId ?? 'fixture-session'),
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
        const result = sessionFixtureCommand(
          request.command,
          request.payload,
          input.fixture,
          input.effects,
          input.clock,
        );
        replays.set(key, { fingerprint: digest, result });
        return result;
      });
    },
  };
}

function sessionFixtureCommand(
  command: string,
  payload: Record<string, unknown>,
  fixture: Fixture,
  effects: Effects,
  clock: Clock,
): Result {
  if (command === 'open') {
    if (fixture.sessionState !== 'CONVOCACAO_ENVIADA')
      fail('RAIT.SESSION_STATE_INVALID', 409);
    if (
      !fixture.chairPresent ||
      !fixture.quorumMet ||
      fixture.parityMet === false
    )
      fail('RAIT.SESSION_QUORUM_MISSING', 409);
    return fixtureSuccess(
      effects,
      clock,
      'rait.session.changed',
      'SESSAO_ABERTA',
    );
  }
  if (command === 'vote') {
    if (payload.casting_vote) fail('RAIT.CASTING_VOTE_NOT_TIED', 422);
    if (fixture.sessionState !== 'SESSAO_ABERTA')
      fail('RAIT.VOTE_ITEM_NOT_OPEN', 409);
    if (fixture.memberImpeded) fail('RAIT.VOTE_MEMBER_IMPEDED', 409);
    if (fixture.existingVote) fail('RAIT.VOTE_DUPLICATE', 409);
    return fixtureSuccess(
      effects,
      clock,
      'rait.agenda-item.changed',
      'VOTACAO',
    );
  }
  if (command === 'publish') {
    if (payload.alreadyPublished || fixture.alreadyPublished)
      fail('RAIT.MINUTES_ALREADY_PUBLISHED', 409);
    if (fixture.minutesState !== 'ATA_ASSINADA' || !fixture.allItemsComplete)
      fail('RAIT.MINUTES_NOT_READY', 409);
    return fixtureSuccess(
      effects,
      clock,
      'rait.minutes.published',
      'PUBLICADA',
    );
  }
  if (
    [
      'close-agenda',
      'adjourn',
      'convene-extraordinary',
      'read',
      'view',
      'withdraw',
    ].includes(command)
  )
    fail('RAIT.SESSION_STATE_INVALID', 409, { command });
  if (['proclaim', 'generate-minutes', 'sign-minutes'].includes(command))
    fail('RAIT.SESSION_STATE_INVALID', 409, { command });
  return fail('RAIT.VALIDATION_FAILED', 400, { command });
}

function fixtureSuccess(
  effects: Effects,
  clock: Clock,
  type: string,
  state: string,
): Result {
  effects.writes.push(state);
  effects.events.push(type);
  effects.audits.push(type);
  return {
    data: { state },
    events: [{ type }],
    etag: `\"${clock.now().toISOString()}\"`,
  };
}

@Injectable()
export class RaitSessionCommandService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  private readonly caseTransitions = new RaitCaseTransitionPort();
  private readonly deadlines = new RaitDeadlineEngineFactory();
  private readonly trust = new DocumentTrustHttpAdapter();

  async execute(input: SessionCommandInput): Promise<Result> {
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
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    if (input.command === 'close-agenda')
      return this.closeAgenda(tx, input, context);
    if (input.command === 'open') return this.open(tx, input, context);
    if (input.command === 'adjourn') return this.adjourn(tx, input, context);
    if (input.command === 'convene-extraordinary')
      return this.conveneExtraordinary(tx, input, context);
    if (input.command === 'read') return this.read(tx, input, context);
    if (input.command === 'view') return this.view(tx, input, context);
    if (input.command === 'withdraw')
      return this.withdrawAgendaItem(tx, input, context);
    if (input.command === 'vote') return this.vote(tx, input, context);
    if (input.command === 'proclaim') return this.proclaim(tx, input, context);
    if (input.command === 'generate-minutes')
      return this.createMinutes(tx, input, context);
    if (input.command === 'sign-minutes')
      return this.signMinutes(tx, input, context);
    if (input.command === 'publish') return this.publish(tx, input, context);
    return fail('RAIT.VALIDATION_FAILED', 400, { command: input.command });
  }

  private async open(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const session = rows<{
      id: string;
      state: string;
      judging_body: string;
      quorum_required: number;
      quorum_observed: number | null;
      version: number;
      updated_at: string | null;
      created_at: string;
    }>(
      await tx.query(
        'select id, state, judging_body, quorum_required, quorum_observed, version, updated_at, created_at from inf.rait_session where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!session)
      fail('RAIT.TENANT_MISMATCH', 404, { sessionId: input.targetId });
    this.requireEtag(input.headers['If-Match'], session);
    if (session.state !== 'CONVOCACAO_ENVIADA')
      fail('RAIT.SESSION_STATE_INVALID', 409, {
        sessionId: session.id,
        currentState: session.state,
      });
    const bench = rows<{ state: string }>(
      await tx.query(
        'select state from inf.rait_bench where tenant_id = $1 and session_id = $2 for update',
        [context.tenantId, session.id],
      ),
    )[0];
    if (!bench || bench.state !== 'BANCA_CONFIRMADA')
      fail('RAIT.BENCH_INSUFFICIENT', 422, { sessionId: session.id });
    const attendance = rows<{
      present: boolean;
      is_chair: boolean;
      is_chair_substitute: boolean;
      representation_block: string | null;
      mandate_starts_on_snapshot: string | null;
      mandate_ends_on_snapshot: string | null;
      institutional_valid_from: string | null;
      institutional_valid_to: string | null;
    }>(
      await tx.query(
        'select present, is_chair, is_chair_substitute, representation_block, mandate_starts_on_snapshot::text, mandate_ends_on_snapshot::text, institutional_valid_from::text, institutional_valid_to::text from inf.rait_attendance where tenant_id = $1 and session_id = $2 for update',
        [context.tenantId, session.id],
      ),
    );
    const now = rows<{ now: string }>(
      await tx.query('select clock_timestamp()::text as now'),
    )[0]?.now;
    if (!now) fail('RAIT.PARAMETER_SOURCE_PENDING', 422, { key: 'clock' });
    const isCurrent = (member: (typeof attendance)[number]) =>
      member.present &&
      Boolean(member.mandate_starts_on_snapshot) &&
      member.mandate_starts_on_snapshot! <= now.slice(0, 10) &&
      (!member.mandate_ends_on_snapshot ||
        member.mandate_ends_on_snapshot >= now.slice(0, 10)) &&
      Boolean(member.institutional_valid_from) &&
      member.institutional_valid_from! <= now.slice(0, 10) &&
      (!member.institutional_valid_to ||
        member.institutional_valid_to >= now.slice(0, 10));
    const present = attendance.filter(isCurrent);
    const observed = present.length;
    const chairPresent = attendance.some(
      (member) =>
        isCurrent(member) && (member.is_chair || member.is_chair_substitute),
    );
    const representation = new Set(
      present
        .map((member) => member.representation_block)
        .filter((value): value is string => Boolean(value)),
    );
    if (
      !chairPresent ||
      observed < session.quorum_required ||
      (session.judging_body === 'cetran' && representation.size < 2)
    )
      fail('RAIT.SESSION_QUORUM_MISSING', 422, {
        required: session.quorum_required,
        observed,
      });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        "update inf.rait_session set state = 'SESSAO_ABERTA', quorum_observed = $1, opened_at = clock_timestamp(), version = version + 1, updated_at = clock_timestamp() where tenant_id = $2 and id = $3 returning *",
        [observed, context.tenantId, session.id],
      ),
    )[0];
    if (!updated) fail('RAIT.SESSION_STATE_INVALID', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.session.changed',
      'INF_RAIT_SESSION_OPEN',
      'inf.rait_session',
    );
  }

  private async closeAgenda(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const session = await this.lockSession(
      tx,
      input,
      context,
      'FORMANDO_PAUTA',
    );
    await this.requireParameter(tx, context.tenantId, 'rait.timer.T-CONV');
    const items = rows<{
      id: string;
      case_id: string;
      priority: boolean;
      opinion_registered_at: string | null;
    }>(
      await tx.query(
        'select id, case_id, priority, opinion_registered_at from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 order by position, id for update',
        [context.tenantId, session.id],
      ),
    );
    if (items.some((item) => !item.opinion_registered_at))
      fail('RAIT.AGENDA_ITEM_WITHOUT_OPINION', 422, { sessionId: session.id });
    const critical = rows<{ case_id: string }>(
      await tx.query(
        'select case_id from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 and priority = true for update',
        [context.tenantId, session.id],
      ),
    );
    if (!critical.length)
      fail('RAIT.AGENDA_CRITICAL_MISSING', 422, { sessionId: session.id });
    await this.requireConveneDeadline(tx, context.tenantId, session, input);
    const port = this.requireCaseTransitions();
    for (const item of items) {
      await port.scheduleForSession(tx as Transaction, {
        tenantId: context.tenantId,
        caseId: item.case_id,
        actorId: context.actorId,
        expectedFrom: 'PRONTO_P_DECISAO',
        idempotencyKey: input.headers['Idempotency-Key'],
      });
    }
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        "update inf.rait_session set state = 'PAUTA_FECHADA', agenda_closed_at = clock_timestamp(), version = version + 1, updated_at = clock_timestamp() where tenant_id = $1 and id = $2 returning *",
        [context.tenantId, session.id],
      ),
    )[0];
    if (!updated)
      fail('RAIT.SESSION_STATE_INVALID', 409, { sessionId: session.id });
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.session.changed',
      'INF_RAIT_SESSION_CLOSE_AGENDA',
      'inf.rait_session',
    );
  }

  private async adjourn(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const session = await this.lockSession(tx, input, context, 'SESSAO_ABERTA');
    const reason = input.payload.reason;
    if (
      typeof reason !== 'string' ||
      !['sem_quorum', 'motivo_tipado'].includes(reason)
    )
      fail('RAIT.SESSION_STATE_INVALID', 409, { sessionId: session.id });
    const items = rows<{ case_id: string }>(
      await tx.query(
        'select case_id from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 and proclaimed_at is null and withdrawn = false order by case_id for update',
        [context.tenantId, session.id],
      ),
    );
    const port = this.requireCaseTransitions();
    for (const item of items)
      await port.returnToDecisionQueue(tx as Transaction, {
        tenantId: context.tenantId,
        caseId: item.case_id,
        actorId: context.actorId,
        expectedFrom: 'PAUTADO',
        idempotencyKey: input.headers['Idempotency-Key'],
      });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        "update inf.rait_session set state = 'SESSAO_ADIADA', adjourned_reason = $1, version = version + 1, updated_at = clock_timestamp() where tenant_id = $2 and id = $3 returning *",
        [reason, context.tenantId, session.id],
      ),
    )[0];
    if (!updated) fail('RAIT.SESSION_STATE_INVALID', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.session.changed',
      'INF_RAIT_SESSION_ADJOURN',
      'inf.rait_session',
    );
  }

  private async conveneExtraordinary(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const session = await this.lockSession(
      tx,
      input,
      context,
      'FORMANDO_PAUTA',
    );
    await this.requireParameter(
      tx,
      context.tenantId,
      'session.calendar.ordinary_cadence',
    );
    const critical = rows<{ id: string }>(
      await tx.query(
        'select id from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 and priority = true for update',
        [context.tenantId, session.id],
      ),
    );
    if (!critical.length)
      fail('RAIT.EXTRAORDINARY_NO_CRITICAL', 422, { sessionId: session.id });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        "update inf.rait_session set extraordinary = true, convened_at = clock_timestamp(), state = 'CONVOCACAO_ENVIADA', version = version + 1, updated_at = clock_timestamp() where tenant_id = $1 and id = $2 returning *",
        [context.tenantId, session.id],
      ),
    )[0];
    if (!updated) fail('RAIT.SESSION_STATE_INVALID', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.session.changed',
      'INF_RAIT_SESSION_CONVENE_EXTRAORDINARY',
      'inf.rait_session',
    );
  }

  private async read(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const item = await this.lockAgendaItem(tx, input, context);
    await this.requireItemReadiness(tx, context, item, true);
    if (item.rapporteur_member_id !== context.actorId)
      fail('RAIT.FORBIDDEN_ACTION', 403, { agendaItemId: item.id });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'update inf.rait_agenda_item set read_at = clock_timestamp(), version = version + 1, updated_at = clock_timestamp() where tenant_id = $1 and id = $2 returning *',
        [context.tenantId, item.id],
      ),
    )[0];
    if (!updated) fail('RAIT.VOTE_ITEM_NOT_OPEN', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.agenda-item.changed',
      'INF_RAIT_AGENDA_ITEM_READ',
      'inf.rait_agenda_item',
    );
  }

  private async view(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    // `max_per_member` conta os pedidos do membro em todo o tenant (todas as sessões); `for update`
    // não bloqueia linhas que ainda não existem, então o escopo (tenant, membro) é serializado aqui,
    // antes de qualquer bloqueio de linha, para manter uma ordem única de locks entre pedidos.
    await tx.query(
      "select pg_advisory_xact_lock(hashtextextended('rait.view_request.max_per_member:' || $1 || ':' || $2, 0))",
      [context.tenantId, context.actorId],
    );
    const item = await this.lockAgendaItem(tx, input, context);
    await this.requireItemReadiness(tx, context, item, false);
    if (!item.read_at || item.proclaimed_at || item.withdrawn)
      fail('RAIT.VIEW_REQUEST_NOT_ALLOWED', 422, { agendaItemId: item.id });
    const enabled = await this.requireParameter(
      tx,
      context.tenantId,
      'session.view_request.enabled',
    );
    const max = await this.requireParameter(
      tx,
      context.tenantId,
      'session.view_request.max_per_member',
    );
    await this.requireParameter(
      tx,
      context.tenantId,
      'session.calendar.ordinary_cadence',
    );
    if (
      enabled.value_json !== true ||
      !Number.isInteger(Number(max.value_json))
    )
      fail('RAIT.VIEW_REQUEST_NOT_ALLOWED', 422, { agendaItemId: item.id });
    const used = rows<{ count: string }>(
      await tx.query(
        'select count(*)::text as count from (select id from inf.rait_agenda_item where tenant_id = $1 and view_requested_by = $2 for update) locked',
        [context.tenantId, context.actorId],
      ),
    )[0];
    if (Number(used?.count ?? 0) >= Number(max.value_json))
      fail('RAIT.VIEW_REQUEST_NOT_ALLOWED', 422, { agendaItemId: item.id });
    const next = rows<{ scheduled_for: string }>(
      await tx.query(
        'select scheduled_for::date::text as scheduled_for from inf.rait_session where tenant_id = $1 and judging_body = $2 and scheduled_for > clock_timestamp() and extraordinary = false order by scheduled_for, id limit 1 for update',
        [context.tenantId, item.judging_body],
      ),
    )[0];
    if (!next?.scheduled_for)
      fail('RAIT.PARAMETER_SOURCE_PENDING', 422, {
        key: 'session.calendar.ordinary_cadence',
      });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'update inf.rait_agenda_item set view_requested_by = $1, view_due_on = $2, version = version + 1, updated_at = clock_timestamp() where tenant_id = $3 and id = $4 returning *',
        [context.actorId, next.scheduled_for, context.tenantId, item.id],
      ),
    )[0];
    if (!updated) fail('RAIT.VIEW_REQUEST_NOT_ALLOWED', 422);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.agenda-item.changed',
      'INF_RAIT_AGENDA_ITEM_VIEW',
      'inf.rait_agenda_item',
    );
  }

  private async withdrawAgendaItem(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const item = await this.lockAgendaItem(tx, input, context);
    const reason = input.payload.reason;
    if (
      item.proclaimed_at ||
      typeof reason !== 'string' ||
      !['impedimento', 'sem_quorum', 'motivo_tipado'].includes(reason)
    )
      fail('RAIT.SESSION_STATE_INVALID', 409, { agendaItemId: item.id });
    const port = this.requireCaseTransitions();
    await port.returnToDecisionQueue(tx as Transaction, {
      tenantId: context.tenantId,
      caseId: item.case_id,
      actorId: context.actorId,
      expectedFrom: 'PAUTADO',
      idempotencyKey: input.headers['Idempotency-Key'],
    });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'update inf.rait_agenda_item set withdrawn = true, withdrawn_reason = $1, version = version + 1, updated_at = clock_timestamp() where tenant_id = $2 and id = $3 returning *',
        [reason, context.tenantId, item.id],
      ),
    )[0];
    if (!updated) fail('RAIT.SESSION_STATE_INVALID', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.agenda-item.changed',
      'INF_RAIT_AGENDA_ITEM_WITHDRAW',
      'inf.rait_agenda_item',
    );
  }

  private async vote(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const item = await this.lockAgendaItem(tx, input, context);
    await this.requireItemReadiness(tx, context, item, false);
    const vote = input.payload.vote;
    if (
      typeof vote !== 'string' ||
      ![
        'provimento',
        'nao_provimento',
        'nao_conhecimento',
        'abstencao',
      ].includes(vote)
    )
      fail('RAIT.VALIDATION_FAILED', 400, { field: 'vote' });
    const membership = rows<{
      is_chair: boolean;
      is_chair_substitute: boolean;
    }>(
      await tx.query(
        'select is_chair, is_chair_substitute from inf.rait_attendance where tenant_id = $1 and session_id = $2 and member_id = $3 and present = true for update',
        [context.tenantId, item.session_id, context.actorId],
      ),
    )[0];
    const castingVote = input.payload.casting_vote === true;
    if (castingVote) {
      if (!membership?.is_chair && !membership?.is_chair_substitute)
        fail('RAIT.CASTING_VOTE_NOT_CHAIR', 422, {
          agendaItemId: item.id,
        });
      const tally = rows<{ provimento: string; nao_provimento: string }>(
        await tx.query(
          `select
             count(*) filter (where vote = 'provimento')::text as provimento,
             count(*) filter (where vote = 'nao_provimento')::text as nao_provimento
           from inf.rait_vote
          where tenant_id = $1 and agenda_item_id = $2`,
          [context.tenantId, item.id],
        ),
      )[0];
      if (
        item.judging_body !== 'cetran' ||
        Number(tally?.provimento ?? 0) !== Number(tally?.nao_provimento ?? 0)
      )
        fail('RAIT.CASTING_VOTE_NOT_TIED', 422, { agendaItemId: item.id });
    }
    const created = rows<Record<string, unknown>>(
      await tx.query(
        'insert into inf.rait_vote (tenant_id, agenda_item_id, member_id, vote, casting_vote) values ($1,$2,$3,$4,$5) returning *',
        [context.tenantId, item.id, context.actorId, vote, castingVote],
      ),
    )[0];
    if (!created) fail('RAIT.VOTE_DUPLICATE', 409, { agendaItemId: item.id });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'update inf.rait_agenda_item set version = version + 1, updated_at = clock_timestamp() where tenant_id = $1 and id = $2 returning *',
        [context.tenantId, item.id],
      ),
    )[0];
    if (!updated)
      fail('RAIT.VOTE_ITEM_NOT_OPEN', 409, { agendaItemId: item.id });
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.agenda-item.changed',
      'INF_RAIT_VOTE_CREATE',
      'inf.rait_vote',
    );
  }

  private async proclaim(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const item = await this.lockAgendaItem(tx, input, context);
    await this.requireItemReadiness(tx, context, item, false);
    if (item.proclaimed_at || item.withdrawn)
      fail('RAIT.SESSION_STATE_INVALID', 409, { agendaItemId: item.id });
    const chair = rows<{ id: string }>(
      await tx.query(
        'select id from inf.rait_attendance where tenant_id = $1 and session_id = $2 and member_id = $3 and present = true and (is_chair = true or is_chair_substitute = true) for update',
        [context.tenantId, item.session_id, context.actorId],
      ),
    )[0];
    if (!chair) fail('RAIT.FORBIDDEN_ACTION', 403, { agendaItemId: item.id });
    const tally = rows<{ vote: string; total: string; casting: string }>(
      await tx.query(
        `select vote, count(*)::text as total,
                count(*) filter (where casting_vote)::text as casting
           from inf.rait_vote
          where tenant_id = $1 and agenda_item_id = $2
          group by vote
          order by total desc, vote`,
        [context.tenantId, item.id],
      ),
    );
    if (!tally.length)
      fail('RAIT.VOTE_ITEM_NOT_OPEN', 409, { agendaItemId: item.id });
    const first = tally[0];
    const second = tally[1];
    if (second && first.total === second.total && Number(first.casting) === 0)
      fail('RAIT.CASTING_VOTE_NOT_TIED', 422, { agendaItemId: item.id });
    const port = this.requireCaseTransitions();
    await port.proclaimSessionDecision(tx as Transaction, {
      tenantId: context.tenantId,
      caseId: item.case_id,
      actorId: context.actorId,
      expectedFrom: 'PAUTADO',
      idempotencyKey: input.headers['Idempotency-Key'],
    });
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'update inf.rait_agenda_item set outcome = $1, proclaimed_at = clock_timestamp(), version = version + 1, updated_at = clock_timestamp() where tenant_id = $2 and id = $3 returning *',
        [first.vote, context.tenantId, item.id],
      ),
    )[0];
    if (!updated)
      fail('RAIT.SESSION_STATE_INVALID', 409, { agendaItemId: item.id });
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.agenda-item.changed',
      'INF_RAIT_AGENDA_ITEM_PROCLAIM',
      'inf.rait_agenda_item',
    );
  }

  private async createMinutes(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const session = rows<{
      id: string;
      state: string;
      version: number;
      updated_at: string | null;
      created_at: string;
    }>(
      await tx.query(
        'select id, state, version, updated_at, created_at from inf.rait_session where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!session)
      fail('RAIT.TENANT_MISMATCH', 404, { sessionId: input.targetId });
    this.requireEtag(input.headers['If-Match'], session);
    const items = rows<{
      id: string;
      rapporteur_member_id: string;
      proclaimed_at: string | null;
      withdrawn: boolean;
      withdrawn_reason: string | null;
      outcome: string | null;
    }>(
      await tx.query(
        'select id, rapporteur_member_id, proclaimed_at, withdrawn, withdrawn_reason, outcome from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 order by position, id for update',
        [context.tenantId, session.id],
      ),
    );
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.proclaimed_at && (!item.withdrawn || !item.withdrawn_reason),
      )
    )
      fail('RAIT.MINUTES_NOT_READY', 409, { sessionId: session.id });
    const existing = rows<{ id: string }>(
      await tx.query(
        'select id from inf.rait_minutes where tenant_id = $1 and session_id = $2 for update',
        [context.tenantId, session.id],
      ),
    )[0];
    if (existing)
      fail('RAIT.IDEMPOTENCY_REPLAY', 409, { sessionId: session.id });
    const attendance = rows<{
      member_id: string;
      present: boolean;
      is_chair: boolean;
      is_chair_substitute: boolean;
    }>(
      await tx.query(
        'select member_id, present, is_chair, is_chair_substitute from inf.rait_attendance where tenant_id = $1 and session_id = $2 order by member_id for update',
        [context.tenantId, session.id],
      ),
    );
    const chair = attendance.find(
      (member) =>
        member.present && (member.is_chair || member.is_chair_substitute),
    );
    if (!chair)
      fail('RAIT.MINUTES_SIGNERS_MISSING', 422, { sessionId: session.id });
    const snapshot = canonical({
      sessionId: session.id,
      items,
      attendance,
      capturedFrom: 'server_session_records',
    });
    const serializedSnapshot = JSON.stringify(snapshot);
    const snapshotHash = createHash('sha256')
      .update(serializedSnapshot)
      .digest('hex');
    const minutes = rows<Record<string, unknown>>(
      await tx.query(
        'insert into inf.rait_minutes (tenant_id, session_id, content, document_hash) values ($1,$2,$3::jsonb,$4) returning *',
        [context.tenantId, session.id, serializedSnapshot, snapshotHash],
      ),
    )[0];
    if (!minutes?.id)
      fail('RAIT.MINUTES_NOT_READY', 409, { sessionId: session.id });
    await tx.query(
      "insert into inf.rait_session_minutes_snapshot (tenant_id, session_id, snapshot_version, snapshot, snapshot_hash, origin, captured_at) values ($1,$2,'session-minutes-v1',$3::jsonb,$4,'server_session_records',clock_timestamp())",
      [context.tenantId, session.id, serializedSnapshot, snapshotHash],
    );
    const signers = new Map<
      string,
      { role: string; basis: string; agendaId: string | null }
    >();
    signers.set(chair!.member_id, {
      role: 'presidente',
      basis: 'effective_chair',
      agendaId: null,
    });
    for (const item of items) {
      const reporter = attendance.find(
        (member) => member.member_id === item.rapporteur_member_id,
      );
      // A non-present rapporteur is excluded only because that absence is now
      // frozen in the immutable server-owned snapshot above.
      if (!reporter?.present) continue;
      if (!signers.has(item.rapporteur_member_id))
        signers.set(item.rapporteur_member_id, {
          role: 'relator',
          basis: 'item_rapporteur',
          agendaId: item.id,
        });
    }
    for (const [personId, signer] of signers)
      await tx.query(
        'insert into inf.rait_minutes_required_signer (tenant_id, minutes_id, person_id, signer_role, signer_basis, agenda_item_id, derived_at) values ($1,$2,$3,$4,$5,$6,clock_timestamp())',
        [
          context.tenantId,
          String(minutes.id),
          personId,
          signer.role,
          signer.basis,
          signer.agendaId,
        ],
      );
    const trust = this.requireTrust();
    const manifest = await trust.prepareSessionMinutesManifest({
      tenantId: context.tenantId,
      sessionId: session.id,
      minutesId: String(minutes.id),
      snapshotHash,
      snapshotVersion: 'session-minutes-v1',
      requiredSignerPersonIds: [...signers.keys()].sort(),
      idempotencyKey: input.headers['Idempotency-Key'],
    });
    await tx.query(
      'insert into inf.rait_session_minutes_manifest (tenant_id, session_id, minutes_id, document_id, content_hash, snapshot_hash, manifest_hash, document_kind, manifest_version, prepared_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [
        context.tenantId,
        session.id,
        String(minutes.id),
        manifest.documentId,
        manifest.contentHash,
        manifest.snapshotHash,
        manifest.manifestHash,
        manifest.documentKind,
        manifest.manifestVersion,
        manifest.preparedAt,
      ],
    );
    return this.recordMutation(
      tx,
      context,
      input,
      minutes,
      'rait.minutes.created',
      'INF_RAIT_MINUTES_CREATE',
      'inf.rait_minutes',
    );
  }

  private async signMinutes(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const minutes = await this.lockMinutes(tx, input, context);
    const manifest = rows<{
      session_id: string;
      document_id: string;
      content_hash: string;
      snapshot_hash: string;
      manifest_hash: string;
    }>(
      await tx.query(
        'select session_id, document_id, content_hash, snapshot_hash, manifest_hash from inf.rait_session_minutes_manifest where tenant_id = $1 and minutes_id = $2 for update',
        [context.tenantId, minutes.id],
      ),
    )[0];
    const required = rows<{ person_id: string }>(
      await tx.query(
        'select person_id from inf.rait_minutes_required_signer where tenant_id = $1 and minutes_id = $2 and person_id = $3 for update',
        [context.tenantId, minutes.id, context.actorId],
      ),
    )[0];
    if (!manifest || !required)
      fail('RAIT.MINUTES_SIGNERS_MISSING', 422, { minutesId: minutes.id });
    const signatureRef = input.payload.signature_ref;
    if (typeof signatureRef !== 'string' || !signatureRef.trim())
      fail('RAIT.VALIDATION_FAILED', 400, { field: 'signature_ref' });
    const verifiedSignatureRef = String(signatureRef);
    const evidence = await this.requireTrust().verifySessionMinutesEvidence({
      tenantId: context.tenantId,
      sessionId: manifest.session_id,
      minutesId: minutes.id,
      signatureRef: verifiedSignatureRef,
      documentId: manifest.document_id,
      contentHash: manifest.content_hash,
      snapshotHash: manifest.snapshot_hash,
      expectedSignerPersonId: context.actorId,
    });
    const digest = createHash('sha256')
      .update(JSON.stringify(canonical(evidence)))
      .digest('hex');
    await tx.query(
      "insert into inf.rait_minutes_signature_receipt (tenant_id, minutes_id, document_id, signer_person_id, signature_ref, receipt_digest, content_hash, snapshot_hash, manifest_hash, signature_level, tsa_status, certificate_status, revocation_method, signed_at, validated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PAdES-B-LT','GOOD','GOOD',$10,$11,$12)",
      [
        context.tenantId,
        minutes.id,
        manifest.document_id,
        context.actorId,
        verifiedSignatureRef,
        digest,
        manifest.content_hash,
        manifest.snapshot_hash,
        manifest.manifest_hash,
        evidence.certificateValidationSource,
        evidence.tsaAt,
        evidence.certificateValidatedAt,
      ],
    );
    const completeness = rows<{ required: string; received: string }>(
      await tx.query(
        `select
           (select count(*)::text from inf.rait_minutes_required_signer where tenant_id = $1 and minutes_id = $2) as required,
           (select count(*)::text from inf.rait_minutes_signature_receipt where tenant_id = $1 and minutes_id = $2) as received`,
        [context.tenantId, minutes.id],
      ),
    )[0];
    const allSigned =
      Number(completeness?.required ?? 0) > 0 &&
      completeness?.required === completeness?.received;
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        "update inf.rait_minutes set signed_at = case when $1 then clock_timestamp() else signed_at end, signed_by = case when $1 then $2 else signed_by end, signature_kind = case when $1 then 'PAdES-TSA' else signature_kind end, signature_ref = case when $1 then $3 else signature_ref end, version = version + 1, updated_at = clock_timestamp() where tenant_id = $4 and id = $5 returning *",
        [
          allSigned,
          context.actorId,
          signatureRef,
          context.tenantId,
          minutes.id,
        ],
      ),
    )[0];
    if (!updated)
      fail('RAIT.MINUTES_SIGNERS_MISSING', 422, { minutesId: minutes.id });
    if (allSigned)
      await tx.query(
        "update inf.rait_session set state = 'ATA_ASSINADA', version = version + 1, updated_at = clock_timestamp() where tenant_id = $1 and id = $2",
        [context.tenantId, manifest.session_id],
      );
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.minutes.signed',
      'INF_RAIT_MINUTES_SIGN',
      'inf.rait_minutes',
    );
  }

  private async publish(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ): Promise<Result> {
    const minutes = rows<{
      id: string;
      session_id: string;
      signed_at: string | null;
      published_at: string | null;
      judging_body: string;
      updated_at: string | null;
      created_at: string;
    }>(
      await tx.query(
        `select minutes.id, minutes.session_id, minutes.signed_at,
                minutes.published_at, minutes.version, minutes.updated_at,
                minutes.created_at, session.judging_body
           from inf.rait_minutes minutes
           join inf.rait_session session
             on session.tenant_id = minutes.tenant_id
            and session.id = minutes.session_id
          where minutes.tenant_id = $1 and minutes.id = $2
          for update of minutes, session`,
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!minutes)
      fail('RAIT.TENANT_MISMATCH', 404, { minutesId: input.targetId });
    this.requireEtag(input.headers['If-Match'], minutes);
    if (minutes.published_at)
      fail('RAIT.MINUTES_ALREADY_PUBLISHED', 409, {
        publishedAt: minutes.published_at,
      });
    if (!minutes.signed_at) fail('RAIT.MINUTES_SIGNERS_MISSING', 422);
    const signatures = rows<{ required: string; received: string }>(
      await tx.query(
        `select
           (select count(*)::text from inf.rait_minutes_required_signer where tenant_id = $1 and minutes_id = $2) as required,
           (select count(*)::text from inf.rait_minutes_signature_receipt where tenant_id = $1 and minutes_id = $2) as received`,
        [context.tenantId, minutes.id],
      ),
    )[0];
    if (
      Number(signatures?.required ?? 0) === 0 ||
      signatures?.required !== signatures?.received
    )
      fail('RAIT.MINUTES_SIGNERS_MISSING', 422, { minutesId: minutes.id });
    const pending = rows<{ id: string }>(
      await tx.query(
        'select id from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 and proclaimed_at is null and withdrawn = false for update',
        [context.tenantId, minutes.session_id],
      ),
    );
    if (pending.length)
      fail('RAIT.MINUTES_NOT_READY', 409, {
        pendingItems: pending.map((item) => item.id),
      });
    const proclaimed = rows<{ case_id: string }>(
      await tx.query(
        'select case_id from inf.rait_agenda_item where tenant_id = $1 and session_id = $2 and proclaimed_at is not null order by case_id for update',
        [context.tenantId, minutes.session_id],
      ),
    );
    const port = this.requireCaseTransitions();
    const today = rows<{ today: string }>(
      await tx.query('select current_date::text as today'),
    )[0]?.today;
    if (!today) fail('RAIT.PARAMETER_SOURCE_PENDING', 422);
    for (const item of proclaimed) {
      await port.publishSessionDecision(tx as Transaction, {
        tenantId: context.tenantId,
        caseId: item.case_id,
        actorId: context.actorId,
        expectedFrom: 'JULGADO_SESSAO',
        idempotencyKey: input.headers['Idempotency-Key'],
      });
      if (minutes.judging_body === 'jari')
        await this.deadlines.create(tx).arm({
          tenantId: context.tenantId,
          ownerKind: 'case',
          ownerId: item.case_id,
          code: 'T-R2',
          startOn: today,
          startBasis: 'publicação da decisão da JARI',
          legalBasis: 'CTB art. 288; RN-RAIT-103, RN-RAIT-130',
        });
    }
    const updated = rows<Record<string, unknown>>(
      await tx.query(
        'update inf.rait_minutes set published_at = clock_timestamp(), version = version + 1, updated_at = clock_timestamp() where tenant_id = $1 and id = $2 returning *',
        [context.tenantId, minutes.id],
      ),
    )[0];
    if (!updated) fail('RAIT.MINUTES_ALREADY_PUBLISHED', 409);
    return this.recordMutation(
      tx,
      context,
      input,
      updated,
      'rait.minutes.published',
      'INF_RAIT_MINUTES_PUBLISH',
      'inf.rait_minutes',
    );
  }

  private async lockSession(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
    expectedState: string,
  ) {
    const session = rows<{
      id: string;
      state: string;
      judging_body: string;
      scheduled_for: string | null;
      short_notice_ack: boolean;
      version: number;
      updated_at: string | null;
      created_at: string;
    }>(
      await tx.query(
        'select id, state, judging_body, scheduled_for, short_notice_ack, version, updated_at, created_at from inf.rait_session where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!session)
      fail('RAIT.TENANT_MISMATCH', 404, { sessionId: input.targetId });
    this.requireEtag(input.headers['If-Match'], session);
    if (session.state !== expectedState)
      fail('RAIT.SESSION_STATE_INVALID', 409, {
        sessionId: session.id,
        currentState: session.state,
        allowedStates: [expectedState],
      });
    return session;
  }

  private async lockMinutes(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ) {
    const minutes = rows<{
      id: string;
      session_id: string;
      signed_at: string | null;
      published_at: string | null;
      version: number;
      updated_at: string | null;
      created_at: string;
    }>(
      await tx.query(
        'select id, session_id, signed_at, published_at, version, updated_at, created_at from inf.rait_minutes where tenant_id = $1 and id = $2 for update',
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (!minutes)
      fail('RAIT.TENANT_MISMATCH', 404, { minutesId: input.targetId });
    this.requireEtag(input.headers['If-Match'], minutes);
    if (minutes.published_at)
      fail('RAIT.MINUTES_ALREADY_PUBLISHED', 409, { minutesId: minutes.id });
    return minutes;
  }

  private async lockAgendaItem(
    tx: Tx,
    input: SessionCommandInput,
    context: { tenantId: string; actorId: string },
  ) {
    const item = rows<{
      id: string;
      session_id: string;
      case_id: string;
      rapporteur_member_id: string;
      opinion_registered_at: string | null;
      read_at: string | null;
      proclaimed_at: string | null;
      withdrawn: boolean;
      version: number;
      updated_at: string | null;
      created_at: string;
      session_state: string;
      judging_body: string;
    }>(
      await tx.query(
        `select agenda.id, agenda.session_id, agenda.case_id,
                agenda.rapporteur_member_id, agenda.opinion_registered_at,
                agenda.read_at, agenda.proclaimed_at, agenda.withdrawn,
                agenda.version, agenda.updated_at, agenda.created_at,
                session.state as session_state, session.judging_body
           from inf.rait_agenda_item agenda
           join inf.rait_session session
             on session.tenant_id = agenda.tenant_id and session.id = agenda.session_id
          where agenda.tenant_id = $1 and agenda.id = $2
          for update of agenda, session`,
        [context.tenantId, input.targetId],
      ),
    )[0];
    if (
      !item &&
      input.command === 'vote' &&
      input.payload.casting_vote === true
    )
      fail('RAIT.CASTING_VOTE_NOT_TIED', 422, { agendaItemId: input.targetId });
    if (!item)
      fail('RAIT.TENANT_MISMATCH', 404, { agendaItemId: input.targetId });
    this.requireEtag(input.headers['If-Match'], item);
    return item;
  }

  private async requireItemReadiness(
    tx: Tx,
    context: { tenantId: string; actorId: string },
    item: {
      id: string;
      session_id: string;
      opinion_registered_at: string | null;
      session_state: string;
    },
    requireRapporteur: boolean,
  ): Promise<void> {
    if (item.session_state !== 'SESSAO_ABERTA' || !item.opinion_registered_at)
      fail('RAIT.VOTE_ITEM_NOT_OPEN', 409, { agendaItemId: item.id });
    const membership = rows<{ present: boolean }>(
      await tx.query(
        'select present from inf.rait_attendance where tenant_id = $1 and session_id = $2 and member_id = $3 for update',
        [context.tenantId, item.session_id, context.actorId],
      ),
    )[0];
    if (!membership?.present)
      fail('RAIT.MEMBER_NOT_AVAILABLE', 422, { memberId: context.actorId });
    const impeded = rows<{ id: string }>(
      await tx.query(
        'select id from inf.rait_impediment where tenant_id = $1 and case_id = (select case_id from inf.rait_agenda_item where tenant_id = $1 and id = $2) and member_id = $3 for update',
        [context.tenantId, item.id, context.actorId],
      ),
    );
    if (impeded.length)
      fail('RAIT.MEMBER_IMPEDED', 422, { memberId: context.actorId });
    const quorum = rows<{ required: number; observed: number }>(
      await tx.query(
        `select locked.quorum_required as required, count(locked.attendance_id)::integer as observed
         from (
           select session.quorum_required, attendance.id as attendance_id
             from inf.rait_session session
             join inf.rait_attendance attendance
               on attendance.tenant_id = session.tenant_id and attendance.session_id = session.id
            where session.tenant_id = $1 and session.id = $2 and attendance.present = true
            for update of session, attendance
         ) locked
        group by locked.quorum_required`,
        [context.tenantId, item.session_id],
      ),
    )[0];
    if (!quorum || quorum.observed < quorum.required)
      fail('RAIT.SESSION_QUORUM_MISSING', 422, { agendaItemId: item.id });
    if (requireRapporteur && !item.opinion_registered_at)
      fail('RAIT.AGENDA_ITEM_WITHOUT_OPINION', 422, { agendaItemId: item.id });
  }

  private async requireParameter(
    tx: Tx,
    tenantId: string,
    key: string,
  ): Promise<{ value_json: unknown }> {
    const parameter = rows<{
      value_json: unknown;
      source_pending: boolean;
      status: string;
    }>(
      await tx.query(
        `select value_json, source_pending, status from ops.parameter
          where tenant_id = $1 and surface = 'rait' and key = $2
            and status = 'vigente' and source_pending = false
            and effective_from <= current_date
            and (effective_to is null or effective_to >= current_date)
          order by effective_from desc, version desc
          limit 1 for share`,
        [tenantId, key],
      ),
    )[0];
    if (!parameter) fail('RAIT.PARAMETER_SOURCE_PENDING', 422, { key });
    return parameter;
  }

  private async requireConveneDeadline(
    tx: Tx,
    tenantId: string,
    session: { scheduled_for: string | null; short_notice_ack: boolean },
    input: SessionCommandInput,
  ): Promise<void> {
    const parameter = await this.requireParameter(
      tx,
      tenantId,
      'rait.timer.T-CONV',
    );
    if (!session.scheduled_for)
      fail('RAIT.PARAMETER_SOURCE_PENDING', 422, { key: 'rait.timer.T-CONV' });
    const days = Number(parameter.value_json);
    if (!Number.isInteger(days) || days < 1)
      fail('RAIT.PARAMETER_SOURCE_PENDING', 422, { key: 'rait.timer.T-CONV' });
    const notice = rows<{ business_days: number }>(
      await tx.query(
        `select count(*)::integer as business_days
           from generate_series(current_date + 1, $1::date, interval '1 day') day
          where extract(isodow from day) < 6
            and not exists (
              select 1 from inf.rait_holiday holiday
               where holiday.tenant_id = $2 and holiday.holiday_on = day::date
            )`,
        [session.scheduled_for, tenantId],
      ),
    )[0];
    if ((notice?.business_days ?? 0) < days && !session.short_notice_ack)
      fail('RAIT.AGENDA_SHORT_NOTICE', 422, {
        key: 'rait.timer.T-CONV',
        command: input.command,
      });
  }

  private requireCaseTransitions(): RaitCaseTransitionPort {
    return this.caseTransitions;
  }

  private requireTrust(): DocumentTrustHttpAdapter {
    return this.trust;
  }

  private requireEtag(
    received: string,
    entity: {
      id: string;
      updated_at: string | null;
      created_at: string;
      version?: number;
    },
  ) {
    const current = entity.version;
    const expected = `W/\"${current}\"`;
    if (received !== expected)
      fail('RAIT.VERSION_CONFLICT', 412, { currentVersion: expected });
  }

  private async recordMutation(
    tx: Tx,
    context: { tenantId: string; actorId: string },
    input: SessionCommandInput,
    data: Record<string, unknown>,
    type: string,
    auditAction: string,
    entity: string,
  ): Promise<Result> {
    const event = { type };
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
      'rait-secretary',
      auditAction,
      entity,
      String(data.id),
      JSON.stringify({ command: input.command }),
    ]);
    const version = Number(data.version);
    return {
      data,
      events: [event],
      etag: Number.isInteger(version)
        ? `W/\"${version}\"`
        : `W/\"${String(data.id)}:${String(data.updated_at ?? data.created_at ?? data.id)}\"`,
    };
  }

  private context() {
    if (!this.requestContext.hasActiveContext())
      throw new Error(
        'RaitSessionCommandService requires an active request context',
      );
    const value = this.requestContext.snapshot();
    if (!value.tenantId || !value.actorId) fail('RAIT.FORBIDDEN_ACTION', 403);
    return { tenantId: value.tenantId!, actorId: value.actorId! };
  }
}

export { RaitSessionCommandService as RaitSessionAgendaCommandService };
