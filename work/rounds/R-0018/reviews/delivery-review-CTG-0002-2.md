# Prompt do reviewer — modo `delivery-review` (CTG-0002, ciclo 2, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Escopo (restrito)

Avalie **somente** se os 2 achados de `work/rounds/R-0018/reviews/delivery-review-CTG-0002.json`
foram tratados:

1. **Art. 6 → Art. 7:** Adenda A1 em `work/rounds/R-0018/contracts/CTG-0002.md` §Adendas e
   `docs/meta/agents/orchestra/model-ladder.md` (C-02-33).
2. **Violação de fronteira (T8):** Adenda A2; o maestro restaurou os arquivos da fronteira de
   TASK-0005 à base `7d6bd665` e redespachou TASK-0005 **isolado** (`prompts/TASK-0005-it1.md`,
   relatório `reports/TASK-0005-it1.md`); os patches da nova execução são byte-idênticos aos da
   tentativa 1; a tentativa 1 está registrada como falha de fronteira no `iteration_trail` de
   `tasks/TASK-0005.json`, em `plan.md` §Triagem T8 e em `reports/TASK-0005-tentativa1.md`, e irá ao
   closure. TASK-0008/0009/0010 serão redespachados depois do commit do CTG-0002, sem concorrência
   entre CTGs.

Diff atual: `work/rounds/R-0018/reviews/delivery-review-CTG-0002-2.diff` (base `7d6bd665`). Achado
novo sobre texto que não mudou só se for `FAIL` por definição.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0018",
  "ctg": "CTG-0002",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
