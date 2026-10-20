import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const pointer = (parts) =>
  parts
    .map((s) => `/${String(s).replaceAll('~', '~0').replaceAll('/', '~1')}`)
    .join('');
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const schemaMaps = new Set([
  'properties',
  'patternProperties',
  '$defs',
  'definitions',
  'dependentSchemas',
]);
const schemaArrays = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems']);
const schemaSingles = new Set([
  'additionalProperties',
  'unevaluatedProperties',
  'unevaluatedItems',
  'propertyNames',
  'contains',
  'not',
  'if',
  'then',
  'else',
  'contentSchema',
  'additionalItems',
]);
const dataKeywords = new Set(['examples', 'default', 'const', 'enum']);
const referenceExpression =
  /(?<![A-Za-z0-9_-])ADR-(?:[A-Z][A-Z0-9]*-)*\d{3,4}(?![A-Za-z0-9_])/g;

// JSON.parse alone silently collapses duplicate object members. This additional
// lexical pass rejects that loss of evidence; JSON.parse still validates grammar.
function strictJson(bytes) {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
    throw new Error('UTF8_BOM_REFUSED');
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const value = JSON.parse(text);
  let i = 0;
  const ws = () => {
    while (/\s/.test(text[i] ?? '') && i < text.length) i++;
  };
  const string = () => {
    const start = i++;
    while (i < text.length) {
      if (text[i] === '\\') i += 2;
      else if (text[i++] === '"') return JSON.parse(text.slice(start, i));
    }
    throw new Error('INVALID_JSON');
  };
  const visit = () => {
    ws();
    if (text[i] === '{') {
      i++;
      ws();
      const keys = new Set();
      if (text[i] === '}') {
        i++;
        return;
      }
      while (i < text.length) {
        const key = string();
        if (keys.has(key)) throw new Error('DUPLICATE_JSON_KEY');
        keys.add(key);
        ws();
        i++;
        visit();
        ws();
        if (text[i++] === '}') return;
        ws();
      }
    } else if (text[i] === '[') {
      i++;
      ws();
      if (text[i] === ']') {
        i++;
        return;
      }
      while (i < text.length) {
        visit();
        ws();
        if (text[i++] === ']') return;
      }
    } else if (text[i] === '"') string();
    else {
      while (i < text.length && !/[\s,\]}]/.test(text[i])) i++;
    }
  };
  visit();
  return value;
}

function tracked(root) {
  const raw = execFileSync(
    'git',
    ['ls-files', '--stage', '-z', '--', 'law/schemas'],
    { cwd: root, encoding: 'utf8' },
  );
  return raw
    .split('\0')
    .filter(Boolean)
    .map((line) => {
      const tab = line.indexOf('\t');
      const [mode, blob, stage] = line.slice(0, tab).split(' ');
      return { path: line.slice(tab + 1), mode, blob, stage };
    })
    .filter(
      (entry) =>
        entry.path.startsWith('law/schemas/') &&
        entry.path.toLowerCase().endsWith('.json'),
    )
    .sort((a, b) => compare(a.path, b.path) || compare(a.stage, b.stage));
}

function readContained(root, entry) {
  if (entry.stage !== '0') throw new Error('UNMERGED_INPUT');
  if (!['100644', '100755'].includes(entry.mode))
    throw new Error('TRACKED_INPUT_NOT_REGULAR');
  const parts = entry.path.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..'))
    throw new Error('INPUT_PATH_INVALID');
  let current = root;
  const before = [];
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    const stat = fs.lstatSync(current, { bigint: true });
    if (stat.isSymbolicLink()) throw new Error('INPUT_LINK_REFUSED');
    if (index < parts.length - 1 ? !stat.isDirectory() : !stat.isFile())
      throw new Error('INPUT_TYPE_REFUSED');
    before.push([current, stat]);
  }
  if (path.relative(root, fs.realpathSync(current)).startsWith('..'))
    throw new Error('INPUT_ESCAPE_REFUSED');
  const fd = fs.openSync(
    current,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );
  let bytes;
  try {
    const opened = fs.fstatSync(fd, { bigint: true });
    if (
      opened.ino !== before.at(-1)[1].ino ||
      opened.dev !== before.at(-1)[1].dev
    )
      throw new Error('INPUT_CHANGED');
    bytes = fs.readFileSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  for (const [name, stat] of before) {
    const after = fs.lstatSync(name, { bigint: true });
    if (
      after.isSymbolicLink() ||
      ['ino', 'dev', 'mode', 'size', 'mtimeNs', 'ctimeNs'].some(
        (key) => after[key] !== stat[key],
      )
    )
      throw new Error('INPUT_CHANGED');
  }
  return bytes;
}

function nextContext(context, key, value) {
  const observedKeywords = [...context.observedKeywords];
  let mode = context.mode;
  if (mode === 'schema-map') mode = 'schema';
  else if (mode === 'schema-array') mode = 'schema';
  else if (mode === 'schema') {
    observedKeywords.push(key);
    if (schemaMaps.has(key)) mode = 'schema-map';
    else if (schemaArrays.has(key)) mode = 'schema-array';
    else if (schemaSingles.has(key)) mode = 'schema';
    else if (key === 'items')
      mode = Array.isArray(value) ? 'schema-array' : 'schema';
    else if (key === 'dependencies') mode = 'ambiguous-dependencies';
    else if (dataKeywords.has(key)) mode = 'data-keyword-value';
    else if (['description', '$comment', 'title'].includes(key))
      mode = 'annotation-value';
    else mode = 'unclassified-keyword-value';
  } else if (mode === 'ambiguous-dependencies')
    mode = Array.isArray(value) ? 'data-keyword-value' : 'schema';
  return { mode, observedKeywords };
}

function occurrences(value, file) {
  const rows = [];
  const emit = (originalString, parts, location, context) => {
    // Concrete three/four digit legacy IDs and explicit namespace segments only.
    // Boundaries avoid partially accepting a longer identifier or digit suffix.
    let occurrenceIndex = 0;
    for (const match of originalString.matchAll(referenceExpression))
      rows.push({
        path: file.path,
        sha256: file.sha256,
        jsonPointer: pointer(parts),
        location,
        originalString,
        reference: match[0],
        occurrenceIndex: occurrenceIndex++,
        stringOffset: match.index,
        context: { ...context, ancestorSegments: parts.slice(0, -1) },
      });
  };
  const walk = (node, parts, context) => {
    if (typeof node === 'string') emit(node, parts, 'value', context);
    else if (Array.isArray(node))
      node.forEach((child, i) =>
        walk(
          child,
          [...parts, String(i)],
          nextContext(context, String(i), child),
        ),
      );
    else if (node !== null && typeof node === 'object')
      for (const key of Object.keys(node).sort(compare)) {
        // A key is observed in its parent context; it is never silently a citation waiver.
        emit(key, [...parts, key], 'key', context);
        walk(node[key], [...parts, key], nextContext(context, key, node[key]));
      }
  };
  walk(value, [], { mode: 'schema', observedKeywords: [] });
  return rows;
}

function providerObservation(root, relative, bytes) {
  const packagePath = path.join(root, 'node_modules/@aarusso-nyx/devai');
  try {
    const physicalPackage = fs.realpathSync(packagePath);
    const packageJsonPath = path.join(physicalPackage, 'package.json');
    const packageBytes = fs.readFileSync(packageJsonPath);
    const manifest = strictJson(packageBytes);
    if (
      manifest === null ||
      typeof manifest !== 'object' ||
      Array.isArray(manifest)
    )
      return {
        status: 'invalid-installed-metadata',
        reasonCode: 'MANIFEST_SHAPE_INVALID',
        authenticatedOrigin: false,
      };
    if (manifest.name !== '@aarusso-nyx/devai')
      return { status: 'not-identified', authenticatedOrigin: false };
    const candidate = path.join(
      physicalPackage,
      'dist/runtime/index/schemas',
      relative.slice('law/schemas/'.length),
    );
    if (
      !fs.lstatSync(candidate).isFile() ||
      fs.lstatSync(candidate).isSymbolicLink()
    )
      return { status: 'source-unavailable', authenticatedOrigin: false };
    const physicalSource = fs.realpathSync(candidate);
    if (path.relative(physicalPackage, physicalSource).startsWith('..'))
      return { status: 'source-outside-package', authenticatedOrigin: false };
    const sourceBytes = fs.readFileSync(physicalSource);
    return {
      status: 'observed-installed-file',
      authenticatedOrigin: false,
      packageRoot: 'node_modules/@aarusso-nyx/devai',
      pathBasis: 'installed-provider-package-relative',
      packageJsonPath: 'package.json',
      packageJsonSha256: hash(packageBytes),
      declaredName: manifest.name,
      declaredVersion: manifest.version ?? null,
      sourcePath: `dist/runtime/index/schemas/${relative.slice('law/schemas/'.length)}`,
      sha256: hash(sourceBytes),
      byteEqual: bytes.equals(sourceBytes),
      limitation:
        'Observed installed bytes and self-declared package metadata do not authenticate upstream provenance or any referenced ADR.',
    };
  } catch (error) {
    return {
      status:
        error.code === 'ENOENT' ? 'source-unavailable' : 'observation-error',
      reasonCode:
        error instanceof SyntaxError || error instanceof TypeError
          ? 'INVALID_PROVIDER_JSON_OR_UTF8'
          : (error.code ??
            (error.message === 'DUPLICATE_JSON_KEY' ||
            error.message === 'UTF8_BOM_REFUSED'
              ? error.message
              : 'OBSERVATION_FAILED')),
      authenticatedOrigin: false,
    };
  }
}

/** Read-only inventory. Completeness refers only to the declared tracked population. */
export function censusSchemaCitations({ repoRoot }) {
  const result = {
    schemaVersion: '1.0.0',
    kind: 'schema-citation-census',
    declaredPopulation: {
      selector:
        'all tracked law/schemas/** with case-insensitive .json suffix, including root files',
      basis: 'tracked-index-population/worktree-bytes',
      gitObjectFormat: null,
      paths: [],
      count: 0,
    },
    files: [],
    occurrences: [],
    citationGrammar: {
      expression: referenceExpression.source,
      flags: referenceExpression.flags,
      caseSensitive: true,
      digitRange: [3, 4],
      stringOffsetUnit: 'UTF-16 code units of decoded JSON strings',
      limitations: [
        'Only uppercase ADR IDs with optional uppercase namespace segments and three or four terminal digits are counted; other spellings and separators are outside this lexical grammar.',
        'A filename suffix may follow a matched ID. Matches are syntactic occurrences, not semantic resolution or authority claims.',
      ],
    },
    errors: [],
    gaps: [
      'No citation is resolved, waived, authenticated or assigned a native verdict by this census.',
      'Schema keyword contexts are structural observations; custom vocabularies and citation authority require independent review.',
    ],
    complete: false,
  };
  try {
    const root = fs.realpathSync(repoRoot);
    const top = fs.realpathSync(
      execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
    );
    if (root !== top) throw new Error('REPOSITORY_ROOT_REQUIRED');
    const objectFormat = execFileSync(
      'git',
      ['rev-parse', '--show-object-format'],
      {
        cwd: root,
        encoding: 'utf8',
      },
    ).trim();
    if (!['sha1', 'sha256'].includes(objectFormat))
      throw new Error('GIT_OBJECT_FORMAT_UNSUPPORTED');
    result.declaredPopulation.gitObjectFormat = objectFormat;
    const entries = tracked(root);
    result.declaredPopulation.paths = [...new Set(entries.map((e) => e.path))];
    result.declaredPopulation.count = result.declaredPopulation.paths.length;
    if (entries.length === 0)
      result.errors.push({
        path: 'law/schemas',
        code: 'EMPTY_TRACKED_POPULATION',
      });
    for (const entry of entries) {
      try {
        const bytes = readContained(root, entry);
        const json = strictJson(bytes);
        const file = {
          path: entry.path,
          sha256: hash(bytes),
          byteLength: bytes.length,
          indexBlobOid: entry.blob,
          worktreeBlobOid: crypto
            .createHash(objectFormat)
            .update(Buffer.from(`blob ${bytes.length}\0`))
            .update(bytes)
            .digest('hex'),
        };
        file.worktreeMatchesIndex = file.worktreeBlobOid === file.indexBlobOid;
        const rows = occurrences(json, file);
        result.files.push({
          ...file,
          occurrenceCount: rows.length,
          providerObservation: providerObservation(root, entry.path, bytes),
        });
        result.occurrences.push(...rows);
      } catch (error) {
        result.errors.push({
          path: entry.path,
          code:
            error instanceof SyntaxError || error instanceof TypeError
              ? 'INVALID_JSON_OR_UTF8'
              : (error.code ?? error.message),
        });
      }
    }
    if (JSON.stringify(entries) !== JSON.stringify(tracked(root)))
      result.errors.push({
        path: 'law/schemas',
        code: 'TRACKED_POPULATION_CHANGED',
      });
    result.complete = result.errors.length === 0;
  } catch (error) {
    result.errors.push({ path: '.', code: error.code ?? error.message });
  }
  return result;
}

function invokedByPath() {
  if (!process.argv[1]) return false;
  try {
    return (
      fs.realpathSync(process.argv[1]) ===
      fs.realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
}

if (import.meta.main ?? invokedByPath()) {
  const args = process.argv.slice(2);
  let result;
  if (args.length === 0 || (args.length === 2 && args[0] === '--repo-root'))
    result = censusSchemaCitations({ repoRoot: args[1] ?? process.cwd() });
  else
    result = {
      kind: 'schema-citation-census',
      complete: false,
      errors: [{ path: '.', code: 'INVALID_ARGUMENTS' }],
    };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.complete ? 0 : 1;
}
