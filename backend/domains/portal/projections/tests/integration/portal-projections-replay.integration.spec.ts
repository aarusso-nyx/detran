// R-0009 CTG-0002 §7.6, §8, §5 e §13 (TASK-0006) — C-0002-57/58/59 sobre o
// banco da rodada (`source work/rounds/R-0009/env-detran-r9.sh`; DDL + seeds):
//   57 replay — os 12 eventos de `tests/fixtures/outbox-events.ts` gravados em
//      `integration.outbox` (ids fixos …7000700001…12 — inseridos por SQL com a
//      MESMA forma de linha que `SqlTeatEventOutbox.append` produz, porque
//      `append` gera o id na própria CTE e não aceita id externo), a janela
//      aplicada em ordem e depois `rebuild` por projeção: linhas iguais
//      (colunas de negócio) e `projection_applied_event` = N por projeção;
//      …7000700010 gera last_error (OD-P20) nas duas passagens;
//   58 cache das leituras nacionais com TTL lido de `ops.parameter`
//      (`PORTAL_READ_CACHE_TTL_PARAMETER` — nunca literal 15);
//   59 vínculo × projeção com as fixtures (prata 4, procurador 4, bronze 0).
// Fica vermelho até TASK-0008 criar `projectors.service.ts`,
// `infraction-view.projection.ts` e `national-reads.service.ts` (§14).
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PortalIdentityService, cpfHashOf } from '@detran/portal-identity';

import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
import {
  AITS,
  FIXED_NOW,
  SUBJECTS,
  TENANT_ID,
  fakeDatabase,
  fakeRequestContext,
  fixedClock,
} from '../../../requests/tests/support/portal-fixtures.js';
import {
  INFRACTION_VIEW_SOURCE,
  SqlInfractionViewSource,
} from '../../src/handwritten/infraction-view.projection.js';
import {
  PORTAL_PARAMETER_READER,
  PORTAL_READ_CACHE_TTL_PARAMETER,
  PortalNationalReadsService,
} from '../../src/handwritten/national-reads.service.js';
import {
  PORTAL_PROJECTION_POLLER,
  PortalProjectors,
} from '../../src/handwritten/projectors.service.js';
import {
  AIT_F1,
  AIT_F2,
  AIT_F9,
  CASE_207,
  EVENT_IDS,
  OUTBOX_EVENTS,
} from '../fixtures/outbox-events.js';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
/** Persona `agency-admin` de `00-fixtures-core.sql`, a que assina parâmetros. */
const PARAMETER_CHANGED_BY = '00000000-0000-4000-8000-0000b0000016';
const LINKED_REQUEST_ID = '00000000-0000-7000-8000-0000704000e7';
const PROJECTIONS = [
  'infraction_view',
  'process_timeline',
  'points_view',
  'crash_view',
  'exam_view',
] as const;
const PROJECTION_TABLES: Record<
  (typeof PROJECTIONS)[number],
  { table: string; key: string }
> = {
  infraction_view: { table: 'portal.infraction_view', key: 'ait_id' },
  process_timeline: { table: 'portal.process_timeline', key: 'case_id' },
  points_view: { table: 'portal.points_view', key: 'subject_cpf_hash' },
  crash_view: { table: 'portal.crash_view', key: 'crash_id' },
  exam_view: { table: 'portal.exam_view', key: 'exam_id' },
};
const VOLATILE_COLUMNS = new Set(['id', 'created_at', 'updated_at']);

interface SqlTx {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

const tx: SqlTx = {
  query: (sql, values) => client.query(sql, values as unknown[]) as never,
};

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
    const result = await work(tx);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

async function asOwner<T>(work: () => Promise<T>): Promise<T> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  return work();
}

/** Leitor de parâmetros vivo (mesma consulta de `OpsParameterService.get`, versão vigente mais recente). */
const liveParameters = {
  get: vi.fn(async (key: string) => {
    const result = await client.query<{
      value_json: unknown;
      source_pending: boolean;
    }>(
      `select value_json, source_pending from ops.parameter
        where tenant_id = $1 and key = $2
          and effective_from <= current_date
          and (effective_to is null or effective_to >= current_date)
        order by effective_from desc, version desc limit 1`,
      [TENANT_ID, key],
    );
    if (!result.rows[0]) throw new Error(`Parameter ${key} not found`);
    return { key, ...result.rows[0] };
  }),
};

function tokenKey(token: unknown, fallback: string): string {
  if (typeof token === 'symbol') return token.description ?? fallback;
  if (typeof token === 'function') return (token as { name: string }).name;
  return fallback;
}

function buildProjectors(transaction: SqlTx) {
  return constructInjectable(PortalProjectors, {
    [tokenKey(INFRACTION_VIEW_SOURCE, 'INFRACTION_VIEW_SOURCE')]:
      constructInjectable(SqlInfractionViewSource, {}),
    [tokenKey(PORTAL_PARAMETER_READER, 'PORTAL_PARAMETER_READER')]:
      liveParameters,
    [tokenKey(PORTAL_PROJECTION_POLLER, 'PORTAL_PROJECTION_POLLER')]: {
      intervalMs: 1000,
      schedule: () => () => undefined,
    },
    PortalClock: fixedClock,
    Database: fakeDatabase(transaction),
    RequestContext: fakeRequestContext(),
  }) as unknown as {
    applyEvent: (event: unknown, tx: unknown) => Promise<unknown>;
    rebuild: (tenantId: string, projection: string) => Promise<unknown>;
  };
}

async function resetProjectionFixtures(): Promise<void> {
  await asOwner(async () => {
    await client.query(
      `delete from integration.outbox where tenant_id = $1 and id = any($2::uuid[])`,
      [TENANT_ID, Object.values(EVENT_IDS)],
    );
    await client.query(
      `delete from portal.projection_applied_event where tenant_id = $1`,
      [TENANT_ID],
    );
    await client.query(
      `delete from portal.process_timeline where tenant_id = $1 and case_id = $2`,
      [TENANT_ID, CASE_207],
    );
    await client.query(
      `delete from portal.points_view where tenant_id = $1 and subject_cpf_hash = $2`,
      [TENANT_ID, SUBJECTS.qualificada.cpfHash],
    );
    await client.query(
      `delete from portal.infraction_view where tenant_id = $1 and ait_id = $2`,
      [TENANT_ID, AIT_F1],
    );
    await client.query(
      `delete from portal.request where tenant_id = $1 and id = $2`,
      [TENANT_ID, LINKED_REQUEST_ID],
    );
    // estado do seed 70 para as views tocadas pelos eventos (…70f00001 = f2, …70f00005 = f9)
    await client.query(
      `update portal.infraction_view
          set situation = case ait_id when $2 then 'aguardando_defesa' else 'encerrada' end,
              points_status = case ait_id when $2 then 'none' else 'definitivo' end,
              deadlines_json = '[]'::jsonb, actions_json = '[]'::jsonb, notices_json = '[]'::jsonb,
              payment_json = '{}'::jsonb,
              last_event_id = '00000000-0000-0000-0000-000000000000', last_event_version = 0
        where tenant_id = $1 and ait_id in ($2, $3)`,
      [TENANT_ID, AIT_F2, AIT_F9],
    );
  });
}

async function snapshotProjection(
  projection: (typeof PROJECTIONS)[number],
): Promise<Array<Record<string, unknown>>> {
  const { table, key } = PROJECTION_TABLES[projection];
  return asOwner(async () => {
    const result = await client.query<Record<string, unknown>>(
      `select * from ${table} where tenant_id = $1 order by ${key}`,
      [TENANT_ID],
    );
    return result.rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(([column]) => !VOLATILE_COLUMNS.has(column)),
      ),
    );
  });
}

async function appliedCounts(): Promise<Record<string, number>> {
  return asOwner(async () => {
    const result = await client.query<{ projection: string; count: string }>(
      `select projection, count(*)::text as count from portal.projection_applied_event where tenant_id = $1 group by projection`,
      [TENANT_ID],
    );
    return Object.fromEntries(
      result.rows.map((row) => [row.projection, Number(row.count)]),
    );
  });
}

beforeAll(async () => {
  await client.connect();
  await resetProjectionFixtures();
});

afterAll(async () => {
  await resetProjectionFixtures();
  await asOwner(async () => {
    await client.query(
      `delete from portal.national_read_cache where tenant_id = $1 and subject_id = $2`,
      [TENANT_ID, SUBJECTS.prata.id],
    );
    await client.query(
      `delete from ops.parameter where tenant_id = $1 and key = $2 and reason = $3`,
      [TENANT_ID, PORTAL_READ_CACHE_TTL_PARAMETER, 'TASK-0006 C-0002-58'],
    );
  });
  await client.end();
});

describe('CTG-0002 §7.6 — replay das cinco projeções (C-0002-57)', () => {
  it('C-0002-57 — dado os eventos …7000700001…12 na outbox e as projeções aplicadas em ordem quando rebuild(tenant, projeção) então linhas iguais e applied_event = N por projeção; …7000700010 gera last_error nas duas passagens', async () => {
    await asOwner(async () => {
      await client.query(
        `insert into portal.request (id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel, delegation_domain, delegation_command, delegation_external_id, delegation_status, minimum_assurance, version)
         values ($1, $2, 'EM_ANDAMENTO_NO_ORGAO', 'defesa_previa', $3, 'ait', $4, 'portal', 'inf', 'inf:rait-case:protocol', $5, 'delegated', 'avancada', 4)`,
        [
          LINKED_REQUEST_ID,
          TENANT_ID,
          SUBJECTS.prata.id,
          '00000000-0000-7000-8000-0000f0000003',
          CASE_207,
        ],
      );
      for (const event of OUTBOX_EVENTS) {
        await client.query(
          `insert into integration.outbox (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, available_at, created_at)
           values ($1, $2, $3, $4, $5, $6::jsonb, $7, 'pending', $8::timestamptz, $8::timestamptz)`,
          [
            event.id,
            TENANT_ID,
            event.type,
            event.aggregate.kind,
            event.aggregate.id,
            JSON.stringify(event),
            `${event.type}:${event.aggregate.id}:${event.aggregate.version}:${event.id.slice(-2)}`,
            event.occurredAt,
          ],
        );
      }
    });

    // primeira passagem: a mesma janela que o rebuild lê (topic inf.% | rait.%), em ordem (created_at, id)
    await inTenantTx(async (transaction) => {
      const projectors = buildProjectors(transaction);
      const window = await transaction.query<{ payload: unknown }>(
        `select payload from integration.outbox where (topic like 'inf.%' or topic like 'rait.%') order by created_at, id`,
      );
      expect(window.rows.length).toBeGreaterThanOrEqual(10);
      for (const row of window.rows)
        await projectors.applyEvent(row.payload, transaction);
    });

    const firstPass = Object.fromEntries(
      await Promise.all(
        PROJECTIONS.map(async (projection) => [
          projection,
          await snapshotProjection(projection),
        ]),
      ),
    );
    const firstCounts = await appliedCounts();
    expect(firstCounts.infraction_view).toBeGreaterThanOrEqual(5);
    expect(firstCounts.process_timeline).toBeGreaterThanOrEqual(3);
    expect(firstCounts.points_view).toBeGreaterThanOrEqual(1);
    expect(firstCounts.crash_view ?? 0).toBe(0);
    expect(firstCounts.exam_view ?? 0).toBe(0);

    const failedFirst = await asOwner(() =>
      client.query<{ last_error: string | null }>(
        `select last_error from portal.projection_applied_event where tenant_id = $1 and event_id = $2`,
        [TENANT_ID, EVENT_IDS.e10],
      ),
    );
    expect(String(failedFirst.rows[0]?.last_error)).toMatch(
      /^PORTAL\.INTERNAL:situation:AIT_LAVRADO/,
    );

    const views = firstPass.infraction_view as Array<Record<string, unknown>>;
    expect(views.find((row) => row.ait_id === AIT_F2)).toMatchObject({
      situation: 'em_defesa',
      points_status: 'em_disputa',
      last_event_version: 3,
    });
    expect(
      views.find((row) => row.ait_id === AIT_F9)!.payment_json,
    ).toMatchObject({ paid: true, paidTier: 'desconto_80' });
    expect(
      (firstPass.process_timeline as Array<Record<string, unknown>>).find(
        (row) => row.case_id === CASE_207,
      ),
    ).toMatchObject({ request_id: LINKED_REQUEST_ID });
    expect(
      (firstPass.points_view as Array<Record<string, unknown>>).find(
        (row) => row.subject_cpf_hash === SUBJECTS.qualificada.cpfHash,
      ),
    ).toMatchObject({ definitive_points: 4 });

    for (const projection of PROJECTIONS) {
      await inTenantTx(async (transaction) => {
        await buildProjectors(transaction).rebuild(TENANT_ID, projection);
      });
      expect(await snapshotProjection(projection), projection).toEqual(
        firstPass[projection],
      );
    }
    expect(await appliedCounts()).toEqual(firstCounts);
    const failedSecond = await asOwner(() =>
      client.query<{ last_error: string | null }>(
        `select last_error from portal.projection_applied_event where tenant_id = $1 and event_id = $2`,
        [TENANT_ID, EVENT_IDS.e10],
      ),
    );
    expect(String(failedSecond.rows[0]?.last_error)).toMatch(
      /^PORTAL\.INTERNAL:situation:AIT_LAVRADO/,
    );

    // reaplicar um evento já aplicado não duplica nem muda a linha
    await inTenantTx(async (transaction) => {
      const outcome = (await buildProjectors(transaction).applyEvent(
        OUTBOX_EVENTS[1],
        transaction,
      )) as
        | { applied?: boolean; skipped?: string }
        | Array<{ applied?: boolean; skipped?: string }>;
      const first = Array.isArray(outcome) ? outcome[0]! : outcome;
      expect(first).toMatchObject({
        applied: false,
        skipped: 'already_applied',
      });
    });
    expect(await snapshotProjection('infraction_view')).toEqual(
      firstPass.infraction_view,
    );
  }, 60_000);
});

describe('CTG-0002 §8 — PortalNationalReadsService: cache e TTL de ops.parameter (C-0002-58)', () => {
  const prata = {
    subjectId: SUBJECTS.prata.id,
    name: null,
    observedAt: FIXED_NOW,
    version: 1,
  };
  let ttlMinutes = 0;

  async function ttlFromDatabase(): Promise<number> {
    const parameter = await liveParameters.get(PORTAL_READ_CACHE_TTL_PARAMETER);
    return Number(parameter.value_json);
  }

  async function writeTtl(minutes: number): Promise<void> {
    await asOwner(async () => {
      await client.query(
        `delete from ops.parameter where tenant_id = $1 and key = $2 and effective_from = current_date`,
        [TENANT_ID, PORTAL_READ_CACHE_TTL_PARAMETER],
      );
      await client.query(
        `insert into ops.parameter
           (tenant_id, traffic_agency_id, scope, surface, key, value_json, value_type, status, source_pending, legal_readonly, decision_ref, reason, version, effective_from, changed_by)
         values ($1, null, 'tenant', 'portal', $2, $3::jsonb, 'int', 'vigente', false, false, 'H.54', 'TASK-0006 C-0002-58', 2, current_date, $4)`,
        [
          TENANT_ID,
          PORTAL_READ_CACHE_TTL_PARAMETER,
          String(minutes),
          PARAMETER_CHANGED_BY,
        ],
      );
    });
  }

  function service(transaction: SqlTx) {
    return constructInjectable(PortalNationalReadsService, {
      [tokenKey(PORTAL_PARAMETER_READER, 'PORTAL_PARAMETER_READER')]:
        liveParameters,
      PortalClock: fixedClock,
      Database: fakeDatabase(transaction),
      RequestContext: fakeRequestContext(),
    }) as unknown as {
      read: (
        tx: unknown,
        subject: unknown,
        kind: string,
        targetId: string | null,
        fetch: () => Promise<unknown>,
      ) => Promise<{ payload: unknown; cachedAt: Date | string }>;
    };
  }

  async function clearCache(): Promise<void> {
    await asOwner(() =>
      client.query(
        `delete from portal.national_read_cache where tenant_id = $1 and subject_id = $2`,
        [TENANT_ID, SUBJECTS.prata.id],
      ),
    );
  }

  async function ageCache(kind: string, minutes: number): Promise<void> {
    await asOwner(() =>
      client.query(
        `update portal.national_read_cache set cached_at = $3::timestamptz - make_interval(mins => $4::int) where tenant_id = $1 and subject_id = $2 and kind = $5`,
        [TENANT_ID, SUBJECTS.prata.id, FIXED_NOW.toISOString(), minutes, kind],
      ),
    );
  }

  beforeAll(async () => {
    const seeded = await ttlFromDatabase();
    expect(seeded).toBeGreaterThan(0);
    ttlMinutes = seeded;
    await clearCache();
  });

  it('C-0002-58 (a)(b) — dado fetch ok então cache gravado e cachedAt = relógio; segunda leitura dentro do TTL não chama a porta', async () => {
    const fetch = vi.fn(async () => ({ license: { category: 'B' } }));
    const first = await inTenantTx((transaction) =>
      service(transaction).read(transaction, prata, 'cnh', null, fetch),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(first.payload).toEqual({ license: { category: 'B' } });
    expect(new Date(first.cachedAt).getTime()).toBe(FIXED_NOW.getTime());
    const cached = await asOwner(() =>
      client.query<{
        payload_json: unknown;
        cached_at: Date;
        kind: string;
        target_id: string | null;
      }>(
        `select payload_json, cached_at, kind, target_id from portal.national_read_cache where tenant_id = $1 and subject_id = $2`,
        [TENANT_ID, SUBJECTS.prata.id],
      ),
    );
    expect(cached.rows).toHaveLength(1);
    expect(cached.rows[0]).toMatchObject({
      kind: 'cnh',
      target_id: null,
      payload_json: { license: { category: 'B' } },
    });
    expect(new Date(cached.rows[0]!.cached_at).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const second = await inTenantTx((transaction) =>
      service(transaction).read(transaction, prata, 'cnh', null, fetch),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second.payload).toEqual(first.payload);
    expect(new Date(second.cachedAt).getTime()).toBe(FIXED_NOW.getTime());
  });

  it('C-0002-58 (c) — dado porta que lança com cache vencido então 200 com cachedAt antigo (RN-PORTAL-117 C)', async () => {
    await ageCache('cnh', ttlMinutes + 1);
    const failing = vi.fn(async () => {
      throw new Error('CDT indisponível (fixture)');
    });
    const result = await inTenantTx((transaction) =>
      service(transaction).read(transaction, prata, 'cnh', null, failing),
    );
    expect(failing).toHaveBeenCalledTimes(1);
    expect(result.payload).toEqual({ license: { category: 'B' } });
    expect(new Date(result.cachedAt).getTime()).toBe(
      FIXED_NOW.getTime() - (ttlMinutes + 1) * 60_000,
    );
  });

  it('C-0002-58 (d) — dado porta que lança sem cache então 503 PORTAL.NATIONAL_READ_UNAVAILABLE { cachedAt: null, retryAfter: ttl*60 }', async () => {
    const failing = vi.fn(async () => {
      throw new Error('CDT indisponível (fixture)');
    });
    await expect(
      inTenantTx((transaction) =>
        service(transaction).read(
          transaction,
          prata,
          'vehicles',
          null,
          failing,
        ),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NATIONAL_READ_UNAVAILABLE',
      status: 503,
      context: { cachedAt: null, retryAfter: ttlMinutes * 60 },
    });
    const cached = await asOwner(() =>
      client.query(
        `select id from portal.national_read_cache where tenant_id = $1 and subject_id = $2 and kind = 'vehicles'`,
        [TENANT_ID, SUBJECTS.prata.id],
      ),
    );
    expect(cached.rows).toHaveLength(0);
  });

  it('C-0002-58 (e) — dado o parâmetro alterado em ops.parameter então o TTL observado muda (sem literal no spec)', async () => {
    const probeTtl = ttlMinutes * 2 + 10;
    await writeTtl(probeTtl);
    try {
      expect(await ttlFromDatabase()).toBe(probeTtl);
      // cache com idade entre o TTL antigo e o novo: vencido antes, fresco agora
      await ageCache('cnh', ttlMinutes + 1);
      const fetch = vi.fn(async () => ({ license: { category: 'X' } }));
      const result = await inTenantTx((transaction) =>
        service(transaction).read(transaction, prata, 'cnh', null, fetch),
      );
      expect(fetch).not.toHaveBeenCalled();
      expect(result.payload).toEqual({ license: { category: 'B' } });

      const failing = vi.fn(async () => {
        throw new Error('indisponível');
      });
      await expect(
        inTenantTx((transaction) =>
          service(transaction).read(
            transaction,
            prata,
            'clearance',
            randomUUID(),
            failing,
          ),
        ),
      ).rejects.toMatchObject({
        context: { cachedAt: null, retryAfter: probeTtl * 60 },
      });
    } finally {
      await asOwner(() =>
        client.query(
          `delete from ops.parameter where tenant_id = $1 and key = $2 and reason = 'TASK-0006 C-0002-58'`,
          [TENANT_ID, PORTAL_READ_CACHE_TTL_PARAMETER],
        ),
      );
      await clearCache();
    }
    expect(await ttlFromDatabase()).toBe(ttlMinutes);
  });
});

describe('CTG-0002 §5 — vínculo × projeção com as fixtures (C-0002-59)', () => {
  const identity = new PortalIdentityService(fixedClock as never);

  async function viewsVisibleTo(
    subject: keyof typeof SUBJECTS,
  ): Promise<string[]> {
    return inTenantTx(async (transaction) => {
      const hashes = [cpfHashOf(SUBJECTS[subject].cpf)];
      const represented = await transaction.query<{
        represented_cpf_hash: string;
      }>(
        `select represented_cpf_hash from portal.representation
          where representative_subject_id = $1 and state = 'PROCURACAO_VALIDADA'
            and scope in ('ait', 'all') and (valid_until is null or valid_until >= $2::date)`,
        [SUBJECTS[subject].id, '2026-09-14'],
      );
      hashes.push(...represented.rows.map((row) => row.represented_cpf_hash));
      const views = await transaction.query<{ ait_id: string }>(
        `select ait_id from portal.infraction_view where subject_cpf_hash = any($1::text[]) order by occurred_at desc, ait_id asc`,
        [hashes],
      );
      return views.rows.map((row) => row.ait_id);
    });
  }

  it('C-0002-59 — dado fixtures de infraction_view e representation então …70000002 vê 4, …70000005 (procurador, scope ait) vê os 4 da representada, …70000001 vê 0', async () => {
    const prata = await viewsVisibleTo('prata');
    expect(prata).toHaveLength(4);
    expect([...prata].sort()).toEqual(
      [AITS.f2, AITS.f3, AITS.f5, AITS.f10].sort(),
    );
    expect(await viewsVisibleTo('procurador')).toEqual(prata);
    expect(await viewsVisibleTo('bronze')).toEqual([]);
    expect(await viewsVisibleTo('ouro')).toHaveLength(2);
    expect(await viewsVisibleTo('qualificada')).toHaveLength(1);
  });

  it("C-0002-59 — dado …70000001 então assertEntitled('ait', …f0000001) resolve (fixture …70200001) enquanto não há view para …f0000001 (GET aits/{id} → 404 { kind: 'ait' }, provado no e2e C-0002-73)", async () => {
    await inTenantTx(async (transaction) => {
      const entitled = await identity.assertEntitled(
        transaction as never,
        SUBJECTS.bronze.id,
        'ait',
        AITS.f1,
      );
      expect(entitled).toEqual({
        entitlementId: '00000000-0000-7000-8000-000070200001',
      });
      const view = await transaction.query(
        `select id from portal.infraction_view where ait_id = $1`,
        [AITS.f1],
      );
      expect(view.rows).toHaveLength(0);
      await expect(
        identity.assertEntitled(
          transaction as never,
          SUBJECTS.prata.id,
          'ait',
          AITS.f1,
        ),
      ).rejects.toMatchObject({
        code: 'PORTAL.NOT_FOUND',
        status: 404,
        context: { kind: 'ait' },
      });
    });
  });
});
