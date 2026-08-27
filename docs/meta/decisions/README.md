# Owner decisions — requirements handoff from detran-refs

**Source of truth:** `aarusso-nyx/detran-refs` @ commit `52e00a8`, `_meta/open-issues.md`
(items DT-010 through DT-031, type `owner-decision`). This folder is a pointer and an actionable
summary per domain, not a copy — for full legal citations and reasoning, read the source files in
`detran-refs`.

**Status.** These are Owner business/product decisions made on 2026-08-28, most **without a
formal legal opinion** (the underlying rules stay `draft` in `detran-refs` pending parecer). They
resolve product ambiguity so design/engineering can proceed, but they do not certify legal
correctness — where a decision carries residual legal risk, the source rule says so explicitly and
this handoff repeats the caveat.

**Scope note.** Only `inf` (RAIT, and TEAT's ported modules — `ait`, `alcohol`, `measures`,
`normative`) has real backend code in this monorepo today. `ch` (PEC), `est` (BOAT), `portal`, and
`dashboard` are still empty placeholder domains. The RAIT and TEAT docs below are directly
actionable against existing schema/services; the BOAT, PEC, PORTAL, and DASHBOARD docs are
forward-looking — capture the decision now so it's not lost before those domains are ported.

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
