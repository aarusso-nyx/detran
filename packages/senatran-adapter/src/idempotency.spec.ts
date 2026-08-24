import { describe, expect, it } from 'vitest';

import { deterministicIdempotencyKey, stableJson } from './idempotency.js';

describe('deterministic write idempotency', () => {
  it('is independent of object key insertion order', () => {
    expect(stableJson({ b: 2, a: { y: 2, x: 1 } })).toBe(
      stableJson({ a: { x: 1, y: 2 }, b: 2 }),
    );
  });

  it('namespaces the digest by surface and operation', () => {
    const key = deterministicIdempotencyKey('renach', 'open-process', {
      cpf: '52998224725',
    });
    expect(key).toMatch(/^detran:renach:open-process:[a-f0-9]{64}$/u);
  });
});
