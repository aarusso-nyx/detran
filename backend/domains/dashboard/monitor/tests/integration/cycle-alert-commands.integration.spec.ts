// CTG-0002 §15.1 C-0002-05, 07, 19, 20, 45, 46 [int] — efeitos dos comandos
// e da evidência de origem sobre o alerta: SLA de ACK satisfeito (§6.8),
// fonte velha (§8.4), `verifyFromCell` (§6.5, 80 [+101]), `getIncident`
// (§6.7) e `getView` por camada servida (§6.6). Clones do seed 81 no
// namespace `0083 05…`; leituras diretas das fixtures 15 e 18 do seed
// (`getIncident`/`getView` não escrevem). Células de projeção próprias
// (`prescription_risk`) limpas por `last_event_id`.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { DetectionCell } from '../../src/handwritten/cycle/index.js';
import {
  ALERT_VIEW_KEYS,
  FIXTURE_TENANT_ID,
  FORBIDDEN_EVENT_DATA_KEYS,
  ORIGIN_OBJECTS,
  ROLES,
  USERS,
  cycleId,
  seedAlertBy,
} from '../fixtures/cycle-fixtures.js';
import {
  CycleDb,
  buildCycle,
  ctxFor,
  ensureSuiteSources,
  expectDashError,
  ifMatchOf,
  type CycleServices,
} from '../support/cycle-harness.js';

const SPEC = '05';
const NOW = new Date('2026-09-21T12:00:00.000Z');
const db = new CycleDb();
let services: CycleServices;
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));

function normalCell(
  objectRef: string,
  indicatorCode = 'IND-DASH-101',
  overrides: Partial<DetectionCell> = {},
): DetectionCell {
  return {
    projection: 'dashboard.prescription_risk',
    indicatorCode,
    sourceApp: 'rait',
    objectKind: 'case',
    objectRef,
    objectLayer: 'N2',
    level: 'SEM_RISCO',
    governingClock: 'A',
    eventId: nextId(),
    occurredAt: NOW,
    ...overrides,
  };
}

beforeAll(async () => {
  await db.connect();
  await ensureSuiteSources(db, SPEC, NOW, cycleId);
  await db.forceConnected('IND-DASH-101', true);
  services = buildCycle(db, '2026-09-21');
});

afterAll(async () => {
  await db.cleanup();
  await db.end();
});

describe('C-0002-05 — ack satisfaz o SLA e publica ALERTA_RECONHECIDO (§6.8, §12)', () => {
  it("C-0002-05 dado alerta NOTIFICADO com T-DASH-ACK-N2 ARMADO quando ack então o timer fica SATISFEITO (reason='ack') e o evento dashboard.alert.changed/ALERTA_RECONHECIDO está na outbox com data só de ids/tokens/datas", async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'extinction').id, id, {
      object_ref: ORIGIN_OBJECTS.raitCase08,
    });
    const timerId = nextId();
    await db.insertTimer({
      id: timerId,
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'alert',
      owner_id: id,
      code: 'T-DASH-ACK-N2',
      started_at: new Date('2026-09-21T10:00:00.000Z'),
      due_at: new Date('2026-09-21T18:00:00.000Z'),
      status: 'ARMADO',
      version: 1,
    });
    await services.alerts.ack(
      db.tx,
      id,
      { channel: 'origin' } as never,
      ifMatchOf(1),
      ctxFor('raitManager', NOW),
    );
    const timer = (await db.timerById(timerId))!;
    expect(timer).toMatchObject({ status: 'SATISFEITO', reason: 'ack' });
    expect(new Date(timer.satisfied_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );

    const events = await db.outboxFor(id);
    expect(events).toHaveLength(1);
    const [event] = events;
    expect(event!.topic).toBe('dashboard.alert.changed');
    expect(event!.aggregate_type).toBe('dashboard.alert');
    expect(event!.status).toBe('pending');
    expect(event!.payload.domainEvent).toBe('ALERTA_RECONHECIDO');
    expect(event!.payload.data).toMatchObject({
      alertId: id,
      indicatorCode: 'IND-DASH-101',
      track: 'extinction',
      fromState: 'NOTIFICADO',
      toState: 'RECONHECIDO',
      ackChannel: 'origin',
      ownerRole: ROLES.raitManager,
    });
    expect(event!.payload.actor).toMatchObject({
      kind: 'user',
      id: USERS.raitManager,
    });
    // só ids, tokens e datas: cada valor é string curta/número/boolean/null
    for (const [key, value] of Object.entries(event!.payload.data)) {
      expect(FORBIDDEN_EVENT_DATA_KEYS as readonly string[]).not.toContain(key);
      expect(value === null || typeof value !== 'object').toBe(true);
      if (typeof value === 'string')
        expect(value.length).toBeLessThanOrEqual(120);
    }
    expect(event!.idempotency_key).toBe(`dashboard.alert.changed:${id}:2`);
  });
});

describe('C-0002-07 — fonte velha bloqueia comandos (§8.4)', () => {
  it('C-0002-07 dado alerta cujo indicador tem fonte INDISPONIVEL (IND-DASH-306 → pec.deadlines) quando ack então 409 DASH.ALERT_SOURCE_STALE (context.indicator, freshness)', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'irregularity').id, id, {
      indicator_code: 'IND-DASH-306',
      source_app: 'pec',
      object_kind: 'exam-process',
      object_ref: ORIGIN_OBJECTS.raitCase08,
    });
    const context = await expectDashError(
      services.alerts.ack(
        db.tx,
        id,
        { channel: 'origin' } as never,
        ifMatchOf(1),
        ctxFor('dashDutyOwner', NOW),
      ),
      'DASH.ALERT_SOURCE_STALE',
      409,
    );
    expect(context.indicator).toBe('IND-DASH-306');
    expect(context.freshness).toBe('INDISPONIVEL');
    expect((await db.alert(id))!.state).toBe('NOTIFICADO');
  });

  it('C-0002-07 dado alerta RECONHECIDO com fonte INDISPONIVEL quando treat então 409 DASH.ALERT_SOURCE_STALE', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('RECONHECIDO', 'irregularity').id, id, {
      indicator_code: 'IND-DASH-306',
      source_app: 'pec',
      object_kind: 'exam-process',
      object_ref: ORIGIN_OBJECTS.raitCase09,
    });
    const context = await expectDashError(
      services.alerts.treat(
        db.tx,
        id,
        {} as never,
        ifMatchOf(1),
        ctxFor('dashDutyOwner', NOW),
      ),
      'DASH.ALERT_SOURCE_STALE',
      409,
    );
    expect(context.freshness).toBe('INDISPONIVEL');
  });

  it('C-0002-07 dado alerta com fonte DESATUALIZADO_MARCADO (IND-DASH-310 → boat.crashes) quando ack então 409 DASH.ALERT_SOURCE_STALE com freshness=DESATUALIZADO_MARCADO', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'irregularity').id, id, {
      indicator_code: 'IND-DASH-310',
      source_app: 'boat',
      object_kind: 'crash',
      object_ref: ORIGIN_OBJECTS.raitCase10,
    });
    const context = await expectDashError(
      services.alerts.ack(
        db.tx,
        id,
        { channel: 'origin' } as never,
        ifMatchOf(1),
        ctxFor('dashDutyOwner', NOW),
      ),
      'DASH.ALERT_SOURCE_STALE',
      409,
    );
    expect(context).toMatchObject({
      indicator: 'IND-DASH-310',
      freshness: 'DESATUALIZADO_MARCADO',
    });
  });

  it('C-0002-07 dado alerta com fonte ATRASADO (teat.offline-sync) quando ack então passa (só INDISPONIVEL/DESATUALIZADO_MARCADO bloqueiam)', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'irregularity').id, id, {
      indicator_code: 'IND-DASH-404',
      block: 'D',
      source_app: 'teat',
      object_kind: 'sync-batch',
      object_ref: ORIGIN_OBJECTS.raitCase10,
    });
    await services.alerts.ack(
      db.tx,
      id,
      { channel: 'origin' } as never,
      ifMatchOf(1),
      ctxFor('dashDutyOwner', NOW),
    );
    expect((await db.alert(id))!.state).toBe('RECONHECIDO');
  });
});

describe('C-0002-19/20 — evidência de origem (§6.5)', () => {
  it('C-0002-19 dado alerta de irregularidade EM_TRATAMENTO quando chega célula SEM_RISCO (detect) então VERIFICADO (80) com event_id da célula e evento ALERTA_VERIFICADO', async () => {
    const id = nextId();
    const objectRef = ORIGIN_OBJECTS.manifestation02;
    await db.cloneAlert(seedAlertBy('EM_TRATAMENTO', 'irregularity').id, id, {
      object_ref: objectRef,
    });
    const cell: DetectionCell = {
      projection: 'dashboard.portal_service_metrics',
      indicatorCode: 'IND-DASH-301',
      sourceApp: 'portal',
      objectKind: 'manifestation',
      objectRef,
      objectLayer: 'N1',
      level: 'SEM_RISCO',
      eventId: nextId(),
      occurredAt: NOW,
    };
    const result = await services.alerts.detect(
      db.tx,
      cell,
      ctxFor('system', NOW),
    );
    expect(result).toEqual({ kind: 'verified', alertId: id });
    const alert = (await db.alert(id))!;
    expect(alert.state).toBe('VERIFICADO');
    expect(new Date(alert.verified_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    const trail = await db.trail(id);
    expect(trail[trail.length - 1]).toMatchObject({
      from_state: 'EM_TRATAMENTO',
      to_state: 'VERIFICADO',
      actor_kind: 'system',
      event_id: cell.eventId,
    });
    const events = await db.outboxFor(id);
    expect(events.map((row) => row.payload.domainEvent)).toContain(
      'ALERTA_VERIFICADO',
    ); // token proposto (OD-D33)
    expect(alert.closed_at).toBeNull();
  });

  it("C-0002-19 dado alerta de extinção EM_TRATAMENTO quando chega célula SEM_RISCO então VERIFICADO (80) e também ENCERRADO (101) na mesma transação, closed_at, timers CANCELADO (reason='alert_closed')", async () => {
    const id = nextId();
    const objectRef = ORIGIN_OBJECTS.raitCase11;
    await db.cloneAlert(seedAlertBy('EM_TRATAMENTO', 'extinction').id, id, {
      object_ref: objectRef,
    });
    const marco = nextId();
    await db.insertTimer({
      id: marco,
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'alert',
      owner_id: id,
      code: 'T-DASH-MARCO-75',
      started_at: new Date('2026-09-06T12:00:00.000Z'),
      due_at: new Date('2027-01-01T12:00:00.000Z'),
      status: 'ARMADO',
      version: 1,
    });
    const cell = normalCell(objectRef);
    const result = await services.alerts.detect(
      db.tx,
      cell,
      ctxFor('system', NOW),
    );
    expect(result).toEqual({ kind: 'verified', alertId: id });
    const alert = (await db.alert(id))!;
    expect(alert.state).toBe('ENCERRADO');
    expect(alert.verified_at).not.toBeNull();
    expect(new Date(alert.closed_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    const trail = await db.trail(id);
    const tail = trail.slice(-2);
    expect(tail[0]).toMatchObject({
      from_state: 'EM_TRATAMENTO',
      to_state: 'VERIFICADO',
      actor_kind: 'system',
      event_id: cell.eventId,
    });
    expect(tail[1]).toMatchObject({
      from_state: 'VERIFICADO',
      to_state: 'ENCERRADO',
      actor_kind: 'system',
    });
    expect(await db.timerById(marco)).toMatchObject({
      status: 'CANCELADO',
      reason: 'alert_closed',
    });
    const events = await db.outboxFor(id);
    expect(events.map((row) => row.payload.domainEvent)).toContain(
      'ALERTA_ENCERRADO',
    );
    const keys = events.map((row) => row.idempotency_key);
    expect(new Set(keys).size).toBe(keys.length); // uma linha por transição (versões distintas)
  });

  it('C-0002-20 dado alerta NOTIFICADO quando chega célula SEM_RISCO então só trilha origin_normal, estado inalterado, sem evento', async () => {
    const id = nextId();
    const objectRef = ORIGIN_OBJECTS.raitCase12;
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'extinction').id, id, {
      object_ref: objectRef,
    });
    const before = await db.trail(id);
    const result = await services.alerts.detect(
      db.tx,
      normalCell(objectRef),
      ctxFor('system', NOW),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'normal' });
    const alert = (await db.alert(id))!;
    expect(alert.state).toBe('NOTIFICADO');
    const trail = await db.trail(id);
    expect(trail).toHaveLength(before.length + 1);
    expect(trail[trail.length - 1]).toMatchObject({
      from_state: 'NOTIFICADO',
      to_state: 'NOTIFICADO',
      actor_kind: 'system',
      note: 'origin_normal',
    });
    expect(await db.outboxFor(id)).toHaveLength(0);
  });

  it('C-0002-20 dado a última célula da projeção já normal quando ack + treat então EM_TRATAMENTO → VERIFICADO imediato pelo verifyFromCell (event_id = last_event_id da célula)', async () => {
    const objectRef = ORIGIN_OBJECTS.raitCase12;
    // reutiliza o alerta do `it` anterior (NOTIFICADO, origin_normal na trilha)
    const existing = await db.alertsByObject('IND-DASH-101', 'case', objectRef);
    expect(existing).toHaveLength(1);
    const alertId = existing[0]!.id as string;
    const lastEventId = nextId();
    await db.insertProjectionCell('prescription_risk', {
      id: nextId(),
      tenant_id: FIXTURE_TENANT_ID,
      case_id: objectRef,
      clock_code: 'A',
      indicator_code: 'IND-DASH-101',
      flag: 'SEM_RISCO',
      ceiling_on: '2027-03-09',
      flag_changed_at: NOW,
      last_event_id: lastEventId,
      event_schema_version: 1,
      aggregate_version: 2,
    });
    const owner = ctxFor('raitManager', NOW);
    await services.alerts.ack(
      db.tx,
      alertId,
      { channel: 'origin' } as never,
      ifMatchOf(existing[0]!.version),
      owner,
    );
    const acked = (await db.alert(alertId))!;
    expect(acked.state).toBe('RECONHECIDO');
    await services.alerts.treat(
      db.tx,
      alertId,
      {} as never,
      ifMatchOf(acked.version),
      owner,
    );
    const after = (await db.alert(alertId))!;
    expect(after.state).toBe('ENCERRADO'); // extinção: 80 + 101 na mesma transação
    expect(after.treating_at).not.toBeNull();
    expect(after.verified_at).not.toBeNull();
    const trail = await db.trail(alertId);
    const verified = trail.find((line) => line.to_state === 'VERIFICADO')!;
    expect(verified).toMatchObject({
      from_state: 'EM_TRATAMENTO',
      actor_kind: 'system',
      event_id: lastEventId,
    });
    const treating = trail.find((line) => line.to_state === 'EM_TRATAMENTO')!;
    expect(treating.actor_kind).toBe('user');
  });

  it('C-0002-20 dado verifyFromCell em alerta EM_TRATAMENTO sem célula normal então false e estado inalterado', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('EM_TRATAMENTO', 'extinction').id, id, {
      object_ref: ORIGIN_OBJECTS.raitCase13,
    });
    const verified = await services.alerts.verifyFromCell(
      db.tx,
      id,
      ctxFor('system', NOW),
    );
    expect(verified).toBe(false);
    expect((await db.alert(id))!.state).toBe('EM_TRATAMENTO');
  });
});

describe('C-0002-45/46 — leituras do ciclo: getIncident e getView (§6.6, §6.7)', () => {
  it('C-0002-45 dado GET alerts/{id}/incident via getIncident para o alerta INCIDENTE_REGISTRADO da fixture então { incidentRef, notified[], rootCauses[], ceilingOn, ... }', async () => {
    const fixture = seedAlertBy('INCIDENTE_REGISTRADO', 'extinction');
    const incident = (await services.alerts.getIncident(
      db.tx,
      fixture.id,
      'N2',
    )) as Record<string, unknown>;
    expect(incident).not.toBeNull();
    expect(incident).toMatchObject({
      alertId: fixture.id,
      incidentRef: 'INCIDENTE-2026-000001',
      indicatorCode: 'IND-DASH-101',
      governingClock: 'A',
      sourceEventId: null,
    });
    expect(String(incident.ceilingOn)).toContain('2026-08-31');
    expect(incident.registeredAt).not.toBeNull();
    expect(Array.isArray(incident.notified)).toBe(true);
    expect(Array.isArray(incident.rootCauses)).toBe(true);
    expect(Array.isArray(incident.trail)).toBe(true);
    expect((incident.trail as unknown[]).length).toBe(4);
    expect(incident.object).toMatchObject({
      kind: 'case',
      ref: ORIGIN_OBJECTS.raitCase02,
      layer: 'N2',
    });
    expect(incident).toHaveProperty('meta');
    expect(Object.keys(incident).sort()).toEqual(
      [
        'alertId',
        'incidentRef',
        'registeredAt',
        'indicatorCode',
        'governingClock',
        'ceilingOn',
        'ceilingReachedOn',
        'object',
        'sourceEventId',
        'notified',
        'rootCauses',
        'trail',
        'meta',
      ].sort(),
    );
  });

  it('C-0002-45 dado alerta ESCALONADO (fixture 15) quando getIncident então null (→ 404 DASH.ALERT_INCIDENT_NOT_FOUND na superfície)', async () => {
    const fixture = seedAlertBy('ESCALONADO', 'extinction');
    expect(
      await services.alerts.getIncident(db.tx, fixture.id, 'N2'),
    ).toBeNull();
  });

  it('C-0002-45 dado alerta INCIDENTE_REGISTRADO nascido do detector com root-cause anotada quando getIncident então notified[] com {level, role, at, chainStatus} e rootCauses[] com {category, note, actorRef, at}', async () => {
    const objectRef = ORIGIN_OBJECTS.raitCase14;
    const cell: DetectionCell = {
      ...normalCell(objectRef),
      level: 'TETO',
      ceilingOn: '2026-09-02',
    };
    const result = await services.alerts.detect(
      db.tx,
      cell,
      ctxFor('system', NOW),
    );
    expect(result.kind).toBe('detected');
    const [alert] = await db.alertsByObject('IND-DASH-101', 'case', objectRef);
    await services.alerts.annotateRootCause(
      db.tx,
      alert!.id as string,
      { category: 'payload', note: 'causa apurada (fixture 0083)' } as never,
      ifMatchOf(alert!.version),
      ctxFor('raitManager', NOW),
    );
    const incident = (await services.alerts.getIncident(
      db.tx,
      alert!.id as string,
      'N2',
    )) as Record<string, unknown>;
    const notified = incident.notified as Record<string, unknown>[];
    expect(notified).toHaveLength(6);
    expect(notified.map((n) => n.role)).toContain(ROLES.auditor);
    for (const line of notified) {
      expect(Object.keys(line).sort()).toEqual([
        'at',
        'chainStatus',
        'level',
        'role',
      ]);
    }
    const rootCauses = incident.rootCauses as Record<string, unknown>[];
    expect(rootCauses).toHaveLength(1);
    expect(rootCauses[0]).toMatchObject({
      category: 'payload',
      note: 'causa apurada (fixture 0083)',
    });
    expect(Object.keys(rootCauses[0]!).sort()).toEqual([
      'actorRef',
      'at',
      'category',
      'note',
    ]);
    expect(incident.incidentRef).toBe(alert!.incident_ref);
    expect(incident.sourceEventId).toBe(cell.eventId);
  });

  it("C-0002-46 dado getView(alertId, 'N1') então object.ref = null e ownerRef = null; 'N2' então preenchidos; nunca campo fora de §6.6", async () => {
    const fixture = seedAlertBy('NOTIFICADO', 'extinction');
    const id = nextId();
    await db.cloneAlert(fixture.id, id, { owner_ref: USERS.raitManager });
    const n1 = (await services.alerts.getView(db.tx, id, 'N1')) as Record<
      string,
      unknown
    >;
    expect(n1).not.toBeNull();
    expect(Object.keys(n1).sort()).toEqual([...ALERT_VIEW_KEYS].sort());
    expect(n1.object).toEqual({ kind: 'case', ref: null, layer: 'N2' });
    expect(n1.ownerRef).toBeNull();
    expect(n1).toMatchObject({
      id,
      indicatorCode: 'IND-DASH-101',
      track: 'extinction',
      state: 'NOTIFICADO',
      severity: 'N2',
      block: 'A',
      sourceApp: 'rait',
      ownerRole: ROLES.raitManager,
      governingClock: 'A',
      escalationLevel: 0,
      ackChannel: null,
      incidentRef: null,
      version: 1,
    });
    expect(Object.keys(n1.timestamps as object).sort()).toEqual(
      [
        'detectedAt',
        'classifiedAt',
        'notifiedAt',
        'acknowledgedAt',
        'treatingAt',
        'verifiedAt',
        'closedAt',
        'escalatedAt',
        'criticalAt',
        'incidentAt',
      ].sort(),
    );
    expect(n1.timers).toEqual([]);
    const trail = n1.trail as Record<string, unknown>[];
    expect(trail).toHaveLength(3);
    for (const line of trail)
      expect(Object.keys(line).sort()).toEqual(
        [
          'seq',
          'fromState',
          'toState',
          'actorKind',
          'actorRef',
          'occurredAt',
          'note',
          'rootCauseCategory',
          'eventId',
        ].sort(),
      );
    expect(n1.meta).toHaveProperty('freshness');

    const n2 = (await services.alerts.getView(db.tx, id, 'N2')) as Record<
      string,
      unknown
    >;
    expect(n2.object).toEqual({
      kind: 'case',
      ref: ORIGIN_OBJECTS.raitCase02,
      layer: 'N2',
    });
    expect(n2.ownerRef).toBe(USERS.raitManager);
    expect(Object.keys(n2).sort()).toEqual([...ALERT_VIEW_KEYS].sort());
  });

  it('C-0002-46 dado getView com timers armados então timers[] = [{ code, status, startedAt, dueAt, firedAt }] e nada além', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'irregularity').id, id, {
      object_ref: ORIGIN_OBJECTS.manifestation03,
    });
    await db.insertTimer({
      id: nextId(),
      tenant_id: FIXTURE_TENANT_ID,
      owner_kind: 'alert',
      owner_id: id,
      code: 'T-DASH-ACK-N2',
      started_at: NOW,
      due_at: new Date('2026-09-22T12:00:00.000Z'),
      status: 'ARMADO',
      version: 1,
    });
    const view = (await services.alerts.getView(db.tx, id, 'N2')) as Record<
      string,
      unknown
    >;
    const timers = view.timers as Record<string, unknown>[];
    expect(timers).toHaveLength(1);
    expect(Object.keys(timers[0]!).sort()).toEqual([
      'code',
      'dueAt',
      'firedAt',
      'startedAt',
      'status',
    ]);
    expect(timers[0]).toMatchObject({
      code: 'T-DASH-ACK-N2',
      status: 'ARMADO',
      firedAt: null,
    });
  });

  it('C-0002-46 dado id inexistente quando getView então null', async () => {
    expect(
      await services.alerts.getView(db.tx, cycleId(SPEC, 0xffffff), 'N2'),
    ).toBeNull();
  });
});
