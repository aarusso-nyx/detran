# S2-R3 — conservative source review dispositions

Owner recommendations adopted under the recorded temporary delegation at
2026-10-19T22:16:00Z (window ends2026-10-20T02:39:32Z or earlier console return).
Architect transcribes contracts; Inspector authors tests; Engineer remains paused
until the accepted source/RED checkpoint. Review: reviews/S2-source/review.json.

1. Preserve retained claim error context semantics using exact per-code schemas
   from the existing catalogue, rather than silently replacing all contexts with
   wip/limit. Newly bounded source/legacy errors disclose no candidate/source data.
   This does not authorize another actor's case/assignment disclosure. No new
   catalogue path, public error code, grant or accepted ADR change is introduced.
2. Name the honest production boundary: for any provenance kind without an
   already-accepted independently verified source binding, the S2 production
   verifier returns missing. Actual SQL data/digests or convenient audit labels
   cannot create authority. An independently computed, tenant-scoped synthetic
   receipt verifier can replace only the narrow port in controlled tests; it is
   not production qualification. Deployment remains blocked on real release inputs.
3. Adopt the recommended fail-closed date boundary. If canonical timer due_on is
   not exactly the approved start+track ceiling resolved by existing date owners,
   return RISK_SOURCE_UNAVAILABLE503. Do not invent how suspensions/extensions shift
   ladder steps. Inspector records the negative. Supporting such legal-date cases
   later needs a sourced reviewed rule; no step shifting or engine change is
   commissioned here. This is source qualification, not a legal extinction rule.

Text/version corrections and explicit existing other-instance v+1 descriptions
are Architect maintenance within original owned sources. The append-only storage
and internal-route absence tests remain Inspector-owned. These decisions add no
runtime path, new source store/producer, role, dependency, S3/UI action, production
provisioning, implementation-PR merge authorization or readiness claim.
