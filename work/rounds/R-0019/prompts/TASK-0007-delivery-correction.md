# TASK-0007 — delivery-review correction, law indexes

Constitutional role: **Architect** (transcriber-docs). Worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Same-family Luna/low iteration after cross-family CTG-0002 cycle-1 `REVIEW`. Never run Git. Do not touch sources, generated schemas, tests, gate, product, record or DEVAI config.

## Closed reading list

- `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/transcriber-docs.md`
- `work/rounds/R-0019/plan.md`, `work/rounds/R-0019/contracts/CTG-0002.md`
- `work/rounds/R-0019/reviews/delivery-review-CTG-0002.json`
- `law/README.md`, `law/glossary/README.md`
- `law/invariants/README.md`, `law/schemas/README.md`, `law/policy/README.md`
- `product/README.md`

## Write boundary

Only `law/README.md` and `law/glossary/README.md`.

## Correct review findings

- High #3: `law/README.md` still says glossary corpus pending CTG-0002 although 44 GE draft entries now exist; it still lists gate only (a)(b)(e) although (c)(d) were added. Update it to state 44 GE draft entries under joint Owner+Architect authority, explicit Owner acceptance still pending, and `pnpm verify:law-corpus` enforces (a)–(e). Add DEVAI `glossary` and `journeys` check members to the index, using the style of other law README indexes. Keep links valid.
- Low #4: `law/glossary/README.md` should restore the uniform header line `**Authority:** Owner and Architect, jointly (Constitution Article 6).` above its draft prose.

Format only touched authorial files with Prettier. Run `pnpm format:check` and check every relative link in the two changed indexes resolves. Report role, task, files, commands/results, criteria PASS/FAIL, out-of-scope, ODs, blockers. No Git.
