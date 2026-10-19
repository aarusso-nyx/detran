# P4-02-S1-A2 — bounded frontend projection compatibility

Architect, Constitution Article7; Article6 authority by path. Status: PROPOSED,
awaiting explicit Owner approval. This report changes no T0 map, contract, UI,
runtime or test. It is an exact additional path packet to complete already
approved S1 without treating a purpose projection as a whole stored entity.

## Evidence and source precedence

The disposable generated-client/TypeScript/Angular dependency probe identified
42 existing consumers beyond S1's original compatibility ownership:25 mechanical
type consumers and17 consumers needing omission-aware rendering. Probe preparation
was not a delivered patch, acceptance run or permission to change those files.
Source inventory: /tmp/detran-s1-frontend-probe/dependency-inventory.md, SHA256
`b4ac1b91d95e2e5cede7f94855caeb2132fcc3d4e1321d4a5e2bd58d6aafdbc2`. Every proposed path below was verified to exist in this Architect worktree.
No source or scorecard file in the primary human checkout was read or modified.

Approved ADR0046/0047 and the closed T0 access/triage field maps govern the new
scoped reads. Existing whole-storage DTOs remain valid for their actual stored
entity or command contracts; they are no longer a license to disclose every
field. Read aliases must come from generated typed CASE/WORKLIST Commands schemas
and may be exported from the already-owned API client files. No new model path,
partial-as-full cast, double cast, broad Record escape or fabricated filler field.
Server-approved role/action/purpose and parent checks still decide access.

There are real earlier presentation requirements, not merely compiler noise:

- R-0012/contracts/CTG-0002b.md §5.17 explicitly describes BatchDrawViewer showing
  server position, claim_due_on and accept/decline data; §6.1 row29 is its batch
  detail consumer and row30 is the rapporteur-case screen. The existing viewer
  and rapporteur component implementations use those fields.
- The same contract §6.1 row20 requires pending-content field.missing presentation.
  The existing page reads pending.missing_items. R-0006/contracts/
  CTG-0002-deltas.md §a.6 defines batch-item storage position/deadline/acceptance
  fields; storage vocabulary alone does not establish a current purpose grant.
- The current T0 closed map explicitly excludes missing_items JSON until separately
  typed, and limits batch-items to qualified identifiers/member_id unless a typed
  functional distribution contract supplies further fields. This A2 does not
  commission that additional read contract or expose those fields.

Therefore omission of those batch/pending details is an explicit temporary
presentation limitation under the current narrower source, requiring this bounded
Owner approval; it must not be described as full parity with the old presentation.
Recommendation: preserve T0 exclusions and render the affected details unavailable
(or suppress them clearly) for this slice. Do not invent position/order, zero
deadlines, empty missing-item lists, acceptance/decline states or false booleans.
Keep server-returned item order; absence of position does not authorize browser
ranking. A separately reviewed future typed functional distribution/pending
contract may restore detail if warranted, without reopening S1 access grants.
Existing command payloads/permissions and positive legal journeys stay unchanged;
if an accepted command truly requires an absent read to construct its payload,
leave that control unavailable and report the dependency rather than synthesize
a value or silently claim its completion. No new command/action is enabled here.

## Capability cost and recommended decision

Approval explicitly permits temporary unavailable live data on these three
existing views/components, rather than accepted functional parity:

1. shared/batch-draw-viewer.component.ts: batch-item server position, claim
   deadline and accept/decline details unavailable in the existing batch detail
   presentation that consumes this component.
2. features/colegiado/pages/rapporteur-cases.page.ts: those same batch-item
   ordering/deadline/acceptance details unavailable in the rapporteur list.
3. features/protocolo/pages/pending-content.page.ts: requested missing-item
   detail unavailable; an absent JSON field is never an empty/satisfied checklist.

These are an explicit bounded presentation limitation, not a completed replacement
for CTG-0002b §5.17 or §6.1 rows20/29/30. Current S1 approval alone does not
authorize hiding this regression. Recommended A2 decision: make unavailable
visible now while preserving the approved privacy boundary, and retain a named
restoration item for typed functional distribution and pending-content projections
before declaring those full journeys complete. This report records that remaining
restoration requirement; it neither creates runtime backlog state nor closes it.
Restoration must establish actual role/purpose, fields and source/target parent
qualification before any later read expansion; this packet grants none.

Alternative: pause frontend compatibility at these three dependencies and reconcile
the exact typed functional read contracts first, then obtain the necessary bounded
contract/implementation approval. That preserves the full-detail requirement but
delays the S1 frontend deliverable. A2 approval selects the first option only;
merging the S1 PR still requires green checks and separate merge authority.

## Exact additional Engineer paths — mechanical type compatibility (25)

Each change below is limited to read-side type/import/signature propagation,
including readonly lists/maps and explicit narrowing of a generated purpose union.
It changes no request route, command input, filter authority, navigation, feature
activation, rendering semantics or returned data. If implementation reveals a
behavior change in this group, record it and stop for a further bounded correction.

| Exact repository path | Allowed change |
| --- | --- |
| `apps/rait/web/src/app/data/facades/bundles.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/data/facades/organization.facade.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/data/facades/protocol.facade.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/data/facades/radar.facade.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/data/facades/session.facade.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/data/facades/signing.facade.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/shared/clocks-panel.component.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/shared/minuta-editor.component.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/shared/quorum-indicator.component.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/shared/schedule-grid.component.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/queue-items.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/arquivo/pages/sealed-dossier.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/assinatura/pages/signing-decision.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/caso/pages/case-decision.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/caso/pages/impediments.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/caso/pages/inquiries.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/colegiado/pages/batches.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/colegiado/pages/opinion.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/fila/pages/defense-pool-queue.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/gestao/pages/risk-case-drilldown.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/gestao/pages/risk-radar.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/gestao/pages/units.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/organizacao/pages/members.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/organizacao/pages/pools.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |
| `apps/rait/web/src/app/features/painel/pages/resume-tray.page.ts` | Propagate generated scoped read aliases through existing input/store/facade signatures; preserve command/storage types and behavior. |

## Exact additional Engineer paths — omission-aware compatibility (17)

The same type discipline applies. Only the specified existing display/control
dependency may change; unavailable is distinct from known empty, false, zero or
a negative legal finding. No client-side enrichment fetch or full-DTO fallback.

| Exact repository path | Bounded compatibility behavior |
| --- | --- |
| `apps/rait/web/src/app/shared/admissibility-checklist.component.ts` | reason can be absent for S; preserve human editing and T reason without manufacturing a negative. |
| `apps/rait/web/src/app/shared/batch-draw-viewer.component.ts` | position and claim/accept/decline fields absent from EVERY new batch-item projection; source/explicit omission required. |
| `apps/rait/web/src/app/shared/case-header.component.ts` | suspensive_effect/person_name absent for some purposes; suppress unavailable labels, never fabricate false/name. |
| `apps/rait/web/src/app/shared/decision-panel.component.ts` | content_hash/signature_ref absent for S/O; disclose only supplied fields. |
| `apps/rait/web/src/app/shared/dossier-viewer.component.ts` | filename/hash/paper marker absent for S/T; no filename inference, PDF activation or URL/attachment fetch. |
| `apps/rait/web/src/app/shared/event-timeline.component.ts` | actor_id absent for S/O; render only supplied actor, never payload. |
| `apps/rait/web/src/app/shared/inquiry-card.component.ts` | subject/addressee absent S/O; suppress absent details. |
| `apps/rait/web/src/app/features/arquivo/pages/retention-queue.page.ts` | closed_at/archived absent O/T; narrow returned read before rendering, do not infer dates. |
| `apps/rait/web/src/app/features/caso/pages/communications.page.ts` | authority_appeal_notice absent O; current ternary would falsely display No; unavailable must stay unknown. |
| `apps/rait/web/src/app/features/caso/pages/draft.page.ts` | document_id absent S/O; never populate submit payload from unavailable read. |
| `apps/rait/web/src/app/features/caso/pages/history.page.ts` | archived absent T; narrow before conditional rendering. |
| `apps/rait/web/src/app/features/caso/pages/parties.page.ts` | person_name/document_number/legitimacy_basis omitted by purpose; blank/suppressed, no fallback personal fields. |
| `apps/rait/web/src/app/features/colegiado/pages/rapporteur-cases.page.ts` | position/claim_due_on/accepted_at absent ALL projections; same contract gap as batch viewer. |
| `apps/rait/web/src/app/features/gestao/pages/production.page.ts` | release_reason absent S/O; omit rather than fabricate. |
| `apps/rait/web/src/app/features/painel/pages/shift-dashboard.page.ts` | inquiry subject absent S/O; metadata presentation only. |
| `apps/rait/web/src/app/features/protocolo/pages/pending-content.page.ts` | missing_items absent ALL projections; source/explicit omission required; no invented checklist. |
| `apps/rait/web/src/app/features/protocolo/pages/redirects.page.ts` | reason/counterpart_agency omitted some purposes; blank/suppress only; command form unchanged. |

For batch-draw-viewer and rapporteur-cases specifically, the unavailable
position/deadline/acceptance fields remain absent from S1 reads: do not retrieve
them through raw/generated CRUD, command responses used as a new read feed or a
preview fixture. For pending-content, do not render an empty checklist or imply
all requested items were supplied when missing_items is absent. Document content,
attachments, petition text, URLs and identifying filenames remain excluded where
the active purpose excludes them. Unknown reason/notice/identity is not a legal
negative. Existing unavailable/pending-source presentation can be reused; adding
new localization keys or shared-model paths outside this packet requires a named
additional path before editing, not inline untranslated labels.

## Inspector ownership and attributable SDK export

All test writes belong exclusively to Inspector, including new frontend
*.spec.ts. This amendment proposes only the associated colocated spec path for
each of these42 files (replace its final.ts with.spec.ts), and existing colocated
specs for the S1-owned client/facade files. Tests must cover true omission versus
false/empty, permission/purpose narrowing and preservation of the existing
triage/archive/audit positive paths; no weakening of a prior assertion to conceal
a missing required journey. Where an older assertion requires one of the
explicitly deferred presentation fields above, retain trace to this approved
reference amendment and assert truthful unavailable rendering instead; preserve
the underlying command behavior assertions. Infrastructure/type failures are not
security RED or functional PASS. Inspector may identify an exact additional
required harness path before any edit beyond these colocated tests.

The attributable public type export in packages/api-clients/src/index.ts is
within the approved generated-client output ownership: add only
BpInfRaitWorklist001Commands from the generated
BP-INF-RAIT-WORKLIST-001.commands.js module. Engineer owns that export and
generation. No request SDK behavior, new endpoint, permission or unrelated export
change is authorized; Architect does not edit that runtime/package file.

## Boundaries, approval and verification

This packet adds exactly42 Engineer source paths above and their mechanically
named Inspector colocated spec paths. It extends S1 compatibility ownership;
it does not resume S2 or complete R-0025. Original S1-owned client/facade/preview
paths remain bounded by the same approved slice. No new screen/navigation,
attachment/download/upload, signing/diligence activation, current-risk producer,
claim UI, selector, parameter threshold, role grant or data-access expansion.
No law/pin/dependency/generator logic, scorecard or primary local changes.

After approval, Engineer implements only compatibility; Inspector runs unchanged
security sensors plus associated frontend omission/positive-path regressions.
Required affected checks include generated-client sync, TypeScript and strict
Angular templates, RAIT lint/tests/build, routed triage/archive/audit/preview
regression and full S1/root checks before the implementation PR. No production
role/document source is fabricated by a test fixture.

Requested approval: “Approve P4-02-S1-A2 as written.” This authorizes preparation
of the bounded compatibility changes and explicit temporary unavailable displays,
not merge, deployment, new data disclosure or later slices. Until approval, the
42 additional source paths remain untouched.

Preparation checks: inventory 42 = 25 + 17, uniqueness and file existence PASS. docs:kb:check PASS (773 artifacts, 446 canonical tokens). Source
comparison against the closed T0 map and cited older functional contract completed;
the earlier presentation limitations are explicit above. No runtime/UI/test edit,
frontend build or acceptance run was performed by this Architect report.
