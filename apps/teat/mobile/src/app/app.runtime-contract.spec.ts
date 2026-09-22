import { expect, it } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';
import { TEAT_ROUTES } from './app.routes';

it('dado cada rota quando os guardas são registrados então preservam auth, tenant, papel, readiness e turno nesta ordem', () => {
  expect(TEAT_ROUTES).toHaveLength(70);
  for (const route of TEAT_ROUTES) {
    const guardPlan = String(route.data?.['guardPlan'] ?? '')
      .split(',')[0]
      .trim();
    expect(
      route.canMatch?.map((guard) =>
        typeof guard === 'function' ? guard.name : guard,
      ),
    ).toEqual([
      'authGuard',
      'tenantGuard',
      'roleGuard',
      ...(guardPlan === 'R' ? [] : ['readinessGuard']),
      ...(guardPlan === 'B+S' ? ['shiftGuard'] : []),
    ]);
  }
});

it('dado readiness sem sessão exclusiva ou pacote normativo quando avaliada então bloqueia a rota', async () => {
  const runtime = await loadMobileRuntime('core/readiness-gate.service');
  const evaluateReadiness = runtime['evaluateReadiness'];
  expect(evaluateReadiness).toBeTypeOf('function');
  const evaluate = evaluateReadiness as (input: Record<string, boolean>) => {
    readonly blocked: boolean;
  };
  expect(
    evaluate({ sessionExclusive: false, normativePackagePresent: true })
      .blocked,
  ).toBe(true);
  expect(
    evaluate({ sessionExclusive: true, normativePackagePresent: false })
      .blocked,
  ).toBe(true);
});

it('dada homologação expirada com os demais requisitos presentes quando readiness é avaliada então avisa e registra sem bloquear', async () => {
  const runtime = await loadMobileRuntime('core/readiness-gate.service');
  const evaluate = runtime['evaluateReadiness'] as (
    input: Record<string, boolean>,
  ) => {
    readonly blocked: boolean;
    readonly warnings: readonly string[];
  };
  const result = evaluate({
    sessionExclusive: true,
    normativePackagePresent: true,
    homologationExpired: true,
  });
  expect(result.blocked).toBe(false);
  expect(result.warnings).toContain('homologation-expired');
});

it('dado posture completo, grant, reserva, turno e validUntil quando readiness é avaliada então bloqueia cada falha e registra warning-expired sem inventar sucesso', async () => {
  const runtime = await loadMobileRuntime('core/readiness-gate.service');
  const evaluate = runtime['evaluateReadiness'] as (
    input: Record<string, boolean | string>,
  ) => {
    readonly blocked: boolean;
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
    readonly validUntil: string;
  };
  const ready = {
    sessionExclusive: true,
    deviceAuthorized: true,
    deviceHomologated: true,
    deviceTamperDetected: false,
    normativePackagePresent: true,
    grantReady: true,
    numberingReservationPresent: true,
    shiftOpen: true,
    validUntil: '2999-01-01T00:00:00Z',
    homologationExpired: true,
  };
  expect(evaluate(ready)).toMatchObject({
    blocked: false,
    blockers: [],
    warnings: expect.arrayContaining(['warning-expired']),
    validUntil: ready.validUntil,
  });
  for (const denied of [
    'deviceAuthorized',
    'deviceHomologated',
    'normativePackagePresent',
    'grantReady',
    'numberingReservationPresent',
    'shiftOpen',
  ] as const) {
    expect(evaluate({ ...ready, [denied]: false })).toMatchObject({
      blocked: true,
      blockers: expect.any(Array),
    });
  }
});

it('dado FieldShell quando erro normativo é apresentado então expõe ErrorBoundary e a chave i18n TEAT', async () => {
  const runtime = await loadMobileRuntime('core/field-shell.component');
  expect(runtime['FieldShellComponent']).toBeTypeOf('function');
  expect(runtime['MOBILE_ERROR_KEYS']).toMatchObject({
    NORMATIVE_PACKAGE_MISSING: 'teat.errors.normative_package_missing',
  });
});
