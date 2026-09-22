// Harness da suíte do ciclo (CTG-0002 §15.1; Inspector TASK-0004). Complementa
// `tests/support/projectors-harness.ts` (CTG-0001, não editado — A15) com:
//   (a) `FakeCycleTx` — a tx falsa em memória dos specs `unit`, aceitando
//       além do subconjunto do harness de projetores um `order by` de cauda
//       (as leituras de `*_transition_ref` ordenam por `seq`);
//   (b) `CycleDb` — conexão real única por arquivo de spec (A18) contra o
//       `detran_r11`, com `set_config` de `app.role`/`app.tenant_id` no padrão
//       de `projections-replay.integration.spec.ts`, leitores de estado
//       (`alert`, `alert_trail`, `timer`, `duty_cycle`, `source`, outbox) e a
//       limpeza por id/chave do namespace `0083…` (método §4.16, A16);
//   (c) `LiveParameters` — leitor de `ops.parameter` com a MESMA consulta de
//       `OpsParameterService.get` (forma de
//       `portal-projections-replay.integration.spec.ts`), com `override` em
//       memória para C-0002-13 (sem literal de chave `dashboard.*`, regra 8
//       do prompt; o casamento é por sufixo);
//   (d) `buildCycle` — UMA fábrica dos serviços de `src/handwritten/cycle/**`
//       (§14.1) com `FixedClock` + `InMemoryCalendar(calendar-2026.json)`.
//       As assinaturas dos construtores que §14.1 não fixa (`DashboardNotifier`,
//       `DashboardFreshnessService`, `deps` de `DashboardClockSweeper`) estão
//       concentradas aqui, marcadas `source_pending`, para o Engineer de
//       TASK-0005 alinhar num único lugar (OD proposta no relatório).
// Todos os símbolos do ciclo vêm pelos nomes/caminhos fixos de §14.1
// (`../../src/handwritten/cycle/index.js`); o arquivo não existe nesta
// entrega — falha de import esperada (prompt TASK-0004).
import pg from 'pg';
import { expect } from 'vitest';

import type { Calendar, Clock, LocalDate } from '@detran/inf-deadlines';
import { FixedClock, InMemoryCalendar } from '@detran/inf-deadlines';
import type { OpsParameterService } from '@detran/ops-parameter';

import type { DashboardSqlTransaction } from '../../src/handwritten/projection-contract.js';
import {
  DashboardAlertService,
  DashboardClockService,
  DashboardClockSweeper,
  DashboardDutyService,
  DashboardFreshnessService,
  DashboardNotifier,
} from '../../src/handwritten/cycle/index.js';
import type {
  CycleContext,
  DashboardSweepDiscovery,
  DashboardSweepTarget,
} from '../../src/handwritten/cycle/index.js';
import {
  FIXTURE_TENANT_ID,
  FIXTURE_TENANT_TZ,
  ROLES,
  SUITE_SOURCE_KEYS,
  USERS,
  loadCalendar2026,
} from '../fixtures/cycle-fixtures.js';
import { FakeDashboardTx } from './projectors-harness.js';

export type Row = Record<string, unknown>;

// ---------------------------------------------------------------------------
// (a) tx falsa dos specs unit
// ---------------------------------------------------------------------------

/** `FakeDashboardTx` + `order by` de cauda (removido antes de delegar; a
 * ordenação é aplicada em memória por `seq`/`level` quando a coluna existe). */
export class FakeCycleTx extends FakeDashboardTx {
  override async query<T extends Row = Row>(
    statement: string,
    values: readonly unknown[] = [],
  ): Promise<{ rows: T[]; rowCount?: number | null }> {
    const orderBy = statement.match(
      /\s+order\s+by\s+([a-z_][a-z0-9_]*)(?:\s+(asc|desc))?\s*;?\s*$/i,
    );
    if (!orderBy) return super.query<T>(statement, values);
    const stripped = statement.slice(0, orderBy.index);
    const result = await super.query<T>(stripped, values);
    const column = orderBy[1]!;
    const direction = (orderBy[2] ?? 'asc').toLowerCase();
    const rows = [...result.rows].sort((a, b) => {
      const left = Number(a[column]);
      const right = Number(b[column]);
      return direction === 'desc' ? right - left : left - right;
    });
    return { rows, rowCount: rows.length };
  }
}

// ---------------------------------------------------------------------------
// (b) conexão real (integração)
// ---------------------------------------------------------------------------

export interface OutboxRow {
  id: string;
  tenant_id: string;
  topic: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: {
    id: string;
    type: string;
    domainEvent?: string;
    version: number;
    occurredAt: string;
    tenantId: string;
    actor: { kind: string; id?: string; role?: string };
    correlationId?: string;
    causationId?: string;
    aggregate: { kind: string; id: string; version: number };
    data: Record<string, unknown>;
  };
  idempotency_key: string;
  status: string;
}

export class CycleDb {
  readonly client: pg.Client;
  readonly tx: DashboardSqlTransaction;
  /** Tudo o que a suíte criou e precisa apagar, por tabela e chave própria. */
  private readonly ownedAlertIds = new Set<string>();
  private readonly ownedDutyCycleIds = new Set<string>();
  private readonly ownedDutyCyclePairs = new Set<string>();
  private readonly ownedSourceKeys = new Set<string>();
  private readonly ownedTimerIds = new Set<string>();
  private readonly ownedIndicatorConfigIds = new Set<string>();
  private readonly ownedDutyIds = new Set<string>();
  private readonly ownedAuditIds = new Set<string>();
  private readonly ownedProjectionEventIds = new Set<string>();
  private readonly ownedOutboxIds = new Set<string>();
  private readonly restores: (() => Promise<void>)[] = [];

  constructor() {
    const { Client } = pg;
    this.client = new Client({
      connectionString:
        process.env.DETRAN_TEST_DATABASE_URL ??
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/detran_r11',
    });
    this.tx = {
      query: (statement: string, values?: readonly unknown[]) =>
        this.client.query(statement, values as unknown[]) as never,
    };
  }

  async connect(tenantId: string = FIXTURE_TENANT_ID): Promise<void> {
    await this.client.connect();
    await this.client.query(`select set_config('app.role', 'owner', false)`);
    await this.setTenant(tenantId);
  }

  async setTenant(tenantId: string): Promise<void> {
    await this.client.query(`select set_config('app.tenant_id', $1, false)`, [
      tenantId,
    ]);
  }

  /** Executa `work` numa transação real e a REVERTE — para provar que um
   * caminho é rejeitado sem deixar rastro (C-0002-38 sobre linha do seed). */
  async rolledBack<T>(work: () => Promise<T>): Promise<T> {
    await this.client.query('begin');
    try {
      return await work();
    } finally {
      await this.client.query('rollback');
    }
  }

  // ---- inserções próprias (namespace 0083…) -------------------------------

  async insertAlert(row: Row & { id: string }): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.alert (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedAlertIds.add(row.id);
  }

  /** Clona um alerta do seed 81 (só leitura) para um id próprio, copiando
   * todas as colunas de estado; a trilha é clonada com ids novos. */
  async cloneAlert(
    seedAlertId: string,
    newId: string,
    overrides: Row = {},
  ): Promise<void> {
    const seed = await this.alert(seedAlertId);
    if (!seed) throw new Error(`alerta do seed ausente: ${seedAlertId}`);
    const {
      id: _id,
      created_at: _c,
      updated_at: _u,
      ...rest
    } = seed as Row & { id: string; created_at: unknown; updated_at: unknown };
    await this.insertAlert({ ...rest, ...overrides, id: newId });
    const trail = await this.trail(seedAlertId);
    for (const line of trail) {
      const {
        id: _tid,
        created_at: _tc,
        updated_at: _tu,
        ...lineRest
      } = line as Row & {
        id: string;
        created_at: unknown;
        updated_at: unknown;
      };
      const columns = Object.keys({ ...lineRest, alert_id: newId });
      const values = { ...lineRest, alert_id: newId } as Row;
      await this.client.query(
        `insert into dashboard.alert_trail (${columns.join(', ')}) values (${columns
          .map((_, i) => `$${i + 1}`)
          .join(', ')})`,
        columns.map((column) => values[column]),
      );
    }
  }

  async insertTimer(row: Row & { id: string }): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.timer (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedTimerIds.add(row.id);
  }

  async insertDutyCycle(
    row: Row & { id: string; duty_code: string; period: string },
  ): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.duty_cycle (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedDutyCycleIds.add(row.id);
    this.ownedDutyCyclePairs.add(`${row.duty_code}|${row.period}`);
  }

  /** Registra pares `(duty_code, period)` criados pelo serviço (ids gerados)
   * para a limpeza; a chave é única no DDL (`ux_dashboard_duty_cycle_period`)
   * e nunca é uma do seed 81 (o chamador garante pelo `diff` de pares). */
  ownDutyCyclePairs(pairs: readonly { dutyCode: string; period: string }[]) {
    for (const pair of pairs)
      this.ownedDutyCyclePairs.add(`${pair.dutyCode}|${pair.period}`);
  }

  async insertSource(row: Row & { id: string; source_key: string }) {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.source (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedSourceKeys.add(row.source_key);
  }

  ownSourceKey(sourceKey: string): void {
    this.ownedSourceKeys.add(sourceKey);
  }

  /** Fonte `FRESCO` própria da suíte para uma `source_key` sem seed
   * (`portal.outbox`, `dashboard`), CTG-0002 §8.3 — ver
   * `SUITE_SOURCE_KEYS`. Falha alto se a chave já existir (o seed mudou e a
   * suíte precisa ser revista, nunca sobrescrever). */
  async ensureFreshSuiteSource(
    id: string,
    sourceKey: string,
    app: string,
    lastSeenAt: Date,
  ): Promise<void> {
    const existing = await this.client.query(
      `select id from dashboard.source where tenant_id = $1 and source_key = $2`,
      [FIXTURE_TENANT_ID, sourceKey],
    );
    expect(
      existing.rows,
      `dashboard.source já tem ${sourceKey}: a suíte não sobrescreve linhas que não criou`,
    ).toHaveLength(0);
    await this.insertSource({
      id,
      tenant_id: FIXTURE_TENANT_ID,
      source_key: sourceKey,
      app,
      state: 'FRESCO',
      last_seen_at: lastSeenAt,
      last_read_at: lastSeenAt,
      acceptable_latency_minutes: null,
      heartbeat_contract: 'source.heartbeat',
      stale_since: null,
      hidden: false,
      version: 1,
    });
  }

  async insertIndicatorConfig(row: Row & { id: string }): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.indicator_config (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedIndicatorConfigIds.add(row.id);
  }

  async insertDuty(row: Row & { id: string }): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.duty (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedDutyIds.add(row.id);
  }

  async insertTransparencyAudit(row: Row & { id: string }): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.transparency_audit (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    this.ownedAuditIds.add(row.id);
  }

  /** Célula de projeção própria (`prescription_risk`, `portal_service_metrics`,
   * `duty_evidence`), limpa por `last_event_id` (namespace da suíte). */
  async insertProjectionCell(
    table:
      | 'prescription_risk'
      | 'portal_service_metrics'
      | 'duty_evidence'
      | 'monitor_projection_applied_event',
    row: Row & { last_event_id?: string; event_id?: string },
  ): Promise<void> {
    const columns = Object.keys(row);
    await this.client.query(
      `insert into dashboard.${table} (${columns.join(', ')}) values (${columns
        .map((_, i) => `$${i + 1}`)
        .join(', ')})`,
      columns.map((column) => row[column]),
    );
    const eventId = (row.last_event_id ?? row.event_id) as string | undefined;
    if (eventId) this.ownedProjectionEventIds.add(eventId);
  }

  ownProjectionEventId(eventId: string): void {
    this.ownedProjectionEventIds.add(eventId);
  }

  /** `indicator.connected` forçado (C-0002-10: "connected forçado true na
   * fixture do teste") e restaurado no `afterAll`; nunca outra coluna. */
  async forceConnected(
    indicatorCode: string,
    connected: boolean,
  ): Promise<void> {
    const before = await this.client.query<{ connected: boolean }>(
      `select connected from dashboard.indicator where tenant_id = $1 and code = $2`,
      [FIXTURE_TENANT_ID, indicatorCode],
    );
    const previous = before.rows[0]?.connected;
    expect(
      previous,
      `indicador ${indicatorCode} ausente no seed 80`,
    ).toBeDefined();
    await this.client.query(
      `update dashboard.indicator set connected = $3 where tenant_id = $1 and code = $2`,
      [FIXTURE_TENANT_ID, indicatorCode, connected],
    );
    this.restores.push(async () => {
      await this.client.query(
        `update dashboard.indicator set connected = $3 where tenant_id = $1 and code = $2`,
        [FIXTURE_TENANT_ID, indicatorCode, previous],
      );
    });
  }

  // ---- leituras -----------------------------------------------------------

  async alert(id: string): Promise<Row | null> {
    const result = await this.client.query<Row>(
      `select * from dashboard.alert where id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async trail(alertId: string): Promise<Row[]> {
    const result = await this.client.query<Row>(
      `select * from dashboard.alert_trail where alert_id = $1 order by seq`,
      [alertId],
    );
    return result.rows;
  }

  async timers(ownerId: string): Promise<Row[]> {
    const result = await this.client.query<Row>(
      `select * from dashboard.timer where owner_id = $1 order by started_at, code`,
      [ownerId],
    );
    return result.rows;
  }

  async timerById(id: string): Promise<Row | null> {
    const result = await this.client.query<Row>(
      `select * from dashboard.timer where id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async dutyCycle(id: string): Promise<Row | null> {
    const result = await this.client.query<Row>(
      `select * from dashboard.duty_cycle where id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async dutyCycleByPair(
    dutyCode: string,
    period: string,
    tenantId: string = FIXTURE_TENANT_ID,
  ): Promise<Row | null> {
    const result = await this.client.query<Row>(
      `select * from dashboard.duty_cycle where tenant_id = $1 and duty_code = $2 and period = $3`,
      [tenantId, dutyCode, period],
    );
    return result.rows[0] ?? null;
  }

  async dutyCyclePairs(
    tenantId: string = FIXTURE_TENANT_ID,
  ): Promise<Set<string>> {
    const result = await this.client.query<{
      duty_code: string;
      period: string;
    }>(
      `select duty_code, period from dashboard.duty_cycle where tenant_id = $1`,
      [tenantId],
    );
    return new Set(result.rows.map((row) => `${row.duty_code}|${row.period}`));
  }

  async source(
    sourceKey: string,
    tenantId: string = FIXTURE_TENANT_ID,
  ): Promise<Row | null> {
    const result = await this.client.query<Row>(
      `select * from dashboard.source where tenant_id = $1 and source_key = $2`,
      [tenantId, sourceKey],
    );
    return result.rows[0] ?? null;
  }

  async sourcesById(ids: readonly string[]): Promise<Row[]> {
    const result = await this.client.query<Row>(
      `select * from dashboard.source where id = any($1::uuid[]) order by id`,
      [ids],
    );
    return result.rows;
  }

  async alertsByObject(
    indicatorCode: string,
    objectKind: string,
    objectRef: string,
    tenantId: string = FIXTURE_TENANT_ID,
  ): Promise<Row[]> {
    const result = await this.client.query<Row>(
      `select * from dashboard.alert where tenant_id = $1 and indicator_code = $2 and object_kind = $3 and object_ref = $4 order by detected_at`,
      [tenantId, indicatorCode, objectKind, objectRef],
    );
    for (const row of result.rows) this.ownedAlertIds.add(row.id as string);
    return result.rows;
  }

  /** Eventos publicados pelo ciclo para um agregado (`aggregate_id` = id da
   * linha), na ordem de criação. */
  async outboxFor(
    aggregateId: string,
    tenantId: string = FIXTURE_TENANT_ID,
  ): Promise<OutboxRow[]> {
    const result = await this.client.query<OutboxRow>(
      `select * from integration.outbox where tenant_id = $1 and aggregate_id = $2 order by created_at, idempotency_key`,
      [tenantId, aggregateId],
    );
    for (const row of result.rows) this.ownedOutboxIds.add(row.id);
    return result.rows;
  }

  async outboxByTopic(
    topic: string,
    tenantId: string = FIXTURE_TENANT_ID,
  ): Promise<OutboxRow[]> {
    const result = await this.client.query<OutboxRow>(
      `select * from integration.outbox where tenant_id = $1 and topic = $2 order by created_at, idempotency_key`,
      [tenantId, topic],
    );
    return result.rows;
  }

  ownOutboxIds(ids: readonly string[]): void {
    for (const id of ids) this.ownedOutboxIds.add(id);
  }

  // ---- limpeza (método §4.16; A16: só por chave própria) ------------------

  async cleanup(): Promise<void> {
    for (const restore of this.restores.reverse()) await restore();
    await this.client.query(`select set_config('app.role', 'owner', false)`);
    const alertIds = [...this.ownedAlertIds];
    const cycleIds = [...this.ownedDutyCycleIds];
    const pairs = [...this.ownedDutyCyclePairs].map((pair) => {
      const [dutyCode, period] = pair.split('|');
      return { dutyCode: dutyCode!, period: period! };
    });
    // ciclos criados pelo serviço (ids gerados) → resolvidos pelo par
    for (const { dutyCode, period } of pairs) {
      const rows = await this.client.query<{ id: string }>(
        `select id from dashboard.duty_cycle where duty_code = $1 and period = $2`,
        [dutyCode, period],
      );
      for (const row of rows.rows) cycleIds.push(row.id);
    }
    // alertas nascidos do detector sobre objetos/ciclos da suíte
    if (cycleIds.length > 0) {
      const born = await this.client.query<{ id: string }>(
        `select id from dashboard.alert where object_kind = 'duty_cycle' and object_ref = any($1::text[])`,
        [cycleIds],
      );
      for (const row of born.rows) alertIds.push(row.id);
    }
    const ownerIds = [...alertIds, ...cycleIds];
    await this.client.query(
      `delete from dashboard.timer where id = any($1::uuid[]) or owner_id = any($2::uuid[])`,
      [[...this.ownedTimerIds], ownerIds],
    );
    await this.client.query(
      `delete from dashboard.alert_trail where alert_id = any($1::uuid[])`,
      [alertIds],
    );
    await this.client.query(
      `delete from dashboard.alert where id = any($1::uuid[])`,
      [alertIds],
    );
    await this.client.query(
      `delete from dashboard.duty_cycle where id = any($1::uuid[])`,
      [cycleIds],
    );
    await this.client.query(
      `delete from dashboard.duty where id = any($1::uuid[])`,
      [[...this.ownedDutyIds]],
    );
    await this.client.query(
      `delete from dashboard.indicator_config where id = any($1::uuid[])`,
      [[...this.ownedIndicatorConfigIds]],
    );
    await this.client.query(
      `delete from dashboard.transparency_audit where id = any($1::uuid[])`,
      [[...this.ownedAuditIds]],
    );
    const eventIds = [...this.ownedProjectionEventIds];
    for (const table of [
      'prescription_risk',
      'portal_service_metrics',
      'duty_evidence',
    ]) {
      await this.client.query(
        `delete from dashboard.${table} where last_event_id = any($1::uuid[])`,
        [eventIds],
      );
    }
    await this.client.query(
      `delete from dashboard.monitor_projection_applied_event where event_id = any($1::uuid[])`,
      [eventIds],
    );
    const sourceIds = await this.client.query<{ id: string }>(
      `select id from dashboard.source where source_key = any($1::text[])`,
      [[...this.ownedSourceKeys]],
    );
    const aggregateIds = [
      ...ownerIds,
      ...sourceIds.rows.map((row) => row.id),
      ...cycleIds,
    ];
    await this.client.query(
      `delete from integration.outbox where id = any($1::uuid[]) or (aggregate_type like 'dashboard.%' and aggregate_id = any($2::text[]))`,
      [[...this.ownedOutboxIds], aggregateIds],
    );
    await this.client.query(
      `delete from dashboard.source where source_key = any($1::text[])`,
      [[...this.ownedSourceKeys]],
    );
  }

  async end(): Promise<void> {
    await this.client.end();
  }
}

// ---------------------------------------------------------------------------
// (c) parâmetros vivos
// ---------------------------------------------------------------------------

/** Mesma consulta de `OpsParameterService.get` (versão vigente mais recente
 * de `ops.parameter`), como em `portal-projections-replay.integration.spec.ts`.
 * `override(matchKeySuffix, value)` substitui em memória o `value_json` de
 * uma chave pelo seu sufixo (C-0002-13; o sufixo não é uma chave
 * `dashboard.*`). */
export class LiveParameters {
  private readonly overrides: { suffix: string; value: unknown }[] = [];
  readonly reads: string[] = [];

  constructor(
    private readonly db: CycleDb,
    private readonly tenantId: string = FIXTURE_TENANT_ID,
  ) {}

  override(suffix: string, value: unknown): () => void {
    const entry = { suffix, value };
    this.overrides.push(entry);
    return () => {
      const index = this.overrides.indexOf(entry);
      if (index >= 0) this.overrides.splice(index, 1);
    };
  }

  async get(key: string): Promise<{
    key: string;
    value_json: unknown;
    source_pending: boolean;
  }> {
    this.reads.push(key);
    const read = (tenantId: string) =>
      this.db.client.query<{ value_json: unknown; source_pending: boolean }>(
        `select value_json, source_pending from ops.parameter
          where tenant_id = $1 and key = $2
            and effective_from <= current_date
            and (effective_to is null or effective_to >= current_date)
          order by effective_from desc, version desc limit 1`,
        [tenantId, key],
      );
    let result = await read(this.tenantId);
    // O segundo tenant de `auth.tenants` (C-0002-37/49) não tem catálogo
    // `dashboard.*` semeado em `ops.parameter`: o double lê o catálogo do
    // tenant das fixtures (mesmos valores vigentes) — só nos testes.
    if (!result.rows[0] && this.tenantId !== FIXTURE_TENANT_ID)
      result = await read(FIXTURE_TENANT_ID);
    if (!result.rows[0]) throw new Error(`Parameter ${key} not found`);
    const override = [...this.overrides]
      .reverse()
      .find((entry) => key.endsWith(entry.suffix));
    return {
      key,
      value_json: override ? override.value : result.rows[0].value_json,
      source_pending: result.rows[0].source_pending,
    };
  }

  asService(): OpsParameterService {
    return this as unknown as OpsParameterService;
  }
}

// ---------------------------------------------------------------------------
// (d) fábrica dos serviços do ciclo
// ---------------------------------------------------------------------------

export interface CycleServices {
  clock: Clock;
  calendar: Calendar;
  timers: DashboardClockService;
  notifier: DashboardNotifier;
  freshness: DashboardFreshnessService;
  alerts: DashboardAlertService;
  duties: DashboardDutyService;
  parameters: LiveParameters;
}

export function fixedClock(
  today: LocalDate,
  tz: string = FIXTURE_TENANT_TZ,
): FixedClock {
  return new FixedClock(today, tz);
}

export function calendar2026(): InMemoryCalendar {
  return new InMemoryCalendar(loadCalendar2026());
}

/** Constrói os serviços de §14.1 sobre `FixedClock(today)` e o calendário
 * 2026. Construtores fixados por §14.1: `DashboardClockService(clock,
 * calendar)`, `DashboardAlertService(clock, notifier, freshness, parameters)`,
 * `DashboardDutyService(clock, alerts)`. NÃO fixados (source_pending, um só
 * lugar): `DashboardNotifier(timers: DashboardClockService, parameters)` (arma
 * `T-DASH-ACK-*`, §6.4 item 3) e `DashboardFreshnessService(clock, parameters)`. */
export function buildCycle(
  db: CycleDb,
  today: LocalDate,
  options: { tz?: string; tenantId?: string } = {},
): CycleServices {
  const clock = fixedClock(today, options.tz ?? FIXTURE_TENANT_TZ);
  const calendar = calendar2026();
  const parameters = new LiveParameters(
    db,
    options.tenantId ?? FIXTURE_TENANT_ID,
  );
  const timers = new DashboardClockService(clock, calendar);
  const notifier = new DashboardNotifier(timers, parameters.asService()); // source_pending (§14.1 não fixa)
  const freshness = new DashboardFreshnessService(
    clock,
    parameters.asService(),
  ); // source_pending (§14.1 não fixa)
  const alerts = new DashboardAlertService(
    timers,
    notifier,
    freshness,
    parameters.asService(),
  );
  const duties = new DashboardDutyService(timers, alerts);
  return {
    clock,
    calendar,
    timers,
    notifier,
    freshness,
    alerts,
    duties,
    parameters,
  };
}

/** Discovery em memória (§13.3: "discovery em memória") e `deps` do sweeper.
 * A forma exata de `deps` não está em §14.1 (source_pending): `database.tx`
 * abre `begin`/`commit` na conexão da suíte e aplica `app.tenant_id` do alvo
 * corrente (o que `runWithRequestContext` + `Database.tx` fazem em produção). */
export class InMemorySweepDiscovery implements DashboardSweepDiscovery {
  constructor(private readonly targets: readonly DashboardSweepTarget[]) {}
  async listEligible(): Promise<readonly DashboardSweepTarget[]> {
    return this.targets;
  }
}

export function sweepTarget(
  tenantId: string = FIXTURE_TENANT_ID,
  timezone: string = FIXTURE_TENANT_TZ,
  actorId: string = USERS.integrationOperator,
): DashboardSweepTarget {
  return { tenantId, actorId, timezone };
}

export function buildSweeper(
  db: CycleDb,
  services: CycleServices,
  targets: readonly DashboardSweepTarget[],
): DashboardClockSweeper {
  let current: DashboardSweepTarget | undefined;
  const requestContext = {
    run<T>(context: { tenantId: string }, work: () => Promise<T>): Promise<T> {
      current = targets.find((target) => target.tenantId === context.tenantId);
      return work();
    },
  };
  const database = {
    async tx<T>(work: (tx: DashboardSqlTransaction) => Promise<T>): Promise<T> {
      await db.client.query('begin');
      try {
        if (current) {
          await db.client.query(
            `select set_config('app.tenant_id', $1, true)`,
            [current.tenantId],
          );
        }
        const result = await work(db.tx);
        await db.client.query('commit');
        return result;
      } catch (error) {
        await db.client.query('rollback');
        throw error;
      }
    },
  };
  return new DashboardClockSweeper({
    clock: services.clock,
    calendar: services.calendar,
    discovery: new InMemorySweepDiscovery(targets),
    database,
    requestContext,
    timers: services.timers,
    alerts: services.alerts,
    duties: services.duties,
    freshness: services.freshness,
    intervalMs: 0,
  } as never);
}

// ---------------------------------------------------------------------------
// contextos e atores
// ---------------------------------------------------------------------------

export type ActorKey =
  | 'raitManager'
  | 'raitAnalyst'
  | 'raitCoordinator'
  | 'dashOperator'
  | 'dashDutyOwner'
  | 'agencyAdmin'
  | 'auditor'
  | 'stranger'
  | 'system';

/** Atores do ciclo (§6.1: `owner` = principal com `alert.owner_role` entre os
 * papéis canônicos ou `principal.id = alert.owner_ref`; `dash-operator` =
 * papel `dash-operator`; `system` = runner/sweeper). Os ids são de
 * `00-fixtures-core.sql`; os papéis `dash-*` vêm do contexto (ver
 * `USERS`). `stranger` = `rait-secretary`, papel sem nenhuma ação sobre
 * alerta. */
export function actor(key: ActorKey): CycleContext['actor'] {
  switch (key) {
    case 'raitManager':
      return {
        kind: 'user',
        id: USERS.raitManager,
        role: ROLES.raitManager,
        roles: [ROLES.raitManager],
      };
    case 'raitAnalyst':
      return {
        kind: 'user',
        id: USERS.raitAnalyst,
        role: ROLES.raitAnalyst,
        roles: [ROLES.raitAnalyst],
      };
    case 'raitCoordinator':
      return {
        kind: 'user',
        id: USERS.raitCoordinator,
        role: ROLES.raitCoordinator,
        roles: [ROLES.raitAnalyst, ROLES.raitCoordinator],
      };
    case 'dashOperator':
      return {
        kind: 'user',
        id: USERS.integrationOperator,
        role: ROLES.dashOperator,
        roles: [ROLES.dashOperator],
      };
    case 'dashDutyOwner':
      return {
        kind: 'user',
        id: USERS.agencyAdmin,
        role: ROLES.dashDutyOwner,
        roles: [ROLES.dashDutyOwner],
      };
    case 'agencyAdmin':
      return {
        kind: 'user',
        id: USERS.agencyAdmin,
        role: ROLES.agencyAdmin,
        roles: [ROLES.agencyAdmin],
      };
    case 'auditor':
      return {
        kind: 'user',
        id: USERS.auditor,
        role: ROLES.auditor,
        roles: [ROLES.auditor],
      };
    case 'stranger':
      return {
        kind: 'user',
        id: USERS.raitSecretary,
        role: ROLES.raitSecretary,
        roles: [ROLES.raitSecretary],
      };
    case 'system':
      return {
        kind: 'system',
        id: USERS.integrationOperator,
        roles: [],
      };
  }
}

export function ctxFor(
  who: ActorKey,
  now: Date,
  options: { tenantId?: string; tz?: string; requestId?: string } = {},
): CycleContext {
  return {
    tenantId: options.tenantId ?? FIXTURE_TENANT_ID,
    tz: options.tz ?? FIXTURE_TENANT_TZ,
    actor: actor(who),
    now,
    requestId: options.requestId ?? `req-0083-${now.getTime().toString(16)}`,
  };
}

/** `If-Match` na gramática de `shared/errors/if-match.ts` (inteiro entre
 * aspas = `etagOf(version)`). */
export const ifMatchOf = (version: number | unknown): string =>
  `"${Number(version)}"`;

/** Asserção de erro tipado do catálogo (`DetranError`: `code`, `status`,
 * `context`) — nunca por conjunto de códigos (A15 de R-0014). */
export async function expectDashError(
  work: Promise<unknown>,
  code: string,
  status: number,
): Promise<Record<string, unknown>> {
  let caught: unknown;
  try {
    await work;
  } catch (error) {
    caught = error;
  }
  expect(
    caught,
    `esperado ${code} (${status}); nada foi lançado`,
  ).toBeDefined();
  const error = caught as { code?: string; status?: number; context?: unknown };
  expect(error.code).toBe(code);
  expect(error.status).toBe(status);
  return (error.context ?? {}) as Record<string, unknown>;
}

/** As duas fontes sem seed que o ciclo consulta em comandos/detector
 * (§8.3/§8.4) — inseridas `FRESCO` no `beforeAll` dos specs que comandam
 * alertas de `portal`/dever. */
export async function ensureSuiteSources(
  db: CycleDb,
  spec: string,
  seenAt: Date,
  idOf: (spec: string, n: number) => string,
): Promise<void> {
  await db.ensureFreshSuiteSource(
    idOf(spec, 0xf01),
    SUITE_SOURCE_KEYS.portalOutbox,
    'portal',
    seenAt,
  );
  await db.ensureFreshSuiteSource(
    idOf(spec, 0xf02),
    SUITE_SOURCE_KEYS.dashboardOwnState,
    'dashboard',
    seenAt,
  );
}
