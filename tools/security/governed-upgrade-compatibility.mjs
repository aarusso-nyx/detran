import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

// One additive reviewed transition. Neither caller data nor CLI flags extend it.
export const GOVERNED_UPGRADE_PATHS = Object.freeze([
  '.devai/config/project.json',
  '.devai/pin/constitution.md',
]);
export const UPGRADE_MANIFEST =
  'docs/meta/security/governed-upgrade-compatibility-v2.json';
export const UPGRADE_MANIFEST_SHA256 =
  '62fc9d193fb03c72e5fcf48c517da20f7458431cdb48724d0082c33352cdf1d0';
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

export function verifyGovernedUpgradeCompatibility(
  root,
  reference,
  baselineFiles,
) {
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
    source(root, item.after, ADOPTION, true);
  }
  const generated = new Map(
    mapping.generated_files.map((item) => [
      item.path,
      source(root, item, ADOPTION, true),
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
        JSON.parse(current(root, 'package.json')).devDependencies[
          '@aarusso-nyx/devai'
        ] === '2.7.0',
        'current provider dependency identity',
      );
    } else if (item.after.path === 'pnpm-lock.yaml') {
      requireFact(
        JSON.stringify(devaiLockIdentity(current(root, 'pnpm-lock.yaml'))) ===
          JSON.stringify(devaiLockIdentity(newBytes)),
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
    source(root, item, BEFORE, true);
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
