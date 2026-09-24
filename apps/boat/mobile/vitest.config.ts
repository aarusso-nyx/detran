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
    const lib = loadFileNames('tsconfig.lib.json');
    program = ts.createProgram(
      [...new Set([...spec.fileNames, ...lib.fileNames])],
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
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
