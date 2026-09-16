// CTG-0001 §3 (M4) — PortalCitizenGuard, ordem fail-closed das verificações (claims antes do
// papel; nunca consulta principal.permissions). Fica vermelho até TASK-0004 criar
// backend/domains/portal/identity/src/handwritten/citizen.guard.ts (e o index.ts, §12 Layout).
//
// Contexto fake: o acessor do principal na requisição HTTP não é fixado literalmente pelo
// contrato (§3 passo 1 diz "mesmo acessor usado pelo DetranPolicyEvaluator/guard de política do
// STYNX ... o Engineer confirma o acessor"). Evidência já presente no repositório —
// `backend/domains/shared/src/policy.guard.ts:42` usa `getPrincipalFromRequest(request)` de
// `@stynx-nyx/backend`, e `backend/app/src/renach-webhook.guard.ts:71` popula
// `request.principal = {...}` manualmente para o mesmo fim — aponta para `request.principal`
// como o campo subjacente. Este spec usa `request.principal` para construir o `ExecutionContext`
// falso; se o Engineer confirmar um acessor diferente em TASK-0004, é o `ExecutionContext` falso
// deste arquivo que muda, nunca a asserção de comportamento.
import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PortalCitizenGuard, portalIdentityOf } from './index.js';

function contextWith(principal: unknown): {
  context: ExecutionContext;
  request: Record<string, unknown>;
} {
  const request: Record<string, unknown> = {};
  if (principal !== undefined) request.principal = principal;
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getClass: () => class {},
    getHandler: () => function handler() {},
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('PortalCitizenGuard.canActivate (§3, M4) — ordem: claims antes do papel', () => {
  it('C-0001-01 — dado principal undefined quando canActivate então PORTAL.AUTH_REQUIRED 401', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith(undefined);
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.AUTH_REQUIRED', status: 401 }),
    );
  });

  it('C-0001-02 — dado principal CIDADAO sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED 403', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({ roles: ['CIDADAO'], permissions: [] });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({
        code: 'PORTAL.ASSURANCE_NOT_VERIFIED',
        status: 403,
        context: {},
      }),
    );
  });

  it('C-0001-03 — dado CIDADAO com assurance_level "avancada" sem cpf quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['CIDADAO'],
      permissions: [],
      claims: { assurance_level: 'avancada' },
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
    );
  });

  it('C-0001-04 — dado CIDADAO com cpf válido e assurance_level "AVANCADA" (caixa alta) quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['CIDADAO'],
      permissions: [],
      claims: { assurance_level: 'AVANCADA', cpf: '11111111111' },
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
    );
  });

  it('C-0001-05 — dado CIDADAO com assurance_level "simples" e cpf "111.111.111-11" quando canActivate então passa e request.portalIdentity.cpf = "11111111111"', () => {
    const guard = new PortalCitizenGuard();
    const { context, request } = contextWith({
      roles: ['CIDADAO'],
      permissions: [],
      claims: { assurance_level: 'simples', cpf: '111.111.111-11' },
    });
    expect(guard.canActivate(context)).toBe(true);
    expect(portalIdentityOf(request)).toEqual({
      cpf: '11111111111',
      assuranceLevel: 'simples',
    });
  });

  it('C-0001-06 — dado CIDADAO com cpf de 10 dígitos quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['CIDADAO'],
      permissions: [],
      claims: { assurance_level: 'simples', cpf: '1111111111' },
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
    );
  });

  it('C-0001-07 — dado field-agent com claims válidas quando canActivate então PORTAL.IDENTITY_NOT_CITIZEN 403', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['field-agent'],
      permissions: [],
      claims: { assurance_level: 'simples', cpf: '11111111111' },
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({
        code: 'PORTAL.IDENTITY_NOT_CITIZEN',
        status: 403,
        context: {},
      }),
    );
  });

  it('C-0001-08 — dado field-agent sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED (ordem §3: claims antes do papel)', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['field-agent'],
      permissions: [],
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
    );
  });

  it('C-0001-09a — dado technical-admin (permissions [\'*\']) sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED (a política concede "*"; a guarda nega)', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['technical-admin'],
      permissions: ['*'],
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
    );
  });

  it('C-0001-09b — dado technical-admin com claims válidas e sem CIDADAO quando canActivate então PORTAL.IDENTITY_NOT_CITIZEN (guarda nunca consulta principal.permissions)', () => {
    const guard = new PortalCitizenGuard();
    const { context } = contextWith({
      roles: ['technical-admin'],
      permissions: ['*'],
      claims: { assurance_level: 'simples', cpf: '11111111111' },
    });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: 'PORTAL.IDENTITY_NOT_CITIZEN' }),
    );
  });

  it('C-0001-12 — dado portalIdentityOf(request) sem a guarda ter rodado quando chamado então PORTAL.INTERNAL 500', () => {
    expect(() => portalIdentityOf({})).toThrowError(
      expect.objectContaining({ code: 'PORTAL.INTERNAL', status: 500 }),
    );
  });
});
