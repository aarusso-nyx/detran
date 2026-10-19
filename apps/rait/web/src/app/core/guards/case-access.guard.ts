// The authenticated case read enforces the server-approved scope and purpose.
import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { CaseClient } from '../../data/api/case.client';

export const caseAccessGuard: CanActivateFn = async (route) => {
  const caseId = route.paramMap.get('id');
  if (!caseId) return false;
  const cases = inject(CaseClient);
  try {
    await cases.verifyCaseAccess(caseId);
    return true;
  } catch {
    return false;
  }
};
