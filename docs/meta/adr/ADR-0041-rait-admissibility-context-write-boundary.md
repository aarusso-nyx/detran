# ADR-0041: RAIT admissibility context write boundary

## Status

Accepted by Architect for the Owner-authorized R-0025 admissibility slice,
2026-10-18. This technical choice preserves OD-R25-006 (a) and UC-RAIT-002;
it grants no new business role or transition.

## Context

Generated admissibility CRUD accepts actor/time and the server-owned timeliness
criterion from request bodies. The unique tenant/case/criterion key also makes
repeated create-only checklist saves collide. F-01 must remain a separate empty
body transition; a browser must not invent evaluated_by, time or timeliness.

## Decision

Restrict `BP-INF-RAIT-CASE-001` resource RaitAdmissibility generated operations to
list/get. Regenerate; never edit generated controllers or DTOs. Register a
handwritten POST at the existing `/v1/inf/rait/admissibility` path, with unique
OpenAPI operation `createRaitAdmissibility` sourced in the handwritten command
contract. Also complete the existing admit/non-admission handwritten OpenAPI bodies,
path/header parameters and ETag envelopes, so all four activated methods are typed
from generated operation inputs. Reject maps the canonical form reason code to
reason and operator-entered grounds to legalBasis, without client legal inference.
Generate clients from that source. No generated PATCH/DELETE write
bypass remains.

The POST accepts case_id, one of the three human criteria, verdict and optional
reason. Server context supplies tenant, actor and time. F-01 computes/persists
timeliness using the existing deadlines engine; each save recomputes that
server-owned criterion in the same transaction as its human criterion. Upsert
uses the existing unique key; parent-case locking, If-Match and idempotency bind
replay to current persisted case versions and prevent duplicate effects.

Existing route policy and tenant RLS remain authoritative. No actor/pool predicate
is inferred from the signing-authority rule RN-RAIT-143; that separate source gap
is recorded as OD-R25-017. Current GET/RLS-based case navigation is not a claim
of unavailable same-tenant individual authorization.

## Consequences and verification

Existing generic write DTOs are not browser command inputs; callers use the
regenerated command input. Inspector replaces only activated-method M8 sentinels
with stronger transport/context/concurrency proofs. Negative tests cover forbidden
server-owned fields, bypass routes, tenant crossing, policy omission, replay and
fourth-verdict ownership. Preview adapters stay explicitly unavailable.

Full R-0025 acceptance remains pending outside the starter slice. Generated
artifacts, OpenAPI, client types and mounted routes must agree; all affected gates
remain unchanged. The contract is `work/rounds/R-0025/contracts/JW01-admissibility.md`.

## Addendum — control reads and preview display scenarios

The R-0025 real case guard must run before the page, while preview P-09 must render
loading/error/forbidden as page states. A typed control read separates those
responsibilities without replacing the guard or granting access unconditionally.

`CaseClient.verifyCaseAccess(caseId): Promise<void>` normally awaits the existing
case GET, preserving credentials, RLS, received ETag and errors. The unchanged real
guard awaits this read. Its preview adapter verifies canonical fixture membership
without applying display QA state; missing IDs still reject. Page case reads keep
their five-state scenarios. Auth/role guards, tenant/session and all unavailable
preview commands remain intact; no new backend endpoint or authorization predicate.
No synthetic ETag is needed for the preview membership check. The method is a READ
in the method inventory, not a 66th command. Inspector proves both paths and the
unknown-ID/role/network negatives before Engineer implementation.
