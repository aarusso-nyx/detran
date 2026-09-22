---
schemaVersion: '1.0.0'
round_id: 'R-0016'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-21T00:00:00.000Z'
source: 'Explicit Owner handoff of 2026-09-21: open R-0016 `dashboard-console` with the maestro Fable 5.1 (family switch Sol → Fable) and reviewer `codex gpt-5.6-terra`, base origin/main (08fb84e8), plan/prompt taken from the local working tree of the repository root; then execute `work/rounds/R-0016/prompts/00-maestro.md` in full.'
publication: true
release: false
---

# R-0016 authorization

The Owner (Antonio A. Russo) explicitly instructed, on 2026-09-21, the opening of round R-0016
(`dashboard-console`) by the maestro (Claude Fable 5.1) with the reviewer `codex gpt-5.6-terra`
through `tools/orchestra/bridge.sh codex gpt-5.6-terra`, under the following opening conditions:

1. **Family switch**: the round was planned (2026-09-14) for a GPT-5.6 Sol maestro; the Owner
   switched it to the Fable family on 2026-09-21 (maestro Fable 5.1, workers Opus/Sonnet,
   reviewer `codex gpt-5.6-terra`). The switch is recorded in `waves.md` (Maestro column and
   §Histórico) by the documentation task.
2. **Base**: worktree `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49`
   (same pattern as R-0011), branch `orchestra/dashboard-console`, created from `origin/main` at
   `08fb84e8`, plus `work/rounds/R-0016` (`plan.md`, `prompts/00-maestro.md`) regenerated for the
   Fable family and taken from the **local working tree of the repository root** (not committed
   there, not in origin) — first commit `30cabb08`. `origin/main` is integrated with
   `git merge --no-edit origin/main` before each PR; the published branch is never rebased.
3. **Upstream**: CTG-0001 (18 sheets IU-DASH-D-01…D-18, `i18n/dashboard.pt-BR.json`) has no
   upstream and is executable now. CTG-0002 (`apps/dashboard/web`, `@detran/dashboard-web`) waits
   for R-0011 (`orchestra/dashboard-backend`): stack on that branch when it exists, otherwise
   checkpoint after CTG-0001.
4. **Pattern**: scaffold copies `apps/portal/web` (R-0014); the i18n allowlist in
   `docs/framework/arch/parameter-catalogue.md` §Namespaces i18n gains the `dashboard.*` lines
   (prefix of parameters in force, e.g. `dashboard.cell_threshold`) with `pnpm parameters:generate`
   before the JSON enters code. Sheets are an Architect act (transcriber-docs); the screen ↔ sheet
   ↔ route test belongs to the Inspector; every gap becomes an `OD-*`, never a decision.
5. **Locks**: `docs/framework/product/transversal/dashboard/screens`,
   `docs/meta/knowledge-base/import-manifest.json` (coordinate with R-0012 and R-0013, which also
   create sheets), `apps/dashboard/web`. Nothing in `packages/ui`.
6. **Cadence**: one PR per CTG. New package `@detran/dashboard-web`: the maestro runs
   `pnpm install` and keeps `pnpm-lock.yaml` for the group commit; `pnpm check` gains
   `pnpm --filter @detran/dashboard-web lint|test|build`; vitest with the Angular JIT plugin. Every
   new KB sheet raises `artifactIdCount` in `docs/meta/knowledge-base/import-manifest.json` in the
   same commit.
7. **Budget**: 3 windows foreseen; at 80 % of a window, `checkpoint` in `plan.md` §Retomada and
   stop. An Owner message "prosseguir até a completa finalização" replaces the per-window cut and
   is recorded here as an amendment.

This record transcribes the instruction through the prompt's declared boundary: normal push of
`orchestra/dashboard-console`, PR creation against `main`, merge after green CI and cross-family
PASS, exact-SHA audit observation, and governed round-close. It grants no package publication,
release, deployment, force-push, or mutation outside this repository. It was written by the maestro
from the Owner's instruction, not by the Owner; the Owner may revoke or amend it.

## Amendment 1 — 2026-09-21: "prosseguir até a completa finalização"

The Owner (Antonio A. Russo) instructed the maestro, in the session running R-0016, with the
exact words "prosseguir até a completa finalização" after the CTG-0001 PR (#80) was opened.
Per §7 above this message replaces the per-window cut: the maestro continues through CTG-0002
(`apps/dashboard/web`) and CTG-0003 (documentation) to the governed round-close without stopping
at 80 % of the window. Because `orchestra/dashboard-backend` (R-0011) still has no code, CTG-0002
is developed on `orchestra/dashboard-console` after the merge of #80, at level L0 for every
data-bound screen (contracts/CTG-0002.md §6: "indisponível nesta versão", never a silent mock),
and integrates R-0011 by merge when its contract and seed exist. The boundary of the original
grant is unchanged (normal push, PR against `main`, merge after green CI and cross-family PASS,
audit observation, round-close; no force-push, no publication outside this repository).
