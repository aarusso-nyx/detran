// Runner de testes do app (padrão R-0014 M3 + A7, copiado em R-0012 M1): vitest + jsdom, como packages/ui e
// detran-ui-guide.md §5, mais a transformação JIT do Angular (`angularJitApplicationTransform`
// de `@angular/compiler-cli`) para que as APIs de inicialização baseadas em signals —
// `input()`, `output()`, `model()`, `viewChild()` — sejam registradas nos metadados do
// componente também fora do AOT. Sem ela, `setInput` é no-op e todo spec de componente com
// `input()` falha (NG0950/NG0303). Specs nunca inicializam o ambiente — src/test-setup.ts faz.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { angularJitApplicationTransform } from '@angular/compiler-cli';
import ts from 'typescript';
import { defineConfig } from 'vitest/config';

const appRoot = dirname(fileURLToPath(import.meta.url));

function loadFileNames(tsconfig: string): {
  fileNames: string[];
  options: ts.CompilerOptions;
} {
  const configPath = resolve(appRoot, tsconfig);
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    dirname(configPath),
  );
  return { fileNames: parsed.fileNames, options: parsed.options };
}

function angularJitPlugin() {
  let program: ts.Program | null = null;
  const getProgram = (): ts.Program => {
    if (program) return program;
    const spec = loadFileNames('tsconfig.spec.json');
    const app = loadFileNames('tsconfig.app.json');
    program = ts.createProgram(
      [...new Set([...spec.fileNames, ...app.fileNames])],
      { ...spec.options, noEmit: true },
    );
    return program;
  };
  return {
    name: 'angular-jit-initializer-apis',
    enforce: 'pre' as const,
    transform(_code: string, id: string) {
      if (!id.endsWith('.ts') || id.includes('node_modules')) return null;
      const prog = getProgram();
      const sourceFile = prog.getSourceFile(id);
      if (!sourceFile) return null;
      const result = ts.transform(
        sourceFile,
        [angularJitApplicationTransform(prog)],
        prog.getCompilerOptions(),
      );
      const out = ts
        .createPrinter()
        .printFile(result.transformed[0] as ts.SourceFile);
      result.dispose();
      return { code: out, map: null };
    },
  };
}

export default defineConfig({
  plugins: [angularJitPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
