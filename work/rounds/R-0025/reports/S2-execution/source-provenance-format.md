# S2 source provenance — exact internal receipt encoding

Architect, Articles6–10/24. This supplements source-freeze.md with deterministic
representation, not authority, a producer/store or a business decision. S2 remains
backend only. No runtime/test/Git/state edits. The accompanying JSON is normative
for exact keysets, per-table consumed projections and per-kind completeness.

## Independent construction and comparison

1. Inspector provisions explicit controlled tenant rows and genuine synthetic
   event/activation/disposition history. Separately capture exact allowlisted SQL
   projections as text with dates/timestamps normalized below. Compute row revisions
   and immutable qualification receipts **before** invoking HTTP. Fixture expected
   receipts never import runtime digest helpers or copy a runtime request digest.
2. Runtime factory reads those actual current rows through caller Tx, validates
   complete parent/owner/source linkage and constructs its source envelope. Its
   RaitRiskProvenanceRequest contains existing kind/tenantId/caseId/sourceRefs and
   contentRevision. sourceRefs are sorted unique row identity refs used by that
   request; contentRevision includes every consumed source/dependency row below.
3. Qualification reader independently resolves the sourceRefs in that same Tx,
   reconstructs canonical rows, checks exact current row revisions against a
   previously admitted receipt and verifies receipt origin/authority. A valid
   digest without admitted origin yields missing; conflicting admitted receipts
   yield ambiguous. It never answers qualified by echoing contentRevision.
4. For controlled fixtures, only the provenance-reader port may be substituted
   with a reader over precomputed explicitly test-qualified receipts. It must still
   re-read and independently compare actual SQL rows, not accept arbitrary request
   hashes. Keep real SQL snapshot factory, joins/selection, timing, parameters and
   incident linkage running. Changing one consumed field invalidates the receipt.
5. Production composition needs existing independently verified operational receipt
   or exact immutable audit lineage. This document supplies no producer or audit
   action name and grants nobody qualification authority. Missing authentic source
   is503, not permission to synthesize a matching receipt from a live request.

## Canonical bytes and identities

Use UTF-8 compact JSON, no BOM/newline/whitespace. Recursively sort object keys by
ECMAScript UTF-16 code-unit order; do not locale-sort or Unicode-normalize strings.
JSON strings use standard JSON.stringify escaping; finite safe JSON numbers only,
no negative zero/NaN/Infinity/undefined. Arrays preserve order except row/binding
sets sorted by sourceRef and dependency sets sorted by full digest; duplicates
reject. All keys in closed projection/receipt shapes are ASCII. Canonical JSONB
nested objects apply the same algorithm; do not truncate payload objects or reorder
semantic arrays. Numeric JSON outside safe precision is unavailable rather than
rounded. Bool remains bool; string remains string; missing never equals null.

Each projected SQL key in the JSON fieldsets must be present, including explicit
null for nullable fields. Missing required row is unavailable. Do not invent a
column absent from its actual table, such as instance/status on rait_deadline.
UUID fields and references are lowercase canonical UUID text. SQL bigint event_id
is a decimal string without leading zeros; bytea hashes lowercase hex without
\x prefix. Date columns are YYYY-MM-DD. Timestamptz is normalized in SQL as
`to_char(value AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`, always six
fractional digits. Preserve microseconds; JS Date.toISOString is insufficient.
Do not normalize arbitrary payload strings as dates/UUIDs by guessing their names.
Serialize objects by concatenating sorted key/value encodings directly; do not
JSON.stringify a reconstructed object, whose integer-like keys can enumerate in
a different order. Numeric encoding is ECMAScript JSON.stringify finite shortest
round-trip serialization; independent tests may implement the same specification
without importing runtime helpers.

Integer columns are safe JSON integers. JSONB from SQL is parsed, never double
encoded; the four ladder values must be objects, not JSON-looking strings.

Ordinary row sourceRef is `sql:<schema.table>:<lowercase UUID id>`. Audit uses
`sql:audit.events:<decimal event_id>@<normalized occurred_at>` because its primary
key is composite. Reject aliases, unknown tables, duplicate refs, wrong tenant,
wrong parent and mismatched fields.id/event_id. All projected timestamps/UUIDs
are normalized according to their actual SQL types. Source references remain
internal; callers never submit them as authority.

A rowRevision is `sha256:` plus lowercase SHA256 of canonical row envelope
`{sourceRef,table,fields}`. Request contentRevision is the same prefixed digest of
`{schemaVersion:1,namespace:"rait-risk-source-v1",kind,tenantId,caseId,rows,dependencies}`.
Dependencies contain only already qualified receipt digests, sorted unique;
never include the receipt currently being validated. Empty dependencies are valid
only for an independent authoritative input, never missing required provenance.
No asOf enters a content revision: current operation instant is independently
validated and all evaluated candidates share it. Field changes, versions or
qualification receipt changes do change revision. No timestamp is a fake sequence.

Receipt core exact shape is schemaVersion1, namespace rait-risk-receipt-v1,
receiptId,kind,tenantId,caseId,bindings,authorization,dependencies,policySources.
policySources is always present (empty outside applicable policy qualification). Bindings are
sorted `{sourceRef,rowRevision}` for every source row that receipt qualifies;
no partial binding may qualify an entire request. authorization has authorityRef,
actorId,decisionRef,recordedAt. These fields are claims until independently verified
by the admitted operational/audit source; nonempty strings do not make them true.
No algorithm creates authority by hashing them. Its digest is SHA256 canonical core;
origin verification is external to that core, avoiding self-reference. No new
signature scheme or file/env allowlist is introduced. Audit source receipts include
exact audit row content/self_hash and validated append-only lineage, not a guessed
action label, latest actor or nearby timestamp. Verify source action already has
meaning under an accepted contract; this encoding adds no action authority.

A parameter activation receipt may use caseId=null only because the selected
parameter is genuinely tenant/agency/surface scoped. Its tenant, exact row/version/
value/status/effectivity and authority must match. The request still binds actual
caseId and separately verifies agency/tenant precedence; null is not wildcard case
read permission. Other kinds require exact caseId. Canonical A/C proposal rows
never qualify executable activation. Synthetic fixture vigente rows/receipts are
explicitly separate from canonical proposed values. B/D normalization never edits
old production versions. Each parameter value sourceRef must equal its exact
approved literal in the accompanying JSON; no invented URI/source-token alias.

## Exact projection and completeness

The accompanying rowFields enumerates every consumed SQL column. No SELECT * hash,
mutable created/updated timestamp surrogate, guessed owner relation or omission of
a field actually used by calculation/qualification is allowed. If Engineer needs
an additional consumed field, Architect records a bounded representation update
before Inspector freezes its expectation; it is not implicitly trusted.

Every request binds the current case and supporting owner/clock rows except
parameter-only activation, which independently binds selected parameter. Timer
choice must agree with ARCH-RAIT-DEADLINES: A/C/D canonical infraction timers; B
instance-owned case timer when actually qualified. Conflicting duplicate current
sources fail closed. Track360 requires actual tempestividade + authentic extension
source; 180 requires independent qualified track disposition, never absence proof.
C movement and D interruption include actual event payload and qualified operative
policy. Bind the actual ops.parameter row when it is the existing operative policy
source; otherwise require a separately admitted canonical policy/version dependency
receipt. No new C movement parameter key, policy writer or policy value is invented.
Descriptive/unqualified policy is not executable provenance. For initial D start,
an authentic original-start disposition replaces an interruption event; it does
not invent an interruption. The distinction below controls which policy input
is necessary. Missing required branch-specific source is503.
Applicable-clock inputs are never qualified by absence; B defense NA must bind
persisted case instance/source. Per-kind requirements retain exact current clocks,
source event records and supporting audit where their source refs depend on them.

Incident binds exact alert+clock+incident and parent, including every populated
incident target; one matching link cannot excuse another inconsistent link. The
current receipt binds opened_by when present, but its presence alone is not
provenance. No cause/outcome text is needed or exposed. Qualification source row
changes invalidate the receipt. The same-Tx row/version locking/revalidation
obligations from source-freeze.md still apply.

`sourceVersions` public entries are opaque `rrv1:<64 lowercase hex>` values derived
from qualified current content/receipt revisions, never raw sourceRefs, tenant/
case/person IDs, source payload or incident/audit details. Deduplicate and sort
these opaque identifiers. Internal sourceRefs may enter existing authorized claim
audit, not analyst errors. An encoding-only test vector in JSON demonstrates bytes;
its deliberately empty rows cannot qualify any source or request.


## Exact operative-policy dependency binding

The JSON policyCanonicalSources fixes the existing canonical source references and
whole-file SHA256 bytes. policySources entries have exactly sourceRef,
sourceRevision,decisionRef; sort by sourceRef, reject duplicates/unknown refs.
Source fragments identify already existing sections; sourceRevision hashes the
whole document bytes, not an invented extracted policy string. A decisionRef must
resolve to the actual admitted decision in that source; a source hash is not an
activation or a complete executable policy. No arbitrary URI, new parameter key,
new policy producer or new receipt store is introduced.

For an actual C reset or D interruption, the precise policy alternative is one actual existing selected policy parameter
row plus its qualified activation receipt, OR an independently admitted complete
closed operational-policy receipt whose policySources binds those fixed canonical
references and genuine decision provenance. That dependency uses the same receipt
core encoding, source row bindings where it has SQL inputs, and externally verified
origin. It is listed by its canonical receipt digest in the request.dependencies.
A dependency digest without the admitted full receipt and matching source content
is missing. Cycles/self-reference reject. The qualification reader must independently
retrieve/verify that dependency; it never treats an arbitrary digest as a policy.

In particular RN113/ARCH references acknowledge unresolved interruption detail;
those descriptive bytes alone cannot create a complete D interruption policy.
For an actual interruption, without independently verified complete applicable
policy/event input, return503. A proven unchanged original start follows the
separate branch below. Controlled
fixtures must explicitly name actual approved source/activation evidence; this
format does not manufacture a legal interruption list. A newly needed legal rule
still goes to parent for a concrete resolution, never a synthetic fixture shortcut.

## D original start versus actual interruption

RN-RAIT-113 starts D at verified practice/cessation; ADR0049 requires verified
start/reset/ceiling. Neither makes a globally complete interruption list a new
prerequisite merely to preserve an independently proven unchanged original start.
The original source-freeze explicitly states practice/cessation OR actual authorized
interruption. Earlier wording in this additive draft requiring complete policy in
both branches was overbroad; this section and JSON originalStartBoundary correct it.

ORIGINAL requires verified practice/cessation records, aligned current canonical
T-PRESC-5A timer/clock and an independently authenticated original-start disposition.
That disposition must cover the complete authoritative current timer/history/source
inventory through its actual observation checkpoint, bind exact parent/timer/source
content revisions and every consumed event/audit row, and prove no unresolved or
inferred reset. Re-read full relevant current source coverage in caller Tx and
check the receipt's actual coverage checkpoint against current parent/source
revisions; changed coverage, contradictory events or an unknown reset fail503.
An empty event query, equal dates, old receipt, non-null start_basis or absence of
an observed interruption is not independently qualified no-reset evidence.

RESET requires actual authorized interruption event plus complete applicable
qualified interruption policy and current timer/clock alignment. Do not guess a
legal list, treat NP as automatic reset or adopt an incomplete descriptive parameter.
Missing/ambiguous required input remains503 in either branch. This distinction
removes an invented precondition; it creates no fallback, new legal fact, evidence
producer/store or production qualification. Inspector must prove original qualified
positive separately from missing-original-provenance and ambiguous-reset negatives.

## Exact request cardinality

Each qualification request covers one clock (identified by exactly one clock row)
or one selected parameter. The factory composes four applicability records from
those complete requests; four clock rows in one unconstrained bag are not proof.
The JSON kindCardinalities is normative. At most one current source timer for that
clock; match actual tenant/parent/code/instance. One selected parameter per parameter
qualification; each ladder/version has its own activation receipt. Multiple actual
support rows are permitted only when named/consumed by verified evidence, and all
such rows must be present, not a convenient subset. Reject unrelated extras and
unresolved competing current reset/interruption/alert sources. Exact table fieldsets
remain mandatory for every row. This is completeness validation, not automatic
inference that absence of an optional event means no event ever happened.

## Legacy disposition provenance through the same internal boundary

The narrowly typed internal extension is kind `legacy` on the existing
RaitRiskProvenanceRequest union in the already owned riskport, using the same
qualification reader and receipt encoding. No new token, table, public API,
provisioning writer, role or audit action is commissioned. The independent
RaitLegacyQualificationService reconstructs actual same-Tx SQL rows and references;
a nonempty authorization_ref/distribution_ref never proves authorization.

The JSON adds exact legacy entity/current case/unit, pool relation, assignment,
reviewer identity fieldsets and reference bindings. Lock current case and select
latest version-bound disposition revision; reject stale observed_version/state,
conflicting newer revision, tenant mismatch or inconsistent actual assignments.
Qualified_unassigned requires actual admission and distribution source history,
exact current pool containment and complete current assignment inventory covered
by the verified operational disposition. A current no-active-assignment query is
necessary but cannot replace provenance of admission/distribution. preserve_assigned
requires its actual active assignment; claim does not reclaim it. Hold requires
reason and authentic operational authorization without inventing missing proofs.

Real admission emits INF_RAIT_CASE_ADMIT (CASE service rule100 and actual domain
audit.write1047). Bind actual same-case event plus that audit record, or independently
verified historical operational source proving the equivalent admitted fact.
For historical distribution fixtures, create explicitly synthetic ADMITIDO→
DISTRIBUIDO event/history under the approved compatibility fixture contract and
bind it to the independently admitted synthetic operational receipt. Do **not**
write or trust an invented distribution audit action as if an accepted production
writer emitted it. Existing verified case/pool history must agree. Source events
without an authentic operational disposition cannot qualify a legacy state.

Reviewer is existing canonical auth.users.id matching receipt authorization.actorId;
historical authority at observation must be independently verified, not invented
from a new role string or present-day membership. No new reviewer permission is
created. Receipt revocation/inconsistent provenance denies; changing a historical
reviewer's current active flag alone does not rewrite the past decision.

The authorization_ref is the stable `receipt:<lowercase UUID receiptId>` locator
of the independently admitted legacy receipt core, never its own digest. Allocate
receiptId before constructing bindings; the actual SQL authorization_ref is then
known and included unchanged in the qualification rowRevision. The receipt core
contains that stable identity and full bindings; its digest is computed afterward.
This has no self-hash cycle and requires **no masking of actual SQL fields**.
Locator equality is not proof: verify the independently admitted full receipt,
its digest/origin, exact current rows and historical authorization. An echoed
request digest cannot serve as a receipt or create an authorized identity.

Inspector independently builds complete synthetic historical rows and the stable
receipt identity, inserts that locator in qualification data, computes actual row
bindings and the receipt digest, then supplies the immutable admitted synthetic
receipt to the trusted fixture provenance reader. The real resolver re-reads and
recomputes those exact rows without changing any source field.
Changing version, reviewer, reason, source refs, event, audit, pool or assignment
must invalidate the receipt/qualification. Held/assigned rows stay visible to
qualified inventory. Unknown/stale/untrusted legacy returns safe409, not risk503
or silent QUEUE_EMPTY. Exact successful replay retains its existing semantics and
does not rerun first-use version qualification after the claim changed version.

No runtime or acceptance result is claimed by this clarification. Inspector must
prove changed-row, wrong-tenant/parent, stale activation/version, unknown origin,
echoed digest, duplicate/ambiguous receipt and proposed-only parameter negatives
alongside independent actual-SQL positive receipts. No new production qualification
follows from controlled fixture success.
