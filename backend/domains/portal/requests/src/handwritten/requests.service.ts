// Ciclo comum de pedidos do cidadão (work/rounds/R-0009/contracts/CTG-0002.md
// §2.3, §3, §4, §5 e §11; plan R-0009 M7–M10, M21, adendas A1(c), A4(a), A5).
// Um método por comando, cada um em `parse` (zod) → `guard` (ownership,
// If-Match, estado, nível) → `apply` (escritas na transação recebida) →
// `events` (outbox na mesma transação). O controlador abre a transação
// (`withTenantContext`) e trata os dois casos "commit e lança" do §3.1
// (403 `ASSURANCE_INSUFFICIENT` com estado persistido; 502
// `DELEGATION_FAILED` com protocolo mantido) — ver `commitThenThrow`.
//
// SQL parametrizado e dentro do subconjunto documentado em
// `tests/support/fake-sql.ts`; tenant nunca no payload (RLS + trigger).
import { Inject, Injectable, Optional } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { z } from 'zod';
import {
  DetranError,
  SqlTeatEventOutbox,
  TEAT_EVENT_OUTBOX,
  assertIfMatch,
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
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import type { Request } from '../entities/request.entity.js';
import {
  RequestDelegationService,
  type DelegationResult,
  type DelegationTargetKind,
} from './delegation/delegation.service.js';
import {
  CONSEQUENCE_ACK_KIND_BY_SERVICE,
  DRAFT_SCHEMAS,
  OWN_ROUTE_BY_SERVICE,
} from './drafts.js';
import { portalRequestEvents, type PortalEventContext } from './events.js';
import {
  REQUEST_ALLOWED_STATES_BY_COMMAND,
  REQUEST_STATES,
  assertTransition,
  type RequestState,
} from './guards/request.transitions.js';
import { PortalIdempotencyService } from './idempotency.service.js';
import { protocolNumber, receiptHash, receiptOf } from './protocol.js';

// ---------------------------------------------------------------------------
// tipos públicos
// ---------------------------------------------------------------------------

export type PortalHeaders = Record<string, string | string[] | undefined>;

export type PortalQuery = Record<string, string | string[] | undefined>;

/** Resultado de um comando M9 (§4): status HTTP, corpo e se foi replay. */
export interface PortalCommandOutcome<T = Record<string, unknown>> {
  status: number;
  body: T;
  replayed: boolean;
}

export interface RequestProtocolView {
  number: string;
  issuedAt: string;
  channel: 'portal';
  receiptHash: string;
}

export interface RequestCreateResponse {
  requestId: string;
  state: 'PEDIDO_EM_COMPOSICAO';
  prefilled: Record<string, never>;
  requirements: unknown;
  minimumAssurance: string;
  version: number;
}

export interface RequestDraftResponse {
  requestId: string;
  version: number;
  savedAt: string;
}

export interface RequestSubmitResponse {
  requestId: string;
  state: RequestState;
  protocol: RequestProtocolView;
  delegation: {
    status: 'delegated' | 'not_applicable';
    externalId: string | null;
  };
  version: number;
}

export interface RequestWithdrawResponse {
  requestId: string;
  state: 'DESISTIDO';
  withdrawnAt: string;
  version: number;
}

export interface RequestEvaluateResponse {
  evaluationId: string;
  requestId: string;
  state: 'CONCLUIDO';
  submittedAt: string;
}

export interface RequestNextAction {
  by: 'citizen' | 'agency' | 'none';
  label: string;
  dueOn: null;
}

export interface RequestListItem {
  requestId: string;
  protocol: string | null;
  serviceKey: string;
  targetLabel: string | null;
  situation: string;
  nextAction: RequestNextAction;
  updatedAt: string;
}

export interface RequestDetailResponse {
  request: {
    requestId: string;
    state: string;
    serviceKey: string;
    targetKind: string;
    targetId: string | null;
    channel: string;
    minimumAssurance: string;
    delegation: {
      status: string;
      domain: string | null;
      command: string | null;
      externalId: string | null;
      error: string | null;
    };
    protocol: RequestProtocolView | null;
    draft: { version: number; payload: unknown; savedAt: string } | null;
    withdrawnAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    version: number;
  };
  timeline: unknown[];
  deadlines: unknown[];
  documents: never[];
  diligences: unknown[];
  decision: unknown;
  actions: {
    canRespondDiligence: false;
    canWithdraw: boolean;
    withdrawalBlockedReason: null | 'estado_nao_admite';
    canAppeal: false;
    nextInstanceServiceKey: null;
  };
}

// ---------------------------------------------------------------------------
// §3.5 NEXT_ACTION_BY_STATE — rótulo é chave i18n (a UI traduz)
// ---------------------------------------------------------------------------

const NEXT_ACTION_LABEL_PREFIX = 'portal' + '.requests.nextAction.';

const NEXT_ACTION_BY: Readonly<Record<RequestState, RequestNextAction['by']>> =
  {
    IDENTIFICADO: 'none',
    SERVICO_SELECIONADO: 'none',
    ELEGIBILIDADE_VERIFICADA: 'none',
    INELEGIVEL: 'none',
    PEDIDO_EM_COMPOSICAO: 'citizen',
    AGUARDANDO_NIVEL_ASSINATURA: 'citizen',
    AGUARDANDO_PAGAMENTO: 'citizen',
    PROTOCOLADO: 'agency',
    EM_ANDAMENTO_NO_ORGAO: 'agency',
    RESULTADO_DISPONIVEL: 'citizen',
    AVALIACAO_OFERECIDA: 'citizen',
    CONCLUIDO: 'none',
    DESISTIDO: 'none',
  };

export const NEXT_ACTION_BY_STATE: Readonly<
  Record<RequestState, RequestNextAction>
> = Object.fromEntries(
  REQUEST_STATES.map((state) => [
    state,
    {
      by: NEXT_ACTION_BY[state],
      label: `${NEXT_ACTION_LABEL_PREFIX}${state}`,
      dueOn: null,
    },
  ]),
) as Record<RequestState, RequestNextAction>;

// ---------------------------------------------------------------------------
// "commit e lança" (§3.1 passos 5 e 10)
// ---------------------------------------------------------------------------

const COMMIT_THEN_THROW = Symbol('PORTAL_COMMIT_THEN_THROW');

/** Marca um erro cujo estado persistido deve ser COMMITADO antes de responder. */
export function commitThenThrow<T extends Error>(error: T): T {
  Object.defineProperty(error, COMMIT_THEN_THROW, {
    value: true,
    enumerable: false,
  });
  return error;
}

export function isCommitThenThrow(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as Record<symbol, unknown>)[COMMIT_THEN_THROW] === true
  );
}

// ---------------------------------------------------------------------------
// DTOs zod (§2.3)
// ---------------------------------------------------------------------------

const TARGET_KINDS = [
  'ait',
  'case',
  'vehicle',
  'exam',
  'crash',
  'none',
] as const;

const CREATE_BODY = z.strictObject({
  serviceKey: z.string().min(1),
  targetKind: z.enum(TARGET_KINDS),
  targetId: z.uuid().optional(),
  channel: z.literal('portal'),
});

const ATTACHMENT_BODY = z.strictObject({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.int().min(0),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
});

const SUBMIT_BODY = z.strictObject({
  signature: z.strictObject({
    method: z.enum(['govbr', 'upload']),
    signatureRef: z.string().min(1),
  }),
  consequenceAck: z
    .strictObject({
      textVersion: z.string().min(1),
      acceptedAt: z.iso.datetime(),
    })
    .optional(),
});

const WITHDRAW_BODY = z.strictObject({
  confirm: z.literal(true),
  reason: z.string().max(2000).optional(),
});

const RESPOND_BODY = z.strictObject({
  text: z.string().min(1),
  attachmentIds: z.array(z.uuid()),
});

export const EVALUATION_SCORES = z.strictObject({
  satisfaction: z.int(),
  quality: z.int(),
  deadline: z.int(),
  clarity: z.int(),
  channel: z.int(),
});

const EVALUATE_BODY = z.strictObject({
  scores: EVALUATION_SCORES,
  comment: z.string().max(2000).optional(),
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rotas M9 como o §4 as grava (`${METHOD} ${template}`). */
export const REQUEST_ROUTES = {
  create: 'POST /v1/portal/requests',
  submit: 'POST /v1/portal/requests/{id}/submit',
  respond: 'POST /v1/portal/requests/{id}/diligences/{did}/responses',
  evaluate: 'POST /v1/portal/requests/{id}/evaluation',
} as const;

/** Comando delegado das diligências (§2.3; alvo do mapa §3.2). */
export const DILIGENCE_DELEGATION_KEY = 'inf:rait-case:answer-inquiry';

const SIGNED_DOCUMENT_PENDING = 'documento_assinado_pendente_r0014';

/**
 * `kind` das entradas de diligência na timeline (§2.3 GET requests/{id});
 * montado por concatenação (`verify:parameter-catalogue`).
 */
const INQUIRY_TIMELINE_KIND = 'rait' + '.inquiry.changed';
const WITHDRAWAL_TEXT_VERSION = 'source_pending';

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const TENANT_SQL = `select slug, timezone from auth.tenants where id = auth.current_tenant()`;

const CATALOG_SQL = `select id, availability, unavailable_reason, alternative_channel_note,
          minimum_assurance, requirements_json
     from portal.service_catalog
    where service_key = $1
    limit 1`;

const INFRACTION_VIEW_EXISTS_SQL = `select id from portal.infraction_view where ait_id = $1 limit 1`;

const OPEN_DRAFT_STATES = `('PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA', 'AGUARDANDO_PAGAMENTO')`;

const OPEN_DRAFT_WITH_TARGET_SQL = `select id
     from portal.request
    where subject_id = $1 and service_key = $2 and target_kind = $3 and target_id = $4
      and state in ${OPEN_DRAFT_STATES}
    order by created_at desc
    limit 1`;

const OPEN_DRAFT_WITHOUT_TARGET_SQL = `select id
     from portal.request
    where subject_id = $1 and service_key = $2 and target_kind = $3 and target_id is null
      and state in ${OPEN_DRAFT_STATES}
    order by created_at desc
    limit 1`;

const INSERT_REQUEST_SQL = `insert into portal.request
      (state, service_key, subject_id, target_kind, target_id, channel,
       delegation_status, minimum_assurance, version, created_at)
    values ($1, $2, $3, $4, $5, 'portal', 'pending', $6, 1, $7)
    returning id, created_at`;

const INSERT_DRAFT_SQL = `insert into portal.request_draft
      (request_id, version, payload_json, saved_at)
    values ($1, $2, $3::jsonb, $4)`;

const REQUEST_FOR_UPDATE_SQL = `select * from portal.request where id = $1 for update`;

const REQUEST_SQL = `select * from portal.request where id = $1`;

const LATEST_DRAFT_SQL = `select version, payload_json, saved_at
     from portal.request_draft
    where request_id = $1
    order by version desc
    limit 1`;

const PROTOCOL_SQL = `select number, issued_at, channel, receipt_hash
     from portal.protocol
    where request_id = $1
    limit 1`;

const INSERT_PROTOCOL_SQL = `insert into portal.protocol
      (request_id, number, issued_at, channel, receipt_hash)
    values ($1, $2, $3, 'portal', $4)`;

const INSERT_CONSEQUENCE_ACK_SQL = `insert into portal.consequence_ack
      (request_id, kind, text_version, accepted_at)
    values ($1, $2, $3, $4)`;

const EVALUATION_EXISTS_SQL = `select id
     from portal.evaluation
    where subject_kind = 'request' and subject_id = $1
    limit 1`;

const INSERT_EVALUATION_SQL = `insert into portal.evaluation
      (subject_kind, subject_id, scores_json, comment, submitted_at)
    values ('request', $1, $2::jsonb, $3, $4)
    returning id`;

const TIMELINE_SQL = `select entries_json, deadlines_json, decision_json
     from portal.process_timeline
    where request_id = $1
    limit 1`;

interface TenantRow extends Record<string, unknown> {
  slug: string;
  timezone: string | null;
}

interface CatalogRow extends Record<string, unknown> {
  id: string;
  availability: 'available' | 'partially_available' | 'unavailable';
  unavailable_reason: string | null;
  alternative_channel_note: string | null;
  minimum_assurance: string;
  requirements_json: unknown;
}

interface DraftRow extends Record<string, unknown> {
  version: number;
  payload_json: unknown;
  saved_at: Date | string;
}

interface ProtocolRow extends Record<string, unknown> {
  number: string;
  issued_at: Date | string;
  channel: 'portal';
  receipt_hash: string;
}

interface TimelineRow extends Record<string, unknown> {
  entries_json: unknown;
  deadlines_json: unknown;
  decision_json: unknown;
}

interface ListRow extends Record<string, unknown> {
  id: string;
  state: string;
  service_key: string;
  created_at: Date | string;
  updated_at: Date | string | null;
  protocol_number: string | null;
  target_label: string | null;
}

type RequestRow = Request & Record<string, unknown>;

interface CommandScope {
  subject: PortalSubjectRecord;
  cpfHash: string;
  tenantSlug: string;
  tenantTz: string;
  now: Date;
  today: string;
}

// ---------------------------------------------------------------------------
// utilitários
// ---------------------------------------------------------------------------

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function validationFailed(fields: string[]): PortalError {
  return new PortalError('PORTAL.VALIDATION_FAILED', {
    status: 400,
    context: { fields: [...new Set(fields)] },
  });
}

/** Forma zod → 400 `PORTAL.VALIDATION_FAILED { fields[] }` (§0). */
function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body ?? {});
  if (parsed.success) return parsed.data;
  const fields = parsed.error.issues.map((issue) => {
    if (issue.path.length > 0) return issue.path.map(String).join('.');
    const keys = (issue as { keys?: string[] }).keys;
    return keys && keys.length > 0 ? keys.join(',') : 'body';
  });
  throw validationFailed(fields);
}

function assertUuid(value: string, field: string): void {
  if (!UUID_RE.test(value)) throw validationFailed([field]);
}

function notFound(kind: string): PortalError {
  return new PortalError('PORTAL.NOT_FOUND', {
    status: 404,
    context: { kind },
  });
}

function serviceUnavailable(
  unavailableReason: string,
  alternativeChannelNote: string | null,
): PortalError {
  return new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
    status: 422,
    context: { unavailableReason, alternativeChannelNote },
  });
}

function protocolView(row: ProtocolRow): RequestProtocolView {
  return {
    number: row.number,
    issuedAt: iso(row.issued_at),
    channel: 'portal',
    receiptHash: row.receipt_hash,
  };
}

/** `DetranError.code` ou `error.name`; texto livre nunca (§3.1 passo 10). */
function codeOf(error: unknown): string {
  if (error instanceof DetranError) return error.code;
  if (error instanceof Error && error.name) return error.name;
  return 'Error';
}

function isPortalCode(error: unknown, code: string): error is DetranError {
  return error instanceof DetranError && error.code === code;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// ---------------------------------------------------------------------------
// serviço
// ---------------------------------------------------------------------------

@Injectable()
export class PortalRequestsService {
  private readonly clock: PortalClockLike;
  private readonly outbox: TeatEventOutbox;

  constructor(
    private readonly identity: PortalIdentityService,
    private readonly delegation: RequestDelegationService,
    private readonly idempotency: PortalIdempotencyService,
    @Optional() clock?: PortalClock,
    @Optional() private readonly requestContext?: RequestContext,
    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
  ) {
    this.clock = clock ?? new PortalClock();
    this.outbox = outbox ?? new SqlTeatEventOutbox();
  }

  // -------------------------------------------------------------------------
  // §2.3 POST requests
  // -------------------------------------------------------------------------

  async create(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<PortalCommandOutcome<RequestCreateResponse>> {
    const scope = await this.scope(tx, identity);
    // 1. idempotência (§4)
    const begun = await this.idempotency.begin(tx, {
      scope: scope.subject.subjectId,
      header: headers['idempotency-key'],
      route: REQUEST_ROUTES.create,
      body,
    });
    if (begun.replay) return this.replayOf(begun.replay);
    // 2. corpo
    const input = parseBody(CREATE_BODY, body);
    if ((input.targetKind === 'none') !== (input.targetId === undefined)) {
      throw validationFailed(['targetId']);
    }
    // 3. catálogo
    const catalog = await this.catalogOf(tx, input.serviceKey);
    if (!catalog) throw notFound('service');
    if (catalog.availability === 'unavailable') {
      throw serviceUnavailable(
        catalog.unavailable_reason ?? '',
        catalog.alternative_channel_note,
      );
    }
    // 4. serviço com rota própria
    const ownRoute = OWN_ROUTE_BY_SERVICE[input.serviceKey];
    if (ownRoute) {
      throw new PortalError('PORTAL.INELIGIBLE', {
        status: 422,
        context: {
          reason: 'servico_com_rota_propria',
          alternative: ownRoute,
          serviceKey: input.serviceKey,
        },
      });
    }
    // 5. alvo da delegação
    const target = this.delegation.targetFor(input.serviceKey);
    const unavailableReason = target.availability();
    if (unavailableReason !== null) {
      throw serviceUnavailable(
        unavailableReason,
        catalog.alternative_channel_note ?? null,
      );
    }
    // 6. targetKind admitido
    if (!(target.targetKinds as readonly string[]).includes(input.targetKind)) {
      throw validationFailed(['targetKind']);
    }
    // 7. vínculo (M10)
    if (input.targetId !== undefined) {
      await this.assertEntitledForCreate(
        tx,
        scope,
        input.serviceKey,
        input.targetKind,
        input.targetId,
      );
    }
    // 8. rascunho em aberto
    const open = await tx.query<{ id: string }>(
      input.targetId === undefined
        ? OPEN_DRAFT_WITHOUT_TARGET_SQL
        : OPEN_DRAFT_WITH_TARGET_SQL,
      input.targetId === undefined
        ? [scope.subject.subjectId, input.serviceKey, input.targetKind]
        : [
            scope.subject.subjectId,
            input.serviceKey,
            input.targetKind,
            input.targetId,
          ],
    );
    if (open.rows[0]) {
      throw new PortalError('PORTAL.REQUEST_DRAFT_EXISTS', {
        status: 409,
        context: { requestId: open.rows[0].id },
      });
    }
    // apply
    const inserted = await tx.query<{ id: string }>(INSERT_REQUEST_SQL, [
      'PEDIDO_EM_COMPOSICAO',
      input.serviceKey,
      scope.subject.subjectId,
      input.targetKind,
      input.targetId ?? null,
      catalog.minimum_assurance,
      scope.now,
    ]);
    const requestId = inserted.rows[0]?.id;
    if (!requestId) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    await tx.query(INSERT_DRAFT_SQL, [requestId, 1, '{}', scope.now]);
    // events
    await this.outbox.append(
      tx as never,
      portalRequestEvents.criada(
        requestId,
        1,
        {
          requestId,
          serviceKey: input.serviceKey,
          subjectId: scope.subject.subjectId,
          subjectCpfHash: scope.cpfHash,
          targetKind: input.targetKind,
          targetId: input.targetId ?? null,
          fromState: null,
          toState: 'PEDIDO_EM_COMPOSICAO',
          occurredAt: scope.now.toISOString(),
        },
        this.eventContext(scope),
      ),
    );
    const response: RequestCreateResponse = {
      requestId,
      state: 'PEDIDO_EM_COMPOSICAO',
      prefilled: {},
      requirements: asArray(catalog.requirements_json),
      minimumAssurance: catalog.minimum_assurance,
      version: 1,
    };
    await begun.record(201, response);
    return { status: 201, body: response, replayed: false };
  }

  // -------------------------------------------------------------------------
  // §2.3 PUT requests/{id}/draft
  // -------------------------------------------------------------------------

  async updateDraft(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<RequestDraftResponse> {
    const scope = await this.scope(tx, identity);
    const request = await this.ownedForUpdate(tx, scope, requestId);
    assertIfMatch(headers['if-match'], request.version, 'PORTAL');
    assertTransition(request, { command: 'draft' });
    const schema: z.ZodType | undefined =
      DRAFT_SCHEMAS[request.service_key as keyof typeof DRAFT_SCHEMAS];
    if (!schema) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { serviceKey: request.service_key },
      });
    }
    const payload = parseBody(schema, body);
    const version = await this.bump(tx, request.id, {}, scope.now);
    await tx.query(INSERT_DRAFT_SQL, [
      request.id,
      version,
      JSON.stringify(payload),
      scope.now,
    ]);
    return { requestId: request.id, version, savedAt: scope.now.toISOString() };
  }

  // -------------------------------------------------------------------------
  // §2.3 POST requests/{id}/attachments[/{attachmentId}/complete]
  // -------------------------------------------------------------------------

  async intendAttachment(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    body: unknown,
  ): Promise<never> {
    const scope = await this.scope(tx, identity);
    const request = await this.ownedForUpdate(tx, scope, requestId);
    assertTransition(request, { command: 'draft' });
    parseBody(ATTACHMENT_BODY, body);
    const catalog = await this.catalogOf(tx, request.service_key);
    throw serviceUnavailable(
      SIGNED_DOCUMENT_PENDING,
      catalog?.alternative_channel_note ?? null,
    );
  }

  async completeAttachment(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    attachmentId: string,
  ): Promise<never> {
    const scope = await this.scope(tx, identity);
    const request = await this.ownedForUpdate(tx, scope, requestId);
    assertUuid(attachmentId, 'attachmentId');
    const catalog = await this.catalogOf(tx, request.service_key);
    throw serviceUnavailable(
      SIGNED_DOCUMENT_PENDING,
      catalog?.alternative_channel_note ?? null,
    );
  }

  // -------------------------------------------------------------------------
  // §3.1 POST requests/{id}/submit — protocolo imediato e delegação
  // -------------------------------------------------------------------------

  async submit(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<PortalCommandOutcome<RequestSubmitResponse>> {
    // 0.
    const scope = await this.scope(tx, identity);
    // 1. idempotência
    const begun = await this.idempotency.begin(tx, {
      scope: scope.subject.subjectId,
      header: headers['idempotency-key'],
      route: REQUEST_ROUTES.submit,
      body,
    });
    if (begun.replay) return this.replayOf(begun.replay);
    // 2. forma do PRÓPRIO comando
    const input = parseBody(SUBMIT_BODY, body);
    // 3. ownership (for update)
    const request = await this.ownedForUpdate(tx, scope, requestId);
    // 4. estado
    assertTransition(request, { command: 'submit' });
    // 9 (lido antes por causa do actKey composto de lgpd_declaracao, A2(a))
    const draft = await this.latestDraft(tx, request.id);
    const draftPayload =
      draft && typeof draft.payload_json === 'object' && draft.payload_json
        ? (draft.payload_json as Record<string, unknown>)
        : {};
    // 5. nível do ato
    const actKey = this.actKeyOf(request.service_key, draftPayload);
    const decision = await this.assertActLevelOrPersist(
      tx,
      identity,
      request,
      actKey,
      scope,
    );
    // 6. ciência de consequência
    const ackKind = CONSEQUENCE_ACK_KIND_BY_SERVICE[request.service_key];
    if (ackKind) {
      if (!input.consequenceAck) {
        throw new PortalError('PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED', {
          status: 422,
          context: { textVersion: null },
        });
      }
      await tx.query(INSERT_CONSEQUENCE_ACK_SQL, [
        request.id,
        ackKind,
        input.consequenceAck.textVersion,
        input.consequenceAck.acceptedAt,
      ]);
    }
    // 7. pré-condição financeira: sem código de decisão nesta rodada (R-0007/R-0014)
    // 8. PROTOCOLO IMEDIATO (T-PROTOCOLO)
    const number = await protocolNumber(
      tx,
      scope.tenantSlug,
      scope.today,
      request.id,
    );
    const issuedAt = scope.now;
    const receipt = receiptOf({
      serviceKey: request.service_key,
      requestId: request.id,
      number,
      issuedAt,
      channel: 'portal',
    });
    const hash = receiptHash(receipt);
    await tx.query(INSERT_PROTOCOL_SQL, [request.id, number, issuedAt, hash]);
    const fromState = request.state as RequestState;
    const protocoledVersion = await this.bump(
      tx,
      request.id,
      { state: 'PROTOCOLADO', minimum_assurance: decision.required },
      scope.now,
    );
    await this.outbox.append(
      tx as never,
      portalRequestEvents.protocolada(
        request.id,
        protocoledVersion,
        {
          requestId: request.id,
          serviceKey: request.service_key,
          subjectId: scope.subject.subjectId,
          subjectCpfHash: scope.cpfHash,
          protocolNumber: number,
          issuedAt: issuedAt.toISOString(),
          receiptHash: hash,
          fromState,
          toState: 'PROTOCOLADO',
        },
        this.eventContext(scope),
      ),
    );
    const protocol: RequestProtocolView = {
      number,
      issuedAt: issuedAt.toISOString(),
      channel: 'portal',
      receiptHash: hash,
    };
    // 10. delegação
    let result: DelegationResult;
    try {
      result = await this.delegation.delegate(request.service_key, {
        tx,
        request: {
          ...request,
          state: 'PROTOCOLADO',
          minimum_assurance: decision.required,
          version: protocoledVersion,
        },
        draft: draftPayload,
        identity,
        subject: scope.subject,
        protocol: { number, issuedAt, receiptHash: hash },
        clock: this.clock,
        tenantTz: scope.tenantTz,
      });
    } catch (error) {
      await this.bump(
        tx,
        request.id,
        { delegation_status: 'failed', delegation_error: codeOf(error) },
        scope.now,
      );
      const failure = new PortalError('PORTAL.DELEGATION_FAILED', {
        status: 502,
        context: { protocol: number, retryPolicy: 'pendencia_interna' },
        cause: error,
      });
      await begun.record(502, {
        code: failure.code,
        message: failure.message,
        context: failure.context,
      });
      throw commitThenThrow(failure);
    }
    let version = await this.bump(
      tx,
      request.id,
      {
        state: 'EM_ANDAMENTO_NO_ORGAO',
        delegation_domain: result.domain,
        delegation_command: result.command,
        delegation_external_id: result.externalId,
        delegation_status: result.status,
      },
      scope.now,
    );
    let state: RequestState = 'EM_ANDAMENTO_NO_ORGAO';
    if (result.immediateResult === true) {
      await this.bump(
        tx,
        request.id,
        { state: 'RESULTADO_DISPONIVEL' },
        scope.now,
      );
      version = await this.bump(
        tx,
        request.id,
        { state: 'AVALIACAO_OFERECIDA' },
        scope.now,
      );
      state = 'AVALIACAO_OFERECIDA';
    }
    // 11.
    const response: RequestSubmitResponse = {
      requestId: request.id,
      state,
      protocol,
      delegation: { status: result.status, externalId: result.externalId },
      version,
    };
    await begun.record(200, response);
    return { status: 200, body: response, replayed: false };
  }

  // -------------------------------------------------------------------------
  // §2.3 POST requests/{id}/withdraw
  // -------------------------------------------------------------------------

  async withdraw(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<RequestWithdrawResponse> {
    const scope = await this.scope(tx, identity);
    const request = await this.ownedForUpdate(tx, scope, requestId);
    assertIfMatch(headers['if-match'], request.version, 'PORTAL');
    parseBody(WITHDRAW_BODY, body);
    assertTransition(request, { command: 'withdraw' });
    const fromState = request.state as RequestState;
    const version = await this.bump(
      tx,
      request.id,
      { state: 'DESISTIDO', withdrawn_at: scope.now },
      scope.now,
    );
    await tx.query(INSERT_CONSEQUENCE_ACK_SQL, [
      request.id,
      'desistencia',
      WITHDRAWAL_TEXT_VERSION,
      scope.now,
    ]);
    await this.outbox.append(
      tx as never,
      portalRequestEvents.desistida(
        request.id,
        version,
        {
          requestId: request.id,
          serviceKey: request.service_key,
          subjectId: scope.subject.subjectId,
          subjectCpfHash: scope.cpfHash,
          fromState,
          toState: 'DESISTIDO',
          withdrawnAt: scope.now.toISOString(),
        },
        this.eventContext(scope),
      ),
    );
    return {
      requestId: request.id,
      state: 'DESISTIDO',
      withdrawnAt: scope.now.toISOString(),
      version,
    };
  }

  // -------------------------------------------------------------------------
  // §2.3 GET requests
  // -------------------------------------------------------------------------

  async list(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    query: PortalQuery,
  ): Promise<{
    items: RequestListItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const scope = await this.scope(tx, identity);
    const page = parsePage(query);
    const state = first(query.state);
    if (
      state !== undefined &&
      !(REQUEST_STATES as readonly string[]).includes(state)
    ) {
      throw new PortalError('PORTAL.ENUM_INVALID', {
        status: 400,
        context: { field: 'state', allowed: [...REQUEST_STATES] },
      });
    }
    const kind = first(query.kind);
    const period = first(query.period);
    let periodFrom: string | undefined;
    let periodTo: string | undefined;
    if (period !== undefined) {
      const match = /^(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})$/.exec(period);
      if (!match) throw validationFailed(['period']);
      periodFrom = match[1];
      periodTo = match[2];
    }
    const values: unknown[] = [scope.subject.subjectId];
    const where: string[] = ['r.subject_id = $1'];
    if (state !== undefined) {
      values.push(state);
      where.push(`r.state = $${values.length}`);
    }
    if (kind !== undefined) {
      values.push(kind);
      where.push(`r.service_key = $${values.length}`);
    }
    if (periodFrom !== undefined && periodTo !== undefined) {
      values.push(scope.tenantTz, periodFrom, periodTo);
      where.push(
        `(r.created_at at time zone $${values.length - 2})::date >= $${values.length - 1}::date`,
        `(r.created_at at time zone $${values.length - 2})::date <= $${values.length}::date`,
      );
    }
    const whereSql = where.join(' and ');
    const total = await tx.query<{ total: string | number }>(
      `select count(*) as total from portal.request r where ${whereSql}`,
      values,
    );
    values.push(page.limit, page.offset);
    const rows = await tx.query<ListRow>(
      `select r.id, r.state, r.service_key, r.created_at, r.updated_at,
              p.number as protocol_number, v.ait_number as target_label
         from portal.request r
         left join portal.protocol p on p.request_id = r.id
         left join portal.infraction_view v on r.target_kind = 'ait' and v.ait_id = r.target_id
        where ${whereSql}
        order by r.updated_at desc nulls last, r.created_at desc
        limit $${values.length - 1} offset $${values.length}`,
      values,
    );
    return {
      items: rows.rows.map((row) => ({
        requestId: row.id,
        protocol: row.protocol_number ?? null,
        serviceKey: row.service_key,
        targetLabel: row.target_label ?? null,
        situation: row.state,
        nextAction: NEXT_ACTION_BY_STATE[row.state as RequestState],
        updatedAt: iso(row.updated_at ?? row.created_at),
      })),
      total: Number(total.rows[0]?.total ?? 0),
      page: page.page,
      pageSize: page.pageSize,
    };
  }

  // -------------------------------------------------------------------------
  // §2.3 GET requests/{id}
  // -------------------------------------------------------------------------

  async get(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
  ): Promise<RequestDetailResponse> {
    const scope = await this.scope(tx, identity);
    const request = await this.owned(tx, scope, requestId);
    const protocol = await this.protocolOf(tx, request.id);
    const draft = await this.latestDraft(tx, request.id);
    const timeline = (await tx.query<TimelineRow>(TIMELINE_SQL, [request.id]))
      .rows[0];
    const entries = asArray(timeline?.entries_json).filter(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        (entry as { visibility?: string }).visibility === 'citizen',
    );
    const canWithdraw = (
      REQUEST_ALLOWED_STATES_BY_COMMAND.withdraw as readonly string[]
    ).includes(request.state);
    return {
      request: {
        requestId: request.id,
        state: request.state,
        serviceKey: request.service_key,
        targetKind: request.target_kind,
        targetId: request.target_id ?? null,
        channel: request.channel,
        minimumAssurance: request.minimum_assurance,
        delegation: {
          status: request.delegation_status,
          domain: request.delegation_domain ?? null,
          command: request.delegation_command ?? null,
          externalId: request.delegation_external_id ?? null,
          error: request.delegation_error ?? null,
        },
        protocol: protocol ? protocolView(protocol) : null,
        draft: draft
          ? {
              version: Number(draft.version),
              payload: draft.payload_json,
              savedAt: iso(draft.saved_at),
            }
          : null,
        withdrawnAt: request.withdrawn_at ? iso(request.withdrawn_at) : null,
        createdAt: iso(request.created_at),
        updatedAt: request.updated_at ? iso(request.updated_at) : null,
        version: request.version,
      },
      timeline: entries,
      deadlines: asArray(timeline?.deadlines_json),
      documents: [],
      diligences: entries.filter(
        (entry) => (entry as { kind?: string }).kind === INQUIRY_TIMELINE_KIND,
      ),
      decision: timeline?.decision_json ?? null,
      actions: {
        canRespondDiligence: false,
        canWithdraw,
        withdrawalBlockedReason: canWithdraw ? null : 'estado_nao_admite',
        canAppeal: false,
        nextInstanceServiceKey: null,
      },
    };
  }

  // -------------------------------------------------------------------------
  // §2.3 GET requests/{id}/receipt · GET requests/{id}/decision
  // -------------------------------------------------------------------------

  async receipt(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
  ): Promise<never> {
    const scope = await this.scope(tx, identity);
    const request = await this.owned(tx, scope, requestId);
    const protocol = await this.protocolOf(tx, request.id);
    if (!protocol) throw notFound('protocol');
    throw serviceUnavailable(SIGNED_DOCUMENT_PENDING, null);
  }

  async decision(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
  ): Promise<unknown> {
    const scope = await this.scope(tx, identity);
    const request = await this.owned(tx, scope, requestId);
    const timeline = (await tx.query<TimelineRow>(TIMELINE_SQL, [request.id]))
      .rows[0];
    if (
      !timeline ||
      timeline.decision_json === null ||
      timeline.decision_json === undefined
    ) {
      throw notFound('decision');
    }
    return timeline.decision_json;
  }

  // -------------------------------------------------------------------------
  // §2.3 POST requests/{id}/diligences/{did}/responses
  // -------------------------------------------------------------------------

  async respondDiligence(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    inquiryId: string,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<PortalCommandOutcome<Record<string, unknown>>> {
    const scope = await this.scope(tx, identity);
    const begun = await this.idempotency.begin(tx, {
      scope: scope.subject.subjectId,
      header: headers['idempotency-key'],
      route: REQUEST_ROUTES.respond,
      body,
    });
    if (begun.replay) return this.replayOf(begun.replay);
    const input = parseBody(RESPOND_BODY, body);
    assertUuid(inquiryId, 'did');
    const request = await this.ownedForUpdate(tx, scope, requestId);
    assertTransition(request, { command: 'respond' });
    const target = this.delegation.targetFor(DILIGENCE_DELEGATION_KEY);
    const unavailableReason = target.availability();
    if (unavailableReason !== null) {
      const catalog = await this.catalogOf(tx, request.service_key);
      throw serviceUnavailable(
        unavailableReason,
        catalog?.alternative_channel_note ?? null,
      );
    }
    const protocol = await this.protocolOf(tx, request.id);
    if (!protocol) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { requestId: request.id },
      });
    }
    await target.delegate({
      tx,
      request,
      draft: { inquiryId, ...input },
      identity,
      subject: scope.subject,
      protocol: {
        number: protocol.number,
        issuedAt: new Date(protocol.issued_at),
        receiptHash: protocol.receipt_hash,
      },
      clock: this.clock,
      tenantTz: scope.tenantTz,
    });
    const response = {
      requestId: request.id,
      inquiryId,
      answeredAt: scope.now.toISOString(),
    };
    await begun.record(200, response);
    return { status: 200, body: response, replayed: false };
  }

  // -------------------------------------------------------------------------
  // §2.3 POST requests/{id}/evaluation
  // -------------------------------------------------------------------------

  async evaluate(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    requestId: string,
    body: unknown,
    headers: PortalHeaders,
  ): Promise<PortalCommandOutcome<RequestEvaluateResponse>> {
    const scope = await this.scope(tx, identity);
    const begun = await this.idempotency.begin(tx, {
      scope: scope.subject.subjectId,
      header: headers['idempotency-key'],
      route: REQUEST_ROUTES.evaluate,
      body,
    });
    if (begun.replay) return this.replayOf(begun.replay);
    const input = parseBody(EVALUATE_BODY, body);
    const request = await this.ownedForUpdate(tx, scope, requestId);
    assertTransition(request, { command: 'evaluate' });
    const existing = await tx.query<{ id: string }>(EVALUATION_EXISTS_SQL, [
      request.id,
    ]);
    if (existing.rows[0]) {
      throw new PortalError('PORTAL.EVALUATION_ALREADY_SUBMITTED', {
        status: 409,
        context: {},
      });
    }
    const inserted = await tx.query<{ id: string }>(INSERT_EVALUATION_SQL, [
      request.id,
      JSON.stringify(input.scores),
      input.comment ?? null,
      scope.now,
    ]);
    const evaluationId = inserted.rows[0]?.id;
    if (!evaluationId) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    const version = await this.bump(
      tx,
      request.id,
      { state: 'CONCLUIDO' },
      scope.now,
    );
    const context = this.eventContext(scope);
    await this.outbox.append(
      tx as never,
      portalRequestEvents.avaliacaoRegistrada(
        evaluationId,
        {
          evaluationId,
          subjectKind: 'request',
          subjectId: request.id,
          submittedAt: scope.now.toISOString(),
          citizenSubjectId: scope.subject.subjectId,
          subjectCpfHash: scope.cpfHash,
        },
        context,
      ),
    );
    await this.outbox.append(
      tx as never,
      portalRequestEvents.concluida(
        request.id,
        version,
        {
          requestId: request.id,
          serviceKey: request.service_key,
          subjectId: scope.subject.subjectId,
          subjectCpfHash: scope.cpfHash,
          fromState: 'AVALIACAO_OFERECIDA',
          toState: 'CONCLUIDO',
          evaluationId,
        },
        context,
      ),
    );
    const response: RequestEvaluateResponse = {
      evaluationId,
      requestId: request.id,
      state: 'CONCLUIDO',
      submittedAt: scope.now.toISOString(),
    };
    await begun.record(201, response);
    return { status: 201, body: response, replayed: false };
  }

  // -------------------------------------------------------------------------
  // apoio
  // -------------------------------------------------------------------------

  /** §0: sujeito (upsert idempotente), fuso e slug do tenant, relógio. */
  private async scope(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
  ): Promise<CommandScope> {
    const subject = await this.identity.upsertSubject(tx, identity, null);
    const tenant = (await tx.query<TenantRow>(TENANT_SQL)).rows[0];
    if (!tenant) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    const tenantTz = tenant.timezone ?? PORTAL_DEFAULT_TIME_ZONE;
    return {
      subject,
      cpfHash: cpfHashOf(identity.cpf),
      tenantSlug: tenant.slug,
      tenantTz,
      now: this.clock.now(),
      today: this.clock.today(tenantTz),
    };
  }

  private eventContext(scope: CommandScope): PortalEventContext {
    const snapshot = this.requestContext?.hasActiveContext()
      ? this.requestContext.snapshot()
      : undefined;
    return {
      occurredAt: scope.now.toISOString(),
      actorId: snapshot?.actorId ?? scope.subject.subjectId,
      correlationId: snapshot?.requestId ?? '',
    };
  }

  private replayOf<T>(replay: {
    status: number;
    body: unknown;
  }): PortalCommandOutcome<T> {
    return { status: replay.status, body: replay.body as T, replayed: true };
  }

  private async catalogOf(
    tx: PortalSqlTransaction,
    serviceKey: string,
  ): Promise<CatalogRow | undefined> {
    return (await tx.query<CatalogRow>(CATALOG_SQL, [serviceKey])).rows[0];
  }

  private async owned(
    tx: PortalSqlTransaction,
    scope: CommandScope,
    requestId: string,
  ): Promise<RequestRow> {
    assertUuid(requestId, 'id');
    const row = (await tx.query<RequestRow>(REQUEST_SQL, [requestId])).rows[0];
    if (!row || row.subject_id !== scope.subject.subjectId) {
      throw notFound('request');
    }
    return row;
  }

  private async ownedForUpdate(
    tx: PortalSqlTransaction,
    scope: CommandScope,
    requestId: string,
  ): Promise<RequestRow> {
    assertUuid(requestId, 'id');
    const row = (
      await tx.query<RequestRow>(REQUEST_FOR_UPDATE_SQL, [requestId])
    ).rows[0];
    if (!row || row.subject_id !== scope.subject.subjectId) {
      throw notFound('request');
    }
    return row;
  }

  private async latestDraft(
    tx: PortalSqlTransaction,
    requestId: string,
  ): Promise<DraftRow | undefined> {
    return (await tx.query<DraftRow>(LATEST_DRAFT_SQL, [requestId])).rows[0];
  }

  private async protocolOf(
    tx: PortalSqlTransaction,
    requestId: string,
  ): Promise<ProtocolRow | undefined> {
    return (await tx.query<ProtocolRow>(PROTOCOL_SQL, [requestId])).rows[0];
  }

  /** `update portal.request set …, version = version + 1, updated_at`; devolve a versão nova. */
  private async bump(
    tx: PortalSqlTransaction,
    requestId: string,
    changes: Partial<Record<string, unknown>>,
    now: Date,
  ): Promise<number> {
    const assignments: string[] = [];
    const values: unknown[] = [requestId];
    for (const [column, value] of Object.entries(changes)) {
      values.push(value ?? null);
      assignments.push(`${column} = $${values.length}`);
    }
    values.push(now);
    assignments.push(`updated_at = $${values.length}`);
    assignments.push('version = version + 1');
    const updated = await tx.query<{ version: number }>(
      `update portal.request set ${assignments.join(', ')} where id = $1 returning version`,
      values,
    );
    const version = updated.rows[0]?.version;
    if (version === undefined) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { requestId },
      });
    }
    return Number(version);
  }

  /** `actKey` = service_key (+ `:<escopo>` de lgpd_declaracao — A2(a)). */
  private actKeyOf(serviceKey: string, draft: Record<string, unknown>): string {
    if (serviceKey === 'lgpd_declaracao') {
      const scope = draft.scope;
      if (typeof scope === 'string' && scope !== 'confirmacao') {
        return `${serviceKey}:${scope}`;
      }
    }
    return serviceKey;
  }

  /**
   * §3.1 passo 5: `ASSURANCE_INSUFFICIENT` persiste AGUARDANDO_NIVEL_ASSINATURA
   * (version += 1; em re-submissão só quando `required` mudou) e o erro é
   * marcado "commit e lança" — sem registro de idempotência.
   */
  private async assertActLevelOrPersist(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    request: RequestRow,
    actKey: string,
    scope: CommandScope,
  ): Promise<{ required: string }> {
    try {
      const decision = await this.identity.assertActLevel(
        tx,
        identity,
        actKey,
        `/v1/portal/requests/${request.id}`,
      );
      return { required: decision.required };
    } catch (error) {
      if (!isPortalCode(error, 'PORTAL.ASSURANCE_INSUFFICIENT')) throw error;
      const required = String(error.context.required);
      const alreadyWaiting =
        request.state === 'AGUARDANDO_NIVEL_ASSINATURA' &&
        request.minimum_assurance === required;
      if (!alreadyWaiting) {
        await this.bump(
          tx,
          request.id,
          { state: 'AGUARDANDO_NIVEL_ASSINATURA', minimum_assurance: required },
          scope.now,
        );
      }
      throw commitThenThrow(error);
    }
  }

  /**
   * §2.3 passo 7 / §5: vínculo do sujeito com o alvo; 422
   * `ENTITLEMENT_REQUIRED { targetKind, howToProve: 'procuracao' }` SÓ para
   * indicacao_condutor/defesa_previa quando o AIT existe na projeção.
   */
  private async assertEntitledForCreate(
    tx: PortalSqlTransaction,
    scope: CommandScope,
    serviceKey: string,
    targetKind: DelegationTargetKind,
    targetId: string,
  ): Promise<void> {
    try {
      await this.identity.assertEntitled(
        tx,
        scope.subject.subjectId,
        targetKind,
        targetId,
      );
    } catch (error) {
      if (!isPortalCode(error, 'PORTAL.NOT_FOUND')) throw error;
      if (
        targetKind === 'ait' &&
        (serviceKey === 'indicacao_condutor' || serviceKey === 'defesa_previa')
      ) {
        const known = await tx.query(INFRACTION_VIEW_EXISTS_SQL, [targetId]);
        if (known.rows.length > 0) {
          throw new PortalError('PORTAL.ENTITLEMENT_REQUIRED', {
            status: 422,
            context: { targetKind, howToProve: 'procuracao' },
          });
        }
      }
      throw error;
    }
  }
}
