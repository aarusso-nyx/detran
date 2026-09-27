# TASK-0009 — delivery-review correction, rule (c)/(d) direct coverage

Constitutional role: **Inspector**. Worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Same-family Luna/medium iteration after cross-family CTG-0002 cycle-1 `REVIEW`. Never run Git. Do not edit the verifier, product, law content, docs source, record or DEVAI files.

## Closed reading list

- `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0019/plan.md`, `work/rounds/R-0019/contracts/CTG-0002.md`
- `work/rounds/R-0019/reviews/delivery-review-CTG-0002.json`
- `work/rounds/R-0019/reports/TASK-0009.md`
- `tools/law/tests/verify.test.mjs`, `tools/law/verify.mjs`
- `docs/framework/glossary/domain.md`

## Write boundary

Only `tools/law/tests/verify.test.mjs` and `tools/law/tests/fixtures/**`.

## Task

Reviewer high #2 found that the six minimum negatives do not directly exercise the other CTG-0002 §5 rejection branches. Add one focused negative test for each: case-insensitive duplicate GE term; GE non-draft status; missing GE provenance; unresolved related_invariants; swapped fixed JNY↔JRN mapping; divergent JNY title; divergent UC title; UC wrong bundle; duplicate bundle case ID; missing actor from bundle roles and empty actors; incomplete JNY (no steps, no AC, no persona, non-draft); totals other than 40 JRN/JNY and 110 UC. You may group variants under named subtests, but each branch must have a direct assertion of the specific violation code and target path/ID. Keep all existing tests unchanged and green. Fixtures should be schema-realistic except for the one invalid field under test; no generic total-count violation may satisfy an unrelated assertion.

Demonstrate test sensitivity in a disposable copy outside this repo: copy `tools/law/verify.mjs` and `tools/law/tests/verify.test.mjs` with their relative layout to a temporary directory; for each targeted violation code, mutate only the disposable verifier's `addViolation` to ignore that code, run the matching test with `node --test --test-name-pattern`, and record that it goes RED while the current gate is GREEN. Do not modify the live verifier for mutation proof. If a branch has no usable code, report the gap for Engineer correction. Keep a concise mutation table in the report, not an untracked file in repo. No test weakening or skip.

Run `node --check tools/law/tests/verify.test.mjs`, `pnpm law:test`, and `pnpm format:check`. Format only the authored test file. Report role, task, files, commands/results, direct branch coverage and mutation evidence, out-of-scope, OD, blockers. No Git.
