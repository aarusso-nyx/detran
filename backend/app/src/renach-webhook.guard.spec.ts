import { createHmac } from 'node:crypto';
import type { ExecutionContext } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { RenachWebhookGuard } from './renach-webhook.guard.js';

const originalSecret = process.env.DETRAN_RENACH_WEBHOOK_SECRET;
const tenantId = '11111111-1111-4111-8111-111111111111';
const eventId = 'event-1';
const rawBody = Buffer.from('{"status":"ACKED"}');

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.DETRAN_RENACH_WEBHOOK_SECRET;
  } else {
    process.env.DETRAN_RENACH_WEBHOOK_SECRET = originalSecret;
  }
});

function requestFor(timestamp: string, signature: string) {
  return {
    headers: {
      'x-detran-tenant-id': tenantId,
      'x-renach-event-id': eventId,
      'x-renach-timestamp': timestamp,
      'x-renach-signature': `sha256=${signature}`,
    },
    rawBody,
  };
}

function contextFor(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => undefined,
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

describe('RenachWebhookGuard', () => {
  it('authenticates the exact body and seeds a tenant-scoped integration principal', () => {
    process.env.DETRAN_RENACH_WEBHOOK_SECRET = 'test-secret';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac('sha256', 'test-secret')
      .update(`${timestamp}.${tenantId}.${eventId}.`)
      .update(rawBody)
      .digest('hex');
    const request = requestFor(timestamp, signature);

    expect(new RenachWebhookGuard().canActivate(contextFor(request))).toBe(
      true,
    );
    expect(request).toMatchObject({
      tenantId,
      principal: {
        roles: ['SYSTEM_INTEGRATION'],
        tenants: [tenantId],
        claims: { source: 'renach-webhook', eventId },
      },
    });
  });

  it('fails closed for an invalid signature', () => {
    process.env.DETRAN_RENACH_WEBHOOK_SECRET = 'test-secret';
    const timestamp = String(Math.floor(Date.now() / 1000));

    expect(() =>
      new RenachWebhookGuard().canActivate(
        contextFor(requestFor(timestamp, '0'.repeat(64))),
      ),
    ).toThrow('Invalid RENACH webhook signature');
  });

  it('rejects replay outside the five-minute clock window', () => {
    process.env.DETRAN_RENACH_WEBHOOK_SECRET = 'test-secret';
    const timestamp = String(Math.floor(Date.now() / 1000) - 301);

    expect(() =>
      new RenachWebhookGuard().canActivate(
        contextFor(requestFor(timestamp, '0'.repeat(64))),
      ),
    ).toThrow('timestamp is outside the allowed window');
  });
});
