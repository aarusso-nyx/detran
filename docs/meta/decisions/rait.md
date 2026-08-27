# RAIT — owner decisions (2026-08-28)

**Source of truth:** `detran-refs` @ `52e00a8`, `inf/rait/rules/RN-RAIT-113.md`, `RN-RAIT-129.md`,
`RN-RAIT-130.md`, `inf/rait/workflows/WF-RAIT-001.md`, `WF-RAIT-002.md`, `WF-RAIT-003.md`.
Directly actionable — RAIT has real code in `backend/domains/inf/{rait-case,rait-worklist,
rait-session}` and DDL in `backend/database/ddl/34-36-inf-rait-*.sql`.

## DT-010 — authority's appeal against a favorable (`provimento`) decision (`RN-RAIT-130`)

Three of four open points now answered, one still open:

1. **Vinculado, not discretionary.** The authority is *obligated* to appeal whenever the 1st-
   instance decision is `provimento` — this was already settled in an earlier steering round
   (2026-08-24), restated here for completeness.
2. **Centralized authority, not each of the 55.** The DETRAN-AM has 55 individuals holding
   "Autoridade de Trânsito" (50 capital, 5 interior). The Owner decided the appeal is exercised by
   a **single centralized role**, not distributed to whichever of the 55 issued the original NP.
   **Which specific cargo/setor is still unidentified** — next step is an institutional ask to
   DETRAN-AM, not a product decision. Model a single designated queue/owner for this appeal, but
   the actor assignment itself is still a placeholder.
3. **No citizen counter-argument step.** When the authority appeals, the citizen is explicitly
   **not** intimated for contrarrazões — the subsidiary Lei 9.784/1999 mechanism (art. 62 notice,
   art. 64 *reformatio in pejus* safeguard) was considered and rejected. Do not build a
   counter-argument UI/step for this flow.
4. **Still unanswered: the appeal deadline.** No numeric prazo has been fixed for when the
   authority's appeal clock starts or how long it runs — `WF-RAIT-001`'s "Reentrância" section for
   this path cannot be fully modeled without it.

## DT-011 — sustentação oral (oral argument) at JARI/CETRAN sessions (`WF-RAIT-003`)

Omitted by default and **not a configurable toggle**. The state `SUSTENTACAO_ORAL` stays in the
state machine (for a possible future local regimento that admits it) but the default path is
`RELATORIA_LIDA → VOTACAO` directly. If a session/hearing UI currently exposes this as a toggle,
remove it — it should never be presented as part of the normal flow.

## DT-013 — restitution correction index (`RN-RAIT-129`)

When a provimento decision triggers restitution of a prepaid fine, the correction index is
**IPCA-E**. No formal legal/fazendária opinion behind this — it's a working decision, same risk
class as the rest of this corpus. If restitution calculation exists or is planned, wire it to
IPCA-E rather than leaving the index unconfigured or defaulting to something else.

## New: five-year prescription clock (Relógio D) added to the SLA ladder

Not itself a DT item — surfaced while propagating a DASHBOARD decision (DT-030) that required
calibrating an alert ladder for `RN-RAIT-113`'s quinquennial prescription clock. `RN-RAIT-113`
already described **four** extinction clocks, but `WF-RAIT-001`'s consolidated table and
`WF-RAIT-002`'s calibrated ladders only had three. Added:

- **`WF-RAIT-001`** — new row in the "Relógios de extinção" table and a `T-PRESC-5A` timer entry:
  5 years (60 months) from `data_pratica_ato`, Lei 9.873/1999 art.1º *caput*.
- **`WF-RAIT-002` §4.4** — new escada, same 50/75/90% discipline as the other clocks: `ALERTA_N1`
  at 30 months, `ALERTA_N2` at 45 months, `CRITICO` at 54 months, `PRESCRITO_OPERACIONAL` at 60
  months.

Unlike the 3-year paralisação clock (Relógio C), this one does **not** reset on every case
movement — only on the specific interruption hypotheses of Lei 9.873/1999 art.2º (notification,
condemnatory decision). Whether a penalty notice (`NP`) itself counts as the interrupting
condemnatory decision is flagged as an open legal question in `RN-RAIT-113` (controvérsia point
3) — do not implement an auto-reset on NP issuance without confirming that reading first.

## Still open, not decided (DT-012)

`DT-012` — the operational procedure for issuing the arrecadação document for the 40%-discount
outside the SNE — remains unanswered. This affects `RN-RAIT-127` (the discount regime) and is
distinct from PORTAL's DT-026 (which only settled the waiver-declaration instrument, not this
issuance procedure). Do not build the outside-SNE document-issuance path yet.
