import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const manifestPath =
  'work/rounds/R-0020/contracts/CTG-0003-A3.5-guard-manifest.json';
const archiveDirectory = 'work/rounds/R-0007/compositions-archive';
const ids = [
  'TASK-0004-S1',
  'TASK-0004-S2',
  'TASK-0004-S2-R1',
  'TASK-0004-S3',
  'TASK-0004-S4',
  'TASK-0004-S5',
  'TASK-0078',
  'TASK-0079',
  'TASK-0080',
  'TASK-0081',
  'TASK-0082',
];
const hashPattern = /^[a-f0-9]{64}$/u;
const pcPattern = /^PC-[a-f0-9]{16}$/u;
const expectedPc = new Map([
  ['TASK-0004-S1', 'PC-cc41f39f237dccdd'],
  ['TASK-0004-S2', 'PC-cf0578539d9b03e6'],
  ['TASK-0004-S2-R1', 'PC-2151b3056f67043d'],
  ['TASK-0004-S3', 'PC-8ec9b108bf290ede'],
  ['TASK-0004-S4', 'PC-d0a290d9320c85b9'],
  ['TASK-0004-S5', 'PC-1d975bf1835e7f30'],
  ['TASK-0078', 'PC-22b18cc1bd9af201'],
  ['TASK-0079', 'PC-cc3dc8e959e09510'],
  ['TASK-0080', 'PC-1766eb9f01d0bafa'],
  ['TASK-0081', 'PC-aedea88033f4eb98'],
  ['TASK-0082', 'PC-10b9b527af7d35af'],
]);
const authorizationPath =
  'work/rounds/R-0020/AUTHORIZATION-A3.2-A3.3-PARTIAL-2026-09-28.md';
const aliasesPath = 'work/rounds/R-0007/tasks/_legacy-originals/aliases.json';
const auditorBridges = new Map([
  [
    'TASK-0078',
    [
      'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final.bridge.json',
      'dc07c7541f65173c338da45846b1d358843c2b2b29e86563e2312a2626954583',
    ],
  ],
  [
    'TASK-0080',
    [
      'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-2.bridge.json',
      'c6e3fd82236f71bad5345a6b86800ac28f24013320d01a2937a5f2ff8477c90d',
    ],
  ],
  [
    'TASK-0082',
    [
      'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-3.bridge.json',
      'bff8f502cf0baf954537ecb8d95c1f9978b2d0c75ebc3515fd9d36acade24980',
    ],
  ],
]);

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function canonicalize(bytes) {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  return text
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/[ \t\n]+$/u, '');
}

function fail(message) {
  throw new Error(`ARCHIVAL_PC_GUARD_INTEGRITY: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function repositoryPath(root, path) {
  assert(typeof path === 'string' && path.length > 0, 'invalid path');
  assert(!isAbsolute(path) && !path.includes('\\'), `invalid path: ${path}`);
  const parts = path.split('/');
  assert(
    parts.every((part) => part && part !== '.' && part !== '..'),
    `path escape: ${path}`,
  );
  return join(root, ...parts);
}

async function statWithoutLinks(root, path, missing = false) {
  const absolute = repositoryPath(root, path);
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    let stat;
    try {
      stat = await lstat(current);
    } catch (error) {
      if (missing && error.code === 'ENOENT') return null;
      fail(`missing or unreadable path: ${path}`);
    }
    assert(!stat.isSymbolicLink(), `symlink in path: ${path}`);
  }
  return { absolute, stat: await lstat(absolute) };
}

async function bytesAt(root, path) {
  const entry = await statWithoutLinks(root, path);
  assert(entry.stat.isFile(), `not a regular file: ${path}`);
  try {
    return await readFile(entry.absolute);
  } catch {
    fail(`unreadable file: ${path}`);
  }
}

async function jsonAt(root, path) {
  try {
    return JSON.parse((await bytesAt(root, path)).toString('utf8'));
  } catch (error) {
    fail(`invalid JSON at ${path}: ${error.message}`);
  }
}

function assertHashPair(entry, bytes, label) {
  assert(hashPattern.test(entry.raw_sha256), `${label}: invalid raw sha256`);
  assert(
    hashPattern.test(entry.canonical_sha256),
    `${label}: invalid canonical sha256`,
  );
  assert(sha256(bytes) === entry.raw_sha256, `${label}: raw sha256 mismatch`);
  assert(
    sha256(canonicalize(bytes)) === entry.canonical_sha256,
    `${label}: canonical sha256 mismatch`,
  );
}

function containsRound(value, roundId) {
  if (!value || typeof value !== 'object') return false;
  if (value.round_id === roundId || value.roundId === roundId) return true;
  return Object.values(value).some((item) => containsRound(item, roundId));
}

async function verifyG0(root) {
  const store = '.devai/state/tasks';
  const storeEntry = await statWithoutLinks(root, store, true);
  if (storeEntry) {
    assert(storeEntry.stat.isDirectory(), 'store is not a directory');
    let names;
    try {
      names = await readdir(storeEntry.absolute);
    } catch {
      fail('unreadable store');
    }
    for (const name of names) {
      assert(name.endsWith('.json'), `ambiguous store entry: ${name}`);
      const task = await jsonAt(root, `${store}/${name}`);
      assert(
        task && typeof task === 'object' && !Array.isArray(task),
        `malformed store: ${name}`,
      );
      assert(
        typeof task.round_id === 'string',
        `ambiguous store round: ${name}`,
      );
      assert(
        !containsRound(task, 'R-0007'),
        `R-0007 identity in store: ${name}`,
      );
    }
  }
  const backlog = '.devai/state/backlog.jsonl';
  const backlogEntry = await statWithoutLinks(root, backlog, true);
  if (backlogEntry) {
    assert(backlogEntry.stat.isFile(), 'backlog is not a file');
    const lines = (await bytesAt(root, backlog)).toString('utf8').split('\n');
    for (const [index, line] of lines.entries()) {
      if (!line && index === lines.length - 1) continue;
      assert(line.trim(), `malformed backlog line ${index + 1}`);
      let value;
      try {
        value = JSON.parse(line);
      } catch {
        fail(`malformed backlog JSON line ${index + 1}`);
      }
      assert(
        value && typeof value === 'object' && !Array.isArray(value),
        `malformed backlog line ${index + 1}`,
      );
      assert(
        typeof value.round_id === 'string',
        `ambiguous backlog round line ${index + 1}`,
      );
      assert(
        !containsRound(value, 'R-0007'),
        `R-0007 identity in backlog line ${index + 1}`,
      );
    }
  }
}

function validateManifest(manifest) {
  assert(manifest?.schemaVersion === '1.0.0', 'manifest schemaVersion');
  assert(manifest.round_id === 'R-0007', 'manifest round_id');
  assert(
    manifest.canonicalization === 'utf8-bom-crlf-trailing-v1',
    'manifest canonicalization',
  );
  assert(
    ['pre-migration', 'applied'].includes(manifest.status),
    'manifest status',
  );
  const counts = manifest.expected_counts;
  assert(
    counts?.task_prompts === 6 &&
      counts.task_json_originals === 5 &&
      counts.archive_packages === 11 &&
      counts.canonical_tasks === 11 &&
      counts.sidecars === 11,
    'manifest expected_counts',
  );
  assert(
    Array.isArray(manifest.original_sources) &&
      manifest.original_sources.length === 11,
    'manifest original_sources count',
  );
  manifest.original_sources.forEach((source, index) => {
    const id = ids[index];
    const kind = index < 6 ? 'task-prompt' : 'task-json-original';
    const expectedPath =
      index < 6
        ? `work/rounds/R-0007/prompts/${id}.md`
        : `work/rounds/R-0007/tasks/${id}.json`;
    assert(
      source.task_id === id &&
        source.kind === kind &&
        source.path === expectedPath,
      `manifest source identity: ${id}`,
    );
  });
}

function entriesById(entries, label) {
  assert(Array.isArray(entries) && entries.length === 11, `${label} count`);
  const map = new Map();
  for (const entry of entries) {
    assert(
      ids.includes(entry?.task_id) && !map.has(entry.task_id),
      `${label} duplicate or unknown task_id`,
    );
    map.set(entry.task_id, entry);
  }
  return map;
}

function parsePackage(bytes, id) {
  assert(
    bytes.every((byte) => byte < 128),
    `package must be ASCII: ${id}`,
  );
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  assert(
    !text.includes('\r') && text.endsWith('\n') && !text.startsWith('\uFEFF'),
    `package format: ${id}`,
  );
  const lines = text.slice(0, -1).split('\n');
  const fields = [
    'round_id',
    'task_id',
    'original_task_sha256',
    'source_kind',
    'source_path',
    'source_sha256',
    'selection_mode',
    'selection_registry_id',
    'historical_pc',
    'review_bridge_path',
    'review_bridge_sha256',
    'historical_equivalence',
  ];
  assert(
    lines.length === fields.length + 1 &&
      lines[0] === 'det-archival-composition-v1',
    `package lines: ${id}`,
  );
  const result = {};
  fields.forEach((field, index) => {
    const prefix = `${field}=`;
    assert(
      lines[index + 1].startsWith(prefix),
      `package field ${field}: ${id}`,
    );
    result[field] = lines[index + 1].slice(prefix.length);
    assert(
      !/[ \t]$/u.test(lines[index + 1]),
      `package trailing whitespace: ${id}`,
    );
  });
  return result;
}

async function verifyApplied(root, manifest, originalBytes) {
  const packages = entriesById(manifest.archive_packages, 'archive_packages');
  const tasks = entriesById(manifest.canonical_tasks, 'canonical_tasks');
  const sidecars = entriesById(manifest.sidecars, 'sidecars');
  const indexReference = manifest.archive_index;
  assert(
    indexReference?.path === `${archiveDirectory}/index.json` &&
      hashPattern.test(indexReference.sha256),
    'archive index reference',
  );
  const indexBytes = await bytesAt(root, indexReference.path);
  assert(sha256(indexBytes) === indexReference.sha256, 'archive index sha256');
  let index;
  try {
    index = JSON.parse(indexBytes.toString('utf8'));
  } catch {
    fail('archive index JSON');
  }
  assert(index?.round_id === 'R-0007', 'archive index round_id');
  assert(
    index.schemaVersion === '1.0.0' &&
      index.authorization?.path === authorizationPath &&
      index.authorization.decision === '2B' &&
      index.provenance === 'archival-reconstruction' &&
      index.aliases_path === aliasesPath,
    'archive index metadata',
  );
  const indexEntries = entriesById(index.entries, 'archive index entries');
  const aliases = await jsonAt(root, aliasesPath);
  assert(Array.isArray(aliases) && aliases.length === 6, 'aliases count');
  const pcs = new Set();
  const allPaths = new Set();
  for (const [position, source] of manifest.original_sources.entries()) {
    const id = source.task_id;
    const pack = packages.get(id);
    const taskEntry = tasks.get(id);
    const sidecar = sidecars.get(id);
    assert(
      pack.path === `${archiveDirectory}/${id}.txt`,
      `package path: ${id}`,
    );
    assert(
      sidecar.path ===
        `work/rounds/R-0007/tasks/_legacy-originals/${id}.json.raw`,
      `sidecar path: ${id}`,
    );
    assert(
      taskEntry.path.startsWith('work/rounds/R-0007/tasks/') &&
        taskEntry.path.endsWith('.json'),
      `canonical task path: ${id}`,
    );
    for (const path of [pack.path, taskEntry.path, sidecar.path]) {
      assert(!allPaths.has(path), `duplicate applied path: ${path}`);
      allPaths.add(path);
    }
    const sidecarBytes = await bytesAt(root, sidecar.path);
    assertHashPair(sidecar, sidecarBytes, `sidecar ${id}`);
    let originalTask;
    try {
      originalTask = JSON.parse(sidecarBytes.toString('utf8'));
    } catch {
      fail(`sidecar JSON: ${id}`);
    }
    assert(
      originalTask?.id === id && originalTask.round_id === 'R-0007',
      `sidecar task identity: ${id}`,
    );
    if (source.kind === 'task-json-original') {
      assert(
        source.resolved_path === sidecar.path,
        `resolved original path: ${id}`,
      );
      assertHashPair(source, sidecarBytes, `original ${id}`);
    }
    const packageBytes = await bytesAt(root, pack.path);
    assertHashPair(pack, packageBytes, `package ${id}`);
    const pkg = parsePackage(packageBytes, id);
    assert(
      pkg.round_id === 'R-0007' && pkg.task_id === id,
      `package identity: ${id}`,
    );
    assert(
      pkg.original_task_sha256 === sidecar.raw_sha256,
      `package original task sha256: ${id}`,
    );
    assert(
      pkg.source_path === source.path &&
        pkg.source_sha256 === source.raw_sha256,
      `package source: ${id}`,
    );
    assert(
      pkg.source_kind ===
        (source.kind === 'task-prompt' ? 'task-prompt' : 'task-json'),
      `package source kind: ${id}`,
    );
    assert(
      pkg.selection_mode === 'exact' && pkg.selection_registry_id,
      `package selection: ${id}`,
    );
    assert(
      pkg.historical_equivalence === 'false',
      `historical equivalence: ${id}`,
    );
    const expectedBridge = auditorBridges.get(id);
    if (expectedBridge) {
      assert(
        pkg.review_bridge_path === expectedBridge[0] &&
          pkg.review_bridge_sha256 === expectedBridge[1],
        `review bridge reference: ${id}`,
      );
    } else {
      assert(
        pkg.review_bridge_path === 'NONE' &&
          pkg.review_bridge_sha256 === 'NONE',
        `unexpected review bridge: ${id}`,
      );
    }
    if (pkg.review_bridge_path === 'NONE') {
      assert(pkg.review_bridge_sha256 === 'NONE', `review bridge: ${id}`);
    } else {
      assert(
        hashPattern.test(pkg.review_bridge_sha256),
        `review bridge sha256: ${id}`,
      );
      assert(
        sha256(await bytesAt(root, pkg.review_bridge_path)) ===
          pkg.review_bridge_sha256,
        `review bridge mismatch: ${id}`,
      );
    }
    const fullHash = sha256(packageBytes);
    const pc = `PC-${fullHash.slice(0, 16)}`;
    assert(
      pcPattern.test(pc) &&
        pack.prompt_composition_id === pc &&
        expectedPc.get(id) === pc &&
        !pcs.has(pc),
      `PC collision or mismatch: ${id}`,
    );
    pcs.add(pc);
    const taskBytes = await bytesAt(root, taskEntry.path);
    assertHashPair(taskEntry, taskBytes, `canonical task ${id}`);
    let task;
    try {
      task = JSON.parse(taskBytes.toString('utf8'));
    } catch {
      fail(`canonical task JSON: ${id}`);
    }
    assert(
      task.id === taskEntry.canonical_id && task.round_id === 'R-0007',
      `canonical task identity: ${id}`,
    );
    assert(
      ['completed', 'checkpoint'].includes(task.status),
      `dispatchable status: ${id}`,
    );
    assert(
      task.prompt_composition_id === pc &&
        task.executor?.prompt_composition_id === pc,
      `canonical task PC: ${id}`,
    );
    assert(
      task.executor?.selection?.mode === 'exact' &&
        task.executor.selection.registry_id === pkg.selection_registry_id,
      `canonical task selection: ${id}`,
    );
    const tags = task.tags;
    assert(
      Array.isArray(tags) && new Set(tags).size === tags.length,
      `duplicate tags: ${id}`,
    );
    for (const tag of [
      `legacy-original:${sidecar.path.replace('work/rounds/R-0007/', '')}`,
      `legacy-sha256:${sidecar.raw_sha256}`,
      'archival-pc-provenance:reconstructed-v1',
      'archival-pc-not-historical',
      `archival-pc-package:${pack.path}`,
    ])
      assert(tags.includes(tag), `missing tag ${tag}: ${id}`);
    const indexed = indexEntries.get(id);
    assert(
      indexed.path === pack.path &&
        indexed.raw_sha256 === fullHash &&
        indexed.canonical_sha256 === pack.canonical_sha256 &&
        indexed.prompt_composition_id === pc,
      `archive index entry: ${id}`,
    );
    assert(
      indexed.canonical_task_id === task.id &&
        indexed.original_task_path === `work/rounds/R-0007/tasks/${id}.json` &&
        indexed.original_task_sha256 === sidecar.raw_sha256 &&
        indexed.source?.kind === pkg.source_kind &&
        indexed.source.path === source.path &&
        indexed.source.sha256 === source.raw_sha256 &&
        indexed.selection?.mode === 'exact' &&
        indexed.selection.registry_id === pkg.selection_registry_id &&
        indexed.historical_pc === pkg.historical_pc &&
        indexed.authorization?.path === authorizationPath &&
        indexed.authorization.decision === '2B' &&
        indexed.provenance === 'archival-reconstruction' &&
        indexed.historical_equivalence === false,
      `archive index provenance: ${id}`,
    );
    if (expectedBridge) {
      assert(
        indexed.review_bridge?.path === expectedBridge[0] &&
          indexed.review_bridge.sha256 === expectedBridge[1],
        `archive index bridge: ${id}`,
      );
    } else {
      assert(indexed.review_bridge === null, `archive index bridge: ${id}`);
    }
    const originalPc =
      originalTask.prompt_composition_id ??
      originalTask.executor?.prompt_composition_id ??
      'NONE';
    assert(
      pkg.historical_pc === originalPc && originalPc !== pc,
      `historical PC: ${id}`,
    );
    if (position < 6) {
      assert(task.id === `TASK-00${83 + position}`, `alias: ${id}`);
      const alias = aliases[position];
      assert(
        alias?.round_id === 'R-0007' &&
          alias.old_id === id &&
          alias.new_id === task.id &&
          alias.old_path === `tasks/${id}.json` &&
          alias.canonical_path === `tasks/${task.id}.json` &&
          alias.sidecar_path ===
            sidecar.path.replace('work/rounds/R-0007/', '') &&
          alias.original_sha256 === sidecar.raw_sha256,
        `alias index: ${id}`,
      );
      assert(
        originalTask.executor?.selection === undefined && originalPc === 'NONE',
        `prospective selection provenance: ${id}`,
      );
      assert(
        tags.includes('legacy-selection:absent') &&
          tags.includes('archival-selection:prospective-exact'),
        `selection tags: ${id}`,
      );
      const model = position < 3 ? 'gpt-5.6-terra' : 'gpt-5.6-luna';
      assert(pkg.selection_registry_id === model, `prospective model: ${id}`);
    } else {
      assert(task.id === id, `canonical ID: ${id}`);
      assert(
        originalTask.executor?.selection?.mode === 'exact' &&
          originalTask.executor.selection.registry_id ===
            pkg.selection_registry_id,
        `preserved selection: ${id}`,
      );
      assert(
        tags.includes(`legacy-prompt-composition:${originalPc}`),
        `historical PC tag: ${id}`,
      );
    }
    if (source.kind === 'task-prompt')
      assert(
        sha256(originalBytes.get(id)) === source.raw_sha256,
        `original prompt: ${id}`,
      );
  }
  const existingCompositions = await statWithoutLinks(
    root,
    'work/rounds/R-0007/compositions.json',
    true,
  );
  if (existingCompositions) {
    const compositions = await jsonAt(
      root,
      'work/rounds/R-0007/compositions.json',
    );
    const entries = Array.isArray(compositions)
      ? compositions
      : (compositions?.entries ?? compositions?.compositions);
    assert(Array.isArray(entries), 'historical compositions format');
    for (const entry of entries)
      assert(
        !pcs.has(entry.pc_id),
        `PC collision with historical composition: ${entry.pc_id}`,
      );
  }
  const taskDirectory = 'work/rounds/R-0007/tasks';
  for (const name of await readdir(repositoryPath(root, taskDirectory))) {
    if (!name.endsWith('.json')) continue;
    const path = `${taskDirectory}/${name}`;
    if (allPaths.has(path)) continue;
    const otherTask = await jsonAt(root, path);
    assert(
      !pcs.has(otherTask?.prompt_composition_id) &&
        !pcs.has(otherTask?.executor?.prompt_composition_id),
      `PC collision with existing task: ${name}`,
    );
  }
  const directory = await statWithoutLinks(root, archiveDirectory);
  assert(directory.stat.isDirectory(), 'archive packages directory');
  const names = await readdir(directory.absolute);
  assert(
    names.length === 12 &&
      names.every(
        (name) =>
          name === 'index.json' || ids.some((id) => name === `${id}.txt`),
      ),
    'archive package set',
  );
}

export async function verifyGuard(root) {
  const manifest = await jsonAt(root, manifestPath);
  validateManifest(manifest);
  const originalBytes = new Map();
  for (const source of manifest.original_sources) {
    if (manifest.status === 'applied' && source.kind === 'task-json-original')
      continue;
    const bytes = await bytesAt(root, source.path);
    assertHashPair(source, bytes, `original ${source.task_id}`);
    originalBytes.set(source.task_id, bytes);
  }
  const archive = await statWithoutLinks(root, archiveDirectory, true);
  if (manifest.status === 'pre-migration') {
    assert(!archive, 'compositions-archive exists in pre-migration');
    assert(
      !manifest.archive_packages &&
        !manifest.canonical_tasks &&
        !manifest.sidecars &&
        !manifest.archive_index,
      'applied fields in pre-migration manifest',
    );
  } else {
    assert(archive?.stat.isDirectory(), 'missing applied archive directory');
    await verifyApplied(root, manifest, originalBytes);
  }
  await verifyG0(root);
  return manifest;
}

function readArguments(args) {
  if (
    args.length !== 4 ||
    args[0] !== '--repo-root' ||
    args[2] !== '--prompt' ||
    !args[1] ||
    !args[3]
  )
    return null;
  return { root: resolve(args[1]), prompt: resolve(args[3]) };
}

async function main() {
  const args = readArguments(process.argv.slice(2));
  if (!args) {
    process.stderr.write(
      'usage: assert-archival-prompt-not-dispatchable.mjs --repo-root ROOT --prompt PATH\n',
    );
    process.exitCode = 7;
    return;
  }
  try {
    const manifest = await verifyGuard(args.root);
    const forbiddenPaths = [
      ...manifest.original_sources.map((entry) => entry.path),
      ...(manifest.archive_packages ?? []).map((entry) => entry.path),
      ...(manifest.sidecars ?? []).map((entry) => entry.path),
      ...(manifest.canonical_tasks ?? []).map((entry) => entry.path),
    ];
    const forbiddenHashes = new Set();
    for (const entry of [
      ...manifest.original_sources,
      ...(manifest.archive_packages ?? []),
      ...(manifest.sidecars ?? []),
      ...(manifest.canonical_tasks ?? []),
    ]) {
      forbiddenHashes.add(entry.raw_sha256);
      forbiddenHashes.add(entry.canonical_sha256);
    }
    const promptReal = await realpath(args.prompt);
    const relativePrompt = relative(args.root, promptReal).split(sep).join('/');
    const bytes = await readFile(promptReal);
    if (
      forbiddenPaths.includes(relativePrompt) ||
      forbiddenHashes.has(sha256(bytes)) ||
      forbiddenHashes.has(sha256(canonicalize(bytes)))
    ) {
      process.stderr.write(`ARCHIVAL_PC_DISPATCH_FORBIDDEN: ${args.prompt}\n`);
      process.exitCode = 6;
    }
  } catch (error) {
    process.stderr.write(
      `${error.message.startsWith('ARCHIVAL_PC_GUARD_INTEGRITY') ? error.message : `ARCHIVAL_PC_GUARD_INTEGRITY: ${error.message}`}\n`,
    );
    process.exitCode = 7;
  }
}

if (
  process.argv[1] &&
  (await realpath(process.argv[1])) ===
    (await realpath(fileURLToPath(import.meta.url)))
)
  await main();
