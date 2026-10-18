# Reconciliation record — completion-plan proposal

Architect, 2026-10-18, read-only research against main
`e536e545091d9828aef2f3c5ec0c2be6f5afb56e`. This record supports
[the single completion plan](../../../COMPLETION-PLAN.md); it is not another queue,
new implementation authorization or business-spec ratification.

## Method and limits

Fetched origin, read exact committed refs using git show/ls-tree/diff/ancestry,
compared task JSONs to round reports and main, and inspected binding steering,
accepted ADRs, product/use-case inventories, campaign criteria and issue metadata.
Current main already includes PR193 and194. Referenced gate results belong to
their recorded candidates; no branch/runtime acceptance suites were rerun here.

Only metadata of the primary scorecard branch was observed for preservation.
No R-0036 content, untracked primary work, scorecard policy, readings or commands
were inspected/executed/changed. Local-ref metadata may advance in that session;
these snapshots are observations, never a reservation or freeze of its work.

## Branch census

Counts below are original JSON statuses at each ref. A historical completed task
is not integration, current PASS, round closure or whole-journey acceptance.
Common/stacked tasks and commits must not be added across rows. Exact per-task
identity/title/status and planning destination are in branch-inventory.json.

| Ref                                             | Head       | Ancestral to main | Original own-round task statuses      | Disposition / outcome                                                                                      |
| ----------------------------------------------- | ---------- | ----------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `origin/claude/frontend-preview-5281e3`         | `aca40880` | yes               | 7 completed, 2 queued                 | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-06, CP-09         |
| `origin/codex/backlog-reconciliation-20261018`  | `666d3a1a` | yes               | not a round task snapshot             | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-00                |
| `origin/codex/detran-r22-adoption-160`          | `c22ea63a` | no                | 1 checkpoint, 24 pre_merge, 4 queued  | stopped; selective salvage only under CP-07/CP-10; previous ref is not a second workstream; CP-07, CP-10   |
| `origin/codex/local-artifacts-cleanup-20261018` | `b2c5d389` | yes               | not a round task snapshot             | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-00                |
| `origin/codex/prepare-a11y-merge-20261017`      | `0698ab1a` | yes               | not a round task snapshot             | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-00                |
| `origin/codex/prepare-rls-lexer-merge-20261017` | `7d100c09` | yes               | not a round task snapshot             | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-00                |
| `origin/codex/r0025-jw01`                       | `8fcb8d9c` | yes               | 8 completed                           | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-01, CP-02         |
| `origin/codex/r0025-post-merge`                 | `dcd40b52` | yes               | 8 completed                           | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-01, CP-02         |
| `origin/codex/r0033-portal-preview`             | `2554ff83` | yes               | 9 completed                           | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-06, CP-09         |
| `origin/codex/r0033-post-merge`                 | `7124af2c` | yes               | 9 completed                           | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-06, CP-09         |
| `origin/orchestra/authz-unification`            | `9ee0deb1` | no                | 1 completed, 1 in_progress            | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-07 |
| `origin/orchestra/boat-wiring`                  | `d79b6f02` | no                | 4 pre_merge                           | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-05 |
| `origin/orchestra/dashboard-wiring`             | `01e6afc2` | no                | 4 pre_merge                           | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-04 |
| `origin/orchestra/devai-sensors`                | `ebf308e7` | no                | 22 completed, 7 queued, 1 rgr_pending | separate-scorecard-session; historical refs retained; no execution or acceptance here; SEPARATE-SCORECARD  |
| `origin/orchestra/pec-web`                      | `7c0854f3` | no                | 3 checkpoint, 10 completed, 7 queued  | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-08 |
| `origin/orchestra/portal-delegations`           | `d64ec29a` | no                | 1 checkpoint, 4 completed             | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-03 |
| `origin/orchestra/portal-pec`                   | `3a492978` | no                | 2 checkpoint, 2 completed, 10 queued  | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-08 |
| `origin/orchestra/rait-web-wiring`              | `9e69d867` | yes               | 4 completed                           | integrated ancestry; retain history, do not remerge; residual scope remains assigned; CP-01, CP-02         |
| `origin/orchestra/stynx-sse-tenancy`            | `9af76824` | no                | 1 checkpoint, 24 pre_merge, 4 queued  | stopped; selective salvage only under CP-07/CP-10; previous ref is not a second workstream; CP-07, CP-10   |
| `origin/orchestra/teat-web-wiring`              | `679f68db` | no                | 2 completed                           | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-05 |
| `origin/orchestra/user-docs`                    | `a9e19915` | no                | 5 completed, 13 queued                | candidate-only; reconcile exact files/contracts/tests against baseline before selective integration; CP-06 |
| `origin/rgr/TASK-0013`                          | `28262392` | no                | 20 completed, 1 in_progress, 7 queued | separate-scorecard-session; historical refs retained; no execution or acceptance here; SEPARATE-SCORECARD  |

## Material differences that affect scheduling

- R-0025's9e69d867 original checkpoint is already an ancestor of main. Its
  contracts are integrated source history, not a branch to merge again. Main's
  eight recorded completed tasks cover historical preparation plus the four-task
  admissibility slice; the64-command whole-round goal remains open.
- R-0026 contains four pre_merge contract/preparation tasks, no new app/backend
  runtime delta. R-0027 retains source work and deliberate RED delegation/bank
  tests. Neither is a delivered end-to-end application.
- R-0028 contains six homologation-port adapters and tests, not native-camera or
  productive RENAEST proof. R-0029 has route/screen/i18n preparation, not a
  completed operational console. Preserve their shared TEAT-web dependency/lock.
- R-0030 contains availability/doc tooling with many fixture files; file count
  does not measure delivered user documentation. Its expected missing-manifest
  failure is a prerequisite to reconcile, not a gate to bypass.
- R-0031 has10 completed/3 checkpoint/7 queued task JSONs. TASK0007 remains
  checkpoint even though corrective TASK0020 is completed. Preserve both facts;
  the correction does not rewrite the earlier status. CH tests/contracts and19
  screen sheets do not constitute a PEC web implementation.
- R-0032 includes the R-0031 head as an ancestor. Its own2completed/2checkpoint/
  10queued tasks cover preparation/intentional REDs; retain incremental assets
  without double-counting the PEC foundation. Main contains planning stubs for
  R-0026…0032, not their checkpoint task/report/runtime assets.
- R-0022's earlier9af76824 is ancestral to stopc22ea63a by one commit. Keep
  both as lineage, not separate functionality. Its old pin bumps/generated
  outputs are not adoption candidates. Apply C-0003 §9 selective salvage only.
- R-0023's O1/1692-test report and TASK0002 in_progress disagree in granularity;
  retain their source claims and require an exact new matrix/baseline before
  acceptance. Main still uses DetranPolicyGuard and the tenancy-ordering shim.
- R-0024 has no dedicated preserved branch/task set. R-0033's v0 pattern is useful
  integrated substrate, not proof of final shared-kit/dedup completion.
- R-0020 maestro and RGR refs diverge (one RGR-only vs14 maestro-only commits).
  Preserve both for the separate evaluation session. Do not sum task populations.
- Local R-0022 handoff4326e93d contains four nonmerge commits already in main;
  its unique merge is recovery lineage, not new feature work. Already merged
  cleanup/accessibility/RLS/rescue refs remain intact; no deletion is authorized.

## Source precedence and stale projections

Preserve all accepted decisions. Later steering/amendments override older
projection text; code cannot replace a normative source. Specific dispositions:

| Apparent pending item or old assumption                                      | Current disposition / source                                                                                                                          |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RAIT authority appeal deadline still called open in the old ledger           | Answered by steering H47:30days since publication for that decided flow; do not ask again                                                             |
| BOAT severity→gravidade derivation called unapproved                         | worst_victim approved in steering H43; preserve conditions/catalog source_pending                                                                     |
| Portal silver/ombudsman signature ambiguity in older drafts                  | Steering H50/H51 answered these; provider trust qualification remains separate                                                                        |
| All implementation ballots answered vs rows awaiting those same answers      | Read steering H38–57 and the closed ballots; separate actual institutional letters from already decided product defaults                              |
| All frontend work must wait for R-0022→23→24                                 | Superseded by A-C2-16/C-0003; reconcile current seams and retain actual per-consumer dependency                                                       |
| STYNX1.5.0/1.6.x plan bumps or #185 pin question                             | main1.5.3/ADR0039/#179 is the current decision; no automatic upgrade or reopening                                                                     |
| RAIT guard returns true / all commands unavailable in older product snapshot | Superseded for the #193 slice only: real GET/RLS guard and four activated operations; individual scope and all other flows remain unproved/incomplete |
| PEC has no frontend planned                                                  | Superseded by ADR0034; clinical/regulatory web and Portal citizen views remain commissioned, PEC mobile remains excluded                              |
| PEC patient+RENACH uniqueness text vs accepted implementation                | Keep OD-HF-B9-001 visible; reconcile to the accepted tenant-scoped RENACH rule through proper-role sources, not by importing draft wording blindly    |
| PREVIEW or task completed means product ready                                | Preview/R-0033 and task records are bounded; actual behavior, integration, qualification and release are separate proofs                              |
| Open #121 or #185 means registry/pin must be solved again                    | Registry/pin part superseded; residual upstream RC claims need their own evidence, administrative issue cleanup is not implementation                 |
| k6/mutation required to make a new plan complete                             | B17/OD-C3-004 exclusion retained; no execution or changed requirement in this PR                                                                      |
| R-0022 Linux custody failure requires another broad rescue                   | Existing one-window timebox and explicit native-amd64 provision-or-stop retained; preserve process/data custody separately from Git refs              |

The dated product brief and old campaign tables are retained as snapshots. Entry
links point to the completion-plan proposal; this PR does not edit frozen proof,
closed task files or Owner draft product JSONs to make historical text appear current.

## Genuine decisions and dependencies

- OD-R25-016 claim/distribution/admissibility sequence and pool source, plus
  OD-R25-017 individual case access: resolve before the affected CP-01 packet.
- OD-C3-009 journey×role mismatches JW02/05/08: decide before the affected CP-02
  journey, not via silent policy expansion.
- Unsourced member grant, additional substitute order, session creation/cadence,
  specific remaining deadlines and sync concurrency window retain their own
  canonical OD/source requirements. Existing answered steering values are not
  generalized into other rules.
- CP-10 consumes institutional identities/regiments/jeton/national layouts and
  trust/provider samples. Letters README contains blank sent/response fields:
  drafted requests do not prove that messages were sent or answers received.
- PEC/Portal qualification, native/offline TEAT production and field release
  retain their external/separate authorization boundaries and custodians.

## Verification ownership

Architect research, runtime/code untouched. Scope crosswalk is a planning assignment
of every imported JNY/UC/JW plus current open DT/issue populations, not a proof of
semantic approval or per-requirement implementation. Inspector execution and exact
candidate acceptance belong to each future authorized packet. The separate
scorecard session supplies its own published outputs; this plan does not schedule
or judge that work.
