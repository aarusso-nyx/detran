# Ordinary compiler reconciliation after PR #213 CI failures

PR #213 at `0cfb3a9439cfff2114d3de067e7192ddd101069a` exposed two ordinary test-harness gaps after blueprints, DDL and RLS checks passed: missing Nest constructor metadata in Portal, and a second compilation pass that renamed two application controllers and selected duplicate audit handling. These captures preserve the failed CI, causal observations, genuine RED tests and subsequent bounded configuration repairs. Product implementations, support fixtures and assertions remain unchanged.

The shared TypeScript metadata helper keeps its existing SHA256 `333a08bdae8a4a070c0cdb675b012a33cc368128fc5ef8cc5a35f7947e382d6d`. Each affected configuration retains full compilation under its canonical tsconfig. Exact closed file selectors prevent only the destructive duplicate esbuild transformation; ordinary compilation remains active for other sources. The application and Portal metadata, class identity, required-provider, token, optional-dependency, audit-dispatch and negative controls are captured separately.

Observed ordinary validation before the final cache-locality amendment:

- Application: all 144 tests passed, using its unchanged canonical unit command. The reporter exposed aggregate counts, not individual test IDs.
- Requests: 97 tests passed and seven identical preexisting TODOs remained. All 104 collected IDs match the baseline. This supported-API diagnostic used the actual configuration and full population, with explicit non-listening/network refusal and JSON reporting; it is not the literal CLI invocation.
- Identity: 49 tests passed with its existing configuration and actual Vite 8.2.2 peer; no Identity configuration change was made.
- Ten other unit commands after the application: 491 passed and one preexisting TODO remained across 34 files. Each actual canonical command completed independently; this does not reconstruct a single full backend run.
- Portal integration: all three original cases passed with the unchanged DDL, seed and legacy preparation, owned disposable PostGIS, tenant/RLS request-path behavior and original full test identifiers. The owned container and volume were positively confirmed absent afterward.
- Canonical default-parallel governance command: 241 tests passed, with zero failures or skips. Earlier serial 240-test observations remain scoped to their earlier source bytes.

`../ci-compiler-reconciliation/manifest.json` binds 500 original references to 307 deduplicated payloads. `../ci-portal-reconciliation/manifest.json` binds the public Portal evidence and records private originals by hash only. No private Docker inspection, fixture environment dump or signing material is published. Independent acceptance and copy receipts are added separately. Every historical failure remains a failure; no missing output or vanished temporary file is reconstructed.

These are ordinary execution observations, not native sensor readings, signed RC attestation, future CI results, full 43-item scorecard readiness or completion of C6. R-0036 through R-0039 remain closed, R-0041 remains active, its existing proofs remain an ordered prefix, thresholds and N/A declarations stay unchanged, and all 53 declared historical proof gaps remain explicit. The separate Owner-approved C6 protocol review remains blocked; this reconciliation does not implement or retry it.

## Final cache-observer validation

The one-path observer amendment removes only the Portal test's assertions about root/App caches that neither Portal route writes. It preserves the owned Requests cache controls, all metadata/behavior assertions, source census and connection refusals. The existing App test still guards its own App cache. No root cache guard is invented. The new observation explicitly reports non-owned caches as unmeasured.

After that amendment, both focused routes and the unchanged canonical default-parallel `pnpm devai:test` passed again: 241 passed, zero failures/skips. The final Portal test SHA256 is `9640a62d46edce8c1c8f7066cb8cb61ccca94052066de30cbae1f86fffc3f2a6`. The final capture manifest stores the actual commands, raw streams, observations, independent reviews and preservation checks. Earlier serial and parallel runs remain bound to their earlier source bytes; no historical result is rewritten.
