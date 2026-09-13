import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PecUserAdminService } from './pec-user-admin.service.js';

function subject(results: Array<Array<Record<string, unknown>>>) {
  const query = vi.fn();
  for (const rows of results) query.mockResolvedValueOnce({ rows });
  const database = {
    tx: async (work: (transaction: { query: typeof query }) => unknown) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ tenantId: 'tenant-1' }) };
  return {
    service: new PecUserAdminService(database as never, context as never),
    query,
  };
}

describe('PecUserAdminService', () => {
  it('lists only users belonging to the active tenant membership', async () => {
    const { service, query } = subject([
      [{ id: 'user-1', roles: ['AUDITOR'] }],
    ]);
    await expect(service.list({ page: 1, pageSize: 20 })).resolves.toHaveLength(
      1,
    );
    expect(query.mock.calls[0]?.[0]).toContain('join auth.memberships m');
    expect(query.mock.calls[0]?.[0]).toContain('m.tenant_id = $1::uuid');
    expect(query.mock.calls[0]?.[1]).toEqual(['tenant-1', 20, 0]);
  });

  it('creates the kernel user, membership and assigned roles atomically', async () => {
    const { service, query } = subject([
      [{ id: 'role-1', key: 'AUDITOR' }],
      [{ id: 'user-1' }],
      [{ id: 'membership-1' }],
      [],
      [],
      [{ id: 'user-1', roles: ['AUDITOR'] }],
    ]);
    await expect(
      service.create({
        email: ' USER@EXAMPLE.TEST ',
        displayName: ' User ',
        roles: ['AUDITOR'],
      }),
    ).resolves.toMatchObject({ id: 'user-1' });
    expect(query.mock.calls[1]?.[0]).toContain('insert into auth.users');
    expect(query.mock.calls[2]?.[0]).toContain('insert into auth.memberships');
    expect(query.mock.calls[4]?.[0]).toContain(
      'insert into auth.membership_roles',
    );
  });

  it('rejects unknown roles and missing users without weakening identity ownership', async () => {
    const unknownRole = subject([[]]);
    await expect(
      unknownRole.service.create({
        email: 'user@example.test',
        displayName: 'User',
        roles: ['UNKNOWN'],
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);

    const missing = subject([[]]);
    await expect(missing.service.deactivate('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
