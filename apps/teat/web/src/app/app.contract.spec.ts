import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
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
import { beforeAll, describe, expect, it } from 'vitest';
import { appConfig } from './app.config';
import * as routeModule from './app.routes';
import { TEAT_WEB_ROUTE_CONTEXT } from './core/guards';
import {
  TEAT_WEB_I18N,
  TEAT_WEB_MATRIX,
  TEAT_WEB_ROLES,
  TEAT_WEB_ROUTE_FIXTURE,
} from '../testing/teat-web-contract.fixture';

interface ActualRoute {
  readonly path: string;
  readonly route: Route;
}

async function flattenRoutes(
  routes: Routes,
  prefix = '',
): Promise<readonly ActualRoute[]> {
  const result: ActualRoute[] = [];
  for (const route of routes) {
    const segment = route.path ?? '';
    const path =
      segment === '**' ? '**' : [prefix, segment].filter(Boolean).join('/');
    if (route.children !== undefined) {
      result.push(...(await flattenRoutes(route.children, path)));
      continue;
    }
    if (route.loadChildren !== undefined) {
      const loaded = await route.loadChildren();
      if (Array.isArray(loaded)) {
        result.push(...(await flattenRoutes(loaded, path)));
        continue;
      }
    }
    if (segment !== '')
      result.push({ path: segment === '**' ? '**' : `/${path}`, route });
  }
  return result;
}

function productionRoutes(): Routes {
  const candidate = Object.entries(routeModule).find(
    ([name, value]) => /ROUTES$/.test(name) && Array.isArray(value),
  );
  if (candidate === undefined) {
    throw new Error('app.routes.ts não exporta o manifesto ROUTES');
  }
  return candidate[1] as Routes;
}

let actualByPath: ReadonlyMap<string, Route>;

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class ContractRouterHostComponent {}

beforeAll(async () => {
  const routes = await flattenRoutes(productionRoutes());
  actualByPath = new Map(routes.map(({ path, route }) => [path, route]));
});

describe('manifesto TEAT Web independente', () => {
  it('F001/F006 dado contexto G* quando navega então resolve pelo client da rota, vincula tenant e invalida na troca', async () => {
    const endpoint = '/v1/inf/measures/administrative-measures';
    const tenantId = signal<string | null>(
      '10000000-0000-4000-8000-000000000001',
    );
    const authenticated = signal(true);
    const role = signal('traffic-authority');
    const guardCalls: string[] = [];
    const state = signal({
      active: true,
      accessToken: 'test-access-token',
      tenantId: tenantId(),
      roles: ['traffic-authority'],
      claims: { roles: ['traffic-authority'] },
    });
    TestBed.configureTestingModule({
      imports: [ContractRouterHostComponent],
      providers: [
        ...appConfig.providers,
        provideHttpClientTesting(),
        {
          provide: StynxSessionService,
          useValue: {
            state,
            active: () => {
              guardCalls.push('auth');
              return authenticated();
            },
            roles: () => [role()],
            hasAnyRole: (roles: readonly string[]) => {
              guardCalls.push('role');
              return roles.includes(role());
            },
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            tenantId: () => {
              guardCalls.push('tenant');
              return tenantId();
            },
          },
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
    const fixture = TestBed.createComponent(ContractRouterHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    expect(TestBed.inject(TEAT_WEB_ROUTE_CONTEXT).available).toBe(false);
    expect(
      actualByPath
        .get('/ux/web/measure-detail')
        ?.canMatch?.map((guard) =>
          typeof guard === 'function' ? guard.name : String(guard),
        ),
    ).toEqual(['authGuard', 'tenantGuard', 'roleGuard', 'contextGuard']);
    const validRecord = {
      id: '10000000-0000-4000-8000-000000000041',
      tenant_id: '10000000-0000-4000-8000-000000000001',
      status: 'started',
    };

    async function expectDeniedBeforeContext(
      path: string,
      expectedCalls: readonly string[],
    ): Promise<void> {
      guardCalls.length = 0;
      const navigation = router.navigateByUrl(path).catch(() => false);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const premature = http.match(() => true);
      expect
        .soft(premature, `${path}: deny sem HTTP antes do role`)
        .toHaveLength(0);
      premature.forEach((request) => request.flush([validRecord]));
      await expect(navigation).resolves.toBe(false);
      let cursor = -1;
      for (const expectedCall of expectedCalls) {
        cursor = guardCalls.indexOf(expectedCall, cursor + 1);
        expect
          .soft(cursor, `${path}: guarda ${expectedCall} na ordem`)
          .toBeGreaterThanOrEqual(0);
      }
      expect
        .soft(
          http.match(() => true),
          `${path}: deny sem HTTP`,
        )
        .toHaveLength(0);
    }

    authenticated.set(false);
    await expectDeniedBeforeContext('/ux/web/measure-detail', ['auth']);
    authenticated.set(true);
    tenantId.set(null);
    await expectDeniedBeforeContext('/ux/web/measure-detail', [
      'auth',
      'tenant',
    ]);
    tenantId.set('10000000-0000-4000-8000-000000000001');
    role.set('field-agent');
    await expectDeniedBeforeContext('/ux/web/measure-detail', [
      'auth',
      'tenant',
      'role',
    ]);
    role.set('traffic-authority');

    async function resolveNavigation(
      path: string,
      response:
        | readonly Readonly<Record<string, unknown>>[]
        | Readonly<{ errorStatus: 404 | 503 }>,
      expected: boolean,
    ): Promise<void> {
      guardCalls.length = 0;
      const navigation = router.navigateByUrl(path).catch(() => false);
      let resolution: ReturnType<HttpTestingController['match']> = [];
      for (
        let attempt = 0;
        attempt < 10 && resolution.length === 0;
        attempt += 1
      ) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        resolution = http.match(endpoint);
      }
      expect
        .soft(guardCalls.slice(0, 3), `${path}: ordem dos guardas`)
        .toEqual(['auth', 'tenant', 'role']);
      expect
        .soft(resolution, `${path}: resolução pelo endpoint`)
        .toHaveLength(1);
      if (resolution[0] !== undefined) {
        expect.soft(resolution[0].request.method).toBe('GET');
        if ('errorStatus' in response) {
          resolution[0].flush(
            { code: 'TEAT.INTERNAL' },
            {
              status: response.errorStatus,
              statusText:
                response.errorStatus === 404 ? 'Not Found' : 'Unavailable',
            },
          );
        } else {
          resolution[0].flush(response);
        }
      }
      expect
        .soft(await navigation, `${path}: decisão contextual`)
        .toBe(expected);
      const pageLoads = http.match(endpoint);
      if (expected) {
        expect.soft(pageLoads, `${path}: carga após allow`).toHaveLength(1);
        pageLoads.forEach((request) => request.flush(response));
        expect(
          http.match(endpoint),
          `${path}: nenhum segundo GET do guarda`,
        ).toHaveLength(0);
        fixture.detectChanges();
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        const expectedRoute = TEAT_WEB_ROUTE_FIXTURE.find(
          (entry) => entry.path === path,
        );
        expect(root.querySelector('h1')?.textContent?.trim()).toBe(
          TEAT_WEB_I18N[expectedRoute?.titleKey ?? ''],
        );
        expect(root.textContent).toContain('started');
      } else {
        expect.soft(pageLoads, `${path}: sem carga após deny`).toHaveLength(0);
      }
    }

    await resolveNavigation('/ux/web/measure-detail', [validRecord], true);

    tenantId.set('10000000-0000-4000-8000-000000000002');
    state.update((current) => ({ ...current, tenantId: tenantId() }));
    expect(TestBed.inject(TEAT_WEB_ROUTE_CONTEXT).available).toBe(false);
    await resolveNavigation('/ux/web/removals', [validRecord], false);
    await resolveNavigation('/ux/web/release', [], false);
    await resolveNavigation(
      '/ux/web/measure-detail',
      { errorStatus: 503 },
      false,
    );
    await resolveNavigation('/ux/web/removals', { errorStatus: 404 }, false);
    await resolveNavigation(
      '/ux/web/release',
      [{ ...validRecord, tenant_id: tenantId() }],
      true,
    );
    http.verify();
  });

  it('dado o contrato do Architect quando o manifesto é carregado então existem exatamente 60 rotas', () => {
    expect(TEAT_WEB_ROUTE_FIXTURE).toHaveLength(60);
    expect(actualByPath.size).toBe(60);
    expect([...actualByPath.keys()]).toEqual(
      TEAT_WEB_ROUTE_FIXTURE.map((entry) => entry.path),
    );
  });

  it('dada a matriz web quando as fichas são reconciliadas então existem exatamente 56 sheets distintas', () => {
    const productRoutes = TEAT_WEB_ROUTE_FIXTURE.filter(
      (entry) => entry.sheet !== undefined,
    );
    expect(TEAT_WEB_MATRIX.expectedScreens).toBe(56);
    expect(TEAT_WEB_MATRIX.screens).toHaveLength(56);
    expect(productRoutes).toHaveLength(56);
    expect(new Set(productRoutes.map((entry) => entry.sheet)).size).toBe(56);
    expect(
      productRoutes.map(({ path, sheet, uxCode }) => ({ path, sheet, uxCode })),
    ).toEqual(
      TEAT_WEB_MATRIX.screens.map((screen) => ({
        path: screen.route,
        sheet: `IU-TEAT-${screen.screenId}`,
        uxCode: screen.uxCode,
      })),
    );
  });

  it('dada cada rota quando comparada ao contrato então sheet, uxCode, i18n e sequência de guardas coincidem', () => {
    for (const expected of TEAT_WEB_ROUTE_FIXTURE) {
      const route = actualByPath.get(expected.path);
      expect(route, `rota ausente: ${expected.path}`).toBeDefined();
      const data = route?.data as Readonly<Record<string, unknown>> | undefined;
      if (expected.sheet !== undefined) {
        expect(data?.['sheet']).toBe(expected.sheet);
        expect(data?.['uxCode']).toBe(expected.uxCode);
        expect(data?.['titleKey']).toBe(expected.titleKey);
      }
      expect(
        route?.canMatch?.map((guard) =>
          typeof guard === 'function' ? guard.name : String(guard),
        ),
      ).toEqual(expected.guards);
    }
  });

  it('dado o catálogo pt-BR quando títulos das 56 fichas são resolvidos então nenhuma chave usa fallback', () => {
    for (const expected of TEAT_WEB_ROUTE_FIXTURE) {
      if (expected.titleKey === undefined) continue;
      expect(TEAT_WEB_I18N[expected.titleKey], expected.titleKey).toBeTypeOf(
        'string',
      );
      expect(TEAT_WEB_I18N[expected.titleKey]).not.toBe(expected.titleKey);
    }
  });

  it('dado o catálogo de papéis quando normalizado então auditor é a única alias e há nove papéis', () => {
    expect(TEAT_WEB_ROLES).toHaveLength(9);
    expect(TEAT_WEB_ROLES).toContain('AUDITOR');
    expect(TEAT_WEB_ROLES).not.toContain('auditor');
    expect(
      TEAT_WEB_MATRIX.screens
        .flatMap((screen) => screen.roles)
        .filter((role) => role === 'auditor').length,
    ).toBeGreaterThan(0);
  });
});

describe('oráculo cartesiano rota × papel', () => {
  for (const expected of TEAT_WEB_ROUTE_FIXTURE) {
    for (const role of TEAT_WEB_ROLES) {
      const decision = expected.allowedRoles.includes(role) ? 'allow' : 'deny';
      it(`dada ${expected.path} quando o papel ${role} navega então ${decision}`, async () => {
        const route = actualByPath.get(expected.path);
        expect(route, `rota ausente: ${expected.path}`).toBeDefined();
        const actualRoles = (route?.data?.['allowedRoles'] ??
          []) as readonly string[];
        expect(actualRoles.includes(role)).toBe(decision === 'allow');
        expect(
          route?.canMatch?.map((guard) =>
            typeof guard === 'function' ? guard.name : String(guard),
          ),
        ).toEqual(expected.guards);
        const contextual = expected.guards.includes('contextGuard');
        const state = signal({
          active: !contextual,
          accessToken: 'test-access-token',
          tenantId: 'tenant-001',
          permissions: [`role:${role}`],
          roles: [role],
          principal: { id: 'agent-001', roles: [role] },
          claims: {
            sub: 'agent-001',
            roles: [role],
            'cognito:groups': [role],
          },
        });
        const tenantId = signal<string | null>('tenant-001');
        const routeContextAvailable = signal(false);
        TestBed.configureTestingModule({
          providers: [
            provideRouter(productionRoutes()),
            {
              provide: StynxSessionService,
              useValue: {
                state,
                active: () => state().active,
                roles: () => [role],
                hasRole: (candidate: string) => candidate === role,
                hasAnyRole: (candidates: readonly string[]) =>
                  candidates.includes(role),
              },
            },
            {
              provide: TenantContextService,
              useValue: { tenantId },
            },
            ...(contextual
              ? [
                  {
                    provide: TEAT_WEB_ROUTE_CONTEXT,
                    useValue: {
                      get available() {
                        return routeContextAvailable();
                      },
                    },
                  },
                ]
              : []),
          ],
        });
        const router = TestBed.inject(Router);
        if (contextual) {
          const context = TestBed.inject(TEAT_WEB_ROUTE_CONTEXT);
          expect(context.available).toBe(false);
          state.update((current) => ({ ...current, active: true }));
          routeContextAvailable.set(true);
          expect(context.available).toBe(true);
        }
        const target =
          expected.path === '**' ? '/source_pending' : expected.path;
        const navigated = await router.navigateByUrl(target).catch(() => false);
        if (decision === 'allow') {
          expect(navigated).toBe(true);
          expect(router.url).toBe(target);
        } else {
          expect(navigated).toBe(false);
        }
        expect(
          route?.canMatch?.[expected.guards.length],
          `${expected.path}: nenhum guarda oculto depois da cadeia iterada pelo Router`,
        ).toBeUndefined();
      });
    }
  }
});
