import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, Public, Resource } from '@detran/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  DetranLegacyAuthContextGuard,
  DetranStynxAuthContextGuard,
} from './app.module.js';
import { PORTAL_PUBLIC_ACTOR_ID } from './detran-runtime.js';

/**
 * Hotfix de segurança (Owner, 2026-09-29), iteração 2: autenticação
 * OPORTUNISTA de `POST /v1/portal/manifestations` (CTG-0002 §2.8, OD-P30 —
 * nunca 401/403). Os dois guards do app (`DetranStynxAuthContextGuard`,
 * produção; `DetranLegacyAuthContextGuard`, perfis locais) com `Reflector`
 * real e guard interno dublê que grava um principal do tenant A: com
 * `X-Tenant-Id` do tenant B a requisição tem de sair anônima em B — sem
 * principal/`principalContext`/`user` de A, `portalPublic.tenantId` = B e o
 * ator nulo —, quer o guard interno aceite (`true`), recuse (`false`) ou
 * lance. Controle positivo: `X-Tenant-Id` de A preserva o principal.
 */
const TENANT_A = '00000000-0000-7000-8000-000000000001';
const TENANT_B = '00000000-0000-7000-8000-000000000102';
const CITIZEN = '00000000-0000-4000-8000-000000000002';
const ROUTE = '/v1/portal/manifestations';

@Resource('portal:manifestation')
class ManifestationsDouble {
  @Public()
  @Action('manifest')
  manifest(): void {}
}

type PortalRequest = {
  method: string;
  path: string;
  url: string;
  headers: Record<string, string>;
  principal?: { id: string; tenants: string[] };
  principalContext?: { principal: unknown; tenantId?: string };
  user?: { id: string; tenants: string[] };
  actor?: { id: string };
  tenantId?: string;
  stynxClaims?: { sub: string; tenantId: string };
  portalPublic?: { tenantId: string; actorId: string };
};

type InnerOutcome = 'true' | 'false' | 'throw';

/** Dublê do guard interno: grava a identidade de A e então aceita/recusa/lança. */
function innerGuard(outcome: InnerOutcome): CanActivate {
  return {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<PortalRequest>();
      const principal = {
        id: CITIZEN,
        roles: ['CIDADAO'],
        permissions: [],
        tenants: [TENANT_A],
        claims: { cpf: '22222222222' },
      };
      request.stynxClaims = { sub: CITIZEN, tenantId: TENANT_A };
      request.principal = principal;
      request.principalContext = { principal, tenantId: TENANT_A };
      request.user = { id: CITIZEN, tenants: [TENANT_A] };
      request.actor = { id: CITIZEN };
      request.tenantId = TENANT_A;
      if (outcome === 'throw') throw new Error('tenant sem direito');
      return outcome === 'true';
    },
  };
}

type GuardFactory = (inner: CanActivate) => CanActivate;

const GUARDS: Array<[string, GuardFactory]> = [
  [
    'DetranStynxAuthContextGuard',
    (inner) =>
      new DetranStynxAuthContextGuard(
        new Reflector(),
        inner as never,
        {} as never,
      ),
  ],
  [
    'DetranLegacyAuthContextGuard',
    (inner) =>
      new DetranLegacyAuthContextGuard(new Reflector(), inner as never),
  ],
];

function portalRequest(tenantHeader?: string): PortalRequest {
  return {
    method: 'POST',
    path: ROUTE,
    url: ROUTE,
    headers: {
      authorization: 'Bearer citizen-of-a',
      ...(tenantHeader ? { 'x-tenant-id': tenantHeader } : {}),
    },
  };
}

function execution(request: PortalRequest): ExecutionContext {
  return {
    getClass: () => ManifestationsDouble,
    getHandler: () => ManifestationsDouble.prototype.manifest,
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
      getPattern: () => '',
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

function expectAnonymousIn(request: PortalRequest, tenantId: string): void {
  expect(request.principal).toBeUndefined();
  expect(request.principalContext).toBeUndefined();
  expect(request.user).toBeUndefined();
  expect(request.stynxClaims).toBeUndefined();
  expect(request.tenantId).toBe(tenantId);
  expect(request.actor).toEqual({ id: PORTAL_PUBLIC_ACTOR_ID });
  expect(request.portalPublic).toEqual({
    tenantId,
    actorId: PORTAL_PUBLIC_ACTOR_ID,
  });
}

const saved = {
  profile: process.env.DETRAN_RUNTIME_PROFILE,
  hostResolution: process.env.DETRAN_PORTAL_HOST_RESOLUTION,
};

beforeEach(() => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
});

afterEach(() => {
  if (saved.profile === undefined) delete process.env.DETRAN_RUNTIME_PROFILE;
  else process.env.DETRAN_RUNTIME_PROFILE = saved.profile;
  if (saved.hostResolution === undefined)
    delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
  else process.env.DETRAN_PORTAL_HOST_RESOLUTION = saved.hostResolution;
});

describe.each(GUARDS)(
  'Hotfix — autenticação oportunista de POST manifestations (%s)',
  (_name, guardOf) => {
    it.each<InnerOutcome>(['true', 'false', 'throw'])(
      'dado guard interno que grava principal do tenant A e devolve %s quando POST manifestations com X-Tenant-Id do tenant B então segue anônima em B, sem identidade de A',
      async (outcome) => {
        const request = portalRequest(TENANT_B);
        const guard = guardOf(innerGuard(outcome));
        await expect(guard.canActivate(execution(request))).resolves.toBe(true);
        expectAnonymousIn(request, TENANT_B);
      },
    );

    it('dado guard interno que grava principal do tenant A e devolve true quando POST manifestations com X-Tenant-Id do tenant A então o principal é preservado', async () => {
      const request = portalRequest(TENANT_A);
      const guard = guardOf(innerGuard('true'));
      await expect(guard.canActivate(execution(request))).resolves.toBe(true);
      expect(request.principal).toMatchObject({
        id: CITIZEN,
        tenants: [TENANT_A],
      });
      expect(request.principalContext).toMatchObject({ tenantId: TENANT_A });
      expect(request.user).toMatchObject({ id: CITIZEN });
      expect(request.tenantId).toBe(TENANT_A);
      expect(request.portalPublic).toBeUndefined();
    });

    it('dado guard interno que grava principal do tenant A e devolve true quando POST manifestations sem X-Tenant-Id e sem Host mapeado então o comportamento autenticado não muda', async () => {
      const request = portalRequest();
      const guard = guardOf(innerGuard('true'));
      await expect(guard.canActivate(execution(request))).resolves.toBe(true);
      expect(request.principal).toMatchObject({ id: CITIZEN });
      expect(request.tenantId).toBe(TENANT_A);
      expect(request.portalPublic).toBeUndefined();
    });
  },
);
