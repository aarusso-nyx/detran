# TASK-0008 — delivery-review correction, product authority and source fidelity

Constitutional role: **Architect**. Worktree: `/Users/aarusso/.codex/worktrees/law-corpus/detran`. This is the same-family Sol/high escalation after the CTG-0002 cross-family cycle-1 `REVIEW`. Never run Git. Do not install packages. Do not edit tests, gate, law, docs source, record or DEVAI files.

## Closed reading list

- `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/transcriber-docs.md`
- `work/rounds/R-0019/plan.md`, `work/rounds/R-0019/contracts/CTG-0002.md`
- `work/rounds/R-0019/reviews/delivery-review-CTG-0002.json`
- `work/rounds/R-0019/reports/TASK-0008.md`, `TASK-0008-iteration1.md`
- `product/README.md`, `product/specification.md`, `product/journeys/JNY-*.json`, `product/use-cases/*.json`
- `docs/framework/product/domains/ch/pec/journeys/JRN-*.md`, `docs/framework/product/domains/ch/pec/use-cases/UC-*.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-*.md`, `docs/framework/product/domains/est/boat/use-cases/UC-*.md`
- `docs/framework/product/domains/inf/rait/journeys/JRN-*.md`, `docs/framework/product/domains/inf/rait/use-cases/UC-*.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-*.md`, `docs/framework/product/domains/inf/teat/use-cases/UC-*.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-*.md`, `docs/framework/product/transversal/dashboard/use-cases/UC-*.md`
- `docs/framework/product/transversal/portal/journeys/JRN-*.md`, `docs/framework/product/transversal/portal/use-cases/UC-*.md`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/journey.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/use-cases.schema.json`

## Write boundary

Only `product/journeys/JNY-*.json`, `product/use-cases/*.json`, `product/README.md`, `product/specification.md`.

## Correct these review findings

1. **High source fidelity:** reviewer found 45 of 294 JNY steps in 26 journeys truncated by the parser, including JNY-001 step 1 missing impartial clinic distribution caveat, step 4 missing two-business-day psychological result and reduced validity; JNY-003 legal vigência caveat; JNY-032 restitution path; JNY-008 missing absence of a complete-capture requirement and unresolved scene-vs-road priority (OD-R19-004). Read each source `## Narrativa ponta-a-ponta` numbered item against its mapped JNY step. Restore every material action, condition, deadline, legal caveat, alternative, declared gap and relevant sub-bullet/bold note in a **faithful distillation**. Do not copy whole source files or mechanically split at periods inside quotations/abbreviations. Keep the same 40 IDs, titles, step order/count, source provenance and honest pre/postconditions. No step may end at a bare heading, mid-quote or incomplete sentence. Review all 294 steps, report which JNY/steps changed, and give a per-JNY audit summary so the restricted reviewer can verify.
2. **High Owner authority:** `product/README.md` must restore the exact line `**Authority:** Owner (Constitution Article 6).` and title the document as an Owner draft proposal transcribed by Architect, pending explicit Owner acceptance. Keep `specification.md` aligned.
3. **Low actor designations:** normalize only source-equivalent roles with leading article differences (e.g. `Sistema`/`O sistema`, `Agente` variants), not genuinely distinct roles. Inspect UC-RAIT-026: its source `Ator e objetivo` states the presidente decides the suspicion, so include that actor in the case if supported. Keep every case actor included in bundle roles; no duplicates.

Do not invent legal content. A gap stays `source_pending` or remains absent, with an OD proposal in the report if needed. Format only authored files touched. Run `pnpm exec devai check --only journeys --repo-root . --format json` (40/40, 0 errors), `pnpm format:check` (exit 0), and a local 40/110 title/ID/provenance/count audit. Do not run full `pnpm check`; maestro owns group gates.

Report: role; task; files; commands/results; criteria PASS/FAIL; per-JNY step audit and changed steps; out-of-scope; ODs; blockers. No Git.
