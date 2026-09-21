// R-0012 TASK-0005 (Inspector). Critérios C-2A-56…57 do contrato `CTG-0002a.md` §11: tela ↔
// ficha ↔ rota ↔ i18n. Usa só `RAIT_ROUTE_MANIFEST_FIXTURE` (independente de `app.route-manifest.ts`)
// e `kb.ts` sobre as 63 fichas reais em disco (já mescladas de CTG-0001, `main`). Este spec pode
// falhar hoje só se `src/app/i18n/rait.pt-BR.json` (catálogo do app, TASK-0006) ainda não existir.
import { describe, expect, it } from 'vitest';
import { RAIT_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture';
import { listSheetFiles, readSheet, readAppCatalog } from '../../testing/kb';

describe('C-2A-56 — cada entrada com sheet ↔ ficha ↔ i18n', () => {
  const withSheet = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
    (
      entry,
    ): entry is typeof entry & { sheet: NonNullable<typeof entry.sheet> } =>
      entry.sheet !== null,
  );

  it('dado o manifesto quando filtradas as entradas com sheet então são 63', () => {
    expect(withSheet).toHaveLength(63);
  });

  withSheet.forEach((entry) => {
    it(`dado a entrada ${entry.path} (${entry.sheet}) quando lida a ficha então id/path/screen batem e i18nKeys existem no catálogo do app`, () => {
      const sheet = readSheet(entry.sheet);
      expect(sheet.id).toBe(entry.sheet);
      expect(sheet.path).toBe(entry.path);
      if (entry.screen !== null) {
        expect(sheet.screen).toBe(entry.screen);
      }
      const slug =
        entry.path === ''
          ? 'home'
          : entry.path.replace(/:/g, '').replace(/\//g, '-');
      const app = readAppCatalog();
      for (const key of sheet.i18nKeys) {
        expect(key.startsWith(`rait.screens.${slug}.`), key).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(app, key), key).toBe(true);
      }
    });
  });
});

describe('C-2A-57 — listSheetFiles() × manifesto', () => {
  it('dado listSheetFiles() quando comparado ao manifesto então exatamente os 63 ids IU-RAIT-002…064', () => {
    const files = listSheetFiles();
    const ids = files.map((file) => file.replace(/\.md$/, ''));
    const expected = [...Array(63)].map(
      (_, index) => `IU-RAIT-${String(index + 2).padStart(3, '0')}`,
    );
    expect(ids).toEqual(expected);
  });

  it('dado listSheetFiles() quando comparado ao manifesto então nenhum arquivo a mais', () => {
    const fromManifest = new Set(
      RAIT_ROUTE_MANIFEST_FIXTURE.map((entry) => entry.sheet).filter(
        (sheet): sheet is NonNullable<typeof sheet> => sheet !== null,
      ),
    );
    const fromDisk = new Set(
      listSheetFiles().map((file) => file.replace(/\.md$/, '')),
    );
    expect(fromDisk).toEqual(fromManifest);
  });
});
