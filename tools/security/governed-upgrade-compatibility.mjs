import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Finite reviewed transitions. Neither caller data nor CLI flags extend them.
export const GOVERNED_UPGRADE_PATHS = Object.freeze([
  '.devai/config/project.json',
  '.devai/pin/constitution.md',
]);
export const UPGRADE_MANIFEST =
  'docs/meta/security/governed-upgrade-compatibility-v2.json';
export const UPGRADE_MANIFEST_SHA256 =
  '62fc9d193fb03c72e5fcf48c517da20f7458431cdb48724d0082c33352cdf1d0';
export const V3_UPGRADE_MANIFEST =
  'docs/meta/security/governed-upgrade-compatibility-v3.json';
export const V3_UPGRADE_MANIFEST_SHA256 =
  '41463b425509b6927e92a5b58fbcf2d3c14a872e0b9daa3433deaa23610f0e7a';
const V3_BEFORE = '7abe89cd3e7049fdcf38b33411d38a3442a0e1e1';
const V3_ADOPTION = '92ca1cef70e3fd21e736359b7d0cb5aa3a7e83b0';
const GATE_A_SCOPE =
  '2fd770788290b52cb5edb50301e65e9626d1f582aeea817b805dc5552cd2dfb5';
const DEPENDENCY_PATCH =
  '6660c9c905b4c71ee467dc9a92beaaa01bf149c0f4a2b4f4248386e2daad6595';
const BASELINE = '92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c';
const BEFORE = 'cac88d518bdf430f58575e74309bbcd1658ab6c2';
const ADOPTION = '74b9eec83cd10d981f5ec5923c0f82ad7b2c13b5';
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function requireFact(condition, detail) {
  if (!condition) throw new Error(`GOVERNED_UPGRADE_REFUSED: ${detail}`);
}
function git(root, ...args) {
  return execFileSync(
    'git',
    ['--no-replace-objects', '--literal-pathspecs', '-C', root, ...args],
    { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 },
  );
}
function current(root, file) {
  requireFact(
    typeof file === 'string' &&
      !path.isAbsolute(file) &&
      !file.split('/').some((part) => part === '..' || part === ''),
    'invalid source path',
  );
  const lexical = path.resolve(root, file);
  requireFact(
    fs.lstatSync(lexical).isFile() &&
      !fs.lstatSync(lexical).isSymbolicLink() &&
      fs.realpathSync(lexical) === lexical &&
      lexical.startsWith(root + path.sep),
    `nonregular or linked source: ${file}`,
  );
  return fs.readFileSync(lexical);
}
function source(root, item, commit, compareCurrent = false) {
  requireFact(item.commit === commit, `source commit: ${item.path}`);
  const bytes = git(root, 'show', `${commit}:${item.path}`);
  requireFact(
    git(root, 'rev-parse', `${commit}:${item.path}`).toString().trim() ===
      item.git_blob && hash(bytes) === item.sha256,
    `Git object/hash mismatch: ${item.path}`,
  );
  if (compareCurrent)
    requireFact(
      current(root, item.path).equals(bytes),
      `current bytes: ${item.path}`,
    );
  return bytes;
}

// Compare only the exact DEVAI identities in this reviewed pnpm v9 layout.
// Other workspace importers, package nodes and snapshots are outside this map.
function devaiLockIdentity(bytes) {
  const text = bytes.toString();
  const one = (input, pattern) => {
    const matches = [...input.matchAll(pattern)];
    requireFact(matches.length === 1, 'unique DEVAI lock identity required');
    return matches[0][1];
  };
  requireFact(text.startsWith("lockfileVersion: '9.0'\n"), 'lockfile format');
  const rootImporter = one(text, /^  \.:\n((?: {4}[^\n]*\n|\n)*)/gm);
  const importer = one(
    rootImporter,
    /^      '@aarusso-nyx\/devai':\n((?: {8}[^\n]*\n)*)/gm,
  );
  const packages = one(text, /^packages:\n([\s\S]*?)^snapshots:\n/gm);
  const resolution = one(
    packages,
    /^  '@aarusso-nyx\/devai@2\.7\.0':\n((?: {4}[^\n]*\n|\n)*)/gm,
  );
  return { importer, resolution };
}

function verifyV2(root, reference, baselineFiles, historical = false) {
  const bytes = current(root, UPGRADE_MANIFEST);
  requireFact(hash(bytes) === UPGRADE_MANIFEST_SHA256, 'manifest digest');
  const mapping = JSON.parse(bytes);
  requireFact(
    mapping.schemaVersion === '2.0.0' &&
      mapping.kind === 'detran-governed-upgrade-compatibility' &&
      mapping.authority === 'ADR-0062' &&
      mapping.native_verdict_replacement === false &&
      mapping.baseline_commit === BASELINE &&
      mapping.before_commit === BEFORE &&
      mapping.adoption_commit === ADOPTION,
    'finite transition identity',
  );
  requireFact(
    hash(current(root, 'docs/meta/security/historical-compatibility.json')) ===
      mapping.v1_manifest_sha256,
    'original v1 manifest changed',
  );
  requireFact(
    git(root, 'rev-parse', `${ADOPTION}^`).toString().trim() === BEFORE,
    'adoption parent',
  );
  requireFact(
    JSON.stringify(mapping.sealed_transitions.map((item) => item.path)) ===
      JSON.stringify(GOVERNED_UPGRADE_PATHS),
    'sealed transition population',
  );
  for (const item of mapping.sealed_transitions) {
    const original = source(root, item.baseline, BASELINE);
    requireFact(
      item.path === item.baseline.path &&
        item.path === item.before.path &&
        item.path === item.after.path &&
        hash(original) === reference[item.path] &&
        baselineFiles.get(item.path)?.equals(original),
      `original preservation reference: ${item.path}`,
    );
    requireFact(
      source(root, item.before, BEFORE).equals(original),
      `pre-upgrade sealed bytes: ${item.path}`,
    );
    source(root, item.after, ADOPTION, !historical);
  }
  const generated = new Map(
    mapping.generated_files.map((item) => [
      item.path,
      source(root, item, ADOPTION, !historical),
    ]),
  );
  const receipt = JSON.parse(
    generated.get('.devai/config/upgrade-receipt.json'),
  );
  requireFact(
    receipt.from === '2.6.3' &&
      receipt.to === '2.7.0' &&
      receipt.constitution.from === '1.0.2' &&
      receipt.constitution.to === '1.1.0' &&
      receipt.retired_keys.length === 0 &&
      receipt.changed_files.length === 5 &&
      receipt.postchecks.length === 3 &&
      receipt.postchecks.every((item) => item.ok === true),
    'official upgrade receipt identity',
  );
  for (const item of receipt.changed_files)
    requireFact(
      generated.has(item.path) &&
        hash(generated.get(item.path)) === item.sha256,
      `receipt materialization: ${item.path}`,
    );
  const authority = mapping.authority_sources.map((item) =>
    source(root, item, ADOPTION),
  );
  const command = JSON.parse(authority[2]);
  requireFact(
    command.action_id === 'init upgrade' &&
      command.ok === true &&
      command.result.verdict === 'pass' &&
      JSON.stringify(command.result.value.receipt) === JSON.stringify(receipt),
    'registered command and receipt disagree',
  );
  requireFact(
    authority[0].toString().includes('ADR-0061') &&
      authority[1]
        .toString()
        .includes('## D-2 — Milestone 1 governed adoption and reassessment'),
    'source Architect/Owner decisions',
  );
  for (const item of mapping.dependencies) {
    const oldBytes = source(root, item.before, BEFORE);
    const newBytes = source(root, item.after, ADOPTION);
    if (item.after.path === 'package.json') {
      requireFact(
        JSON.parse(oldBytes).devDependencies['@aarusso-nyx/devai'] ===
          '2.6.3' &&
          JSON.parse(newBytes).devDependencies['@aarusso-nyx/devai'] ===
            '2.7.0',
        'exact provider dependency transition',
      );
      requireFact(
        JSON.parse(historical ? newBytes : current(root, 'package.json'))
          .devDependencies['@aarusso-nyx/devai'] === '2.7.0',
        'current provider dependency identity',
      );
    } else if (item.after.path === 'pnpm-lock.yaml') {
      requireFact(
        JSON.stringify(
          devaiLockIdentity(
            historical ? newBytes : current(root, 'pnpm-lock.yaml'),
          ),
        ) === JSON.stringify(devaiLockIdentity(newBytes)),
        'current DEVAI lock resolution identity',
      );
    }
  }
  const project = JSON.parse(generated.get('.devai/config/project.json'));
  requireFact(
    project.devai_version === '2.7.0' &&
      project.constitution.version === '1.1.0' &&
      project.constitution.sha256 ===
        hash(generated.get('.devai/pin/constitution.md')),
    'package/constitution materialization',
  );
  for (const item of mapping.preserved_sources)
    source(root, item, BEFORE, !historical);
  requireFact(
    JSON.parse(current(root, '.devai/config/invariant-producers.json')).bindings
      .length === 0 &&
      JSON.parse(current(root, 'law/policy/adopter-policy.json'))
        .invariant_producers.bindings.length === 0,
    'C6 bindings must remain empty',
  );
  return {
    manifest: UPGRADE_MANIFEST,
    manifest_sha256: UPGRADE_MANIFEST_SHA256,
    adoption_commit: ADOPTION,
    sealed_paths: [...GOVERNED_UPGRADE_PATHS],
    generated_files_verified: generated.size,
    native_verdict_replaced: false,
  };
}

const GENERATED_PATHS = Object.freeze([
  '.devai/config/project.json',
  '.devai/config/adopter-policy-binding.json',
  '.devai/config/authority-policy.json',
  '.devai/pin/constitution.md',
  '.devai/constitution.md',
  '.devai/config/upgrade-receipt.json',
]);
const PRESERVED_PATHS = Object.freeze([
  'law/policy/adopter-policy.json',
  '.devai/config/invariant-producers.json',
  '.devai/config/sensor-inputs.json',
  '.devai/config/thresholds.json',
]);
const AUTHORITY_PATHS = Object.freeze([
  'docs/meta/adr/ADR-0062-source-bound-governed-upgrade-compatibility.md',
  'docs/meta/decisions/rait.md',
  'work/rounds/R-0025/reports/D1-L-280/upgrade-write.json',
]);
const DEPENDENCY_HASHES = Object.freeze([
  {
    path: 'package.json',
    before: '9d7b629f840fea193214ee1ea2ef7655815fbacb942287bef2b31ffbfd229619',
    after: 'db2bce211046f1b3f1a32689f65f7c8ad2aa96730a6519451592a6e2e4933177',
  },
  {
    path: 'pnpm-lock.yaml',
    before: '93131ac3d4879adcdc9c883b912381d73f01a12648de3c1d1467ff761254fc27',
    after: 'c9dc443869890220e86cd3bcca7e1ef2e3fce25d7b9afc194d90881db803ed7d',
  },
]);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
function population(items, expected, label) {
  requireFact(
    Array.isArray(items) &&
      same(
        items.map((item) => item.path),
        expected,
      ),
    `${label} population`,
  );
}
function ancestor(root, before, after) {
  try {
    git(root, 'merge-base', '--is-ancestor', before, after);
  } catch {
    requireFact(false, `required adoption ancestry: ${before} -> ${after}`);
  }
}

function verifyV3(root, reference, baselineFiles) {
  const bytes = current(root, V3_UPGRADE_MANIFEST);
  requireFact(hash(bytes) === V3_UPGRADE_MANIFEST_SHA256, 'v3 manifest digest');
  const mapping = JSON.parse(bytes);
  requireFact(
    mapping.schemaVersion === '3.0.0' &&
      mapping.kind === 'detran-governed-upgrade-compatibility' &&
      mapping.authority === 'ADR-0062' &&
      mapping.native_verdict_replacement === false &&
      mapping.baseline_commit === BASELINE &&
      mapping.before_commit === V3_BEFORE &&
      mapping.adoption_commit === V3_ADOPTION &&
      mapping.v2_manifest_sha256 === UPGRADE_MANIFEST_SHA256 &&
      mapping.gate_a_scope_sha256 === GATE_A_SCOPE &&
      mapping.dependency_patch_sha256 === DEPENDENCY_PATCH,
    'finite v3 transition identity',
  );
  requireFact(
    same(mapping.provider, {
      from: '2.7.0',
      to: '2.8.0',
      constitution_from: '1.1.0',
      constitution_to: '1.2.0',
      published_source: '82ae9d9000d2ed71a7c38f4b3aa8f06bc2eabb2b',
      published_tree: 'c12b34faf9f7e1bb0db5d33046c817bd63605f3e',
      tar_sha256:
        'd63d2da92427ef8f5e947ca2fd72e14b393caaf6623275e7bffa0b89be15ec59',
      registry_integrity:
        'sha512-JeuRcppdvm3jCidDsas7mSsytnMYcf8apgTyPJAKEXJeLIK/kZu0CPxsdfRHueoqqSSilTeIE5m6p6VANJ/YNQ==',
    }),
    'published provider identity',
  );

  // Reuse every original v2 source/receipt/authority assertion. Its former
  // current-2.7 comparisons use authentic adoption objects only in this private
  // mode; the exported entry point exposes no waiver for a caller to select.
  verifyV2(root, reference, baselineFiles, true);
  const previous = JSON.parse(current(root, UPGRADE_MANIFEST));
  requireFact(
    mapping.v1_manifest_sha256 === previous.v1_manifest_sha256,
    'original v1 manifest changed',
  );
  for (const commit of [V3_BEFORE, V3_ADOPTION]) {
    requireFact(
      hash(git(root, 'show', `${commit}:${UPGRADE_MANIFEST}`)) ===
        UPGRADE_MANIFEST_SHA256 &&
        hash(
          git(
            root,
            'show',
            `${commit}:docs/meta/security/historical-compatibility.json`,
          ),
        ) === mapping.v1_manifest_sha256,
      'immutable v1/v2 manifest history',
    );
  }
  requireFact(
    same(
      git(root, 'rev-list', '--parents', '-n', '1', V3_ADOPTION)
        .toString()
        .trim()
        .split(/\s+/),
      [V3_ADOPTION, V3_BEFORE],
    ),
    'v3 adoption parent',
  );
  ancestor(root, ADOPTION, V3_BEFORE);
  ancestor(root, V3_ADOPTION, 'HEAD');

  population(
    mapping.sealed_transitions,
    GOVERNED_UPGRADE_PATHS,
    'sealed transition',
  );
  population(mapping.generated_files, GENERATED_PATHS, 'registered output');
  population(mapping.authority_sources, AUTHORITY_PATHS, 'authority source');
  population(mapping.preserved_sources, PRESERVED_PATHS, 'preserved source');
  requireFact(
    Array.isArray(mapping.dependencies) &&
      same(
        mapping.dependencies.map((item) => item.before.path),
        DEPENDENCY_HASHES.map((item) => item.path),
      ) &&
      same(
        mapping.dependencies.map((item) => item.after.path),
        DEPENDENCY_HASHES.map((item) => item.path),
      ),
    'dependency population',
  );
  for (const item of mapping.sealed_transitions) {
    const original = source(root, item.baseline, BASELINE);
    requireFact(
      item.path === item.baseline.path &&
        item.path === item.before.path &&
        item.path === item.after.path &&
        hash(original) === reference[item.path] &&
        baselineFiles.get(item.path)?.equals(original),
      `original preservation reference: ${item.path}`,
    );
    const prior = previous.sealed_transitions.find(
      (entry) => entry.path === item.path,
    );
    requireFact(
      source(root, item.before, V3_BEFORE).equals(
        source(root, prior.after, ADOPTION),
      ),
      `v2 to v3 historical link: ${item.path}`,
    );
    source(root, item.after, V3_ADOPTION, true);
  }
  const generated = new Map(
    mapping.generated_files.map((item) => [
      item.path,
      source(root, item, V3_ADOPTION, true),
    ]),
  );
  for (const item of mapping.sealed_transitions)
    requireFact(
      generated.get(item.path).equals(source(root, item.after, V3_ADOPTION)),
      `sealed/registered output correspondence: ${item.path}`,
    );

  const receipt = JSON.parse(
    generated.get('.devai/config/upgrade-receipt.json'),
  );
  requireFact(
    receipt.schemaVersion === '1.0.0' &&
      receipt.from === '2.7.0' &&
      receipt.to === '2.8.0' &&
      receipt.constitution.from === '1.1.0' &&
      receipt.constitution.to === '1.2.0' &&
      same(receipt.migrations, ['MIG-2.8.0-constitution-1-2-0']) &&
      same(receipt.retired_keys, []) &&
      receipt.postchecks.length === 3 &&
      same(
        receipt.postchecks.map((item) => item.name),
        [
          'policy-materialization-current',
          'authority-enforcement',
          'constitution-binding',
        ],
      ) &&
      receipt.postchecks.every((item) => item.ok === true),
    'official v3 upgrade receipt identity',
  );
  population(
    receipt.changed_files,
    GENERATED_PATHS.slice(0, 5),
    'receipt changed-file',
  );
  for (const item of receipt.changed_files)
    requireFact(
      item.operation === 'update' &&
        generated.has(item.path) &&
        hash(generated.get(item.path)) === item.sha256,
      `receipt materialization: ${item.path}`,
    );
  const authority = mapping.authority_sources.map((item) =>
    source(root, item, V3_ADOPTION),
  );
  const command = JSON.parse(authority[2]);
  requireFact(
    command.action_id === 'init upgrade' &&
      command.ok === true &&
      command.result.verdict === 'pass' &&
      same(command.result.value.receipt, receipt) &&
      command.result.value.receipt_path ===
        '.devai/config/upgrade-receipt.json',
    'registered command and receipt disagree',
  );
  const plan = command.result.value.plan;
  requireFact(
    plan.status === 'ready' &&
      plan.from === '2.7.0' &&
      plan.to === '2.8.0' &&
      same(plan.constitution, {
        bound: '1.1.0',
        installed: '1.2.0',
        rebind_requested: true,
      }) &&
      same(plan.retired_keys, []) &&
      same(plan.replaced_defaults, []) &&
      same(plan.refusals, []) &&
      same(
        plan.segments.filter((item) => item.run).map((item) => item.segment),
        ['constitution', 'adopter-policy', 'authority'],
      ) &&
      same(
        [...plan.changed_files.map((item) => item.path)].sort(),
        [...GENERATED_PATHS.slice(0, 5)].sort(),
      ) &&
      plan.changed_files.every((item) => item.operation === 'update'),
    'registered finite v3 upgrade plan',
  );
  requireFact(
    authority[0]
      .toString()
      .includes('## Addendum — D1-L Gate A, DEVAI 2.8.0') &&
      authority[0].toString().includes(GATE_A_SCOPE) &&
      authority[1]
        .toString()
        .includes(
          'Approve D1-L Gate A scope SHA256 ' + GATE_A_SCOPE + ' as written.',
        ),
    'source Architect/Owner decisions',
  );
  mapping.dependencies.forEach((item, index) => {
    const expected = DEPENDENCY_HASHES[index];
    const oldBytes = source(root, item.before, V3_BEFORE);
    const newBytes = source(root, item.after, V3_ADOPTION, true);
    requireFact(
      hash(oldBytes) === expected.before && hash(newBytes) === expected.after,
      `exact approved dependency patch: ${expected.path}`,
    );
    if (expected.path === 'package.json')
      requireFact(
        JSON.parse(oldBytes).devDependencies['@aarusso-nyx/devai'] ===
          '2.7.0' &&
          JSON.parse(newBytes).devDependencies['@aarusso-nyx/devai'] ===
            '2.8.0',
        'exact provider dependency transition',
      );
  });
  const project = JSON.parse(generated.get('.devai/config/project.json'));
  requireFact(
    project.devai_version === '2.8.0' &&
      project.constitution.version === '1.2.0' &&
      project.constitution.sha256 ===
        hash(generated.get('.devai/pin/constitution.md')),
    'package/constitution materialization',
  );
  for (const item of mapping.preserved_sources)
    source(root, item, V3_BEFORE, true);
  requireFact(
    JSON.parse(current(root, '.devai/config/invariant-producers.json')).bindings
      .length === 0 &&
      JSON.parse(current(root, 'law/policy/adopter-policy.json'))
        .invariant_producers.bindings.length === 0,
    'C6 bindings must remain empty',
  );
  return {
    manifest: V3_UPGRADE_MANIFEST,
    manifest_sha256: V3_UPGRADE_MANIFEST_SHA256,
    adoption_commit: V3_ADOPTION,
    sealed_paths: [...GOVERNED_UPGRADE_PATHS],
    generated_files_verified: generated.size,
    native_verdict_replaced: false,
  };
}

export function verifyGovernedUpgradeCompatibility(
  root,
  reference,
  baselineFiles,
) {
  // lstat notices dangling links too: a malformed v3 map cannot select v2 by
  // pretending that no forward map exists.
  if (
    fs.lstatSync(path.join(root, V3_UPGRADE_MANIFEST), {
      throwIfNoEntry: false,
    })
  )
    return verifyV3(root, reference, baselineFiles);
  return verifyV2(root, reference, baselineFiles);
}
