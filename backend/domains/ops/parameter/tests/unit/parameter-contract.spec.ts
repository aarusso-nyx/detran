import { DETRAN_ROLES, DetranPolicyGuard } from '@detran/shared';
import { StynxError, StynxErrorFilter } from '@stynx-nyx/core';
import { describe, expect, it, vi } from 'vitest';

const TODAY = '2026-09-14';
const TENANT_A = '00000000-0000-7000-8000-00000000a001';
const ACTOR_A = '00000000-0000-4000-8000-0000b0000016';
const TENANT_B = '00000000-0000-7000-8000-00000000a002';
const ACTOR_B = '00000000-0000-4000-8000-0000b0000017';

type Row = Record<string, unknown>;
type QueryResponder = (
  sql: string,
  values: readonly unknown[] | undefined,
) => Row[];

const AGENCY_ADMIN_PERSONA = {
  id: ACTOR_A,
  role: 'agency-admin',
} as const;

function policyContext(
  controllerClass: { prototype: object },
  handler: (...args: never[]) => unknown,
  roles: readonly string[],
): unknown {
  return {
    getClass: () => controllerClass,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
        principal: { roles: [...roles], permissions: [] },
      }),
      getResponse: () => undefined,
      getNext: () => undefined,
    }),
  };
}

const metadataReflector = {
  getAllAndOverride<T>(metadataKey: string, targets: object[]): T | undefined {
    for (const target of targets) {
      const value = Reflect.getMetadata(metadataKey, target) as T | undefined;
      if (value !== undefined) return value;
    }
    return undefined;
  },
  get<T>(metadataKey: string, target: object): T | undefined {
    return Reflect.getMetadata(metadataKey, target) as T | undefined;
  },
};

function infrastructure(rows: Row[] = [], respond?: QueryResponder) {
  const queries: string[] = [];
  const queryValues: Array<readonly unknown[] | undefined> = [];
  const context = { tenantId: TENANT_A, actorId: ACTOR_A };
  let transactionActive = false;
  const cache = {
    invalidate: vi.fn(() => ({ transactionActive })),
  };
  const outbox = {
    append: vi.fn(() => ({ transactionActive })),
  };
  const database = {
    tx: vi.fn(async (work: (tx: unknown) => Promise<unknown>) => {
      transactionActive = true;
      try {
        return await work({
          query: vi.fn(async (sql: string, values?: readonly unknown[]) => {
            queries.push(sql);
            queryValues.push(values);
            return { rows: respond?.(sql, values) ?? rows };
          }),
        });
      } finally {
        transactionActive = false;
      }
    }),
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ ...context }),
  };
  const clock = {
    today: () => TODAY,
    now: () => '2026-09-14T12:00:00.000Z',
  };
  return {
    database,
    requestContext,
    clock,
    cache,
    outbox,
    queries,
    queryValues,
    setContext: (tenantId: string, actorId: string) => {
      context.tenantId = tenantId;
      context.actorId = actorId;
    },
  };
}

async function subjects() {
  return import('../../src/index.js');
}

async function serviceWith(rows: Row[] = [], respond?: QueryResponder) {
  const { OpsParameterService } = await subjects();
  const deps = infrastructure(rows, respond);
  const service = new OpsParameterService(
    deps.database,
    deps.requestContext,
    deps.clock,
    deps.cache,
    deps.outbox,
  );
  return { service, ...deps };
}

describe('OpsParameterService', () => {
  it('dado erro de parâmetro quando lançado então é um StynxError com código e status canônicos', async () => {
    const { OpsParameterError } = await subjects();
    const error = new OpsParameterError('RAIT.VERSION_CONFLICT', 412, {
      key: 'rait.pool.limit',
    });
    expect(error).toBeInstanceOf(StynxError);
    expect(error).toMatchObject({
      code: 'RAIT.VERSION_CONFLICT',
      status: 412,
      context: { key: 'rait.pool.limit' },
    });
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const filter = new StynxErrorFilter({
      get: () => {
        throw new Error('optional provider absent');
      },
    } as never);
    filter.catch(error, {
      switchToHttp: () => ({ getResponse: () => response }),
    } as never);
    expect(response.status).toHaveBeenCalledWith(412);
    expect(response.json).toHaveBeenCalledWith({
      code: 'RAIT.VERSION_CONFLICT',
      message: 'RAIT.VERSION_CONFLICT',
      context: { key: 'rait.pool.limit' },
    });
  });

  it('dado agency, tenant e default vigentes quando get então resolve agency primeiro', async () => {
    const { service } = await serviceWith([
      { scope: 'surface', surface: 'rait', key: 'rait.pool.limit', version: 1 },
      { scope: 'tenant', surface: 'rait', key: 'rait.pool.limit', version: 2 },
      {
        scope: 'agency',
        surface: 'rait',
        key: 'rait.pool.limit',
        traffic_agency_id: '00000000-0000-7000-8000-00000000a101',
        version: 3,
      },
    ]);
    await expect(
      service.get('rait.pool.limit', {
        agencyId: '00000000-0000-7000-8000-00000000a101',
        on: TODAY,
      }),
    ).resolves.toMatchObject({ version: 3 });
  });

  it('dado somente parâmetro agency de outra agência quando get então não o retorna', async () => {
    const { service } = await serviceWith([
      {
        scope: 'agency',
        surface: 'rait',
        key: 'rait.pool.limit',
        traffic_agency_id: '00000000-0000-7000-8000-00000000a102',
        version: 9,
      },
    ]);
    await expect(
      service.get('rait.pool.limit', {
        agencyId: '00000000-0000-7000-8000-00000000a101',
        on: TODAY,
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('dado versões fora da vigência quando get então desempata por effective_from e version', async () => {
    const { service } = await serviceWith([
      { version: 1, effective_from: '2026-01-01', effective_to: '2026-09-13' },
      { version: 2, effective_from: TODAY, effective_to: null },
      { version: 3, effective_from: TODAY, effective_to: null },
    ]);
    await expect(
      service.get('rait.pool.limit', { on: TODAY }),
    ).resolves.toMatchObject({ version: 3 });
  });

  it('dado pending RAIT quando required=true então lança RAIT.PARAMETER_SOURCE_PENDING', async () => {
    const { service } = await serviceWith([
      { source_pending: true, surface: 'rait', key: 'rait.pool.limit' },
    ]);
    await expect(
      service.get('rait.pool.limit', { required: true }),
    ).rejects.toMatchObject({
      code: 'RAIT.PARAMETER_SOURCE_PENDING',
      context: { key: 'rait.pool.limit' },
    });
  });

  it('dado pending quando required=false então retorna o parâmetro', async () => {
    const { service } = await serviceWith([
      { source_pending: true, surface: 'rait', key: 'rait.pool.limit' },
    ]);
    await expect(
      service.get('rait.pool.limit', { required: false }),
    ).resolves.toBeDefined();
  });

  it('dado cada prefixo canônico quando get então deriva a surface correspondente', async () => {
    const { service } = await serviceWith([{ version: 1 }]);
    for (const key of [
      'rait.pool.limit',
      'collection.x',
      'deadline.x',
      'session.x',
      'teat.sync.x',
      'portal.privacy.x',
      'est.x',
      'dashboard.x',
    ]) {
      await expect(service.get(key)).resolves.toBeDefined();
    }
    await expect(service.get('unknown.x')).rejects.toBeDefined();
  });

  it.each([
    ['legal_readonly', 'RAIT.PARAMETER_LEGAL_READONLY'],
    ['effective_from', 'RAIT.PARAMETER_EFFECTIVE_DATE_PAST'],
  ])('dado %s inválido quando PUT então lança %s', async (field, code) => {
    const { service } = await serviceWith([
      { legal_readonly: field === 'legal_readonly', version: 1 },
    ]);
    await expect(
      service.put(
        'rait.pool.limit',
        {
          value: 2,
          valueType: 'integer',
          reason: 'OD-001',
          decisionRef: 'OD-001',
          effectiveFrom: field === 'effective_from' ? '2026-09-13' : TODAY,
        },
        { ifMatch: '1', idempotencyKey: 'idem-1' },
      ),
    ).rejects.toMatchObject({ code });
  });

  it('dado If-Match ausente quando PUT então lança 428', async () => {
    const { service } = await serviceWith([{ version: 1 }]);
    await expect(
      service.put(
        'rait.pool.limit',
        {
          value: 2,
          valueType: 'integer',
          reason: 'OD-001',
          decisionRef: 'OD-001',
          effectiveFrom: TODAY,
        },
        { idempotencyKey: 'idem-1' },
      ),
    ).rejects.toMatchObject({ code: 'RAIT.IF_MATCH_REQUIRED' });
  });

  it('dado If-Match divergente quando PUT então lança 412', async () => {
    const { service } = await serviceWith([{ version: 2 }]);
    await expect(
      service.put(
        'rait.pool.limit',
        {
          value: 2,
          valueType: 'integer',
          reason: 'OD-001',
          decisionRef: 'OD-001',
          effectiveFrom: TODAY,
        },
        { ifMatch: '1', idempotencyKey: 'idem-1' },
      ),
    ).rejects.toMatchObject({ code: 'RAIT.VERSION_CONFLICT' });
  });

  it.each(['*', '"02"', 'W/2', '"2", "3"'])(
    'dado If-Match inválido %s quando PUT então falha fechado',
    async (ifMatch) => {
      const { service, database } = await serviceWith([{ version: 2 }]);
      await expect(
        service.put(
          'rait.pool.limit',
          {
            value: 2,
            valueType: 'integer',
            reason: 'OD-001',
            decisionRef: 'OD-001',
            effectiveFrom: TODAY,
          },
          { ifMatch, idempotencyKey: 'idem-1' },
        ),
      ).rejects.toMatchObject({ status: 400 });
      expect(database.tx).not.toHaveBeenCalled();
    },
  );

  it('dado mesma chave de idempotência em tenants distintos quando PUT então não há replay local entre tenants', async () => {
    const { service, outbox, cache, setContext } = await serviceWith([
      { version: 1 },
    ]);
    const input = {
      value: 2,
      valueType: 'integer',
      reason: 'OD-001',
      decisionRef: 'OD-001',
      effectiveFrom: TODAY,
    };
    await service.put('rait.pool.limit', input, {
      ifMatch: '1',
      idempotencyKey: 'idem-1',
    });
    setContext(TENANT_B, ACTOR_B);
    await service.put('rait.pool.limit', input, {
      ifMatch: '1',
      idempotencyKey: 'idem-1',
    });
    expect(outbox.append).toHaveBeenCalledTimes(2);
    expect(cache.invalidate).toHaveBeenNthCalledWith(
      1,
      TENANT_A,
      'rait.pool.limit',
    );
    expect(cache.invalidate).toHaveBeenNthCalledWith(
      2,
      TENANT_B,
      'rait.pool.limit',
    );
  });

  it('dado surface divergente no payload quando PUT então rejeita antes de escrever', async () => {
    const { service, database } = await serviceWith([{ version: 1 }]);
    await expect(
      service.put(
        'rait.pool.limit',
        {
          value: 2,
          valueType: 'integer',
          reason: 'OD-001',
          decisionRef: 'OD-001',
          effectiveFrom: TODAY,
          surface: 'teat',
        },
        { ifMatch: '1', idempotencyKey: 'idem-1' },
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(database.tx).not.toHaveBeenCalled();
  });

  it('dado parâmetro legal readonly no tenant quando PUT muda scope e agência então bloqueia antes do alvo mutável', async () => {
    const { service, queries, queryValues } = await serviceWith([], (sql) =>
      sql.includes('legal_readonly = true')
        ? [{ legal_readonly: true, scope: 'tenant' }]
        : [{ legal_readonly: false, version: 1, scope: 'agency' }],
    );
    await expect(
      service.put(
        'rait.pool.limit',
        {
          value: 2,
          valueType: 'integer',
          reason: 'OD-001',
          decisionRef: 'OD-001',
          effectiveFrom: TODAY,
          scope: 'agency',
          trafficAgencyId: '00000000-0000-7000-8000-00000000a101',
        },
        { ifMatch: '1', idempotencyKey: 'idem-1' },
      ),
    ).rejects.toMatchObject({ code: 'RAIT.PARAMETER_LEGAL_READONLY' });
    expect(queries).toHaveLength(1);
    expect(queries[0]).toContain('legal_readonly = true');
    expect(queryValues[0]).toEqual(['rait.pool.limit', 'rait']);
  });

  it('dado alteração válida quando PUT então cria versão, outbox e cache somente tenant/key na mesma tx', async () => {
    const { service, database, outbox, cache, queries } = await serviceWith([
      { version: 1, key: 'rait.pool.limit' },
    ]);
    const result = await service.put(
      'rait.pool.limit',
      {
        value: 2,
        valueType: 'integer',
        reason: 'OD-001',
        decisionRef: 'OD-001',
        effectiveFrom: TODAY,
      },
      { ifMatch: '1', idempotencyKey: 'idem-1' },
    );
    expect(result).toMatchObject({ version: 2 });
    expect(database.tx).toHaveBeenCalledTimes(1);
    expect(queries.some((sql) => /insert/i.test(sql))).toBe(true);
    expect(outbox.append).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARAMETRO_ALTERADO',
        tenantId: TENANT_A,
        key: 'rait.pool.limit',
      }),
    );
    expect(cache.invalidate).toHaveBeenCalledWith(TENANT_A, 'rait.pool.limit');
    expect(outbox.append.mock.results[0]?.value).toEqual({
      transactionActive: true,
    });
  });

  it('dado tenant_id no payload quando PUT então rejeita o campo', async () => {
    const { service } = await serviceWith([{ version: 1 }]);
    await expect(
      service.put(
        'rait.pool.limit',
        {
          value: 2,
          valueType: 'integer',
          reason: 'OD-001',
          decisionRef: 'OD-001',
          effectiveFrom: TODAY,
          tenant_id: 'forbidden',
        },
        { ifMatch: '1', idempotencyKey: 'idem-1' },
      ),
    ).rejects.toBeDefined();
  });
});

describe('ParameterCommandController', () => {
  const guard = new DetranPolicyGuard(metadataReflector as never);

  it('dado a persona canônica agency-admin quando PUT então o guard concede e o endpoint encaminha o comando', async () => {
    const { ParameterCommandController } = await subjects();
    const service = { put: vi.fn().mockResolvedValue({ version: 2 }) };
    const controller = new ParameterCommandController(service as never);
    const response = { setHeader: vi.fn() };
    expect(
      guard.canActivate(
        policyContext(
          ParameterCommandController,
          ParameterCommandController.prototype.update,
          [AGENCY_ADMIN_PERSONA.role],
        ) as never,
      ),
    ).toBe(true);
    await expect(
      controller.update(
        'rait.pool.limit',
        { value: 2 },
        '1',
        'idem-1',
        response,
      ),
    ).resolves.toMatchObject({ version: 2 });
    expect(service.put).toHaveBeenCalledWith(
      'rait.pool.limit',
      { value: 2 },
      { ifMatch: '1', idempotencyKey: 'idem-1' },
    );
    expect(response.setHeader).toHaveBeenCalledWith('ETag', '"2"');
  });

  it('dado resultado da versão 2 quando PUT então ETag alimenta If-Match quoted ou weak e mismatch falha', async () => {
    const { ParameterCommandController } = await subjects();
    const response = { setHeader: vi.fn() };
    const controller = new ParameterCommandController({
      put: vi.fn().mockResolvedValue({ version: 2 }),
    } as never);
    const result = await controller.update(
      'rait.pool.limit',
      { value: 2 },
      '1',
      'idem-1',
      response,
    );
    const etag = response.setHeader.mock.calls[0]?.[1];
    expect(etag).toBe(`"${result.version}"`);

    const input = {
      value: 3,
      valueType: 'integer',
      reason: 'OD-001',
      decisionRef: 'OD-001',
      effectiveFrom: TODAY,
    };
    const quoted = await serviceWith([{ version: result.version }]);
    await expect(
      quoted.service.put('rait.pool.limit', input, {
        ifMatch: etag,
        idempotencyKey: 'idem-quoted',
      }),
    ).resolves.toMatchObject({ version: 3 });

    const weak = await serviceWith([{ version: result.version }]);
    await expect(
      weak.service.put('rait.pool.limit', input, {
        ifMatch: `W/${etag}`,
        idempotencyKey: 'idem-weak',
      }),
    ).resolves.toMatchObject({ version: 3 });

    const mismatch = await serviceWith([{ version: result.version }]);
    await expect(
      mismatch.service.put('rait.pool.limit', input, {
        ifMatch: '"1"',
        idempotencyKey: 'idem-mismatch',
      }),
    ).rejects.toMatchObject({ code: 'RAIT.VERSION_CONFLICT' });
  });

  it.each(DETRAN_ROLES.filter((role) => role !== 'agency-admin'))(
    'dado o papel canônico %s sem o grant de agency-admin quando PUT então o guard responde 403',
    async (role) => {
      const { ParameterCommandController } = await subjects();
      expect(() =>
        guard.canActivate(
          policyContext(
            ParameterCommandController,
            ParameterCommandController.prototype.update,
            [role],
          ) as never,
        ),
      ).toThrowError(expect.objectContaining({ status: 403 }));
    },
  );
});
