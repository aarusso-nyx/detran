// Frescor (CTG-0002 §8; plan M20; [WF-DASH-003]). `freshnessOf` é a função
// pura de estado de §8.1 (sete linhas, ordem de avaliação = ordem das
// linhas); `DashboardFreshnessService` aplica-a a `dashboard.source`
// (`sweep`, passo 3 do sweeper), registra leituras (`observe`, §8.2), lê o
// selo da fonte de um indicador (`stateOf`, §8.4) e monta `meta.freshness`
// (`metaFor`, §5.5). Mapa `projection → source_key` declarado (§8.3,
// OD-D47); bloco de uma fonte = o mais restritivo entre os indicadores que
// ela alimenta (§8.3), com o mapa declarado como reserva quando o tenant não
// tem catálogo (OD-D63). Fonte sem `L` ou sem `H` é lida como está (M13): a
// função só reescreve o estado quando ambos existem; `FRESCO` sem
// `heartbeat_contract` é `DASH.SOURCE_HEARTBEAT_UNDEFINED` (422). Eventos
// `dashboard.source.freshness`/`FONTE_FRESCOR_ALTERADO` (token proposto,
// OD-D33) a cada mudança de `state`/`hidden` — um por varredura, com o
// estado final.
import { Inject, Injectable } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import type { Clock } from '@detran/inf-deadlines';

import { DASHBOARD_EVENT_TYPES, envelopeOf, publish } from './events.js';
import {
  DASHBOARD_CLOCK,
  dashboardParameterKey,
  readNumericParameter,
  type DashboardBlock,
  type FreshnessState,
  query,
  type CycleSqlTransaction,
} from './tokens.js';

export type UnavailableStrategy = 'hide' | 'mark';

export interface FreshnessInput {
  lastSeenAt: Date | null;
  acceptableLatencyMinutes: number | null;
  heartbeatContract: string | null;
  block: DashboardBlock;
  strategy: UnavailableStrategy;
}

export interface FreshnessParams {
  /** `dashboard.heartbeat_divisor` (d). */
  heartbeatDivisor: number;
  /** `dashboard.stale_hide_multiplier` (m). */
  staleHideMultiplier: number;
}

export interface FreshnessResult {
  state: FreshnessState;
  hidden: boolean;
  staleSince: Date | null;
}

const MINUTE_MS = 60_000;

/** §8.1 — linhas 1…7 na ordem. */
export function freshnessOf(
  input: FreshnessInput,
  params: FreshnessParams,
  now: Date,
): FreshnessResult {
  const hideWhenUnavailable = input.block === 'A';
  // 1. H nulo ou L nulo
  if (
    input.heartbeatContract === null ||
    input.acceptableLatencyMinutes === null
  ) {
    return {
      state: 'INDISPONIVEL',
      hidden: hideWhenUnavailable,
      staleSince: null,
    };
  }
  // 2. L0 nulo
  if (input.lastSeenAt === null) {
    return {
      state: 'INDISPONIVEL',
      hidden: hideWhenUnavailable,
      staleSince: null,
    };
  }
  const latencyMs = input.acceptableLatencyMinutes * MINUTE_MS;
  const ageMs = now.getTime() - input.lastSeenAt.getTime();
  const divisorMs = params.heartbeatDivisor * latencyMs;
  const hideMs = params.staleHideMultiplier * latencyMs;
  // 3. age ≤ L
  if (ageMs <= latencyMs)
    return { state: 'FRESCO', hidden: false, staleSince: null };
  // 4. L < age ≤ d·L
  if (ageMs <= divisorMs) {
    return { state: 'ATRASADO', hidden: false, staleSince: null };
  }
  // 5. age > d·L e bloco A (ou estratégia hide)
  if (input.block === 'A' || input.strategy === 'hide') {
    return { state: 'INDISPONIVEL', hidden: true, staleSince: null };
  }
  const staleSince = new Date(input.lastSeenAt.getTime() + divisorMs);
  // 6. d·L < age ≤ m·L (marcar)  7. age > m·L (ocultar)
  return {
    state: 'DESATUALIZADO_MARCADO',
    hidden: ageMs > hideMs,
    staleSince,
  };
}

/** §5.5 — forma exata de `meta.freshness`. */
export interface FreshnessMeta {
  state: FreshnessState;
  asOf: string | null;
  acceptableLatency: number | null;
  source: string;
}

export interface SourceFreshnessState {
  state: FreshnessState;
  hidden: boolean;
  sourceKey: string;
  lastSeenAt: Date | null;
  acceptableLatencyMinutes: number | null;
}

/** Mapa `projection → source_key` (§8.3, declarado — OD-D47). O estado
 *  próprio (`duty_evidence`, `duty_cycle`, `transparency_audit`,
 *  `source_freshness`) responde pela fonte `dashboard`. */
export const SOURCE_KEY_BY_PROJECTION: Readonly<Record<string, string>> = {
  'dashboard.prescription_risk': 'rait.outbox',
  'dashboard.production': 'rait.outbox',
  'dashboard.integration_health': 'teat.offline-sync',
  'dashboard.teat_measures': 'teat.offline-sync',
  'dashboard.pec_deadlines': 'pec.deadlines',
  'dashboard.crashes': 'boat.crashes',
  'dashboard.portal_service_metrics': 'portal.outbox',
  'dashboard.duty_evidence': 'dashboard',
  'dashboard.duty_cycle': 'dashboard',
  'dashboard.transparency_audit': 'dashboard',
  'dashboard.source_freshness': 'dashboard',
};

/** Fonte do adapter (§8.3: `integration_health` alimentando 403). */
const ADAPTER_SOURCE_APP = 'senatran-adapter';
const ADAPTER_SOURCE_KEY = `${ADAPTER_SOURCE_APP}.telemetry`;
const OWN_SOURCE_KEY = 'dashboard';

/** Bloco por `source_key` (§8.3, coluna "bloco") — reserva quando o tenant
 *  não tem catálogo de indicadores (OD-D63). */
export const BLOCK_BY_SOURCE_KEY: Readonly<Record<string, DashboardBlock>> = {
  'rait.outbox': 'A',
  'teat.offline-sync': 'A',
  'pec.deadlines': 'A',
  'boat.crashes': 'B',
  'portal.outbox': 'B',
  dashboard: 'B',
  [ADAPTER_SOURCE_KEY]: 'D',
};

const BLOCK_ORDER: readonly DashboardBlock[] = ['A', 'B', 'C', 'D'];
const STATE_SEVERITY: Readonly<Record<FreshnessState, number>> = {
  FRESCO: 0,
  ATRASADO: 1,
  DESATUALIZADO_MARCADO: 2,
  INDISPONIVEL: 3,
};

export function sourceKeyFor(
  projection: string | null | undefined,
  sourceApp?: string | null,
): string {
  if (
    projection === 'dashboard.integration_health' &&
    sourceApp === ADAPTER_SOURCE_APP
  ) {
    return ADAPTER_SOURCE_KEY;
  }
  return (projection && SOURCE_KEY_BY_PROJECTION[projection]) ?? OWN_SOURCE_KEY;
}

interface SourceRow extends Record<string, unknown> {
  id: string;
  source_key: string;
  app: string;
  state: FreshnessState;
  last_seen_at: Date | null;
  last_read_at: Date | null;
  acceptable_latency_minutes: number | null;
  heartbeat_contract: string | null;
  stale_since: Date | null;
  hidden: boolean;
  version: number;
}

interface IndicatorRow extends Record<string, unknown> {
  code: string;
  block: DashboardBlock;
  source_app: string;
  projection: string | null;
  unavailable_strategy: UnavailableStrategy | null;
}

interface BlockRefRow extends Record<string, unknown> {
  code: DashboardBlock;
  unavailable_strategy: UnavailableStrategy;
}

const SOURCE_COLUMNS = `id, source_key, app, state, last_seen_at, last_read_at,
       acceptable_latency_minutes, heartbeat_contract, stale_since, hidden, version`;

export interface FreshnessContext {
  tenantId: string;
  now: Date;
  actor: { kind: 'user' | 'system' | 'timer'; id?: string; role?: string };
  requestId?: string;
}

@Injectable()
export class DashboardFreshnessService {
  constructor(
    @Inject(DASHBOARD_CLOCK) private readonly clock: Clock,
    @Inject(OpsParameterService)
    private readonly parameters: OpsParameterService,
  ) {}

  /** `d` e `m` (§8.1) pelo `OpsParameterService` (regra numérica §1.3.7). */
  async params(): Promise<FreshnessParams> {
    const [heartbeatDivisor, staleHideMultiplier] = await Promise.all([
      readNumericParameter(
        this.parameters,
        dashboardParameterKey('heartbeat_divisor'),
      ),
      readNumericParameter(
        this.parameters,
        dashboardParameterKey('stale_hide_multiplier'),
      ),
    ]);
    return { heartbeatDivisor, staleHideMultiplier };
  }

  /** Passo 3 do sweeper (§13.3): reavalia toda fonte com `L` e `H`; um
   *  evento por mudança de `state`/`hidden`. Devolve quantas mudaram. */
  async sweep(tx: CycleSqlTransaction, ctx: FreshnessContext): Promise<number> {
    const sources = await query<SourceRow>(
      tx,
      `select ${SOURCE_COLUMNS}
         from dashboard.source
        where tenant_id = $1 and acceptable_latency_minutes is not null
          and heartbeat_contract is not null
        order by source_key`,
      [ctx.tenantId],
    );
    if (sources.rows.length === 0) return 0;
    const params = await this.params();
    const blocks = await this.blocksBySourceKey(tx, ctx.tenantId);
    const strategies = await this.strategiesByBlock(tx);
    let changed = 0;
    for (const source of sources.rows) {
      const block =
        blocks.get(source.source_key) ??
        BLOCK_BY_SOURCE_KEY[source.source_key] ??
        'B';
      const applied = await this.applyState(
        tx,
        ctx,
        source,
        params,
        block,
        strategies,
      );
      if (applied) changed += 1;
    }
    return changed;
  }

  /** §8.2: a chegada de evento da fonte também é leitura — `last_seen_at =
   *  seenAt` quando maior; reavalia o estado quando `L` e `H` existem.
   *  Fonte sem `heartbeat_contract` nunca vai a `FRESCO`
   *  (`DASH.SOURCE_HEARTBEAT_UNDEFINED`, 422). */
  async observe(
    tx: CycleSqlTransaction,
    sourceKey: string,
    seenAt: Date,
    ctx: FreshnessContext,
  ): Promise<void> {
    const source = await this.sourceByKey(tx, ctx.tenantId, sourceKey);
    if (!source) return;
    if (source.heartbeat_contract === null) {
      throw new DetranError('DASH.SOURCE_HEARTBEAT_UNDEFINED', {
        status: 422,
        context: { source: sourceKey },
      });
    }
    const current = source.last_seen_at ? new Date(source.last_seen_at) : null;
    if (!current || seenAt.getTime() > current.getTime()) {
      await query(
        tx,
        `update dashboard.source
            set last_seen_at = $3, updated_at = $4
          where tenant_id = $1 and id = $2`,
        [ctx.tenantId, source.id, seenAt.toISOString(), ctx.now.toISOString()],
      );
      source.last_seen_at = seenAt;
    }
    if (source.acceptable_latency_minutes === null) return;
    const params = await this.params();
    const blocks = await this.blocksBySourceKey(tx, ctx.tenantId);
    const strategies = await this.strategiesByBlock(tx);
    const block =
      blocks.get(sourceKey) ?? BLOCK_BY_SOURCE_KEY[sourceKey] ?? 'B';
    await this.applyState(tx, ctx, source, params, block, strategies);
  }

  /** §8.5: o fallback só registra a leitura (`last_read_at = now`); o selo
   *  não melhora por fallback. */
  async markRead(
    tx: CycleSqlTransaction,
    tenantId: string,
    now: Date,
  ): Promise<void> {
    await query(
      tx,
      `update dashboard.source set last_read_at = $2 where tenant_id = $1`,
      [tenantId, now.toISOString()],
    );
  }

  /** §8.4 — selo da fonte do indicador (`INDISPONIVEL` sem `heartbeat_contract`
   *  quando a fonte não tem linha = fonte desconectada). `null` quando o
   *  indicador não existe no catálogo. `projectionFallback` cobre o indicador
   *  sem `projection` (ex. IND-DASH-209, estado próprio). */
  async stateOf(
    tx: CycleSqlTransaction,
    tenantId: string,
    indicatorCode: string,
    projectionFallback?: string | null,
  ): Promise<SourceFreshnessState | null> {
    const indicator = await this.indicator(tx, tenantId, indicatorCode);
    if (!indicator) return null;
    const sourceKey = sourceKeyFor(
      indicator.projection ?? projectionFallback ?? null,
      indicator.source_app,
    );
    return this.stateOfSource(tx, tenantId, sourceKey);
  }

  async stateOfSource(
    tx: CycleSqlTransaction,
    tenantId: string,
    sourceKey: string,
  ): Promise<SourceFreshnessState> {
    const source = await this.sourceByKey(tx, tenantId, sourceKey);
    if (!source) {
      return {
        state: 'INDISPONIVEL',
        hidden: true,
        sourceKey,
        lastSeenAt: null,
        acceptableLatencyMinutes: null,
      };
    }
    return {
      state: source.state,
      hidden: source.hidden,
      sourceKey: source.source_key,
      lastSeenAt: source.last_seen_at ? new Date(source.last_seen_at) : null,
      acceptableLatencyMinutes:
        source.acceptable_latency_minutes === null
          ? null
          : Number(source.acceptable_latency_minutes),
    };
  }

  /** §5.5: pior estado entre as fontes dos indicadores; sem indicadores (ou
   *  só estado próprio) → `FRESCO` com `asOf = Clock.now()` e `source =
   *  'dashboard'`. */
  async metaFor(
    tx: CycleSqlTransaction,
    tenantId: string,
    indicatorCodes: readonly string[],
  ): Promise<FreshnessMeta> {
    const states: SourceFreshnessState[] = [];
    for (const code of [...new Set(indicatorCodes)]) {
      const state = await this.stateOf(tx, tenantId, code);
      if (state) states.push(state);
    }
    if (states.length === 0) {
      return {
        state: 'FRESCO',
        asOf: this.clock.now().toISOString(),
        acceptableLatency: null,
        source: OWN_SOURCE_KEY,
      };
    }
    let worst = states[0]!;
    let asOf: Date | null = null;
    let acceptable: number | null = null;
    for (const state of states) {
      if (STATE_SEVERITY[state.state] > STATE_SEVERITY[worst.state])
        worst = state;
      if (state.lastSeenAt && (!asOf || state.lastSeenAt < asOf))
        asOf = state.lastSeenAt;
      if (
        state.acceptableLatencyMinutes !== null &&
        (acceptable === null || state.acceptableLatencyMinutes < acceptable)
      ) {
        acceptable = state.acceptableLatencyMinutes;
      }
    }
    return {
      state: worst.state,
      asOf: asOf ? asOf.toISOString() : null,
      acceptableLatency: acceptable,
      source: worst.sourceKey,
    };
  }

  /** Estados que silenciam o detector e bloqueiam comandos (§8.4). */
  static isStale(state: FreshnessState): boolean {
    return state === 'INDISPONIVEL' || state === 'DESATUALIZADO_MARCADO';
  }

  // ---- internos ------------------------------------------------------------

  private async indicator(
    tx: CycleSqlTransaction,
    tenantId: string,
    code: string,
  ): Promise<IndicatorRow | null> {
    const result = await query<IndicatorRow>(
      tx,
      `select code, block, source_app, projection, unavailable_strategy
         from dashboard.indicator
        where tenant_id = $1 and code = $2`,
      [tenantId, code],
    );
    return result.rows[0] ?? null;
  }

  private async sourceByKey(
    tx: CycleSqlTransaction,
    tenantId: string,
    sourceKey: string,
  ): Promise<SourceRow | null> {
    const result = await query<SourceRow>(
      tx,
      `select ${SOURCE_COLUMNS}
         from dashboard.source
        where tenant_id = $1 and source_key = $2`,
      [tenantId, sourceKey],
    );
    return result.rows[0] ?? null;
  }

  /** Bloco mais restritivo (A < B < C < D) entre os indicadores alimentados
   *  por cada fonte do tenant (§8.3). */
  private async blocksBySourceKey(
    tx: CycleSqlTransaction,
    tenantId: string,
  ): Promise<Map<string, DashboardBlock>> {
    const result = await query<IndicatorRow>(
      tx,
      `select code, block, source_app, projection, unavailable_strategy
         from dashboard.indicator
        where tenant_id = $1 and projection is not null`,
      [tenantId],
    );
    const blocks = new Map<string, DashboardBlock>();
    for (const row of result.rows) {
      const key = sourceKeyFor(row.projection, row.source_app);
      const current = blocks.get(key);
      if (
        !current ||
        BLOCK_ORDER.indexOf(row.block) < BLOCK_ORDER.indexOf(current)
      ) {
        blocks.set(key, row.block);
      }
    }
    return blocks;
  }

  /** `block_ref.unavailable_strategy` (DDL 19; [WF-DASH-003] §Duas estratégias). */
  private async strategiesByBlock(
    tx: CycleSqlTransaction,
  ): Promise<Map<DashboardBlock, UnavailableStrategy>> {
    const result = await query<BlockRefRow>(
      tx,
      `select code, unavailable_strategy from dashboard.block_ref`,
    );
    return new Map(
      result.rows.map((row) => [row.code, row.unavailable_strategy]),
    );
  }

  /** Aplica `freshnessOf` a uma linha; grava e publica só quando `state`,
   *  `hidden` ou `stale_since` mudam. */
  private async applyState(
    tx: CycleSqlTransaction,
    ctx: FreshnessContext,
    source: SourceRow,
    params: FreshnessParams,
    block: DashboardBlock,
    strategies: Map<DashboardBlock, UnavailableStrategy>,
  ): Promise<boolean> {
    const next = freshnessOf(
      {
        lastSeenAt: source.last_seen_at ? new Date(source.last_seen_at) : null,
        acceptableLatencyMinutes:
          source.acceptable_latency_minutes === null
            ? null
            : Number(source.acceptable_latency_minutes),
        heartbeatContract: source.heartbeat_contract,
        block,
        strategy: strategies.get(block) ?? (block === 'A' ? 'hide' : 'mark'),
      },
      params,
      ctx.now,
    );
    const currentStale = source.stale_since
      ? new Date(source.stale_since).getTime()
      : null;
    const nextStale = next.staleSince ? next.staleSince.getTime() : null;
    if (
      next.state === source.state &&
      next.hidden === source.hidden &&
      nextStale === currentStale
    ) {
      return false;
    }
    // Selo anunciado: `stale_since` não nulo é o registro de que o último
    // estado publicado foi `DESATUALIZADO_MARCADO`; o projetor de heartbeat
    // (CTG-0001 §4.1.8) reescreve `state` sem limpar `stale_since`, e o ciclo
    // reconcilia a partir dele (declarado, OD no relatório).
    const announced: FreshnessState =
      source.state !== 'DESATUALIZADO_MARCADO' && currentStale !== null
        ? 'DESATUALIZADO_MARCADO'
        : source.state;
    const updated = await query<{ version: number }>(
      tx,
      `update dashboard.source
          set state = $3, hidden = $4, stale_since = $5,
              version = version + 1, updated_at = $6
        where tenant_id = $1 and id = $2
        returning version`,
      [
        ctx.tenantId,
        source.id,
        next.state,
        next.hidden,
        next.staleSince ? next.staleSince.toISOString() : null,
        ctx.now.toISOString(),
      ],
    );
    const version = Number(updated.rows[0]?.version ?? source.version + 1);
    const fromState = announced;
    if (fromState !== next.state || source.hidden !== next.hidden) {
      await publish(
        tx,
        envelopeOf({
          type: DASHBOARD_EVENT_TYPES.sourceFreshness,
          domainEvent: 'FONTE_FRESCOR_ALTERADO',
          tenantId: ctx.tenantId,
          occurredAt: ctx.now,
          actor: ctx.actor,
          correlationId: ctx.requestId,
          aggregate: { kind: 'source', id: source.id, version },
          data: {
            sourceId: source.id,
            sourceKey: source.source_key,
            app: source.app,
            fromState,
            toState: next.state,
            hidden: next.hidden,
            lastSeenAt: source.last_seen_at
              ? new Date(source.last_seen_at).toISOString()
              : null,
            staleSince: next.staleSince ? next.staleSince.toISOString() : null,
            acceptableLatencyMinutes:
              source.acceptable_latency_minutes === null
                ? null
                : Number(source.acceptable_latency_minutes),
            occurredAt: ctx.now.toISOString(),
          },
        }),
      );
    }
    source.state = next.state;
    source.hidden = next.hidden;
    source.stale_since = next.staleSince;
    source.version = version;
    return true;
  }
}
