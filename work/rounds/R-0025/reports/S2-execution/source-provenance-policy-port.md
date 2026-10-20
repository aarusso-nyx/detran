# S2 additive C policy provenance port

Architect, Article 7. TASK-0043; S2-R12 adopted under the recorded Owner delegation.
This supplements the historical frozen format without editing its bytes. The
companion JSON fixes exact request/result keysets, namespace, bindings and source
hashes. No runtime, test, database, Git, state or original format edits occur here.

## Exact internal request and result

Add optional `qualifyPolicy(tx, request)` to the existing trusted reader only.
Request keys are exactly purpose, tenantId, caseId, sourceRefs, contentRevision,
policySources. The sole purpose token is `C_USEFUL_MOVEMENT_POLICY`; it is an
internal discriminator, not a new source kind, legal event or public HTTP field.
All identifiers use the original canonical encoding. sourceRefs is sorted unique,
nonempty and equals the actual rows in the canonical request envelope.

The canonical envelope is schemaVersion1, namespace rait-risk-policy-request-v1,
purpose, tenantId, caseId, rows, dependencies, policySources. Dependencies is
exactly empty for this independent policy request; it is not a new request key.
Compute contentRevision as the original prefixed SHA256 algorithm applied to
this distinct envelope. Preserve original canonical byte ordering, exact SQL
projection types/microseconds, row revisions and duplicate rejection. This new
namespace does not reinterpret or change historical source-v1 content revisions.

Bind exactly the actual case, linked AIT and infraction, C clock, owner-compatible
current T-PAR-3A timer and actual resolved reset event. Include every support/audit
row named by the admitted proof. Re-read through caller Tx with the existing
source locks/revalidation. The companion reuses the frozen fieldsets by reference;
no column masking, empty-row policy shortcut or fabricated event is allowed.

policySources uses existing fixed sourceRef/sourceRevision/decisionRef shapes.
Require the actual complete applicable C policy, including WF-RAIT-002 §4.2 and
verified decision provenance. Fixed whole-document hashes identify bytes; they do
not prove completeness, activation or authority. Do not infer event authorization
from an event label or invent a decision reference, key or policy value.

Qualified result has exactly status='qualified', receiptDigest and sourceVersions.
receiptDigest is the canonical SHA256 digest of the full existing independently
admitted/retrieved receipt core. sourceVersions is a nonempty sorted unique list
of opaque rrv1 identifiers. The reader must not equate these two identities;
opaque versions cannot be reversed or substituted for a receipt digest.
Missing/ambiguous results have exactly status and empty sourceVersions, with no
receiptDigest. Absent method and every malformed/unqualified result fail503.

Use the existing receipt-v1 core and movement kind, full current row bindings,
exact tenant/case, authentic historical authorization, empty independent
receipt dependencies and complete nonempty policySources. This is a qualified
policy use selected by the explicit method purpose and validated content; a
movement-kind label alone is never enough. No new receipt kind/store/writer or
signature scheme is introduced. Reader retrieves/adopts authentic authority
independently; matching hashes, locator labels and request echoes are not proof.

Then issue the original **full movement qualification** against actual reset
rows with that receiptDigest in its sorted dependencies. Its reader independently
retrieves/verifies that policy receipt. Policy and movement source versions stay
opaque and are deduplicated/globally sorted; no rrv1→sha256 conversion. Cycles or
self-dependencies reject. Production composition remains absent/missing until a
separately accepted real verifier exists; no provider is invented here.

## Calendar and read boundaries

Threshold steps use the existing public addCalendarDays/addCalendarMonths raw
dates. Never shift a threshold for a weekend/holiday. Only canonical due/ceiling
comparison uses the existing public Calendar owner. Share the existing tenant SQL
calendar adapter through a static calendar helper within the already owned
RaitDeadlineEngineFactory and app provider; avoid Nest module/provider cycles.
This is reuse of one adapter, not a second calendar algorithm, new file or
holiday applicability policy. Missing authoritative calendar scope/source fails
closed rather than being guessed. Pure versions union is globally sorted.

Run nonlocking S1 preauthorization `assertCase(..., false)` before global source
locks; `true` would lock CASE first and invert R7. Then acquire ordered relation/
parent locks and repeat locked S1 authorization/revalidation in the same Tx before
source disclosure. Revocation during a wait must deny. Existing S1 method/path
is unchanged; this does not permit an authorization gap. Approved
new scoped risk GET and WORKLIST current-risk projections apply to their sourced
applicable instances and retain R7 locks after authorization. This narrowly
supersedes R9's defense-only wording for these new reads; established JARI/CETRAN
claim dispatch and unrelated reads retain their previous behavior. No new action,
role or purpose grant. The two SHARE locks remain table-global across tenants.

## Independent sensor and delivery requirements

Inspector first proves F1 with an independently admitted full C policy fixture
whose opaque IDs differ from the receipt digest. Verify exact dependency retrieval,
source/decision/parent binding and no request echo; reject absent method, zero
bindings, unknown purpose, malformed result, mismatched digest, wrong case/tenant,
clock/timer/event, incomplete policy, competing receipt and stale rows. A qualified
policy must not make an independently unqualified full movement succeed.
Fixtures compute bytes independently; no import of runtime digest helpers.

Add weekend/holiday raw threshold boundaries and due-only rounding; missing
calendar qualification stays negative. Denied risk reads acquire no global locks;
authorized new applicable-instance reads retain them. Retained JARI/CETRAN claim
commands regress unchanged. Prove unsorted opaque union becomes sorted without
changing its members. Engineer follows accepted Inspector RED within existing
owned risk-port/app-provider/CASE-factory/pure-evaluator paths only.

The process-local cursor key remains an OPEN restart/multireplica pagination
availability blocker. No shared secret/configuration or production topology is
invented. D RESET, authentic production provenance, candidate-universe proofs and
all other recorded limitations/gates remain; this source is not GREEN or closure.
