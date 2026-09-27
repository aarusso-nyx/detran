# Prompt do reviewer — modo `prompt-review` (TASK-0008…0011, ciclo 3, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Escopo (restrito)

Avalie **somente** se o achado único de `work/rounds/R-0018/reviews/prompt-review-9.json` (`git fetch` no
prompt do worker) foi corrigido em `work/rounds/R-0018/prompts/TASK-0008.md`, com o hash atualizado em
`compositions.json` e `tasks/TASK-0008.json`. Achado novo sobre texto inalterado só se for `FAIL` por
definição.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0008…0011",
  "cycle": 3,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
