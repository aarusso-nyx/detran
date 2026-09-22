import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';

export const shiftGuard: CanMatchFn = () =>
  inject(TEAT_GUARD_CONTEXT).bootstrap?.context?.activeShift?.status === 'open';
