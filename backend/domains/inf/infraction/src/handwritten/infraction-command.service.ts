import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  assertIfMatch,
  DetranError,
  etagOf,
  withTenantContext,
} from '@detran/shared';

import {
  assertTransition,
  type InfractionTrigger,
} from './guards/infraction.guard.js';

type Tx = Pick<Transaction, 'query'>;
type InfractionRow = Record<string, unknown> & {
  id: string;
  state: string;
  substate: string | null;
  version: number;
  paid: boolean;
};

export type InfractionCommand =
  | 'issue-notice'
  | 'indicate-driver'
  | 'declare-extinction'
  | 'authority-appeal'
  | 'waive-appeal';

export interface InfractionCommandInput {
  command: InfractionCommand;
  infractionId: string;
  payload: Record<string, unknown>;
  ifMatch?: string;
  idempotencyKey?: string;
}

export interface InfractionCommandResult {
  data: Record<string, unknown>;
  events: Record<string, unknown>[];
  etag: string;
}

export const INFRACTION_COMMANDS: readonly InfractionCommand[] = [
  'issue-notice',
  'indicate-driver',
  'declare-extinction',
  'authority-appeal',
  'waive-appeal',
];

const FORBIDDEN_IDENTITY_FIELDS = new Set([
  'tenantId',
  'tenant_id',
  'actorId',
  'actor_id',
  'state',
  'substate',
  'version',
  'events',
]);

const AUDIT: Record<InfractionCommand, { action: string; role: string }> = {
  'issue-notice': {
    action: 'INF_INFRACTION_ISSUE_NOTICE',
    role: 'rait-secretary',
  },
  'indicate-driver': {
    action: 'INF_INFRACTION_INDICATE_DRIVER',
    role: 'rait-secretary',
  },
  'declare-extinction': {
    action: 'INF_INFRACTION_DECLARE_EXTINCTION',
    role: 'rait-signing-authority',
  },
  'authority-appeal': {
    action: 'INF_INFRACTION_AUTHORITY_APPEAL',
    role: 'rait-central-authority',
  },
  'waive-appeal': {
    action: 'INF_INFRACTION_WAIVE_APPEAL',
    role: 'rait-central-authority',
  },
};

function fail(
  code: string,
  status: number,
  context: Record<string, unknown> = {},
): never {
  throw new DetranError(code, {
    status,
    messageKey: `rait.errors.${code.replace(/^RAIT\./u, '').toLowerCase()}`,
    message: 'O comando da infração não pode ser executado.',
    context,
  });
}

const rows = <T>(result: { rows: T[] }): T[] => result.rows;
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}

export function triggerForCommand(
  command: InfractionCommand,
  payload: Record<string, unknown>,
): InfractionTrigger {
  switch (command) {
    case 'issue-notice': {
      const kind = payload.noticeKind;
      if (kind !== 'NA' && kind !== 'NP')
        return fail('RAIT.VALIDATION_FAILED', 400, { fields: ['noticeKind'] });
      return {
        kind: 'evento',
        code: 'NOTIFICACAO_EXPEDIDA',
        qualifier:
          kind === 'NP' && payload.recognition === true
            ? 'reconhecimento'
            : kind,
      };
    }
    case 'indicate-driver':
      return { kind: 'evento', code: 'CONDUTOR_INDICADO' };
    case 'declare-extinction':
      return { kind: 'timer', code: 'T-JUL-24M' };
    case 'authority-appeal':
      return { kind: 'ato', code: 'RECURSO_AUTORIDADE' };
    case 'waive-appeal':
      return { kind: 'timer', code: 'T-R2' };
  }
}

@Injectable()
export class InfractionCommandService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  execute(input: InfractionCommandInput): Promise<InfractionCommandResult> {
    this.validate(input);
    const context = this.context();
    const key = input.idempotencyKey as string;
    const digest = createHash('sha256')
      .update(
        JSON.stringify({
          command: input.command,
          infractionId: input.infractionId,
          payload: canonical(input.payload),
        }),
      )
      .digest('hex');

    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) => {
        const tx = rawTx as Tx;
        await tx.query(
          "select pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))",
          [context.tenantId, key],
        );
        const replay = rows(
          await tx.query<{
            request_fingerprint: string;
            response_body: InfractionCommandResult;
          }>(
            'select request_fingerprint, response_body from integration.idempotency_keys where tenant_id = $1 and idem_key = $2 for update',
            [context.tenantId, key],
          ),
        )[0];
        if (replay) {
          if (replay.request_fingerprint !== digest)
            fail('RAIT.IDEMPOTENCY_REPLAY', 409, { key });
          return replay.response_body;
        }

        const current = rows(
          await tx.query<InfractionRow>(
            'select * from inf.infraction where tenant_id = $1 and id = $2 for update',
            [context.tenantId, input.infractionId],
          ),
        )[0];
        if (!current) fail('RAIT.TENANT_MISMATCH', 404);
        assertIfMatch(input.ifMatch, current.version, 'RAIT');

        const trigger = triggerForCommand(input.command, input.payload);
        await this.assertTimer(tx, context.tenantId, current, input, trigger);
        const transition = assertTransition(current, trigger);
        const subjectKind =
          input.command === 'indicate-driver'
            ? String(input.payload.subjectKind ?? 'condutor_identificado')
            : null;
        const updated = rows(
          await tx.query<InfractionRow>(
            `update inf.infraction
            set state = $3, substate = $4,
                subject_kind = coalesce($5, subject_kind),
                last_transition_id = $6, state_changed_at = clock_timestamp(),
                version = version + 1, updated_at = clock_timestamp()
          where tenant_id = $1 and id = $2 and version = $7 returning *`,
            [
              context.tenantId,
              current.id,
              transition.toState,
              transition.toSubstate,
              subjectKind,
              transition.id,
              current.version,
            ],
          ),
        )[0];
        if (!updated)
          fail('RAIT.VERSION_CONFLICT', 412, {
            currentVersion: current.version,
          });

        const event = {
          id: randomUUID(),
          type: 'inf.infraction.changed',
          domainEvent: 'INFRACAO_ESTADO_ALTERADO',
          version: 1,
          occurredAt: new Date().toISOString(),
          tenantId: context.tenantId,
          actor: {
            kind: 'user',
            id: context.actorId,
            role: AUDIT[input.command].role,
          },
          aggregate: {
            kind: 'infraction',
            id: current.id,
            version: updated.version,
          },
          data: {
            infractionId: current.id,
            fromState: current.state,
            toState: updated.state,
            substate: updated.substate,
            triggerKind: trigger.kind,
            triggerCode: trigger.code,
            ruleRef: transition.ruleRef,
          },
        };
        await tx.query(
          `insert into inf.infraction_event
          (id,tenant_id,infraction_id,transition_id,rule_ref,from_state,to_state,
           from_substate,to_substate,trigger_kind,trigger_code,event_code,
           occurred_at,actor_id,actor_kind,payload)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
                 'INFRACAO_ESTADO_ALTERADO',clock_timestamp(),$12,'user',$13)`,
          [
            event.id,
            context.tenantId,
            current.id,
            transition.id,
            transition.ruleRef,
            current.state,
            updated.state,
            current.substate,
            updated.substate,
            trigger.kind,
            trigger.code,
            context.actorId,
            JSON.stringify(event),
          ],
        );
        await tx.query(
          'insert into integration.outbox (tenant_id,topic,aggregate_type,aggregate_id,payload,idempotency_key,status) values ($1,$2,$3,$4,$5,$6,$7)',
          [
            context.tenantId,
            event.type,
            'inf.infraction',
            current.id,
            JSON.stringify(event),
            `${key}:${event.type}`,
            'pending',
          ],
        );
        await tx.query(
          'select audit.write($1,$2,$3,$4,$5,$6,$7,null,null,null)',
          [
            context.tenantId,
            context.actorId,
            AUDIT[input.command].role,
            AUDIT[input.command].action,
            'inf.infraction',
            current.id,
            JSON.stringify({ command: input.command }),
          ],
        );
        const result: InfractionCommandResult = {
          data: updated,
          events: [event],
          etag: etagOf(updated.version),
        };
        await tx.query(
          "insert into integration.idempotency_keys (tenant_id,idem_key,request_fingerprint,status_code,response_body,expires_at) values ($1,$2,$3,200,$4,clock_timestamp() + interval '24 hours')",
          [context.tenantId, key, digest, JSON.stringify(result)],
        );
        return result;
      },
    );
  }

  private validate(input: InfractionCommandInput): void {
    if (!input.idempotencyKey?.trim())
      fail('RAIT.IDEMPOTENCY_KEY_REQUIRED', 428);
    if (!input.ifMatch?.trim()) fail('RAIT.IF_MATCH_REQUIRED', 428);
    const forbidden = Object.keys(input.payload).filter((field) =>
      FORBIDDEN_IDENTITY_FIELDS.has(field),
    );
    if (forbidden.length)
      fail('RAIT.VALIDATION_FAILED', 400, { fields: forbidden });
    if (
      input.command === 'indicate-driver' &&
      typeof input.payload.evidenceRef !== 'string'
    )
      fail('RAIT.VALIDATION_FAILED', 400, { fields: ['evidenceRef'] });
  }

  private async assertTimer(
    tx: Tx,
    tenantId: string,
    current: InfractionRow,
    input: InfractionCommandInput,
    trigger: InfractionTrigger,
  ): Promise<void> {
    const required =
      input.command === 'declare-extinction'
        ? { code: 'T-JUL-24M', expired: true }
        : input.command === 'authority-appeal' ||
            input.command === 'waive-appeal'
          ? { code: 'T-R2', expired: input.command === 'waive-appeal' }
          : null;
    if (!required) return;
    const timer = rows(
      await tx.query<{ due_on: string }>(
        `select due_on from inf.infraction_timer where tenant_id = $1 and infraction_id = $2
       and timer_code = $3 order by started_on desc limit 1 for update`,
        [tenantId, current.id, required.code],
      ),
    )[0];
    const isExpired = Boolean(
      timer && timer.due_on < new Date().toISOString().slice(0, 10),
    );
    if (!timer || isExpired !== required.expired)
      fail('RAIT.INFRACTION_TIMER_EXPIRED', 422, {
        timerCode: required.code,
        expiredOn: timer?.due_on,
        trigger: trigger.code,
      });
  }

  private context(): { tenantId: string; actorId: string } {
    if (!this.requestContext?.hasActiveContext?.())
      throw new Error(
        'InfractionCommandService requires an active request context',
      );
    const value = this.requestContext.snapshot();
    if (!value.tenantId || !value.actorId) fail('RAIT.FORBIDDEN_ACTION', 403);
    return { tenantId: value.tenantId, actorId: value.actorId };
  }
}
