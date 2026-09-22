// R-0016 TASK-0004 (Inspector). Helper de leitura das fichas de tela
// (`docs/framework/product/transversal/dashboard/screens/IU-DASH-D-nn.md`), da semente i18n
// (`docs/framework/arch/i18n/dashboard.pt-BR.json`), da cópia do app
// (`src/app/i18n/dashboard.pt-BR.json`, TASK-0005) e do catálogo de erros
// (`dashboard-error-catalog.md`) para os specs `src/app/screens/screens.spec.ts` e
// `src/app/i18n/i18n.spec.ts` (`CTG-0002.md` §12). Listas fechadas com fonte em comentário —
// nenhum valor inventado.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testingDir = dirname(fileURLToPath(import.meta.url)); // .../apps/dashboard/web/src/testing
export const APP_SRC_ROOT = join(testingDir, '..'); // .../apps/dashboard/web/src
export const REPO_ROOT = join(testingDir, '..', '..', '..', '..', '..'); // raiz do monorepo
export const SCREENS_DIR = join(
  REPO_ROOT,
  'docs/framework/product/transversal/dashboard/screens',
);
export const SEED_CATALOG_PATH = join(
  REPO_ROOT,
  'docs/framework/arch/i18n/dashboard.pt-BR.json',
);
export const I18N_CATALOG_PATH = join(
  APP_SRC_ROOT,
  'app/i18n/dashboard.pt-BR.json',
);
export const ERROR_CATALOG_PATH = join(
  REPO_ROOT,
  'docs/framework/arch/dashboard-error-catalog.md',
);

const SHEET_FILE_PATTERN = /^IU-DASH-D-(\d{2})\.md$/;

/** Nomes dos arquivos de ficha em disco (ex.: `IU-DASH-D-01.md`), ordenados; exclui `IU-DASH-001.md`. */
export function listSheetFiles(): string[] {
  return readdirSync(SCREENS_DIR)
    .filter((name) => SHEET_FILE_PATTERN.test(name))
    .sort();
}

function frontMatter(text: string): Record<string, string> {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end < 0) return {};
  const result: Record<string, string> = {};
  for (const line of text.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim();
  }
  return result;
}

/** Corpo de uma seção `## <heading>` até o próximo `## ` (ou fim do arquivo). */
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

function backtickSpans(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

function parseAppsArray(raw: string): string[] {
  // '[dashboard]' → ['dashboard']
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export interface SheetHeader {
  readonly id: string;
  readonly apps: readonly string[];
  readonly path: string | null;
  readonly screen: string | null;
  readonly title: string;
  readonly i18nKeys: readonly string[];
  readonly components: readonly string[];
}

/** `id` é o `sheet` (ex.: `IU-DASH-D-01`, sem `.md`). */
export function readSheet(id: string): SheetHeader {
  const text = readFileSync(join(SCREENS_DIR, `${id}.md`), 'utf8');
  const front = frontMatter(text);
  const pathMatch = text.match(/Ficha da rota `([^`]+)`/);
  const identidade = extractSection(text, '1. Identidade');
  const screenMatch = identidade.match(/`screen`:\s*P-(\d{2})/);
  const titleRaw = front['title'] ?? '';
  const title = titleRaw.replace(/\s*—\s*especificação de tela\s*$/, '');
  const chaves = extractSection(text, 'Chaves i18n');
  const i18nKeys = backtickSpans(chaves).filter((token) =>
    token.startsWith('dashboard.screens.'),
  );
  const componentes = extractSection(text, 'Componentes compartilhados');
  const components = backtickSpans(componentes);
  return {
    id: front['id'] ?? '',
    apps: front['apps'] ? parseAppsArray(front['apps']) : [],
    path: pathMatch ? pathMatch[1] : null,
    screen: screenMatch ? `P-${screenMatch[1]}` : null,
    title,
    i18nKeys,
    components,
  };
}

/** Códigos `DASH.<CODE>` (com prefixo) citados em `dashboard-error-catalog.md` §1-§6, em ordem
 * de primeira aparição, sem repetição (52). */
export function readErrorCodes(): readonly string[] {
  const text = readFileSync(ERROR_CATALOG_PATH, 'utf8');
  const genericsEnd = text.indexOf('\n## 7.');
  const scope = genericsEnd >= 0 ? text.slice(0, genericsEnd) : text;
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const match of scope.matchAll(/DASH\.[A-Z0-9_]+/g)) {
    if (!seen.has(match[0])) {
      seen.add(match[0]);
      ordered.push(match[0]);
    }
  }
  return ordered;
}

export function readSeedCatalog(): Record<string, string> {
  return JSON.parse(readFileSync(SEED_CATALOG_PATH, 'utf8')) as Record<
    string,
    string
  >;
}

export function readAppCatalog(): Record<string, string> {
  return JSON.parse(readFileSync(I18N_CATALOG_PATH, 'utf8')) as Record<
    string,
    string
  >;
}

function walkTsFiles(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTsFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
}

/** Todos os `.ts` de `src/**` (produção e specs) — usado por C-02-48, C-02-75, C-02-83. */
export function listAppSourceFiles(): string[] {
  const out: string[] = [];
  walkTsFiles(APP_SRC_ROOT, out);
  return out.sort();
}
