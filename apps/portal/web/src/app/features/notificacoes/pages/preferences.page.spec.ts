// R-0014 TASK-0017 (Inspector). CTG-0003c §6 preferências (`PreferencesPageComponent`); página
// real, ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). `SwPush`
// substituído por stub para a parte de página do gesto explícito (C-3c-80).
import { PreferencesPageComponent } from './preferences.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { SwPush } from '@angular/service-worker';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { PUSH_SERVER_PUBLIC_KEY } from '../../../core/push.service';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  createSwPushStub,
  fakePushSubscription,
} from '../../../../testing/sw-push.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { ME_PAIR3_FIXTURE } from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const swPush = createSwPushStub({ isEnabled: true });
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    PreferencesPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
        account: ME_PAIR3_FIXTURE,
      }),
    },
    { provide: SwPush, useValue: swPush.instance },
    { provide: PUSH_SERVER_PUBLIC_KEY, useValue: 'k' },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/notificacoes/preferencias');
  return { harness, swPush };
}

describe('/notificacoes/preferencias — data-screen "" e banner de indisponibilidade desde o início (§6; OD-P38)', () => {
  it('dado a página montada então data-screen "", StynxBanner unavailable_in_version presente desde o início e nenhuma opção de canal pré-selecionada [negativo]', async () => {
    // C-3c-105
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    expect(root.textContent).toContain(
      catalog['portal.states.unavailable_in_version'],
    );
    const radios = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="channel"]'),
    );
    expect(radios.length).toBeGreaterThan(0);
    expect(radios.some((radio) => radio.checked)).toBe(false);
  });
});

describe('/notificacoes/preferencias — opt-in de push por gesto explícito (§4.2; spec §8)', () => {
  it('dado a página montada então requestSubscription NÃO é chamado até o clique no opt-in [negativo]; após o clique então status subscribed', async () => {
    // C-3c-80 (parte de página)
    const { harness, swPush } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    expect(swPush.requestSubscriptionMock).not.toHaveBeenCalled();
    const subscription = fakePushSubscription();
    swPush.requestSubscriptionMock.mockImplementationOnce(async () => {
      swPush.subscriptionSubject.next(subscription);
      return subscription;
    });
    const optIn = root.querySelector<HTMLButtonElement>('[data-push-opt-in]');
    expect(optIn).not.toBeNull();
    optIn!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(swPush.requestSubscriptionMock).toHaveBeenCalledWith({
      serverPublicKey: 'k',
    });
  });
});

describe('/notificacoes/preferencias — a11y por estado (§6/§7.3 — cobertura integral: inicial, push subscribed, push denied, push error)', () => {
  it('dado a página montada (banner unavailable_in_version) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado push subscribed (após opt-in) então axe sem violação serious/critical', async () => {
    const { harness, swPush } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    const subscription = fakePushSubscription();
    swPush.requestSubscriptionMock.mockImplementationOnce(async () => {
      swPush.subscriptionSubject.next(subscription);
      return subscription;
    });
    const optIn = root.querySelector<HTMLButtonElement>('[data-push-opt-in]')!;
    optIn.dispatchEvent(new Event('click', { bubbles: true }));
    await vi.waitFor(() =>
      expect(swPush.requestSubscriptionMock).toHaveBeenCalled(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado push denied (requestSubscription rejeitado) então axe sem violação serious/critical', async () => {
    const { harness, swPush } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    swPush.requestSubscriptionMock.mockRejectedValueOnce(
      new Error('permissão negada (fixture)'),
    );
    const optIn = root.querySelector<HTMLButtonElement>('[data-push-opt-in]')!;
    optIn.dispatchEvent(new Event('click', { bubbles: true }));
    await vi.waitFor(() =>
      expect(swPush.requestSubscriptionMock).toHaveBeenCalled(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado push error (POST push-subscriptions 500) então axe sem violação serious/critical', async () => {
    const { harness, swPush } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    const subscription = fakePushSubscription();
    swPush.requestSubscriptionMock.mockImplementationOnce(async () => {
      swPush.subscriptionSubject.next(subscription);
      return subscription;
    });
    const optIn = root.querySelector<HTMLButtonElement>('[data-push-opt-in]')!;
    optIn.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/push-subscriptions'),
    );
    req.flush(
      { code: 'PORTAL.INTERNAL', status: 500, message: 'erro' },
      { status: 500, statusText: 'Internal Server Error' },
    );
    await vi.waitFor(() => expect(swPush.unsubscribeMock).toHaveBeenCalled());
    await expectA11yStateInvariants(root, catalog);
  });
});
