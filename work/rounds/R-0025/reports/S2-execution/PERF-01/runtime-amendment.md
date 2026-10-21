# PERF-01 measured amendment — verifier-first, proposed only

Architect,2026-10-21. P0 measurement and F7/F8 corrections executed under Owner
approval. This next amendment is PREPARED FOR REVIEW, NOT APPROVED FOR EXECUTION.
No runtime optimization, timeout change, source authority, chain recovery or
additional independent review follows. PR211 remains DRAFT/unmerged.

## Actual evidence and its limits

- Frozen original scalar-equivalence control passed185assertions. Actual factory
  core233queries: providerdiscovery13, runtimesourceRows67, verifieridentity25,
  verifierreceipt125, Calendar3. Verifier150/233=64.4% of that exact core boundary.
  Wider P0 capture936queries includes preparation/HTTP/oracle and is not233.
- Fullclaim126:120PASS6FAIL,596.04s. F7 genuine historical writer-blocking RED and
  current366ms404-before-release GREEN; F8 renamed wrongpoolinactivebinding passed.
  Risk/legacy bodies hit30s with partial prefixes. Routing/incident initially
  failed10s preparation hooks; R14scalar and linkedforeign parent also hit30s.
- After quiescent supported preparation, isolated routing and incident each
  reached the real51-case body and hit its unchanged30s budget. Routing body
  prefix24761queries, verifier15615(63.1%), verifier leaf15.38s, runtime typed
  source7.72s; observeroverhead3.95s separately. Incident body30007queries,
  verifier19065(63.5%), verifier leaf14.49s, runtime typedsource6.55s;
  observeroverhead5.84s. Verifier shares of total observed leaf times61.9%/63.9%.
  These are censored before-timeout prefixes, NOT completed whole blocker flows.
  Two positive pagination HTTP requests settled in each isolated body. Late work
  is retained, excluded from prefix dominance and never counted as PASS.
- Unchanged focused R14scalar+linkedforeign controls passed2/124filtered17.57s
  after quiescence; original fullrun failures remain recorded. No fullrepeat or
  uninterrupted kernelPASS was produced. Past setup-lock cause remains UNKNOWN.

Driver leaf times include network/PG/scheduling, not pure server execution.
Inclusive verifier spans overlap leaf times and are not added again. Concurrent
setup leaf sums can exceed setupwall; no wall-time share is inferred from sums.
Exact serialization/serverCPU/lockwait remain UNKNOWN. Host load included122 on
8CPUs; no production-throughput generalization or promised gain is justified.
Original observer classified ancestor FORSHARE source reads together with locks;
immutable epoch1 labels remain preserved. Derived repair uses unique exact trusted
scalar SQLhash+table-family matches only; unmatched values stay mixedUNKNOWN.
Corrected isolated epochs separately record their actual observer source hashes.
Raw gzip streams, uncompressed SHA/sizes, per-case/span partitions and all original
failures are in epoch-1-custody.json, epoch-1-partition.json, final-partition.json
and final-summary.md. No failed epoch was relabeled.

## Origin and meaning of30 seconds

This is a generic Vitest harness limit, introduced by kernel commit3786dd99 on
2026-08-24(PR1), not an evidenced51-case product SLA. Current
backend/app/vitest.config.ts:222–229 selects30_000 for E2E; app package script sets
DETRAN_TEST_TIER=e2e. Each of the four it() calls in claim.e2e.spec.ts inherits
that WHOLE-BODY budget, with no per-test override. Each body includes two queue
pages, blocker mutation, another discovery, claim and assertions. Preparation
hooks have a separate default10s budget. This is not30s perHTTP request.

No matching30s/p95 requirement was found in the targeted RAIT canonical product
specification and approval-packet search; the approval packet instead explicitly
preserves existing tests/budgets. Owner's current P0 constraint therefore remains
30s. No automatic harness increase or production SLO is inferred. Defining an
actual per-request service objective is a separate Owner/Architect decision.

## Recommended next bounded packet: independent verifier physical retrieval

Measured cost supports targeting the test-only independent verifier before the
previous hypothetical production qualification-round API. Production provider,
RaitRiskProvenanceReader interface, raitQualify/raitQualifyPolicy, Calendar, selector,
locks, DDL and runtime dependencies stay byte-identical. Synthetic fixture timing
does not establish production performance or authentic production provenance.

Future exact inventory for separate approval:

| Role      | Writable path                                                        | Allowed delta                                                                                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inspector | backend/app/tests/shared/rait-p402-claim.fixture.ts                  | Preserve a frozen complete scalar verifier reference; in qualify only, batch independent physical source retrieval within EACH existing scalar invocation while retaining every logical decision                                                  |
| Inspector | backend/app/tests/e2e/rait-p402-claim.e2e.spec.ts                    | Add independent scalar/optimized equivalence and negative/race controls; retain all existing business controls, populations/budgets/F7/F8; make diagnostic P0 observation explicitly opt-in for measurement, retaining core functional assertions |
| Architect | work/rounds/R-0025/reports/S2-execution/PERF-02/verifier-contract.md | Freeze exact per-call lifetime, row/ref identity, error/ambiguity semantics and Inspector RED before any optimized verifier                                                                                                                       |
| Inspector | work/rounds/R-0025/reports/S2-execution/PERF-02/                     | Raw scalar RED/GREEN, query/latency/overhead comparison and custody                                                                                                                                                                               |

There is NO Engineer runtime path in this proposal. qualifyPolicy is not an
optimization target: its current retrieval is already one pass, and it must stay
fresh before later movement qualification. Keep all current25identity/PID SQL
checks and12+1logical decisions for the established scalar control. Never cache
reader results, source rows or authority across calls/cases/tenants/transactions.

## Concrete candidate and mandatory equivalence boundaries

Within one qualify call, discover the finite reachable immutable receipt graph
for every matching root, including dependency and decisionRef edges. Fetch only
the independently admitted, structurally allowed typed refs using the existing
independent reader, deduplicating physical refs across nodes only. Reconstruct
exact per-node bindings and run every original logical path traversal in order.
A diamond may share physical rows but not memoized validity; retain per-path seen
sets and cycle rejection. Preserve duplicate root cardinality, duplicate refs
WITHIN one node, exact digest/dependency/policy/file authority and ambiguity.

Do not globally reject a union merely because an independently invalid branch
would have returnedfalse while another root was uniquely valid. Preserve the
original distinction between false and an actual thrown source-read error; never
hide duplicates/ambiguity by deduplicating receipts by digest. Do not prefetch
untrusted/foreign refs that original structural guards reject. If those error,
source-access or ordering semantics cannot be proved equivalent, STOP before
optimization and return a narrower contract amendment; do not invent a fallback
that alters current decisions.

Every later scalar call rebuilds/retrieves fresh data. Cpolicy→movement dependency
binding, revocation checks and existing onQualified timing remain intact. No new
temporal guarantee is invented after the existing final trust check. Mutable SQL
sources must actually have the original runtime lock coverage; uncovered complete/
latest inventories remain explicit blockers. No cache, source writer or grant.

## Independent RED, acceptance and rollback

Freeze the entire prior scalar verifier and independent typed projection/canonical
oracles before implementing the optimized path; do not implement an expected result
from the new code. Compare native typed bytes, revisions, opaque versions, logical
checks, selected errors, exact effect counts and actual app-role/RLS/PID.

Mandatory matrix: valid shared diamond/cycles; missing/duplicate digest dependency
and decisionRef; one invalid+one valid root vs two valid roots; invalid origin/core
hash/revokedID/revokeddigest; wrong tenant/case/purpose/authority/policy bindings;
missing/duplicate/foreign/malformed source identity, bigint/microsecond/composite
keys and canonical file-hash mismatch. Retain all existing negatives.
Prove real source/child changes or revocation BETWEEN scalar calls are reread and
denied, policy changes before movement deny, competing writers retain original
wait/revalidation behavior, and failed paths leave zero effects.

Then run all four unchanged51-case bodies within30s under the native unobserved
harness, complete claim/scope/JW01 regressions, affected structural checks,
canonical backend kernel and exact-head required CI. Use opt-in observation for
comparison, reporting its material overhead; unobserved acceptance cannot be
claimed from an instrumented or censored prefix. No gain or PASS is promised.
Anchor7 remains a separate CI blocker; no waiver or fabricated local RC.

Stop if semantic equivalence, independent reference, freshness/locks or role scope
cannot be proved, or any runtime/schema/privilege/harness-budget change is needed.
Rollback only exact future test-only optimization edits, retaining immutable RED,
measurement and custody. P0 measurement is complete with documented censoring;
performance acceptance and this proposed next implementation remain OPEN.
No fourth review, merge, S3, production/scorecard action or round closure.
