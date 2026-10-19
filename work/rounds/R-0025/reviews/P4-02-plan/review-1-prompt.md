# D1–D7 formalization and exact wiring packet review

Auditor, Article7. Read-only cross-family CLI alias opus; exact model not inferred.
Review frozen HEAD574640a07ae000651c82a97bd6904fc1b4dc3722 versus main3e4ee378.
User: “I approve your recommendations for D1–D7. Record the decisions, formalize
the contract/security ADRs, and prepare the exact wiring packet in a PR for review.
Keep runtime paused and preserve local and scorecard work.” Additional D3 answer:
“yes, coordinators and auditors can read unassigned case merits.” Earlier approved
D3 retains authorized unit/pool/tenant scope. No runtime packet is approved now.

Read changed docs via git show HEAD: ADR0045/0046, both ADR index rows, additive
Owner ledger and canonical amendments, new JW01-claim-wiring-contract.md and
P4-02-exact-wiring-packet.md. Existing accepted ADRs are unchanged. IDs43/44 are
held by concurrent scorecard branch (filename metadata known), not imported.
No source file outside docs/, work/ and DESIGN-DECISIONS.md is changed.

Verify approval faithfully recorded; old source/decision text preserved; atomic
ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO after admissibility, no repeat triage, dossier
navigation,200 CASE result with explicit assignment/caseETag; stages/version v+2,
correct history/outbox stage identities and one assignment. GET claim-context
server eligibility zero/one/many with complete set, no browser identity/first pool;
selector If-Match exception explicit, other commands untouched. Impeded skip/safe
empty and ordered priority/NULL/WIP source policy retained, not reopened.

Security: scoped metadata/triage/assigned merits versus named coordinator/AUDITOR
read-only unassigned oversight; role+permission+explicit unit OR pool binding,
no impediment, no wildcard or fabricated auditor pool member. Blueprint internal
scope binding is an Architect data-model decision, no public CRUD or production
seed; missing binding denies. Whole server-route/parent/legacy-write/replay bypass
coverage, SQL before pagination; unrelated role source gaps stop preflight rather
than widening/revoking access. Existing WORKLIST→CASE dependency reused.
Actor-bound retries versus new actions; changed/cross-actor key409 no disclosure;
reauthorize replay without re-claim; safe legacy handling, no history rewrites.

Packet: exact proposed owned paths/tasks/RED matrix/gates/stop conditions, not
dispatch or implementation authorization. T0 preflight identifies actual legacy,
risk/identity and shared-role predicates; no invented data or permissive fallback.
No attachment/draft/inquiry/signing/newSSE/platform work, scorecard, proof/state/
task/auth/lifecycle changes. Reviewer should flag material ambiguity/overreach,
not invent unrelated architecture or expand approved business scope. No code,
tests, installs, builds, servers, Git/evidence/state mutation or external action.
Do not inspect primary checkout or scorecard work. Local gates reported separately.

Return ONLY raw JSON, first byte { and last }. No Markdown fences.
Keys mode="planning-review",cycle=1,verdict="PASS"|"REVIEW"|"FAIL",
findings=[{severity:"high"|"low",file:string,line:integer,claim:string,fix:string}],
notes=[identity,exact scope,limits].
