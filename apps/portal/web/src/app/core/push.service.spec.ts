// R-0014 TASK-0017 (Inspector). CTG-0003c §4.2 — `PushService`; arquivo inteiramente novo (§1) —
// "Cannot find module" até TASK-0018 (esperado, §9). `SwPush` substituído por
// `src/testing/sw-push.stub.ts`; `PUSH_SERVER_PUBLIC_KEY` sobrescrito por `useValue`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SwPush } from '@angular/service-worker';
import { PushService, PUSH_SERVER_PUBLIC_KEY } from './push.service'; // §9: "Cannot find module" esperado.
import {
  createSwPushStub,
  fakePushSubscription,
} from '../../testing/sw-push.stub';

function setup(options: {
  readonly isEnabled?: boolean;
  readonly publicKey?: string | null;
  readonly requestSubscriptionRejects?: boolean;
}) {
  const swPush = createSwPushStub({
    isEnabled: options.isEnabled ?? true,
    requestSubscriptionRejects: options.requestSubscriptionRejects,
  });
  TestBed.configureTestingModule({
    providers: [
      PushService,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SwPush, useValue: swPush.instance },
      { provide: PUSH_SERVER_PUBLIC_KEY, useValue: options.publicKey ?? null },
    ],
  });
  return {
    // PushService ainda não existe (§9); cast documenta a assinatura assumida (§4.2).
    service: TestBed.inject(PushService) as any,
    swPush,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
});

describe('PushService — status inicial (§4.2)', () => {
  it('dado SwPush.isEnabled=false então status unsupported', () => {
    // C-3c-79 (1.ª metade)
    const { service: unsupported } = setup({
      isEnabled: false,
      publicKey: null,
    });
    expect(unsupported.status()).toBe('unsupported');
  });

  it('dado isEnabled=true e PUSH_SERVER_PUBLIC_KEY null então unavailable e subscribe() não chama requestSubscription [negativo]', async () => {
    // C-3c-79 (2.ª metade)
    const { service, swPush } = setup({ isEnabled: true, publicKey: null });
    expect(service.status()).toBe('unavailable');
    await service.subscribe();
    expect(swPush.requestSubscriptionMock).not.toHaveBeenCalled();
  });
});

describe('PushService — subscribe() por gesto explícito (§4.2; spec §8)', () => {
  it('dado PUSH_SERVER_PUBLIC_KEY k então requestSubscription NÃO é chamado até subscribe() ser invocado [negativo]; após subscribe() então requestSubscription({serverPublicKey:k}) e POST push-subscriptions com { endpoint, keys } de toJSON(); status subscribed', async () => {
    // C-3c-80
    const { service, swPush, httpMock } = setup({
      isEnabled: true,
      publicKey: 'k',
    });
    expect(service.status()).toBe('idle');
    expect(swPush.requestSubscriptionMock).not.toHaveBeenCalled();

    const subscription = fakePushSubscription('https://push.invalid/e', {
      p256dh: 'p',
      auth: 'a',
    });
    swPush.requestSubscriptionMock.mockImplementationOnce(async () => {
      swPush.subscriptionSubject.next(subscription);
      return subscription;
    });
    const promise = service.subscribe();
    expect(swPush.requestSubscriptionMock).toHaveBeenCalledWith({
      serverPublicKey: 'k',
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/push-subscriptions'),
    );
    expect(req.request.body).toEqual({
      endpoint: 'https://push.invalid/e',
      keys: { p256dh: 'p', auth: 'a' },
    });
    req.flush({
      id: 'p1',
      endpoint: 'https://push.invalid/e',
      createdAt: '2026-09-14',
    });
    await promise;
    expect(service.status()).toBe('subscribed');
  });
});

describe('PushService — falhas (§4.2)', () => {
  it('dado requestSubscription rejeitar então status denied e nenhum POST [negativo]', async () => {
    // C-3c-81 (1.ª metade)
    const { service, httpMock } = setup({
      isEnabled: true,
      publicKey: 'k',
      requestSubscriptionRejects: true,
    });
    await service.subscribe();
    expect(service.status()).toBe('denied');
    httpMock.expectNone('/v1/portal/push-subscriptions');
  });

  it('dado o POST push-subscriptions responder 500 então status error e SwPush.unsubscribe chamado', async () => {
    // C-3c-81 (2.ª metade)
    const { service, swPush, httpMock } = setup({
      isEnabled: true,
      publicKey: 'k',
    });
    const subscription = fakePushSubscription();
    swPush.requestSubscriptionMock.mockImplementationOnce(async () => {
      swPush.subscriptionSubject.next(subscription);
      return subscription;
    });
    const promise = service.subscribe();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/push-subscriptions'),
    );
    req.flush(
      { code: 'PORTAL.INTERNAL', status: 500, message: 'erro' },
      { status: 500, statusText: 'Internal Server Error' },
    );
    await promise;
    expect(service.status()).toBe('error');
    expect(swPush.unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
