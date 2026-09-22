// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "src/app/screens/screens.spec.ts" — tela ↔
// ficha ↔ rota ↔ i18n (C-02-78..79).
import { describe, expect, it } from 'vitest';
import { listSheetFiles, readAppCatalog, readSheet } from '../../testing/kb.js';
import { DASHBOARD_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture.js';

const SHEET_COMPONENT_UNIVERSE = [
  'FreshnessSeal',
  'SeverityChip',
  'AlertCard',
  'AlertLifecycle',
  'ClockGovernorBadge',
  'LegalBasisTag',
  'TargetVsCeiling',
  'DutyCalendar',
  'DutyCycleStepper',
  'EvidenceAttach',
  'DistributionChart',
  'SuppressedCell',
  'LayerGate',
  'ExportDialog',
  'SourceStatusTable',
  'DeepLinkButton',
  'ClassificationBadge',
];

const PAGES = DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.parent === null && entry.sheet !== null,
);

describe('screens.spec.ts (C-02-78)', () => {
  it.each(PAGES)(
    'dado a entrada $id (sheet $sheet) quando readSheet então o arquivo existe, id/apps/path/screen batem e as chaves i18n/componentes são válidos',
    (entry) => {
      const sheet = readSheet(entry.sheet as string);
      expect(sheet.id).toBe(entry.sheet);
      expect(sheet.apps).toEqual(['dashboard']);
      expect(sheet.path).toBe(entry.path);
      expect(sheet.screen).toBe(entry.screen);
      const catalog = readAppCatalog();
      const segment = entry.slug.replace(/-/g, '_');
      for (const key of sheet.i18nKeys) {
        expect(key.startsWith(`dashboard.screens.${segment}.`), key).toBe(true);
        expect(catalog, key).toHaveProperty(key);
      }
      for (const component of sheet.components) {
        expect(SHEET_COMPONENT_UNIVERSE, component).toContain(component);
      }
    },
  );
});

describe('screens.spec.ts (C-02-79)', () => {
  it('dado listSheetFiles() quando comparado ao manifesto então exatamente os 18 ids IU-DASH-D-01..18 e nenhum arquivo a mais (C-01-01)', () => {
    const files = listSheetFiles();
    const ids = files.map((file) => file.replace(/\.md$/, ''));
    const expected = PAGES.map((entry) => entry.sheet).sort();
    expect(ids.sort()).toEqual(expected);
    expect(ids).toHaveLength(18);
  });

  it.each(PAGES)(
    'dado a rota $id quando a página é resolvida então o componente/selector segue o slug $slug (dash-<slug>-page)',
    async (entry) => {
      const module = entry.module;
      const kebabSlug = entry.slug;
      const path = `../features/${module}/pages/${kebabSlug}.page.js`;
      const page = await import(path);
      const componentName = Object.keys(page).find((name) =>
        name.endsWith('PageComponent'),
      );
      expect(
        componentName,
        `${entry.id} não exporta um *PageComponent`,
      ).toBeDefined();
    },
  );
});
