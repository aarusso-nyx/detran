import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { describe, expect, it, vi } from 'vitest';

import { PecProcessParametersService } from './pec-process-parameters.service.js';

const tenantId = '11111111-1111-4111-8111-111111111111';
const actorId = '22222222-2222-4222-8222-222222222222';

function harness(settingsRows: Array<Record<string, unknown>> = []) {
  const queue = [...settingsRows];
  const query = vi.fn(async (sql: string, params?: readonly unknown[]) => {
    if (sql.includes('select settings')) {
      const settings = queue.shift();
      return {
        rows: settings ? [{ settings }] : [],
        rowCount: settings ? 1 : 0,
      };
    }
    return { rows: [], rowCount: 1 };
  });
  const tx = vi.fn(
    async (work: (transaction: Transaction) => Promise<unknown>) =>
      work({ query } as unknown as Transaction),
  );
  const context = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId,
      actorId,
      requestId: 'request-1',
      startedAt: new Date(),
    }),
  } as unknown as RequestContext;
  return {
    service: new PecProcessParametersService(
      { tx } as unknown as Database,
      context,
    ),
    query,
    tx,
  };
}

describe('PecProcessParametersService', () => {
  it('AC-PEC-KERNEL-PARAM-1 stores normalized, actor-attributed settings in the reserved document', async () => {
    const { service, query, tx } = harness([{}]);

    await expect(
      service.upsert('  FEATURE.REPORTS.AUTO-SIGN ', {
        value: { default: false, tenants: { [tenantId]: true } },
        description: '  Automatic signing  ',
      }),
    ).resolves.toMatchObject({
      key: 'feature.reports.auto-sign',
      description: 'Automatic signing',
      updatedBy: actorId,
    });

    expect(tx).toHaveBeenCalledWith(expect.any(Function), { role: 'app' });
    expect(query.mock.calls[0]?.[0]).toContain(
      'insert into tenancy.tenant_settings',
    );
    expect(query.mock.calls[1]?.[0]).toContain('for update');
    expect(query.mock.calls[2]?.[0]).toContain(
      "jsonb_build_object('processParameters'",
    );
    const persisted = JSON.parse(query.mock.calls[2]?.[1]?.[0] as string);
    expect(persisted['feature.reports.auto-sign']).toMatchObject({
      value: { default: false, tenants: { [tenantId]: true } },
      updatedBy: actorId,
    });
  });

  it('AC-PEC-KERNEL-PARAM-2 lists only the tenant-scoped persistent document in key order', async () => {
    const { service, query, tx } = harness([
      {
        ch: {
          processParameters: {
            zeta: {
              value: { n: 2 },
              description: null,
              updatedAt: '2026-01-02',
              updatedBy: actorId,
            },
            alpha: {
              value: { n: 1 },
              description: null,
              updatedAt: '2026-01-01',
              updatedBy: actorId,
            },
          },
        },
      },
    ]);

    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({ key: 'alpha' }),
      expect.objectContaining({ key: 'zeta' }),
    ]);
    expect(query.mock.calls[0]?.[0]).toContain('auth.current_tenant()');
    expect(tx).toHaveBeenCalledWith(expect.any(Function), {
      readonly: true,
      role: 'app',
    });
  });

  it('AC-PEC-KERNEL-PARAM-3 evaluates a tenant override from persistent settings', async () => {
    const { service } = harness([
      {
        ch: {
          processParameters: {
            'feature.reports.auto-sign': {
              value: { default: false, tenants: { [tenantId]: true } },
              description: null,
              updatedAt: '2026-01-01',
              updatedBy: actorId,
            },
          },
        },
      },
    ]);

    await expect(service.evaluate('reports.auto-sign', false)).resolves.toEqual(
      {
        flag: 'reports.auto-sign',
        value: true,
        source: 'tenant',
        context: { tenantId },
      },
    );
  });

  it('AC-PEC-KERNEL-PARAM-4 removes under a row lock and rejects missing keys', async () => {
    const stored = {
      ch: {
        processParameters: {
          retained: {
            value: { enabled: true },
            description: null,
            updatedAt: '2026-01-01',
            updatedBy: actorId,
          },
        },
      },
    };
    const success = harness([stored]);
    await expect(success.service.remove(' RETAINED ')).resolves.toEqual({
      key: 'retained',
    });
    expect(success.query.mock.calls[2]?.[1]?.[0]).toBe('{}');

    const missing = harness([{}]);
    await expect(missing.service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('AC-PEC-KERNEL-PARAM-5 rejects invalid keys, values, feature schemas and oversized JSON', async () => {
    const { service } = harness();
    await expect(
      service.upsert('../unsafe', { value: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.upsert('feature.bad', { value: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.upsert('ordinary', { value: { payload: 'x'.repeat(33 * 1024) } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
