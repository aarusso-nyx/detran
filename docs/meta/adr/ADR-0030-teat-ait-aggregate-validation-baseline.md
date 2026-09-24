# ADR-0030: TEAT AIT aggregate-validation baseline

## Status

Owner approved the V01–V11 proposal in R-0013 on 2026-09-23 and subsequently authorized the
AIT matrix as an executable source. This promotes the reviewed V01–V11 predicates, and cited
RN content only to the extent expressed by those predicates, to executable authority for this
round. It does not approve other RN content or rewrite source-file `status: draft`. See
`work/rounds/R-0013/contracts/CTG-0004a-ait-validation-matrix-proposal.md` for the reviewed
matrix and its exact source/status and gap register.
ADR-0032 subsequently selects the closed DSL, field-mapping authority, remaining branch
semantics and AIT lifecycle policy for this round; executable catalogue rows and code must
still be produced and verified.

## Decision

The AIT finalization gate evaluates the same persisted, coherent aggregate that it freezes and
queues. It binds the evaluation to the exact normative catalogue, version and manifest hash.
The approved predicate intent is V01 minimum content, V02 active framing, V03 approach, V04
observations, V05 per-field vehicle confirmation, V06 acknowledgement/signature outcome, V07 linked
evidence integrity, V08 modality-specific requirements, V09 competence, V10 one-infraction-
per-auto and required same-fact consolidation, and V11 explicit transactional finalization
with an authoritative reserved number. A screen-supplied empty `validation_blockers` array is
never evidence of validity.

No unavailable path, unknown `expression_json`, unversioned `required_fields` entry,
unverifiable package or missing fact is silently accepted. The matrix is now an executable
source, but the authorization does not supply the currently undefined DSL, canonical aggregate
paths, catalogue rows, legal ambiguities or cryptographic trust material. The Architect may
specify reviewable technical mappings of approved predicates to existing typed data. A mapping
requiring a new normative choice or an unavailable authoritative fact leaves the affected
operation fail-closed. Backend receipt must apply the same approved package/version and
validation semantics, rather than trusting a locally supplied result.

## Consequences

The Architect closes executable schema and field maps against the approved matrix and existing
sources, records unresolved choices explicitly, then Inspector tests each positive/negative
predicate and Engineer implements it. No positive
AIT-finalization claim or Round R-0013 PASS may rely on the baseline alone. ADR-0029 governs
the separately approved E2 online-freshness/offline-authority policy. ADR-0032 resolves the
cryptographic wire and trust _policy_ for Android/GMS820; ADR-0028 and OD-T16 still identify
absent production keys, ports and verification evidence, not an unchosen profile.
