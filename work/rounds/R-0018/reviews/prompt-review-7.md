# Prompt do reviewer — modo `prompt-review` (TASK-0005, TASK-0007; ciclo 2, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Escopo (restrito)

Avalie **somente** se os 3 achados de `work/rounds/R-0018/reviews/prompt-review-6.json` foram
corrigidos: a §Entrega de `prompts/TASK-0005.md` e `prompts/TASK-0007.md` agora diz que o relatório é
a resposta final e que o maestro o grava em `reports/` (método `orchestra/README.md` §3 e
`00-maestro.md` §6: "ao receber o relatório, grave-o em `reports/TASK-nnnn.md`"), de modo que o worker
não escreve em `work/rounds/**`; `tasks/TASK-0005.json` tem `MOD-rounds-readme`; hashes atualizados em
`compositions.json` e nas tarefas. Achado novo sobre texto inalterado só se for `FAIL` por definição.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0005, TASK-0007",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
