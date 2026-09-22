// R-0012 TASK-0005 (Inspector). Helper de leitura das fichas de tela
// (docs/framework/product/domains/inf/rait/screens/*.md), do catálogo i18n semente/app e do
// catálogo de erros, para os specs tela ↔ ficha ↔ rota ↔ i18n (`src/app/screens/*.spec.ts`,
// `src/app/i18n/i18n.spec.ts`). Regras de `readSheet` fixadas pela adenda A4 do
// `work/rounds/R-0012/plan.md` (as 63 fichas entregues não trazem "nome visível:" — o título e
// as chaves i18n vêm da seção "## Chaves i18n"), que ratifica e substitui a leitura descrita em
// `contracts/CTG-0002a.md` §10 antes da adenda. Nenhum valor inventado: tudo lido do disco.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testingDir = dirname(fileURLToPath(import.meta.url)); // .../apps/rait/web/src/testing
export const APP_SRC_ROOT = join(testingDir, '..'); // .../apps/rait/web/src
export const REPO_ROOT = join(testingDir, '..', '..', '..', '..', '..'); // raiz do monorepo

export const SCREENS_DIR = join(
  REPO_ROOT,
  'docs/framework/product/domains/inf/rait/screens',
);
export const SEED_CATALOG_PATH = join(
  REPO_ROOT,
  'docs/framework/arch/i18n/rait.pt-BR.json',
);
export const I18N_CATALOG_PATH = join(APP_SRC_ROOT, 'app/i18n/rait.pt-BR.json');
export const ERROR_CATALOG_PATH = join(
  REPO_ROOT,
  'docs/framework/arch/rait-error-catalog.md',
);

const SHEET_FILE_PATTERN = /^IU-RAIT-(\d{3})\.md$/;

/** Nomes dos arquivos de ficha em disco, exceto `IU-RAIT-001.md` (inventário, não ficha de rota). */
export function listSheetFiles(): string[] {
  return readdirSync(SCREENS_DIR)
    .filter((name) => {
      const match = SHEET_FILE_PATTERN.exec(name);
      return match !== null && match[1] !== '001';
    })
    .sort();
}

export interface SheetHeader {
  readonly id: string;
  readonly path: string;
  readonly screen: string | null;
  readonly title: string;
  readonly i18nKeys: readonly string[];
}

function frontMatter(text: string): Record<string, string> {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end < 0) return {};
  const result: Record<string, string> = {};
  for (const line of text.slice(4, end).split('\n')) {
    const match = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (match) result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return result;
}

/** Corpo de uma seção `## <heading>` até o próximo `## ` (heading de nível 2) ou fim do arquivo. */
function extractSection(text: string, heading: string): string {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return '';
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

/**
 * Lê a ficha `id` (`IU-RAIT-nnn`) do disco (adenda A4 de `plan.md`):
 * - `id`: front-matter `id:`.
 * - `path`: linha `` Ficha da rota `([^`]+)` ``, barra inicial normalizada (removida quando
 *   presente — 20 fichas do lote B trazem `/protocolo/novo` etc.).
 * - `screen`: primeiro `T-\d{2}` dessa mesma linha ou, na ausência, da seção "## 1. Identidade";
 *   `null` quando nenhuma das duas cita uma tela.
 * - `title`: texto entre aspas da linha `` - `rait.screens.<slug>.title` — "…" `` dentro da
 *   seção "## Chaves i18n".
 * - `i18nKeys`: todas as chaves `` `rait.screens.…` `` citadas nessa mesma seção, na ordem.
 */
export function readSheet(id: string): SheetHeader {
  const file = join(SCREENS_DIR, `${id}.md`);
  const text = readFileSync(file, 'utf8');
  const front = frontMatter(text);
  if (front['id'] !== id) {
    throw new Error(`${file}: front-matter id ${front['id']} ≠ ${id}`);
  }

  const routeLineMatch = /Ficha da rota `([^`]+)`/.exec(text);
  if (!routeLineMatch) {
    throw new Error(`${file}: linha "Ficha da rota \`...\`" não encontrada`);
  }
  const rawPath = routeLineMatch[1];
  const path = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  // O parágrafo pode quebrar em mais de uma linha física (markdown soft-wrap) — "essa linha"
  // (A4) é o parágrafo inteiro, até a próxima linha em branco.
  const paragraphEnd = text.indexOf('\n\n', routeLineMatch.index);
  const routeParagraph = text.slice(
    text.lastIndexOf('\n', routeLineMatch.index) + 1,
    paragraphEnd < 0 ? text.length : paragraphEnd,
  );

  // `\d{2}` sozinho também casa dentro de "IU-RAIT-031" (o "T" de "RAIT" + "03" de "031") — só
  // conta quando o "T" não é precedido por outra letra maiúscula (isto é, não faz parte de
  // "…RAIT-nnn") e não há um terceiro dígito colado (evita capturar só o início de "031").
  const SCREEN_PATTERN = /(?<![A-Za-z])T-\d{2}(?!\d)/;

  let screen: string | null = null;
  const screenInParagraph = SCREEN_PATTERN.exec(routeParagraph);
  if (screenInParagraph) {
    screen = screenInParagraph[0];
  } else {
    const identity = extractSection(text, '1. Identidade');
    const screenInIdentity = SCREEN_PATTERN.exec(identity);
    screen = screenInIdentity ? screenInIdentity[0] : null;
  }

  const i18nSection = extractSection(text, 'Chaves i18n');
  const keyPattern = /`(rait\.screens\.[A-Za-z0-9_.-]+)`\s*—\s*"([^"]*)"/g;
  const i18nKeys: string[] = [];
  let title: string | null = null;
  for (const match of i18nSection.matchAll(keyPattern)) {
    const [, key, value] = match;
    i18nKeys.push(key);
    if (key.endsWith('.title')) title = value;
  }
  if (title === null) {
    throw new Error(
      `${file}: nenhuma chave "*.title" encontrada em "## Chaves i18n"`,
    );
  }

  return { id, path, screen, title, i18nKeys };
}

/** Códigos `RAIT.[A-Z0-9_]+` citados na seção "## 3. Códigos" do catálogo, em ordem de
 * aparição, sem repetição (uma linha de tabela por código; a §3.1…§3.12 são subseções `###`,
 * que `extractSection` mantém dentro de "## 3. Códigos" — só a próxima `## ` fecha a seção). */
export function readErrorCodes(): readonly string[] {
  const text = readFileSync(ERROR_CATALOG_PATH, 'utf8');
  const section = extractSection(text, '3. Códigos');
  const seen = new Set<string>();
  for (const match of section.matchAll(/RAIT\.[A-Z0-9_]+/g)) {
    seen.add(match[0]);
  }
  return [...seen];
}

export function readSeedCatalog(): Record<string, string> {
  return JSON.parse(readFileSync(SEED_CATALOG_PATH, 'utf8')) as Record<
    string,
    string
  >;
}

/** Lança se o catálogo do app (`src/app/i18n/rait.pt-BR.json`) ainda não existir (TASK-0006). */
export function readAppCatalog(): Record<string, string> {
  return JSON.parse(readFileSync(I18N_CATALOG_PATH, 'utf8')) as Record<
    string,
    string
  >;
}

/** Todo `.ts` sob `src/**` (produção e testing — o mesmo escopo de `verify:parameter-catalogue`,
 * A1 de `plan.md`: "o verificador varre `src/**`"), para C-2A-49/54/55. */
export function listAppSourceFiles(): string[] {
  const files: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.ts')) files.push(path);
    }
  }
  walk(APP_SRC_ROOT);
  return files.sort();
}
