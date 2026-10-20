// Environment wiring only. The native runtime resolves and hashes the actual runner.
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const destination = process.argv[2];
if (!destination || process.argv.length !== 3 || !isAbsolute(destination))
  throw new Error(
    'Usage: install-native-vitest.mjs <absolute-external-bin-directory>',
  );
const directory = resolve(destination);
const within = relative(root, directory);
if (!within.startsWith('..') || within === '..')
  throw new Error(
    'Native binary alias must be outside the candidate repository',
  );
const require = createRequire(join(root, 'package.json'));
const manifestPath = require.resolve('vitest/package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.name !== 'vitest' || manifest.version !== '4.1.11')
  throw new Error(
    'Native Vitest version differs from supported provider runtime',
  );
const target = realpathSync(join(manifestPath, '..', manifest.bin.vitest));
if (
  !lstatSync(target).isFile() ||
  !readFileSync(target, 'utf8').startsWith('#!/usr/bin/env node')
)
  throw new Error(
    'Resolved native runner is not the installed Vitest Node entrypoint',
  );
mkdirSync(directory, { recursive: true });
const resolvedDirectory = relative(root, realpathSync(directory));
if (!resolvedDirectory.startsWith('..') || resolvedDirectory === '..')
  throw new Error(
    'Native alias destination resolves inside the candidate repository',
  );
const alias = join(directory, 'detran-native-vitest');
if (existsSync(alias)) {
  if (!lstatSync(alias).isSymbolicLink() || realpathSync(alias) !== target)
    throw new Error('Refusing to replace an unrelated executable alias');
} else symlinkSync(target, alias);
if (realpathSync(alias) !== target)
  throw new Error('Native runner alias verification failed');
console.log(
  JSON.stringify({
    alias,
    target,
    sha256: createHash('sha256').update(readFileSync(target)).digest('hex'),
  }),
);
