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
