import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  inventoryProducerArgv,
  validateInventoryGeneration,
} from '../prepare-security-inventories.mjs';

const candidate = { head: 'a'.repeat(40), tree: 'b'.repeat(40), clean: true };
const kinds = [
  'inventory_api',
  'inventory_routes',
  'inventory_data_model',
  'inventory_rbac',
  'inventory_data_handling',
  'inventory_dep_graph',
  'inventory_coverage',
];
function complete(readiness = 'review') {
  const exit = readiness === 'pass' ? 0 : 1;
  const reading = {
    schemaVersion: '1.0.0',
    id: 'SR-0123456789abcdef',
    sensor: { kind: 'inventory_regeneration' },
    command: 'devai sense run inventory_regeneration',
    command_hash: 'c'.repeat(64),
    status: readiness,
    deterministic: true,
    findings: [],
    metrics: {
      kinds_touched: 7,
      kinds_rebuilt: 7,
      kinds_up_to_date: 0,
      error_count: 0,
      required_kinds: 7,
      missing_required_kinds: 0,
      integration_head: candidate.head,
      integration_tree: candidate.tree,
      inventory_body_sha256: 'd'.repeat(64),
      ...Object.fromEntries(
        kinds.map((kind) => [
          `${kind}_status`,
          readiness === 'review' &&
          ['inventory_rbac', 'inventory_coverage'].includes(kind)
            ? 'review'
            : 'pass',
        ]),
      ),
    },
  };
  const value = {
    ok: readiness === 'pass',
    dry_run: false,
    selection: { type: 'kind', value: 'inventory_regeneration' },
    members: [
      {
        kind: 'inventory_regeneration',
        effect: 'harness-write',
        consent: { write: true, publish: false },
      },
    ],
    executed: ['inventory_regeneration'],
    excluded: [],
    aggregate_effect: 'harness-write',
    implicit_persistence: false,
    execution_status: 'pass',
    readiness_status: readiness,
    applicable_count: 1,
    na_count: 0,
    counts: {
      pass: readiness === 'pass' ? 1 : 0,
      review: readiness === 'review' ? 1 : 0,
      fail: 0,
      unknown: 0,
      na: 0,
      error: 0,
    },
    exit_code: exit,
    results: [
      {
        command: 'devai sense run inventory_regeneration',
        stdout: JSON.stringify(reading),
        stderr: '',
        na: false,
        status: exit,
      },
    ],
  };
  return {
    status: exit,
    signal: null,
    stdout: JSON.stringify({
      schemaVersion: '1.0.0',
      action_id: 'sense run',
      ok: true,
      result: { verdict: readiness, media_type: 'application/json', value },
    }),
    stderr: 'Preserved external process diagnostic\n',
  };
}
function change(child, mutate) {
  const envelope = JSON.parse(child.stdout),
    value = envelope.result.value;
  const reading = JSON.parse(value.results[0].stdout);
  mutate(envelope, value, reading);
  value.results[0].stdout = JSON.stringify(reading);
  return { ...child, stdout: JSON.stringify(envelope) };
}
const reject = (child, message) =>
  assert.throws(
    () => validateInventoryGeneration(child, candidate),
    message ?? /Inventory generation refused/,
  );

test('canonical producer invokes only registered Architect write action, with no persistence/publish bypass', () => {
  assert.deepEqual(inventoryProducerArgv, [
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
});
test('complete REVIEW produces an artifact admission while preserving original verdict, exit and raw streams', () => {
  const child = complete(),
    before = structuredClone(child);
  const admitted = validateInventoryGeneration(child, candidate);
  assert.equal(admitted.readiness, 'review');
  assert.equal(admitted.nativeExit, 1);
  assert.equal(admitted.producedKinds, 7);
  assert.equal(admitted.head, candidate.head);
  assert.deepEqual(child, before);
  assert.equal(JSON.parse(child.stdout).result.verdict, 'review');
});
test('complete PASS and seven verified up-to-date bodies are accepted', () => {
  const child = change(complete('pass'), (_e, _v, reading) => {
    reading.metrics.kinds_rebuilt = 0;
    reading.metrics.kinds_up_to_date = 7;
  });
  assert.equal(validateInventoryGeneration(child, candidate).readiness, 'pass');
});
test('process errors, interruption, absent exit and arbitrary nonzero exits reject', () => {
  for (const update of [
    { status: 2 },
    { status: null },
    { signal: 'SIGTERM' },
    { error: new Error('spawn failed') },
  ])
    reject({ ...complete(), ...update });
});
test('truncated, non-JSON and missing raw output reject', () => {
  for (const stdout of ['{', '', 'native failed', undefined])
    reject({ ...complete(), stdout });
  reject({ ...complete(), stderr: undefined });
});
test('error/unknown native envelope cannot be hidden by successful process completion', () => {
  reject(
    change(complete(), (envelope) => {
      envelope.ok = false;
    }),
  );
  reject(
    change(complete(), (_e, value) => {
      value.execution_status = 'error';
    }),
  );
  reject(
    change(complete(), (envelope, value, reading) => {
      envelope.result.verdict =
        value.readiness_status =
        reading.status =
          'unknown';
      value.counts.review = 0;
      value.counts.unknown = 1;
    }),
  );
  reject(
    change(complete(), (_e, value) => {
      value.counts.error = 1;
    }),
  );
  reject(
    change(complete(), (_e, value) => {
      value.counts.fail = 1;
    }),
  );
});
test('READINESS FAIL remains rejected even if all body metrics claim completeness', () => {
  reject(
    change(complete(), (envelope, value, reading) => {
      envelope.result.verdict =
        value.readiness_status =
        reading.status =
          'fail';
      value.counts.review = 0;
      value.counts.fail = 1;
    }),
  );
});
test('dirty candidate and dirty-source UNKNOWN cannot acquire admission', () => {
  assert.throws(
    () =>
      validateInventoryGeneration(complete(), { ...candidate, clean: false }),
    /clean exact HEAD\/tree/,
  );
  reject(
    change(complete(), (_e, _v, reading) => {
      reading.status = 'unknown';
      reading.findings = [
        { severity: 'warning', code: 'INVENTORY_REGENERATION_SOURCE_DIRTY' },
      ];
      reading.metrics = {
        kinds_touched: 0,
        kinds_rebuilt: 0,
        kinds_up_to_date: 0,
        error_count: 0,
      };
    }),
  );
});
test('partial, missing, overcounted or errored generation rejects', () => {
  for (const update of [
    { kinds_touched: 6 },
    { kinds_rebuilt: 6 },
    { kinds_up_to_date: 1 },
    { required_kinds: 6 },
    { missing_required_kinds: 1 },
    { error_count: 1 },
    { kinds_rebuilt: -1, kinds_up_to_date: 8 },
    { kinds_rebuilt: 6.5, kinds_up_to_date: 0.5 },
    { required_kinds: undefined },
  ])
    reject(
      change(complete(), (_e, _v, reading) => {
        Object.assign(reading.metrics, update);
      }),
    );
});
test('each required producer must have actual PASS or REVIEW standing', () => {
  for (const kind of kinds)
    for (const status of ['fail', 'unknown', 'error', undefined])
      reject(
        change(complete(), (_e, _v, reading) => {
          reading.metrics[`${kind}_status`] = status;
        }),
      );
});
test('exact HEAD, tree and generated body digest are mandatory', () => {
  for (const update of [
    { integration_head: 'f'.repeat(40) },
    { integration_tree: 'f'.repeat(40) },
    { inventory_body_sha256: '' },
    { integration_head: undefined },
  ])
    reject(
      change(complete(), (_e, _v, reading) => {
        Object.assign(reading.metrics, update);
      }),
    );
});
test('dry run, excluded member, different action and missing write consent reject', () => {
  reject(
    change(complete(), (_e, value) => {
      value.dry_run = true;
    }),
  );
  reject(
    change(complete(), (_e, value) => {
      value.excluded = ['inventory_regeneration'];
    }),
  );
  reject(
    change(complete(), (envelope) => {
      envelope.action_id = 'sense record';
    }),
  );
  reject(
    change(complete(), (_e, value) => {
      value.members[0].consent.write = false;
    }),
  );
  reject(
    change(complete(), (_e, value) => {
      value.executed = [];
    }),
  );
});
test('contradictory exits, error findings and malformed embedded readings reject', () => {
  reject({ ...complete(), status: 0 });
  reject(
    change(complete(), (_e, value) => {
      value.results[0].status = 0;
    }),
  );
  reject(
    change(complete(), (_e, _v, reading) => {
      reading.findings = [
        { severity: 'error', code: 'INVENTORY_REGENERATION_PRODUCER_FAILED' },
      ];
    }),
  );
  const child = complete();
  const envelope = JSON.parse(child.stdout);
  envelope.result.value.results[0].stdout = '{';
  reject({ ...child, stdout: JSON.stringify(envelope) });
});
