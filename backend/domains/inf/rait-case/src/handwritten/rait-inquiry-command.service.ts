import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import type { TimerExpiredData } from '@detran/inf-deadlines';
import { DetranError, withTenantContext } from '@detran/shared';

import { RaitDeadlineEngineFactory } from './rait-case-command.service.js';

export interface InquiryCommandInput {
  command: string;
  targetId: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
}
type Result = {
  data: Record<string, unknown>;
  events: Record<string, unknown>[];
  etag: string;
};
type Tx = Pick<Transaction, 'query'>;
type Row = Record<string, unknown> & {
  id: string;
  case_id: string;
  version: number;
  state: string;
  answered_at: string | null;
  extension_count: number;
  due_on: string | Date;
  addressee: string;
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
const digest = (input: InquiryCommandInput) =>
  createHash('sha256')
    .update(
      JSON.stringify({
        command: input.command,
        targetId: input.targetId,
        payload: canonical(input.payload),
      }),
    )
    .digest('hex');
const FIELDS: Record<string, readonly string[]> = {
  answer: ['documentIds', 'answeredOn'],
  extend: ['reason'],
  expire: [],
};
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const civilDate = (value: unknown): string =>
  value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
const validCivilDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value))
    return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

@Injectable()
export class RaitInquiryCommandService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    private readonly deadlines: RaitDeadlineEngineFactory,
  ) {}

  async execute(input: InquiryCommandInput): Promise<Result> {
    if (input.command === 'expire')
      fail('RAIT.FORBIDDEN_ACTION', 403, { action: 'expire' });
    return this.executeAuthenticated(input);
  }

  executeTimer(
    input: InquiryCommandInput,
    effect: TimerExpiredData,
  ): Promise<Result> {
    if (
      input.command !== 'expire' ||
      effect.ownerKind !== 'case' ||
      effect.timerCode !== 'T-DIL' ||
      effect.effect !== 'transicao'
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    return this.executeAuthenticated(input, effect);
  }

  private async executeAuthenticated(
    input: InquiryCommandInput,
    effect?: TimerExpiredData,
  ): Promise<Result> {
    const allowed = FIELDS[input.command];
    if (
      !allowed ||
      Object.keys(input.payload).some((field) => !allowed.includes(field))
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    if (input.command === 'answer') {
      const documentIds = input.payload.documentIds;
      if (
        !Array.isArray(documentIds) ||
        documentIds.length === 0 ||
        documentIds.some((id) => !UUID.test(String(id))) ||
        new Set(documentIds).size !== documentIds.length ||
        !validCivilDate(input.payload.answeredOn)
      )
        fail('RAIT.VALIDATION_FAILED', 400);
    }
    if (
      input.command === 'extend' &&
      (typeof input.payload.reason !== 'string' || !input.payload.reason.trim())
    )
      fail('RAIT.VALIDATION_FAILED', 400);
    if (!effect && !input.headers['If-Match'])
      fail('RAIT.IF_MATCH_REQUIRED', 428);
    const context = this.context(input);
    const key = effect
      ? `timer-expired:${effect.ownerKind}:${effect.ownerId}:${effect.timerCode}:${effect.dueOn}`
      : input.headers['Idempotency-Key'];
    if (!key) fail('RAIT.VALIDATION_FAILED', 400);
    return this.transaction(async (tx) => {
      const requestDigest = digest(input);
      await tx.query(
        "select pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))",
        [context.tenantId, key],
      );
      const replay = rows(
        await tx.query<{ request_fingerprint: string; response_body: Result }>(
          'select request_fingerprint, response_body from integration.idempotency_keys where tenant_id = $1 and idem_key = $2 for update',
          [context.tenantId, key],
        ),
      )[0];
      if (replay) {
        if (replay.request_fingerprint !== requestDigest)
          fail('RAIT.IDEMPOTENCY_REPLAY', 409, { key }, context.requestId);
        return replay.response_body;
      }
      const current = rows(
        await tx.query<Row>(
          'select inquiry.id, inquiry.case_id, inquiry.addressee, inquiry.due_on, inquiry.extension_count, inquiry.answered_at, item.state, item.version from inf.rait_inquiry inquiry join inf.rait_case item on item.id = inquiry.case_id and item.tenant_id = inquiry.tenant_id where inquiry.tenant_id = $1 and inquiry.id = $2 for update of inquiry, item',
          [context.tenantId, input.targetId],
        ),
      )[0];
      if (!current)
        return fail(
          'RAIT.TENANT_MISMATCH',
          404,
          { inquiryId: input.targetId },
          context.requestId,
        );
      if (effect && effect.ownerId !== current.case_id)
        fail(
          'RAIT.TENANT_MISMATCH',
          404,
          { inquiryId: input.targetId },
          context.requestId,
        );
      if (!effect && input.headers['If-Match'] !== `"${current.version}"`)
        fail(
          'RAIT.VERSION_CONFLICT',
          412,
          { currentVersion: current.version },
          context.requestId,
        );
      if (current.state !== 'DILIGENCIA')
        fail(
          'RAIT.CASE_STATE_INVALID',
          409,
          { caseId: current.case_id, currentState: current.state },
          context.requestId,
        );
      if (current.answered_at)
        fail(
          'RAIT.INQUIRY_ALREADY_CLOSED',
          409,
          { inquiryId: input.targetId },
          context.requestId,
        );
      if (input.command === 'extend' && current.extension_count >= 1)
        fail(
          'RAIT.INQUIRY_EXTENSION_LIMIT',
          422,
          { inquiryId: input.targetId },
          context.requestId,
        );
      if (
        input.command === 'answer' &&
        String(input.payload.answeredOn) > civilDate(current.due_on)
      )
        fail(
          'RAIT.INQUIRY_ALREADY_CLOSED',
          409,
          { inquiryId: input.targetId },
          context.requestId,
        );
      if (input.command === 'answer') {
        const documentIds = input.payload.documentIds as string[];
        const documents = rows(
          await tx.query<Record<string, unknown>>(
            'select id from inf.rait_document where tenant_id = $1 and case_id = $2 and id = any($3::uuid[]) for update',
            [context.tenantId, current.case_id, documentIds],
          ),
        );
        if (documents.length !== documentIds.length)
          fail(
            'RAIT.TENANT_MISMATCH',
            404,
            { inquiryId: input.targetId },
            context.requestId,
          );
        for (const documentId of documentIds)
          await tx.query(
            'insert into inf.rait_inquiry_document (tenant_id, inquiry_id, document_id, attached_by) values ($1,$2,$3,$4) on conflict (tenant_id, inquiry_id, document_id) do nothing',
            [context.tenantId, input.targetId, documentId, context.actorId],
          );
      }

      let dueOn: string | undefined;
      if (input.command === 'extend') {
        const deadline = rows(
          await tx.query<Record<string, unknown>>(
            'select id from inf.rait_deadline where tenant_id = $1 and case_id = $2 and timer_code = $3 and satisfied_at is null for update',
            [context.tenantId, current.case_id, 'T-DIL'],
          ),
        )[0];
        if (!deadline)
          fail(
            'RAIT.INTERNAL',
            500,
            { caseId: current.case_id, timerCode: 'T-DIL' },
            context.requestId,
          );
        dueOn = (
          await this.requireDeadlines()
            .create(tx)
            .extend(String(deadline.id), String(input.payload.reason))
        ).dueOn;
      }
      if (input.command === 'expire') {
        const deadline = rows(
          await tx.query<Record<string, unknown>>(
            `select id, due_on from inf.rait_deadline
              where tenant_id = $1 and case_id = $2
                and timer_code = 'T-DIL' and satisfied_at is null
                and due_on = $3::date
              for update`,
            [context.tenantId, current.case_id, effect?.dueOn ?? null],
          ),
        )[0];
        if (
          !effect ||
          !deadline ||
          civilDate(deadline.due_on) !== effect.dueOn ||
          civilDate(current.due_on) !== effect.dueOn
        )
          fail(
            'RAIT.CASE_STATE_INVALID',
            409,
            { caseId: current.case_id, currentState: current.state },
            context.requestId,
          );
      }
      const next =
        input.command === 'answer'
          ? 'EM_INSTRUCAO'
          : input.command === 'expire'
            ? 'PRONTO_P_DECISAO'
            : 'DILIGENCIA';
      const inquiry = rows(
        await tx.query<Row>(
          `update inf.rait_inquiry
              set answered_at = case when $1 in ('answer','expire') then clock_timestamp() else answered_at end,
                  answered_on = case when $1 = 'answer' then $2::date else answered_on end,
                  outcome = case when $1 = 'answer' then 'respondida' when $1 = 'expire' then 'expirada' else outcome end,
                  extension_count = extension_count + case when $1 = 'extend' then 1 else 0 end,
                  due_on = coalesce($3::date, due_on), updated_at = clock_timestamp()
            where tenant_id = $4 and id = $5
            returning id, case_id, addressee, due_on, extension_count,
                      answered_at, answered_on, outcome`,
          [
            input.command,
            input.command === 'answer' ? input.payload.answeredOn : null,
            dueOn ?? null,
            context.tenantId,
            input.targetId,
          ],
        ),
      )[0];
      const caseData = rows(
        await tx.query<Row>(
          'update inf.rait_case set state = $1, version = version + 1, updated_at = clock_timestamp(), last_movement_at = clock_timestamp() where tenant_id = $2 and id = $3 and version = $4 returning id, state, version',
          [next, context.tenantId, current.case_id, current.version],
        ),
      )[0];
      if (!caseData || !inquiry)
        return fail(
          'RAIT.VERSION_CONFLICT',
          412,
          { currentVersion: current.version },
          context.requestId,
        );
      const events = [
        {
          type: 'rait.inquiry.changed',
          aggregateId: input.targetId,
          caseId: current.case_id,
          inquiryId: input.targetId,
          addressee: current.addressee,
          dueOn: civilDate(inquiry.due_on),
          outcome: inquiry.outcome,
        },
        {
          type: 'rait.case.changed',
          aggregateId: current.case_id,
          caseId: current.case_id,
          fromState: current.state,
          toState: next,
        },
      ];
      for (const event of events)
        await tx.query(
          'insert into integration.outbox (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status) values ($1, $2, $3, $4, $5, $6, $7)',
          [
            context.tenantId,
            event.type,
            event.type === 'rait.inquiry.changed'
              ? 'inf.rait_inquiry'
              : 'inf.rait_case',
            event.aggregateId,
            JSON.stringify(event),
            `${key}:${event.type}`,
            'pending',
          ],
        );
      await tx.query(
        'select audit.write($1, $2, $3, $4, $5, $6, $7, null, null, null)',
        [
          context.tenantId,
          context.actorId,
          context.role,
          `INF_RAIT_INQUIRY_${input.command.toUpperCase()}`,
          'inf.rait_inquiry',
          input.targetId,
          JSON.stringify({ command: input.command }),
        ],
      );
      const data = {
        ...inquiry,
        due_on: civilDate(inquiry.due_on),
        caseId: current.case_id,
        caseVersion: caseData.version,
      };
      const result = { data, events, etag: `"${caseData.version}"` };
      await tx.query(
        "insert into integration.idempotency_keys (tenant_id, idem_key, request_fingerprint, status_code, response_body, expires_at) values ($1, $2, $3, $4, $5, clock_timestamp() + interval '24 hours')",
        [context.tenantId, key, requestDigest, 200, JSON.stringify(result)],
      );
      return result;
    });
  }

  private context(_input: InquiryCommandInput): {
    tenantId: string;
    actorId: string;
    role: string;
    requestId?: string;
  } {
    if (!this.requestContext?.hasActiveContext?.())
      throw new Error(
        'RaitInquiryCommandService requires an active request context',
      );
    const value = this.requestContext.snapshot();
    if (!value.tenantId || !value.actorId) fail('RAIT.FORBIDDEN_ACTION', 403);
    const roles = (
      this.requestContext as unknown as {
        tenantContext?: { current(): { roles?: string[] } };
      }
    ).tenantContext?.current().roles;
    return {
      tenantId: value.tenantId!,
      actorId: value.actorId!,
      role: roles?.[0] ?? '',
      requestId: value.requestId,
    };
  }
  private transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  private requireDeadlines(): RaitDeadlineEngineFactory {
    return this.deadlines;
  }
}
