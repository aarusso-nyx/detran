---
schemaVersion: '1.0.0'
round_id: 'R-0011'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-21T00:00:00.000Z'
source: 'Explicit Owner handoff of 2026-09-21: open R-0011 `dashboard-backend` with the maestro Fable 5.1 (family change Sol → Fable) and reviewer `codex gpt-5.6-terra`, on branch `orchestra/dashboard-backend` at `origin/main` (08fb84e8) plus `work/rounds/R-0011` (`plan.md`, `prompts/00-maestro.md`) taken from the local working tree of the repository root (regenerated for a Fable maestro, not committed, not in origin); then execute `work/rounds/R-0011/prompts/00-maestro.md` in full.'
publication: true
release: false
---

# R-0011 authorization

The Owner (Antonio A. Russo) explicitly instructed, on 2026-09-21, the opening of round R-0011
(`dashboard-backend`) by the maestro (Claude Fable 5.1) with the reviewer `codex gpt-5.6-terra`
through `tools/orchestra/bridge.sh codex gpt-5.6-terra`, under the following opening conditions:

1. **Family change**: the wave plan (`waves.md`) assigned this round to a Sol maestro; the Owner
   swapped it to Fable 5.1 on 2026-09-21. `plan.md` and `prompts/00-maestro.md` were regenerated
   for that and brought from the **local working tree of the repository root** (uncommitted, not in
   `origin`); their first commit in this branch is
   `docs(rounds): R-0011 plan/prompt for a Fable maestro (Owner, 2026-09-21)`. The change is
   recorded in `waves.md` (Maestro column and §Histórico) by the documentation task.
2. **Base**: branch `orchestra/dashboard-backend`, created from `origin/main` at `08fb84e8`, in an
   isolated worktree (`.claude/worktrees/dashboard-backend-r0011-615f16`, in place of
   `detran-worktrees/dashboard-backend` named by the handoff — same branch, same base). `origin/main`
   is integrated with `git merge --no-edit origin/main`; the published branch is never rebased.
3. **Locks**: `backend/domains/dashboard`, DDL `80-dashboard.sql`, `tools/verify-domain-boundaries.ts`
   and `package.json` (scripts). `policy.ts` only in CTG-0002. No other active front touches these
   paths.
4. **Dependencies**: CTG-0001 (blueprint BP-DASH-MONITOR-001, refs, DDL 80, `*.projection.ts`
   against the schemas already published in `docs/framework/schemas/events/`, seed of the 42
   indicators, new `verify:domain-boundaries` gate in `pnpm check`) depends on nobody. CTG-0002
   (alert cycle, duties, freshness, export, SSE, contracts) waits for R-0007 CTG-0003 in `main`:
   develop stacked on `origin/orchestra/rait-backend` if it already exposes the events, otherwise
   write a checkpoint at the end of CTG-0001. Reuse from `main`: `DetranError`,
   `tools/contracts/check-commands.mjs`, `pnpm contracts:clients` (`@detran/api-clients`),
   `backend/app/tests/e2e/policy-routes.e2e.spec.ts`. Handoffs of R-0009 to confirm in
   `backlog.md` §Handoffs and `portal-build-pack.md` §4: OD-P18 (ouvidoria counter) and OD-P28
   (events without producer → source DESCONECTADA until a producer exists).
5. **Cadence**: one PR per CTG. New package `@detran/dashboard-monitor`: the maestro runs
   `pnpm install` and keeps `pnpm-lock.yaml` in the group commit, plus the alias in
   `backend/app/vitest.config.ts`; the blueprint is edited once per CTG; e2e idempotent with
   `DB_NAME=detran_r11` (`env-detran-r11.sh`); policy tested with presence and absence;
   `seed.sh` run twice.
6. **Budget**: 3 windows foreseen; at 80 % of a window, `checkpoint` in `plan.md` §Retomada and
   stop. An Owner message "prosseguir até a completa finalização" replaces the per-window cut and
   is recorded here as an amendment.

This record transcribes the instruction through the prompt's declared boundary: normal push of
`orchestra/dashboard-backend`, PR creation against `main`, merge after green CI and cross-family
PASS, exact-SHA audit observation, and governed round-close. It grants no package publication,
release, deployment, force-push, or mutation outside this repository. It was written by the maestro
from the Owner's instruction, not by the Owner; the Owner may revoke or amend it.

## Amendment 1 — 2026-09-21 (Owner)

The Owner (Antonio A. Russo) instructed the maestro, in the session of 2026-09-21 after checkpoint 1
(`676c935c`, ≈68 % of window 1): **"prosseguir até a completa finalização — registre em
AUTHORIZATION.md"**. Per condition 6 above, this replaces the per-window 80 % cut for this round: the
maestro continues through CTG-0001 (TASK-0002 ∥ 0011, TASK-0010 ∥ 0003, delivery-review, evidence,
PR, merge, audit observe) and, when its upstream (R-0007 CTG-0003) allows, CTG-0002 and the round
close, recording consumption in `budget.json` as before. Every other boundary of this record is
unchanged.
