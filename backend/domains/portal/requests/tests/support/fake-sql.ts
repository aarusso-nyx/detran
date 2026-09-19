// Transação falsa em memória para os specs `unit` do Portal (R-0009 CTG-0002
// §13: "tx falsa em memória"; rait-test-strategy.md §1 "unit nunca abre
// conexão"). Não é um arquivo de teste (vitest só coleta `*.spec.ts`) e fica
// fora do build (`tsconfig.build.json` exclui `tests`).
//
// Interpreta o SUBCONJUNTO de SQL que os serviços manuscritos do Portal usam
// (CODESTYLE §Backend: SQL parametrizado, uma transação por comando). Tudo o
// que está fora do subconjunto lança `FakeSqlUnsupported` com o SQL na
// mensagem — sinal para o Engineer escrever a consulta dentro do subconjunto
// (mesmo papel que "nome esperado do export" nos specs de R-0008) ou para o
// Inspector estender o dialeto. Subconjunto:
//
//   select <exprs|*> from <tabela> [alias] [left join <tabela> [alias] on <expr>]*
//     [where <expr>] [order by <expr> [asc|desc] [nulls first|last], …]
//     [limit <n|$n>] [offset <n|$n>] [for update [skip locked]]
//   select <exprs>            (sem from: now(), auth.current_tenant(), nextval(…), gen_random_uuid())
//   with <nome> as (<select>) <insert|select>
//   insert into <tabela> (<cols>) values (<exprs>)[, (<exprs>)]*
//     [on conflict [(<cols>)] do nothing | do update set <col> = <expr>, …] [returning <exprs|*>]
//   insert into <tabela> (<cols>) select <exprs> [from <cte>]
//   update <tabela> [alias] set <col> = <expr>, … [where <expr>] [returning <exprs|*>]
//   delete from <tabela> [where <expr>]
//   expressões: coluna | alias.coluna | $n | 'texto' | número | null | true | false |
//     (expr) | expr op expr (= <> != < <= > >= + - || -> ->>) | expr::tipo | not |
//     and | or | is [not] null | in (…) | not in (…) | = any($n) | like | ilike |
//     (a, b) > ($1, $2) | exists (select …) | (select …) escalar |
//     funções: coalesce, now, current_date, auth.current_tenant, nextval, gen_random_uuid,
//     count, max, min, sum, lower, upper, to_char(x, 'YYYY-MM-DD'), jsonb_set, to_jsonb,
//     jsonb_build_object, greatest, least, nullif, length
//   ignorados: set local …, begin, commit, rollback, select set_config(…)
//
// Semântica pg reproduzida onde importa para os specs: `count(*)` volta como
// string; `::date` reduz a 'YYYY-MM-DD'; `on conflict (…) do nothing returning`
// não devolve linha no conflito; unique registrado por tabela lança erro com
// `code: '23505'` (mesma forma do `pg`); `tenant_id`, `id` e `created_at`
// recebem default como as triggers/defaults do DDL; `nextval` incrementa a
// sequência registrada.
import { randomUUID } from 'node:crypto';

export type Row = Record<string, unknown>;

export class FakeSqlUnsupported extends Error {
  constructor(sql: string, detail: string) {
    super(`fake-sql: ${detail}\n  SQL: ${sql.replace(/\s+/g, ' ').trim()}`);
    this.name = 'FakeSqlUnsupported';
  }
}

export class FakeSqlError extends Error {
  readonly code: string;
  readonly constraint?: string;
  constructor(code: string, message: string, constraint?: string) {
    super(message);
    this.name = 'FakeSqlError';
    this.code = code;
    this.constraint = constraint;
  }
}

export interface FakeSqlOptions {
  tenantId: string;
  /** Linha de `auth.tenants` do tenant da transação (slug, timezone). */
  tenant?: { slug?: string; timezone?: string; name?: string };
  /** `now()` do servidor (relógio fixo dos specs). */
  now?: () => Date;
  /** Valor inicial (último devolvido) por sequência: `nextval` devolve +1. */
  sequences?: Record<string, number>;
  /** Índices únicos além dos conhecidos do DDL (tabela → listas de colunas). */
  uniques?: Record<string, string[][]>;
}

/** Únicos dos DDLs 04/61/62/63/64/65 relevantes para os comandos do Portal. */
const DEFAULT_UNIQUES: Record<string, string[][]> = {
  'portal.subject': [['cpf_hash']],
  'portal.entitlement': [
    ['subject_id', 'target_kind', 'target_id', 'relation'],
  ],
  'portal.request_draft': [['request_id', 'version']],
  'portal.protocol': [['number'], ['request_id']],
  'portal.evaluation': [['subject_kind', 'subject_id']],
  'portal.idempotency_record': [['key']],
  'portal.inbox_item': [['source_event_id']],
  'portal.acknowledgement_evidence': [['inbox_item_id']],
  'portal.sne_enrollment': [['subject_id']],
  'portal.push_subscription': [['endpoint']],
  'portal.manifestation': [['protocol']],
  'portal.manifestation_extension': [['manifestation_id', 'timer']],
  'portal.service_catalog': [['service_key']],
  'portal.infraction_view': [['ait_id']],
  'portal.process_timeline': [['case_id']],
  'portal.points_view': [['subject_cpf_hash']],
  'portal.crash_view': [['crash_id']],
  'portal.exam_view': [['exam_id']],
  'portal.projection_applied_event': [['event_id', 'projection']],
  'portal.national_read_cache': [['subject_id', 'kind', 'target_id']],
  'integration.outbox': [['idempotency_key']],
};

/** Defaults de coluna dos DDLs (além de id/tenant_id/created_at). */
const DEFAULT_COLUMNS: Record<string, Record<string, unknown>> = {
  'portal.request': { version: 1, channel: 'portal' },
  'portal.protocol': { channel: 'portal' },
  'portal.manifestation': { version: 1 },
  'portal.subject': { version: 1 },
  'portal.service_catalog': { version: 1 },
  'portal.request_attachment': { upload_state: 'intended' },
  'portal.inbox_item': { action_required: false },
  'integration.outbox': { status: 'pending', attempts: 0 },
};

// ---------------------------------------------------------------------------
// tokenizer
// ---------------------------------------------------------------------------

type Token =
  | { kind: 'ident'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'param'; value: number }
  | { kind: 'op'; value: string }
  | { kind: 'end' };

const MULTI_OPS = ['<>', '!=', '<=', '>=', '||', '::', '->>', '->'];

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i]!;
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i += 1;
      continue;
    }
    if (ch === "'") {
      let value = '';
      i += 1;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          value += "'";
          i += 2;
        } else if (sql[i] === "'") {
          i += 1;
          break;
        } else {
          value += sql[i];
          i += 1;
        }
      }
      tokens.push({ kind: 'string', value });
      continue;
    }
    if (ch === '"') {
      let value = '';
      i += 1;
      while (i < sql.length && sql[i] !== '"') {
        value += sql[i];
        i += 1;
      }
      i += 1;
      tokens.push({ kind: 'ident', value });
      continue;
    }
    if (ch === '$' && /\d/.test(sql[i + 1] ?? '')) {
      let j = i + 1;
      while (/\d/.test(sql[j] ?? '')) j += 1;
      tokens.push({ kind: 'param', value: Number(sql.slice(i + 1, j)) });
      i = j;
      continue;
    }
    if (/\d/.test(ch)) {
      let j = i;
      while (/[\d.]/.test(sql[j] ?? '')) j += 1;
      tokens.push({ kind: 'number', value: Number(sql.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (/[A-Za-z0-9_.]/.test(sql[j] ?? '')) j += 1;
      const raw = sql.slice(i, j);
      // `alias.*` → ident "alias" + op "." + op "*" is not needed: keep dotted.
      tokens.push({ kind: 'ident', value: raw });
      i = j;
      continue;
    }
    const multi = MULTI_OPS.find((op) => sql.startsWith(op, i));
    if (multi) {
      tokens.push({ kind: 'op', value: multi });
      i += multi.length;
      continue;
    }
    tokens.push({ kind: 'op', value: ch });
    i += 1;
  }
  tokens.push({ kind: 'end' });
  return tokens;
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

type Expr =
  | { t: 'col'; name: string }
  | { t: 'star'; alias?: string }
  | { t: 'param'; index: number }
  | { t: 'lit'; value: unknown }
  | { t: 'bin'; op: string; left: Expr; right: Expr }
  | { t: 'not'; expr: Expr }
  | { t: 'isnull'; expr: Expr; negated: boolean }
  | { t: 'in'; expr: Expr; list: Expr[]; negated: boolean }
  | { t: 'any'; expr: Expr; op: string; array: Expr }
  | { t: 'cast'; expr: Expr; type: string }
  | { t: 'call'; name: string; args: Expr[]; star?: boolean }
  | { t: 'tuple'; items: Expr[] }
  | { t: 'exists'; select: SelectStmt }
  | { t: 'subquery'; select: SelectStmt }
  | { t: 'case'; whens: Array<{ when: Expr; then: Expr }>; otherwise?: Expr };

interface SelectItem {
  expr: Expr;
  alias?: string;
}

interface FromSource {
  table: string;
  alias?: string;
}

interface Join {
  source: FromSource;
  on: Expr;
  kind: 'left' | 'inner';
}

interface SelectStmt {
  kind: 'select';
  items: SelectItem[];
  from?: FromSource;
  joins: Join[];
  where?: Expr;
  orderBy: Array<{ expr: Expr; desc: boolean; nullsLast: boolean }>;
  limit?: Expr;
  offset?: Expr;
  distinctOn?: Expr[];
  union?: SelectStmt;
}

interface InsertStmt {
  kind: 'insert';
  table: string;
  columns: string[];
  rows?: Expr[][];
  select?: SelectStmt;
  onConflict?: {
    target?: string[];
    action: 'nothing' | 'update';
    set?: Array<{ column: string; expr: Expr }>;
  };
  returning?: SelectItem[];
}

interface UpdateStmt {
  kind: 'update';
  table: string;
  alias?: string;
  set: Array<{ column: string; expr: Expr }>;
  where?: Expr;
  returning?: SelectItem[];
}

interface DeleteStmt {
  kind: 'delete';
  table: string;
  alias?: string;
  where?: Expr;
}

interface NoopStmt {
  kind: 'noop';
}

type Stmt = (SelectStmt | InsertStmt | UpdateStmt | DeleteStmt | NoopStmt) & {
  ctes?: Array<{ name: string; select: SelectStmt }>;
};

// ---------------------------------------------------------------------------
// parser
// ---------------------------------------------------------------------------

class Parser {
  private pos = 0;
  constructor(
    private readonly tokens: Token[],
    private readonly sql: string,
  ) {}

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? { kind: 'end' };
  }

  private next(): Token {
    const token = this.peek();
    this.pos += 1;
    return token;
  }

  private isKeyword(word: string, offset = 0): boolean {
    const token = this.peek(offset);
    return token.kind === 'ident' && token.value.toLowerCase() === word;
  }

  private isOp(op: string, offset = 0): boolean {
    const token = this.peek(offset);
    return token.kind === 'op' && token.value === op;
  }

  private accept(word: string): boolean {
    if (this.isKeyword(word)) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  private acceptOp(op: string): boolean {
    if (this.isOp(op)) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  private expect(word: string): void {
    if (!this.accept(word)) this.fail(`esperado '${word}'`);
  }

  private expectOp(op: string): void {
    if (!this.acceptOp(op)) this.fail(`esperado '${op}'`);
  }

  private fail(detail: string): never {
    const token = this.peek();
    const shown =
      token.kind === 'end' ? '<fim>' : `${token.kind} ${String(token.value)}`;
    throw new FakeSqlUnsupported(this.sql, `${detail} (em ${shown})`);
  }

  private ident(): string {
    const token = this.next();
    if (token.kind !== 'ident') this.fail('esperado identificador');
    return token.value;
  }

  parseStatement(): Stmt {
    let ctes: Array<{ name: string; select: SelectStmt }> | undefined;
    if (this.accept('with')) {
      ctes = [];
      do {
        const name = this.ident();
        this.expect('as');
        this.expectOp('(');
        const select = this.parseSelect();
        this.expectOp(')');
        ctes.push({ name, select });
      } while (this.acceptOp(','));
    }
    let stmt: Stmt;
    if (this.isKeyword('select')) stmt = this.parseSelect();
    else if (this.isKeyword('insert')) stmt = this.parseInsert();
    else if (this.isKeyword('update')) stmt = this.parseUpdate();
    else if (this.isKeyword('delete')) stmt = this.parseDelete();
    else if (
      this.isKeyword('set') ||
      this.isKeyword('begin') ||
      this.isKeyword('commit') ||
      this.isKeyword('rollback')
    ) {
      stmt = { kind: 'noop' };
      this.pos = this.tokens.length - 1;
    } else this.fail('comando desconhecido');
    if (this.peek().kind !== 'end' && !this.acceptOp(';')) {
      this.fail('resto inesperado');
    }
    return { ...stmt, ctes };
  }

  parseSelect(): SelectStmt {
    this.expect('select');
    let distinctOn: Expr[] | undefined;
    if (this.accept('distinct')) {
      if (this.accept('on')) {
        this.expectOp('(');
        distinctOn = [];
        do distinctOn.push(this.parseExpr());
        while (this.acceptOp(','));
        this.expectOp(')');
      }
    }
    const items = this.parseSelectItems();
    const stmt: SelectStmt = { kind: 'select', items, joins: [], orderBy: [] };
    if (distinctOn) stmt.distinctOn = distinctOn;
    if (this.accept('from')) {
      stmt.from = this.parseSource();
      for (;;) {
        let kind: 'left' | 'inner' | undefined;
        if (this.accept('left')) {
          this.accept('outer');
          this.expect('join');
          kind = 'left';
        } else if (this.accept('inner')) {
          this.expect('join');
          kind = 'inner';
        } else if (this.accept('join')) kind = 'inner';
        if (!kind) break;
        const source = this.parseSource();
        this.expect('on');
        const on = this.parseExpr();
        stmt.joins.push({ source, on, kind });
      }
    }
    if (this.accept('where')) stmt.where = this.parseExpr();
    if (this.accept('group')) this.fail('group by não suportado');
    if (this.accept('order')) {
      this.expect('by');
      do {
        const expr = this.parseExpr();
        let desc = false;
        if (this.accept('desc')) desc = true;
        else this.accept('asc');
        let nullsLast = !desc;
        if (this.accept('nulls')) {
          if (this.accept('last')) nullsLast = true;
          else {
            this.expect('first');
            nullsLast = false;
          }
        }
        stmt.orderBy.push({ expr, desc, nullsLast });
      } while (this.acceptOp(','));
    }
    if (this.accept('limit')) stmt.limit = this.parseExpr();
    if (this.accept('offset')) stmt.offset = this.parseExpr();
    if (this.accept('for')) {
      this.expect('update');
      this.accept('skip');
      this.accept('locked');
      this.accept('nowait');
    }
    if (this.accept('union')) {
      this.accept('all');
      stmt.union = this.parseSelect();
    }
    return stmt;
  }

  private parseSelectItems(): SelectItem[] {
    const items: SelectItem[] = [];
    do {
      if (this.isOp('*')) {
        this.next();
        items.push({ expr: { t: 'star' } });
        continue;
      }
      const token = this.peek();
      if (
        token.kind === 'ident' &&
        token.value.endsWith('.') &&
        this.isOp('*', 1)
      ) {
        this.next();
        this.next();
        items.push({
          expr: { t: 'star', alias: token.value.slice(0, -1) },
        });
        continue;
      }
      const expr = this.parseExpr();
      let alias: string | undefined;
      if (this.accept('as')) alias = this.ident();
      else if (
        this.peek().kind === 'ident' &&
        !this.isKeyword('from') &&
        !this.isKeyword('where') &&
        !this.isKeyword('order') &&
        !this.isKeyword('limit') &&
        !this.isKeyword('for') &&
        !this.isKeyword('offset') &&
        !this.isKeyword('on') &&
        !this.isKeyword('returning')
      ) {
        alias = this.ident();
      }
      items.push({ expr, alias });
    } while (this.acceptOp(','));
    return items;
  }

  private parseSource(): FromSource {
    const table = this.ident();
    let alias: string | undefined;
    if (this.accept('as')) alias = this.ident();
    else if (
      this.peek().kind === 'ident' &&
      ![
        'where',
        'left',
        'inner',
        'join',
        'on',
        'order',
        'limit',
        'for',
        'offset',
        'returning',
        'set',
        'group',
      ].includes((this.peek() as { value: string }).value.toLowerCase())
    ) {
      alias = this.ident();
    }
    return { table, alias };
  }

  private parseInsert(): InsertStmt {
    this.expect('insert');
    this.expect('into');
    const table = this.ident();
    this.expectOp('(');
    const columns: string[] = [];
    do columns.push(this.ident());
    while (this.acceptOp(','));
    this.expectOp(')');
    const stmt: InsertStmt = { kind: 'insert', table, columns };
    if (this.accept('values')) {
      stmt.rows = [];
      do {
        this.expectOp('(');
        const row: Expr[] = [];
        do row.push(this.parseExpr());
        while (this.acceptOp(','));
        this.expectOp(')');
        stmt.rows.push(row);
      } while (this.acceptOp(','));
    } else if (this.isKeyword('select')) {
      stmt.select = this.parseSelect();
    } else this.fail('esperado values ou select');
    if (this.accept('on')) {
      this.expect('conflict');
      let target: string[] | undefined;
      if (this.acceptOp('(')) {
        target = [];
        do target.push(this.ident());
        while (this.acceptOp(','));
        this.expectOp(')');
      } else if (this.accept('on')) {
        this.expect('constraint');
        this.ident();
      }
      this.expect('do');
      if (this.accept('nothing'))
        stmt.onConflict = { target, action: 'nothing' };
      else {
        this.expect('update');
        this.expect('set');
        const set = this.parseSetList();
        stmt.onConflict = { target, action: 'update', set };
      }
    }
    if (this.accept('returning')) stmt.returning = this.parseSelectItems();
    return stmt;
  }

  private parseSetList(): Array<{ column: string; expr: Expr }> {
    const set: Array<{ column: string; expr: Expr }> = [];
    do {
      const column = this.ident();
      this.expectOp('=');
      const expr = this.parseExpr();
      set.push({ column, expr });
    } while (this.acceptOp(','));
    return set;
  }

  private parseUpdate(): UpdateStmt {
    this.expect('update');
    const source = this.parseSource();
    this.expect('set');
    const set = this.parseSetList();
    const stmt: UpdateStmt = {
      kind: 'update',
      table: source.table,
      alias: source.alias,
      set,
    };
    if (this.accept('where')) stmt.where = this.parseExpr();
    if (this.accept('returning')) stmt.returning = this.parseSelectItems();
    return stmt;
  }

  private parseDelete(): DeleteStmt {
    this.expect('delete');
    this.expect('from');
    const source = this.parseSource();
    const stmt: DeleteStmt = {
      kind: 'delete',
      table: source.table,
      alias: source.alias,
    };
    if (this.accept('where')) stmt.where = this.parseExpr();
    return stmt;
  }

  // expressions — precedence: or < and < not < comparison < additive < unary/postfix
  parseExpr(): Expr {
    return this.parseOr();
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.accept('or')) {
      left = { t: 'bin', op: 'or', left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.accept('and')) {
      left = { t: 'bin', op: 'and', left, right: this.parseNot() };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.accept('not')) return { t: 'not', expr: this.parseNot() };
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    let left = this.parseAdditive();
    for (;;) {
      if (this.accept('is')) {
        const negated = this.accept('not');
        if (this.accept('null')) {
          left = { t: 'isnull', expr: left, negated };
          continue;
        }
        if (this.accept('distinct')) {
          this.expect('from');
          const right = this.parseAdditive();
          left = { t: 'bin', op: negated ? '=' : '<>', left, right };
          left = negated
            ? { t: 'call', name: 'not_distinct', args: [left] }
            : left;
          continue;
        }
        if (this.accept('true')) {
          left = negated
            ? { t: 'not', expr: left }
            : { t: 'bin', op: '=', left, right: { t: 'lit', value: true } };
          continue;
        }
        if (this.accept('false')) {
          left = negated
            ? { t: 'bin', op: '=', left, right: { t: 'lit', value: true } }
            : { t: 'bin', op: '=', left, right: { t: 'lit', value: false } };
          continue;
        }
        this.fail('is … não suportado');
      }
      let negated = false;
      if (
        this.isKeyword('not') &&
        (this.isKeyword('in', 1) ||
          this.isKeyword('like', 1) ||
          this.isKeyword('ilike', 1))
      ) {
        this.next();
        negated = true;
      }
      if (this.accept('in')) {
        this.expectOp('(');
        const list: Expr[] = [];
        if (this.isKeyword('select')) {
          list.push({ t: 'subquery', select: this.parseSelect() });
        } else {
          do list.push(this.parseExpr());
          while (this.acceptOp(','));
        }
        this.expectOp(')');
        left = { t: 'in', expr: left, list, negated };
        continue;
      }
      if (this.accept('like') || this.accept('ilike')) {
        const insensitive =
          (
            this.tokens[this.pos - 1] as { value: string }
          ).value.toLowerCase() === 'ilike';
        const right = this.parseAdditive();
        left = { t: 'bin', op: insensitive ? 'ilike' : 'like', left, right };
        if (negated) left = { t: 'not', expr: left };
        continue;
      }
      if (this.accept('between')) {
        const low = this.parseAdditive();
        this.expect('and');
        const high = this.parseAdditive();
        left = {
          t: 'bin',
          op: 'and',
          left: { t: 'bin', op: '>=', left, right: low },
          right: { t: 'bin', op: '<=', left, right: high },
        };
        continue;
      }
      const token = this.peek();
      if (
        token.kind === 'op' &&
        ['=', '<>', '!=', '<', '<=', '>', '>='].includes(token.value)
      ) {
        this.next();
        const op = token.value === '!=' ? '<>' : token.value;
        if (this.accept('any')) {
          this.expectOp('(');
          const array = this.parseExpr();
          this.expectOp(')');
          left = { t: 'any', expr: left, op, array };
          continue;
        }
        const right = this.parseAdditive();
        left = { t: 'bin', op, left, right };
        continue;
      }
      return left;
    }
  }

  private parseAdditive(): Expr {
    let left = this.parseUnary();
    for (;;) {
      const token = this.peek();
      if (
        token.kind === 'op' &&
        ['+', '-', '||', '->', '->>', '*', '/'].includes(token.value)
      ) {
        this.next();
        left = { t: 'bin', op: token.value, left, right: this.parseUnary() };
        continue;
      }
      return left;
    }
  }

  private parseUnary(): Expr {
    if (this.acceptOp('-')) {
      const expr = this.parseUnary();
      return {
        t: 'bin',
        op: '-',
        left: { t: 'lit', value: 0 },
        right: expr,
      };
    }
    return this.parsePostfix(this.parsePrimary());
  }

  private parsePostfix(expr: Expr): Expr {
    while (this.acceptOp('::')) {
      let type = this.ident().toLowerCase();
      if (this.acceptOp('[')) {
        this.expectOp(']');
        type += '[]';
      }
      // `timestamp with time zone`, `double precision`
      while (
        this.isKeyword('with') ||
        this.isKeyword('without') ||
        this.isKeyword('time') ||
        this.isKeyword('zone') ||
        this.isKeyword('precision')
      ) {
        this.next();
      }
      expr = { t: 'cast', expr, type };
    }
    return expr;
  }

  private parsePrimary(): Expr {
    const token = this.next();
    switch (token.kind) {
      case 'param':
        return { t: 'param', index: token.value };
      case 'number':
        return { t: 'lit', value: token.value };
      case 'string':
        return { t: 'lit', value: token.value };
      case 'op':
        if (token.value === '(') {
          if (this.isKeyword('select')) {
            const select = this.parseSelect();
            this.expectOp(')');
            return { t: 'subquery', select };
          }
          const first = this.parseExpr();
          if (this.acceptOp(',')) {
            const items = [first];
            do items.push(this.parseExpr());
            while (this.acceptOp(','));
            this.expectOp(')');
            return { t: 'tuple', items };
          }
          this.expectOp(')');
          return first;
        }
        if (token.value === '*') return { t: 'star' };
        this.fail(`operador inesperado '${token.value}'`);
        break;
      case 'ident': {
        const lower = token.value.toLowerCase();
        if (lower === 'null') return { t: 'lit', value: null };
        if (lower === 'true') return { t: 'lit', value: true };
        if (lower === 'false') return { t: 'lit', value: false };
        if (lower === 'current_date')
          return { t: 'call', name: 'current_date', args: [] };
        if (lower === 'current_timestamp')
          return { t: 'call', name: 'now', args: [] };
        if (lower === 'exists') {
          this.expectOp('(');
          const select = this.parseSelect();
          this.expectOp(')');
          return { t: 'exists', select };
        }
        if (lower === 'case') return this.parseCase();
        if (lower === 'interval') {
          const value = this.next();
          if (value.kind !== 'string') this.fail('interval esperava texto');
          return {
            t: 'call',
            name: 'interval',
            args: [{ t: 'lit', value: value.value }],
          };
        }
        if (this.isOp('(')) {
          this.next();
          const args: Expr[] = [];
          let star = false;
          if (this.isOp('*')) {
            this.next();
            star = true;
          } else if (!this.isOp(')')) {
            do args.push(this.parseExpr());
            while (this.acceptOp(','));
          }
          this.expectOp(')');
          return { t: 'call', name: lower, args, star };
        }
        return { t: 'col', name: token.value };
      }
      case 'end':
        this.fail('fim inesperado');
    }
    this.fail('expressão inválida');
  }

  private parseCase(): Expr {
    const whens: Array<{ when: Expr; then: Expr }> = [];
    let otherwise: Expr | undefined;
    while (this.accept('when')) {
      const when = this.parseExpr();
      this.expect('then');
      const then = this.parseExpr();
      whens.push({ when, then });
    }
    if (this.accept('else')) otherwise = this.parseExpr();
    this.expect('end');
    return { t: 'case', whens, otherwise };
  }
}

// ---------------------------------------------------------------------------
// evaluation
// ---------------------------------------------------------------------------

interface EnvEntry {
  alias: string | undefined;
  table: string;
  row: Row | null;
}

type Env = EnvEntry[];

interface Context {
  values: readonly unknown[];
  aggregateRows?: Env[];
  excluded?: Row;
}

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

function toComparable(value: unknown): number | string | null {
  if (value === null || value === undefined) return null;
  if (isDate(value)) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    if (value === 'infinity') return Number.POSITIVE_INFINITY;
    if (value === '-infinity') return Number.NEGATIVE_INFINITY;
    return value;
  }
  return JSON.stringify(value);
}

/** Comparação com a coerção que o pg faria: datas ↔ ISO, números ↔ texto numérico. */
function compare(left: unknown, right: unknown): number | null {
  const a = toComparable(left);
  const b = toComparable(right);
  if (a === null || b === null) return null;
  if (a === Number.POSITIVE_INFINITY || b === Number.NEGATIVE_INFINITY) {
    return a === b ? 0 : 1;
  }
  if (b === Number.POSITIVE_INFINITY || a === Number.NEGATIVE_INFINITY)
    return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const aDate = dateOf(left);
  const bDate = dateOf(right);
  if (aDate !== null && bDate !== null) return aDate - bDate;
  if (
    typeof a === 'number' &&
    typeof b === 'string' &&
    b.trim() !== '' &&
    !Number.isNaN(Number(b))
  ) {
    return a - Number(b);
  }
  if (
    typeof b === 'number' &&
    typeof a === 'string' &&
    a.trim() !== '' &&
    !Number.isNaN(Number(a))
  ) {
    return Number(a) - b;
  }
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function dateOf(value: unknown): number | null {
  if (isDate(value)) return value.getTime();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const parsed = Date.parse(
      value.length === 10 ? `${value}T00:00:00.000Z` : value,
    );
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function localDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (isDate(value)) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function likeToRegExp(pattern: string, insensitive: boolean): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('%', '.*')
    .replaceAll('_', '.');
  return new RegExp(`^${escaped}$`, insensitive ? 'is' : 's');
}

function jsonPathSet(target: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(target)) {
    const copy = [...target];
    copy[Number(head)] = jsonPathSet(copy[Number(head)], rest, value);
    return copy;
  }
  const base = target && typeof target === 'object' ? (target as Row) : {};
  return { ...base, [head!]: jsonPathSet(base[head!], rest, value) };
}

export class FakeSqlDatabase {
  private readonly tables = new Map<string, Row[]>();
  private readonly sequences: Record<string, number>;
  private readonly uniques: Record<string, string[][]>;
  readonly log: Array<{ sql: string; values: readonly unknown[] }> = [];
  readonly tenantId: string;
  readonly tenant: { slug: string; timezone: string; name: string; id: string };
  private readonly nowFn: () => Date;

  constructor(options: FakeSqlOptions) {
    this.tenantId = options.tenantId;
    this.tenant = {
      id: options.tenantId,
      slug: options.tenant?.slug ?? 'am-fixtures',
      timezone: options.tenant?.timezone ?? 'America/Manaus',
      name: options.tenant?.name ?? 'Tenant (fixture)',
    };
    this.nowFn = options.now ?? (() => new Date('2026-09-14T16:00:00.000Z'));
    this.sequences = {
      'portal.protocol_seq': 14,
      ...(options.sequences ?? {}),
    };
    this.uniques = { ...DEFAULT_UNIQUES, ...(options.uniques ?? {}) };
    this.tables.set('auth.tenants', [
      {
        id: this.tenant.id,
        slug: this.tenant.slug,
        name: this.tenant.name,
        timezone: this.tenant.timezone,
      },
    ]);
  }

  /** Transação no formato `PortalSqlTransaction` (`{ query(sql, values) }`). */
  get tx(): {
    query<T extends Row = Row>(
      sql: string,
      values?: readonly unknown[],
    ): Promise<{ rows: T[]; rowCount: number }>;
  } {
    return {
      query: async <T extends Row = Row>(
        sql: string,
        values: readonly unknown[] = [],
      ) => {
        this.log.push({ sql, values });
        const rows = this.execute(sql, values) as T[];
        return { rows, rowCount: rows.length };
      },
    };
  }

  /** Semeia linhas (defaults de `id`/`tenant_id`/`created_at` aplicados). */
  seed(table: string, rows: Row[]): Row[] {
    const stored = this.rowsOf(table);
    const inserted = rows.map((row) => this.withDefaults(table, row));
    stored.push(...inserted);
    return inserted;
  }

  rows(table: string): Row[] {
    return [...this.rowsOf(table)];
  }

  clear(table: string): void {
    this.tables.set(table, []);
  }

  sequenceValue(name: string): number {
    return this.sequences[name] ?? 0;
  }

  private rowsOf(table: string): Row[] {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = [];
      this.tables.set(table, rows);
    }
    return rows;
  }

  private withDefaults(table: string, row: Row): Row {
    const defaults = DEFAULT_COLUMNS[table] ?? {};
    const result: Row = { ...defaults, ...row };
    if (result.id === undefined) result.id = randomUUID();
    if (result.tenant_id === undefined) result.tenant_id = this.tenantId;
    if (result.created_at === undefined) result.created_at = this.nowFn();
    if (table === 'integration.outbox') {
      if (result.available_at === undefined)
        result.available_at = result.created_at;
      if (result.updated_at === undefined)
        result.updated_at = result.created_at;
    }
    return result;
  }

  execute(sql: string, values: readonly unknown[]): Row[] {
    const stmt = new Parser(tokenize(sql), sql).parseStatement();
    const ctx: Context = { values };
    const cteBackup = new Map<string, Row[] | undefined>();
    for (const cte of stmt.ctes ?? []) {
      cteBackup.set(cte.name, this.tables.get(cte.name));
      this.tables.set(cte.name, this.select(cte.select, ctx, sql));
    }
    try {
      switch (stmt.kind) {
        case 'select':
          return this.select(stmt, ctx, sql);
        case 'insert':
          return this.insert(stmt, ctx, sql);
        case 'update':
          return this.update(stmt, ctx, sql);
        case 'delete':
          return this.delete(stmt, ctx, sql);
        case 'noop':
        default:
          return [];
      }
    } finally {
      for (const [name, previous] of cteBackup) {
        if (previous === undefined) this.tables.delete(name);
        else this.tables.set(name, previous);
      }
    }
  }

  // --- select ---------------------------------------------------------------

  private select(stmt: SelectStmt, ctx: Context, sql: string): Row[] {
    let envs: Env[];
    if (!stmt.from) envs = [[]];
    else {
      const base = this.rowsOf(stmt.from.table).map<Env>((row) => [
        { alias: stmt.from!.alias, table: stmt.from!.table, row },
      ]);
      envs = base;
      for (const join of stmt.joins) {
        const right = this.rowsOf(join.source.table);
        const next: Env[] = [];
        for (const env of envs) {
          let matched = false;
          for (const row of right) {
            const candidate: Env = [
              ...env,
              { alias: join.source.alias, table: join.source.table, row },
            ];
            if (this.truthy(this.eval(join.on, candidate, ctx, sql))) {
              matched = true;
              next.push(candidate);
            }
          }
          if (!matched && join.kind === 'left') {
            next.push([
              ...env,
              { alias: join.source.alias, table: join.source.table, row: null },
            ]);
          }
        }
        envs = next;
      }
    }
    if (stmt.where) {
      envs = envs.filter((env) =>
        this.truthy(this.eval(stmt.where!, env, ctx, sql)),
      );
    }
    const aggregate = stmt.items.some((item) => this.isAggregate(item.expr));
    if (stmt.orderBy.length > 0 && !aggregate) {
      envs = [...envs].sort((left, right) => {
        for (const key of stmt.orderBy) {
          const a = this.eval(key.expr, left, ctx, sql);
          const b = this.eval(key.expr, right, ctx, sql);
          const aNull = a === null || a === undefined;
          const bNull = b === null || b === undefined;
          if (aNull && bNull) continue;
          if (aNull) return key.nullsLast ? 1 : -1;
          if (bNull) return key.nullsLast ? -1 : 1;
          const cmp = compare(a, b) ?? 0;
          if (cmp !== 0) return key.desc ? -cmp : cmp;
        }
        return 0;
      });
    }
    if (stmt.distinctOn) {
      const seen = new Set<string>();
      envs = envs.filter((env) => {
        const key = JSON.stringify(
          stmt.distinctOn!.map((expr) => this.eval(expr, env, ctx, sql)),
        );
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (aggregate) {
      const aggregateCtx: Context = { ...ctx, aggregateRows: envs };
      return [this.project(stmt.items, [], aggregateCtx, sql)];
    }
    const offset = stmt.offset
      ? Number(this.eval(stmt.offset, [], ctx, sql))
      : 0;
    const limit = stmt.limit
      ? Number(this.eval(stmt.limit, [], ctx, sql))
      : undefined;
    const sliced = envs.slice(
      offset,
      limit === undefined ? undefined : offset + limit,
    );
    const projected = sliced.map((env) =>
      this.project(stmt.items, env, ctx, sql),
    );
    return stmt.union
      ? [...projected, ...this.select(stmt.union, ctx, sql)]
      : projected;
  }

  private isAggregate(expr: Expr): boolean {
    switch (expr.t) {
      case 'call':
        if (
          ['count', 'max', 'min', 'sum', 'array_agg', 'bool_or'].includes(
            expr.name,
          )
        )
          return true;
        return expr.args.some((arg) => this.isAggregate(arg));
      case 'cast':
        return this.isAggregate(expr.expr);
      case 'bin':
        return this.isAggregate(expr.left) || this.isAggregate(expr.right);
      default:
        return false;
    }
  }

  /** Projeção posicional: pares [nome, valor] na ordem do select list. */
  private projectPairs(
    items: SelectItem[],
    env: Env,
    ctx: Context,
    sql: string,
  ): Array<[string, unknown]> {
    const pairs: Array<[string, unknown]> = [];
    for (const item of items) {
      if (item.expr.t === 'star') {
        for (const entry of env) {
          if (
            item.expr.alias &&
            entry.alias !== item.expr.alias &&
            entry.table !== item.expr.alias
          ) {
            continue;
          }
          if (entry.row) {
            for (const [key, value] of Object.entries(entry.row))
              pairs.push([key, value]);
          }
        }
        continue;
      }
      const name =
        item.alias ??
        (item.expr.t === 'col'
          ? item.expr.name.split('.').pop()!
          : item.expr.t === 'call'
            ? item.expr.name
            : item.expr.t === 'cast' && item.expr.expr.t === 'col'
              ? item.expr.expr.name.split('.').pop()!
              : '?column?');
      pairs.push([name, this.eval(item.expr, env, ctx, sql)]);
    }
    return pairs;
  }

  private project(
    items: SelectItem[],
    env: Env,
    ctx: Context,
    sql: string,
  ): Row {
    const out: Row = {};
    for (const [name, value] of this.projectPairs(items, env, ctx, sql))
      out[name] = value;
    return out;
  }

  /** Linhas de um select como listas posicionais (para `insert … select`). */
  private selectValues(
    stmt: SelectStmt,
    ctx: Context,
    sql: string,
  ): unknown[][] {
    const marker = '__fake_sql_pos__';
    const rows = this.select(
      {
        ...stmt,
        items: stmt.items.map((item, index) => ({
          ...item,
          alias: `${marker}${index}`,
        })),
      },
      ctx,
      sql,
    );
    return rows.map((row) =>
      stmt.items.map((_, index) => row[`${marker}${index}`]),
    );
  }

  // --- insert / update / delete --------------------------------------------

  private insert(stmt: InsertStmt, ctx: Context, sql: string): Row[] {
    const stored = this.rowsOf(stmt.table);
    const produced: Row[] = [];
    const sourceRows: Row[] = [];
    if (stmt.rows) {
      for (const exprs of stmt.rows) {
        if (exprs.length !== stmt.columns.length) {
          throw new FakeSqlUnsupported(
            sql,
            'colunas e valores em número diferente',
          );
        }
        const row: Row = {};
        exprs.forEach((expr, index) => {
          row[stmt.columns[index]!] = this.eval(expr, [], ctx, sql);
        });
        sourceRows.push(row);
      }
    } else if (stmt.select) {
      for (const values of this.selectValues(stmt.select, ctx, sql)) {
        const row: Row = {};
        stmt.columns.forEach((column, index) => {
          row[column] = values[index];
        });
        sourceRows.push(row);
      }
    }
    for (const candidate of sourceRows) {
      const row = this.withDefaults(stmt.table, candidate);
      const conflicting = this.findConflict(
        stmt.table,
        row,
        stmt.onConflict?.target,
      );
      if (conflicting) {
        if (!stmt.onConflict) {
          throw new FakeSqlError(
            '23505',
            `duplicate key value violates unique constraint (${stmt.table})`,
            `ux_${stmt.table.replace('.', '_')}`,
          );
        }
        if (stmt.onConflict.action === 'nothing') continue;
        const env: Env = [
          { alias: undefined, table: stmt.table, row: conflicting },
        ];
        const updates: Row = {};
        for (const assignment of stmt.onConflict.set ?? []) {
          updates[assignment.column] = this.eval(
            assignment.expr,
            env,
            { ...ctx, excluded: row },
            sql,
          );
        }
        Object.assign(conflicting, updates);
        produced.push(conflicting);
        continue;
      }
      stored.push(row);
      produced.push(row);
    }
    if (!stmt.returning) return [];
    return produced.map((row) =>
      this.project(
        stmt.returning!,
        [{ alias: undefined, table: stmt.table, row }],
        ctx,
        sql,
      ),
    );
  }

  private findConflict(
    table: string,
    row: Row,
    target?: string[],
  ): Row | undefined {
    const stored = this.rowsOf(table);
    const keySets = target
      ? [target.filter((column) => column !== 'tenant_id')]
      : (this.uniques[table] ?? []);
    for (const columns of keySets) {
      if (columns.length === 0) continue;
      const found = stored.find((existing) =>
        columns.every((column) => {
          const a = row[column];
          const b = existing[column];
          if (
            (a === null || a === undefined) &&
            (b === null || b === undefined)
          ) {
            return column === 'target_id';
          }
          return compare(a, b) === 0;
        }),
      );
      if (found) return found;
    }
    if (row.id !== undefined) {
      const byId = stored.find((existing) => existing.id === row.id);
      if (byId) return byId;
    }
    return undefined;
  }

  private update(stmt: UpdateStmt, ctx: Context, sql: string): Row[] {
    const stored = this.rowsOf(stmt.table);
    const touched: Row[] = [];
    for (const row of stored) {
      const env: Env = [{ alias: stmt.alias, table: stmt.table, row }];
      if (stmt.where && !this.truthy(this.eval(stmt.where, env, ctx, sql)))
        continue;
      const updates: Row = {};
      for (const assignment of stmt.set) {
        updates[assignment.column] = this.eval(assignment.expr, env, ctx, sql);
      }
      Object.assign(row, updates);
      touched.push(row);
    }
    if (!stmt.returning) return [];
    return touched.map((row) =>
      this.project(
        stmt.returning!,
        [{ alias: stmt.alias, table: stmt.table, row }],
        ctx,
        sql,
      ),
    );
  }

  private delete(stmt: DeleteStmt, ctx: Context, sql: string): Row[] {
    const stored = this.rowsOf(stmt.table);
    const kept = stored.filter((row) => {
      const env: Env = [{ alias: stmt.alias, table: stmt.table, row }];
      return stmt.where
        ? !this.truthy(this.eval(stmt.where, env, ctx, sql))
        : false;
    });
    this.tables.set(stmt.table, kept);
    return [];
  }

  // --- expressions ----------------------------------------------------------

  private truthy(value: unknown): boolean {
    return value === true;
  }

  private resolveColumn(
    name: string,
    env: Env,
    ctx: Context,
    sql: string,
  ): unknown {
    const parts = name.split('.');
    if (parts.length === 2 && parts[0] === 'excluded') {
      return ctx.excluded?.[parts[1]!] ?? null;
    }
    if (parts.length >= 2) {
      const column = parts[parts.length - 1]!;
      const qualifier = parts.slice(0, -1).join('.');
      const entry = env.find(
        (candidate) =>
          candidate.alias === qualifier ||
          candidate.table === qualifier ||
          candidate.table.endsWith(`.${qualifier}`),
      );
      if (entry) return entry.row ? (entry.row[column] ?? null) : null;
      throw new FakeSqlUnsupported(sql, `referência desconhecida ${name}`);
    }
    for (const entry of env) {
      if (entry.row && name in entry.row) return entry.row[name];
    }
    // coluna ausente numa linha existente (ex.: nunca gravada) → null
    if (env.some((entry) => entry.row)) return null;
    throw new FakeSqlUnsupported(sql, `coluna ${name} fora de um from`);
  }

  private eval(expr: Expr, env: Env, ctx: Context, sql: string): unknown {
    switch (expr.t) {
      case 'lit':
        return expr.value;
      case 'param': {
        const value = ctx.values[expr.index - 1];
        return value === undefined ? null : value;
      }
      case 'col':
        return this.resolveColumn(expr.name, env, ctx, sql);
      case 'star':
        return null;
      case 'tuple':
        return expr.items.map((item) => this.eval(item, env, ctx, sql));
      case 'not': {
        const value = this.eval(expr.expr, env, ctx, sql);
        return value === null ? null : !this.truthy(value);
      }
      case 'isnull': {
        const value = this.eval(expr.expr, env, ctx, sql);
        const isNull = value === null || value === undefined;
        return expr.negated ? !isNull : isNull;
      }
      case 'in': {
        const value = this.eval(expr.expr, env, ctx, sql);
        let list: unknown[] = [];
        for (const item of expr.list) {
          if (item.t === 'subquery') {
            list.push(
              ...this.select(item.select, ctx, sql).map(
                (row) => Object.values(row)[0],
              ),
            );
          } else list.push(this.eval(item, env, ctx, sql));
        }
        list = list.flat();
        const found = list.some((candidate) => compare(value, candidate) === 0);
        return expr.negated ? !found : found;
      }
      case 'any': {
        const value = this.eval(expr.expr, env, ctx, sql);
        const array = this.eval(expr.array, env, ctx, sql);
        const items = Array.isArray(array) ? array : [array];
        return items.some(
          (candidate) => this.compareOp(expr.op, value, candidate) === true,
        );
      }
      case 'cast':
        return this.cast(this.eval(expr.expr, env, ctx, sql), expr.type);
      case 'exists':
        return this.select(expr.select, ctx, sql).length > 0;
      case 'subquery': {
        const rows = this.select(expr.select, ctx, sql);
        if (rows.length === 0) return null;
        return Object.values(rows[0]!)[0];
      }
      case 'case': {
        for (const branch of expr.whens) {
          if (this.truthy(this.eval(branch.when, env, ctx, sql))) {
            return this.eval(branch.then, env, ctx, sql);
          }
        }
        return expr.otherwise ? this.eval(expr.otherwise, env, ctx, sql) : null;
      }
      case 'call':
        return this.call(expr, env, ctx, sql);
      case 'bin':
        return this.binary(expr, env, ctx, sql);
    }
  }

  private cast(value: unknown, type: string): unknown {
    if (value === null || value === undefined) return null;
    switch (type) {
      case 'date':
        return localDate(value);
      case 'text':
      case 'varchar':
        if (isDate(value)) return value.toISOString();
        return typeof value === 'string' ? value : JSON.stringify(value);
      case 'jsonb':
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'int':
      case 'integer':
      case 'bigint':
      case 'numeric':
      case 'smallint':
        return Number(value);
      case 'boolean':
      case 'bool':
        return value === true || value === 'true' || value === 't';
      case 'timestamptz':
      case 'timestamp':
        return isDate(value) ? value : new Date(String(value));
      default:
        return value;
    }
  }

  private call(
    expr: Extract<Expr, { t: 'call' }>,
    env: Env,
    ctx: Context,
    sql: string,
  ): unknown {
    const args = () => expr.args.map((arg) => this.eval(arg, env, ctx, sql));
    switch (expr.name) {
      case 'now':
      case 'clock_timestamp':
      case 'transaction_timestamp':
      case 'statement_timestamp':
        return this.nowFn();
      case 'current_date':
        return this.nowFn().toISOString().slice(0, 10);
      case 'auth.current_tenant':
        return this.tenantId;
      case 'gen_random_uuid':
        return randomUUID();
      case 'nextval': {
        const [name] = args();
        const key = String(name);
        this.sequences[key] = (this.sequences[key] ?? 0) + 1;
        return this.sequences[key];
      }
      case 'setval': {
        const [name, value] = args();
        this.sequences[String(name)] = Number(value);
        return Number(value);
      }
      case 'set_config':
        return args()[1] ?? null;
      case 'coalesce':
        return (
          args().find((value) => value !== null && value !== undefined) ?? null
        );
      case 'nullif': {
        const [a, b] = args();
        return compare(a, b) === 0 ? null : a;
      }
      case 'greatest':
        return args().reduce((best, value) =>
          (compare(value, best) ?? 0) > 0 ? value : best,
        );
      case 'least':
        return args().reduce((best, value) =>
          (compare(value, best) ?? 0) < 0 ? value : best,
        );
      case 'lower':
        return String(args()[0] ?? '').toLowerCase();
      case 'upper':
        return String(args()[0] ?? '').toUpperCase();
      case 'length':
        return String(args()[0] ?? '').length;
      case 'to_char': {
        const [value, format] = args();
        if (value === null || value === undefined) return null;
        if (String(format).toUpperCase().startsWith('YYYY-MM-DD')) {
          const asDate = isDate(value)
            ? value
            : new Date(
                String(value).length === 10
                  ? `${value}T00:00:00.000Z`
                  : String(value),
              );
          return asDate.toISOString().slice(0, 10);
        }
        return String(value);
      }
      case 'to_jsonb':
      case 'to_json':
        return args()[0] ?? null;
      case 'jsonb_build_object': {
        const values = args();
        const out: Row = {};
        for (let i = 0; i < values.length; i += 2)
          out[String(values[i])] = values[i + 1] ?? null;
        return out;
      }
      case 'jsonb_set': {
        const [target, path, value] = args();
        const segments = String(path)
          .replace(/^\{|\}$/g, '')
          .split(',')
          .map((s) => s.trim());
        return jsonPathSet(target, segments, value);
      }
      case 'jsonb_array_length':
      case 'array_length': {
        const [value] = args();
        return Array.isArray(value) ? value.length : null;
      }
      case 'interval':
        return { interval: String(args()[0]) };
      case 'not_distinct': {
        const [inner] = expr.args;
        const value = this.eval(inner!, env, ctx, sql);
        return value === null ? true : value;
      }
      case 'count': {
        const rows = ctx.aggregateRows ?? [];
        if (expr.star || expr.args.length === 0) return String(rows.length);
        const counted = rows.filter((row) => {
          const value = this.eval(expr.args[0]!, row, ctx, sql);
          return value !== null && value !== undefined;
        });
        return String(counted.length);
      }
      case 'max':
      case 'min':
      case 'sum': {
        const rows = ctx.aggregateRows ?? [];
        const values = rows
          .map((row) => this.eval(expr.args[0]!, row, ctx, sql))
          .filter((value) => value !== null && value !== undefined);
        if (values.length === 0) return null;
        if (expr.name === 'sum')
          return values.reduce<number>((acc, value) => acc + Number(value), 0);
        return values.reduce((best, value) => {
          const cmp = compare(value, best) ?? 0;
          return expr.name === 'max'
            ? cmp > 0
              ? value
              : best
            : cmp < 0
              ? value
              : best;
        });
      }
      case 'array_agg': {
        const rows = ctx.aggregateRows ?? [];
        return rows.map((row) => this.eval(expr.args[0]!, row, ctx, sql));
      }
      default:
        throw new FakeSqlUnsupported(sql, `função ${expr.name} não suportada`);
    }
  }

  private compareOp(op: string, left: unknown, right: unknown): boolean | null {
    if (
      left === null ||
      left === undefined ||
      right === null ||
      right === undefined
    )
      return null;
    if (Array.isArray(left) && Array.isArray(right)) {
      for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
        const cmp = compare(left[i], right[i]);
        if (cmp === null) return null;
        if (cmp !== 0) return this.applyOp(op, cmp);
      }
      return this.applyOp(op, 0);
    }
    if (
      typeof left === 'object' &&
      typeof right === 'object' &&
      !isDate(left) &&
      !isDate(right)
    ) {
      const equal = JSON.stringify(left) === JSON.stringify(right);
      return op === '=' ? equal : op === '<>' ? !equal : null;
    }
    const cmp = compare(left, right);
    return cmp === null ? null : this.applyOp(op, cmp);
  }

  private applyOp(op: string, cmp: number): boolean {
    switch (op) {
      case '=':
        return cmp === 0;
      case '<>':
        return cmp !== 0;
      case '<':
        return cmp < 0;
      case '<=':
        return cmp <= 0;
      case '>':
        return cmp > 0;
      case '>=':
        return cmp >= 0;
      default:
        return false;
    }
  }

  private binary(
    expr: Extract<Expr, { t: 'bin' }>,
    env: Env,
    ctx: Context,
    sql: string,
  ): unknown {
    if (expr.op === 'and') {
      const left = this.eval(expr.left, env, ctx, sql);
      if (left === false) return false;
      const right = this.eval(expr.right, env, ctx, sql);
      if (right === false) return false;
      return left === true && right === true ? true : null;
    }
    if (expr.op === 'or') {
      const left = this.eval(expr.left, env, ctx, sql);
      if (left === true) return true;
      const right = this.eval(expr.right, env, ctx, sql);
      if (right === true) return true;
      return left === false && right === false ? false : null;
    }
    const left = this.eval(expr.left, env, ctx, sql);
    const right = this.eval(expr.right, env, ctx, sql);
    switch (expr.op) {
      case '=':
      case '<>':
      case '<':
      case '<=':
      case '>':
      case '>=':
        return this.compareOp(expr.op, left, right);
      case 'like':
      case 'ilike':
        if (left === null || right === null) return null;
        return likeToRegExp(String(right), expr.op === 'ilike').test(
          String(left),
        );
      case '+':
      case '-': {
        if (left === null || right === null) return null;
        if (
          isDate(left) &&
          typeof right === 'object' &&
          right &&
          'interval' in (right as Row)
        ) {
          return this.shiftDate(
            left,
            String((right as Row).interval),
            expr.op === '-' ? -1 : 1,
          );
        }
        if (
          typeof left === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(left) &&
          typeof right === 'number'
        ) {
          const shifted = new Date(`${left}T00:00:00.000Z`);
          shifted.setUTCDate(
            shifted.getUTCDate() + (expr.op === '-' ? -right : right),
          );
          return shifted.toISOString().slice(0, 10);
        }
        return expr.op === '+'
          ? Number(left) + Number(right)
          : Number(left) - Number(right);
      }
      case '*':
        return Number(left) * Number(right);
      case '/':
        return Number(left) / Number(right);
      case '||': {
        if (Array.isArray(left) || Array.isArray(right)) {
          return [
            ...(Array.isArray(left) ? left : [left]),
            ...(Array.isArray(right) ? right : [right]),
          ];
        }
        if (
          left &&
          right &&
          typeof left === 'object' &&
          typeof right === 'object'
        ) {
          return { ...(left as Row), ...(right as Row) };
        }
        return `${left ?? ''}${right ?? ''}`;
      }
      case '->':
      case '->>': {
        if (left === null || left === undefined) return null;
        const container = typeof left === 'string' ? JSON.parse(left) : left;
        const key = right as string | number;
        const value = Array.isArray(container)
          ? container[Number(key)]
          : (container as Row)[String(key)];
        if (value === undefined) return null;
        if (expr.op === '->>')
          return typeof value === 'string' ? value : JSON.stringify(value);
        return value;
      }
      default:
        throw new FakeSqlUnsupported(sql, `operador ${expr.op} não suportado`);
    }
  }

  private shiftDate(base: Date, interval: string, sign: number): Date {
    const match =
      /^(-?\d+)\s*(hour|hours|day|days|minute|minutes|second|seconds)$/i.exec(
        interval.trim(),
      );
    if (!match)
      throw new FakeSqlUnsupported(
        'interval',
        `interval '${interval}' não suportado`,
      );
    const amount = Number(match[1]) * sign;
    const unit = match[2]!.toLowerCase();
    const ms = unit.startsWith('hour')
      ? 3_600_000
      : unit.startsWith('day')
        ? 86_400_000
        : unit.startsWith('minute')
          ? 60_000
          : 1_000;
    return new Date(base.getTime() + amount * ms);
  }
}
