import { inject, InjectionToken } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';
import { ReadinessGateService } from '../../core/readiness-gate.service.js';
import type { BoatExtensionPort } from '../../features/sinistro/sinistro.routes.js';

const BOAT_ROUTE_PATHS = new Set([
  'crash-start',
  'crash-location',
  'crash-conditions',
  'crash-vehicles',
  'crash-people',
  'crash-victims',
  'crash-dynamics',
  'crash-sketch',
  'crash-evidence',
  'crash-ait-links',
  'crash-damages',
  'crash-review',
]);

const PRE_SHIFT_ROUTE_PATHS = new Set([
  'shift-context',
  'operation-select',
  'open-shift',
]);

export const TEAT_BOAT_EXTENSION = new InjectionToken<BoatExtensionPort>(
  'TEAT_BOAT_EXTENSION',
  {
    providedIn: 'root',
    factory: () => ({
      installed: () => false,
      load: async () => {
        throw new Error('boat-extension-unavailable');
      },
    }),
  },
);

export async function resolveBoatRoute(
  path: string,
  extension: BoatExtensionPort,
): Promise<
  | Readonly<{ kind: 'loaded'; component: unknown }>
  | Readonly<{ kind: 'unavailable' }>
> {
  if (!BOAT_ROUTE_PATHS.has(path) || !extension.installed()) {
    return { kind: 'unavailable' };
  }
  return { kind: 'loaded', component: await extension.load(path) };
}

export const readinessGuard: CanMatchFn = (route) => {
  const context = inject(TEAT_GUARD_CONTEXT);
  const gate = inject(ReadinessGateService);
  const requiresBoat = String(route.data?.['guardPlan'] ?? '').includes('BOAT');
  const boat = inject(TEAT_BOAT_EXTENSION, { optional: true });
  const result = gate.evaluate({
    bootstrap: context.bootstrap(),
    provisioning: context.provisioning(),
    now: new Date().toISOString(),
    destination: route.path ?? '',
    preShift: PRE_SHIFT_ROUTE_PATHS.has(route.path ?? ''),
  });
  if (!result.allowed) return false;
  if (requiresBoat && boat?.installed() !== true) {
    const router = inject(Router);
    return router.parseUrl(router.url === '/' ? '/auth-login' : router.url);
  }
  return true;
};
