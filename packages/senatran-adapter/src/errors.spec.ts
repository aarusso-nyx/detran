import { describe, expect, it } from 'vitest';

import {
  SenatranAdapterError,
  isRetryableSenatranError,
  toSenatranError,
} from './errors.js';

describe('SENATRAN error taxonomy', () => {
  it.each([
    [400, 'VALIDATION'],
    [401, 'AUTH'],
    [402, 'BUSINESS'],
    [404, 'NOT_FOUND'],
    [500, 'PROVIDER'],
  ] as const)('maps %s to %s', (status, category) => {
    expect(
      toSenatranError(status, { returnCode: status, message: 'failure' })
        .category,
    ).toBe(category);
  });

  it('extracts the provider code and retries provider failures only', () => {
    const business = toSenatranError(402, {
      returnCode: 402,
      message: 'RENACH.PROCESS.ALREADY_OPEN — duplicate',
    });
    const provider = toSenatranError(500, {
      returnCode: 500,
      message: 'source unavailable',
    });
    expect(business).toBeInstanceOf(SenatranAdapterError);
    expect(business.providerCode).toBe('RENACH.PROCESS.ALREADY_OPEN');
    expect(isRetryableSenatranError(business)).toBe(false);
    expect(isRetryableSenatranError(provider)).toBe(true);
  });
});
