#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const docsRoot = path.join(root, 'docs');
const manifestPath = path.join(
  docsRoot,
  'meta/knowledge-base/import-manifest.json',
);
const publicationPath = path.join(docsRoot, '_ia/publication.json');
const cutover = process.argv.includes('--cutover');
const findings = [];

const artifactRoots = [
  'docs/framework/product/domains',
  'docs/framework/product/transversal',
  'docs/framework/product/shared',
  'docs/framework/glossary/domain.md',
  'docs/reference/legal',
  'docs/reference/institutional',
  'docs/meta/knowledge-base',
];
const prototypePrefixes = [
  'RN-AIT-',
  'RN-ALC-',
  'RN-EVD-',
  'RN-PRO-',
  'RN-MED-',
  'RN-SIN-',
  'RN-AUD-',
  'RN-GER-',
  'RN-LGPD-',
];
const nonStateTokens = new Set([
  'IMAGEM_PLACA',
  'ORGAO_DISPOSITIVO_VERSAO',
  'SENATRAN_SOFTWARE',
  'SEM_VITIMA',
  'APTO',
  'ACKED',
  'ALREADY_OPEN',
  'EXPIRED',
  'LOCAL_ALREADY_LINKED',
  'MATCH',
  'NO_MATCH',
  'OPENED',
  'MEDICO',
  'PSICOLOGO',
]);
const quarantined = new Set([
  'RECEBIDO',
  'EM_ANALISE',
  'PRONTO_PARA_JULGAMENTO',
  'DECISAO_AUTORIDADE',
  'SESSAO_JARI',
  'DECIDIDO',
]);

function walk(location) {
  if (!existsSync(location)) return [];
  if (statSync(location).isFile()) return [location];
  return readdirSync(location, { withFileTypes: true }).flatMap((entry) =>
    walk(path.join(location, entry.name)),
  );
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
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

const allDocsFiles = walk(docsRoot);
const markdownFiles = allDocsFiles.filter((file) => file.endsWith('.md'));
const artifactFiles = artifactRoots
  .flatMap((entry) => walk(path.join(root, entry)))
  .filter((file) => file.endsWith('.md'));
const ids = new Map();

for (const file of artifactFiles) {
  const text = readFileSync(file, 'utf8');
  const meta = frontMatter(text);
  if (!meta.id) continue;
  if (ids.has(meta.id))
    findings.push(`${relative(file)}: duplicate id ${meta.id}`);
  ids.set(meta.id, file);
  if (file.split(path.sep).includes('templates')) continue;
  for (const field of ['title', 'status']) {
    if (!meta[field])
      findings.push(`${relative(file)}: artifact ${meta.id} lacks ${field}`);
  }
}

const bracketed = /\[((?:RN|UC|WF|JRN|IU|APP|REF)-[A-Z0-9-]+)\]/g;
for (const file of artifactFiles) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(bracketed)) {
    const id = match[1];
    if (ids.has(id)) continue;
    if (prototypePrefixes.some((prefix) => id.startsWith(prefix))) {
      findings.push(
        `${relative(file)}: [${id}] is prototype provenance and must not be bracketed`,
      );
    } else if (!id.startsWith('REF-')) {
      findings.push(
        `${relative(file)}: [${id}] does not resolve to an artifact`,
      );
    }
  }
}

const tokenPattern = /`([A-Z][A-Z_0-9]{3,})`/g;
const barePattern = /(?<![\p{L}\p{N}_])([A-Z][A-Z_0-9]{3,})(?![\p{L}\p{N}_])/gu;
const workflowFiles = artifactFiles.filter((file) =>
  file.split(path.sep).includes('workflows'),
);
const canonicalTokens = new Set();
for (const file of workflowFiles) {
  if (file.split(path.sep).includes('_intake')) continue;
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(tokenPattern))
    canonicalTokens.add(match[1]);
  for (const match of text.matchAll(barePattern)) {
    if (!match[1].endsWith('_')) canonicalTokens.add(match[1]);
  }
}

for (const file of artifactFiles) {
  const parts = file.split(path.sep);
  if (
    parts.includes('_intake') ||
    parts.includes('workflows') ||
    parts.includes('legal') ||
    (parts.includes('meta') && parts.includes('knowledge-base'))
  )
    continue;
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(tokenPattern)) {
    const token = match[1];
    if (canonicalTokens.has(token) || nonStateTokens.has(token)) continue;
    if (path.basename(file) === 'IU-RAIT-001.md' && quarantined.has(token))
      continue;
    findings.push(`${relative(file)}: \`${token}\` is not owned by a workflow`);
  }
}

const markdownLink = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
for (const file of markdownFiles) {
  const text = readFileSync(file, 'utf8');
  if (/\/Users\/|\/Volumes\/|\.\.\/detran-refs/.test(text)) {
    findings.push(
      `${relative(file)}: contains an absolute workstation or sibling-repository path`,
    );
  }
  for (const match of text.matchAll(markdownLink)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|file:|repo:|#)/.test(target)) continue;
    const withoutAnchor = target.split('#', 1)[0];
    if (!withoutAnchor) continue;
    const resolved = path.resolve(
      path.dirname(file),
      decodeURIComponent(withoutAnchor),
    );
    if (!existsSync(resolved)) {
      findings.push(`${relative(file)}: local link does not exist: ${target}`);
    }
  }
}

if (!existsSync(manifestPath)) {
  findings.push('missing import manifest');
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.source.commit !== 'aa276b8e71866bfa9e012b23ee4a14b6fc6720a3') {
    findings.push(
      'import manifest source commit is not the approved cutover commit',
    );
  }
  if (manifest.entries.length !== manifest.baselines.sourceFileCount) {
    findings.push('import manifest does not account for every source file');
  }
  const sourcePaths = new Set();
  const destinationPaths = new Set();
  for (const entry of manifest.entries) {
    if (sourcePaths.has(entry.sourcePath))
      findings.push(`manifest duplicate source: ${entry.sourcePath}`);
    sourcePaths.add(entry.sourcePath);
    if (!/^[a-f0-9]{64}$/.test(entry.sourceSha256)) {
      findings.push(`manifest invalid source hash: ${entry.sourcePath}`);
    }
    if (!entry.destinationPath) {
      if (entry.disposition !== 'excluded')
        findings.push(`manifest unexplained exclusion: ${entry.sourcePath}`);
      continue;
    }
    if (destinationPaths.has(entry.destinationPath)) {
      findings.push(`manifest duplicate destination: ${entry.destinationPath}`);
    }
    destinationPaths.add(entry.destinationPath);
    const destination = path.join(root, entry.destinationPath);
    if (!existsSync(destination))
      findings.push(
        `manifest destination is missing: ${entry.destinationPath}`,
      );
    if (!/^[a-f0-9]{64}$/.test(entry.importedDestinationSha256 ?? '')) {
      findings.push(`manifest invalid destination hash: ${entry.sourcePath}`);
    } else if (
      cutover &&
      existsSync(destination) &&
      sha256(destination) !== entry.importedDestinationSha256
    ) {
      findings.push(`cutover hash drift: ${entry.destinationPath}`);
    }
  }
  if (ids.size !== manifest.baselines.artifactIdCount) {
    findings.push(
      `artifact baseline drift: expected ${manifest.baselines.artifactIdCount}, found ${ids.size}`,
    );
  }
  if (canonicalTokens.size !== manifest.baselines.canonicalWorkflowTokenCount) {
    findings.push(
      `workflow token baseline drift: expected ${manifest.baselines.canonicalWorkflowTokenCount}, found ${canonicalTokens.size}`,
    );
  }
}

if (!existsSync(publicationPath)) {
  findings.push('missing publication registry');
} else {
  const publication = JSON.parse(readFileSync(publicationPath, 'utf8'));
  if (
    JSON.stringify(publication.product.statuses) !==
    JSON.stringify(['reviewed', 'approved'])
  ) {
    findings.push(
      'publication registry must publish product artifacts only at reviewed/approved status',
    );
  }
  if (publication.legal.publishRawAssets !== false) {
    findings.push('publication registry must fail closed for raw legal assets');
  }
}

if (findings.length) {
  console.error(`knowledge-base check: ${findings.length} finding(s)\n`);
  for (const finding of findings) console.error(`  ${finding}`);
  process.exit(1);
}

console.log(
  `knowledge-base check: OK (${ids.size} artifacts, ${canonicalTokens.size} canonical tokens${cutover ? ', cutover hashes verified' : ''})`,
);
