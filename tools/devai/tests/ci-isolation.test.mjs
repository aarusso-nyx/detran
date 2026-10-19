import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dependency = createRequire(
  realpathSync(path.join(root, 'node_modules/@aarusso-nyx/devai/package.json')),
);
const YAML = dependency('yaml');
const workflow = (name) => {
  const document = YAML.parseDocument(
    readFileSync(path.join(root, `.github/workflows/${name}.yml`), 'utf8'),
    { uniqueKeys: true },
  );
  assert.deepEqual(
    document.errors,
    [],
    `${name}: ${document.errors.map((error) => error.message).join('\n')}`,
  );
  return document.toJS();
};
const actions = (value) =>
  Object.values(value.jobs)
    .flatMap((job) => job.steps ?? [])
    .filter((step) => step.uses);
const steps = (job) => job.steps.map((step) => step.run ?? '').join('\n');
const findStep = (job, name) => {
  const found = job.steps.find((step) => step.name === name);
  assert.ok(found, `Missing step: ${name}`);
  return found;
};

// Contract tests for the actual YAML and this deliberately small expression subset.
// They do not claim to emulate GitHub's scheduler, contexts or branch protection.
test('CI and generated verifier YAML reject duplicate keys and invalid syntax', () => {
  workflow('ci');
  workflow('devai-local-rc-verify');
});

test('CI remains present on every PR and main push with no content filters', () => {
  const ci = workflow('ci');
  assert.deepEqual(Object.keys(ci.on).sort(), [
    'pull_request',
    'push',
    'workflow_dispatch',
  ]);
  assert.deepEqual(ci.on.push.branches, ['main']);
  for (const [event, config] of Object.entries(ci.on)) {
    for (const key of ['paths', 'paths-ignore', 'branches-ignore'])
      assert.equal(config?.[key], undefined, `${event}.${key}`);
  }
  assert.equal(ci.on.pull_request?.branches, undefined);
  assert.equal(ci.on.pull_request?.types, undefined);
  assert.equal(ci.permissions.contents, 'read');
});

test('workflow and ref keys isolate unrelated workflows and refs while superseding the same candidate', () => {
  const concurrency = workflow('ci').concurrency;
  assert.equal(concurrency['cancel-in-progress'], true);
  assert.match(concurrency.group, /\$\{\{\s*github\.workflow\s*\}\}/);
  assert.match(concurrency.group, /\$\{\{\s*github\.ref\s*\}\}/);
  const group = (name, ref) =>
    concurrency.group
      .replace(/\$\{\{\s*github\.workflow\s*\}\}/g, name)
      .replace(/\$\{\{\s*github\.ref\s*\}\}/g, ref);
  const first = group('DETRAN CI', 'refs/pull/200/merge');
  assert.equal(first, group('DETRAN CI', 'refs/pull/200/merge'));
  assert.notEqual(first, group('DETRAN CI', 'refs/pull/201/merge'));
  assert.notEqual(first, group('Another workflow', 'refs/pull/200/merge'));
});

test('all third-party actions stay immutable and checkout/setup-node converge with the protected verifier', () => {
  const ci = workflow('ci'),
    verifier = workflow('devai-local-rc-verify');
  for (const step of [...actions(ci), ...actions(verifier)])
    assert.match(step.uses, /^[^@]+@[a-f0-9]{40}$/);
  for (const action of ['actions/checkout', 'actions/setup-node']) {
    const revisions = new Set(
      [...actions(ci), ...actions(verifier)]
        .filter((step) => step.uses.startsWith(`${action}@`))
        .map((step) => step.uses),
    );
    assert.equal(revisions.size, 1, `${action} revisions drifted`);
  }
});

test('existing CI gate identities and candidate verified-local-rc publishing are preserved', () => {
  const ci = workflow('ci');
  for (const name of [
    'evidence-gate',
    'foundation',
    'backend-kernel-full',
    'boat-documents-real',
    'senatran-mock',
    'senatran-mock-tests',
  ])
    assert.ok(ci.jobs[name], `Missing existing gate ${name}`);
  assert.equal(ci.jobs['backend-kernel-full'].name, 'backend-kernel');
  assert.match(
    steps(ci.jobs['backend-kernel-full']),
    /--arg name verified-local-rc/,
  );
  const published = findStep(
    workflow('devai-local-rc-verify').jobs['verify-attested-rc'],
    'Publish candidate check',
  );
  assert.match(published.run, /--arg name verified-local-rc/);
  assert.match(published.run, /--arg head_sha "\$CANDIDATE_SHA"/);
});

test('nine invariant semantic producers execute unconditionally with isolated database services', () => {
  const job = workflow('ci').jobs['invariant-producers'];
  assert.ok(job);
  assert.equal(job.if, undefined);
  assert.notEqual(job['continue-on-error'], true);
  assert.match(
    job.services.postgres.image,
    /^postgis\/postgis@sha256:[a-f0-9]{64}$/,
  );
  assert.match(job.services.postgres.options, /pg_isready/);
  for (const key of [
    'DATABASE_URL',
    'STYNX_OWNER_DATABASE_URL',
    'STYNX_APP_DATABASE_URL',
    'STYNX_READER_DATABASE_URL',
  ])
    assert.match(job.env[key], /localhost:5432/);
  assert.match(job.env.STYNX_APP_DATABASE_URL, /role_app_backend/);
  assert.match(job.env.STYNX_READER_DATABASE_URL, /role_app_backend/);
  const commands = job.steps.filter((step) => step.run).map((step) => step.run);
  for (const required of [
    'bash backend/database/apply.sh --full',
    'bash backend/database/seed.sh',
    'pnpm backend:test:prepare-legacy',
  ])
    assert.ok(commands.includes(required), required);
  const descriptor = JSON.parse(
    readFileSync(path.join(root, 'test-tasks.json'), 'utf8'),
  );
  const tasks = descriptor.tasks.filter((task) =>
    task.nodeId.startsWith('invariant-'),
  );
  assert.equal(tasks.length, 9);
  assert.deepEqual(tasks.map((task) => task.nodeId).sort(), [
    'invariant-ch',
    'invariant-dash',
    'invariant-errors',
    'invariant-est',
    'invariant-inf',
    'invariant-ops-perf',
    'invariant-ops-queue',
    'invariant-portal',
    'invariant-rbac',
  ]);
  for (const task of tasks) {
    const step = job.steps.find(
      (candidate) => candidate.run === task.argv.join(' '),
    );
    assert.ok(step, `No exact native producer for ${task.nodeId}`);
    assert.equal(step.if, undefined);
    assert.notEqual(step['continue-on-error'], true);
    assert.equal(task.argv[0], 'detran-native-vitest');
    assert.ok(task.argv.includes('@aarusso-nyx/devai/native-vitest-reporter'));
  }
});

test('foundation propagates every non-success producer result instead of silently skipping', () => {
  const job = workflow('ci').jobs.foundation;
  const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
  for (const required of ['evidence-gate', 'invariant-producers'])
    assert.ok(needs.includes(required));
  assert.equal(job.if.replace(/\s/g, ''), '${{!cancelled()}}');
  const guard = job.steps[0];
  assert.match(guard.run, /exit 1/);
  assert.notEqual(guard['continue-on-error'], true);
  const expression = guard.if.replace(/^\$\{\{\s*|\s*\}\}$/g, '');
  const atoms = expression.split(/\s*\|\|\s*/).map((atom) => {
    const match = /^needs\.([a-z-]+)\.result\s*!=\s*'success'$/.exec(
      atom.trim(),
    );
    assert.ok(match, `Unsupported fail-closed guard atom: ${atom}`);
    return match[1];
  });
  for (const required of ['evidence-gate', 'invariant-producers'])
    assert.ok(atoms.includes(required));
  for (const outcome of [
    'failure',
    'skipped',
    'cancelled',
    'timed_out',
    'action_required',
  ]) {
    for (const failed of ['evidence-gate', 'invariant-producers']) {
      const results = Object.fromEntries(
        atoms.map((key) => [key, key === failed ? outcome : 'success']),
      );
      assert.equal(
        atoms.some((key) => results[key] !== 'success'),
        true,
        `${failed} ${outcome} must make foundation red`,
      );
    }
  }
  assert.equal(
    atoms.some(() => 'success' !== 'success'),
    false,
  );
});

test('protected control edits force remote execution before an exact-tree claim can be selected', () => {
  const job = workflow('ci').jobs['evidence-gate'];
  const selector = findStep(
    job,
    'Select exact-tree attested evidence route',
  ).run;
  assert.match(selector, /set -euo pipefail/);
  assert.match(selector, /evidence_mode=false/);
  for (const pattern of [
    '.github/*',
    '.devai/config/*',
    'law/policy/*',
    'test-tasks.json',
    'package.json',
    'pnpm-lock.yaml',
    'tools/ci/*',
  ])
    assert.ok(selector.includes(pattern), pattern);
  assert.match(selector, /protected=true/);
  assert.match(
    selector,
    /if test "\$protected" = true; then[\s\S]*?exit 0[\s\S]*?fi/,
  );
  assert.ok(
    selector.indexOf('if test "$protected" = true') <
      selector.indexOf('tree="$(git rev-parse'),
  );
  assert.match(selector, /HEAD_SHA\}\^\{tree\}/);
  assert.match(selector, /tag="devai-local-evidence\/\$\{tree\}"/);
  assert.match(selector, /git ls-remote --tags origin/);
});

test('generated verifier serializes the exact candidate and checks protected main controls as inert inputs', () => {
  const verifier = workflow('devai-local-rc-verify');
  assert.equal(verifier.concurrency['cancel-in-progress'], false);
  assert.match(
    verifier.concurrency.group,
    /inputs\.candidate_sha\s*\|\|\s*github\.sha/,
  );
  assert.equal(
    verifier.env.CANDIDATE_SHA,
    '${{ inputs.candidate_sha || github.sha }}',
  );
  assert.deepEqual(verifier.on.push.branches, ['main']);
  assert.equal(
    verifier.on.workflow_dispatch.inputs.candidate_sha.required,
    true,
  );
  const job = verifier.jobs['verify-attested-rc'];
  const candidate = findStep(job, 'Check out candidate as inert data');
  assert.equal(candidate.with.ref, '${{ env.CANDIDATE_SHA }}');
  assert.equal(candidate.with.path, 'candidate');
  assert.equal(candidate.with['persist-credentials'], false);
  const control = findStep(job, 'Check out default-branch controls');
  assert.equal(control.with.ref, 'main');
  assert.equal(control.with.path, 'control');
  assert.equal(control.with['persist-credentials'], false);
  assert.doesNotMatch(
    steps(job),
    /pnpm (?:install|ci:backend)|npm (?:ci|install)|node candidate\//,
  );
});

test('attestation binds commit tree policy trust and failure outcome without remote fallback', () => {
  const job = workflow('devai-local-rc-verify').jobs['verify-attested-rc'];
  const bind = findStep(job, 'Bind candidate and protected evidence tag').run;
  assert.match(
    bind,
    /test "\$\(git -C candidate rev-parse HEAD\)" = "\$CANDIDATE_SHA"/,
  );
  assert.match(bind, /devai-local-evidence\/\$tree/);
  const verify = findStep(job, 'Verify complete trusted local RC bundle');
  for (const token of [
    '--trust control/law/policy/devai-local-rc-trust-store.json',
    '--commit "$CANDIDATE_SHA"',
    '--tree "${{ steps.identity.outputs.tree }}"',
    '--policy-digest "${{ steps.policy.outputs.digest }}"',
    '--binding "${{ steps.identity.outputs.binding }}"',
  ])
    assert.ok(verify.run.includes(token), token);
  const publish = findStep(job, 'Publish candidate check');
  assert.equal(publish.if, 'always()');
  assert.match(publish.run, /conclusion=failure/);
  assert.match(
    publish.run,
    /test "\$VERIFY_OUTCOME" != success \|\| conclusion=success/,
  );
  const enforce = findStep(job, 'Enforce verification result');
  assert.equal(enforce.if, 'always()');
  assert.equal(enforce.run, 'test "$VERIFY_OUTCOME" = success');
  assert.notEqual(enforce['continue-on-error'], true);
  const materialize = findStep(
    job,
    'Materialize protected DEVAI verifier package',
  ).run;
  assert.match(materialize, /DEVAI_VERIFIER_PACKAGE_INTEGRITY_INVALID/);
  assert.match(materialize, /actual_provenance_sha256/);
  assert.match(
    materialize,
    /test "\$actual_provenance_sha256" = "\$VERIFIER_PROVENANCE_SHA256"/,
  );
});
