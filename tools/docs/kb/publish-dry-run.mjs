#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const publication = JSON.parse(
  readFileSync(path.join(root, 'docs/_ia/publication.json'), 'utf8'),
);
const output = path.join(root, publication.dryRunOutput);

function walk(location) {
  if (!existsSync(location)) return [];
  if (statSync(location).isFile()) return [location];
  return readdirSync(location, { withFileTypes: true }).flatMap((entry) =>
    walk(path.join(location, entry.name)),
  );
}

function frontMatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end < 0) return {};
  const result = {};
  for (const line of text.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return result;
}

function copy(relativePath, selected) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination);
  selected.add(relativePath);
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const selected = new Set();

for (const relativePath of publication.always) copy(relativePath, selected);

for (const configuredRoot of publication.product.roots) {
  const absoluteRoot = path.join(root, configuredRoot);
  for (const file of walk(absoluteRoot)) {
    if (!file.endsWith('.md') || file.split(path.sep).includes('_intake'))
      continue;
    const meta = frontMatter(readFileSync(file, 'utf8'));
    if (!publication.product.statuses.includes(meta.status)) continue;
    copy(path.relative(root, file), selected);
  }
}

const legalCatalog = path.join(root, publication.legal.catalog);
copy(publication.legal.catalog, selected);
const legalText = readFileSync(legalCatalog, 'utf8');
for (const match of legalText.matchAll(/\]\(([^)\s#]+\.md)(?:#[^)]*)?\)/g)) {
  const target = path.resolve(path.dirname(legalCatalog), match[1]);
  if (!target.startsWith(path.join(root, 'docs/reference/legal'))) {
    throw new Error(`legal catalog target escapes legal root: ${match[1]}`);
  }
  copy(path.relative(root, target), selected);
}

const leaked = [...selected].filter(
  (entry) =>
    entry.split('/').includes('_intake') ||
    /\.(?:pdf|html|txt|docx)$/i.test(entry) ||
    entry.startsWith('docs/meta/knowledge-base/') ||
    entry.startsWith('docs/reference/institutional/'),
);
if (leaked.length)
  throw new Error(
    `publication policy leaked internal files:\n${leaked.join('\n')}`,
  );

for (const entry of selected) {
  if (!entry.endsWith('.md')) continue;
  const meta = frontMatter(readFileSync(path.join(root, entry), 'utf8'));
  if (['draft', 'stub'].includes(meta.status))
    throw new Error(`publication selected ${meta.status}: ${entry}`);
}

const report = {
  schemaVersion: '1.0.0',
  selectedCount: selected.size,
  selected: [...selected].sort(),
  excludedClasses: publication.exclude,
};
writeFileSync(
  path.join(output, 'publication-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(
  `publication dry run: OK (${selected.size} files, raw/internal material excluded)`,
);
