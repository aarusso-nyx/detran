# S2 source review — bounded Architect corrections

Architect, Articles6–10/24. Disposition of the independent cross-family
S2-source/review.json, verdict changes_requested. Parent adopted the recommended
bounded corrections under the recorded Owner delegation; this report records
source work only, not a replacement independent review or runtime acceptance.
Original source-freeze.md/json remain immutable historical checkpoints.

## F1 — retained error transport

Adopted option(a): per-code error variants preserve exactly optional details in
rait-error-catalog for retained claim POST codes. QUEUE_EMPTY keeps poolId;
MEMBER_NOT_AVAILABLE memberId/availability/status; ASSIGNMENT_ALREADY_ACTIVE
assignmentId/memberId; IDEMPOTENCY_REPLAY key; WIP wip/limit. Existing validation,
auth/forbidden and parameter-source codes retain their respective catalogued
optional fields. Standard status/messageKey are represented with message/requestId.
No other command or catalogue edit. New CASE_POOL_UNRESOLVED409,
CLAIM_LEGACY_UNVERIFIED409 and RISK_SOURCE_UNAVAILABLE503 keep empty context.

These schemas preserve optional shape, not disclosure authority. Identifier details
may concern only the caller or an independently authorized own resource; never
expose another selected/skipped/assigned candidate. Scope/race failures cannot be
used to enumerate other analysts' assignment/member identities. Existing
non-disclosure and safe-not-found rules still govern. Fields are optional, so safe
omission remains possible; no new mandatory response detail or read grant arises.

A pre-existing mismatch remains relevant to Engineer: canonical PARAMETER_SOURCE_PENDING
lists optional key, while old claim's missing WIP source emits poolId. This
correction preserves the catalogued key shape rather than silently authorizing an
extra field. Inspector should assert the selected canonical contract and no leakage;
no unrelated jeton error or catalogue semantics is changed.

## F2 — exact missing production provenance binding

The additive format now explicitly binds every kind—timer,track,movement,
interruption,parameter,incident,legacy,applicability—to production missing because
S2 names no already accepted immutable authoritative receipt verifier for any of
them. Missing legacy returns409; mandatory risk source missing503. SQL consistency,
a content hash, an audit label or a filename never creates source authority.
No Engineer discretion to invent one is left. Independently verified future
operational inputs/verifier binding require separately approved release evidence.

Controlled synthetic tenant receipts replace only the narrow provenance reader;
actual SQL factory, rows, joins and source qualification remain exercised. Tests
must independently precompute receipts and prove changed/foreign/untrusted/echoed
receipts fail. The explicit D-original and B-defense-NA branches survive, but cannot
bypass production missing. Existing actual admission audit proves its own fact,
not an entire legacy disposition or unrelated source kind.

## F3 — unshifted source qualification

For each applicable clock, use existing public date/calendar owner to compute raw
start+selected approved track ceiling and canonical rounded due. Actual timer
raw_due_on/due_on must equal those results, and current clock ceiling must equal
due_on. A suspension, extension or adjustment that differs fails503. No threshold
step shifting, proportional compensation or changed legal rule. Existing canonical
non-business-day rounding remains part of the comparison: compare raw_due_on to
expected raw and due_on to expected due separately, never assert raw_due_on=due_on.
This boundary treats other adjusted cases as unsupported503; it does not declare
the existing engine wrong. Pure evaluateRaitRisk receives already resolved reached
dates; no hardcoded180/360 elapsed validation enters that pure function. SQL source
factory owns relative parameter/date resolution. Inspector must prove
this negative even if a synthetic trusted receipt matches the adjusted row.

## F4/F5 — accurate canonical version and scope

CASE commands info.version is1.3.0. Its description and claim x-rait-scope now
state actual S2 additions/selector exception rather than stale S1 no-change text.
Claim ETag description explicitly retains JARI/CETRAN finalv+1 behavior alongside
new-defensev+2 and qualified-legacyv+1. Existing events remain their existing
record shape; stage/outbox exactness is Inspector HTTP+DB responsibility, with no
invented event schema or changed non-claim contract.

## F6 and preserved follow-ups

Generated legacy updated_at/create DTO conventions do not supply mutation authority.
Supporting19 DDL must reject UPDATE/DELETE, including updated_at changes, and the
internal qualification resource must mount no route. Inspector is adding those
negatives separately; this report does not claim they ran. Engineer records the
DDL rationale when implementing. The pre-existing missing workflow D subsection
remains a separate documentation follow-up; approved values remain unchanged.

Read packet inventory together with recorded approval/S2-R1/S2-R2 and source
clarifications. Historical PROPOSED banners are not current authority; no new
approval or delegation expiry extension is asserted here.

## Verification and handoff

Only CASE commands OpenAPI, the two additive provenance-format reports and these
two disposition reports are source corrections. Attributable CRUD OpenAPI generation
is rerun and exact byte deltas captured in the JSON receipt; no unrelated generated
output may change. Original freeze reports retain their hashes. No runtime,
Inspector test, task/state/proof, catalogue, provider or production change occurs.
Formatting and source diagnostics are distinguished from pending real RED/GREEN
and independent re-review. Parent may checkpoint and pass corrected source ancestry
to Inspector before accepting RED.
