// Article7 Inspector: actual discovery service; no private-method override or DB substitute acceptance claim.
import { describe, expect, it, vi } from 'vitest';
import { DetranError } from '@detran/shared';
import { RaitClaimContextService } from '../../src/handwritten/rait-claim-context.service.js';
import { RaitOperationClock } from '../../src/handwritten/rait-operation-clock.js';

const tenant = '00000000-0000-7000-8000-00000000a001';
const actor = '00000000-0000-4000-8000-0000b0000001';
const pool = '00000000-0000-7000-8000-000010000001';
const foreign = '00000000-0000-7000-8000-000010000002';
for (const scenario of ['unauthenticated', 'readRole', 'foreignPool'] as const)
  it(`R17 ${scenario} discovery denial precedes all global relation locks`, async () => {
    const query = vi.fn(async (sql: string) => ({
      rows: sql.includes('select p.id,p.name')
        ? [
            {
              id: pool,
              name: 'owned',
              instance: 'defesa_previa',
              unit_id: null,
            },
          ]
        : [],
    }));
    const tx = { query };
    const scope = {
      transaction: async (work: (tx: unknown) => Promise<unknown>) => work(tx),
      authenticate: vi.fn(async () => {
        if (scenario === 'unauthenticated')
          throw new DetranError('RAIT.FORBIDDEN_ACTION', { status: 403 });
        return { tenantId: tenant, actorId: actor };
      }),
    };
    const operation = new RaitOperationClock().capture('America/Sao_Paulo');
    const risk = { operation: vi.fn(async () => operation) };
    const service = new RaitClaimContextService(
      scope as never,
      risk as never,
      {} as never,
    );
    const principal =
      scenario === 'unauthenticated'
        ? undefined
        : {
            id: actor,
            tenants: [tenant],
            roles: [
              scenario === 'readRole' ? 'rait-coordinator' : 'rait-analyst',
            ],
          };
    await expect(
      service.read(
        scenario === 'foreignPool' ? { pool_id: foreign } : {},
        principal,
      ),
    ).rejects.toMatchObject({ status: scenario === 'foreignPool' ? 404 : 403 });
    expect(scope.authenticate).toHaveBeenCalledOnce();
    expect(
      query.mock.calls.filter(([sql]) => /^\s*lock\s+table/i.test(sql)),
    ).toEqual([]);
  });
