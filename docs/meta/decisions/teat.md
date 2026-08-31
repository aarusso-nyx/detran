# TEAT — owner decisions (2026-08-28)

**Source of truth:** canonical in-repository rules
[RN-TEAT-141](../../framework/product/domains/inf/teat/rules/RN-TEAT-141.md) and
[RN-TEAT-127](../../framework/product/domains/inf/teat/rules/RN-TEAT-127.md), workflow
[WF-TEAT-004](../../framework/product/domains/inf/teat/workflows/WF-TEAT-004.md), use case
[UC-TEAT-009](../../framework/product/domains/inf/teat/use-cases/UC-TEAT-009.md), and screen
[IU-TEAT-001](../../framework/product/domains/inf/teat/screens/IU-TEAT-001.md). Directly relevant — TEAT's core was ported into
`backend/domains/inf/{ait,alcohol,measures,normative}`.

## DT-014 — bodycam (`RN-TEAT-141`)

The Portaria Normativa 003/2026-DP/DETRAN/AM requires continuous, uninterruptible body-camera
recording for essentially every agent↔citizen interaction. The Owner deferred this to a **future
wave, out of MVP scope** — full requirement, correlation model (time-window + agent + geolocation
rather than per-act file upload), and the access-regime rule (`RN-TEAT-142`) all wait.

**Kept in scope, cheap and worth doing now:** a persistent recording-status indicator in the field
UI chrome (`IU-TEAT-001` §C) — it doesn't depend on the rest of the bodycam requirement and is
inexpensive to keep.

## DT-015 — guarda monitorada (monitored custody as an alternative to vehicle removal) (`RN-TEAT-127`)

Deferred **out of MVP** — and this goes further than just deferring activation. The Owner
explicitly rejected this corpus's own earlier recommendation of "model the nine-requirement
checklist now, activate later once the national tech solution is homologated." The full modeling
work is deferred too:

- The nine-requirement eligibility checklist (vehicle condition, no tampering indicators, no
  active criminal record, no judicial restriction, licensing history, etc. — several requirements
  depend on national-database connectivity, making this structurally incompatible with
  offline-first decisions).
- The states `GUARDA_MONITORADA` / `VIOLACAO_MONITORAMENTO` in `WF-TEAT-004` — kept in the state
  diagram (not deleted, per the corpus's state-vocabulary convention) but marked out-of-MVP with
  an explicit banner.
- Screens D-02/D-03 in `IU-TEAT-001` — struck through, marked out of scope.
- `UC-TEAT-009` — this use case had fully modeled guarda monitorada as active/reviewed, which
  contradicted the deferral once it landed. Corrected: step 4, step 5a (renamed to "No MVP, único
  caminho"), the alternative flow, and three acceptance criteria are now prefixed
  `[FORA DO MVP — DT-015]`, content preserved rather than deleted.

**Do not build any of the guarda monitorada machinery for MVP** — if you see partially-implemented
scaffolding for it, treat it as pre-decision debt to flag, not something to complete.
