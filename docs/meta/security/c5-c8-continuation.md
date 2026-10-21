# C5–C8 continuation and C6 escalation proposal

Architect assessment, 2026-10-21. R-0041 remains active. This continues the
Owner-authorized campaign and ADR-0057; it does not change its native-activation
decision, thresholds, permissions, source contracts or closed rounds.

## Current scoped observations

Nine read-only sensors were executed against main
`1115f58960679291744e93a3fb59feb35d849cbb`, using installed DEVAI 2.6.3 and
the existing declared inputs. Exact invocation transcripts, reading bodies,
recording receipts and usage errors are retained in the
[R-0041 continuation capsule](../../../work/rounds/R-0041/reports/continuation-20261021/README.md).
These are baseline observations, not a scorecard for this document's later commit.

| Front | Sensor                      | Native result | Disposition                                                                                                                              |
| ----- | --------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| C5    | `spec_robustness_targets`   | PASS          | One error-semantics invariant and one error contract recognized; does not prove execution, complete robustness or production readiness.  |
| C5    | `spec_security_coverage`    | REVIEW        | Threat model and RBAC recognized; native SQL PII registry absent. Preserve sourced supplemental PII data and unresolved legal decisions. |
| C7    | `docs_drift`                | PASS          | Zero drift; worktree-cap coherence is explicitly skipped because its source is unconfigured.                                             |
| C7    | `harness_security`          | PASS          | Two workflows, no unpinned actions or missing permission blocks in this sensor's population.                                             |
| C7    | `harness_coherence`         | REVIEW        | One concurrency-policy finding; retain pending provider/source-projection diagnosis.                                                     |
| C7    | `harness_idiomaticity`      | REVIEW        | Cache present; composite/reusable references absent. Extraction requires demonstrated repetition and preserved trust boundaries.         |
| C8    | `decision_record_integrity` | FAIL          | One historical ADR without required frontmatter. Preserve its original bytes.                                                            |
| C8    | `round_record_integrity`    | FAIL          | Fourteen missing records and one R-0017 archive finding. No retroactive record or closure is created.                                    |
| C8    | `archive_immutability`      | PASS          | No findings for this predicate; does not cancel the separate round-record failure.                                                       |

All nine valid readings were persisted through `sense record`. Persistence
acknowledges the actual PASS, REVIEW or FAIL; successful recording is not a PASS
for the sensor. The original proof prefix remains intact. The initial incorrect
role flags were rejected before execution and retained separately; corrected
read-only invocations supplied no authority flags. Recording used the supported
Inspector declaration and local-write consent.

## Unblocked follow-up and dependencies

1. C5: maintain the threat/source index with the accepted RBAC and API invariants.
   This continuation corrects its obsolete compatibility note. Native executable
   standing is still deferred as a complete nine-producer set under ADR-0057.
   No PII SQL declaration is added merely to satisfy discovery. BL-0019 remains open.
2. C7: preserve the actual CI group `${{ github.workflow }}-${{ github.ref }}`
   and `cancel-in-progress: true`. The native REVIEW coexists with those source
   literals. This discrepancy requires a bounded provider diagnosis; its cause
   is not established here. Do not simplify the workflow, edit the protected
   verifier, add gratuitous abstraction or alter a verdict to obtain PASS.
3. C8: preserve the earlier frozen findings as historical observations. The
   current sensor no longer reports the nineteen unresolved closure references
   in the older capture; that difference does not establish that this
   continuation repaired them. Missing records, R-0017 and the legacy ADR finding
   stay explicit. The additive compatibility checks are supplementary controls,
   not native exemptions. BL-0022 remains open.
4. After supported native activation and any necessary reference decisions,
   freeze a new candidate and execute/record the canonical evaluation in
   dependency order. Nine readings here are not nine distinct scorecard cells,
   nor a fresh evaluation of all 43 applicable cells.

## C6: non-executable escalation proposal

**State: proposed escalation package; no technical replacement is approved.**
The protocol-v5 review was withheld by a safety classifier; no valid verdict or
detailed reason was available. The retained observation is in the capsule.
Human authorization to continue the campaign does not supply the missing
security verdict. The complete native WIP and immutable archive remain preserved.

Recommended next action: provide the existing incident metadata to the responsible
human maintainer through an available official safety/support escalation process.
The maintainer should determine the sanctioned handling of the refusal and whether
any further review is permissible. This document neither dispatches that request
nor invents a support endpoint, approver or response. A human response alone is
not a replacement technical verdict.

The escalation packet consists only of the actual failure status and retained
excerpt, available artifact identities and limitations, the needed evidence
properties below, and the current dependency boundary. Do not reconstruct the
withheld response or supply implementation instructions for the blocked protocol.

Required properties of any future, independently approved provider capability:

- Authentic execution origin, exact candidate identity, complete declared test
  population and raw result custody must remain verifiable.
- Isolation, least privilege, request-path tenant/RLS behavior and bounded cleanup
  require explicit review and negative acceptance cases.
- Existing ordinary CI and disposable-service test results remain ordinary
  observations; they cannot be relabeled native evidence.
- All nine additional producers remain deferred together until every applicable
  contract, implementation, independent security review and acceptance gate is met.
- Generated bindings, receipts and readings use official commands. No synthetic
  nonce, hand-authored receipt, trust substitution or threshold relaxation is allowed.

If an official escalation permits a materially different capability, its design
must receive a new explicit decision and the applicable security review before
implementation. No alternative mechanism is selected or prototyped here. Do not
retry/rephrase the withheld review, switch reviewers/models to obtain it, implement
or execute the blocked protocol, or infer permission from an unrelated PASS.
If no sanctioned route is available, C6 stays blocked and C5/C7/C8 continue only
within their independent scopes.

The provider release/adoption dependency is separate: DETRAN remains pinned to
DEVAI 2.6.3. Publishing 2.6.4 requires its approved signing-key custody and official
release gates; neither publication nor adoption would itself clear C6.

## Preservation boundary

R-0036 through R-0039 remain closed. Existing R-0041 reports, native WIP archive,
legacy chain, thresholds, N/A declarations, original task declarations and product
backlog retain their prior bytes. New proof records are emitted only by official
verbs, with the entire prior chain retained as a prefix. No product behavior,
permissions, retention rule or legal basis changes in this continuation.
