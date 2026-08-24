import { createHash } from 'node:crypto';

export function deterministicIdempotencyKey(
  surface: string,
  operation: string,
  input: unknown,
): string {
  const digest = createHash('sha256').update(stableJson(input)).digest('hex');
  return `detran:${surface}:${operation}:${digest}`;
}

export function stableJson(value: unknown): string {
  return JSON.stringify(canonical(value));
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonical(entry)]),
  );
}
