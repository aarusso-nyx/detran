// `PortalProjectors` — os cinco projetores e o replay (work/rounds/R-0009/
// contracts/CTG-0002.md §7.1, §7.2, §7.6; plan R-0009 M16, adendas A2(c),
// A5(a); ADR-0020). Despacho por `domainEvent` (`PROJECTOR_BY_DOMAIN_EVENT`),
// por `type` quando não há `domainEvent` (`rait.inquiry.changed`) e por
// `aggregate.kind` nos esqueletos (`crash`, `exam`); eventos fora do mapa →
// `not_consumed` (nada gravado). Idempotência por `event.id` em
// `portal.projection_applied_event` (única por `(tenant, event_id, projection)`
// — A2(c)); falha de aplicação fica registrada em `last_error`
// (`PORTAL.INTERNAL:<motivo>:<id>`) sem tocar a projeção; `rebuild` desfaz o
// que a janela produziu (A5(a): linhas nunca projetadas são preservadas),
// apaga as linhas de `applied_event` da projeção e reaplica a janela da
// outbox (`topic like 'inf.%' or 'rait.%'`, ordem `created_at, id`) numa
// transação de tenant. Tudo na transação do chamador.
import { Inject, Injectable, Optional } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import {
  PORTAL_DEFAULT_TIME_ZONE,
  PortalClock,
  PortalError,
  type PortalClockLike,
  type PortalSqlTransaction,
} from '@detran/portal-identity';

import { CrashViewProjector } from './crash-view.projection.js';
import { ExamViewProjector } from './exam-view.projection.js';
import {
  INFRACTION_VIEW_SOURCE,
  InfractionViewProjector,
  SqlInfractionViewSource,
  type InfractionViewSource,
} from './infraction-view.projection.js';
import { PORTAL_PARAMETER_READER } from './national-reads.service.js';
import {
  PROCESS_TIMELINE_DOMAIN_EVENTS,
  ProcessTimelineProjector,
  RAIT_INQUIRY_CHANGED_TYPE,
} from './process-timeline.projection.js';
import { PointsViewProjector } from './points-view.projection.js';
import {
  PORTAL_CONSUMED_ENVELOPE,
  PORTAL_PROJECTIONS,
  type ApplyOutcome,
  type PortalConsumedEvent,
  type PortalParameterReader,
  type PortalProjectionName,
  type ProjectionContext,
  type Projector,
} from './projection-contract.js';

export {
  PORTAL_CONSUMED_ENVELOPE,
  PORTAL_PROJECTIONS,
  type ApplyOutcome,
  type PortalConsumedEvent,
  type PortalProjectionName,
} from './projection-contract.js';

// ---------------------------------------------------------------------------
// poller (§7.1) — mesma porta `TeatStreamPoller` de teat-stream.service.ts
// ---------------------------------------------------------------------------

/**
 * Porta do agendador (estrutural; a implementação padrão
 * `createDefaultTeatStreamPoller()` é do app — única chamadora de `setInterval`).
 */
export interface PortalProjectionPoller {
  readonly intervalMs: number;
  schedule(fn: () => void | Promise<void>, intervalMs?: number): () => void;
}

export const PORTAL_PROJECTION_POLLER = Symbol('PORTAL_PROJECTION_POLLER');

/** Ator nominal dos jobs de projeção sem requisição (A3(b): uuid nulo). */
export const PORTAL_PROJECTION_ACTOR_ID =
  '00000000-0000-0000-0000-000000000000';

// ---------------------------------------------------------------------------
// despacho (§7.2)
// ---------------------------------------------------------------------------

/** `domainEvent` → projeções (§7.2). */
export const PROJECTOR_BY_DOMAIN_EVENT: Readonly<
  Record<string, readonly PortalProjectionName[]>
> = {
  INFRACAO_ESTADO_ALTERADO: ['infraction_view'],
  NOTIFICACAO_EXPEDIDA: ['infraction_view'],
  NOTIFICACAO_CIENCIA: ['infraction_view'],
  PAGAMENTO_CONFIRMADO: ['infraction_view'],
  ...Object.fromEntries(
    PROCESS_TIMELINE_DOMAIN_EVENTS.map((domainEvent) => [
      domainEvent,
      ['process_timeline'],
    ]),
  ),
  PENALIDADE_DEFINITIVA: ['points_view'],
};

/** `type` → projeções para eventos sem `domainEvent` (§7.1). */
export const PROJECTOR_BY_TYPE: Readonly<
  Record<string, readonly PortalProjectionName[]>
> = {
  [RAIT_INQUIRY_CHANGED_TYPE]: ['process_timeline'],
};

/** `aggregate.kind` → esqueletos (§7.2). */
export const PROJECTOR_BY_AGGREGATE_KIND: Readonly<
  Record<string, readonly PortalProjectionName[]>
> = {
  crash: ['crash_view'],
  'crash-record': ['crash_view'],
  'crash-renaest-submission': ['crash_view'],
  exam: ['exam_view'],
};

/** Prefixos dos `type` consumidos (M16: "topic in ('inf','rait')" como prefixo). */
const INF_TYPE_PREFIX = 'inf.';
const RAIT_TYPE_PREFIX = 'rait.';

/**
 * A `NOTIFICACAO_CIENCIA` publicada pelo próprio Portal (type com prefixo
 * `portal.`, §11) não é consumida (§7.3).
 */
function projectionsFor(
  event: PortalConsumedEvent,
): readonly PortalProjectionName[] {
  if (event.domainEvent) {
    if (
      event.domainEvent === 'NOTIFICACAO_CIENCIA' &&
      !event.type.startsWith(INF_TYPE_PREFIX)
    ) {
      return [];
    }
    const byDomainEvent = PROJECTOR_BY_DOMAIN_EVENT[event.domainEvent];
    if (byDomainEvent) return byDomainEvent;
  } else {
    const byType = PROJECTOR_BY_TYPE[event.type];
    if (byType) return byType;
  }
  return PROJECTOR_BY_AGGREGATE_KIND[event.aggregate.kind] ?? [];
}

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const APPLIED_SQL = `select id, last_error
     from portal.projection_applied_event
    where event_id = $1 and projection = $2
    limit 1`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
const INSERT_APPLIED_SQL = `insert into portal.projection_applied_event
      (event_id, projection, applied_at, last_error)
    values ($1, $2, $3, $4)
    on conflict (tenant_id, event_id, projection) do nothing
    returning id`;

const DELETE_APPLIED_SQL = `delete from portal.projection_applied_event where projection = $1`;

const WINDOW_SQL = `select id, topic, payload
     from integration.outbox
    where (topic like $1 or topic like $2 or topic = $3 or topic = $4 or topic like $5)
    order by created_at, id`;

/**
 * Não há cursor por tempo: uma linha que comitou tardiamente permanece sem
 * ledger e volta à janela. Para BOAT o anti-join é pela projeção exata.
 */
const TICK_WINDOW_SQL = `select o.id, o.topic, o.payload
     from integration.outbox o
    where (o.topic like $1 or o.topic like $2 or o.topic = $3 or o.topic = $4 or o.topic like $5)
      and (
        (o.aggregate_type in ('crash-record', 'crash-renaest-submission')
         and not exists (
           select 1
             from portal.projection_applied_event applied
            where applied.event_id = o.id
              and applied.projection = 'crash_view'
         ))
        or o.aggregate_type not in ('crash-record', 'crash-renaest-submission')
      )
    order by created_at, id`;

const TENANT_SQL = `select timezone from auth.tenants where id = auth.current_tenant()`;

const CURRENT_TENANT_SQL = `select auth.current_tenant() as tenant_id`;

interface OutboxRow extends Record<string, unknown> {
  id: string;
  topic: string;
  payload: unknown;
}

const BOAT_TECHNICAL_TOPICS = new Set([
  'crash.changed',
  'crash.renaest.changed',
]);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function boatDomainEventOf(value: unknown): string | undefined {
  const event = asRecord(value)?.domainEvent;
  return typeof event === 'string' && event.startsWith('SINISTRO_')
    ? event
    : undefined;
}

function aggregateOf(value: unknown): Record<string, unknown> | undefined {
  return asRecord(asRecord(value)?.aggregate);
}

/**
 * O envelope legado do Portal usa `version`; BOAT usa `schemaVersion`.
 * Normalizar aqui preserva as demais projeções e não transforma a versão do
 * agregado em versão de schema.
 */
function normalizedEvent(value: unknown): unknown {
  const domainEvent = boatDomainEventOf(value);
  if (!domainEvent) return value;
  const record = asRecord(value);
  const schemaVersion = record?.schemaVersion;
  if (!Number.isInteger(schemaVersion) || (schemaVersion as number) !== 1) {
    throw new PortalError('PORTAL.VALIDATION_FAILED', {
      status: 400,
      context: { fields: ['schemaVersion'] },
    });
  }
  return { ...record, version: schemaVersion };
}

function factualKey(value: unknown): string | undefined {
  const domainEvent = boatDomainEventOf(value);
  const aggregate = aggregateOf(value);
  if (!domainEvent || !aggregate) return undefined;
  const id = aggregate.id;
  const version = aggregate.version;
  return typeof id === 'string' && Number.isInteger(version)
    ? `${domainEvent}:${id}:${version}`
    : undefined;
}

/** Seleciona a linha nomeada do fato; exceção explícita da sincronização. */
function isCanonicalBoatRow(row: OutboxRow): boolean {
  const domainEvent = boatDomainEventOf(row.payload);
  if (!domainEvent) return true;
  if (domainEvent === 'SINISTRO_RECEBIDO_SINCRONIZACAO') {
    return row.topic === domainEvent || row.topic === 'crash.changed';
  }
  return row.topic === domainEvent && !BOAT_TECHNICAL_TOPICS.has(row.topic);
}

function canonicalWindow(rows: readonly OutboxRow[]): OutboxRow[] {
  const facts = new Set<string>();
  return rows.filter((row) => {
    if (!isCanonicalBoatRow(row)) return false;
    const key = factualKey(row.payload);
    if (!key) return true;
    if (facts.has(key)) return false;
    facts.add(key);
    return true;
  });
}

// ---------------------------------------------------------------------------
// serviço
// ---------------------------------------------------------------------------

@Injectable()
export class PortalProjectors {
  private readonly clock: PortalClockLike;
  private readonly projectors: ReadonlyMap<PortalProjectionName, Projector>;
  /**
   * Um envelope inválido não ganha ledger. Evitamos, porém, que o mesmo lote
   * sem suporte derrube indefinidamente o poller vivo; uma nova instância
   * (depois de suporte explícito de schema) o tenta novamente.
   */
  private readonly rejectedInvalidEventIds = new Set<string>();

  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(PORTAL_PARAMETER_READER)
    private readonly parameters: PortalParameterReader,
    @Optional()
    @Inject(PORTAL_PROJECTION_POLLER)
    private readonly poller?: PortalProjectionPoller,
    @Optional()
    @Inject(INFRACTION_VIEW_SOURCE)
    source?: InfractionViewSource,
    @Optional() clock?: PortalClock,
  ) {
    this.clock = clock ?? new PortalClock();
    const projectors: Projector[] = [
      new InfractionViewProjector(source ?? new SqlInfractionViewSource()),
      new ProcessTimelineProjector(),
      new PointsViewProjector(),
      new CrashViewProjector(),
      new ExamViewProjector(),
    ];
    this.projectors = new Map(
      projectors.map((projector) => [projector.projection, projector]),
    );
  }

  /** Cabeçalhos `// Source events:` como dados (ADR-0020 §4). */
  sourceEventsOf(projection: PortalProjectionName): readonly string[] {
    return this.projectorOf(projection).sourceEvents;
  }

  /**
   * §7.1 `applyEvent(event, tx)`: uma saída por projeção despachada (a
   * única, na prática — nenhum evento alimenta duas projeções); evento fora
   * do mapa → `not_consumed`. `only` restringe ao projetor do `rebuild`.
   */
  async applyEvent(
    event: unknown,
    tx: PortalSqlTransaction,
    only?: PortalProjectionName,
  ): Promise<ApplyOutcome | ApplyOutcome[]> {
    let normalized: unknown;
    try {
      normalized = normalizedEvent(event);
    } catch (error) {
      const id = asRecord(event)?.id;
      if (typeof id === 'string') this.rejectedInvalidEventIds.add(id);
      throw error;
    }
    const parsed = PORTAL_CONSUMED_ENVELOPE.safeParse(normalized);
    if (!parsed.success) {
      return {
        projection: only ?? '',
        applied: false,
        skipped: 'not_consumed',
      };
    }
    const consumed = parsed.data;
    const targets = projectionsFor(consumed).filter(
      (projection) => only === undefined || projection === only,
    );
    if (targets.length === 0) {
      return {
        projection: only ?? '',
        applied: false,
        skipped: 'not_consumed',
      };
    }
    const currentTenant = (
      await tx.query<{ tenant_id: string | null }>(CURRENT_TENANT_SQL)
    ).rows[0]?.tenant_id;
    if (currentTenant && currentTenant !== consumed.tenantId) {
      return {
        projection: only ?? '',
        applied: false,
        skipped: 'not_consumed',
      };
    }
    const context = await this.contextOf(tx);
    const outcomes: ApplyOutcome[] = [];
    for (const projection of targets) {
      outcomes.push(await this.applyTo(projection, consumed, context));
    }
    return outcomes.length === 1 ? outcomes[0]! : outcomes;
  }

  /** §7.1/A5(a) `rebuild(tenantId, projection)` — transação de tenant própria. */
  rebuild(tenantId: string, projection: PortalProjectionName): Promise<void> {
    return this.inTenant(tenantId, async (tx) => {
      const context = await this.contextOf(tx);
      const projector = this.projectorOf(projection);
      const window = canonicalWindow(await this.window(tx));
      await projector.reset(
        context,
        window.map((row) => row.id),
      );
      await tx.query(DELETE_APPLIED_SQL, [projection]);
      for (const row of window) {
        await this.applyEvent(row.payload, tx, projection);
      }
    });
  }

  /** As cinco em ordem (`points_view` lê `infraction_view`). */
  async rebuildAll(tenantId: string): Promise<void> {
    for (const projection of PORTAL_PROJECTIONS) {
      await this.rebuild(tenantId, projection);
    }
  }

  /** Poller ao vivo (§7.1): candidatos sem ledger, inclusive commit tardio. */
  tick(tenantId: string): Promise<number> {
    return this.inTenant(tenantId, async (tx) => {
      const window = canonicalWindow(await this.unappliedWindow(tx)).filter(
        (row) => !this.rejectedInvalidEventIds.has(row.id),
      );
      for (const row of window) await this.applyEvent(row.payload, tx);
      return window.length;
    });
  }

  /** Agenda `tick(tenantId)` no poller injetado; devolve o cancelamento. */
  start(tenantId: string): () => void {
    if (!this.poller) return () => undefined;
    return this.poller.schedule(() => {
      void this.tick(tenantId).catch(() => undefined);
    });
  }

  // -------------------------------------------------------------------------
  // apoio
  // -------------------------------------------------------------------------

  private async applyTo(
    projection: PortalProjectionName,
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ApplyOutcome> {
    const { tx } = context;
    const already = (
      await tx.query<{ id: string }>(APPLIED_SQL, [event.id, projection])
    ).rows[0];
    if (already) {
      return { projection, applied: false, skipped: 'already_applied' };
    }
    const result = await this.projectorOf(projection).apply(event, context);
    if (result.kind === 'skipped') {
      return { projection, applied: false, skipped: result.reason };
    }
    const error = result.kind === 'error' ? result.error : null;
    const recorded = (
      await tx.query<{ id: string }>(INSERT_APPLIED_SQL, [
        event.id,
        projection,
        context.now,
        error,
      ])
    ).rows[0];
    if (!recorded) {
      return { projection, applied: false, skipped: 'already_applied' };
    }
    return error
      ? { projection, applied: false, error }
      : { projection, applied: true };
  }

  private projectorOf(projection: PortalProjectionName): Projector {
    const projector = this.projectors.get(projection);
    if (!projector) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { projection },
      });
    }
    return projector;
  }

  private async contextOf(
    tx: PortalSqlTransaction,
  ): Promise<ProjectionContext> {
    const tenant = (await tx.query<{ timezone: string | null }>(TENANT_SQL))
      .rows[0];
    const tenantTz = tenant?.timezone ?? PORTAL_DEFAULT_TIME_ZONE;
    const now = this.clock.now();
    return {
      tx,
      now,
      today: this.clock.today(tenantTz),
      tenantTz,
      parameters: this.parameters,
    };
  }

  private async window(tx: PortalSqlTransaction): Promise<OutboxRow[]> {
    return (
      await tx.query<OutboxRow>(WINDOW_SQL, [
        `${INF_TYPE_PREFIX}%`,
        `${RAIT_TYPE_PREFIX}%`,
        'crash.changed',
        'crash.renaest.changed',
        'SINISTRO_%',
      ])
    ).rows;
  }

  private async unappliedWindow(
    tx: PortalSqlTransaction,
  ): Promise<OutboxRow[]> {
    return (
      await tx.query<OutboxRow>(TICK_WINDOW_SQL, [
        `${INF_TYPE_PREFIX}%`,
        `${RAIT_TYPE_PREFIX}%`,
        'crash.changed',
        'crash.renaest.changed',
        'SINISTRO_%',
      ])
    ).rows;
  }

  /**
   * Transação de tenant: dentro de uma requisição (ou do teste) usa o
   * contexto ativo; num job, semeia `app.tenant_id = tenantId` com o ator
   * nominal (`Database.withRequestContext`, STYNX).
   */
  private inTenant<T>(
    tenantId: string,
    work: (tx: PortalSqlTransaction) => Promise<T>,
  ): Promise<T> {
    const run = () =>
      withTenantContext(this.database, this.requestContext, (tx) =>
        work(tx as unknown as PortalSqlTransaction),
      );
    if (this.requestContext.hasActiveContext()) return run();
    const database = this.database as Partial<Database>;
    if (typeof database.withRequestContext === 'function') {
      return database.withRequestContext(
        { tenantId, actorId: PORTAL_PROJECTION_ACTOR_ID },
        run,
      );
    }
    return run();
  }
}
