# R-0036 performance and complete-output checkpoint

Candidate `599161f9c6d44efd7838dddd95256ac558ff8f84`; official readings use the
published DEVAI 2.6.2. No complete 43-cell assessment is claimed here.

- **Performance: native PASS**, for the newly Owner-authorized ADR-0044 workload.
  Worst scenario p50: 24.8 ms; worst p95: 40.1 ms; minimum throughput: 38.6 rps.
  Each scenario has five warm-ups and 30 measured correct responses. Targets remain
  p50 <= 1000 ms, p95 <= 2000 ms and throughput >= 1 rps. These new targets do not
  alter any previously bound scorecard threshold or claim production capacity.
- **Performance specification: native PASS.** The invariant and explicit targets
  exist in their canonical law records; the workload and limits were authorized
  before the first benchmark result.
- **E2E: native FAIL**, 1,853 passed and two failed. Complete retained logs identify
  the mock's `national-extensions.e2e.spec.ts` recognition case (402 versus 200)
  and `renach-workflow.e2e.spec.ts` medical-exam idempotency case (402 versus 201).
  The mock population was reused after adapter tests. Isolating/resetting those
  fixture populations is the next measurement correction; product code and test
  assertions are unchanged. Classification is pending the isolated replay.
- **CI health/robustness: native PASS; CI performance: native FAIL.** The sample
  contains 91 push/main runs, with 89 successes and no flaky runs. Median duration
  is 1,684 seconds and p95 is 2,280 seconds, above the unchanged CI thresholds.
  All three still report an unverified `baseBranch` introduced by a provider
  default even though the adopter declaration omits that inapplicable selector.
  This remains an explicit measurement limitation requiring a provider follow-up.

The exact task stdout/stderr digests were reconstructed and matched against the
native readings. Complete transcripts are retained as compressed UTF-8 JSON
archives in `raw/`, with archive hashes in `evidence-manifest.json`.

Separate, unpublished-provider diagnostics for DEVAI PR #413 successfully parsed
all 1,135 lint errors (one warning, no parser errors), discovered 361 tables in
92 SQL files and passed doctor. Those diagnostics are not promoted into official
scorecard evidence. The registered sweep command refused task-bound preset
execution (`SENSE_TASK_PRESET_REFUSED`); subsequent complete enumeration must run
the registered members individually, retaining the first/second-pass order.

The full dependency audit was also repeated against the exact pre-upgrade package
and lockfile manifests at `57ca183f`. Advisory IDs and severities are identical:
5 critical, 15 high, 13 moderate and 4 low; no added, removed or changed advisories.
These findings predate DEVAI adoption and require separate product remediation.

Coverage provenance and remaining monorepo discovery gaps remain open. The round
stays open, with historical assessments and failures preserved. Measurement counts
must not be inferred from these native PASS counts or combined across candidates.
