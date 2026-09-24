import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';

export const tenantGuard: CanMatchFn = (route) => {
  const context = inject(TEAT_GUARD_CONTEXT);
  const tenantId = context.tenantId();
  if (typeof tenantId !== 'string' || tenantId.length === 0) return false;
  if (route.path === 'device-blocked' || context.bootstrap() !== undefined) {
    return true;
  }
  const router = inject(Router);
  return router.parseUrl(router.url === '/' ? '/auth-login' : router.url);
};
