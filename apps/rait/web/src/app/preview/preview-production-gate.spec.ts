// R-0033 TASK-0002 (Inspector). C-01 (parte estática) / M1 / M4 / P-02 / P-16 / D-13
// (`frontend-preview-mode.md` §1 item 1, §2, §4, §5; prompt TASK-0002 item 5): o módulo de prévia
// só é alcançável pela entrada `src/main.preview.ts`; `angular.json` tem a configuração `preview`
// de `build`/`serve` do layout fixo e `production`/`development` não a citam; `tsconfig.app.json`
// cobre a entrada; `src/index.preview.html` monta a raiz de prévia; `preview.pt-BR.json` só tem as
// chaves novas do contrato §4, nenhuma já existente no catálogo do app. Lê arquivos do disco (os
// de produção da prévia ainda não existem — TASK-0003 — e estes `it` falham até lá). O gate de
// marca sobre `dist/` (P-01/P-02 por comando) é de TASK-0003/0006.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, readAppCatalog } from '../../testing/kb';
import { PREVIEW_CATALOG_CONTRACT } from './preview.spec-helper';

const APP_ROOT = join(APP_SRC_ROOT, '..');
const PREVIEW_DIR = join(APP_SRC_ROOT, 'app', 'preview');
const MAIN_PREVIEW = join(APP_SRC_ROOT, 'main.preview.ts');

/** `import … from '…/preview/…'` ou `import('…/preview/…')` (estático ou dinâmico). */
const PREVIEW_IMPORT =
  /(?:from\s+|import\s*\(\s*)['"][^'"]*\/preview\/[^'"]*['"]/;

function walkTs(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkTs(path));
    else if (entry.name.endsWith('.ts')) files.push(path);
  }
  return files.sort();
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** `tsconfig*.json` aceita comentários: leitura pelo parser do TypeScript. */
function readTsconfig(path: string): { files?: readonly string[] } {
  const result = ts.parseConfigFileTextToJson(path, readFileSync(path, 'utf8'));
  if (result.error) throw new Error(`${path}: tsconfig ilegível`);
  return result.config as { files?: readonly string[] };
}

interface AngularTargetConfig {
  readonly [key: string]: unknown;
}

interface AngularJson {
  readonly projects: Record<
    string,
    {
      readonly architect: {
        readonly build: {
          readonly options: { readonly assets: readonly unknown[] };
          readonly configurations: Record<string, AngularTargetConfig>;
        };
        readonly serve: {
          readonly configurations: Record<string, AngularTargetConfig>;
        };
      };
    }
  >;
}

const angular = (): AngularJson['projects'][string]['architect'] =>
  readJson<AngularJson>(join(APP_ROOT, 'angular.json')).projects['rait-web']
    .architect;

/** Layout fixo (prompt TASK-0002 §Layout; contrato §2, linha `angular.json`). */
const FIXTURE_ASSET = {
  glob: '*.json',
  input: '../../../docs/framework/arch/fixtures',
  output: 'assets/preview',
};

describe('C-01/P-02 — o módulo de prévia não entra em production/development (M4)', () => {
  const ENTRY_FILES = [
    join(APP_SRC_ROOT, 'main.ts'),
    join(APP_SRC_ROOT, 'app', 'app.routes.ts'),
    join(APP_SRC_ROOT, 'app', 'app.component.ts'),
  ];

  ENTRY_FILES.forEach((file) => {
    const name = relative(APP_ROOT, file);
    it(`dado ${name} quando lido então não importa preview/ nem cita DETRAN_PREVIEW_MARK [negativo]`, () => {
      const text = readFileSync(file, 'utf8');
      expect(PREVIEW_IMPORT.test(text)).toBe(false);
      expect(text).not.toContain('DETRAN_PREVIEW_MARK');
    });
  });

  it('dado todo .ts de src/ fora de src/app/preview/** e de src/main.preview.ts (inclusive core, data, features, shared) quando varrido então nenhum importa preview/ [negativo]', () => {
    const offenders = walkTs(APP_SRC_ROOT)
      .filter((file) => !file.startsWith(`${PREVIEW_DIR}/`))
      .filter((file) => file !== MAIN_PREVIEW)
      .filter((file) => PREVIEW_IMPORT.test(readFileSync(file, 'utf8')))
      .map((file) => relative(APP_ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('dado src/main.preview.ts quando lido então bootstrapApplication(PreviewRootComponent, …) com providePreviewMode()', () => {
    const text = readFileSync(MAIN_PREVIEW, 'utf8');
    expect(text).toMatch(/bootstrapApplication\(\s*PreviewRootComponent\s*,/);
    expect(text).toContain('...providePreviewMode()');
  });
});

describe('C-01 — angular.json (layout fixo)', () => {
  it('dado build.configurations.preview quando lido então browser, index, outputPath, optimization, outputHashing e sourceMap do layout', () => {
    const preview = angular().build.configurations['preview'];
    expect(preview).toBeDefined();
    expect(preview?.['browser']).toBe('src/main.preview.ts');
    expect(preview?.['index']).toBe('src/index.preview.html');
    expect(preview?.['outputPath']).toEqual({
      base: 'dist/preview',
      browser: '',
    });
    expect(preview?.['optimization']).toBe(true);
    expect(preview?.['outputHashing']).toBe('all');
    expect(preview?.['sourceMap']).toBe(false);
  });

  it('dado build.configurations.preview.assets quando lido então o glob de public/ das options mais o asset de fixtures em assets/preview', () => {
    const architect = angular();
    expect(architect.build.configurations['preview']?.['assets']).toEqual([
      ...architect.build.options.assets,
      FIXTURE_ASSET,
    ]);
  });

  it('dado serve.configurations.preview quando lido então buildTarget rait-web:build:preview', () => {
    expect(angular().serve.configurations['preview']?.['buildTarget']).toBe(
      'rait-web:build:preview',
    );
  });

  it('dado serve production/development quando lidos então buildTarget rait-web:build:<config> (defeito pré-existente portal-web corrigido)', () => {
    const serve = angular().serve.configurations;
    expect(serve['production']?.['buildTarget']).toBe(
      'rait-web:build:production',
    );
    expect(serve['development']?.['buildTarget']).toBe(
      'rait-web:build:development',
    );
  });

  (['production', 'development'] as const).forEach((name) => {
    it(`dado build e serve "${name}" quando serializados então não citam preview [negativo]`, () => {
      const architect = angular();
      expect(JSON.stringify(architect.build.configurations[name])).not.toMatch(
        /preview/i,
      );
      expect(JSON.stringify(architect.serve.configurations[name])).not.toMatch(
        /preview/i,
      );
    });
  });

  it('dado build.options quando serializadas então não citam preview (o default não carrega a prévia) [negativo]', () => {
    expect(JSON.stringify(angular().build.options)).not.toMatch(/preview/i);
  });
});

describe('C-07 — tsconfig.app.json cobre a entrada de prévia', () => {
  it('dado tsconfig.app.json quando lido então files contém src/main.ts e src/main.preview.ts', () => {
    const files = readTsconfig(join(APP_ROOT, 'tsconfig.app.json')).files ?? [];
    expect(files).toContain('src/main.ts');
    expect(files).toContain('src/main.preview.ts');
  });
});

describe('C-03 — src/index.preview.html', () => {
  it('dado src/index.preview.html quando lido então contém <rait-preview-root>, o título "Console RAIT — PRÉVIA" e o mesmo runtime-config.js de index.html', () => {
    const text = readFileSync(join(APP_SRC_ROOT, 'index.preview.html'), 'utf8');
    expect(text).toContain('<rait-preview-root>');
    expect(text).toContain('<title>Console RAIT — PRÉVIA</title>');
    expect(text).toContain('<script src="runtime-config.js">');
    expect(readFileSync(join(APP_SRC_ROOT, 'index.html'), 'utf8')).toContain(
      '<script src="runtime-config.js">',
    );
    expect(text).not.toContain('<rait-root>');
  });
});

describe('M1/P-16 — preview.pt-BR.json só acrescenta chaves novas (D-13)', () => {
  const overlay = () =>
    readJson<Record<string, string>>(join(PREVIEW_DIR, 'preview.pt-BR.json'));

  it('dado preview.pt-BR.json quando lido então toda chave começa por rait.states.preview_ ou rait.shell.preview_', () => {
    const outside = Object.keys(overlay()).filter(
      (key) =>
        !key.startsWith('rait.states.preview_') &&
        !key.startsWith('rait.shell.preview_'),
    );
    expect(outside).toEqual([]);
  });

  it('dado preview.pt-BR.json e src/app/i18n/rait.pt-BR.json quando comparados então a interseção de chaves é vazia [negativo]', () => {
    const app = readAppCatalog();
    const shared = Object.keys(overlay()).filter((key) => key in app);
    expect(shared).toEqual([]);
  });

  it('dado preview.pt-BR.json quando lido então é exatamente a tabela §4 do contrato (11 chaves, textos literais)', () => {
    expect(overlay()).toEqual(PREVIEW_CATALOG_CONTRACT);
  });
});
