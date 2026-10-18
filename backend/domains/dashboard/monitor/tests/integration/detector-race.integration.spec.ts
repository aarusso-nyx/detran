// Prova de concorrência do detector (hotfix B9, defeito 2): o sweeper roda
// por instância, sem trava entre instâncias. Duas "instâncias" = duas
// conexões `role_app_backend` rodando `DashboardAlertService.detect` sobre o
// mesmo indicador/objeto. T1 detecta e fica aberta; T2 começa; T1 commita.
// O dedupe por chave (tenant, indicator_code, object_kind, object_ref, §6.2)
// exige um único alerta aberto — T2 tem de ver o alerta de T1.
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  DashboardClockSweeper,
  type DashboardAlertService,
  type DashboardDutyService,
  type DashboardSweepReport,
  type DetectionCell,
} from '../../src/handwritten/cycle/index.js';
import { FIXTURE_TENANT_ID, USERS } from '../fixtures/cycle-fixtures.js';
import {
  InMemorySweepDiscovery,
  buildCycle,
  ctxFor,
  sweepTarget,
  type CycleDb,
  type CycleServices,
} from '../support/cycle-harness.js';
import {
  RaceSession,
  cloneDatabase,
  deferred,
  interleave,
  summarize,
  type RaceDatabase,
} from './race-harness.js';

const NOW = new Date('2026-09-21T12:00:00.000Z');

let clone: RaceDatabase;
let owner: pg.Client;
let first: RaceSession;
let second: RaceSession;
let services: CycleServices;

function cell(objectRef: string): DetectionCell {
  return {
    projection: 'dashboard.prescription_risk',
    indicatorCode: 'IND-DASH-101',
    sourceApp: 'rait',
    objectKind: 'case',
    objectRef,
    objectLayer: 'N2',
    level: 'N1',
    governingClock: 'A',
    ceilingOn: '2027-03-09',
    nextMilestoneAt: new Date('2026-12-09T12:00:00.000Z'),
    occurredAt: NOW,
  };
}

function detect(
  session: RaceSession,
  objectRef: string,
  hold?: () => Promise<void>,
) {
  return session
    .database(FIXTURE_TENANT_ID, USERS.integrationOperator, hold)
    .tx((tx) =>
      services.alerts.detect(
        tx as never,
        cell(objectRef),
        ctxFor('system', NOW),
      ),
    );
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  await owner.query(`select set_config('app.role', 'owner', false)`);
  // Fixture (owner, só no clone): indicador conectado, como o detector
  // integration faz com `forceConnected`.
  await owner.query(
    `update dashboard.indicator set connected = true
      where tenant_id = $1 and code = 'IND-DASH-101'`,
    [FIXTURE_TENANT_ID],
  );
  services = buildCycle({ client: owner } as unknown as CycleDb, '2026-09-21');
  first = await RaceSession.open(clone.url, 'race-detector-t1');
  second = await RaceSession.open(clone.url, 'race-detector-t2');
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('detector em duas instâncias (checa e depois grava)', () => {
  it('dado célula N1 sem alerta quando duas instâncias rodam detect concorrentes então só um alerta é criado para a chave', async () => {
    const objectRef = randomUUID();
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => detect(first, objectRef, hold),
      runSecond: () => detect(second, objectRef),
    });
    expect(outcome.first).toMatchObject({
      status: 'fulfilled',
      value: { kind: 'detected' },
    });
    const alerts = await owner.query<{ id: string }>(
      `select id from dashboard.alert
        where tenant_id = $1 and indicator_code = 'IND-DASH-101'
          and object_kind = 'case' and object_ref = $2`,
      [FIXTURE_TENANT_ID, objectRef],
    );
    expect(alerts.rows).toHaveLength(1);
    expect(
      outcome.second,
      JSON.stringify(summarize(outcome.second)),
    ).toMatchObject({
      status: 'fulfilled',
      value: { kind: 'ignored', reason: 'open_alert' },
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });

  it('dado duas chaves quando duas instâncias do sweeper as detectam em ordem inversa (A→B × B→A) então nenhum passo aborta por deadlock e cada chave tem um alerta', async () => {
    const refA = randomUUID();
    const refB = randomUUID();
    const target = sweepTarget(FIXTURE_TENANT_ID);
    const errors: string[] = [];
    const firstCellDone = [deferred(), deferred()];
    const proceed = [deferred(), deferred()];

    /** Instância do sweeper com os serviços reais; só a ordem das células do
     * passo 4 é fixada (a do passo 1 segue os timers, a do passo 4 as
     * tabelas — ordens independentes) e há um ponto de parada entre a
     * primeira e a segunda chave, dentro da mesma transação. */
    function instance(index: 0 | 1, session: RaceSession, order: string[]) {
      const base = session.database(
        FIXTURE_TENANT_ID,
        USERS.integrationOperator,
      );
      const database = {
        tx: async <T>(work: (tx: never) => Promise<T>): Promise<T> => {
          try {
            return await base.tx(work as never);
          } catch (error) {
            errors.push(String((error as { code?: unknown }).code));
            throw error;
          }
        },
      };
      let detected = 0;
      const alerts = Object.create(services.alerts) as DashboardAlertService;
      alerts.fallbackCells = async () => order.map((ref) => cell(ref));
      alerts.detect = async (tx, detection, ctx) => {
        const result = await services.alerts.detect(tx, detection, ctx);
        detected += 1;
        if (detected === 1) {
          firstCellDone[index]!.resolve();
          await proceed[index]!.promise;
        }
        return result;
      };
      const duties = Object.create(services.duties) as DashboardDutyService;
      duties.fallbackCells = async () => [];
      return new DashboardClockSweeper({
        clock: services.clock,
        calendar: services.calendar,
        discovery: new InMemorySweepDiscovery([target]),
        database,
        requestContext: { run: (_context, work) => work() },
        timers: services.timers,
        alerts,
        duties,
        freshness: services.freshness,
        intervalMs: 0,
      }).runTenant(target, NOW);
    }

    const runA: Promise<DashboardSweepReport> = instance(0, first, [
      refA,
      refB,
    ]);
    await firstCellDone[0]!.promise;
    const runB: Promise<DashboardSweepReport> = instance(1, second, [
      refB,
      refA,
    ]);
    // T2 ou chega à primeira chave (sem serialização) ou bloqueia antes.
    let secondState: 'holding' | 'blocked' | undefined;
    void firstCellDone[1]!.promise.then(() => {
      secondState ??= 'holding';
    });
    for (let probe = 0; probe < 400 && !secondState; probe += 1) {
      const activity = await owner.query<{ wait_event_type: string | null }>(
        'select wait_event_type from pg_stat_activity where pid = $1',
        [second.pid],
      );
      if (activity.rows[0]?.wait_event_type === 'Lock') secondState = 'blocked';
      else await new Promise((done) => setTimeout(done, 25));
    }
    expect(secondState).toBeDefined();
    proceed[0]!.resolve();
    proceed[1]!.resolve();
    const reports = await Promise.all([runA, runB]);

    expect(errors).not.toContain('40P01');
    expect(reports.map((report) => report.skipped)).toEqual([0, 0]);
    for (const objectRef of [refA, refB]) {
      const alerts = await owner.query<{ id: string }>(
        `select id from dashboard.alert
          where tenant_id = $1 and indicator_code = 'IND-DASH-101'
            and object_kind = 'case' and object_ref = $2`,
        [FIXTURE_TENANT_ID, objectRef],
      );
      expect(alerts.rows).toHaveLength(1);
    }
    expect(secondState).toBe('blocked');
  }, 60_000);
});
