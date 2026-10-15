// FIX-0001 (Inspector, OD-C3-008 (a)). Prova de paridade entre a forma SQL e a forma JSON da
// fixture canônica do RAIT (`docs/framework/arch/rait-fixtures.md` intro e §10: "três formas
// sincronizadas"). Fonte única: `backend/database/seed/20-fixtures-rait.sql`, lida do disco com
// um parser mínimo — nenhum valor é copiado para este arquivo além dos nomes de tabela/coleção,
// das contagens do contrato, dos apelidos herdados e da lista fechada de divergências de forma
// herdadas (rait-fixtures.md §10).
//
// Forma da seed verificada (e imposta — o parser falha fechado em qualquer outra): linhas
// `insert into inf.rait_<tabela> (<cols>) values (<tupla>)[, (<tupla>)…] on conflict …;` com
// literais `'texto'` (aspas simples, `''` como escape), `'…'::jsonb`, `null`, `true`, `false` e
// inteiros; sem subselect nem expressão. Exceções registradas: `rait_pool` tem um `insert` com 3
// tuplas; três linhas `update inf.rait_<tabela> set <col> = <literal>[, …] where id = '<id>';`
// ajustam registros já inseridos (membro de pool 10 e impedimento 1) e são aplicadas por cima.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES_PATH, REPO_ROOT } from './kb';

type SeedValue =
  | string
  | number
  | boolean
  | null
  | readonly unknown[]
  | Readonly<Record<string, unknown>>;
type SeedRow = Record<string, SeedValue>;

const SEED_PATH = join(REPO_ROOT, 'backend/database/seed/20-fixtures-rait.sql');

/** Tabela da seed 20 → coleção JSON (rait-fixtures.md §10). `rait_pool` vira `raitPools`
 * porque `pools` já é o mapa `instância → id` lido por `http-fixtures.ts` (`POOL_IDS`). */
const TABLE_TO_COLLECTION: Readonly<Record<string, string>> = {
  rait_pool: 'raitPools',
  rait_pool_member: 'poolMembers',
  rait_case: 'cases',
  rait_party: 'parties',
  rait_document: 'documents',
  rait_admissibility: 'admissibility',
  rait_assignment: 'assignments',
  rait_case_event: 'caseEvents',
  rait_clock: 'clocks',
  rait_clock_alert: 'clockAlerts',
  rait_communication: 'communications',
  rait_deadline: 'deadlines',
  rait_decision: 'decisions',
  rait_draft: 'raitDrafts',
  rait_impediment: 'impediments',
  rait_inquiry: 'inquiries',
  rait_minutes: 'minutes',
  rait_pending_content: 'raitPendingContents',
  rait_redirect: 'raitRedirects',
  rait_schedule: 'raitSchedules',
  rait_schedule_slot: 'raitScheduleSlots',
  rait_session: 'sessions',
  rait_agenda_item: 'agendaItems',
  rait_attendance: 'attendance',
  rait_vote: 'votes',
  rait_batch: 'raitBatches',
  rait_batch_item: 'raitBatchItems',
  rait_bench: 'raitBenches',
  rait_substitute_duty: 'raitSubstituteDuties',
  rait_unit: 'raitUnits',
};

/** Contagem de tuplas por tabela fixada no prompt FIX-0001 ("Definições que valem como contrato"). */
const EXPECTED_COUNTS: Readonly<Record<string, number>> = {
  rait_pool: 3,
  rait_pool_member: 13,
  rait_case: 20,
  rait_party: 20,
  rait_document: 20,
  rait_admissibility: 28,
  rait_assignment: 10,
  rait_case_event: 5,
  rait_clock: 6,
  rait_clock_alert: 5,
  rait_communication: 3,
  rait_deadline: 7,
  rait_decision: 5,
  rait_draft: 4,
  rait_impediment: 1,
  rait_inquiry: 1,
  rait_minutes: 1,
  rait_pending_content: 3,
  rait_redirect: 2,
  rait_schedule: 3,
  rait_schedule_slot: 5,
  rait_session: 4,
  rait_agenda_item: 3,
  rait_attendance: 7,
  rait_vote: 4,
  rait_batch: 3,
  rait_batch_item: 4,
  rait_bench: 4,
  rait_substitute_duty: 2,
  rait_unit: 3,
};

/** Nomes de campo herdados da JSON anterior a FIX-0001 (mesmo valor da coluna, outro nome);
 * não são renomeados (rait-fixtures.md §10). */
const ALIASES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  rait_pool_member: { pool_id: 'pool', person_id: 'userId' },
  rait_case: { protocol_number: 'protocol' },
  rait_clock: { clock_code: 'code' },
  rait_session: { judging_body: 'body' },
  rait_agenda_item: { session_id: 'session' },
};

/** Lista fechada das divergências de forma herdadas (rait-fixtures.md §10): a JSON anterior a
 * FIX-0001 traz só a data (`AAAA-MM-DD`) de um timestamp da seed; FIX-0001 não altera valor
 * existente, então o campo deve ser exatamente o prefixo de data do valor da seed. Chave:
 * `<tabela>/<id>/<coluna>`. */
const DATE_ONLY_INHERITED: ReadonlySet<string> = new Set([
  'rait_batch/00000000-0000-7000-8000-000028000002/drawn_at',
  'rait_batch/00000000-0000-7000-8000-000028000003/drawn_at',
  'rait_batch/00000000-0000-7000-8000-000028000003/accepted_at',
  'rait_batch_item/00000000-0000-7000-8000-000028010003/declined_at',
  'rait_batch_item/00000000-0000-7000-8000-000028010004/accepted_at',
  'rait_substitute_duty/00000000-0000-7000-8000-000029000001/designated_at',
  'rait_substitute_duty/00000000-0000-7000-8000-000029000001/convened_at',
  'rait_substitute_duty/00000000-0000-7000-8000-000029000002/designated_at',
  'rait_bench/00000000-0000-7000-8000-000035000002/confirmed_at',
  'rait_bench/00000000-0000-7000-8000-000035000003/insufficient_at',
  'rait_bench/00000000-0000-7000-8000-000035000004/confirmed_at',
  'rait_pending_content/00000000-0000-7000-8000-000036000002/closed_at',
  'rait_pending_content/00000000-0000-7000-8000-000036000003/closed_at',
]);

function camel(column: string): string {
  return column.replace(/_([a-z0-9])/g, (_match, char: string) =>
    char.toUpperCase(),
  );
}

/** Cursor sobre uma linha da seed. */
class Cursor {
  constructor(
    private readonly text: string,
    private readonly lineNo: number,
    public pos = 0,
  ) {}

  fail(message: string): never {
    throw new Error(
      `seed 20 linha ${this.lineNo}: ${message} em "${this.text.slice(this.pos, this.pos + 40)}"`,
    );
  }

  skipSpaces(): void {
    while (this.text[this.pos] === ' ') this.pos += 1;
  }

  peek(): string | undefined {
    return this.text[this.pos];
  }

  expect(token: string): void {
    this.skipSpaces();
    if (!this.text.startsWith(token, this.pos))
      this.fail(`esperado "${token}"`);
    this.pos += token.length;
  }

  rest(): string {
    return this.text.slice(this.pos);
  }

  /** Um literal: `'texto'`, `'json'::jsonb`, `null`, `true`, `false` ou inteiro. */
  literal(): SeedValue {
    this.skipSpaces();
    if (this.peek() === "'") {
      let value = '';
      let index = this.pos + 1;
      for (;;) {
        const char = this.text[index];
        if (char === undefined) this.fail('string sem fechamento');
        if (char === "'") {
          if (this.text[index + 1] === "'") {
            value += "'";
            index += 2;
            continue;
          }
          break;
        }
        value += char;
        index += 1;
      }
      this.pos = index + 1;
      if (this.text.startsWith('::jsonb', this.pos)) {
        this.pos += '::jsonb'.length;
        return JSON.parse(value) as SeedValue;
      }
      if (this.peek() === ':') this.fail('cast não suportado');
      return value;
    }
    const match = /^(null|true|false|-?\d+)(?=[,) ;])/.exec(this.rest());
    if (!match?.[1]) return this.fail('literal não suportado');
    this.pos += match[1].length;
    if (match[1] === 'null') return null;
    if (match[1] === 'true') return true;
    if (match[1] === 'false') return false;
    return Number(match[1]);
  }
}

interface SeedData {
  readonly rows: ReadonlyMap<string, readonly SeedRow[]>;
  readonly updates: number;
}

function parseSeed(): SeedData {
  const rows = new Map<string, SeedRow[]>();
  let updates = 0;
  const lines = readFileSync(SEED_PATH, 'utf8').split('\n');
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    if (line.trim() === '' || line.startsWith('--')) return;
    if (line.startsWith("select set_config('app.")) return;
    const insert = /^insert into inf\.(rait_\w+) \(([^)]*)\) values /.exec(
      line,
    );
    if (insert?.[1] && insert[2] !== undefined) {
      const table = insert[1];
      const columns = insert[2].split(',').map((column) => column.trim());
      const cursor = new Cursor(line, lineNo, insert[0].length);
      const list = rows.get(table) ?? [];
      for (;;) {
        cursor.expect('(');
        const row: SeedRow = {};
        columns.forEach((column, position) => {
          if (position > 0) cursor.expect(',');
          row[column] = cursor.literal();
        });
        cursor.expect(')');
        list.push(row);
        cursor.skipSpaces();
        if (cursor.peek() !== ',') break;
        cursor.pos += 1;
      }
      cursor.skipSpaces();
      if (!/^(on conflict .*)?;$/.test(cursor.rest()))
        cursor.fail('sufixo inesperado depois das tuplas');
      rows.set(table, list);
      return;
    }
    const update = /^update inf\.(rait_\w+) set /.exec(line);
    if (update?.[1]) {
      const table = update[1];
      const cursor = new Cursor(line, lineNo, update[0].length);
      const changes: SeedRow = {};
      for (;;) {
        cursor.skipSpaces();
        const column = /^([a-z_0-9]+) = /.exec(cursor.rest());
        if (!column?.[1]) return cursor.fail('atribuição esperada');
        cursor.pos += column[0].length;
        changes[column[1]] = cursor.literal();
        cursor.skipSpaces();
        if (cursor.peek() !== ',') break;
        cursor.pos += 1;
      }
      cursor.expect('where id =');
      const id = cursor.literal();
      cursor.expect(';');
      const target = (rows.get(table) ?? []).find((row) => row['id'] === id);
      if (!target)
        return cursor.fail(`update de id não inserido: ${String(id)}`);
      Object.assign(target, changes);
      updates += 1;
      return;
    }
    throw new Error(
      `seed 20 linha ${lineNo}: forma não suportada pelo parser: ${line.slice(0, 60)}`,
    );
  });
  return { rows, updates };
}

const seed = parseSeed();
const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as Record<
  string,
  unknown
>;

function collection(name: string): readonly Record<string, unknown>[] {
  const value = fixtures[name];
  if (!Array.isArray(value))
    throw new Error(
      `rait-fixtures.json: coleção ausente ou não-array: ${name}`,
    );
  return value as readonly Record<string, unknown>[];
}

function seedRows(table: string): readonly SeedRow[] {
  return seed.rows.get(table) ?? [];
}

function sameValue(actual: unknown, expected: unknown): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

/** Divergências de um registro JSON em relação à linha da seed (vazio = paridade). */
function divergences(
  table: string,
  row: SeedRow,
  record: Record<string, unknown>,
): string[] {
  const found: string[] = [];
  const id = String(row['id']);
  for (const [column, value] of Object.entries(row)) {
    if (column === 'tenant_id') continue;
    const field = camel(column);
    const alias = ALIASES[table]?.[column];
    const key = `${table}/${id}/${column}`;
    if (field in record) {
      const actual = record[field];
      if (DATE_ONLY_INHERITED.has(key)) {
        if (typeof value !== 'string' || actual !== value.slice(0, 10))
          found.push(
            `${key}: herdado ${String(actual)} ≠ data de ${String(value)}`,
          );
      } else if (!sameValue(actual, value)) {
        found.push(
          `${key}: ${JSON.stringify(actual)} ≠ ${JSON.stringify(value)}`,
        );
      }
    } else if (alias !== undefined && alias in record) {
      if (record[alias] !== value)
        found.push(
          `${key}: apelido ${alias}=${String(record[alias])} ≠ ${String(value)}`,
        );
    } else {
      found.push(`${key}: campo ${field} ausente`);
    }
  }
  return found;
}

const TABLES = Object.keys(TABLE_TO_COLLECTION);

describe('rait-fixtures.json × seed 20-fixtures-rait.sql (FIX-0001, rait-fixtures.md §10)', () => {
  it('dado a seed 20 quando o parser lê inserts e updates então as 30 tabelas têm as contagens do contrato e há 3 updates', () => {
    const counts = Object.fromEntries(
      [...seed.rows.entries()].map(([table, list]) => [table, list.length]),
    );
    expect(counts).toStrictEqual(EXPECTED_COUNTS);
    expect(seed.updates).toBe(3);
    expect([...TABLES].sort()).toStrictEqual(
      Object.keys(EXPECTED_COUNTS).sort(),
    );
  });

  it.each(TABLES)(
    'dado a tabela %s da seed 20 quando comparada à coleção JSON então cada linha tem registro de mesmo id e cada coluna um campo de mesmo valor',
    (table) => {
      const list = collection(TABLE_TO_COLLECTION[table] ?? '');
      const problems: string[] = [];
      for (const row of seedRows(table)) {
        const record = list.find((candidate) => candidate['id'] === row['id']);
        if (!record) {
          problems.push(`${table}/${String(row['id'])}: registro ausente`);
          continue;
        }
        problems.push(...divergences(table, row, record));
      }
      expect(problems).toStrictEqual([]);
    },
  );

  it.each(TABLES)(
    'dado a coleção JSON derivada de %s quando lida então nenhum id está ausente da seed e nenhum registro traz tenant_id',
    (table) => {
      const ids = new Set(seedRows(table).map((row) => row['id']));
      const list = collection(TABLE_TO_COLLECTION[table] ?? '');
      expect(
        list
          .map((record) => record['id'])
          .filter((id) => !ids.has(id as string)),
      ).toStrictEqual([]);
      expect(
        list.filter((record) => 'tenantId' in record || 'tenant_id' in record),
      ).toStrictEqual([]);
    },
  );

  it('dado o mapa pools quando comparado à seed então cada instância aponta para o rait_pool da mesma instância', () => {
    const pools = fixtures['pools'] as Readonly<Record<string, string>>;
    const fromSeed = Object.fromEntries(
      seedRows('rait_pool').map((row) => [row['instance'], row['id']]),
    );
    expect(pools).toStrictEqual(fromSeed);
  });

  it('dado a lista fechada de datas herdadas quando conferida então cada entrada é de fato só a data do timestamp da seed', () => {
    const stale: string[] = [];
    for (const key of DATE_ONLY_INHERITED) {
      const [table = '', id = '', column = ''] = key.split('/');
      const row = seedRows(table).find((candidate) => candidate['id'] === id);
      const record = collection(TABLE_TO_COLLECTION[table] ?? '').find(
        (candidate) => candidate['id'] === id,
      );
      const value = row?.[column];
      const actual = record?.[camel(column)];
      if (
        typeof value !== 'string' ||
        actual === value ||
        actual !== value.slice(0, 10)
      )
        stale.push(key);
    }
    expect(stale).toStrictEqual([]);
  });
});
