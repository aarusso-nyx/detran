// R-0033 TASK-0002 (Inspector). C-06 / P-14 / D-14 (`frontend-preview-mode.md` §2, §7, §9; prompt
// TASK-0002 item 6): `PREVIEW_ROLE_PERMISSIONS` é transcrição literal de `RAIT_COMMAND_RULES`
// (`backend/domains/shared/src/policy.ts`) — igual, papel a papel, ao que `readPolicyCommandRules()`
// (`src/testing/kb.ts`) extrai do texto-fonte (conjuntos iguais, os 13 papéis de `RAIT_ALL_ROLES`,
// nenhum a mais) e igual a `ROLE_PERMISSIONS_FIXTURE` (`src/testing/policy.fixture.ts`). Produção
// (TASK-0003): ainda não existe — falha de módulo esperada nesta entrega.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, readPolicyCommandRules } from '../../testing/kb';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import { RAIT_ALL_ROLES, type RaitRoleCode } from '../app.route-manifest';
import { PREVIEW_ROLE_PERMISSIONS } from './preview-permissions';

/** Chaves `inf:<recurso>:<ação>` de `RAIT_COMMAND_RULES` cujas regras incluem `role`. */
function policyKeysOf(role: RaitRoleCode): readonly string[] {
  return readPolicyCommandRules()
    .filter((rule) => rule.roles.includes(role))
    .map((rule) => rule.key);
}

describe('C-06 — PREVIEW_ROLE_PERMISSIONS: forma (P-14)', () => {
  it('dado PREVIEW_ROLE_PERMISSIONS quando listadas as chaves então exatamente os 13 papéis de RAIT_ALL_ROLES, nenhum a mais', () => {
    expect(Object.keys(PREVIEW_ROLE_PERMISSIONS).sort()).toEqual(
      [...RAIT_ALL_ROLES].sort(),
    );
    expect(Object.keys(PREVIEW_ROLE_PERMISSIONS)).toHaveLength(13);
  });

  it('dado PREVIEW_ROLE_PERMISSIONS quando lidas as permissões então toda chave tem a forma inf:rait-<recurso>:<ação> e nenhuma se repete no mesmo papel', () => {
    for (const role of RAIT_ALL_ROLES) {
      const keys = PREVIEW_ROLE_PERMISSIONS[role];
      for (const key of keys) {
        expect(key, role).toMatch(/^inf:rait-[a-z-]+:[a-z-]+$/);
      }
      expect(new Set(keys).size, role).toBe(keys.length);
    }
  });

  it('dado src/app/preview/preview-permissions.ts quando lido então o comentário cita a fonte RAIT_COMMAND_RULES de backend/domains/shared/src/policy.ts', () => {
    const text = readFileSync(
      join(APP_SRC_ROOT, 'app', 'preview', 'preview-permissions.ts'),
      'utf8',
    );
    expect(text).toContain('RAIT_COMMAND_RULES');
    expect(text).toContain('backend/domains/shared/src/policy.ts');
  });

  it('dado src/app/preview/preview-permissions.ts quando lido então não importa policy.ts em runtime (transcrição, não dependência do backend) [negativo]', () => {
    const text = readFileSync(
      join(APP_SRC_ROOT, 'app', 'preview', 'preview-permissions.ts'),
      'utf8',
    );
    expect(text).not.toMatch(/from\s+['"][^'"]*backend\//);
    expect(text).not.toMatch(/from\s+['"][^'"]*policy['"]/);
  });
});

describe('C-06 — PREVIEW_ROLE_PERMISSIONS × RAIT_COMMAND_RULES (readPolicyCommandRules) por papel', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const expected = policyKeysOf(role);
    it(`dado o papel ${role} quando comparado com RAIT_COMMAND_RULES então o mesmo conjunto (${expected.length} chaves)`, () => {
      expect(new Set(PREVIEW_ROLE_PERMISSIONS[role])).toEqual(
        new Set(expected),
      );
      expect(PREVIEW_ROLE_PERMISSIONS[role]).toHaveLength(expected.length);
    });
  });
});

describe('C-06 — PREVIEW_ROLE_PERMISSIONS × ROLE_PERMISSIONS_FIXTURE por papel', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    it(`dado o papel ${role} quando comparado com ROLE_PERMISSIONS_FIXTURE então o mesmo conjunto (${ROLE_PERMISSIONS_FIXTURE[role].length} chaves)`, () => {
      expect(new Set(PREVIEW_ROLE_PERMISSIONS[role])).toEqual(
        new Set(ROLE_PERMISSIONS_FIXTURE[role]),
      );
    });
  });
});
