import { describe, expect, it } from 'vitest';

import { normalizePaymentStatus } from './client.js';

describe('normalizePaymentStatus', () => {
  it.each([
    ['PAID', 'PAID'],
    ['PENDING', 'PENDING'],
    ['PARTIALLY_PAID', 'PENDING'],
    ['ISSUED', 'PENDING'],
    ['EXPIRED', 'EXPIRED'],
    ['CANCELLED', 'EXPIRED'],
    ['NOT_FOUND', 'NOT_FOUND'],
    ['UNKNOWN', 'ERROR'],
  ] as const)('maps %s to %s', (external, normalized) => {
    expect(normalizePaymentStatus(external)).toBe(normalized);
  });
});
