// R-0016 TASK-0004 (Inspector). Stub de `StynxSessionService` (`@stynx-nyx/angular-auth` 1.3.1),
// forma de `apps/portal/web/src/testing/stynx-session.stub.ts`, estendido com `permissionsForRolesFixture`
// (transcrição independente de `policy.ts` 1794-1803, restrita ao universo `dashboard:*` que este
// app usa: `POLICY_MATRIX_FIXTURE` ∪ `COMMAND_MATRIX_FIXTURE`) e `sessionForRoles`/`ANONYMOUS_SESSION`
// (`CTG-0002.md` §12) para montar sessões prontas nos specs de guarda/menu/comando.
import { signal, type WritableSignal } from '@angular/core';
import { vi, type Mock } from 'vitest';
import { GLOBAL_ADMIN_ROLES_FIXTURE } from './roles.fixture.js';
import { COMMAND_MATRIX_FIXTURE } from './command-matrix.fixture.js';
import { POLICY_MATRIX_FIXTURE } from './route-manifest.fixture.js';

export interface StynxSessionStateStub {
  readonly active: boolean;
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly sid: string | null;
  readonly permissions: string[];
  readonly tenantId: string | null;
  readonly claims: Record<string, unknown> | null;
}

export interface StynxSessionServiceStub {
  readonly active: WritableSignal<boolean>;
  readonly state: WritableSignal<StynxSessionStateStub>;
  readonly login: Mock<() => void>;
  readonly completeLogin: Mock<(url: string) => Promise<void>>;
  readonly logout: Mock<() => Promise<void>>;
  readonly hasAllPermissions: Mock<(...keys: readonly string[]) => boolean>;
  readonly hasAnyPermissions: Mock<(...keys: readonly string[]) => boolean>;
}

const DEFAULT_STATE: StynxSessionStateStub = {
  active: false,
  accessToken: null,
  refreshToken: null,
  sid: null,
  permissions: [],
  tenantId: null,
  claims: null,
};

export function createStynxSessionStub(
  initial: Partial<StynxSessionStateStub> = {},
): StynxSessionServiceStub {
  const merged: StynxSessionStateStub = { ...DEFAULT_STATE, ...initial };
  const active = signal(merged.active);
  const state = signal(merged);
  // A7(7): `completeLogin` ativa a sessão (como o serviço real faz ao trocar o código pelo
  // token) — sem isso, a navegação pós-callback para `/monitoramento` cai no `authGuard`.
  const activate = (): void => {
    active.set(true);
    state.set({ ...state(), active: true });
  };
  return {
    active,
    state,
    login: vi.fn(),
    completeLogin: vi.fn(async () => {
      activate();
    }),
    logout: vi.fn(async () => undefined),
    hasAllPermissions: vi.fn(
      (...keys: readonly string[]) =>
        merged.permissions.includes('*') ||
        keys.every((key) => merged.permissions.includes(key)),
    ),
    hasAnyPermissions: vi.fn(
      (...keys: readonly string[]) =>
        merged.permissions.includes('*') ||
        keys.some((key) => merged.permissions.includes(key)),
    ),
  };
}

/**
 * Transcrição independente de `policy.ts` `permissionsForRoles` (1794-1803), restrita ao
 * universo `dashboard:*` que este app consulta (as 10 chaves de leitura de `POLICY_MATRIX_FIXTURE`
 * e os 16 comandos de `COMMAND_MATRIX_FIXTURE`): algum papel ∈ `GLOBAL_ADMIN_ROLES_FIXTURE` →
 * `['*']`; senão `role:<r>` por papel mais toda chave cujo conjunto contém algum dos papéis,
 * ordenadas.
 */
export function permissionsForRolesFixture(roles: readonly string[]): string[] {
  if (
    roles.some((role) => GLOBAL_ADMIN_ROLES_FIXTURE.includes(role as never))
  ) {
    return ['*'];
  }
  const permissions = new Set<string>(roles.map((role) => `role:${role}`));
  const allEntries = { ...POLICY_MATRIX_FIXTURE, ...COMMAND_MATRIX_FIXTURE };
  for (const [key, grant] of Object.entries(allEntries)) {
    if (grant.some((role) => roles.includes(role))) permissions.add(key);
  }
  return [...permissions].sort();
}

export function sessionForRoles(
  roles: readonly string[],
): StynxSessionServiceStub {
  return createStynxSessionStub({
    active: true,
    permissions: permissionsForRolesFixture(roles),
    claims: { 'cognito:groups': [...roles] },
  });
}

export const ANONYMOUS_SESSION: StynxSessionServiceStub =
  createStynxSessionStub({
    active: false,
    permissions: [],
    claims: null,
  });
