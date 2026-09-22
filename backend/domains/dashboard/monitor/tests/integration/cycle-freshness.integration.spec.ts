// CTG-0002 §15.1 C-0002-37, 38, 39 [int] — `DashboardFreshnessService`
// (§8): `sweep` (função de §8.1 sobre toda `source` com L e H, um evento por
// mudança), `observe` após `source.heartbeat` (§8.2), fallback que só mexe
// em `last_read_at` (§8.5) e o caso das fixtures do seed (L nulo ⇒ nada muda;
// `DASH.SOURCE_HEARTBEAT_UNDEFINED` para quem tentar `FRESCO`). As quatro
// fontes do seed 81 são só leitura (o caso que tenta `FRESCO` roda numa
// transação revertida); a fonte própria da suíte é `portal.outbox` (§8.3,
// sem seed; bloco B — a regra "marcar" é a mesma dos blocos B/C/D). O caso do
// bloco A com `L` (C-0002-37) usa `rait.outbox` no SEGUNDO tenant já semeado
// em `auth.tenants` (nenhuma chave de bloco A está livre no tenant das
// fixtures), apagado no `afterAll`.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DASHBOARD_MONITOR_PROJECTOR_LIST } from '../../src/handwritten/projectors.js';
import type { DashboardProjectionContext } from '../../src/handwritten/projection-contract.js';
import {
  EVENT_TYPES,
  FIXTURE_TENANT_ID,
  SECOND_TENANT_ID,
  SECOND_TENANT_TZ,
  SEED_SOURCES,
  SEED_SOURCE_IDS,
  SUITE_SOURCE_KEYS,
  cycleId,
} from '../fixtures/cycle-fixtures.js';
import {
  CycleDb,
  buildCycle,
  buildSweeper,
  ctxFor,
  expectDashError,
  sweepTarget,
  type CycleServices,
} from '../support/cycle-harness.js';

const SPEC = '06';
const NOW = new Date('2026-09-21T12:00:00.000Z');
const L = 60;
const db = new CycleDb();
let services: CycleServices;
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));
const minutesBefore = (minutes: number) =>
  new Date(NOW.getTime() - minutes * 60_000);

async function setPortalSource(
  lastSeenAt: Date,
  state: string,
  extra: Record<string, unknown> = {},
) {
  const columns = {
    state,
    last_seen_at: lastSeenAt,
    acceptable_latency_minutes: L,
    heartbeat_contract: 'source.heartbeat',
    stale_since: null,
    hidden: false,
    ...extra,
  };
  const keys = Object.keys(columns);
  await db.client.query(
    `update dashboard.source set ${keys.map((k, i) => `${k} = $${i + 3}`).join(', ')} where tenant_id = $1 and source_key = $2`,
    [
      FIXTURE_TENANT_ID,
      SUITE_SOURCE_KEYS.portalOutbox,
      ...keys.map((k) => columns[k as keyof typeof columns]),
    ],
  );
}

async function freshnessEvents(sourceId: string, tenantId = FIXTURE_TENANT_ID) {
  return (await db.outboxFor(sourceId, tenantId)).filter(
    (row) => row.topic === EVENT_TYPES.sourceFreshness,
  );
}

beforeAll(async () => {
  await db.connect();
  await db.ensureFreshSuiteSource(
    cycleId(SPEC, 0xf01),
    SUITE_SOURCE_KEYS.portalOutbox,
    'portal',
    NOW,
  );
  services = buildCycle(db, '2026-09-21');
});

afterAll(async () => {
  await db.setTenant(SECOND_TENANT_ID);
  await db.client.query(
    `delete from integration.outbox where tenant_id = $1 and aggregate_type = 'dashboard.source' and aggregate_id in (select id::text from dashboard.source where tenant_id = $1 and source_key = $2)`,
    [SECOND_TENANT_ID, SEED_SOURCES.raitOutbox.key],
  );
  await db.client.query(
    `delete from dashboard.source where tenant_id = $1 and source_key = $2`,
    [SECOND_TENANT_ID, SEED_SOURCES.raitOutbox.key],
  );
  await db.setTenant(FIXTURE_TENANT_ID);
  await db.cleanup();
  await db.end();
});

describe('C-0002-37 — sweep sobre fonte com L e H (§8.1 linhas 4–7)', () => {
  it('C-0002-37 dado fonte com L=60, H e last_seen_at = now − 150 min de bloco B/C (portal.outbox) quando sweep então DESATUALIZADO_MARCADO, hidden=false, stale_since = L0 + d·L, um único evento dashboard.source.freshness (fromState, toState)', async () => {
    const lastSeenAt = minutesBefore(150);
    await setPortalSource(lastSeenAt, 'FRESCO');
    const changed = await services.freshness.sweep(
      db.tx,
      ctxFor('system', NOW),
    );
    expect(changed).toBe(1);
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(source.state).toBe('DESATUALIZADO_MARCADO');
    expect(source.hidden).toBe(false);
    expect(new Date(source.stale_since as string).toISOString()).toBe(
      new Date(lastSeenAt.getTime() + 2 * L * 60_000).toISOString(),
    );
    expect(Number(source.version)).toBe(2);
    const events = await freshnessEvents(source.id as string);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.domainEvent).toBe('FONTE_FRESCOR_ALTERADO'); // token proposto (OD-D33)
    expect(events[0]!.payload.data).toMatchObject({
      sourceId: source.id,
      sourceKey: SUITE_SOURCE_KEYS.portalOutbox,
      app: 'portal',
      fromState: 'FRESCO',
      toState: 'DESATUALIZADO_MARCADO',
      hidden: false,
      acceptableLatencyMinutes: L,
    });
    expect(events[0]!.payload.aggregate).toMatchObject({
      kind: 'source',
      id: source.id,
      version: 2,
    });
    // sweep de novo com o mesmo now: sem mudança, sem evento novo
    expect(await services.freshness.sweep(db.tx, ctxFor('system', NOW))).toBe(
      0,
    );
    expect(await freshnessEvents(source.id as string)).toHaveLength(1);
  });

  it('C-0002-37 dado a mesma fonte com last_seen_at = now − 200 min quando sweep então hidden=true (age > m·L) e um evento (hidden mudou)', async () => {
    await setPortalSource(minutesBefore(200), 'DESATUALIZADO_MARCADO', {
      stale_since: minutesBefore(200 - 2 * L),
    });
    const changed = await services.freshness.sweep(
      db.tx,
      ctxFor('system', NOW),
    );
    expect(changed).toBe(1);
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(source.state).toBe('DESATUALIZADO_MARCADO');
    expect(source.hidden).toBe(true);
    const events = await freshnessEvents(source.id as string);
    const last = events[events.length - 1]!;
    expect(last.payload.data).toMatchObject({
      toState: 'DESATUALIZADO_MARCADO',
      hidden: true,
    });
  });

  it('C-0002-37 dado a mesma fonte com last_seen_at = now − 90 min quando sweep então ATRASADO (L < age ≤ d·L), hidden=false, stale_since nulo', async () => {
    await setPortalSource(minutesBefore(90), 'DESATUALIZADO_MARCADO', {
      stale_since: minutesBefore(90),
      hidden: true,
    });
    expect(await services.freshness.sweep(db.tx, ctxFor('system', NOW))).toBe(
      1,
    );
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(source).toMatchObject({
      state: 'ATRASADO',
      hidden: false,
      stale_since: null,
    });
  });

  it('C-0002-37 dado fonte de bloco A (rait.outbox no segundo tenant) com L=60 e last_seen_at = now − 150 min quando sweep então INDISPONIVEL, hidden=true (ocultar, §Duas estratégias)', async () => {
    await db.setTenant(SECOND_TENANT_ID);
    const id = nextId();
    await db.client.query(
      `insert into dashboard.source (id, tenant_id, source_key, app, state, last_seen_at, acceptable_latency_minutes, heartbeat_contract, hidden, version)
       values ($1, $2, $3, 'rait', 'FRESCO', $4, $5, 'source.heartbeat', false, 1)`,
      [
        id,
        SECOND_TENANT_ID,
        SEED_SOURCES.raitOutbox.key,
        minutesBefore(150),
        L,
      ],
    );
    const second = buildCycle(db, '2026-09-21', {
      tz: SECOND_TENANT_TZ,
      tenantId: SECOND_TENANT_ID,
    });
    const changed = await second.freshness.sweep(
      db.tx,
      ctxFor('system', NOW, {
        tenantId: SECOND_TENANT_ID,
        tz: SECOND_TENANT_TZ,
      }),
    );
    expect(changed).toBe(1);
    const source = (await db.source(
      SEED_SOURCES.raitOutbox.key,
      SECOND_TENANT_ID,
    ))!;
    expect(source).toMatchObject({
      state: 'INDISPONIVEL',
      hidden: true,
      stale_since: null,
    });
    const events = await freshnessEvents(id, SECOND_TENANT_ID);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.data).toMatchObject({
      fromState: 'FRESCO',
      toState: 'INDISPONIVEL',
      hidden: true,
    });
    expect(events[0]!.payload.tenantId).toBe(SECOND_TENANT_ID);
    await db.setTenant(FIXTURE_TENANT_ID);
  });

  it('C-0002-37 dado a varredura no tenant das fixtures quando sweep então a fonte do segundo tenant não é tocada (RLS/tenant do contexto)', async () => {
    await services.freshness.sweep(db.tx, ctxFor('system', NOW));
    await db.setTenant(SECOND_TENANT_ID);
    const source = (await db.source(
      SEED_SOURCES.raitOutbox.key,
      SECOND_TENANT_ID,
    ))!;
    expect(Number(source.version)).toBe(2);
    expect(
      await freshnessEvents(source.id as string, SECOND_TENANT_ID),
    ).toHaveLength(1);
    await db.setTenant(FIXTURE_TENANT_ID);
  });
});

describe('C-0002-38 — fixtures do seed (L nulo): nada muda; FRESCO sem heartbeat é 422 (§8.1)', () => {
  it('C-0002-38 dado fonte pec.deadlines (heartbeat_contract nulo) quando observe tenta FRESCO então 422 DASH.SOURCE_HEARTBEAT_UNDEFINED e a linha não muda (transação revertida)', async () => {
    const before = await db.sourcesById([SEED_SOURCES.pecDeadlines.id]);
    await db.rolledBack(async () => {
      await expectDashError(
        services.freshness.observe(
          db.tx,
          SEED_SOURCES.pecDeadlines.key,
          NOW,
          ctxFor('system', NOW),
        ),
        'DASH.SOURCE_HEARTBEAT_UNDEFINED',
        422,
      );
    });
    expect(await db.sourcesById([SEED_SOURCES.pecDeadlines.id])).toEqual(
      before,
    );
  });

  it('C-0002-38 dado sweep sobre as quatro fixtures (L nulo) então nenhuma muda e nenhum evento', async () => {
    // a fonte própria fica FRESCO com leitura recente: não conta como mudança
    await setPortalSource(minutesBefore(1), 'FRESCO');
    const before = await db.sourcesById(SEED_SOURCE_IDS);
    expect(before).toHaveLength(4);
    const changed = await services.freshness.sweep(
      db.tx,
      ctxFor('system', NOW),
    );
    expect(changed).toBe(0);
    expect(await db.sourcesById(SEED_SOURCE_IDS)).toEqual(before);
    for (const id of SEED_SOURCE_IDS)
      expect(await freshnessEvents(id)).toHaveLength(0);
    expect(before.map((row) => row.state).sort()).toEqual(
      ['FRESCO', 'ATRASADO', 'INDISPONIVEL', 'DESATUALIZADO_MARCADO'].sort(),
    );
  });

  it('C-0002-38 dado stateOf(indicator) para IND-DASH-306 (pec.deadlines) então INDISPONIVEL/hidden com sourceKey; para IND-DASH-101 (rait.outbox) então FRESCO', async () => {
    const pec = (await services.freshness.stateOf(
      db.tx,
      FIXTURE_TENANT_ID,
      'IND-DASH-306',
    ))!;
    expect(pec).toMatchObject({
      state: 'INDISPONIVEL',
      hidden: true,
      sourceKey: SEED_SOURCES.pecDeadlines.key,
      acceptableLatencyMinutes: null,
    });
    const rait = (await services.freshness.stateOf(
      db.tx,
      FIXTURE_TENANT_ID,
      'IND-DASH-101',
    ))!;
    expect(rait).toMatchObject({
      state: 'FRESCO',
      hidden: false,
      sourceKey: SEED_SOURCES.raitOutbox.key,
    });
  });
});

describe('C-0002-39 — heartbeat pelo projetor + observe; fallback só toca last_read_at (§8.2, §8.5)', () => {
  const heartbeatEventId = cycleId(SPEC, 0x3901);
  const observedAt = new Date('2026-09-21T11:50:00.000Z');

  it('C-0002-39 dado evento source.heartbeat aplicado pelo projetor quando observe então last_seen_at = occurredAt e, com L=60, estado FRESCO', async () => {
    await setPortalSource(minutesBefore(150), 'DESATUALIZADO_MARCADO', {
      stale_since: minutesBefore(30),
      hidden: false,
    });
    const projector = DASHBOARD_MONITOR_PROJECTOR_LIST.find(
      (candidate) => candidate.projection === 'dashboard.source_freshness',
    )!;
    expect(projector).toBeDefined();
    db.ownProjectionEventId(heartbeatEventId);
    const event = {
      id: heartbeatEventId,
      type: 'source.heartbeat',
      version: 1,
      occurredAt: observedAt.toISOString(),
      tenantId: FIXTURE_TENANT_ID,
      actor: { kind: 'system' as const },
      aggregate: { kind: 'source', id: cycleId(SPEC, 0xf01), version: 7 },
      data: {
        sourceKey: SUITE_SOURCE_KEYS.portalOutbox,
        app: 'portal',
        observedAt: observedAt.toISOString(),
      },
    };
    const ctx: DashboardProjectionContext = {
      tx: db.tx,
      tenantId: FIXTURE_TENANT_ID,
      now: NOW,
    };
    const applied = await projector.apply(event, ctx);
    expect(applied.kind).toBe('applied');
    const afterProjector = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(new Date(afterProjector.last_seen_at as string).toISOString()).toBe(
      observedAt.toISOString(),
    );

    await services.freshness.observe(
      db.tx,
      SUITE_SOURCE_KEYS.portalOutbox,
      observedAt,
      ctxFor('system', NOW),
    );
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(new Date(source.last_seen_at as string).toISOString()).toBe(
      observedAt.toISOString(),
    );
    expect(source.state).toBe('FRESCO');
    expect(source.hidden).toBe(false);
    expect(source.stale_since).toBeNull();
    const events = await freshnessEvents(source.id as string);
    const last = events[events.length - 1]!;
    expect(last.payload.data).toMatchObject({
      fromState: 'DESATUALIZADO_MARCADO',
      toState: 'FRESCO',
      hidden: false,
    });
  });

  it('C-0002-39 dado observe com seenAt anterior ao last_seen_at atual então last_seen_at não retrocede', async () => {
    await services.freshness.observe(
      db.tx,
      SUITE_SOURCE_KEYS.portalOutbox,
      minutesBefore(300),
      ctxFor('system', NOW),
    );
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(new Date(source.last_seen_at as string).toISOString()).toBe(
      observedAt.toISOString(),
    );
    expect(source.state).toBe('FRESCO');
  });

  it('C-0002-39 dado o fallback do sweeper (passo 4) então last_read_at = now e last_seen_at não muda; o selo não melhora por fallback', async () => {
    await setPortalSource(minutesBefore(150), 'DESATUALIZADO_MARCADO', {
      stale_since: minutesBefore(30),
      last_read_at: minutesBefore(400),
    });
    const pairsBefore = await db.dutyCyclePairs();
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    await sweeper.runDue(NOW);
    // a virada (passo 2) de 2026-09-21 pode abrir pares novos: são da suíte
    const pairsAfter = await db.dutyCyclePairs();
    db.ownDutyCyclePairs(
      [...pairsAfter]
        .filter((pair) => !pairsBefore.has(pair))
        .map((pair) => ({
          dutyCode: pair.split('|')[0]!,
          period: pair.split('|')[1]!,
        })),
    );
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(new Date(source.last_read_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    expect(new Date(source.last_seen_at as string).toISOString()).toBe(
      minutesBefore(150).toISOString(),
    );
    expect(source.state).toBe('DESATUALIZADO_MARCADO');
  });
});
