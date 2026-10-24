import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  GOVERNED_UPGRADE_PATHS,
  verifyGovernedUpgradeCompatibility,
} from './governed-upgrade-compatibility.mjs';

// This reviewed v1 scope is intentionally finite. A new exception requires a new
// reviewed mapping/version, never a caller-provided waiver or a native PASS.
export const BASELINE = '92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c';
export const PRESERVATION_PATH =
  'work/rounds/R-0041/reports/c5-c8-worker/preservation-reference.json';
export const PRESERVATION_SHA256 =
  '7a1a5a14ada075e28c2ff25a8af4202898814e6d4288b31b699a047b81a635ee';
export const AUTHORIZED_APPEND = Object.freeze({
  path: 'record/proofs/work/generic/R-0037.jsonl',
  commit: '173ab167ad39e314f5e2d7eaea84bab27a162a52',
  git_blob: '5b590f382e8d6c4c2299df8768a3b8176e6af3eb',
  sha256: '8a3298c25de676a142c535c8e5226a162d8e3e93b6a30a9f10ef9b8162ccb488',
});
export const AUTHORIZED_MAIN_APPEND = Object.freeze({
  path: 'record/proofs/work/generic/R-0025.jsonl',
  commit: '2e04f29c864cc3cdb3e73d4ec0de995e67214db7',
  git_blob: '383d7b225fb7caaa1fe07b0ac85447737d550118',
  sha256: '406e818ab9b4f521cba1bf771f15f7bde1ca5ab8ff7ff8ba7599b5669780fcdd',
});
export const CLOSURES = Object.freeze({
  'R-0003': 'PC-0001',
  'R-0004': 'PC-0002',
  'R-0005': 'PC-0003',
  'R-0006': 'PC-0004',
  'R-0007': 'PC-0011',
  'R-0008': 'PC-0005',
  'R-0009': 'PC-0006',
  'R-0010': 'PC-0008',
  'R-0011': 'PC-0009',
  'R-0012': 'PC-0010',
  'R-0013': 'PC-0013',
  'R-0014': 'PC-0007',
  'R-0015': 'PC-0014',
  'R-0016': 'PC-0012',
  'R-0017': 'PC-0018',
  'R-0018': 'PC-0020',
  'R-0019': 'PC-0016',
  'R-0033': 'PC-0021',
  'R-0036': 'PC-0022',
});
export const MISSING_ROUNDS = Object.freeze([
  'R-0001',
  ...Array.from(
    { length: 13 },
    (_, i) => `R-${String(i + 20).padStart(4, '0')}`,
  ),
]);
const captures = Object.freeze({
  decision_record_integrity:
    '24a6fb953fa57aba5bf7c192b655279df073910b23e7887c085651eaa527e355',
  round_record_integrity:
    'eaa0858006ea829e396c25a52ea50cc35ac58d3090a6b15eddfbb471e5dba9bc',
  archive_immutability:
    '177da236750251c3cb9244162f44049bf62943d65577b63dd8e4dc33037a699f',
});
const captureRoot = 'work/rounds/R-0041/reports/c8-compatibility';
const defaultManifest = 'docs/meta/security/historical-compatibility.json';
export const sha256 = (bytes) =>
  crypto.createHash('sha256').update(bytes).digest('hex');
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}
const canonicalHash = (value) => sha256(JSON.stringify(canonical(value)));
function ensure(condition, code, detail) {
  if (!condition) throw new Error(`${code}: ${detail}`);
}
function repoFile(root, relative) {
  ensure(
    typeof relative === 'string' &&
      relative.length > 0 &&
      !path.isAbsolute(relative) &&
      !relative.split('/').includes('..'),
    'PATH_INVALID',
    String(relative),
  );
  const target = path.resolve(root, relative);
  ensure(
    !fs.lstatSync(target).isSymbolicLink(),
    'SOURCE_SYMLINK_INVALID',
    relative,
  );
  const real = fs.realpathSync(target);
  ensure(
    real === root || real.startsWith(root + path.sep),
    'PATH_ESCAPE',
    relative,
  );
  return target;
}
function read(root, relative) {
  return fs.readFileSync(repoFile(root, relative));
}
function git(root, args, allowMissing = false) {
  try {
    return execFileSync(
      'git',
      ['--no-replace-objects', '--literal-pathspecs', '-C', root, ...args],
      {
        encoding: null,
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 32 * 1024 * 1024,
      },
    );
  } catch (error) {
    if (allowMissing && error.status === 128) return null;
    throw new Error(`GIT_SOURCE_UNAVAILABLE: ${args.join(' ')}`);
  }
}
function baselineBlobs(root, paths) {
  const bytes = execFileSync(
    'git',
    [
      '--no-replace-objects',
      '--literal-pathspecs',
      '-C',
      root,
      'cat-file',
      '--batch',
    ],
    {
      input: paths.map((file) => `${BASELINE}:${file}\n`).join(''),
      encoding: null,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 128 * 1024 * 1024,
    },
  );
  const result = new Map();
  let offset = 0;
  for (const file of paths) {
    const end = bytes.indexOf(10, offset);
    ensure(end >= offset, 'GIT_BATCH_INVALID', file);
    const header = bytes
      .subarray(offset, end)
      .toString()
      .match(/^([a-f0-9]{40}) blob ([0-9]+)$/);
    ensure(header, 'GIT_SOURCE_UNAVAILABLE', file);
    const size = Number(header[2]),
      start = end + 1;
    ensure(
      Number.isSafeInteger(size) &&
        start + size < bytes.length &&
        bytes[start + size] === 10,
      'GIT_BATCH_INVALID',
      file,
    );
    result.set(file, bytes.subarray(start, start + size));
    offset = start + size + 1;
  }
  ensure(
    offset === bytes.length,
    'GIT_BATCH_INVALID',
    'unexpected trailing data',
  );
  return result;
}
function exactKeys(object, keys, label) {
  ensure(
    object && !Array.isArray(object) && typeof object === 'object',
    'SHAPE_INVALID',
    label,
  );
  ensure(
    JSON.stringify(Object.keys(object).sort()) ===
      JSON.stringify([...keys].sort()),
    'KEYS_INVALID',
    label,
  );
}
export function boundSource(root, source) {
  exactKeys(source, ['path', 'commit', 'git_blob', 'sha256'], 'source');
  ensure(source.commit === BASELINE, 'SOURCE_COMMIT_MISMATCH', source.path);
  const bytes = git(root, ['show', `${BASELINE}:${source.path}`]);
  const blob = git(root, ['rev-parse', `${BASELINE}:${source.path}`])
    .toString()
    .trim();
  ensure(
    blob === source.git_blob && /^[a-f0-9]{40}$/.test(blob),
    'GIT_OBJECT_MISMATCH',
    source.path,
  );
  ensure(sha256(bytes) === source.sha256, 'SOURCE_HASH_MISMATCH', source.path);
  ensure(
    sha256(read(root, source.path)) === source.sha256,
    'CURRENT_BYTES_CHANGED',
    source.path,
  );
  return bytes;
}

/** Two exact source-bound transitions, never a general JSONL exception. */
export function verifyAuthorizedAppend(
  root,
  transition,
  originalBytes,
  originalHash,
) {
  exactKeys(
    transition,
    [
      'path',
      'original_sha256',
      'original_line_count',
      'new_line_count',
      'source',
      'authority',
    ],
    'authorized append',
  );
  const approved = [AUTHORIZED_APPEND, AUTHORIZED_MAIN_APPEND].find(
    (source) => source.path === transition.path,
  );
  const closure = approved === AUTHORIZED_APPEND;
  const oldCount = closure ? 1 : 4,
    newCount = closure ? 2 : 6;
  const round = closure ? 'R-0037' : 'R-0025';
  ensure(
    approved !== undefined &&
      transition.original_sha256 === originalHash &&
      transition.original_line_count === oldCount &&
      transition.new_line_count === newCount &&
      transition.authority ===
        (closure
          ? 'Owner-authorized C1 closure; PR #207'
          : 'Canonical main integration; PR #205'),
    'APPEND_TRANSITION_IDENTITY_INVALID',
    'only the two exact reviewed proof-stream transitions are allowed',
  );
  exactKeys(
    transition.source,
    ['path', 'commit', 'git_blob', 'sha256'],
    'append source',
  );
  ensure(
    Object.keys(approved).every(
      (key) => transition.source[key] === approved[key],
    ),
    'APPEND_SOURCE_IDENTITY_INVALID',
    'must bind the authentic approved closure commit',
  );
  const authentic = git(root, ['show', `${approved.commit}:${approved.path}`]);
  ensure(
    git(root, ['rev-parse', `${approved.commit}:${approved.path}`])
      .toString()
      .trim() === approved.git_blob && sha256(authentic) === approved.sha256,
    'APPEND_GIT_SOURCE_MISMATCH',
    approved.path,
  );
  const current = read(root, approved.path);
  ensure(
    sha256(originalBytes) === originalHash &&
      authentic.subarray(0, originalBytes.length).equals(originalBytes) &&
      current.subarray(0, originalBytes.length).equals(originalBytes),
    'APPEND_PREFIX_CHANGED',
    approved.path,
  );
  ensure(
    sha256(current) === approved.sha256 && current.equals(authentic),
    'APPEND_CURRENT_HASH_UNAPPROVED',
    'exact approved complete stream required; unknown further appends are refused',
  );
  const rows = current
    .toString()
    .trimEnd()
    .split('\n')
    .map((line) => JSON.parse(line));
  const oldRows = originalBytes
    .toString()
    .trimEnd()
    .split('\n')
    .map((line) => JSON.parse(line));
  ensure(
    oldRows.length === oldCount &&
      rows.length === newCount &&
      rows.every(
        (row, index) =>
          row.round_id === round &&
          row.kind === 'generic' &&
          row.line_type === 'record' &&
          row.sequence === index + 1,
      ) &&
      rows.every(
        (row, index) =>
          index === 0 || row.previous_line_hash === rows[index - 1].line_hash,
      ) &&
      rows.slice(oldCount).every((row) => row.payload?.round === round) &&
      (closure
        ? rows[1].payload?.scope ===
            'C1 post-integration verification and authorized closure' &&
          rows[1].payload?.integration_commit === BASELINE
        : rows
            .slice(oldCount)
            .every(
              (row) =>
                typeof row.payload?.action === 'string' &&
                row.payload.action.length > 0,
            )),
    'APPEND_RECORD_IDENTITY_INVALID',
    'physical sequence and round identity required',
  );
  return {
    path: approved.path,
    authentic_commit: approved.commit,
    current_sha256: approved.sha256,
    original_lines_preserved: oldCount,
    authorized_new_lines: newCount - oldCount,
  };
}

export function verifyHistoricalCompatibility(repoRoot, manifest = undefined) {
  const root = fs.realpathSync(repoRoot);
  const document = manifest ?? JSON.parse(read(root, defaultManifest));
  exactKeys(
    document,
    [
      'schemaVersion',
      'kind',
      'baseline_commit',
      'authority',
      'native_verdict_replacement',
      'closure_links',
      'missing_records',
      'legacy_adr',
      'known_mutation',
      'preservation',
      'diagnostic_captures',
    ],
    'manifest',
  );
  ensure(
    document.schemaVersion === '1.0.0' &&
      document.kind === 'detran-historical-compatibility' &&
      document.baseline_commit === BASELINE,
    'VERSION_OR_BASELINE_INVALID',
    'only reviewed v1 scope accepted',
  );
  ensure(
    document.authority === 'ADR-0055' &&
      document.native_verdict_replacement === false,
    'AUTHORITY_OR_VERDICT_INVALID',
    'supplementary only',
  );
  ensure(
    Array.isArray(document.closure_links) &&
      document.closure_links.length === Object.keys(CLOSURES).length,
    'CLOSURE_POPULATION_INVALID',
    'all 19 exact mappings required',
  );
  const seen = new Set();
  for (const entry of document.closure_links) {
    exactKeys(
      entry,
      [
        'round_id',
        'closure_id',
        'record_source',
        'closure_source',
        'disposition',
      ],
      'closure link',
    );
    ensure(
      !seen.has(entry.round_id) &&
        CLOSURES[entry.round_id] === entry.closure_id,
      'CLOSURE_IDENTITY_INVALID',
      String(entry.round_id),
    );
    seen.add(entry.round_id);
    ensure(
      entry.disposition === 'authentic-source-located-native-index-gap',
      'DISPOSITION_INVALID',
      entry.round_id,
    );
    ensure(
      entry.record_source.path === `work/rounds/${entry.round_id}/record.md` &&
        entry.closure_source.path ===
          `record/proofs/compliance/closures/${entry.closure_id}.json`,
      'SOURCE_PATH_IDENTITY_INVALID',
      entry.round_id,
    );
    const record = boundSource(root, entry.record_source).toString();
    const closure = JSON.parse(boundSource(root, entry.closure_source));
    ensure(
      new RegExp(`^id:\\s*["']?${entry.round_id}["']?\\s*$`, 'm').test(
        record,
      ) &&
        new RegExp(
          `^phase_closure:\\s*["']?${entry.closure_id}["']?\\s*$`,
          'm',
        ).test(record),
      'RECORD_CLOSURE_IDENTITY_INVALID',
      entry.round_id,
    );
    ensure(
      closure.round_id === entry.round_id,
      'CLOSURE_ROUND_MISMATCH',
      entry.closure_id,
    );
  }
  ensure(
    Array.isArray(document.missing_records) &&
      document.missing_records.length === MISSING_ROUNDS.length,
    'MISSING_POPULATION_INVALID',
    'all 14 gaps required',
  );
  const missing = new Set();
  for (const entry of document.missing_records) {
    exactKeys(entry, ['round_id', 'path', 'disposition'], 'missing record');
    ensure(
      MISSING_ROUNDS.includes(entry.round_id) && !missing.has(entry.round_id),
      'MISSING_IDENTITY_INVALID',
      String(entry.round_id),
    );
    missing.add(entry.round_id);
    ensure(
      entry.path === `work/rounds/${entry.round_id}/record.md` &&
        entry.disposition === 'source-absent-no-reconstruction',
      'MISSING_DISPOSITION_INVALID',
      entry.round_id,
    );
    ensure(
      git(root, ['show', `${BASELINE}:${entry.path}`], true) === null,
      'SOURCE_NOT_ACTUALLY_MISSING',
      entry.path,
    );
    ensure(
      fs.lstatSync(path.join(root, entry.path), { throwIfNoEntry: false }) ===
        undefined,
      'UNREGISTERED_NEW_RECORD',
      entry.path,
    );
  }
  const adr = document.legacy_adr;
  exactKeys(adr, ['id', 'source', 'disposition'], 'legacy ADR');
  ensure(
    adr.id === 'ADR-0001' &&
      adr.source.path ===
        'law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md' &&
      adr.disposition === 'authentic-prose-frontmatter-gap-retained',
    'ADR_IDENTITY_INVALID',
    'historical prose only',
  );
  ensure(
    boundSource(root, adr.source).toString().startsWith('# ADR-0001:'),
    'ADR_SOURCE_INVALID',
    adr.source.path,
  );

  const mutation = document.known_mutation;
  exactKeys(
    mutation,
    [
      'round_id',
      'path',
      'first_closed_commit',
      'first_closed_tree',
      'baseline_tree',
      'later_changed_commits',
      'disposition',
    ],
    'known mutation',
  );
  ensure(
    mutation.round_id === 'R-0017' &&
      mutation.path === 'work/rounds/R-0017' &&
      mutation.disposition === 'historical-mutation-remains-finding',
    'MUTATION_DISPOSITION_INVALID',
    'cannot bless changed bytes as original',
  );
  const history = git(root, [
    'log',
    BASELINE,
    '--reverse',
    '--format=%H',
    '--',
    mutation.path,
  ])
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);
  let firstClosed = null;
  const changed = [];
  for (const commit of history) {
    const record = git(
      root,
      ['show', `${commit}:${mutation.path}/record.md`],
      true,
    );
    if (!record) continue;
    const tree = git(root, ['rev-parse', `${commit}:${mutation.path}`])
      .toString()
      .trim();
    if (
      !firstClosed &&
      /^status:\s*["']?closed["']?\s*$/m.test(record.toString())
    )
      firstClosed = { commit, tree };
    else if (firstClosed && tree !== firstClosed.tree) changed.push(commit);
  }
  ensure(
    firstClosed &&
      firstClosed.commit === mutation.first_closed_commit &&
      firstClosed.tree === mutation.first_closed_tree &&
      changed.length > 0 &&
      JSON.stringify(changed) ===
        JSON.stringify(mutation.later_changed_commits),
    'MUTATION_HISTORY_MISMATCH',
    'first closed commit and later changes are immutable observations',
  );
  ensure(
    git(root, ['rev-parse', `${BASELINE}:${mutation.path}`])
      .toString()
      .trim() === mutation.baseline_tree &&
      mutation.baseline_tree !== mutation.first_closed_tree,
    'MUTATION_BASELINE_INVALID',
    mutation.path,
  );
  const subtree = git(root, [
    'ls-tree',
    '-r',
    '--name-only',
    BASELINE,
    '--',
    mutation.path,
  ])
    .toString()
    .trim()
    .split('\n');
  for (const file of subtree)
    ensure(
      sha256(read(root, file)) ===
        sha256(git(root, ['show', `${BASELINE}:${file}`])),
      'CURRENT_MUTATED_ROUND_CHANGED',
      file,
    );
  function currentFiles(directory) {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .flatMap((item) => {
        const file = path.join(directory, item.name);
        return item.isDirectory()
          ? currentFiles(file)
          : [path.relative(root, file).split(path.sep).join('/')];
      });
  }
  ensure(
    JSON.stringify(currentFiles(path.join(root, mutation.path)).sort()) ===
      JSON.stringify([...subtree].sort()),
    'UNREGISTERED_MUTATION_SOURCE',
    mutation.path,
  );

  const preservation = document.preservation;
  exactKeys(
    preservation,
    [
      'reference_path',
      'reference_sha256',
      'sealed_source_count',
      'governed_prefix',
      'legacy',
      'authorized_append_transition',
      'integrated_main_append_transition',
    ],
    'preservation',
  );
  ensure(
    preservation.reference_path === PRESERVATION_PATH &&
      preservation.reference_sha256 === PRESERVATION_SHA256 &&
      preservation.sealed_source_count === 1073,
    'PRESERVATION_REFERENCE_INVALID',
    'fixed 1073-source reference',
  );
  const referenceBytes = read(root, preservation.reference_path);
  ensure(
    sha256(referenceBytes) === PRESERVATION_SHA256,
    'PRESERVATION_REFERENCE_CHANGED',
    preservation.reference_path,
  );
  const reference = JSON.parse(referenceBytes);
  ensure(
    Object.keys(reference).length === 1073,
    'SEALED_SOURCE_COUNT_INVALID',
    '1073',
  );
  const baselineFiles = baselineBlobs(root, Object.keys(reference));
  const acceptedAppend = verifyAuthorizedAppend(
    root,
    preservation.authorized_append_transition,
    baselineFiles.get(AUTHORIZED_APPEND.path),
    reference[AUTHORIZED_APPEND.path],
  );
  const acceptedMainAppend = verifyAuthorizedAppend(
    root,
    preservation.integrated_main_append_transition,
    baselineFiles.get(AUTHORIZED_MAIN_APPEND.path),
    reference[AUTHORIZED_MAIN_APPEND.path],
  );
  ensure(
    acceptedAppend.path === AUTHORIZED_APPEND.path &&
      acceptedMainAppend.path === AUTHORIZED_MAIN_APPEND.path,
    'APPEND_TRANSITIONS_SWAPPED',
    'closure and main transition slots are distinct',
  );
  let acceptedUpgrade;
  for (const [file, expected] of Object.entries(reference)) {
    ensure(
      sha256(baselineFiles.get(file)) === expected,
      'PRESERVATION_BASELINE_MISMATCH',
      file,
    );
    if (
      file !== 'record/proofs/chain.json' &&
      file !== AUTHORIZED_APPEND.path &&
      file !== AUTHORIZED_MAIN_APPEND.path
    ) {
      const matches = sha256(read(root, file)) === expected;
      if (!matches && GOVERNED_UPGRADE_PATHS.includes(file))
        acceptedUpgrade ??= verifyGovernedUpgradeCompatibility(
          root,
          reference,
          baselineFiles,
        );
      else ensure(matches, 'SEALED_BYTES_CHANGED', file);
    }
  }
  const originalChain = JSON.parse(
    git(root, ['show', `${BASELINE}:record/proofs/chain.json`]),
  );
  const currentChain = JSON.parse(read(root, 'record/proofs/chain.json'));
  const prefix = preservation.governed_prefix;
  exactKeys(
    prefix,
    ['path', 'record_count', 'head', 'records_sha256', 'entries'],
    'governed prefix',
  );
  ensure(
    prefix.path === 'record/proofs/chain.json' &&
      prefix.record_count === originalChain.records.length &&
      prefix.head === originalChain.head &&
      prefix.records_sha256 === canonicalHash(originalChain.records),
    'GOVERNED_PREFIX_BINDING_INVALID',
    'complete baseline prefix',
  );
  ensure(
    Array.isArray(prefix.entries) &&
      prefix.entries.length === originalChain.records.length,
    'GOVERNED_ENTRIES_MISSING',
    'all records required',
  );
  ensure(
    Array.isArray(currentChain.records) &&
      currentChain.records.length >= prefix.record_count &&
      canonicalHash(currentChain.records.slice(0, prefix.record_count)) ===
        prefix.records_sha256,
    'GOVERNED_PREFIX_CHANGED',
    'no removed, reordered or modified old entries',
  );
  prefix.entries.forEach((entry, index) => {
    exactKeys(entry, ['id', 'sha256'], 'governed prefix entry');
    ensure(
      entry.id === originalChain.records[index].id &&
        entry.sha256 === canonicalHash(originalChain.records[index]),
      'GOVERNED_ENTRY_IDENTITY_INVALID',
      String(index),
    );
  });
  if (currentChain.records.length === prefix.record_count)
    ensure(
      currentChain.head === prefix.head,
      'GOVERNED_HEAD_CHANGED',
      'unchanged prefix has unchanged head',
    );
  const legacy = preservation.legacy;
  exactKeys(legacy, ['path', 'git_blob', 'sha256'], 'legacy chain');
  ensure(
    legacy.path === '.devai/state/evidence-chain.json' &&
      legacy.sha256 === reference[legacy.path] &&
      legacy.git_blob ===
        git(root, ['rev-parse', `${BASELINE}:${legacy.path}`])
          .toString()
          .trim(),
    'LEGACY_IDENTITY_INVALID',
    'tracked read-only legacy',
  );

  ensure(
    Array.isArray(document.diagnostic_captures) &&
      document.diagnostic_captures.length === Object.keys(captures).length,
    'CAPTURE_POPULATION_INVALID',
    'three exact native captures',
  );
  const captured = new Set();
  for (const item of document.diagnostic_captures) {
    exactKeys(item, ['kind', 'path', 'sha256', 'status'], 'capture');
    ensure(
      captures[item.kind] === item.sha256 &&
        !captured.has(item.kind) &&
        item.path === `${captureRoot}/${item.kind}-readings.json.gz`,
      'CAPTURE_IDENTITY_INVALID',
      String(item.kind),
    );
    captured.add(item.kind);
    const bytes = read(root, item.path);
    ensure(sha256(bytes) === item.sha256, 'CAPTURE_BYTES_CHANGED', item.path);
    const readings = JSON.parse(gunzipSync(bytes));
    ensure(
      readings.length === 1 &&
        readings[0].sensor.kind === item.kind &&
        readings[0].status === item.status &&
        item.status ===
          (item.kind === 'archive_immutability' ? 'pass' : 'fail'),
      'CAPTURE_READING_IDENTITY_INVALID',
      item.path,
    );
  }
  const close = JSON.parse(
    read(root, 'work/rounds/R-0036/close-state.jsonl')
      .toString()
      .trim()
      .split('\n')
      .at(-1),
  );
  ensure(
    close.round_id === 'R-0036' &&
      close.status === 'closed' &&
      close.phase_closure === 'PC-0022',
    'R0036_NOT_CLOSED',
    'preserve terminal state',
  );
  return {
    ok: true,
    status: 'supplementary-map-verified-with-recorded-gaps',
    native_readings_issued: false,
    native_verdict_replaced: false,
    located_closure_sources: seen.size,
    missing_records: [...missing].sort(),
    retained_findings: [
      'DECISION_FRONTMATTER_INVALID:ADR-0001',
      'ROUND_ARCHIVE_MUTATED:R-0017',
      ...[...missing].sort().map((id) => `ROUND_RECORD_MISSING:${id}`),
    ],
    preservation: {
      sealed_sources: 1073,
      governed_prefix_records: prefix.record_count,
      governed_tail_records: currentChain.records.length - prefix.record_count,
      governed_tail_requires_native_verification:
        currentChain.records.length > prefix.record_count,
      legacy_sha256: legacy.sha256,
      R0036: 'closed:PC-0022',
      authorized_append_transition: acceptedAppend,
      integrated_main_append_transition: acceptedMainAppend,
      ...(acceptedUpgrade && { governed_upgrade_transition: acceptedUpgrade }),
    },
    limitation:
      'Locates source records only. Does not repair the native terminal-index predicate, approve missing records or historical mutation, or validate a newly appended evidence-chain tail. Official native verification remains required.',
  };
}

function main() {
  const args = process.argv.slice(2);
  ensure(
    args.length === 0 || (args.length === 2 && args[0] === '--repo-root'),
    'USAGE',
    'verify-historical-compatibility.mjs [--repo-root <repo>]',
  );
  try {
    process.stdout.write(
      JSON.stringify(
        verifyHistoricalCompatibility(args.length ? args[1] : process.cwd()),
        null,
        2,
      ) + '\n',
    );
  } catch (error) {
    process.stderr.write(
      JSON.stringify({
        ok: false,
        native_readings_issued: false,
        error: error.message,
      }) + '\n',
    );
    process.exitCode = 1;
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
