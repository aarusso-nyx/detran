import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;
const excludedDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.angular',
  '.next',
  '.devai',
  'tmp',
  'scratch',
]);
function isExactVersion(value: string): boolean {
  const match =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/u.exec(
      value,
    );
  if (!match) return false;
  return (
    match[4]
      ?.split('.')
      .every(
        (part) => !/^\d+$/u.test(part) || part === '0' || !part.startsWith('0'),
      ) ?? true
  );
}

function fail(message: string): never {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return fail(`${file}: unable to read valid JSON (${reason})`);
  }
}

function relative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/') || '.';
}

const root = path.resolve(process.argv[2] ?? process.cwd());
const versionFile = path.join(root, 'tools/stynx-version.json');
const versionConfig = readJson(versionFile);
if (
  typeof versionConfig !== 'object' ||
  versionConfig === null ||
  Array.isArray(versionConfig) ||
  !('version' in versionConfig) ||
  typeof versionConfig.version !== 'string' ||
  !isExactVersion(versionConfig.version)
) {
  fail(`${relative(root, versionFile)}: expected an exact version string`);
}
const expected = versionConfig.version;
const diagnostics: string[] = [];
const manifests: string[] = [];

function walk(directory: string): void {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    diagnostics.push(
      `${relative(root, directory)}: unable to read directory (${reason})`,
    );
    return;
  }
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) walk(file);
      continue;
    }
    if (entry.name === 'package.json' && entry.isFile()) manifests.push(file);
  }
}

walk(root);
for (const file of manifests.sort((left, right) => left.localeCompare(right))) {
  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(file, 'utf8')) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    diagnostics.push(`${relative(root, file)}: invalid JSON (${reason})`);
    continue;
  }
  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    Array.isArray(manifest)
  ) {
    diagnostics.push(`${relative(root, file)}: manifest must be an object`);
    continue;
  }
  for (const section of dependencySections) {
    if (!(section in manifest)) continue;
    const dependencies = manifest[section];
    if (
      typeof dependencies !== 'object' ||
      dependencies === null ||
      Array.isArray(dependencies)
    ) {
      diagnostics.push(`${relative(root, file)}: invalid ${section} section`);
      continue;
    }
    for (const [name, found] of Object.entries(dependencies)) {
      if (!name.startsWith('@stynx-nyx/')) continue;
      if (typeof found !== 'string' || found !== expected) {
        diagnostics.push(
          `${relative(root, file)} ${section} ${name}: expected ${expected}, found ${String(found)}`,
        );
      }
    }
  }
}

if (diagnostics.length > 0) {
  diagnostics.sort((left, right) => left.localeCompare(right));
  for (const diagnostic of diagnostics) console.error(diagnostic);
  process.exitCode = 1;
} else {
  console.log(`All STYNX dependencies match ${expected}.`);
}
