// Avaliação do serviço (Lei 14.129 art. 21 V; UC-PORTAL-017; work/rounds/
// R-0009/contracts/CTG-0002.md §2.6, §4 e §11; plan R-0009 M9, M13, M21,
// adenda A5(b)). `POST evaluations` avalia uma manifestação
// (AVALIACAO_OFERECIDA → AVALIADA, `portal.evaluation` subject_kind
// 'manifestation', `AVALIACAO_REGISTRADA` sem scores nem comentário no `data`)
// ou delega a `PortalRequestsService.evaluate` quando `subjectKind='request'`
// (mesmos códigos da rota `POST requests/{id}/evaluation`). Ordem dos erros
// (A5(b)): guarda de estado primeiro (`EVALUATION_NOT_OFFERED { state }`),
// depois o único da avaliação (`EVALUATION_ALREADY_SUBMITTED`).
import { Inject, Injectable, Optional } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { z } from 'zod';
import {
  SqlTeatEventOutbox,
  TEAT_EVENT_OUTBOX,
  type TeatEventOutbox,
} from '@detran/shared';
import {
  PortalClock,
  PortalError,
  PortalIdentityService,
  cpfHashOf,
  parsePortalBody,
  type PortalClockLike,
  type PortalIdentityClaims,
  type PortalSqlTransaction,
} from '@detran/portal-identity';
import {
  EVALUATION_SCORES,
  PortalIdempotencyService,
  PortalRequestsService,
  portalRequestEvents,
  type PortalEventContext,
} from '@detran/portal-requests';

import {
  markReplayed,
  type ManifestationRow,
  type PortalHeaders,
} from './manifestation.service.js';

export { EVALUATION_SCORES } from '@detran/portal-requests';

export const EVALUATION_BODY = z.strictObject({
  subjectKind: z.enum(['request', 'manifestation']),
  subjectId: z.uuid(),
  scores: EVALUATION_SCORES,
  comment: z.string().max(2000).optional(),
});
export type EvaluationBody = z.infer<typeof EVALUATION_BODY>;

/** Chave i18n da frase "alimenta indicador público" (UC-PORTAL-017 AC-3). */
export const EVALUATION_PUBLIC_NOTICE_KEY = [
  'portal',
  'evaluations',
  'publicIndicator',
].join('.');

/** Rota M9 como o §4 a grava (`${METHOD} ${template}`). */
export const EVALUATIONS_ROUTE_KEY = 'POST /v1/portal/evaluations';
export const EVALUATIONS_ROUTE = '/v1/portal/evaluations';
export const EVALUATE_ACT = 'avaliar';

export interface EvaluationResponse {
  evaluationId: string;
  subjectKind: 'request' | 'manifestation';
  subjectId: string;
  state: 'AVALIADA' | 'CONCLUIDO';
  submittedAt: string;
  publicNotice: string;
}

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const MANIFESTATION_FOR_UPDATE_SQL = `select id, state, subject_id, protocol, version
     from portal.manifestation
    where id = $1
    for update`;

const EVALUATION_EXISTS_SQL = `select id
     from portal.evaluation
    where subject_kind = 'manifestation' and subject_id = $1
    limit 1`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 62). */
const INSERT_EVALUATION_SQL = `insert into portal.evaluation
      (subject_kind, subject_id, scores_json, comment, submitted_at)
    values ('manifestation', $1, $2::jsonb, $3, $4)
    returning id`;

const EVALUATED_SQL = `update portal.manifestation
      set state = 'AVALIADA', version = version + 1, updated_at = $2
    where id = $1
    returning version`;

type EvaluatedManifestationRow = Pick<
  ManifestationRow,
  'id' | 'state' | 'subject_id' | 'protocol' | 'version'
>;

/** Resultado de `PortalRequestsService.evaluate` (outcome M9 ou corpo direto). */
interface RequestEvaluationLike {
  evaluationId: string;
  requestId?: string;
  state: 'CONCLUIDO';
  submittedAt: string;
}

function isOutcome(
  value: unknown,
): value is { status: number; body: RequestEvaluationLike; replayed: boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'body' in value &&
    'status' in value
  );
}

@Injectable()
export class PortalEvaluationService {
  private readonly clock: PortalClockLike;
  private readonly outbox: TeatEventOutbox;

  constructor(
    private readonly identity: PortalIdentityService,
    private readonly idempotency: PortalIdempotencyService,
    private readonly requests: PortalRequestsService,
    @Optional() clock?: PortalClock,
    @Optional() private readonly requestContext?: RequestContext,
    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
  ) {
    this.clock = clock ?? new PortalClock();
    this.outbox = outbox ?? new SqlTeatEventOutbox();
  }

  /** §2.6 `evaluate(tx, identity, body, headers)`. */
  async evaluate(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<EvaluationResponse> {
    if (isRequestEvaluation(body)) {
      // §2.3: a rota do pedido faz a própria idempotência, guarda e eventos
      // (por isso a chave NÃO é registrada aqui — seria um segundo registro
      // sob outra rota para o mesmo cabeçalho).
      const input = parsePortalBody(EVALUATION_BODY, body);
      const result: unknown = await this.requests.evaluate(
        tx,
        identity,
        input.subjectId,
        {
          scores: input.scores,
          ...(input.comment ? { comment: input.comment } : {}),
        },
        headers,
      );
      const outcome = isOutcome(result) ? result : undefined;
      const evaluated = (
        outcome ? outcome.body : result
      ) as RequestEvaluationLike;
      const response: EvaluationResponse = {
        evaluationId: evaluated.evaluationId,
        subjectKind: 'request',
        subjectId: input.subjectId,
        state: 'CONCLUIDO',
        submittedAt: evaluated.submittedAt,
        publicNotice: EVALUATION_PUBLIC_NOTICE_KEY,
      };
      return outcome?.replayed ? markReplayed(response) : response;
    }
    const subject = await this.identity.upsertSubject(tx, identity, null);
    // 1. idempotência (§4)
    const begun = await this.idempotency.begin(tx, {
      scope: subject.subjectId,
      header: headers['idempotency-key'],
      route: EVALUATIONS_ROUTE_KEY,
      body,
    });
    if (begun.replay) {
      return markReplayed({ ...(begun.replay.body as EvaluationResponse) });
    }
    // 2. forma
    const input = parsePortalBody(EVALUATION_BODY, body);
    // 3. nível
    await this.identity.assertActLevel(
      tx,
      identity,
      EVALUATE_ACT,
      EVALUATIONS_ROUTE,
    );
    // 4. posse → estado → único (A5(b))
    const row = (
      await tx.query<EvaluatedManifestationRow>(MANIFESTATION_FOR_UPDATE_SQL, [
        input.subjectId,
      ])
    ).rows[0];
    if (!row || row.subject_id !== subject.subjectId) {
      throw new PortalError('PORTAL.NOT_FOUND', {
        status: 404,
        context: { kind: 'manifestation' },
      });
    }
    if (row.state !== 'AVALIACAO_OFERECIDA') {
      throw new PortalError('PORTAL.EVALUATION_NOT_OFFERED', {
        status: 409,
        context: { state: row.state },
      });
    }
    const existing = (
      await tx.query<{ id: string }>(EVALUATION_EXISTS_SQL, [row.id])
    ).rows[0];
    if (existing) {
      throw new PortalError('PORTAL.EVALUATION_ALREADY_SUBMITTED', {
        status: 409,
        context: {},
      });
    }
    // 5. efeito
    const now = this.clock.now();
    const inserted = (
      await tx.query<{ id: string }>(INSERT_EVALUATION_SQL, [
        row.id,
        JSON.stringify(input.scores),
        input.comment ?? null,
        now,
      ])
    ).rows[0];
    if (!inserted) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    await tx.query(EVALUATED_SQL, [row.id, now]);
    // 6. evento (§11) — sem scores nem comment
    await this.outbox.append(
      tx as never,
      portalRequestEvents.avaliacaoRegistrada(
        inserted.id,
        {
          evaluationId: inserted.id,
          subjectKind: 'manifestation',
          subjectId: row.id,
          submittedAt: now.toISOString(),
          citizenSubjectId: subject.subjectId,
          subjectCpfHash: cpfHashOf(identity.cpf),
        },
        this.eventContext(now, subject.subjectId),
      ),
    );
    const response: EvaluationResponse = {
      evaluationId: inserted.id,
      subjectKind: 'manifestation',
      subjectId: row.id,
      state: 'AVALIADA',
      submittedAt: now.toISOString(),
      publicNotice: EVALUATION_PUBLIC_NOTICE_KEY,
    };
    await begun.record(201, response);
    return response;
  }

  private eventContext(now: Date, subjectId: string): PortalEventContext {
    const snapshot = this.requestContext?.hasActiveContext()
      ? this.requestContext.snapshot()
      : undefined;
    return {
      occurredAt: now.toISOString(),
      actorId: snapshot?.actorId ?? subjectId,
      correlationId: snapshot?.requestId ?? '',
    };
  }
}

/** Pré-verificação de forma: só decide a quem delegar; a validação é do zod. */
function isRequestEvaluation(body: unknown): boolean {
  return (
    typeof body === 'object' &&
    body !== null &&
    (body as { subjectKind?: unknown }).subjectKind === 'request'
  );
}
