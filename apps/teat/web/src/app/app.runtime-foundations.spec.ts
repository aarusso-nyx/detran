import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  RouterOutlet,
  type Route,
  type Routes,
} from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { Observable } from 'rxjs';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { expectTeatA11yState } from '../testing/a11y-state.spec-helper';
import {
  TEAT_WEB_I18N,
  TEAT_WEB_ROUTE_FIXTURE,
  TEAT_WEB_SSE_EVENT_TOPICS,
  TEAT_WEB_SSE_TOPICS_BY_PATH,
} from '../testing/teat-web-contract.fixture';
import { TEAT_ROUTES } from './app.routes';
import { TEAT_WEB_ROUTE_CONTEXT } from './core/guards';

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: Readonly<{ eager: true }>,
    ): Readonly<Record<string, unknown>>;
    glob(pattern: string): Readonly<Record<string, () => Promise<unknown>>>;
  }
}

const boundaryModules = import.meta.glob('./core/error-boundary/**/*.ts', {
  eager: true,
});
const appConfigModules = import.meta.glob('./app.config.ts', { eager: true });
const sharedModules = import.meta.glob('./shared/**/*.ts', { eager: true });
const clientModules = import.meta.glob('./data/**/*.client.ts', {
  eager: true,
});
const sseModules = import.meta.glob('./core/sse.service.ts', { eager: true });
const mainModules = import.meta.glob('../main.ts');

function exportedTypes(
  modules: Readonly<Record<string, unknown>>,
): readonly Type<unknown>[] {
  return Object.values(modules).flatMap((module) =>
    Object.values(module as Readonly<Record<string, unknown>>).filter(
      (value): value is Type<unknown> => typeof value === 'function',
    ),
  );
}

function applicationProviders(): readonly unknown[] {
  const config = Object.values(appConfigModules)
    .flatMap((module) =>
      Object.values(module as Readonly<Record<string, unknown>>),
    )
    .find(
      (value): value is Readonly<{ providers: readonly unknown[] }> =>
        typeof value === 'object' &&
        value !== null &&
        Array.isArray((value as { providers?: unknown }).providers),
    );
  if (config === undefined) throw new Error('ApplicationConfig ausente');
  return config.providers;
}

function authenticatedProvider(): unknown {
  const provider = Object.values(appConfigModules)
    .flatMap((module) =>
      Object.entries(module as Readonly<Record<string, unknown>>),
    )
    .find(([name]) => name === 'teatAuthenticatedProvider')?.[1];
  if (provider === undefined) {
    throw new Error('Provider autenticado STYNX ausente');
  }
  return provider;
}

async function flattenRoutes(
  routes: Routes,
  prefix = '',
): Promise<readonly Readonly<{ path: string; route: Route }>[]> {
  const result: Readonly<{ path: string; route: Route }>[] = [];
  for (const route of routes) {
    const segment = route.path ?? '';
    const path =
      segment === '**' ? '**' : [prefix, segment].filter(Boolean).join('/');
    if (route.children !== undefined) {
      result.push(...(await flattenRoutes(route.children, path)));
    } else if (route.loadChildren !== undefined) {
      const loaded = await route.loadChildren();
      if (Array.isArray(loaded)) {
        result.push(...(await flattenRoutes(loaded, path)));
      }
    } else if (segment !== '') {
      result.push({ path: segment === '**' ? '**' : `/${path}`, route });
    }
  }
  return result;
}

let routeByPath: ReadonlyMap<string, Route>;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

beforeAll(async () => {
  routeByPath = new Map(
    (await flattenRoutes(TEAT_ROUTES)).map(({ path, route }) => [path, route]),
  );
});

function activeSessionProviders(role = 'field-agent') {
  const state = signal({
    active: true,
    accessToken: 'test-access-token',
    tenantId: 'tenant-001',
    roles: [role],
    permissions: [`role:${role}`],
    principal: { id: AUTHORITY_ID, roles: [role] },
    claims: {
      sub: AUTHORITY_ID,
      roles: [role],
      'cognito:groups': [role],
    },
  });
  return [
    {
      provide: StynxSessionService,
      useValue: {
        state,
        active: () => true,
        roles: () => [role],
        hasRole: (candidate: string) => candidate === role,
        hasAnyRole: (candidates: readonly string[]) =>
          candidates.includes(role),
      },
    },
    {
      provide: TenantContextService,
      useValue: { tenantId: () => 'tenant-001' },
    },
  ];
}

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class RouterHarnessComponent {}

it('F001 dado o bootstrap real quando iniciado então auth, tenancy, HttpClient e login são alcançáveis', async () => {
  const main = Object.values(mainModules);
  expect(main).toHaveLength(1);
  document.body.innerHTML = '<teat-root></teat-root>';
  const bootstrapMain = main[0];
  expect(bootstrapMain).toBeDefined();
  await expect(bootstrapMain?.()).resolves.toBeDefined();
  TestBed.configureTestingModule({
    imports: [RouterHarnessComponent],
    providers: [
      ...applicationProviders(),
      authenticatedProvider(),
      provideHttpClientTesting(),
    ],
  });
  const session = TestBed.inject(StynxSessionService);
  expect(session.active()).toBe(false);
  expect(TestBed.inject(TenantContextService).tenantId()).toBeNull();
  expect(TestBed.inject(HttpClient)).toBeDefined();
  const fixture = TestBed.createComponent(RouterHarnessComponent);
  const router = TestBed.inject(Router);
  await expect(router.navigateByUrl('/ux/web/dashboard-home')).resolves.toBe(
    false,
  );
  await expect(router.navigateByUrl('/ux/web/login')).resolves.toBe(true);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(router.url).toBe('/ux/web/login');
  const root = fixture.nativeElement as HTMLElement;
  expect(root.querySelector('h1')?.textContent?.trim()).toBe(
    TEAT_WEB_I18N['teat.screens.login.title'],
  );
  const login = root.querySelector<HTMLButtonElement>('button[type="submit"]');
  expect(login).not.toBeNull();
  const loginRedirect = vi
    .spyOn(session, 'login')
    .mockImplementation(() => undefined);
  login?.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));
  fixture.detectChanges();
  await fixture.whenStable();
  expect(loginRedirect).toHaveBeenCalledOnce();

  const callbackActive = signal(false);
  const callbackState = signal({
    active: false,
    accessToken: null as string | null,
    tenantId: 'tenant-001',
    claims: { roles: ['field-agent'] },
  });
  const callbackSession = {
    state: callbackState,
    active: callbackActive,
    roles: () => ['field-agent'],
    hasRole: (role: string) => role === 'field-agent',
    hasAnyRole: (roles: readonly string[]) => roles.includes('field-agent'),
    login: vi.fn(),
    completeLogin: vi.fn(async (url?: string) => {
      expect(url).toContain('code=callback-code');
      callbackActive.set(true);
      callbackState.set({
        active: true,
        accessToken: 'callback-access-token',
        tenantId: 'tenant-001',
        claims: { roles: ['field-agent'] },
      });
      return callbackState();
    }),
  };
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [RouterHarnessComponent],
    providers: [
      provideRouter(TEAT_ROUTES),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: StynxSessionService, useValue: callbackSession },
      {
        provide: TenantContextService,
        useValue: { tenantId: () => 'tenant-001' },
      },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () => TEAT_WEB_I18N,
        },
      },
      StynxI18nService,
    ],
  });
  await TestBed.inject(StynxI18nService).initialize();
  const callbackFixture = TestBed.createComponent(RouterHarnessComponent);
  const callbackRouter = TestBed.inject(Router);
  await callbackRouter.navigateByUrl(
    '/ux/web/login?code=callback-code&state=state-001',
  );
  callbackFixture.detectChanges();
  await callbackFixture.whenStable();
  expect(callbackSession.completeLogin).toHaveBeenCalledOnce();
  expect(callbackActive()).toBe(true);
  expect.soft(callbackRouter.url).toBe('/ux/web/dashboard-home');

  const rejectedSession = {
    ...callbackSession,
    active: signal(false),
    completeLogin: vi.fn().mockRejectedValue({ code: 'TEAT.AUTH_REQUIRED' }),
  };
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [RouterHarnessComponent],
    providers: [
      provideRouter(TEAT_ROUTES),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: StynxSessionService, useValue: rejectedSession },
      {
        provide: TenantContextService,
        useValue: { tenantId: () => 'tenant-001' },
      },
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () => TEAT_WEB_I18N,
        },
      },
      StynxI18nService,
    ],
  });
  await TestBed.inject(StynxI18nService).initialize();
  const rejectedFixture = TestBed.createComponent(RouterHarnessComponent);
  const rejectedRouter = TestBed.inject(Router);
  await rejectedRouter.navigateByUrl(
    '/ux/web/login?code=rejected-code&state=rejected-state',
  );
  rejectedFixture.detectChanges();
  await Promise.resolve();
  rejectedFixture.detectChanges();
  expect
    .soft(rejectedFixture.nativeElement.textContent)
    .toContain('TEAT.AUTH_REQUIRED');
  expect
    .soft(rejectedFixture.nativeElement.textContent)
    .toContain(TEAT_WEB_I18N['teat.errors.auth_required']);

  for (const context of [
    { name: 'ausente' },
    { name: 'nulo', value: null },
    { name: 'não resolvido', value: { available: undefined } },
    { name: 'indisponível', value: { available: false } },
  ] as const) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(TEAT_ROUTES),
        ...activeSessionProviders('traffic-authority'),
        ...('value' in context
          ? [{ provide: TEAT_WEB_ROUTE_CONTEXT, useValue: context.value }]
          : []),
      ],
    });
    const contextRouter = TestBed.inject(Router);
    await expect
      .soft(
        contextRouter.navigateByUrl('/ux/web/ait-validation'),
        `contexto ${context.name} deve negar`,
      )
      .resolves.toBe(false);
  }
});

it('dado StynxError conhecido quando classificado então ErrorBoundary é o classificador exclusivo', () => {
  const boundaryType = exportedTypes(boundaryModules).find(
    (type) =>
      type.name.includes('ErrorBoundary') &&
      typeof (type.prototype as Readonly<Record<string, unknown>>)[
        'classify'
      ] === 'function',
  );
  expect(boundaryType).toBeDefined();
  TestBed.configureTestingModule({
    providers: [boundaryType as Type<unknown>],
  });
  const instance = TestBed.inject(
    boundaryType as Type<Record<string, unknown>>,
  );
  const classify = instance['classify'];
  expect(classify).toBeTypeOf('function');
  for (const [code, messageKey] of [
    ['TEAT.AUTH_REQUIRED', 'teat.errors.auth_required'],
    ['TEAT.IF_MATCH_REQUIRED', 'teat.errors.if_match_required'],
    ['TEAT.TENANT_MISMATCH', 'teat.errors.tenant_mismatch'],
  ] as const) {
    expect(
      (classify as (error: unknown) => unknown).call(instance, { code }),
    ).toMatchObject({ code, messageKey });
  }
  expect(
    (classify as (error: unknown) => unknown).call(instance, new Error('x')),
  ).toMatchObject({ messageKey: 'teat.errors.internal' });
  const boundaryComponent = exportedTypes(boundaryModules).find(
    (type) => type.name.includes('ErrorBoundary') && 'ɵcmp' in type,
  );
  expect(boundaryComponent).toBeDefined();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [boundaryComponent as Type<unknown>],
    providers: [
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () => TEAT_WEB_I18N,
        },
      },
      StynxI18nService,
    ],
  });
  const fixture = TestBed.createComponent(boundaryComponent as Type<unknown>);
  fixture.componentRef.setInput('error', {
    code: 'TEAT.IF_MATCH_REQUIRED',
  });
  fixture.detectChanges();
  expect((fixture.nativeElement as HTMLElement).textContent).toContain(
    'Informe a versão atual do recurso antes de continuar.',
  );
});

it('dado o perfil reutilizável quando componentes compartilhados são inventariados então todos existem como componentes Angular', () => {
  const names = exportedTypes(sharedModules)
    .filter((type) => 'ɵcmp' in type)
    .map((type) => type.name.replace(/Component$/, ''));
  expect(names).toEqual(
    expect.arrayContaining([
      'PageHeader',
      'DataTable',
      'StatusBadge',
      'SseRefresh',
      'EvidenceViewer',
      'AuditTimeline',
      'DashboardPanel',
      'FreshnessBadge',
      'BoatExtensionOutlet',
    ]),
  );
});

it('F004 dado o catálogo pt-BR quando STYNX inicializa então traduz título e erro sem fallback', async () => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () => TEAT_WEB_I18N,
        },
      },
      StynxI18nService,
    ],
  });
  const i18n = TestBed.inject(StynxI18nService);
  await i18n.initialize();
  expect(i18n.translate('teat.screens.login.title')).toBe(
    TEAT_WEB_I18N['teat.screens.login.title'],
  );
  expect(i18n.translate('teat.errors.auth_required')).toBe(
    'É necessário autenticar-se para continuar.',
  );
});

it('dado o harness HttpClient quando uma chamada é emitida então o backend de teste observa método, URL e resposta', async () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const response = TestBed.inject(HttpClient).get('/v1/ops/stream');
  const resolved = new Promise<unknown>((resolve) =>
    response.subscribe(resolve),
  );
  const request = TestBed.inject(HttpTestingController).expectOne(
    '/v1/ops/stream',
  );
  expect(request.request.method).toBe('GET');
  request.flush(null);
  await expect(resolved).resolves.toBeNull();
  TestBed.inject(HttpTestingController).verify();
});

@Component({
  standalone: true,
  template: `
    <main>
      <h1>Console operacional</h1>
      <p role="status">Carregando…</p>
    </main>
  `,
})
class AccessibleStateFixture {}

it('dado um estado renderizado quando auditado então preserva invariantes e axe WCAG 2.1 AA', async () => {
  TestBed.configureTestingModule({ imports: [AccessibleStateFixture] });
  const fixture = TestBed.createComponent(AccessibleStateFixture);
  fixture.detectChanges();
  await expectTeatA11yState(fixture.nativeElement as HTMLElement);
});

class EventSourceFixture {
  static readonly instances: EventSourceFixture[] = [];
  private readonly listeners = new Map<
    string,
    Set<(event: MessageEvent) => void>
  >();
  readonly url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readonly close = vi.fn();

  constructor(url: string | URL) {
    this.url = String(url);
    EventSourceFixture.instances.push(this);
  }

  emitError(): void {
    this.onerror?.(new Event('error'));
  }

  addEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  emitNamed(type: string, value: unknown): void {
    const event = new MessageEvent(type, { data: JSON.stringify(value) });
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  emitMessage(value: unknown): void {
    this.onmessage?.(
      new MessageEvent('message', { data: JSON.stringify(value) }),
    );
  }
}

it('F005 dado SSE indisponível quando passam 15 s então usa polling resiliente e limpa recursos', async () => {
  expect(TEAT_WEB_SSE_EVENT_TOPICS).not.toHaveLength(0);
  expect(TEAT_WEB_SSE_TOPICS_BY_PATH['/ux/web/ops-dashboard']).toEqual(
    TEAT_WEB_SSE_EVENT_TOPICS,
  );
  vi.useFakeTimers();
  EventSourceFixture.instances.length = 0;
  vi.stubGlobal('EventSource', EventSourceFixture);
  let subscription: Readonly<{ unsubscribe(): void }> | undefined;
  try {
    const SseService = exportedTypes(sseModules).find(
      (type) => type.name === 'SseService',
    ) as Type<Readonly<{ stream(): Observable<unknown> }>> | undefined;
    expect(SseService).toBeDefined();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SseService as Type<unknown>,
      ],
    });
    subscription = TestBed.inject(
      SseService as Type<{ stream(): Observable<unknown> }>,
    )
      .stream()
      .subscribe();
    expect(EventSourceFixture.instances[0]).toBeDefined();
    expect(EventSourceFixture.instances[0]?.url).toBe('/v1/ops/stream');
    EventSourceFixture.instances[0]?.emitError();
    await vi.advanceTimersByTimeAsync(15_000);
    const http = TestBed.inject(HttpTestingController);
    const polling = http.match('/v1/ops/stream');
    expect(polling).toHaveLength(1);
    polling[0]?.flush([]);
    subscription.unsubscribe();
    subscription = undefined;
    expect(EventSourceFixture.instances[0]?.close).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(http.match('/v1/ops/stream')).toHaveLength(0);

    const service = TestBed.inject(
      SseService as Type<{
        stream(options?: {
          topics?: readonly string[];
          fallbackUrl?: string;
        }): Observable<unknown>;
      }>,
    );
    for (const expected of TEAT_WEB_ROUTE_FIXTURE.filter(
      (entry) => entry.sse,
    )) {
      const route = routeByPath.get(expected.path);
      const data = route?.data as Readonly<Record<string, unknown>> | undefined;
      const endpoint = data?.['endpoint'];
      if (expected.client.includes('source_pending')) {
        expect.soft(data?.['extension']).toBe('BOAT');
        expect.soft(data?.['sseDeniedReason']).toBe('source_pending');
        continue;
      }
      expect(endpoint, `${expected.path}: endpoint de recurso`).toBeTypeOf(
        'string',
      );
      const topics = TEAT_WEB_SSE_TOPICS_BY_PATH[expected.path];
      expect(topics, `${expected.path}: tabela SSE contratual`).toBeDefined();
      expect
        .soft(data?.['sseTopics'], `${expected.path}: tópicos registrados`)
        .toEqual(topics);
      const before = EventSourceFixture.instances.length;
      subscription = service
        .stream({ topics, fallbackUrl: String(endpoint) })
        .subscribe();
      const source = EventSourceFixture.instances[before];
      expect(source?.url).toBe(
        `/v1/ops/stream?topics=${encodeURIComponent(topics?.join(',') ?? '')}`,
      );
      for (const topic of topics ?? []) {
        source?.emitNamed(topic, { type: topic });
      }
      source?.emitError();
      await vi.advanceTimersByTimeAsync(15_000);
      const resourcePolling = http.match(String(endpoint));
      expect(
        resourcePolling,
        `${expected.path}: fallback no recurso`,
      ).toHaveLength(1);
      resourcePolling[0]?.flush([]);
      subscription.unsubscribe();
      subscription = undefined;
      expect(source?.close).toHaveBeenCalledOnce();
    }
    http.verify();
  } finally {
    subscription?.unsubscribe();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

const representativeContracts = [
  {
    module: 'entry',
    path: '/ux/web/dashboard-home',
    client: 'dashboard',
    endpoint: '/v1/dashboard/alerts',
    response: { state: 'DETECTADO' },
  },
  {
    module: 'operations',
    path: '/ux/web/operations-list',
    client: 'ops',
    endpoint: '/v1/ops/field/operations',
    response: { status: 'planned' },
  },
  {
    module: 'fiscalizacao',
    path: '/ux/web/ait-validation',
    client: 'ait',
    endpoint: '/v1/inf/ait/aits',
  },
  {
    module: 'measures',
    path: '/ux/web/measures-list',
    client: 'measures',
    endpoint: '/v1/inf/measures/administrative-measures',
    response: { status: 'started' },
  },
  {
    module: 'alcohol',
    path: '/ux/web/alcohol-procedures',
    client: 'alcohol',
    endpoint: '/v1/inf/alcohol/procedures',
    response: { result_classification: 'administrativo' },
  },
  {
    module: 'crashes',
    path: '/ux/web/crashes-list',
    client: 'source_pending (BOAT)',
    endpoint: 'source_pending',
  },
  {
    module: 'evidence',
    path: '/ux/web/evidence-search',
    client: 'evidence',
    endpoint: '/v1/ops/evidence/evidence',
    response: { sha256: 'evidence-sha256' },
  },
  {
    module: 'audit',
    path: '/ux/web/audit-events',
    client: 'kernel STYNX',
    endpoint: '/v1/audit/events',
    response: { action: 'ait.accept' },
  },
  {
    module: 'bi',
    path: '/ux/web/bi-enforcement',
    client: 'dashboard',
    endpoint: '/v1/dashboard/bi-panels',
    response: { metric: 'accepted_aits' },
  },
  {
    module: 'admin',
    path: '/ux/web/admin-orgs',
    client: 'agency',
    endpoint: '/v1/ops/agency/units',
    response: { name: 'Unidade operacional' },
  },
  {
    module: 'normative',
    path: '/ux/web/norm-catalogs',
    client: 'normative',
    endpoint: '/v1/inf/normative/catalogs',
    response: { version: '2026.09' },
  },
  {
    module: 'technical',
    path: '/ux/web/tech-queues',
    client: 'integrations',
    endpoint: '/v1/ops/integrations/outbox',
    response: { topic: 'integration.item.changed' },
  },
] as const;

const AIT_ID = '10000000-0000-4000-8000-000000000021';
const TENANT_ID = '10000000-0000-4000-8000-000000000001';
const AUTHORITY_ID = '10000000-0000-4000-8000-000000000002';
const AIT_RESPONSE = {
  id: AIT_ID,
  tenant_id: TENANT_ID,
  traffic_agency_id: '10000000-0000-4000-8000-000000000003',
  ait_number: 'AIT-2026-000021',
  series: 'A',
  agent_id: '10000000-0000-4000-8000-000000000004',
  shift_id: '10000000-0000-4000-8000-000000000005',
  device_id: '10000000-0000-4000-8000-000000000006',
  framing_id: '10000000-0000-4000-8000-000000000007',
  catalog_id: '10000000-0000-4000-8000-000000000008',
  infraction_at: '2026-09-22T15:00:00.000Z',
  issued_at: '2026-09-22T15:05:00.000Z',
  issuance_mode: 'electronic',
  constatation_type: 'direct',
  had_approach: true,
  location_description: 'Trecho fiscalizado',
  uf: 'SP',
  current_status: 'VALIDANDO',
  version: 7,
  content_hash:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  system_signature_ref: 'signature:ait-v7',
  receipt_protocol: 'receipt:ait-v7',
  created_at: '2026-09-22T15:06:00.000Z',
} as const;
const SECOND_AIT_RESPONSE = {
  ...AIT_RESPONSE,
  id: '10000000-0000-4000-8000-000000000022',
  ait_number: 'AIT-2026-000022',
  current_status: 'RECEBIDO',
  version: 3,
  content_hash:
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  system_signature_ref: 'signature:ait-v3',
  receipt_protocol: 'receipt:ait-v3',
} as const;
const THIRD_AIT_RESPONSE = {
  ...AIT_RESPONSE,
  id: '10000000-0000-4000-8000-000000000023',
  ait_number: 'AIT-2026-000023',
  current_status: 'CORRIGIDO',
  version: 5,
  content_hash:
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  system_signature_ref: 'signature:ait-v5',
  receipt_protocol: 'receipt:ait-v5',
} as const;
const FORBIDDEN_AIT_RESPONSE = {
  ...AIT_RESPONSE,
  id: '10000000-0000-4000-8000-000000000024',
  ait_number: 'AIT-2026-000024',
  current_status: 'INTEGRADO',
  version: 10,
  content_hash:
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  system_signature_ref: 'signature:ait-v10',
  receipt_protocol: 'receipt:ait-v10',
} as const;

const AIT_CHANGED_EVENT = {
  id: '10000000-0000-4000-8000-000000000009',
  type: 'ait.changed',
  domainEvent: 'AIT_RECEBIDO',
  version: 8,
  occurredAt: '2026-09-22T15:10:00.000Z',
  tenantId: TENANT_ID,
  actor: { kind: 'system', id: 'offline-sync' },
  correlationId: '10000000-0000-4000-8000-000000000010',
  aggregate: { kind: 'ait', id: AIT_ID, version: 8 },
  data: {
    aitId: AIT_ID,
    fromState: 'TRANSMITIDO',
    toState: 'RECEBIDO',
    receiptProtocol: 'receipt:ait-v8',
    receivedAt: '2026-09-22T15:10:00.000Z',
  },
} as const;

for (const contract of representativeContracts) {
  const representative = TEAT_WEB_ROUTE_FIXTURE.find(
    (entry) => entry.path === contract.path,
  );
  if (representative === undefined) {
    throw new Error(`Rota representativa ausente: ${contract.path}`);
  }
  it(`F003/F004/F006 dada página produtiva ${representative.module} quando montada então usa integração, reage via DOM e passa axe`, async () => {
    EventSourceFixture.instances.length = 0;
    if (representative.sse) {
      vi.stubGlobal('EventSource', EventSourceFixture);
    }
    expect(representative.module).toBe(contract.module);
    expect(representative.client).toBe(contract.client);
    const route = routeByPath.get(representative.path);
    expect(
      route?.component !== undefined || route?.loadComponent !== undefined,
    ).toBe(true);
    TestBed.configureTestingModule({
      imports: [RouterHarnessComponent],
      providers: [
        provideRouter(TEAT_ROUTES),
        provideHttpClient(),
        provideHttpClientTesting(),
        ...activeSessionProviders(
          representative.path === '/ux/web/ait-validation'
            ? 'traffic-authority'
            : representative.allowedRoles[0],
        ),
        ...(['/ux/web/ait-validation', '/ux/web/tech-queues'].includes(
          representative.path,
        )
          ? [
              {
                provide: TEAT_WEB_ROUTE_CONTEXT,
                useValue: { available: true },
              },
            ]
          : []),
        {
          provide: STYNX_I18N_OPTIONS,
          useValue: {
            defaultLocale: 'pt-BR',
            loadCatalog: async () => TEAT_WEB_I18N,
          },
        },
        StynxI18nService,
      ],
    });
    await TestBed.inject(StynxI18nService).initialize();
    const fixture = TestBed.createComponent(RouterHarnessComponent);
    const router = TestBed.inject(Router);
    await expect(router.navigateByUrl(representative.path)).resolves.toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const http = TestBed.inject(HttpTestingController);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      TEAT_WEB_I18N[representative.titleKey ?? ''],
    );
    expect(root.textContent).not.toContain(representative.titleKey);
    const boat = contract.endpoint === 'source_pending';
    if (boat) {
      expect(http.match(() => true)).toHaveLength(0);
    } else {
      const clientModule = Object.entries(clientModules).find(([path]) =>
        path.includes(`/${contract.client}.client.ts`),
      );
      expect
        .soft(clientModule, `${contract.client}: client concreto`)
        .toBeDefined();
      expect
        .soft(
          Object.values(
            (clientModule?.[1] ?? {}) as Readonly<Record<string, unknown>>,
          ).some((value) => typeof value === 'function'),
          `${contract.client}: export de client`,
        )
        .toBe(true);
      const request = http.expectOne(contract.endpoint);
      expect(request.request.method).toBe('GET');
      expect(request.request.body).toBeNull();
      request.flush(
        representative.path === '/ux/web/ait-validation'
          ? [
              AIT_RESPONSE,
              SECOND_AIT_RESPONSE,
              THIRD_AIT_RESPONSE,
              FORBIDDEN_AIT_RESPONSE,
            ]
          : 'response' in contract
            ? [contract.response]
            : [],
      );
    }
    fixture.detectChanges();
    await fixture.whenStable();
    if (boat) {
      expect(root.textContent).not.toContain('source_pending');
      expect(root.querySelector('h1')?.textContent?.trim()).toBe(
        TEAT_WEB_I18N[representative.titleKey ?? ''],
      );
    } else if (representative.path === '/ux/web/ait-validation') {
      expect
        .soft(TestBed.inject(StynxI18nService).translate('teat.common.confirm'))
        .toBe(TEAT_WEB_I18N['teat.common.confirm']);
      expect
        .soft(
          [...root.querySelectorAll('button')].some(
            (button) =>
              button.textContent?.trim() ===
              TEAT_WEB_I18N['teat.common.confirm'],
          ),
        )
        .toBe(false);
      expect.soft(root.textContent).toContain(AIT_RESPONSE.ait_number);
      expect.soft(root.textContent).toContain(SECOND_AIT_RESPONSE.ait_number);
      expect.soft(root.textContent).toContain(THIRD_AIT_RESPONSE.ait_number);
      expect
        .soft(root.textContent)
        .toContain(FORBIDDEN_AIT_RESPONSE.ait_number);
      const selection = root.querySelector<HTMLInputElement>(
        `input[type="radio"][value="${AIT_ID}"]`,
      );
      expect.soft(selection).not.toBeNull();
      selection?.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
      const pageSession = TestBed.inject(StynxSessionService) as unknown as {
        state: {
          (): Readonly<Record<string, unknown>>;
          set(value: Readonly<Record<string, unknown>>): void;
        };
        hasAnyRole(roles: readonly string[]): boolean;
      };
      const baseState = pageSession.state();
      const roleDecision = vi
        .spyOn(pageSession, 'hasAnyRole')
        .mockImplementation((roles) => roles.includes('processing-operator'));
      pageSession.state.set({
        ...baseState,
        roles: ['processing-operator'],
        claims: { sub: AUTHORITY_ID, roles: ['processing-operator'] },
      });
      fixture.detectChanges();
      expect
        .soft(
          [...root.querySelectorAll('button')].some(
            (button) =>
              button.textContent?.trim() ===
              TEAT_WEB_I18N['teat.common.confirm'],
          ),
        )
        .toBe(false);
      roleDecision.mockImplementation((roles) =>
        roles.includes('traffic-authority'),
      );
      pageSession.state.set({
        ...baseState,
        roles: ['traffic-authority'],
        claims: { sub: AUTHORITY_ID, roles: ['traffic-authority'] },
      });
      fixture.detectChanges();
      for (const eligible of [
        AIT_RESPONSE,
        SECOND_AIT_RESPONSE,
        THIRD_AIT_RESPONSE,
      ]) {
        root
          .querySelector<HTMLInputElement>(
            `input[type="radio"][value="${eligible.id}"]`,
          )
          ?.dispatchEvent(new Event('change', { bubbles: true }));
        fixture.detectChanges();
        expect
          .soft(
            [...root.querySelectorAll('button')].some(
              (button) =>
                button.textContent?.trim() ===
                TEAT_WEB_I18N['teat.common.confirm'],
            ),
            `${eligible.current_status}: ação elegível`,
          )
          .toBe(true);
      }
      root
        .querySelector<HTMLInputElement>(
          `input[type="radio"][value="${FORBIDDEN_AIT_RESPONSE.id}"]`,
        )
        ?.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
      expect
        .soft(
          [...root.querySelectorAll('button')].some(
            (button) =>
              button.textContent?.trim() ===
              TEAT_WEB_I18N['teat.common.confirm'],
          ),
          `${FORBIDDEN_AIT_RESPONSE.current_status}: ação proibida`,
        )
        .toBe(false);
      selection?.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
      for (const value of [
        AIT_RESPONSE.ait_number,
        AIT_RESPONSE.current_status,
        AIT_RESPONSE.content_hash,
        AIT_RESPONSE.system_signature_ref,
        AIT_RESPONSE.receipt_protocol,
      ]) {
        expect.soft(root.textContent).toContain(value);
      }
      const canonicalLabels = new Set(Object.values(TEAT_WEB_I18N));
      for (const label of root.querySelectorAll('dt')) {
        expect
          .soft(
            canonicalLabels.has(label.textContent?.trim() ?? ''),
            `rótulo AIT deve vir do catálogo STYNX: ${label.textContent?.trim()}`,
          )
          .toBe(true);
      }
      const accept = [
        ...root.querySelectorAll<HTMLButtonElement>('button'),
      ].find(
        (button) =>
          button.textContent?.trim() === TEAT_WEB_I18N['teat.common.confirm'],
      );
      expect.soft(accept).toBeDefined();
      accept?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      const commands = http.match(`/v1/inf/ait/aits/${AIT_ID}/accept`);
      expect.soft(commands).toHaveLength(1);
      const command = commands[0];
      if (command !== undefined) {
        expect(command.request.method).toBe('POST');
        expect(command.request.headers.get('If-Match')).toBe('7');
        expect(command.request.headers.get('Idempotency-Key')).toBe(
          `ait-accept:${AIT_ID}:7`,
        );
        expect(command.request.body).toEqual({ user_ref: AUTHORITY_ID });
        command.flush({ id: AIT_ID, current_status: 'INTEGRADO', version: 9 });
      }
      fixture.detectChanges();
      expect.soft(root.textContent).toContain('INTEGRADO');
      expect
        .soft(
          [...root.querySelectorAll('button')].some(
            (button) =>
              button.textContent?.trim() ===
              TEAT_WEB_I18N['teat.common.confirm'],
          ),
        )
        .toBe(false);
    } else if ('response' in contract) {
      expect(root.textContent).toContain(
        String(Object.values(contract.response)[0]),
      );
      const reload = [
        ...root.querySelectorAll<HTMLButtonElement>('button'),
      ].find(
        (button) =>
          button.textContent?.trim() === TEAT_WEB_I18N['teat.sync.resend'],
      );
      expect(reload).toBeDefined();
      reload?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      http
        .expectOne(contract.endpoint)
        .flush(
          { code: 'TEAT.AUTH_REQUIRED' },
          { status: 401, statusText: 'Unauthorized' },
        );
      fixture.detectChanges();
      expect(root.textContent).toContain('TEAT.AUTH_REQUIRED');
      expect(root.textContent).toContain(
        TEAT_WEB_I18N['teat.errors.auth_required'],
      );
    }
    if (
      representative.sse &&
      representative.path === '/ux/web/ait-validation'
    ) {
      const topics = (route?.data?.['sseTopics'] ?? []) as readonly string[];
      expect(topics).toEqual(TEAT_WEB_SSE_TOPICS_BY_PATH[representative.path]);
      expect(EventSourceFixture.instances).toHaveLength(1);
      expect
        .soft(EventSourceFixture.instances[0]?.url)
        .toBe(`/v1/ops/stream?topics=${encodeURIComponent(topics.join(','))}`);
      for (const [index, topic] of topics.entries()) {
        EventSourceFixture.instances[0]?.emitNamed(topic, {
          ...AIT_CHANGED_EVENT,
          type: topic,
        });
        const invalidated = http.match('/v1/inf/ait/aits');
        expect
          .soft(invalidated, `${topic}: invalida e recarrega AIT`)
          .toHaveLength(1);
        const resourceReceipt = `receipt:resource-event-${index}`;
        invalidated[0]?.flush([
          {
            ...AIT_RESPONSE,
            version: 8 + index,
            receipt_protocol: resourceReceipt,
          },
        ]);
        fixture.detectChanges();
        expect.soft(root.textContent).toContain(resourceReceipt);
        expect.soft(root.textContent).not.toContain('receipt:ait-v8');
      }

      const reload = [
        ...root.querySelectorAll<HTMLButtonElement>('button'),
      ].find(
        (button) =>
          button.textContent?.trim() === TEAT_WEB_I18N['teat.sync.resend'],
      );
      expect(reload).toBeDefined();
      reload?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      http.expectOne('/v1/inf/ait/aits').flush([]);
      fixture.detectChanges();
      expect
        .soft(root.textContent)
        .toContain(TEAT_WEB_I18N['teat.common.empty']);
      expect
        .soft(
          [...root.querySelectorAll('button')].some(
            (button) =>
              button.textContent?.trim() ===
              TEAT_WEB_I18N['teat.common.confirm'],
          ),
        )
        .toBe(false);

      reload?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      http.expectOne('/v1/inf/ait/aits').flush([{ unexpected: true }]);
      fixture.detectChanges();
      expect
        .soft(
          [...root.querySelectorAll('button')].some(
            (button) =>
              button.textContent?.trim() ===
              TEAT_WEB_I18N['teat.common.confirm'],
          ),
        )
        .toBe(false);

      vi.useFakeTimers();
      EventSourceFixture.instances[0]?.emitError();
      await vi.advanceTimersByTimeAsync(15_000);
      const fallback = http.expectOne('/v1/inf/ait/aits');
      fallback.flush([
        {
          ...AIT_RESPONSE,
          version: 9,
          receipt_protocol: 'receipt:resource-v9',
        },
      ]);
      fixture.detectChanges();
      expect.soft(root.textContent).toContain('receipt:resource-v9');
      expect.soft(root.textContent).not.toContain('receipt:ait-v8');
      vi.useRealTimers();
    }
    if (
      representative.sse &&
      representative.path !== '/ux/web/ait-validation' &&
      contract.endpoint !== 'source_pending' &&
      'response' in contract
    ) {
      const topics = (route?.data?.['sseTopics'] ?? []) as readonly string[];
      expect(topics).toEqual(TEAT_WEB_SSE_TOPICS_BY_PATH[representative.path]);
      expect(EventSourceFixture.instances).toHaveLength(1);
      expect
        .soft(EventSourceFixture.instances[0]?.url)
        .toBe(`/v1/ops/stream?topics=${encodeURIComponent(topics.join(','))}`);
      for (const topic of topics) {
        EventSourceFixture.instances[0]?.emitNamed(topic, {
          ...AIT_CHANGED_EVENT,
          type: topic,
        });
        const invalidated = http.match(contract.endpoint);
        expect
          .soft(
            invalidated,
            `${representative.path}/${topic}: invalida e recarrega recurso`,
          )
          .toHaveLength(1);
        invalidated[0]?.flush([contract.response]);
        fixture.detectChanges();
        expect(root.textContent).toContain(
          String(Object.values(contract.response)[0]),
        );
      }
    }
    await expectTeatA11yState(root);
    fixture.destroy();
    if (representative.sse) {
      expect(EventSourceFixture.instances[0]?.close).toHaveBeenCalledOnce();
    }
    http.verify();
  });
}
