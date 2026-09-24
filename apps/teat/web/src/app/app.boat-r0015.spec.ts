import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BOAT_PT_BR_CATALOG } from '@detran/boat-mobile';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { expect, it } from 'vitest';
import { teatAuthenticatedProvider } from './app.config';
import {
  SINISTROS_ROUTES,
  SUBJECT_REQUEST_ROUTE,
} from './features/sinistros/sinistros.routes';
import { expectTeatA11yState } from '../testing/a11y-state.spec-helper';
import {
  TEAT_WEB_ROLES,
  TEAT_WEB_ROUTE_FIXTURE,
} from '../testing/teat-web-contract.fixture';

const BOAT_WEB_PATHS = [
  '/ux/web/crashes-list',
  '/ux/web/crash-detail',
  '/ux/web/crash-complement',
  '/ux/web/renaest-integration',
  '/fiscalizacao/sinistros/titular',
] as const;

const CANONICAL_ROLES = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
] as const;

const EXPECTED_ROUTES: Readonly<
  Record<string, Readonly<{ module: string; client: string; titleKey: string }>>
> = {
  '/ux/web/crashes-list': {
    module: 'sinistros',
    client: '@detran/boat-mobile',
    titleKey: 'teat.screens.crashes-list.title',
  },
  '/ux/web/crash-detail': {
    module: 'sinistros',
    client: '@detran/boat-mobile',
    titleKey: 'teat.screens.crash-detail.title',
  },
  '/ux/web/crash-complement': {
    module: 'sinistros',
    client: '@detran/boat-mobile',
    titleKey: 'teat.screens.crash-complement.title',
  },
  '/ux/web/renaest-integration': {
    module: 'sinistros',
    client: '@detran/boat-mobile',
    titleKey: 'teat.screens.renaest-integration.title',
  },
  '/fiscalizacao/sinistros/titular': {
    module: 'sinistros',
    client: '@detran/boat-mobile',
    titleKey: 'boat.screens.crash_subject_request.title',
  },
};

function boatRuntimeRoutes() {
  const subject = SUBJECT_REQUEST_ROUTE.children?.[0]?.children?.[0];
  return [
    ...SINISTROS_ROUTES.map((route) => ({
      path: `/ux/web/${route.path ?? ''}`,
      route,
    })),
    { path: '/fiscalizacao/sinistros/titular', route: subject },
  ];
}

it('dado o contrato web quando enumerado então preserva 61 rotas, 56 fichas TEAT e cinco entradas BOAT/operacionais', () => {
  expect(TEAT_WEB_ROUTE_FIXTURE).toHaveLength(61);
  expect(
    TEAT_WEB_ROUTE_FIXTURE.filter((route) =>
      route.sheet?.startsWith('IU-TEAT-'),
    ),
  ).toHaveLength(56);
  expect(
    TEAT_WEB_ROUTE_FIXTURE.filter((route) => route.path.startsWith('/ux/web/')),
  ).toHaveLength(56);
});

it('dada a matriz BOAT web quando verificada então fixa mounts, papéis e W-05 sem fallback de outlet', () => {
  expect(
    TEAT_WEB_ROUTE_FIXTURE.filter((route) =>
      BOAT_WEB_PATHS.includes(route.path as (typeof BOAT_WEB_PATHS)[number]),
    ).map((route) => route.path),
  ).toEqual(BOAT_WEB_PATHS);
  for (const route of TEAT_WEB_ROUTE_FIXTURE.filter((entry) =>
    BOAT_WEB_PATHS.includes(entry.path as (typeof BOAT_WEB_PATHS)[number]),
  )) {
    expect(route.guards).toEqual([
      'authGuard',
      'tenantGuard',
      'roleGuard',
      ...([
        '/ux/web/crash-detail',
        '/ux/web/crash-complement',
        '/fiscalizacao/sinistros/titular',
      ].includes(route.path)
        ? ['contextGuard']
        : []),
    ]);
    expect(route).toMatchObject(EXPECTED_ROUTES[route.path]);
  }
  const w05 = TEAT_WEB_ROUTE_FIXTURE.find(
    (route) => route.path === '/fiscalizacao/sinistros/titular',
  );
  expect(w05).toMatchObject({
    sheet: 'IU-BOAT-W-05',
    uxCode: 'source_pending',
    module: 'sinistros',
    client: '@detran/boat-mobile',
  });
  expect(w05?.allowedRoles).toEqual(['processing-operator', 'AUDITOR']);
  expect(w05?.guards).toEqual([
    'authGuard',
    'tenantGuard',
    'roleGuard',
    'contextGuard',
  ]);
  expect(TEAT_WEB_ROLES).toHaveLength(9);
});

it('dado cada W-01..W-05 quando cruzado com os nove papéis então prova presença e ausência sem conjunto implícito', () => {
  expect(CANONICAL_ROLES).toEqual(TEAT_WEB_ROLES);
  const expectedRoles: Readonly<Record<string, readonly string[]>> = {
    '/ux/web/crashes-list': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/ux/web/crash-detail': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/ux/web/crash-complement': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/ux/web/renaest-integration': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/fiscalizacao/sinistros/titular': ['processing-operator', 'AUDITOR'],
  };
  for (const route of TEAT_WEB_ROUTE_FIXTURE.filter((entry) =>
    BOAT_WEB_PATHS.includes(entry.path as (typeof BOAT_WEB_PATHS)[number]),
  )) {
    for (const role of CANONICAL_ROLES) {
      expect(route.allowedRoles.includes(role)).toBe(
        expectedRoles[route.path]?.includes(role),
      );
    }
  }
  const w03 = TEAT_WEB_ROUTE_FIXTURE.find(
    (route) => route.path === '/ux/web/crash-complement',
  );
  const w04 = TEAT_WEB_ROUTE_FIXTURE.find(
    (route) => route.path === '/ux/web/renaest-integration',
  );
  expect(w03?.allowedRoles).toEqual([
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
  ]);
  expect(w04?.allowedRoles).toEqual([
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
  ]);
  expect(w03?.guards).toContain('roleGuard');
  expect(w04?.guards).toContain('roleGuard');
});

it('dadas as cinco rotas reais quando carregadas então módulo, client, título e extensão são exatos', () => {
  for (const { path, route } of boatRuntimeRoutes()) {
    expect(route?.data, path).toMatchObject(EXPECTED_ROUTES[path]);
  }
  expect(
    boatRuntimeRoutes().find(
      ({ path }) => path === '/ux/web/renaest-integration',
    )?.route?.data,
  ).toMatchObject({
    extension: 'BOAT',
    sseDeniedReason: 'source_pending',
  });
});

it('dado W-03/W-04 quando cada papel tenta a ação então o metadado prova presença e ausência', () => {
  const routes = boatRuntimeRoutes();
  const cases = [
    {
      path: '/ux/web/crash-complement',
      action: 'validate',
      allowed: ['processing-operator', 'traffic-authority'],
    },
    {
      path: '/ux/web/renaest-integration',
      action: 'close',
      allowed: ['field-supervisor', 'traffic-authority'],
    },
  ] as const;
  for (const contract of cases) {
    const data = routes.find(({ path }) => path === contract.path)?.route
      ?.data as Readonly<Record<string, unknown>> | undefined;
    const roles = (
      data?.['actionAllowedRoles'] as
        Readonly<Record<string, readonly string[]>> | undefined
    )?.[contract.action];
    expect(roles).toBeDefined();
    for (const role of CANONICAL_ROLES) {
      expect
        .soft(
          roles?.includes(role),
          `${contract.path}/${contract.action}/${role}`,
        )
        .toBe(contract.allowed.includes(role as never));
    }
  }
});

it('dado o catálogo BOAT mesclado quando carregado então é byte-idêntico em 114 chaves e bloqueia os treze marcadores', () => {
  const catalog = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        '../../../docs/framework/arch/i18n/boat.pt-BR.json',
      ),
      'utf8',
    ),
  ) as Record<string, string>;
  const entries = Object.entries(catalog);
  expect(entries).toHaveLength(114);
  expect(
    entries.filter(([, value]) => value === 'source_pending:OD-R15-004'),
  ).toHaveLength(13);
  expect(BOAT_PT_BR_CATALOG).toEqual(catalog);
  expect(
    entries.every(([key, value]) => key.length > 0 && value.length > 0),
  ).toBe(true);
});

it('dado o provider web real quando carrega pt-BR então mescla o catálogo BOAT byte a byte', async () => {
  TestBed.configureTestingModule({ providers: [teatAuthenticatedProvider] });
  const options = TestBed.inject(STYNX_I18N_OPTIONS);
  const catalog = await options.loadCatalog('pt-BR');
  for (const [key, value] of Object.entries(BOAT_PT_BR_CATALOG)) {
    expect.soft(catalog[key], key).toBe(value);
  }
});

it('dadas as cinco páginas web quando montadas então axe, orientação, vocabulário e marcadores são verificados no DOM', async () => {
  const rendered: string[] = [];
  for (const { path, route } of boatRuntimeRoutes()) {
    expect(route?.loadComponent, path).toBeTypeOf('function');
    const component = (await route?.loadComponent?.()) as Type<unknown>;
    TestBed.configureTestingModule({
      imports: [component],
      providers: [
        {
          provide: StynxI18nService,
          useValue: {
            translate: (key: string) =>
              BOAT_PT_BR_CATALOG[key as keyof typeof BOAT_PT_BR_CATALOG] ?? key,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    await expectTeatA11yState(root);
    expect
      .soft(root.textContent, `${path}: marcador`)
      .not.toContain('source_pending:OD-R15-004');
    rendered.push(root.textContent ?? '');
    fixture.destroy();
    TestBed.resetTestingModule();
  }
  const text = rendered.join(' ');
  expect(text).toMatch(/fotografar a cena, não o sofrimento/i);
  expect(text).toMatch(/sinistro/i);
});
