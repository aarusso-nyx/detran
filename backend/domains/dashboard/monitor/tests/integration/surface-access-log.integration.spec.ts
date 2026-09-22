// CTG-0002 §2.2 (`AccessLog`, [RN-DASH-171]: append-only, `layer in
// (N0,N1,N2)`, `layer <> 'N2' or purpose is not null`, `row_count >= 0`) e
// §5.4 (toda leitura N2 grava finalidade; N3 nunca é logada como servida) —
// C-0002-83 e C-0002-85 na camada `integration` (TASK-0014): as invariantes
// do banco em que `DashboardLayerGate.record` (§5.4.4) se apoia, provadas
// contra `detran_r11` (DDL 1.1.0) como `role_app_backend` dentro de uma
// transação sempre revertida (padrão `rls.integration.spec.ts`: nada fica no
// banco). A linha é copiada de `00-fixtures-core.sql` (usuário Ana Lima) e o
// recurso segue a forma de §2.2 (`<método> <rota sem prefixo>`).
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

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const USER_REF = '00000000-0000-4000-8000-0000b0000001';

async function insertAccess(fields: {
  layer: string;
  purpose?: string | null;
  rowCount?: number;
  resource?: string;
}): Promise<string> {
  const result = await client.query<{ id: string }>(
    `insert into dashboard.access_log (tenant_id, user_ref, user_role, resource, filters_json, layer, row_count, purpose)
     values ($1, $2, 'dash-operator', $3, '{}'::jsonb, $4, $5, $6)
     returning id`,
    [
      TENANT_ID,
      USER_REF,
      fields.resource ?? 'GET alerts',
      fields.layer,
      fields.rowCount ?? 0,
      fields.purpose ?? null,
    ],
  );
  return result.rows[0]!.id;
}

beforeAll(() => client.connect());
beforeEach(async () => {
  await client.query('begin');
  await client.query('set local role role_app_backend');
  await client.query(`select set_config('app.tenant_id', $1, true)`, [
    TENANT_ID,
  ]);
  await client.query(`select set_config('app.actor_id', $1, true)`, [USER_REF]);
});
afterEach(() => client.query('rollback'));
afterAll(async () => {
  await client.query('reset role');
  await client.end();
});

describe('CTG-0002 §2.2/§5.4 — invariantes de dashboard.access_log (C-0002-83 [int])', () => {
  it('C-0002-83 — dado leitura N2 quando gravada com finalidade, camada e row_count então a linha existe com purpose, layer N2 e row_count', async () => {
    const id = await insertAccess({
      layer: 'N2',
      purpose: 'supervisao',
      rowCount: 3,
    });
    const stored = await client.query<{
      layer: string;
      purpose: string;
      row_count: number;
      user_role: string;
      resource: string;
    }>(
      `select layer, purpose, row_count, user_role, resource from dashboard.access_log where id = $1`,
      [id],
    );
    expect(stored.rows[0]).toEqual({
      layer: 'N2',
      purpose: 'supervisao',
      row_count: 3,
      user_role: 'dash-operator',
      resource: 'GET alerts',
    });
  });

  it('C-0002-83 — dado leitura N2 sem finalidade quando gravada então o check ck_dashboard_access_log_purpose_n2 rejeita', async () => {
    await expect(insertAccess({ layer: 'N2', purpose: null })).rejects.toThrow(
      /ck_dashboard_access_log_purpose_n2/,
    );
  });

  it('C-0002-83 — dado leitura N1 sem finalidade então aceita (purpose só é exigida em N2); row_count negativo então rejeitado', async () => {
    const id = await insertAccess({ layer: 'N1' });
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    await client.query('savepoint negative');
    await expect(insertAccess({ layer: 'N1', rowCount: -1 })).rejects.toThrow(
      /ck_dashboard_access_log_row_count/,
    );
    await client.query('rollback to savepoint negative');
  });

  it('C-0002-83 — dado uma linha gravada quando role_app_backend tenta update ou delete então é negado (append-only, [RN-DASH-171] verificação 1)', async () => {
    const id = await insertAccess({ layer: 'N1' });
    await client.query('savepoint immutable');
    await expect(
      client.query(
        `update dashboard.access_log set row_count = 99 where id = $1`,
        [id],
      ),
    ).rejects.toThrow(/permission denied/i);
    await client.query('rollback to savepoint immutable');
    await expect(
      client.query(`delete from dashboard.access_log where id = $1`, [id]),
    ).rejects.toThrow(/permission denied/i);
  });
});

describe('CTG-0002 §2.2/§5.4.3 — N3 nunca é logada como servida (C-0002-85 [int])', () => {
  it('C-0002-85 — dado camada N3 quando gravada em access_log então o check ck_dashboard_access_log_layer rejeita', async () => {
    await expect(
      insertAccess({ layer: 'N3', purpose: 'supervisao' }),
    ).rejects.toThrow(/ck_dashboard_access_log_layer/);
  });

  it('C-0002-85 — dado camada N3 em export_log então o check ck_dashboard_export_log_layer rejeita (nenhuma exportação N3, [RN-DASH-172] regra 4)', async () => {
    await expect(
      client.query(
        `insert into dashboard.export_log (tenant_id, user_ref, user_role, scope, filters_json, format, layer, purpose, row_count)
         values ($1, $2, 'agency-admin', 'alerts', '{}'::jsonb, 'csv', 'N3', 'supervisao', 0)`,
        [TENANT_ID, USER_REF],
      ),
    ).rejects.toThrow(/ck_dashboard_export_log_layer/);
  });
});
