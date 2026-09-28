# R-0021 — pre-close independent review 2 (four concrete corrections)

Act as the same independent Auditor reviewer `claude-opus-5-5`, read only. Return one pure JSON object (first `{`, last `}`, no Markdown fence): `mode: "pre-close-review"`, `round: "R-0021"`, `cycle: 2`, `verdict`, `authority_to_close`, `authority_reason`, `resolved_findings`, `findings`, and `notes`. `verdict` remains `REVIEW` while the separate Owner budget-close decision is absent; do not turn that into PASS on technical grounds.

Review only the four non-authority findings in `work/rounds/R-0021/reviews/closure-review-1.json` after the Architect corrections. Check `/tmp/r21-closure-draft.json` (SHA-256 recorded separately by the maestro), `work/rounds/R-0021/reports/ORCHESTRATOR-FINAL.md`, `budget.json`, `plan.md`, `CLAUDE.md`, `.claude/agents/engineer-frontend.md`, `DESIGN-DECISIONS.md` and the current diff. Specifically:

1. The original close-plus-seal acceptance is a `validation_criteria: fail` in the draft, not hidden in notes; no PC or seal exists.
2. The two additional current-state agent pointers say STYNX 1.4.0 while keeping WP-0 1.3.1 history; DESIGN-DECISIONS preserves the historical STYNX 1.3.1 / Angular 22 / DEVAI 1.4.5 tuple and states current 1.4.0 / DEVAI 1.5.6 separately.
3. The draft binds `evidence.proof_epoch: R-0021`, terminal hash `ec36cf1bf45f951d6db2d4e9849cc3c2a5be56705040f208a0598ea4d882db77`, and event `EV-15963d738bf70dfe`. Verify chain if useful.
4. The draft and report explicitly mark D-2 proposed until a narrow Owner decision about the additional `token-budget-window1: fail`; no retrospective waiver, no `round close` yet. The decision request prepared at `/tmp/r21-owner-budget-decision-request.md` asks only whether to emit close with that FAIL. The future budget-unit policy is separated and is not a precondition for this R-0021 decision.

`pnpm check` on the pre-close delta passed exit 0 (`/tmp/r21-preclose-check.log`). After these textual corrections, `pnpm format:check` and `pnpm docs:kb:check` both passed exit 0 (`/tmp/r21-preclose-{format,docs}-after-review.log`). Do not demand a rerun of backend tests for unchanged product/test/dependency Git objects. Report any concrete unresolved non-authority defect. Judge the authority boundary as still `no` until the Owner responds; do not issue or suggest a fabricated grant.
