import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';

export function canAccessRouteForRole(
  role: string,
  allowedRoles: readonly string[],
): boolean {
  return allowedRoles.includes(role);
}

export const roleGuard: CanMatchFn = (route) => {
  const context = inject(TEAT_GUARD_CONTEXT);
  const routeRoles = route.data?.['allowedRoles'];
  const allowedRoles = Array.isArray(routeRoles)
    ? (routeRoles as readonly string[])
    : context.allowedRoles;
  return Boolean(
    context.principal?.roles.some((role) =>
      canAccessRouteForRole(role, allowedRoles),
    ),
  );
};
