import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

// The manifest is admitted only after its independent reviews are retained.
// This module reads historical evidence; it never selects a current runtime.
const historicalMapPath =
  'tools/stynx-storage/consumer-fixtures/historical-plans/manifest.json';
const historicalMapSha256 =
  'sha256:3e139d0cbd6b253a1b9a2f56c5acf17a6f144d52048e99193dee7dbc05bf1c3f';
const historicalRecords =
  'tools/stynx-storage/consumer-fixtures/historical-plans/records';
const sha256 = (bytes) =>
  'sha256:' + createHash('sha256').update(bytes).digest('hex');

function requireFact(condition, message) {
  if (!condition) throw new Error(message);
}
function closed(value, fields) {
  const descriptors =
    value !== null && typeof value === 'object'
      ? Object.getOwnPropertyDescriptors(value)
      : null;
  const ownKeys = descriptors === null ? [] : Reflect.ownKeys(descriptors);
  requireFact(
    descriptors !== null &&
      !Array.isArray(value) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
      ownKeys.every((key) => typeof key === 'string') &&
      isDeepStrictEqual(ownKeys.sort(), [...fields].sort()) &&
      Object.values(descriptors).every(
        (descriptor) =>
          Object.hasOwn(descriptor, 'value') && descriptor.enumerable,
      ),
    'Historical input record fields differ',
  );
}
function safeFile(root, relative) {
  requireFact(
    typeof relative === 'string' &&
      relative !== '' &&
      !/[\\:\0]/u.test(relative) &&
      relative
        .split('/')
        .every((part) => part !== '' && part !== '.' && part !== '..'),
    'Unsafe historical input path',
  );
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    requireFact(
      !fs.lstatSync(current).isSymbolicLink(),
      'Historical input symlink',
    );
  }
  requireFact(
    fs.lstatSync(current).isFile() &&
      fs.realpathSync(current) === current &&
      current.startsWith(root + path.sep),
    'Historical input must be an internal regular file',
  );
  return current;
}
function verifiedBytes(root, ref) {
  closed(ref, ['path', 'bytes', 'sha256']);
  requireFact(
    Number.isSafeInteger(ref.bytes) &&
      ref.bytes >= 0 &&
      /^sha256:[a-f0-9]{64}$/u.test(ref.sha256),
    'Historical byte identity malformed',
  );
  const bytes = fs.readFileSync(safeFile(root, ref.path));
  requireFact(
    bytes.length === ref.bytes && sha256(bytes) === ref.sha256,
    'Historical retained byte identity differs',
  );
  return bytes;
}
function readManifest(root) {
  requireFact(
    /^sha256:[a-f0-9]{64}$/u.test(historicalMapSha256 ?? ''),
    'Historical map review admission unavailable',
  );
  const raw = fs.readFileSync(safeFile(root, historicalMapPath));
  requireFact(sha256(raw) === historicalMapSha256, 'Historical map changed');
  const map = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  closed(map, ['formatVersion', 'kind', 'classification', 'files', 'reviews']);
  requireFact(
    map.formatVersion === 1 &&
      map.kind === 'reviewed-historical-storage-plan-fixtures' &&
      map.classification === 'HISTORICAL_NOT_CURRENT_RUNTIME' &&
      Array.isArray(map.files) &&
      map.files.length === 94,
    'Historical map scope differs',
  );
  closed(map.reviews, ['inspector', 'independent']);
  for (const role of ['inspector', 'independent']) {
    closed(map.reviews[role], ['actor', 'report']);
    requireFact(
      typeof map.reviews[role].actor === 'string' &&
        map.reviews[role].actor.startsWith('/root/') &&
        map.reviews[role].actor !==
          map.reviews[role === 'inspector' ? 'independent' : 'inspector'].actor,
      'Historical map reviewers differ',
    );
    verifiedBytes(root, map.reviews[role].report);
  }
  const names = new Set(),
    retained = new Map();
  for (const entry of map.files) {
    closed(entry, ['original', 'retained']);
    closed(entry.original, ['path', 'bytes', 'sha256']);
    closed(entry.retained, ['path', 'bytes', 'sha256']);
    requireFact(
      entry.original.path.startsWith('scratch/r22-adoption-161/') &&
        !names.has(entry.original.path) &&
        entry.original.bytes === entry.retained.bytes &&
        entry.original.sha256 === entry.retained.sha256 &&
        entry.retained.path ===
          historicalRecords + '/' + entry.original.sha256.slice(7) + '.raw',
      'Historical map path or identity differs',
    );
    names.add(entry.original.path);
    retained.set(entry.retained.path, entry.retained);
  }
  for (const entry of retained.values()) verifiedBytes(root, entry);
  requireFact(
    isDeepStrictEqual([...names], [...names].sort()) &&
      isDeepStrictEqual(
        fs.readdirSync(path.join(root, historicalRecords)).sort(),
        [...retained.keys()].map((name) => path.posix.basename(name)).sort(),
      ),
    'Historical map order or retained inventory differs',
  );
  return map;
}

export function readHistoricalPlanInput(root, logicalRef) {
  root = fs.realpathSync(path.resolve(root));
  closed(logicalRef, ['path', 'sha256']);
  requireFact(
    typeof logicalRef.path === 'string' &&
      logicalRef.path.startsWith('scratch/r22-adoption-161/') &&
      typeof logicalRef.sha256 === 'string' &&
      /^sha256:[a-f0-9]{64}$/u.test(logicalRef.sha256),
    'Unknown historical logical input',
  );
  const map = readManifest(root);
  const rows = map.files.filter(
    ({ original }) =>
      original.path === logicalRef.path &&
      original.sha256 === logicalRef.sha256,
  );
  requireFact(rows.length === 1, 'Historical logical input not admitted');
  return verifiedBytes(root, rows[0].retained);
}
