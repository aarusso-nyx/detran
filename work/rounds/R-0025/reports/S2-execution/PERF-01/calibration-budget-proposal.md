# PERF-01 — calibration result and proposed validation budgets

Architect, 2026-10-21. PROPOSAL ONLY: Owner authorized the experiment, not adoption
of new default limits, runtime optimization or PR211 merge. The generic E2E
default and native four-test default remain30s. PR211 remains DRAFT/unmerged.

## What actually ran

Measured source commit0979345f; four diagnostic120s controls followed by five
functional90s rounds per scenario. Every attempt used a fresh app, supported
seed/legacy preparation and zero-client checks on the exclusively leased
disposable DB53343. All51 cases and original body statements/assertions stayed
unchanged; emitted body JavaScript was independently checked against1a781213.
Functional runs had lightweight HTTP/phase timing, no detailed SQL observer,
and actual original pg.Client.query prototype proof. This is not zero overhead.

The24 planned body observations required25 invocations: four diagnosticPASS,
17 functionalPASS, three functional body timeouts, plus one extra routing
preparation-hook failure. A failed body was never selectively retried. The one
setup retry is separately retained; no hook budget was increased.

| Scenario | Diagnostic body(s) | Functional rounds1–5(s)            | Empirical median(s) | Functional results              |
| -------- | -----------------: | ---------------------------------- | ------------------: | ------------------------------- |
| risk     |             41.200 | 47.248; ≥90;40.016;32.478;35.139   |              40.016 | 4PASS/1timeout                  |
| legacy   |             39.001 | 39.317;40.649;33.254;41.713;35.614 |              39.317 | 5PASS                           |
| routing  |             48.849 | ≥90;48.976;39.059;39.365;38.304    |              39.365 | 4PASS/1timeout; extra setupFAIL |
| incident |             43.244 | ≥90;51.228;36.177;41.276;59.286    |              51.228 | 4PASS/1timeout                  |

All24 observed bodies exceed the historical30s reference. The censored values
mean completion time is at least90s, not that the test completed at90s. Their
upper bounds are unknown. Each median above is identifiable as the third order
statistic: at least three completed observations precede the censored value.
These are empirical sample medians, not population estimates with confidence
bounds. For risk/routing/incident, the sample completion maximum is unknown and
≥90s. Legacy's observed completion maximum is41.713s. Do not calculate a global
maximum or p95 from the17 successes while discarding the three timeouts.

Completed functional bodies span32.478–59.286s. The90s proposed ceiling has
about51.8% headroom above that largest COMPLETED sample only; this arithmetic
is not a tail bound and does not explain away any timeout. Diagnostic maximum
48.849s is from four successful instrumented samples, not a reliable future
maximum. No causal observer cost is obtained by subtracting unmatched epochs.

The measured interval was19:57:37–20:41:09UTC (16:57:37–17:41:09SãoPaulo). Host
was8CPU/16GiB; load changed materially while unrelated work ran. Some90s
timeouts coincided with high host load, but there was no controlled intervention
that proves host load was their sole cause. The final59.286s incident sample
started at load5.71, so slower completion cannot all be dismissed as contention.
Zero clients before each epoch does not imply exclusive CPU or prove absence of
locks during its body. Raw host and operation records remain attached.

## Cost remains visible in the completed diagnostics

| Scenario | Whole-body observed SQL calls | Independent verifier calls | Verifier share of calls | Observer before/after cost(s), separately measured |
| -------- | ----------------------------: | -------------------------: | ----------------------: | -------------------------------------------------: |
| risk     |                         41638 |                      26274 |                  63.10% |                                              6.537 |
| legacy   |                         41650 |                      26282 |                  63.10% |                                              5.308 |
| routing  |                         41587 |                      26260 |                  63.14% |                                              7.030 |
| incident |                         47808 |                      30384 |                  63.55% |                                              7.435 |

These are complete diagnostic BODY captures, not the earlier30s prefixes and
not preparation traffic. Four HTTP operations per body repeatedly qualify the
complete51-case universe before pagination/selection; do not describe the count
as one51-case request or pure production SQL. The independent test verifier
is a major measured consumer, and tens of thousands of reads remain an explicit
performance concern. No optimization was executed. Observer costs are measured
separately, not subtracted to manufacture an uninstrumented result. Driver leaf
latency includes network/PG/scheduling, and inclusive spans are not additive.

## Proposed limits and their meaning

| Layer                                                | Proposed limit           | Rationale and consequence                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Functional completion, only these four51-case bodies | 90s hard ceiling         | Retains substantial room above observed32–59s successes without chasing the censored tail. A timeout remainsFAIL; all51 cases, HTTP outcomes and no-effects assertions must finish. This is a bounded execution guard, not a guarantee or performance approval. |
| Detailed diagnostic mode, only these four bodies     | 120s hard ceiling        | All four diagnostic flows completed39–49s. Keep enough room for full observation but bounded cost; reaching120s remains censored, neverPASS.                                                                                                                    |
| Historical whole-body performance reference          | 30s, explicitly EXCEEDED | Retain all24 exceedances and original failures. FunctionalPASSunder90s cannot clear this reference or resolve the cost investigation.                                                                                                                           |
| Other E2E and each existing hook                     | Unchanged                | No global increase and no inferred hook relaxation. The one10s protocolBatch hook failure remains a separate preparation-stability finding.                                                                                                                     |
| Product endpoint latency/SLO                         | Not established          | Synthetic source-qualified fixtures plus five mixed-condition samples cannot define production latency, throughput or a credible p95.                                                                                                                           |

Recommendation: propose90s/120s as the final bounded FUNCTIONAL/DIAGNOSTIC
ceilings for a separate adoption decision; do not ratify90s as adequate across
all observed host conditions, and do not increase it further to turn failures
green. There is insufficient evidence for a definitive performance SLO or
finite worst-case completion limit. Keep the performance verdict OPEN/RED.

Before accepting the changed functional lane, rerun all four unchanged controls
in the intended execution environment with resource conditions recorded, no
other application using its DB and no competing heavy host job; then run the
complete affected suites, uninterrupted canonical kernel and exact-head required
CI. Do not remove the already recorded mixed-condition samples. If resource
conditions cannot be provided, report resource-blocked acceptance rather than
relaxing deadlines or silently excluding failures. No numerical host-load gate
or guaranteed CI hardware is invented from this dataset.

The test verifier remains an independently measured substantial query consumer;
physical-retrieval optimization needs its own approved semantic-equivalence
packet. No runtime change follows from this budget proposal. Authentic production
source qualification and an explicit product service objective are prerequisites
for a meaningful production performance gate. Keep those decisions separate.

## Exact future adoption packet — NOT EXECUTED

Inspector writable source: ONLY backend/app/tests/e2e/rait-p402-claim.e2e.spec.ts.
Architect writable record: this proposal and the approval/disposition appendices.
Existing fixture timing primitives require no further source change.

If separately approved, set only the four native it() defaults to90000ms; keep
profile120000 and functional90000 closed modes; disable detailed SQL observation
for only those four native functional executions, retaining the existing
equivalence-control observer in every mode. Activate the existing lightweight
phase/HTTP recorder on those four default executions so30s exceedance is always
visible. Do not change any body, case count, assertion, hook, global configuration,
other test, source oracle, production path or dependency.

Validation: emitted body identity, default/mode predicate and budget tables,
invalid mode rejection, actual original-query proof in the four functional runs,
all original assertions plus complete suites/kernel/CI. A functional pass must
be reported alongside the separate30s exceeded verdict. No automatic waiver or
merge authority follows. Stop on unowned paths, altered oracle/semantics, any
need to relax another budget, or a requirement to suppress a genuine failure.
The existing30s default remains until this exact adoption is approved.

## Independent blockers and custody

Use calibration/final-summary.md, calibration/final-results.json and its custody
manifest for machine/native results and exact raw artifact hashes. Source
0979345f is the measured candidate; any later compatibility-only observer fix
is separately identified and must not be described as the measured source.
No prior proof or REVIEW verdict is rewritten. Full prior126/kernel failures
remain. Anchor7 is still orphaned; upstream forwarding is DEVAIissue418, not a
repair or available release. F3, DRESET and authentic production source gaps
remain. No fourth review, S3, runtime optimization, scorecard action or closure.
Local/machine/recovery and independent scorecard work are preserved.
