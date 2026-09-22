---
schemaVersion: '1.0.0'
round_id: 'R-0012'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-21T00:00:00.000Z'
source: 'Explicit Owner handoff of 2026-09-21 (Option A): open R-0012 `rait-web` with the maestro Fable 5.1 and reviewer `codex gpt-5.6-terra`, in a worktree at `origin/main` (2cbcb163) plus `work/rounds/R-0012` taken from PR #78 (`docs/r-0012-contracts-note`) before its merge; take the `packages/ui` lock before R-0013 CTG-0004; then execute `work/rounds/R-0012/prompts/00-maestro.md` in full.'
publication: true
release: false
---

# R-0012 authorization

The Owner (Antonio A. Russo) explicitly instructed, on 2026-09-21, the opening of round R-0012
(`rait-web`) by the maestro (Claude Fable 5.1) with the reviewer `codex gpt-5.6-terra` through
`tools/orchestra/bridge.sh codex gpt-5.6-terra`, under the following opening conditions:

1. **Base**: worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-web`, branch
   `orchestra/rait-web`, created from `origin/main` at `2cbcb163`, plus the files of
   `work/rounds/R-0012` (`plan.md`, `prompts/00-maestro.md`) taken from PR #78
   (`docs/r-0012-contracts-note`) **before its merge** (Owner decision — Option A). When #78
   merges, `origin/main` is integrated with `git merge --no-edit origin/main`; the published
   branch is never rebased.
2. **Lock `packages/ui`**: taken by R-0012 before R-0013 (`teat-frontends`) CTG-0004; R-0013 is
   open without workers dispatched and does not hold the lock.
3. **Contracts**: the command controllers of rait-case/rait-worklist/rait-session are in `main`,
   but the `BP-INF-RAIT-*.commands.openapi.json` contracts arrive only with R-0007 CTG-0004;
   `@detran/api-clients` covers only the RAIT CRUD. Facade methods that fire commands stay `todo`
   citing R-0007 CTG-0004; no hand-written DTO and no client outside `pnpm contracts:clients`.
4. **Pattern**: scaffold copies `apps/portal/web` (R-0014); the i18n allowlist in
   `docs/framework/arch/parameter-catalogue.md` §Namespaces i18n gains the `rait.*` lines.
5. **Cadence**: one PR per CTG; the next CTG only starts writing after the previous merge or on a
   stacked branch. New package `@detran/rait-web`: the maestro runs `pnpm install` and keeps
   `pnpm-lock.yaml` for the group commit before releasing the Inspector; `pnpm check` gains
   `pnpm --filter @detran/rait-web lint|test|build`. Every new KB sheet raises `artifactIdCount`
   in `docs/meta/knowledge-base/import-manifest.json` in the same commit.
6. **Budget**: 3 windows foreseen; at 80 % of a window, `checkpoint` in `plan.md` §Retomada and
   stop. An Owner message "prosseguir até a completa finalização" replaces the per-window cut and
   is recorded here as an amendment.

This record transcribes the instruction through the prompt's declared boundary: normal push of
`orchestra/rait-web`, PR creation against `main`, merge after green CI and cross-family PASS,
exact-SHA audit observation, and governed round-close. It grants no package publication, release,
deployment, force-push, or mutation outside this repository. It was written by the maestro from
the Owner's instruction, not by the Owner; the Owner may revoke or amend it.

## Amendment 1 (Owner, 2026-09-21)

After the window-1 checkpoint (CTG-0001 merged as PR #79), the Owner sent
"prosseguir até a completa finalização": the per-window budget cut of the
opening instruction (item 6) is replaced by continuation in the same session
until the round is closed (CTG-0002a/b/c, TASK-0013, `round close`). All other
conditions stand; `budget.json` keeps recording per task and per reviewer call.
