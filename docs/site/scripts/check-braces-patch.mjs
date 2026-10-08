import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../package.json', import.meta.url));
assert.equal(require('braces/package.json').version, '3.0.4-detran.1');
const manifest = JSON.parse(
  await readFile(
    new URL('../vendor/braces/PATCH-INTEGRITY.json', import.meta.url),
  ),
);
for (const [path, expected] of Object.entries(manifest)) {
  const content = await readFile(require.resolve(`braces/${path}`));
  assert.equal(
    createHash('sha256').update(content).digest('hex'),
    expected,
    path,
  );
}

const braces = require('braces');
assert.deepEqual(braces.expand('docs/{start,dev}/{1..3}.md'), [
  'docs/start/1.md',
  'docs/start/2.md',
  'docs/start/3.md',
  'docs/dev/1.md',
  'docs/dev/2.md',
  'docs/dev/3.md',
]);
assert.equal(
  braces.compile('docs/{start,dev}/**/*.{md,mdx}'),
  'docs/(start|dev)/**/*.(md|mdx)',
);
assert.equal(braces.stringify('docs/{start,dev}'), 'docs/{start,dev}');
assert.equal(braces.stringify('x'.repeat(1000)), 'x'.repeat(1000));
assert.equal(braces.stringify('\\{literal\\}'), '{literal}');

const bounded = (work) =>
  assert.throws(
    work,
    (error) =>
      error instanceof SyntaxError &&
      /nesting exceeds safety limit/.test(error.message),
  );
for (const pattern of [
  '{'.repeat(4000) + 'x' + '}'.repeat(4000),
  '('.repeat(4000) + 'x' + ')'.repeat(4000),
  '{'.repeat(4000) + 'x',
]) {
  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    bounded(() => braces[method](pattern, { maxLength: Infinity }));
  }
  bounded(() => braces(pattern));
}
// Direct AST input bypasses parsing, so each recursive walker needs its own bound.
for (const method of ['compile', 'expand', 'stringify']) {
  let ast = { type: 'text', value: 'x', nodes: [] };
  for (let i = 0; i < 10000; i++) ast = { type: 'root', nodes: [ast] };
  bounded(() => braces[method](ast));
}
assert.deepEqual(
  require('micromatch')(['a.md', 'b.mdx', 'c.ts'], '*.{md,mdx}'),
  ['a.md', 'b.mdx'],
);
console.log(
  'PASS installed braces patch integrity, glob compatibility and bounded nesting',
);
