# P4-02-S1 — implementation and verification record

Architect / Inspector integration record, 2026-10-19. Verification in progress;
this record is not a release, round closure or permission to merge.

## Authority and integration baseline

Owner approved S1 and the bounded apply.sh loader extension, A2 compatibility,
canonical identity validation, A3 replay provenance and A4 preview source tests.
See ../AUTHORIZATION.md for the exact approvals. PR201 merged at a006b039 with
required checks green. Current main6f07295b (separate scorecard PR202) was merged
without changing its scorecard, governance, package or lockfile contents.
DEVAI2.6.3 and STYNX1.5.3 are the installed baseline.

Article6/7 roles stayed separate: Architect sources, Inspector RED, Engineer
runtime and attributable generation, Inspector GREEN. Dedicated task worktrees
and ordered checkpoint ancestry are preserved. Supported DEVAI task verbs created
local state; external execution was not a managed-provider task finish. No
experimental dispatch, fabricated ratification or task-completion claim is made.

## Delivered scope

The107-method baseline has71 scoped replacements,25 retained scoped methods and
11 removals. Internal scope and case-pool entities have no generated CRUD.
Request authorization uses canonical active staff identity, actual role and a
complete purpose, filtering in SQL before pagination. Parent chains, mutations,
closed projections, current replay scope and tenant/RLS remain enforced.
Independently qualified legal triage/admission is retained when operational
routing is absent or revoked; that grants no pool merits or selector authority.

A3 keeps existing nonclaim fingerprints and adds atomic actor provenance tied to
the exact ledger UUID. Missing, ambiguous or other-actor legacy provenance cannot
reveal or re-execute a response. ADR0052 contains the unchanged accepted normative
body originally numbered0050; ADR0035 resolves the collision with main's earlier
scorecard ADR0050. The old replay path is a redirect; unrelated ADRs are intact.

Frontend clients and existing consumers use omission-aware typed reads. A4 keeps
full canonical fixture integrity tests separate from authorized client subsets
and explicit denials. No fabricated full DTO, permission or workflow activation.

## Verification boundary

Preserved raw receipts and hashes are in S1-validation/. Retained real HTTP:
148PASS; CASE unit175PASS; WORKLIST unit78PASS; shared policy736PASS. Focused
preview163PASS and full RAIT5115PASS, with133 existing TODOs. Frontend lint,
typechecks and production/preview builds passed. Final security HTTP executed350PASS with zero skips on frozen WT30ba5849a8.
CASE integration36PASS and WORKLIST integration42PASS on isolated53341.
Expanded security HTTP executed355PASS with no skips on frozen WT30
80c3b6ad, including the exact-pool counterexample and full seeded-assignment
restoration. The earlier354PASS checkpoint is retained as history. The remaining three app HTTP suites executed8PASS with no skips.
Independent cross-family review6 PASS closes the material findings preserved
in reviews1–5; its scope is the final delta plus those prior assessments, not a
claim of another whole-code review. One informational failed-test cleanup note
is non-blocking and cannot yield a false pass. Root pnpm check reached contracts:test after passing blueprint and contract
checks, then found the old exact operation census258 rather than the approved
329. Owner approved A5’s exact single-file Inspector correction. The next
parameter gate identified an A2 test fixture stream name used as stored
event_type; Inspector corrects it to canonical CASE_ADMITTED. Gates remain intact.
Final complete root rerun is pending these bounded corrections.
A prior348/350 run identified one malformed claim target500 and one invalid
withdrawal fixture tuple; both were corrected without dropping assertions.
A subsequent startup timeout executed zero assertions and is not counted GREEN.
Independent review3 then found the malformed-ID guard blocked collection
schedule/batch creation. Engineer restricted it to path-target commands; Inspector
added actual controller success, exact-pool and route-ID controls. The earlier
350PASS result did not prove those new controls; the later355PASS run does. Final app typecheck and scoped spec formatting pass.
The startup/import hook alone was extended to180s under concurrent host load;
business, race, assertion and individual test deadlines remain unchanged.

## Remaining boundaries

R-0025 remains open. S2 risk/legacy/selector concurrency, claim-context activation
and claim UI are not implemented or authorized here. A2's batch position,
deadline, acceptance and pending missing-item details remain explicitly unavailable
until a later typed contract restores them; their journeys are not complete.
No production bindings, readiness promotion, deployment or round sealing.

The human checkout and its machine-specific configuration were not modified.
The concurrent scorecard session advanced that checkout to main6f07295b; all
three protected configuration hashes still match the initial snapshot. Recovery
branches, task worktrees and database evidence are retained. HTTP and integration
validation use separately owned disposable servers on53340 and53341.
