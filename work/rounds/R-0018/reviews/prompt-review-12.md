# Prompt do reviewer — modo `prompt-review` (TASK-0012, ciclo 2, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Escopo (restrito)

Avalie **somente** se os 4 achados de `work/rounds/R-0018/reviews/prompt-review-11.json` foram
corrigidos em `work/rounds/R-0018/prompts/TASK-0012.md` (leitura do cabeçalho completo dos DDL; ordem
real do `apply.sh` fixada, com a reaplicação de `21-ops-provisioning.sql` e os três
`19-rait-priority-*`; contagem por `find` a partir da raiz; ausência por `! grep -q`), com o hash
atualizado em `compositions.json` e `tasks/TASK-0012.json`. Achado novo sobre texto inalterado só se
for `FAIL` por definição.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0012",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
