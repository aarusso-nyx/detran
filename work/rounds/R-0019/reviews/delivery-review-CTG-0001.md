# Delivery review — R-0019 CTG-0001, cycle 1

You are the cross-family reviewer (Claude Opus 5.5) for the `law-corpus`
orchestration. The maestro and workers used Codex. Your constitutional role is
Auditor for a soft gate. Read only; do not change files. Worktree:
`/Users/aarusso/.codex/worktrees/law-corpus/detran`. Return **one raw JSON
object only**, with no Markdown fence or prose.

## Read in order

1. `docs/meta/agents/orchestra/README.md` §§4–5 and `docs/meta/agents/README.md`
   common rules.
2. `work/campaigns/C-0002-consolidacao.md` phase A action 2, then
   `work/rounds/R-0019/plan.md` CTG-0001 scope and acceptance.
3. `work/rounds/R-0019/contracts/CTG-0001.md`, including C-01-06.1.
4. `work/rounds/R-0019/reports/TASK-0001.md` through `TASK-0005.md`.
5. Full staged diff at
   `work/rounds/R-0019/reviews/delivery-review-CTG-0001.diff` (151 files,
   about 45,600 lines; 89 schema copies dominate it). Inspect every changed path;
   use `law/schemas/manifest.json` and independently check byte identity of
   the schema copies against the installed DEVAI 1.5.6 package rather than
   spending context on repetitive vendor bytes. Read the verifier, its tests,
   policy, invariant and trace files directly as needed.

## Gates observed by maestro after R-0018 PR #128 was integrated

- `pnpm law:test`: 22/22 PASS, no skip.
- `pnpm verify:law-corpus`: PASS on the real corpus.
- `pnpm blueprints:check`: PASS isolated, then PASS in full `pnpm check`.
- `pnpm check`: exit 0, including format, new law gates, R-0018 state index,
  contracts, typecheck, frontend lint/tests/builds.
- DEVAI `check --only`: `invariants` 9, `invariant-strategies` population 9,
  `trace` 9, `test-trace` pass with discovery 0, `glob-guards` 89,
  `schemas` pass with adopter binding. Git status identical before/after.
- `devai doctor`: OK. `sense run spec_depth`: pass, 9 invariants, 41 ADRs,
  0 use cases (CTG-0002 later).
- `git diff --cached --check`: PASS.

The group includes a DEVAI-generated adopter binding in `.devai/config/`,
created by `devai init bind`, not hand editing. The 89 schemas were copied
byte for byte, not formatted. `law/glossary/README.md` and `product/README.md`
remain placeholder-only in otherwise empty trees; C-01-06.1 exempts these
until authored content appears. `law/adr/README.md` is populated and the
R-0018 merge removed its obsolete phrases. CTG-0002 (`product/` and
`law/glossary/`) remains a separate Owner-acceptance proposal.

## Rubric

Apply all delivery-review items in
`docs/meta/agents/orchestra/reviewer-prompt.template.md`: constitutional
authority; exact scope and contract; no invented product values; Architect →
Inspector → Engineer sequence; positive and negative tests before code; no
weakened test, skip or hand-edited generated file; source/anchor resolution;
real gate coverage for rules (a), (b), (e); no cross-domain integration breach;
ODs in the canonical register; complete acceptance evidence. List **all**
high findings in this first cycle, with file and line and a concrete fix.
`PASS` means no high finding. `REVIEW` means a correctable high finding. `FAIL`
means a contradiction of canonical authority, Owner decision, ADR,
Constitution, or write boundary. Subsequent cycles may review only fixes to
these findings, except a new `FAIL` by definition.

## Output schema

{
"mode": "delivery-review",
"round": "R-0019",
"ctg": "CTG-0001",
"cycle": 1,
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 7,
"file": "tools/law/verify.mjs",
"line": 1,
"claim": "specific observed defect",
"fix": "specific correction"
}
],
"notes": []
}
