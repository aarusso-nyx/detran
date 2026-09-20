# ADR-0018: Legal documents are rendered and signed by the STYNX substrate, templated by the owning domain

## Status

Accepted on 2026-09-13 by Owner decision (steering G.37), on the Architect's proposal of the same date. Extends ADR-0005
(kernel composition root) and Owner steering A.8 (PAdES + TSA for decisions and minutes).

Implementação: PR #43 (R-0006, CTG-0002, 2026-09-15) — documents facade types in `backend/domains/shared/src/documents/`
(`DocumentKind`, `SignaturePolicy`, `DocumentsFacade`); rendering, signing and storage adapters follow in R-0007 / WP-P.

## Context

Every app in the infractions scope produces legally relevant documents: the AIT print and
receipt (TEAT), NA/NP/edital (notification), decisions, opinions, minutes and drawing records
(RAIT), collection documents and refund orders (collection), protocol receipts and
acknowledgement evidence (PORTAL). The corpus asks for PAdES signatures with time stamp on
decisions and minutes, content hashes on every stored document (`rait_document.content_hash`,
`rait_minutes.document_hash`), PDF/A for archival (`UC-RAIT-024`) and templates owned by the
organ (`inf.normative_document_template` already exists in the TEAT normative catalogue).
STYNX 1.3.1 provides `@stynx-nyx/pdf` (HTML/Handlebars to PDF, fixture backend for tests),
`@stynx-nyx/pdf-a` (PDF/A-2b validation), `@stynx-nyx/signature` (PAdES, TSA, certificate
status; gov.br sandbox and HTTP providers; mock backend) and `@stynx-nyx/storage`.

## Decision

1. **No DETRAN document module.** Rendering, PDF/A conformance, signing, time-stamping,
   certificate validation and storage are the substrate, mounted once in `backend/app`
   (`StynxPdfModule`, `StynxPdfAModule`, `StynxSignatureModule`, `StynxStorageModule`).
   Domains never call a signing provider or a renderer directly; they call the kernel facade
   `@detran/shared/documents` (`render(templateKey, data)`, `sign(documentId, signer)`,
   `seal(documentId)`), a thin handwritten wrapper that adds tenant, audit and hashing.
2. **Templates belong to the domain that owns the fact.** `inf.normative_document_template`
   (TEAT normative catalogue) is generalised to the whole `inf` domain: one versioned template
   per document kind (`AIT`, `NA`, `NP`, `EDITAL`, `DECISAO_DEFESA`, `PARECER`, `ATA`,
   `ATA_SORTEIO`, `DOCUMENTO_ARRECADACAO`, `ORDEM_RESTITUICAO`, `COMPROVANTE_PROTOCOLO`,
   `CERTIDAO`), with the organ's identity and the legal text blocks as data, published by
   `agency-admin` through the existing normative-catalogue workflow (`WF-TEAT-003`).
3. **Signature policy is data, not code.** A table `inf.signature_policy` (document kind →
   required signers by role, PAdES level, TSA required, PDF/A required, gov.br level for
   citizens) drives the facade. RAIT decisions and minutes: PAdES-B-LT + TSA, signers per
   `UC-RAIT-016`/`UC-RAIT-020`; citizen pieces: gov.br level per `WF-PORTAL-002`; AIT: system
   signature plus agent credential as today (`ait_signature`).
4. **Every stored legal document is immutable**: `storage_key`, `content_hash` (SHA-256),
   `signature_ref`, `pdfa_conformance` recorded at seal time; later versions are new documents
   linked by `supersedes_document_id`. The sealed dossier of `UC-RAIT-024` is a manifest of
   hashes, itself signed.
5. **Test doubles are mandatory**: `FixturePdfBackend` and `createMockSignatureBackend` in
   the `unit`/`integration` tiers; real providers only in the `real` tier
   (`rait-test-strategy.md`).

### Ownership table

| Fact                      | Writer                         | Readers                | Substrate                     |
| ------------------------- | ------------------------------ | ---------------------- | ----------------------------- |
| template and its versions | `inf/normative` (agency-admin) | all `inf` modules      | storage                       |
| rendered document + hash  | owning module via facade       | apps, archive          | pdf, pdf-a, storage           |
| signature and time stamp  | facade on behalf of signer     | archive, audit, PORTAL | signature (PAdES, TSA), audit |
| signature policy          | `inf/normative`                | facade                 | —                             |
| sealed dossier manifest   | `inf/rait-case` (archive)      | AUDITOR, PORTAL (own)  | signature, storage            |

## Consequences

- `RAIT.SIGNATURE_FAILED`, `RAIT.SIGNATURE_CERT_MISMATCH` and `RAIT.DOCUMENT_HASH_MISMATCH`
  are raised by the facade; `SignatureDialog` in the frontend talks only to the facade
  endpoints (`POST documents/{id}/sign` returning the provider hand-off).
- `normative_document_template` gains `document_kind`, `domain_scope` and a JSON schema for
  its data in WP-A; `signature_policy` is a new table in the same blueprint.
- Premises carried: gov.br signature levels per act need the state ordinance (`RN-PORTAL-101`,
  DT-050); PDF/A retention periods per document kind (OD-018).

## Amendment 1 — BOAT preliminary crash report (R-0010, 2026-09-19)

This amendment extends, rather than replaces, Decisions 1–5. It records the BOAT document
contract before an Engineer changes the shared document facade, the normative catalogue, or
application composition.

1. `DOCUMENT_KINDS` gains the canonical token `RELATORIO_PRELIMINAR_SINISTRO` after the existing
   twelve tokens. The owning fact is `est.crash_record`; its versioned template belongs to the
   `est` domain and is catalogued through the generalised `inf.normative_document_template`, with
   `domain_scope='est'`, `document_kind='relatorio_preliminar_sinistro'`, template key
   `est.crash.report.preliminary`, and initial template version `1.0.0`. The initial version is a
   technical template revision, not a claim about the official BAT layout. It neither changes
   existing `inf` templates nor delegates BOAT authorship to the normative catalogue owner.
2. The BOAT policy row is data under the same tenant and traffic-agency scope as the template.
   It sets `pdfaRequired=true` and requires `PDF/A-2b`. The source does not decide the signer,
   PAdES level, TSA requirement, gov.br level, or legally mandatory report content; those fields
   remain `source_pending` and block emission until an Owner decision records them. The preliminary
   report in UC-1.251 is distinct from the official BAT: BAT's minimum fields remain
   `source_pending` under DT-061/OD-B08 and cannot be inferred from this template.
   On 2026-09-19 the Owner decided that this preliminary report may satisfy C-2-13 without claiming
   to be the official BAT. BAT fields therefore remain pending in DT-061/OD-B08 but do not block
   C-2-13. Signature and informational-content policy for the preliminary report remain separately
   pending until the Owner chooses them.
   On 2026-09-20 the Owner approved Default D1: this document kind has no signers, PAdES level
   `NONE`, no TSA and no gov.br level in its initial policy. It carries the approved non-BAT notice
   and seals only after PDF/A-2b validation; `signature_ref` remains null. A future signed policy is
   a new policy revision.
3. The facade flow is `render(templateKey, data)` then `sign(documentId, signer)` when the resolved
   policy permits a resolved signer, then `seal(documentId)`. Rendering resolves the active
   tenant-scoped template and policy, invokes the mounted substrate once in `backend/app`, and
   never lets a BOAT controller call PDF, signature, storage, or RENAEST directly. Sealing stores
   only the final bytes, their recomputed SHA-256, `storage_key`, `signature_ref`, the full PDF/A
   validation result, and immutable metadata. A later version is a new document linked by
   `supersedes_document_id`; no sealed bytes, hash, signature reference, policy revision, or
   validation evidence is mutable. The read surface is
   `GET /v1/est/crash/records/{id}/report`, under `RequestContext` and RLS; the tenant never comes
   from an HTTP payload and cross-tenant access fails closed.
4. `@stynx-nyx/pdf` requires a `PdfAConformanceAdapter.convert(input, request)`, which returns a
   new `RenderResult`. `@stynx-nyx/pdf-a-vera-docker` instead implements only
   `PdfAValidator.validate(bytes, opts)`. The Engineer must provide a separately identified,
   reproducible PDF/A-2b conversion source before calling veraPDF validation. The bridge must
   return bytes produced by that conversion, recompute `sha256` and `pageCount` from those bytes,
   and set `metadata.profile='pdf-a'`; passing through Chromium bytes, adding a marker, or casting
   `VeraPdfDockerValidator` as the converter is invalid. `LocalPdfRenderBackend` plus Chromium is
   a renderer only. `createFixturePdfBackend`, `NoopPdfAValidator`, and `StrictPdfAValidator` are
   limited to doubles and never prove conformance.
5. The source and reproducible provision of the PDF/A-2b converter, the production-positive
   bytes, and a resolved immutable veraPDF image digest with registry source, resolution date, and
   resolution method are all `source_pending`. The README digest is illustrative evidence only.
   Until all are resolved, C-2-13 stays open and the system must fail closed instead of sealing or
   issuing a purportedly conformant report.
6. Decision 5 remains unchanged: unit and integration use doubles; e2e proves HTTP, policy,
   tenant isolation, and a closed failure path with an injected runner. Only
   `@detran/app test:real` proves the production renderer, converter, and veraPDF validation. A
   blocking BOAT PDF/A PR job provisions Chromium, the converter dependencies, and the pinned
   veraPDF image, runs positive and invalid bytes without `skip`, and fails when any dependency is
   unavailable. TASK-0017 owns the corresponding CI and real-tier configuration.
7. Default D1 approves WeasyPrint 70.0 as the BOAT real PDF/A backend, pinned by the wheel SHA-256
   recorded in `work/rounds/R-0010/contracts/CTG-0002-documents.md`. It produces PDF/A-2b directly
   and is followed by veraPDF using the immutable Docker Hub digest recorded there. The real tier
   must reproduce both generation and validation; the preliminary Architect probe is not delivery
   evidence.
8. The sealed BOAT report metadata is persisted in the blueprint owned
   `est.crash_report_document` table under forced tenant RLS. Rows are inserted
   only after the validated bytes are uploaded through the application mounted
   STYNX `S3Service`; `role_app_backend` has no `UPDATE` or `DELETE` privilege on
   this table. A new issuance inserts a successor row. The full veraPDF result,
   template version, policy id, hash, storage key and null signature reference
   survive application restart.
