// Harness dos specs `unit` dos projetores (CTG-0001 §4.3, C-0001-05). Forma
// reduzida de
// `backend/domains/portal/projections/tests/support/projectors-harness.ts`
// (tx falsa em memória, `rait-test-strategy.md` §1 "unit nunca abre
// conexão"), adaptada à interface mais simples de `DashboardSqlTransaction`
// (CTG-0001 §4.3: um único método `query(statement, values)`, sem
// repositório/porta própria) em vez da árvore de serviços/portas do Portal.
// `FakeDashboardTx` interpreta só o SUBCONJUNTO de SQL que um projetor
// idempotente plausivelmente usa: `insert into <schema>.<tabela> (...) values
// (...) [on conflict (...) do nothing | do update set ...] [returning ...]`,
// `select ... from <schema>.<tabela> where <col> = $n [and ...]` e `update
// <schema>.<tabela> set ... where ...`; qualquer coisa fora disso lança
// `FakeSqlUnsupported` com o SQL na mensagem (mesmo papel que no dialeto do
// Portal: sinal para o Engineer (TASK-0010) escrever a consulta dentro do
// subconjunto, ou para o Inspector estendê-lo). `runProjectionContractSuite`
// roda os sete casos comuns do critério C-0001-05 (b–e) contra qualquer
// projetor construído sobre esse contrato; cada spec de `tests/unit/*.spec.ts`
// só fornece a fixture do evento e o campo obrigatório a apagar para o caso
// `data_invalid`.
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  FIXTURE_TENANT_ID,
  OTHER_TENANT_ID,
} from '../fixtures/outbox-events.js';
// Tipos só de `src/handwritten/projection-contract.ts` (TASK-0010; ainda não
// existe nesta entrega — typecheck falha só nesta linha, aceito pelo prompt).
import type {
  DashboardConsumedEvent,
  DashboardProjectionContext,
  DashboardProjectionResult,
  DashboardProjector,
} from '../../src/handwritten/projection-contract.js';

export type Row = Record<string, unknown>;

export class FakeSqlUnsupported extends Error {
  constructor(sql: string) {
    super(
      `fake-dashboard-sql: fora do subconjunto interpretado\n  SQL: ${sql.replace(/\s+/g, ' ').trim()}`,
    );
    this.name = 'FakeSqlUnsupported';
  }
}

interface ParsedInsert {
  table: string;
  columns: string[];
  valueExprs: string[];
  conflictColumns: string[] | null;
  conflictAction: 'do nothing' | 'do update' | null;
  returning: string | null;
}

/** tx falsa em memória: um `Map<"schema.tabela", Row[]>`. Só entende o
 * subconjunto de SQL descrito no cabeçalho — suficiente para os projetores
 * idempotentes de CTG-0001 §4.3 (ledger `on conflict … do nothing` +
 * upsert da célula por chave natural `on conflict … do update`). */
export class FakeDashboardTx {
  readonly tables = new Map<string, Row[]>();
  readonly calls: { statement: string; values: readonly unknown[] }[] = [];

  constructor(seed: Record<string, Row[]> = {}) {
    for (const [table, rows] of Object.entries(seed)) {
      this.tables.set(
        table,
        rows.map((row) => ({ ...row })),
      );
    }
  }

  rows(table: string): Row[] {
    return this.tables.get(table) ?? [];
  }

  async query<T extends Row = Row>(
    statement: string,
    values: readonly unknown[] = [],
  ): Promise<{ rows: T[]; rowCount?: number | null }> {
    this.calls.push({ statement, values });
    const sql = statement.trim();
    const lower = sql.toLowerCase();
    if (lower.startsWith('insert into')) {
      return this.runInsert(sql, values) as {
        rows: T[];
        rowCount?: number | null;
      };
    }
    if (lower.startsWith('select')) {
      return this.runSelect(sql, values) as {
        rows: T[];
        rowCount?: number | null;
      };
    }
    if (lower.startsWith('update')) {
      return this.runUpdate(sql, values) as {
        rows: T[];
        rowCount?: number | null;
      };
    }
    throw new FakeSqlUnsupported(sql);
  }

  /** Cada tabela tocada por um INSERT/UPDATE, na ordem das chamadas — usado
   * pela asserção "nenhuma projeção escreve fora de dashboard.*" (g). */
  writtenTables(): string[] {
    return [
      ...new Set(
        this.calls
          .filter((call) => /^(insert|update)/i.test(call.statement.trim()))
          .map((call) => this.tableOf(call.statement)),
      ),
    ];
  }

  private tableOf(sql: string): string {
    const match = sql.match(
      /(?:insert into|update|from)\s+([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*)/i,
    );
    if (!match?.[1]) throw new FakeSqlUnsupported(sql);
    return match[1].toLowerCase();
  }

  private substitute(expr: string, values: readonly unknown[]): unknown {
    const trimmed = expr.trim();
    const placeholder = trimmed.match(/^\$(\d+)$/);
    if (placeholder) return values[Number(placeholder[1]) - 1];
    if (trimmed === 'null') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'now()') return new Date().toISOString();
    if (trimmed === 'gen_random_uuid()') return randomUUID();
    const quoted = trimmed.match(/^'(.*)'$/s);
    if (quoted) return quoted[1];
    const num = Number(trimmed);
    if (!Number.isNaN(num) && trimmed !== '') return num;
    throw new FakeSqlUnsupported(`expressão não suportada: ${expr}`);
  }

  /** Divide `text` no separador `sep` (um caractere, ex. `,`, ou uma
   * palavra/token de vários caracteres, ex. `' and '` para o `where` de
   * nível superior — A15), ignorando ocorrências dentro de `(...)` ou de
   * aspas simples. Comparação de `sep` sem diferenciar maiúsculas/minúsculas
   * (`AND`/`and` no SQL gerado). */
  private splitTopLevel(text: string, sep = ','): string[] {
    const parts: string[] = [];
    const sepLower = sep.toLowerCase();
    let depth = 0;
    let inQuote = false;
    let current = '';
    let i = 0;
    while (i < text.length) {
      const ch = text[i]!;
      if (ch === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (ch === '(') depth += 1;
        if (ch === ')') depth -= 1;
      }
      if (
        !inQuote &&
        depth === 0 &&
        text.slice(i, i + sep.length).toLowerCase() === sepLower
      ) {
        parts.push(current);
        current = '';
        i += sep.length;
        continue;
      }
      current += ch;
      i += 1;
    }
    if (current.trim() !== '') parts.push(current);
    return parts.map((part) => part.trim());
  }

  private parseInsert(sql: string): ParsedInsert {
    const head = sql.match(
      /insert into\s+([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*)\s*\(([^)]*)\)\s*values\s*\(([\s\S]*?)\)\s*(on conflict[\s\S]*?do\s+(nothing|update[\s\S]*?))?\s*(returning\s+([\s\S]*))?;?$/i,
    );
    if (!head) throw new FakeSqlUnsupported(sql);
    const [, table, colsRaw, valuesRaw, , conflictActionRaw, , returningRaw] =
      head;
    const columns = this.splitTopLevel(colsRaw!).map((col) => col.trim());
    const valueExprs = this.splitTopLevel(valuesRaw!);
    const conflictMatch = sql.match(/on conflict\s*\(([^)]*)\)/i);
    return {
      table: table!.toLowerCase(),
      columns,
      valueExprs,
      conflictColumns: conflictMatch
        ? this.splitTopLevel(conflictMatch[1]!)
        : null,
      conflictAction: conflictActionRaw
        ? conflictActionRaw.toLowerCase().startsWith('nothing')
          ? 'do nothing'
          : 'do update'
        : null,
      returning: returningRaw?.trim() ?? null,
    };
  }

  private runInsert(
    sql: string,
    values: readonly unknown[],
  ): { rows: Row[]; rowCount: number } {
    const parsed = this.parseInsert(sql);
    const table = this.tables.get(parsed.table) ?? [];
    this.tables.set(parsed.table, table);
    const row: Row = {};
    parsed.columns.forEach((col, index) => {
      row[col] = this.substitute(parsed.valueExprs[index]!, values);
    });
    const conflictCols = parsed.conflictColumns;
    const existingIndex = conflictCols
      ? table.findIndex((candidate) =>
          conflictCols.every((col) => candidate[col] === row[col]),
        )
      : -1;
    if (existingIndex >= 0) {
      if (parsed.conflictAction === 'do nothing') {
        return { rows: [], rowCount: 0 };
      }
      table[existingIndex] = { ...table[existingIndex], ...row };
      return {
        rows: parsed.returning ? [table[existingIndex]!] : [],
        rowCount: 1,
      };
    }
    if (!row.id) row.id = randomUUID();
    table.push(row);
    return { rows: parsed.returning ? [row] : [], rowCount: 1 };
  }

  private runSelect(
    sql: string,
    values: readonly unknown[],
  ): { rows: Row[]; rowCount: number } {
    const head = sql.match(
      /select\s+([\s\S]*?)\s+from\s+([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*)(?:\s+where\s+([\s\S]*?))?;?$/i,
    );
    if (!head) throw new FakeSqlUnsupported(sql);
    const [, , table, whereRaw] = head;
    const rows = this.rows(table!.toLowerCase()).filter((row) =>
      this.matchesWhere(row, whereRaw, values),
    );
    return { rows, rowCount: rows.length };
  }

  private runUpdate(
    sql: string,
    values: readonly unknown[],
  ): { rows: Row[]; rowCount: number } {
    const head = sql.match(
      /update\s+([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*)\s+set\s+([\s\S]*?)(?:\s+where\s+([\s\S]*?))?;?$/i,
    );
    if (!head) throw new FakeSqlUnsupported(sql);
    const [, table, setRaw, whereRaw] = head;
    const rows = this.rows(table!.toLowerCase());
    const assignments = this.splitTopLevel(setRaw!).map((clause) => {
      const [col, expr] = clause.split('=').map((part) => part.trim());
      return { col: col!, expr: expr! };
    });
    let count = 0;
    for (const row of rows) {
      if (!this.matchesWhere(row, whereRaw, values)) continue;
      for (const { col, expr } of assignments)
        row[col] = this.substitute(expr, values);
      count += 1;
    }
    return { rows: [], rowCount: count };
  }

  private matchesWhere(
    row: Row,
    whereRaw: string | undefined,
    values: readonly unknown[],
  ): boolean {
    if (!whereRaw) return true;
    return this.splitTopLevel(whereRaw, ' and ').every((clause) => {
      const isNull = clause.match(/^([a-z_][a-z0-9_]*)\s+is\s+null$/i);
      if (isNull)
        return row[isNull[1]!] === null || row[isNull[1]!] === undefined;
      const eq = clause.match(/^([a-z_][a-z0-9_]*)\s*=\s*(.+)$/i);
      if (eq) return row[eq[1]!] === this.substitute(eq[2]!, values);
      throw new FakeSqlUnsupported(`cláusula where não suportada: ${clause}`);
    });
  }
}

export function fakeContext(
  tx: FakeDashboardTx,
  tenantId: string = FIXTURE_TENANT_ID,
  now: Date = new Date('2026-09-12T10:00:00.000Z'),
): DashboardProjectionContext {
  return { tx, tenantId, now };
}

export interface ContractSuiteOptions {
  /** Fábrica do projetor sob teste (uma instância nova por `it`). */
  createProjector: () => DashboardProjector;
  /** Fixture de evento válido, consumido pelo projetor. */
  validEvent: DashboardConsumedEvent;
  /** Campo de `data` a apagar para provocar `data_invalid`. */
  requiredDataField: string;
  /** `type` fora de `consumedEvents`, para o caso `event_not_consumed`. */
  unconsumedType?: string;
}

/** Roda os casos comuns do critério C-0001-05 (b, c, d, e — parte "erro
 * tipado") contra `options.createProjector()`. Cada spec de projetor chama
 * isto e acrescenta as asserções específicas da sua projeção (derivadas,
 * `connected`, etc.) no próprio `describe`. */
export function runProjectionContractSuite(
  options: ContractSuiteOptions,
): void {
  const { createProjector, validEvent, requiredDataField } = options;
  const unconsumedType = options.unconsumedType ?? '__not_consumed__';

  describe('contrato comum do projetor (CTG-0001 §4.3, C-0001-05)', () => {
    it('dado consumedEvents quando lido então é um array literal não vazio (contrato do gate M6)', () => {
      const projector = createProjector();
      expect(Array.isArray(projector.consumedEvents)).toBe(true);
      expect(projector.consumedEvents.length).toBeGreaterThan(0);
    });

    it('dado a fixture de evento válida aplicada duas vezes quando apply roda então a 1ª retorna applied e a 2ª duplicate, com uma linha no ledger', async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx);
      const projector = createProjector();

      const first = await projector.apply(validEvent, ctx);
      expect(first.kind).toBe('applied');

      const second = await projector.apply(validEvent, ctx);
      expect(second.kind).toBe('duplicate');

      const ledger = tx.rows('dashboard.monitor_projection_applied_event');
      expect(ledger).toHaveLength(1);
      expect(ledger[0]?.event_id).toBe(validEvent.id);
      expect(ledger[0]?.event_schema_version).toBe(
        validEvent.version ?? validEvent.schemaVersion,
      );
      expect(ledger[0]?.aggregate_version).toBe(validEvent.aggregate.version);
    });

    it('dado um evento com type/domainEvent fora de consumedEvents quando apply roda então lança DashboardProjectionError reason=event_not_consumed e nada é gravado', async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx);
      const projector = createProjector();
      const bogus = {
        ...validEvent,
        type: unconsumedType,
        domainEvent: undefined,
      };

      await expect(projector.apply(bogus, ctx)).rejects.toMatchObject({
        reason: 'event_not_consumed',
      });
      expect(
        tx.rows('dashboard.monitor_projection_applied_event'),
      ).toHaveLength(0);
    });

    it(`dado data sem o campo obrigatório "${requiredDataField}" quando apply roda então lança DashboardProjectionError reason=data_invalid e nada é gravado`, async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx);
      const projector = createProjector();
      const { [requiredDataField]: _removed, ...rest } = validEvent.data;
      const invalid = { ...validEvent, data: rest };

      await expect(projector.apply(invalid, ctx)).rejects.toMatchObject({
        reason: 'data_invalid',
      });
      expect(
        tx.rows('dashboard.monitor_projection_applied_event'),
      ).toHaveLength(0);
    });

    it('dado tenantId do evento diferente de ctx.tenantId quando apply roda então lança DashboardProjectionError reason=tenant_mismatch', async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx, FIXTURE_TENANT_ID);
      const projector = createProjector();
      const mismatched = { ...validEvent, tenantId: OTHER_TENANT_ID };

      await expect(projector.apply(mismatched, ctx)).rejects.toMatchObject({
        reason: 'tenant_mismatch',
      });
    });

    it('dado um envelope sem version e sem schemaVersion quando apply roda então lança DashboardProjectionError reason=version_missing', async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx);
      const projector = createProjector();
      const noVersion = {
        ...validEvent,
        version: undefined,
        schemaVersion: undefined,
      };

      await expect(projector.apply(noVersion, ctx)).rejects.toMatchObject({
        reason: 'version_missing',
      });
    });

    it('dado um evento com aggregate.version menor que o da célula já aplicada quando apply roda então retorna ignored stale_version (ledger gravado mesmo assim)', async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx);
      const projector = createProjector();
      await projector.apply(validEvent, ctx);
      const staler = {
        ...validEvent,
        id: randomUUID(),
        aggregate: {
          ...validEvent.aggregate,
          version: Math.max(validEvent.aggregate.version - 1, 0),
        },
      };

      const result: DashboardProjectionResult = await projector.apply(
        staler,
        ctx,
      );
      expect(result).toMatchObject({
        kind: 'ignored',
        reason: 'stale_version',
      });
    });

    it('dado o SQL capturado pela tx falsa quando as tabelas escritas são lidas então nenhuma é fora de dashboard.* (g)', async () => {
      const tx = new FakeDashboardTx();
      const ctx = fakeContext(tx);
      const projector = createProjector();
      await projector.apply(validEvent, ctx);
      for (const table of tx.writtenTables()) {
        expect(table.startsWith('dashboard.')).toBe(true);
      }
    });
  });
}
