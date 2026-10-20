# R-0039 proposed post-integration closure packet

Auditor, read-only preparation. No repository writes, registered effects, measurements, closure, PC allocation or attestation were performed by this packet. The JSON draft is a preparation template, not a schema-valid ready-to-execute closure input: gate results, validation criteria and authentic epoch binding must be materialized after actual checks. Provider-generated fields must remain absent from input.

## Observed delivery and limits

PR #209 merged candidate `fab650cf2bab83b4b512183e4da615e65f81be70` as main `f3dfc6ee47a94249631bf14e3242aeb309e36001`. Exact-main CI run [39342934423](https://github.com/aarusso-nyx/detran/actions/runs/39342934423) succeeded. Branch protection requires, strictly, evidence-gate, foundation, senatran-mock, senatran-mock-tests and verified-local-rc; all five succeeded. Backend-kernel and boat-documents-real also succeeded. Preserve the separate failed `Verify trusted local RC evidence` observation and skipped stack-smoke. Required remote fallback success does not establish a local attestation.

C3 preserves 1,139 endpoint groups: 1,004 conditional application-policy bindings, six application public routes, 121 mock endpoints and eight test fixtures. Supplemental source normalization has zero unresolved application-policy classifications; this does not resolve the native sensor's 1,094 endpoints without roles, demonstrate runtime enforcement, or create a default-deny policy. C4 preserves 211 known fields: 70 native heuristic candidates plus 141 additional blueprint matches (158 blueprint fields, 17 overlapping native candidates). The union is 211 fields = 158 with source-declared blueprint classifications + 53 heuristic-only pending classifications, equivalently 70 native candidates + 141 additional blueprint fields with 17 overlapping. All211 processing-purpose and legal-basis decisions remain pending. Retention has73 entries with no declared value,134 source-declared but not operationally validated, and4 source-declared indefinite values requiring review. Preserved source classifications/retention declarations are inventory facts/proposals, not new Owner legal approval. Sources cover 363 SQL tables and 4,122 columns. Both supplemental registries explicitly declare native_sensor_compatible=false.

Immutable R-0039 delivery archive retains source `6e459da656465922f408981d55953701d2da96e9`, independent PASS reviews/bridge, 63 exporter/checker/wrapper tests, native body generation, explicit three-input checker, blueprints/contracts and backend logs. The registration receipts report `ok=true`, action `already-recorded`, and `result.verdict=pass`: that PASS describes successful custody registration. Their embedded seven rebuilt SensorReading objects ALSO literally retain `status=pass` and the `REBUILT_FROM_BODY` finding, exactly as the existing files specify. Those synthesized statuses are not the original sensors’ measured verdicts. The rebuilt objects omit the original run's metrics/findings; that omission is an authentic limitation of those objects, not evidence that the original archived bodies or generation report were lost. The separate immutable generation capture preserves the actual original aggregate execution_status=pass, readiness_status=review, exit_code=1, its reading status=review, per-producer metrics/findings including inventory_rbac_status=review, inventory_coverage_status=review and endpoints_without_role_count=1094. All seven original body archives remain hash-bound and unchanged, alongside the seven rebuilt reading archives. Thus registration success, synthesized reading status, actual original measurement and present integration CI must be reported separately. No original run provenance is reconstructed from a rebuilt registration. Integration CI on f3 is current integration evidence, not a retroactive re-execution of those seven sensors. Do not regenerate, rewrite or relabel historical reports. BL-0020 remains OPEN, resolved_at=null. No backlog item is resolved by this packet.

Selected canonical source, threshold, N/A, legacy-chain and BL-0020 bytes match f3 exactly. Current fab and f3 have the same 163-record chain. C2 closure candidate has 164 records preserving the complete 163-record prefix. A read-only manifest captures 1,238 existing protected paths; it is an initial observation and must be replaced/supplemented by an exact fresh-main snapshot after PR #210 integration, especially R-0038 closed/sealed bytes.

## Preconditions and bounded decision

Wait for PR #210 merge and its final required green checks. Refresh remote main without rewriting other worktrees; create an isolated R-0039 closure branch from that exact integrated base. Require successful completed post-PR210 main CI for the exact new main commit before any R-0039 registered effects. Preserve the earlier f3 success and separate optional-verifier failure as historical observations. Verify R-0038 officially closed/sealed, its allocated PC and records present, and the entire expected 164-record prefix preserved. If main acquired further legitimate records, preserve its entire actual prefix and explicitly reconcile the expected 164-record subset; never truncate to 164. Re-read branch protection and complete check-runs; capture post-210 CI results separately from f3. Do not claim success from a running job.

D-1 already exists in R-0039 AUTHORIZATION. A new D-2 is required for bounded acceptance of the integrated normalization and closing this round. Record the Architect's actual decision under the Owner's direct campaign authorization and delegated recommended-choice instruction; do not write a fictitious new human answer. Confirm the Owner has not returned and actual decision time is before the conservative 02:30 UTC October 20 boundary before relying on that temporary delegation. If outside it, direct authority for already authorized work persists, but do not assume a new Owner-choice delegation. Preserve original D-1 text and historical decision entries; add an append-only R-0039 ledger annex and explicit scoped D-2 acceptance. This is acceptance of truthful normalization and preserved gaps, not legal, permission, compliance or readiness approval.

Prepare task/authority scope and obtain independent task-review PASS before effects. Allowed changes: R-0039 current authorization/plan/lifecycle and new post-integration reports; append-only decision annex; one provider-generated new PC; canonical chain append and current R-0039 epoch append; generated current round index; R-0039 README row. Exclude product source, other packages/round closures, backlogs, thresholds/NAs, legacy chain and all historical bytes. No new ADR is needed merely to execute this existing closure workflow; if substantive authority/contract changes become necessary, stop and scope them separately.

## Ordered official execution (by parent, not executed here)

1. Snapshot exact current base commit/tree, complete canonical chain, existing epochs/PCs, legacy chain, thresholds/NAs, backlogs, historical R-0036/R-0037/R-0038, and all R-0039 archives. Include fresh R-0038 state from PR #210. Verify existing chain before writing. Archive CI/check snapshots, population reconciliation, original source provenance, independent reviews and custody manifest. Preserve original JSON bytes and hash both original and any normalized explanatory copy.
2. Record actual D-2 and scope review. Prepare a generic evidence payload referring to the new manifest using the installed schema; truthful claims include pending residuals. Prepare closure input without id/schemaVersion/closed_at, with D-1/D-2, merged_as=f3dfc6ee47a94249631bf14e3242aeb309e36001 (C3/C4 integration), release_disposition=none-needed, source_repo_deleted=false, actual passed scoped gates and schema-valid validation criteria. Closure-base main and source integration commit are distinct.
3. Emit registered evidence, preserve complete stdout/stderr/argv/exit, stop dependent effects on failure:

```sh
pnpm exec devai evidence record --kind generic --round R-0039 --repo-root . --input work/rounds/R-0039/reports/post-integration/evidence-input.json --as-role auditor --write --format json
pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human
```

4. Recheck full original chain prefix and all protected bytes. Read the actual latest line_hash from `record/proofs/work/generic/R-0039.jsonl`; bind this authentic tail as closure evidence. Never predict a hash or copy R-0038's terminal. Invoke:

```sh
pnpm exec devai round close --round R-0039 --repo-root . --input work/rounds/R-0039/closure.json --as-role architect --write --format json
```

5. Read actual receipt and newly generated machine closure/PC for R-0039; require exactly one new closure for this round. Do not predict the next PC number. Preserve the provider's generated metadata. Create the schema-valid closed round declaration from existing R-0039 record, adding status=closed, closed_by=D-2, phase_closure=actual PC, merged_as=f3. Then:

```sh
pnpm exec devai round plan --round R-0039 --declare scratch/r0039-closed-record.json --repo-root . --as-role architect --write --format json
node tools/devai/render-rounds-index.mjs --repo-root . --write
```

6. Update only R-0039's `work/rounds/README.md` row to closed, PR #209, actual PC and truthful scoped summary. Renderer manages the derived canonical index, not that human README. Preserve R-0036/R-0037/R-0038 rows. Finish lifecycle:

```sh
pnpm exec devai round seal --round R-0039 --repo-root . --as-role architect --write --format json
pnpm exec devai round status --round R-0039 --repo-root . --format json
```

7. Recheck historical hashes, entire prior chain prefix, preexisting R-0039 epoch bytes as prefix, unchanged BL-0020/all backlogs and valid new provider outputs. Archive exact effect receipts and errors, including any preflight refusal. Never manually repair state/proofs or weaken a guard.

## Low-cost verification and integration

After registered effects, run scoped formatting for changed files; `pnpm verify:law-corpus`, `pnpm law:test`, `pnpm verify:state-index`, `pnpm verify:rounds-index`, `pnpm verify:round-tasks`, `pnpm verify:proof-anchors`, and `pnpm devai:doctor`. Use `pnpm test:state-index` and `pnpm test:rounds-index` for changed lifecycle/index behavior. Inspect any failure and preserve pre-existing vs introduced failures separately; no unconditional success swallowing. These are proposed checks, not executed PASS claims. Avoid the full serial monorepo suite while the independent provider RC gate occupies the host; authoritative full required CI remains mandatory for the closure PR.

Obtain final independent delivery review. Commit only scoped closure changes and open a separate PR. Verify the actual new head's five mandatory checks remain green immediately before an authorized merge; preserve both histories. Capture final main CI and low-cost post-integration official status/chain/preservation observations. Closing R-0039 does not close the overall C2-C8 campaign, BL-0020 or native observation gaps.
