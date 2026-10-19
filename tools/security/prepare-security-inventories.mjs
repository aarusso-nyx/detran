// Artifact-production gate only: preserve native readiness, require complete execution.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const inventoryProducerArgv = Object.freeze([
  'exec',
  'devai',
  'sense',
  'run',
  'inventory_regeneration',
  '--as-role',
  'architect',
  '--write',
  '--format',
  'json',
]);
const kinds = Object.freeze([
  'inventory_api',
  'inventory_routes',
  'inventory_data_model',
  'inventory_rbac',
  'inventory_data_handling',
  'inventory_dep_graph',
  'inventory_coverage',
]);
const canonicalCommand = 'devai sense run inventory_regeneration';
const bodyContracts = Object.freeze([
  {
    kind: 'inventory_api',
    file: 'inventory_api/api-map.json',
    metric: 'endpoints_hash',
  },
  {
    kind: 'inventory_data_model',
    file: 'inventory_data_model/data-model.json',
    metric: 'tables_hash',
  },
  {
    kind: 'inventory_data_handling',
    file: 'inventory_data_handling/data-model-pii.json',
    metric: 'data_handling_hash',
  },
]);
// Exact DEVAI 2.6.3 producer projections, release-host.js API/data-model/data-handling.
// Preserve producer array order; full serialized body SHA additionally binds all fields.
function producerDigest(kind, body) {
  if (kind === 'inventory_api')
    return hash(
      JSON.stringify(
        body.endpoints.map((e) => [
          e.method,
          e.path,
          e.controller.file,
          e.controller.methodName ?? '',
        ]),
      ),
    );
  if (kind === 'inventory_data_model')
    return hash(
      JSON.stringify(
        body.tables.map((t) => [t.name, t.columns.map((c) => c.name)]),
      ),
    );
  return hash(
    JSON.stringify(
      body.tables.flatMap((t) =>
        t.columns.map((c) => [t.name, c.name, c.pii_class ?? '']),
      ),
    ),
  );
}

function requireFact(condition, message) {
  if (!condition) throw new Error(`Inventory generation refused: ${message}`);
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const same = (actual, expected) =>
  JSON.stringify(actual) === JSON.stringify(expected);
const sha = (value) =>
  typeof value === 'string' && /^[0-9a-f]{64}$/u.test(value);

/** Pure validation. This never changes a reading, accepts readiness FAIL, or emits evidence. */
export function validateInventoryGeneration(child, candidate) {
  requireFact(
    candidate?.clean === true &&
      /^[0-9a-f]{40}$/u.test(candidate.head) &&
      /^[0-9a-f]{40}$/u.test(candidate.tree),
    'clean exact HEAD/tree required',
  );
  requireFact(
    !child.error && child.signal == null && [0, 1].includes(child.status),
    'child process failed, interrupted, or has unsupported exit',
  );
  requireFact(
    typeof child.stdout === 'string' && typeof child.stderr === 'string',
    'complete raw process streams required',
  );
  let envelope;
  try {
    envelope = JSON.parse(child.stdout);
  } catch {
    throw new Error(
      'Inventory generation refused: malformed native JSON envelope',
    );
  }
  requireFact(
    envelope?.schemaVersion === '1.0.0' &&
      envelope.action_id === 'sense run' &&
      envelope.ok === true,
    'native action envelope is not successful',
  );
  const result = envelope.result,
    value = result?.value;
  requireFact(
    result?.media_type === 'application/json' &&
      value?.execution_status === 'pass',
    'native execution did not pass',
  );
  const readiness = value.readiness_status;
  requireFact(
    ['pass', 'review'].includes(readiness) && result.verdict === readiness,
    'readiness FAIL/UNKNOWN or inconsistent verdict',
  );
  const expectedExit = readiness === 'pass' ? 0 : 1;
  requireFact(
    child.status === expectedExit &&
      value.exit_code === expectedExit &&
      value.ok === (readiness === 'pass'),
    'exit/standing envelope disagrees',
  );
  requireFact(
    value.dry_run === false &&
      same(value.selection, {
        type: 'kind',
        value: 'inventory_regeneration',
      }) &&
      same(value.executed, ['inventory_regeneration']) &&
      same(value.excluded, []),
    'wrong, dry, missing, or excluded execution',
  );
  requireFact(
    value.applicable_count === 1 &&
      value.na_count === 0 &&
      value.aggregate_effect === 'harness-write' &&
      value.implicit_persistence === false,
    'unexpected execution population or persistence',
  );
  const counts = value.counts;
  requireFact(
    counts &&
      ['pass', 'review', 'fail', 'unknown', 'na', 'error'].every(
        (key) => Number.isInteger(counts[key]) && counts[key] >= 0,
      ) &&
      counts.fail === 0 &&
      counts.unknown === 0 &&
      counts.na === 0 &&
      counts.error === 0 &&
      counts.pass === (readiness === 'pass' ? 1 : 0) &&
      counts.review === (readiness === 'review' ? 1 : 0),
    'error, unknown, or inconsistent result counts',
  );
  requireFact(
    Array.isArray(value.members) &&
      value.members.length === 1 &&
      value.members[0].kind === 'inventory_regeneration' &&
      value.members[0].effect === 'harness-write' &&
      value.members[0].consent?.write === true &&
      value.members[0].consent?.publish === false,
    'registered write consent/member missing',
  );
  requireFact(
    Array.isArray(value.results) && value.results.length === 1,
    'exactly one native result required',
  );
  const member = value.results[0];
  requireFact(
    member.command === canonicalCommand &&
      member.status === expectedExit &&
      member.na === false &&
      member.stderr === '' &&
      typeof member.stdout === 'string',
    'native producer result failed or disagrees',
  );
  let reading;
  try {
    reading = JSON.parse(member.stdout);
  } catch {
    throw new Error(
      'Inventory generation refused: malformed native sensor reading',
    );
  }
  requireFact(
    reading?.schemaVersion === '1.0.0' &&
      reading.sensor?.kind === 'inventory_regeneration' &&
      reading.command === canonicalCommand &&
      reading.status === readiness &&
      reading.deterministic === true &&
      sha(reading.command_hash),
    'invalid or inconsistent native regeneration reading',
  );
  requireFact(
    Array.isArray(reading.findings) &&
      reading.findings.every((finding) =>
        ['info', 'warning'].includes(finding.severity),
      ),
    'native producer reports an error finding',
  );
  const metrics = reading.metrics;
  requireFact(
    metrics &&
      metrics.required_kinds === 7 &&
      metrics.missing_required_kinds === 0 &&
      metrics.error_count === 0 &&
      metrics.kinds_touched === 7 &&
      Number.isInteger(metrics.kinds_rebuilt) &&
      Number.isInteger(metrics.kinds_up_to_date) &&
      metrics.kinds_rebuilt >= 0 &&
      metrics.kinds_up_to_date >= 0 &&
      metrics.kinds_rebuilt + metrics.kinds_up_to_date === 7,
    'partial, missing, errored, or unmeasured body generation',
  );
  requireFact(
    kinds.every((kind) =>
      ['pass', 'review'].includes(metrics[`${kind}_status`]),
    ),
    'a required inventory producer has FAIL/UNKNOWN/missing standing',
  );
  requireFact(
    metrics.integration_head === candidate.head &&
      metrics.integration_tree === candidate.tree &&
      sha(metrics.inventory_body_sha256),
    'inventory provenance differs from exact HEAD/tree',
  );
  const bodies = bodyContracts.map((contract) => {
    const bodySha256 = metrics[`${contract.kind}_input_sha256`];
    const producerSha256 =
      metrics[`${contract.kind}_metric_${contract.metric}`];
    requireFact(
      sha(bodySha256) && sha(producerSha256),
      `native body/projection hashes missing for ${contract.kind}`,
    );
    return Object.freeze({ ...contract, bodySha256, producerSha256 });
  });
  return Object.freeze({
    bodies: Object.freeze(bodies),
    readiness,
    nativeExit: child.status,
    readingId: reading.id,
    head: metrics.integration_head,
    tree: metrics.integration_tree,
    inventoryBodySha256: metrics.inventory_body_sha256,
    producedKinds: 7,
  });
}
function git(root, argv) {
  const result = spawnSync('git', argv, { cwd: root, encoding: 'utf8' });
  if (result.error || result.status !== 0)
    throw new Error(`Cannot establish candidate identity: git ${argv[0]}`);
  return result.stdout.trim();
}
function identity(root) {
  return {
    head: git(root, ['rev-parse', 'HEAD']),
    tree: git(root, ['rev-parse', 'HEAD^{tree}']),
    clean:
      git(root, ['status', '--porcelain', '--untracked-files=normal']) === '',
  };
}
/** I/O orchestration seam for tests; the CLI always supplies only its fixed repository root. */
export function runInventoryPreparation(root, dependencies = {}) {
  const readIdentity = dependencies.readIdentity ?? identity;
  const runChild =
    dependencies.runChild ??
    ((argv, options) => spawnSync('pnpm', argv, options));
  const createCapture =
    dependencies.createCapture ??
    (() => mkdtempSync(path.join(os.tmpdir(), 'detran-security-inventories-')));
  const stdoutSink =
    dependencies.stdoutSink ?? ((text) => process.stdout.write(text));
  const stderrSink =
    dependencies.stderrSink ?? ((text) => process.stderr.write(text));
  const announce = dependencies.announce ?? ((text) => console.log(text));
  const candidate = readIdentity(root);
  requireFact(
    candidate.clean,
    'working tree differs from HEAD before generation',
  );
  const capture = createCapture();
  const child = runChild([...inventoryProducerArgv], {
    cwd: root,
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const stdout = child.stdout ?? '',
    stderr = child.stderr ?? '';
  // Full raw native streams survive every subsequent validation failure.
  writeFileSync(path.join(capture, 'native.stdout.json'), stdout);
  writeFileSync(path.join(capture, 'native.stderr.log'), stderr);
  writeFileSync(
    path.join(capture, 'process.json'),
    JSON.stringify(
      {
        argv: ['pnpm', ...inventoryProducerArgv],
        status: child.status,
        signal: child.signal,
        error: child.error?.message ?? null,
        candidate,
      },
      null,
      2,
    ) + '\n',
  );
  stdoutSink(stdout);
  stderrSink(stderr);
  announce(`\nSECURITY_INVENTORY_RAW_CAPTURE=${capture}`);
  const admission = validateInventoryGeneration(
    { ...child, stdout, stderr },
    candidate,
  );
  requireFact(
    same(readIdentity(root), candidate),
    'candidate changed during generation',
  );
  const inventoryBytes = readFileSync(
    path.join(root, '.devai/state/inventory/inventory.json'),
  );
  const inventory = JSON.parse(inventoryBytes);
  requireFact(
    hash(inventoryBytes) === admission.inventoryBodySha256 &&
      inventory.integration_head === candidate.head,
    'generated manifest body/hash is stale or missing',
  );
  requireFact(
    typeof inventory.generated_at === 'string' &&
      Number.isFinite(Date.parse(inventory.generated_at)),
    'generated manifest timestamp is absent or invalid',
  );
  for (const contract of admission.bodies) {
    const bytes = readFileSync(
      path.join(root, '.devai/state/sensors', contract.file),
    );
    requireFact(
      hash(bytes) === contract.bodySha256,
      `generated body bytes differ from native metric: ${contract.kind}`,
    );
    const body = JSON.parse(bytes);
    requireFact(
      body.schemaVersion === '1.0.0' &&
        body.sourceRepo === '.' &&
        body.generatedAt === inventory.generated_at,
      `generated body metadata differs from current manifest: ${contract.kind}`,
    );
    requireFact(
      producerDigest(contract.kind, body) === contract.producerSha256,
      `generated body projection differs from native producer metric: ${contract.kind}`,
    );
  }
  announce(
    `Complete inventory body generation admitted for ${admission.head}; original native readiness=${admission.readiness.toUpperCase()}, native exit=${admission.nativeExit} preserved. Explicit body-schema/exporter validation is the next mandatory CI step. This is not a native PASS or readiness approval.`,
  );
  return Object.freeze({ admission, capture });
}
function main() {
  if (process.argv.length !== 2)
    throw new Error(
      'Usage: node tools/security/prepare-security-inventories.mjs',
    );
  runInventoryPreparation(fileURLToPath(new URL('../../', import.meta.url)));
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
