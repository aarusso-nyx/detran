# C6 producer integration — Architect/Engineer delivery

Baseline: `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c`. Parent owns official policy
binding, Git integration, frozen-candidate measurement/custody and remote CI. No Git,
state/proof, threshold, historical round or product-source mutation by this worker.

## Implemented source contract

Seven tasks have literal native Vitest configurations, complete selected file/test-ID
populations, source-bound semantic obligations and real fail-closed CI commands. The
complete declaration contains 782 actual collected leaf IDs, not authored count evidence.

| Invariant | Task | Complete IDs | Semantic required subset | Last direct execution |
| --- | --- | --- | --- | --- |
| INV-CH-001 | invariant-ch | 11 | 5 checked-in/exception/NO_SHOW/CANCELLED cases | 11 PASS |
| INV-DASH-001 | invariant-dash | 729 | 3 AUDITOR reads and AUDITOR/DPO mutation denials | 729 PASS |
| INV-EST-001 | invariant-est | 21 | 4 contract, RLS/tenant isolation read/write cases | 21 PASS |
| INV-INF-001 | invariant-inf | 7 | 4 explicit finalization positive/negative cases | 7 PASS |
| INV-OPS-001 | invariant-ops-queue | 8 | 2 pending-queue denial/justified-close cases | 8 PASS |
| INV-OPS-002 | invariant-ops-perf | 3 | All 3 exact ADR-0044 scenarios/unchanged assertions | 0 executed, 3 skipped; beforeAll timeout |
| INV-PORTAL-001 | invariant-portal | 3 | All 3 sequence/transaction/rollback cases | 3 PASS |

Six suites passed **779 tests**, zero skipped; each final native collection has no
invalid/filter flags. Performance remains a failed preparation observation, not a PASS.
All original assertions, test timeouts, invariant statements/severity/verification intent
and performance targets remain unchanged. CH's two negative appointment cases already
existed; an early bounded source excerpt missed them and was corrected before binding.

`test-tasks.json` contains the complete `resultPopulation` for each task. The additive
`invariant_producers` policy contains exact invariant/subject/task/population/required-ID
bindings. `measurable_via: ["sense run"]` names the existing real facade action; the
seven exact policy obligations prevent generic action matching from discharging an
unmeasured subject. No fake action alias or unrelated passing sensor is attached.
The existing scorecard sensor-input populations and thresholds are untouched.

## Native executable wiring

The provider resolves bare commands, but pnpm's regular `.bin/vitest` shell shim does not
match the actual installed `vitest.mjs` entrypoint required by native custody. The new
installer creates an external unique `detran-native-vitest` symlink to the actual installed
Vitest 4.1.11 Node entrypoint. It checks the manifest, real target, external destination,
existing alias identity and source SHA-256. It copies/modifies no runner or reporter.

Local preparation:

```text
node tools/security/install-native-vitest.mjs /tmp/detran-c6-native-bin
export PATH="/tmp/detran-c6-native-bin:$PATH"
```

The receipt records the same real executable path/hash as the installed package's bin.
Every direct final suite was invoked using its exact descriptor argv through this alias.
This proves executable wiring, not registered native custody. Official acceptance still
requires the parent's clean frozen candidate and the trusted runtime's injected nonce,
input trace, execution receipt and later recorded reading. No nonce was invented here.

## CI wiring

The unconditional `invariant-producers` job owns an isolated pinned PostGIS service,
applies DDL/seeds/legacy fixtures, prepares the external alias and runs seven single-command
steps exactly matching task argv. Request-path connections retain `role_app_backend`;
owner credentials are limited to fixture setup and explicit existing test harness work.

Required foundation now depends on both `evidence-gate` and `invariant-producers` and
explicitly fails when either did not succeed. Its fail-closed cancellation handling and
all existing required names remain intact. No event/path filtering or generated-verifier
change was introduced. Root concurrency stays workflow/ref-scoped with superseding
cancellation; the protected verifier's independent serialization remains untouched.

The Inspector caught an accidentally duplicated service-environment block in an early
uncommitted YAML draft. It was repaired; strict parse/regression validation is delegated
to the independent CI Inspector, not silently treated as a green runtime run.

## Actual observations and blockers

1. **Performance preparation:** final direct execution kept the original 60-second
   beforeAll limit and failed that hook (0 executed/3 skipped). Earlier direct execution
   returned zero but emitted application request INFO output alongside final native JSON.
   Experiments with the existing LOG_LEVEL setting did not establish a reliable remedy;
   silent/error and the final info rerun timed out. CI preserves the default info level.
   No logger/domain fix, log trimming, assertion change or timeout increase is included.
2. **Native JSON custody for performance:** request logging can contaminate the provider's
   exact direct-JSON transport. Extracting the last JSON line for diagnostic roster reading
   is not a valid native result. Raw full streams remain archived. Parent must not feed
   a cleaned or synthesized report into `sense record` as if it were native execution.
3. **Four service-dependent tasks:** EST, OPS queue, PORTAL and request-path performance
   require real database state. The installed `native-service-plan.ts` unconditionally
   refuses declared service profiles with `SENSE_NATIVE_SERVICE_BACKEND_UNIMPLEMENTED`.
   No unsupported profile or service-success assertion was invented. External disposable
   fixture execution supplies diagnostic test results, not package-owned service custody.
4. **Frozen candidate standing:** native producer alignment also requires clean committed
   input/config/descriptor closure, official adopter binding, real exact-candidate nonce
   execution and execution/record receipts. Those operations belong to the parent and
   have not been performed by this worker. Current FAIL/UNKNOWN is retained where needed.

The fixture container `detran-c6-invariants-23009`, port 62565, remains available to parent;
its synthetic environment is `/tmp/c6-fixture.json`. It is independent of all preexisting
services. Parent should remove it after final validation. Native service backend repair,
performance preparation and any runtime logger issue require separate scoped follow-up;
this task does not implement incidental product fixes.

## Validation

- Exact final six-task execution: 779 tests PASS, no skips or collection invalid flags.
- `law:test`: 56 PASS; `verify:law-corpus`: PASS.
- Installed schema validation: task descriptor and adopter policy PASS, including native
  complete result contracts and invariant producer bindings.
- Complete ID uniqueness, selected file existence and semantic subset membership PASS.
- All seven invariant bodies equal baseline after removing the new measurable_via field.
- Existing scorecard sensor-input declaration unchanged; no threshold changes.
- Native executable alias realpath/SHA identity and script syntax PASS.
- Formatter and whitespace checks PASS on owned source paths.

`raw/` contains complete compressed command streams with hashes in `raw-manifest.json`;
`producer-manifest.json` lists actual semantic titles and exact argv. These are diagnostic
artifacts, not fabricated sensor readings or readiness evidence. No official `sense record`,
proof emission, Git mutation or sibling-repository write occurred.
