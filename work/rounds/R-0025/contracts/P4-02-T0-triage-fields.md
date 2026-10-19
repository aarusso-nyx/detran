# P4-02 T0 — closed triage field and document-class map

Architect, Constitution Article 7; authority by path under Article 6.

This mapping completes the source-to-field portion of T0 for the D8–D11
supplemental packet. It is an architectural projection contract, not a runtime
implementation, a new legal decision or evidence that production documents have
been verified. R-0025 remains open and runtime remains paused for this review PR.
The approved scope predicates in ADR0046 and the supplemental role matrix apply
before any projection below. Caller-selected purpose, a frontend tab or possession
of a UUID never establishes authority.

## Source precedence and inspected boundaries

UC-RAIT-002 (approved), RN-RAIT-121 (approved) and the Owner-approved admission-first
contract govern. IU-RAIT-008 §§4/8 and RN-RAIT-120/134/137 provide the field-purpose
and minimization sources; their draft status does not promote an unsourced legal
rule. IU008's historical claim-before-triage and immediate post-admit distribution
wording does not override the later approved D1/P4-02 sequence. This document does
not reopen those decisions or add a new signature/procuration legal threshold.

Inspected implementation/contract sources:

- `docs/framework/arch/rait-web-forms.md` §3 and
  `apps/rait/web/src/app/forms/triagem.schema.ts`.
- `apps/rait/web/src/app/features/caso/pages/triage.page.ts`,
  `case-layout.page.ts` and `shared/case-header.component.ts`.
- `apps/rait/web/src/app/data/facades/case.facade.ts` and the CASE typed models.
- `docs/framework/blueprints/BP-INF-RAIT-CASE-001.json`, its generated create DTOs,
  and `docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json`.
- CASE handwritten `rait-case-command.service.ts`,
  `rait-admissibility-command.service.ts`, `rait-document-trust.verifier.ts`.

The existing generated whole-entity shape is an inventory of fields, not a grant.
Future OpenAPI purpose projections must express these subsets explicitly; do not
satisfy the layout by returning every generated DTO property or casting a smaller
object to a whole entity. Scope and field minimization happen on the server.

## Closed purpose projections

| Purpose / authorized actor                                                            | Allowed existing fields                                                                                                                                                                                         | Explicit exclusions / conditions                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collective claim metadata; eligible analyst                                           | CASE `id`, `protocol_number`, `instance`, `state`, `protocolled_at`, `unit_id`, exactly as ADR0045 queue items                                                                                                  | No party identities, petition narrative, document metadata/body, merits, contact or storage fields. Scope/order before pagination; eligibility does not grant triage or merits.                                                                                                             |
| Scoped pre-admission triage; analyst or secretary with the existing action permission | CASE `id`, `protocol_number`, `instance`, `state`, `protocolled_at`, `version`, `suspensive_effect`; `unit_id` for scoped binding if needed in the typed read                                                   | `ait_id`, intake channel and jurisdiction may be used internally for authoritative deadline/scope resolution; internal use does not require their disclosure. No unrestricted origin-case traversal or unrelated case fields.                                                               |
| Same triage, applicant identity/representation                                        | PARTY `id`, `case_id`, `role`, `person_name`, `legitimacy_basis`, `representation_kind`, `representation_verified`, `representation_document_id`, restricted to `requerente` / `procurador` linked to this case | No `document_number`, `contact_email`, authority/staff party records or third-party facts. Names are already the source-backed CaseHeader presentation; no CPF/email grant follows from legitimacy checking. Linked representation document remains subject to its own parent/class checks. |
| Same triage, recorded checklist                                                       | ADMISSIBILITY `id`, `case_id`, `criterion`, `verdict`, `reason`, `evaluated_at` for the four criteria below                                                                                                     | `evaluated_by` remains audit provenance internally; not required by this checklist projection. Reasons remain case-scoped and must not copy petition/third-party narrative into list/header output.                                                                                         |
| Same triage, deadline explanation                                                     | DEADLINE `id`, `case_id`, `timer_code`, `start_basis`, `started_on`, `raw_due_on`, `due_on`, `business_days`, `extension_count`, `legal_basis`; authoritative timeliness verdict and basis                      | Only the applicable admissibility timer, not every case clock/deadline. Server owns calculation and calendar/parameter resolution; missing source remains an error. No browser calculation or editable timeliness.                                                                          |
| Same triage, header risk if present                                                   | CLOCK `id`, `clock_code`, `flag`, `ceiling_on` for authorized case clocks actually needed by the header                                                                                                         | Existing header renders each clock independently. Flags require the supplemental authoritative producer; missing producer cannot be replaced by a default low-risk value. No alert/staff/other-case payload.                                                                                |
| Assigned merits / approved oversight                                                  | Existing dossier reads only after their complete assigned-purpose or explicit oversight-purpose predicate and field/class minimization                                                                          | This map does not grant all DTO fields or binary access to either purpose. D8 secretary/board/authority projections and third-party suppression still apply. A triage read cannot be upgraded to merits by loading the dossier tab.                                                         |

`tenant_id` and actor identity are server context, never client-editable authority.
The external HTTP permission and the parent case predicate are both required on
all reads, including document references and list totals. Multiple roles must
satisfy one complete purpose; no mixing triage fields with another role's scope.

## Four criterion evidence and command mapping

| Criterion           | Existing source-backed evidence / recorded fields                                                                                      | Boundary                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tempestividade`    | Server verdict and reason; deadline term/start, applicable timer/legal basis, raw due date and extended due date; protocol date        | UC002 AC1/2; read only. Existing engine selects `T-DEF`, `T-NP-VENC` or `T-R2` by instance. Do not introduce a second deadline calculator.                                                                                                                                                                                                                            |
| `legitimidade`      | Applicant `legitimacy_basis`; procurator representation kind, linked instrument and verified status; existing criterion verdict/reason | UC002 step3, RN120 and approved RN121. A boolean alone does not prove that expiry/powers/authenticity were verified. Missing trusted evidence stays unverified; no automatic positive or inferred identity matching.                                                                                                                                                  |
| `assinatura`        | Existing human checklist verdict/reason and verified intake evidence if an authoritative source supplies it                            | UC002 step3. Protocol document metadata/hash or an attached filename is not proof of a signature. The inspected document trust adapter verifies draft/signature/withdrawal-specific operations; that does not establish a generic intake-signature verifier. No invented verification result.                                                                         |
| `pedido_compativel` | Existing human verdict/reason for request compatibility                                                                                | UC002 step3 and IU008 §8 require this verdict while excluding free petition text in the checklist. Record the verified result and its existing evidence reference where available; do not expose the whole narrative as a shortcut. No machine-invented positive follows from absent metadata; the existing authorized human assessment remains the recorded verdict. |

The earlier approved human-checklist workflow and guards are preserved. An
existing authorized human verdict/reason is the recorded assessment; a missing
machine certificate does not add a cryptographic verifier, provider or new
prerequisite before human save/admit. “Unverified” here prevents inventing a
positive or presenting an absent proof as authenticated; it does not invalidate
an authorized human assessment made under UC002/RN121. A qualified human
procuration/verification record may supply the operational evidence. This map adds
no command precondition beyond the canonical RN121 requirements and existing
command guards, and activates no provider. Negative tests distinguish a forged
machine proof/reference from a permitted human checklist submission; absence of
a new certificate alone is not a new reason to deny that submission.

Existing form editable fields are precisely
`verdicts.{legitimidade,assinatura,pedido_compativel}.{verdict,reason}`,
`outcome`, `nonAdmissionReason`, `nonAdmissionGrounds`. Its
`context.timelinessVerdict` and `context.caseState` mirror server state, not trusted
command inputs. Existing save transport uses `case_id`, `criterion`, `verdict`,
`reason`; supported editable criteria exclude timeliness. Admit/reject retain
existing If-Match and actor/action guards. Non-admission reasons remain exactly
`intempestivo`, `ilegitimo`, `sem_assinatura`, `pedido_incompativel`; no fifth reason
for missing agency documents is introduced. Secretary checklist permission does
not imply permission to conclude analyst-only admission/non-admission commands.

Existing PARTY tokens are `requerente`, `procurador`, `autoridade`;
`legitimacy_basis` is nullable or `proprietario`, `condutor`, `embarcador`,
`transportador`, `possuidor_equiparado`, `principal_condutor`.
`representation_kind` is nullable or `procuracao_publica`,
`particular_firma_autenticidade`. This copies canonical storage vocabulary, not a
new ruling on whether each basis is sufficient for each act. In particular do not
promote `principal_condutor` to universal appeal standing from its enum presence.

## Document classes, metadata and content boundary

The canonical document `kind` is **an open varchar/string**, including in protocol
payload validation; there is no closed kind enum to copy. `origin` is exactly
`requerente` or `oficio`. Neither a caller-supplied kind nor origin proves class,
authenticity, signature, agency provenance or permissible readership.

| Legal/document class                                                                             | Existing linkage / exact inspected token                                                                                                               | P4-02 triage projection                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicant petition/request                                                                       | Existing remittance guard recognizes `kind='requerimento'` with `origin='requerente'`; protocol accepts other kind strings without semantic validation | Presence/reference only for the authorized case. Never full petition text/body in queue, header or checklist. Do not treat this alias as an intake signature certificate.                                                                                             |
| Representation/procuration instrument                                                            | PARTY `representation_document_id`, representation kind/verified status; no dedicated document-kind enum in the blueprint                              | Only same-tenant/same-case linked document metadata, with verified classification/provenance. No guessed `procuracao` kind token or download permission. RN121 validity/powers/authenticity need trustworthy verification evidence, not a new agent-defined standard. |
| Applicant identity / legitimacy proof                                                            | RN120/121 require the corresponding quality/proof; no dedicated typed document-kind enum/link for every quality exists                                 | Expose the approved party/evidence verdict metadata above. Unclassified documents are not automatically identity evidence. Do not return identity numbers or document images merely because protocol stored them.                                                     |
| NA / NP / AIT issued by the agency                                                               | UC002 exception3a and AC4 / RN003; CASE `ait_id` is an internal binding, not a document class token                                                    | Presence/missing-own-agency status where verified; absence cannot become a non-admission reason. Existing obligation to attach officially remains, but attachment/task/download implementation is not activated by this read-only packet.                             |
| Other pieces, medical/priority proofs, third-party narratives, drafts/decisions/inquiry material | Open kind strings or later-stage resources                                                                                                             | No triage permission follows from storage membership. Exclude from this purpose unless a separate approved source specifies the exact necessary projection; no catch-all document list.                                                                               |

For a verified necessary document reference, the minimal metadata subset is
`id`, `case_id`, `kind`, `origin`, `attached_at`, `digitised_from_paper`.
Selection must be by verified case-linked evidence/class, not a caller's kind
string. `filename` can itself reveal sensitive narrative and is excluded from
this triage projection; so are `storage_key`, binary bytes, URLs/signed URLs,
`content_hash`, `attached_by` and transport credentials. Hashes and actor identity
may support server-side provenance checks without being disclosed. No upload,
attach-officially, fetch-binary or signed-URL endpoint is commissioned here.
Unknown class/linkage yields no document disclosure and no fabricated positive
criterion; it is not itself a new legal reason for rejection.

## Completion and remaining evidence

T0 field/class mapping is complete as a specification: each necessary criterion,
consumer dependency and known document class has an explicit allowed subset,
source and denial boundary. Unknown fields/classes are deliberately excluded,
not delegated to a generic full fetch. Runtime and acceptance remain unexecuted.

Production identity qualification, explicit role scopes, deployed legacy inventory,
authoritative risk freshness and verified intake/representation evidence remain
operational inputs. Their absence is not cured by this mapping or a disposable
fixture. Provisioned tests may supply trustworthy tenant fixtures and must prove
missing/forged evidence and parent-class mismatches fail closed. A future
requirement to inspect petition binaries, obtain document URLs or add a new trust
provider exceeds this packet and needs an explicit bounded amendment; no such
implementation or permission is inferred here.

### Current-risk read supplement

ADR0049 defers persisted flag changes/publication. Existing clock records and
flag_changed_at remain stored chronology, not assessment proof. Where the header
shows current risk, use the generated typed raitCaseRiskSnapshot read from the
amendment (same case scope) and its asOf/sourceVersions. Derive the view's flag
from that snapshot; never cast it to a complete stored RaitClock DTO or fabricate
a changed-at timestamp. Missing source displays the existing unavailable/error
state rather than a default low-risk chip. No flag/SSE/DASHBOARD feed is activated.
