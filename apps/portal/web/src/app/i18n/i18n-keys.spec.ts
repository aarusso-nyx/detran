// R-0014 TASK-0002 (Inspector). Contrato de i18n (M9/M10 do plan.md): (a) todo literal
// `'portal.…'` com ≥ 2 pontos em `src/**/*.ts` (exceto specs e `src/testing`) existe como
// chave em `src/app/i18n/portal.pt-BR.json`; (b) toda chave do JSON tem os dois primeiros
// segmentos numa linha da tabela "## Namespaces i18n" de `parameter-catalogue.md` (lida com
// `node:fs`, sem reusar `tools/parameters/parser.mjs`, fora da fronteira de TASK-0002); (c)
// nenhum valor do JSON é um token `[A-Z_]{4,}` puro (estado interno nunca vaza — Regra 3 do
// prompt). O catálogo real (`@stynx-nyx/angular-i18n`) é um `Record<string,string>` plano
// (chave = caminho pontuado completo), confirmado em
// node_modules/@stynx-nyx/angular-i18n/dist/types/stynx-nyx-angular-i18n.d.ts.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import portalCatalog from './portal.pt-BR.json';

const specDir = dirname(fileURLToPath(import.meta.url)); // .../src/app/i18n
const appSrcRoot = join(specDir, '..', '..'); // .../src
const repoRoot = join(specDir, '..', '..', '..', '..', '..', '..');
const catalogueMdPath = join(
  repoRoot,
  'docs/framework/arch/parameter-catalogue.md',
);

const PORTAL_LITERAL = /['"](portal\.[A-Za-z0-9_.-]+)['"]/g;

function collectSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const item of readdirSync(root, { withFileTypes: true })) {
    if (item.name === 'testing') continue;
    const path = join(root, item.name);
    if (item.isDirectory()) {
      files.push(...collectSourceFiles(path));
    } else if (item.name.endsWith('.ts') && !item.name.endsWith('.spec.ts')) {
      files.push(path);
    }
  }
  return files;
}

function collectPortalLiterals(files: readonly string[]): Set<string> {
  const literals = new Set<string>();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(PORTAL_LITERAL)) {
      const literal = match[1];
      if (literal.split('.').length >= 3) literals.add(literal);
    }
  }
  return literals;
}

/** Extrai a coluna `Namespace` da tabela sob "## Namespaces i18n" (M10 do plan.md). */
function parseNamespaceAllowlist(catalogueMd: string): Set<string> {
  const lines = catalogueMd.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    line.startsWith('## Namespaces i18n'),
  );
  if (headingIndex < 0) return new Set();
  const namespaces = new Set<string>();
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line)) break;
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim().replace(/`/g, ''));
    if (cells[0] === 'Namespace' || /^:?-{3,}:?$/.test(cells[0])) continue;
    if (cells[0]) namespaces.add(cells[0]);
  }
  return namespaces;
}

describe('contrato de chaves i18n do Portal (M9/M10)', () => {
  it('dado todo literal portal.* com ≥ 2 pontos em src/**/*.ts (exceto specs e src/testing) quando comparado ao catálogo então existe como chave em portal.pt-BR.json', () => {
    const files = collectSourceFiles(appSrcRoot).filter((file) =>
      statSync(file).isFile(),
    );
    const literals = collectPortalLiterals(files);
    const catalogKeys = new Set(
      Object.keys(portalCatalog as Record<string, string>),
    );
    const missing = [...literals].filter(
      (literal) => !catalogKeys.has(literal),
    );
    expect(
      missing,
      `chaves i18n usadas sem entrada no catálogo: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('dado toda chave do catálogo quando comparada à allowlist de namespaces então os dois primeiros segmentos pertencem a uma linha de "## Namespaces i18n"', () => {
    const catalogueMd = readFileSync(catalogueMdPath, 'utf8');
    const allowlist = parseNamespaceAllowlist(catalogueMd);
    const catalogKeys = Object.keys(portalCatalog as Record<string, string>);
    const offenders = catalogKeys.filter((key) => {
      const [first, second] = key.split('.');
      return !allowlist.has(`${first}.${second}`);
    });
    expect(
      offenders,
      `chaves fora da allowlist de namespaces: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('dado todo valor do catálogo quando inspecionado então nenhum é um token [A-Z_]{4,} puro (estado interno não vaza)', () => {
    const entries = Object.entries(portalCatalog as Record<string, string>);
    const leaked = entries.filter(([, value]) => /^[A-Z_]{4,}$/.test(value));
    expect(
      leaked.map(([key]) => key),
      `valores que vazam token interno: ${leaked.map(([key, value]) => `${key}=${value}`).join(', ')}`,
    ).toEqual([]);
  });
});
