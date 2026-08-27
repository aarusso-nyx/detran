# BOAT — owner decisions (2026-08-28)

**Source of truth:** `detran-refs` @ `52e00a8`, `est/boat/rules/RN-BOAT-106.md`, `RN-BOAT-111.md`,
`est/boat/workflows/WF-BOAT-003.md`. Forward-looking — `est` is still an empty placeholder domain
in this monorepo (2 files, no implementation).

## DT-017 — RENAEST transmission periodicity (`RN-BOAT-106`)

There is **no legally-fixed deadline** for transmitting an individual sinistro to RENAEST — the
2018 law had one (March 1st), but a 2023 amendment deleted it and delegated to a CONTRAN
regulation that was never issued. The Owner confirmed **monthly** as the adopted SLA parameter
(previously a "prudential working position," now adopted). Three conditions carry over unchanged:

1. Model it as **versioned org configuration**, never hardcoded.
2. Never present it in UI/docs as a "legal deadline" — it isn't one.
3. A missed transmission should generate an **alert**, not an operational **block**.

## DT-018 — severity↔gravidade derivation rule (`RN-BOAT-111`) — delegated, not decided

`CrashVictim.severity` (person-level) and the national payload's `gravidade` (event-level) are
today conflated without a documented derivation rule ("a sinistro is `COM_VITIMA_FATAL` if any
victim died" is an unsourced product inference). The Owner **did not approve a rule** — he
authorized the engineering team to **propose one**, subject to his approval before it becomes
product behavior. **Do not implement this derivation as if already decided.** If you're building
against this today, treat the current behavior as unvalidated debt and route a concrete proposal
back through the Owner before hardening it.

## DT-020 — correction of a `CONSOLIDADO`/`REJEITADO` national record (`WF-BOAT-003`)

Res. CONTRAN 808/2020 covers RENAEST data *entry* in detail but is silent on correcting a record
after it's homologated/consolidated or rejected. Of three options on the table (accept a linked
"corrective new record" proposal; wait for CONTRAN/SENATRAN guidance; accept the operational risk
of no correction path), the Owner chose: **no correction, ever**. A `CONSOLIDADO`/`REJEITADO`
record is **terminal** — `BLOQUEADO_PARA_CORRECAO → [*]` is the sole path out, with no
`NOVO_REGISTRO_RETIFICADOR` transition. This is an accepted operational risk, not an open
question — do not design or offer any retraction/correction mechanism for a terminal record, even
if a future integration makes it technically easy to add one.
