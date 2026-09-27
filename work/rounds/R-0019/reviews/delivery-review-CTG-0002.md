# Delivery review — R-0019 CTG-0002, cycle 1

You are the cross-family reviewer (Claude Opus 5.5), acting as constitutional Auditor for a soft gate. The maestro and workers used Codex. Read only; do not change files. Worktree: `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Return **one raw JSON object only**, without a Markdown fence or surrounding prose.

## Read in order

1. `docs/meta/agents/orchestra/README.md` §§4–5, `docs/meta/agents/README.md`, and `docs/meta/agents/orchestra/reviewer-prompt.template.md` delivery-review rubric.
2. `work/campaigns/C-0002-consolidacao.md` phase A action 2 and `work/rounds/R-0019/plan.md` CTG-0002 scope, authorization and acceptance. CTG-0001 merged as PR #132 before this group. `product/**` and `law/glossary/**` are still **proposal awaiting separate explicit Owner acceptance**; review a draft, not an approved business specification.
3. `work/rounds/R-0019/contracts/CTG-0002.md` including Adenda A-02-01. The adenda corrects two representation mistakes against installed DEVAI schemas: glossary authority `joint` and journey AC IDs `AC-NNN`. The immutable C-02 criteria and 44/40/110 inventory remain.
4. `work/rounds/R-0019/reports/TASK-0006.md` through `TASK-0010.md`, including `TASK-0008-initial-blocked.md` and `TASK-0008-iteration1.md`. TASK-0008 source read list was expanded to 12 exact globs after the first attempt correctly blocked; then an Architect Terra/high escalation corrected semantic pre/postconditions and actor extraction. No source under `docs/framework/**` was changed.
5. The **full staged diff** at `work/rounds/R-0019/reviews/delivery-review-CTG-0002.diff`. Inspect every changed path. Read current `tools/law/verify.mjs`, `tools/law/tests/verify.test.mjs`, all 44 `law/glossary/GE-*.json`, 40 `product/journeys/JNY-*.json`, six `product/use-cases/*.json`, and their two product indexes as needed. Compare the contract and representative source fiches under `docs/framework/glossary/domain.md` and the six `docs/framework/product/**/{journeys,use-cases}/` source families. Audit that 40 JNY/110 UC preserve fixed IDs, titles, steps, actor meaning, honest gaps and provenance rather than accepting schema validity alone. Inspect `law/README.md` for stale CTG-0002 index wording.
6. `docs/meta/knowledge-base/open-decisions-rait.md` section R-0019: OD-R19-004/005/006 were registered in the canonical registry, including the unresolved BOAT scene priority and RENAVAM/CDT source gaps.

## Gate evidence

- Inspector RED before Engineer: `pnpm law:test` 37 total, 31 PASS and six specific rule (c)/(d) negatives RED; original and new positives green. No test was edited by Engineer.
- Engineer GREEN: `pnpm law:test` 37/37 PASS and `pnpm verify:law-corpus` PASS on the real corpus.
- Maestro re-run: `pnpm law:test` 37/37 PASS; `pnpm verify:law-corpus` PASS; DEVAI `glossary` 44/44 and `journeys` 40/40 with zero errors; six CTG-0001 DEVAI members pass; `devai doctor` passes; `docs:kb:check` and `docs:kb:publish-check` pass; `sense spec_depth` pass with nine invariants and nonzero use-case inventory. `pnpm check` completion and Git status before/after are recorded in `plan.md` and can be independently rerun.
- Local source audits: GE 44 unique IDs and exact term line provenance; JNY 40 IDs/titles/provenance and numbered source step counts; UC 110 unique IDs and 110/110 exact frontmatter titles; all case actors occur in bundle roles; product index links resolve. Journey semantic pass retains nonempty preconditions for 12 and postconditions for 22, with JNY-008/040 `[]`/`[]` where source gives only context or continuous constraints.

## Rubric

Apply all delivery-review items in the reviewer template: constitutional authority; Owner draft status; contract and exact source fidelity; no invented rule, role, state, deadline, or acronym expansion; Architect → Inspector → Engineer order and RED before GREEN; no weakened tests or edited generated files; rules (c)/(d) reject missing, orphan, duplicate, swapped and divergent content; existing (a)/(b)/(e) remain green; canonical ODs; complete evidence. List **all** high findings in this first cycle, with file/line and concrete fix. `PASS` means no high finding. `REVIEW` means a correctable high finding. `FAIL` means a contradiction of canonical authority, Owner decision, ADR, Constitution, or write boundary. Subsequent cycles are restricted to fixing reported findings except a newly observed `FAIL` contradiction.

## Output schema

{
"mode": "delivery-review",
"round": "R-0019",
"ctg": "CTG-0002",
"cycle": 1,
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 7,
"file": "product/journeys/JNY-001.json",
"line": 1,
"claim": "specific observed defect",
"fix": "specific correction"
}
],
"notes": []
}
