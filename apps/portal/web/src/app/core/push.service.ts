// PushService (contrato CTG-0003c §4.2; spec §8; M14): `SwPush` de `@angular/service-worker`
// (provido por `provideServiceWorker`, `src/main.ts`) + `POST /v1/portal/push-subscriptions`.
// A assinatura só acontece por gesto explícito do cidadão (`subscribe()` chamado pelo botão de
// opt-in da página de preferências) — nunca no bootstrap, em `effect`, no construtor nem ao abrir a
// página. A chave pública VAPID (`applicationServerKey`) não tem origem fixada (não está entre as
// três chaves de `runtime-config.js` — M4 — nem em `GET brand`): `PUSH_SERVER_PUBLIC_KEY` é um
// `InjectionToken` com padrão `null` → push `unavailable` (OD-P88). `messages`/`notificationClicks`
// não são consumidos neste par (o produtor de push é do servidor — OD-P40); `SwUpdate` não é tocado.
import {
  Injectable,
  InjectionToken,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwPush } from '@angular/service-worker';
import { of } from 'rxjs';
import { PortalClient } from '../data/portal.client';
import type {
  PreferencesUpdateBody,
  PushSubscriptionCreateBody,
} from '../data/portal-read.models';
import { presentError, type ErrorPresentation } from './error-boundary';

/**
 * Chave pública VAPID (`applicationServerKey`): origem `source_pending` (OD-P88). Padrão `null`
 * → push indisponível. Nunca uma constante no código.
 */
export const PUSH_SERVER_PUBLIC_KEY = new InjectionToken<string | null>(
  'PUSH_SERVER_PUBLIC_KEY',
  { providedIn: 'root', factory: () => null },
);

export type PushStatus =
  | 'unsupported' // !SwPush.isEnabled (browser sem SW, dev mode ou sem provider)
  | 'unavailable' // sem PUSH_SERVER_PUBLIC_KEY (OD-P88)
  | 'idle' // pode assinar; aguarda opt-in explícito
  | 'subscribing'
  | 'subscribed' // assinatura no SW e POST 201 feito nesta sessão (ou assinatura já existente no SW)
  | 'denied' // requestSubscription rejeitou (permissão negada)
  | 'error'; // POST push-subscriptions falhou (assinatura local desfeita: unsubscribe())

type PushPhase = 'idle' | 'subscribing' | 'subscribed' | 'denied' | 'error';

/** `PushSubscription.toJSON()` no formato do fio (`PushSubscriptionCreateDto`), ou `null` se incompleto. */
function toWireSubscription(
  subscription: PushSubscription,
): PushSubscriptionCreateBody | null {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const keys = json.keys;
  const p256dh = keys?.['p256dh'];
  const auth = keys?.['auth'];
  if (
    typeof endpoint !== 'string' ||
    endpoint.length === 0 ||
    typeof p256dh !== 'string' ||
    typeof auth !== 'string'
  ) {
    return null;
  }
  return { endpoint, keys: { p256dh, auth } };
}

@Injectable({ providedIn: 'root' })
export class PushService {
  /** Opcional: fora de `provideServiceWorker` (harness de rotas) o push é `unsupported`. */
  private readonly swPush = inject(SwPush, { optional: true });
  private readonly client = inject(PortalClient);
  private readonly serverPublicKey = inject(PUSH_SERVER_PUBLIC_KEY);
  private readonly phase = signal<PushPhase>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);

  /** `toSignal(SwPush.subscription)`. */
  readonly subscription = toSignal(
    this.swPush?.subscription ?? of<PushSubscription | null>(null),
    { initialValue: null },
  );
  readonly error = this.errorState.asReadonly();
  readonly status = computed<PushStatus>(() => {
    if (!this.swPush?.isEnabled) return 'unsupported';
    if (this.serverPublicKey === null) return 'unavailable';
    const phase = this.phase();
    if (phase === 'idle' && this.subscription() !== null) return 'subscribed';
    return phase;
  });

  /**
   * SÓ por gesto explícito do cidadão. `requestSubscription({ serverPublicKey })` →
   * `PortalClient.createPushSubscription(toJSON())`; `toJSON()` incompleto → `error` sem requisição.
   */
  async subscribe(): Promise<void> {
    const swPush = this.swPush;
    const serverPublicKey = this.serverPublicKey;
    if (!swPush?.isEnabled || serverPublicKey === null) return;
    this.errorState.set(null);
    this.phase.set('subscribing');
    let subscription: PushSubscription;
    try {
      subscription = await swPush.requestSubscription({ serverPublicKey });
    } catch {
      this.phase.set('denied');
      return;
    }
    const body = toWireSubscription(subscription);
    if (body === null) {
      this.phase.set('error');
      return;
    }
    try {
      await this.client.createPushSubscription(body);
      this.phase.set('subscribed');
    } catch (error: unknown) {
      this.errorState.set(presentError(error));
      this.phase.set('error');
      await this.unsubscribeQuietly();
    }
  }

  /** `SwPush.unsubscribe()`; não há DELETE no OpenAPI (`source_pending`). */
  async unsubscribe(): Promise<void> {
    await this.unsubscribeQuietly();
    this.phase.set('idle');
  }

  /** Corpo da assinatura para `PUT preferences { channel: 'push', pushSubscription }` (OD-P87). */
  preferencesPayload(): PreferencesUpdateBody['pushSubscription'] | null {
    const subscription = this.subscription();
    return subscription ? toWireSubscription(subscription) : null;
  }

  private async unsubscribeQuietly(): Promise<void> {
    try {
      await this.swPush?.unsubscribe();
    } catch {
      // Sem assinatura local para desfazer: nada a fazer.
    }
  }
}
