// R-0012 TASK-0005 (Inspector). Stub de `StynxSessionService` (`@stynx-nyx/angular-auth`
// 1.3.1: `state: Signal<StynxSessionState>`, `active: Signal<boolean>`, `login`,
// `loginRedirect`, `completeLogin`, `logout`, `hasAllPermissions`, `hasAnyPermissions`,
// `snapshot`) para os specs de `StynxRaitSessionFacade`, `raitAuthGuard` e
// `AuthCallbackPageComponent`. `StynxSessionService` é classe concreta (não abstrata):
// `{ provide: StynxSessionService, useValue: stub }` substitui a instância inteira — o
// provider do Angular aceita `useValue` de qualquer forma, então o stub não precisa (nem pode,
// por causa de membros privados) estender a classe real. Padrão
// `apps/portal/web/src/testing/stynx-session.stub.ts`.
import { signal, type WritableSignal } from '@angular/core';
import { vi, type Mock } from 'vitest';
import type { StynxSessionState } from '@stynx-nyx/angular-auth';

export interface StynxSessionServiceStub {
  readonly state: WritableSignal<StynxSessionState>;
  readonly active: WritableSignal<boolean>;
  snapshot(): StynxSessionState;
  readonly login: Mock<() => void>;
  readonly loginRedirect: Mock<() => void>;
  readonly completeLogin: Mock<(url?: string) => Promise<StynxSessionState>>;
  readonly logout: Mock<() => Promise<void>>;
  hasAllPermissions(required: string[]): boolean;
  hasAnyPermissions(required: string[]): boolean;
}

const DEFAULT_STATE: StynxSessionState = {
  active: false,
  accessToken: null,
  refreshToken: null,
  sid: null,
  permissions: [],
  tenantId: null,
  claims: null,
};

export function createStynxSessionStub(
  initial: Partial<StynxSessionState> = {},
): StynxSessionServiceStub {
  const merged: StynxSessionState = { ...DEFAULT_STATE, ...initial };
  const stateSignal = signal(merged);
  const activeSignal = signal(merged.active);
  const completeLogin = vi.fn(async (_url?: string) => stateSignal());
  return {
    state: stateSignal,
    active: activeSignal,
    snapshot: () => stateSignal(),
    login: vi.fn(),
    loginRedirect: vi.fn(),
    completeLogin,
    logout: vi.fn(async () => {}),
    hasAllPermissions: (required: string[]) =>
      required.every((permission) =>
        (stateSignal().permissions ?? []).includes(permission),
      ),
    hasAnyPermissions: (required: string[]) =>
      required.some((permission) =>
        (stateSignal().permissions ?? []).includes(permission),
      ),
  };
}
