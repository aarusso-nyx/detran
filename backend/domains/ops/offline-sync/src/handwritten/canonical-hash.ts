// CTG-0002 §4.2 (R-0008, TASK-0005) — hash canônico do payload de um item de
// sincronização: `sha256` do JSON com chaves ordenadas recursivamente e sem
// espaços, prefixado `sha256:` como nas fixtures. É a mesma `stableJson` que
// `contentHashForAit` usa em `ait-lifecycle.service.ts`.
import { createHash } from 'node:crypto';

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function canonicalHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
}
