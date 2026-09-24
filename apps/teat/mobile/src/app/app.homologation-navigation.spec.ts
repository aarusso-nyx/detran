import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type Routes } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';
import { expectTeatA11yState } from '../testing/a11y-state.spec-helper';
import { AppComponent } from './app.component';
import { TEAT_ROUTES } from './app.routes';
import {
  AuthBootstrapCoordinator,
  BootstrapStore,
  TEAT_GUARD_CONTEXT,
  type GuardContext,
} from './core/bootstrap.store';
import { TEAT_BODYCAM_STATE } from './core/bodycam-indicator.component';
import { TeatI18n } from './core/i18n.service';
import {
  ReadinessGateService,
  TEAT_READINESS_WARNING_SINK,
} from './core/readiness-gate.service';
import { LocalActStore } from './data/local/local-act.store';
import { MobileBootstrapClient } from './data/api/mobile-bootstrap.client';
import { OfflineSyncClient } from './data/api/offline-sync.client';
import { SyncWorker } from './data/sync/sync.worker';
import { NormativePackageService } from './data/normative/normative-package.service';
import catalog from './i18n/teat.pt-BR.json';
import {
  createHomologationAitScenario,
  TEAT_HOMOLOGATION_AIT,
} from './shared/homologation-ait.port';
import { homologationHttpBlockInterceptor } from './shared/homologation-http.interceptor';
import { TEAT_MOBILE_PRINTER } from './shared/mobile-printer.port';
import {
  createTeatMobileHomologationShift,
  TEAT_MOBILE_HOMOLOGATION_SHIFT,
} from './shared/homologation-shift.port';

async function guardContextFactory(): Promise<() => GuardContext> {
  const runtime = await loadMobileRuntime('shared/homologation-guard-context');
  const factory = runtime['createHomologationGuardContext'];
  expect(factory).toBeTypeOf('function');
  return factory as () => GuardContext;
}

async function sessionProviders(): Promise<readonly Provider[]> {
  const runtime = await loadMobileRuntime('shared/homologation-guard-context');
  const provide = runtime['provideTeatMobileHomologationSession'];
  expect(provide).toBeTypeOf('function');
  return (provide as () => readonly Provider[])();
}

async function personaRuntime(): Promise<
  Readonly<{
    token: unknown;
    create: () => Readonly<{
      role: () => string;
      setRole(role: string): void;
    }>;
  }>
> {
  const runtime = await loadMobileRuntime('shared/homologation-persona.port');
  const token = runtime['TEAT_MOBILE_HOMOLOGATION_PERSONA'];
  const create = runtime['createTeatMobileHomologationPersona'];
  expect(token).toBeDefined();
  expect(create).toBeTypeOf('function');
  return {
    token,
    create: create as () => Readonly<{
      role: () => string;
      setRole(role: string): void;
    }>,
  };
}

async function syncRuntime(): Promise<
  Readonly<{ token: unknown; create: () => unknown }>
> {
  const runtime = await loadMobileRuntime('shared/homologation-sync.port');
  const token = runtime['TEAT_MOBILE_HOMOLOGATION_SYNC'];
  const create = runtime['createTeatMobileHomologationSync'];
  expect(token).toBeDefined();
  expect(create).toBeTypeOf('function');
  return { token, create: create as () => unknown };
}

function configureNavigation(
  contextFactory: () => GuardContext,
  extraProviders: readonly Provider[] = [],
  routes: Routes = TEAT_ROUTES,
): void {
  const translations = catalog as Readonly<Record<string, string>>;
  TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptors([homologationHttpBlockInterceptor])),
      provideHttpClientTesting(),
      ...extraProviders,
      { provide: TEAT_GUARD_CONTEXT, useFactory: contextFactory },
      {
        provide: TEAT_HOMOLOGATION_AIT,
        useFactory: createHomologationAitScenario,
      },
      { provide: TEAT_BODYCAM_STATE, useValue: { state: signal('failure') } },
      {
        provide: TeatI18n,
        useValue: {
          initialize: async () => undefined,
          translate: (key: string) => translations[key] ?? key,
        },
      },
      { provide: LocalActStore, useValue: { pending: async () => [] } },
      {
        provide: BootstrapStore,
        useValue: {
          state: () => ({ status: 'blocked' }),
          snapshot: () => undefined,
          provisioningSnapshot: () => undefined,
        },
      },
      {
        provide: NormativePackageService,
        useValue: { usable: async () => undefined },
      },
      { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: () => {} } },
      ReadinessGateService,
    ],
  });
}

describe('ADR-0033 — jornadas mobile navegáveis sem autoridade produtiva', () => {
  it('demonstra login sintético com credencial explícita antes de MFA, sem IdP nem rede', async () => {
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      ...(await sessionProviders()),
      { provide: personaPort.token, useFactory: personaPort.create },
      {
        provide: TEAT_MOBILE_HOMOLOGATION_SHIFT,
        useFactory: createTeatMobileHomologationShift,
      },
    ]);
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    expect(await router.navigateByUrl('/auth-login')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const form = fixture.nativeElement.querySelector(
      '[data-screen="auth-login"] form[data-homologation-login]',
    ) as HTMLFormElement | null;
    expect(form).not.toBeNull();
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    const identity = form?.elements.namedItem(
      'demo_identity',
    ) as HTMLInputElement | null;
    const credential = form?.elements.namedItem(
      'demo_credential',
    ) as HTMLInputElement | null;
    if (form === null || identity === null || credential === null)
      throw new Error('demo-login-form-missing');
    identity.value = 'demo-agent';
    credential.value = 'invalid';
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/auth-login');
    expect(form.querySelector('[role="alert"]')).not.toBeNull();
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    credential.value = 'demo-only';
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/auth-mfa');
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('mantém /auth-mfa inspecionável em homologação e valida apenas código sintético explícito', async () => {
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      ...(await sessionProviders()),
      { provide: personaPort.token, useFactory: personaPort.create },
      {
        provide: TEAT_MOBILE_HOMOLOGATION_SHIFT,
        useFactory: createTeatMobileHomologationShift,
      },
      { provide: MobileBootstrapClient, useValue: { openShift: vi.fn() } },
      { provide: AuthBootstrapCoordinator, useValue: { start: vi.fn() } },
    ]);
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    expect(await router.navigateByUrl('/auth-mfa')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/auth-mfa');
    const form = fixture.nativeElement.querySelector(
      '[data-screen="auth-mfa"] form[data-homologation-mfa]',
    ) as HTMLFormElement | null;
    expect(form).not.toBeNull();
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    const input = form?.querySelector(
      '[name="demo_code"]',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    if (form === null || input === null)
      throw new Error('demo-mfa-form-missing');
    input.value = 'invalid';
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/auth-mfa');
    expect(form.querySelector('[role="alert"]')).not.toBeNull();
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    input.value = '000000';
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/shift-context');
    for (const route of ['/operation-select', '/open-shift']) {
      expect(await router.navigateByUrl(route)).toBe(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelector(
          `[data-screen="${route.slice(1)}"]`,
        ),
      ).not.toBeNull();
    }
    const openForm = fixture.nativeElement.querySelector(
      '[data-screen="open-shift"] form',
    ) as HTMLFormElement | null;
    expect(openForm).not.toBeNull();
    const unit = openForm?.elements.namedItem(
      'operational_unit_id',
    ) as HTMLSelectElement | null;
    const startedAt = openForm?.elements.namedItem(
      'started_at',
    ) as HTMLInputElement | null;
    expect(unit?.value).toBe('homologation-demo-unit');
    if (openForm === null || startedAt === null)
      throw new Error('demo-open-shift-form-missing');
    startedAt.value = '2026-09-23T10:00';
    openForm.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/home');
    expect(
      TestBed.inject(MobileBootstrapClient).openShift,
    ).not.toHaveBeenCalled();
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('rótulos e erros AIT de homologação vêm integralmente do catálogo canônico permitido', () => {
    const translations = catalog as Readonly<Record<string, string>>;
    const sources = [
      'src/app/features/ait/pages/ait-start.page.ts',
      'src/app/features/ait/pages/ait-review.page.ts',
      'src/app/features/ait/pages/ait-done.page.ts',
      'src/app/shared/homologation-ait-workflow.component.ts',
    ];
    const keys = new Set<string>();
    for (const sourcePath of sources) {
      const source = readFileSync(resolve(process.cwd(), sourcePath), 'utf8');
      expect(source).not.toContain('teat.' + 'homologation.ait.');
      expect(source).not.toMatch(
        />\s*(?:Placa|Condutor|Continuar|Confirmar etapa|Local|Motivo)\s*</,
      );
      for (const key of source.match(
        /teat\.forms\.homologationAit\.[A-Za-z]+/g,
      ) ?? []) {
        keys.add(key);
        expect(translations[key], `chave visível ${key}`).toBeTypeOf('string');
        expect(translations[key]?.trim().length).toBeGreaterThan(0);
      }
    }
    expect(keys.size).toBeGreaterThanOrEqual(35);
  });

  it('instala o contexto sintético somente na entrada de homologação', () => {
    const root = process.cwd();
    const common = readFileSync(resolve(root, 'src/main.ts'), 'utf8');
    const homologation = readFileSync(
      resolve(root, 'src/main.homologation.ts'),
      'utf8',
    );
    expect(common).not.toContain('createHomologationGuardContext');
    expect(common).not.toContain('provideTeatMobileHomologationSession');
    expect(common).not.toContain('TEAT_MOBILE_HOMOLOGATION_PERSONA');
    expect(common).not.toContain('TEAT_MOBILE_HOMOLOGATION_SYNC');
    expect(common).not.toContain('TEAT_HOMOLOGATION_ROUTES');
    expect(common).toContain('provideDetranAuthenticatedApp');
    expect(homologation).toContain('createHomologationGuardContext');
    expect(homologation).toContain('provideTeatMobileHomologationSession');
    expect(homologation).toContain('TEAT_MOBILE_HOMOLOGATION_PERSONA');
    expect(homologation).toContain('TEAT_MOBILE_HOMOLOGATION_SYNC');
    expect(homologation).toContain('TEAT_HOMOLOGATION_ROUTES');
    expect(homologation).not.toContain('provideDetranAuthenticatedApp');
    expect(homologation).toMatch(
      /provide:\s*TEAT_GUARD_CONTEXT[\s\S]*?useFactory:\s*createHomologationGuardContext/,
    );
  });

  it.each(['ait-start', 'ait-review'])(
    'renderiza /%s pelo RouterOutlet com guarda real e contexto sintético explícito, sem HTTP',
    async (screenId) => {
      configureNavigation(await guardContextFactory());
      const context = TestBed.inject(TEAT_GUARD_CONTEXT);
      expect(context.principal()?.roles).toContain('field-agent');
      expect(context.tenantId()).toMatch(/demo|synthetic|homolog/i);
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const navigated = await TestBed.inject(Router).navigateByUrl(
        `/${screenId}`,
      );
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(navigated).toBe(true);
      const page = fixture.nativeElement.querySelector(
        `[data-screen="${screenId}"]`,
      ) as HTMLElement | null;
      expect(page).not.toBeNull();
      expect(page?.getAttribute('data-profile')).toBe('homologation');
      expect(fixture.nativeElement.textContent).toContain(
        'HOMOLOGAÇÃO — SIMULAÇÃO',
      );
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
      expect(
        TestBed.inject(HttpTestingController).match(() => true).length,
      ).toBe(0);
    },
  );

  it('entrada homologada / abre login seguro sem alterar as 70 rotas comuns', async () => {
    const runtime = await loadMobileRuntime('app.homologation.routes');
    const routes = runtime['TEAT_HOMOLOGATION_ROUTES'] as Routes | undefined;
    expect(routes).toBeDefined();
    if (routes === undefined)
      throw new Error('mobile-homologation-routes-missing');
    expect(routes).toHaveLength(TEAT_ROUTES.length + 1);
    expect(routes[0]).toMatchObject({
      path: '',
      pathMatch: 'full',
      redirectTo: 'auth-login',
    });
    configureNavigation(
      await guardContextFactory(),
      await sessionProviders(),
      routes,
    );
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(await TestBed.inject(Router).navigateByUrl('/')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/auth-login');
    expect(
      fixture.nativeElement.querySelector('[data-screen="auth-login"]'),
    ).not.toBeNull();
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('nega /ait-start quando o contexto sintético omite o papel; não transforma homologação em bypass RBAC', async () => {
    const factory = await guardContextFactory();
    configureNavigation(() => {
      const context = factory();
      return {
        ...context,
        principal: () => ({ id: 'demo-agent-no-role', roles: [] }),
      };
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await expect(
      TestBed.inject(Router).navigateByUrl('/ait-start'),
    ).rejects.toThrow('Cannot match any routes');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[data-screen="ait-start"]'),
    ).toBeNull();
    expect(TestBed.inject(HttpTestingController).match(() => true).length).toBe(
      0,
    );
  });

  it('seleciona field-supervisor pela UI e só então navega /sync-conflict pelo roleGuard real', async () => {
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      { provide: personaPort.token, useFactory: personaPort.create },
    ]);
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    expect(persona.role()).toBe('field-agent');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await expect(
      TestBed.inject(Router).navigateByUrl('/sync-conflict'),
    ).rejects.toThrow('Cannot match any routes');
    fixture.detectChanges();
    const selector = fixture.nativeElement.querySelector(
      '[data-homologation-persona] select, select[data-homologation-persona]',
    ) as HTMLSelectElement | null;
    expect(selector).not.toBeNull();
    expect(
      [...(selector?.options ?? [])].map((option) => option.value),
    ).toContain('field-supervisor');
    if (selector === null) throw new Error('mobile-persona-selector-missing');
    selector.value = 'field-supervisor';
    selector.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(persona.role()).toBe('field-supervisor');
    const navigated =
      await TestBed.inject(Router).navigateByUrl('/sync-conflict');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(navigated).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-screen="sync-conflict"]'),
    ).not.toBeNull();
    expect(TestBed.inject(HttpTestingController).match(() => true).length).toBe(
      0,
    );
  });

  it('rejeita persona mobile inválida sem alterar o papel canônico atual', async () => {
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      { provide: personaPort.token, useFactory: personaPort.create },
    ]);
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    expect(persona.role()).toBe('field-agent');
    expect(() => persona.setRole('root-admin')).toThrow();
    expect(persona.role()).toBe('field-agent');
  });

  it('desmonta imediatamente /sync-conflict ao trocar de supervisor para agente sem permissão', async () => {
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      ...(await sessionProviders()),
      { provide: personaPort.token, useFactory: personaPort.create },
    ]);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const selector = fixture.nativeElement.querySelector(
      '[data-homologation-persona] select, select[data-homologation-persona]',
    ) as HTMLSelectElement | null;
    expect(selector).not.toBeNull();
    if (selector === null) throw new Error('mobile-persona-selector-missing');
    selector.value = 'field-supervisor';
    selector.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(await TestBed.inject(Router).navigateByUrl('/sync-conflict')).toBe(
      true,
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[data-screen="sync-conflict"]'),
    ).not.toBeNull();
    selector.value = 'field-agent';
    selector.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/auth-login');
    expect(
      fixture.nativeElement.querySelector('[data-screen="sync-conflict"]'),
    ).toBeNull();
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('percorre AIT sintético por formulários DOM, valida cada etapa e só conclui após revisão explícita', async () => {
    configureNavigation(await guardContextFactory());
    const writes = {
      putDraft: vi.fn(),
      putQueueItem: vi.fn(),
      putEvidence: vi.fn(),
      putReservation: vi.fn(),
      putPrintReceipt: vi.fn(),
    };
    const printReceipt = vi.fn();
    TestBed.overrideProvider(LocalActStore, {
      useValue: { pending: async () => [], ...writes },
    });
    TestBed.overrideProvider(TEAT_MOBILE_PRINTER, {
      useValue: { printReceipt },
    });
    const port = TestBed.inject(TEAT_HOMOLOGATION_AIT);
    const start = vi.spyOn(port, 'start');
    const review = vi.spyOn(port, 'review');
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    expect(await router.navigateByUrl('/ait-start')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    async function submitStep(screenId: string): Promise<void> {
      const form = fixture.nativeElement.querySelector(
        `form[data-homologation-workflow-step="${screenId}"]`,
      ) as HTMLFormElement | null;
      expect(form, `formulário DOM da etapa ${screenId}`).not.toBeNull();
      if (form === null) throw new Error(`ait-form-missing:${screenId}`);
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    function fill(name: string, value: string | boolean): void {
      const control = fixture.nativeElement.querySelector(
        `form[data-homologation-workflow-step] [name="${name}"]`,
      ) as HTMLInputElement | HTMLSelectElement | null;
      expect(control, `controle ${name}`).not.toBeNull();
      if (control === null) throw new Error(`ait-control-missing:${name}`);
      if (typeof value === 'boolean' && control instanceof HTMLInputElement) {
        control.checked = value;
      } else {
        control.value = String(value);
      }
      control.dispatchEvent(new Event('input', { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
    }

    await submitStep('ait-start');
    expect(router.url).toBe('/ait-start');
    expect(start).not.toHaveBeenCalled();
    fill('approach', 'with-approach');
    await submitStep('ait-start');
    expect(start.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ approach: 'with-approach' }),
    );
    expect(router.url).toBe('/ait-vehicle');

    fill('placa', 'INVALIDA');
    fill('visually_confirmed_by_agent', true);
    fill('divergencia', false);
    await submitStep('ait-vehicle');
    expect(router.url).toBe('/ait-vehicle');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    fill('placa', 'ABC1D23');
    fill('visually_confirmed_by_agent', false);
    await submitStep('ait-vehicle');
    expect(router.url).toBe('/ait-vehicle');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();
    fill('visually_confirmed_by_agent', true);
    await submitStep('ait-vehicle');
    expect(router.url).toBe('/ait-driver');

    fill('identified_by', 'manual');
    fill('condutor', 'CONDUTOR SINTÉTICO');
    fill('abordagem', 'com abordagem');
    await submitStep('ait-driver');
    expect(router.url).toBe('/ait-frame');
    await submitStep('ait-frame');
    expect(router.url).toBe('/ait-frame');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();
    fill('enquadramento', 'DEMO-ENQUADRAMENTO');
    fill('approach_class', 'caso_1');
    expect(
      fixture.nativeElement.querySelector('[name="required_fields"]'),
    ).not.toBeNull();
    fill('requires_equipment', false);
    await submitStep('ait-frame');
    expect(router.url).toBe('/ait-frame-detail');
    await submitStep('ait-frame-detail');
    expect(router.url).toBe('/ait-frame-detail');
    fill('confirm', true);
    await submitStep('ait-frame-detail');
    expect(router.url).toBe('/ait-location');
    await submitStep('ait-location');
    expect(router.url).toBe('/ait-location');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();
    fill('local', 'Via sintética');
    fill('uf', 'SP');
    fill('municipio', 'Município demo');
    fill('gps_accuracy_m', '10');
    fill('manual_edition', true);
    await submitStep('ait-location');
    expect(router.url).toBe('/ait-notes');
    for (const [from, to] of [
      ['ait-notes', 'ait-validations'],
      ['ait-validations', 'ait-evidence'],
    ] as const) {
      fill('confirm', true);
      await submitStep(from);
      expect(router.url).toBe(`/${to}`);
    }
    fill('tipo', 'photo');
    fill('hash', 'a'.repeat(64));
    await submitStep('ait-evidence');
    expect(router.url).toBe('/ait-measures');
    fill('confirm', true);
    await submitStep('ait-measures');
    expect(router.url).toBe('/ait-signature');
    fill('resultado', 'assinado');
    await submitStep('ait-signature');
    expect(router.url).toBe('/ait-review');
    expect(review).not.toHaveBeenCalled();
    const hash = fixture.nativeElement.querySelector(
      '[data-scenario-hash]',
    ) as HTMLElement | null;
    expect(hash?.textContent).toMatch(/[a-f0-9]{64}/i);
    expect(fixture.nativeElement.textContent).toContain('ABC1D23');
    await submitStep('ait-review');
    expect(router.url).toBe('/ait-review');
    expect(review).not.toHaveBeenCalled();
    fill('explicit_action', 'finalize');
    await submitStep('ait-review');
    expect(review.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ explicit_action: 'finalize' }),
    );
    expect(router.url).toBe('/ait-done');
    const done = fixture.nativeElement.querySelector(
      '[data-screen="ait-done"]',
    ) as HTMLElement | null;
    expect(done).not.toBeNull();
    expect(done?.getAttribute('data-state')).toBe('demonstrated');
    expect(done?.textContent).toContain('demo-ait-001');
    expect(done?.textContent).toContain('ABC1D23');
    expect(done?.textContent).toContain(
      (catalog as Readonly<Record<string, string>>)['teat.states.demonstrated'],
    );
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
    for (const write of Object.values(writes))
      expect(write).not.toHaveBeenCalled();
    expect(printReceipt).not.toHaveBeenCalled();
  });

  it('sem port de homologação, /ait-done não afirma conclusão nem expõe agregado sintético', async () => {
    configureNavigation(await guardContextFactory());
    TestBed.overrideProvider(TEAT_HOMOLOGATION_AIT, { useValue: null });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(await TestBed.inject(Router).navigateByUrl('/ait-done')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const done = fixture.nativeElement.querySelector(
      '[data-screen="ait-done"]',
    ) as HTMLElement | null;
    expect(done?.getAttribute('data-state')).not.toBe('demonstrated');
    expect(done?.textContent).not.toContain('demo-ait-001');
    expect(done?.textContent).not.toContain(
      (catalog as Readonly<Record<string, string>>)['teat.states.demonstrated'],
    );
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('demonstra fila, falha, retry e conflito sync sem worker, cliente ou store oficial', async () => {
    const sync = await syncRuntime();
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      { provide: sync.token, useFactory: sync.create },
      { provide: personaPort.token, useFactory: personaPort.create },
    ]);
    const submitNext = vi.fn();
    const submitBatch = vi.fn();
    const resolveConflict = vi.fn();
    const putQueueItem = vi.fn();
    const applyReceipts = vi.fn();
    TestBed.overrideProvider(SyncWorker, { useValue: { submitNext } });
    TestBed.overrideProvider(OfflineSyncClient, {
      useValue: { submitBatch, resolveConflict },
    });
    TestBed.overrideProvider(LocalActStore, {
      useValue: {
        pending: async () => [],
        putQueueItem,
        applyReceipts,
      },
    });
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    persona.setRole('field-supervisor');
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    expect(await router.navigateByUrl('/sync')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    async function act(step: string, action: string): Promise<void> {
      const panel = fixture.nativeElement.querySelector(
        `[data-homologation-sync-step="${step}"]`,
      ) as HTMLElement | null;
      expect(panel, `painel demo ${step}`).not.toBeNull();
      const button = panel?.querySelector(
        `[data-sync-action="${action}"]`,
      ) as HTMLButtonElement | null;
      expect(button, `ação demo ${action}`).not.toBeNull();
      if (button === null) throw new Error(`sync-action-missing:${action}`);
      button.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    await act('sync', 'enqueue');
    expect(router.url).toBe('/sync');
    expect(fixture.nativeElement.textContent).toMatch(/SIMULAD|HOMOLOG/i);
    await act('sync', 'open-item');
    expect(router.url).toBe('/sync-item');
    await act('sync-item', 'fail');
    expect(fixture.nativeElement.textContent).toMatch(/falha|erro/i);
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    await act('sync-item', 'retry');
    expect(router.url).toBe('/sync');
    await act('sync', 'open-conflict');
    expect(router.url).toBe('/sync');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();
    await act('sync', 'mark-conflict');
    expect(fixture.nativeElement.textContent).toMatch(/conflito/i);
    await act('sync', 'open-conflict');
    expect(router.url).toBe('/sync-conflict');
    await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    await act('sync-conflict', 'resolve');
    expect(fixture.nativeElement.textContent).toMatch(/resolvid|demonstrad/i);
    expect(submitNext).not.toHaveBeenCalled();
    expect(submitBatch).not.toHaveBeenCalled();
    expect(resolveConflict).not.toHaveBeenCalled();
    expect(putQueueItem).not.toHaveBeenCalled();
    expect(applyReceipts).not.toHaveBeenCalled();
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('ações sync fora de ordem apenas alertam e preservam fila sintética vazia', async () => {
    const sync = await syncRuntime();
    const personaPort = await personaRuntime();
    configureNavigation(await guardContextFactory(), [
      { provide: sync.token, useFactory: sync.create },
      { provide: personaPort.token, useFactory: personaPort.create },
    ]);
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    persona.setRole('field-supervisor');
    const state = TestBed.inject(sync.token as never) as {
      status(): string;
    };
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    for (const [route, action] of [
      ['sync-item', 'fail'],
      ['sync-item', 'retry'],
      ['sync', 'mark-conflict'],
      ['sync-conflict', 'resolve'],
    ] as const) {
      if (router.url !== `/${route}`) {
        expect(await router.navigateByUrl(`/${route}`)).toBe(true);
      }
      fixture.detectChanges();
      await fixture.whenStable();
      const button = fixture.nativeElement.querySelector(
        `[data-homologation-sync-step="${route}"] [data-sync-action="${action}"]`,
      ) as HTMLButtonElement | null;
      expect(button, `controle ${action}`).not.toBeNull();
      expect(
        () => button?.click(),
        `${action} fora de ordem não lança`,
      ).not.toThrow();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(router.url).toBe(`/${route}`);
      expect(state.status()).toBe('empty');
      expect(
        fixture.nativeElement.querySelector('[role="alert"]'),
      ).not.toBeNull();
      expect(
        TestBed.inject(HttpTestingController).match(() => true),
      ).toHaveLength(0);
    }
  });

  it('sessão sintética não inicia OIDC, não redireciona e não grava auth storage', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([homologationHttpBlockInterceptor])),
        provideHttpClientTesting(),
        ...(await sessionProviders()),
      ],
    });
    const session = TestBed.inject(StynxSessionService) as unknown as {
      active(): boolean;
      login(): unknown;
    };
    const tenant = TestBed.inject(TenantContextService);
    const beforeUrl = window.location.href;
    const beforeLocalStorage = { ...localStorage };
    const beforeSessionStorage = { ...sessionStorage };
    expect(session.active()).toBe(true);
    expect(tenant.tenantId()).toMatch(/demo|synthetic|homolog/i);
    await Promise.resolve(session.login());
    expect(window.location.href).toBe(beforeUrl);
    expect({ ...localStorage }).toEqual(beforeLocalStorage);
    expect({ ...sessionStorage }).toEqual(beforeSessionStorage);
    expect(TestBed.inject(HttpTestingController).match(() => true).length).toBe(
      0,
    );
  });
});
