import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';

export const authGuard: CanMatchFn = () => {
  if (inject(TEAT_GUARD_CONTEXT).principal() !== undefined) return true;
  const router = inject(Router);
  return router.parseUrl(router.url === '/' ? '/auth-login' : router.url);
};
