// CTG-0002 §15.1 C-0002-10, 11, 12, 13, 14, 15, 22, 23, 44, 47 [int] —
// detector (§6.2), classificador (§6.3), notificador e cadeia (§6.4, §2.3),
// incidente (§6.7) e verificação por célula (§6.5) de
// `DashboardAlertService.detect(tx, cell, ctx)` contra o `detran_r11`.
// Objetos de origem: casos RAIT 08…14 e manifestações 02…04 de fixtures
// canônicas (nunca o caso 02 / manifestação 01, que já têm alertas abertos
// no seed 81 — dedupe §6.2 tocaria o seed). `indicator.connected` forçado
// `true` nas fixtures do teste e restaurado no `afterAll` (C-0002-10).
// Fontes sem seed (`portal.outbox`, `dashboard`) inseridas `FRESCO` (§8.3).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { loadEscalationChain } from '../../src/handwritten/cycle/index.js';
import type { DetectionCell } from '../../src/handwritten/cycle/index.js';
import {
  ESCALATION_CHAIN,
  EVENT_TYPES,
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
  ifMatchOf,
  type CycleServices,
} from '../support/cycle-harness.js';

const SPEC = '02';
const NOW = new Date('2026-09-21T12:00:00.000Z');
const db = new CycleDb();
let services: CycleServices;
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));
const systemCtx = () => ctxFor('system', NOW);

/** Célula do bloco A (IND-DASH-101, `prescription_risk`) — `level` derivado
 * da `flag` pelo runner (§6.2: `ALERTA_N1 → N1` …, `PRESCRITO_OPERACIONAL →
 * TETO`), nunca calculado pelo detector. */
function raitCell(
  objectRef: string,
  level: DetectionCell['level'],
  overrides: Partial<DetectionCell> = {},
): DetectionCell {
  return {
    projection: 'dashboard.prescription_risk',
    indicatorCode: 'IND-DASH-101',
    sourceApp: 'rait',
    objectKind: 'case',
    objectRef,
    objectLayer: 'N2',
    level,
    governingClock: 'A',
    ceilingOn: '2027-03-09',
    nextMilestoneAt: new Date('2026-12-09T12:00:00.000Z'),
    eventId: nextId(),
    occurredAt: NOW,
    ...overrides,
  };
}

async function onlyAlertFor(
  indicatorCode: string,
  objectKind: string,
  objectRef: string,
) {
  const alerts = await db.alertsByObject(indicatorCode, objectKind, objectRef);
  expect(alerts).toHaveLength(1);
  return alerts[0]!;
}

beforeAll(async () => {
  await db.connect();
  await ensureSuiteSources(db, SPEC, NOW, cycleId);
  await db.forceConnected('IND-DASH-101', true);
  await db.forceConnected('IND-DASH-209', true);
  services = buildCycle(db, '2026-09-21');
});

afterAll(async () => {
  await db.cleanup();
  await db.end();
});

describe('C-0002-10/11 — detector do bloco A: DETECTADO → CLASSIFICADO → NOTIFICADO (§6.2, §6.3, §6.4)', () => {
  const objectRef = ORIGIN_OBJECTS.raitCase08;
  const cell = raitCell(objectRef, 'N1');

  it("C-0002-10 dado célula prescription_risk com flag='ALERTA_N1' para IND-DASH-101 (rait.outbox FRESCO, connected forçado true) quando detect então alerta NOTIFICADO na mesma transação com track/severity/relógio/teto/marco copiados, owner_role nível 1 da cadeia, trilha 1..3, T-DASH-ACK-N1 armado, eventos ALERTA_DETECTADO e ALERTA_NOTIFICADO", async () => {
    const result = await services.alerts.detect(db.tx, cell, systemCtx());
    expect(result.kind).toBe('detected');
    const alert = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    expect(alert.id).toBe((result as { alertId: string }).alertId);
    expect(alert).toMatchObject({
      state: 'NOTIFICADO',
      track: 'extinction',
      severity: 'N1',
      block: 'A',
      source_app: 'rait',
      object_kind: 'case',
      object_ref: objectRef,
      object_layer: 'N2',
      governing_clock: 'A',
      owner_role: ROLES.raitAnalyst,
      escalation_level: 1,
      source_event_id: cell.eventId,
    });
    expect(String(alert.ceiling_on)).toContain('2027-03-09');
    expect(new Date(alert.next_milestone_at as string).toISOString()).toBe(
      cell.nextMilestoneAt!.toISOString(),
    );
    expect(new Date(alert.detected_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    expect(alert.classified_at).not.toBeNull();
    expect(new Date(alert.notified_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );

    const trail = await db.trail(alert.id as string);
    expect(
      trail.map((line) => [line.seq, line.from_state, line.to_state]),
    ).toEqual([
      [1, null, 'DETECTADO'],
      [2, 'DETECTADO', 'CLASSIFICADO'],
      [3, 'CLASSIFICADO', 'NOTIFICADO'],
    ]);
    expect(trail.every((line) => line.actor_kind === 'system')).toBe(true);
    expect(trail[0]!.event_id).toBe(cell.eventId);
    expect(trail[2]!.note).toBe(`notified:1:${ROLES.raitAnalyst}`);

    const timers = await db.timers(alert.id as string);
    expect(timers).toHaveLength(1);
    expect(timers[0]).toMatchObject({
      owner_kind: 'alert',
      code: 'T-DASH-ACK-N1',
      status: 'ARMADO',
    });
    expect(new Date(timers[0]!.started_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    expect(timers[0]!.due_at).not.toBeNull();

    const events = await db.outboxFor(alert.id as string);
    const domainEvents = events.map((row) => row.payload.domainEvent);
    expect(domainEvents).toContain('ALERTA_DETECTADO');
    expect(domainEvents).toContain('ALERTA_NOTIFICADO');
    expect(events.every((row) => row.topic === EVENT_TYPES.alertChanged)).toBe(
      true,
    );
    const notified = events.find(
      (row) => row.payload.domainEvent === 'ALERTA_NOTIFICADO',
    )!;
    expect(notified.payload.data).toMatchObject({
      alertId: alert.id,
      recipientRole: ROLES.raitAnalyst,
      recipientLevel: 1,
      chainStatus: 'vigente',
      toState: 'NOTIFICADO',
    });
    expect(notified.payload.causationId).toBe(cell.eventId);
  });

  it('C-0002-11 dado o mesmo detect repetido (mesma célula) então nenhum alerta novo (ignored: open_alert) e nada muda', async () => {
    const before = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    const result = await services.alerts.detect(db.tx, cell, systemCtx());
    expect(result).toEqual({ kind: 'ignored', reason: 'open_alert' });
    const after = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    expect(after.version).toBe(before.version);
    expect(await db.trail(after.id as string)).toHaveLength(3);
  });

  it("C-0002-11 dado a mesma chave com flag='ALERTA_N2' então reclassified: severity N2, trilha reclassified:N2 com from_state = to_state, sem transição (OD-D40)", async () => {
    const result = await services.alerts.detect(
      db.tx,
      raitCell(objectRef, 'N2'),
      systemCtx(),
    );
    expect(result.kind).toBe('reclassified');
    const alert = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    expect(alert.state).toBe('NOTIFICADO');
    expect(alert.severity).toBe('N2');
    const trail = await db.trail(alert.id as string);
    expect(trail).toHaveLength(4);
    expect(trail[3]).toMatchObject({
      seq: 4,
      from_state: 'NOTIFICADO',
      to_state: 'NOTIFICADO',
      actor_kind: 'system',
      note: 'reclassified:N2',
    });
  });

  it('C-0002-11 dado a mesma chave com nível inferior (N1) depois de N2 então ignored: open_alert (só nível superior reclassifica)', async () => {
    const result = await services.alerts.detect(
      db.tx,
      raitCell(objectRef, 'N1'),
      systemCtx(),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'open_alert' });
    expect(
      (await onlyAlertFor('IND-DASH-101', 'case', objectRef)).severity,
    ).toBe('N2');
  });

  it('C-0002-44 dado alerta N2 (object_layer N2) quando publicado então data.objectLayer=N2 e data.sourceApp presentes (base do filtro SQL do SSE)', async () => {
    const alert = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    const events = await db.outboxFor(alert.id as string);
    expect(events.length).toBeGreaterThan(0);
    for (const row of events) {
      expect(row.payload.data.objectLayer).toBe('N2');
      expect(row.payload.data.sourceApp).toBe('rait');
      expect(row.payload.data.objectRef).toBe(objectRef);
    }
  });
});

describe('C-0002-12/13 — teto atingido: CRITICO_EXTINCAO → INCIDENTE_REGISTRADO (§6.7) e cadeia inteira + AUDITOR (§6.4 item 4)', () => {
  const objectRef = ORIGIN_OBJECTS.raitCase09;
  const cell = raitCell(objectRef, 'TETO', {
    ceilingOn: '2026-09-02',
    nextMilestoneAt: undefined,
  });

  it("C-0002-12 dado célula com flag='PRESCRITO_OPERACIONAL' (level TETO) quando detect então DETECTADO → CLASSIFICADO → CRITICO_EXTINCAO → INCIDENTE_REGISTRADO numa transação, severity CRITICO, incident_ref = id da trilha 110, critical_at/incident_at, eventos ALERTA_CRITICO_EXTINCAO e INCIDENTE_REGISTRADO", async () => {
    const result = await services.alerts.detect(db.tx, cell, systemCtx());
    expect(result.kind).toBe('detected');
    const alert = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    expect(alert).toMatchObject({
      state: 'INCIDENTE_REGISTRADO',
      track: 'extinction',
      severity: 'CRITICO',
    });
    expect(alert.critical_at).not.toBeNull();
    expect(alert.incident_at).not.toBeNull();
    expect(alert.notified_at).toBeNull();

    const trail = await db.trail(alert.id as string);
    const transitions = trail.filter(
      (line) => line.from_state !== line.to_state,
    );
    expect(transitions.map((line) => [line.from_state, line.to_state])).toEqual(
      [
        [null, 'DETECTADO'],
        ['DETECTADO', 'CLASSIFICADO'],
        ['CLASSIFICADO', 'CRITICO_EXTINCAO'],
        ['CRITICO_EXTINCAO', 'INCIDENTE_REGISTRADO'],
      ],
    );
    const incidentLine = trail.find(
      (line) => line.to_state === 'INCIDENTE_REGISTRADO',
    )!;
    expect(alert.incident_ref).toBe(incidentLine.id);
    expect(incidentLine.note).toBe('incident:IND-DASH-101:2026-09-02');
    expect(incidentLine.actor_kind).toBe('system');

    const events = await db.outboxFor(alert.id as string);
    const domainEvents = events.map((row) => row.payload.domainEvent);
    expect(domainEvents).toContain('ALERTA_DETECTADO');
    expect(domainEvents).toContain('ALERTA_CRITICO_EXTINCAO'); // token proposto (OD-D33)
    expect(domainEvents).toContain('INCIDENTE_REGISTRADO');
    const incidentEvent = events.find(
      (row) => row.payload.domainEvent === 'INCIDENTE_REGISTRADO',
    )!;
    expect(incidentEvent.payload.data.incidentRef).toBe(incidentLine.id);
    // sem SLA de ACK nesse ramo (40 → 110, nunca NOTIFICADO)
    const timers = await db.timers(alert.id as string);
    expect(
      timers.filter((timer) => String(timer.code).startsWith('T-DASH-ACK')),
    ).toHaveLength(0);
  });

  it("C-0002-13 dado CRITICO_EXTINCAO de source_app='rait' quando notificado então 5 trilhas notified:<n>:<role> (níveis 1–5) + 1 AUDITOR (chainStatus='h54'), 6 eventos ALERTA_ESCALONADO com recipientRole", async () => {
    const alert = await onlyAlertFor('IND-DASH-101', 'case', objectRef);
    const trail = await db.trail(alert.id as string);
    const notified = trail
      .filter((line) => String(line.note ?? '').startsWith('notified:'))
      .map((line) => String(line.note));
    const chainNotes = ESCALATION_CHAIN.filter(
      (row) => row.sourceApp === 'rait',
    ).map(
      (row) =>
        `notified:${row.level}:${row.role}${row.status === 'source_pending' ? ':source_pending' : ''}`,
    );
    for (const note of chainNotes) expect(notified).toContain(note);
    expect(
      notified.filter((note) => /^notified:[1-5]:/.test(note)),
    ).toHaveLength(5);
    expect(notified).toHaveLength(6);

    const events = (await db.outboxFor(alert.id as string)).filter(
      (row) => row.payload.domainEvent === 'ALERTA_ESCALONADO',
    );
    expect(events).toHaveLength(6);
    const recipients = events.map((row) => row.payload.data.recipientRole);
    expect([...recipients].sort()).toEqual(
      [
        ROLES.raitAnalyst,
        ROLES.raitCoordinator,
        ROLES.raitManager,
        ROLES.raitChair,
        ROLES.auditor,
        ROLES.auditor,
      ].sort(),
    );
    const h54 = events.filter((row) => row.payload.data.chainStatus === 'h54');
    expect(h54).toHaveLength(1);
    expect(h54[0]!.payload.data.recipientRole).toBe(ROLES.auditor);
    expect(
      events.filter((row) => row.payload.data.chainStatus === 'vigente'),
    ).toHaveLength(4);
    expect(
      events.filter((row) => row.payload.data.chainStatus === 'source_pending'),
    ).toHaveLength(1);
  });

  it('C-0002-13 dado dashboard.critical_extinction.notify_legal=false (parâmetro do teste, restaurado) quando detect TETO em outro caso então 5 notificações e nenhuma linha AUDITOR h54', async () => {
    const restore = services.parameters.override(
      'critical_extinction.notify_legal',
      false,
    );
    try {
      const other = ORIGIN_OBJECTS.raitCase10;
      const result = await services.alerts.detect(
        db.tx,
        raitCell(other, 'TETO', {
          ceilingOn: '2026-09-02',
          nextMilestoneAt: undefined,
        }),
        systemCtx(),
      );
      expect(result.kind).toBe('detected');
      const alert = await onlyAlertFor('IND-DASH-101', 'case', other);
      expect(alert.state).toBe('INCIDENTE_REGISTRADO');
      const events = (await db.outboxFor(alert.id as string)).filter(
        (row) => row.payload.domainEvent === 'ALERTA_ESCALONADO',
      );
      expect(events).toHaveLength(5);
      expect(
        events.filter((row) => row.payload.data.chainStatus === 'h54'),
      ).toHaveLength(0);
      const trail = await db.trail(alert.id as string);
      expect(
        trail.filter((line) => String(line.note ?? '').startsWith('notified:')),
      ).toHaveLength(5);
    } finally {
      restore();
    }
  });
});

describe('C-0002-14/15 — cadeia por app (§2.3, §6.4)', () => {
  it("C-0002-14 dado alerta de source_app='pec' (IND-DASH-306, fonte pec.deadlines) quando notificado via notify então nível 1 GESTOR com chainStatus='source_pending'", async () => {
    // Fonte `pec.deadlines` é INDISPONIVEL no seed: o notificador não consulta
    // frescor (só comandos e detector o fazem, §8.4) — chamado direto.
    const id = nextId();
    await db.cloneAlert(seedAlertBy('CLASSIFICADO', 'irregularity').id, id, {
      indicator_code: 'IND-DASH-306',
      source_app: 'pec',
      block: 'C',
      object_kind: 'exam-process',
      object_ref: ORIGIN_OBJECTS.raitCase11,
      owner_role: ROLES.gestor,
    });
    const alert = (await db.alert(id))!;
    const result = await services.notifier.notify(
      db.tx,
      alert as never,
      1,
      systemCtx(),
      'ALERTA_NOTIFICADO',
    );
    expect(result).toEqual({
      role: ROLES.gestor,
      chainStatus: 'source_pending',
    });
    const trail = await db.trail(id);
    expect(trail[trail.length - 1]!.note).toBe(
      `notified:1:${ROLES.gestor}:source_pending`,
    );
    const events = await db.outboxFor(id);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.data).toMatchObject({
      recipientRole: ROLES.gestor,
      recipientLevel: 1,
      chainStatus: 'source_pending',
    });
    expect(events[0]!.payload.domainEvent).toBe('ALERTA_NOTIFICADO');
  });

  it("C-0002-14 dado alerta de source_app='dashboard' (sem linha na cadeia) quando notificado então alert.owner_role como nível 1 e chainStatus='source_pending'", async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('CLASSIFICADO', 'irregularity').id, id, {
      indicator_code: 'IND-DASH-408',
      source_app: 'dashboard',
      block: 'D',
      object_kind: 'source',
      object_ref: ORIGIN_OBJECTS.raitCase12,
      owner_role: ROLES.dashOperator,
    });
    const alert = (await db.alert(id))!;
    const result = await services.notifier.notify(
      db.tx,
      alert as never,
      1,
      systemCtx(),
      'ALERTA_NOTIFICADO',
    );
    expect(result).toEqual({
      role: ROLES.dashOperator,
      chainStatus: 'source_pending',
    });
    const trail = await db.trail(id);
    expect(trail[trail.length - 1]!.note).toBe(
      `notified:1:${ROLES.dashOperator}:source_pending`,
    );
  });

  it('C-0002-14 dado notify quando efetiva então escalation_level = nível e notified_at = now (nível 1) e um T-DASH-ACK-<sev> armado com started_at = now', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('CLASSIFICADO', 'irregularity').id, id, {
      object_ref: ORIGIN_OBJECTS.manifestation02,
      severity: 'N3',
    });
    const alert = (await db.alert(id))!;
    await services.notifier.notify(
      db.tx,
      alert as never,
      1,
      systemCtx(),
      'ALERTA_NOTIFICADO',
    );
    const after = (await db.alert(id))!;
    expect(after.escalation_level).toBe(1);
    expect(new Date(after.notified_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
    const timers = await db.timers(id);
    expect(timers).toHaveLength(1);
    expect(timers[0]).toMatchObject({
      code: 'T-DASH-ACK-N3',
      status: 'ARMADO',
    });
    expect(new Date(timers[0]!.started_at as string).toISOString()).toBe(
      NOW.toISOString(),
    );
  });

  it('C-0002-15 dado escalation_chain_ref quando lida então as 10 linhas de §2.3 com role ∈ auth.role_catalog (FK) e rait níveis 1–4 vigente, 5 source_pending', async () => {
    const rows = await db.client.query<{
      source_app: string;
      level: number;
      role: string;
      status: string;
      in_catalog: boolean;
    }>(
      `select c.source_app, c.level, c.role, c.status, (r.key is not null) as in_catalog
         from dashboard.escalation_chain_ref c
         left join auth.role_catalog r on r.key = c.role
        order by c.source_app, c.level`,
    );
    expect(rows.rows).toHaveLength(10);
    const got = rows.rows.map((row) => ({
      sourceApp: row.source_app,
      level: Number(row.level),
      role: row.role,
      status: row.status,
    }));
    const expected = [...ESCALATION_CHAIN].sort(
      (a, b) => a.sourceApp.localeCompare(b.sourceApp) || a.level - b.level,
    );
    expect(got).toEqual(expected);
    expect(rows.rows.every((row) => row.in_catalog)).toBe(true);
    const rait = got.filter((row) => row.sourceApp === 'rait');
    expect(rait.map((row) => row.status)).toEqual([
      'vigente',
      'vigente',
      'vigente',
      'vigente',
      'source_pending',
    ]);
  });

  it('C-0002-15 dado loadEscalationChain(tx, rait) quando chamada então devolve os 5 níveis ordenados por level; para institucional devolve vazio', async () => {
    const rait = (await loadEscalationChain(db.tx, 'rait')) as Record<
      string,
      unknown
    >[];
    expect(rait).toHaveLength(5);
    expect(rait.map((row) => Number(row.level))).toEqual([1, 2, 3, 4, 5]);
    expect(rait.map((row) => row.role)).toEqual([
      ROLES.raitAnalyst,
      ROLES.raitCoordinator,
      ROLES.raitManager,
      ROLES.raitChair,
      ROLES.auditor,
    ]);
    expect(await loadEscalationChain(db.tx, 'institucional')).toHaveLength(0);
  });
});

describe('C-0002-22/23 — detector mudo: fonte velha, desconectado, sem escada (§6.2, §8.4)', () => {
  it('C-0002-22 dado indicador com fonte DESATUALIZADO_MARCADO (IND-DASH-310 → boat.crashes) quando detect então ignored: stale_source e nenhum alerta', async () => {
    const objectRef = ORIGIN_OBJECTS.raitCase13;
    const result = await services.alerts.detect(
      db.tx,
      {
        projection: 'dashboard.crashes',
        indicatorCode: 'IND-DASH-310',
        sourceApp: 'boat',
        objectKind: 'crash',
        objectRef,
        objectLayer: 'N1',
        level: 'N2',
        eventId: nextId(),
        occurredAt: NOW,
      },
      systemCtx(),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'stale_source' });
    expect(
      await db.alertsByObject('IND-DASH-310', 'crash', objectRef),
    ).toHaveLength(0);
  });

  it('C-0002-22 dado indicador com fonte INDISPONIVEL (IND-DASH-306 → pec.deadlines) quando detect então ignored: stale_source', async () => {
    const objectRef = ORIGIN_OBJECTS.raitCase13;
    const result = await services.alerts.detect(
      db.tx,
      {
        projection: 'dashboard.pec_deadlines',
        indicatorCode: 'IND-DASH-306',
        sourceApp: 'pec',
        objectKind: 'exam-process',
        objectRef,
        objectLayer: 'N2',
        level: 'N1',
        eventId: nextId(),
        occurredAt: NOW,
      },
      systemCtx(),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'stale_source' });
  });

  it('C-0002-22 dado indicador connected=false (IND-DASH-102, rait.outbox FRESCO) quando detect então ignored: disconnected', async () => {
    const objectRef = ORIGIN_OBJECTS.raitCase13;
    const result = await services.alerts.detect(
      db.tx,
      {
        projection: 'dashboard.prescription_risk',
        indicatorCode: 'IND-DASH-102',
        sourceApp: 'rait',
        objectKind: 'case',
        objectRef,
        objectLayer: 'N2',
        level: 'N1',
        governingClock: 'B',
        eventId: nextId(),
        occurredAt: NOW,
      },
      systemCtx(),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'disconnected' });
    expect(
      await db.alertsByObject('IND-DASH-102', 'case', objectRef),
    ).toHaveLength(0);
  });

  it('C-0002-22 dado level SEM_RISCO sem alerta aberto quando detect então ignored: normal (§6.2 regra 3)', async () => {
    const result = await services.alerts.detect(
      db.tx,
      raitCell(ORIGIN_OBJECTS.raitCase14, 'SEM_RISCO'),
      systemCtx(),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'normal' });
  });

  it('C-0002-23 dado indicador de bloco C (IND-DASH-301) sem indicator_config publicada quando detect com métrica fora de faixa então ignored: no_ladder', async () => {
    const objectRef = ORIGIN_OBJECTS.manifestation03;
    const result = await services.alerts.detect(
      db.tx,
      {
        projection: 'dashboard.portal_service_metrics',
        indicatorCode: 'IND-DASH-301',
        sourceApp: 'portal',
        objectKind: 'manifestation',
        objectRef,
        objectLayer: 'N1',
        level: 'N2',
        eventId: nextId(),
        occurredAt: NOW,
      },
      systemCtx(),
    );
    expect(result).toEqual({ kind: 'ignored', reason: 'no_ladder' });
    expect(
      await db.alertsByObject('IND-DASH-301', 'manifestation', objectRef),
    ).toHaveLength(0);
  });

  it("C-0002-23 dado indicator_config publicada com levels.n2 cruzado (kind='target') quando detect então alerta irregularity com severity='N2'", async () => {
    const objectRef = ORIGIN_OBJECTS.manifestation04;
    await db.insertIndicatorConfig({
      id: nextId(),
      tenant_id: FIXTURE_TENANT_ID,
      indicator_code: 'IND-DASH-301',
      code: 'cycle-0083-ind-301',
      name: 'Escada de teste IND-DASH-301 (fixture 0083)',
      formula: 'score',
      granularity: 'manifestation',
      threshold_json: JSON.stringify({
        kind: 'target',
        metric: 'score',
        direction: 'above',
        levels: { n1: 10, n2: 30 },
      }),
      status: 'published',
      published_at: NOW,
      published_by: USERS.agencyAdmin,
      version: 1,
    });
    const result = await services.alerts.detect(
      db.tx,
      {
        projection: 'dashboard.portal_service_metrics',
        indicatorCode: 'IND-DASH-301',
        sourceApp: 'portal',
        objectKind: 'manifestation',
        objectRef,
        objectLayer: 'N1',
        level: 'N2',
        eventId: nextId(),
        occurredAt: NOW,
      },
      systemCtx(),
    );
    expect(result.kind).toBe('detected');
    const alert = await onlyAlertFor(
      'IND-DASH-301',
      'manifestation',
      objectRef,
    );
    expect(alert).toMatchObject({
      track: 'irregularity',
      severity: 'N2',
      block: 'C',
      state: 'NOTIFICADO',
      owner_role: ROLES.dashOperator, // cadeia portal nível 1 (source_pending)
    });
    const events = await db.outboxFor(alert.id as string);
    const notified = events.find(
      (row) => row.payload.domainEvent === 'ALERTA_NOTIFICADO',
    )!;
    expect(notified.payload.data.chainStatus).toBe('source_pending');
    for (const row of events) {
      for (const forbidden of FORBIDDEN_EVENT_DATA_KEYS)
        expect(row.payload.data).not.toHaveProperty(forbidden);
    }
  });
});

describe('C-0002-47 — transparência (IND-DASH-209): período anterior sem auditoria (§10.4, passo 4 do sweeper)', () => {
  const period = '2026-09';

  it("C-0002-47 dado célula de transparency_audit (2026-09 sem auditoria, FixedClock('2026-10-02')) quando detect (passo 4) então alerta IND-DASH-209 irregularity CRITICO com object_ref='2026-09'", async () => {
    const october = buildCycle(db, '2026-10-02');
    const now = new Date('2026-10-02T12:00:00.000Z');
    const result = await october.alerts.detect(
      db.tx,
      {
        projection: 'dashboard.transparency_audit',
        indicatorCode: 'IND-DASH-209',
        sourceApp: 'portal',
        objectKind: 'period',
        objectRef: period,
        objectLayer: 'N0',
        level: 'CRITICO',
        occurredAt: now,
      },
      ctxFor('system', now),
    );
    expect(result.kind).toBe('detected');
    const alert = await onlyAlertFor('IND-DASH-209', 'period', period);
    expect(alert).toMatchObject({
      track: 'irregularity',
      severity: 'CRITICO',
      block: 'B',
      object_ref: period,
      state: 'NOTIFICADO',
      source_event_id: null,
    });
    const trail = await db.trail(alert.id as string);
    expect(trail[0]!.note).toBe('fallback'); // §8.5: detecção sem evento = degradação declarada
    const timers = await db.timers(alert.id as string);
    expect(timers.map((timer) => timer.code)).toContain('T-DASH-ACK-CRITICO');
    const critico = timers.find(
      (timer) => timer.code === 'T-DASH-ACK-CRITICO',
    )!;
    expect(new Date(critico.due_at as string).toISOString()).toBe(
      new Date(critico.started_at as string).toISOString(),
    );
  });

  it('C-0002-47 dado a auditoria de 2026-09 registrada (efeito de POST transparency/audits) quando ack + treat então verifyFromCell normaliza (EM_TRATAMENTO → VERIFICADO)', async () => {
    const now = new Date('2026-10-02T13:00:00.000Z');
    const october = buildCycle(db, '2026-10-02');
    const alert = await onlyAlertFor('IND-DASH-209', 'period', period);
    await db.insertTransparencyAudit({
      id: nextId(),
      tenant_id: FIXTURE_TENANT_ID,
      period,
      checklist_json: JSON.stringify({ items: [] }),
      result: 'conforme',
      audited_by: USERS.agencyAdmin,
      audited_at: now,
    });
    const owner = ctxFor('dashOperator', now);
    await october.alerts.ack(
      db.tx,
      alert.id as string,
      { channel: 'origin' } as never,
      ifMatchOf(alert.version),
      owner,
    );
    const acked = (await db.alert(alert.id as string))!;
    expect(acked.state).toBe('RECONHECIDO');
    await october.alerts.treat(
      db.tx,
      alert.id as string,
      {} as never,
      ifMatchOf(acked.version),
      owner,
    );
    const after = (await db.alert(alert.id as string))!;
    expect(after.state).toBe('VERIFICADO');
    expect(after.verified_at).not.toBeNull();
    const trail = await db.trail(alert.id as string);
    expect(trail[trail.length - 1]).toMatchObject({
      from_state: 'EM_TRATAMENTO',
      to_state: 'VERIFICADO',
      actor_kind: 'system',
    });
  });
});
