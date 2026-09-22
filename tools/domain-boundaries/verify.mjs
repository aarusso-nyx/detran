#!/usr/bin/env node
// Gate `verify:domain-boundaries` (ADR-0020 §Decision 4; R-0010 origin, A2;
// generalized by R-0011 M6/CTG-0001.md §7). Contract and message wording are
// pinned by tools/domain-boundaries/tests/verify-domain-boundaries.test.mjs
// (TASK-0011) — that file, not this comment, is the executable spec.
import { access, readdir, readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const root = resolve(process.argv[2] ?? '.');

// CTG-0001.md §7.1.4: violation only for these five domain schemas; ops.*,
// integration.*, auth.*, audit.* and any other schema are platform/global
// and always admitted — they simply never belong to this set.
const DOMAIN_SCHEMAS = new Set(['ch', 'dashboard', 'est', 'inf', 'portal']);

// M6/CTG-0001.md §7.1.7: known, declared debts — never silent, never counted
// as a violation; matched by EXACT file path, not by schema/table alone (a
// different file with the same read is a real violation — test case g).
const KNOWN_DEBTS = [
  {
    path: 'backend/domains/ops/field/src/handwritten/shift-readiness.ts',
    schema: 'inf',
    table: 'normative_mobile_package',
    od: 'OD-D15',
  },
];

// CTG-0001.md §7.1.3.
const SQL_ACCESS_RE =
  /\b(?:from|join|into|update|delete\s+from)\s+([a-z_]+)\.([a-z_]+)\b/gi;

function isExcludedDir(relParts) {
  if (
    relParts.includes('node_modules') ||
    relParts.includes('.git') ||
    relParts.includes('dist') ||
    relParts.includes('tests')
  ) {
    return true;
  }
  for (let index = 0; index < relParts.length - 1; index += 1) {
    if (relParts[index] === 'src' && relParts[index + 1] === 'generated') {
      return true;
    }
  }
  return false;
}

function isScannableFile(name) {
  if (name === 'vitest.config.ts') return false;
  if (name.endsWith('.spec.ts')) return false;
  return /\.(?:ts|mts|mjs)$/.test(name);
}

async function filesUnder(directory, base) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      const relParts = relative(base, path).split(sep);
      if (entry.isDirectory()) {
        return isExcludedDir(relParts) ? [] : filesUnder(path, base);
      }
      if (isExcludedDir(relParts.slice(0, -1))) return [];
      return isScannableFile(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
}

function ownerSchema(path) {
  const parts = relative(root, path).split(sep);
  const domain = parts.indexOf('domains');
  return domain >= 0 ? parts[domain + 1] : undefined;
}

// M6/CTG-0001.md §7.1.5, §4.3: consumedEvents literal, non-empty, any event
// name — the R-0010 BOAT-only allow-list (BOAT_EVENTS) and the
// isLegacyPortalDispatcher exception fall here (A2): integration.outbox is
// now admitted unconditionally as a platform schema (see DOMAIN_SCHEMAS,
// which never lists it).
function declaredEvents(source) {
  const literal = source.match(
    /export\s+const\s+consumedEvents\s*=\s*\[([\s\S]*?)\]\s+as\s+const\s*;/,
  );
  if (!literal || literal[1].trim().length === 0) return undefined;
  const events = [...literal[1].matchAll(/['"]([^'"]+)['"]/g)].map(
    (match) => match[1],
  );
  return events.length > 0 ? events : undefined;
}

function violationsFor(path, source) {
  const violations = [];
  const debts = [];
  const rel = relative(root, path).replaceAll(sep, '/');
  const owner = ownerSchema(path);
  const isProjection = rel.endsWith('.projection.ts');
  const events = isProjection ? declaredEvents(source) : undefined;

  // CTG-0001.md §7.1.6: a *.projection.ts without a non-empty literal
  // consumedEvents is a violation of its own, even without a cross-domain
  // read.
  if (isProjection && !events) {
    violations.push(`${rel}: projection without consumedEvents`);
  }

  for (const [, schema, table] of source.matchAll(SQL_ACCESS_RE)) {
    if (!DOMAIN_SCHEMAS.has(schema) || schema === owner) continue;
    // *_ref: global vocabulary (DDL 1x, no tenant) — always admitted.
    if (table.endsWith('_ref')) continue;
    const debt = KNOWN_DEBTS.find(
      (entry) =>
        entry.path === rel && entry.schema === schema && entry.table === table,
    );
    if (debt) {
      debts.push(`known debt ${rel} -> ${schema}.${table} (${debt.od})`);
      continue;
    }
    // Cross-domain reads are only ever admitted from a *.projection.ts that
    // declares its consumedEvents (ADR-0020 §Decision 4).
    if (isProjection && events) continue;
    violations.push(
      `${rel}: cross-domain boundary read/write ${schema}.${table}`,
    );
  }
  return { violations, debts };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// The gate scans backend/domains/** only (src and non-src, e.g. */tests/).
// backend/app/src (the single-deployable composition root) is out of scope
// this round — OD-D16, backlog (CTG-0001.md §7.1.1).
const domainsRoot = resolve(root, 'backend/domains');
const files = (await exists(domainsRoot))
  ? await filesUnder(domainsRoot, root)
  : [];

const results = await Promise.all(
  files.map(async (path) => violationsFor(path, await readFile(path, 'utf8'))),
);
const violations = results.flatMap((result) => result.violations);
const debts = new Set(results.flatMap((result) => result.debts));

for (const debt of debts) {
  process.stdout.write(`${debt}\n`);
}

if (violations.length > 0) {
  process.stderr.write(`${violations.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`domain boundaries verified (${files.length} files)\n`);
}
