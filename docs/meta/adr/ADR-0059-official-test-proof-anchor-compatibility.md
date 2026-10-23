# ADR-0059: Verify official test proof anchors without relaxing custody

## Status

Accepted by the Architect on 2026-10-23 under the Owner-authorized R-0043 E2E remediation and its requirement to preserve governed evidence and controls. This is a local consumer compatibility decision for the already installed DEVAI 2.6.3; no provider publication or C6 approval is inferred.

## Context

The official `devai evidence record --kind test` successfully executed the complete SENATRAN mock E2E suite and emitted `record/proofs/work/test/R-0043.jsonl` with its matching machine anchor. The installed chain verifier accepts the emission. The local proof-anchor consumer admits only generic and historical-gap namespaces, so it rejects this supported test proof before checking its anchor. The emission and the observed refusal are preserved.

## Decision

Admit exactly the existing official `test` namespace in addition to the two previously supported kinds. Require the canonical kind/round path, physical sequence, unique matching evidence.record.test anchor and exact proof_path, proof_sequence and SHA-256 of the physical proof line. Unknown kinds, missing/duplicate references, namespace confusion and changed bytes remain errors. Keep all historical exceptions, cutoffs and legacy generic behavior unchanged.

The installed DEVAI chain verifier remains a required second verification. Local acceptance establishes proof custody only: a valid record containing a failed test stays failed. It cannot establish native execution provenance, a scorecard PASS, readiness or permission to activate an invariant producer.

## Validation

Append adversarial tests for test/generic namespace separation, path/hash/sequence mismatch, missing and duplicate anchors, tampering, unknown kinds and valid retained failed results. Run the complete existing proof-anchor tests, real proof-anchor and installed chain verification. Preserve the historical chain prefix, legacy chain bytes, closed rounds, assertions and thresholds.

## Boundaries

No proof line is rewritten or deleted. No exception is added. No native producer, service/custody protocol, permission or threshold changes. C6 remains blocked. The E2E source correction and its unchanged assertions remain independently reviewable in R-0043.
