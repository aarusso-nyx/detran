import { describe, expect, it } from 'vitest';

import { parsePeriodicToxicologyEvent } from './inbound.js';

const valid = {
  driverCpf: '12345678901',
  category: 'D',
  result: 'POSITIVE',
  collectedAt: '2026-06-01T00:00:00.000Z',
  validUntil: '2026-08-30T00:00:00.000Z',
  occurredAt: '2026-06-05T00:00:00.000Z',
  laboratoryCode: 'LAB-001',
  sourceReference: 'RENACH:TOX:123',
  driverAlertStatus: 'SENT',
};

describe('parsePeriodicToxicologyEvent', () => {
  it('normalizes an authenticated-boundary C/D/E event', () => {
    expect(parsePeriodicToxicologyEvent(valid)).toEqual(valid);
  });

  it.each([
    [{ ...valid, category: 'B' }, 'category'],
    [{ ...valid, result: 'INCONCLUSIVE' }, 'result'],
    [{ ...valid, driverCpf: '123' }, 'CPF'],
    [{ ...valid, validUntil: '2026-08-29T00:00:00.000Z' }, '90 days'],
    [{ ...valid, driverAlertStatus: 'DELIVERED_BY_PEC' }, 'alert status'],
  ])('rejects an unsupported payload without coercion', (payload, message) => {
    expect(() => parsePeriodicToxicologyEvent(payload)).toThrow(message);
  });
});
