// CTG-0002 §9.5 e §1.3.7 contra `detran_r11` — C-0002-89 e C-0002-92 na
// camada `integration` (TASK-0014): `cellThresholdOf` lê a linha REAL de
// `ops.parameter` (seed 05, prosa "10 (…)", OD-D31) e `suppress` recebe as
// células REAIS agregadas de `dashboard.prescription_risk` (`pool_id` × `flag`,
// §10.2) inseridas por esta spec no namespace `0084…` e apagadas no
// `afterAll` (§4.16). A chave do parâmetro nunca aparece literal (sufixo em
// `like`, regra 8). Fica vermelho (Cannot find module) até TASK-0013 criar
// `src/handwritten/surface/suppression.ts`.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  cellThresholdOf,
  suppress,
} from '../../src/handwritten/surface/suppression.js';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r11',
});

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const NAMESPACE = '00000000-0000-7000-8000-000084%';
const id = (group: string, nn: number) =>
  `00000000-0000-7000-8000-000084${group}${nn.toString(16).padStart(2, '0')}`;
const POOL_A = id('0009', 0x11);
const POOL_B = id('0009', 0x12);

interface SuppressedCell {
  key: string;
  count: number | null;
  suppression?: 'primary' | 'secondary';
}
interface SuppressResult {
  rows: SuppressedCell[];
  suppressedCells: number;
  total: number | null;
  totalSuppressed: boolean;
}

interface ParameterRow {
  key: string;
  value_json: unknown;
}
let parameterRow: ParameterRow;
let threshold = 0;

/** Células (pool × flag) com contagens relativas ao limiar lido do banco. */
function plannedCells(
  T: number,
): Array<{ pool: string; flag: string; count: number }> {
  return [
    { pool: POOL_A, flag: 'n1', count: Math.max(1, T - 7) },
    { pool: POOL_A, flag: 'n2', count: T + 2 },
    { pool: POOL_A, flag: 'critico', count: T + 5 },
    { pool: POOL_B, flag: 'n1', count: T + 6 },
    { pool: POOL_B, flag: 'n2', count: T + 8 },
  ];
}

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  const parameter = await client.query<ParameterRow>(
    `select key, value_json from ops.parameter
      where tenant_id = $1 and surface = 'dashboard' and key like '%cell_threshold'
        and effective_from <= current_date
        and (effective_to is null or effective_to >= current_date)
      order by effective_from desc, version desc limit 1`,
    [TENANT_ID],
  );
  parameterRow = parameter.rows[0]!;
  expect(parameterRow).toBeDefined();
  threshold = cellThresholdOf({
    ...parameterRow,
    value: parameterRow.value_json,
  });

  await client.query(
    `delete from dashboard.prescription_risk where tenant_id = $1 and id::text like $2`,
    [TENANT_ID, NAMESPACE],
  );
  let sequence = 0;
  for (const cell of plannedCells(threshold)) {
    for (let index = 0; index < cell.count; index += 1) {
      sequence += 1;
      await client.query(
        `insert into dashboard.prescription_risk (
           id, tenant_id, case_id, clock_code, indicator_code, flag, pool_id,
           last_event_id, event_schema_version, aggregate_version
         ) values ($1, $2, $3, 'A', 'IND-DASH-101', $4, $5, $6, 1, 1)`,
        [
          id('0007', sequence),
          TENANT_ID,
          id('000a', sequence),
          cell.flag,
          cell.pool,
          id('0008', sequence),
        ],
      );
    }
  }
}, 60_000);

afterAll(async () => {
  await client.query(
    `delete from dashboard.prescription_risk where tenant_id = $1 and id::text like $2`,
    [TENANT_ID, NAMESPACE],
  );
  await client.end();
});

describe('CTG-0002 §1.3.7 — cellThresholdOf sobre ops.parameter real (C-0002-92 [int])', () => {
  it('C-0002-92 — dado a linha vigente de …cell_threshold do seed 05 (prosa) então cellThresholdOf devolve o número inicial (10, DT-029)', () => {
    expect(typeof parameterRow.value_json).toBe('string');
    expect(threshold).toBe(10);
  });

  it('C-0002-92 — dado a mesma linha com value_json ilegível (em memória, o banco não é alterado) então DASH.CELL_THRESHOLD_UNDEFINED com parameterKey = a chave real', () => {
    expect(() =>
      cellThresholdOf({
        ...parameterRow,
        value_json: 'indefinido',
        value: 'indefinido',
      }),
    ).toThrowError(
      expect.objectContaining({
        code: 'DASH.CELL_THRESHOLD_UNDEFINED',
        status: 422,
        context: { parameterKey: parameterRow.key },
      }),
    );
  });
});

describe('CTG-0002 §9.5 — suppress sobre células reais de prescription_risk (C-0002-89 [int])', () => {
  it('C-0002-89 — dado as células pool × flag agregadas em SQL quando suppress(rows, T) então a célula < T é primária, a menor ≥ T do grupo é secundária, o total do grupo é nulo e nada sai como zero', async () => {
    const aggregated = await client.query<{
      pool_id: string;
      flag: string;
      count: string;
    }>(
      `select pool_id, flag, count(*)::text as count
         from dashboard.prescription_risk
        where tenant_id = $1 and id::text like $2 and clock_code = 'A'
        group by pool_id, flag
        order by pool_id, flag`,
      [TENANT_ID, NAMESPACE],
    );
    const rowsA = aggregated.rows
      .filter((row) => row.pool_id === POOL_A)
      .map((row) => ({ key: row.flag, count: Number(row.count) }));
    expect(rowsA).toHaveLength(3);

    const result: SuppressResult = suppress(rowsA, threshold);
    const byKey = new Map(result.rows.map((row) => [row.key, row]));
    expect(byKey.get('n1')).toMatchObject({
      count: null,
      suppression: 'primary',
    });
    expect(byKey.get('n2')).toMatchObject({
      count: null,
      suppression: 'secondary',
    });
    expect(byKey.get('critico')).toMatchObject({ count: threshold + 5 });
    expect(result.suppressedCells).toBe(2);
    expect(result.total).toBeNull();
    expect(result.totalSuppressed).toBe(true);
    for (const row of result.rows) expect(row.count).not.toBe(0);

    const rowsB = aggregated.rows
      .filter((row) => row.pool_id === POOL_B)
      .map((row) => ({ key: row.flag, count: Number(row.count) }));
    const resultB: SuppressResult = suppress(rowsB, threshold);
    expect(resultB.suppressedCells).toBe(0);
    expect(resultB.total).toBe(threshold + 6 + (threshold + 8));
    expect(resultB.totalSuppressed).toBe(false);
  });
});
