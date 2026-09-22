// CTG-0002 §15.1 C-0002-01 e C-0002-48 [unit] — guardas de transição do
// alerta lidas de `dashboard.alert_transition_ref` (§6.1: "a guarda lê a
// tabela, nunca uma matriz em código"). A tabela é carregada do PRÓPRIO DDL 19
// (`backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql`, parse do
// `INSERT` — nenhuma linha transcrita à mão) numa `FakeCycleTx` em memória
// (unit nunca abre conexão, `rait-test-strategy.md` §1) e comparada com o
// conjunto `(from, to, actor, track)` de §6.1 (fixtures `ALERT_TRANSITIONS`).
// Símbolos pelos nomes/caminhos fixos de §14.1 (`cycle/transitions.ts` via
// `cycle/index.js`) — ainda inexistentes nesta entrega (TASK-0005).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  assertAlertTransition,
  loadAlertTransitions,
  loadDutyTransitions,
} from '../../src/handwritten/cycle/index.js';
import {
  ALERT_STATES,
  ALERT_TRANSITIONS,
  DUTY_TRANSITIONS,
  type AlertState,
  type AlertTrack,
} from '../fixtures/cycle-fixtures.js';
import { FakeCycleTx, expectDashError } from '../support/cycle-harness.js';

const DDL_19 = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../database/ddl/19-dashboard-lifecycle-vocabulary.sql',
      import.meta.url,
    ),
  ),
  'utf8',
);

/** Linhas `(…)` do `INSERT INTO dashboard.<table> (cols) VALUES …` do DDL 19,
 * como o banco as tem (mesma fonte, sem transcrição). */
function rowsOfInsert(table: string): Record<string, unknown>[] {
  const start = DDL_19.indexOf(`INSERT INTO dashboard.${table} (`);
  expect(start, `DDL 19 sem INSERT em ${table}`).toBeGreaterThan(-1);
  const head = DDL_19.slice(start).match(
    /INSERT INTO dashboard\.[a-z_]+ \(([^)]*)\) VALUES\s*([\s\S]*?)\nON CONFLICT/,
  );
  expect(head).not.toBeNull();
  const columns = head![1]!.split(',').map((column) => column.trim());
  const body = head![2]!;
  const rows: Record<string, unknown>[] = [];
  const tuple = /\(((?:[^()']|'(?:[^']|'')*')*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = tuple.exec(body)) !== null) {
    const values: unknown[] = [];
    const cell = /\s*(?:'((?:[^']|'')*)'|NULL|(-?\d+(?:\.\d+)?))\s*(?:,|$)/gy;
    let piece: RegExpExecArray | null;
    cell.lastIndex = 0;
    const text = match[1]!;
    while (cell.lastIndex < text.length && (piece = cell.exec(text))) {
      if (piece[1] !== undefined) values.push(piece[1].replace(/''/g, "'"));
      else if (piece[2] !== undefined) values.push(Number(piece[2]));
      else values.push(null);
    }
    expect(values, `tupla mal lida: ${text}`).toHaveLength(columns.length);
    rows.push(Object.fromEntries(columns.map((c, i) => [c, values[i]])));
  }
  return rows;
}

function txWithVocabulary(): FakeCycleTx {
  return new FakeCycleTx({
    'dashboard.alert_transition_ref': rowsOfInsert('alert_transition_ref'),
    'dashboard.duty_transition_ref': rowsOfInsert('duty_transition_ref'),
  });
}

const key = (row: {
  from: string | null;
  to: string;
  actor: string;
  track: string;
}) => `${row.from ?? '[*]'}→${row.to}|${row.actor}|${row.track}`;

/** Forma normalizada de uma linha devolvida por `loadAlertTransitions`
 * (aceita `snake_case` do banco ou `camelCase` de um DTO — o contrato §14.1
 * não fixa a forma da linha, só o que ela carrega). */
function normalize(row: Record<string, unknown>) {
  const from = (row.from_state ?? row.fromState ?? row.from ?? null) as
    string | null;
  const to = (row.to_state ?? row.toState ?? row.to) as string;
  return {
    seq: Number(row.seq),
    from,
    to,
    actor: String(row.actor),
    track: String(row.track),
  };
}

describe('C-0002-01 — alert_transition_ref carregada do DDL 19 (§6.1)', () => {
  it('C-0002-01 dado alert_transition_ref carregada do DDL 19 quando se enumeram as 13 linhas então o conjunto (from,to,actor,track) é exatamente o de §6.1 (inclui seq 65)', async () => {
    const tx = txWithVocabulary();
    const loaded = (await loadAlertTransitions(tx)) as Record<
      string,
      unknown
    >[];
    expect(loaded).toHaveLength(13);
    const got = new Set(loaded.map((row) => key(normalize(row))));
    const expected = new Set(ALERT_TRANSITIONS.map((row) => key(row)));
    expect([...got].sort()).toEqual([...expected].sort());
    expect(
      loaded.map((row) => normalize(row).seq).sort((a, b) => a - b),
    ).toEqual(ALERT_TRANSITIONS.map((row) => row.seq));
    const seq65 = loaded.map(normalize).find((row) => row.seq === 65);
    expect(seq65).toMatchObject({
      from: 'ESCALONADO',
      to: 'NOTIFICADO',
      actor: 'system',
      track: 'both',
    });
  });

  it('C-0002-01 dado o DDL 19 quando as 13 linhas são lidas então cada leitura vai à tabela dashboard.alert_transition_ref (nunca matriz em código)', async () => {
    const tx = txWithVocabulary();
    await loadAlertTransitions(tx);
    const reads = tx.calls.filter((call) =>
      /from\s+dashboard\.alert_transition_ref/i.test(call.statement),
    );
    expect(reads.length).toBeGreaterThan(0);
  });

  it('C-0002-01 dado duty_transition_ref do DDL 19 quando carregada então tem as 11 linhas de CTG-0001 §3.4', async () => {
    const tx = txWithVocabulary();
    const loaded = (await loadDutyTransitions(tx)) as Record<string, unknown>[];
    expect(loaded).toHaveLength(11);
    const got = new Set(
      loaded.map((row) => {
        const n = normalize(row);
        return `${n.from ?? '[*]'}→${n.to}|${n.actor}`;
      }),
    );
    const expected = new Set(
      DUTY_TRANSITIONS.map(
        (row) => `${row.from ?? '[*]'}→${row.to}|${row.actor}`,
      ),
    );
    expect([...got].sort()).toEqual([...expected].sort());
  });
});

/** Destinos permitidos de `(state, track)` por §6.1 (linhas com `track ∈
 * {both, track}`), na ordem de `seq`. */
function allowedTargets(state: AlertState, track: AlertTrack): string[] {
  return ALERT_TRANSITIONS.filter(
    (row) =>
      row.from === state && (row.track === 'both' || row.track === track),
  ).map((row) => row.to);
}

describe('C-0002-48 — assertAlertTransition com par inexistente (§6.1)', () => {
  it('C-0002-48 dado assertAlertTransition quando o par DETECTADO → ENCERRADO não existe na tabela então DASH.ALERT_STATE_INVALID com allowed[] = destinos permitidos do estado para a trilha', async () => {
    const tx = txWithVocabulary();
    const transitions = await loadAlertTransitions(tx);
    const context = await expectDashError(
      Promise.resolve().then(() =>
        assertAlertTransition(
          transitions,
          { state: 'DETECTADO', track: 'extinction' },
          'ENCERRADO',
          'system',
        ),
      ),
      'DASH.ALERT_STATE_INVALID',
      409,
    );
    expect(context.allowed).toEqual(allowedTargets('DETECTADO', 'extinction'));
    expect(context.allowed).toEqual(['CLASSIFICADO']);
  });

  it.each(
    ALERT_STATES.flatMap((state) =>
      (['extinction', 'irregularity'] as const).map((track) => ({
        state,
        track,
      })),
    ),
  )(
    'C-0002-48 dado o estado $state na trilha $track quando se pede um destino fora da tabela então allowed[] traz exatamente os destinos de §6.1 para a trilha',
    async ({ state, track }) => {
      const tx = txWithVocabulary();
      const transitions = await loadAlertTransitions(tx);
      const allowed = allowedTargets(state, track);
      const bogus = ALERT_STATES.find(
        (candidate) => !allowed.includes(candidate) && candidate !== state,
      )!;
      const context = await expectDashError(
        Promise.resolve().then(() =>
          assertAlertTransition(transitions, { state, track }, bogus, 'system'),
        ),
        'DASH.ALERT_STATE_INVALID',
        409,
      );
      expect([...(context.allowed as string[])].sort()).toEqual(
        [...allowed].sort(),
      );
    },
  );

  it('C-0002-48 dado o par CLASSIFICADO → CRITICO_EXTINCAO na trilha irregularity quando avaliado então DASH.ALERT_STATE_INVALID (a linha 40 é só extinction) e allowed = [NOTIFICADO]', async () => {
    const tx = txWithVocabulary();
    const transitions = await loadAlertTransitions(tx);
    const context = await expectDashError(
      Promise.resolve().then(() =>
        assertAlertTransition(
          transitions,
          { state: 'CLASSIFICADO', track: 'irregularity' },
          'CRITICO_EXTINCAO',
          'system',
        ),
      ),
      'DASH.ALERT_STATE_INVALID',
      409,
    );
    expect(context.allowed).toEqual(['NOTIFICADO']);
  });

  it('C-0002-48 dado o par NOTIFICADO → RECONHECIDO com ator owner|dash-operator quando avaliado então não lança (linha 50)', async () => {
    const tx = txWithVocabulary();
    const transitions = await loadAlertTransitions(tx);
    expect(() =>
      assertAlertTransition(
        transitions,
        { state: 'NOTIFICADO', track: 'extinction' },
        'RECONHECIDO',
        'owner',
      ),
    ).not.toThrow();
    expect(() =>
      assertAlertTransition(
        transitions,
        { state: 'NOTIFICADO', track: 'irregularity' },
        'RECONHECIDO',
        'dash-operator',
      ),
    ).not.toThrow();
  });
});
