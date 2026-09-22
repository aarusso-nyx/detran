// CTG-0001 §6 C-0001-06 (M9 f, redação A9 do maestro após a regeneração,
// adenda A10 de work/rounds/R-0011/plan.md) — "nenhuma rota altera domínio":
// o gerador emite um controller **vazio** por recurso mesmo com
// `operations: []` (padrão de `crashes`) e `MonitorModule` os registra, e
// `src/index.ts` sempre re-exporta esses controllers vazios via `export *`
// (mesmo padrão de `dashboard-crashes`) — não há caso em que esse export
// esteja ausente, então A10 derruba a sub-asserção "`src/index.ts` sem
// export `*Controller`". O critério vale como: "nenhum controller tem
// método com metadado de rota Nest", `api.resources[*].operations` todos
// `[]`, `src/handwritten/` sem `*.controller.ts`, OpenAPI gerado sem
// operações. Análise ESTÁTICA de texto-fonte (não `import` do pacote):
// `src/index.ts`/`monitor.module.ts` importam
// `./handwritten/projectors.js`/`./handwritten/index.js`, que ainda não
// existem (TASK-0010) — um `import()` dinâmico do módulo falharia por
// dependência ausente, não pelo que este spec quer provar. Isso não depende
// de `src/handwritten/**`.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

/** Lista `*.controller.ts` sob `dir`, recursivo; `[]` quando `dir` ainda não
 * existe (TASK-0010) — "não contém" é verdadeiro tanto para um diretório
 * vazio quanto para um diretório ausente, então não há caso a pular. */
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

  it('dado docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json quando verificado então não existe (CTG-0001 §6)', () => {
    const commandsPath = OPENAPI_PATH.replace(
      '.openapi.json',
      '.commands.openapi.json',
    );
    expect(existsSync(commandsPath)).toBe(false);
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

  it('dado src/handwritten/ quando listado então não contém nenhum *.controller.ts (diretório ainda não existe nesta entrega — TASK-0010 — o que também satisfaz "nenhum")', () => {
    const controllerFiles = listControllerFiles(HANDWRITTEN_DIR);
    expect(controllerFiles).toEqual([]);
  });
});
