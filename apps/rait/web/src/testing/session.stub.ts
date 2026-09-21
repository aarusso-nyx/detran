// R-0012 TASK-0005 (Inspector). Stub de `RaitSessionFacade` (contrato `CTG-0002a.md` §10,
// §4): signals graváveis (`setRoles`/`setActive`) e `canonicalRoles` calculado por composição
// com `RAIT_ROLE_PRECEDENCE` — a mesma fonte que `core/session.facade.ts` deve usar, mas
// transcrita aqui de forma independente (nenhuma importação de `app.route-manifest.ts`).
// Padrão `apps/portal/web/src/testing/session-facade.stub.ts`.
import { signal, type WritableSignal } from '@angular/core';
import { vi, type Mock } from 'vitest';
// Produção (TASK-0006): ainda não existe — a falha de módulo aqui é esperada nesta entrega
// (CTG-0002a §11, método §4.13). O tipo é usado só para que `SessionStub` seja estruturalmente
// compatível com `RaitSessionFacade` quando o arquivo passar a existir.
import type { RaitSessionFacade } from '../app/core/session.facade';
import {
  RAIT_ROLE_PRECEDENCE,
  type RaitRoleCode,
} from './route-manifest.fixture';

export interface SessionStubOptions {
  readonly active?: boolean;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

export interface SessionStub extends RaitSessionFacade {
  setRoles(roles: readonly string[]): void;
  setActive(active: boolean): void;
  readonly loginMock: Mock<() => void>;
  readonly logoutMock: Mock<() => Promise<void>>;
}

/** `canonicalRoles` = `roles() ∩ RAIT_ALL_ROLES`, ordem de `RAIT_ROLE_PRECEDENCE` (§4). */
function canonicalRolesOf(roles: readonly string[]): readonly RaitRoleCode[] {
  const set = new Set(roles);
  return RAIT_ROLE_PRECEDENCE.filter((role) => set.has(role));
}

export function createSessionStub(
  options: SessionStubOptions = {},
): SessionStub {
  const activeSignal: WritableSignal<boolean> = signal(options.active ?? false);
  const rolesSignal: WritableSignal<readonly string[]> = signal(
    options.roles ?? [],
  );
  const permissionsSignal: WritableSignal<readonly string[]> = signal(
    options.permissions ?? [],
  );
  const canonicalRolesSignal: WritableSignal<readonly RaitRoleCode[]> = signal(
    canonicalRolesOf(options.roles ?? []),
  );
  const loginMock = vi.fn<() => void>();
  const logoutMock = vi.fn<() => Promise<void>>(async () => {});

  function setRoles(roles: readonly string[]): void {
    rolesSignal.set(roles);
    canonicalRolesSignal.set(canonicalRolesOf(roles));
  }
  function setActive(active: boolean): void {
    activeSignal.set(active);
  }

  return {
    active: activeSignal,
    roles: rolesSignal,
    permissions: permissionsSignal,
    canonicalRoles: canonicalRolesSignal,
    hasRole: (...codes: readonly string[]) =>
      codes.some((code) => rolesSignal().includes(code)),
    can: (permission: string) => permissionsSignal().includes(permission),
    login: loginMock,
    logout: logoutMock,
    setRoles,
    setActive,
    loginMock,
    logoutMock,
  } satisfies SessionStub;
}

function canonicalPreset(role: RaitRoleCode): SessionStubOptions {
  return { active: true, roles: [role] };
}

/**
 * Um preset por papel canônico (sessão ativa, só aquele papel) mais `anonymous` (sessão
 * inativa) e `no-canonical-role` (ativa com `roles: ['DPO']` — chave `rait.role.DPO` existe na
 * semente i18n, mas `DPO` não é um dos 13 códigos canônicos do RAIT; §10/§11 C-2A-13/16).
 */
export const SESSION_PRESETS: Readonly<
  Record<RaitRoleCode | 'anonymous' | 'no-canonical-role', SessionStubOptions>
> = {
  'rait-analyst': canonicalPreset('rait-analyst'),
  'rait-coordinator': canonicalPreset('rait-coordinator'),
  'rait-secretary': canonicalPreset('rait-secretary'),
  'rait-signing-authority': canonicalPreset('rait-signing-authority'),
  'rait-central-authority': canonicalPreset('rait-central-authority'),
  'rait-rapporteur': canonicalPreset('rait-rapporteur'),
  'rait-chair': canonicalPreset('rait-chair'),
  'rait-manager': canonicalPreset('rait-manager'),
  'rait-hr': canonicalPreset('rait-hr'),
  'rait-finance': canonicalPreset('rait-finance'),
  'integration-operator': canonicalPreset('integration-operator'),
  AUDITOR: canonicalPreset('AUDITOR'),
  'agency-admin': canonicalPreset('agency-admin'),
  anonymous: { active: false, roles: [] },
  'no-canonical-role': { active: true, roles: ['DPO'] },
};
