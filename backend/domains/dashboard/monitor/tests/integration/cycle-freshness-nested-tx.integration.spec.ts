// Hotfix B9 (defeito de produto em main) — `DashboardFreshnessService.params()`
// faz `Promise.all` de duas `OpsParameterService.get`, cada uma abrindo
// `Database.tx`. Dentro de uma `Database.tx` externa (passo 3 do sweeper:
// `step` → `database.tx(work)` → `sweep` → `params`) as duas transações
// aninhadas viram `SAVEPOINT stynx_sp_1/2` concorrentes na MESMA conexão: o
// `RELEASE stynx_sp_1` da primeira libera também o `stynx_sp_2` (aninhado
// depois dele) e o `RELEASE stynx_sp_2` da segunda falha com
// `savepoint "stynx_sp_2" does not exist`. O passo do sweeper é então contado
// em silêncio como `skipped` (`catch` de `step`).
//
// Usa o `Database` REAL de `@stynx-nyx/data` (`tests/support/real-database.ts`)
// sob `role_app_backend` e o `OpsParameterService` REAL; o restante do
// harness do ciclo (`buildCycle`) mantém `LiveParameters` só como oráculo dos
// valores esperados. Esperado hoje: os casos "dentro de tx externa" ficam
// vermelhos SÓ pelo erro de savepoint; o controle (fora de tx) passa.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DashboardFreshnessService } from '../../src/handwritten/cycle/index.js';
import type { DashboardSweepDatabase } from '../../src/handwritten/cycle/index.js';
import {
  NullParameterCache,
  OpsParameterService,
  SqlParameterOutbox,
  type ParameterClock,
} from '@detran/ops-parameter';
import {
  FIXTURE_TENANT_ID,
  SUITE_SOURCE_KEYS,
  USERS,
  cycleId,
} from '../fixtures/cycle-fixtures.js';
import {
  CycleDb,
  InMemorySweepDiscovery,
  buildCycle,
  ctxFor,
  sweepTarget,
  type CycleServices,
} from '../support/cycle-harness.js';
import {
  createRealDatabase,
  type RealDatabaseHandle,
} from '../support/real-database.js';
import { DashboardClockSweeper } from '../../src/handwritten/cycle/index.js';
import { generateRequestId } from '@stynx-nyx/core';

const SPEC = '07';
const TODAY = '2026-09-21';
const NOW = new Date('2026-09-21T12:00:00.000Z');
const L = 60;
const SCOPE = {
  tenantId: FIXTURE_TENANT_ID,
  actorId: USERS.integrationOperator,
};
const parameterClock: ParameterClock = {
  today: () => TODAY,
  now: () => NOW.toISOString(),
};

const db = new CycleDb();
let services: CycleServices;
let real: RealDatabaseHandle;
let freshness: DashboardFreshnessService;

async function setPortalSource(lastSeenAt: Date, state: string) {
  await db.client.query(
    `update dashboard.source
        set state = $3, last_seen_at = $4, acceptable_latency_minutes = $5,
            heartbeat_contract = 'source.heartbeat', stale_since = null,
            hidden = false, version = 1
      where tenant_id = $1 and source_key = $2`,
    [FIXTURE_TENANT_ID, SUITE_SOURCE_KEYS.portalOutbox, state, lastSeenAt, L],
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
  services = buildCycle(db, TODAY);
  real = createRealDatabase();
  freshness = new DashboardFreshnessService(
    services.clock,
    new OpsParameterService(
      real.database as never,
      real.requestContext as never,
      parameterClock,
      new NullParameterCache(),
      new SqlParameterOutbox(),
    ),
  );
}, 60_000);

afterAll(async () => {
  await real?.end();
  await db.cleanup();
  await db.end();
});

describe('DashboardFreshnessService.params() com o Database real (hotfix B9, tx aninhada em Promise.all)', () => {
  it('C-B9-01 dado o Database real e nenhuma transação externa quando params() então devolve d e m vigentes (controle)', async () => {
    const expected = await services.freshness.params();
    const got = await real.run(SCOPE, () => freshness.params());
    expect(got).toEqual(expected);
    expect(got.heartbeatDivisor).toBeGreaterThan(0);
    expect(got.staleHideMultiplier).toBeGreaterThan(0);
  });

  it('C-B9-02 dado Database.tx externa sob role_app_backend quando params() então conclui e devolve os mesmos d e m (sem savepoint inexistente)', async () => {
    const expected = await services.freshness.params();
    const got = await real.run(SCOPE, () =>
      real.database.tx(async () => freshness.params()),
    );
    expect(got).toEqual(expected);
  });

  it('C-B9-03 dado Database.tx externa quando sweep(tx) sobre fonte com L e H então a fonte é reavaliada (DESATUALIZADO_MARCADO)', async () => {
    await setPortalSource(new Date(NOW.getTime() - 150 * 60_000), 'FRESCO');
    const changed = await real.run(SCOPE, () =>
      real.database.tx((tx) =>
        freshness.sweep(tx as never, ctxFor('system', NOW)),
      ),
    );
    expect(changed).toBe(1);
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(source.state).toBe('DESATUALIZADO_MARCADO');
  });
});

describe('DashboardFreshnessService.observe() com o Database real (mesma causa: params())', () => {
  it('C-B9-05 dado Database.tx externa e fonte com L e H quando observe com seenAt = now − 150 min então last_seen_at avança e o estado é reavaliado (DESATUALIZADO_MARCADO)', async () => {
    const seenAt = new Date(NOW.getTime() - 150 * 60_000);
    await setPortalSource(new Date(NOW.getTime() - 200 * 60_000), 'FRESCO');
    await real.run(SCOPE, () =>
      real.database.tx((tx) =>
        freshness.observe(
          tx as never,
          SUITE_SOURCE_KEYS.portalOutbox,
          seenAt,
          ctxFor('system', NOW),
        ),
      ),
    );
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(new Date(source.last_seen_at as string).toISOString()).toBe(
      seenAt.toISOString(),
    );
    expect(source.state).toBe('DESATUALIZADO_MARCADO');
  });
});

describe('passo 3 do sweeper com o Database real (hotfix B9)', () => {
  it('C-B9-04 dado fonte com L e H e o sweeper sobre Database.tx real quando runDue então o passo 3 não é skipped e sourcesChanged = 1', async () => {
    await setPortalSource(new Date(NOW.getTime() - 150 * 60_000), 'FRESCO');
    const target = sweepTarget();
    const pairsBefore = await db.dutyCyclePairs();
    const sweeper = new DashboardClockSweeper({
      clock: services.clock,
      calendar: services.calendar,
      discovery: new InMemorySweepDiscovery([target]),
      database: real.database as unknown as DashboardSweepDatabase,
      requestContext: {
        run: (context, work) =>
          real.mutator.runWithRequestContext(
            { ...context, requestId: generateRequestId() },
            work,
          ),
      },
      timers: services.timers,
      alerts: services.alerts,
      duties: services.duties,
      freshness,
      intervalMs: 0,
    });
    const [report] = await sweeper.runDue(NOW);
    const pairsAfter = await db.dutyCyclePairs();
    db.ownDutyCyclePairs(
      [...pairsAfter]
        .filter((pair) => !pairsBefore.has(pair))
        .map((pair) => ({
          dutyCode: pair.split('|')[0]!,
          period: pair.split('|')[1]!,
        })),
    );
    expect(report!.skipped).toBe(0);
    expect(report!.sourcesChanged).toBe(1);
    const source = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(source.state).toBe('DESATUALIZADO_MARCADO');
  });
});
