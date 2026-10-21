import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

// Closed ordinary-CI workloads are independent of deferred native task activation.
// Counts identify the preserved collection snapshot; this contract does not measure
// live test execution or grant native custody. Exact config bytes preserve complete
// selectors, timeout/assertion controls and runner semantics pending reviewed changes.
const ordinaryInvariantSuites = [
  {
    nodeId: 'invariant-ch',
    config: './tools/security/invariants/ch.config.mjs',
    configSha256:
      '67c334912ecfb810dcbf10ea1aef264e0361ddfda6db6283cd48df069aedc6c2',
    executableFiles: [
      'backend/domains/ch/encounters/tests/unit/encounter-lifecycle.service.spec.ts',
    ],
    observedOrdinaryCases: 11,
  },
  {
    nodeId: 'invariant-dash',
    config: './tools/security/invariants/dash.config.mjs',
    configSha256:
      'd7d064bd978985961df7dc938b6d45736e4d0bc5ac2354d15a7080ae861d944f',
    executableFiles: ['backend/domains/shared/src/policy.spec.ts'],
    observedOrdinaryCases: 729,
  },
  {
    nodeId: 'invariant-est',
    config: './tools/security/invariants/est.config.mjs',
    configSha256:
      'a5e22b181c50cda32f042d8353e9765037170eb247484f880e92f1586e8093c9',
    executableFiles: [
      'backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts',
    ],
    observedOrdinaryCases: 21,
  },
  {
    nodeId: 'invariant-inf',
    config: './tools/security/invariants/inf.config.mjs',
    configSha256:
      'd0c721686841013950b796b6f03dfe3102e7c2e26180ceb884788be33f111bd3',
    executableFiles: [
      'backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts',
    ],
    observedOrdinaryCases: 7,
  },
  {
    nodeId: 'invariant-ops-queue',
    config: './tools/security/invariants/ops-queue.config.mjs',
    configSha256:
      '36ff426c62304c92c200447eed5b2d8483eb2d5f1d5cdd8b1976bc7dec5cb357',
    executableFiles: [
      'backend/domains/ops/field/tests/integration/shift-lifecycle.integration.spec.ts',
    ],
    observedOrdinaryCases: 8,
  },
  {
    nodeId: 'invariant-ops-perf',
    config: './tools/security/invariants/ops-perf.config.mjs',
    configSha256:
      'd7994027c07dd52f97fdfa9591b3637b46d1581ab920fc3b03bf49a2f137b34e',
    executableFiles: [
      'backend/app/tests/performance/backend-baseline.perf.spec.ts',
    ],
    observedOrdinaryCases: 3,
  },
  {
    nodeId: 'invariant-portal',
    config: './tools/security/invariants/portal.config.mjs',
    configSha256:
      '084d954d0fb6e2d01921cfe6771832b03bd95a5718c8c2d9c64bd7e350ed1436',
    executableFiles: [
      'backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts',
    ],
    observedOrdinaryCases: 3,
  },
  {
    nodeId: 'invariant-rbac',
    config: './tools/security/invariants/rbac.config.mjs',
    configSha256:
      '330d2236abbbb038648bf09f858c6f99c07300ef2562f064925bdbc83f343ec0',
    executableFiles: [
      'backend/domains/shared/src/policy.guard.spec.ts',
      'backend/domains/shared/src/policy.spec.ts',
    ],
    observedOrdinaryCases: 736,
  },
  {
    nodeId: 'invariant-errors',
    config: './tools/security/invariants/errors.config.mjs',
    configSha256:
      'b3c970f0b72eeaa4528a9246734f1adbe24c73373a18f9e25650a19aa8847889',
    executableFiles: ['backend/domains/shared/src/errors/detran-error.spec.ts'],
    observedOrdinaryCases: 13,
  },
];
const ordinaryInvariantSourceSha256 = {
  'backend/app/tests/performance/backend-baseline.perf.spec.ts':
    'a88d8c75e0713625ee82180d9630ed10003c3e3489af6a732af05000b8929ce8',
  'backend/domains/ch/encounters/tests/unit/encounter-lifecycle.service.spec.ts':
    '150669f981594342a7659ac0594821f5b52834b38b9ee6a1af584a7e59028542',
  'backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts':
    'd6b983317344d89c36ff5308746a1dedc063c89fb2707c3145f5bc96c11d55ae',
  'backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts':
    '4abc079d96053f54c22c18584ba98fa1061db5dfb35e69650e1c73a280477fff',
  'backend/domains/ops/field/tests/integration/shift-lifecycle.integration.spec.ts':
    'bc2682cd0d5026191891d6230433d2bcb30c65367764ac58120a50d3b13122d1',
  'backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts':
    '6378dbcf29b3723f13ae478ff874e23ef184fdd65cc5be731e76d50716b2fa34',
  'backend/domains/shared/src/errors/detran-error.spec.ts':
    '03e27a96be011515985ecb86af0a1e83e8b79178cd27839f34d6a14bce120cec',
  'backend/domains/shared/src/policy.guard.spec.ts':
    'a1db0b75aeb9a5a8a6c2a8d62dfc03b32d242d314c86376025f138a0419117c4',
  'backend/domains/shared/src/policy.spec.ts':
    'b6287410e09a48eb93924183f5e1623a519ff98bb5b26713c5b26d0b97194bb1',
};
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

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
  const aliasSteps = job.steps.filter((step) =>
    step.run?.includes('node tools/security/install-native-vitest.mjs '),
  );
  assert.equal(aliasSteps.length, 1);
  assert.equal(aliasSteps[0].if, undefined);
  assert.notEqual(aliasSteps[0]['continue-on-error'], true);
  assert.equal(
    aliasSteps[0].run.trim(),
    [
      'node tools/security/install-native-vitest.mjs "$RUNNER_TEMP/detran-native-bin"',
      'echo "$RUNNER_TEMP/detran-native-bin" >> "$GITHUB_PATH"',
    ].join('\n'),
  );
  assert.equal(Object.hasOwn(job.env, 'DEVAI_NATIVE_COLLECTION_NONCE'), false);
  assert.equal(ordinaryInvariantSuites.length, 9);
  const actualCommands = commands.filter((command) =>
    command.startsWith('detran-native-vitest run '),
  );
  const expectedCommands = ordinaryInvariantSuites.map(
    ({ config }) =>
      `detran-native-vitest run --config ${config} --configLoader native --reporter @aarusso-nyx/devai/native-vitest-reporter`,
  );
  assert.deepEqual([...actualCommands].sort(), [...expectedCommands].sort());
  for (const suite of ordinaryInvariantSuites) {
    const command = expectedCommands[ordinaryInvariantSuites.indexOf(suite)];
    const matching = job.steps.filter((candidate) => candidate.run === command);
    assert.equal(
      matching.length,
      1,
      `Exactly one ordinary suite: ${suite.nodeId}`,
    );
    assert.equal(matching[0].if, undefined);
    assert.notEqual(matching[0]['continue-on-error'], true);
    assert.equal(
      sha256(readFileSync(path.join(root, suite.config))),
      suite.configSha256,
      `Complete config population/control changed: ${suite.nodeId}`,
    );
    for (const file of suite.executableFiles)
      assert.equal(
        sha256(readFileSync(path.join(root, file))),
        ordinaryInvariantSourceSha256[file],
        `Complete semantic suite source changed: ${file}`,
      );
  }
});

test('whole native activation is deferred while the original seven task declarations and rc profile stay exact', () => {
  const bytes = readFileSync(path.join(root, 'test-tasks.json'));
  // Canonical main c582/207642 has these exact original seven declaration bytes.
  assert.equal(
    sha256(bytes),
    '752c6105900f752bae1b276f8b0282f501f139777615e5704ba733595ed5fbad',
  );
  const descriptor = JSON.parse(bytes);
  assert.deepEqual(
    descriptor.tasks.map(({ nodeId }) => nodeId),
    [
      'backend-kernel',
      'scorecard-migration',
      'scorecard-unit',
      'scorecard-integration',
      'scorecard-e2e',
      'scorecard-typecheck',
      'scorecard-performance',
    ],
  );
  assert.deepEqual(descriptor.profiles, [
    { profileId: 'rc', mode: 'fixed', requiredNodes: ['backend-kernel'] },
  ]);
  const policy = JSON.parse(
    readFileSync(path.join(root, 'law/policy/adopter-policy.json'), 'utf8'),
  );
  assert.equal(Object.hasOwn(policy, 'invariant_producers'), false);
  for (const id of [
    'INV-CH-001',
    'INV-DASH-001',
    'INV-EST-001',
    'INV-INF-001',
    'INV-OPS-001',
    'INV-OPS-002',
    'INV-PORTAL-001',
    'INV-RBAC-001',
    'INV-API-001',
  ]) {
    const invariant = JSON.parse(
      readFileSync(path.join(root, `law/invariants/${id}.json`), 'utf8'),
    );
    assert.equal(Object.hasOwn(invariant, 'measurable_via'), false, id);
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
