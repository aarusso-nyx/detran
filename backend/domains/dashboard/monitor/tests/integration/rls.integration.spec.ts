// CTG-0001 §6 C-0001-03 (M9 c; ADR-0002) — RLS cruzada entre tenants, uma
// linha por tabela em cada uma das 20 tabelas de `80-dashboard.sql` com
// `tenant_id` (M4/M5), inserida como `role_app_backend` com `app.tenant_id`
// do tenant A e lida, na MESMA transação (o gatilho `enforce_tenant_id`
// exige `tenant_id` da linha = `app.tenant_id` da sessão no insert — duas
// transações separadas não provariam isolamento algum, já que a segunda
// nunca veria a primeira sem commit), com `app.tenant_id` trocado para o
// tenant B: nenhuma linha volta. Padrão de `tools/check-rls-smoke.ts` linhas
// 1-60 (leitura obrigatória: `begin` / `set local role role_app_backend` /
// `set_config(…, true)` local / `rollback`, nunca commit — a spec não deixa
// dado seu para trás). Cada `insert` usa só colunas obrigatórias (o resto
// fica nulo ou default) e valores dentro dos checks do DDL (CTG-0001 §2) —
// não é fixture canônica, é só prova de isolamento, por isso vive na spec e
// não em `81-fixtures-dashboard-state.sql`.
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r11',
});

const TENANT_A = randomUUID();
const TENANT_B = randomUUID();

async function setTenant(tenantId: string): Promise<void> {
  await client.query(`select set_config('app.tenant_id', $1, true)`, [
    tenantId,
  ]);
}

/** Uma linha mínima válida por tabela (CTG-0001 §2), só as colunas `not null`
 * sem default. `tenant_id` é sempre a primeira coluna, preenchida à parte. */
const MINIMAL_ROWS: Record<string, { columns: string[]; values: unknown[] }> = {
  alert: {
    columns: [
      'indicator_code',
      'track',
      'state',
      'severity',
      'block',
      'source_app',
      'object_kind',
      'object_ref',
      'object_layer',
      'owner_role',
    ],
    values: [
      'IND-DASH-301',
      'irregularity',
      'DETECTADO',
      'N1',
      'C',
      'portal',
      'manifestation',
      'rls-smoke',
      'N1',
      'ouvidor',
    ],
  },
  alert_trail: {
    columns: ['alert_id', 'seq', 'to_state', 'actor_kind'],
    values: [randomUUID(), 1, 'DETECTADO', 'system'],
  },
  duty: {
    columns: [
      'code',
      'title',
      'source_ref',
      'periodicity',
      'deadline_kind',
      'consequence',
      'rule_ref',
      'scope',
    ],
    values: [
      'DUTY-RLS',
      'rls-smoke',
      'rls-smoke',
      'rls-smoke',
      'continuous',
      'rls-smoke',
      'rls-smoke',
      'estadual',
    ],
  },
  duty_cycle: {
    columns: ['duty_code', 'period', 'state'],
    values: ['DUTY-RLS', '2026-09', 'JANELA_ABERTA'],
  },
  indicator: {
    columns: [
      'code',
      'block',
      'kind',
      'name',
      'question',
      'source_app',
      'source_ref',
      'threshold_rule',
      'owner_actor',
      'expected_action',
      'latency_band',
    ],
    values: [
      'IND-DASH-999',
      'D',
      'saude-tecnica',
      'rls-smoke',
      'rls-smoke',
      'todos',
      'rls-smoke',
      'rls-smoke',
      'rls-smoke',
      'rls-smoke',
      'minutos',
    ],
  },
  indicator_config: {
    columns: ['indicator_code', 'code', 'name', 'formula', 'granularity'],
    values: [
      'IND-DASH-301',
      'rls-smoke',
      'rls-smoke',
      'rls-smoke',
      'rls-smoke',
    ],
  },
  bi_panel: {
    columns: ['name', 'visibility_profile', 'config_json'],
    values: ['rls-smoke', 'N0', '{}'],
  },
  generated_report: {
    columns: ['user_ref', 'report_type', 'layer'],
    values: [randomUUID(), 'rls-smoke', 'N0'],
  },
  export_log: {
    columns: [
      'user_ref',
      'user_role',
      'scope',
      'filters_json',
      'format',
      'layer',
      'row_count',
    ],
    values: [randomUUID(), 'rls-smoke', 'rls-smoke', '{}', 'csv', 'N1', 0],
  },
  source: {
    columns: ['source_key', 'app', 'state'],
    values: ['rls-smoke', 'dashboard', 'INDISPONIVEL'],
  },
  transparency_audit: {
    columns: ['period', 'checklist_json', 'result', 'audited_by'],
    values: ['2026-09', '{}', 'rls-smoke', randomUUID()],
  },
  dataset: {
    columns: ['dataset_key', 'name'],
    values: ['rls-smoke', 'rls-smoke'],
  },
  monitor_projection_applied_event: {
    columns: [
      'projection_name',
      'event_id',
      'event_type',
      'event_schema_version',
      'aggregate_version',
      'occurred_at',
    ],
    values: [
      'dashboard.source_freshness',
      randomUUID(),
      'source.heartbeat',
      1,
      1,
      '2026-09-15T08:00:00.000Z',
    ],
  },
  prescription_risk: {
    columns: [
      'case_id',
      'clock_code',
      'indicator_code',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: [randomUUID(), 'A', 'IND-DASH-101', randomUUID(), 1, 1],
  },
  production: {
    columns: [
      'case_id',
      'period_start',
      'current_state',
      'state_changed_at',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: [
      randomUUID(),
      '2026-09-01',
      'EM_JULGAMENTO',
      '2026-09-15T08:00:00.000Z',
      randomUUID(),
      1,
      1,
    ],
  },
  integration_health: {
    columns: [
      'period_start',
      'system_key',
      'metric',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: [
      '2026-09-15',
      'teat-offline-sync',
      'receipt.applied',
      randomUUID(),
      1,
      1,
    ],
  },
  pec_deadlines: {
    columns: [
      'case_id',
      'indicator_code',
      'to_state',
      'changed_at',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: [
      randomUUID(),
      'IND-DASH-306',
      'DESIGNADO',
      '2026-09-15T08:00:00.000Z',
      randomUUID(),
      1,
      1,
    ],
  },
  teat_measures: {
    columns: [
      'indicator_code',
      'object_kind',
      'object_ref',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: [
      'IND-DASH-108',
      'administrative-measure',
      'rls-smoke',
      randomUUID(),
      1,
      1,
    ],
  },
  portal_service_metrics: {
    columns: [
      'indicator_code',
      'object_kind',
      'object_ref',
      'period_start',
      'opened_at',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: [
      'IND-DASH-301',
      'manifestation',
      'rls-smoke',
      '2026-09-01',
      '2026-09-15T08:00:00.000Z',
      randomUUID(),
      1,
      1,
    ],
  },
  duty_evidence: {
    columns: [
      'duty_code',
      'period',
      'state',
      'last_event_id',
      'event_schema_version',
      'aggregate_version',
    ],
    values: ['DUTY-01', '2026-09', 'JANELA_ABERTA', randomUUID(), 1, 1],
  },
};

const TABLES = Object.keys(MINIMAL_ROWS);

async function insertRow(tenantId: string, table: string): Promise<void> {
  const spec = MINIMAL_ROWS[table];
  if (!spec) throw new Error(`sem linha mínima definida para ${table}`);
  const columns = ['tenant_id', ...spec.columns];
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  await client.query(
    `insert into dashboard.${table} (${columns.join(', ')}) values (${placeholders})`,
    [tenantId, ...spec.values],
  );
}

async function countRows(table: string): Promise<number> {
  const result = await client.query<{ n: string }>(
    `select count(*)::text as n from dashboard.${table}`,
  );
  return Number(result.rows[0]?.n ?? -1);
}

beforeAll(() => client.connect());
beforeEach(async () => {
  await client.query('begin');
  await client.query('set local role role_app_backend');
});
afterEach(() => client.query('rollback'));
afterAll(async () => {
  await client.query('reset role');
  await client.end();
});

describe('dashboard.* — RLS cruzada entre tenants (CTG-0001 §6 C-0001-03, todas as 20 tabelas)', () => {
  it(`dado ${TABLES.length} tabelas com tenant_id em 80-dashboard.sql então MINIMAL_ROWS cobre exatamente as 20`, () => {
    expect(TABLES).toHaveLength(20);
  });

  for (const table of TABLES) {
    it(`dado uma linha do tenant A em dashboard.${table} inserida por role_app_backend quando app.tenant_id vira o do tenant B então a leitura volta vazia (e volta a 1 ao trocar de volta para o tenant A)`, async () => {
      await setTenant(TENANT_A);
      await insertRow(TENANT_A, table);
      expect(await countRows(table)).toBe(1);

      await setTenant(TENANT_B);
      expect(await countRows(table)).toBe(0);

      await setTenant(TENANT_A);
      expect(await countRows(table)).toBe(1);
    });
  }

  it('dado app.tenant_id do tenant A quando role_app_backend insere uma linha com tenant_id explícito do tenant B então é rejeitada (gatilho enforce_tenant_id, ADR-0002)', async () => {
    await setTenant(TENANT_A);
    await client.query('savepoint mismatch_check');
    let rejected = false;
    try {
      await insertRow(TENANT_B, 'source');
    } catch (error) {
      rejected = (error as { code?: string }).code === '42501';
    }
    await client.query('rollback to savepoint mismatch_check');
    expect(rejected).toBe(true);
  });
});
