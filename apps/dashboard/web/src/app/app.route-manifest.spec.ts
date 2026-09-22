// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.route-manifest.spec.ts" (C-02-01..04).
// Compara a transcrição de produção (`app.route-manifest.ts`, TASK-0005) com a transcrição
// independente do Inspector (`src/testing/route-manifest.fixture.ts`), ambas derivadas de
// `route-manifest.md` sem uma importar a outra (ADR-0001). Este spec não compila até
// `src/app/app.route-manifest.ts` existir (TASK-0005) — falha esperada de módulo (§14.2 regra 2).
import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_ROUTE_MANIFEST,
  DASHBOARD_SCREEN_SLUGS,
  DETRAN_ROLE_CODES,
  i18nSegmentOf,
  manifestEntriesOf,
  manifestEntryOf,
  routePathOf,
  screenSlugOf,
  titleKeyOf,
  type DashboardModule,
  type DashboardPanel,
} from './app.route-manifest.js';
import {
  DASHBOARD_ROUTE_MANIFEST_FIXTURE,
  DASHBOARD_SCREEN_SLUGS_FIXTURE,
  POLICY_MATRIX_FIXTURE,
} from '../testing/route-manifest.fixture.js';
import { DETRAN_ROLES_FIXTURE } from '../testing/roles.fixture.js';

describe('app.route-manifest.ts', () => {
  it('dado DASHBOARD_ROUTE_MANIFEST e DASHBOARD_ROUTE_MANIFEST_FIXTURE quando comparados então 22 entradas iguais uma a uma, na mesma ordem (C-02-01)', () => {
    expect(DASHBOARD_ROUTE_MANIFEST).toHaveLength(22);
    expect(DASHBOARD_ROUTE_MANIFEST_FIXTURE).toHaveLength(22);
    DASHBOARD_ROUTE_MANIFEST.forEach((entry, index) => {
      const expected = DASHBOARD_ROUTE_MANIFEST_FIXTURE[index];
      expect(entry.path, `entrada #${index + 1} path`).toBe(expected.path);
      expect(entry.id).toBe(expected.id);
      expect(entry.sheet).toBe(expected.sheet);
      expect(entry.screen).toBe(expected.screen);
      expect(entry.layer).toBe(expected.layer);
      expect(entry.access).toBe(expected.access);
      expect(entry.policy).toBe(expected.policy);
      expect(entry.roles ? [...entry.roles] : null).toEqual(
        expected.roles ? [...expected.roles] : null,
      );
      expect(entry.module).toBe(expected.module);
      expect(entry.slug).toBe(expected.slug);
      expect([...entry.uc]).toEqual([...expected.uc]);
      expect([...entry.journeys]).toEqual([...expected.journeys]);
      expect([...entry.blocks]).toEqual([...expected.blocks]);
      expect([...entry.forms]).toEqual([...expected.forms]);
      expect([...entry.fixed]).toEqual([...expected.fixed]);
      expect(entry.kind).toBe(expected.kind);
      expect(entry.level).toBe(expected.level);
      expect(entry.parent).toBe(expected.parent);
    });
  });

  it('dado o manifesto quando contadas as invariantes de route-manifest.md §A então batem com o fixture (C-02-02, C-01-01)', () => {
    const withSheet = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.parent === null && entry.sheet !== null,
    );
    expect(withSheet).toHaveLength(18);
    expect(withSheet.map((entry) => entry.id)).toEqual([
      'D-01',
      'D-02',
      'D-03',
      'D-04',
      'D-05',
      'D-06',
      'D-07',
      'D-08',
      'D-09',
      'D-10',
      'D-11',
      'D-12',
      'D-13',
      'D-14',
      'D-15',
      'D-16',
      'D-17',
      'D-18',
    ]);
    expect(withSheet.map((entry) => entry.sheet)).toEqual([
      'IU-DASH-D-01',
      'IU-DASH-D-02',
      'IU-DASH-D-03',
      'IU-DASH-D-04',
      'IU-DASH-D-05',
      'IU-DASH-D-06',
      'IU-DASH-D-07',
      'IU-DASH-D-08',
      'IU-DASH-D-09',
      'IU-DASH-D-10',
      'IU-DASH-D-11',
      'IU-DASH-D-12',
      'IU-DASH-D-13',
      'IU-DASH-D-14',
      'IU-DASH-D-15',
      'IU-DASH-D-16',
      'IU-DASH-D-17',
      'IU-DASH-D-18',
    ]);

    const auxiliaries = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.kind === 'auxiliary',
    );
    expect(auxiliaries).toHaveLength(2);
    for (const aux of auxiliaries) {
      expect(aux.module).toBe('core');
      expect(aux.sheet).toBeNull();
      expect(aux.id).toBeNull();
      expect(aux.policy).toBeNull();
      expect(aux.roles).toBeNull();
      expect(aux.access).toBeNull();
    }

    const children = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.parent !== null,
    );
    expect(children).toHaveLength(2);
    expect(children.map((entry) => entry.id)).toEqual(['D-14', 'D-16']);
    for (const child of children) {
      const parent = DASHBOARD_ROUTE_MANIFEST.find(
        (entry) => entry.path === child.parent,
      );
      expect(parent, `pai de ${child.path}`).toBeDefined();
      expect(child.sheet).toBe(parent?.sheet);
      expect(child.policy).toBe(parent?.policy);
      expect(child.access).toBe(parent?.access);
      expect([...(child.roles ?? [])]).toEqual([...(parent?.roles ?? [])]);
      expect(child.slug).toBe(parent?.slug);
    }

    const screens = DASHBOARD_ROUTE_MANIFEST.map(
      (entry) => entry.screen,
    ).filter((screen): screen is DashboardPanel => screen !== null);
    expect(new Set(screens).size).toBe(screens.length);
    expect([...screens].sort()).toEqual([
      'P-01',
      'P-02',
      'P-03',
      'P-04',
      'P-05',
      'P-06',
      'P-07',
      'P-08',
      'P-09',
    ]);

    const withPolicy = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.policy !== null,
    );
    for (const entry of withPolicy) {
      expect(['N0', 'N1', 'N2']).toContain(entry.access);
      expect(Object.keys(POLICY_MATRIX_FIXTURE)).toContain(entry.policy);
      expect([...(entry.roles ?? [])]).toEqual([
        ...POLICY_MATRIX_FIXTURE[entry.policy as string],
      ]);
    }

    const modules: readonly DashboardModule[] = [
      'core',
      'triage',
      'radar',
      'integrations',
      'duties',
      'comparison',
      'audit',
      'transparency',
      'crashes',
      'catalogue',
      'reports',
    ];
    for (const entry of DASHBOARD_ROUTE_MANIFEST) {
      expect(modules).toContain(entry.module);
      if (entry.module === 'core') expect(entry.kind).toBe('auxiliary');
    }

    expect(
      DASHBOARD_ROUTE_MANIFEST.every((entry) => entry.level === 'L0'),
    ).toBe(true);

    const topLevelSlugs = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.parent === null,
    ).map((entry) => entry.slug);
    expect(new Set(topLevelSlugs).size).toBe(20);
  });

  it('dado cada uma das 20 entradas de §A quando screenSlugOf(path) então bate com o manifesto, a tabela e a fixture; dado as 2 filhas então slug = slug do pai; dado cada slug então sem hífen no segmento i18n; dado cada entrada então titleKeyOf correta (C-02-03)', () => {
    const topLevel = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.parent === null,
    );
    for (const entry of topLevel) {
      expect(screenSlugOf(entry.path)).toBe(entry.slug);
      expect(DASHBOARD_SCREEN_SLUGS[entry.path]).toBe(entry.slug);
      expect(DASHBOARD_SCREEN_SLUGS_FIXTURE[entry.path]).toBe(entry.slug);
    }
    expect(screenSlugOf('/monitoramento')).toBe('triagem');
    expect(screenSlugOf('/monitoramento/deveres/:id/ciclos/:period')).toBe(
      'deveres-id-ciclos-period',
    );

    const children = DASHBOARD_ROUTE_MANIFEST.filter(
      (entry) => entry.parent !== null,
    );
    for (const child of children) {
      const parent = DASHBOARD_ROUTE_MANIFEST.find(
        (entry) => entry.path === child.parent,
      );
      expect(child.slug).toBe(parent?.slug);
    }

    for (const entry of DASHBOARD_ROUTE_MANIFEST) {
      expect(i18nSegmentOf(entry.slug)).not.toContain('-');
    }

    for (const entry of DASHBOARD_ROUTE_MANIFEST) {
      const key = titleKeyOf(entry);
      if (entry.kind === 'page') {
        expect(key).toBe(
          `dashboard.screens.${i18nSegmentOf(entry.slug)}.title`,
        );
      } else {
        expect(key).toBe(`dashboard.shell.title.${i18nSegmentOf(entry.slug)}`);
      }
    }
  });

  it('dado os 11 módulos quando manifestEntriesOf(m) então ordem do manifesto, união = 22, core = 2, catalogue = 4, reports = 3; manifestEntryOf/routePathOf conforme §2 (C-02-04)', () => {
    const modules: readonly DashboardModule[] = [
      'core',
      'triage',
      'radar',
      'integrations',
      'duties',
      'comparison',
      'audit',
      'transparency',
      'crashes',
      'catalogue',
      'reports',
    ];
    let union = 0;
    for (const module of modules) {
      const entries = manifestEntriesOf(module);
      union += entries.length;
      const orderedIndexes = entries.map((entry) =>
        DASHBOARD_ROUTE_MANIFEST.indexOf(entry),
      );
      expect(orderedIndexes).toEqual([...orderedIndexes].sort((a, b) => a - b));
    }
    expect(union).toBe(22);
    expect(manifestEntriesOf('core')).toHaveLength(2);
    expect(manifestEntriesOf('catalogue')).toHaveLength(4);
    expect(manifestEntriesOf('reports')).toHaveLength(3);

    expect(() => manifestEntryOf('/x')).toThrow();
    expect(routePathOf(manifestEntryOf('/monitoramento'))).toBe('');
    expect(routePathOf(manifestEntryOf('/monitoramento/alertas/:id'))).toBe(
      'alertas/:id',
    );
    expect(routePathOf(manifestEntryOf('/monitoramento/auth/callback'))).toBe(
      'auth/callback',
    );
  });

  it('dado DETRAN_ROLE_CODES quando comparado a DETRAN_ROLES_FIXTURE então 36 códigos iguais, mesma ordem', () => {
    expect([...DETRAN_ROLE_CODES]).toEqual([...DETRAN_ROLES_FIXTURE]);
  });
});
