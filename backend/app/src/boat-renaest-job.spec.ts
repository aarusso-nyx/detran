import { describe, expect, it, vi } from 'vitest';

type JobDependencies = {
  discovery: {
    listEligible: () => Promise<
      ReadonlyArray<{ tenantId: string; actorId: string; timezone: string }>
    >;
  };
  transmission: { runOnce: () => Promise<unknown> };
  requestContext: {
    runWithRequestContext: <T>(
      context: {
        requestId: string;
        tenantId: string;
        actorId: string;
        startedAt: Date;
      },
      work: () => Promise<T>,
    ) => Promise<T>;
  };
  ledger: {
    claim: (tenantId: string, month: string) => Promise<boolean>;
    complete: (tenantId: string, month: string) => Promise<void>;
    fail: (tenantId: string, month: string, code: string) => Promise<void>;
  };
  clock: { now: () => Date };
};

async function loadJobService(): Promise<{
  BoatRenaestJobService: new (dependencies: JobDependencies) => {
    runDue: (now?: Date) => Promise<void>;
  };
}> {
  return import('./boat-renaest-job.service.js') as Promise<{
    BoatRenaestJobService: new (dependencies: JobDependencies) => {
      runDue: (now?: Date) => Promise<void>;
    };
  }>;
}

function dependencies(
  overrides: Partial<JobDependencies> = {},
): JobDependencies {
  return {
    discovery: {
      listEligible: vi.fn().mockResolvedValue([
        {
          tenantId: '00000000-0000-7000-8000-000000000301',
          actorId: '00000000-0000-4000-8000-000000000303',
          timezone: 'America/Manaus',
        },
      ]),
    },
    transmission: { runOnce: vi.fn().mockResolvedValue([]) },
    requestContext: {
      runWithRequestContext: vi.fn(async (_context, work) => work()),
    },
    ledger: {
      claim: vi.fn().mockResolvedValue(true),
      complete: vi.fn().mockResolvedValue(undefined),
      fail: vi.fn().mockResolvedValue(undefined),
    },
    clock: { now: () => new Date('2026-10-01T16:00:00.000Z') },
    ...overrides,
  };
}

describe('T-BOAT-TRANSM scheduler', () => {
  it('dado um tenant elegível quando o mês vence então executa uma vez com o contexto tenant descoberto', async () => {
    const { BoatRenaestJobService } = await loadJobService();
    const deps = dependencies();
    const service = new BoatRenaestJobService(deps);

    await service.runDue(new Date('2026-10-01T16:00:00.000Z'));

    expect(deps.requestContext.runWithRequestContext).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: '00000000-0000-7000-8000-000000000301',
        actorId: '00000000-0000-4000-8000-000000000303',
      }),
      expect.any(Function),
    );
    expect(deps.transmission.runOnce).toHaveBeenCalledTimes(1);
  });

  it('dado dois tenants elegíveis quando a âncora mensal vence então mantém chamadas e contexto isolados', async () => {
    const { BoatRenaestJobService } = await loadJobService();
    const contexts: Array<{ tenantId: string; actorId: string }> = [];
    const deps = dependencies({
      discovery: {
        listEligible: vi.fn().mockResolvedValue([
          {
            tenantId: '00000000-0000-7000-8000-000000000301',
            actorId: '00000000-0000-4000-8000-000000000303',
            timezone: 'America/Manaus',
          },
          {
            tenantId: '00000000-0000-7000-8000-000000000302',
            actorId: '00000000-0000-4000-8000-000000000304',
            timezone: 'America/Sao_Paulo',
          },
        ]),
      },
      requestContext: {
        runWithRequestContext: vi.fn(async (context, work) => {
          contexts.push(context);
          return work();
        }),
      },
    });
    const service = new BoatRenaestJobService(deps);

    await service.runDue(new Date('2026-10-01T16:00:00.000Z'));

    expect(contexts).toEqual([
      {
        tenantId: '00000000-0000-7000-8000-000000000301',
        actorId: '00000000-0000-4000-8000-000000000303',
      },
      {
        tenantId: '00000000-0000-7000-8000-000000000302',
        actorId: '00000000-0000-4000-8000-000000000304',
      },
    ]);
    expect(deps.transmission.runOnce).toHaveBeenCalledTimes(2);
  });

  it('dado um tenant inelegível quando ocorre a descoberta então não transmite nem abre contexto de domínio', async () => {
    const { BoatRenaestJobService } = await loadJobService();
    const deps = dependencies({
      discovery: { listEligible: vi.fn().mockResolvedValue([]) },
    });
    const service = new BoatRenaestJobService(deps);

    await service.runDue(new Date('2026-10-01T16:00:00.000Z'));

    expect(deps.requestContext.runWithRequestContext).not.toHaveBeenCalled();
    expect(deps.transmission.runOnce).not.toHaveBeenCalled();
  });

  it('dado um claim mensal já tomado quando há concorrência então não duplica a chamada nacional', async () => {
    const { BoatRenaestJobService } = await loadJobService();
    const deps = dependencies({
      ledger: {
        claim: vi.fn().mockResolvedValue(false),
        complete: vi.fn().mockResolvedValue(undefined),
        fail: vi.fn().mockResolvedValue(undefined),
      },
    });
    const service = new BoatRenaestJobService(deps);

    await service.runDue(new Date('2026-10-01T16:00:00.000Z'));

    expect(deps.transmission.runOnce).not.toHaveBeenCalled();
    expect(deps.requestContext.runWithRequestContext).not.toHaveBeenCalled();
  });

  it('dado erro de descoberta quando a agenda executa então falha de modo seguro sem tocar o domínio', async () => {
    const { BoatRenaestJobService } = await loadJobService();
    const deps = dependencies({
      discovery: {
        listEligible: vi
          .fn()
          .mockRejectedValue(new Error('discovery unavailable')),
      },
    });
    const service = new BoatRenaestJobService(deps);

    await expect(
      service.runDue(new Date('2026-10-01T16:00:00.000Z')),
    ).rejects.toThrow('discovery unavailable');
    expect(deps.transmission.runOnce).not.toHaveBeenCalled();
  });
});
