// Manifestação da Lei 13.460 ([WF-PORTAL-004]; work/rounds/R-0009/contracts/
// CTG-0002.md §2.6, §3.3, §4, §6.3 e §11; CTG-0001 §6.4; plan R-0009 M9,
// M13, M14, M21, adendas A4(b), A5(f)). `manifest` NUNCA recusa
// (RN-PORTAL-109): a única validação é `kind`; o comprovante nasce na mesma
// transação (MANIFESTACAO_REGISTRADA → COMPROVANTE_EMITIDO, protocolo da
// mesma sequência dos pedidos, `agency_due_on` = hoje + duração de
// `T-OUV-RESPOSTA` lida do vocabulário). `acknowledge` é o único comando
// cidadão (CIENCIA_AO_USUARIO → ENCERRADA → AVALIACAO_OFERECIDA na mesma
// transação); as transições do órgão existem só como serviço interno
// (OD-P18, sem rota). Idempotência M9 no `manifest` (escopo `public` quando
// anônimo).
//
// Os comandos M9 devolvem o corpo da resposta com um marcador não enumerável
// de replay (`isReplayedResponse`) — o controlador lê o marcador para o
// cabeçalho `Idempotency-Replayed`; a forma pública do corpo não muda.
import { Inject, Injectable, Optional } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { z } from 'zod';
import { addCalendarDays } from '@detran/inf-deadlines';
import {
  SqlTeatEventOutbox,
  TEAT_EVENT_OUTBOX,
  type TeatEventOutbox,
} from '@detran/shared';
import {
  PORTAL_DEFAULT_TIME_ZONE,
  PortalClock,
  PortalError,
  PortalIdentityService,
  cpfHashOf,
  parsePage,
  type PortalClockLike,
  type PortalIdentityClaims,
  type PortalPagedResponse,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';
import {
  PUBLIC_IDEMPOTENCY_SCOPE,
  PortalIdempotencyService,
  protocolNumber,
} from '@detran/portal-requests';

import {
  MANIFESTATION_KINDS,
  portalManifestationEvents,
  type PortalCitizenEventContext,
} from './events.js';
import {
  assertTransition,
  type ManifestationState,
} from './guards/manifestation.transitions.js';
import { durationOf } from './portal-timers.js';

// ---------------------------------------------------------------------------
// replay (M9) — marcador não enumerável no corpo devolvido
// ---------------------------------------------------------------------------

const REPLAYED = Symbol('PORTAL_IDEMPOTENT_REPLAY');

/** Marca um corpo devolvido pelo registro de idempotência (§4 replay). */
export function markReplayed<T extends object>(body: T): T {
  Object.defineProperty(body, REPLAYED, { value: true, enumerable: false });
  return body;
}

export function isReplayedResponse(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[REPLAYED] === true
  );
}

// ---------------------------------------------------------------------------
// tipos públicos (§2.6)
// ---------------------------------------------------------------------------

export type PortalHeaders = Record<string, string | string[] | undefined>;
export type PortalQuery = Record<string, string | string[] | undefined>;

/**
 * A ÚNICA validação que recusa é `kind` (Lei 13.460 art. 2º V); qualquer
 * outra falha de forma é normalizada (`.catch`) e campos extras são
 * ignorados — RN-PORTAL-109 "sem exigências que inviabilizem" (§2.6).
 */
export const MANIFESTATION_BODY = z
  .object({
    kind: z.enum(MANIFESTATION_KINDS),
    text: z.string().catch('').default(''),
    confidential: z.boolean().catch(false).default(false),
    attachmentIds: z.array(z.uuid()).catch([]).default([]),
    anonymous: z.boolean().catch(false).default(false),
  })
  .passthrough();

export interface ManifestationCreateResponse {
  manifestationId: string;
  protocol: string;
  receivedAt: string;
  state: 'COMPROVANTE_EMITIDO';
  agencyDueOn: string;
  anonymous: boolean;
}

export interface ManifestationListItem {
  manifestationId: string;
  state: ManifestationState;
  protocol: string;
  kind: string;
  receivedAt: string;
  deadlines: {
    agencyDueOn: string;
    extended: { justification: string; on: string; newDueOn: string } | null;
  };
  decision: { text: string | null; decidedAt: string } | null;
  evaluationOffered: boolean;
  evaluated: boolean;
}

export interface ManifestationDetailResponse extends ManifestationListItem {
  text: string;
  confidential: boolean;
}

export interface ManifestationAcknowledgeResponse {
  manifestationId: string;
  state: 'AVALIACAO_OFERECIDA';
  acknowledgedAt: string;
  evaluationOffered: true;
  version: number;
}

/** Rota M9 como o §4 a grava (`${METHOD} ${template}`). */
export const MANIFESTATIONS_ROUTE_KEY = 'POST /v1/portal/manifestations';

/** `resumeRoute` do ato `acompanhar_manifestacao` (H.51: simples para acompanhar). */
export const MANIFESTATIONS_ROUTE = '/v1/portal/manifestations';

export const FOLLOW_MANIFESTATION_ACT = 'acompanhar_manifestacao';

/** Timer da resposta do órgão (Lei 13.460 art. 16; DDL 14). */
const AGENCY_RESPONSE_TIMER = 'T-OUV-RESPOSTA';
/** Timer da informação ao agente (art. 16 §ú; DDL 14). */
const AGENT_INFO_TIMER = 'T-OUV-INFO';

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const TENANT_SQL = `select slug, timezone from auth.tenants where id = auth.current_tenant()`;

const MANIFESTATION_COLUMNS = `id, state, kind, confidential, anonymous, subject_id, text, protocol,
          received_at, to_char(agency_due_on, 'YYYY-MM-DD') as agency_due_on,
          to_char(info_due_on, 'YYYY-MM-DD') as info_due_on,
          decision_text, decided_at, acknowledged_at, version`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 64). */
const INSERT_MANIFESTATION_SQL = `insert into portal.manifestation
      (state, kind, confidential, anonymous, subject_id, text, protocol,
       received_at, agency_due_on, info_due_on, version, created_at)
    values ('COMPROVANTE_EMITIDO', $1, $2, $3, $4, $5, $6, $7, $8::date, null, 1, $7)
    returning id`;

const MANIFESTATION_FOR_UPDATE_SQL = `select ${MANIFESTATION_COLUMNS}
     from portal.manifestation
    where id = $1
    for update`;

const MANIFESTATION_SQL = `select ${MANIFESTATION_COLUMNS}
     from portal.manifestation
    where id = $1`;

const LIST_COUNT_SQL = `select count(*) as total
     from portal.manifestation
    where subject_id = $1`;

const LIST_SQL = `select ${MANIFESTATION_COLUMNS}
     from portal.manifestation
    where subject_id = $1
    order by received_at desc, id asc
    limit $2 offset $3`;

const EXTENSIONS_SQL = `select manifestation_id, justification,
          to_char(extended_on, 'YYYY-MM-DD') as extended_on,
          to_char(new_due_on, 'YYYY-MM-DD') as new_due_on
     from portal.manifestation_extension
    where manifestation_id = any($1) and timer = $2`;

const ACKNOWLEDGE_SQL = `update portal.manifestation
      set state = 'AVALIACAO_OFERECIDA', acknowledged_at = $2,
          version = version + 1, updated_at = $2
    where id = $1
    returning version`;

interface TenantRow extends Record<string, unknown> {
  slug: string;
  timezone: string | null;
}

export interface ManifestationRow extends Record<string, unknown> {
  id: string;
  state: ManifestationState;
  kind: string;
  confidential: boolean;
  anonymous: boolean;
  subject_id: string | null;
  text: string;
  protocol: string;
  received_at: Date | string;
  agency_due_on: string;
  info_due_on: string | null;
  decision_text: string | null;
  decided_at: Date | string | null;
  acknowledged_at: Date | string | null;
  version: number;
}

interface ExtensionRow extends Record<string, unknown> {
  manifestation_id: string;
  justification: string;
  extended_on: string;
  new_due_on: string;
}

interface CommandScope {
  subject: PortalSubjectRecord;
  cpfHash: string;
  tenantSlug: string;
  tenantTz: string;
  now: Date;
  today: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function notFound(kind: string): PortalError {
  return new PortalError('PORTAL.NOT_FOUND', {
    status: 404,
    context: { kind },
  });
}

function listItemOf(
  row: ManifestationRow,
  extension: ExtensionRow | undefined,
): ManifestationListItem {
  return {
    manifestationId: row.id,
    state: row.state,
    protocol: row.protocol,
    kind: row.kind,
    receivedAt: iso(row.received_at),
    deadlines: {
      agencyDueOn: row.agency_due_on,
      extended: extension
        ? {
            justification: extension.justification,
            on: extension.extended_on,
            newDueOn: extension.new_due_on,
          }
        : null,
    },
    decision: row.decided_at
      ? { text: row.decision_text, decidedAt: iso(row.decided_at) }
      : null,
    evaluationOffered: row.state === 'AVALIACAO_OFERECIDA',
    evaluated: row.state === 'AVALIADA',
  };
}

// ---------------------------------------------------------------------------
// serviço
// ---------------------------------------------------------------------------

@Injectable()
export class PortalManifestationService {
  private readonly clock: PortalClockLike;
  private readonly outbox: TeatEventOutbox;

  constructor(
    private readonly identity: PortalIdentityService,
    private readonly idempotency: PortalIdempotencyService,
    @Optional() clock?: PortalClock,
    @Optional() private readonly requestContext?: RequestContext,
    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
  ) {
    this.clock = clock ?? new PortalClock();
    this.outbox = outbox ?? new SqlTeatEventOutbox();
  }

  // -------------------------------------------------------------------------
  // §2.6 POST manifestations — anônimo admitido (H.51)
  // -------------------------------------------------------------------------

  async manifest(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims | null,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<ManifestationCreateResponse> {
    const subject = identity
      ? await this.identity.upsertSubject(tx, identity, null)
      : null;
    // 1. idempotência (§4) — escopo `public` quando anônimo
    const begun = await this.idempotency.begin(tx, {
      scope: subject?.subjectId ?? PUBLIC_IDEMPOTENCY_SCOPE,
      header: headers['idempotency-key'],
      route: MANIFESTATIONS_ROUTE_KEY,
      body,
    });
    if (begun.replay) {
      return markReplayed({
        ...(begun.replay.body as ManifestationCreateResponse),
      });
    }
    // 2. kind — a única recusa (RN-PORTAL-109)
    const parsed = MANIFESTATION_BODY.safeParse(body ?? {});
    if (!parsed.success) {
      throw new PortalError('PORTAL.MANIFESTATION_KIND_INVALID', {
        status: 400,
        context: { allowed: [...MANIFESTATION_KINDS] },
      });
    }
    const input = parsed.data;
    const anonymous = !subject || input.anonymous === true;
    // 3. comprovante imediato (M13, T-PROTOCOLO invariante)
    const tenant = await this.tenant(tx);
    const now = this.clock.now();
    const today = this.clock.today(tenant.tenantTz);
    const protocol = await protocolNumber(tx, tenant.tenantSlug, today);
    const agencyDays = await durationOf(tx, AGENCY_RESPONSE_TIMER);
    if (agencyDays === null) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { timerCode: AGENCY_RESPONSE_TIMER },
      });
    }
    const agencyDueOn = addCalendarDays(today, agencyDays);
    const inserted = (
      await tx.query<{ id: string }>(INSERT_MANIFESTATION_SQL, [
        input.kind,
        input.confidential,
        anonymous,
        anonymous ? null : subject!.subjectId,
        input.text,
        protocol,
        now,
        agencyDueOn,
      ])
    ).rows[0];
    if (!inserted) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    // 4. evento (§11)
    await this.outbox.append(
      tx as never,
      portalManifestationEvents.registrada(
        inserted.id,
        1,
        {
          manifestationId: inserted.id,
          protocol,
          kind: input.kind,
          anonymous,
          subjectId: anonymous ? null : subject!.subjectId,
          subjectCpfHash:
            anonymous || !identity ? null : cpfHashOf(identity.cpf),
          receivedAt: now.toISOString(),
          agencyDueOn,
          toState: 'COMPROVANTE_EMITIDO',
        },
        this.eventContext(now, subject?.subjectId),
      ),
    );
    const response: ManifestationCreateResponse = {
      manifestationId: inserted.id,
      protocol,
      receivedAt: now.toISOString(),
      state: 'COMPROVANTE_EMITIDO',
      agencyDueOn,
      anonymous,
    };
    await begun.record(201, response);
    return response;
  }

  // -------------------------------------------------------------------------
  // §2.6 GET manifestations / GET manifestations/{id}
  // -------------------------------------------------------------------------

  async list(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    query: PortalQuery,
  ): Promise<PortalPagedResponse<ManifestationListItem>> {
    const scope = await this.scope(tx, identity);
    await this.identity.assertActLevel(
      tx,
      identity,
      FOLLOW_MANIFESTATION_ACT,
      MANIFESTATIONS_ROUTE,
    );
    const page = parsePage(query);
    const total = (
      await tx.query<{ total: string | number }>(LIST_COUNT_SQL, [
        scope.subject.subjectId,
      ])
    ).rows[0];
    const rows = (
      await tx.query<ManifestationRow>(LIST_SQL, [
        scope.subject.subjectId,
        page.limit,
        page.offset,
      ])
    ).rows;
    const extensions = await this.extensionsOf(
      tx,
      rows.map((row) => row.id),
    );
    return {
      items: rows.map((row) => listItemOf(row, extensions.get(row.id))),
      total: Number(total?.total ?? 0),
      page: page.page,
      pageSize: page.pageSize,
    };
  }

  async get(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    manifestationId: string,
  ): Promise<ManifestationDetailResponse> {
    const scope = await this.scope(tx, identity);
    await this.identity.assertActLevel(
      tx,
      identity,
      FOLLOW_MANIFESTATION_ACT,
      MANIFESTATIONS_ROUTE,
    );
    const row = await this.owned(tx, scope, manifestationId, MANIFESTATION_SQL);
    const extensions = await this.extensionsOf(tx, [row.id]);
    return {
      ...listItemOf(row, extensions.get(row.id)),
      text: row.text,
      confidential: row.confidential,
    };
  }

  // -------------------------------------------------------------------------
  // §2.6 POST manifestations/{id}/acknowledge
  // -------------------------------------------------------------------------

  async acknowledge(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    manifestationId: string,
  ): Promise<ManifestationAcknowledgeResponse> {
    const scope = await this.scope(tx, identity);
    await this.identity.assertActLevel(
      tx,
      identity,
      FOLLOW_MANIFESTATION_ACT,
      MANIFESTATIONS_ROUTE,
    );
    const row = await this.owned(
      tx,
      scope,
      manifestationId,
      MANIFESTATION_FOR_UPDATE_SQL,
    );
    assertTransition(row, { command: 'acknowledge' });
    // ENCERRADA → AVALIACAO_OFERECIDA na mesma transação (M13, offer_evaluation)
    const updated = (
      await tx.query<{ version: number }>(ACKNOWLEDGE_SQL, [row.id, scope.now])
    ).rows[0];
    const version = Number(updated?.version ?? row.version + 1);
    await this.outbox.append(
      tx as never,
      portalManifestationEvents.encerrada(
        row.id,
        version,
        {
          manifestationId: row.id,
          protocol: row.protocol,
          acknowledgedAt: scope.now.toISOString(),
          fromState: 'CIENCIA_AO_USUARIO',
          toState: 'AVALIACAO_OFERECIDA',
          subjectId: scope.subject.subjectId,
          subjectCpfHash: scope.cpfHash,
        },
        this.eventContext(scope.now, scope.subject.subjectId),
      ),
    );
    return {
      manifestationId: row.id,
      state: 'AVALIACAO_OFERECIDA',
      acknowledgedAt: scope.now.toISOString(),
      evaluationOffered: true,
      version,
    };
  }

  // -------------------------------------------------------------------------
  // transições do órgão (CTG-0001 §6.4) — sem rota nesta rodada (OD-P18)
  // -------------------------------------------------------------------------

  /** COMPROVANTE_EMITIDO → EM_ANALISE. */
  analyze(tx: PortalSqlTransaction, manifestationId: string): Promise<number> {
    return this.internalTransition(tx, manifestationId, 'analyze', {});
  }

  /** EM_ANALISE → INFORMACAO_SOLICITADA_AO_AGENTE; `info_due_on` = hoje + T-OUV-INFO. */
  async requestInfo(
    tx: PortalSqlTransaction,
    manifestationId: string,
  ): Promise<number> {
    const tenant = await this.tenant(tx);
    const days = await durationOf(tx, AGENT_INFO_TIMER);
    if (days === null) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { timerCode: AGENT_INFO_TIMER },
      });
    }
    const infoDueOn = addCalendarDays(this.clock.today(tenant.tenantTz), days);
    return this.internalTransition(tx, manifestationId, 'request_info', {
      info_due_on: infoDueOn,
    });
  }

  /** INFORMACAO_SOLICITADA_AO_AGENTE → EM_ANALISE. */
  receiveInfo(
    tx: PortalSqlTransaction,
    manifestationId: string,
  ): Promise<number> {
    return this.internalTransition(tx, manifestationId, 'receive_info', {});
  }

  /** EM_ANALISE → DECISAO_FINAL_ELABORADA; `decision_text`, `decided_at`. */
  decide(
    tx: PortalSqlTransaction,
    manifestationId: string,
    decisionText: string,
  ): Promise<number> {
    return this.internalTransition(tx, manifestationId, 'decide', {
      decision_text: decisionText,
      decided_at: this.clock.now(),
    });
  }

  /** DECISAO_FINAL_ELABORADA → CIENCIA_AO_USUARIO (o `inbox_item` é OD-P40). */
  notifyUser(
    tx: PortalSqlTransaction,
    manifestationId: string,
  ): Promise<number> {
    return this.internalTransition(tx, manifestationId, 'notify_user', {});
  }

  // -------------------------------------------------------------------------
  // apoio
  // -------------------------------------------------------------------------

  private async internalTransition(
    tx: PortalSqlTransaction,
    manifestationId: string,
    command: string,
    changes: Record<string, unknown>,
  ): Promise<number> {
    if (!UUID_RE.test(manifestationId)) throw notFound('manifestation');
    const row = (
      await tx.query<ManifestationRow>(MANIFESTATION_FOR_UPDATE_SQL, [
        manifestationId,
      ])
    ).rows[0];
    if (!row) throw notFound('manifestation');
    const transition = assertTransition(row, { command });
    const now = this.clock.now();
    const assignments: string[] = [];
    const values: unknown[] = [row.id, transition.to];
    assignments.push('state = $2');
    for (const [column, value] of Object.entries(changes)) {
      values.push(value ?? null);
      assignments.push(`${column} = $${values.length}`);
    }
    values.push(now);
    assignments.push(`updated_at = $${values.length}`);
    assignments.push('version = version + 1');
    const updated = (
      await tx.query<{ version: number }>(
        `update portal.manifestation set ${assignments.join(', ')} where id = $1 returning version`,
        values,
      )
    ).rows[0];
    return Number(updated?.version ?? row.version + 1);
  }

  private async tenant(
    tx: PortalSqlTransaction,
  ): Promise<{ tenantSlug: string; tenantTz: string }> {
    const tenant = (await tx.query<TenantRow>(TENANT_SQL)).rows[0];
    if (!tenant) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    return {
      tenantSlug: tenant.slug,
      tenantTz: tenant.timezone ?? PORTAL_DEFAULT_TIME_ZONE,
    };
  }

  /** §0: sujeito (upsert idempotente), fuso e slug do tenant, relógio. */
  private async scope(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
  ): Promise<CommandScope> {
    const subject = await this.identity.upsertSubject(tx, identity, null);
    const tenant = await this.tenant(tx);
    const now = this.clock.now();
    return {
      subject,
      cpfHash: cpfHashOf(identity.cpf),
      tenantSlug: tenant.tenantSlug,
      tenantTz: tenant.tenantTz,
      now,
      today: this.clock.today(tenant.tenantTz),
    };
  }

  private async owned(
    tx: PortalSqlTransaction,
    scope: CommandScope,
    manifestationId: string,
    sql: string,
  ): Promise<ManifestationRow> {
    if (!UUID_RE.test(manifestationId)) throw notFound('manifestation');
    const row = (await tx.query<ManifestationRow>(sql, [manifestationId]))
      .rows[0];
    if (!row || row.subject_id !== scope.subject.subjectId) {
      throw notFound('manifestation');
    }
    return row;
  }

  private async extensionsOf(
    tx: PortalSqlTransaction,
    ids: readonly string[],
  ): Promise<Map<string, ExtensionRow>> {
    if (ids.length === 0) return new Map();
    const rows = (
      await tx.query<ExtensionRow>(EXTENSIONS_SQL, [
        [...ids],
        AGENCY_RESPONSE_TIMER,
      ])
    ).rows;
    return new Map(rows.map((row) => [row.manifestation_id, row]));
  }

  private eventContext(
    now: Date,
    subjectId: string | undefined,
  ): PortalCitizenEventContext {
    const snapshot = this.requestContext?.hasActiveContext()
      ? this.requestContext.snapshot()
      : undefined;
    return {
      occurredAt: now.toISOString(),
      actorId: snapshot?.actorId ?? subjectId ?? '',
      correlationId: snapshot?.requestId ?? '',
    };
  }
}
