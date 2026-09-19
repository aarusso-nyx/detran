---
schemaVersion: '1.0.0'
round_id: 'R-0014'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-17T00:00:00.000Z'
source: 'Explicit user instruction of 2026-09-17: "Execute @work/rounds/R-0014/prompts/00-maestro.md" with opening context — R-0009 in main (PC-0006); R-0007 and R-0010 in progress in the Sol window; this round is the first app of the repository: fix the scaffold pattern in apps/portal/web and resolve OD-P46 (i18n allowlist in parameter-catalogue.md read by tools/parameters/verify.mjs) in this round, recording in plan.md that R-0012 copies the pattern.'
publication: true
release: false
---

# R-0014 authorization

The Owner explicitly instructed the maestro to execute the R-0014 maestro prompt
(`work/rounds/R-0014/prompts/00-maestro.md`) with two additional Owner decisions for this round:

1. `apps/portal/web` is the **first frontend app** of the repository. This round fixes the
   scaffold pattern (`package.json` scripts `build|test|lint|typecheck`, Angular 22 / vitest /
   eslint configuration, extension of `pnpm check`); R-0012 (`rait-web`) and the later apps copy
   it (method §4 "Padrão de app" is inverted from R-0012 to R-0014 by this instruction).
2. **OD-P46 is resolved in this round**: the i18n namespace allowlist lives in
   `docs/framework/arch/parameter-catalogue.md` and is read by `tools/parameters/verify.mjs`
   (method §4.17; never exclusion by directory).

This record transcribes the instruction through the prompt's declared boundary: normal push of
`orchestra/portal-pwa`, PR creation against `main`, merge after green CI and cross-family PASS,
exact-SHA audit observation, and governed round-close. It grants no package publication, release,
deployment, force-push, or mutation outside this repository. The session worktree
(`.claude/worktrees/r-0009-maestro-execution-33aaac`, branch renamed from the session default to
`orchestra/portal-pwa` before any publication) stands in for
`/Volumes/Thiamat II/stech/detran-worktrees/portal-pwa`, which does not exist. It was written by
the maestro from the Owner's instruction, not by the Owner; the Owner may revoke or amend it.

## Amendment 1 (Owner, 2026-09-18)

While the Codex CLI is at its usage limit (reset announced for 2026-09-19 05:10), the Owner
authorised running the reviewer through the `claude` bridge with Opus 5 (a same-family review —
deviation from `orchestra/README.md` §2 / Art. 18, 23), temporary and recorded in `plan.md`
§Bloqueios B2; the Codex reviewer resumes as soon as the limit resets.
