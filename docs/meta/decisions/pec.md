# PEC — owner decisions (2026-08-28)

**Source of truth:** `detran-refs` @ `52e00a8`, `ch/pec/rules/RN-PEC-113.md`, `RN-PEC-105.md`,
`RN-PEC-141.md`, `RN-PEC-110.md`, `ch/pec/use-cases/UC-PEC-013.md`, `UC-PEC-011.md`,
`UC-PEC-014.md`, `UC-PEC-012.md`, `UC-PEC-005.md`, `UC-PEC-010.md`, `ch/pec/workflows/
WF-PEC-005.md`. Forward-looking — `ch` is still an empty placeholder domain in this monorepo (2
files, no implementation). Capture these now so they're not re-litigated once PEC gets ported.

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
design itself (event receiver, responsible actor, effect on driver record, interaction with the
`RN-PEC-106` cadastro block) is **not yet written**. `UC-PEC-012` stays `stub`, now blocked on
design work rather than on a scope decision.

## DT-025 — Junta Especial de Saúde (3rd-instance appeal board) (`UC-PEC-005`, `UC-PEC-010`, `RN-PEC-110`)

Res. CONTRAN 927/2022 arts.13-15 describe a 3-instance review chain, with the 3rd instance being a
**distinct technical collegiate body** (Junta Especial de Saúde, ≥3 professionals incl. 2
specialists) designated by CETRAN. The existing implementation reference (`escalateToCetran`)
only reassigns the decision's signer within the same record — no separate case, deadline, or
collegiate body. The Owner decided to **keep the simplified signature-reassignment mechanism** and
**not** model the Junta Especial de Saúde as a distinct body. The full normative reading stays in
`UC-PEC-010`/`RN-PEC-110` as documented compliance risk, not as a build target — do not implement
a separate appeal-board flow for this.
