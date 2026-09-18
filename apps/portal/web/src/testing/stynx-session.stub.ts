// R-0014 TASK-0008 (Inspector). Stub de `StynxSessionService` (`@stynx-nyx/angular-auth`
// 1.3.1: `state: Signal<StynxSessionState>`, `active: Signal<boolean>`) para os specs de
// `PortalSessionFacade` e `OfflineDocumentStore`, que injetam a classe real (`detran-ui-guide.md`
// §5: "SessionService stub com papéis das fixtures"). `StynxSessionService` é uma classe
// concreta (não abstrata); `{ provide: StynxSessionService, useValue: stub }` substitui a
// instância inteira nos testes — o provider do Angular aceita `useValue` de qualquer forma.
import { signal, type WritableSignal } from '@angular/core';

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
  return {
    active: signal(merged.active),
    state: signal(merged),
  };
}
