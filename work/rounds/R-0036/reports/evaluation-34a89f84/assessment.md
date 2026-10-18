# R-0036 scorecard evaluation

Evaluated commit: `34a89f845146523161f401ae758b5fb9fab8db93`. DEVAI 2.2.0.

All 43 applicable cells have a disposition; the original two N/A cells are preserved. Native results: {"N/A":2,"PASS":18,"REVIEW":10,"FAIL":12,"UNKNOWN":3}. Assessment: {"measured":19,"partial":13,"blocked":11}. Overall native verdict: **FAIL**. Readiness is not established.

There are 40 conclusive native cell verdicts. Only 19 cells have sufficient evidence for their stated sensor predicate; blocked and partial cells are counted separately. The detailed JSON register includes commands, criteria, populations, findings, metrics, and canonical evidence paths.

The workspace contains 63 child packages plus the root. The initial 64-manifest inventory also contains the nested SENATRAN documentation site, which is outside the pnpm workspace; it is not silently included in build/test claims. The 750 test-file inventory includes tooling fixtures and does not claim all files execute in a suite.

The installed CLI cannot bind the sensor-input declaration through a registered init action. Inputs were supplied explicitly, without hand-writing protected configuration. The sweep's original authority refusal, empty-exclusions adapter error, missing coverage producer, suite adapter refusals, and unsuccessful measurements are retained. Machine error envelopes emitted on stderr are decoded without changing their failure status.

| Cell | Native verdict | Assessment | Follow-up owner | Limitation |
| --- | --- | --- | --- | --- |
| F1:T2 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F1:T3 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F1:T4 | REVIEW | partial | Architect | Reverse alignment scanned 108 conventional source files; this does not cover backend/apps monorepo source roots. |
| F1:T5 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F1:T6 | FAIL | partial | Architect | Security specification checks use conventional security/migration paths that do not match the complete DETRAN layout. |
| F1:T7 | FAIL | partial | Architect | No normalized performance targets were found; conventional code-root discovery does not establish completeness of domain specifications. |
| F1:T8 | FAIL | partial | Architect | No normalized error-semantics targets were found; engineering must map existing domain error contracts before declaring their absence. |
| F1:T9 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F2:T1 | FAIL | blocked | Engineer | PLANT_COVERAGE_NO_INVENTORY: the required canonical inventory body is unavailable. |
| F2:T2 | FAIL | partial | Engineer | Only 108 conventional source files were counted, including generated clients; authored plant coverage is incomplete. |
| F2:T3 | PASS | partial | Engineer | Only seven conventional directories were scanned; backend/apps boundaries need a monorepo-aware adapter. |
| F2:T4 | FAIL | blocked | Engineer | The migration adapter hard-codes db/migrations; DETRAN uses its ordered backend/database/apply.sh. Disposable DDL succeeded separately. |
| F2:T5 | REVIEW | blocked | Engineer | Root ESLint invocation exited 2 because no root eslint.config exists; zero parsed errors does not establish lint quality. |
| F2:T6 | UNKNOWN | blocked | Engineer | The security sensor could not obtain a supported dependency audit result. |
| F2:T7 | UNKNOWN | blocked | Engineer | No existing performance suite is configured; no workload or target was invented. |
| F2:T8 | FAIL | blocked | Engineer | The native root tsc invocation printed help because there is no root tsconfig. The actual workspace typecheck passed separately. |
| F2:T9 | PASS | measured | Engineer | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F3:T1 | UNKNOWN | blocked | Inspector | All three configured suite commands were refused with AUTHORITY_HOST_PROCESS_ADAPTER_REQUIRED; supplemental test results are not native readings. |
| F3:T2 | FAIL | blocked | Inspector | No full RC coverage report/producer. Empty exclusions are schema-valid but rejected by the adapter; compatible-input retry retained the producer failure. |
| F3:T3 | REVIEW | partial | Inspector | The sensor scanned only four packages, not the full workspace test population. |
| F3:T4 | PASS | measured | Inspector | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F3:T5 | REVIEW | measured | Inspector | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F3:T6 | PASS | measured | Inspector | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F3:T7 | PASS | measured | Inspector | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F3:T8 | PASS | measured | Inspector | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F3:T9 | PASS | measured | Inspector | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F4:T1 | REVIEW | blocked | Architect | API inventory found 1151 endpoints, but routes/data model bodies are empty or absent. Combined coverage is incomplete. |
| F4:T2 | REVIEW | blocked | Architect | Routes and data model inputs are unavailable, preventing inventory-depth assessment. |
| F4:T3 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F4:T4 | FAIL | partial | Architect | Adherence flags conventional-layout orphans; triage against domain-first ADR-0001 before treating them as product defects. |
| F4:T6 | REVIEW | blocked | Architect | RBAC and data handling measurements lack the required data model input. |
| F4:T7 | REVIEW | partial | Architect | Timing covers seven inventory attempts, including missing-input observations; it is not a complete successful inventory benchmark. |
| F4:T8 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F4:T9 | REVIEW | partial | Architect | Regeneration produced dependency/coverage bodies, but retained missing API/routes prerequisites; complete inventory regeneration remains unproven. |
| F5:T1 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F5:T2 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F5:T3 | FAIL | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F5:T4 | FAIL | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F5:T5 | REVIEW | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F5:T6 | PASS | measured | Architect | This evaluates the named sensor predicate only; it is not a production-readiness certification. |
| F5:T7 | FAIL | partial | Architect | CI timing is measured, but DEVAI reports HARNESS_POPULATION_UNVERIFIED for baseBranch; preserve the declared push/main population limitation. |
| F5:T8 | PASS | partial | Architect | CI flakiness is measured, but DEVAI reports HARNESS_POPULATION_UNVERIFIED for baseBranch. |
| F5:T9 | PASS | partial | Architect | CI success rate is measured, but DEVAI reports HARNESS_POPULATION_UNVERIFIED for baseBranch; this is historical CI, not candidate CI. |

## Runtime evidence

See baseline-comparison.json for every captured execution and its exit status. Disposable DDL, seed and RLS smoke succeeded. Native build and supplemental workspace typecheck succeeded. Backend unit tests and omitted unit suites succeeded. The parallel frontend run encountered six test timeouts; targeted reruns passed without changing assertions or timeouts. These are retained as environmental failures, not classified as established product regressions.

The assessed application sources are unchanged from the baseline. Parser/capture tooling repairs after the measurement commit do not change native readings; this report remains tied to the evaluated commit and does not claim that a later delivery commit has been evaluated. CI metrics concern the declared historical push/main population rather than a candidate CI run.

No product defect, missing domain target, or readiness claim is ratified by this assessment. Remediation items are separate backlog findings.

## Validation and execution outcomes

| Execution | Exit code |
| --- | --- |
| sensor-build | 0 |
| workspace-typecheck | 0 |
| backend-unit | 0 |
| omitted-unit-suites | 0 |
| frontend-tests | 1 |
| frontend-timeout-recheck | 0 |
| dashboard-timeout-recheck | 0 |
| database-reset | 0 |
| database-seed | 0 |
| rls-smoke | 0 |
| backend-integration | 0 |
| backend-e2e | 0 |
| backend-upgrade | 0 |
| mock-integration | 0 |
| mock-e2e | 0 |
| adapter-integration | 0 |
| adapter-e2e | 0 |
| affected-checks | 0 |
| affected-law-tests | 0 |
| affected-law-corpus | 0 |
| affected-state-index | 0 |
| affected-rounds-index | 0 |
| evaluation-tool-tests | 0 |
| final-doctor | 0 |
| final-chain-before-assessment | 0 |
| final-format | 1 |
| delivery-format-recheck | 0 |

The full formatting check reports only the unrelated ignored local file .claude/settings.local.json (mtime 2026-10-17, before this evaluation). It was not edited. Formatting of delivery files passed after correcting the capture-tool check invocation. Native scorecard threshold provenance is defaults; the bound threshold file is unchanged and fingerprinted, which does not establish that each sensor consumed it.

Existing suite scripts sometimes exit zero with no test files: suite-results.json in raw/ records those populations explicitly. Backend E2E and upgrade commands passed, but empty package suites do not establish test coverage. See [the detailed register](evaluation-register.json), [remediation tasks](remediation-backlog.md), and [the evidence manifest](evidence-manifest.json).
