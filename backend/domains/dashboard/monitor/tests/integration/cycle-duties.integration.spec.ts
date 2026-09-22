// CTG-0002 §15.1 C-0002-26…35 [int] — deveres (§7): sweeper de viradas
// (`turnOver`, §7.2), `ATRASADO`/`NAO_CUMPRIDO`, matriz de comandos por
// `duty_transition_ref` (§7.3), evidência (`prove`), dono (§7.4) e `archive`.
// Os 8 ciclos do seed 81 são só leitura (um único par `(duty_code, period)`
// por dever no DDL): a matriz usa ciclos próprios `DUTY-01 2024-01…08`; as
// viradas criam pares novos (ids gerados) que o spec identifica pelo `diff`
// de pares antes/depois e apaga — nunca um par do seed. `IND-DASH-202`
// `connected` forçado `true` (C-0002-28) e restaurado; fonte `dashboard`
// (estado próprio, §8.3) inserida `FRESCO`.
// Registros no relatório: (a) C-0002-28 usa `DUTY-02 2026-06` (o par
// `2026-08` do critério é o seed `…0307`, único) e `now` = fim do dia
// `deadline_on` em Manaus (o `2026-09-01T03:00Z` do critério é 23:00 de
// 31/08 em Manaus, antes do `due_at` de §13.2); (b) "ciclo anterior" lido
// como o período imediatamente anterior (o seed `DUTY-02 2026-08 ATRASADO`
// fica intacto); (c) C-0002-35 "trilha" de ciclo = `actor` do evento
// publicado (não há tabela de trilha de dever no DDL 80).
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { localDateOf } from '../../src/handwritten/cycle/index.js';
import { DASHBOARD_MONITOR_PROJECTOR_LIST } from '../../src/handwritten/projectors.js';
import type { DashboardProjectionContext } from '../../src/handwritten/projection-contract.js';
import {
  DUTY_STATES,
  DUTY_TRANSITIONS,
  EVENT_TYPES,
  FIXTURE_TENANT_ID,
  FIXTURE_TENANT_TZ,
  ROLES,
  SEED_DUTIES,
  SEED_DUTY_CYCLES,
  SEED_DUTY_CYCLE_IDS,
  TERMINAL_DUTY_STATES,
  USERS,
  cycleId,
  endOfDayManaus,
  type DutyState,
} from '../fixtures/cycle-fixtures.js';
import {
  CycleDb,
  buildCycle,
  buildSweeper,
  ctxFor,
  ensureSuiteSources,
  expectDashError,
  ifMatchOf,
  sweepTarget,
  type ActorKey,
  type CycleServices,
} from '../support/cycle-harness.js';

const SPEC = '04';
const db = new CycleDb();
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));
const SHA256 = 'a'.repeat(64);

let baselinePairs: Set<string>;

/** Pares `(duty_code, period)` que não existiam no `beforeAll` — criados pelo
 * serviço nesta rodada de testes; apagados no `afterEach` com timers e
 * outbox, para o próximo `it` partir do estado semeado. */
async function openedSince(): Promise<string[]> {
  const now = await db.dutyCyclePairs();
  return [...now].filter((pair) => !baselinePairs.has(pair)).sort();
}

async function removeOpenedSince(): Promise<void> {
  const pairs = await openedSince();
  for (const pair of pairs) {
    const [dutyCode, period] = pair.split('|');
    const row = await db.dutyCycleByPair(dutyCode!, period!);
    if (!row) continue;
    const id = row.id as string;
    const alerts = await db.client.query<{ id: string }>(
      `delete from dashboard.alert where tenant_id = $1 and object_kind = 'duty_cycle' and object_ref = $2 returning id`,
      [FIXTURE_TENANT_ID, id],
    );
    const alertIds = alerts.rows.map((r) => r.id);
    await db.client.query(
      `delete from dashboard.alert_trail where alert_id = any($1::uuid[])`,
      [alertIds],
    );
    await db.client.query(
      `delete from dashboard.timer where owner_id = any($1::uuid[])`,
      [[id, ...alertIds]],
    );
    await db.client.query(
      `delete from integration.outbox where tenant_id = $1 and aggregate_type like 'dashboard.%' and aggregate_id = any($2::text[])`,
      [FIXTURE_TENANT_ID, [id, ...alertIds]],
    );
    await db.client.query(`delete from dashboard.duty_cycle where id = $1`, [
      id,
    ]);
  }
}

async function seedCyclesSnapshot(): Promise<string> {
  const rows = await db.client.query<{
    id: string;
    state: string;
    version: number;
  }>(
    `select id, state, version from dashboard.duty_cycle where id = any($1::uuid[]) order by id`,
    [SEED_DUTY_CYCLE_IDS],
  );
  return JSON.stringify(rows.rows);
}
let seedSnapshot: string;

function ownCycle(
  state: DutyState,
  period: string,
  dutyCode = 'DUTY-01',
  overrides: Record<string, unknown> = {},
) {
  const id = nextId();
  const base: Record<string, unknown> = {
    id,
    tenant_id: FIXTURE_TENANT_ID,
    duty_code: dutyCode,
    period,
    state,
    deadline_on: overrides.deadline_on ?? null,
    opened_at: new Date('2024-01-01T12:00:00.000Z'),
    version: 1,
  };
  if (['COMPROVADO', 'ARQUIVADO'].includes(state)) base.evidence_hash = SHA256;
  if (state === 'ATRASADO' || state === 'NAO_CUMPRIDO')
    base.late_at = new Date('2024-02-01T12:00:00.000Z');
  if (state === 'NAO_CUMPRIDO')
    base.unfulfilled_at = new Date('2024-03-01T12:00:00.000Z');
  return db
    .insertDutyCycle({ ...base, ...overrides, id, duty_code: dutyCode, period })
    .then(() => id);
}

type DutyCommand = 'start' | 'prepare' | 'submit' | 'prove' | 'archive';
const DUTY_COMMANDS: readonly DutyCommand[] = [
  'start',
  'prepare',
  'submit',
  'prove',
  'archive',
];
const TARGET_OF: Record<DutyCommand, DutyState> = {
  start: 'EM_APURACAO',
  prepare: 'PREPARADO',
  submit: 'SUBMETIDO_PUBLICADO',
  prove: 'COMPROVADO',
  archive: 'ARQUIVADO',
};
const STAMP_OF: Record<DutyCommand, string> = {
  start: 'started_at',
  prepare: 'prepared_at',
  submit: 'submitted_at',
  prove: 'proved_at',
  archive: 'archived_at',
};
/** Ator de cada comando pela coluna `actor` de `duty_transition_ref` (§3.4)
 * e §7.4 (`archive`: `dash-operator`/`agency-admin`, não checa dono). */
const ACTOR_OF: Record<DutyCommand, ActorKey> = {
  start: 'dashDutyOwner',
  prepare: 'dashDutyOwner',
  submit: 'dashDutyOwner',
  prove: 'dashDutyOwner',
  archive: 'dashOperator',
};

async function runDuty(
  services: CycleServices,
  command: DutyCommand,
  cycleIdOrDuty: string,
  period: string,
  version: number,
  who: ActorKey,
  now: Date,
  dto?: Record<string, unknown>,
  ifMatch: string | undefined = ifMatchOf(version),
): Promise<unknown> {
  const ctx = ctxFor(who, now);
  const { duties } = services;
  switch (command) {
    case 'start':
      return duties.start(db.tx, cycleIdOrDuty, period, ifMatch, ctx);
    case 'prepare':
      return duties.prepare(
        db.tx,
        cycleIdOrDuty,
        (dto ?? {}) as never,
        ifMatch,
        ctx,
      );
    case 'submit':
      return duties.submit(
        db.tx,
        cycleIdOrDuty,
        (dto ?? {}) as never,
        ifMatch,
        ctx,
      );
    case 'prove':
      return duties.prove(
        db.tx,
        cycleIdOrDuty,
        (dto ?? { evidence: { hash: SHA256 } }) as never,
        ifMatch,
        ctx,
      );
    case 'archive':
      return duties.archive(
        db.tx,
        cycleIdOrDuty,
        (dto ?? {}) as never,
        ifMatch,
        ctx,
      );
  }
}

beforeAll(async () => {
  await db.connect();
  await ensureSuiteSources(
    db,
    SPEC,
    new Date('2026-09-21T12:00:00.000Z'),
    cycleId,
  );
  await db.forceConnected('IND-DASH-202', true);
  baselinePairs = await db.dutyCyclePairs();
  seedSnapshot = await seedCyclesSnapshot();
});

afterEach(async () => {
  await removeOpenedSince();
});

afterAll(async () => {
  await db.cleanup();
  await db.end();
});

describe('C-0002-26/27 — virada de período (§7.1, §7.2)', () => {
  it("C-0002-26 dado FixedClock('2026-10-01') quando turnOver então ciclos JANELA_ABERTA 2026-10 para DUTY-01, DUTY-02, DUTY-04 (sem deadline_on), T-DASH-DUTY-201/202 armados (fim de 2026-11-20 / 2026-10-31 em Manaus) e eventos DEVER_JANELA_ABERTA; turnOver de novo então nada novo", async () => {
    const now = new Date('2026-10-01T12:00:00.000Z');
    const services = buildCycle(db, '2026-10-01');
    const ctx = ctxFor('system', now);
    const result = await services.duties.turnOver(db.tx, '2026-10-01', ctx);
    const opened = await openedSince();
    expect(opened).toEqual(
      [
        'DUTY-01|2026-10',
        'DUTY-02|2026-10',
        'DUTY-04|2026-10',
        'DUTY-05|2026',
        'DUTY-PNATRANS|2026',
      ].sort(),
    );
    expect(result.opened).toBe(opened.length);
    expect(result.unfulfilled).toBe(0);

    const duty01 = (await db.dutyCycleByPair('DUTY-01', '2026-10'))!;
    expect(duty01.state).toBe('JANELA_ABERTA');
    expect(localDateOf(duty01.deadline_on as never)).toBe('2026-11-20');
    expect(new Date(duty01.opened_at as string).toISOString()).toBe(
      now.toISOString(),
    );
    const duty02 = (await db.dutyCycleByPair('DUTY-02', '2026-10'))!;
    expect(localDateOf(duty02.deadline_on as never)).toBe('2026-10-31');
    const duty04 = (await db.dutyCycleByPair('DUTY-04', '2026-10'))!;
    expect(duty04.deadline_on).toBeNull();

    const t201 = await db.timers(duty01.id as string);
    expect(t201).toHaveLength(1);
    expect(t201[0]).toMatchObject({
      code: 'T-DASH-DUTY-201',
      owner_kind: 'duty_cycle',
      status: 'ARMADO',
    });
    expect(new Date(t201[0]!.started_at as string).toISOString()).toBe(
      now.toISOString(),
    );
    expect(new Date(t201[0]!.due_at as string).toISOString()).toBe(
      endOfDayManaus('2026-11-20').toISOString(),
    );
    const t202 = await db.timers(duty02.id as string);
    expect(t202).toHaveLength(1);
    expect(t202[0]).toMatchObject({
      code: 'T-DASH-DUTY-202',
      status: 'ARMADO',
    });
    expect(new Date(t202[0]!.due_at as string).toISOString()).toBe(
      endOfDayManaus('2026-10-31').toISOString(),
    );
    expect(await db.timers(duty04.id as string)).toHaveLength(0);

    for (const row of [duty01, duty02, duty04]) {
      const events = await db.outboxFor(row.id as string);
      expect(events).toHaveLength(1);
      expect(events[0]!.topic).toBe(EVENT_TYPES.dutyChanged);
      expect(events[0]!.payload.domainEvent).toBe('DEVER_JANELA_ABERTA');
      expect(events[0]!.payload.data).toMatchObject({
        dutyCycleId: row.id,
        dutyCode: row.duty_code,
        period: '2026-10',
        fromState: null,
        toState: 'JANELA_ABERTA',
        late: false,
      });
      expect(events[0]!.payload.aggregate).toMatchObject({
        kind: 'duty_cycle',
        id: row.id,
        version: 1,
      });
    }
    expect(await seedCyclesSnapshot()).toBe(seedSnapshot);

    const again = await services.duties.turnOver(db.tx, '2026-10-01', ctx);
    expect(again).toEqual({ opened: 0, unfulfilled: 0 });
    expect(await openedSince()).toEqual(opened);
    expect(await db.timers(duty01.id as string)).toHaveLength(1);
    expect(await db.outboxFor(duty01.id as string)).toHaveLength(1);
  });

  it("C-0002-27 dado FixedClock('2026-01-01') quando turnOver então DUTY-05 2026, DUTY-07 2025 (2026-12-31), DUTY-10 2026, DUTY-PNATRANS 2026 (2026-04-30) abertos; DUTY-03/06/12 e per_event sem ciclo", async () => {
    const now = new Date('2026-01-01T12:00:00.000Z');
    const services = buildCycle(db, '2026-01-01');
    const result = await services.duties.turnOver(
      db.tx,
      '2026-01-01',
      ctxFor('system', now),
    );
    const opened = await openedSince();
    // DUTY-07 2025 e DUTY-10 2026 já existem no seed 81 (`…0303`/`…0304`)
    expect(opened).toEqual(
      [
        'DUTY-01|2026-01',
        'DUTY-02|2026-01',
        'DUTY-04|2026-01',
        'DUTY-05|2026',
        'DUTY-PNATRANS|2026',
      ].sort(),
    );
    expect(result.opened).toBe(opened.length);

    const duty05 = (await db.dutyCycleByPair('DUTY-05', '2026'))!;
    expect(duty05.state).toBe('JANELA_ABERTA');
    expect(duty05.deadline_on).toBeNull();
    expect(await db.timers(duty05.id as string)).toHaveLength(0);

    const pnatrans = (await db.dutyCycleByPair('DUTY-PNATRANS', '2026'))!;
    expect(localDateOf(pnatrans.deadline_on as never)).toBe('2026-04-30');
    const tp = await db.timers(pnatrans.id as string);
    expect(tp).toHaveLength(1);
    expect(tp[0]).toMatchObject({
      code: 'T-DASH-DUTY-PNATRANS',
      status: 'ARMADO',
    });
    expect(new Date(tp[0]!.due_at as string).toISOString()).toBe(
      endOfDayManaus('2026-04-30').toISOString(),
    );

    const duty07 = (await db.dutyCycle(SEED_DUTY_CYCLES.preparado))!;
    expect(duty07).toMatchObject({
      duty_code: 'DUTY-07',
      period: '2025',
      state: 'PREPARADO',
      version: 1,
    });
    expect(localDateOf(duty07.deadline_on as never)).toBe('2026-12-31');
    const duty10 = (await db.dutyCycle(SEED_DUTY_CYCLES.submetidoPublicado))!;
    expect(duty10).toMatchObject({
      duty_code: 'DUTY-10',
      period: '2026',
      version: 1,
    });
    expect(localDateOf(duty10.deadline_on as never)).toBe('2026-12-31');

    const noCycle = await db.client.query<{ n: string }>(
      `select count(*)::text as n from dashboard.duty_cycle where tenant_id = $1 and duty_code = any($2::text[])`,
      [
        FIXTURE_TENANT_ID,
        [
          'DUTY-03',
          'DUTY-06',
          'DUTY-12',
          'DUTY-08',
          'DUTY-09',
          'DUTY-11',
          'DUTY-13',
          'DUTY-14',
        ],
      ],
    );
    expect(Number(noCycle.rows[0]!.n)).toBe(0);
    expect(await seedCyclesSnapshot()).toBe(seedSnapshot);
  });

  it('C-0002-26 dado turnOver quando roda então só escreve em dashboard.* e integration.outbox (§1.3 regra 1)', async () => {
    const services = buildCycle(db, '2026-10-01');
    const calls: string[] = [];
    const spyTx = {
      query: (statement: string, values?: readonly unknown[]) => {
        calls.push(statement);
        return db.tx.query(statement, values);
      },
    };
    await services.duties.turnOver(
      spyTx,
      '2026-10-01',
      ctxFor('system', new Date('2026-10-01T12:00:00.000Z')),
    );
    const written = calls
      .filter((sql) => /^\s*(insert|update|delete)/i.test(sql))
      .map((sql) =>
        sql
          .match(
            /(?:insert into|update|delete from)\s+([a-z_]+\.[a-z_]+)/i,
          )?.[1]
          ?.toLowerCase(),
      );
    expect(written.length).toBeGreaterThan(0);
    for (const table of written)
      expect(
        table === 'integration.outbox' || table!.startsWith('dashboard.'),
      ).toBe(true);
  });
});

describe('C-0002-28/29 — ATRASADO e NAO_CUMPRIDO (§7.2, OD-D41)', () => {
  it('C-0002-28 dado ciclo DUTY-02 2026-06 EM_APURACAO com deadline_on=2026-06-30 e T-DASH-DUTY-202 armado quando runDue(fim do dia 2026-06-30 em Manaus) então ATRASADO (late_at), evento DEVER_ATRASADO e alerta de extinção CRITICO/INCIDENTE_REGISTRADO para IND-DASH-202; runDue de novo então idempotente', async () => {
    const now = endOfDayManaus('2026-06-30');
    const services = buildCycle(db, '2026-06-30');
    const cycle = await ownCycle('EM_APURACAO', '2026-06', 'DUTY-02', {
      deadline_on: '2026-06-30',
      opened_at: new Date('2026-06-01T04:00:00.000Z'),
      started_at: new Date('2026-06-05T12:00:00.000Z'),
    });
    const timerId = nextId();
    await db.insertTimer({
      id: timerId,
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'duty_cycle',
      owner_id: cycle,
      code: 'T-DASH-DUTY-202',
      started_at: new Date('2026-06-01T04:00:00.000Z'),
      due_at: now,
      status: 'ARMADO',
      version: 1,
    });
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const [report] = await sweeper.runDue(now);
    expect(report!.firedTimers).toBe(1);
    expect(report!.dutyCyclesLate).toBe(1);

    const late = (await db.dutyCycle(cycle))!;
    expect(late.state).toBe('ATRASADO');
    expect(new Date(late.late_at as string).toISOString()).toBe(
      now.toISOString(),
    );
    expect(Number(late.version)).toBe(2);
    expect(await db.timerById(timerId)).toMatchObject({ status: 'VENCIDO' });

    const events = await db.outboxFor(cycle);
    const lateEvents = events.filter(
      (row) => row.payload.domainEvent === 'DEVER_ATRASADO',
    );
    expect(lateEvents).toHaveLength(1);
    expect(lateEvents[0]!.payload.data).toMatchObject({
      dutyCode: 'DUTY-02',
      period: '2026-06',
      fromState: 'EM_APURACAO',
      toState: 'ATRASADO',
      late: true,
    });

    const alerts = await db.alertsByObject('IND-DASH-202', 'duty_cycle', cycle);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      track: 'extinction',
      severity: 'CRITICO',
      state: 'INCIDENTE_REGISTRADO',
      block: 'B',
      owner_role: ROLES.dashDutyOwner,
    });
    expect(alerts[0]!.incident_ref).not.toBeNull();

    const [again] = await sweeper.runDue(now);
    expect(again!.firedTimers).toBe(0);
    expect(again!.dutyCyclesLate).toBe(0);
    expect((await db.dutyCycle(cycle))!.version).toBe(2);
    expect(
      (await db.outboxFor(cycle)).filter(
        (row) => row.payload.domainEvent === 'DEVER_ATRASADO',
      ),
    ).toHaveLength(1);
    expect(
      await db.alertsByObject('IND-DASH-202', 'duty_cycle', cycle),
    ).toHaveLength(1);
    expect(await seedCyclesSnapshot()).toBe(seedSnapshot);
  });

  it('C-0002-28 dado ciclo SUBMETIDO_PUBLICADO com T-DASH-DUTY-201 vencido quando runDue então timer SATISFEITO sem efeito (estado posterior, §7.2)', async () => {
    const now = endOfDayManaus('2026-05-20');
    const services = buildCycle(db, '2026-05-20');
    const cycle = await ownCycle('SUBMETIDO_PUBLICADO', '2026-04', 'DUTY-01', {
      deadline_on: '2026-05-20',
      opened_at: new Date('2026-04-01T04:00:00.000Z'),
      submitted_at: new Date('2026-05-10T12:00:00.000Z'),
    });
    const timerId = nextId();
    await db.insertTimer({
      id: timerId,
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'duty_cycle',
      owner_id: cycle,
      code: 'T-DASH-DUTY-201',
      started_at: new Date('2026-04-01T04:00:00.000Z'),
      due_at: now,
      status: 'ARMADO',
      version: 1,
    });
    const sweeper = buildSweeper(db, services, [sweepTarget()]);
    const [report] = await sweeper.runDue(now);
    expect(report!.dutyCyclesLate).toBe(0);
    expect((await db.dutyCycle(cycle))!.state).toBe('SUBMETIDO_PUBLICADO');
    expect((await db.dutyCycle(cycle))!.version).toBe(1);
    const timer = (await db.timerById(timerId))!;
    expect(timer.status).toBe('SATISFEITO');
    expect(timer.satisfied_at).not.toBeNull();
    expect(await db.outboxFor(cycle)).toHaveLength(0);
  });

  it('C-0002-29 dado ciclo anterior ATRASADO (DUTY-02 2026-10) quando o turnOver abre 2026-11 então NAO_CUMPRIDO (unfulfilled_at) e evento DEVER_NAO_CUMPRIDO; DUTY-04 2026-10 JANELA_ABERTA sem deadline_on então permanece', async () => {
    const now = new Date('2026-11-01T12:00:00.000Z');
    const services = buildCycle(db, '2026-11-01');
    const lateCycle = await ownCycle('ATRASADO', '2026-10', 'DUTY-02', {
      deadline_on: '2026-10-31',
      opened_at: new Date('2026-10-01T04:00:00.000Z'),
      late_at: new Date('2026-11-01T03:59:59.999Z'),
    });
    const openCycle = await ownCycle('JANELA_ABERTA', '2026-10', 'DUTY-04', {
      opened_at: new Date('2026-10-01T04:00:00.000Z'),
    });
    const result = await services.duties.turnOver(
      db.tx,
      '2026-11-01',
      ctxFor('system', now),
    );
    expect(result.unfulfilled).toBe(1);
    const opened = await openedSince();
    expect(opened).toContain('DUTY-01|2026-11');
    expect(opened).toContain('DUTY-02|2026-11');
    expect(opened).toContain('DUTY-04|2026-11');

    const unfulfilled = (await db.dutyCycle(lateCycle))!;
    expect(unfulfilled.state).toBe('NAO_CUMPRIDO');
    expect(new Date(unfulfilled.unfulfilled_at as string).toISOString()).toBe(
      now.toISOString(),
    );
    expect(Number(unfulfilled.version)).toBe(2);
    const events = await db.outboxFor(lateCycle);
    const unf = events.filter(
      (row) => row.payload.domainEvent === 'DEVER_NAO_CUMPRIDO',
    ); // token proposto (OD-D33)
    expect(unf).toHaveLength(1);
    expect(unf[0]!.payload.data).toMatchObject({
      dutyCode: 'DUTY-02',
      period: '2026-10',
      fromState: 'ATRASADO',
      toState: 'NAO_CUMPRIDO',
      late: true,
    });

    const still = (await db.dutyCycle(openCycle))!;
    expect(still.state).toBe('JANELA_ABERTA');
    expect(still.version).toBe(1);
    expect(await db.outboxFor(openCycle)).toHaveLength(0);
    // o seed `DUTY-02 2026-08 ATRASADO` (…0307) não é "o anterior" de 2026-11
    expect(await seedCyclesSnapshot()).toBe(seedSnapshot);
  });
});

describe('C-0002-30 — dever sem prazo legal nunca recebe deadline_on (§7.1, [RN-DASH-113])', () => {
  it('C-0002-30 dado fixture de dever DUTY-05 (204) quando o turnOver abre 2026 então deadline_on nulo e nenhum timer', async () => {
    const services = buildCycle(db, '2026-01-01');
    await services.duties.turnOver(
      db.tx,
      '2026-01-01',
      ctxFor('system', new Date('2026-01-01T12:00:00.000Z')),
    );
    const duty05 = (await db.dutyCycleByPair('DUTY-05', '2026'))!;
    expect(duty05.deadline_on).toBeNull();
    expect(await db.timers(duty05.id as string)).toHaveLength(0);
  });

  it('C-0002-30 dado ciclo de DUTY-05 quando um comando tenta gravar deadline_on (prepare com deadlineOn) então 422 DASH.DUTY_NO_LEGAL_DEADLINE com context.dutyId e nada muda', async () => {
    // `PrepareDutyDto` não fixa o campo (§14.1 só nomeia o DTO): `deadlineOn`
    // é source_pending — o caminho "comando" de §7.1 exige um campo assim.
    const now = new Date('2026-02-01T12:00:00.000Z');
    const services = buildCycle(db, '2026-02-01');
    const cycle = await ownCycle('EM_APURACAO', '2025', 'DUTY-05', {
      opened_at: new Date('2025-01-01T04:00:00.000Z'),
      started_at: new Date('2025-01-10T12:00:00.000Z'),
    });
    const context = await expectDashError(
      runDuty(services, 'prepare', cycle, '2025', 1, 'dashDutyOwner', now, {
        deadlineOn: '2025-12-31',
      }),
      'DASH.DUTY_NO_LEGAL_DEADLINE',
      422,
    );
    expect(context.dutyId).toBe(SEED_DUTIES['DUTY-05']);
    const after = (await db.dutyCycle(cycle))!;
    expect(after.state).toBe('EM_APURACAO');
    expect(after.deadline_on).toBeNull();
    expect(after.version).toBe(1);
  });

  it('C-0002-30 dado arm de T-DASH-DUTY-* para um ciclo de DUTY-05 sem deadlineOn então due_at nulo (nunca vence) — o relógio não inventa data', async () => {
    const services = buildCycle(db, '2026-02-01');
    const cycle = await ownCycle('JANELA_ABERTA', '2024', 'DUTY-05', {
      opened_at: new Date('2024-01-01T04:00:00.000Z'),
    });
    const timer = await services.timers.arm(
      db.tx,
      FIXTURE_TENANT_ID,
      FIXTURE_TENANT_TZ,
      {
        ownerKind: 'duty_cycle',
        ownerId: cycle,
        code: 'T-DASH-DUTY-201',
        startedAt: new Date('2024-01-01T04:00:00.000Z'),
      },
    );
    expect(timer.dueAt).toBeNull();
  });
});

describe('C-0002-31 — matriz dos 8 estados × 5 comandos por duty_transition_ref (§7.3)', () => {
  const NOW = new Date('2026-09-21T12:00:00.000Z');
  const cells = DUTY_STATES.flatMap((state) =>
    DUTY_COMMANDS.map((command) => ({ state, command })),
  );

  function expectedFor(state: DutyState, command: DutyCommand) {
    if (TERMINAL_DUTY_STATES.includes(state))
      return { kind: 'denied' as const, code: 'DASH.DUTY_ALREADY_ARCHIVED' };
    const allowed = DUTY_TRANSITIONS.some(
      (row) => row.from === state && row.to === TARGET_OF[command],
    );
    return allowed
      ? { kind: 'allowed' as const }
      : { kind: 'denied' as const, code: 'DASH.DUTY_STATE_INVALID' };
  }

  it.each(cells)(
    'C-0002-31 dado ciclo $state quando $command então só a transição de duty_transition_ref passa; ARQUIVADO/NAO_CUMPRIDO → DUTY_ALREADY_ARCHIVED; demais → DUTY_STATE_INVALID',
    async ({ state, command }) => {
      const period = `2024-${String(DUTY_STATES.indexOf(state) + 1).padStart(2, '0')}`;
      const cycle = await ownCycle(state, period, 'DUTY-01', {
        deadline_on: '2024-12-31',
      });
      const services = buildCycle(db, '2026-09-21');
      const target = command === 'start' ? SEED_DUTIES['DUTY-01'] : cycle;
      const expected = expectedFor(state, command);
      if (expected.kind === 'denied') {
        const context = await expectDashError(
          runDuty(services, command, target, period, 1, ACTOR_OF[command], NOW),
          expected.code,
          409,
        );
        if (expected.code === 'DASH.DUTY_STATE_INVALID') {
          expect(context).toMatchObject({ period, currentState: state });
          expect(context.dutyId).toBe(SEED_DUTIES['DUTY-01']);
        }
        const after = (await db.dutyCycle(cycle))!;
        expect(after.state).toBe(state);
        expect(after.version).toBe(1);
        expect(await db.outboxFor(cycle)).toHaveLength(0);
        return;
      }
      await runDuty(
        services,
        command,
        target,
        period,
        1,
        ACTOR_OF[command],
        NOW,
      );
      const after = (await db.dutyCycle(cycle))!;
      expect(after.state).toBe(TARGET_OF[command]);
      expect(Number(after.version)).toBe(2);
      expect(after[STAMP_OF[command]]).not.toBeNull();
      expect(new Date(after[STAMP_OF[command]] as string).toISOString()).toBe(
        NOW.toISOString(),
      );
    },
  );

  it('C-0002-31 dado a matriz quando contada então 40 células com exatamente 6 permitidas (20, 30, 40, 50, 60, 80)', () => {
    const allowed = cells.filter(
      (cell) => expectedFor(cell.state, cell.command).kind === 'allowed',
    );
    expect(cells).toHaveLength(40);
    expect(
      allowed.map((cell) => `${cell.state}→${cell.command}`).sort(),
    ).toEqual(
      [
        'JANELA_ABERTA→start',
        'EM_APURACAO→prepare',
        'PREPARADO→submit',
        'SUBMETIDO_PUBLICADO→prove',
        'COMPROVADO→archive',
        'ATRASADO→submit',
      ].sort(),
    );
  });

  it('C-0002-31 dado ciclo inexistente quando prepare então 404 (guarda 1 de §7.3); dado start de per_event (DUTY-08) sem ciclo então cria JANELA_ABERTA com period YYYY-MM-DD e avança para EM_APURACAO', async () => {
    const services = buildCycle(db, '2026-09-21');
    const ghost = cycleId(SPEC, 0xffffff);
    let status: number | undefined;
    try {
      await runDuty(
        services,
        'prepare',
        ghost,
        '2024-01',
        1,
        'dashDutyOwner',
        NOW,
      );
    } catch (error) {
      status = (error as { status?: number }).status;
    }
    expect(status).toBe(404);

    const period = '2026-09-21';
    const view = (await runDuty(
      services,
      'start',
      SEED_DUTIES['DUTY-08'],
      period,
      1,
      'dashDutyOwner',
      NOW,
      undefined,
      undefined,
    )) as Record<string, unknown>;
    const created = (await db.dutyCycleByPair('DUTY-08', period))!;
    expect(created).toMatchObject({ state: 'EM_APURACAO', period });
    expect(created.deadline_on).toBeNull();
    expect(view).toBeDefined();
    const events = await db.outboxFor(created.id as string);
    expect(events.map((row) => row.payload.domainEvent)).toContain(
      'DEVER_JANELA_ABERTA',
    );
  });
});

describe('C-0002-32/33 — evidência e cumprimento tardio (§7.3)', () => {
  const NOW = new Date('2026-09-21T12:00:00.000Z');

  it("C-0002-32 dado prove sem evidence.hash então 422 DASH.DUTY_EVIDENCE_REQUIRED (missing:['hash'])", async () => {
    const services = buildCycle(db, '2026-09-21');
    const cycle = await ownCycle('SUBMETIDO_PUBLICADO', '2023-01', 'DUTY-01', {
      submitted_at: new Date('2023-02-01T12:00:00.000Z'),
    });
    const context = await expectDashError(
      runDuty(services, 'prove', cycle, '2023-01', 1, 'dashDutyOwner', NOW, {
        evidence: { protocol: 'PROT-0083' },
      }),
      'DASH.DUTY_EVIDENCE_REQUIRED',
      422,
    );
    expect(context.missing).toEqual(['hash']);
    expect((await db.dutyCycle(cycle))!.state).toBe('SUBMETIDO_PUBLICADO');
  });

  it("C-0002-32 dado prove com hash 'abc' então 422 DASH.DUTY_EVIDENCE_HASH_INVALID", async () => {
    const services = buildCycle(db, '2026-09-21');
    const cycle = await ownCycle('SUBMETIDO_PUBLICADO', '2023-02', 'DUTY-01', {
      submitted_at: new Date('2023-03-01T12:00:00.000Z'),
    });
    await expectDashError(
      runDuty(services, 'prove', cycle, '2023-02', 1, 'dashDutyOwner', NOW, {
        evidence: { hash: 'abc' },
      }),
      'DASH.DUTY_EVIDENCE_HASH_INVALID',
      422,
    );
    expect((await db.dutyCycle(cycle))!.evidence_hash).toBeNull();
  });

  it('C-0002-32 dado prove com SHA-256 então COMPROVADO, proved_at, evento DEVER_COMPROVADO com evidenceHash, e duty-evidence.projection aplica o evento (célula duty_evidence)', async () => {
    const services = buildCycle(db, '2026-09-21');
    const period = '2023-03';
    const cycle = await ownCycle('SUBMETIDO_PUBLICADO', period, 'DUTY-01', {
      submitted_at: new Date('2023-04-01T12:00:00.000Z'),
    });
    await runDuty(services, 'prove', cycle, period, 1, 'dashDutyOwner', NOW, {
      evidence: {
        hash: SHA256,
        protocol: 'PROT-0083',
        captureUri: 'https://fixtures.detran-am.invalid/duty/0083',
      },
    });
    const after = (await db.dutyCycle(cycle))!;
    expect(after).toMatchObject({
      state: 'COMPROVADO',
      evidence_hash: SHA256,
      evidence_protocol: 'PROT-0083',
    });
    expect(new Date(after.proved_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );

    const events = await db.outboxFor(cycle);
    const proved = events.find(
      (row) => row.payload.domainEvent === 'DEVER_COMPROVADO',
    )!;
    expect(proved).toBeDefined();
    expect(proved.payload.data).toMatchObject({
      dutyCycleId: cycle,
      dutyCode: 'DUTY-01',
      indicatorCode: 'IND-DASH-201',
      period,
      fromState: 'SUBMETIDO_PUBLICADO',
      toState: 'COMPROVADO',
      evidenceHash: SHA256,
      late: false,
    });
    expect(proved.payload.data).not.toHaveProperty('captureUri');

    const projector = DASHBOARD_MONITOR_PROJECTOR_LIST.find(
      (candidate) => candidate.projection === 'dashboard.duty_evidence',
    )!;
    expect(projector).toBeDefined();
    db.ownProjectionEventId(proved.payload.id);
    const ctx: DashboardProjectionContext = {
      tx: db.tx,
      tenantId: FIXTURE_TENANT_ID,
      now: NOW,
    };
    const applied = await projector.apply(proved.payload as never, ctx);
    expect(applied.kind).toBe('applied');
    const cell = await db.client.query<Record<string, unknown>>(
      `select * from dashboard.duty_evidence where tenant_id = $1 and duty_code = 'DUTY-01' and period = $2`,
      [FIXTURE_TENANT_ID, period],
    );
    expect(cell.rows).toHaveLength(1);
    expect(cell.rows[0]).toMatchObject({
      state: 'COMPROVADO',
      evidence_hash: SHA256,
      late: false,
    });
  });

  it('C-0002-33 dado submit a partir de PREPARADO com T-DASH-DUTY-201 armado então SUBMETIDO_PUBLICADO e timer SATISFEITO (cycle_advanced), evento com late=false', async () => {
    const services = buildCycle(db, '2026-09-21');
    const period = '2023-04';
    const cycle = await ownCycle('PREPARADO', period, 'DUTY-01', {
      deadline_on: '2023-05-20',
      prepared_at: new Date('2023-05-01T12:00:00.000Z'),
    });
    const timerId = nextId();
    await db.insertTimer({
      id: timerId,
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'duty_cycle',
      owner_id: cycle,
      code: 'T-DASH-DUTY-201',
      started_at: new Date('2023-04-01T04:00:00.000Z'),
      due_at: endOfDayManaus('2023-05-20'),
      status: 'ARMADO',
      version: 1,
    });
    await runDuty(services, 'submit', cycle, period, 1, 'dashDutyOwner', NOW, {
      protocol: 'PROT-0083-33',
    });
    expect((await db.dutyCycle(cycle))!.state).toBe('SUBMETIDO_PUBLICADO');
    expect(await db.timerById(timerId)).toMatchObject({
      status: 'SATISFEITO',
      reason: 'cycle_advanced',
    });
    const events = await db.outboxFor(cycle);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.data).toMatchObject({
      toState: 'SUBMETIDO_PUBLICADO',
      late: false,
    });
  });

  it('C-0002-33 dado submit a partir de ATRASADO então SUBMETIDO_PUBLICADO (seq 80, cumprimento tardio), T-DASH-DUTY-* SATISFEITO (cycle_advanced), evento com late=true', async () => {
    const services = buildCycle(db, '2026-09-21');
    const period = '2023-05';
    const cycle = await ownCycle('ATRASADO', period, 'DUTY-01', {
      deadline_on: '2023-06-20',
      late_at: new Date('2023-06-21T04:00:00.000Z'),
    });
    const timerId = nextId();
    await db.insertTimer({
      id: timerId,
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'duty_cycle',
      owner_id: cycle,
      code: 'T-DASH-DUTY-201',
      started_at: new Date('2023-05-01T04:00:00.000Z'),
      due_at: endOfDayManaus('2023-06-20'),
      status: 'ARMADO',
      version: 1,
    });
    await runDuty(services, 'submit', cycle, period, 1, 'dashDutyOwner', NOW);
    const after = (await db.dutyCycle(cycle))!;
    expect(after.state).toBe('SUBMETIDO_PUBLICADO');
    expect(new Date(after.submitted_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    expect(await db.timerById(timerId)).toMatchObject({
      status: 'SATISFEITO',
      reason: 'cycle_advanced',
    });
    const events = await db.outboxFor(cycle);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.data).toMatchObject({
      fromState: 'ATRASADO',
      toState: 'SUBMETIDO_PUBLICADO',
      late: true,
    });
  });
});

describe('C-0002-34/35 — dono do dever e archive (§7.4, OD-D19(d))', () => {
  const NOW = new Date('2026-09-21T12:00:00.000Z');
  const dutyId = cycleId(SPEC, 0x3401);
  const period = '2026-09-21';

  it('C-0002-34 dado dever com owner_role ≠ dash-duty-owner (linha criada pelo teste) quando start por dash-duty-owner então 403 DASH.DUTY_NOT_OWNER; por agency-admin então passa', async () => {
    await db.insertDuty({
      id: dutyId,
      tenant_id: FIXTURE_TENANT_ID,
      code: 'DUTY-X0083',
      line_no: null,
      title: 'Dever de teste com dono divergente (fixture 0083)',
      source_ref: 'fixture 0083 (C-0002-34)',
      periodicity: 'por evento (fixture)',
      deadline_rule: null,
      deadline_kind: 'per_event',
      consequence: 'nenhuma (fixture)',
      rule_ref: 'CTG-0002 §7.4',
      scope: 'estadual',
      owner_role: ROLES.gestor,
      owner_actor: null,
      indicator_code: null,
      mvp: false,
    });
    const services = buildCycle(db, '2026-09-21');
    const context = await expectDashError(
      runDuty(
        services,
        'start',
        dutyId,
        period,
        1,
        'dashDutyOwner',
        NOW,
        undefined,
        undefined,
      ),
      'DASH.DUTY_NOT_OWNER',
      403,
    );
    expect(context.dutyId).toBe(dutyId);
    expect(await db.dutyCycleByPair('DUTY-X0083', period)).toBeNull();

    await runDuty(
      services,
      'start',
      dutyId,
      period,
      1,
      'agencyAdmin',
      NOW,
      undefined,
      undefined,
    );
    const created = (await db.dutyCycleByPair('DUTY-X0083', period))!;
    expect(created.state).toBe('EM_APURACAO');
    db.ownDutyCyclePairs([{ dutyCode: 'DUTY-X0083', period }]);
  });

  it('C-0002-34 dado dever com owner_role=dash-duty-owner (seed) quando prepare por dash-operator então 403 DASH.DUTY_NOT_OWNER (dash-operator não é dono nem agency-admin)', async () => {
    const services = buildCycle(db, '2026-09-21');
    const cycle = await ownCycle('EM_APURACAO', '2023-06', 'DUTY-01', {
      started_at: new Date('2023-06-05T12:00:00.000Z'),
    });
    await expectDashError(
      runDuty(services, 'prepare', cycle, '2023-06', 1, 'dashOperator', NOW),
      'DASH.DUTY_NOT_OWNER',
      403,
    );
    expect((await db.dutyCycle(cycle))!.state).toBe('EM_APURACAO');
  });

  it("C-0002-35 dado archive em COMPROVADO por dash-operator então ARQUIVADO com archived_at, version+1 e registro com actor_kind='user' (actor do evento publicado)", async () => {
    const services = buildCycle(db, '2026-09-21');
    const period = '2023-07';
    const cycle = await ownCycle('COMPROVADO', period, 'DUTY-01', {
      proved_at: new Date('2023-08-01T12:00:00.000Z'),
      evidence_protocol: 'PROT-0083-35',
    });
    await runDuty(services, 'archive', cycle, period, 1, 'dashOperator', NOW);
    const after = (await db.dutyCycle(cycle))!;
    expect(after.state).toBe('ARQUIVADO');
    expect(Number(after.version)).toBe(2);
    expect(new Date(after.archived_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    const events = await db.outboxFor(cycle);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.actor).toMatchObject({
      kind: 'user',
      id: USERS.integrationOperator,
    });
    expect(events[0]!.payload.data).toMatchObject({
      fromState: 'COMPROVADO',
      toState: 'ARQUIVADO',
    });
  });

  it('C-0002-35 dado archive em COMPROVADO por agency-admin então ARQUIVADO (política: dash-operator|agency-admin; não checa dono)', async () => {
    const services = buildCycle(db, '2026-09-21');
    const cycle = await ownCycle('COMPROVADO', '2023-08', 'DUTY-01', {
      proved_at: new Date('2023-09-01T12:00:00.000Z'),
    });
    await runDuty(services, 'archive', cycle, '2023-08', 1, 'agencyAdmin', NOW);
    expect((await db.dutyCycle(cycle))!.state).toBe('ARQUIVADO');
  });
});
