# Inspector assessment — C3/C4 security exporters

Role: Inspector. Scoped work: tests only; exporter implementation remained owned by
its Engineer/Architect worker. No Git mutations, dependency installs, manifests,
state, proofs, thresholds or historical round files were changed by this Inspector.

## Result

`pnpm exec tsx --test tools/security/tests/security-exporters.test.ts`:
**15 tests PASS, zero failures, zero skipped**. Full current output is retained in
`security-exporters-test.log`. These are function-level exporter checks against
isolated temporary repositories, not product-runtime authorization or legal assurance.

Isolated TypeScript compilation also passed:

```text
pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --skipLibCheck --types node tools/security/tests/security-exporters.test.ts
```

## Meaningful checks

- Minimal decorated controller source verifies literal routes, exact coordinates,
  conditional policy metadata, separately retained application/mock/test-fixture
  populations, HMAC callback public-review references and source SHA-256 provenance.
- Missing source handlers, duplicate native IDs, changed verb/path/line/method reject.
- A nonliteral route cannot receive a positive conditional policy binding. Its
  endpoint remains explicitly unresolved, with no policy key or runtime proof.
- Minimal qualified CREATE TABLE source verifies SQL/native population agreement,
  semantic column consistency, schema/table binding, evidence lines and duplicate IDs.
- Blueprint fields omitted by the name heuristic remain in the known-field union.
  Blueprint columns absent from SQL remain explicit mapping gaps with pending ownership.
- Contradictory PII classifications, retention, purpose and legal sources remain
  conflicts, preserving both sources. `forever` retains an indefinite-review flag.
- Missing legal basis and retention remain missing. Supplied source values are quoted
  as legally/operationally unvalidated; no default legal fact is synthesized.
- Reordered inputs and repeated execution produce identical objects. Changing an
  actual supporting source changes its recorded hash without changing route/field data.

Supporting policy/context files are copied read-only into temporary test repos;
controllers, DDL and blueprints are small test sources. Test fixtures never execute
product handlers or alter canonical data. Assertions check external contract behavior,
not copies of exporter algorithms. Temp directories are removed after each test.

## Defects identified and resolved by the source author

1. Nonliteral route expressions originally retained a conditional positive binding
   despite unresolved native fallback. Source author changed application binding to
   unresolved and removed policy/public-review claims; the negative test now passes.
2. DDL evidence originally matched only an unqualified table name. A test changing
   the inventory namespace to `inf.person` while retaining `CREATE TABLE est.person`
   exposed acceptance of mismatched provenance. Source author added qualified
   declaration validation; this counterexample is now rejected.
3. Explicit purpose/legal conflict markers are covered alongside classification and
   retention conflicts. Source author retains these pending rather than selecting one.

## Limits and preservation

Both exporters intentionally return `native_sensor_compatible: false`; passing tests
supply no native PASS, readiness claim or replacement unresolved count. DB-backed
runtime controls, all actual deployment identity conditions and legal source approval
are outside these isolated tests. Real-population regeneration and official evidence
registration remain the parent's responsibility.

R-0036/R-0037 and both evidence histories were not edited. Test/source hashes for this
run are in `tested-files.json`; rerun if exporter source changes before integration.
