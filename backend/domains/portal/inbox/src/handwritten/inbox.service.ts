// Caixa do cidadão (work/rounds/R-0009/contracts/CTG-0002.md §2.4, §6.1, §6.3
// e §11; plan R-0009 M15, M21, adendas A1(e), A2(b)). `list` (filtros
// `kind`/`read`, paginação de `@detran/portal-identity`), `read` (ciência
// idempotente: `read_on`, evidência de exibição e `INBOX_LIDO`/
// `NOTIFICACAO_CIENCIA` na outbox, uma única vez) e `subscribePush` (upsert
// por endpoint). `fictitiousAcknowledgementOn` lê a duração de
// `T-SNE-CIENCIA` do catálogo de timers (`@detran/inf-deadlines`, mesmo
// caminho de `inf/notification/src/handwritten/acknowledgement-mark.ts`) —
// o literal 30 é proibido (§6.3).
//
// SQL parametrizado e dentro do subconjunto documentado em
// `portal/requests/tests/support/fake-sql.ts`; tenant nunca no payload
// (RLS + trigger `auth.enforce_tenant_id`); relógio injetado (`PortalClock`).
import { Inject, Injectable, Optional } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { z } from 'zod';
import { StaticTimerCatalog, addCalendarDays } from '@detran/inf-deadlines';
import {
  SqlTeatEventOutbox,
  TEAT_EVENT_OUTBOX,
  type TeatEventOutbox,
} from '@detran/shared';
import {
  PortalClock,
  PortalError,
  parsePage,
  parsePortalBody,
  type PortalClockLike,
  type PortalPagedResponse,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';
import { canonicalJson, sha256Hex } from '@detran/portal-requests';

import { portalInboxEvents, type PortalInboxEventContext } from './events.js';

// ---------------------------------------------------------------------------
// §6.3 — ciência ficta pelo catálogo de timers (T-SNE-CIENCIA, owner='infracao')
// ---------------------------------------------------------------------------

const TIMER_CATALOG = new StaticTimerCatalog();

/** Código do timer lido, nunca duplicado (plan M14). */
export const SNE_ACKNOWLEDGEMENT_TIMER = 'T-SNE-CIENCIA';

/**
 * `available_on` + duração de `T-SNE-CIENCIA` (dias corridos) — função pura
 * usada por quem cria itens `source='sne'` (nesta rodada só fixtures e
 * testes — OD-P40) e pela projeção do ciclo (§6.1).
 */
export function fictitiousAcknowledgementOn(availableOn: string): string {
  const definition = TIMER_CATALOG.get(SNE_ACKNOWLEDGEMENT_TIMER);
  if (
    definition.durationValue === null ||
    definition.durationValue === undefined
  ) {
    throw new PortalError('PORTAL.INTERNAL', {
      status: 500,
      context: { timerCode: SNE_ACKNOWLEDGEMENT_TIMER },
    });
  }
  return addCalendarDays(availableOn, definition.durationValue);
}

// ---------------------------------------------------------------------------
// tipos públicos (§2.4)
// ---------------------------------------------------------------------------

export type PortalInboxQuery = Record<string, string | string[] | undefined>;

export const INBOX_KINDS = ['acao_necessaria', 'informativo'] as const;
export type InboxKind = (typeof INBOX_KINDS)[number];

export interface InboxItemResponse {
  id: string;
  /** Derivado de `action_required` (A1(e)). */
  kind: InboxKind;
  /** Token do Portal (`SNE|PROCESSO|OUVIDORIA|SISTEMA`, ADR-0019 §3). */
  category: string;
  source: 'sne' | 'portal';
  subject: string;
  summary: string;
  aitId: string | null;
  requestId: string | null;
  availableOn: string;
  readOn: string | null;
  fictitiousAcknowledgementOn: string | null;
  deadline: { dueOn: string; ownedBy: 'citizen' | 'agency' | null } | null;
}

export interface InboxReadResponse {
  id: string;
  readOn: string;
  acknowledgementEvidence: {
    acknowledgedAt: string;
    displayedSha256: string;
  } | null;
}

export interface PushSubscriptionResponse {
  id: string;
  endpoint: string;
  createdAt: string;
}

/** Forma `PushSubscriptionJSON` do Push API (W3C), ADR-0019 §3 (§2.4). */
export const PUSH_SUBSCRIPTION_BODY = z.strictObject({
  endpoint: z.url(),
  keys: z.strictObject({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const ITEM_COLUMNS = `id, subject_id, kind, action_required, source, source_event_id,
          subject_line, summary, ait_id, request_id,
          to_char(available_on, 'YYYY-MM-DD') as available_on,
          to_char(read_on, 'YYYY-MM-DD') as read_on,
          to_char(fictitious_acknowledgement_on, 'YYYY-MM-DD') as fictitious_acknowledgement_on,
          to_char(deadline_due_on, 'YYYY-MM-DD') as deadline_due_on,
          deadline_owned_by`;

const ITEM_FOR_UPDATE_SQL = `select ${ITEM_COLUMNS}
     from portal.inbox_item
    where id = $1
    for update`;

const MARK_READ_SQL = `update portal.inbox_item
      set read_on = $2::date, updated_at = $3
    where id = $1`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 63). */
const INSERT_EVIDENCE_SQL = `insert into portal.acknowledgement_evidence
      (inbox_item_id, displayed_sha256, acknowledged_at, signature_ref)
    values ($1, $2, $3, null)
    on conflict (tenant_id, inbox_item_id) do nothing`;

const EVIDENCE_SQL = `select displayed_sha256, acknowledged_at
     from portal.acknowledgement_evidence
    where inbox_item_id = $1
    limit 1`;

const SUBJECT_HASH_SQL = `select cpf_hash from portal.subject where id = $1 limit 1`;

const UPSERT_PUSH_SQL = `insert into portal.push_subscription
      (subject_id, endpoint, keys_json, created_at)
    values ($1, $2, $3::jsonb, $4)
    on conflict (tenant_id, endpoint) do update set
      subject_id = excluded.subject_id,
      keys_json = excluded.keys_json,
      updated_at = excluded.created_at
    returning id, endpoint, created_at`;

interface ItemRow extends Record<string, unknown> {
  id: string;
  subject_id: string;
  kind: string;
  action_required: boolean;
  source: 'sne' | 'portal';
  source_event_id: string;
  subject_line: string;
  summary: string;
  ait_id: string | null;
  request_id: string | null;
  available_on: string;
  read_on: string | null;
  fictitious_acknowledgement_on: string | null;
  deadline_due_on: string | null;
  deadline_owned_by: 'citizen' | 'agency' | null;
}

interface EvidenceRow extends Record<string, unknown> {
  displayed_sha256: string;
  acknowledged_at: Date | string;
}

interface PushRow extends Record<string, unknown> {
  id: string;
  endpoint: string;
  created_at: Date | string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function enumInvalid(field: string, allowed: readonly string[]): PortalError {
  return new PortalError('PORTAL.ENUM_INVALID', {
    status: 400,
    context: { field, allowed: [...allowed] },
  });
}

function notFound(kind: string): PortalError {
  return new PortalError('PORTAL.NOT_FOUND', {
    status: 404,
    context: { kind },
  });
}

function itemOf(row: ItemRow): InboxItemResponse {
  return {
    id: row.id,
    kind: row.action_required ? 'acao_necessaria' : 'informativo',
    category: row.kind,
    source: row.source,
    subject: row.subject_line,
    summary: row.summary,
    aitId: row.ait_id,
    requestId: row.request_id,
    availableOn: row.available_on,
    readOn: row.read_on,
    fictitiousAcknowledgementOn:
      row.source === 'sne' ? row.fictitious_acknowledgement_on : null,
    deadline: row.deadline_due_on
      ? { dueOn: row.deadline_due_on, ownedBy: row.deadline_owned_by }
      : null,
  };
}

// ---------------------------------------------------------------------------
// serviço
// ---------------------------------------------------------------------------

@Injectable()
export class PortalInboxService {
  private readonly clock: PortalClockLike;
  private readonly outbox: TeatEventOutbox;

  constructor(
    @Optional() clock?: PortalClock,
    @Optional() private readonly requestContext?: RequestContext,
    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
  ) {
    this.clock = clock ?? new PortalClock();
    this.outbox = outbox ?? new SqlTeatEventOutbox();
  }

  /** §2.4 `GET inbox?kind&read&page&pageSize`. */
  async list(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
    query: PortalInboxQuery,
  ): Promise<PortalPagedResponse<InboxItemResponse>> {
    const kind = first(query.kind);
    if (
      kind !== undefined &&
      !(INBOX_KINDS as readonly string[]).includes(kind)
    ) {
      throw enumInvalid('kind', INBOX_KINDS);
    }
    const read = first(query.read);
    if (read !== undefined && read !== 'true' && read !== 'false') {
      throw enumInvalid('read', ['true', 'false']);
    }
    const page = parsePage(query);
    const conditions = ['subject_id = $1'];
    const values: unknown[] = [subject.subjectId];
    if (kind !== undefined) {
      values.push(kind === 'acao_necessaria');
      conditions.push(`action_required = $${values.length}`);
    }
    if (read !== undefined) {
      conditions.push(
        read === 'true' ? 'read_on is not null' : 'read_on is null',
      );
    }
    const where = conditions.join(' and ');
    const total = await tx.query<{ total: string | number }>(
      `select count(*) as total from portal.inbox_item where ${where}`,
      values,
    );
    values.push(page.limit, page.offset);
    const rows = await tx.query<ItemRow>(
      `select ${ITEM_COLUMNS}
         from portal.inbox_item
        where ${where}
        order by available_on desc, created_at desc
        limit $${values.length - 1} offset $${values.length}`,
      values,
    );
    return {
      items: rows.rows.map(itemOf),
      total: Number(total.rows[0]?.total ?? 0),
      page: page.page,
      pageSize: page.pageSize,
    };
  }

  /** §6.1 — leitura idempotente com evidência de ciência (item `sne`). */
  async read(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
    inboxItemId: string,
  ): Promise<InboxReadResponse> {
    if (!UUID_RE.test(inboxItemId)) throw notFound('inbox_item');
    const item = (await tx.query<ItemRow>(ITEM_FOR_UPDATE_SQL, [inboxItemId]))
      .rows[0];
    if (!item || item.subject_id !== subject.subjectId) {
      throw notFound('inbox_item');
    }
    if (item.read_on !== null) {
      // 3. já lida: nenhuma escrita
      const evidence = (await tx.query<EvidenceRow>(EVIDENCE_SQL, [item.id]))
        .rows[0];
      return {
        id: item.id,
        readOn: item.read_on,
        acknowledgementEvidence: evidence
          ? {
              acknowledgedAt: iso(evidence.acknowledged_at),
              displayedSha256: evidence.displayed_sha256,
            }
          : null,
      };
    }
    // 2. primeira leitura
    const now = this.clock.now();
    const readOn = this.clock.today(await tenantTimeZoneOf(tx));
    const cpfHash = await this.cpfHashOf(tx, subject.subjectId);
    await tx.query(MARK_READ_SQL, [item.id, readOn, now]);
    const context = this.eventContext(now, subject.subjectId);
    await this.outbox.append(
      tx as never,
      portalInboxEvents.inboxLido(
        item.id,
        {
          inboxItemId: item.id,
          subjectId: subject.subjectId,
          subjectCpfHash: cpfHash,
          source: item.source,
          sourceEventId: item.source_event_id,
          aitId: item.ait_id,
          requestId: item.request_id,
          readOn,
        },
        context,
      ),
    );
    let acknowledgementEvidence: InboxReadResponse['acknowledgementEvidence'] =
      null;
    if (item.source === 'sne') {
      const displayed = canonicalJson({
        availableOn: item.available_on,
        fictitiousAcknowledgementOn: item.fictitious_acknowledgement_on,
        id: item.id,
        subjectLine: item.subject_line,
        summary: item.summary,
      });
      const displayedSha256 = sha256Hex(displayed);
      await tx.query(INSERT_EVIDENCE_SQL, [item.id, displayedSha256, now]);
      await this.outbox.append(
        tx as never,
        portalInboxEvents.notificacaoCiencia(
          item.id,
          {
            inboxItemId: item.id,
            sourceEventId: item.source_event_id,
            aitId: item.ait_id,
            subjectCpfHash: cpfHash,
            acknowledgedAt: now.toISOString(),
            readOn,
            evidenceSha256: displayedSha256,
            fictitious: false,
          },
          context,
        ),
      );
      acknowledgementEvidence = {
        acknowledgedAt: now.toISOString(),
        displayedSha256,
      };
    }
    return { id: item.id, readOn, acknowledgementEvidence };
  }

  /** §2.4 `POST push-subscriptions` — upsert por `(tenant, endpoint)`. */
  async subscribePush(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
    body: unknown,
  ): Promise<PushSubscriptionResponse> {
    const input = parsePortalBody(PUSH_SUBSCRIPTION_BODY, body);
    const row = (
      await tx.query<PushRow>(UPSERT_PUSH_SQL, [
        subject.subjectId,
        input.endpoint,
        JSON.stringify(input.keys),
        this.clock.now(),
      ])
    ).rows[0];
    if (!row) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    return {
      id: row.id,
      endpoint: row.endpoint,
      createdAt: iso(row.created_at),
    };
  }

  // -------------------------------------------------------------------------
  // apoio
  // -------------------------------------------------------------------------

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

const TENANT_SQL = `select timezone from auth.tenants where id = auth.current_tenant()`;

/** Fuso civil do tenant da transação (CTG-0002 §0, A3(e)); ausente → padrão do pacote. */
export async function tenantTimeZoneOf(
  tx: PortalSqlTransaction,
): Promise<string | undefined> {
  const row = (await tx.query<{ timezone: string | null }>(TENANT_SQL)).rows[0];
  return row?.timezone ?? undefined;
}
