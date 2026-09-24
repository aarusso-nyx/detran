import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Component, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  RouterOutlet,
  type CanMatchFn,
  type Route,
  type Routes,
  type UrlSegment,
} from '@angular/router';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { expect, it, vi } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';
import { TeatI18n } from './core/i18n.service';
import { readRuntimeConfig } from './core/runtime-config';
import { MobileBootstrapClient } from './data/api/mobile-bootstrap.client';
import { ProvisioningClient } from './data/api/provisioning.client';
import { LocalActStore } from './data/local/local-act.store';
import { TURNO_ROUTES } from './features/turno/turno.routes';
import { AIT_ROUTES } from './features/ait/ait.routes';
import { AppComponent } from './app.component';
import { TEAT_ROUTES } from './app.routes';
import {
  readinessGuard,
  TEAT_BOAT_EXTENSION,
} from './navigation/guards/readiness.guard';

const readyBootstrap = {
  protocolVersion: '1.0',
  requestedProtocolVersion: '1.0',
  snapshot: {
    capturedAt: '2026-09-22T00:00:00Z',
    validUntil: '2999-01-01T00:00:00Z',
    maxAgeSeconds: 86400,
    authority: {},
  },
  context: {
    tenantId: 'tenant-001',
    trafficAgencyId: 'agency-001',
    agent: { id: 'agent-001' },
    device: {
      id: 'device-001',
      status: 'authorized',
      homologated: true,
      tamperDetected: false,
    },
    session: {
      id: 'shift-001',
      startedAt: '2026-09-22T00:00:00Z',
      exclusive: true,
    },
    activeShift: { id: 'shift-001', status: 'open' },
  },
  normativePackage: {
    manifestHash: 'sha256:manifest',
    validUntil: '2999-01-01T00:00:00Z',
  },
  numberingReservations: [
    {
      id: 'reservation-001',
      rangeId: 'range-001',
      series: 'F',
      shiftId: 'shift-001',
      startNumber: 101,
      endNumber: 102,
      validUntil: '2999-01-01T00:00:00.000Z',
      status: 'reserved',
    },
  ],
  readiness: { blockers: [], preShiftReady: true, offlineReady: true },
  capabilities: {
    canOpenShift: true,
    canOperateOffline: true,
    canReserveNumbering: true,
  },
} as const;

@Component({ standalone: true, template: '<main>home</main>' })
class HomeHarnessComponent {}

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class RouterHarnessComponent {}

const readyProvisioning = {
  device_id: 'device-001',
  ready: true,
  remaining_acts: 1,
  remaining_numbering_count: 1,
  blockers: [],
  evaluated_at: '2026-09-22T00:00:00Z',
} as const;

it('F001 index carrega runtime-config público sem identidade default e readRuntimeConfig falha fechado', () => {
  const indexPath = resolve(process.cwd(), 'src/index.html');
  const runtimeScriptPath = resolve(process.cwd(), 'public/runtime-config.js');
  const document = new DOMParser().parseFromString(
    readFileSync(indexPath, 'utf8'),
    'text/html',
  );
  const runtimeScript = [...document.querySelectorAll('script')].find(
    (script) => script.getAttribute('src') === '/runtime-config.js',
  );
  expect
    .soft(
      runtimeScript,
      'index.html deve carregar /runtime-config.js antes do bundle',
    )
    .toBeDefined();
  expect
    .soft(
      existsSync(runtimeScriptPath),
      'public/runtime-config.js precisa integrar o artefato',
    )
    .toBe(true);
  const original = window.__DETRAN_RUNTIME_CONFIG__;
  try {
    for (const invalid of [
      undefined,
      {},
      { tenantId: '', oidcAuthority: '', clientId: '' },
      { tenantId: 'tenant-only' },
    ]) {
      window.__DETRAN_RUNTIME_CONFIG__ = invalid;
      expect(() => readRuntimeConfig()).toThrowError(
        'teat-runtime-config-invalid',
      );
    }
    window.__DETRAN_RUNTIME_CONFIG__ = {
      tenantId: 'tenant-runtime',
      oidcAuthority: 'https://issuer.example.test',
      clientId: 'client-runtime',
    };
    expect(readRuntimeConfig()).toEqual(window.__DETRAN_RUNTIME_CONFIG__);
  } finally {
    window.__DETRAN_RUNTIME_CONFIG__ = original;
  }
  if (!existsSync(runtimeScriptPath)) return;

  const isolatedWindow: {
    __DETRAN_RUNTIME_CONFIG__?: Record<string, unknown>;
  } = {};
  Function('window', readFileSync(runtimeScriptPath, 'utf8'))(isolatedWindow);
  const supplied = isolatedWindow.__DETRAN_RUNTIME_CONFIG__ ?? {};
  expect(Object.keys(supplied).sort()).toEqual([
    'clientId',
    'oidcAuthority',
    'tenantId',
  ]);
  expect(Object.values(supplied).every((value) => value === '')).toBe(true);
  expect(
    Object.keys(supplied).some((key) =>
      /secret|token|password|credential/i.test(key),
    ),
  ).toBe(false);
});

it('F001 mantém auth/bootstrap reativos e limpa principal, tenant, bootstrap e readiness no logout do mesmo injector', async () => {
  const runtime = await loadMobileRuntime('core/bootstrap.store');
  const Coordinator = runtime['AuthBootstrapCoordinator'] as
    | (new (...args: never[]) => {
        start(): Promise<unknown>;
        clearOnSessionEnd(): void;
      })
    | undefined;
  expect(Coordinator, 'AuthBootstrapCoordinator de produção').toBeTypeOf(
    'function',
  );
  const mobileSessionToken =
    runtime['TEAT_MOBILE_STYNX_SESSION_PORT'] ?? runtime['TEAT_MOBILE_SESSION'];
  expect(
    mobileSessionToken,
    'token Angular do MobileStynxSessionPort',
  ).toBeDefined();
  const contextFactory = runtime['createTeatGuardContext'] as () => Record<
    string,
    unknown
  >;
  const sessionState = signal({
    active: false,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    sid: null as string | null,
    permissions: [] as string[],
    tenantId: null as string | null,
    claims: null as Record<string, unknown> | null,
  });
  const loginCall = vi.fn();
  let resolveLogin!: () => void;
  const loginGate = new Promise<void>((resolve) => {
    resolveLogin = resolve;
  });
  const completeLogin = vi.fn(async () => {
    await loginGate;
    sessionState.set({
      active: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sid: 'session-001',
      permissions: [],
      tenantId: 'tenant-001',
      claims: { sub: 'agent-001', roles: ['field-agent'] },
    });
    return sessionState();
  });
  let resolveCurrentSession!: (value: Record<string, unknown>) => void;
  const currentSessionGate = new Promise<Record<string, unknown>>((resolve) => {
    resolveCurrentSession = resolve;
  });
  const currentSession = vi.fn(() => currentSessionGate);
  const logout = vi.fn(async () => {
    sessionState.update((value) => ({ ...value, active: false, claims: null }));
  });
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: StynxSessionService,
        useValue: {
          state: sessionState,
          active: () => sessionState().active,
          login: loginCall,
          completeLogin,
          logout,
          snapshot: () => sessionState(),
        },
      },
      {
        provide: TenantContextService,
        useValue: { tenantId: () => 'tenant-001' },
      },
      {
        provide: mobileSessionToken,
        useValue: {
          currentSession,
        },
      },
      {
        provide: MobileBootstrapClient,
        useFactory: () => new MobileBootstrapClient(TestBed.inject(HttpClient)),
      },
      {
        provide: ProvisioningClient,
        useFactory: () => new ProvisioningClient(TestBed.inject(HttpClient)),
      },
      runtime['BootstrapStore'] as never,
      Coordinator as never,
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: { defaultLocale: 'pt-BR', loadCatalog: async () => ({}) },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const context = TestBed.runInInjectionContext(contextFactory);
  const loginRoute = TURNO_ROUTES.find(
    (candidate) => candidate.path === 'auth-login',
  );
  const mfaRoute = TURNO_ROUTES.find(
    (candidate) => candidate.path === 'auth-mfa',
  );
  expect(
    loginRoute?.canMatch ?? [],
    '/auth-login não pode exigir sessão TEAT',
  ).toHaveLength(0);
  expect(
    mfaRoute?.canMatch ?? [],
    '/auth-mfa não pode exigir sessão TEAT',
  ).toHaveLength(0);

  const loginPageRuntime = await loadMobileRuntime(
    'features/turno/pages/auth-login.page',
  );
  const LoginPage = loginPageRuntime['AuthLoginPageComponent'] as new () => {
    login(): void;
  };
  TestBed.runInInjectionContext(() => new LoginPage()).login();
  expect(loginCall).toHaveBeenCalledOnce();

  const mfaPageRuntime = await loadMobileRuntime(
    'features/turno/pages/auth-mfa.page',
  );
  const MfaPage = mfaPageRuntime['AuthMfaPageComponent'] as new () => {
    completeLogin(): Promise<void>;
  };
  const completion = TestBed.runInInjectionContext(
    () => new MfaPage(),
  ).completeLogin();
  const http = TestBed.inject(HttpTestingController);
  expect(
    currentSession,
    'bootstrap não pode ler sessão móvel antes do callback',
  ).not.toHaveBeenCalled();
  http.expectNone((request) => request.url === '/v1/ops/mobile-bootstrap');
  resolveLogin();
  await loginGate;
  await vi.waitFor(() => expect(currentSession).toHaveBeenCalledOnce());
  http.expectNone((request) => request.url === '/v1/ops/mobile-bootstrap');
  resolveCurrentSession({
    tenantId: 'tenant-001',
    orgUnitId: 'agency-001',
    agentId: 'agent-001',
    deviceId: 'device-001',
    shiftId: 'shift-001',
    appVersion: '1.0.0',
    roles: ['field-agent'],
  });
  await vi.waitFor(() => {
    const requests = http.match(
      (request) => request.url === '/v1/ops/mobile-bootstrap',
    );
    expect(requests).toHaveLength(1);
    requests[0]?.flush(readyBootstrap);
  });
  await vi.waitFor(() => {
    const requests = http.match(
      '/v1/ops/provisioning/devices/device-001/readiness',
    );
    expect(requests).toHaveLength(1);
    requests[0]?.flush(readyProvisioning);
  });
  await completion;
  for (const accessor of [
    'principal',
    'tenantId',
    'allowedRoles',
    'bootstrap',
    'provisioning',
  ]) {
    expect(
      context[accessor],
      `GuardContext.${accessor} deve ser accessor reativo`,
    ).toBeTypeOf('function');
  }
  expect((context['principal'] as () => unknown)()).toMatchObject({
    id: 'agent-001',
  });
  await logout();
  TestBed.tick();
  expect((context['principal'] as () => unknown)()).toBeUndefined();
  expect((context['tenantId'] as () => unknown)()).toBeUndefined();
  expect((context['bootstrap'] as () => unknown)()).toBeUndefined();
  expect((context['provisioning'] as () => unknown)()).toBeUndefined();
  http.verify();
});

it('F001 /auth-mfa executa callback pelo lifecycle, aguarda completeLogin(url) e só então inicia bootstrap/navega', async () => {
  const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
  const mfaRuntime = await loadMobileRuntime(
    'features/turno/pages/auth-mfa.page',
  );
  const pageRuntime = await loadMobileRuntime('shared/mobile-page.component');
  const Page = mfaRuntime['AuthMfaPageComponent'] as never;
  const Coordinator = bootstrapRuntime['AuthBootstrapCoordinator'];
  let resolveLogin!: () => void;
  const loginCompleted = new Promise<void>((resolve) => {
    resolveLogin = resolve;
  });
  const completeLogin = vi.fn((url: string) => {
    void url;
    return loginCompleted;
  });
  const start = vi.fn(async () => ({ status: 'ready' }));
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'auth-mfa', component: Page },
        { path: 'home', component: HomeHarnessComponent },
      ]),
      { provide: StynxSessionService, useValue: { completeLogin } },
      { provide: Coordinator, useValue: { start } },
      {
        provide: pageRuntime['MobilePageRuntime'],
        useValue: { load: () => ({ load: async () => ({ kind: 'loaded' }) }) },
      },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const router = TestBed.inject(Router);
  const fixture = TestBed.createComponent(Page);
  fixture.detectChanges();
  await vi.waitFor(() => expect(completeLogin).toHaveBeenCalledOnce());
  expect(completeLogin).toHaveBeenCalledOnce();
  expect(completeLogin).toHaveBeenCalledWith(window.location.href);
  expect(
    start,
    'bootstrap não pode começar antes do callback OIDC resolver',
  ).not.toHaveBeenCalled();
  resolveLogin();
  await vi.waitFor(() => expect(start).toHaveBeenCalledOnce());
  await vi.waitFor(() => expect(router.url).toBe('/home'));
  await fixture.whenStable();
});

it('F001 evento real de login usa a rota lazy produtiva e chama STYNX login', async () => {
  const pageRuntime = await loadMobileRuntime('shared/mobile-page.component');
  const login = vi.fn();
  expect(TEAT_ROUTES).toHaveLength(8);
  expect(
    TEAT_ROUTES.every(
      (route) =>
        typeof route.loadChildren === 'function' &&
        route.component === undefined,
    ),
  ).toBe(true);
  TestBed.configureTestingModule({
    imports: [RouterHarnessComponent],
    providers: [
      provideRouter(TEAT_ROUTES),
      { provide: StynxSessionService, useValue: { login } },
      {
        provide: pageRuntime['MobilePageRuntime'],
        useValue: { load: () => ({ load: async () => ({ kind: 'loaded' }) }) },
      },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const fixture = TestBed.createComponent(RouterHarnessComponent);
  await TestBed.inject(Router).navigateByUrl('/auth-login');
  fixture.detectChanges();
  await fixture.whenStable();
  const button = fixture.nativeElement.querySelector(
    'button',
  ) as HTMLButtonElement | null;
  expect(
    button,
    '/auth-login precisa expor controle acionável real',
  ).not.toBeNull();
  button?.click();
  expect(login).toHaveBeenCalledOnce();
});

for (const scenario of [
  {
    label: 'ready com turno',
    state: {
      status: 'ready',
      bootstrap: { context: { activeShift: { status: 'open' } } },
    },
    target: '/home',
  },
  {
    label: 'ready sem turno',
    state: { status: 'ready', bootstrap: { context: {} } },
    target: '/shift-context',
  },
] as const) {
  it(`F001 callback lazy produtivo ${scenario.label} navega para ${scenario.target}`, async () => {
    const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
    const pageRuntime = await loadMobileRuntime('shared/mobile-page.component');
    const routeGroups = await Promise.all(
      TEAT_ROUTES.map(async (route) =>
        route.loadChildren === undefined
          ? []
          : ((await route.loadChildren()) as Routes),
      ),
    );
    const destination = routeGroups
      .flat()
      .find((route) => route.path === scenario.target.slice(1));
    expect(destination, `destino produtivo ${scenario.target}`).toBeDefined();
    expect(destination?.loadComponent).toBeTypeOf('function');
    expect(
      destination?.canMatch?.length,
      `guards reais de ${scenario.target}`,
    ).toBeGreaterThan(0);
    const scenarioBootstrap = {
      ...readyBootstrap,
      context: {
        ...readyBootstrap.context,
        ...(scenario.label === 'ready sem turno'
          ? { activeShift: null, session: null }
          : {}),
      },
      ...(scenario.label === 'ready sem turno'
        ? {
            numberingReservations: [],
            readiness: {
              blockers: ['NUMBERING_RESERVATION_REQUIRED'],
              preShiftReady: true,
              offlineReady: false,
            },
            capabilities: {
              canOpenShift: true,
              canOperateOffline: false,
              canReserveNumbering: false,
            },
          }
        : {}),
    };
    TestBed.configureTestingModule({
      imports: [RouterHarnessComponent],
      providers: [
        provideRouter(TEAT_ROUTES),
        {
          provide: StynxSessionService,
          useValue: { completeLogin: vi.fn(async () => undefined) },
        },
        {
          provide: bootstrapRuntime['AuthBootstrapCoordinator'],
          useValue: { start: vi.fn(async () => scenario.state) },
        },
        {
          provide: bootstrapRuntime['TEAT_GUARD_CONTEXT'],
          useValue: {
            principal: () => ({ id: 'agent-001', roles: ['field-agent'] }),
            tenantId: () => 'tenant-001',
            allowedRoles: () => ['field-agent'],
            bootstrap: () => scenarioBootstrap,
            provisioning: () => readyProvisioning,
          },
        },
        {
          provide: pageRuntime['MobilePageRuntime'],
          useValue: {
            load: () => ({ load: async () => ({ kind: 'loaded' }) }),
          },
        },
        {
          provide: STYNX_I18N_OPTIONS,
          useValue: {
            defaultLocale: 'pt-BR',
            loadCatalog: async () =>
              (await import('./i18n/teat.pt-BR.json')).default,
          },
        },
        StynxI18nService,
        TeatI18n,
      ],
    });
    const fixture = TestBed.createComponent(RouterHarnessComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/auth-mfa');
    fixture.detectChanges();
    await vi.waitFor(() => expect(router.url).toBe(scenario.target));
  });
}

it('F001 rejeição real do bootstrap usa coordinator/contexto produtivos e alcança /device-blocked', async () => {
  const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
  const pageRuntime = await loadMobileRuntime('shared/mobile-page.component');
  const sessionState = signal({
    active: true,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    sid: 'session-001',
    permissions: [] as string[],
    tenantId: 'tenant-001',
    claims: { sub: 'agent-001', roles: ['field-agent'] } as Record<
      string,
      unknown
    >,
  });
  TestBed.configureTestingModule({
    imports: [RouterHarnessComponent],
    providers: [
      provideRouter(TEAT_ROUTES),
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: StynxSessionService,
        useValue: {
          state: sessionState,
          active: () => sessionState().active,
          completeLogin: vi.fn(async () => sessionState()),
        },
      },
      {
        provide: TenantContextService,
        useValue: { tenantId: () => 'tenant-001' },
      },
      {
        provide: bootstrapRuntime['TEAT_MOBILE_STYNX_SESSION_PORT'],
        useValue: {
          currentSession: async () => ({
            tenantId: 'tenant-001',
            orgUnitId: 'agency-001',
            agentId: 'agent-001',
            deviceId: 'device-001',
            shiftId: '',
            appVersion: '1.0.0',
            roles: ['field-agent'],
          }),
        },
      },
      {
        provide: MobileBootstrapClient,
        useFactory: () => new MobileBootstrapClient(TestBed.inject(HttpClient)),
      },
      {
        provide: ProvisioningClient,
        useFactory: () => new ProvisioningClient(TestBed.inject(HttpClient)),
      },
      bootstrapRuntime['BootstrapStore'],
      bootstrapRuntime['AuthBootstrapCoordinator'],
      {
        provide: bootstrapRuntime['TEAT_GUARD_CONTEXT'],
        useFactory: bootstrapRuntime['createTeatGuardContext'],
      },
      {
        provide: pageRuntime['MobilePageRuntime'],
        useValue: { load: () => ({ load: async () => ({ kind: 'loaded' }) }) },
      },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const fixture = TestBed.createComponent(RouterHarnessComponent);
  const router = TestBed.inject(Router);
  await router.navigateByUrl('/auth-mfa');
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  await vi.waitFor(() => {
    const requests = http.match(
      (request) => request.url === '/v1/ops/mobile-bootstrap',
    );
    expect(requests).toHaveLength(1);
    requests[0]?.flush(
      { code: 'TEAT.BOOTSTRAP_UNAVAILABLE' },
      { status: 503, statusText: 'Unavailable' },
    );
  });
  await vi.waitFor(() => {
    const requests = http.match(
      '/v1/ops/provisioning/devices/device-001/readiness',
    );
    expect(requests).toHaveLength(1);
    requests[0]?.flush(readyProvisioning);
  });
  await vi.waitFor(() => expect(router.url).toBe('/device-blocked'));
  expect(
    TestBed.inject(bootstrapRuntime['TEAT_GUARD_CONTEXT'] as never),
  ).toBeDefined();
  http.verify();
});

it('F001 mudança de tenant preserva recuperação e invalida contexto operacional anterior', async () => {
  const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
  const pageRuntime = await loadMobileRuntime('shared/mobile-page.component');
  const tenantId = signal('tenant-001');
  const sessionState = signal({
    active: true,
    claims: {
      sub: 'agent-001',
      roles: ['field-agent'],
      device_id: 'device-001',
      shift_id: 'shift-001',
      app_version: '1.0.0',
    } as Record<string, unknown>,
  });
  TestBed.configureTestingModule({
    imports: [RouterHarnessComponent],
    providers: [
      provideRouter(TEAT_ROUTES),
      {
        provide: StynxSessionService,
        useValue: {
          state: sessionState,
          active: () => sessionState().active,
        },
      },
      { provide: TenantContextService, useValue: { tenantId } },
      {
        provide: MobileBootstrapClient,
        useValue: { getBootstrap: vi.fn(async () => readyBootstrap) },
      },
      {
        provide: ProvisioningClient,
        useValue: { readiness: vi.fn(async () => readyProvisioning) },
      },
      {
        provide: LocalActStore,
        useValue: {
          installAitReservationAuthorities: vi.fn(async () => undefined),
        },
      },
      bootstrapRuntime['BootstrapStore'],
      {
        provide: bootstrapRuntime['TEAT_GUARD_CONTEXT'],
        useFactory: bootstrapRuntime['createTeatGuardContext'],
      },
      {
        provide: pageRuntime['MobilePageRuntime'],
        useValue: {
          load: () => ({ load: async () => ({ kind: 'loaded' }) }),
        },
      },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const Store = bootstrapRuntime['BootstrapStore'] as new () => {
    refresh(
      input: {
        device_id: string;
        app_version: string;
      },
      authenticatedSession: {
        tenantId: string;
        orgUnitId: string;
        agentId: string;
        deviceId: string;
        shiftId: string;
        appVersion: string;
        roles: readonly string[];
      },
    ): Promise<unknown>;
  };
  await TestBed.inject(Store).refresh(
    {
      device_id: 'device-001',
      app_version: '1.0.0',
    },
    {
      tenantId: 'tenant-001',
      orgUnitId: 'unit-001',
      agentId: 'agent-001',
      deviceId: 'device-001',
      shiftId: 'shift-001',
      appVersion: '1.0.0',
      roles: ['field-agent'],
    },
  );
  const context = TestBed.inject(
    bootstrapRuntime['TEAT_GUARD_CONTEXT'] as never,
  ) as {
    principal(): Readonly<{ id: string; roles: readonly string[] }> | undefined;
    tenantId(): string | undefined;
    bootstrap(): unknown;
    provisioning(): unknown;
  };
  tenantId.set('tenant-002');
  expect(context.principal()).toMatchObject({
    id: 'agent-001',
    roles: ['field-agent'],
  });
  expect(context.tenantId()).toBe('tenant-002');

  const fixture = TestBed.createComponent(RouterHarnessComponent);
  const router = TestBed.inject(Router);
  await expect(router.navigateByUrl('/device-blocked')).resolves.toBe(true);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(router.url).toBe('/device-blocked');

  expect.soft(context.bootstrap()).toBeUndefined();
  expect.soft(context.provisioning()).toBeUndefined();
  await expect(router.navigateByUrl('/home')).resolves.toBe(false);
  expect(router.url).toBe('/device-blocked');
});

it('F006 readinessGuard delega a decisão integral ao ReadinessGateService', async () => {
  const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
  const readinessRuntime = await loadMobileRuntime(
    'core/readiness-gate.service',
  );
  const evaluate = vi
    .fn()
    .mockReturnValue({ allowed: true, blockers: [], warnings: [] });
  const context = {
    principal: () => ({ id: 'agent-001', roles: ['field-agent'] }),
    tenantId: () => 'tenant-001',
    allowedRoles: () => ['field-agent'],
    bootstrap: () => readyBootstrap,
    provisioning: () => readyProvisioning,
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: bootstrapRuntime['TEAT_GUARD_CONTEXT'], useValue: context },
      {
        provide: readinessRuntime['ReadinessGateService'],
        useValue: { evaluate },
      },
    ],
  });
  const decision = TestBed.runInInjectionContext(() =>
    readinessGuard(
      { data: { guardPlan: 'B' } } as Route,
      [] as UrlSegment[],
      {} as Parameters<CanMatchFn>[2],
    ),
  );
  expect(evaluate).toHaveBeenCalledOnce();
  expect(decision).toBe(true);

  evaluate.mockReturnValue({
    allowed: false,
    blockers: ['shift-not-open'],
    warnings: [],
  });
  const preShiftDecision = TestBed.runInInjectionContext(() =>
    readinessGuard(
      { path: 'shift-context', data: { guardPlan: 'B' } } as Route,
      [] as UrlSegment[],
      {} as Parameters<CanMatchFn>[2],
    ),
  );
  expect.soft(evaluate).toHaveBeenLastCalledWith(
    expect.objectContaining({
      destination: 'shift-context',
      preShift: true,
    }),
  );
  expect(
    preShiftDecision,
    'guard deve devolver a decisão do ReadinessGateService sem override local',
  ).toBe(false);
});

it('F006 snapshot expirado bloqueia independentemente do pacote e warning root é persistido no diagnóstico', async () => {
  const readinessRuntime = await loadMobileRuntime(
    'core/readiness-gate.service',
  );
  const boundaryRuntime = await loadMobileRuntime('core/field-shell.component');
  const Gate = readinessRuntime['ReadinessGateService'];
  const FieldShell = boundaryRuntime['FieldShellComponent'] as never;
  const State = boundaryRuntime['TeatErrorBoundaryState'] as new () => {
    readonly current: ReturnType<
      typeof signal<Readonly<{ code: string }> | undefined>
    >;
    diagnostics(): readonly Readonly<{ code: string }>[];
    capture(error: unknown, source: 'route' | 'action'): unknown;
  };
  TestBed.configureTestingModule({
    imports: [FieldShell],
    providers: [
      provideRouter([]),
      State,
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
      Gate,
    ],
  });
  const gate = TestBed.inject(Gate as never) as {
    evaluate(input: unknown): {
      allowed: boolean;
      blockers: readonly string[];
      warnings: readonly string[];
    };
  };
  const expiredSnapshot = {
    ...readyBootstrap,
    snapshot: {
      capturedAt: '2026-09-20T00:00:00Z',
      validUntil: '2026-09-21T00:00:00Z',
      maxAgeSeconds: 86400,
      authority: {},
    },
    normativePackage: {
      ...readyBootstrap.normativePackage,
      validUntil: '2999-01-01T00:00:00Z',
    },
  };
  const denied = gate.evaluate({
    bootstrap: expiredSnapshot,
    provisioning: readyProvisioning,
    now: '2026-09-22T00:00:00Z',
  });
  expect(denied.allowed).toBe(false);
  expect(denied.blockers).toContain('bootstrap-snapshot-expired');

  const warning = gate.evaluate({
    bootstrap: {
      ...expiredSnapshot,
      snapshot: {
        ...expiredSnapshot.snapshot,
        validUntil: '2999-01-01T00:00:00Z',
      },
      normativePackage: {
        ...expiredSnapshot.normativePackage,
        validUntil: '2026-09-21T00:00:00Z',
      },
    },
    provisioning: readyProvisioning,
    now: '2026-09-22T00:00:00Z',
  });
  expect(warning.allowed).toBe(true);
  expect(warning.warnings).toContain('warning-expired');
  gate.evaluate({
    bootstrap: {
      ...expiredSnapshot,
      snapshot: {
        ...expiredSnapshot.snapshot,
        validUntil: '2999-01-01T00:00:00Z',
      },
      normativePackage: {
        ...expiredSnapshot.normativePackage,
        validUntil: '2026-09-21T00:00:00Z',
      },
    },
    provisioning: readyProvisioning,
    now: '2026-09-22T00:00:00Z',
  });
  const state = TestBed.inject(State);
  const diagnostics = state.diagnostics() as readonly Readonly<{
    code: string;
  }>[];
  expect
    .soft(
      diagnostics.filter(({ code }) => code === 'warning-expired'),
      'mesmo warning deve ser registrado uma vez',
    )
    .toHaveLength(1);
  const shell = TestBed.createComponent(FieldShell);
  shell.detectChanges();
  expect
    .soft(
      shell.nativeElement.querySelector('[aria-live="assertive"]'),
      'warning não pode ocupar o canal assertivo de erro',
    )
    .toBeNull();
  const alertText = (
    shell.nativeElement.querySelector('[role="alert"]') as HTMLElement | null
  )?.textContent?.trim();
  expect(alertText).not.toBe(
    'Ocorreu uma falha interna; informe o identificador ao suporte.',
  );
});

it('F005 ErrorHandler e Router compartilham estado observável que o FieldShell renderiza', async () => {
  const boundaryRuntime = await loadMobileRuntime('core/field-shell.component');
  const State = boundaryRuntime['TeatErrorBoundaryState'] as
    | (new () => {
        readonly current: ReturnType<typeof signal<unknown | undefined>>;
        capture(error: unknown, source: 'route' | 'action'): unknown;
        clear(): void;
        diagnostics(): readonly unknown[];
      })
    | undefined;
  const Handler = boundaryRuntime['TeatErrorHandler'] as
    (new (...args: never[]) => ErrorHandler) | undefined;
  expect
    .soft(State, 'estado compartilhado do ErrorBoundary')
    .toBeTypeOf('function');
  expect.soft(Handler, 'ErrorHandler de produção').toBeTypeOf('function');
  if (State === undefined || Handler === undefined) return;
  const bodycamRuntime = await loadMobileRuntime(
    'core/bodycam-indicator.component',
  );
  const bodycamToken = bodycamRuntime['TEAT_BODYCAM_STATE'];
  const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
  TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [
      provideRouter([
        { path: 'home', component: HomeHarnessComponent },
        ...TEAT_ROUTES,
      ]),
      State,
      Handler,
      { provide: ErrorHandler, useExisting: Handler },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
      {
        provide: bootstrapRuntime['TEAT_GUARD_CONTEXT'],
        useValue: {
          principal: () => ({ id: 'agent-001', roles: ['field-agent'] }),
          tenantId: () => 'tenant-001',
          allowedRoles: () => ['field-agent'],
          bootstrap: () => readyBootstrap,
          provisioning: () => readyProvisioning,
        },
      },
      {
        provide: TEAT_BOAT_EXTENSION,
        useValue: { installed: () => false, load: vi.fn() },
      },
      { provide: bodycamToken, useValue: { state: signal('failure') } },
    ],
  });
  const state = TestBed.inject(State);
  TestBed.inject(ErrorHandler).handleError({
    code: 'TEAT.INTERNAL',
    context: { token: 'redact-me' },
  });
  expect(state.current()).toBeDefined();
  expect(state.diagnostics()).toHaveLength(1);
  expect(JSON.stringify(state.diagnostics())).not.toContain('redact-me');

  const fixture = TestBed.createComponent(AppComponent);
  const router = TestBed.inject(Router);
  await router.navigateByUrl('/home');
  const safeUrl = router.url;
  const d05 = AIT_ROUTES.find(
    (route) => route.path === 'ait-speed-measurement',
  );
  expect(d05).toBeDefined();
  expect(
    d05?.loadComponent,
    'D-05 não pode carregar componente',
  ).toBeUndefined();
  expect(d05?.loadChildren, 'D-05 não pode carregar módulo').toBeUndefined();
  expect(d05?.resolve, 'D-05 não pode resolver feature/client').toBeUndefined();
  state.clear();
  await router.navigateByUrl('/ait-speed-measurement');
  fixture.detectChanges();
  await fixture.whenStable();
  expect(router.url, 'D-05 deve preservar URL segura').toBe(safeUrl);
  expect(state.current()).not.toMatchObject({ code: 'TEAT.INTERNAL' });

  state.clear();
  await router.navigateByUrl('/crash-start');
  fixture.detectChanges();
  await fixture.whenStable();
  expect(
    router.url,
    'BOAT ausente deve preservar URL segura, sem redirecionar para D-05',
  ).toBe(safeUrl);
  expect(state.current()).not.toMatchObject({ code: 'TEAT.INTERNAL' });

  const resolveBoat = (await import('./navigation/guards/readiness.guard'))
    .resolveBoatRoute;
  const External = class {};
  await expect(
    resolveBoat('crash-start', {
      installed: () => true,
      load: async () => External,
    }),
  ).resolves.toEqual({ kind: 'loaded', component: External });
  const rejection = { status: 503, code: 'TEAT.BOAT_UNAVAILABLE' };
  await expect(
    resolveBoat('crash-start', {
      installed: () => true,
      load: async () => {
        throw rejection;
      },
    }),
  ).rejects.toBe(rejection);
});

for (const coldPath of ['/ait-speed-measurement', '/crash-start'] as const) {
  it(`F005 entrada direta ${coldPath} sem URL segura volta para /auth-login`, async () => {
    const bootstrapRuntime = await loadMobileRuntime('core/bootstrap.store');
    TestBed.configureTestingModule({
      imports: [RouterHarnessComponent],
      providers: [
        provideRouter([
          { path: 'auth-login', component: HomeHarnessComponent },
          ...TEAT_ROUTES,
        ]),
        {
          provide: bootstrapRuntime['TEAT_GUARD_CONTEXT'],
          useValue: {
            principal: () => undefined,
            tenantId: () => undefined,
            allowedRoles: () => [],
            bootstrap: () => undefined,
            provisioning: () => undefined,
          },
        },
        {
          provide: TEAT_BOAT_EXTENSION,
          useValue: { installed: () => false, load: vi.fn() },
        },
      ],
    });
    const fixture = TestBed.createComponent(RouterHarnessComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(coldPath).catch(() => false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/auth-login');
  });
}

it('F007 bodycam vem de adapter dinâmico no injector, nunca de constante do AppComponent', async () => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: TeatI18n,
        useValue: { translate: (key: string) => key },
      },
    ],
  });
  const bodycamRuntime = await loadMobileRuntime(
    'core/bodycam-indicator.component',
  );
  const appRuntime = await loadMobileRuntime('app.component');
  const boundaryRuntime = await loadMobileRuntime('core/field-shell.component');
  const token = bodycamRuntime['TEAT_BODYCAM_STATE'];
  expect(
    token,
    'TEAT_BODYCAM_STATE conectado ao adapter concreto',
  ).toBeDefined();
  const BoundaryState = boundaryRuntime['TeatErrorBoundaryState'] as new () => {
    diagnostics(): readonly Readonly<{ code: string }>[];
  };
  const boundary = TestBed.inject(BoundaryState);
  const adapter = TestBed.inject(token as never) as {
    readonly state: ReturnType<
      typeof signal<'recording' | 'paused-exception' | 'failure'>
    >;
  };
  expect(adapter.state).toBeTypeOf('function');
  expect(adapter.state()).toBe('failure');
  expect(
    boundary.diagnostics().length,
    'fallback failure do bodycam precisa registrar diagnóstico',
  ).toBeGreaterThan(0);
  expect(Object.keys(adapter)).not.toContain('content');
  const App = appRuntime['AppComponent'] as new (...args: never[]) => {
    readonly bodycamState: unknown;
  };
  const app = TestBed.runInInjectionContext(() => new App());
  expect(app.bodycamState).toBe(adapter.state);
  for (const state of ['recording', 'paused-exception', 'failure'] as const) {
    adapter.state.set(state);
    expect((app.bodycamState as typeof adapter.state)()).toBe(state);
  }
});
