// Hotfix fix/rait-view-request-limit-race (política B9 do Owner, R-0022): o limite
// `session.view_request.max_per_member` conta os itens de pauta em que o membro já pediu vista
// (`tenant_id` + `view_requested_by`, em todas as sessões). Com `for update` sobre linhas
// existentes, dois primeiros pedidos simultâneos do mesmo membro em itens de sessões diferentes
// não encontram linha para bloquear e ambos contam abaixo do limite.
//
// A corrida só aparece quando a primeira transação é confirmada; por isso a prova roda num clone
// descartável do banco de teste (CREATE DATABASE … TEMPLATE), removido ao final, sem deixar
// resíduo (auditoria é append-only) no banco compartilhado. Duas conexões `role_app_backend` no
// mesmo tenant executam o `RaitSessionCommandService.execute` de produção; a sincronização é
// determinística: T1 conclui o comando e fica aberta; T2 começa e só então, com T2 comprovadamente
// parada à espera de lock (pg_stat_activity) ou já concluída, T1 é confirmada.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { RaitSessionCommandService } from '../../src/handwritten/rait-session-command.service.js';

const { Client } = pg;

function requiredUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the view limit proof`);
  return value;
}

const SOURCE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const CLONE_DATABASE = `${EXPECTED_DATABASE}_view_race_${process.pid}`;
const TENANT = '00000000-0000-7000-8000-00000000a001';
// Sessão aberta do CETRAN da fixture (quórum 2, membros …018/…019/…020 presentes).
const OPEN_SESSION = '00000000-0000-7000-8000-000030000004';
const SECOND_OPEN_SESSION = '00000000-0000-7000-8000-0000310f1001';
const RAPPORTEUR = '00000000-0000-7000-8000-000021000019';
const CHAIR = '00000000-0000-7000-8000-000021000018';
const MEMBER = '00000000-0000-7000-8000-000021000020';
const FIRST_CASE = '00000000-0000-7000-8000-000010000011';
const SECOND_CASE = '00000000-0000-7000-8000-000010000012';
const FIRST_ITEM = '00000000-0000-7000-8000-0000310f1101';
const SECOND_ITEM = '00000000-0000-7000-8000-0000310f1102';

type PgClient = InstanceType<typeof Client>;
type Tx = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};
type Deferred = { promise: Promise<void>; resolve: () => void };

function deferred(): Deferred {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function urlFor(database: string): string {
  const url = new URL(SOURCE_URL);
  url.pathname = `/${database}`;
  return url.toString();
}

let admin: PgClient;
let observer: PgClient;
let first: PgClient;
let second: PgClient;

// T1/T2 entram como `role_app_backend` com o contexto do tenant; `beforeCommit` segura a
// transação aberta depois do comando concluído.
function subject(
  client: PgClient,
  beforeCommit: () => Promise<void>,
): RaitSessionCommandService {
  const database = {
    async tx<T>(work: (tx: Tx) => Promise<T>, options: { role?: string }) {
      await client.query('begin');
      try {
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          TENANT,
        ]);
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.role', $1, true)`, [
          options.role,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          MEMBER,
        ]);
        const result = await work({
          query: (sql, params) => client.query(sql, params),
        });
        await beforeCommit();
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: TENANT, actorId: MEMBER }),
  };
  return new RaitSessionCommandService(
    database as never,
    requestContext as never,
  );
}

function view(agendaItemId: string, key: string) {
  return {
    command: 'view',
    targetId: agendaItemId,
    payload: {},
    headers: { 'If-Match': 'W/"1"', 'Idempotency-Key': key },
  };
}

async function connect(database: string): Promise<PgClient> {
  const client = new Client({ connectionString: urlFor(database) });
  await client.connect();
  return client;
}

// Fixture confirmada no clone: segunda sessão aberta do CETRAN com o mesmo membro presente e
// quórum atingido, um item lido com parecer em cada sessão e a próxima sessão ordinária futura.
async function commitFixture(client: PgClient): Promise<void> {
  await client.query('begin');
  await client.query(`select set_config('app.role', 'owner', true)`);
  await client.query(`select set_config('app.tenant_id', $1, true)`, [TENANT]);
  await client.query(
    `insert into inf.rait_session
       (id, tenant_id, judging_body, state, scheduled_for, quorum_required)
     values ($1, $2, 'cetran', 'SESSAO_ABERTA', clock_timestamp() - interval '1 hour', 2),
            (gen_random_uuid(), $2, 'cetran', 'FORMANDO_PAUTA', clock_timestamp() + interval '7 days', 2)`,
    [SECOND_OPEN_SESSION, TENANT],
  );
  await client.query(
    `insert into inf.rait_attendance (tenant_id, session_id, member_id, present, is_chair)
     values ($1, $2, $3, true, true), ($1, $2, $4, true, false), ($1, $2, $5, true, false)`,
    [TENANT, SECOND_OPEN_SESSION, CHAIR, RAPPORTEUR, MEMBER],
  );
  await client.query(
    `insert into inf.rait_agenda_item
       (id, tenant_id, session_id, case_id, position, rapporteur_member_id,
        opinion_summary, opinion_analysis, opinion_vote, opinion_registered_at, read_at)
     values ($1, $3, $4, $6, 1, $8, 'resumo', 'análise', 'provimento', now(), now()),
            ($2, $3, $5, $7, 1, $8, 'resumo', 'análise', 'provimento', now(), now())`,
    [
      FIRST_ITEM,
      SECOND_ITEM,
      TENANT,
      OPEN_SESSION,
      SECOND_OPEN_SESSION,
      FIRST_CASE,
      SECOND_CASE,
      RAPPORTEUR,
    ],
  );
  await client.query('commit');
}

async function backendPid(client: PgClient): Promise<number> {
  const result = await client.query<{ pid: number }>(
    'select pg_backend_pid() as pid',
  );
  return result.rows[0]!.pid;
}

// Condição observável, não tempo: espera T2 parar à espera de lock ou terminar.
async function untilWaitingOrSettled(
  pid: number,
  settled: () => boolean,
): Promise<void> {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    if (settled()) return;
    const state = await observer.query<{ wait_event_type: string | null }>(
      'select wait_event_type from pg_stat_activity where pid = $1',
      [pid],
    );
    if (state.rows[0]?.wait_event_type === 'Lock') return;
    await new Promise((done) => setTimeout(done, 20));
  }
  throw new Error('T2 não chegou a esperar lock nem terminou');
}

describe('hotfix — limite de pedidos de vista por membro sob concorrência', () => {
  beforeAll(async () => {
    expect(new URL(SOURCE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
    admin = await connect('postgres');
    await admin.query(`drop database if exists ${CLONE_DATABASE}`);
    await admin.query(
      `create database ${CLONE_DATABASE} template ${EXPECTED_DATABASE}`,
    );
    observer = await connect(CLONE_DATABASE);
    first = await connect(CLONE_DATABASE);
    second = await connect(CLONE_DATABASE);
    await commitFixture(observer);
  }, 60000);

  afterAll(async () => {
    await Promise.allSettled([first?.end(), second?.end(), observer?.end()]);
    await admin?.query(
      `drop database if exists ${CLONE_DATABASE} with (force)`,
    );
    await admin?.end();
  });

  it('dado limite de 1 pedido de vista por membro quando o mesmo membro pede vista em itens de sessões diferentes ao mesmo tempo então no máximo um pedido é aceito e o outro é recusado pelo limite', async () => {
    const limit = await observer.query<{ value_json: unknown }>(
      `select value_json from ops.parameter
        where tenant_id = $1 and surface = 'rait' and key = 'session.view_request.max_per_member'
          and status = 'vigente' and source_pending = false`,
      [TENANT],
    );
    expect(limit.rows.map((row) => row.value_json)).toEqual([1]);

    const firstDone = deferred();
    const firstCommit = deferred();
    const secondPid = await backendPid(second);
    const firstService = subject(first, async () => {
      firstDone.resolve();
      await firstCommit.promise;
    });
    const secondService = subject(second, async () => undefined);

    const firstResult = firstService
      .execute(view(FIRST_ITEM, 'view-race-first'))
      .then(
        (value) => ({ status: 'fulfilled' as const, value }),
        (reason: unknown) => ({ status: 'rejected' as const, reason }),
      );
    await Promise.race([firstDone.promise, firstResult]);

    let secondSettled = false;
    const secondResult = secondService
      .execute(view(SECOND_ITEM, 'view-race-second'))
      .then(
        (value) => ({ status: 'fulfilled' as const, value }),
        (reason: unknown) => ({ status: 'rejected' as const, reason }),
      )
      .finally(() => {
        secondSettled = true;
      });
    await untilWaitingOrSettled(secondPid, () => secondSettled);
    firstCommit.resolve();

    const outcomes = await Promise.all([firstResult, secondResult]);
    const accepted = outcomes.filter(
      (outcome) => outcome.status === 'fulfilled',
    );
    const refused = outcomes.flatMap((outcome) =>
      outcome.status === 'rejected' ? [outcome.reason] : [],
    );
    expect(accepted).toHaveLength(1);
    expect(refused).toHaveLength(1);
    expect(refused[0]).toMatchObject({
      code: 'RAIT.VIEW_REQUEST_NOT_ALLOWED',
      status: 422,
    });

    const persisted = await observer.query<{ count: number }>(
      'select count(*)::integer as count from inf.rait_agenda_item where tenant_id = $1 and view_requested_by = $2',
      [TENANT, MEMBER],
    );
    expect(persisted.rows[0]!.count).toBe(1);
  });
});
