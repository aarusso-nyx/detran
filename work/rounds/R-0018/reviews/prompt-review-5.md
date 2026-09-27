# Prompt do reviewer — modo `prompt-review` (TASK-0006, ciclo 3, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Escopo (restrito)

Avalie **somente** se o achado único de `work/rounds/R-0018/reviews/prompt-review-4.json` (leitura
fechada insuficiente para a tabela de fontes por módulo) foi corrigido no item 8 da §Leitura
obrigatória de `work/rounds/R-0018/prompts/TASK-0006.md`, e se `tasks/TASK-0006.json` e
`compositions.json` trazem o hash atual do prompt. Achado novo sobre texto inalterado só se for
`FAIL` por definição.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0006",
  "cycle": 3,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
