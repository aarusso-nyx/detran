import { expect, it } from 'vitest';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { loadMobileRuntime } from '../testing/runtime-module';
import { fixtureBootstrapReady } from '../testing/guard-fixtures';
import { TEAT_ROUTES } from './app.routes';

async function concreteRoutes() {
  return (
    await Promise.all(
      TEAT_ROUTES.map(
        async (mount) => (await mount.loadChildren?.()) as typeof TEAT_ROUTES,
      ),
    )
  ).flat();
}

it('dado cada rota concreta quando os guardas são registrados então preservam entrada pública e auth, tenant, papel, readiness e turno nesta ordem', async () => {
  const routes = await concreteRoutes();
  expect(routes).toHaveLength(70);
  for (const route of routes) {
    if (route.data?.['featureEnabled'] === false) {
      expect(route.canMatch).toBeUndefined();
      expect(route.redirectTo).toBeTypeOf('function');
      expect(route.loadComponent).toBeUndefined();
      continue;
    }
    const guardPlan = String(route.data?.['guardPlan'] ?? '')
      .split(',')[0]
      .trim();
    expect(
      route.canMatch?.map((guard) =>
        typeof guard === 'function' ? guard.name : guard,
      ),
    ).toEqual([
      ...(guardPlan === 'E'
        ? []
        : [
            'authGuard',
            'tenantGuard',
            'roleGuard',
            ...(guardPlan === 'R' ? [] : ['readinessGuard']),
            ...(guardPlan === 'B+S' ? ['shiftGuard'] : []),
          ]),
    ]);
  }
});

it('dado readiness tipado com campo obrigatório ausente ou sessão não exclusiva quando avaliado então bloqueia fail-closed', async () => {
  const runtime = await loadMobileRuntime('core/readiness-gate.service');
  const Gate = runtime['ReadinessGateService'] as new (diagnostics: {
    record(code: string): void;
  }) => {
    evaluate(input: unknown): {
      readonly allowed: boolean;
      readonly blocked?: boolean;
      readonly blockers: readonly string[];
      readonly warnings: readonly string[];
      readonly validUntil?: string;
    };
  };
  const record = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: runtime['TEAT_READINESS_WARNING_SINK'],
        useValue: { record },
      },
    ],
  });
  const gate = TestBed.inject(Gate);
  const context = fixtureBootstrapReady();
  const ready = {
    bootstrap: context.bootstrap,
    provisioning: context.provisioning,
    now: '2026-09-22T00:00:00Z',
  };
  expect(gate.evaluate(ready)).toMatchObject({
    allowed: true,
    blockers: [],
    warnings: [],
  });
  expect(gate.evaluate({ ...ready, bootstrap: undefined }).allowed).toBe(false);
  expect(gate.evaluate({ ...ready, provisioning: undefined }).allowed).toBe(
    false,
  );
  expect(
    gate.evaluate({
      ...ready,
      bootstrap: context.bootstrap && {
        ...context.bootstrap,
        context: {
          ...context.bootstrap.context,
          session: { ...context.bootstrap.context.session, exclusive: false },
        },
      },
    }).allowed,
  ).toBe(false);

  const expired = gate.evaluate({
    ...ready,
    bootstrap: context.bootstrap && {
      ...context.bootstrap,
      normativePackage: {
        ...context.bootstrap.normativePackage,
        validUntil: '2026-09-21T00:00:00Z',
      },
    },
  });
  expect(expired).toMatchObject({
    allowed: true,
    warnings: expect.arrayContaining(['warning-expired']),
  });
  expect(record).toHaveBeenCalledWith('warning-expired');
});

it('dado FieldShell quando erro normativo é apresentado então expõe ErrorBoundary e a chave i18n TEAT', async () => {
  const runtime = await loadMobileRuntime('core/field-shell.component');
  expect(runtime['FieldShellComponent']).toBeTypeOf('function');
  expect(runtime['MOBILE_ERROR_KEYS']).toMatchObject({
    NORMATIVE_PACKAGE_MISSING: 'teat.errors.normative_package_missing',
  });
});
