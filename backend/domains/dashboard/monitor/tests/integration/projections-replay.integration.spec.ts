// CTG-0001 §4, §6 C-0001-05 (M9 e) — replay real dos oito projetores de
// `DASHBOARD_MONITOR_PROJECTOR_LIST` contra o banco da rodada: cada fixture
// de `tests/fixtures/outbox-events.ts` é gravada em `integration.outbox`
// (única leitura cruzada admitida, M5/M6 — replay a partir dali) e aplicada
// duas vezes chamando `apply(event, ctx)` diretamente (o runner que lê a
// outbox é CTG-0002 — CTG-0001 §4.3 nota final). Padrão de
// `backend/domains/portal/projections/tests/integration/portal-projections-replay.integration.spec.ts`
// (`tx: SqlTx = { query: (sql, values) => client.query(sql, values) }`
// direto contra um `pg.Client` real, sem tx falsa). `src/handwritten/**`
// ainda não existe (TASK-0010): este arquivo fica vermelho (falha de import)
// até lá — aceito pelo prompt TASK-0002. `afterAll` limpa tudo o que este
// spec criou (método §4.16; M12).
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ALL_FIXTURE_EVENTS,
  FIXTURE_TENANT_ID,
  TEST_SOURCE_KEY,
} from '../fixtures/outbox-events.js';
// Tipos/símbolos de `src/handwritten/**` (TASK-0010; ainda não existe).
import type {
  DashboardProjectionContext,
  DashboardProjector,
  DashboardSqlTransaction,
} from '../../src/handwritten/projection-contract.js';
import { DASHBOARD_MONITOR_PROJECTOR_LIST } from '../../src/handwritten/projectors.js';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r11',
});

const tx: DashboardSqlTransaction = {
  query: (statement: string, values?: readonly unknown[]) =>
    client.query(statement, values as unknown[]) as never,
};

const ctx: DashboardProjectionContext = {
  tx,
  tenantId: FIXTURE_TENANT_ID,
  now: new Date('2026-09-12T10:00:00.000Z'),
};

async function insertOutboxRow(
  event: (typeof ALL_FIXTURE_EVENTS)[number],
): Promise<void> {
  await client.query(
    `insert into integration.outbox
       (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7, 'pending', $8, $8)
     on conflict (id) do update set payload = excluded.payload`,
    [
      event.id,
      FIXTURE_TENANT_ID,
      event.domainEvent ?? event.type,
      event.aggregate.kind,
      event.aggregate.id,
      JSON.stringify(event),
      `dashboard-monitor-fixture:${event.id}`,
      event.occurredAt,
    ],
  );
}

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    FIXTURE_TENANT_ID,
  ]);
  for (const event of ALL_FIXTURE_EVENTS) await insertOutboxRow(event);
});

afterAll(async () => {
  // A16: cada `delete` abaixo é restrito a ids/chaves exclusivas desta
  // suíte (namespace `0082…` de `tests/fixtures/outbox-events.ts` para
  // `event_id`/`last_event_id`, `TEST_SOURCE_KEY` para `dashboard.source`)
  // — nunca por um filtro que uma linha semeada fora da suíte (`80-`/`81-
  // fixtures-dashboard-*.sql`) pudesse satisfazer. As sete tabelas de
  // projeção e o ledger só recebem linhas via `apply()` dos projetores
  // desta suíte (nenhum arquivo de seed grava nelas), então o filtro por
  // `last_event_id = any(ALL_FIXTURE_EVENTS ids)` já é exclusivo da suíte;
  // `dashboard.source` é a exceção (linha semeada com `source_key` que
  // colidia antes de A16), por isso ganha o filtro extra por `source_key`.
  await client.query(
    `delete from dashboard.monitor_projection_applied_event where tenant_id = $1 and event_id = any($2::uuid[])`,
    [FIXTURE_TENANT_ID, ALL_FIXTURE_EVENTS.map((event) => event.id)],
  );
  for (const table of [
    'prescription_risk',
    'production',
    'integration_health',
    'pec_deadlines',
    'teat_measures',
    'portal_service_metrics',
    'duty_evidence',
  ]) {
    await client.query(
      `delete from dashboard.${table} where tenant_id = $1 and last_event_id = any($2::uuid[])`,
      [FIXTURE_TENANT_ID, ALL_FIXTURE_EVENTS.map((event) => event.id)],
    );
  }
  await client.query(
    `delete from dashboard.source where tenant_id = $1 and source_key = $2 and last_event_id = any($3::uuid[])`,
    [
      FIXTURE_TENANT_ID,
      TEST_SOURCE_KEY,
      ALL_FIXTURE_EVENTS.map((event) => event.id),
    ],
  );
  await client.query(
    `delete from integration.outbox where id = any($1::uuid[])`,
    [ALL_FIXTURE_EVENTS.map((event) => event.id)],
  );
  await client.end();
});

describe('replay real dos oito projetores (CTG-0001 §4, C-0001-05, integration.outbox)', () => {
  it(`dado ${DASHBOARD_MONITOR_PROJECTOR_LIST.length} projetores registrados quando a lista é lida então tem exatamente 8 (as oito projeções de §4.1; dashboard.crashes é R-0010, M2)`, () => {
    expect(DASHBOARD_MONITOR_PROJECTOR_LIST).toHaveLength(8);
  });

  it.each(ALL_FIXTURE_EVENTS)(
    'dado a fixture de evento $id ($type) gravada em integration.outbox quando apply roda duas vezes então a 1ª retorna applied, a 2ª duplicate, e o ledger tem uma linha',
    async (event) => {
      const projector = DASHBOARD_MONITOR_PROJECTOR_LIST.find(
        (candidate: DashboardProjector) =>
          candidate.consumedEvents.includes(event.type) ||
          (event.domainEvent
            ? candidate.consumedEvents.includes(event.domainEvent)
            : false),
      );
      expect(
        projector,
        `nenhum projetor de DASHBOARD_MONITOR_PROJECTOR_LIST consome ${event.type}/${event.domainEvent ?? '—'}`,
      ).toBeDefined();

      const first = await projector!.apply(event, ctx);
      expect(first.kind).toBe('applied');
      const second = await projector!.apply(event, ctx);
      expect(second.kind).toBe('duplicate');

      const ledger = await client.query<{ n: string }>(
        `select count(*)::text as n from dashboard.monitor_projection_applied_event
           where tenant_id = $1 and projection_name = $2 and event_id = $3`,
        [FIXTURE_TENANT_ID, projector!.projection, event.id],
      );
      expect(Number(ledger.rows[0]?.n)).toBe(1);
    },
  );
});
