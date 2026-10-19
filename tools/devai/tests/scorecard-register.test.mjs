import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileRegister } from '../scorecard-register.mjs';

function fixture() {
  const commit = 'a'.repeat(40),
    registry = [],
    assessments = [],
    observations = new Map();
  const cells = [];
  for (let f = 1; f <= 5; f++)
    for (let t = 1; t <= 9; t++) {
      const substrate = `F${f}`,
        property = `T${t}`,
        cell = `${substrate}:${property}`;
      if (cell === 'F1:T1' || cell === 'F4:T5') {
        cells.push({ substrate, property, verdict: 'N/A' });
        continue;
      }
      const kind = `fixture_${f}_${t}`,
        id = `fixture-reading-${f}-${t}`;
      registry.push({ kind, cells: [{ substrate, property }] });
      cells.push({
        substrate,
        property,
        verdict: 'PASS',
        sensor_readings: [id],
      });
      assessments.push({
        cell,
        criteria: 'Fixture predicate',
        input_population: { scope: 'fixture' },
        limitations: 'Only the fixture predicate',
        next_action: 'Retain evidence',
        follow_up_owner: 'Inspector',
        evaluation_disposition: 'measured',
      });
      observations.set(id, {
        has_measurement_capture: true,
        capture_terminated: false,
        reading: {
          id,
          sensor: { kind },
          status: 'pass',
          killed: false,
          metrics: { candidate_commit: commit, lines_total: 1 },
        },
      });
    }
  return {
    commit,
    registry,
    assessments,
    observations,
    scorecard: { integration_head: commit, cells },
  };
}
test('retains a supported native FAIL and exactly 43 applicable entries', () => {
  const input = fixture();
  input.scorecard.cells[1].verdict = 'FAIL';
  input.observations.get(
    input.scorecard.cells[1].sensor_readings[0],
  ).reading.status = 'fail';
  const result = reconcileRegister(input);
  assert.equal(result.length, 43);
  assert.equal(result[0].native_verdict, 'FAIL');
  assert.equal(result[0].evaluation_disposition, 'measured');
});
test('refuses duplicate grid coordinates and changed historical N/A entries', () => {
  const duplicate = fixture();
  duplicate.scorecard.cells[1] = duplicate.scorecard.cells[2];
  assert.throws(() => reconcileRegister(duplicate), /45 unique/);
  const changed = fixture();
  changed.scorecard.cells[0].verdict = 'UNKNOWN';
  assert.throws(() => reconcileRegister(changed), /N\/A ledger changed/);
});
test('requires an explicit disposition for every applicable coordinate', () => {
  const input = fixture();
  input.assessments.pop();
  assert.throws(() => reconcileRegister(input), /43 explicit/);
});
test('does not promote UNKNOWN to measured through assessment prose', () => {
  const input = fixture();
  input.scorecard.cells[1].verdict = 'UNKNOWN';
  assert.throws(
    () => reconcileRegister(input),
    /Insufficient current evidence/,
  );
  input.assessments[0].evaluation_disposition = 'blocked';
  assert.equal(reconcileRegister(input)[0].native_verdict, 'UNKNOWN');
});
test('refuses a captured task reading from another candidate', () => {
  const input = fixture(),
    id = input.scorecard.cells[1].sensor_readings[0];
  input.observations.get(id).reading.metrics.candidate_commit = 'b'.repeat(40);
  assert.throws(() => reconcileRegister(input), /Stale task reading/);
});
test('requires every registered sensor and an uninterrupted measurement capture', () => {
  const input = fixture();
  input.registry.push({
    kind: 'missing_second_sensor',
    cells: [{ substrate: 'F1', property: 'T2' }],
  });
  assert.throws(
    () => reconcileRegister(input),
    /Insufficient current evidence/,
  );
  const interrupted = fixture(),
    id = interrupted.scorecard.cells[1].sensor_readings[0];
  interrupted.observations.get(id).capture_terminated = true;
  assert.throws(
    () => reconcileRegister(interrupted),
    /Insufficient current evidence/,
  );
  interrupted.observations.get(id).capture_terminated = false;
  interrupted.observations.get(id).has_measurement_capture = false;
  assert.throws(
    () => reconcileRegister(interrupted),
    /Insufficient current evidence/,
  );
});
test('does not count a failed coverage producer as a measured line population', () => {
  const input = fixture(),
    cell = input.scorecard.cells.find(
      (cell) => cell.substrate === 'F3' && cell.property === 'T2',
    );
  const observation = input.observations.get(cell.sensor_readings[0]);
  observation.reading.metrics.lines_total = 0;
  cell.verdict = 'FAIL';
  observation.reading.status = 'fail';
  assert.throws(
    () => reconcileRegister(input),
    /actual nonempty line population/,
  );
});
