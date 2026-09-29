import {
  DETRAN_POLICY_MATRIX,
  DETRAN_ROLES,
  isDetranActionAllowed,
} from '@detran/shared';
import { describe, expect, it } from 'vitest';

const PEC_COMMAND_KEYS = Object.keys(DETRAN_POLICY_MATRIX).filter((key) =>
  key.startsWith('ch:'),
) as Array<keyof typeof DETRAN_POLICY_MATRIX>;

// Exceção global já declarada em policy.ts: estes papéis recebem '*'. A
// caracterização abaixo exige que todo outro papel siga o grant da rota.
const GLOBAL_ADMIN_ROLES = new Set([
  'ADMIN',
  'GESTOR_DETRAN',
  'SUPORTE',
  'technical-admin',
]);

// A revisão de retenção é deliberadamente mais restrita que o atalho global:
// policy.ts requer DPO para proteger a decisão de eliminação.
const GLOBAL_ADMIN_DENIED_KEYS = new Set(['ch:retention:review']);

describe('PEC command authorization characterization', () => {
  it('dada cada operação ch quando cada papel canônico é avaliado então preserva grants da rota e a exceção global declarada', () => {
    expect(PEC_COMMAND_KEYS.length).toBeGreaterThan(0);

    const unexpected = PEC_COMMAND_KEYS.flatMap((key) => {
      const [domain, resource, action] = key.split(':');
      const grants = DETRAN_POLICY_MATRIX[key] ?? [];
      return DETRAN_ROLES.flatMap((role) => {
        const actual = isDetranActionAllowed(
          { roles: [role], permissions: [`role:${role}`] },
          `${domain}:${resource}`,
          action,
        );
        const expected =
          grants.includes(role) ||
          (GLOBAL_ADMIN_ROLES.has(role) && !GLOBAL_ADMIN_DENIED_KEYS.has(key));
        return actual === expected
          ? []
          : [`${key} / ${role}: esperado ${expected}, observado ${actual}`];
      });
    });

    expect(
      unexpected,
      'Fora de GLOBAL_ADMIN_ROLES e da exceção DPO de retenção, cada papel sem grant da rota deve receber 403; papéis fora de PEC_ROLES também fazem parte da matriz negativa.',
    ).toEqual([]);
  });
});
