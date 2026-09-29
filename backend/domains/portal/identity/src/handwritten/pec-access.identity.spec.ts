// R-0032 CTG-0002 — the Portal identity is citizen-only; it must never
// manufacture the clinical CANDIDATO role or its permission.
import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PortalCitizenGuard, portalIdentityOf } from './index.js';

describe('R-0032 CTG-0002 — identidade PEC', () => {
  it('dado sessão CIDADAO válida quando a guarda do Portal roda então conserva papéis e não concede CANDIDATO nem ch:candidate-dossier:*', () => {
    const request = {
      principal: {
        roles: ['CIDADAO'],
        permissions: ['portal:exam:read'],
        claims: { assurance_level: 'avancada', cpf: '33333333333' },
      },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    expect(new PortalCitizenGuard().canActivate(context)).toBe(true);
    expect(request.principal.roles).toEqual(['CIDADAO']);
    expect(request.principal.permissions).not.toContain('CANDIDATO');
    expect(request.principal.permissions).not.toContain(
      'ch:candidate-dossier:*',
    );
    expect(portalIdentityOf(request)).toMatchObject({ cpf: '33333333333' });
  });
});
