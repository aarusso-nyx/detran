import assert from 'node:assert/strict';
import test from 'node:test';

const BASELINE_KINDS = ['build', 'lint', 'type_check', 'unit_test'];

const GOVERNED_KINDS = [
  'build',
  'lint',
  'type_check',
  'unit_test',
  'inventory_api',
  'inventory_routes',
  'inventory_data_model',
  'inventory_rbac',
  'inventory_data_handling',
  'inventory_dep_graph',
  'spec_depth',
  'spec_alignment',
  'spec_freshness',
  'spec_idiomaticity',
  'test_invariant_alignment',
  'harness_coverage',
  'harness_depth',
  'harness_coherence',
  'harness_invariant_alignment',
  'docs_drift',
];

const SWEEP_KINDS = [
  'type_check',
  'lint',
  'test_weakening_review',
  'trace_resolution',
  'security_scan',
  'perf_test',
  'inventory_api',
  'inventory_routes',
  'inventory_data_model',
  'inventory_rbac',
  'inventory_data_handling',
  'inventory_dep_graph',
  'inventory_coverage',
  'spec_depth',
  'spec_idiomaticity',
  'spec_freshness',
  'plant_coverage',
  'test_coverage_depth',
  'test_invariant_alignment',
  'inventory_adherence',
  'inventory_determinism',
  'harness_security',
  'harness_green_main',
  'spec_alignment',
  'spec_security_coverage',
  'spec_performance_targets',
  'spec_robustness_targets',
  'plant_depth',
  'plant_coherence',
  'test_coherence',
  'test_idiomaticity',
  'test_security_coverage',
  'test_performance_coverage',
  'test_robustness_coverage',
  'harness_coverage',
  'harness_depth',
  'harness_coherence',
  'harness_invariant_alignment',
  'harness_idiomaticity',
  'harness_performance',
  'harness_robustness',
  'inventory_performance',
  'decision_record_integrity',
  'decision_citation_resolution',
  'archive_immutability',
  'round_record_integrity',
  'docs_drift',
  'site_drift',
  'action_effect_inference',
];

async function loadSense() {
  return import(new URL('../sense.mjs', import.meta.url).href);
}

function reading(kind, overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    id: 'SR-0123456789abcdef',
    sensor: { name: kind, kind },
    timestamp: '2026-09-29T00:00:00.000Z',
    status: 'pass',
    deterministic: true,
    command: 'pnpm typecheck',
    command_hash: 'a'.repeat(64),
    exit_code: 0,
    ...overrides,
  };
}

function executor(overrides = {}) {
  return async (kind) => reading(kind, overrides);
}

async function run(options) {
  const { runSense } = await loadSense();
  assert.equal(typeof runSense, 'function');
  return runSense(options);
}

test('dado preset baseline quando selecionado então contém seus quatro kinds declarados incluindo build e unit_test', async () => {
  const result = await run({ preset: 'baseline', execute: executor() });

  assert.equal(result.selected.length, BASELINE_KINDS.length);
  assert.deepEqual(new Set(result.selected), new Set(BASELINE_KINDS));
  assert.ok(result.selected.includes('build'));
  assert.ok(result.selected.includes('unit_test'));
});

test('dado preset governed quando selecionado então contém seus vinte kinds declarados incluindo build e unit_test', async () => {
  const result = await run({ preset: 'governed', execute: executor() });

  assert.equal(result.selected.length, GOVERNED_KINDS.length);
  assert.deepEqual(new Set(result.selected), new Set(GOVERNED_KINDS));
  assert.ok(result.selected.includes('build'));
  assert.ok(result.selected.includes('unit_test'));
});

test('dado preset sweep e rodada R-0020 quando selecionado então contém os quarenta e nove reads na ordem do registry', async () => {
  assert.equal(SWEEP_KINDS.length, 49);

  const result = await run({
    preset: 'sweep',
    round: 'R-0020',
    execute: executor(),
  });

  assert.deepEqual(result.selected, SWEEP_KINDS);
});

test('dado leitura válida quando o executor a devolve então o parser preserva o envelope SensorReading', async () => {
  const result = await run({ preset: 'baseline', execute: executor() });

  assert.equal(result.readings.length, BASELINE_KINDS.length);
  for (const sensorReading of result.readings) {
    assert.equal(sensorReading.schemaVersion, '1.0.0');
    assert.match(sensorReading.id, /^SR-[a-f0-9]{16}$/);
    assert.equal(sensorReading.sensor.name, sensorReading.sensor.kind);
    assert.match(sensorReading.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.match(sensorReading.command_hash, /^[a-f0-9]{64}$/);
  }
});

test('dado leitura fora do schema quando o executor a devolve então o parser a rejeita', async () => {
  const { runSense } = await loadSense();
  assert.equal(typeof runSense, 'function');

  await assert.rejects(
    runSense({
      preset: 'baseline',
      execute: executor({ command_hash: 'not-a-sha256', unexpected: true }),
    }),
  );
});

test('dado comando fracassado quando o executor devolve exit_code não zero então nenhuma leitura vira pass', async () => {
  const result = await run({
    preset: 'baseline',
    execute: executor({ exit_code: 1, err_head: 'command failed' }),
  });

  assert.ok(
    result.readings.every((sensorReading) => sensorReading.status !== 'pass'),
  );
});

test('dado timeout quando o executor devolve killed então nenhuma leitura vira pass', async () => {
  const result = await run({
    preset: 'baseline',
    execute: executor({ exit_code: null, killed: true }),
  });

  assert.ok(
    result.readings.every((sensorReading) => sensorReading.status !== 'pass'),
  );
  assert.ok(
    result.readings.every((sensorReading) => sensorReading.status === 'killed'),
  );
});

test('dado mesmo input quando executado duas vezes então readings ids e command_hash são estáveis', async () => {
  const options = { preset: 'baseline', execute: executor() };
  const first = await run(options);
  const second = await run(options);

  assert.deepEqual(second.readings, first.readings);
  assert.deepEqual(
    second.readings.map((sensorReading) => sensorReading.id),
    first.readings.map((sensorReading) => sensorReading.id),
  );
  assert.deepEqual(
    second.readings.map((sensorReading) => sensorReading.command_hash),
    first.readings.map((sensorReading) => sensorReading.command_hash),
  );
});

for (const status of ['review', 'skipped', 'killed', 'error', 'unknown']) {
  test(`dado status ${status} quando o executor o devolve então nenhuma leitura conta como pass`, async () => {
    const result = await run({
      preset: 'baseline',
      execute: executor({ status }),
    });

    assert.ok(
      result.readings.every((sensorReading) => sensorReading.status === status),
    );
    assert.ok(
      result.readings.every((sensorReading) => sensorReading.status !== 'pass'),
    );
  });
}

test('dado leitura estocástica sem confidence quando o executor a devolve então o parser a rejeita', async () => {
  const { runSense } = await loadSense();
  assert.equal(typeof runSense, 'function');

  await assert.rejects(
    runSense({
      preset: 'baseline',
      execute: executor({ deterministic: false }),
    }),
  );
});
