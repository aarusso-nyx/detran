// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/dashboard-shell.component.spec.ts"
// (C-02-27..32).
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import {
  DashboardShellComponent,
  NAV_GROUP_OF,
  NAV_GROUP_ORDER,
  navigationFor,
} from './dashboard-shell.component.js';
import { DashboardTitleStrategy } from './title.strategy.js';
import { SseService } from './sse/sse.service.js';
import {
  buildTestCatalog,
  initializeMarkerI18n,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import { DETRAN_ROLES_FIXTURE } from '../../testing/roles.fixture.js';
import {
  DASHBOARD_ROUTE_MANIFEST_FIXTURE,
  NAV_GROUPS_FIXTURE,
} from '../../testing/route-manifest.fixture.js';
import { layerAllowsFixture } from '../../testing/layer-table.fixture.js';
import {
  createStynxSessionStub,
  permissionsForRolesFixture,
  sessionForRoles,
} from '../../testing/stynx-session.stub.js';

const TOP_LEVEL = DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.parent === null && entry.sheet !== null,
);

const GROUP_OF_ID: Readonly<Record<string, string>> = Object.fromEntries(
  NAV_GROUPS_FIXTURE.flatMap((group) => group.ids.map((id) => [id, group.key])),
);

/** Recalcula a navegação esperada a partir das fixtures (route-manifest.md §D/§E/§I), sem
 * depender de uma tabela por papel copiada — a mesma regra que `navigationFor` deve implementar. */
function expectedNavigation(
  roles: readonly string[],
): readonly { key: string; ids: readonly string[] }[] {
  const permissions = permissionsForRolesFixture(roles);
  const activeIds = TOP_LEVEL.filter((entry) => {
    const policyAllowed =
      permissions.includes('*') || permissions.includes(entry.policy as string);
    const layerAllowed = layerAllowsFixture(roles, entry.access as never);
    return policyAllowed && layerAllowed && GROUP_OF_ID[entry.id as string];
  }).map((entry) => entry.id as string);

  return NAV_GROUPS_FIXTURE.map((group) => ({
    key: group.key,
    ids: group.ids.filter((id) => activeIds.includes(id)),
  })).filter((group) => group.ids.length > 0);
}

const KEYS = [
  'dashboard.shell.brand',
  'dashboard.shell.nav.acao',
  'dashboard.shell.nav.vigilancia',
  'dashboard.shell.nav.contexto',
  'dashboard.shell.nav.tecnico',
  'dashboard.a11y.skip_to_content',
  'dashboard.a11y.nav_main',
  'dashboard.a11y.live_region',
  'dashboard.common.action.logout',
  'dashboard.states.unavailable',
  // C-02-31: título de uma rota do manifesto usado no cenário do DashboardTitleStrategy.
  'dashboard.screens.triagem.title',
  ...TOP_LEVEL.map(
    (entry) => `dashboard.shell.title.${entry.slug.replace(/-/g, '_')}`,
  ),
] as const;

function fakeSse(
  overrides: Partial<{ polling: boolean; status: string }> = {},
) {
  return {
    status: signal(overrides.status ?? 'live'),
    polling: signal(overrides.polling ?? false),
    live: signal(!(overrides.polling ?? false)),
    connect: () => undefined,
    disconnect: () => undefined,
  } as unknown as SseService;
}

async function renderShell(
  roles: readonly string[],
  sseOverrides: Partial<{ polling: boolean; status: string }> = {},
): Promise<{
  fixture: ComponentFixture<DashboardShellComponent>;
  element: HTMLElement;
}> {
  TestBed.configureTestingModule({
    imports: [markerI18nModule([...KEYS]), DashboardShellComponent],
    providers: [
      provideRouter(
        TOP_LEVEL.map((entry) => ({
          path: entry.path.replace(/^\/monitoramento\/?/, ''),
          component: EmptyRouteComponent,
        })),
      ),
      { provide: StynxSessionService, useValue: sessionForRoles(roles) },
      { provide: SseService, useValue: fakeSse(sseOverrides) },
    ],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(DashboardShellComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

@Component({ selector: 'dash-empty-route', template: '', standalone: true })
class EmptyRouteComponent {}

describe('core/dashboard-shell.component.ts', () => {
  it.each(DETRAN_ROLES_FIXTURE)(
    'dado navigationFor com o papel isolado %s então grupos e itens batem com a derivação de §D/§E/§I (C-02-27, C-01-10)',
    (role) => {
      const permissions = permissionsForRolesFixture([role]);
      const result = navigationFor({ roles: [role], permissions });
      const expected = expectedNavigation([role]);
      expect(result.map((g) => g.key)).toEqual(expected.map((g) => g.key));
      result.forEach((group, index) => {
        expect(group.items.map((item) => item.id)).toEqual(expected[index].ids);
      });
    },
  );

  it('dado navigationFor com [CANDIDATO] então [] (C-02-27)', () => {
    expect(navigationFor({ roles: ['CANDIDATO'], permissions: [] })).toEqual(
      [],
    );
  });

  it('dado navigationFor com [dash-operator, DPO] então união dos dois papéis (C-02-27)', () => {
    const roles = ['dash-operator', 'DPO'];
    const permissions = permissionsForRolesFixture(roles);
    const result = navigationFor({ roles, permissions });
    const expected = expectedNavigation(roles);
    expect(result.map((g) => g.key)).toEqual(expected.map((g) => g.key));
    result.forEach((group, index) => {
      expect(group.items.map((item) => item.id)).toEqual(expected[index].ids);
    });
  });

  it('dado NAV_GROUP_ORDER/NAV_GROUP_OF quando lidos então batem com route-manifest.md §I (D-02/D-07/D-09 e as filhas de §B ausentes)', () => {
    expect([...NAV_GROUP_ORDER]).toEqual([
      'acao',
      'vigilancia',
      'contexto',
      'tecnico',
    ]);
    for (const [id, group] of Object.entries(GROUP_OF_ID)) {
      expect(NAV_GROUP_OF[id as never]).toBe(group);
    }
    for (const excluded of ['D-02', 'D-07', 'D-09']) {
      expect(NAV_GROUP_OF[excluded as never]).toBeUndefined();
    }
  });

  it('dado o shell renderizado com dash-operator então applicationName/navigation=[] no kit e <nav> agrupada por section/h2/li conforme os grupos presentes (C-02-28)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const { element } = await renderShell(['dash-operator']);
    const shellHost = element.querySelector('detran-app-shell');
    expect(shellHost).not.toBeNull();
    const nav = element.querySelector(
      `nav[aria-label="${catalog['dashboard.a11y.nav_main']}"]`,
    );
    expect(nav).not.toBeNull();
    const expected = expectedNavigation(['dash-operator']);
    const sections = nav!.querySelectorAll('section[data-nav-group]');
    expect(sections.length).toBe(expected.length);
    sections.forEach((section, index) => {
      expect(section.getAttribute('data-nav-group')).toBe(expected[index].key);
      const heading = section.querySelector('h2');
      expect(heading?.textContent).toContain(
        catalog[`dashboard.shell.nav.${expected[index].key}`],
      );
      const items = section.querySelectorAll('[data-nav-item]');
      expect(
        [...items].map((item) => item.getAttribute('data-nav-item')),
      ).toEqual(expected[index].ids);
    });
  });

  it('dado o shell quando lido então o primeiro elemento focável é o skip-link para #conteudo; região aria-live presente; logout só com sessão ativa (C-02-29)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const { element } = await renderShell(['dash-operator']);
    const focusable = element.querySelector(
      'a, button, input, [tabindex]',
    ) as HTMLAnchorElement;
    expect(focusable.textContent).toContain(
      catalog['dashboard.a11y.skip_to_content'],
    );
    expect(focusable.getAttribute('href')).toBe('#conteudo');
    const live = element.querySelector(
      `[role="status"][aria-live="polite"][aria-label="${catalog['dashboard.a11y.live_region']}"]`,
    );
    expect(live).not.toBeNull();
    const logout = [...element.querySelectorAll('button')].find((btn) =>
      btn.textContent?.includes(catalog['dashboard.common.action.logout']),
    );
    expect(logout).toBeDefined();
  });

  it('dado logout inativo (sessão inativa) então o botão de logout não aparece (C-02-29)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    TestBed.configureTestingModule({
      imports: [markerI18nModule([...KEYS]), DashboardShellComponent],
      providers: [
        provideRouter([]),
        {
          // `sessionForRoles` sempre ativa a sessão (A7(7)); o cenário aqui é justamente
          // sessão inativa, então usamos o stub bruto sem activate.
          provide: StynxSessionService,
          useValue: createStynxSessionStub({ active: false }),
        },
        { provide: SseService, useValue: fakeSse() },
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const logout = [...element.querySelectorAll('button')].find((btn) =>
      btn.textContent?.includes(catalog['dashboard.common.action.logout']),
    );
    expect(logout).toBeUndefined();
  });

  it('dado SseService status polling quando o shell renderiza então aria-live contém dashboard.states.unavailable (C-02-30)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const polling = await renderShell(['dash-operator'], {
      polling: true,
      status: 'polling',
    });
    const liveRegion = polling.element.querySelector(
      `[role="status"][aria-live="polite"][aria-label="${catalog['dashboard.a11y.live_region']}"]`,
    );
    expect(liveRegion?.textContent).toContain(
      catalog['dashboard.states.unavailable'],
    );
  });

  it('dado SseService status live quando o shell renderiza então aria-live vazia (C-02-30)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const live = await renderShell(['dash-operator'], {
      polling: false,
      status: 'live',
    });
    const liveRegion2 = live.element.querySelector(
      `[role="status"][aria-live="polite"][aria-label="${catalog['dashboard.a11y.live_region']}"]`,
    );
    expect(liveRegion2?.textContent?.trim()).toBe('');
  });

  it('dado DashboardTitleStrategy quando a rota tem title dashboard.screens.triagem.title então document.title = "<texto> — <marca>"; sem title então só a marca (C-02-31)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    TestBed.configureTestingModule({
      imports: [markerI18nModule([...KEYS])],
      providers: [
        provideRouter([
          {
            path: 'com-titulo',
            component: EmptyRouteComponent,
            title: 'dashboard.screens.triagem.title',
          },
          { path: 'sem-titulo', component: EmptyRouteComponent },
        ]),
        { provide: TitleStrategy, useClass: DashboardTitleStrategy },
      ],
    });
    await initializeMarkerI18n();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/com-titulo');
    expect(document.title).toBe(
      `${catalog['dashboard.screens.triagem.title']} — ${catalog['dashboard.shell.brand']}`,
    );
    await harness.navigateByUrl('/sem-titulo');
    expect(document.title).toBe(catalog['dashboard.shell.brand']);
  });

  it('dado o shell renderizado com catálogo de marcadores quando lido então nenhum literal fora do catálogo; axe sem serious/critical em light e dark (C-02-32)', async () => {
    const { element } = await renderShell(['dash-operator']);
    const { withoutMarkers } =
      await import('../../testing/i18n-test-catalog.js');
    const remainder = withoutMarkers(element.textContent ?? '', [...KEYS]);
    expect(remainder).not.toMatch(/[a-zA-Z]/);
    const { expectA11yStateInvariants } =
      await import('../../testing/a11y-state.spec-helper.js');
    await expectA11yStateInvariants(element, buildTestCatalog([...KEYS]), {
      skipLiveRegion: true,
    });
  });
});
