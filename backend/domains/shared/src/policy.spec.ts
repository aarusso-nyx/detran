import { describe, expect, it, vi } from 'vitest';

import { DETRAN_ROLES, ROLE_ALIASES, canonicalRoles } from './roles.js';
import {
  DETRAN_POLICY_MATRIX,
  isDetranActionAllowed,
  permissionsForRoles,
} from './policy.js';
import { withTenantContext } from './tenant-context.js';

describe('DETRAN unified policy kit', () => {
  it('deduplicates only TEAT auditor into the PEC AUDITOR role', () => {
    expect(DETRAN_ROLES).toHaveLength(24);
    expect(ROLE_ALIASES.auditor).toBe('AUDITOR');
    expect(canonicalRoles(['auditor', 'AUDITOR', 'field-supervisor'])).toEqual([
      'AUDITOR',
      'field-supervisor',
    ]);
  });

  it('keeps every policy key domain namespaced', () => {
    expect(Object.keys(DETRAN_POLICY_MATRIX).length).toBeGreaterThan(140);
    expect(
      Object.keys(DETRAN_POLICY_MATRIX).every(
        (key) => key.split(':').length === 3,
      ),
    ).toBe(true);
  });

  it('preserves PEC, TEAT, and citizen decisions', () => {
    expect(
      isDetranActionAllowed(
        { roles: ['MEDICO'], permissions: [] },
        'ch:encounter',
        'sign',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'ops:evidence',
        'add-custody-event',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'ops:homologation',
        'create',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:ait',
        'finalize',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:ait',
        'accept',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'portal:appeal',
        'create',
      ),
    ).toBe(true);
    expect(permissionsForRoles(['technical-admin'])).toEqual(['*']);
  });

  it('always uses the app role for request-path transactions', async () => {
    const tx = vi.fn(
      async (work: (trx: never) => Promise<string>, options: unknown) => {
        expect(options).toEqual({ readonly: true, role: 'app' });
        return work({} as never);
      },
    );
    const result = await withTenantContext(
      { tx } as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({
          requestId: 'request-1',
          tenantId: 'tenant-1',
          actorId: 'actor-1',
          startedAt: new Date(),
        }),
      },
      async () => 'ok',
      { readonly: true },
    );
    expect(result).toBe('ok');
  });

  it('fails before touching the database when tenant context is missing', async () => {
    const tx = vi.fn();
    await expect(
      withTenantContext(
        { tx } as never,
        { hasActiveContext: () => false, snapshot: () => ({}) as never },
        async () => undefined,
      ),
    ).rejects.toThrow('active request context');
    expect(tx).not.toHaveBeenCalled();
  });
});
