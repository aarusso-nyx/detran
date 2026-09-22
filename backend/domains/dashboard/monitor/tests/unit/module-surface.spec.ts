// CTG-0001 §6 C-0001-06 (M9 f, redação A9 do maestro após a regeneração,
// adendas A10/A22(a) de work/rounds/R-0011/plan.md) — "nenhuma rota altera
// domínio [no CTG-0001]": o gerador emite um controller **vazio** por
// recurso mesmo com `operations: []` (padrão de `crashes`) e `MonitorModule`
// os registra, e `src/index.ts` sempre re-exporta esses controllers vazios
// via `export *` (mesmo padrão de `dashboard-crashes`) — não há caso em que
// esse export esteja ausente, então A10 derruba a sub-asserção "`src/index.ts`
// sem export `*Controller`". A22(a): o CTG-0002 (blueprint 1.1.0, §14.2)
// declara sete controllers MANUSCRITOS em `src/handwritten/surface/*.controller.ts`
// (`DashboardAlertsController`, `DashboardDutiesController`,
// `DashboardCatalogController`, `DashboardSourcesController`,
// `DashboardExportsController`, `DashboardAuditController`,
// `DashboardOpenDataController`), registrados em `monitor.module.ts` gerado —
// a sub-asserção "`src/handwritten/` sem `*.controller.ts`" (verdadeira só no
// CTG-0001) cai; no lugar, prova-se que todo `*.controller.ts` manuscrito
// mora em `src/handwritten/surface/` (nunca em `cycle/`/`projections/`, que
// não roteiam — CTG-0002 §14.1/tabela de locks TASK-0005×TASK-0013). A
// sub-asserção de "sem `commands.openapi.json` **gerado**" também cai: o
// arquivo é um entregável MANUSCRITO de TASK-0006 (WP-D3) e sua presença não
// contradiz "nenhuma rota no *blueprint*"; "gerado pelo blueprints:generate"
// não é verificável por leitura de arquivo (nenhum marcador de proveniência
// no JSON gerado) — a asserção foi removida em vez de reescrita para algo
// não verificável. O que continua valendo: `api.resources[*].operations`
// todos `[]` no blueprint, OpenAPI **gerado** (`BP-DASH-MONITOR-001.openapi.json`)
// sem `paths`, controllers **gerados** (`src/controllers/*.controller.ts`)
// sem método com metadado de rota Nest. Análise ESTÁTICA de texto-fonte (não
// `import` do pacote).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { sep as PATH_SEP } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const PACKAGE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CONTROLLERS_DIR = `${PACKAGE_ROOT}src/controllers`;
const HANDWRITTEN_DIR = `${PACKAGE_ROOT}src/handwritten`;
const BLUEPRINT_PATH = fileURLToPath(
  new URL(
    '../../../../../../docs/framework/blueprints/BP-DASH-MONITOR-001.json',
    import.meta.url,
  ),
);
const OPENAPI_PATH = fileURLToPath(
  new URL(
    '../../../../../../docs/framework/contracts/BP-DASH-MONITOR-001.openapi.json',
    import.meta.url,
  ),
);

/** Lista `*.controller.ts` sob `dir`, recursivo, com caminho relativo a
 * `dir` (ex. `surface/alerts.controller.ts`); `[]` quando `dir` não existe —
 * mantido para não quebrar se `src/handwritten/` sumir numa entrega futura. */
function listControllerFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true } as never)
    .map(String)
    .filter((file) => file.endsWith('.controller.ts'));
}

const ROUTE_DECORATORS = [
  '@Get(',
  '@Post(',
  '@Put(',
  '@Patch(',
  '@Delete(',
  '@Head(',
  '@Options(',
  '@All(',
];

describe('BP-DASH-MONITOR-001 — nenhuma rota altera domínio (CTG-0001 §6 C-0001-06, A9)', () => {
  it('dado o blueprint gerado quando api.resources é lido então todo operations é []', () => {
    const blueprint = JSON.parse(readFileSync(BLUEPRINT_PATH, 'utf8')) as {
      api: { resources: Array<{ name: string; operations: unknown[] }> };
    };
    expect(blueprint.api.resources.length).toBeGreaterThan(0);
    for (const resource of blueprint.api.resources) {
      expect(resource.operations, `resource ${resource.name}`).toEqual([]);
    }
  });

  it('dado o OpenAPI gerado quando lido então paths não tem operações (objeto vazio ou ausente)', () => {
    const openapi = JSON.parse(readFileSync(OPENAPI_PATH, 'utf8')) as {
      paths?: Record<string, unknown>;
    };
    expect(Object.keys(openapi.paths ?? {})).toEqual([]);
  });

  it('dado cada controller gerado quando o texto-fonte é lido então nenhum método além do constructor tem decorator de rota Nest (@Get/@Post/@Put/@Patch/@Delete/…)', () => {
    const files = readdirSync(CONTROLLERS_DIR).filter((file) =>
      file.endsWith('.controller.ts'),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(`${CONTROLLERS_DIR}/${file}`, 'utf8');
      for (const decorator of ROUTE_DECORATORS) {
        expect(
          source.includes(decorator),
          `${file} não deveria conter ${decorator}`,
        ).toBe(false);
      }
    }
  });

  it('dado src/handwritten/ quando listado então todo *.controller.ts mora em src/handwritten/surface/ (nenhum em cycle/ ou projections/ — CTG-0002 §14.2, A22(a))', () => {
    const controllerFiles = listControllerFiles(HANDWRITTEN_DIR);
    expect(controllerFiles.length).toBeGreaterThan(0);
    for (const file of controllerFiles) {
      const normalized = file.split(PATH_SEP).join('/');
      expect(
        normalized.startsWith('surface/'),
        `${file} deveria estar em src/handwritten/surface/`,
      ).toBe(true);
    }
  });
});
