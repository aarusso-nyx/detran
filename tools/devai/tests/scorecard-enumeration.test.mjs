import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { scorecardEnumerationPlan } from '../scorecard-enumeration.mjs';
const installed = (name) =>
  JSON.parse(
    readFileSync(
      `node_modules/@aarusso-nyx/devai/dist/law/policy/${name}.json`,
    ),
  );
const presets = installed('sense-presets');
const registry = installed('sensor-registry');

test('enumeration retains every registered read member and the installed two-pass order', () => {
  const plan = scorecardEnumerationPlan(presets, registry, {});
  assert.equal(plan.first.length + plan.second.length, 49);
  assert.deepEqual(
    plan.second.map((item) => item.kind),
    ['harness_invariant_alignment', 'inventory_performance'],
  );
  assert.ok(plan.separately_required.includes('inventory_regeneration'));
  assert.ok(plan.separately_required.includes('integration_test'));
});
test('an omitted registered read member is refused instead of silently shrinking the population', () => {
  const altered = structuredClone(presets);
  altered.presets.find((entry) => entry.name === 'sweep').members.shift();
  assert.throws(
    () => scorecardEnumerationPlan(altered, registry, {}),
    /complete registered/,
  );
});
test('duplicates and second-pass omissions cannot become a valid execution plan', () => {
  const duplicate = structuredClone(presets);
  duplicate.presets
    .find((entry) => entry.name === 'sweep')
    .members.push('lint');
  assert.throws(
    () => scorecardEnumerationPlan(duplicate, registry, {}),
    /duplicate/,
  );
  const second = structuredClone(presets);
  second.selection_effect_rule.sweep_second_pass += ',unit_test';
  assert.throws(() => scorecardEnumerationPlan(second, registry, {}), /subset/);
});
test('only task-bound members carry explicit local-write consent and Inspector role', () => {
  const plan = scorecardEnumerationPlan(presets, registry, {
    type_check: { taskId: 'scorecard-typecheck', population: 'all-types' },
  });
  const type = plan.first.find((item) => item.kind === 'type_check');
  const lint = plan.first.find((item) => item.kind === 'lint');
  assert.ok(type.argv.includes('--write'));
  assert.equal(type.argv[type.argv.indexOf('--as-role') + 1], 'inspector');
  assert.ok(!lint.argv.includes('--write'));
  assert.ok(!lint.argv.includes('--as-role'));
});
