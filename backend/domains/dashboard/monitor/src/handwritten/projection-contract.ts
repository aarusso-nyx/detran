// Contrato comum dos oito projetores de `@detran/dashboard-monitor`
// (work/rounds/R-0011/contracts/CTG-0001.md §4.3; plan R-0011 M4/M5;
// ADR-0020 Decisões 1, 3 e 4): envelope consumido como `integration.outbox
// .payload` o guarda (rait-events-sse-contract.md §1 — `version` no RAIT/TEAT/
// PORTAL, `schemaVersion` no BOAT, OD-D25), contexto (transação do chamador,
// tenant da sessão RLS, relógio injetado), resultado de uma aplicação, erro
// tipado (`DASH.INTERNAL:<reason>:<eventId>`, precedente PORTAL.INTERNAL de
// R-0009) e o helper do ledger único `dashboard.monitor_projection_applied_
// event` (chave `(tenant_id, projection_name, event_id)`). Sem `zod` (M1 não
// lista a dependência): validação de `data` por helpers tipados na forma de
// `requireText`/`requirePositiveInteger` de `dashboard-crashes.projection.ts`,
// só nos campos que §4.1 usa — o resto é ignorado, nunca gravado.

export const MONITOR_LEDGER_TABLE =
  'dashboard.monitor_projection_applied_event';

export const DASHBOARD_MONITOR_PROJECTIONS = [
  'dashboard.prescription_risk',
  'dashboard.production',
  'dashboard.integration_health',
  'dashboard.pec_deadlines',
  'dashboard.teat_measures',
  'dashboard.portal_service_metrics',
  'dashboard.duty_evidence',
  'dashboard.source_freshness',
] as const;
export type DashboardMonitorProjectionName =
  (typeof DASHBOARD_MONITOR_PROJECTIONS)[number];

/** Envelope como integration.outbox.payload o guarda (rait-events-sse-contract §1);
 *  version (RAIT/TEAT/PORTAL) ou schemaVersion (BOAT) — um dos dois obrigatório. */
export interface DashboardConsumedEvent {
  id: string;
  type: string;
  domainEvent?: string;
  version?: number;
  schemaVersion?: number;
  occurredAt: string;
  tenantId: string;
  actor?: { kind: 'user' | 'system' | 'timer'; id?: string; role?: string };
  correlationId?: string;
  causationId?: string;
  aggregate: { kind: string; id: string; version: number };
  data: Record<string, unknown>;
}

export interface DashboardSqlTransaction {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    statement: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount?: number | null }>;
}

export interface DashboardProjectionContext {
  /** Transação aberta pelo chamador (Database.tx); ledger e efeito na mesma transação. */
  tx: DashboardSqlTransaction;
  /** Tenant da sessão RLS; deve ser igual a event.tenantId (senão erro tenant_mismatch). */
  tenantId: string;
  /** Relógio injetado; nunca Date.now(). */
  now: Date;
}

export type DashboardProjectionResult =
  | {
      kind: 'applied';
      projection: DashboardMonitorProjectionName;
      cells: number;
    }
  | { kind: 'duplicate'; projection: DashboardMonitorProjectionName }
  | {
      kind: 'ignored';
      projection: DashboardMonitorProjectionName;
      reason: 'stale_version' | 'not_relevant';
    };

export type DashboardProjectionErrorReason =
  'event_not_consumed' | 'data_invalid' | 'tenant_mismatch' | 'version_missing';

/** Código genérico `DASH.INTERNAL` de `dashboard-error-catalog.md` (nenhum
 *  código novo — M13/regra 3); `context` só com ids e tokens. */
export class DashboardProjectionError extends Error {
  readonly code = 'DASH.INTERNAL' as const;
  readonly reason: DashboardProjectionErrorReason;
  readonly eventId: string;
  readonly projection: DashboardMonitorProjectionName;
  readonly detail: string | undefined;

  constructor(
    projection: DashboardMonitorProjectionName,
    reason: DashboardProjectionErrorReason,
    eventId: string,
    detail?: string,
  ) {
    super(`DASH.INTERNAL:${reason}:${eventId}`);
    this.name = 'DashboardProjectionError';
    this.projection = projection;
    this.reason = reason;
    this.eventId = eventId;
    this.detail = detail;
  }
}

export interface DashboardProjector {
  readonly projection: DashboardMonitorProjectionName;
  /** = consumedEvents do arquivo, como dados (ADR-0020 Decisão 4). */
  readonly consumedEvents: readonly string[];
  /** Ordem: (1) type/domainEvent ∈ consumedEvents senão throw event_not_consumed;
   *  (2) tenantId = ctx.tenantId senão throw tenant_mismatch; (3) version|schemaVersion ≥ 1
   *  senão throw version_missing; (4) data válida para o evento senão throw data_invalid;
   *  (5) claimEvent → false ⇒ duplicate; (6) célula com aggregate_version maior ⇒ ignored
   *  stale_version; evento consumido sem célula a tocar ⇒ ignored not_relevant; (7) efeito ⇒ applied. */
  apply(
    event: DashboardConsumedEvent,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult>;
}

export function isConsumed(
  consumedEvents: readonly string[],
  event: Pick<DashboardConsumedEvent, 'type' | 'domainEvent'>,
): boolean {
  return consumedEventKey(consumedEvents, event) !== undefined;
}

/** O nome de `consumedEvents` que casou: `type` primeiro, senão `domainEvent`
 *  (precedente BOAT de R-0010: `SINISTRO_*` são `domainEvent`). É o valor
 *  gravado em `event_type` do ledger (CTG-0001 §2.13). */
export function consumedEventKey(
  consumedEvents: readonly string[],
  event: Pick<DashboardConsumedEvent, 'type' | 'domainEvent'>,
): string | undefined {
  if (typeof event.type === 'string' && consumedEvents.includes(event.type)) {
    return event.type;
  }
  if (
    typeof event.domainEvent === 'string' &&
    consumedEvents.includes(event.domainEvent)
  ) {
    return event.domainEvent;
  }
  return undefined;
}

/** version ?? schemaVersion; lança version_missing. */
export function eventSchemaVersion(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
): number {
  const version = event.version ?? event.schemaVersion;
  if (!Number.isInteger(version) || (version as number) < 1) {
    throw new DashboardProjectionError(
      projection,
      'version_missing',
      event.id,
      'version|schemaVersion',
    );
  }
  return version as number;
}

/** `aggregate.version` (ETag pós-transição, rait-events-sse-contract §1). */
export function aggregateVersion(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
): number {
  const version = event.aggregate?.version;
  if (!Number.isInteger(version) || (version as number) < 0) {
    throw new DashboardProjectionError(
      projection,
      'data_invalid',
      event.id,
      'aggregate.version',
    );
  }
  return version as number;
}

/** INSERT no ledger com ON CONFLICT (tenant_id, projection_name, event_id) DO NOTHING;
 *  true = primeira vez (segue o efeito), false = duplicate. Grava event_type, versões e occurred_at. */
export async function claimEvent(
  ctx: DashboardProjectionContext,
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
  eventType: string = event.type,
): Promise<boolean> {
  const result = await ctx.tx.query<{ event_id: string }>(
    `insert into dashboard.monitor_projection_applied_event
       (tenant_id, projection_name, event_id, event_type, event_schema_version, aggregate_version, occurred_at, applied_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (tenant_id, projection_name, event_id) do nothing
     returning event_id`,
    [
      ctx.tenantId,
      projection,
      event.id,
      eventType,
      eventSchemaVersion(projection, event),
      aggregateVersion(projection, event),
      event.occurredAt,
      ctx.now.toISOString(),
    ],
  );
  return result.rows.length > 0;
}

interface LedgerRow extends Record<string, unknown> {
  event_type: string;
  aggregate_version: number;
}

/** `stale_version` (CTG-0001 §4): o evento traz `aggregate.version` menor que o
 *  do evento que escreveu a célula por último (`last_event_id` → ledger), e da
 *  mesma origem (`event_type` igual — versões de agregados distintos, ex. caso
 *  × infração numa mesma célula, não se comparam). A leitura vai ao ledger, e
 *  não à coluna da célula, porque `dashboard.source` não tem `aggregate_version`. */
export async function isStaleAgainst(
  ctx: DashboardProjectionContext,
  projection: DashboardMonitorProjectionName,
  lastEventId: unknown,
  eventType: string,
  event: DashboardConsumedEvent,
): Promise<boolean> {
  if (typeof lastEventId !== 'string' || lastEventId.length === 0) return false;
  const previous = await ctx.tx.query<LedgerRow>(
    `select event_type, aggregate_version
       from dashboard.monitor_projection_applied_event
      where tenant_id = $1 and projection_name = $2 and event_id = $3`,
    [ctx.tenantId, projection, lastEventId],
  );
  const row = previous.rows[0];
  if (!row || row.event_type !== eventType) return false;
  return Number(row.aggregate_version) > aggregateVersion(projection, event);
}

// ---------------------------------------------------------------------------
// Validação de `data` sem zod (forma de dashboard-crashes.projection.ts).

export function requireText(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
  field: string,
): string {
  const value = event.data?.[field];
  if (typeof value !== 'string' || value.length === 0) {
    throw new DashboardProjectionError(
      projection,
      'data_invalid',
      event.id,
      `data.${field}`,
    );
  }
  return value;
}

export function optionalText(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
  field: string,
): string | null {
  const value = event.data?.[field];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new DashboardProjectionError(
      projection,
      'data_invalid',
      event.id,
      `data.${field}`,
    );
  }
  return value;
}

export function optionalInteger(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
  field: string,
): number | null {
  const value = event.data?.[field];
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value)) {
    throw new DashboardProjectionError(
      projection,
      'data_invalid',
      event.id,
      `data.${field}`,
    );
  }
  return value as number;
}

export function optionalBoolean(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
  field: string,
): boolean | null {
  const value = event.data?.[field];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'boolean') {
    throw new DashboardProjectionError(
      projection,
      'data_invalid',
      event.id,
      `data.${field}`,
    );
  }
  return value;
}

export function requireTextArray(
  projection: DashboardMonitorProjectionName,
  event: DashboardConsumedEvent,
  field: string,
): string[] {
  const value = event.data?.[field];
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string' && item.length > 0)
  ) {
    throw new DashboardProjectionError(
      projection,
      'data_invalid',
      event.id,
      `data.${field}`,
    );
  }
  return value as string[];
}

/** `YYYY-MM-DD` do instante ISO do envelope (o dia civil é o do próprio
 *  carimbo, sem conversão de fuso — a agregação N0 é por dia/mês do evento). */
export function dateOf(iso: string): string {
  return iso.slice(0, 10);
}

/** 1º dia do mês do instante ISO (`period_start` das agregações N0). */
export function monthStartOf(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** Só valores primitivos (ids, tokens, datas, números, booleanos) dos campos
 *  listados — nunca o resto de `data` (RN-DASH-170). */
export function pickPrimitives(
  data: Record<string, unknown>,
  fields: readonly string[],
): Record<string, string | number | boolean | null> {
  const picked: Record<string, string | number | boolean | null> = {};
  for (const field of fields) {
    const value = data[field];
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      picked[field] = value;
    }
  }
  return picked;
}

export interface DashboardEventVersions {
  schemaVersion: number;
  aggregateVersion: number;
}

/** Passos (1)–(5) do contrato, comuns aos oito projetores; o efeito (6)–(7)
 *  fica em `project`. `validate` roda antes do ledger: `data_invalid` não
 *  grava nada. */
export abstract class DashboardProjectorBase<
  TParsed,
> implements DashboardProjector {
  abstract readonly projection: DashboardMonitorProjectionName;
  abstract readonly consumedEvents: readonly string[];

  /** (4) — lança `data_invalid`; devolve o que `project` precisa. */
  protected abstract validate(
    event: DashboardConsumedEvent,
    eventKey: string,
  ): TParsed;

  /** (6)–(7) — efeito na tabela de projeção, na mesma transação do ledger. */
  protected abstract project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: TParsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult>;

  async apply(
    event: DashboardConsumedEvent,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    const eventKey = consumedEventKey(this.consumedEvents, event);
    if (eventKey === undefined) {
      throw new DashboardProjectionError(
        this.projection,
        'event_not_consumed',
        event.id,
        event.domainEvent ? `${event.type}/${event.domainEvent}` : event.type,
      );
    }
    if (event.tenantId !== ctx.tenantId) {
      throw new DashboardProjectionError(
        this.projection,
        'tenant_mismatch',
        event.id,
      );
    }
    const versions: DashboardEventVersions = {
      schemaVersion: eventSchemaVersion(this.projection, event),
      aggregateVersion: aggregateVersion(this.projection, event),
    };
    if (typeof event.occurredAt !== 'string' || event.occurredAt.length < 10) {
      throw new DashboardProjectionError(
        this.projection,
        'data_invalid',
        event.id,
        'occurredAt',
      );
    }
    const parsed = this.validate(event, eventKey);
    const claimed = await claimEvent(ctx, this.projection, event, eventKey);
    if (!claimed) return { kind: 'duplicate', projection: this.projection };
    return this.project(event, eventKey, parsed, versions, ctx);
  }

  protected stale(
    ctx: DashboardProjectionContext,
    lastEventId: unknown,
    eventKey: string,
    event: DashboardConsumedEvent,
  ): Promise<boolean> {
    return isStaleAgainst(ctx, this.projection, lastEventId, eventKey, event);
  }

  protected applied(cells: number): DashboardProjectionResult {
    return { kind: 'applied', projection: this.projection, cells };
  }

  protected ignored(
    reason: 'stale_version' | 'not_relevant',
  ): DashboardProjectionResult {
    return { kind: 'ignored', projection: this.projection, reason };
  }

  protected invalid(
    event: DashboardConsumedEvent,
    detail: string,
  ): DashboardProjectionError {
    return new DashboardProjectionError(
      this.projection,
      'data_invalid',
      event.id,
      detail,
    );
  }
}
