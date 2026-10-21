# C5–C8 scoped continuation — 2026-10-21

Evaluation baseline: `1115f58960679291744e93a3fb59feb35d849cbb` (main).
Round: R-0041, still active. Installed DEVAI: 2.6.3.

See the [continuation and safe C6 escalation proposal](../../../../../docs/meta/security/c5-c8-continuation.md).

- `summary.json`: nine native read-only observations, four PASS, three REVIEW,
  two FAIL. No fresh complete 43-cell scorecard is claimed.
- `read-invocations/`: exact commands and actual stdout/stderr/exit status.
- `normalized/`: exact reading content extracted from native command envelopes;
  no verdict, timestamp, ID or metric was synthesized.
- `record-invocations/`: nine successful official `sense record` receipts,
  including the FAIL and REVIEW readings.
- `machine-reading-paths.json`: exact generated state artifacts referenced by
  the new chain records; included without hand-editing their bodies.
- Top-level sensor captures and `archive_immutability-record.json`: rejected
  role-flag invocations retained as usage errors, not sensor observations.
- `protected-before.json`: hashes of pre-existing protected files before recording.
- `c6-review-blocked-observation.json`: retained original refusal metadata;
  the unavailable full response is not reconstructed.
- `main-ref.json`, `main-ci.json`, `main-attestation.json`: actual remote queries.

The native C6 protocol review was not retried, sent to another reviewer, implemented
or executed. C7's concurrency discrepancy is a remaining finding, not a diagnosed
provider defect. The old C8 findings and the two local App failures from the prior
delivery remain in their original histories.

Checks and preservation outcomes are captured additively alongside these files.
Nothing in this capsule closes a round, resolves a product backlog item or grants
native standing to ordinary CI logs.

## Completed validation

The unchanged canonical `pnpm security:history:check` completed with 47 tests
passed, zero failures/skips/TODO in the extended capture. The original 180-second
capture remains explicitly incomplete; neither test assertions nor their timeouts
were changed. `law:test` passed all 56 tests. Documentation/publish checks, state
and round indexes, installed reading-schema validation with date-time formats,
formatter, doctor and full proof-chain verification passed.

`preservation-final.json` confirms the entire original 168-record prefix within
the 178-record chain, the prior R-0041 proof prefix and all other 6,366 protected
file comparisons. The only changed protected paths are official append targets:
`record/proofs/chain.json` and `record/proofs/work/generic/R-0041.jsonl`.

The generic proof recorded the longer historical capture as pending at its actual
recording time. Its payload remains unchanged; the later successful observation is
`checks/security-history-check-extended-capture.json`. Independent delivery review
PASS is under `../../reviews/continuation-20261021/`; it excludes technical review
of the withheld C6 protocol. Remote checks on the new PR remain a separate gate.
