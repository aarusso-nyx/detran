import { describe, expect, it, vi } from 'vitest';

import { SenatranClient } from './client.js';
import {
  SenatranAdapterError,
  SenatranFeatureDisabledError,
} from './errors.js';
import { mockSenatranConfig } from './test-kit.js';
import type {
  SenatranTransport,
  SenatranTransportRequest,
  SenatranTransportResponse,
} from './transport.js';

class FakeTransport implements SenatranTransport {
  readonly inputs: SenatranTransportRequest[] = [];

  constructor(private readonly responses: SenatranTransportResponse[]) {}

  async request(
    input: SenatranTransportRequest,
  ): Promise<SenatranTransportResponse> {
    this.inputs.push(input);
    const response = this.responses.shift();
    if (!response) throw new Error('No fake response');
    return response;
  }
}

describe('SenatranClient resilience and auth', () => {
  it('uses mock auth headers only in mock mode', async () => {
    const transport = new FakeTransport([ok({ value: 1 })]);
    const client = new SenatranClient(mockSenatranConfig(), { transport });
    await client.request({
      surface: 'renach',
      operation: 'read',
      method: 'GET',
      path: '/v1/test',
    });
    expect(transport.inputs[0]?.headers).toMatchObject({
      'x-cpf-usuario': '12345678909',
      'x-client-cert-cn': 'senatran-dev-client',
    });
  });

  it('retries provider failures with the enabled policy', async () => {
    const transport = new FakeTransport([
      failure(500),
      failure(500),
      ok({ recovered: true }),
    ]);
    const sleep = vi.fn(async () => undefined);
    const client = new SenatranClient(mockSenatranConfig(), {
      transport,
      sleep,
    });
    await expect(
      client.request({
        surface: 'renaest',
        operation: 'read',
        method: 'GET',
        path: '/v1/test',
      }),
    ).resolves.toEqual({ recovered: true });
    expect(transport.inputs).toHaveLength(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('does not retry business failures', async () => {
    const transport = new FakeTransport([failure(402)]);
    const client = new SenatranClient(mockSenatranConfig(), { transport });
    await expect(
      client.request({
        surface: 'renach',
        operation: 'write',
        method: 'POST',
        path: '/v1/test',
        body: {},
        write: true,
      }),
    ).rejects.toBeInstanceOf(SenatranAdapterError);
    expect(transport.inputs).toHaveLength(1);
  });

  it('deduplicates writes and sends the same deterministic header', async () => {
    const transport = new FakeTransport([ok({ protocol: 'one' })]);
    const client = new SenatranClient(mockSenatranConfig(), { transport });
    const request = {
      surface: 'sne' as const,
      operation: 'notify',
      method: 'POST' as const,
      path: '/v1/test',
      body: { b: 2, a: 1 },
      write: true,
    };
    await expect(client.request(request)).resolves.toEqual({ protocol: 'one' });
    await expect(client.request(request)).resolves.toEqual({ protocol: 'one' });
    expect(transport.inputs).toHaveLength(1);
    expect(transport.inputs[0]?.headers['Idempotency-Key']).toMatch(
      /^detran:sne:notify:/u,
    );
  });

  it('fails before transport when a real surface is disabled', async () => {
    const transport = new FakeTransport([]);
    const config = mockSenatranConfig();
    const client = new SenatranClient(
      {
        ...config,
        provider: 'real',
        features: { ...config.features, renach: false },
        simulatedClientCertificateCn: undefined,
      },
      { transport },
    );
    await expect(
      client.request({
        surface: 'renach',
        operation: 'read',
        method: 'GET',
        path: '/v1/test',
      }),
    ).rejects.toBeInstanceOf(SenatranFeatureDisabledError);
    expect(transport.inputs).toHaveLength(0);
  });
});

function ok(body: unknown): SenatranTransportResponse {
  return { status: 200, headers: {}, body: JSON.stringify(body) };
}

function failure(status: number): SenatranTransportResponse {
  return {
    status,
    headers: {},
    body: JSON.stringify({
      returnCode: status,
      message:
        status === 402
          ? 'RENACH.PROCESS.ALREADY_OPEN — duplicate'
          : 'provider down',
    }),
  };
}
