# Architect coordination — PR211 pre-merge decisions

Status: proposed recommendations; no decision or merge authority inferred.
Owner already explicitly approved scope-only rate isolation, exact four-path
TEAT repair and exact physical provider batching. Those are implementation
authority only, with independent reference/RED/GREEN and full validation required.
The five-hour delegation expired. Local/scorecard work stays separate.

## 1. Supported evidence reconciliation capability

Installed DEVAI2.6.3 cannot restore the old non-newest line7 anchor after merging
main, even though its original published proof/anchor custody is intact. It
recovered8 through the supported verb. Current remote CI fails evidence-gate,
foundation fails by dependency and kernel is prevented from running.
Recommendation: authorize a separate upstream DEVAI repair/release, then review
a bounded DETRAN adoption packet naming its actual version and exact changes.
This repo cannot modify sibling DEVAI; no target release is invented. Preserve
proofs and both chains, append only via reviewed public verb. Never manually
join/edit hash chains, invent historical gaps or waive/disable the gate.
Exact reproducer/custody: devai-nonnewest-anchor-blocker.md and preserved-S2-anchor-custody.json.

## 2. Independent delivery review after exhausted cap

The two original delivery cycles both ended REVIEW. F1/F2/F4/F5 were resolved;
F6 was locally corrected and independently unit-tested, without a third delivery
verdict. New Owner-approved TEAT/provider extensions also need independent review.
Recommendation: once references, implementation and meaningful checks are stable,
authorize one explicit additional cross-family delta review of F6, the exact
approved extensions and main reconciliation. Preserve both earlier REVIEW
artifacts; no implicit reset, PASS relabel or readiness waiver. The cap in
docs/meta/agents/orchestra/README.md§5 requires human escalation.

## 3. Exact-head merge authority and delivery boundary

No merge is authorized by the current CI-correction request. After1/2 and ALL
required exact-head checks pass, Owner may approve the exact reviewed PR commit
as a bounded executable remainder. Recommendation: keep S2/P4/JW01/R0025 OPEN,
with no S3/frontend activation, production or scorecard promotion. R6/R12 already
preserve defaultmissing production provenance, D RESET503 pending authentic
policy/event/effective-start mapping, and process-local cursor signing(F3).
Those are documented delivery limitations, not silently completed features.

Before operational promotion, separate bounded packets must supply authentic
verifier/activation/calendar/legacy/incident sources, qualified RESET policy and
shared signing-key/rotation/restart/replica semantics. Do not invent legal facts
or secret inputs here or treat CI evidence as product/production completion.

## 4. Performance packet after measured physical batching

The approved physical inventory batching passed the unchanged typed oracle and
185 assertions: inventory reads fell from3/3/2/2 to1/1/1/1, total actual reads
245→233, while all12 source qualifications and1 policy qualification stayed
fresh. It did not resolve any of the four complete51-case controls: each still
reached its unchanged30000ms budget. This is a measured functional improvement,
not performance acceptance.

Recommendation: prepare a new bounded Architect/Inspector profiling and contract
packet for source-verification batching, preserving typed source identity,
independent semantic qualifications, receipt binding and same-operation
freshness. The current packet does not authorize changing those interfaces or
sharing authority across operations. A new exact packet and approval must
precede implementation; no latency gain is promised. Keep the population51,
30s budget and all four controls intact. Raw results are in
../pr211-provider-green-budget-validation.json and related logs.

## 5. JW01 test-app rate isolation — exact packet awaiting Owner

Canonical full E2E reached eight429 responses in the existing50-test JW01
admissibility suite. Owner authority covers claim/scope only. The exact proposed
single-file patch and acceptance conditions are in
../pr211-JW01-rate-isolation-approval.md and its adjacent PROPOSED patch.
Recommendation: approve that limited test-app lifetime capacity10000 with
guaranteed restoration, actual PGwindow proof and unchanged PEC limiter controls.
Production120, every business assertion, population and timeout stay intact. No
JW01 source has been changed. Cross-suite bucket collision is not proven because
the supported upgrade reset removed the prior window rows.

## Final validation disposition

Full canonical kernel at54f92111: units3069PASS8TODO, integration1515PASS;
adapterunit33PASS/integration4PASS; DDL, RLS, decorators, blueprints and boundaries
PASS. AppE2E2217PASS14FAIL3TODO/2234; the kernel remains FAIL. Four complete51
timeouts and eight JW01 rate responses remain unresolved. AIT socket failure
passed one unchanged focused rerun; original failure remains recorded. The NULL
503 was causally reproduced after commands left their own admitted cases in the
shared pool. Approved commands-only cleanup now passes unchanged99-control
two-file execution and subsequent NULL control; runtime/provider/NULL assertions
unchanged. No final uninterrupted full-kernel PASS is inferred.

Split remainder: upgrade21PASS, adapterE2E10PASS, SQLparameter5commandsPASS;
13 remaining package commands attempted,11actualtestsPASS and11commands with no
test files. Full raw/census in ../pr211-canonical-kernel-split-results.json,
../pr211-commands-isolation-causal.json and ../pr211-final-package-remainder.json.
No owned runner or mock remains; exclusive disposable DB lease released.

Security snapshots/source consistency, workspace typecheck, contracttests58,
parameters and formatting passed at the retained checkpoints. Native security
REVIEW and immutable line7 anchor FAIL stay nonpromoting. Primary local work,
scorecard checkout, recovery worktrees and machine config remain preserved.

## JW01 approval executed — 2026-10-21

Decision5 above is resolved by Owner's explicit approval recorded in
../pr211-JW01-rate-isolation-owner-approval.json. Inspector implemented only the
owned JW01 test path at b4dd036e. All50 original business controls are byte-identical;
all50 plus one actual PostgreSQL window proof passed. Including the cheap claim
warm control,52PASS124filtered/176registered in19.70s. Public --cache=false kept
the standard serial sequencer; actual order claimfirst thenJW01. Two earlier
10s-hook setup-blocked epochs are preserved, not counted as business failures or
acceptance. No hook/import/timeout/population change.

Actual tenant-scoped windows consumed110hits, not actor-scoped buckets;110<120
does not prove the isolated suite alone exhausts the production capacity. The
historical canonical429 responses remain recorded. Environmentunset restored
unset even after failed setup; two unchanged PEC persistence controls passed
under the original environment. App typecheck/format passed; DB lease released.
Full evidence: ../pr211-JW01-isolation-final.json.

This resolves bounded JW01 isolation acceptance only. A new uninterrupted full
canonical kernel was not run, and the earlier14FAIL epoch remains immutable.
The four complete51/30s controls, unsupported non-newest proof recovery and
exhausted independent review cap remain OPEN; no merge or readiness promotion.

## Owner escalation executed and repair proposals prepared — 2026-10-21

The previous missing-review-authority condition is superseded: Owner explicitly
authorized one additional independent review, executed at63cb628f with REVIEW.
F6resolved; F3deferred. New low findingsF7(service-level real-PG sensor gap) and
F8(inactive wrong-pool vector label) remain Inspector follow-ups. F9reportstaleness
corrected by latest appendix; no fourth review or implicit PASS.

Exact proposals: ../P4-02-S2-PERF-01.md and ../P4-02-S2-ANCHOR-01.md. Approving
PERF-01 authorizes only P0's closed two-test-path observation/contract preparation,
not guessed runtime optimization. Anchor upstream capability and actual-version
adoption need their separately concrete approvals. No implementation was executed.
Review disposition: ../P4-02-S2-review-extension-disposition.md. All four performance
failures and anchor7 remain blockers; no merge or scorecard promotion.

## PERF-01 P0 executed; calibration approved — 2026-10-21

Earlier statements that P0 and forwarding lack approval are historical and
superseded by AUTHORIZATION.md. P0 ran without runtime changes: original185
assertions PASS; full126 remains120PASS6FAIL. Isolated routing/incident reached
actual bodies and hit30s, with approximately63% of observed query counts in
the independent verifier and material observer/host-load limitations. These
are censored prefixes, not completed controls or production-throughput proof.
F7 historical real-PG sensorRED/currentGREEN and F8 honest inactive-binding
label correction are complete; raw delivery REVIEW is not rerated. Details in
S2-execution/PERF-01/final-partition.json relative to the reports root.

The30s budget originates in generic Vitest E2E whole-it configuration, not an
evidenced RAIT product SLA. Owner now authorizes a separate calibration:
four instrumented120s diagnostic runs, then five repetitions PER scenario
without detailed observation under90s provisional functional ceilings.
Default30s and other tests/hooks stay unchanged; all prior failures remain.
Contract: S2-execution/PERF-01/calibration-contract.md relative to reports root.
Final limits await complete/censored results and a separately stated proposal;
no90s success can erase the30s reference or establish performance acceptance.

ANCHOR-01 was forwarded to https://github.com/aarusso-nyx/devai/issues/418 with
original custody. No upstream repair/release or DETRAN adoption is implemented;
line7 remains orphaned. Verifier-first runtime-amendment.md is a proposal only,
with no optimization authority. PR211 stays DRAFT/unmerged; S2/P4/R0025 open,
F3/DRESET/authentic source and fullkernel/CI blockers remain independent.
Protected local, recovery and scorecard work remain separate and untouched.

## Calibration executed; proposed budgets awaiting adoption — 2026-10-21

The approved120s/90s experiment ran all24 planned bodies in25 invocations.
Four instrumented diagnostic controls passed in39.001–48.849s. Functional
results are17PASS/3bodytimeouts at90s plus one extra routing10s protocolBatch
preparation-hook failure. Completed functional bodies span32.478–59.286s;
ALL24 bodies exceed the separate30s reference. Failed bodies were not retried
to substitute successes. Censored completion times remain≥90s with unknown
upper bounds; no completed-only maximum or credible p95 is claimed.

Five functional samples per scenario are preserved with host conditions and
raw custody under PERF-01/calibration/ (relative to S2-execution/). Load varied
materially on8CPU/16GiB; no unrelated process or scorecard work was modified.
No source/runtime drift during measurements. Owned DB53343 ended withzero
clients and lease RELEASED. Original body emittedJS is byte-identical.

Architect recommends90s functional and120s diagnostic HARD CEILINGS only for
the four51-case bodies, with persistent separate30s exceedance reporting.
Exact proposal: PERF-01/calibration-budget-proposal.md. This is NOT adoption:
native four defaults and generic E2E remain30s, existinghooks unchanged.
90s is not certified adequate for all measured conditions; performance remains
OPEN/RED. No further deadline increase to manufacturePASS is recommended.
Controlled-environment acceptance, affected suites, uninterrupted kernel and
exact-head requiredCI remain necessary; no production SLO is established.

Raw thirdREVIEW, prior full126/kernel failures, anchor7 orphan/DEVAIissue418,
F3/DRESET/authentic source gaps remain independent. No optimization, fourth
review, merge, S3, scorecard promotion or round closure. PR211 stays DRAFT.

## Owner-approved90s/120s adoption applied — 2026-10-21

Owner approved the exact calibration-budget-proposal.md packet. Original
proposal SHA256 and later approval are retained in AUTHORIZATION.md; its old
pending-adoption language is historical. Source checkpoint5c202a3c changes
ONLY the existing claimE2E spec: four native defaults90s, profile120s,
profile-only four-control SQL observation, persistent lightweight30s reference
reporting and default/functional original-query proof. Equivalence observation
stays enabled; global E2E30s, hooks, fixture/scalaroracle, runtime, dependencies
and proof chains remain unchanged. Emitted four bodies are byte-identical.

Actual default mode(no override): four controls4PASS122filtered,219.22s native
duration; complete claim suite126PASS,402.92s native duration. Bodytimes:

| Invocation | risk(s) | legacy(s) | routing(s) | incident(s) |
| --- | ---: | ---: | ---: | ---: |
| Default four |32.683|33.168|48.327|47.126|
| Fullclaim126 |65.622|63.446|43.744|43.711|

All eight observed bodies exceed30s; original-query proofs passed and no detailed
SQL snapshots were emitted for those bodies. FunctionalPASS does not resolve
performance, explain older censored failures or establish a product SLO.
All earlier mixed-condition calibration and global/kernelFAIL remain intact.

Scope/JW01 and uninterrupted canonical kernel acceptance remain pending a
controlled resource window: active unrelated Vitest/TypeScript work was observed
before dispatch. No tests from these stages were started under that competing
workload; resource-blocked preflights and waiting samples are preserved. The
original scheduler's future forced E2E tier was corrected before any kernel
launch; canonical execution must leave DETRAN_TEST_TIER absent. Claim's actual
child was uninterrupted and exited0; wrapper pause time is not benchmark time.

Full receipts, source proof and precise continuation status are under
PERF-01/adoption/ relative to S2-execution/. Approved adoption scope/status:
PERF-01/adoption-decision.md. Dynamic acceptance is PARTIAL, not kernelPASS.
Exact-head remote CI must be observed after publication; the existing manual
workflow is available. Local chain still fails orphan7; no manual repair or
proof append. Doctor and snapshot consistency passed without native scorecard
regeneration. PR211 remainsDRAFT/unmerged, noauto-merge, optimization, fourth
review, S3, production/scorecard promotion or roundclosure.
