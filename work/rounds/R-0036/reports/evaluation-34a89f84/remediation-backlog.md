# R-0036 remediation backlog

## BL-0002 — P1 Architect: add a supported sensor-input binding operation

DEVAI 2.2.0 reads sensor-inputs.json but its registered init actions cannot materialize it, and adopter-policy rejects that field. Source: law/policy/scorecard-sensor-inputs.json. Add upstream support in a separately authorized task; do not hand-write protected configuration or patch installed dependencies. Acceptance: registered init action validates and materializes the adopter source with a digest, retaining thresholds and surfaces. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0003 — P1 Architect/Engineer: map DETRAN commands into supported sensor adapters

Cells F2:T4, F2:T5, F2:T8, F3:T1. Existing suite argv is refused with AUTHORITY_HOST_PROCESS_ADAPTER_REQUIRED. Native migration expects db/migrations, lint expects root eslint.config, and tsc expects root tsconfig. Disposable DDL/RLS smoke, workspace build/typecheck, and supplemental tests have separate evidence. Admit exact existing commands through the supported host adapter mechanism, map the ordered migration orchestrator, and preserve failure semantics. Acceptance: same real commands produce native readings without broadening authority or disguising scripts. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0004 — P1 Architect: make specification and plant measurements monorepo-aware

Partial cells F1:T4/T6/T7/T8, F2:T2/T3, F3:T3, F4:T4. Native plant scan counts 108 conventional source files; test coherence counts only four packages. Workspace inventory identifies 63 child packages, six frontend apps, and 750 test files including tool fixtures. Map domain-first roots, existing contracts and canonical specifications; classify generated clients before changing exclusions. Acceptance: explicitly documented complete denominators and no threshold relaxation. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0005 — P1 Architect/Engineer: restore complete canonical inventory inputs

Cells F2:T1, F4:T1/T2/T6/T7/T9. API sensor finds 1151 endpoints, but read-only runs do not persist the bodies required by dependent sensors. Routes/data-model discovery is empty; regeneration only rebuilds dependency/coverage bodies and reports missing prerequisites. Acceptance: authorized regeneration emits schema-valid complete API, Angular routes, SQL/data model, RBAC/data-handling and coverage bodies; dependent sensors resolve the same candidate and complete inventory timings. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0006 — P1 Inspector: enable full RC coverage producer and repair empty-exclusions handling

Cell F3:T2. Empty exclusions are admitted by sensor-inputs.schema.json but rejected as SENSE_INPUT_INVALID:exclusions. Compatible-input retry retains a failed producer; no whole-repository RC coverage report exists. Add supported coverage aggregation for the real declared population in a separate task. Acceptance: measured-file population and sidecar match all admitted source roots, exclusions are explicit, and missing or stale reports never imply coverage success. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0007 — P1 Engineer: restore supported dependency vulnerability observation

Cell F2:T6 is UNKNOWN with SECURITY_SCAN_NO_AUDIT_TOOL and SECURITY_SCAN_PREFERRED_AUDIT_FAILED. Diagnose the preferred audit command using the recorded transcript and registry constraints. Acceptance: a supported complete dependency audit produces native findings; network/auth/tool errors remain observation failures. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0008 — P2 Owner/Architect/Inspector: map targets and identify a supported performance suite

Cells F1:T7/T8, F2:T7 and F3:T7. No perf script or normalized performance/robustness targets were found by the installed discovery. First map existing specification and error-contract sources; only then ask the appropriate authority for missing targets. Pattern-based test-performance coverage PASS does not prove measured runtime performance. No new k6/mutation workload is authorized. Acceptance: sourced targets and an explicitly scoped executable suite, or an honest remaining blocker. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0009 — P1 Architect: triage harness and governance sensor findings

Cells F5:T3/T4/T5 and diagnostic decision/round-integrity sensors report workflow version drift, concurrency, missing/unaligned gate invariants, constitution entrypoint-version detection, legacy round records and decision citations. Current doctor, law-corpus and index checks pass. Treat compatibility mismatches separately from actual governance defects; preserve legacy records and evidence. Acceptance: each finding is evidenced and either fixed under its authority or retained with a precise compatibility limitation. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0010 — P2 Architect/Engineer: verify the sampled CI population and investigate duration

Cells F5:T7/T8/T9: native readings mark baseBranch unverified despite declared push/main filters. Sample: 89 runs, 87 successes, 97.75%; successful median 1684s and p95 2280s. Preserve native performance FAIL and historical population scope. Acceptance: API/adapter verifies all declared population filters, exposes the exact run IDs, and assesses duration under unchanged rules. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.

## BL-0011 — P2 Inspector: retain and investigate frontend timeout observations

Parallel frontend execution reported six 5000ms timeouts. Targeted RAIT and dashboard reruns passed with unchanged assertions and timeouts, under reduced concurrency. This is an environment-sensitive observation, not an established product regression. Acceptance: repeatable controlled reproduction or a documented resource/concurrency remedy; no test weakening. Evidence: work/rounds/R-0036/reports/evaluation-34a89f84/.
