// CTG-0002 §15.1 C-0002-17, 18, 21, 40, 41, 42, 49 [int] — relógio próprio
// (`DashboardClockService`, §13.1/§13.2) e `DashboardClockSweeper.runDue(now)`
// (§13.3: passos 1→4, uma transação por passo, idempotência por
// `ux_dashboard_timer_arm` e por `fire` → false). `new DashboardClockSweeper
// (deps)` com `FixedClock` e discovery em memória; `runDue(now)` explícito,
// nunca `setInterval`. Tudo criado no namespace `0083 03…` e apagado no
// `afterAll`; nenhum id do seed 81 é escrito.
// A18 (uma conexão por arquivo): C-0002-41 prova a idempotência com duas
// execuções sequenciais + `fire` explícito devolvendo `false` — a corrida real
// entre duas conexões fica registrada como limitação (OD no relatório).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type {
  DashboardSweepReport,
  DashboardTimer,
} from '../../src/handwritten/cycle/index.js';
import {
  ESCALATION_CHAIN,
  FIXTURE_TENANT_ID,
  FIXTURE_TENANT_TZ,
  ORIGIN_OBJECTS,
  ROLES,
  SECOND_TENANT_ID,
  SECOND_TENANT_TZ,
  SEED_DUTIES,
  SUITE_SOURCE_KEYS,
  USERS,
  cycleId,
  endOfDayManaus,
  seedAlertBy,
} from '../fixtures/cycle-fixtures.js';
import {
  CycleDb,
  buildCycle,
  buildSweeper,
  ensureSuiteSources,
  sweepTarget,
  type CycleServices,
} from '../support/cycle-harness.js';

const SPEC = '03';
/** `now` do sweeper: 2026-10-01 12:00 Manaus (quinta-feira útil). */
const NOW = new Date('2026-10-01T16:00:00.000Z');
const db = new CycleDb();
let services: CycleServices;
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));

function notifiedAlert(
  id: string,
  overrides: Record<string, unknown> = {},
): Promise<void> {
  return db.cloneAlert(seedAlertBy('NOTIFICADO', 'extinction').id, id, {
    object_ref: ORIGIN_OBJECTS.raitCase08,
    severity: 'N1',
    escalation_level: 1,
    owner_role: ROLES.raitAnalyst,
    ...overrides,
  });
}

async function armedTimer(
  ownerKind: 'alert' | 'duty_cycle' | 'source',
  ownerId: string,
  code: string,
  startedAt: Date,
  dueAt: Date | null,
  tenantId: string = FIXTURE_TENANT_ID,
): Promise<string> {
  const id = nextId();
  await db.insertTimer({
    id,
    tenant_id: tenantId,
    owner_kind: ownerKind,
    owner_id: ownerId,
    code,
    started_at: startedAt,
    due_at: dueAt,
    status: 'ARMADO',
    version: 1,
  });
  return id;
}

beforeAll(async () => {
  await db.connect();
  await ensureSuiteSources(db, SPEC, NOW, cycleId);
  await db.forceConnected('IND-DASH-101', true);
  services = buildCycle(db, '2026-10-01');
});

afterAll(async () => {
  await db.cleanup();
  await db.end();
});

describe('C-0002-42 — arm idempotente e due sem due_at nulo (§13.1, §2.1)', () => {
  it('C-0002-42 dado arm repetido com a mesma chave (ownerKind, ownerId, code, startedAt) então uma linha (ux_dashboard_timer_arm) e o mesmo id devolvido', async () => {
    const alertId = nextId();
    await notifiedAlert(alertId); // caso 08; o caso 09 é reservado à célula do fallback (C-0002-40)
    const input = {
      ownerKind: 'alert' as const,
      ownerId: alertId,
      code: 'T-DASH-ACK-N1' as const,
      startedAt: NOW,
    };
    const first = await services.timers.arm(
      db.tx,
      FIXTURE_TENANT_ID,
      FIXTURE_TENANT_TZ,
      input,
    );
    const second = await services.timers.arm(
      db.tx,
      FIXTURE_TENANT_ID,
      FIXTURE_TENANT_TZ,
      input,
    );
    expect(second.id).toBe(first.id);
    expect(first.status).toBe('ARMADO');
    const rows = await db.timers(alertId);
    expect(rows.filter((row) => row.code === 'T-DASH-ACK-N1')).toHaveLength(1);
    expect(new Date(rows[0]!.due_at as string).toISOString()).toBe(
      first.dueAt!.toISOString(),
    );
  });

  it('C-0002-42 dado arm com started_at distinto então outra linha (chave única distinta ⇒ um timer por notificação, §6.4 item 3)', async () => {
    const alertId = nextId();
    await notifiedAlert(alertId, { object_ref: ORIGIN_OBJECTS.raitCase10 });
    const later = new Date(NOW.getTime() + 60_000);
    const a = await services.timers.arm(
      db.tx,
      FIXTURE_TENANT_ID,
      FIXTURE_TENANT_TZ,
      {
        ownerKind: 'alert',
        ownerId: alertId,
        code: 'T-DASH-ACK-N2',
        startedAt: NOW,
      },
    );
    const b = await services.timers.arm(
      db.tx,
      FIXTURE_TENANT_ID,
      FIXTURE_TENANT_TZ,
      {
        ownerKind: 'alert',
        ownerId: alertId,
        code: 'T-DASH-ACK-N2',
        startedAt: later,
      },
    );
    expect(a.id).not.toBe(b.id);
    expect(await db.timers(alertId)).toHaveLength(2);
  });

  it('C-0002-42 dado T-DASH-MARCO-75 armado sem windowEnd (due_at nulo) quando due(now muito à frente) então nunca é devolvido', async () => {
    const alertId = nextId();
    await notifiedAlert(alertId, { object_ref: ORIGIN_OBJECTS.raitCase11 });
    const armed = await services.timers.arm(
      db.tx,
      FIXTURE_TENANT_ID,
      FIXTURE_TENANT_TZ,
      {
        ownerKind: 'alert',
        ownerId: alertId,
        code: 'T-DASH-MARCO-75',
        startedAt: NOW,
      },
    );
    expect(armed.dueAt).toBeNull();
    const due: DashboardTimer[] = await services.timers.due(
      db.tx,
      FIXTURE_TENANT_ID,
      new Date('2099-01-01T00:00:00.000Z'),
    );
    expect(due.every((timer) => timer.dueAt !== null)).toBe(true);
    expect(due.map((timer) => timer.id)).not.toContain(armed.id);
  });

  it('C-0002-42 dado satisfy/cancel em timer ARMADO então SATISFEITO/CANCELADO com carimbo e reason; em outro estado é no-op', async () => {
    const alertId = nextId();
    await notifiedAlert(alertId, { object_ref: ORIGIN_OBJECTS.raitCase12 });
    const toSatisfy = await armedTimer(
      'alert',
      alertId,
      'T-DASH-ACK-N1',
      NOW,
      new Date(NOW.getTime() + 3_600_000),
    );
    const toCancel = await armedTimer(
      'alert',
      alertId,
      'T-DASH-ACK-N2',
      NOW,
      new Date(NOW.getTime() + 3_600_000),
    );
    await services.timers.satisfy(db.tx, FIXTURE_TENANT_ID, toSatisfy, 'ack');
    await services.timers.cancel(
      db.tx,
      FIXTURE_TENANT_ID,
      toCancel,
      'alert_closed',
    );
    expect(await db.timerById(toSatisfy)).toMatchObject({
      status: 'SATISFEITO',
      reason: 'ack',
    });
    expect((await db.timerById(toSatisfy))!.satisfied_at).not.toBeNull();
    expect(await db.timerById(toCancel)).toMatchObject({
      status: 'CANCELADO',
      reason: 'alert_closed',
    });
    // no-op fora de ARMADO
    await services.timers.cancel(
      db.tx,
      FIXTURE_TENANT_ID,
      toSatisfy,
      'alert_closed',
    );
    expect(await db.timerById(toSatisfy)).toMatchObject({
      status: 'SATISFEITO',
      reason: 'ack',
    });
    const cancelled = await services.timers.cancelAll(
      db.tx,
      FIXTURE_TENANT_ID,
      'alert',
      alertId,
      'alert_closed',
    );
    expect(cancelled).toBe(0);
  });
});

// Primeiro `runDue` do arquivo: é aqui que a virada de 2026-10-01 (passo 2)
// acontece pela primeira vez — os `runDue` seguintes a encontram idempotente.
describe('C-0002-40/41 — runDue: relatório, ordem 1→4 e idempotência (§13.3)', () => {
  const ackAlert = cycleId(SPEC, 0x4001);
  const ackTimerStart = new Date('2026-09-28T12:00:00.000Z');

  it('C-0002-40 dado runDue(now) com um timer de cada família vencido, uma virada e uma fonte atrasada quando executado então o relatório traz firedTimers, dutyCyclesOpened, sourcesChanged, alertsDetected corretos e a ordem 1→4 é observável', async () => {
    // (1) timers vencidos: ACK (alerta), MARCO (alerta de dever), DUTY (ciclo)
    await notifiedAlert(ackAlert, { object_ref: ORIGIN_OBJECTS.raitCase14 });
    await armedTimer(
      'alert',
      ackAlert,
      'T-DASH-ACK-N1',
      ackTimerStart,
      new Date('2026-09-29T12:00:00.000Z'),
    );

    // ciclo com T-DASH-DUTY-201 vencido (deadline_on 2026-09-20 < now);
    // IND-DASH-201 fica `connected=false` (seed 80) ⇒ o fallback (passo 4)
    // é mudo para deveres e só o timer (passo 1) age — alertsDetected exato.
    const lateCycle = nextId();
    await db.insertDutyCycle({
      id: lateCycle,
      tenant_id: FIXTURE_TENANT_ID,
      duty_code: 'DUTY-01',
      period: '2025-08',
      state: 'JANELA_ABERTA',
      deadline_on: '2026-09-20',
      opened_at: new Date('2026-08-01T12:00:00.000Z'),
      version: 1,
    });
    await armedTimer(
      'duty_cycle',
      lateCycle,
      'T-DASH-DUTY-201',
      new Date('2026-08-01T12:00:00.000Z'),
      endOfDayManaus('2026-09-20'),
    );

    const milestoneCycle = nextId();
    await db.insertDutyCycle({
      id: milestoneCycle,
      tenant_id: FIXTURE_TENANT_ID,
      duty_code: 'DUTY-01',
      period: '2025-10',
      state: 'EM_APURACAO',
      deadline_on: '2026-10-10',
      opened_at: new Date('2026-09-01T12:00:00.000Z'),
      version: 1,
    });
    const milestoneAlert = nextId();
    await db.cloneAlert(
      seedAlertBy('EM_TRATAMENTO', 'irregularity').id,
      milestoneAlert,
      {
        indicator_code: 'IND-DASH-201',
        block: 'B',
        source_app: 'institucional',
        object_kind: 'duty_cycle',
        object_ref: milestoneCycle,
        object_layer: 'N0',
        owner_role: ROLES.dashDutyOwner,
        severity: 'N1',
        escalation_level: 1,
        governing_clock: null,
        ceiling_on: null,
      },
    );
    await armedTimer(
      'alert',
      milestoneAlert,
      'T-DASH-MARCO-75',
      new Date('2026-09-01T12:00:00.000Z'),
      new Date('2026-10-01T04:00:00.000Z'),
    );

    // (3) fonte atrasada: portal.outbox da suíte com L=60 e leitura há 90 min
    await db.client.query(
      `update dashboard.source set acceptable_latency_minutes = 60, last_seen_at = $2 where tenant_id = $1 and source_key = $3`,
      [
        FIXTURE_TENANT_ID,
        new Date(NOW.getTime() - 90 * 60_000),
        SUITE_SOURCE_KEYS.portalOutbox,
      ],
    );

    // (4) célula própria fora da faixa para o fallback (prescription_risk, IND-DASH-101)
    const fallbackEvent = nextId();
    await db.insertProjectionCell('prescription_risk', {
      id: nextId(),
      tenant_id: FIXTURE_TENANT_ID,
      case_id: ORIGIN_OBJECTS.raitCase09,
      clock_code: 'A',
      indicator_code: 'IND-DASH-101',
      flag: 'ALERTA_N1',
      ceiling_on: '2027-03-09',
      flag_changed_at: new Date('2026-09-30T12:00:00.000Z'),
      last_event_id: fallbackEvent,
      event_schema_version: 1,
      aggregate_version: 1,
    });

    const pairsBefore = await db.dutyCyclePairs();
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const [report] = await sweeper.runDue(NOW);
    const pairsAfter = await db.dutyCyclePairs();
    const opened = [...pairsAfter].filter((pair) => !pairsBefore.has(pair));
    db.ownDutyCyclePairs(
      opened.map((pair) => {
        const [dutyCode, period] = pair.split('|');
        return { dutyCode: dutyCode!, period: period! };
      }),
    );

    expect(report).toMatchObject({
      tenantId: FIXTURE_TENANT_ID,
      firedTimers: 3,
      dutyCyclesLate: 1,
      sourcesChanged: 1,
      skipped: 0,
    });
    // (2) virada em 2026-10-01 (Manaus): DUTY-01/02/04 2026-10, DUTY-05 2026,
    // DUTY-PNATRANS 2026 (DUTY-07 2025 e DUTY-10 2026 já existem no seed).
    expect(opened.sort()).toEqual(
      [
        'DUTY-01|2026-10',
        'DUTY-02|2026-10',
        'DUTY-04|2026-10',
        'DUTY-05|2026',
        'DUTY-PNATRANS|2026',
      ].sort(),
    );
    expect(report!.dutyCyclesOpened).toBe(opened.length);
    expect(report!.alertsDetected).toBe(1); // só a célula prescription_risk (IND-DASH-101 conectado)
    expect(report!.dutyCyclesUnfulfilled).toBe(0);

    // efeitos
    expect((await db.alert(ackAlert))!.escalation_level).toBe(2);
    expect((await db.dutyCycle(lateCycle))!.state).toBe('ATRASADO');
    expect((await db.alert(milestoneAlert))!.severity).toBe('N2');
    expect((await db.source(SUITE_SOURCE_KEYS.portalOutbox))!.state).toBe(
      'ATRASADO',
    );
    const fallbackAlerts = await db.alertsByObject(
      'IND-DASH-101',
      'case',
      ORIGIN_OBJECTS.raitCase09,
    );
    expect(fallbackAlerts).toHaveLength(1);
    const fallbackTrail = await db.trail(fallbackAlerts[0]!.id as string);
    expect(fallbackTrail[0]!.note).toBe('fallback');
    expect(fallbackAlerts[0]!.source_event_id).toBeNull();

    // ordem 1→4: a escalada do ACK (passo 1) foi gravada antes da detecção
    // por fallback (passo 4) — transações distintas, `created_at` crescente.
    const ackTrail = await db.trail(ackAlert);
    const escalation = ackTrail.find((line) => line.to_state === 'ESCALONADO')!;
    expect(new Date(escalation.created_at as string).getTime()).toBeLessThan(
      new Date(fallbackTrail[0]!.created_at as string).getTime(),
    );
    // o selo da fonte não melhora por fallback (§8.5): last_read_at muda, last_seen_at não
    const portal = (await db.source(SUITE_SOURCE_KEYS.portalOutbox))!;
    expect(new Date(portal.last_seen_at as string).getTime()).toBe(
      NOW.getTime() - 90 * 60_000,
    );
  });

  it('C-0002-41 dado runDue disparado de novo com o mesmo now então fire devolve false para o timer já vencido e há uma transição e um evento por timer', async () => {
    const timers = await db.timers(ackAlert);
    const fired = timers.find((timer) => timer.status === 'VENCIDO');
    expect(
      fired,
      'C-0002-40 precisa ter vencido o T-DASH-ACK-N1',
    ).toBeDefined();
    const again = await services.timers.fire(
      db.tx,
      FIXTURE_TENANT_ID,
      fired!.id as string,
      NOW,
    );
    expect(again).toBe(false);

    const before = {
      trail: await db.trail(ackAlert),
      events: await db.outboxFor(ackAlert),
    };
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const [report] = await sweeper.runDue(NOW);
    expect(report!.firedTimers).toBe(0);
    expect(report!.dutyCyclesOpened).toBe(0);
    expect(report!.sourcesChanged).toBe(0);
    const trail = await db.trail(ackAlert);
    expect(trail).toHaveLength(before.trail.length);
    expect(trail.filter((line) => line.to_state === 'ESCALONADO')).toHaveLength(
      1,
    );
    const events = await db.outboxFor(ackAlert);
    expect(events).toHaveLength(before.events.length);
    expect(
      events.filter((row) => row.payload.domainEvent === 'ALERTA_ESCALONADO'),
    ).toHaveLength(1);
  });

  it('C-0002-41 dado fire em timer ARMADO então true e VENCIDO com fired_at = now; segundo fire então false (idempotência do sweeper)', async () => {
    const alertId = nextId();
    await notifiedAlert(alertId, { object_ref: ORIGIN_OBJECTS.raitCase10 });
    const timer = await armedTimer(
      'alert',
      alertId,
      'T-DASH-ACK-N2',
      ackTimerStart,
      new Date('2026-09-29T12:00:00.000Z'),
    );
    expect(
      await services.timers.fire(db.tx, FIXTURE_TENANT_ID, timer, NOW),
    ).toBe(true);
    expect(await db.timerById(timer)).toMatchObject({ status: 'VENCIDO' });
    expect(
      await services.timers.fire(db.tx, FIXTURE_TENANT_ID, timer, NOW),
    ).toBe(false);
  });
});

describe('C-0002-17/18 — SLA de ACK vencido: ESCALONADO → NOTIFICADO no nível seguinte (§6.1 60/65, §6.8)', () => {
  const alertId = cycleId(SPEC, 0x1701);
  let overdue: string;

  it('C-0002-17 dado alerta NOTIFICADO (nível 1, rait) com T-DASH-ACK-N1 vencido quando runDue(now) então trilhas 60 (timer) e 65 (system), escalation_level=2, novo T-DASH-ACK-N1 com started_at = now, evento ALERTA_ESCALONADO com recipientRole=rait-coordinator', async () => {
    await notifiedAlert(alertId);
    overdue = await armedTimer(
      'alert',
      alertId,
      'T-DASH-ACK-N1',
      new Date('2026-09-28T12:00:00.000Z'),
      new Date('2026-09-29T12:00:00.000Z'),
    );
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const reports = await sweeper.runDue(NOW);
    expect(reports).toHaveLength(1);
    expect(reports[0]!.tenantId).toBe(FIXTURE_TENANT_ID);
    expect(reports[0]!.firedTimers).toBe(1);

    const alert = (await db.alert(alertId))!;
    expect(alert.state).toBe('NOTIFICADO');
    expect(alert.escalation_level).toBe(2);
    expect(new Date(alert.escalated_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );

    const trail = await db.trail(alertId);
    const tail = trail.slice(-2);
    expect(tail[0]).toMatchObject({
      from_state: 'NOTIFICADO',
      to_state: 'ESCALONADO',
      actor_kind: 'timer',
      actor_ref: 'T-DASH-ACK-N1',
    });
    expect(tail[1]).toMatchObject({
      from_state: 'ESCALONADO',
      to_state: 'NOTIFICADO',
      actor_kind: 'system',
      note: `notified:2:${ROLES.raitCoordinator}`,
    });

    const timers = await db.timers(alertId);
    expect(await db.timerById(overdue)).toMatchObject({ status: 'VENCIDO' });
    expect(
      new Date((await db.timerById(overdue))!.fired_at as string).toISOString(),
    ).toBe(NOW.toISOString());
    const fresh = timers.filter((timer) => timer.status === 'ARMADO');
    expect(fresh).toHaveLength(1);
    expect(fresh[0]).toMatchObject({
      code: 'T-DASH-ACK-N1',
      owner_kind: 'alert',
    });
    expect(new Date(fresh[0]!.started_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );

    const events = await db.outboxFor(alertId);
    const escalated = events.filter(
      (row) => row.payload.domainEvent === 'ALERTA_ESCALONADO',
    );
    expect(escalated).toHaveLength(1);
    expect(escalated[0]!.payload.data).toMatchObject({
      recipientRole: ROLES.raitCoordinator,
      recipientLevel: 2,
      chainStatus: 'vigente',
      escalationLevel: 2,
    });
    expect(escalated[0]!.payload.actor.kind).toBe('timer');
  });

  it('C-0002-17 dado runDue(now) de novo então nada muda (idempotência: um evento por timer)', async () => {
    const before = {
      alert: (await db.alert(alertId))!,
      trail: await db.trail(alertId),
      timers: await db.timers(alertId),
      events: await db.outboxFor(alertId),
    };
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const reports = await sweeper.runDue(NOW);
    expect(reports[0]!.firedTimers).toBe(0);
    expect((await db.alert(alertId))!.version).toBe(before.alert.version);
    expect((await db.alert(alertId))!.escalation_level).toBe(2);
    expect(await db.trail(alertId)).toHaveLength(before.trail.length);
    expect(await db.timers(alertId)).toHaveLength(before.timers.length);
    expect(await db.outboxFor(alertId)).toHaveLength(before.events.length);
  });

  it('C-0002-18 dado alerta NOTIFICADO nível 5 (rait) com ACK vencido quando runDue então permanece ESCALONADO com trilha chain_exhausted e sem timer novo (OD-D40)', async () => {
    const exhausted = nextId();
    await notifiedAlert(exhausted, {
      object_ref: ORIGIN_OBJECTS.raitCase13,
      escalation_level: ESCALATION_CHAIN.filter(
        (row) => row.sourceApp === 'rait',
      ).length,
      severity: 'N3',
    });
    const timer = await armedTimer(
      'alert',
      exhausted,
      'T-DASH-ACK-N3',
      new Date('2026-09-30T12:00:00.000Z'),
      new Date('2026-09-30T14:00:00.000Z'),
    );
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    await sweeper.runDue(NOW);
    const alert = (await db.alert(exhausted))!;
    expect(alert.state).toBe('ESCALONADO');
    expect(alert.escalation_level).toBe(5);
    const trail = await db.trail(exhausted);
    expect(trail[trail.length - 1]).toMatchObject({
      to_state: 'ESCALONADO',
      note: 'chain_exhausted',
    });
    expect(trail.filter((line) => line.to_state === 'ESCALONADO')).toHaveLength(
      1,
    );
    expect(await db.timerById(timer)).toMatchObject({ status: 'VENCIDO' });
    expect(
      (await db.timers(exhausted)).filter((row) => row.status === 'ARMADO'),
    ).toHaveLength(0);
    // segunda varredura: nada
    await sweeper.runDue(NOW);
    expect(await db.trail(exhausted)).toHaveLength(trail.length);
  });
});

describe('C-0002-21 — marco de dever vencido em EM_TRATAMENTO: 90 → 65 (§6.3, §13.3 passo 1)', () => {
  it("C-0002-21 dado alerta EM_TRATAMENTO de dever com T-DASH-MARCO-75 vencido quando runDue então 90 → 65, severity='N2', next_milestone_at = due_at do T-DASH-MARCO-90", async () => {
    // Janela [opened_at, fim do dia deadline_on] com 75% já decorrido em
    // `now` (2026-10-01 16:00Z) e 90% ainda à frente; período fora do seed
    // 81 e fora das viradas de 2026-10-01 (`ux_dashboard_duty_cycle_period`).
    const cycle = nextId();
    await db.insertDutyCycle({
      id: cycle,
      tenant_id: FIXTURE_TENANT_ID,
      duty_code: 'DUTY-01',
      period: '2025-09',
      state: 'EM_APURACAO',
      deadline_on: '2026-10-10',
      opened_at: new Date('2026-09-01T12:00:00.000Z'),
      started_at: new Date('2026-09-02T12:00:00.000Z'),
      version: 1,
    });
    const alertId = nextId();
    await db.cloneAlert(
      seedAlertBy('EM_TRATAMENTO', 'irregularity').id,
      alertId,
      {
        indicator_code: 'IND-DASH-201',
        block: 'B',
        source_app: 'institucional',
        object_kind: 'duty_cycle',
        object_ref: cycle,
        object_layer: 'N0',
        owner_role: ROLES.dashDutyOwner,
        severity: 'N1',
        escalation_level: 1,
        governing_clock: null,
        ceiling_on: null,
        next_milestone_at: null,
      },
    );
    const windowStart = new Date('2026-09-01T12:00:00.000Z');
    const windowEnd = endOfDayManaus('2026-10-10');
    const pct = (p: number) =>
      new Date(
        windowStart.getTime() +
          (p / 100) * (windowEnd.getTime() - windowStart.getTime()),
      );
    await armedTimer('alert', alertId, 'T-DASH-MARCO-50', windowStart, pct(50));
    const m50 = (await db.timers(alertId))[0]!.id as string;
    await services.timers.satisfy(
      db.tx,
      FIXTURE_TENANT_ID,
      m50,
      'milestone_passed',
    );
    await armedTimer('alert', alertId, 'T-DASH-MARCO-75', windowStart, pct(75));
    const m90 = await armedTimer(
      'alert',
      alertId,
      'T-DASH-MARCO-90',
      windowStart,
      pct(90),
    );

    expect(pct(75).getTime()).toBeLessThan(NOW.getTime());
    expect(pct(90).getTime()).toBeGreaterThan(NOW.getTime());

    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const reports = await sweeper.runDue(NOW);
    expect(reports[0]!.firedTimers).toBe(1); // só o MARCO-75 ≤ now

    const alert = (await db.alert(alertId))!;
    expect(alert.severity).toBe('N2');
    expect(alert.state).toBe('NOTIFICADO');
    expect(alert.escalation_level).toBe(2);
    expect(new Date(alert.next_milestone_at as string).toISOString()).toBe(
      pct(90).toISOString(),
    );
    const trail = await db.trail(alertId);
    const tail = trail.slice(-2);
    expect(tail[0]).toMatchObject({
      from_state: 'EM_TRATAMENTO',
      to_state: 'ESCALONADO',
      actor_kind: 'timer',
      actor_ref: 'T-DASH-MARCO-75',
    });
    expect(tail[1]).toMatchObject({
      from_state: 'ESCALONADO',
      to_state: 'NOTIFICADO',
      actor_kind: 'system',
    });
    expect((await db.timerById(m90))!.status).toBe('ARMADO');
    expect(new Date(alert.next_milestone_at as string).toISOString()).toBe(
      new Date((await db.timerById(m90))!.due_at as string).toISOString(),
    );
  });
});

describe('C-0002-49 — varredura por tenant e RLS (§13.3, ADR-0002)', () => {
  it('C-0002-49 dado discovery em memória com dois tenants quando runDue então cada tenant é varrido no seu contexto e o RLS impede efeito cruzado (contagem por tenant)', async () => {
    const alertA = nextId();
    await notifiedAlert(alertA, { object_ref: ORIGIN_OBJECTS.raitCase11 });
    await armedTimer(
      'alert',
      alertA,
      'T-DASH-ACK-N1',
      ackTimerStartFor(),
      new Date('2026-09-29T12:00:00.000Z'),
    );

    // tenant B: alerta + timer próprios, escritos no contexto do tenant B
    await db.setTenant(SECOND_TENANT_ID);
    const alertB = nextId();
    await db.insertAlert({
      id: alertB,
      tenant_id: SECOND_TENANT_ID,
      indicator_code: 'IND-DASH-101',
      track: 'extinction',
      state: 'NOTIFICADO',
      severity: 'N1',
      block: 'A',
      source_app: 'rait',
      object_kind: 'case',
      object_ref: ORIGIN_OBJECTS.raitCase08,
      object_layer: 'N2',
      owner_role: ROLES.raitAnalyst,
      governing_clock: 'A',
      escalation_level: 1,
      detected_at: new Date('2026-09-28T12:00:00.000Z'),
      classified_at: new Date('2026-09-28T12:00:00.000Z'),
      notified_at: new Date('2026-09-28T12:00:00.000Z'),
      version: 1,
    });
    const timerB1 = await armedTimer(
      'alert',
      alertB,
      'T-DASH-ACK-N1',
      ackTimerStartFor(),
      new Date('2026-09-29T12:00:00.000Z'),
      SECOND_TENANT_ID,
    );
    const timerB2 = await armedTimer(
      'alert',
      alertB,
      'T-DASH-ACK-N2',
      ackTimerStartFor(1),
      new Date('2026-09-29T13:00:00.000Z'),
      SECOND_TENANT_ID,
    );
    await db.setTenant(FIXTURE_TENANT_ID);

    const sweeper = buildSweeper(db, services, [
      sweepTarget(FIXTURE_TENANT_ID, FIXTURE_TENANT_TZ),
      sweepTarget(
        SECOND_TENANT_ID,
        SECOND_TENANT_TZ,
        USERS.integrationOperator,
      ),
    ]);
    const reports: readonly DashboardSweepReport[] = await sweeper.runDue(NOW);
    expect(reports.map((report) => report.tenantId)).toEqual([
      FIXTURE_TENANT_ID,
      SECOND_TENANT_ID,
    ]);
    expect(reports[0]!.firedTimers).toBe(1);
    expect(reports[1]!.firedTimers).toBe(2);

    await db.setTenant(FIXTURE_TENANT_ID);
    expect((await db.alert(alertA))!.escalation_level).toBe(2);
    await db.setTenant(SECOND_TENANT_ID);
    expect((await db.timerById(timerB1))!.status).toBe('VENCIDO');
    expect((await db.timerById(timerB2))!.status).toBe('VENCIDO');
    const b = (await db.alert(alertB))!;
    expect(b.tenant_id).toBe(SECOND_TENANT_ID);
    const eventsB = await db.outboxFor(alertB, SECOND_TENANT_ID);
    expect(eventsB.every((row) => row.tenant_id === SECOND_TENANT_ID)).toBe(
      true,
    );
    expect(
      eventsB.every((row) => row.payload.tenantId === SECOND_TENANT_ID),
    ).toBe(true);
    const eventsA = await db.outboxFor(alertA);
    expect(eventsA.every((row) => row.tenant_id === FIXTURE_TENANT_ID)).toBe(
      true,
    );
    await db.setTenant(FIXTURE_TENANT_ID);
  });

  it('C-0002-49 dado o contexto RLS de role_app_backend no tenant B quando se lê o alerta do tenant A então nenhuma linha (isolamento, padrão rls.integration.spec.ts)', async () => {
    const alertA = nextId();
    await notifiedAlert(alertA, { object_ref: ORIGIN_OBJECTS.raitCase12 });
    await db.client.query('begin');
    try {
      await db.client.query('set local role role_app_backend');
      await db.client.query(`select set_config('app.tenant_id', $1, true)`, [
        SECOND_TENANT_ID,
      ]);
      const crossed = await db.client.query(
        `select id from dashboard.alert where id = $1`,
        [alertA],
      );
      expect(crossed.rows).toHaveLength(0);
      const timers = await db.client.query(
        `select id from dashboard.timer where owner_id = $1`,
        [alertA],
      );
      expect(timers.rows).toHaveLength(0);
    } finally {
      await db.client.query('rollback');
    }
  });
});

function ackTimerStartFor(offsetHours = 0): Date {
  return new Date(
    new Date('2026-09-28T12:00:00.000Z').getTime() + offsetHours * 3_600_000,
  );
}

// Sanidade: os deveres de virada existem no seed 80 (C-0002-40 depende deles).
describe('sanidade do seed 80 para a virada (§7.2)', () => {
  it('dado os deveres DUTY-01/02/04/05/07/10/PNATRANS quando lidos então existem com os ids canônicos', async () => {
    const rows = await db.client.query<{ id: string; code: string }>(
      `select id, code from dashboard.duty where tenant_id = $1 and code = any($2::text[]) order by code`,
      [
        FIXTURE_TENANT_ID,
        [
          'DUTY-01',
          'DUTY-02',
          'DUTY-04',
          'DUTY-05',
          'DUTY-07',
          'DUTY-10',
          'DUTY-PNATRANS',
        ],
      ],
    );
    expect(rows.rows).toHaveLength(7);
    for (const row of rows.rows)
      expect(SEED_DUTIES[row.code as keyof typeof SEED_DUTIES]).toBe(row.id);
  });
});
