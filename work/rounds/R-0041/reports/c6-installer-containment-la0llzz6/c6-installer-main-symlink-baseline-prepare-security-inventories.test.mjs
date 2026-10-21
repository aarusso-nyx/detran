import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  inventoryProducerArgv,
  validateInventoryGeneration,
  runInventoryPreparation,
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
      inventory_api_input_sha256: 'e'.repeat(64),
      inventory_api_metric_endpoints_hash: 'f'.repeat(64),
      inventory_data_model_input_sha256: 'e'.repeat(64),
      inventory_data_model_metric_tables_hash: 'f'.repeat(64),
      inventory_data_handling_input_sha256: 'e'.repeat(64),
      inventory_data_handling_metric_data_handling_hash: 'f'.repeat(64),
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

const digest = (value) => createHash('sha256').update(value).digest('hex');
const serial = (value) => JSON.stringify(value, null, 2) + '\n';
function ioFixture(run) {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), 'detran-inventory-io-test-'),
  );
  const root = path.join(directory, 'temporary-repo'),
    capture = path.join(directory, 'capture');
  mkdirSync(root);
  mkdirSync(capture);
  const put = (file, text) => {
    const absolute = path.join(root, file);
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, text);
  };
  const generatedAt = '2026-10-19T22:12:44.000Z';
  const bodies = {
    inventory_api: {
      schemaVersion: '1.0.0',
      sourceRepo: '.',
      generatedAt,
      endpoints: [
        {
          method: 'GET',
          path: '/v1/example',
          controller: {
            file: 'backend/example.controller.ts',
            methodName: 'list',
          },
        },
      ],
    },
    inventory_data_model: {
      schemaVersion: '1.0.0',
      sourceRepo: '.',
      generatedAt,
      tables: [
        {
          name: 'example',
          schema: 'demo',
          columns: [{ name: 'email', type: 'text' }],
        },
      ],
    },
    inventory_data_handling: {
      schemaVersion: '1.0.0',
      sourceRepo: '.',
      generatedAt,
      tables: [
        {
          name: 'example',
          schema: 'demo',
          columns: [{ name: 'email', type: 'text', pii_class: 'contact' }],
        },
      ],
    },
  };
  const files = {
    inventory_api: 'inventory_api/api-map.json',
    inventory_data_model: 'inventory_data_model/data-model.json',
    inventory_data_handling: 'inventory_data_handling/data-model-pii.json',
  };
  // Explicit known projections from installed native producer contracts, not implementation calls.
  const projections = {
    inventory_api: digest(
      JSON.stringify([
        ['GET', '/v1/example', 'backend/example.controller.ts', 'list'],
      ]),
    ),
    inventory_data_model: digest(JSON.stringify([['example', ['email']]])),
    inventory_data_handling: digest(
      JSON.stringify([['example', 'email', 'contact']]),
    ),
  };
  const metricNames = {
    inventory_api: 'endpoints_hash',
    inventory_data_model: 'tables_hash',
    inventory_data_handling: 'data_handling_hash',
  };
  const manifest = {
    schemaVersion: '1.0.0',
    generated_at: generatedAt,
    integration_head: candidate.head,
  };
  put('.devai/state/inventory/inventory.json', serial(manifest));
  const child = change(complete(), (_e, _v, reading) => {
    reading.metrics.inventory_body_sha256 = digest(serial(manifest));
    for (const [kind, body] of Object.entries(bodies)) {
      put('.devai/state/sensors/' + files[kind], serial(body));
      reading.metrics[`${kind}_input_sha256`] = digest(serial(body));
      reading.metrics[`${kind}_metric_${metricNames[kind]}`] =
        projections[kind];
    }
  });
  let calls = 0;
  const emitted = { stdout: '', stderr: '', announcements: [] };
  const dependencies = {
    readIdentity: () => ({ ...candidate }),
    createCapture: () => capture,
    runChild: (argv, options) => {
      calls++;
      assert.deepEqual(argv, inventoryProducerArgv);
      assert.equal(options.cwd, root);
      assert.equal(options.encoding, 'utf8');
      return child;
    },
    stdoutSink: (text) => {
      emitted.stdout += text;
    },
    stderrSink: (text) => {
      emitted.stderr += text;
    },
    announce: (text) => emitted.announcements.push(text),
  };
  try {
    run({
      root,
      capture,
      put,
      bodies,
      files,
      child,
      dependencies,
      emitted,
      calls: () => calls,
      manifest,
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
function rawRetained(f) {
  assert.equal(
    readFileSync(path.join(f.capture, 'native.stdout.json'), 'utf8'),
    f.child.stdout,
  );
  assert.equal(
    readFileSync(path.join(f.capture, 'native.stderr.log'), 'utf8'),
    f.child.stderr,
  );
  assert.equal(f.emitted.stdout, f.child.stdout);
  assert.equal(f.emitted.stderr, f.child.stderr);
  assert.deepEqual(
    JSON.parse(readFileSync(path.join(f.capture, 'process.json'))).argv,
    ['pnpm', ...inventoryProducerArgv],
  );
}

test('I/O main accepts complete native body hashes, projections and current manifest metadata', () =>
  ioFixture((f) => {
    const result = runInventoryPreparation(f.root, f.dependencies);
    assert.equal(result.admission.readiness, 'review');
    assert.equal(f.calls(), 1);
    rawRetained(f);
    assert.match(f.emitted.announcements.at(-1), /not a native PASS/);
  }));
test('I/O main accepts source-equivalent up-to-date bodies without requiring wall-clock freshness', () =>
  ioFixture((f) => {
    const updated = change(f.child, (_e, _v, reading) => {
      reading.metrics.kinds_rebuilt = 0;
      reading.metrics.kinds_up_to_date = 7;
    });
    f.child.stdout = updated.stdout;
    assert.equal(
      runInventoryPreparation(f.root, f.dependencies).admission.producedKinds,
      7,
    );
    rawRetained(f);
  }));
test('I/O main refuses dirty preflight without invoking producer or writing any capture', () =>
  ioFixture((f) => {
    let captures = 0;
    assert.throws(
      () =>
        runInventoryPreparation(f.root, {
          ...f.dependencies,
          readIdentity: () => ({ ...candidate, clean: false }),
          createCapture: () => {
            captures++;
            return f.capture;
          },
        }),
      /working tree differs/,
    );
    assert.equal(f.calls(), 0);
    assert.equal(captures, 0);
  }));
test('I/O main refuses candidate change after producer and preserves complete raw streams', () =>
  ioFixture((f) => {
    let reads = 0;
    assert.throws(
      () =>
        runInventoryPreparation(f.root, {
          ...f.dependencies,
          readIdentity: () =>
            ++reads === 1
              ? { ...candidate }
              : { ...candidate, head: 'f'.repeat(40) },
        }),
      /candidate changed/,
    );
    rawRetained(f);
  }));
test('I/O main refuses post-generation dirtiness and preserves raw capture', () =>
  ioFixture((f) => {
    let reads = 0;
    assert.throws(
      () =>
        runInventoryPreparation(f.root, {
          ...f.dependencies,
          readIdentity: () => ({ ...candidate, clean: ++reads === 1 }),
        }),
      /candidate changed/,
    );
    rawRetained(f);
  }));
test('I/O main rejects a manifest whose actual bytes do not match the native digest', () =>
  ioFixture((f) => {
    f.put(
      '.devai/state/inventory/inventory.json',
      serial({ ...f.manifest, integration_head: 'f'.repeat(40) }),
    );
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /manifest body\/hash/,
    );
    rawRetained(f);
  }));
test('I/O main rejects missing generated bodies and preserves raw capture', () =>
  ioFixture((f) => {
    unlinkSync(
      path.join(f.root, '.devai/state/sensors', f.files.inventory_data_model),
    );
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /ENOENT/,
    );
    rawRetained(f);
  }));
for (const kind of [
  'inventory_api',
  'inventory_data_model',
  'inventory_data_handling',
]) {
  test(`I/O main rejects tampered ${kind} body, including fields outside native summary projection`, () =>
    ioFixture((f) => {
      f.put(
        '.devai/state/sensors/' + f.files[kind],
        serial({ ...f.bodies[kind], extra_tampered_content: true }),
      );
      assert.throws(
        () => runInventoryPreparation(f.root, f.dependencies),
        /body bytes differ/,
      );
      rawRetained(f);
    }));
}
test('I/O main rejects contradictory native summary digest even if complete body bytes match', () =>
  ioFixture((f) => {
    f.child.stdout = change(f.child, (_e, _v, reading) => {
      reading.metrics.inventory_api_metric_endpoints_hash = '0'.repeat(64);
    }).stdout;
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /projection differs/,
    );
    rawRetained(f);
  }));
test('I/O main rejects internally hashed body with stale generatedAt relative to current manifest', () =>
  ioFixture((f) => {
    const body = {
      ...f.bodies.inventory_api,
      generatedAt: '2000-01-01T00:00:00.000Z',
    };
    f.put('.devai/state/sensors/' + f.files.inventory_api, serial(body));
    f.child.stdout = change(f.child, (_e, _v, reading) => {
      reading.metrics.inventory_api_input_sha256 = digest(serial(body));
    }).stdout;
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /metadata differs/,
    );
    rawRetained(f);
  }));
test('I/O main rejects different sourceRepo even if body SHA was quoted consistently', () =>
  ioFixture((f) => {
    const body = {
      ...f.bodies.inventory_api,
      sourceRepo: '/different/repository',
    };
    f.put('.devai/state/sensors/' + f.files.inventory_api, serial(body));
    f.child.stdout = change(f.child, (_e, _v, reading) => {
      reading.metrics.inventory_api_input_sha256 = digest(serial(body));
    }).stdout;
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /metadata differs/,
    );
    rawRetained(f);
  }));
test('I/O main retains invalid child JSON and stderr before refusing generation', () =>
  ioFixture((f) => {
    f.child.stdout = '{incomplete';
    f.child.stderr = 'full native diagnostics\nwithout alteration\n';
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /malformed native JSON/,
    );
    rawRetained(f);
  }));
test('I/O main retains child process errors before refusing generation', () =>
  ioFixture((f) => {
    f.child.error = new Error('spawn error');
    f.child.status = null;
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /child process failed/,
    );
    rawRetained(f);
  }));

test('native admission requires all three complete-body and producer-projection digests', () => {
  for (const key of [
    'inventory_api_input_sha256',
    'inventory_api_metric_endpoints_hash',
    'inventory_data_model_input_sha256',
    'inventory_data_model_metric_tables_hash',
    'inventory_data_handling_input_sha256',
    'inventory_data_handling_metric_data_handling_hash',
  ]) {
    reject(
      change(complete(), (_e, _v, reading) => {
        delete reading.metrics[key];
      }),
      /body\/projection hashes missing/,
    );
  }
});
test('I/O main refuses wrong manifest HEAD even if its actual SHA is quoted consistently', () =>
  ioFixture((f) => {
    const manifest = { ...f.manifest, integration_head: 'f'.repeat(40) };
    f.put('.devai/state/inventory/inventory.json', serial(manifest));
    f.child.stdout = change(f.child, (_e, _v, reading) => {
      reading.metrics.inventory_body_sha256 = digest(serial(manifest));
    }).stdout;
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /manifest body\/hash/,
    );
    rawRetained(f);
  }));
test('I/O main refuses invalid manifest timestamp even with a consistent whole-body digest', () =>
  ioFixture((f) => {
    const manifest = { ...f.manifest, generated_at: 'not-a-time' };
    f.put('.devai/state/inventory/inventory.json', serial(manifest));
    f.child.stdout = change(f.child, (_e, _v, reading) => {
      reading.metrics.inventory_body_sha256 = digest(serial(manifest));
    }).stdout;
    assert.throws(
      () => runInventoryPreparation(f.root, f.dependencies),
      /manifest timestamp/,
    );
    rawRetained(f);
  }));

// Installer-only fixtures. The fake Vitest entrypoint is never executed; native
// runner measurement, origin and collection are outside these containment tests.
function installerFixture(run) {
  const directory = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), 'detran-installer-path-')),
  );
  const root = path.join(directory, 'repo');
  const installer = path.join(root, 'tools/security/install-native-vitest.mjs');
  mkdirSync(path.dirname(installer), { recursive: true });
  writeFileSync(
    installer,
    readFileSync(new URL('../install-native-vitest.mjs', import.meta.url)),
  );
  writeFileSync(
    path.join(root, 'package.json'),
    '{"private":true,"type":"module"}',
  );
  const pkg = path.join(root, 'node_modules/vitest');
  mkdirSync(pkg, { recursive: true });
  writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify({
      name: 'vitest',
      version: '4.1.11',
      bin: { vitest: 'vitest.mjs' },
    }),
  );
  const target = path.join(pkg, 'vitest.mjs');
  writeFileSync(
    target,
    '#!/usr/bin/env node\nthrow new Error("fake runner must never execute");\n',
  );
  const invoke = (destination) =>
    spawnSync(process.execPath, [installer, destination], {
      cwd: root,
      encoding: 'utf8',
      timeout: 5000,
    });
  try {
    run({ directory, root, target, invoke });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('installer refuses an internal ..disguised directory before writing an alias', () =>
  installerFixture(({ root, invoke }) => {
    const destination = path.join(root, '..disguised/bin');
    const result = invoke(destination);
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /outside the candidate repository/);
    assert.equal(
      existsSync(path.join(destination, 'detran-native-vitest')),
      false,
    );
  }));

test('installer refuses an external destination symlink resolving into internal ..disguised', () =>
  installerFixture(({ directory, root, invoke }) => {
    const inside = path.join(root, '..disguised/bin');
    mkdirSync(inside, { recursive: true });
    const destination = path.join(directory, 'external-link');
    symlinkSync(inside, destination, 'dir');
    const result = invoke(destination);
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /resolves inside the candidate repository/);
    assert.equal(existsSync(path.join(inside, 'detran-native-vitest')), false);
    assert.equal(lstatSync(destination).isSymbolicLink(), true);
  }));

test('installer accepts a true external sibling bin and is byte-idempotent', () =>
  installerFixture(({ directory, target, invoke }) => {
    const destination = path.join(directory, 'external-bin');
    const first = invoke(destination);
    assert.equal(first.status, 0, first.stderr);
    const alias = path.join(destination, 'detran-native-vitest');
    assert.equal(lstatSync(alias).isSymbolicLink(), true);
    assert.equal(realpathSync(alias), realpathSync(target));
    const before = lstatSync(alias);
    const second = invoke(destination);
    assert.equal(second.status, 0, second.stderr);
    assert.deepEqual(JSON.parse(first.stdout), JSON.parse(second.stdout));
    assert.equal(lstatSync(alias).ino, before.ino);
    assert.equal(realpathSync(alias), realpathSync(target));
  }));

test('installer preserves an unrelated external alias and still refuses the direct parent', () =>
  installerFixture(({ directory, invoke }) => {
    const destination = path.join(directory, 'external-bin');
    mkdirSync(destination);
    const alias = path.join(destination, 'detran-native-vitest');
    const original = 'unrelated executable bytes\n';
    writeFileSync(alias, original);
    const unrelated = invoke(destination);
    assert.notEqual(unrelated.status, 0);
    assert.match(
      unrelated.stderr,
      /Refusing to replace an unrelated executable alias/,
    );
    assert.equal(readFileSync(alias, 'utf8'), original);
    const parent = invoke(directory);
    assert.notEqual(parent.status, 0);
    assert.match(parent.stderr, /outside the candidate repository/);
    assert.equal(
      existsSync(path.join(directory, 'detran-native-vitest')),
      false,
    );
  }));
