import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Provider } from '@angular/core';
import { provideRouter, Router, type Routes } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { firstValueFrom, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { TEAT_ROUTES } from './app.routes';
import { SseService } from './core/sse.service';
import catalog from './i18n/teat.pt-BR.json';
import { expectTeatA11yState } from '../testing/a11y-state.spec-helper';

const appRoot = process.cwd();

async function homologationRuntime(): Promise<Record<string, unknown>> {
  const modules = import.meta.glob('./shared/*.ts');
  const loader = modules['./shared/homologation-http.interceptor.ts'];
  expect(loader, 'port HTTP de homologação web deve existir').toBeTypeOf(
    'function',
  );
  if (loader === undefined) throw new Error('web-homologation-port-missing');
  return (await loader()) as Record<string, unknown>;
}

async function contextProviders(): Promise<readonly Provider[]> {
  const modules = import.meta.glob('./shared/*.ts');
  const loader = modules['./shared/homologation-context.ts'];
  expect(loader, 'provedores sintéticos web devem existir').toBeTypeOf(
    'function',
  );
  if (loader === undefined) throw new Error('web-homologation-context-missing');
  const runtime = (await loader()) as Record<string, unknown>;
  const provide = runtime['provideTeatWebHomologationContext'];
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
  const modules = import.meta.glob('./shared/*.ts');
  const loader = modules['./shared/homologation-persona.port.ts'];
  expect(loader, 'persona web sintética deve existir').toBeTypeOf('function');
  if (loader === undefined) throw new Error('web-homologation-persona-missing');
  const runtime = (await loader()) as Record<string, unknown>;
  const token = runtime['TEAT_WEB_HOMOLOGATION_PERSONA'];
  const create = runtime['createTeatWebHomologationPersona'];
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

async function scenarioRuntime(): Promise<
  Readonly<{
    token: unknown;
  }>
> {
  const modules = import.meta.glob('./shared/*.ts');
  const loader = modules['./shared/homologation-scenario.port.ts'];
  expect(loader, 'cenário web sintético deve ser explícito').toBeTypeOf(
    'function',
  );
  if (loader === undefined)
    throw new Error('web-homologation-scenario-missing');
  const runtime = (await loader()) as Record<string, unknown>;
  expect(runtime['TEAT_WEB_HOMOLOGATION_SCENARIO']).toBeDefined();
  return {
    token: runtime['TEAT_WEB_HOMOLOGATION_SCENARIO'],
  };
}

describe('ADR-0033 — composição web de homologação', () => {
  it('pnpm build seleciona main.homologation.ts, com token e bloqueio HTTP explícitos, sem modificar a entrada comum', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(appRoot, 'package.json'), 'utf8'),
    ) as { scripts: { build: string } };
    const angular = JSON.parse(
      readFileSync(resolve(appRoot, 'angular.json'), 'utf8'),
    ) as {
      projects: {
        'teat-web': {
          architect: {
            build: {
              options: { browser: string };
              configurations: Record<string, { browser?: string }>;
              defaultConfiguration: string;
            };
            serve: {
              configurations: Record<string, { buildTarget: string }>;
              defaultConfiguration: string;
            };
          };
        };
      };
    };
    const build = angular.projects['teat-web'].architect.build;
    const selectedEntry =
      build.configurations[build.defaultConfiguration]?.browser ??
      build.options.browser;
    expect(packageJson.scripts.build).toBe('ng build');
    expect(selectedEntry).toBe('src/main.homologation.ts');
    const serve = angular.projects['teat-web'].architect.serve;
    expect(
      serve.configurations[serve.defaultConfiguration]?.buildTarget,
      'ng serve default também deve executar somente a composição de homologação',
    ).toBe('teat-web:build:homologation');

    const common = readFileSync(resolve(appRoot, 'src/main.ts'), 'utf8');
    const homologation = readFileSync(
      resolve(appRoot, 'src/main.homologation.ts'),
      'utf8',
    );
    expect(common).not.toContain('TEAT_WEB_HOMOLOGATION');
    expect(common).not.toContain('webHomologationHttpBlockInterceptor');
    expect(common).not.toContain('provideTeatWebHomologationContext');
    expect(common).not.toContain('TEAT_WEB_HOMOLOGATION_EVENTS');
    expect(common).not.toContain('TEAT_WEB_HOMOLOGATION_PERSONA');
    expect(common).toContain('teatAuthenticatedProvider');
    expect(homologation).toMatch(/provide:\s*TEAT_WEB_HOMOLOGATION/);
    expect(homologation).toContain('webHomologationHttpBlockInterceptor');
    expect(homologation).toContain('withInterceptors');
    expect(homologation).toContain('provideTeatWebHomologationContext');
    expect(homologation).toContain('TEAT_WEB_HOMOLOGATION_EVENTS');
    expect(homologation).toContain('TEAT_WEB_HOMOLOGATION_PERSONA');
    expect(homologation).toContain('TEAT_WEB_HOMOLOGATION_SCENARIO');
    expect(homologation).toContain('TEAT_WEB_HOMOLOGATION_AIT_ACCEPT');
    expect(homologation).toContain('TEAT_HOMOLOGATION_ROUTES');
    expect(homologation).toContain('createTeatWebAppConfig');
    expect(homologation).not.toContain('teatAuthenticatedProvider');
  });

  it.each([
    ['GET', '/v1/inf/ait/aits'],
    ['POST', '/v1/inf/ait/aits'],
    ['GET', '/api/ops/bootstrap'],
    ['GET', 'https://example.test/assets/catalog.json'],
    ['GET', '//example.test/assets/catalog.json'],
    ['GET', '/assets/../v1/inf/ait/aits'],
  ])('bloqueia %s %s antes de qualquer backend real', async (method, url) => {
    const runtime = await homologationRuntime();
    const interceptor = runtime['webHomologationHttpBlockInterceptor'];
    expect(interceptor).toBeTypeOf('function');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptor as never])),
        provideHttpClientTesting(),
      ],
    });
    const request = firstValueFrom(
      TestBed.inject(HttpClient).request(method, url),
    );
    await expect(request).rejects.toThrow('web-homologation-network-disabled');
    TestBed.inject(HttpTestingController).expectNone(url);
    TestBed.inject(HttpTestingController).verify();
  });

  it.each(['/assets/demo.json', 'assets/catalog.json'])(
    'permite apenas asset local %s',
    async (url) => {
      const runtime = await homologationRuntime();
      const interceptor = runtime['webHomologationHttpBlockInterceptor'];
      expect(interceptor).toBeTypeOf('function');
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([interceptor as never])),
          provideHttpClientTesting(),
        ],
      });
      const request = firstValueFrom(TestBed.inject(HttpClient).get(url));
      TestBed.inject(HttpTestingController)
        .expectOne(url)
        .flush({ synthetic: true });
      await expect(request).resolves.toEqual({ synthetic: true });
      TestBed.inject(HttpTestingController).verify();
    },
  );
});

describe('ADR-0033 — marcador visível da UI web', () => {
  it('não mostra homologação nem instala fixture no AppComponent comum', async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: StynxI18nService,
          useValue: { translate: (key: string) => key },
        },
      ],
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[data-profile="homologation"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-homologation-persona]'),
    ).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain(
      'HOMOLOGAÇÃO — SIMULAÇÃO',
    );
  });

  it('mostra a tradução canônica de homologação somente com token explícito', async () => {
    const runtime = await homologationRuntime();
    const token = runtime['TEAT_WEB_HOMOLOGATION'];
    expect(token).toBeDefined();
    const translations = catalog as Readonly<Record<string, string>>;
    expect(translations['teat.shell.homologation']).toBe(
      'HOMOLOGAÇÃO — SIMULAÇÃO',
    );
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: token, useValue: true },
        {
          provide: StynxI18nService,
          useValue: {
            translate: (key: string) => translations[key] ?? key,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const marker = fixture.nativeElement.querySelector(
      '[data-profile="homologation"]',
    ) as HTMLElement | null;
    expect(marker).not.toBeNull();
    expect(marker?.textContent).toContain('HOMOLOGAÇÃO — SIMULAÇÃO');
  });
});

describe('ADR-0033 — SSE não contorna o bloqueio de rede da homologação', () => {
  it('emite ait.changed sintético nomeado apenas com port explícito, sem EventSource ou HTTP', async () => {
    const modules = import.meta.glob('./shared/*.ts');
    const loader = modules['./shared/homologation-events.port.ts'];
    expect(loader, 'port de eventos sintéticos deve existir').toBeTypeOf(
      'function',
    );
    if (loader === undefined)
      throw new Error('web-homologation-events-missing');
    const eventsRuntime = (await loader()) as Record<string, unknown>;
    const token = eventsRuntime['TEAT_WEB_HOMOLOGATION_EVENTS'];
    const create = eventsRuntime['createTeatWebHomologationEvents'];
    expect(token).toBeDefined();
    expect(create).toBeTypeOf('function');
    const profile = await homologationRuntime();
    const opened = vi.fn();
    vi.stubGlobal('EventSource', opened);
    try {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: profile['TEAT_WEB_HOMOLOGATION'], useValue: true },
          { provide: token, useFactory: create as () => unknown },
          SseService,
        ],
      });
      const event = await firstValueFrom(
        TestBed.inject(SseService).stream({ topics: ['ait.changed'] }),
      );
      expect(event).toMatchObject({ type: 'ait.changed', synthetic: true });
      expect(opened).not.toHaveBeenCalled();
      expect(
        TestBed.inject(HttpTestingController).match(() => true).length,
      ).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('quando evento sintético fica indisponível, atualiza UI por fallback sintético a cada 15 s sem rede', async () => {
    const modules = import.meta.glob('./shared/*.ts');
    const loader = modules['./shared/homologation-events.port.ts'];
    expect(loader).toBeTypeOf('function');
    if (loader === undefined)
      throw new Error('web-homologation-events-missing');
    const eventsRuntime = (await loader()) as Record<string, unknown>;
    const profile = await homologationRuntime();
    const opened = vi.fn();
    const fallback = vi.fn(() =>
      of({ type: 'ait.changed', synthetic: true, fallback: true }),
    );
    vi.useFakeTimers();
    vi.stubGlobal('EventSource', opened);
    try {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: profile['TEAT_WEB_HOMOLOGATION'], useValue: true },
          {
            provide: eventsRuntime['TEAT_WEB_HOMOLOGATION_EVENTS'],
            useValue: {
              stream: () =>
                throwError(() => new Error('demo-stream-unavailable')),
              fallback,
            },
          },
          SseService,
        ],
      });
      const values: unknown[] = [];
      const subscription = TestBed.inject(SseService)
        .stream({ topics: ['ait.changed'], fallbackUrl: '/v1/inf/ait/aits' })
        .subscribe((value) => values.push(value));
      await vi.advanceTimersByTimeAsync(14_999);
      expect(values).toHaveLength(0);
      expect(fallback).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(values).toEqual([
        { type: 'ait.changed', synthetic: true, fallback: true },
      ]);
      expect(fallback).toHaveBeenCalledWith(
        expect.objectContaining({ topics: ['ait.changed'] }),
      );
      await vi.advanceTimersByTimeAsync(15_000);
      expect(values).toHaveLength(2);
      expect(opened).not.toHaveBeenCalled();
      expect(
        TestBed.inject(HttpTestingController).match(() => true),
      ).toHaveLength(0);
      subscription.unsubscribe();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it.each([true, false])(
    'em homologação, stream não constrói EventSource nem inicia polling (EventSource disponível=%s)',
    async (available) => {
      const runtime = await homologationRuntime();
      const token = runtime['TEAT_WEB_HOMOLOGATION'];
      expect(token).toBeDefined();
      const opened: string[] = [];
      class FakeEventSource {
        constructor(url: string) {
          opened.push(url);
        }
        close(): void {}
        addEventListener(): void {}
        removeEventListener(): void {}
      }
      vi.useFakeTimers();
      vi.stubGlobal('EventSource', available ? FakeEventSource : undefined);
      try {
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: token, useValue: true },
            SseService,
          ],
        });
        const values: unknown[] = [];
        const subscription = TestBed.inject(SseService)
          .stream({
            topics: ['ait.changed'],
            fallbackUrl: '/v1/inf/ait/aits',
          })
          .subscribe((value) => values.push(value));
        await vi.advanceTimersByTimeAsync(45_000);
        const requests = TestBed.inject(HttpTestingController).match(
          () => true,
        );
        subscription.unsubscribe();
        expect(opened).toHaveLength(0);
        expect(values).toHaveLength(0);
        expect(requests.length).toBe(0);
        TestBed.inject(HttpTestingController).verify();
      } finally {
        vi.unstubAllGlobals();
        vi.useRealTimers();
      }
    },
  );

  it('no perfil comum, stream ainda abre o canal SSE normal', () => {
    const opened: string[] = [];
    class FakeEventSource {
      constructor(url: string) {
        opened.push(url);
      }
      close(): void {}
      addEventListener(): void {}
      removeEventListener(): void {}
    }
    vi.stubGlobal('EventSource', FakeEventSource);
    try {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          SseService,
        ],
      });
      const subscription = TestBed.inject(SseService).stream().subscribe();
      expect(opened).toEqual(['/v1/ops/stream']);
      subscription.unsubscribe();
      TestBed.inject(HttpTestingController).verify();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('ADR-0033 — jornadas web navegáveis sem sessão OIDC ou backend real', () => {
  async function configureNavigation(
    omitRole = false,
    personaProvider?: Provider,
    eventProvider?: Provider,
  ): Promise<void> {
    const runtime = await homologationRuntime();
    const interceptor = runtime['webHomologationHttpBlockInterceptor'];
    const token = runtime['TEAT_WEB_HOMOLOGATION'];
    expect(interceptor).toBeTypeOf('function');
    expect(token).toBeDefined();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ...appConfig.providers,
        provideRouter(TEAT_ROUTES),
        provideHttpClient(withInterceptors([interceptor as never])),
        provideHttpClientTesting(),
        { provide: token, useValue: true },
        ...(personaProvider === undefined ? [] : [personaProvider]),
        ...(eventProvider === undefined ? [] : [eventProvider]),
        ...(await contextProviders()),
        ...(omitRole
          ? [
              {
                provide: StynxSessionService,
                useValue: {
                  active: () => true,
                  roles: () => [],
                  hasAnyRole: () => false,
                  state: () => ({ claims: { roles: [] } }),
                },
              },
            ]
          : []),
      ],
    });
    await TestBed.inject(StynxI18nService).initialize();
  }

  it('fallback SSE demonstrativo atualiza AIT no RouterOutlet e mostra modo visível sem rede', async () => {
    const modules = import.meta.glob('./shared/*.ts');
    const loader = modules['./shared/homologation-events.port.ts'];
    expect(loader).toBeTypeOf('function');
    if (loader === undefined)
      throw new Error('web-homologation-events-missing');
    const eventsRuntime = (await loader()) as Record<string, unknown>;
    const fallback = vi.fn(() =>
      of({ type: 'ait.changed', synthetic: true, fallback: true }),
    );
    await configureNavigation(false, undefined, {
      provide: eventsRuntime['TEAT_WEB_HOMOLOGATION_EVENTS'],
      useValue: {
        stream: () => throwError(() => new Error('demo-stream-unavailable')),
        fallback,
      },
    });
    const opened = vi.fn();
    vi.useFakeTimers();
    vi.stubGlobal('EventSource', opened);
    try {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(
        await TestBed.inject(Router).navigateByUrl('/ux/web/ait-validation'),
      ).toBe(true);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const scenario = await scenarioRuntime();
      const state = TestBed.inject(scenario.token as never) as {
        setMode(mode: 'data' | 'empty' | 'error'): void;
      };
      state.setMode('empty');
      await vi.advanceTimersByTimeAsync(14_999);
      fixture.detectChanges();
      expect(
        (
          fixture.nativeElement.querySelector(
            'main [role="status"]',
          ) as HTMLElement | null
        )?.textContent,
      ).not.toContain((catalog as Record<string, string>)['teat.common.empty']);
      await vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fallback).toHaveBeenCalledTimes(1);
      expect(
        (
          fixture.nativeElement.querySelector(
            'main [role="status"]',
          ) as HTMLElement | null
        )?.textContent,
      ).toContain((catalog as Record<string, string>)['teat.common.empty']);
      const marker = fixture.nativeElement.querySelector(
        '[data-homologation-fallback][role="status"]',
      ) as HTMLElement | null;
      expect(marker).not.toBeNull();
      expect(marker?.textContent).toContain(
        (catalog as Record<string, string>)['teat.shell.homologationFallback'],
      );
      expect(opened).not.toHaveBeenCalled();
      expect(
        TestBed.inject(HttpTestingController).match(() => true),
      ).toHaveLength(0);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it('entrada homologada / abre login seguro com grafo próprio sem mutar as 60 rotas comuns', async () => {
    const modules = import.meta.glob('./*.ts');
    const routeLoader = modules['./app.homologation.routes.ts'];
    expect(routeLoader).toBeTypeOf('function');
    if (routeLoader === undefined)
      throw new Error('web-homologation-routes-missing');
    const routeRuntime = (await routeLoader()) as Record<string, unknown>;
    const routes = routeRuntime['TEAT_HOMOLOGATION_ROUTES'] as
      Routes | undefined;
    expect(routes).toBeDefined();
    if (routes === undefined)
      throw new Error('web-homologation-routes-missing');
    expect(routes).toHaveLength(TEAT_ROUTES.length + 1);
    expect(routes[0]).toMatchObject({
      path: '',
      pathMatch: 'full',
      redirectTo: 'ux/web/login',
    });
    const configLoader = modules['./app.config.ts'];
    expect(configLoader).toBeTypeOf('function');
    if (configLoader === undefined) throw new Error('web-app-config-missing');
    const configRuntime = (await configLoader()) as Record<string, unknown>;
    const create = configRuntime['createTeatWebAppConfig'];
    expect(create).toBeTypeOf('function');
    if (typeof create !== 'function')
      throw new Error('web-routes-factory-missing');
    const config = (create as (routes: Routes) => { providers: Provider[] })(
      routes,
    );
    const runtime = await homologationRuntime();
    const interceptor = runtime['webHomologationHttpBlockInterceptor'];
    const token = runtime['TEAT_WEB_HOMOLOGATION'];
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ...config.providers,
        provideHttpClient(withInterceptors([interceptor as never])),
        provideHttpClientTesting(),
        { provide: token, useValue: true },
        ...(await contextProviders()),
      ],
    });
    await TestBed.inject(StynxI18nService).initialize();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(await TestBed.inject(Router).navigateByUrl('/')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/ux/web/login');
    expect(
      (fixture.nativeElement.querySelector('main h1') as HTMLElement | null)
        ?.textContent,
    ).toContain(
      (catalog as Record<string, string>)['teat.screens.login.title'],
    );
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it.each([
    ['/ux/web/ait-validation', 'teat.screens.ait-validation.title'],
    ['/ux/web/ops-dashboard', 'teat.screens.ops-dashboard.title'],
  ])(
    'renderiza %s pelo RouterOutlet com papéis reais e dados sintéticos',
    async (path, titleKey) => {
      await configureNavigation();
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const navigated = await TestBed.inject(Router).navigateByUrl(path);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const translations = catalog as Readonly<Record<string, string>>;
      expect(navigated).toBe(true);
      expect(
        (fixture.nativeElement.querySelector('main h1') as HTMLElement | null)
          ?.textContent,
      ).toContain(translations[titleKey]);
      expect(fixture.nativeElement.textContent).toContain(
        'HOMOLOGAÇÃO — SIMULAÇÃO',
      );
      expect(
        TestBed.inject(HttpTestingController).match(() => true).length,
      ).toBe(0);
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    },
  );

  it('nega AIT quando a sessão sintética omite papel, sem fallback para papel privilegiado', async () => {
    await configureNavigation(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/ux/web/ait-validation');
    fixture.detectChanges();
    await fixture.whenStable();
    const translations = catalog as Readonly<Record<string, string>>;
    expect(fixture.nativeElement.textContent).not.toContain(
      translations['teat.screens.ait-validation.title'],
    );
    expect(TestBed.inject(HttpTestingController).match(() => true).length).toBe(
      0,
    );
  });

  it.each([
    ['agency-admin', '/ux/web/admin-orgs', 'teat.screens.admin-orgs.title'],
    [
      'technical-admin',
      '/ux/web/admin-units',
      'teat.screens.admin-units.title',
    ],
  ])(
    'UI seleciona %s e só então permite %s pelo roleGuard real',
    async (role, path, titleKey) => {
      const personaPort = await personaRuntime();
      await configureNavigation(false, {
        provide: personaPort.token,
        useFactory: personaPort.create,
      });
      const persona = TestBed.inject(personaPort.token as never) as ReturnType<
        typeof personaPort.create
      >;
      expect(persona.role()).toBe('processing-operator');
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      await TestBed.inject(Router).navigateByUrl(path);
      fixture.detectChanges();
      await fixture.whenStable();
      const translations = catalog as Readonly<Record<string, string>>;
      expect(fixture.nativeElement.textContent).not.toContain(
        translations[titleKey],
      );
      const selector = fixture.nativeElement.querySelector(
        '[data-homologation-persona] select, select[data-homologation-persona]',
      ) as HTMLSelectElement | null;
      expect(selector).not.toBeNull();
      expect(
        [...(selector?.options ?? [])].map((option) => option.value),
      ).toContain(role);
      if (selector === null) throw new Error('web-persona-selector-missing');
      selector.value = role;
      selector.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
      expect(persona.role()).toBe(role);
      const navigated = await TestBed.inject(Router).navigateByUrl(path);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(navigated).toBe(true);
      expect(
        (fixture.nativeElement.querySelector('main h1') as HTMLElement | null)
          ?.textContent,
      ).toContain(translations[titleKey]);
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
      expect(
        TestBed.inject(HttpTestingController).match(() => true).length,
      ).toBe(0);
    },
  );

  it('rejeita persona web inválida sem alterar papel nem criar autoridade', async () => {
    const personaPort = await personaRuntime();
    await configureNavigation(false, {
      provide: personaPort.token,
      useFactory: personaPort.create,
    });
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    expect(persona.role()).toBe('processing-operator');
    expect(() => persona.setRole('root-admin')).toThrow();
    expect(persona.role()).toBe('processing-operator');
  });

  it('desmonta imediatamente página admin ao trocar para papel sem permissão', async () => {
    const personaPort = await personaRuntime();
    await configureNavigation(false, {
      provide: personaPort.token,
      useFactory: personaPort.create,
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const selector = fixture.nativeElement.querySelector(
      '[data-homologation-persona] select, select[data-homologation-persona]',
    ) as HTMLSelectElement | null;
    expect(selector).not.toBeNull();
    if (selector === null) throw new Error('web-persona-selector-missing');
    selector.value = 'agency-admin';
    selector.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(
      await TestBed.inject(Router).navigateByUrl('/ux/web/admin-orgs'),
    ).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const translations = catalog as Readonly<Record<string, string>>;
    expect(fixture.nativeElement.textContent).toContain(
      translations['teat.screens.admin-orgs.title'],
    );
    selector.value = 'field-agent';
    selector.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/ux/web/login');
    expect(fixture.nativeElement.textContent).not.toContain(
      translations['teat.screens.admin-orgs.title'],
    );
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('login da sessão sintética não redireciona ao IdP, não grava auth storage e não chama backend', async () => {
    await configureNavigation();
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

  it('renderiza payload demonstrativo distinto nas 12 classes de módulo pelo RouterOutlet', async () => {
    const scenario = await scenarioRuntime();
    await configureNavigation();
    expect(TestBed.inject(scenario.token as never)).toBeDefined();
    const personaPort = await personaRuntime();
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    persona.setRole('agency-admin');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const examples = [
      ['dashboard-home', 'entry', '/v1/dashboard/alerts'],
      ['ops-dashboard', 'operations', '/v1/ops/field/operations'],
      ['ait-inbox', 'fiscalizacao', '/v1/inf/ait/aits'],
      ['measures-list', 'measures', '/v1/inf/measures/administrative-measures'],
      ['alcohol-procedures', 'alcohol', '/v1/inf/alcohol/procedures'],
      ['evidence-search', 'evidence', '/v1/ops/evidence/evidence'],
      ['audit-events', 'audit', '/v1/audit/events'],
      ['bi-enforcement', 'bi', '/v1/dashboard/bi-panels'],
      ['admin-orgs', 'admin', '/v1/ops/agency/units'],
      ['norm-catalogs', 'normative', '/v1/inf/normative/catalogs'],
      ['tech-integrations', 'technical', '/v1/ops/integrations/outbox'],
    ] as const;
    const observedPayloads = new Set<string>();
    for (const [path, module, endpoint] of examples) {
      expect(
        await TestBed.inject(Router).navigateByUrl(`/ux/web/${path}`),
      ).toBe(true);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const status = fixture.nativeElement.querySelector(
        'main [role="status"]',
      ) as HTMLElement | null;
      expect(status, `status demonstrativo de ${module}`).not.toBeNull();
      const payload = status?.textContent ?? '';
      expect(payload).toContain(`"demo_module":"${module}"`);
      expect(payload).toContain(`"demo_endpoint":"${endpoint}"`);
      expect(payload).toMatch(/SIMULAD|DEMO|HOMOLOG/i);
      observedPayloads.add(payload);
    }
    expect(observedPayloads.size).toBe(examples.length);
    expect(
      await TestBed.inject(Router).navigateByUrl('/ux/web/crashes-list'),
    ).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'source_pending · BOAT',
    );
    expect(fixture.nativeElement.textContent).not.toContain(
      'homologation-demo-record',
    );
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });

  it('troca data, empty e error na UI sem SSE nem requisição remota', async () => {
    const scenario = await scenarioRuntime();
    await configureNavigation();
    const personaPort = await personaRuntime();
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    persona.setRole('agency-admin');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(
      await TestBed.inject(Router).navigateByUrl('/ux/web/measures-list'),
    ).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const state = TestBed.inject(scenario.token as never) as {
      mode(): 'data' | 'empty' | 'error';
      setMode(mode: 'data' | 'empty' | 'error'): void;
      refresh(): void;
    };
    expect(state.mode()).toBe('data');
    const selector = fixture.nativeElement.querySelector(
      'select[data-homologation-data-state]',
    ) as HTMLSelectElement | null;
    const refresh = fixture.nativeElement.querySelector(
      'button[data-homologation-refresh]',
    ) as HTMLButtonElement | null;
    expect(selector).not.toBeNull();
    expect(refresh).not.toBeNull();
    if (selector === null || refresh === null) {
      throw new Error('web-homologation-scenario-controls-missing');
    }
    for (const [mode, expected] of [
      ['empty', (catalog as Record<string, string>)['teat.common.empty']],
      ['error', (catalog as Record<string, string>)['teat.a11y.actionFailed']],
      ['data', '"demo_module":"measures"'],
    ] as const) {
      selector.value = mode;
      selector.dispatchEvent(new Event('change', { bubbles: true }));
      refresh.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(state.mode()).toBe(mode);
      expect(
        (
          fixture.nativeElement.querySelector(
            'main [role="status"]',
          ) as HTMLElement | null
        )?.textContent,
      ).toContain(expected);
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
      expect(
        TestBed.inject(HttpTestingController).match(() => true),
      ).toHaveLength(0);
    }
  });

  it('aceita AIT apenas como resultado demonstrativo, sem POST ou recibo oficial', async () => {
    await scenarioRuntime();
    await configureNavigation();
    const personaPort = await personaRuntime();
    const persona = TestBed.inject(personaPort.token as never) as ReturnType<
      typeof personaPort.create
    >;
    persona.setRole('traffic-authority');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(
      await TestBed.inject(Router).navigateByUrl('/ux/web/ait-validation'),
    ).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const radio = fixture.nativeElement.querySelector(
      'input[name="ait-selection"]',
    ) as HTMLInputElement | null;
    expect(radio).not.toBeNull();
    if (radio === null) throw new Error('web-homologation-ait-record-missing');
    radio.click();
    fixture.detectChanges();
    const action = fixture.nativeElement.querySelector(
      'main button[type="button"]',
    ) as HTMLButtonElement | null;
    expect(action).not.toBeNull();
    if (action === null) throw new Error('web-homologation-ait-action-missing');
    action.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-ait-outcome="demonstrated"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toMatch(/SIMULAD|HOMOLOG/i);
    expect(fixture.nativeElement.textContent).not.toMatch(
      /receipt_protocol|recibo oficial/i,
    );
    expect(
      TestBed.inject(HttpTestingController).match(() => true),
    ).toHaveLength(0);
  });
});
