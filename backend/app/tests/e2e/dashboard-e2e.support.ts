// Suporte compartilhado dos e2e do DASHBOARD de R-0011 CTG-0002 (TASK-0014,
// M25): `dashboard-policy`, `dashboard-layers`, `dashboard-exports`,
// `dashboard-catalog`, `dashboard-audit`, `dashboard-domain-boundary` e
// `dashboard-stream`. Não é um arquivo de teste (vitest só coleta
// `*.e2e.spec.ts`). Forma de `policy-routes.e2e.spec.ts` (tenant canônico
// `…a001`, `DETRAN_LOCAL_*`, `AppModule` importado depois do ambiente) e de
// `portal-e2e.support.ts` (app por arquivo, limpeza no `afterAll`, A18/§4.16).
//
// Fixtures: tenant `00000000-0000-7000-8000-00000000a001`, usuários de
// `00-fixtures-core.sql`, estado de `81-fixtures-dashboard-state.sql`
// (CTG-0001 §5.3) e catálogo de `80-fixtures-dashboard-catalog.sql` (§5.1/§5.2).
// Tudo o que a suíte cria fica no namespace `00000000-0000-7000-8000-000084……`
// (prompt TASK-0014 §Tarefa) e é apagado no `afterAll` — inclusive
// `access_log`, `export_log` e `integration.outbox`.
//
// Captura de SQL (C-0002-93, §1.3.1): `pg.Client.prototype.query` é
// interceptado em memória enquanto um comando roda — a mesma técnica do
// harness de projeções do CTG-0001 (tx observada, nunca `log_statement` do
// servidor). O `pg` do app (`@stynx-nyx/data`) e o desta suíte são o mesmo
// módulo (um único `pg@8` no store), logo o patch alcança o pool do app.
import { randomUUID } from 'node:crypto';
import http, { type IncomingMessage } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import pg from 'pg';

export const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
/** Ana Lima (`00-fixtures-core.sql`), o mesmo ator de `policy-routes.e2e.spec.ts`. */
export const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
/** `auth.tenants.short_name` do tenant de fixtures (`00-fixtures-core.sql`, §9.4). */
export const TENANT_SHORT_NAME = 'DETRAN-AM';

export const CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran_r11';

/** Ids de `81-fixtures-dashboard-state.sql` (CTG-0001 §5.3) usados pelas sondas. */
export const SEED = {
  alert: {
    detectadoIrregularity: '00000000-0000-7000-8000-000081000102',
    notificadoExtinction: '00000000-0000-7000-8000-000081000105',
    notificadoIrregularity: '00000000-0000-7000-8000-000081000106',
    reconhecidoExtinction: '00000000-0000-7000-8000-000081000107',
    reconhecidoIrregularity: '00000000-0000-7000-8000-000081000108',
    verificadoIrregularity: '00000000-0000-7000-8000-000081000112',
    escalonadoExtinction: '00000000-0000-7000-8000-000081000115',
    incidenteExtinction: '00000000-0000-7000-8000-000081000118',
  },
  duty: {
    duty01: '00000000-0000-7000-8000-000080001001',
  },
  dutyCycle: {
    duty01JanelaAberta2026_09: '00000000-0000-7000-8000-000081000301',
  },
  source: {
    raitOutbox: '00000000-0000-7000-8000-000081000401',
    teatOfflineSync: '00000000-0000-7000-8000-000081000402',
    pecDeadlines: '00000000-0000-7000-8000-000081000403',
  },
  exportPendingApproval: '00000000-0000-7000-8000-000081000501',
  /** `object_ref` do alerta de extinção (caso de `20-fixtures-rait.sql`). */
  raitCaseRef: '00000000-0000-7000-8000-000010000002',
} as const;

/** Namespace `0084…` da suíte (idempotência): `<grupo><nn>` com `nn` em 2 hex. */
export const LOCAL = {
  alert: (nn: string) => `00000000-0000-7000-8000-0000840001${nn}`,
  alertTrail: (nn: string) => `00000000-0000-7000-8000-0000840002${nn}`,
  indicatorConfig: (nn: string) => `00000000-0000-7000-8000-0000840003${nn}`,
  biPanel: (nn: string) => `00000000-0000-7000-8000-0000840004${nn}`,
  generatedReport: (nn: string) => `00000000-0000-7000-8000-0000840005${nn}`,
  dataset: (nn: string) => `00000000-0000-7000-8000-0000840006${nn}`,
  prescriptionRisk: (nn: string) => `00000000-0000-7000-8000-0000840007${nn}`,
  sourceEvent: (nn: string) => `00000000-0000-7000-8000-0000840008${nn}`,
  pool: (nn: string) => `00000000-0000-7000-8000-0000840009${nn}`,
  caseId: (nn: string) => `00000000-0000-7000-8000-000084000a${nn}`,
  missing: (nn: string) => `00000000-0000-7000-8000-000084000f${nn}`,
} as const;

/** Prefixo de nomes/códigos criados pela suíte (limpeza por `like`). */
export const LOCAL_PREFIX = 'e2e-0084-';

/** Tokens de finalidade N2 (H.54/OD-D08; CTG-0002 §5.4 `DASHBOARD_PURPOSES_N2_H54`). */
export const PURPOSES_N2_H54 = [
  'supervisao',
  'auditoria',
  'apuracao',
  'resposta-ao-titular',
  'estatistica',
  'suporte',
] as const;

/** Os três `dataset_key` de dados abertos declarados (CTG-0002 §10.6, OD-D53). */
export const DATASET_KEYS = {
  alertsBySeverityMonth: 'alerts-by-severity-month',
  dutiesComplianceYear: 'duties-compliance-year',
  sourcesAvailabilityMonth: 'sources-availability-month',
} as const;

/** `topic('dashboard', <agregado>, <verbo>)` (§1.3.8): nunca literal `dashboard.<x>.<y>`. */
export function topic(domain: string, aggregate: string, verb: string): string {
  return [domain, aggregate, verb].join('.');
}
export const TOPICS = {
  alertChanged: topic('dashboard', 'alert', 'changed'),
  dutyChanged: topic('dashboard', 'duty', 'changed'),
  sourceFreshness: topic('dashboard', 'source', 'freshness'),
  exportRegistered: topic('dashboard', 'export', 'registered'),
  reportChanged: topic('dashboard', 'report', 'changed'),
  indicatorConfigChanged: topic('dashboard', 'indicator-config', 'changed'),
} as const;

export function newClient(): pg.Client {
  return new pg.Client({ connectionString: CONNECTION_STRING });
}

export async function asOwner(client: pg.Client): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  await client.query(`select set_config('app.actor_id', $1, false)`, [
    ACTOR_ID,
  ]);
}

/** `now()` do banco no início da suíte: baliza da limpeza (`>= since`). */
export async function dbNow(client: pg.Client): Promise<string> {
  const result = await client.query<{ now: string }>(
    `select now()::text as now`,
  );
  return result.rows[0]!.now;
}

/**
 * Lê um parâmetro `dashboard.*` de `ops.parameter` (seed 05) pelo SUFIXO da
 * chave — nunca o literal da chave (regra 8 do prompt; `verify:parameter-catalogue`).
 * Devolve a chave completa e o `value_json` da linha vigente do tenant.
 */
export async function dashboardParameter(
  client: pg.Client,
  keySuffix: string,
): Promise<{ key: string; value: unknown }> {
  await asOwner(client);
  const result = await client.query<{ key: string; value_json: unknown }>(
    `select key, value_json from ops.parameter
      where tenant_id = $1 and surface = 'dashboard' and key like $2
        and effective_from <= current_date
        and (effective_to is null or effective_to >= current_date)
      order by effective_from desc, version desc
      limit 1`,
    [TENANT_ID, `%${keySuffix}`],
  );
  const row = result.rows[0];
  if (!row) throw new Error(`ops.parameter sem linha para *${keySuffix}`);
  return { key: row.key, value: row.value_json };
}

/** Regra numérica declarada de CTG-0002 §1.3.7 (número inicial de uma string). */
export function numericParameter(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/^\s*(\d+(?:[.,]\d+)?)/);
    if (match) return Number(match[1]!.replace(',', '.'));
  }
  throw new Error(`parâmetro sem número legível: ${JSON.stringify(value)}`);
}

export function headers(
  role: string,
  extra: Record<string, string> = {},
): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': randomUUID(),
    ...extra,
  };
}

/** Cabeçalhos sem `Idempotency-Key` (C-0002-87: ausente → 400 da plataforma). */
export function headersWithoutIdempotencyKey(
  role: string,
  extra: Record<string, string> = {},
): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    ...extra,
  };
}

const previousEnv: Record<string, string | undefined> = {};

/**
 * App real (`AppModule.forRoot()`), um por arquivo (A18). O ambiente é fixado
 * ANTES do `import()` de `app.module.js` porque `detran-runtime.ts` lê
 * `DETRAN_LOCAL_TENANT_ID` na carga do módulo (padrão `policy-routes.e2e.spec.ts`).
 */
export async function createDashboardApp(
  overrides: Array<{ token: unknown; value: unknown }> = [],
): Promise<INestApplication> {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'technical-admin';

  const { Test } = await import('@nestjs/testing');
  const { AppModule } = await import('../../src/app.module.js');
  let builder = Test.createTestingModule({ imports: [AppModule.forRoot()] });
  for (const override of overrides) {
    builder = builder
      .overrideProvider(override.token as never)
      .useValue(override.value);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({
    logger: false,
    abortOnError: false,
  });
  await app.init();
  return app;
}

export function restoreEnv(): void {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

/** `import()` dinâmico de módulos que só existem depois de TASK-0013. */
export const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

// ---------------------------------------------------------------------------
// Fixtures do namespace 0084 (copiadas das canônicas; nunca dados inventados)
// ---------------------------------------------------------------------------

/**
 * Copia um `alert` de `81-fixtures-dashboard-state.sql` para um id do
 * namespace 0084 (com a linha seq 1 da trilha), para que os comandos mutem a
 * cópia e nunca a fixture canônica. `version` copiado (1).
 */
export async function copyAlertFixture(
  client: pg.Client,
  seedId: string,
  nn: string,
): Promise<string> {
  await asOwner(client);
  const id = LOCAL.alert(nn);
  await client.query(
    `insert into dashboard.alert (
       id, tenant_id, indicator_code, track, state, severity, block, source_app,
       object_kind, object_ref, object_layer, owner_role, governing_clock,
       next_milestone_at, ceiling_on, detected_at, classified_at, notified_at,
       acknowledged_at, treating_at, verified_at, closed_at, escalated_at,
       critical_at, incident_at, ack_channel, escalation_level, incident_ref, version
     )
     select $2, tenant_id, indicator_code, track, state, severity, block, source_app,
       object_kind, object_ref, object_layer, owner_role, governing_clock,
       next_milestone_at, ceiling_on, detected_at, classified_at, notified_at,
       acknowledged_at, treating_at, verified_at, closed_at, escalated_at,
       critical_at, incident_at, ack_channel, escalation_level, incident_ref, version
     from dashboard.alert where id = $1 and tenant_id = $3
     on conflict (id) do update set
       state = excluded.state, severity = excluded.severity, version = excluded.version,
       acknowledged_at = excluded.acknowledged_at, treating_at = excluded.treating_at,
       verified_at = excluded.verified_at, closed_at = excluded.closed_at,
       ack_channel = excluded.ack_channel`,
    [seedId, id, TENANT_ID],
  );
  await client.query(
    `delete from dashboard.alert_trail where tenant_id = $1 and alert_id = $2`,
    [TENANT_ID, id],
  );
  await client.query(
    `insert into dashboard.alert_trail (id, tenant_id, alert_id, seq, from_state, to_state, occurred_at, actor_kind, actor_ref)
     select $3, tenant_id, $2, seq, from_state, to_state, occurred_at, actor_kind, actor_ref
       from dashboard.alert_trail where tenant_id = $4 and alert_id = $1 and seq = 1
     on conflict (id) do nothing`,
    [seedId, id, LOCAL.alertTrail(nn), TENANT_ID],
  );
  return id;
}

export async function insertIndicatorConfig(
  client: pg.Client,
  nn: string,
  indicatorCode: string,
  fields: {
    thresholdJson?: unknown;
    status?: 'draft' | 'published';
    acceptableLatencyMinutes?: number | null;
  } = {},
): Promise<string> {
  await asOwner(client);
  const id = LOCAL.indicatorConfig(nn);
  const status = fields.status ?? 'draft';
  await client.query(
    `insert into dashboard.indicator_config (
       id, tenant_id, indicator_code, code, name, description, formula, granularity,
       threshold_json, acceptable_latency_minutes, status, published_at, published_by, version
     ) values ($1, $2, $3, $4, $5, 'fixture e2e TASK-0014', 'fixture e2e (sem fórmula)', 'fixture e2e',
       $6::jsonb, $7, $8::text, case when $8::text = 'published' then now() else null end,
       case when $8::text = 'published' then $9::uuid else null end, 1)
     on conflict (id) do update set
       threshold_json = excluded.threshold_json, status = excluded.status,
       acceptable_latency_minutes = excluded.acceptable_latency_minutes,
       published_at = excluded.published_at, published_by = excluded.published_by, version = 1`,
    [
      id,
      TENANT_ID,
      indicatorCode,
      `${LOCAL_PREFIX}${indicatorCode.toLowerCase()}-${nn}`,
      `${LOCAL_PREFIX}config ${indicatorCode} ${nn}`,
      fields.thresholdJson === undefined
        ? null
        : JSON.stringify(fields.thresholdJson),
      fields.acceptableLatencyMinutes ?? null,
      status,
      ACTOR_ID,
    ],
  );
  return id;
}

export async function insertBiPanel(
  client: pg.Client,
  nn: string,
  visibilityProfile: 'N0' | 'N1' | 'N2',
  status: 'draft' | 'published' = 'draft',
): Promise<string> {
  await asOwner(client);
  const id = LOCAL.biPanel(nn);
  await client.query(
    `insert into dashboard.bi_panel (id, tenant_id, name, description, visibility_profile, config_json, status, published_at, published_by, version)
     values ($1, $2, $3, 'fixture e2e TASK-0014', $4, '{}'::jsonb, $5::text,
       case when $5::text = 'published' then now() else null end,
       case when $5::text = 'published' then $6::uuid else null end, 1)
     on conflict (id) do update set visibility_profile = excluded.visibility_profile,
       status = excluded.status, published_at = excluded.published_at,
       published_by = excluded.published_by, version = 1, config_json = '{}'::jsonb`,
    [
      id,
      TENANT_ID,
      `${LOCAL_PREFIX}panel-${visibilityProfile}-${nn}`,
      visibilityProfile,
      status,
      ACTOR_ID,
    ],
  );
  return id;
}

export async function insertGeneratedReport(
  client: pg.Client,
  nn: string,
  fields: { layer?: 'N0' | 'N1' | 'N2'; reportType?: string } = {},
): Promise<string> {
  await asOwner(client);
  const id = LOCAL.generatedReport(nn);
  await client.query(
    `insert into dashboard.generated_report (id, tenant_id, user_ref, report_type, filters_json, layer, purpose, status, version)
     values ($1, $2, $3, $4, '{}'::jsonb, $5, null, 'processing', 1)
     on conflict (id) do update set status = 'processing', version = 1,
       file_uri = null, file_hash = null, watermark = null, failure_code = null, completed_at = null`,
    [
      id,
      TENANT_ID,
      ACTOR_ID,
      fields.reportType ?? 'alerts',
      fields.layer ?? 'N0',
    ],
  );
  return id;
}

/**
 * `dataset` publicado (P2, os sete `req_*`, `suppression_applied`,
 * `promoted_*` — exigidos pelos checks de DDL 80) ou não publicado
 * (`published_at` nulo). Chaves de `DATASET_KEYS` (OD-D53).
 */
export async function insertDataset(
  client: pg.Client,
  nn: string,
  datasetKey: string,
  published: boolean,
): Promise<string> {
  await asOwner(client);
  const id = LOCAL.dataset(nn);
  await client.query(
    `insert into dashboard.dataset (
       id, tenant_id, dataset_key, name, description, classification,
       req_open_format, req_machine_readable, req_data_dictionary, req_periodic_update_history,
       req_authenticity_integrity, req_searchable, req_accessible,
       license, periodicity, quality_note, changelog_json, suppression_applied,
       promoted_by, promoted_at, promotion_basis, published_at, version
     ) values ($1, $2, $3, $4, 'fixture e2e TASK-0014', 'P2',
       true, true, true, true, true, true, true,
       'CC-BY-4.0', 'monthly', null, '[]'::jsonb, true,
       $5, now(), 'fixture e2e (CTG-0002 §10.6)', case when $6::boolean then now() else null end, 1)
     on conflict (id) do update set published_at = excluded.published_at, dataset_key = excluded.dataset_key`,
    [
      id,
      TENANT_ID,
      datasetKey,
      `${LOCAL_PREFIX}${datasetKey}`,
      ACTOR_ID,
      published,
    ],
  );
  return id;
}

/**
 * Células de `prescription_risk` (projeção de IND-DASH-101, CTG-0001 §4.1.1)
 * para `comparisons?dimension=pool` (§10.2): `count` = número de casos por
 * `pool_id` × `flag`. Flags = tokens de §10.1 (`n1`, `n2`, `critico`, …).
 */
export async function insertPrescriptionRiskCells(
  client: pg.Client,
  cells: Array<{ pool: string; flag: string; count: number }>,
): Promise<string[]> {
  await asOwner(client);
  const ids: string[] = [];
  let sequence = 0;
  for (const cell of cells) {
    for (let index = 0; index < cell.count; index += 1) {
      sequence += 1;
      const nn = sequence.toString(16).padStart(2, '0');
      const id = LOCAL.prescriptionRisk(nn);
      await client.query(
        `insert into dashboard.prescription_risk (
           id, tenant_id, case_id, clock_code, indicator_code, flag, pool_id,
           last_event_id, event_schema_version, aggregate_version
         ) values ($1, $2, $3, 'A', 'IND-DASH-101', $4, $5, $6, 1, 1)
         on conflict (id) do update set flag = excluded.flag, pool_id = excluded.pool_id`,
        [
          id,
          TENANT_ID,
          LOCAL.caseId(nn),
          cell.flag,
          cell.pool,
          LOCAL.sourceEvent(nn),
        ],
      );
      ids.push(id);
    }
  }
  return ids;
}

/** Linha da outbox no envelope de `rait-events-sse-contract.md` §1 (CTG-0002 §12). */
export async function insertOutboxRow(
  client: pg.Client,
  eventTopic: string,
  domainEvent: string,
  aggregate: { kind: string; id: string; version: number },
  data: Record<string, unknown>,
  createdAt?: string,
): Promise<string> {
  await asOwner(client);
  const envelope = {
    type: eventTopic,
    domainEvent,
    version: 1,
    occurredAt: new Date().toISOString(),
    tenantId: TENANT_ID,
    actor: { kind: 'user', id: ACTOR_ID },
    correlationId: randomUUID(),
    aggregate,
    data,
  };
  const result = await client.query<{ id: string }>(
    `with new_row as (select gen_random_uuid() as id)
     insert into integration.outbox (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
     select new_row.id, $1, $2, $3, $4, jsonb_set($5::jsonb, '{id}', to_jsonb(new_row.id::text)), $6, 'pending', coalesce($7::timestamptz, now()), coalesce($7::timestamptz, now())
       from new_row
     returning id`,
    [
      TENANT_ID,
      eventTopic,
      `dashboard.${aggregate.kind}`,
      aggregate.id,
      JSON.stringify(envelope),
      `${eventTopic}:${aggregate.id}:${aggregate.version}:${randomUUID()}`,
      createdAt ?? null,
    ],
  );
  return result.rows[0]!.id;
}

export async function outboxRows(
  client: pg.Client,
  eventTopic: string,
  aggregateId: string,
): Promise<Array<{ id: string; payload: Record<string, unknown> }>> {
  await asOwner(client);
  const result = await client.query<{
    id: string;
    payload: Record<string, unknown>;
  }>(
    `select id, payload from integration.outbox
      where tenant_id = $1 and topic = $2 and aggregate_id = $3
      order by created_at, id`,
    [TENANT_ID, eventTopic, aggregateId],
  );
  return result.rows;
}

export interface AccessLogRow {
  id: string;
  user_ref: string;
  user_role: string;
  resource: string;
  filters_json: Record<string, unknown>;
  layer: string;
  row_count: number;
  purpose: string | null;
  export_id: string | null;
}

export async function accessLogRows(
  client: pg.Client,
  since: string,
  where: { resource?: string; exportId?: string } = {},
): Promise<AccessLogRow[]> {
  await asOwner(client);
  const result = await client.query<AccessLogRow>(
    `select id, user_ref, user_role, resource, filters_json, layer, row_count, purpose, export_id
       from dashboard.access_log
      where tenant_id = $1 and at >= $2::timestamptz
        and ($3::text is null or resource = $3)
        and ($4::uuid is null or export_id = $4)
      order by at desc, id desc`,
    [TENANT_ID, since, where.resource ?? null, where.exportId ?? null],
  );
  return result.rows;
}

/**
 * Limpa tudo o que a suíte criou desde `since` (idempotência, §4.16):
 * namespace 0084, prefixo `e2e-0084-`, linhas datadas depois de `since`
 * (`access_log`, `export_log` sem a fixture 0501, `transparency_audit`,
 * `timer`, outbox `dashboard.*`) — nunca as fixtures do seed 80/81.
 */
export async function resetDashboardE2eRows(
  client: pg.Client,
  since: string,
): Promise<void> {
  await asOwner(client);
  const namespace = '00000000-0000-7000-8000-000084%';
  await client.query(
    `delete from dashboard.access_log where tenant_id = $1 and at >= $2::timestamptz`,
    [TENANT_ID, since],
  );
  await client.query(
    `delete from dashboard.export_log where tenant_id = $1 and id <> $3 and requested_at >= $2::timestamptz`,
    [TENANT_ID, since, SEED.exportPendingApproval],
  );
  await client.query(
    `delete from dashboard.generated_report where tenant_id = $1 and (id::text like $2 or requested_at >= $3::timestamptz)`,
    [TENANT_ID, namespace, since],
  );
  await client.query(
    `delete from dashboard.bi_panel where tenant_id = $1 and (id::text like $2 or name like $3)`,
    [TENANT_ID, namespace, `${LOCAL_PREFIX}%`],
  );
  await client.query(
    `delete from dashboard.indicator_config where tenant_id = $1 and (id::text like $2 or code like $3)`,
    [TENANT_ID, namespace, `${LOCAL_PREFIX}%`],
  );
  await client.query(
    `delete from dashboard.transparency_audit where tenant_id = $1 and audited_at >= $2::timestamptz`,
    [TENANT_ID, since],
  );
  await client.query(
    `delete from dashboard.dataset where tenant_id = $1 and id::text like $2`,
    [TENANT_ID, namespace],
  );
  await client.query(
    `delete from dashboard.prescription_risk where tenant_id = $1 and id::text like $2`,
    [TENANT_ID, namespace],
  );
  await client.query(
    `delete from dashboard.timer where tenant_id = $1 and (owner_id::text like $2 or created_at >= $3::timestamptz)`,
    [TENANT_ID, namespace, since],
  );
  await client.query(
    `delete from dashboard.alert_trail where tenant_id = $1 and (alert_id::text like $2 or id::text like $2)`,
    [TENANT_ID, namespace],
  );
  await client.query(
    `delete from dashboard.alert where tenant_id = $1 and id::text like $2`,
    [TENANT_ID, namespace],
  );
  await client.query(
    `delete from integration.outbox where tenant_id = $1 and topic like 'dashboard.%' and (created_at >= $2::timestamptz or aggregate_id::text like $3)`,
    [TENANT_ID, since, namespace],
  );
}

// ---------------------------------------------------------------------------
// Captura de SQL (C-0002-93, C-0002-100)
// ---------------------------------------------------------------------------

type QueryFn = (...args: unknown[]) => unknown;

function statementText(argument: unknown): string {
  if (typeof argument === 'string') return argument;
  if (argument && typeof argument === 'object' && 'text' in argument) {
    const text = (argument as { text?: unknown }).text;
    if (typeof text === 'string') return text;
  }
  return '';
}

/** Alvos de escrita (`schema.tabela`) de uma instrução; `?.tabela` se não qualificada. */
export function writeTargets(sql: string): string[] {
  const targets: string[] = [];
  const pattern =
    /\b(?:insert\s+into|update|delete\s+from)\s+(?:("?)([a-z_][a-z0-9_]*)\1\s*\.\s*)?("?)([a-z_][a-z0-9_]*)\3/gi;
  for (const match of sql.matchAll(pattern)) {
    const schema = match[2];
    const table = match[4]!;
    if (!schema && table.toLowerCase() === 'set') continue;
    targets.push(`${schema ?? '?'}.${table}`.toLowerCase());
  }
  return targets;
}

export class SqlCapture {
  readonly statements: string[] = [];
  private original: QueryFn | undefined;
  private active = false;

  constructor(private readonly excluded: pg.Client) {}

  start(): void {
    this.statements.length = 0;
    this.active = true;
    if (this.original) return;
    const capture = this;
    const prototype = pg.Client.prototype as unknown as { query: QueryFn };
    this.original = prototype.query;
    const original = this.original;
    prototype.query = function patchedQuery(
      this: unknown,
      ...args: unknown[]
    ): unknown {
      if (capture.active && this !== capture.excluded) {
        const text = statementText(args[0]);
        if (text) capture.statements.push(text);
      }
      return original.apply(this, args);
    };
  }

  pause(): void {
    this.active = false;
  }

  stop(): void {
    this.active = false;
    if (!this.original) return;
    (pg.Client.prototype as unknown as { query: QueryFn }).query =
      this.original;
    this.original = undefined;
  }
}

// ---------------------------------------------------------------------------
// SSE (C-0002-100; forma de portal-stream.e2e.spec.ts)
// ---------------------------------------------------------------------------

export interface SseEvent {
  id?: string;
  event?: string;
  data?: string;
}

export interface OpenStream {
  status: () => number;
  headers: () => Record<string, string | string[] | undefined>;
  events: SseEvent[];
  comments: string[];
  opened: Promise<void>;
  waitFor: (predicate: () => boolean, timeoutMs?: number) => Promise<void>;
  close: () => void;
}

export function openStream(
  port: number,
  path: string,
  requestHeaders: Record<string, string>,
  openRequests: http.ClientRequest[],
): OpenStream {
  const events: SseEvent[] = [];
  const comments: string[] = [];
  let status = 0;
  let responseHeaders: Record<string, string | string[] | undefined> = {};
  let resolveOpened!: () => void;
  const opened = new Promise<void>((resolve) => {
    resolveOpened = resolve;
  });
  const req = http.get(
    { host: '127.0.0.1', port, path, headers: requestHeaders },
    (res: IncomingMessage) => {
      status = res.statusCode ?? 0;
      responseHeaders = res.headers;
      let buffer = '';
      let current: SseEvent = {};
      if (status !== 200) {
        resolveOpened();
        res.resume();
        return;
      }
      res.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.replace(/\r$/, '');
          if (trimmed === '') {
            if (Object.keys(current).length > 0) events.push(current);
            current = {};
            continue;
          }
          if (trimmed.startsWith(':')) {
            comments.push(trimmed);
            if (trimmed === ': connected') resolveOpened();
            continue;
          }
          const separator = trimmed.indexOf(':');
          if (separator === -1) continue;
          const field = trimmed.slice(0, separator);
          const value = trimmed.slice(separator + 1).trimStart();
          if (field === 'id') current.id = value;
          else if (field === 'event') current.event = value;
          else if (field === 'data') current.data = value;
        }
      });
      res.on('end', resolveOpened);
      res.on('error', resolveOpened);
    },
  );
  req.on('error', (error) => {
    if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET') throw error;
  });
  openRequests.push(req);
  return {
    status: () => status,
    headers: () => responseHeaders,
    events,
    comments,
    opened,
    waitFor: (predicate, timeoutMs = 3000) =>
      new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = () => {
          if (predicate()) return resolve();
          if (Date.now() - startedAt > timeoutMs)
            return reject(new Error('stream: condição não satisfeita a tempo'));
          setTimeout(check, 25);
        };
        check();
      }),
    close: () => req.destroy(),
  };
}

/** Percorre um objeto JSON e devolve os nós que satisfazem o predicado. */
export function collectNodes(
  value: unknown,
  predicate: (node: Record<string, unknown>) => boolean,
): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (node && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      if (predicate(record)) found.push(record);
      for (const child of Object.values(record)) visit(child);
    }
  };
  visit(value);
  return found;
}

/** Forma exata de `meta.freshness` (CTG-0002 §5.5). */
export const FRESHNESS_KEYS = [
  'acceptableLatency',
  'asOf',
  'source',
  'state',
] as const;
export const FRESHNESS_STATES = [
  'FRESCO',
  'ATRASADO',
  'INDISPONIVEL',
  'DESATUALIZADO_MARCADO',
] as const;
