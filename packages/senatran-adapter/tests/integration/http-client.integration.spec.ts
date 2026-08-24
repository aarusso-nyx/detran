import { createServer, type Server } from 'node:http';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { SenatranClient } from '../../src/client.js';
import { SenatranAdapterError } from '../../src/errors.js';
import { mockSenatranConfig } from '../../src/test-kit.js';

describe('SENATRAN HTTP integration behavior', () => {
  let server: Server;
  let baseUrl: string;
  let retries = 0;
  const observedHeaders: Array<Record<string, string | string[] | undefined>> =
    [];

  beforeAll(async () => {
    server = createServer((request, response) => {
      observedHeaders.push(request.headers);
      if (request.url === '/retry' && retries++ < 2) {
        response.writeHead(500, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ returnCode: 500, message: 'temporary' }));
        return;
      }
      if (request.url === '/auth-error') {
        response.writeHead(401, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ returnCode: 401, message: 'denied' }));
        return;
      }
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: true }));
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No test server address');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it('retries a live HTTP endpoint and recovers on the third attempt', async () => {
    const sleep = vi.fn(async () => undefined);
    const client = new SenatranClient(mockSenatranConfig(baseUrl), { sleep });
    await expect(
      client.request({
        surface: 'renaest',
        operation: 'retry-live',
        method: 'GET',
        path: '/retry',
      }),
    ).resolves.toEqual({ ok: true });
    expect(retries).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('sends both mock authentication factors', async () => {
    const client = new SenatranClient(mockSenatranConfig(baseUrl));
    await client.request({
      surface: 'renach',
      operation: 'auth-live',
      method: 'GET',
      path: '/ok',
    });
    expect(observedHeaders.at(-1)).toMatchObject({
      'x-cpf-usuario': '12345678909',
      'x-client-cert-cn': 'senatran-dev-client',
    });
  });

  it('sends a deterministic idempotency key on a live write', async () => {
    const client = new SenatranClient(mockSenatranConfig(baseUrl));
    await client.request({
      surface: 'sne',
      operation: 'write-live',
      method: 'POST',
      path: '/write',
      body: { aitNumber: 'A1' },
      write: true,
    });
    expect(observedHeaders.at(-1)?.['idempotency-key']).toMatch(
      /^detran:sne:write-live:[a-f0-9]{64}$/u,
    );
  });

  it('maps a live authentication envelope without retrying', async () => {
    const client = new SenatranClient(mockSenatranConfig(baseUrl));
    const error = await client
      .request({
        surface: 'cdt',
        operation: 'auth-error',
        method: 'GET',
        path: '/auth-error',
      })
      .catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(SenatranAdapterError);
    expect(error).toMatchObject({ category: 'AUTH', returnCode: 401 });
  });
});
