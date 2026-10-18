# ADR-0044: Initial generous performance baseline

## Status

Accepted under the Owner's explicit 2026-10-18 instruction to define previously
absent performance targets and a suite, with generous initial limits.

## Decision

Establish a reproducible local baseline for three real read paths of the unified
backend: a seeded RAIT case (`rait-analyst`), operational agency units
(`agency-admin`), and dashboard KPIs (`dash-operator`). Use the existing composed
Nest application, authentication/policy guards, tenant context and PostgreSQL RLS.
The fixture administrator prepares disposable data only; requests use
`role_app_backend`. No application behavior or permissions change.

For each scenario, discard five warm-up requests and measure 30 sequential
requests, concurrency one. Every response must have HTTP 200 and the expected
body shape. Use the nearest-rank percentile of the complete per-scenario sample.
Initial acceptance is p50 <= 1000 ms, p95 <= 2000 ms, throughput >= 1 completed
request/second, with zero invalid responses. No sample is discarded after timing
starts. Report every scenario and expose the worst scenario p50/p95 and minimum
scenario throughput to the native sensor; averages must not hide a slow scenario.

These are newly authorized, deliberately generous engineering targets for the
named synthetic fixture workload, not a production capacity or availability SLO.
The suite exercises real request paths; startup, DDL and seeding occur outside
the timing window. It does not cover browser rendering, saturation, external
national services, exports or write-heavy journeys. Those future workload
expansions require their own explicit populations and evidence.

Keep all existing scorecard thresholds and N/A declarations unchanged. The suite
asserts the new targets, and the existing native `perf_test` task adapter reads
its actual metrics and exit status. Missing fixtures, bad response shapes,
request errors, incomplete populations or command failures cannot become PASS.
Persist raw observations and keep any product remediation in separate tasks.

## Sources and verification

`law/targets/performance.json` and `law/invariants/INV-OPS-002.json` state the
contract. `backend/app/tests/performance/backend-baseline.perf.spec.ts` checks it.
`tools/devai/scorecard-local-task.mjs perf` provisions and removes isolated
fixture services, reusing the existing DDL/seed and test environment.
