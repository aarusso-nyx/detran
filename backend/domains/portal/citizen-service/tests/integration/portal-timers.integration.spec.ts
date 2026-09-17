// R-0009 CTG-0002 §6.3 e §13 (TASK-0006) — C-0002-45 (parte de integração):
// `durationOf(tx, code)` lê `inf.infraction_timer_ref` (DDL 14, M14) sob
// `role_app_backend`; o valor esperado é lido pela própria consulta SQL do
// teste (nunca literal 30/20). Fica vermelho até TASK-0008 criar
// `portal-timers.ts` (§14). Banco: `source work/rounds/R-0009/env-detran-r9.sh`.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { TENANT_ID } from '../../../requests/tests/support/portal-fixtures.js';
import {
  PORTAL_TIMER_CODES,
  durationOf,
} from '../../src/handwritten/portal-timers.js';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';

interface SqlTx {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

async function inTenantTx<T>(work: (tx: SqlTx) => Promise<T>): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      TENANT_ID,
    ]);
    await client.query(`select set_config('app.actor_id', $1, true)`, [
      ACTOR_ID,
    ]);
    const result = await work({
      query: client.query.bind(client) as SqlTx['query'],
    });
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

describe('CTG-0002 §6.3 — durationOf lê inf.infraction_timer_ref (C-0002-45)', () => {
  it("C-0002-45 — dado DDL 14 quando durationOf(tx, 'T-OUV-RESPOSTA') então = duration_value da linha; durationOf('T-LGPD-ACESSO') = null; os quatro códigos existem com owner='portal'", async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const vocabulary = await client.query<{
      code: string;
      owner: string;
      duration_value: number | null;
      duration_unit: string;
    }>(
      `select code, owner, duration_value, duration_unit from inf.infraction_timer_ref where code = any($1::text[]) order by code`,
      [[...PORTAL_TIMER_CODES]],
    );
    expect(vocabulary.rows.map((row) => row.code).sort()).toEqual(
      [...PORTAL_TIMER_CODES].sort(),
    );
    expect(vocabulary.rows.every((row) => row.owner === 'portal')).toBe(true);
    expect(
      vocabulary.rows.every((row) => row.duration_unit === 'dias_corridos'),
    ).toBe(true);
    const byCode = new Map(
      vocabulary.rows.map((row) => [row.code, row.duration_value]),
    );
    expect(typeof byCode.get('T-OUV-RESPOSTA')).toBe('number');
    expect(typeof byCode.get('T-OUV-INFO')).toBe('number');
    expect(byCode.get('T-LGPD-ACESSO')).toBeNull();
    expect(byCode.get('T-AVAL-CONVITE')).toBeNull();

    const read = await inTenantTx(async (tx) => ({
      resposta: await durationOf(tx as never, 'T-OUV-RESPOSTA'),
      info: await durationOf(tx as never, 'T-OUV-INFO'),
      lgpd: await durationOf(tx as never, 'T-LGPD-ACESSO'),
      aval: await durationOf(tx as never, 'T-AVAL-CONVITE'),
    }));
    expect(read.resposta).toBe(byCode.get('T-OUV-RESPOSTA'));
    expect(read.info).toBe(byCode.get('T-OUV-INFO'));
    expect(read.lgpd).toBeNull();
    expect(read.aval).toBeNull();
  });
});
