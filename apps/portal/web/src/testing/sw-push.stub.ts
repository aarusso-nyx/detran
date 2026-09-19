// R-0014 TASK-0017 (Inspector). Stub de `SwPush` (`@angular/service-worker`, contrato CTG-0003c
// §4.2): `isEnabled` (getter), `subscription` (`Observable<PushSubscription | null>`),
// `requestSubscription({ serverPublicKey })` e `unsubscribe()` — as quatro superfícies que
// `PushService` consome. `SwPush` é uma classe real (import direto funciona; não é um arquivo
// novo do §1), então o provider é `{ provide: SwPush, useValue: createSwPushStub(...).instance }`.
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { vi, type Mock } from 'vitest';

export interface SwPushStub {
  readonly instance: SwPush;
  readonly subscriptionSubject: BehaviorSubject<PushSubscription | null>;
  readonly requestSubscriptionMock: Mock<
    (options: { serverPublicKey: string }) => Promise<PushSubscription>
  >;
  readonly unsubscribeMock: Mock<() => Promise<void>>;
}

/** Objeto mínimo com `toJSON()` — o suficiente para `PushService.subscribe()` (contrato §4.2). */
export function fakePushSubscription(
  endpoint = 'https://push.invalid/fixture',
  keys: { readonly p256dh: string; readonly auth: string } = {
    p256dh: 'p256dh-fixture',
    auth: 'auth-fixture',
  },
): PushSubscription {
  return {
    endpoint,
    toJSON: () => ({ endpoint, keys: { ...keys } }),
  } as unknown as PushSubscription;
}

export function createSwPushStub(
  options: {
    readonly isEnabled?: boolean;
    readonly requestSubscriptionResult?:
      PushSubscription | (() => Promise<PushSubscription>);
    readonly requestSubscriptionRejects?: boolean;
  } = {},
): SwPushStub {
  const subscriptionSubject = new BehaviorSubject<PushSubscription | null>(
    null,
  );
  const requestSubscriptionMock = vi.fn(
    async (_input: { serverPublicKey: string }): Promise<PushSubscription> => {
      if (options.requestSubscriptionRejects) {
        throw new Error('permissão negada (fixture)');
      }
      const result =
        typeof options.requestSubscriptionResult === 'function'
          ? await options.requestSubscriptionResult()
          : (options.requestSubscriptionResult ?? fakePushSubscription());
      subscriptionSubject.next(result);
      return result;
    },
  );
  const unsubscribeMock = vi.fn(async (): Promise<void> => {
    subscriptionSubject.next(null);
  });
  const instance = {
    get isEnabled() {
      return options.isEnabled ?? true;
    },
    subscription: subscriptionSubject.asObservable(),
    requestSubscription: requestSubscriptionMock,
    unsubscribe: unsubscribeMock,
  } as unknown as SwPush;
  return {
    instance,
    subscriptionSubject,
    requestSubscriptionMock,
    unsubscribeMock,
  };
}
