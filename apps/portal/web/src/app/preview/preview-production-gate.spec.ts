// C-01/C-03 — static separation, build entry and i18n overlay (frontend-preview-mode.md §10).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, readCatalog } from '../../testing/kb';
import { previewKey, PREVIEW_USED_KEYS } from './preview-i18n';
import {
  PREVIEW_SCREEN_STATES,
  PREVIEW_PERSONAS,
} from './preview-state.service';
import { PREVIEW_MARK_KEY, PREVIEW_NOT_FUNCTIONAL_KEY } from './preview-mark';
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

// W3 integration: overlay keys are type-derived and runtime-checked; base scanner stays intact.
describe('C-03 — typed preview translation registry', () => {
  it('covers every actual mark, status and selector key using only new nonempty overlay values', () => {
    const overlay = readJson(join(PREVIEW_DIR, 'preview.pt-BR.json'));
    const expected = [
      previewKey('states', 'mark'),
      previewKey('states', 'not_functional'),
      previewKey('states', 'source_pending'),
      previewKey('shell', 'region'),
      previewKey('shell', 'state'),
      previewKey('shell', 'role'),
      ...PREVIEW_SCREEN_STATES.map((state) =>
        previewKey('shell', `state_${state}`),
      ),
      ...PREVIEW_PERSONAS.map((persona) =>
        previewKey('shell', `role_${persona}`),
      ),
    ];
    expect(PREVIEW_MARK_KEY).toBe(previewKey('states', 'mark'));
    expect(PREVIEW_NOT_FUNCTIONAL_KEY).toBe(
      previewKey('states', 'not_functional'),
    );
    expect(new Set(PREVIEW_USED_KEYS)).toEqual(new Set(expected));
    expect(PREVIEW_USED_KEYS).toHaveLength(expected.length);
    expect(new Set(Object.keys(overlay))).toEqual(new Set(expected));
    for (const key of PREVIEW_USED_KEYS) {
      expect(key).toMatch(/^portal\.(states|shell)\.preview_/);
      expect(Object.hasOwn(overlay, key), key).toBe(true);
      expect(typeof overlay[key], key).toBe('string');
      expect(overlay[key].trim().length, key).toBeGreaterThan(0);
      expect(Object.hasOwn(readCatalog(), key), key).toBe(false);
    }
  });
  it('rejects an absent overlay key at runtime rather than returning a silent untranslated label', () => {
    expect(() =>
      previewKey('states', 'missing_inspector_counterexample' as never),
    ).toThrow(/Missing preview translation/);
  });
});
