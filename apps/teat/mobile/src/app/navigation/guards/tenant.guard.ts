import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';

export const tenantGuard: CanMatchFn = () => {
  const tenantId = inject(TEAT_GUARD_CONTEXT).tenantId;
  return typeof tenantId === 'string' && tenantId.length > 0;
};
