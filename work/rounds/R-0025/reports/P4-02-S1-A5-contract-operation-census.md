# P4-02-S1-A5 — approved-operation census regression test

Architect, Article7. Status: APPROVED by Owner, 2026-10-19: “Approve A5 as written (recommended)”.
No runtime, generator, contract or permission change.

The full root check passed blueprint generation and contracts:check (329 exact
operations), then contracts:test failed C-5-16:329 !==258. The pre-S1 census in
that test predates the71 approved scoped CASE/WORKLIST replacement operations.
This is an introduced census mismatch, not a claimed pre-existing failure.

## Exact bounded Inspector extension

Add Inspector ownership only of tools/contracts/tests/check-commands.test.mjs.
In its existing C-5-16 real-repository test, retain the unconditional exact
checkCommands().ok assertion with its full diagnostic and change only:

- Append source-backed comment: P4-02-S1 adds71 scoped replacement operations;
  258+71=329. The107-method baseline remains71replacement/25retained/11removed.
- Rename the existing test description from operations=258 to operations=329.
- Change assert.equal(result.operations,258) to assert.equal(result.operations,329).

This is a fixed exact census, never a dynamic expected count or lower bound.
Do not remove, skip or relax any scanner/route/error/catalogue assertion. Existing
TEAT100 census, all malformed-input counterexamples and generated-client checks
remain byte-identical. No other file in tools/, runtime, schema, generator,
contract, fixture, configuration, threshold or scorecard may change under A5.

Concrete proposed code delta:

```diff
 // R-0025 JW01-admissibility F01/R01 acrescenta duas rotas canônicas = 258.
-test('C-5-16 — dado o repositório real (sem flags) quando checkCommands então ok=true e operations=258', async () => {
+// P4-02-S1 acrescenta 71 operações de substituição com escopo: 258 + 71 = 329.
+test('C-5-16 — dado o repositório real (sem flags) quando checkCommands então ok=true e operations=329', async () => {
   const result = checkCommands();
   assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
-  assert.equal(result.operations, 258);
+  assert.equal(result.operations, 329);
 });
```

Inspector applies only after approval, records unchanged root failure, and runs
contracts:test, contracts:check and formatting. Parent reruns affected remaining
root stages, preserves exact source/check receipts and records the approval.
No S2, merge, deployment or round-close authority. Stop for any other required
unowned path or mismatch beyond this fixed authorized census.
