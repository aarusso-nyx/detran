// R-0012 TASK-0005 (Inspector). Stub de `StynxSessionService` (`@stynx-nyx/angular-auth`
// 1.3.1: `state: Signal<StynxSessionState>`, `active: Signal<boolean>`, `login`,
// `loginRedirect`, `completeLogin`, `logout`, `hasAllPermissions`, `hasAnyPermissions`,
// `snapshot`) para os specs de `StynxRaitSessionFacade`, `raitAuthGuard` e
// `AuthCallbackPageComponent`. `StynxSessionService` é classe concreta (não abstrata):
// `{ provide: StynxSessionService, useValue: stub }` substitui a instância inteira — o
// provider do Angular aceita `useValue` de qualquer forma, então o stub não precisa (nem pode,
// por causa de membros privados) estender a classe real. Padrão
// `apps/portal/web/src/testing/stynx-session.stub.ts`.
//
// R-0012 TASK-0008 (Inspector, iteração restrita — adenda A10 item i, `plan.md`). O
// `.d.ts` do kit 1.3.1 (`StynxSessionService`, linha ~162) declara `readonly active$:
// Observable<StynxSessionState>` (`@deprecated` mas ainda presente e assinado pelo construtor
// de `StynxHasPermissionDirective`); sem ele, injetar `StynxSessionService` nos specs de
// `shared/` que renderizam `*stynxHasPermission` lança porque a diretiva não consegue assinar
// `session.active$`. `active$` é um `BehaviorSubject` que emite o estado corrente na assinatura
// e a cada `state.set/update` ou `active.set/update` — os dois signals continuam graváveis
// exatamente como antes (nenhum spec existente que grava `stub.state.set(...)` muda de
// comportamento).
import { signal, type WritableSignal } from '@angular/core';
import { vi, type Mock } from 'vitest';
import { BehaviorSubject, type Observable } from 'rxjs';
import type { StynxSessionState } from '@stynx-nyx/angular-auth';

export interface StynxSessionServiceStub {
  readonly state: WritableSignal<StynxSessionState>;
  readonly active: WritableSignal<boolean>;
  /** `StynxSessionService.active$` (kit 1.3.1, `@deprecated`, ainda assinado pela diretiva). */
  readonly active$: Observable<StynxSessionState>;
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
  const subject = new BehaviorSubject<StynxSessionState>(merged);
  const baseStateSignal = signal(merged);
  const baseActiveSignal = signal(merged.active);

  // `WritableSignal` é uma função com `set`/`update`/`asReadonly` anexados (mesma forma que o
  // Angular usa internamente) — reaproveita-se o signal de base para leitura e intercepta-se as
  // escritas para também alimentar `active$`.
  const stateSignal: WritableSignal<StynxSessionState> = Object.assign(
    (() => baseStateSignal()) as WritableSignal<StynxSessionState>,
    {
      set(value: StynxSessionState): void {
        baseStateSignal.set(value);
        subject.next(value);
      },
      update(updater: (value: StynxSessionState) => StynxSessionState): void {
        baseStateSignal.update(updater);
        subject.next(baseStateSignal());
      },
      asReadonly: () => baseStateSignal.asReadonly(),
    },
  );
  const activeSignal: WritableSignal<boolean> = Object.assign(
    (() => baseActiveSignal()) as WritableSignal<boolean>,
    {
      set(value: boolean): void {
        baseActiveSignal.set(value);
        subject.next(baseStateSignal());
      },
      update(updater: (value: boolean) => boolean): void {
        baseActiveSignal.update(updater);
        subject.next(baseStateSignal());
      },
      asReadonly: () => baseActiveSignal.asReadonly(),
    },
  );

  const completeLogin = vi.fn(async (_url?: string) => stateSignal());
  return {
    state: stateSignal,
    active: activeSignal,
    active$: subject.asObservable(),
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
