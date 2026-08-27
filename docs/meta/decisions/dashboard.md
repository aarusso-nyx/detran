# DASHBOARD — owner decisions (2026-08-28)

**Source of truth:** `detran-refs` @ `52e00a8`, `transversal/dashboard/rules/RN-DASH-161.md`,
`RN-DASH-160.md`, `transversal/dashboard/_intake/bpo-notes.md`, `transversal/dashboard/
workflows/WF-DASH-001.md`, `WF-DASH-003.md`. Forward-looking — `dashboard` is still an empty
placeholder domain in this monorepo (2 files, no implementation).

## DT-029 — cell-suppression threshold for aggregate crash-data publication (`RN-DASH-161`, `RN-DASH-160`)

Amazonas has 62 municipalities, many with populations of a few thousand — a published cell like
"1 fatality in May" in a small município is not statistics, it's identifiable. Rather than wait for
a formal legal opinion before any publication, the Owner decided to **publish now with a
conservative cell-suppression threshold** — working proposal: suppress cells with count `< 10` —
**pending validation of the exact number against real data** before production use. This is an
accepted risk mitigation, not a substitute for the recommended legal opinion.

## DT-030 — nine BPO alert/SLA calibration proposals, approved in bloc

Full detail in `bpo-notes.md`; summary of what's concretely fixed vs. still delegated:

**Adopted with a concrete value:**
1. ACK SLA by severity: N1 = 24h business, N2 = 8h business, N3 = 2h business, CRÍTICO = immediate.
3. Alert ladder for the RAIT 5-year prescription clock (IND-DASH-105) — same 50/75/90% discipline
   as the other clocks; propagated into `detran-refs` `WF-RAIT-002` §4.4 (see `rait.md` in this
   folder for detail — this also surfaced and fixed a pre-existing gap where the clock existed in
   `RN-RAIT-113` but wasn't in `WF-RAIT-001`'s consolidated table).
4. Floor of 60 days as a provisional informative alert for age-based indicators lacking a numeric
   deadline (Junta Especial de Saúde queue, `SUSPEITO_CONCORRENCIA` lots) — migrating to a
   median-of-historical-cases threshold is still open, pending data that doesn't exist yet.
5. Latency-acceptable bands by indicator type (minutes for legal-ceiling/health, up to a day for
   periodic duties, hours for SLA) adopted as defaults — exact per-panel values still depend on a
   real integration-cost survey, not fixed here.
7. Transparency-checklist audit cadence: monthly.
8. Annual-report deadlines without a normative date (ombudsman report, satisfaction survey):
   aligned to fiscal-year close, prep in Jan/Feb.
9. MVP indicator-coverage target: 100% of the 11 `legal-ceiling` indicators in the first increment.

**Approach approved, concrete number still delegated:**
2. Technical-health thresholds (outbox lag, offline-sync staleness, SENATRAN adapter
   latency/error rate, numbering-range occupancy) — no normative basis exists for these; the Owner
   removed them as a product-decision gate and delegated the actual numbers to SRE/capacity
   engineering. Implementation can proceed once SRE picks numbers.
6. Auto-hiding a long-stale `DESATUALIZADO_MARCADO` indicator (blocks B/C/D) — no concrete BPO
   proposal existed to approve; current default behavior (hide by default for legal-ceiling, mark
   for B/C/D, no additional staleness timer) stands unchanged. Still open for future design, not a
   blocker for MVP.
