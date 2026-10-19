# PR203 post-merge audit and evidence custody

Architect report; observation executed separately as Auditor through the supported verb.

PR #203 merged candidate `178addd68d748ed5cc82d450068e178d1b996c81` as
`2df548e0ac5227abb64b66994f675dea7ba36a5a` at 2026-10-19T18:00:26Z.
All five required candidate contexts passed: evidence-gate, foundation,
senatran-mock, senatran-mock-tests and verified-local-rc. Backend-kernel and
boat-documents-real passed. Stack-smoke was SKIPPED, never counted as PASS.
The exact-merge DETRAN CI run39298941118 also passed all its executed jobs.

## What is integrated

Approved S1 plus its bounded loader/identity/A2–A5 extensions now enforces the
closed CASE/WORKLIST scope, parent, projection and replay contracts. The107-method
baseline dispositions remain71 replacements,25 retained scoped methods and11
removals. CI follow-up corrected four existing test fixtures (RLS table inventory,
admission routing receipt, CTG2 direct-service scope and upgrade SQL inventory).
Those repairs did not change runtime, SQL, permissions, thresholds or retries.
ci-repairs.json records the four corrective commits, exact touched paths and
final test hashes, with an explicit tests-only assertion.
The final full remote backend run passed; earlier failures and rerun epochs remain
preserved in the PR and S1 source/evidence records. No old report was rewritten to
pretend it covered a later source epoch.

The concurrent main PR204 scorecard closure is preserved. Its only conflict was
the divergent evidence chain, reconciled through original snapshots and supported
anchor recovery/custody recording; see ../pr203-ci-reconciliation-20261019/.
Main's146-record prefix and original S1 proof bytes were verified intact.

## Exact-merge observation, without readiness promotion

Before drafting changes, the CLI invoked with `--as-role auditor`
(the evidence-chain actor is devai-cli, actor_role=harness) ran
`devai audit observe --at 2df548e0ac5227abb64b66994f675dea7ba36a5a
--round R-0025 --as-role auditor --write` emitted `EV-ded4f5431f6737ad` and
`SC-20261019T180026-001`. Canonical machine outputs are under
`.devai/state/audit-observations/2df548e0ac5227abb64b66994f675dea7ba36a5a/`.
The generated assessment is YELLOW:0/45 passing,43 UNKNOWN,2 N/A;
readiness_promoting=false. Command success is observation success, not quality PASS.
The emitted generic sensor-gap narrative is retained as machine output; this lane
makes no scorecard remediation or assertion that the separate evaluation is absent.
No scorecard policy, frozen reading, threshold or R-0036 artifact is changed.

## Separate main verification exception

Trusted-local-RC workflow39298941092 failed at protected evidence-tag lookup with
HTTP404, followed by missing verification-summary output. No local attestation tag
was published for this tree by the S1 CI-repair lane. The full DETRAN CI fallback
independently completed and published a later successful verified-local-rc check;
main-checks.json records both outcomes. This is not reported as all workflows green
or a successful signed local attestation. The same automatic-tag dependency has an
earlier failed run on main653e3401 followed by a successful attested run.

Track the missing-tag/summary handling as a separate CI/attestation follow-up;
repairing that workflow, publishing a signed RC or changing trust policy is outside
this planning-only S2 proposal. It is not a new domain decision or an S1 runtime
failure, and cannot be waived as release evidence.

## Remaining scope and disposition

S1 is integrated; R-0025, CP-01 and JW-01 remain open. Current claim still needs
risk composition, qualified legacy handling, safe complete-pool ordering and atomic
new-case transitions. The frontend claim remains unavailable, with placeholder
pool/old response handling. Recommend backend-only S2, then a separately approved
S3 typed claim→dossier/browser slice; this explicitly splits original T3 from T4–T6
UI activation while retaining every acceptance obligation. A2's unavailable batch
position/deadline/acceptance and pending-item details remain required later typed
restoration, never completed journeys. No production identities, bindings, live
ladder promotion, provider qualification, deployment, close or seal is inferred.

The exact proposed packet is ../P4-02-S2-approval-packet.md. Until approval, no S2
runtime/test task creation or dispatch occurs. Preserved branches, recovery patches,
RC receipts, local configuration and independent scorecard work are retained.

## Preserved S1 local task metadata

The exact-merge observation's Git context includes untracked S1 TASK-0028…0031,
backlog/worktree records and six expired S1 module locks. The committed source
snapshot is exact2df548e0; the host checkout was not wholly clean. These files
were preserved, not marked as managed completed or manually deleted. S2 preflight
must truthfully reconcile custody/release through supported verbs and avoid ID/
lock collisions before any separately approved registration. No task/lock/worktree
cleanup occurs in this post-merge planning lane.
