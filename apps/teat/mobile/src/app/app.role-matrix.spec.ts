import { expect, it } from 'vitest';
import {
  TEAT_ROUTE_FIXTURE,
  TEAT_STAFF_ROLES,
} from '../testing/route-contract.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';

for (const route of TEAT_ROUTE_FIXTURE) {
  for (const role of TEAT_STAFF_ROLES) {
    const allowed = (route.allowedRoles as readonly string[]).includes(role);
    it(`dada /${route.path} e o papel ${role} quando roleGuard avalia então ${allowed ? 'permite' : 'nega'}`, async () => {
      const runtime = await loadMobileRuntime('navigation/guards/role.guard');
      const canAccessRouteForRole = runtime['canAccessRouteForRole'];
      expect(canAccessRouteForRole).toBeTypeOf('function');
      expect(
        (
          canAccessRouteForRole as (
            role: string,
            allowedRoles: readonly string[],
          ) => boolean
        )(role, route.allowedRoles),
      ).toBe(allowed);
    });
  }
}
