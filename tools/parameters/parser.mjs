import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const TABLES = {
  RAIT: ['rait', ['rait.', 'collection.', 'deadline.', 'session.']],
  TEAT: ['teat', ['teat.', 'sync.']],
  PORTAL: ['portal', ['portal.', 'privacy.']],
  BOAT: ['est', ['est.']],
  DASHBOARD: ['dashboard', ['dashboard.']],
};
const HEADERS = [
  'Chave',
  'Tipo',
  'Default',
  'Status',
  'pend.',
  'legal',
  'Decisão',
  'Consumidor',
];
const NAMESPACE_HEADERS = ['Namespace', 'App', 'Catálogo', 'Decisão'];
const NAMESPACE_PREFIXES = Object.values(TABLES).flatMap(([, prefixes]) =>
  prefixes.map((prefix) => prefix.slice(0, -1)),
);
const NAMESPACE_PATTERN = new RegExp(
  `^(?:${NAMESPACE_PREFIXES.join('|')})\\.[a-z][a-z0-9_]*$`,
);
const REFS = /\b(?:H\.\d+|OD-[A-Z0-9-]+|DT-[A-Z0-9-]+)\b/g;
const COMPACT_RANGE =
  /\b(H\.\d+|(?:OD|DT)-[A-Z0-9-]+)\s*(?:…|\.\.\.)\s*(H\.\d+|(?:OD|DT)-[A-Z0-9-]+|[A-Z]+-?\d+|\d+)\b/g;
const KNOWLEDGE_BASE = new URL(
  '../../docs/meta/knowledge-base/',
  import.meta.url,
);

function clean(value) {
  return value
    .replace(/!?(?:\[([^\]]+)\]\([^)]*\))/g, '$1')
    .replace(/`|\*\*/g, '')
    .trim();
}
function cells(line) {
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const result = [];
  let current = '';
  let escaped = false;
  for (const char of body) {
    if (char === '|' && escaped) {
      current = `${current.slice(0, -1)}|`;
    } else if (char === '|') {
      result.push(current);
      current = '';
    } else {
      current += char;
      escaped = char === '\\' && !escaped;
      continue;
    }
    escaped = false;
  }
  result.push(current);
  return result.map(clean);
}
function jsonDefault(type, raw, pending) {
  if (type === 'F') {
    if (raw !== 'true' && raw !== 'false')
      throw new Error('flag default must be true or false');
    return raw === 'true';
  }
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw)) {
    const value = Number(raw);
    if (!Number.isFinite(value))
      throw new Error('numeric default must be finite');
    return value;
  }
  if (raw === '—') {
    if (!pending) throw new Error('em dash requires pend.=sim');
    return null;
  }
  return raw;
}

function numericReference(reference) {
  const match = reference.match(/^(.*?)(\d+)$/);
  if (!match) return undefined;
  return { prefix: match[1], digits: match[2] };
}

function compactRange(start, end) {
  const first = numericReference(start);
  if (!first) return undefined;

  const completeEnd = /^(?:H\.\d+|(?:OD|DT)-[A-Z0-9-]+)$/.test(end);
  const last = numericReference(end);
  if (!last) return undefined;
  if (completeEnd && first.prefix !== last.prefix) return undefined;
  if (!completeEnd && last.prefix && !first.prefix.endsWith(last.prefix))
    return undefined;

  const firstNumber = Number(first.digits);
  const lastNumber = Number(last.digits);
  if (!Number.isSafeInteger(firstNumber) || !Number.isSafeInteger(lastNumber))
    return undefined;
  if (lastNumber < firstNumber) return undefined;

  return {
    prefix: first.prefix,
    first: firstNumber,
    last: lastNumber,
    width: Math.max(first.digits.length, last.digits.length),
  };
}

function expandCompactReferences(text) {
  const references = new Set(text.match(REFS) ?? []);
  for (const match of text.matchAll(COMPACT_RANGE)) {
    const range = compactRange(match[1], match[2]);
    if (!range) continue;
    for (let value = range.first; value <= range.last; value += 1)
      references.add(
        `${range.prefix}${String(value).padStart(range.width, '0')}`,
      );

    let trailing = text.slice((match.index ?? 0) + match[0].length);
    let suffix = trailing.match(/^\s*,\s*([A-Z]+-?\d+)/);
    while (suffix) {
      const expanded = compactRange(match[1], suffix[1]);
      if (expanded && expanded.first === expanded.last)
        references.add(
          `${expanded.prefix}${String(expanded.first).padStart(expanded.width, '0')}`,
        );
      trailing = trailing.slice(suffix[0].length);
      suffix = trailing.match(/^\s*,\s*([A-Z]+-?\d+)/);
    }
  }
  return references;
}

async function ownerBallotPaths(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) paths.push(...(await ownerBallotPaths(path)));
    else if (entry.isFile() && entry.name.endsWith('.md')) paths.push(path);
  }
  return paths.sort();
}

async function decisionReferences() {
  const sourcePaths = [
    fileURLToPath(new URL('decision-closure-plan.md', KNOWLEDGE_BASE)),
    fileURLToPath(new URL('steering.md', KNOWLEDGE_BASE)),
    fileURLToPath(new URL('open-decisions-rait.md', KNOWLEDGE_BASE)),
    fileURLToPath(new URL('open-issues.md', KNOWLEDGE_BASE)),
    ...(await ownerBallotPaths(
      fileURLToPath(new URL('owner-ballots/', KNOWLEDGE_BASE)),
    )),
  ];
  const texts = await Promise.all(
    sourcePaths.map((path) => readFile(path, 'utf8')),
  );
  return expandCompactReferences(texts.join('\n'));
}

function headingRows(lines, source) {
  const headings = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(
      /^##\s+(RAIT|TEAT|PORTAL|BOAT|DASHBOARD)\b/,
    )?.[1];
    if (!heading) continue;
    if (headings.has(heading))
      throw new Error(
        `${source}:${index + 1}: duplicate catalogue heading ${heading}`,
      );
    headings.set(heading, index);
  }
  for (const heading of Object.keys(TABLES))
    if (!headings.has(heading))
      throw new Error(`${source}: catalogue table missing for ${heading}`);
  return headings;
}

function parseNamespaceTable(lines, source, entries) {
  const headingIndex = lines.findIndex((line) =>
    /^##\s+Namespaces i18n\b/.test(line),
  );
  if (headingIndex < 0) return [];
  const nextHeading = lines.findIndex(
    (line, lineIndex) => lineIndex > headingIndex && /^##\s+/.test(line),
  );
  const end = nextHeading < 0 ? lines.length : nextHeading;
  let row = headingIndex + 1;
  while (row < end && !lines[row].trim().startsWith('|')) row += 1;
  if (row >= end)
    throw new Error(`${source}:${headingIndex + 1}: namespace table missing`);
  const header = cells(lines[row]);
  if (
    header.length !== NAMESPACE_HEADERS.length ||
    header.some((value, i) => value !== NAMESPACE_HEADERS[i])
  )
    throw new Error(
      `${source}:${row + 1}: namespace header must be ${NAMESPACE_HEADERS.join('|')}`,
    );
  const separator = cells(lines[row + 1] ?? '');
  if (
    separator.length !== NAMESPACE_HEADERS.length ||
    separator.some((value) => !/^:?-{3,}:?$/.test(value))
  )
    throw new Error(
      `${source}:${row + 2}: namespace separator must have four cells`,
    );
  row += 2;
  const namespaces = [];
  const seenNamespaces = new Set();
  while (row < lines.length && lines[row].trim().startsWith('|')) {
    const values = cells(lines[row]);
    if (
      values.length !== NAMESPACE_HEADERS.length ||
      values.some((value) => value === '')
    )
      throw new Error(`${source}:${row + 1}: malformed or empty namespace row`);
    const [namespace, app, catalogue, decision] = values;
    if (!NAMESPACE_PATTERN.test(namespace))
      throw new Error(
        `${source}:${row + 1}: invalid i18n namespace ${namespace}`,
      );
    if (seenNamespaces.has(namespace))
      throw new Error(
        `${source}:${row + 1}: duplicate i18n namespace ${namespace}`,
      );
    seenNamespaces.add(namespace);
    const tokens = decision.match(REFS) ?? [];
    const selected =
      tokens.filter((token) => /^H\./.test(token)).at(-1) ??
      tokens.find((token) => /^(?:OD|DT)-/.test(token));
    if (!selected)
      throw new Error(
        `${source}:${row + 1}: decision reference missing for namespace ${namespace}`,
      );
    namespaces.push({
      namespace,
      app,
      catalogue,
      decision_ref: selected,
      decision_tokens: tokens,
      line: row + 1,
    });
    row += 1;
  }
  if (lines.slice(row, end).some((line) => line.trim().startsWith('|')))
    throw new Error(
      `${source}:${row + 1}: multiple tables for Namespaces i18n`,
    );
  for (const item of namespaces) {
    const prefix = `${item.namespace}.`;
    const colliding = entries.find((entry) => entry.key.startsWith(prefix));
    if (colliding)
      throw new Error(
        `${source}:${item.line}: i18n namespace ${item.namespace} collides with parameter key ${colliding.key} at ${source}:${colliding.line}`,
      );
  }
  return namespaces;
}

export async function parseCatalogue(source) {
  const bytes = await readFile(source);
  const text = bytes.toString('utf8');
  const lines = text.split(/\r?\n/);
  const entries = [];
  const seen = new Set();
  const headings = headingRows(lines, source);
  const orderedHeadings = [...headings.entries()].sort(
    ([, left], [, right]) => left - right,
  );
  for (const [heading, index] of orderedHeadings) {
    const nextHeading = lines.findIndex(
      (line, lineIndex) => lineIndex > index && /^##\s+/.test(line),
    );
    const end = nextHeading < 0 ? lines.length : nextHeading;
    let row = index + 1;
    while (row < end && !lines[row].trim().startsWith('|')) row += 1;
    if (row >= end) throw new Error(`${source}:${index + 1}: table missing`);
    const header = cells(lines[row]);
    if (
      header.length !== HEADERS.length ||
      header.some((value, i) => value !== HEADERS[i])
    )
      throw new Error(
        `${source}:${row + 1}: header must be ${HEADERS.join('|')}`,
      );
    const separator = cells(lines[row + 1] ?? '');
    if (
      separator.length !== 8 ||
      separator.some((value) => !/^:?-{3,}:?$/.test(value))
    )
      throw new Error(`${source}:${row + 2}: separator must have eight cells`);
    row += 2;
    while (row < lines.length && lines[row].trim().startsWith('|')) {
      const values = cells(lines[row]);
      if (values.length !== 8 || values.some((value) => value === ''))
        throw new Error(
          `${source}:${row + 1}: malformed or empty catalogue row`,
        );
      const [
        key,
        type,
        defaultText,
        status,
        pendingText,
        legalText,
        decision,
        consumer,
      ] = values;
      if (seen.has(key))
        throw new Error(`${source}:${row + 1}: duplicate key ${key}`);
      seen.add(key);
      const [surface, prefixes] = TABLES[heading];
      if (!prefixes.some((prefix) => key.startsWith(prefix)))
        throw new Error(`${source}:${row + 1}: incompatible prefix for ${key}`);
      if (!['vigente', 'a_confirmar', 'proposta'].includes(status))
        throw new Error(`${source}:${row + 1}: invalid status`);
      if (
        !['sim', 'não'].includes(pendingText) ||
        !['sim', 'não'].includes(legalText)
      )
        throw new Error(`${source}:${row + 1}: invalid boolean cell`);
      const sourcePending = pendingText === 'sim';
      const tokens = decision.match(REFS) ?? [];
      const selected =
        tokens.filter((token) => /^H\./.test(token)).at(-1) ??
        tokens.find((token) => /^(?:OD|DT)-/.test(token));
      if (!selected)
        throw new Error(`${source}:${row + 1}: decision reference missing`);
      let value_json;
      try {
        value_json = jsonDefault(type, defaultText, sourcePending);
      } catch (error) {
        throw new Error(`${source}:${row + 1}: ${key}: ${error.message}`);
      }
      entries.push({
        key,
        value_type: type,
        value_json,
        status,
        source_pending: sourcePending,
        legal_readonly: legalText === 'sim',
        decision_ref: selected,
        decision_tokens: tokens,
        consumer,
        surface,
        line: row + 1,
      });
      row += 1;
    }
    if (lines.slice(row, end).some((line) => line.trim().startsWith('|')))
      throw new Error(`${source}:${row + 1}: multiple tables for ${heading}`);
  }
  const i18nNamespaces = parseNamespaceTable(lines, source, entries);
  const resolvedDecisions = await decisionReferences();
  for (const entry of entries)
    for (const token of entry.decision_tokens) {
      if (!resolvedDecisions.has(token))
        throw new Error(
          `${source}:${entry.line}: unresolved decision ${token}`,
        );
    }
  for (const namespace of i18nNamespaces)
    for (const token of namespace.decision_tokens) {
      if (!resolvedDecisions.has(token))
        throw new Error(
          `${source}:${namespace.line}: unresolved decision ${token}`,
        );
    }
  return {
    source,
    sourceHash: createHash('sha256').update(bytes).digest('hex'),
    entries,
    i18nNamespaces,
  };
}
