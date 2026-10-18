// C-01/C-03 — static separation, build entry and i18n overlay (frontend-preview-mode.md §10).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, readCatalog } from '../../testing/kb';
const APP_ROOT = join(APP_SRC_ROOT, '..');
const PREVIEW_DIR = join(APP_SRC_ROOT, 'app/preview');
const readJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>;
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}
const targets = () =>
  readJson(join(APP_ROOT, 'angular.json'))['projects']['portal-web'][
    'architect'
  ];
describe('C-01 — production separation', () => {
  it('no production source imports the preview or contains the marker', () => {
    const forbidden =
      /(?:from\s+|import\s*\(\s*|import\s*)['"][^'"]*\/preview\//;
    for (const file of walk(APP_SRC_ROOT).filter(
      (path) =>
        path.endsWith('.ts') &&
        !path.endsWith('.spec.ts') &&
        !path.endsWith('.spec-helper.ts') &&
        !path.startsWith(PREVIEW_DIR + '/') &&
        !path.endsWith('/main.preview.ts'),
    )) {
      const source = readFileSync(file, 'utf8');
      expect(forbidden.test(source), relative(APP_ROOT, file)).toBe(false);
      expect(source, relative(APP_ROOT, file)).not.toContain(
        'DETRAN_PREVIEW_MARK',
      );
    }
  });
  it('preview bootstraps its own root/providers and index', () => {
    const main = readFileSync(join(APP_SRC_ROOT, 'main.preview.ts'), 'utf8');
    expect(main).toMatch(/bootstrapApplication\(\s*PreviewRootComponent\s*,/);
    expect(main).toContain('providePreviewMode()');
    expect(
      readFileSync(join(APP_SRC_ROOT, 'index.preview.html'), 'utf8'),
    ).toContain('<portal-preview-root');
  });
  it('preview has independent Angular build and serve targets', () => {
    const { build, serve } = targets();
    const preview = build.configurations.preview;
    expect(preview.browser).toBe('src/main.preview.ts');
    expect(preview.index).toEqual({
      input: 'src/index.preview.html',
      output: 'index.html',
    });
    expect(preview.outputPath).toEqual({ base: 'dist/preview', browser: '' });
    expect(serve.configurations.preview.buildTarget).toBe(
      'portal-web:build:preview',
    );
    expect(preview.assets).toContainEqual(
      expect.objectContaining({
        input: 'src/app/preview/fixtures',
        output: 'assets/preview',
      }),
    );
    for (const config of ['production', 'development']) {
      expect(JSON.stringify(build.configurations[config])).not.toMatch(
        /preview/i,
      );
      expect(JSON.stringify(serve.configurations[config])).not.toMatch(
        /preview/i,
      );
    }
    expect(JSON.stringify(build.options)).not.toMatch(/preview/i);
  });
  it('typechecks both entries', () => {
    const path = join(APP_ROOT, 'tsconfig.app.json');
    const parsed = ts.parseConfigFileTextToJson(
      path,
      readFileSync(path, 'utf8'),
    );
    expect(parsed.error).toBeUndefined();
    expect(parsed.config.files).toEqual(
      expect.arrayContaining(['src/main.ts', 'src/main.preview.ts']),
    );
  });
  it('adds only new allowed Portal preview i18n keys', () => {
    const overlay = readJson(join(PREVIEW_DIR, 'preview.pt-BR.json'));
    expect(Object.keys(overlay).length).toBeGreaterThan(0);
    for (const key of Object.keys(overlay)) {
      expect(key).toMatch(/^portal\.(states|shell)\.preview_/);
      expect(Object.hasOwn(readCatalog(), key)).toBe(false);
    }
    expect(overlay['portal.states.preview_mark']).toBe(
      'PRÉVIA — DADOS FICTÍCIOS',
    );
    expect(overlay['portal.states.preview_not_functional']).toMatch(
      /não funcional na prévia/i,
    );
    expect(overlay['portal.states.preview_source_pending']).toBe(
      'source_pending',
    );
  });
});
