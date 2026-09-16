import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * CTG-0003 §5.1/§10 e ADR-0003 (R-0008, TASK-0006) — C-0003-35: nenhum
 * cliente HTTP direto sai de `@detran/ops-snapshots`; toda consulta externa
 * passa por `SNAPSHOT_QUERY_PORTS` (`packages/senatran-adapter`). Este teste
 * é local ao pacote e complementa — nunca substitui — `tools/verify-senatran-boundary.ts`
 * (`pnpm verify:senatran-boundary`, já em `pnpm check`), que varre padrões
 * específicos da família SENATRAN em todo o monorepo; aqui a varredura é
 * genérica (qualquer cliente HTTP) e escopada a `src/handwritten/**`.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const HANDWRITTEN_DIR = join(HERE, '..', '..', 'src', 'handwritten');

const FORBIDDEN_CLIENTS = [
  /\bfetch\s*\(/u,
  /\bXMLHttpRequest\b/u,
  /\baxios\b/u,
  /\bhttps?\.request\s*\(/u,
  /from ['"]node:https?['"]/u,
  /from ['"]undici['"]/u,
] as const;

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() && /\.(?:[cm]?[jt]s)$/u.test(entry.name)
      ? [path]
      : [];
  });
}

describe('CTG-0003 §5.1 — fronteira SENATRAN em ops-snapshots (C-0003-35, ADR-0003)', () => {
  it('C-0003-35 — dado verify:senatran-boundary sobre @detran/ops-snapshots então nenhum fetch/cliente HTTP fora de packages/senatran-adapter', () => {
    const files = walk(HANDWRITTEN_DIR).filter(
      (file) => !file.endsWith('.spec.ts'),
    );
    const violations: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_CLIENTS) {
        if (pattern.test(source)) {
          violations.push(`${file} matches ${pattern}`);
        }
      }
    }
    expect(
      violations,
      `cliente HTTP fora do adapter (ADR-0003):\n${violations.join('\n')}`,
    ).toEqual([]);
  });
});
