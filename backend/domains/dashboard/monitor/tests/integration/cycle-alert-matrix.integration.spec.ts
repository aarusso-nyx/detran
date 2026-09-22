// CTG-0002 §15.1 C-0002-02, 03, 04, 06, 08, 09 [int] — matriz COMPLETA dos
// comandos de usuário sobre alerta (`ack`, `treat`, `close`, `root-cause`)
// por (estado, trilha) das 18 fixtures do seed 81 × ator, permitida E negada
// (§6.1, M25). O seed 81 é só leitura: cada célula da matriz clona a fixture
// (alerta + trilha) para um id do namespace `0083 01…` e comanda o clone; o
// `afterAll` apaga clones, trilhas, timers e outbox por id próprio.
// Fonte da trilha irregularity (IND-DASH-301 → `portal.outbox`, §8.3) sem
// seed ⇒ inserida `FRESCO` pela suíte (senão todo comando seria 409
// `DASH.ALERT_SOURCE_STALE` — OD no relatório). Relógio fixo 2026-09-21.
// Interpretações registradas (OD no relatório): (i) `close` por ator que não
// é `dash-operator` em VERIFICADO/irregularity → 403 `DASH.FORBIDDEN_ACTION`
// (analogia com a linha 70; a linha 100 não fixa código); (ii)
// `DASH.ALERT_CLOSE_WITHOUT_VERIFICATION` em todo estado não terminal ≠
// VERIFICADO da trilha irregularity (C-0002-06 fixa só EM_TRATAMENTO).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { assertDashIfMatch } from '../../src/handwritten/cycle/index.js';
import {
  FIXTURE_TENANT_ID,
  ORIGIN_OBJECTS,
  SEED_ALERTS,
  TERMINAL_ALERT_STATES,
  USERS,
  cycleId,
  seedAlertBy,
  type AlertState,
  type AlertTrack,
  type SeedAlertFixture,
} from '../fixtures/cycle-fixtures.js';
import {
  CycleDb,
  buildCycle,
  ctxFor,
  ensureSuiteSources,
  expectDashError,
  ifMatchOf,
  type ActorKey,
  type CycleServices,
} from '../support/cycle-harness.js';

const SPEC = '01';
const NOW = new Date('2026-09-21T12:00:00.000Z');
const db = new CycleDb();
let services: CycleServices;
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));

type Command = 'ack' | 'treat' | 'close' | 'root-cause';
const COMMANDS: readonly Command[] = ['ack', 'treat', 'close', 'root-cause'];
const ROOT_CAUSE_CATEGORIES = ['transport', 'acceptance', 'payload'] as const;

/** Dono da fixture (§6.1: principal com `alert.owner_role` entre os papéis
 * canônicos): `rait-manager` na trilha extinction, `dash-duty-owner` na
 * irregularity (CTG-0001 §5.3). */
const ownerOf = (track: AlertTrack): ActorKey =>
  track === 'extinction' ? 'raitManager' : 'dashDutyOwner';
const ownerUserOf = (track: AlertTrack): string =>
  track === 'extinction' ? USERS.raitManager : USERS.agencyAdmin;

interface Expectation {
  kind: 'allowed' | 'denied';
  toState?: AlertState;
  domainEvent?: string;
  code?: string;
  status?: number;
}

/** A matriz de §6.1 como função (estado, trilha, comando, ator) → esperado. */
function expectation(
  state: AlertState,
  track: AlertTrack,
  command: Command,
  who: ActorKey,
): Expectation {
  const terminal = TERMINAL_ALERT_STATES.includes(state);
  const stateInvalid: Expectation = {
    kind: 'denied',
    code: 'DASH.ALERT_STATE_INVALID',
    status: 409,
  };
  const isOwner = who === ownerOf(track);
  switch (command) {
    case 'root-cause':
      return { kind: 'allowed', toState: state };
    case 'ack':
      if (state !== 'NOTIFICADO') return stateInvalid;
      if (!isOwner && who !== 'dashOperator')
        return {
          kind: 'denied',
          code: 'DASH.ALERT_ACK_NOT_OWNER',
          status: 403,
        };
      return {
        kind: 'allowed',
        toState: 'RECONHECIDO',
        domainEvent: 'ALERTA_RECONHECIDO',
      };
    case 'treat':
      if (state !== 'RECONHECIDO') return stateInvalid;
      if (!isOwner)
        return { kind: 'denied', code: 'DASH.FORBIDDEN_ACTION', status: 403 };
      return {
        kind: 'allowed',
        toState: 'EM_TRATAMENTO',
        domainEvent: 'ALERTA_EM_TRATAMENTO', // token proposto (OD-D33): "presente com este nome"
      };
    case 'close':
      if (terminal) return stateInvalid;
      if (track === 'extinction')
        return {
          kind: 'denied',
          code: 'DASH.ALERT_EXTINCTION_NOT_CLOSABLE',
          status: 409,
        };
      if (state !== 'VERIFICADO')
        return {
          kind: 'denied',
          code: 'DASH.ALERT_CLOSE_WITHOUT_VERIFICATION',
          status: 409,
        };
      if (who !== 'dashOperator')
        return { kind: 'denied', code: 'DASH.FORBIDDEN_ACTION', status: 403 };
      return {
        kind: 'allowed',
        toState: 'ENCERRADO',
        domainEvent: 'ALERTA_ENCERRADO',
      };
  }
}

async function runCommand(
  command: Command,
  alertId: string,
  who: ActorKey,
  track: AlertTrack,
  version: number,
  /** `null` = cabeçalho AUSENTE (sentinela: `undefined` ativaria o default). */
  ifMatchArg: string | null = ifMatchOf(version),
  dtoOverride?: Record<string, unknown>,
): Promise<unknown> {
  const ifMatch = ifMatchArg ?? undefined;
  const ctx = ctxFor(who, NOW);
  const { alerts } = services;
  switch (command) {
    case 'ack': {
      const dto =
        dtoOverride ??
        (who === 'dashOperator'
          ? {
              channel: 'manual',
              note: 'ACK manual em nome do dono (fixture 0083)',
              onBehalfOf: ownerUserOf(track),
            }
          : { channel: 'origin' });
      return alerts.ack(db.tx, alertId, dto as never, ifMatch, ctx);
    }
    case 'treat':
      return alerts.treat(
        db.tx,
        alertId,
        (dtoOverride ?? {}) as never,
        ifMatch,
        ctx,
      );
    case 'close':
      return alerts.close(
        db.tx,
        alertId,
        (dtoOverride ?? {}) as never,
        ifMatch,
        ctx,
      );
    case 'root-cause':
      return alerts.annotateRootCause(
        db.tx,
        alertId,
        (dtoOverride ?? { category: 'transport' }) as never,
        ifMatch,
        ctx,
      );
  }
}

async function snapshot(alertId: string) {
  const alert = (await db.alert(alertId))!;
  const trail = await db.trail(alertId);
  const timers = await db.timers(alertId);
  return { alert, trail, timers };
}

beforeAll(async () => {
  await db.connect();
  await ensureSuiteSources(db, SPEC, NOW, cycleId);
  services = buildCycle(db, '2026-09-21');
});

afterAll(async () => {
  await db.cleanup();
  await db.end();
});

describe('C-0002-02 — matriz completa (estado × trilha × comando × ator), §6.1', () => {
  const cells = SEED_ALERTS.flatMap((fixture) =>
    COMMANDS.flatMap((command) =>
      (['owner', 'dashOperator'] as const).map((role) => ({
        fixture,
        command,
        who: (role === 'owner'
          ? ownerOf(fixture.track)
          : 'dashOperator') as ActorKey,
        roleLabel:
          role === 'owner' ? `owner(${fixture.ownerRole})` : 'dash-operator',
      })),
    ),
  );

  it.each(cells)(
    'C-0002-02 dado alerta $fixture.state/$fixture.track quando $command por $roleLabel então o resultado da matriz de §6.1',
    async ({ fixture, command, who }) => {
      const id = nextId();
      await db.cloneAlert(fixture.id, id);
      const before = await snapshot(id);
      const expected = expectation(fixture.state, fixture.track, command, who);

      if (expected.kind === 'denied') {
        const context = await expectDashError(
          runCommand(
            command,
            id,
            who,
            fixture.track,
            Number(before.alert.version),
          ),
          expected.code!,
          expected.status!,
        );
        if (expected.code === 'DASH.ALERT_STATE_INVALID') {
          expect(Array.isArray(context.allowed)).toBe(true);
        }
        const after = await snapshot(id);
        expect(after.alert.state).toBe(before.alert.state);
        expect(after.alert.version).toBe(before.alert.version);
        expect(after.trail).toHaveLength(before.trail.length);
        expect(await db.outboxFor(id)).toHaveLength(0);
        return;
      }

      await runCommand(
        command,
        id,
        who,
        fixture.track,
        Number(before.alert.version),
      );
      const after = await snapshot(id);
      expect(after.alert.state).toBe(expected.toState);
      expect(Number(after.alert.version)).toBe(
        Number(before.alert.version) + 1,
      );
      expect(after.trail).toHaveLength(before.trail.length + 1);
      const last = after.trail[after.trail.length - 1]!;
      expect(last.seq).toBe(before.trail.length + 1);
      expect(last.from_state).toBe(before.alert.state);
      expect(last.to_state).toBe(expected.toState);
      expect(last.actor_kind).toBe('user');
      expect(String(last.actor_ref)).toContain(ctxFor(who, NOW).actor.id);
      if (expected.domainEvent) {
        const events = await db.outboxFor(id);
        expect(events.map((row) => row.payload.domainEvent)).toContain(
          expected.domainEvent,
        );
      }
    },
  );

  it('C-0002-02 dado a matriz quando contada então cobre 18 fixtures × 4 comandos × 2 atores = 144 células, com 6 permitidas de transição (ack×2, treat×2, close×1 … ) + 36 anotações', () => {
    expect(cells).toHaveLength(144);
    const allowed = cells.filter(
      (cell) =>
        expectation(
          cell.fixture.state,
          cell.fixture.track,
          cell.command,
          cell.who,
        ).kind === 'allowed',
    );
    // root-cause: 18 × 2; ack em NOTIFICADO: 2 trilhas × 2 atores; treat em
    // RECONHECIDO: 2 trilhas × owner; close em VERIFICADO/irregularity × dash-operator.
    expect(allowed).toHaveLength(36 + 4 + 2 + 1);
  });
});

describe('C-0002-03 — ack manual sem note (§6.8, OD-D05)', () => {
  it('C-0002-03 dado alerta NOTIFICADO quando ack com channel=manual sem note então 422 DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED e nada muda (versão, trilha, timers)', async () => {
    const fixture = seedAlertBy('NOTIFICADO', 'extinction');
    const id = nextId();
    await db.cloneAlert(fixture.id, id);
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
    const before = await snapshot(id);
    await expectDashError(
      runCommand('ack', id, 'raitManager', 'extinction', 1, ifMatchOf(1), {
        channel: 'manual',
      }),
      'DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED',
      422,
    );
    const after = await snapshot(id);
    expect(after.alert.state).toBe('NOTIFICADO');
    expect(after.alert.version).toBe(before.alert.version);
    expect(after.alert.ack_channel).toBeNull();
    expect(after.trail).toHaveLength(before.trail.length);
    expect(after.timers).toHaveLength(1);
    expect(after.timers[0]).toMatchObject({ id: timerId, status: 'ARMADO' });
    expect(await db.outboxFor(id)).toHaveLength(0);
  });

  it('C-0002-03 dado alerta NOTIFICADO quando ack por dash-operator com onBehalfOf sem note então 422 DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED (ACK manual rotulado exige note)', async () => {
    const fixture = seedAlertBy('NOTIFICADO', 'irregularity');
    const id = nextId();
    await db.cloneAlert(fixture.id, id);
    await expectDashError(
      runCommand('ack', id, 'dashOperator', 'irregularity', 1, ifMatchOf(1), {
        channel: 'manual',
        onBehalfOf: USERS.agencyAdmin,
      }),
      'DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED',
      422,
    );
    expect((await db.alert(id))!.state).toBe('NOTIFICADO');
  });
});

describe('C-0002-04 — dono do ACK (§6.1 linha 50, §6.8)', () => {
  it.each([
    {
      who: 'stranger' as const,
      label: 'rait-secretary (sem papel sobre alerta)',
    },
    {
      who: 'raitAnalyst' as const,
      label: 'rait-analyst (papel RAIT que não é o owner_role)',
    },
    { who: 'auditor' as const, label: 'AUDITOR' },
  ])(
    'C-0002-04 dado alerta NOTIFICADO de owner_role=rait-manager quando ack por $label então 403 DASH.ALERT_ACK_NOT_OWNER',
    async ({ who }) => {
      const fixture = seedAlertBy('NOTIFICADO', 'extinction');
      expect(fixture.ownerRole).toBe('rait-manager');
      const id = nextId();
      await db.cloneAlert(fixture.id, id);
      await expectDashError(
        runCommand('ack', id, who, 'extinction', 1),
        'DASH.ALERT_ACK_NOT_OWNER',
        403,
      );
      const after = await snapshot(id);
      expect(after.alert.state).toBe('NOTIFICADO');
      expect(after.alert.version).toBe(1);
    },
  );

  it('C-0002-04 dado alerta NOTIFICADO de owner_role=rait-manager quando ack por dash-operator com onBehalfOf e note então RECONHECIDO, ack_channel=manual, trilha actor_ref com o dono', async () => {
    const fixture = seedAlertBy('NOTIFICADO', 'extinction');
    const id = nextId();
    await db.cloneAlert(fixture.id, id);
    await runCommand('ack', id, 'dashOperator', 'extinction', 1);
    const after = await snapshot(id);
    expect(after.alert.state).toBe('RECONHECIDO');
    expect(after.alert.ack_channel).toBe('manual');
    expect(after.alert.acknowledged_at).not.toBeNull();
    const last = after.trail[after.trail.length - 1]!;
    expect(last.from_state).toBe('NOTIFICADO');
    expect(last.to_state).toBe('RECONHECIDO');
    expect(last.actor_kind).toBe('user');
    expect(String(last.actor_ref)).toContain(USERS.integrationOperator);
    expect(String(last.actor_ref)).toContain(USERS.raitManager);
    expect(last.note).not.toBeNull();
  });

  it('C-0002-04 dado alerta NOTIFICADO com owner_ref = principal (sem o papel) quando ack por esse principal então RECONHECIDO (dono por owner_ref, §6.1)', async () => {
    const fixture = seedAlertBy('NOTIFICADO', 'extinction');
    const id = nextId();
    await db.cloneAlert(fixture.id, id, { owner_ref: USERS.raitSecretary });
    await runCommand('ack', id, 'stranger', 'extinction', 1);
    expect((await db.alert(id))!.state).toBe('RECONHECIDO');
    expect((await db.alert(id))!.ack_channel).toBe('origin');
  });
});

describe('C-0002-06 — close e estados terminais (§6.1 linhas 100/101)', () => {
  it('C-0002-06 dado alerta de extinção VERIFICADO quando close por dash-operator então 409 DASH.ALERT_EXTINCTION_NOT_CLOSABLE', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('VERIFICADO', 'extinction').id, id);
    await expectDashError(
      runCommand('close', id, 'dashOperator', 'extinction', 1),
      'DASH.ALERT_EXTINCTION_NOT_CLOSABLE',
      409,
    );
    expect((await db.alert(id))!.state).toBe('VERIFICADO');
  });

  it('C-0002-06 dado alerta de irregularidade EM_TRATAMENTO quando close por dash-operator então 409 DASH.ALERT_CLOSE_WITHOUT_VERIFICATION', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('EM_TRATAMENTO', 'irregularity').id, id);
    await expectDashError(
      runCommand('close', id, 'dashOperator', 'irregularity', 1),
      'DASH.ALERT_CLOSE_WITHOUT_VERIFICATION',
      409,
    );
    expect((await db.alert(id))!.state).toBe('EM_TRATAMENTO');
  });

  it('C-0002-06 dado alerta ENCERRADO quando ack então 409 DASH.ALERT_STATE_INVALID com allowed (vazio: terminal)', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('ENCERRADO', 'irregularity').id, id);
    const context = await expectDashError(
      runCommand('ack', id, 'dashDutyOwner', 'irregularity', 1),
      'DASH.ALERT_STATE_INVALID',
      409,
    );
    expect(context.allowed).toEqual([]);
  });

  it('C-0002-06 dado alerta INCIDENTE_REGISTRADO quando treat/close então 409 DASH.ALERT_STATE_INVALID (terminal: só root-cause)', async () => {
    const id = nextId();
    await db.cloneAlert(
      seedAlertBy('INCIDENTE_REGISTRADO', 'extinction').id,
      id,
    );
    await expectDashError(
      runCommand('treat', id, 'raitManager', 'extinction', 1),
      'DASH.ALERT_STATE_INVALID',
      409,
    );
    await expectDashError(
      runCommand('close', id, 'dashOperator', 'extinction', 1),
      'DASH.ALERT_STATE_INVALID',
      409,
    );
  });

  it('C-0002-06 dado alerta de irregularidade VERIFICADO quando close por dash-operator então ENCERRADO com closed_at, trilha 100 actor user e evento ALERTA_ENCERRADO', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('VERIFICADO', 'irregularity').id, id);
    await runCommand('close', id, 'dashOperator', 'irregularity', 1);
    const after = await snapshot(id);
    expect(after.alert.state).toBe('ENCERRADO');
    expect(after.alert.closed_at).not.toBeNull();
    const events = await db.outboxFor(id);
    expect(events).toHaveLength(1);
    expect(events[0]!.payload.domainEvent).toBe('ALERTA_ENCERRADO');
  });
});

describe('C-0002-08 — root-cause (§6.7; categorias transport|acceptance|payload)', () => {
  it("C-0002-08 dado root-cause com category='x' então 400 DASH.ROOT_CAUSE_CATEGORY_INVALID com allowed = as três", async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('RECONHECIDO', 'extinction').id, id);
    const context = await expectDashError(
      runCommand(
        'root-cause',
        id,
        'raitManager',
        'extinction',
        1,
        ifMatchOf(1),
        {
          category: 'x',
        },
      ),
      'DASH.ROOT_CAUSE_CATEGORY_INVALID',
      400,
    );
    expect([...(context.allowed as string[])].sort()).toEqual(
      [...ROOT_CAUSE_CATEGORIES].sort(),
    );
    expect((await db.alert(id))!.version).toBe(1);
  });

  it("C-0002-08 dado alerta INCIDENTE_REGISTRADO quando root-cause com category='transport' então trilha com from_state = to_state, root_cause_category, estado inalterado, version + 1", async () => {
    const id = nextId();
    await db.cloneAlert(
      seedAlertBy('INCIDENTE_REGISTRADO', 'extinction').id,
      id,
    );
    const before = await snapshot(id);
    await runCommand('root-cause', id, 'raitManager', 'extinction', 1);
    const after = await snapshot(id);
    expect(after.alert.state).toBe('INCIDENTE_REGISTRADO');
    expect(Number(after.alert.version)).toBe(2);
    expect(after.trail).toHaveLength(before.trail.length + 1);
    const last = after.trail[after.trail.length - 1]!;
    expect(last.from_state).toBe('INCIDENTE_REGISTRADO');
    expect(last.to_state).toBe('INCIDENTE_REGISTRADO');
    expect(last.root_cause_category).toBe('transport');
    expect(last.actor_kind).toBe('user');
  });

  it.each(ROOT_CAUSE_CATEGORIES)(
    'C-0002-08 dado root-cause com category=%s então aceita e grava root_cause_category na trilha',
    async (category) => {
      const id = nextId();
      await db.cloneAlert(seedAlertBy('EM_TRATAMENTO', 'irregularity').id, id);
      await runCommand(
        'root-cause',
        id,
        'dashOperator',
        'irregularity',
        1,
        ifMatchOf(1),
        {
          category,
        },
      );
      const trail = await db.trail(id);
      expect(trail[trail.length - 1]!.root_cause_category).toBe(category);
    },
  );
});

describe('C-0002-09 — If-Match via assertDashIfMatch (§1.3 regra 5, OD-D56)', () => {
  it('C-0002-09 dado If-Match ausente em ack então 428 DASH.IF_MATCH_REQUIRED e nada muda', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'extinction').id, id);
    await expectDashError(
      runCommand('ack', id, 'raitManager', 'extinction', 1, null),
      'DASH.IF_MATCH_REQUIRED',
      428,
    );
    expect((await db.alert(id))!.state).toBe('NOTIFICADO');
  });

  it('C-0002-09 dado If-Match com versão errada em ack então 412 DASH.VERSION_CONFLICT com expected e received', async () => {
    const id = nextId();
    await db.cloneAlert(seedAlertBy('NOTIFICADO', 'extinction').id, id);
    const context = await expectDashError(
      runCommand('ack', id, 'raitManager', 'extinction', 1, ifMatchOf(7)),
      'DASH.VERSION_CONFLICT',
      412,
    );
    expect(context.expected).toBe(1);
    expect(context.received).toBe(7);
    expect((await db.alert(id))!.state).toBe('NOTIFICADO');
  });

  it.each([
    { header: undefined, label: 'ausente' },
    { header: '', label: 'vazio' },
    { header: 'abc', label: 'malformado' },
  ])(
    'C-0002-09 dado assertDashIfMatch com cabeçalho $label então 428 DASH.IF_MATCH_REQUIRED (gramática de shared/errors/if-match.ts)',
    async ({ header }) => {
      await expectDashError(
        Promise.resolve().then(() => assertDashIfMatch(header, 1)),
        'DASH.IF_MATCH_REQUIRED',
        428,
      );
    },
  );

  it.each(['1', '"1"', 'W/"1"'])(
    'C-0002-09 dado assertDashIfMatch com %s e version 1 então não lança',
    (header) => {
      expect(() => assertDashIfMatch(header, 1)).not.toThrow();
    },
  );

  it('C-0002-09 dado assertDashIfMatch com "2" e version 1 então 412 DASH.VERSION_CONFLICT {expected: 1, received: 2}', async () => {
    const context = await expectDashError(
      Promise.resolve().then(() => assertDashIfMatch('"2"', 1)),
      'DASH.VERSION_CONFLICT',
      412,
    );
    expect(context).toMatchObject({ expected: 1, received: 2 });
  });

  it('C-0002-09 dado If-Match ausente em treat/close/root-cause então 428 em todos (todo comando sobre recurso versionado)', async () => {
    const reconhecido = nextId();
    await db.cloneAlert(
      seedAlertBy('RECONHECIDO', 'extinction').id,
      reconhecido,
    );
    await expectDashError(
      runCommand('treat', reconhecido, 'raitManager', 'extinction', 1, null),
      'DASH.IF_MATCH_REQUIRED',
      428,
    );
    const verificado = nextId();
    await db.cloneAlert(
      seedAlertBy('VERIFICADO', 'irregularity').id,
      verificado,
    );
    await expectDashError(
      runCommand('close', verificado, 'dashOperator', 'irregularity', 1, null),
      'DASH.IF_MATCH_REQUIRED',
      428,
    );
    await expectDashError(
      runCommand(
        'root-cause',
        verificado,
        'dashOperator',
        'irregularity',
        1,
        null,
      ),
      'DASH.IF_MATCH_REQUIRED',
      428,
    );
  });
});

describe('objetos de origem das fixtures (CTG-0001 §5.3) — sanidade da matriz', () => {
  it('dado as 18 fixtures do seed 81 quando lidas então object_ref é o caso RAIT 02 (extinction) ou a manifestação 01 (irregularity) — ids canônicos, nunca inventados', async () => {
    for (const fixture of SEED_ALERTS) {
      const row = (await db.alert(fixture.id))!;
      expect(row.state).toBe(fixture.state);
      expect(row.track).toBe(fixture.track);
      expect(row.object_ref).toBe(
        fixture.track === 'extinction'
          ? ORIGIN_OBJECTS.raitCase02
          : ORIGIN_OBJECTS.manifestation01,
      );
    }
  });

  it('dado a matriz quando termina então nenhuma fixture do seed 81 mudou de estado ou versão (só leitura)', async () => {
    for (const fixture of SEED_ALERTS as readonly SeedAlertFixture[]) {
      const row = (await db.alert(fixture.id))!;
      expect(row.state).toBe(fixture.state);
      expect(row.version).toBe(1);
    }
  });
});
