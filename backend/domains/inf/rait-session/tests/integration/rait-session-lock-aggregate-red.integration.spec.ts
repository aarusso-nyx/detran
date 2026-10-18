// Hotfix fix/for-update-with-aggregates (política B9 do Owner, R-0022): o PostgreSQL recusa
// `FOR UPDATE` no mesmo nível de consulta que agregado ou `GROUP BY`. Estes testes exercitam o
// `RaitSessionCommandService.execute` de produção contra o banco real: a fixture é montada como
// owner dentro da transação, a operação corre sob `role_app_backend` e tudo termina em rollback.
// - `read`/`vote`/`view` passam pela checagem de quórum (requireItemReadiness);
// - `view` também conta os pedidos de vista do membro antes de gravar o novo pedido.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { RaitSessionCommandService } from '../../src/handwritten/rait-session-command.service.js';

const { Client } = pg;

function requiredUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the session lock proof`);
  return value;
}

const DATABASE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const TENANT = '00000000-0000-7000-8000-00000000a001';
// Sessão aberta do CETRAN da fixture (quórum 2, membros …018/…019/…020 presentes).
const OPEN_SESSION = '00000000-0000-7000-8000-000030000004';
const CASE_ID = '00000000-0000-7000-8000-000010000011';
const RAPPORTEUR = '00000000-0000-7000-8000-000021000019';
const MEMBER = '00000000-0000-7000-8000-000021000020';
const AGENDA_ITEM = '00000000-0000-7000-8000-0000310f0001';

let client: InstanceType<typeof Client>;

type Tx = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

function subject(
  actorId: string,
  fixture: () => Promise<void>,
): RaitSessionCommandService {
  const database = {
    async tx<T>(work: (tx: Tx) => Promise<T>, options: { role?: string }) {
      await client.query('begin');
      try {
        await client.query(`select set_config('app.role', 'owner', true)`);
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          TENANT,
        ]);
        await fixture();
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.role', $1, true)`, [
          options.role,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        return await work({
          query: (sql, params) => client.query(sql, params),
        });
      } finally {
        await client.query('rollback');
      }
    },
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: TENANT, actorId }),
  };
  return new RaitSessionCommandService(
    database as never,
    requestContext as never,
  );
}

async function insertAgendaItem(readAt: 'now()' | 'null'): Promise<void> {
  await client.query(
    `insert into inf.rait_agenda_item
       (id, tenant_id, session_id, case_id, position, rapporteur_member_id,
        opinion_summary, opinion_analysis, opinion_vote, opinion_registered_at,
        read_at)
     values ($1, $2, $3, $4, 1, $5, 'resumo', 'análise', 'provimento', now(),
        ${readAt})`,
    [AGENDA_ITEM, TENANT, OPEN_SESSION, CASE_ID, RAPPORTEUR],
  );
}

describe('hotfix — bloqueio de linha sem agregado nos comandos de sessão', () => {
  beforeAll(async () => {
    expect(new URL(DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
    client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
  });

  afterAll(async () => client?.end());

  it('dado item com parecer em sessão aberta com quórum quando o relator lê o parecer então a checagem de quórum bloqueia e o comando conclui', async () => {
    const service = subject(RAPPORTEUR, () => insertAgendaItem('null'));

    const result = await service.execute({
      command: 'read',
      targetId: AGENDA_ITEM,
      payload: {},
      headers: { 'If-Match': 'W/"1"', 'Idempotency-Key': 'lock-proof-read' },
    });

    expect(result.data).toMatchObject({ id: AGENDA_ITEM, version: 2 });
    expect(result.data.read_at).not.toBeNull();
    expect(result.events).toEqual([{ type: 'rait.agenda-item.changed' }]);
  });

  it('dado item lido em sessão aberta e próxima sessão ordinária futura quando um membro presente pede vista então a contagem de vistas bloqueia e o pedido é gravado', async () => {
    let nextSession = '';
    const service = subject(MEMBER, async () => {
      await insertAgendaItem('now()');
      const next = await client.query<{ scheduled_for: string }>(
        `insert into inf.rait_session
           (tenant_id, judging_body, state, scheduled_for, quorum_required)
         values ($1, 'cetran', 'FORMANDO_PAUTA',
           clock_timestamp() + interval '7 days', 2)
         returning scheduled_for::date::text as scheduled_for`,
        [TENANT],
      );
      nextSession = next.rows[0]!.scheduled_for;
    });

    const result = await service.execute({
      command: 'view',
      targetId: AGENDA_ITEM,
      payload: {},
      headers: { 'If-Match': 'W/"1"', 'Idempotency-Key': 'lock-proof-view' },
    });

    expect(result.data).toMatchObject({
      id: AGENDA_ITEM,
      version: 2,
      view_requested_by: MEMBER,
    });
    // node-postgres materializa `date` como meia-noite local.
    expect(result.data.view_due_on).toBeInstanceOf(Date);
    expect((result.data.view_due_on as Date).toLocaleDateString('sv-SE')).toBe(
      nextSession,
    );
    expect(result.events).toEqual([{ type: 'rait.agenda-item.changed' }]);
  });
});
