// R-0014 TASK-0007 (Inspector). Contrato ficha ↔ i18n (plan.md M9/M11; prompts/TASK-0007.md
// §Tarefa item 2): toda chave `portal.screens.t<nn>.*` listada na seção "Chaves i18n" de cada
// ficha existe no catálogo; `portal.screens.t<nn>.title` existe para as 27 telas; nenhuma chave
// `portal.screens.t<nn>.*` do catálogo pertence a uma tela sem ficha.
import {
  extractSection,
  listSheetIds,
  readCatalog,
  readSheet,
} from '../../testing/kb';

// O prompt de TASK-0007 sugere `portal\.screens\.t\d{2}\.[a-z0-9_.]+` (só minúsculas), mas o
// catálogo real (TASK-0006) usa segmentos camelCase legítimos em várias chaves de campo
// (`field.additionalText`, `field.driverCpf`, `field.driverCnh` — conferidas nas fichas T-04/T-05
// e existentes em portal.pt-BR.json); a versão só-minúsculas truncava essas chaves no meio
// (`field.driver`, `field.additional`) e acusava "chave ausente" por um defeito do próprio
// regex, não da ficha/catálogo. Estendido para `[A-Za-z0-9_.]+` — mesma exigência semântica
// (toda chave citada existe no catálogo), captura completa.
const SCREEN_KEY_PATTERN = /portal\.screens\.t\d{2}\.[A-Za-z0-9_.]+/g;
const SCREEN_KEY_PREFIX = /^portal\.screens\.t(\d{2})\./;

describe('contrato de chaves i18n das fichas (M9/M11)', () => {
  const catalog = readCatalog();
  const catalogKeys = new Set(Object.keys(catalog));
  const sheetIds = listSheetIds();

  for (const sheet of sheetIds) {
    it(`dado a ficha ${sheet} quando a seção "Chaves i18n" é lida então toda chave portal.screens.* existe no catálogo`, () => {
      const section = extractSection(readSheet(sheet), 'Chaves i18n');
      const keys = [...section.matchAll(SCREEN_KEY_PATTERN)].map(
        (match) => match[0],
      );
      expect(keys.length).toBeGreaterThan(0);
      const missing = keys.filter((key) => !catalogKeys.has(key));
      expect(
        missing,
        `chaves citadas em ${sheet} sem entrada no catálogo: ${missing.join(', ')}`,
      ).toEqual([]);
    });
  }

  it('dado as 27 telas quando o catálogo é lido então portal.screens.t<nn>.title existe para cada uma', () => {
    const missing = sheetIds
      .map((sheet) => sheet.match(/T(\d{2})$/)?.[1])
      .filter((nn): nn is string => !!nn)
      .filter((nn) => !catalogKeys.has(`portal.screens.t${nn}.title`));
    expect(
      missing,
      `portal.screens.t<nn>.title ausente para: ${missing.join(', ')}`,
    ).toEqual([]);
    expect(sheetIds).toHaveLength(27);
  });

  it('dado toda chave portal.screens.t<nn>.* do catálogo quando comparada às fichas em disco então pertence a uma tela com ficha', () => {
    const sheetNumbers = new Set(
      sheetIds
        .map((sheet) => sheet.match(/T(\d{2})$/)?.[1])
        .filter((nn): nn is string => !!nn),
    );
    const orphaned = [...catalogKeys].filter((key) => {
      const match = key.match(SCREEN_KEY_PREFIX);
      return match && !sheetNumbers.has(match[1]);
    });
    expect(
      orphaned,
      `chaves portal.screens.* sem ficha correspondente: ${orphaned.join(', ')}`,
    ).toEqual([]);
  });
});
