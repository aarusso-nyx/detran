// Adesão e cancelamento do SNE (CTG-0002 §2.4, §6.2 e §11; CTG-0001 §6.3;
// A23(a): PORTAL_SNE_PORT obrigatório e a adesão nacional antecede toda
// persistência local e publicação na outbox).
// `SNE_ENROLLMENT_TRANSITIONS` espelha as três linhas de [WF-PORTAL-003]
// para `portal.sne_enrollment.state`; `enroll`/`cancel` são chamados pela
// rota §2.4 e pelo alvo de delegação `adesao_sne`/`cancelamento_sne` do app
// (§3.2). A adesão chama o `SnePort` via adapter antes dos efeitos locais;
// o cancelamento permanece local (DIVERGE-2/OD-P106).
//
// `sne_enrollment` não tem `version` (D8): `aggregate.version` do evento é o
// número da transição da linha (adesão nova = 1, cancelamento = 2, re-adesão
// = 3…), lido como `count(*)` das publicações anteriores do agregado na
// outbox + 1 dentro da transação (§11).
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
  parsePortalBody,
  portalValidationFailed,
  type PortalClockLike,
  type PortalIdentityClaims,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import {
  PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
  portalInboxEvents,
  type PortalInboxEventContext,
} from './events.js';

export const PORTAL_SNE_PORT = Symbol('PORTAL_SNE_PORT');

export interface PortalSnePort {
  enrollCitizen(input: {
    cpf: string;
    channel?: string;
  }): Promise<{ enrolled: boolean }>;
}

// ---------------------------------------------------------------------------
// vocabulário (§2.4, CTG-0001 §6.3)
// ---------------------------------------------------------------------------

/** Os quatro efeitos do consentimento (route contract §5.1 `adesao_sne`; UC-PORTAL-007 AC-2). */
export const SNE_EFFECTS = [
  'ciencia_ficta',
  'canal_exclusivo',
  'desconto_60',
  'cancelamento',
] as const;
export type SneEffect = (typeof SNE_EFFECTS)[number];

export const SNE_ENROLLMENT_STATES = [
  'NAO_ADERIDO_SNE',
  'ADERIDO_SNE',
] as const;
export type SneEnrollmentState = (typeof SNE_ENROLLMENT_STATES)[number];

export const SNE_CHANNELS = ['push', 'email', 'sne'] as const;

export interface SneEnrollmentTransition {
  /** `null` = sem linha. */
  from: SneEnrollmentState | null;
  to: SneEnrollmentState;
  command: 'enroll' | 'cancel';
  guard: string;
}

/** CTG-0001 §6.3 — as três linhas de [WF-PORTAL-003] persistidas em `state`. */
export const SNE_ENROLLMENT_TRANSITIONS: readonly SneEnrollmentTransition[] = [
  {
    from: null,
    to: 'ADERIDO_SNE',
    command: 'enroll',
    guard:
      "assertActLevel('adesao_sne'); e-mail ou celular; consentimento com os quatro efeitos",
  },
  {
    from: 'NAO_ADERIDO_SNE',
    to: 'ADERIDO_SNE',
    command: 'enroll',
    guard: 're-adesão: since novo, cancelled_at e cancel_reason nulos',
  },
  {
    from: 'ADERIDO_SNE',
    to: 'NAO_ADERIDO_SNE',
    command: 'cancel',
    guard:
      "assertActLevel('cancelamento_sne'); notificações já disponibilizadas continuam válidas",
  },
];

export const SNE_ENROLLMENT_BODY = z.strictObject({
  email: z.email().optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/)
    .optional(),
  channel: z.enum(SNE_CHANNELS).optional(),
  consent: z.strictObject({
    textVersion: z.string().min(1),
    effectsAck: z.array(z.enum(SNE_EFFECTS)).min(SNE_EFFECTS.length),
  }),
});
export type SneEnrollmentBody = z.infer<typeof SNE_ENROLLMENT_BODY>;

export interface SneEnrollmentView {
  enrolled: boolean;
  since: string | null;
  channel: string | null;
  cancelable: boolean;
}

export interface SneEnrollResponse extends SneEnrollmentView {
  id: string;
  enrolled: true;
  since: string;
  cancelable: true;
}

export interface SneCancelResponse extends SneEnrollmentView {
  id: string;
  enrolled: false;
  since: null;
  cancelable: false;
  cancelledAt: string;
}

/** `resumeRoute` das duas verificações de nível (§2.4). */
export const SNE_ENROLLMENT_ROUTE = '/v1/portal/sne/enrollment';

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const ENROLLMENT_COLUMNS = `id, subject_id, state, channel, email, phone,
          consent_text_version, effects_ack, since, cancelled_at, cancel_reason`;

const ENROLLMENT_SQL = `select ${ENROLLMENT_COLUMNS}
     from portal.sne_enrollment
    where subject_id = $1
    limit 1`;

const ENROLLMENT_FOR_UPDATE_SQL = `select ${ENROLLMENT_COLUMNS}
     from portal.sne_enrollment
    where subject_id = $1
    for update`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 63). */
const INSERT_ENROLLMENT_SQL = `insert into portal.sne_enrollment
      (subject_id, state, channel, email, phone, consent_text_version, effects_ack,
       since, cancelled_at, cancel_reason, created_at)
    values ($1, 'ADERIDO_SNE', $2, $3, $4, $5, $6::jsonb, $7, null, null, $7)
    returning id`;

const REENROLL_SQL = `update portal.sne_enrollment
      set state = 'ADERIDO_SNE', channel = $2, email = $3, phone = $4,
          consent_text_version = $5, effects_ack = $6::jsonb, since = $7,
          cancelled_at = null, cancel_reason = null, updated_at = $7
    where id = $1`;

const CANCEL_SQL = `update portal.sne_enrollment
      set state = 'NAO_ADERIDO_SNE', cancelled_at = $2, cancel_reason = $3, updated_at = $2
    where id = $1`;

const SUBJECT_HASH_SQL = `select cpf_hash from portal.subject where id = $1 limit 1`;

const TRANSITIONS_SQL = `select count(*) as total
     from integration.outbox
    where aggregate_id = $1 and topic = $2`;

interface EnrollmentRow extends Record<string, unknown> {
  id: string;
  subject_id: string;
  state: SneEnrollmentState;
  channel: string | null;
  email: string | null;
  phone: string | null;
  consent_text_version: string | null;
  effects_ack: unknown;
  since: Date | string | null;
  cancelled_at: Date | string | null;
  cancel_reason: string | null;
}

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function viewOf(row: EnrollmentRow | undefined): SneEnrollmentView {
  if (!row || row.state !== 'ADERIDO_SNE') {
    return {
      enrolled: false,
      since: null,
      channel: row?.channel ?? null,
      cancelable: false,
    };
  }
  return {
    enrolled: true,
    since: row.since === null ? null : iso(row.since),
    channel: row.channel,
    cancelable: true,
  };
}

// ---------------------------------------------------------------------------
// serviço
// ---------------------------------------------------------------------------

@Injectable()
export class PortalSneEnrollmentService {
  private readonly clock: PortalClockLike;
  private readonly outbox: TeatEventOutbox;

  constructor(
    private readonly identity: PortalIdentityService,
    @Inject(PORTAL_SNE_PORT) private readonly sne: PortalSnePort,
    @Optional() clock?: PortalClock,
    @Optional() private readonly requestContext?: RequestContext,
    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
  ) {
    this.clock = clock ?? new PortalClock();
    this.outbox = outbox ?? new SqlTeatEventOutbox();
  }

  /** §2.4 `GET sne/enrollment` — sem linha: `{ enrolled: false, … cancelable: false }`. */
  async get(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
  ): Promise<SneEnrollmentView> {
    const row = (
      await tx.query<EnrollmentRow>(ENROLLMENT_SQL, [subject.subjectId])
    ).rows[0];
    return viewOf(row);
  }

  /** §6.2 `enroll(tx, subject, identity, body)`. */
  async enroll(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
    identity: PortalIdentityClaims,
    body: unknown,
  ): Promise<SneEnrollResponse> {
    // 1. forma
    const input = parsePortalBody(SNE_ENROLLMENT_BODY, body);
    if (new Set(input.consent.effectsAck).size !== SNE_EFFECTS.length) {
      throw portalValidationFailed(['consent.effectsAck']);
    }
    // 2. nível do ato (A1(a): avancada)
    await this.identity.assertActLevel(
      tx,
      identity,
      'adesao_sne',
      SNE_ENROLLMENT_ROUTE,
    );
    // 3. contato
    if (!input.email && !input.phone) {
      throw new PortalError('PORTAL.SNE_CONTACT_REQUIRED', {
        status: 422,
        context: { missing: ['email', 'phone'] },
      });
    }
    // 4. integração nacional antes de qualquer escrita local (§4).
    try {
      const national = await this.sne.enrollCitizen({
        cpf: identity.cpf,
        channel: input.channel,
      });
      if (!national.enrolled) {
        throw new PortalError('PORTAL.SNE_UPSTREAM_UNAVAILABLE', {
          status: 503,
          context: { retryAfter: null },
        });
      }
    } catch (error) {
      if (error instanceof PortalError) throw error;
      const category =
        typeof error === 'object' && error !== null && 'category' in error
          ? (error as { category?: unknown }).category
          : undefined;
      if (category === 'VALIDATION') {
        throw new PortalError('PORTAL.VALIDATION_FAILED', {
          status: 400,
          context: { fields: [] },
        });
      }
      if (category === 'BUSINESS') {
        throw new PortalError('PORTAL.SNE_ALREADY_ENROLLED', {
          status: 409,
          context: {},
        });
      }
      throw new PortalError('PORTAL.SNE_UPSTREAM_UNAVAILABLE', {
        status: 503,
        context: { retryAfter: null },
      });
    }
    // 5. estado
    const existing = (
      await tx.query<EnrollmentRow>(ENROLLMENT_FOR_UPDATE_SQL, [
        subject.subjectId,
      ])
    ).rows[0];
    if (existing?.state === 'ADERIDO_SNE') {
      throw new PortalError('PORTAL.SNE_ALREADY_ENROLLED', {
        status: 409,
        context: {},
      });
    }
    // 6. upsert
    const now = this.clock.now();
    const channel = input.channel ?? null;
    const effectsAck = JSON.stringify(
      Object.fromEntries(SNE_EFFECTS.map((effect) => [effect, true])),
    );
    let enrollmentId: string;
    if (existing) {
      await tx.query(REENROLL_SQL, [
        existing.id,
        channel,
        input.email ?? null,
        input.phone ?? null,
        input.consent.textVersion,
        effectsAck,
        now,
      ]);
      enrollmentId = existing.id;
    } else {
      const inserted = (
        await tx.query<{ id: string }>(INSERT_ENROLLMENT_SQL, [
          subject.subjectId,
          channel,
          input.email ?? null,
          input.phone ?? null,
          input.consent.textVersion,
          effectsAck,
          now,
        ])
      ).rows[0];
      if (!inserted) {
        throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
      }
      enrollmentId = inserted.id;
    }
    // 7. evento
    await this.outbox.append(
      tx as never,
      portalInboxEvents.sneAdesaoSolicitada(
        enrollmentId,
        await this.nextTransition(tx, enrollmentId),
        {
          enrollmentId,
          subjectId: subject.subjectId,
          subjectCpfHash: await this.cpfHashOf(tx, subject.subjectId),
          toState: 'ADERIDO_SNE',
          since: now.toISOString(),
          channel: channel as SneAdesaoChannel,
          consentTextVersion: input.consent.textVersion,
        },
        this.eventContext(now, subject.subjectId),
      ),
    );
    return {
      id: enrollmentId,
      enrolled: true,
      since: now.toISOString(),
      channel,
      cancelable: true,
    };
  }

  /** §6.2 `cancel(tx, subject, identity, reason?)`. */
  async cancel(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
    identity: PortalIdentityClaims,
    reason?: string,
  ): Promise<SneCancelResponse> {
    // 1. nível do ato (A1(a): avancada)
    await this.identity.assertActLevel(
      tx,
      identity,
      'cancelamento_sne',
      SNE_ENROLLMENT_ROUTE,
    );
    // 2. estado
    const existing = (
      await tx.query<EnrollmentRow>(ENROLLMENT_FOR_UPDATE_SQL, [
        subject.subjectId,
      ])
    ).rows[0];
    if (!existing || existing.state !== 'ADERIDO_SNE') {
      throw new PortalError('PORTAL.SNE_NOT_ENROLLED', {
        status: 409,
        context: {},
      });
    }
    // 3. cancelamento (since mantido: DDL exige since só quando aderido)
    const now = this.clock.now();
    await tx.query(CANCEL_SQL, [existing.id, now, reason ?? null]);
    // 4. evento
    await this.outbox.append(
      tx as never,
      portalInboxEvents.sneCancelamentoSolicitado(
        existing.id,
        await this.nextTransition(tx, existing.id),
        {
          enrollmentId: existing.id,
          subjectId: subject.subjectId,
          subjectCpfHash: await this.cpfHashOf(tx, subject.subjectId),
          fromState: 'ADERIDO_SNE',
          toState: 'NAO_ADERIDO_SNE',
          cancelledAt: now.toISOString(),
        },
        this.eventContext(now, subject.subjectId),
      ),
    );
    return {
      id: existing.id,
      enrolled: false,
      since: null,
      channel: existing.channel,
      cancelable: false,
      cancelledAt: now.toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // apoio
  // -------------------------------------------------------------------------

  /** §11 (D8): publicações anteriores do agregado + 1. */
  private async nextTransition(
    tx: PortalSqlTransaction,
    enrollmentId: string,
  ): Promise<number> {
    const row = (
      await tx.query<{ total: string | number }>(TRANSITIONS_SQL, [
        enrollmentId,
        PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
      ])
    ).rows[0];
    return Number(row?.total ?? 0) + 1;
  }

  private async cpfHashOf(
    tx: PortalSqlTransaction,
    subjectId: string,
  ): Promise<string> {
    const row = (
      await tx.query<{ cpf_hash: string }>(SUBJECT_HASH_SQL, [subjectId])
    ).rows[0];
    if (!row) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { subjectId },
      });
    }
    return row.cpf_hash;
  }

  private eventContext(now: Date, subjectId: string): PortalInboxEventContext {
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

type SneAdesaoChannel = (typeof SNE_CHANNELS)[number] | null;
