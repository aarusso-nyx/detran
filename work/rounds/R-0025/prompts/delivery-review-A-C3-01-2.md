# R-0025 A-C3-01 — restricted delivery-review, cycle 2

Auditor (Constitution Art.7), Claude family via CLI alias opus. Read-only. Do not
edit, run tests, install, start servers, mutate Git, message anyone or invoke
state/evidence/governance verbs. Reading files, Git diffs and hashes is allowed.

Read reviews/delivery-review-A-C3-01-1.json first. Its original CLI answer was
wrapped in Markdown; the bridge rejected that output. The exact answer was
recovered without semantic edits from the numbered Prettier diagnostic, parsed
and preserved with recovered-raw.txt and normalization.json. This is honestly a
REVIEW result, not a bridge PASS. Do not infer exact model from alias or self-report.

Scope ONLY the two cycle1 findings and their corrections in commit ad35fe0e and
current candidate. Read latest source contract JW01-admissibility.md review1
addendum, ADR-0041, CASE handwritten changes, client change, regression tests and
TASK-0025/26/27 report addenda. Check those corrections and material consequences;
do not reopen unrelated scope or turn still-running final release gates into code
findings. Complete R-0025/JW-01 and real IdP remain outside this slice.

1. Four client idempotency keys hash {body,ifMatch}; actual wire bodies, acts and
   targets unchanged. Server fingerprint includes exact original If-Match and
   contextual actor for only the four activated commands. Exact original attempt
   retry still replays once, while changed If-Match under a reused key is 409.
   Re-save all criteria and A->B->A must persist correctly with fresh ETags.
2. Triage/save only forward authenticated request principal through the existing
   protocol pattern and validate actor/tenant before replay. Audit chooses actual
   canonical tuple role, or actual role authorized by the existing policy helper;
   permission-only principals preserve grant behavior with actual role or nullable
   actor_role, and permission-source details. Existing wildcard/global admin grants
   are not narrowed, new grants are not added, PolicyGuard remains untouched.
   Admit/reject principal API compatibility and all other fingerprints stay intact.

Observed final focused receipts to verify in reports/logs: backend unit19 and
full CASE175 PASS; real HTTP50 PASS; API+routed41 PASS; CASE/app typechecks PASS.
The full official backend kernel passed before this correction (all tiers and
upgrade rehearsal), and affected tiers are being rechecked. Final root pnpm check
is running. Actual permission-only HTTP nullable audit cannot be produced by the
existing local verifier and is explicitly not run; unit grant-boundary and source
DDL nullable assertions are not represented as external IdP evidence.

Return ONLY one raw JSON object. Your whole response is parsed directly as JSON.
DO NOT use Markdown or backticks. First character must be { and last must be }.
Keys: mode=delivery-review, round=R-0025, cycle=2, verdict=PASS|REVIEW|FAIL,
findings=[{severity:high|low,file:relativepath,line:positiveinteger,claim:concrete
source-backed issue,fix:needed correction}], notes=[observed scope, identity,
limits and checked results]. PASS means the two bounded findings are resolved,
not overall release-gate completion or round closure.
