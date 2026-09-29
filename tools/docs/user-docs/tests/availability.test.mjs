import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const gate = path.join(repositoryRoot, 'tools/docs/user-docs/check.mjs');
const fixtures = path.join(import.meta.dirname, 'fixtures');

function runGate(command, fixture) {
  return spawnSync(
    process.execPath,
    [gate, command, '--fixture-root', path.join(fixtures, fixture)],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );
}

function assertGateResult(command, fixture, expectedStatus, expectedText) {
  const result = runGate(command, fixture);
  assert.equal(
    result.status,
    expectedStatus,
    `${command}/${fixture}: ${result.stderr || result.stdout}`,
  );
  assert.match(`${result.stdout}\n${result.stderr}`, expectedText);
}

test('availability CLI accepts the complete positive fixture', () => {
  assertGateResult('availability', 'positive', 0, /^OK \(/m);
});

const availabilityRules = [
  ['R1', 'r1-missing-route'],
  ['R2', 'r2-duplicate-global-key'],
  ['R3', 'r3-role-partition'],
  ['R4', 'r4-unknown-decision'],
  ['R5', 'r5-unknown-operation'],
  ['R6', 'r6-missing-evidence'],
  ['R7', 'r7-missing-screen'],
  ['R8', 'r8-l0-without-od'],
];

for (const [rule, fixture] of availabilityRules) {
  test(`${rule} rejects its isolated negative fixture`, () => {
    assertGateResult('availability', fixture, 1, new RegExp(`^${rule} `, 'm'));
  });
}

test('availability schema rejects additional properties', () => {
  assertGateResult('availability', 'schema-additional-property', 1, /^R1 /m);
});
test('availability schema resolves refs and nullable types', () => {
  assertGateResult('availability', 'schema-ref-nullable', 1, /^R1 /m);
});
test('availability schema enforces uniqueItems and patterns', () => {
  assertGateResult('availability', 'schema-unique-pattern', 1, /^R1 /m);
});
test('availability schema enforces date format', () => {
  assertGateResult('availability', 'schema-date-format', 1, /^R1 /m);
});
test('DETRAN_ROLES rejects one missing role', () => {
  assertGateResult('availability', 'roles-missing', 1, /^R3 /m);
});
test('DETRAN_ROLES rejects one extra role', () => {
  assertGateResult('availability', 'roles-extra', 1, /^R3 /m);
});
test('DETRAN_ROLES rejects a duplicated role', () => {
  assertGateResult('availability', 'roles-duplicate', 1, /^R3 /m);
});
test('fixture root is closed and does not fall back to repository files', () => {
  const result = runGate('availability', 'closed-root');
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /^OK \(/m);
});
test('missing phase-D manifest exits 2 without reporting success', () => {
  const result = runGate('availability', 'missing-phase-d');
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.doesNotMatch(result.stdout, /^OK \(/m);
});
test('disponivel rejects a known unavailable-surface marker', () => {
  assertGateResult(
    'availability',
    'available-with-unavailable-marker',
    1,
    /^R1 /m,
  );
});

test('user CLI accepts complete manuals and FAQ coverage', () => {
  assertGateResult('user', 'positive', 0, /^OK \(/m);
});

const userRules = [
  ['U1', 'u1-missing-profile-anchor'],
  ['U2', 'u2-wrong-seal-label'],
  ['U3', 'u3-orphan-anchor'],
  ['U4', 'u4-unknown-i18n-value'],
  ['U5', 'u5-invalid-publication-metadata'],
];

for (const [rule, fixture] of userRules) {
  test(`${rule} rejects its isolated negative fixture`, () => {
    assertGateResult('user', fixture, 1, new RegExp(`^${rule} `, 'm'));
  });
}

test('FAQ without publication markers is excluded as a whole', () => {
  assertGateResult('user', 'faq-markers-absent', 1, /^U5 /m);
});
test('FAQ with duplicate publication markers is excluded as a whole', () => {
  assertGateResult('user', 'faq-markers-duplicate', 1, /^U5 /m);
});
test('FAQ with inverted publication markers is excluded as a whole', () => {
  assertGateResult('user', 'faq-markers-inverted', 1, /^U5 /m);
});
