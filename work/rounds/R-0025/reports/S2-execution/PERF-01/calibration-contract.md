# PERF-01 calibration contract — approved experiment only

Architect coordination,2026-10-21. Source: Owner approved the immediately
preceding proposal of120s diagnostic and90s provisional functional whole-body
ceilings. This supplements, never rewrites, the earlier P0 measurement contract.

## Frozen scope and execution

Inspector paths: backend/app/tests/e2e/rait-p402-claim.e2e.spec.ts and
backend/app/tests/shared/rait-p402-claim.fixture.ts; raw outputs and receipts in
PERF-01/calibration/. Preserve all four51-case body statements/assertions,
independent scalar oracle, tenant/app-role identity checks and source/runtime
bytes. No physical batching, cache, query rewrite, runtime, configuration,
dependency, proof-chain or scorecard change. Root coordination owns Git.

Add an explicit bounded calibration mode for ONLY the four51-case controls:
profile120000ms with detailed P0 observation; functional90000ms without that
observer. Reject invalid mode values. No mode means existing30000ms behavior.
Do not change global Vitest limits, other tests, or hooks. A setup failure remains
a setup failure, not a business timeout.

Use the previously disposable DB53343 only after idle/exclusive lease verification.
One serial runner; four instrumented controls, then five executions PER control
without the detailed observer. Preserve declared run order and every failed
attempt. Supported source preparation remains setup, never business acceptance.
Record exact source hashes, hardware/load, preparation and teardown, body times,
HTTP settlement where available, assertion results, runner exit and late work.
Observe no credentials or DSNs in receipts. Wait for own teardown/quiescence
before another epoch; do not kill unrelated processes or reset shared services.

## Interpretation and final proposal

Publish all20 functional measurements plus four diagnostic captures. Censored
measurements are lower bounds, never estimated completions. Report per-control
median/maximum only when meaningful; retain failures alongside those summaries.
No credible p95 claim from five measurements. Instrumented/uninstrumented runs
are different conditions, not a causal overhead experiment on their own. Query
leaf sums are not CPU/serverSQL time or additive to inclusive spans.

Keep30s as the separate historical whole-body performance reference. Exceedance
is explicitly visible even when functional assertions pass under90s. No current
product SLO is inferred. Propose final diagnostic/functional/performance limits
only to the extent supported by complete data; if censored or unstable, retain
a provisional ceiling and identify the further evidence/Owner decision needed.
Do not ratify a final limit or claim deliveryGREEN from this experiment.

Original raw failures and REVIEW verdicts remain intact. Anchor7, F3, DRESET and
authentic production source limitations remain independent blockers. No fourth
review, merge, S3, upstream repair/adoption or scorecard action is authorized.
