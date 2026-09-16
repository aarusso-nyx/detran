import { describe, expect, it } from 'vitest';
import { isDetranActionAllowed } from '../../../../shared/src/policy.js';
import { DETRAN_ROLES } from '../../../../shared/src/roles.js';

describe('contrato de rotas BOAT est/crash', () => {
  it('dado a adenda A-1 quando consultada então CIDADAO solicita sem ler vítima', () => {
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'est:crash-subject-request',
        'subject-request',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'est:crash-victim',
        'read',
      ),
    ).toBe(false);
    for (const role of DETRAN_ROLES.filter(
      (role) =>
        ![
          'processing-operator',
          'AUDITOR',
          'CIDADAO',
          'ADMIN',
          'GESTOR_DETRAN',
          'SUPORTE',
          'technical-admin',
        ].includes(role),
    )) {
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: [] },
          'est:crash-subject-request',
          'subject-request',
        ),
      ).toBe(false);
    }
  });
});
