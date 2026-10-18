import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { ESLint } from 'eslint';

const apps = [
  'apps/boat/mobile',
  'apps/dashboard/web',
  'apps/portal/web',
  'apps/rait/web',
  'apps/teat/mobile',
  'apps/teat/web',
  'senatran-mock',
];
for (const app of apps) {
  test(`workspace lint preserves ${app} rules and parser`, async () => {
    const root = process.cwd();
    const local = new ESLint({
      cwd: resolve(root, app),
      overrideConfigFile: resolve(app, 'eslint.config.js'),
    });
    const combined = new ESLint({
      cwd: root,
      overrideConfigFile: resolve('eslint.config.mjs'),
    });
    const source = app === 'senatran-mock' ? 'apps/api/src' : 'src/app';
    for (const file of [`${source}/example.ts`, `${source}/example.spec.ts`]) {
      const before = await local.calculateConfigForFile(resolve(app, file));
      const after = await combined.calculateConfigForFile(resolve(app, file));
      assert.deepEqual(after.rules, before.rules);
      assert.equal(
        after.languageOptions.parser.meta.name,
        before.languageOptions.parser.meta.name,
      );
    }
  });
}
