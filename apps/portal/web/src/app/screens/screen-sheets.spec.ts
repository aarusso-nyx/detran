// R-0014 TASK-0007 (Inspector). Contrato tela ↔ ficha ↔ rota (plan.md M11; prompts/TASK-0007.md
// §Tarefa item 1). O manifesto de produção (`PORTAL_ROUTE_MANIFEST`, TASK-0004) é a fonte da
// verdade sobre rotas: sua fidelidade a `route-manifest.md` já foi provada entrada a entrada por
// TASK-0002 (`app.route-manifest.spec.ts` contra `src/testing/route-manifest.fixture.ts`); aqui
// comparamos o manifesto às fichas escritas por TASK-0005/0013/0014.
import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
import {
  backtickSpans,
  extractSection,
  frontMatter,
  listSheetIds,
  MANDATORY_SCREEN_STATES,
  readSheet,
  SHEET_SECTIONS,
} from '../../testing/kb';

/** Caminho sem barra inicial, como o manifesto grava (`route-manifest.md` §cabeçalho). */
function withoutLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}

const screensWithSheet = PORTAL_ROUTE_MANIFEST.filter(
  (entry) => entry.screen !== null && entry.sheet !== null,
);

const screenIds = [...new Set(screensWithSheet.map((entry) => entry.screen))]
  .filter((screen): screen is `T-${string}` => screen !== null)
  .sort();

describe('contrato tela ↔ ficha (plan.md M11)', () => {
  it('dado cada entrada do manifesto com screen ≠ null quando resolvida então o arquivo da ficha existe', () => {
    const missing = screensWithSheet
      .map((entry) => entry.sheet as string)
      .filter((sheet, index, all) => all.indexOf(sheet) === index)
      .filter((sheet) => !listSheetIds().includes(sheet));
    expect(missing, `fichas ausentes: ${missing.join(', ')}`).toEqual([]);
  });

  for (const screen of screenIds) {
    const entries = screensWithSheet.filter((entry) => entry.screen === screen);
    const sheet = entries[0].sheet as string;

    describe(`dado a ficha ${sheet} (${screen})`, () => {
      const text = readSheet(sheet);
      const meta = frontMatter(text);

      it('quando o front-matter é lido então id = sheet, status = draft, apps = [portal]', () => {
        expect(meta['id']).toBe(sheet);
        expect(meta['status']).toBe('draft');
        expect(meta['apps']).toBe('[portal]');
      });

      it('quando as seções são listadas então as 12 seções do esqueleto (M11) estão presentes', () => {
        const lines = text.split(/\r?\n/).map((line) => line.trim());
        for (const heading of SHEET_SECTIONS) {
          expect(
            lines.includes(`## ${heading}`),
            `seção ausente: ## ${heading}`,
          ).toBe(true);
        }
      });

      it('quando a seção Identidade é lida então cita todas as rotas do manifesto para esta tela', () => {
        const identity = extractSection(text, '1. Identidade');
        const spans = new Set(backtickSpans(identity).map(withoutLeadingSlash));
        const missing = entries
          .map((entry) => withoutLeadingSlash(entry.path))
          .filter((path) => !spans.has(path));
        expect(
          missing,
          `rota(s) do manifesto não citada(s) em Identidade: ${missing.join(', ')}`,
        ).toEqual([]);
      });

      it('quando a seção Identidade é lida então não cita rota de outra tela (plan.md §Adendas A5.b)', () => {
        // Extrai só os spans com forma de rota (iniciados por "/", ex.: `/autos`) — isso evita a
        // colisão com nome de módulo citado na prosa (ex.: T-01 cita `módulo: autos`, sem barra,
        // que não é uma citação de rota) sem restringir a paths compostos: cobre todo o
        // manifesto, inclusive rotas de um segmento (plan.md §Adendas A5.b).
        const identity = extractSection(text, '1. Identidade');
        const routeSpans = new Set(
          backtickSpans(identity)
            .filter((span) => span.startsWith('/'))
            .map(withoutLeadingSlash),
        );
        const ownPaths = new Set(
          entries.map((entry) => withoutLeadingSlash(entry.path)),
        );
        const otherPaths = new Set(
          PORTAL_ROUTE_MANIFEST.filter((entry) => entry.screen !== screen).map(
            (entry) => withoutLeadingSlash(entry.path),
          ),
        );
        const offenders = [...routeSpans].filter(
          (span) => !ownPaths.has(span) && otherPaths.has(span),
        );
        expect(
          offenders,
          `Identidade de ${sheet} cita rota de outra tela: ${offenders.join(', ')}`,
        ).toEqual([]);
      });

      it('quando a seção Acesso é lida então cita o access do manifesto', () => {
        const access = extractSection(text, '2. Acesso');
        for (const entry of entries) {
          expect(
            access.includes(entry.access),
            `access "${entry.access}" (rota ${entry.path}) não citado na seção Acesso de ${sheet}`,
          ).toBe(true);
        }
      });

      it('quando a tabela "Estados obrigatórios" é lida então tem as seis linhas', () => {
        const section = extractSection(
          text,
          'Estados obrigatórios',
        ).toLowerCase();
        const missing = MANDATORY_SCREEN_STATES.filter(
          (state) => !section.includes(state),
        );
        expect(
          missing,
          `linha(s) ausente(s) em "Estados obrigatórios" de ${sheet}: ${missing.join(', ')}`,
        ).toEqual([]);
      });
    });
  }

  it('dado toda ficha IU-PORTAL-T*.md em disco quando comparada ao manifesto então corresponde a um screen (27 ↔ 27)', () => {
    const onDisk = listSheetIds();
    const fromManifest = [
      ...new Set(screensWithSheet.map((entry) => entry.sheet as string)),
    ].sort();
    expect(onDisk).toEqual(fromManifest);
    expect(onDisk).toHaveLength(27);
  });
});
