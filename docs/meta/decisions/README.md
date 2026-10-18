# Owner decisions — engineering projections from the canonical knowledge base

**Source of truth:** the in-repository
[open-issues register](../knowledge-base/open-issues.md) and the linked product artifacts imported
from provenance commit `7efec0667fbcb6253624636ed81f9c654b119e68`. This folder is an
actionable engineering projection, not a competing copy of the rules.

**Status.** These are Owner business/product decisions made on 2026-08-28, most **without a
formal legal opinion** (the underlying canonical rules stay `draft` pending parecer). They
resolve product ambiguity so design/engineering can proceed, but they do not certify legal
correctness — where a decision carries residual legal risk, the source rule says so explicitly and
this handoff repeats the caveat.

**Scope note (reconciled 2026-10-18).** The original 2026-08-28 description of
CH/EST/PORTAL/DASHBOARD as empty domains is historical. Those backend domains now
exist in `backend/domains/`; their presence does not establish production readiness.
PEC frontend is commissioned by ADR-0034 and R-0031/R-0032; main still contains only
the reserved app README, with contracts/tests preserved on branches. The per-domain
Owner decisions below remain binding. Consult the
[reconciled backlog](../knowledge-base/backlog.md#reconciliação-em-2026-10-18--fila-de-execução-atual)
for implementation versus integration state.

## Per-domain docs

- [rait.md](rait.md) — appeal-against-provimento (vinculado, centralized authority, no citizen
  counter-argument step), sustentação oral omitted by default, IPCA-E correction index, and a new
  five-year prescription clock (Relógio D) added to the SLA ladder.
- [teat.md](teat.md) — bodycam and guarda monitorada both deferred out of MVP scope, including the
  guarda monitorada _modeling itself_ (not just activation).
- [boat.md](boat.md) — RENAEST transmission periodicity confirmed monthly; national-record
  correction mechanism explicitly rejected (terminal, no retraction path); severity↔gravidade
  derivation rule delegated to engineering proposal, not yet decided.
- [pec.md](pec.md) — exam-distribution regime (P2), `CONDICIONADO` vocabulary mapping, prontuário
  retention responsibility, toxicology-exam scope, and appeal-board modeling — all forward-looking
  (no `ch` code exists yet).
- [portal.md](portal.md) — 40%-discount waiver instrument, CRLV-e vs. suspended-fine blocking,
  WCAG/eMAG standard declaration, and card-installment authorization posture.
- [dashboard.md](dashboard.md) — aggregate-publication cell-suppression threshold and the nine
  BPO alert/SLA calibration proposals, approved in bloc.
