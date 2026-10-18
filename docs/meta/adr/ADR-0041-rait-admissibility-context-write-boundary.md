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

## Addendum — observed-version attempt identity and authenticated audit role

For the four activated admissibility operations only, a request attempt includes
the observed If-Match version. Client keys use the existing canonical hash helper
on `{body,ifMatch}`; server fingerprints include received If-Match and the
request-context actor alongside command, target and canonical payload. Exact
original retries replay once; reused keys with another version/actor are 409.
Subsequent saves and A→B→A reversions at current versions must persist rather
than replay stale responses. Other command fingerprints and stored records stay
unchanged. This repairs attempt identity, not a domain transition or deadline.

Triage/save audit roles come from the authenticated principal already supplied
by the request pipeline, validated against RequestContext actor/tenant and the
existing policy helper without narrowing permission or global-admin paths. The
existing protocol principal-forwarding pattern
is the source; no role is accepted from browser payloads. Secretary-only requests
record secretary, and multi-role attribution uses existing tuple order. Role attribution prefers the real canonical route role, then an actual role
individually authorized by the existing helper. Permission-only authorization
remains valid: record an actual principal role or NULL when no role exists, with
audit details declaring permission-based authorization. DDL03/12 support nullable
actor_role. Missing role intersection never introduces a new denial. No
hardcoded analyst fallback, new grant or policy bypass is introduced. Inspector
proves retry/re-save/revert and audit attribution before Engineer correction.

## Addendum — command version tokens and installed interceptor errors

The generated case GET may expose an Express cache ETag unrelated to the domain
version. The CASE blueprint and command service define the command precondition
as the quoted persisted case version. For the four activated operations, separate
that token from raw HTTP cache metadata. Validate the actual GET body version as
a positive safe integer and serialize it without increment/default/coercion;
matching strong numeric header is usable, weak/opaque cache headers are not.
Contradictory numeric header/body or missing/invalid version fails closed and
clears stale command preconditions. Successful command ETag is authoritative for
the subsequent command attempt. No generator or backend GET change is needed.

The installed Angular interceptor maps HTTP failures to SDK error instances.
RAIT's boundary first verifies public StynxSdkError class identity from an
explicit direct @stynx-nyx/sdk dependency at the already installed version1.5.3,
then uses the public Angular classifier and the unchanged RAIT status/catalog
mapping and safe context/requestId validation. Server text/translation keys and
lookalike plain status objects are not trusted. Tests use the real interceptor,
not only direct HttpErrorResponse mocks. This is a bounded integration correction,
not new domain behavior, framework/version or global permission policy.

The prior no-direct-SDK wiring preference is superseded: Angular's status0
structural fallback cannot distinguish generic lookalikes from actual SDK
network errors. Import the public StynxSdkError and use instanceof; never compare
constructor.name or Error.name, which are not stable/minification-safe identity.
Only the app package declaration and corresponding lock importer are added for
the same SDK1.5.3 already transitive. Generic status0/412 objects remain unknown
without context leakage; real SDK status0/codeundefined remains offline.
