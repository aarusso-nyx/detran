import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteRoot = fileURLToPath(new URL('..', import.meta.url));
const vendorRoot = join(siteRoot, 'vendor', 'braces');
const packageJson = JSON.parse(
  await readFile(join(vendorRoot, 'package.json'), 'utf8'),
);

if (packageJson.name !== 'braces' || packageJson.version !== '3.0.3-devai.1') {
  throw new Error(
    'Vendored braces identity is not the DEVAI-reviewed patched build',
  );
}

const requiredFixes = [
  ['lib/constants.js', ['MAX_DEPTH: 100,']],
  [
    'lib/parse.js',
    [
      "const maxDepth = typeof opts.maxDepth === 'number' ? Math.min(MAX_DEPTH, opts.maxDepth) : MAX_DEPTH;",
      'if (depth > maxDepth) {',
    ],
  ],
];

for (const [file, fixes] of requiredFixes) {
  const source = await readFile(join(vendorRoot, file), 'utf8');
  for (const fix of fixes) {
    if (!source.includes(fix)) {
      throw new Error(`${file} is missing reviewed fix: ${fix}`);
    }
  }
}

const braces = (await import(pathToFileURL(join(vendorRoot, 'index.js')).href))
  .default;
const nested = '{a,'.repeat(2000) + 'b' + '}'.repeat(2000);
let guarded = false;
try {
  braces(nested);
} catch (error) {
  guarded = error instanceof SyntaxError && /max depth/u.test(error.message);
}
if (!guarded) {
  throw new Error('Vendored braces does not reject deeply nested patterns');
}
if (braces.expand('a/{b,c}/d').join(',') !== 'a/b/d,a/c/d') {
  throw new Error('Vendored braces no longer expands ordinary patterns');
}

console.log('PASS vendored braces contains the reviewed nesting-depth guard');
