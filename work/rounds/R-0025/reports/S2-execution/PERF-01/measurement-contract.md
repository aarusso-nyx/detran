# PERF-01 P0 measurement contract — frozen before measurement

Architect,2026-10-21. Owner approved P0 and F7/F8 corrections; not P1 runtime
optimization or anchor recovery. Baseline1a781213; production sources unchanged
from503ac477. Inspector owns only claim.e2e.spec.ts, claim.fixture.ts and scoped
raw/census receipts. Architect owns this contract and runtime-amendment.md.
Parent owns Git. Exclusive disposable DB53343 only, verified target and zero other
clients before reset; no protected DB/service/worktree/config/scorecard writes.

## Observation and category rules

Observe actual pg.Client.query or equivalent realTx query calls transparently:
forward original receiver, arguments, returned value and error exactly once.
No SQL rewriting/replacement/cache/replay, owner-role application context,
removed identity/PID check or alternative producer. Original fixture setup still
runs. Capture exact source hashes, role/PID proof, observer lifecycle/restoration,
SQL hash/table-family, operation ID, tenant/case when known, phase, qualification
kind/round/dependency depth and times. Never log DSNs/tokens or private inputs.

Each actual query has ONE exclusive category plus independent logical-span tags.
Classification needs trusted callsite or active independent-verifier context;
SQL text alone must not manufacture ambiguous ownership.

| Exclusive leaf category | Required attribution |
| --- | --- |
| verifier.identity | Existing actual current_role/tenant/PID check inside qualified-reader context |
| verifier.receipt | Independent fixture reader/dependency SQL under qualify/qualifyPolicy verification; keep recursive depth/receipt span distinct |
| runtime.source_rows | Production raitSourceRows retrieval with no independent verifier context |
| runtime.discovery | Production provider inventory/source discovery outside source_rows |
| runtime.calendar | Existing public Calendar-owner queries, independently recognizable callsite |
| runtime.lock_universe | Existing relation/parent/pool/universe/fence SQL; no lock-grant change |
| fixture.setup | Independent fixture creation/admission/setup queries outside request body |
| session_control | BEGIN/COMMIT/ROLLBACK/tenant context outside a narrower verified category |
| unclassified | Anything ambiguous, missing context or outside covered observers; report instead of guessing |

Scope/depth tags are separate from exclusive categories. Nested qualification and
recursive dependency spans are INCLUSIVE: never add them to leaf query times or
add child spans again to their parent. Capture actual SQL latency around the
original query await, with observer classification/serialization overhead measured
separately when possible. Wall time minus observed leaf times is NOT automatically
business CPU: scheduling, HTTP, serialization, waits and observer gaps may overlap.
Unobserved time remains unassigned. Distinguish sampled actual PG lock waits from
inferred wall delay; missing wait sampling means UNKNOWN, not zero contention.

Separate pre-test setup, HTTP start/settlement, test body and teardown. When precise
server CPU/serialization separation is unavailable without unowned runtime edits,
report unavailable and bound conclusions accordingly; no synthetic estimate.
Group count/time by operation and category, and provide per-case/qualification
counts only where case attribution is actually known. Cover output/error paths.

## Frozen behavior and actual runs

Hash original four complete51 bodies, scalar reference reader/canonical functions,
provider inventory oracle, runtime provider/risk port/Calendar owner and lockfile
before instrumentation. P0 preserves all four business bodies/assertions,51-case
population,30000ms budget and actual logical12+1 single-case qualifications. F7's
new sensor and F8's honest label rename are separately Owner-approved deltas;
they cannot silently modify the four performance controls or scalar reference.

Run single-case equivalence first (retain all185decisive assertions), then all four
existing complete51controls normally/serially. Preserve real failures and exit
status; callback work after timeout is labeled late, never PASS. Record runner
order, hardware/load, query observation coverage and overhead limitations. Stop if
the observer changes query semantics, cannot be restored or invalidates trusted
attribution. A setup-blocked or partial capture is not a decisive bottleneck proof.
No blind retries, custom sequencer or threshold/population reduction.

F7: real guard-passing analyst requests ineligible/foreign pool while an actual
owner transaction holds ops.parameter writer lock. Prove404 before release,
no writer-blocked Lock wait and noeffects on corrected service. HistoricalRED
uses the exact prior service bytes fromca83c18d in the separately reserved clean
validation WT, same new frozen sensor/currentdependencies, no evidence-history
checkout; restore historical bytes afterward, never commit them. Existing guard403
control remains labeled guard precedence. F8 renames wrongactivepool to
wrongpoolinactivebinding and corrects currentcensus, retaining409/noeffects.

## Interpretation and exit gate

Publish observed category totals, inclusive spans, raw errors/late work, setup vs
body, runtime/source/fixture hashes and separate unresolved attribution.233 from
the prior epoch is an all-observed-query reference, not a production-only count or
fixed expected threshold. Compare like-for-like observation boundaries only.

Architect must choose next proposal from actually dominant category and document
limits. No automatic qualification-round API, source/receipt reuse, Calendar,
source-writer, DDL, schema, policy, key, threshold or scorecard implementation.
If verifier cost dominates, prepare a closed independent verifier physical-
batching packet retaining scalar receipt/dependency decisions; do not optimize a
production path to hide test-only overhead. If runtime dominates, prepare a new
exact contract/ADR/path/RED amendment. If attribution remains incomplete, stop
with a narrower next measurement proposal rather than speculative implementation.

Delivery gate remains genuine allfour51/30s GREEN, complete affected suites and
canonical kernel/requiredCI at reviewedhead. P0 completion is measurement, not
resolution of the four timeouts. Anchor7 and reviewverdict remain independent;
no fourth review, merge, S3, production or round closure is authorized.
