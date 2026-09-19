// R-0014 TASK-0008 (Inspector). `core/error-banner.component.ts` (novo, contrato CTG-0003a
// §3.4) — `PortalErrorBannerComponent` ainda não existe (TASK-0009): a importação falha com
// "Cannot find module" (estado esperado, §9 do contrato). Usa o catálogo real
// (`i18n/portal.pt-BR.json`) via `StynxI18nModule` — o texto exibido é comparado ao valor real
// da chave (não um marcador), porque C-3a-31/33/34 exigem o TEXTO, não só a chave.
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { PortalErrorBannerComponent } from './error-banner.component';
import type { ErrorPresentation } from '../../testing/contract-types';

const catalog = portalCatalog as Record<string, string>;

function presentation(
  overrides: Partial<ErrorPresentation>,
): ErrorPresentation {
  return {
    code: 'PORTAL.NOT_FOUND',
    status: 404,
    messageKey: 'portal.errors.not_found',
    messageParams: {},
    severity: 'error',
    nextStep: 'none',
    nextStepRoute: null,
    alternativeChannel: false,
    fields: [],
    retryAfter: null,
    context: {},
    requestId: null,
    ...overrides,
  };
}

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      PortalErrorBannerComponent,
      RouterModule.forRoot([]),
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(PortalErrorBannerComponent);
}

describe('PortalErrorBannerComponent', () => {
  it('dado severity error código NOT_FOUND então role alert, aria-live assertive, data-code, texto real da chave; dado warning então role status, aria-live polite', async () => {
    // C-3a-31
    const fixture = await setup();
    fixture.componentRef.setInput('error', presentation({}));
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const banner = host.querySelector('[role="alert"]');
    expect(banner).not.toBeNull();
    expect(banner?.getAttribute('aria-live')).toBe('assertive');
    expect(host.querySelector('[data-code="PORTAL.NOT_FOUND"]')).not.toBeNull();
    expect(host.textContent).toContain(catalog['portal.errors.not_found']);

    fixture.componentRef.setInput(
      'error',
      presentation({
        code: null,
        severity: 'warning',
        messageKey: 'portal.errors.service_partially_available',
      }),
    );
    fixture.detectChanges();
    expect(
      host.querySelector('[role="status"]')?.getAttribute('aria-live'),
    ).toBe('polite');
  });

  it('dado alternativeChannel true então contém portal-alternative-channel-note; false então não', async () => {
    // C-3a-32
    const fixture = await setup();
    fixture.componentRef.setInput(
      'error',
      presentation({ alternativeChannel: true }),
    );
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();

    fixture.componentRef.setInput(
      'error',
      presentation({ alternativeChannel: false }),
    );
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('portal-alternative-channel-note'),
    ).toBeNull();
  });

  it('dado nextStep retry então botão com texto de portal.common.action.retry emite retry; dado elevation com nextStepRoute então <a routerLink> com texto de cmd.elevar; dado login então portal.common.action.login', async () => {
    // C-3a-33
    const fixture = await setup();
    const component = fixture.componentInstance as PortalErrorBannerComponent;
    const emitted: void[] = [];
    component.retry.subscribe(() => emitted.push(undefined));

    fixture.componentRef.setInput('error', presentation({ nextStep: 'retry' }));
    fixture.detectChanges();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const retryButton = buttons.find((button) =>
      button.textContent?.includes(catalog['portal.common.action.retry']),
    );
    expect(retryButton).toBeDefined();
    retryButton?.click();
    expect(emitted).toHaveLength(1);

    fixture.componentRef.setInput(
      'error',
      presentation({
        nextStep: 'elevation',
        nextStepRoute: '/assinatura/elevacao?retomar=%2Fautos',
      }),
    );
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[href]');
    expect(link?.textContent).toContain(
      catalog['portal.screens.t27.cmd.elevar'],
    );

    fixture.componentRef.setInput('error', presentation({ nextStep: 'login' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      catalog['portal.common.action.login'],
    );
  });

  it("dado INTERNAL com requestId 'req-1' então o texto contém 'req-1' ({{requestId}} de portal.errors.internal)", async () => {
    // C-3a-34
    const fixture = await setup();
    fixture.componentRef.setInput(
      'error',
      presentation({
        code: 'PORTAL.INTERNAL',
        messageKey: 'portal.errors.internal',
        messageParams: { requestId: 'req-1' },
        requestId: 'req-1',
        nextStep: 'support',
      }),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('req-1');
  });

  it('dado banner error renderizado então document.activeElement é o banner (foco automático, catálogo §8)', async () => {
    // C-3a-35
    const fixture = await setup();
    fixture.componentRef.setInput('error', presentation({}));
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('[role="alert"]');
    expect(document.activeElement).toBe(banner);
  });
});
