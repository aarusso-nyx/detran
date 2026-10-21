# Approved calibration results

Measured source: `0979345f`; all24 native body observations completed, plus one preserved setup-only failure. Profile:4/4 assertions passed under120s. Functional:17/20 passed under90s;3 were right-censored at90s. All24 exceeded the separate default30s reference. These are experimental assertion-completion results, not performance acceptance, CI approval or a product SLO.

| Control | Profile120s | Functional rounds1–5 (seconds) | Cohort empirical median | Cohort maximum |
|---|---:|---|---:|---|
| risk | 41.200 PASS | 47.248 PASS, ≥90 FAIL, 40.016 PASS, 32.478 PASS, 35.139 PASS | 40.016 | ≥90; upper bound unknown |
| legacy | 39.001 PASS | 39.317 PASS, 40.649 PASS, 33.254 PASS, 41.713 PASS, 35.614 PASS | 39.317 | 41.713 |
| routing | 48.849 PASS | ≥90 FAIL, 48.976 PASS, 39.059 PASS, 39.365 PASS, 38.304 PASS | 39.365 | ≥90; upper bound unknown |
| incident | 43.244 PASS | ≥90 FAIL, 51.228 PASS, 36.177 PASS, 41.276 PASS, 59.286 PASS | 51.228 | ≥90; upper bound unknown |

The censored observations are completion intervals `[90s, ∞)`, not actual90s completions. The five-point empirical medians above remain identifiable because each cohort has at most one censored observation. No p95 or population/tail bound is estimated. The maximum completed observation59.286s excludes censored failures and is not a cohort maximum or evidence that90s is adequate for all host conditions.

## Conditions and scope

Each planned observation used a separate normal native serial Vitest invocation, fresh application lifecycle and supported canonical seed plus legacy20 preparation. This isolation was chosen to drain previous late work; cache/host/setup conditions are disclosed rather than controlled away. The one routing round1 attempt failed its unchanged10s protocolBatch setup hook before entering the body; it is preserved as an extra epoch and transparently followed by the planned body observation. No failed body was retried. Three body timeouts also include late/teardown effects in their complete logs.

The body measures the entire four-request control: two pages, independent source poisoning, whole-pool discovery, claim and assertions. Setup306HTTP requests are reported separately from the four body HTTP requests. Aggregate setup duration is not an individual-hook budget. Hooks,51 population, all assertions, source revisions, independent verification and runtime were unchanged.

Detailed profile observations include all body-phase query categories and per-operation partitions in final-results.json, with original full query/span traces in deterministic gzip raw logs. Query leaf elapsed includes driver/network/PostgreSQL/scheduling time. Before/after observer overhead is separate; nested inclusive qualification/dependency spans are not added to leaf totals. Lexical lock classification does not prove server lock-wait duration. No causal subtraction of profile versus functional is made.

Functional modes proved the pg.Client.query prototype remained original and emitted zero detailed P0 snapshots. Lightweight request finish listeners recorded body/setup/late HTTP wall times. For censored cases, missing/pending/late requests remain explicit; no fourth successful request is invented. Native JSON/exit is authoritative. Every epoch retains before/after8CPU/16GB host load and owned-container statistics. High host contention is observational context, not grounds to discard samples or infer cause.

## Custody and closure

final-results.json contains all25attempts, four-request status/timing arrays, late events, native results, source hashes, per-control five-value cohorts and profile partitions. all-epochs.json preserves the original driver metadata. Each epoch retains complete raw.log.gz, result.json, supported preparation and host snapshots. Uncompressed/gzip SHA256 and byte counts were independently verified during packaging; no log truncation. Raw logs contain synthetic test identifiers; secret-pattern scan passed with no credential/DSN/token matches.

Owned disposable database53343 was quiescent after the final runner exited: detran_r7_ctg1_a2|0 other clients. Lease explicitly released to root. No additional E2E or full kernel was run for this experiment.

After measurement, only observer-selection compatibility was corrected so the pre-existing single-case equivalence control always retains detailed P0 even under explicit functional mode. All four measured selector paths are truth-table identical and their emitted body JavaScript remains byte-identical. postmeasurement-compatibility.json records measured/final source hashes and the complete truth table; new bytes are not represented as measured. App typecheck and scoped pinned Prettier passed. Default CI remains30s and retains default detailed P0;90s/120s are explicit experiment modes only. Final runtime optimization, CI/merge/readiness and authentic production-source availability remain outside this evidence.
