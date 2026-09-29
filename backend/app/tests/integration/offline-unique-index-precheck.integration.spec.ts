// Hotfix fix/offline-numbering-shift-races, ciclo 1 da revisão — pré-checagem dos índices únicos
// parciais `ux_ops_shift_tenant_id_agent_id_open` (DDL 13) e
// `ux_numbering_reservation_tenant_id_device_id_shift_id_reserved` (DDL 18).
//
// Um banco que já tenha duplicatas (dois turnos `open` do mesmo agente, duas reservas `reserved`
// do mesmo dispositivo e turno) não pode receber o índice. A DDL detecta, falha com mensagem
// explícita — índice, tenant e agente (ou dispositivo e turno) e o procedimento em
// `backend/database/ddl/README.md` — e não decide qual linha fechar: isso é da operação.
//
// A prova roda num clone descartável do banco do slot, de onde os dois índices são retirados
// para simular um banco anterior ao hotfix; as duplicatas são gravadas pelo owner e a DDL
// canônica da árvore é aplicada por `backend/database/apply.sh`. O clone é removido ao final.
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  isolatedTenant,
  seedField,
} from '../../../domains/ops/offline-sync/tests/integration/harness.js';

const { Client } = pg;

function requiredUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the precheck proof`);
  return value;
}

const SOURCE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const CLONE_DATABASE = `${EXPECTED_DATABASE}_ux_precheck_${process.pid}`;
const APPLY_SCRIPT = fileURLToPath(
  new URL('../../../database/apply.sh', import.meta.url),
);
const SHIFT_INDEX = 'ux_ops_shift_tenant_id_agent_id_open';
const RESERVATION_INDEX =
  'ux_numbering_reservation_tenant_id_device_id_shift_id_reserved';
const PROCEDURE = 'backend/database/ddl/README.md';

type PgClient = InstanceType<typeof Client>;

function urlFor(database: string): string {
  const url = new URL(SOURCE_URL);
  url.pathname = `/${database}`;
  return url.toString();
}

async function connect(database: string): Promise<PgClient> {
  const client = new Client({ connectionString: urlFor(database) });
  await client.connect();
  return client;
}

function applyDdl(): { status: number | null; output: string } {
  const source = new URL(SOURCE_URL);
  const result = spawnSync('bash', [APPLY_SCRIPT], {
    env: {
      ...process.env,
      DB_NAME: CLONE_DATABASE,
      DB_HOST: source.hostname,
      DB_PORT: source.port || '5432',
      DB_USER: decodeURIComponent(source.username),
      DB_PASSWORD: decodeURIComponent(source.password),
    },
    encoding: 'utf8',
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

let admin: PgClient;
let seeder: PgClient;
let tenantId: string;
let field: Awaited<ReturnType<typeof seedField>>;
const extraShift = randomUUID();
const reservations = [randomUUID(), randomUUID()];

async function owner(): Promise<void> {
  await seeder.query(`select set_config('app.role', 'owner', false)`);
  await seeder.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
}

async function indexExists(name: string): Promise<boolean> {
  const result = await seeder.query<{ present: boolean }>(
    `select to_regclass($1) is not null as present`,
    [`ops.${name}`],
  );
  return result.rows[0]!.present;
}

describe('hotfix — pré-checagem de duplicatas antes dos índices únicos parciais', () => {
  beforeAll(async () => {
    expect(new URL(SOURCE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
    admin = await connect('postgres');
    await admin.query(`drop database if exists ${CLONE_DATABASE} with (force)`);
    await admin.query(
      `create database ${CLONE_DATABASE} template ${EXPECTED_DATABASE}`,
    );
    seeder = await connect(CLONE_DATABASE);
    await seeder.query(`drop index if exists ops.${SHIFT_INDEX}`);
    await seeder.query(`drop index if exists ops.${RESERVATION_INDEX}`);
    const scope = await isolatedTenant(seeder, 'ux-precheck');
    tenantId = scope.tenantId;
    field = await seedField(seeder, tenantId, scope.actorId);
  }, 60_000);

  afterAll(async () => {
    await seeder?.end();
    await admin?.query(
      `drop database if exists ${CLONE_DATABASE} with (force)`,
    );
    await admin?.end();
  });

  it('dado dois turnos open do mesmo agente quando a DDL é aplicada então ela falha com mensagem que nomeia o índice, o tenant, o agente e o procedimento, e o índice não é criado', async () => {
    await owner();
    await seeder.query(
      `insert into ops.ops_shift
         (id, tenant_id, traffic_agency_id, agent_id, device_id,
          operational_unit_id, started_at, status)
       values ($1, $2, $3, $4, $5, $6, '2026-09-14T09:00:00-04:00', 'open')`,
      [
        extraShift,
        tenantId,
        field.agencyId,
        field.agentId,
        field.otherDeviceId,
        field.unitId,
      ],
    );

    const applied = applyDdl();

    expect(applied.status).not.toBe(0);
    expect(applied.output).toContain(SHIFT_INDEX);
    expect(applied.output).toContain(tenantId);
    expect(applied.output).toContain(field.agentId);
    expect(applied.output).toContain(PROCEDURE);
    expect(await indexExists(SHIFT_INDEX)).toBe(false);
  }, 180_000);

  it('dado duas reservas reserved do mesmo dispositivo e turno quando a DDL é aplicada então ela falha com mensagem que nomeia o índice, o tenant, o dispositivo, o turno e o procedimento, e o índice não é criado', async () => {
    await owner();
    // A operação resolveu os turnos duplicados (procedimento do README): fica um só aberto.
    await seeder.query(
      `update ops.ops_shift set status = 'closed', ended_at = started_at where id = $1`,
      [extraShift],
    );
    for (const [index, id] of reservations.entries()) {
      await seeder.query(
        `insert into ops.numbering_reservation
           (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id,
            shift_id, idempotency_key, start_number, end_number, valid_until,
            status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9,
                 '2026-12-31T23:59:59-04:00', 'reserved')`,
        [
          id,
          tenantId,
          field.rangeId,
          field.agencyId,
          field.agentId,
          field.deviceId,
          field.shiftId,
          `ux-precheck-${id.slice(0, 8)}`,
          2026000001 + index,
        ],
      );
    }

    const applied = applyDdl();

    expect(applied.status).not.toBe(0);
    expect(applied.output).toContain(RESERVATION_INDEX);
    expect(applied.output).toContain(tenantId);
    expect(applied.output).toContain(field.deviceId);
    expect(applied.output).toContain(field.shiftId);
    expect(applied.output).toContain(PROCEDURE);
    expect(await indexExists(RESERVATION_INDEX)).toBe(false);
  }, 180_000);

  it('dado as duplicatas resolvidas pela operação quando a DDL é aplicada então ela conclui e os dois índices existem', async () => {
    await owner();
    await seeder.query(
      `update ops.numbering_reservation set status = 'cancelled' where id = $1`,
      [reservations[1]],
    );

    const applied = applyDdl();

    expect(applied.status, applied.output).toBe(0);
    expect(await indexExists(SHIFT_INDEX)).toBe(true);
    expect(await indexExists(RESERVATION_INDEX)).toBe(true);
  }, 180_000);
});
