import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, Resource } from '@detran/shared';
import { describe, expect, it, vi } from 'vitest';

import { DetranStynxAuthContextGuard } from './app.module.js';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';
const OTHER_ACTOR = '00000000-0000-4000-8000-0000b0000008';

type Principal = {
  id: string;
  roles: string[];
  permissions: string[];
  tenants: string[];
};
type Request = {
  path: string;
  tenantId: string;
  principal?: Principal;
  actor?: { id: string };
};
type RoleRead = {
  withRequestContext(
    scope: { tenantId: string; actorId: string },
    work: () => Promise<boolean>,
  ): Promise<boolean>;
  tx(
    work: (transaction: {
      query(
        sql: string,
        values: readonly unknown[],
      ): Promise<{ rows: unknown[] }>;
    }) => Promise<boolean>,
    options: unknown,
  ): Promise<boolean>;
  withSystemContext(
    reason: string,
    work: () => Promise<boolean>,
  ): Promise<boolean>;
};
type FullAuthGuard = new (
  reflector: Reflector,
  inner: CanActivate,
  database: RoleRead,
) => CanActivate;

@Resource('inf:rait-case')
class ProtocolController {
  @Action('protocol')
  protocol(): void {}
}

@Resource('inf:rait-case')
class OtherRaitController {
  @Action('admit')
  admit(): void {}
}

function execution(
  request: Request,
  controller: object = ProtocolController,
  handler: (...args: never[]) => unknown = ProtocolController.prototype
    .protocol as (...args: never[]) => unknown,
): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({
      getContext: () => undefined,
      getData: () => undefined,
    }),
    switchToWs: () => ({
      getClient: () => undefined,
      getData: () => undefined,
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

function roleRead(
  rows: unknown[] = [],
  failure?: Error,
  contextFailure?: Error,
) {
  let activeScope: { tenantId: string; actorId: string } | undefined;
  const query = vi.fn(async (_sql: string, _values: readonly unknown[]) => {
    if (failure) throw failure;
    return { rows };
  });
  const tx = vi.fn(async (work, _options) => {
    if (!activeScope) throw new Error('request context is required for app tx');
    return work({ query });
  });
  const withRequestContext = vi.fn(async (scope, work) => {
    if (contextFailure) throw contextFailure;
    activeScope = scope;
    try {
      return await work();
    } finally {
      activeScope = undefined;
    }
  });
  const withSystemContext = vi.fn();
  return {
    database: { tx, withRequestContext, withSystemContext } as RoleRead,
    query,
    tx,
    withRequestContext,
    withSystemContext,
  };
}

function request(overrides: Partial<Request> = {}): Request {
  return {
    path: '/v1/inf/rait/cases',
    tenantId: TENANT,
    principal: {
      id: ACTOR,
      roles: [],
      permissions: [],
      tenants: [TENANT],
    },
    ...overrides,
  };
}

function subject(read: RoleRead, inner = vi.fn(() => true)): CanActivate {
  return new (DetranStynxAuthContextGuard as unknown as FullAuthGuard)(
    new Reflector(),
    { canActivate: inner } as CanActivate,
    read,
  );
}

describe('CTG-0001 C4 §3 — papéis canônicos de protocolo no full-auth', () => {
  it.each([
    ['direto', [{ role: 'rait-secretary' }]],
    ['por grupo', [{ role: 'rait-secretary' }]],
  ])(
    'dado membership ativo %s quando protocolo full-auth é autorizado então aplica secretary canônico do banco',
    async (_source, rows) => {
      const read = roleRead(rows);
      const current = request();
      const guard = subject(read.database);

      expect(await guard.canActivate(execution(current))).toBe(true);
      expect.soft(current.principal?.roles).toEqual(['rait-secretary']);
      expect
        .soft(read.withRequestContext)
        .toHaveBeenCalledWith(
          { tenantId: TENANT, actorId: ACTOR },
          expect.any(Function),
        );
      expect
        .soft(read.tx)
        .toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({ role: 'app', readonly: true }),
        );
      expect.soft(read.withSystemContext).not.toHaveBeenCalled();
      expect.soft(read.query).toHaveBeenCalledTimes(1);
      const contextOrder = read.withRequestContext.mock.invocationCallOrder[0];
      const txOrder = read.tx.mock.invocationCallOrder[0];
      if (contextOrder !== undefined && txOrder !== undefined)
        expect.soft(contextOrder).toBeLessThan(txOrder);
      const call = read.query.mock.calls[0];
      if (call) {
        const [sql, values] = call;
        expect.soft(sql).toContain('auth.memberships');
        expect.soft(sql).toContain('auth.membership_roles');
        expect.soft(sql).toContain('auth.group_memberships');
        expect.soft(sql).toContain('auth.group_roles');
        expect.soft(sql).toContain('auth.roles');
        expect.soft(sql).toContain('m.is_active');
        expect.soft(sql).toContain('m.tenant_id');
        expect.soft(sql).toContain('$1');
        expect.soft(sql).toContain('$2');
        expect.soft(values).toEqual([TENANT, ACTOR]);
      }
    },
  );

  const denialCases: ReadonlyArray<
    readonly [string, unknown[], string[]?, { id: string }?, Error?]
  > = [
    ['membership inativo', [], undefined],
    ['membership revogado', [], undefined],
    [
      'membership de outro tenant',
      [{ role: 'rait-secretary', tenant_id: OTHER_TENANT }],
      undefined,
    ],
    ['permission específica sem secretary', [], ['inf:rait-case:protocol']],
    ['wildcard sem secretary', [], ['*']],
    ['ADMIN sem secretary', [{ role: 'ADMIN' }], []],
    ['principal ausente', [], undefined, undefined],
    ['principal divergente', [], undefined, { id: OTHER_ACTOR }],
    ['erro de banco', [], undefined, undefined, new Error('role-read-failed')],
  ];

  it.each(denialCases)(
    'dado %s quando protocolo full-auth é avaliado então nega sem fallback permissivo',
    async (...args) => {
      const [_caseName, rows, permissions, actor, failure] = args as [
        string,
        unknown[],
        string[]?,
        { id: string }?,
        Error?,
      ];
      const read = roleRead(rows, failure);
      const current = request({
        principal: actor
          ? { id: ACTOR, roles: [], permissions: [], tenants: [TENANT] }
          : request().principal,
        ...(permissions
          ? { principal: { ...request().principal!, permissions } }
          : {}),
        ...(actor ? { actor } : {}),
      });
      if (_caseName === 'principal ausente') delete current.principal;
      const guard = subject(read.database);

      expect(await guard.canActivate(execution(current))).toBe(false);
      expect.soft(current.principal?.roles ?? []).toEqual([]);
    },
  );

  it('dado falha ao instalar contexto verificado quando protocolo full-auth é avaliado então nega sem abrir transação', async () => {
    const read = roleRead([], undefined, new Error('request-context-failed'));
    const current = request();
    const guard = subject(read.database);

    expect(await guard.canActivate(execution(current))).toBe(false);
    expect
      .soft(read.withRequestContext)
      .toHaveBeenCalledWith(
        { tenantId: TENANT, actorId: ACTOR },
        expect.any(Function),
      );
    expect.soft(read.tx).not.toHaveBeenCalled();
    expect.soft(current.principal?.roles).toEqual([]);
  });

  it('dado rota RAIT diferente de protocolo quando full-auth é avaliado então não consulta papéis adicionais', async () => {
    const read = roleRead([{ role: 'rait-secretary' }]);
    const current = request();
    const guard = subject(read.database);

    expect(
      await guard.canActivate(
        execution(
          current,
          OtherRaitController,
          OtherRaitController.prototype.admit as (...args: never[]) => unknown,
        ),
      ),
    ).toBe(true);
    expect(read.query).not.toHaveBeenCalled();
  });
});
