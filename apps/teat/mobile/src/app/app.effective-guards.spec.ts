import { TestBed } from '@angular/core/testing';
import type { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { expect, it } from 'vitest';
import * as bootstrapRuntime from './core/bootstrap.store';
import { authGuard } from './navigation/guards/auth.guard';
import { readinessGuard } from './navigation/guards/readiness.guard';
import { roleGuard } from './navigation/guards/role.guard';
import { shiftGuard } from './navigation/guards/shift.guard';
import { tenantGuard } from './navigation/guards/tenant.guard';
import {
  fixtureAuthenticatedFieldAgent,
  fixtureBootstrapBlocked,
  fixtureBootstrapReady,
  fixtureGrantReady,
  fixtureNoOpenShift,
  fixtureNoPrincipal,
  fixtureNoTenantContext,
  fixtureOpenShift,
  fixtureRoleDenied,
  fixtureRoleContext,
  fixtureTenantContext,
  type GuardContextFixture,
} from '../testing/guard-fixtures';
import {
  TEAT_ROUTE_FIXTURE,
  TEAT_STAFF_ROLES,
  type TeatStaffRole,
} from '../testing/route-contract.fixture';

const route = {} as Route;
const segments: UrlSegment[] = [];
const runtime = bootstrapRuntime as unknown as Record<string, unknown>;

function invoke(guard: CanMatchFn, context: GuardContextFixture): unknown {
  const token = runtime['TEAT_GUARD_CONTEXT'];
  expect(token).toBeDefined();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: token, useValue: context }],
  });
  return TestBed.runInInjectionContext(() =>
    guard(route, segments, {} as Parameters<CanMatchFn>[2]),
  );
}

for (const [name, guard, grant, deny] of [
  ['authGuard', authGuard, fixtureAuthenticatedFieldAgent, fixtureNoPrincipal],
  ['tenantGuard', tenantGuard, fixtureTenantContext, fixtureNoTenantContext],
  ['roleGuard', roleGuard, fixtureGrantReady, fixtureRoleDenied],
  [
    'readinessGuard',
    readinessGuard,
    fixtureBootstrapReady,
    () => fixtureBootstrapBlocked('NORMATIVE_PACKAGE_MISSING'),
  ],
  ['shiftGuard', shiftGuard, fixtureOpenShift, fixtureNoOpenShift],
] as const) {
  it(`dado contexto válido quando ${name} efetivo é invocado então permite`, () => {
    expect(invoke(guard, grant())).toBe(true);
  });
  it(`dado contexto negado quando ${name} efetivo é invocado então nega`, () => {
    expect(invoke(guard, deny())).not.toBe(true);
  });
}

for (const expected of TEAT_ROUTE_FIXTURE) {
  for (const role of TEAT_STAFF_ROLES) {
    const allowedRoles = expected.allowedRoles as readonly TeatStaffRole[];
    const allowed = allowedRoles.includes(role);
    it(`dada /${expected.path} e ${role} quando roleGuard efetivo recebe TEAT_GUARD_CONTEXT então ${allowed ? 'permite' : 'nega'}`, () => {
      expect(invoke(roleGuard, fixtureRoleContext(role, allowedRoles))).toBe(
        allowed,
      );
    });
  }
}
