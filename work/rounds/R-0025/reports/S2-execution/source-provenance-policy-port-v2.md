# S2 policy-port v2 — request source pairs, receipt-owned decisions

Architect, Article 7. S2-R13, integration checkpoint80c143fa. This additive source
supersedes only v1's request policySources triple shape and requester ownership of
decision references. Original v1, ADR0057 and frozen provenance formats remain
historical unchanged. No runtime, test, database, Git or state mutation.

## Exact override

Request keys remain purpose, tenantId, caseId, sourceRefs, contentRevision,
policySources. Every request policySources item has exactly **sourceRef and
sourceRevision**, never decisionRef. Require the frozen C anchor:

- sourceRef: `docs/framework/product/domains/inf/rait/workflows/WF-RAIT-002.md#4.2`
- sourceRevision: `sha256:1f0020512955efae8710e6d5195f0457f10a59ce0c385c28809b7f6a1f2930b5`

Additional actually needed source pairs come only from the existing frozen source
inventory reproduced in the companion JSON. Sort unique by sourceRef; reject
unknown references, duplicate refs or wrong whole-file hashes. The requester can
compile those facts without retrieving an authority receipt. A workflow section
locator identifies real text; approved status or matching bytes alone does not
prove complete operative policy, activation or event applicability.

The request canonical envelope remains schemaVersion1 and namespace
rait-risk-policy-request-v1, with the same C-only purpose, tenant/case, complete
current source rows and empty independent dependencies. policySources now contains
only these source pairs. Compute its contentRevision with the unchanged canonical
byte/SHA256 rules. This additive document revision is not a new namespace or a
change to historical source/receipt encoding. Do not include unknown receipt
choices in a requester digest or echo a digest to manufacture qualification.

Receipt policySources retains exactly the **original triples** sourceRef,
sourceRevision, decisionRef. The independent trusted reader retrieves the already
admitted full receipt and validates actual decisions and authentic historical
authority, completeness and applicability to this actual C movement. Its source
pairs must correspond exactly to those requested for this policy; omitted/extra
coverage fails rather than silently qualifying a subset. The requester does not
supply or guess the receipt's decision references. A made-up D11 on every source,
section name, receipt label or matching hash is never authority.

All other v1 rules remain: optional qualifyPolicy closed to C useful-movement;
full actual case/AIT/infraction/C-clock/timer/reset-event and named support rows;
independent current-row comparison; existing admitted full receipt core/kind;
receiptDigest returned separately from opaque sorted sourceVersions; subsequent
full movement request independently retrieves/verifies that receipt dependency.
No zero-binding movement policy request, rrv1 decoding, new kind/key/writer/store,
new legal rule or provider activation. Absent/missing/ambiguous/malformed policy
or unauthenticated/incomplete decisions fail existing safe503 before effects.
Production remains missing absent a separately accepted authentic verifier.

## Inspector freeze requirements

Pre-admit immutable synthetic receipts independently before HTTP. Requester sends
pairs only; reader supplies/validates its genuine receipt decision provenance.
Fixture authority is solely the separately approved isolated synthetic test
authority, never a production writer, legal approval or deployment qualification.
Do not label each canonical source D11 or import runtime digest helpers to create
expected receipts. Opaque versions deliberately differ from receipt digests.

Prove request triples/unknown keys, missing anchor, wrong hash, invented/unresolved
receipt decision, incomplete policy, wrong event or parent, omitted/extra source
coverage and unauthenticated correct bytes all fail. Preserve full movement's
independent dependency verification; policy success alone cannot qualify missing
movement evidence. No request decision-knowledge cycle remains.

F2/F4/F5, F3's OPEN process-local cursor limitation and all v1 delivery exclusions
remain unchanged. Parent checkpoints these sources before independent Inspector
F1 RED; Engineer feedback stays paused until that RED checkpoint. No completion,
production, S3, scorecard or merge authorization follows.
