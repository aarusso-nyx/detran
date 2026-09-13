# PEC — owner decisions (2026-08-28, reconciled 2026-08-31)

**Source of truth:** canonical in-repository PEC
[rules](../../framework/product/domains/ch/pec/rules/),
[use cases](../../framework/product/domains/ch/pec/use-cases/), and
[workflows](../../framework/product/domains/ch/pec/workflows/), including `RN-PEC-113`,
`RN-PEC-105`, `RN-PEC-141`, `RN-PEC-110`, and `WF-PEC-005`. The decisions are binding inputs to
the in-progress `ch` implementation and supersede incompatible origin behavior.

## DT-021 — exam-distribution regime (`RN-PEC-113`, `UC-PEC-013`)

CFM Res. 1.636/2002 art. 3º requires impartial, random, equitable distribution of medical fitness
exams among accredited clinics — and its violation exposes the DETRAN's medical director
**personally**, under ethical-disciplinary liability. Of four conformity positions modeled, the
Owner adopted **P2**: the candidate picks region + date window; the system randomly assigns clinic
and perito within the eligible pool (audit trail of the draw required). `UC-PEC-013` was already
written for P2 — build against it directly once PEC is ported.

## DT-022 — result vocabulary / `CONDICIONADO` mapping (`RN-PEC-105`, `UC-PEC-011`)

`medical_result = 'CONDICIONADO'` (the label used in the legacy PEC schema references) matches no
legal vocabulary. Confirmed mapping: `CONDICIONADO` ≡ **"apto com restrições"**, medical track
only (the psychological track has no equivalent label — its analog is "apto com prazo de validade
diminuído"). The label shown to the candidate and transmitted to RENACH must always be the legal
label, never the internal enum identifier. Still open: whether RENACH actually accepts this exact
federal taxonomy (inferred, not confirmed against an integration spec), the Portaria DETRAN-AM
005/2021 prazo↔rótulo table (4 numbers for 5 labels, no explicit mapping), and the Anexo XV
restriction codes (not yet captured).

## DT-023 — prontuário retention responsibility (`RN-PEC-141`, `UC-PEC-014`)

Lei 13.787/2018 art.6º sets a 20-year floor from the last record before a prontuário may be
eliminated/returned/retained under a differentiated regulation, but named no responsible party.
The Owner decided: the **technical platform (PEC itself)** is responsible for custody and
long-term cryptographic preservation — not the accredited clinic, not DETRAN-AM directly. No
elimination should ever be implemented before long-term signature preservation (PAdES-LTA /
successive timestamps) actually exists.

## DT-024 — periodic post-CNH toxicology exam scope (`UC-PEC-012`, `WF-PEC-005`)

Res. CONTRAN 923/2022 art.10-A (introduced by 1.009/2024) creates a periodic toxicology exam for
C/D/E drivers post-licensing, with SENATRAN alerting the driver directly — no clear normative role
for the state executive body. Two branches were on the table: (a) entirely out of PEC's scope, or
(b) PEC receives and processes the result event. The Owner chose **(b), in scope** — but the
design itself was approved by the Owner on 2026-08-31 as follows:

- PEC consumes authenticated, idempotent periodic-result events from RENACH through the
  SENATRAN adapter boundary; it never calls a laboratory directly;
- the source event, not a human operator, is the initiating actor, and the trusted integration
  principal plus event identity are retained in audit evidence;
- the post-CNH result is a distinct domain record and does not fabricate a clinical encounter;
- a valid positive result creates a three-month driving-suspension record; a later valid negative
  result or the sourced expiry transition may release it, without mutating the source result;
- SENATRAN remains responsible for the statutory driver alert; PEC records received status and
  does not duplicate or pretend to have delivered that alert; and
- unmatched, stale, malformed or unsupported-category events fail closed into an auditable
  exception state and never silently change the driver record.

`UC-PEC-012` is therefore promoted from `stub` to `reviewed` and is a build target.

## DT-025 — Junta Especial de Saúde (3rd-instance appeal board) (`UC-PEC-005`, `UC-PEC-010`, `RN-PEC-110`)

Res. CONTRAN 927/2022 arts.13-15 describe a 3-instance review chain, with the 3rd instance being a
**distinct technical collegiate body** (Junta Especial de Saúde, ≥3 professionals incl. 2
specialists) designated by CETRAN. The existing implementation reference (`escalateToCetran`)
only reassigns the decision's signer within the same record — no separate case, deadline, or
collegiate body.

**Superseding Owner decision (2026-08-31):** full normative parity is required. The earlier choice
to retain signature reassignment is withdrawn. The target must model the candidate request, the
medical/psychological second-instance board, formal appeal, CETRAN designation, distinct Junta
Especial composition and its own signed decision. `escalateToCetran` is not a valid target
mechanism. Only sourced deadlines are enforced; unsourced designation/decision deadlines remain
explicitly unset.

## PEC-PARITY-001 — executable parity evidence replaces raw spec-file count

The Owner approved replacing the literal “at least 611 spec files” threshold. The origin contains
374 generated `it.todo` placeholders and 122 generated wrappers, so file count rewards inert
artifacts rather than behavior. Parity now requires:

1. every reviewed `AC-PEC-*` criterion is referenced by an executable target test;
2. no acceptance blocker remains in the parity ledger;
3. every origin spec path has a non-empty, machine-validated disposition and target evidence;
4. deferred or blocked behavioral origin specs keep the verdict `NOT_READY`; and
5. the complete unit, integration, e2e, contract, blueprint, RLS and boundary gates pass.

## PEC-TRUST-001 — session and clinical-signing trust prerequisites

The Owner approved the following fail-closed production contract:

- STYNX sessions use Redis only outside test/local profiles and load an RSA signing key set from
  the platform secret mechanism; no in-memory session store or inline production private key is
  allowed;
- a successful upstream strong factor is required before session creation or tenant switch;
- at most one active session per user and tenant is retained; replacement revokes the prior
  session, and refresh-token reuse revokes the token family through the STYNX runtime;
- session revocation and expiry must be checked on authenticated requests, not only encoded in a
  JWT; and
- clinical PAdES/TSA/OCSP-or-CRL remains an external trust service, but non-local startup/readiness
  requires HTTPS endpoints, secret-backed credentials and a successful trust-capability probe.

Real-provider evidence is a deployment input. Local mocks may prove fail-closed contracts and
receipt validation, but cannot be presented as proof of a production TSA, certificate chain,
revocation responder or Redis deployment.

## PEC-RETENTION-001 — negative-control acceptance for `AC-PEC-014-3`

The Owner accepted on 2026-09-01 that `AC-PEC-014-3` is satisfied in this round by executable
evidence that a proposed deletion creates its own `ch.retention_disposition` with status
`BLOCKED`, distinct from record-use audit, and executes no SQL deletion. This reconciles the
criterion with DT-023 without weakening either: deletion remains disabled until a real
PAdES-LTA provider proves preservation, and any future enabled deletion must add positive,
distinct execution-audit evidence.
