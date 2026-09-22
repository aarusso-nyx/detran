import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { TEAT_GUARD_CONTEXT } from '../../core/bootstrap.store.js';

export const authGuard: CanMatchFn = () =>
  inject(TEAT_GUARD_CONTEXT).principal !== undefined;
