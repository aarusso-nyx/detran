// R-0012 TASK-0005 (Inspector). Critérios C-2A-63…65 do contrato `CTG-0002a.md` §11 — páginas
// do núcleo. Falha esperada nesta entrega: `core/pages/*.page.ts` e
// `shared/placeholder-page.component.ts` (produção) ainda não existem (TASK-0006).
import { Component } from '@angular/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import {
  markerI18nModule,
  initializeMarkerI18n,
  buildTestCatalog,
} from '../../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../../testing/a11y-state.spec-helper';
import { createStynxSessionStub } from '../../../testing/stynx-session.stub';
// Produção (TASK-0006): ainda não existe.
import { ForbiddenPageComponent } from './forbidden.page';
import { NotFoundPageComponent } from './not-found.page';
import { AuthCallbackPageComponent } from './auth-callback.page';
import {
  PlaceholderPageComponent,
  PlaceholderLayoutComponent,
} from '../../shared/placeholder-page.component';

const FORBIDDEN_KEYS = [
  'rait.states.forbidden',
  'rait.errors.forbidden',
  'rait.common.back',
] as const;

describe('C-2A-63 — ForbiddenPageComponent', () => {
  it('dado /sem-permissao?de=/gestao quando renderizada então título forbidden, mensagem errors.forbidden, link back, sem navegação automática, sem data-screen (A7d, coerente com C-2A-13)', async () => {
    TestBed.configureTestingModule({
      imports: [ForbiddenPageComponent, markerI18nModule([...FORBIDDEN_KEYS])],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'de' ? '/gestao' : null),
              },
            },
          },
        },
      ],
    });
    await initializeMarkerI18n();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(ForbiddenPageComponent);
    fixture.detectChanges();
    const catalog = buildTestCatalog([...FORBIDDEN_KEYS]);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(catalog['rait.states.forbidden']);
    expect(host.textContent).toContain(catalog['rait.errors.forbidden']);
    expect(host.textContent).toContain(catalog['rait.common.back']);
    const link: HTMLAnchorElement | null = host.querySelector('a[href="/"]');
    expect(link).not.toBeNull();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(host.hasAttribute('data-screen')).toBe(false);
    await expectA11yStateInvariants(host);
  });
});

describe('C-2A-64 — NotFoundPageComponent / PlaceholderPageComponent / PlaceholderLayoutComponent', () => {
  it('dado /nao-existe quando renderizada NotFoundPageComponent então title not_found e link /', async () => {
    TestBed.configureTestingModule({
      imports: [
        NotFoundPageComponent,
        markerI18nModule(['rait.states.not_found']),
      ],
      providers: [provideRouter([])],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(NotFoundPageComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(
      buildTestCatalog(['rait.states.not_found'])['rait.states.not_found'],
    );
    expect(host.querySelector('a[href="/"]')).not.toBeNull();
  });

  it('dado PlaceholderPageComponent quando renderizado então expectA11yStateInvariants', async () => {
    TestBed.configureTestingModule({
      imports: [
        PlaceholderPageComponent,
        markerI18nModule(['rait.states.unavailable_in_version']),
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { screen: 'T-01' } } },
        },
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(PlaceholderPageComponent);
    fixture.detectChanges();
    await expectA11yStateInvariants(fixture.nativeElement);
  });

  it('dado PlaceholderLayoutComponent com filho ativo quando renderizado então o filho aparece no router-outlet', async () => {
    const CHILD_MARKER = 'FILHO-DO-LAYOUT';
    @Component({
      selector: 'rait-test-child',
      standalone: true,
      template: CHILD_MARKER,
    })
    class ChildStubComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            component: PlaceholderLayoutComponent,
            data: { screen: null },
            children: [{ path: 'child', component: ChildStubComponent }],
          },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/child');
    expect(harness.routeNativeElement?.textContent).toContain(CHILD_MARKER);
  });
});

describe('C-2A-65 — AuthCallbackPageComponent', () => {
  function withLocation(search: string): void {
    window.history.pushState({}, '', `/auth/callback${search}`);
  }

  it('dado URL "?code=abc&state=xyz" quando iniciada então completeLogin chamado e navega para "/"', async () => {
    withLocation('?code=abc&state=xyz');
    const stynxStub = createStynxSessionStub();
    TestBed.configureTestingModule({
      imports: [
        AuthCallbackPageComponent,
        markerI18nModule(['rait.states.error']),
      ],
      providers: [
        provideRouter([]),
        { provide: StynxSessionService, useValue: stynxStub },
      ],
    });
    await initializeMarkerI18n();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AuthCallbackPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(stynxStub.completeLogin).toHaveBeenCalledTimes(1);
    expect(stynxStub.login).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('dado URL sem code/state quando iniciada então login chamado e nenhuma navegação', async () => {
    withLocation('');
    const stynxStub = createStynxSessionStub();
    TestBed.configureTestingModule({
      imports: [
        AuthCallbackPageComponent,
        markerI18nModule(['rait.states.error']),
      ],
      providers: [
        provideRouter([]),
        { provide: StynxSessionService, useValue: stynxStub },
      ],
    });
    await initializeMarkerI18n();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(AuthCallbackPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(stynxStub.login).toHaveBeenCalledTimes(1);
    expect(stynxStub.completeLogin).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('dado completeLogin rejeitando quando iniciada então rait-error-banner com rait.states.error', async () => {
    withLocation('?code=abc&state=xyz');
    const stynxStub = createStynxSessionStub();
    stynxStub.completeLogin.mockRejectedValueOnce(new Error('falhou'));
    TestBed.configureTestingModule({
      imports: [
        AuthCallbackPageComponent,
        markerI18nModule(['rait.states.error']),
      ],
      providers: [
        provideRouter([]),
        { provide: StynxSessionService, useValue: stynxStub },
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(AuthCallbackPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('rait-error-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain(
      buildTestCatalog(['rait.states.error'])['rait.states.error'],
    );
  });
});
