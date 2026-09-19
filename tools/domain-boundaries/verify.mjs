#!/usr/bin/env node
import { access, readdir, readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const DOMAIN_SCHEMAS = new Set([
  'dashboard',
  'est',
  'inf',
  'integration',
  'portal',
  'rait',
]);
const BOAT_EVENTS = new Set([
  'SINISTRO_RECEBIDO_SINCRONIZACAO',
  'SINISTRO_INICIADO',
  'SINISTRO_REGISTRADO',
  'VITIMA_REGISTRADA',
  'SINISTRO_VALIDADO',
  'SINISTRO_FECHADO',
  'SINISTRO_TRANSMISSAO_PENDENTE',
  'SINISTRO_TRANSMITIDO',
  'SINISTRO_SITUACAO_NACIONAL',
  'SINISTRO_RETIFICACAO_PENDENTE',
  'SINISTRO_RETIFICADO',
  'SINISTRO_ARQUIVADO',
  'PEDIDO_TITULAR_REGISTRADO',
]);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') return [];
        return filesUnder(path);
      }
      return /\.(?:[cm]?[jt]sx?)$/.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
}

function ownerSchema(path) {
  const parts = relative(root, path).split(sep);
  const domain = parts.indexOf('domains');
  return domain >= 0 ? parts[domain + 1] : undefined;
}

function declaredEvents(source) {
  const literal = source.match(
    /export\s+const\s+consumedEvents\s*=\s*\[([\s\S]*?)\]\s+as\s+const\s*;/,
  );
  if (!literal || literal[1].trim().length === 0) return undefined;
  const events = [...literal[1].matchAll(/['"]([^'"]+)['"]/g)].map(
    (match) => match[1],
  );
  return events.length > 0 && events.every((event) => BOAT_EVENTS.has(event))
    ? events
    : undefined;
}

function isLegacyPortalDispatcher(path) {
  return (
    relative(root, path).replaceAll(sep, '/') ===
    'backend/domains/portal/projections/src/handwritten/projectors.service.ts'
  );
}

function violationsFor(path, source) {
  const violations = [];
  const rel = relative(root, path).replaceAll(sep, '/');
  const owner = ownerSchema(path);
  const references = [...source.matchAll(/\b([a-z_]+)\.([a-z_]+)\b/g)];
  for (const reference of references) {
    const [, schema, table] = reference;
    if (!DOMAIN_SCHEMAS.has(schema) || schema === owner) continue;
    if (schema === 'integration' && table === 'outbox') {
      const strictProjection =
        rel.endsWith('.projection.ts') && declaredEvents(source);
      if (strictProjection || isLegacyPortalDispatcher(path)) continue;
      violations.push(
        `${rel}: integration.outbox requires exported non-empty literal consumedEvents in a *.projection.ts file`,
      );
      continue;
    }
    violations.push(
      `${rel}: cross-domain boundary read/write ${schema}.${table}`,
    );
  }
  return violations;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// The gate protects the C-2-13 consumers. A supplied root in the node:test
// contract is intentionally scanned whole; the repository run scans the two
// new consumer roots so unrelated legacy packages do not redefine this rule.
const consumerRoots = [
  resolve(root, 'backend/domains/dashboard/crashes/src'),
  resolve(root, 'backend/domains/integration/renaest-mirror/src'),
];
const scanRoots = (await Promise.all(consumerRoots.map(exists))).every(Boolean)
  ? consumerRoots
  : [root];
const files = (await Promise.all(scanRoots.map(filesUnder))).flat();
const violations = (
  await Promise.all(
    files.map(async (path) =>
      violationsFor(path, await readFile(path, 'utf8')),
    ),
  )
).flat();

if (violations.length > 0) {
  process.stderr.write(`${violations.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`domain boundaries verified (${files.length} files)\n`);
}
