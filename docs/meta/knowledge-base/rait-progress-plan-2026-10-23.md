# RAIT progress plan — 2026-10-23

**Authority:** Architect. **Status:** Owner approved parallel packet preparation; schedule integrated by #217. No S3 runtime or PR211 merge authorization.

## Purpose and retained baseline

Amend the execution schedule under [COMPLETION-PLAN.md](../../../COMPLETION-PLAN.md)
and ADR-0042 rather than restart the campaign. C-0003 and R-0025 stay open. Preserve
P1–P3, D1–D11, approved S1/S2 packets and extensions, all original command/journey
acceptance, tenant/role boundaries and separate development/qualification/release
milestones. Scorecard work, local configuration, recovery patches and receipts are
outside this plan. No branch or worktree cleanup is proposed.

The approved scheduling change is narrow: prepare S3's source reconciliation
and review packet while S2 integration is blocked. S3 runtime still waits for S2
integration, its separately authorized audit, an exact approved packet and the
Architect → Inspector RED → Engineer → Inspector GREEN sequence. The final
paragraph of the S2 approval packet remains historical authorization; only its
**timing of packet preparation** was approved by the Owner on2026-10-23 and
integrated through #217; runtime entry gates remain unchanged.

## Evidence baseline and truthful status

Snapshot: main `a97e6def6cc4b80d65c5ab0ee9579241f0b33446`; preserved S2 PR #211
head `cd2b6740d41676d000fd0f30ba6049ff3d8073cc`. Recheck both before execution.
Main includes #215; #211 is open, draft and reports merge conflicts. Do not copy
whole preserved branches into main or treat main's later checks as S2 acceptance.

| Classification            | Current disposition                                                                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrated                | Admissibility #193, S1 scope/parent/projection/replay #203; S2 approval packet #205                                                                                                                              |
| Awaiting integration      | S2 backend risk/qualified-legacy/atomic-claim work and approved amendments in #211; approval is not missing                                                                                                      |
| Validation pending        | Scope355 and JW-01-51 suites, uninterrupted canonical backend kernel and complete required exact-head checks; the full claim suite has a recorded126-pass checkpoint, not acceptance of a future reconciled head |
| Performance unresolved    | Approved functional90s/diagnostic120s limits apply only to four51-case controls;30s remains the performance reference. All eight recorded adoption control observations exceeded30s                              |
| Integration blocker       | CI run39698481809: orphan proof line7, dependent foundation failure/backend skipped, plus separate stack-smoke failure whose cause is not established                                                            |
| Stale planning            | S2 “awaiting approval/no dispatch” banners predate #205 and subsequent execution; correct current summaries, preserve dated history                                                                              |
| Unfinished implementation | S3 analyst UI/typed integration and remaining JW-01 dossier/documents, inquiry/resumption, versioned draft and signing/return journey; whole RAIT operations remain open                                         |
| Deferred decisions        | OD-C3-009 before affected JW-02/05/08; source/provider and institutional release inputs; S3 exact ownership/acceptance approval                                                                                  |

Evidence remains in #211 at its pinned head, especially
`work/rounds/R-0025/reports/S2-execution/PERF-01/adoption/final-summary.md`,
`final-validation.json` and `resume.md`. Do not recreate or promote those receipts
on this planning branch. Resource-window status is historical and must be measured
again; elapsed time never turns pending validation into PASS.

## Delivery lanes and dependency gates

These are scheduling references, not new rounds, task IDs or authority grants.
Each execution packet must name exact owned paths, role, stop conditions and checks.

| Lane / sequence                      | Owner discipline and bounded output                                                                                                                                                                                                     | Entry / completion gate                                                                                                                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 — reconcile S2 integration        | Architect inventories conflicts against current main and maps every preserved S2 amendment. Engineer resolves only authorized source paths; Inspector owns test conflicts. Preserve main's later security/Portal work and ADR numbering | Existing S2 approvals remain binding; any necessary unowned path needs a bounded amendment. Deliver one reconciled candidate, no force-push, no duplicate implementation branch                                                                                                          |
| A2 — validation and CI diagnosis     | Inspector resumes approved scope/JW-01 checks after resource/DB preflight; executes canonical kernel and affected/root gates. Diagnose stack-smoke from actual logs/services and separate inherited failures from regressions           | Preserve full populations, assertions and approved four-control limits. Canonical kernel must unset DETRAN_TEST_TIER, DETRAN_P402_CALIBRATION_MODE and STYNX_RATE_LIMIT_DEFAULT. A source change invalidates affected earlier acceptance; retain old receipts and rerun justified stages |
| A3 — proof custody recovery          | Architect tracks upstream DEVAI delivery; Engineer may adopt only a separately approved released fix; Inspector proves recovery and chain verification                                                                                  | DEVAI #420 accepted ADR-EVI-0006 only: issue #418 closure is not implementation/release. Require upstream tests, implementation, authorized release and exact DETRAN adoption packet. Never edit chain hashes or suppress evidence-gate                                                  |
| B — prepare S3 concurrently          | Architect reads frozen S2 API/contracts and main's UI/route/role sources; produces operation-to-view map, omission/error/retry rules, ownership inventory, RED scenarios and exact S3 approval packet                                   | Planning/contracts assessment only in docs and round reports; no contract schema or runtime edits, test edits, new grants or activation. Mark assumptions against pinned S2 head; revalidate every delta after A1 and S2 merge/audit                                                     |
| C — integrate S2                     | Independent review, all required exact-head CI checks, then explicit merge authorization and scoped post-merge evidence/audit                                                                                                           | A1/A2/A3 complete where required; #211 remains unmerged until authorized. No planning PR bypasses its proof gate                                                                                                                                                                         |
| D — deliver S3                       | Separate exact-packet approval followed by role-separated implementation and routed/browser acceptance on integrated S2                                                                                                                 | S2 merged/audited and packet refreshed; pool selection, uncertain attempts, data.id→dossier, current-risk header and truthful preview are candidate scope, not yet commissioned implementation                                                                                           |
| E — finish JW-01 in bounded outcomes | Prepare source-backed packets for dossier/official documents; inquiry/resumption; versioned draft→ready/signing handoff and authority return. Restore A2 omissions in their owning outcome                                              | Sequence by actual shared state/contract dependencies. Each outcome requires complete user-visible acceptance, not merely transport. No whole-round closure before aggregate journey and all original obligations are verified                                                           |
| F — remaining RAIT operations        | Reconcile JW-02…12 against64-command obligations and approved additions, then prioritize exact vertical packets                                                                                                                         | Resolve affected OD-C3-009 conflicts first; preserve role boundaries/shared locks. No blanket activation of all operations or restart of stopped R-0022                                                                                                                                  |

A1/A2 can progress without waiting for the upstream recovery release, but C cannot
bypass it. B can proceed without runtime changes or a passing evidence chain;
its eventual PR must still satisfy required checks. Parallelism does not authorize
simultaneous writers under shared policy/backend locks or duplicate Inspector
reference signals. Keep Portal/Dashboard producer dependencies explicit; retain
RAIT-first and PEC-last scheduling and P5–P7 boundaries.

## Review decisions and immediate next action

Owner approved **S3 packet preparation only** in parallel with A,
retaining S2 integration/audit as the prerequisite for S3 runtime. This proposal
itself executes no A1 source reconciliation, tests or S3 runtime. No reapproval of
D1–D11, S2, or the90s/120s budget is requested.

With preparation authorized, start with A1's conflict/ownership inventory and B's read-only
source/acceptance map. Report the smallest actionable missing authorization;
do not ask for a broad permission to “finish RAIT.” S2 merge, upstream adoption,
any newly unowned repair and the final S3 packet remain separate explicit gates.
For later operations, present OD-C3-009 with exact route/role consequences before
the first affected packet. Qualification/release inputs do not prevent truthful
software development, but they prevent a production-readiness claim.

The success measure for this amendment is a reconciled S2 candidate plus a
reviewable S3 packet prepared while integration blockers are resolved. Completion
still means accepted journeys, complete command coverage and applicable Q/O
proof; a green subset, approved plan or scorecard reading is insufficient.

## Executed preparation and remaining gates

PR217 integrated as `1c8488028cddc2c9526b8b9d06465e83987a1a3c` after all five
required checks passed on reviewed head6f8b673a. The stale S2 stop instructions
were corrected; their review conversation was resolved after independent checking.

The [preparation report](../../../work/rounds/R-0025/reports/S3-preparation/README.md)
records the exact S3 packet (34 proposed paths), A1 inventory and unapplied prose
resolution patch, and separately proposed one-file smoke diagnostics. Post-merge
A1 still finds three planning conflicts and the machine-only chain conflict;
no runtime/test conflict. S3 runtime and PR211 merge remain held. The Owner approved the diagnostic
extension with PR221-first sequencing; quiet-window S2 checks retain their
existing authorization and have not been fabricated as completed.

## Review references and planning validation

- [S2 approval #205](https://github.com/aarusso-nyx/detran/pull/205).
- [Preserved implementation #211](https://github.com/aarusso-nyx/detran/pull/211).
- [Observed CI run39698481809](https://github.com/aarusso-nyx/detran/actions/runs/39698481809).
- [Upstream recovery ADR #420](https://github.com/aarusso-nyx/devai/pull/420).

Planning validation: changed-file formatting, KB check/publication dry run, rounds
index verification and its10 tests, DEVAI2.6.3 doctor and main-derived proof-chain
verification passed. This branch contains no S2 proof lines: its valid chain does
not recover #211's orphan. No runtime suite or performance measurement was rerun
for this documentation-only proposal.
