# Prompt do reviewer — modo `delivery-review` (CTG-0004, pós-fechamento)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state` (branch `orchestra/index-state-ctg4`, sobre
> `main` `b1268a35`). Responda **apenas** com o JSON do §Saída.

## Contexto mínimo

1. `docs/meta/agents/orchestra/README.md` §4; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` §Decisões do maestro M9 (autorização do Owner, grupo pós-fechamento)
3. `work/rounds/R-0018/contracts/CTG-0004.md` (critérios C-04-01…15)
4. Relatórios `work/rounds/R-0018/reports/TASK-0012.md`, `TASK-0013.md`
5. Diff: `work/rounds/R-0018/reviews/delivery-review-CTG-0004.diff` (base `origin/main`) e os arquivos tocados;
   fontes: `backend/database/ddl/*.sql` (cabeçalhos), `backend/database/apply.sh`, `package.json`, `tools/`

## Rubrica

Itens 1, 4, 5, 7, 10 e 11 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`, mais: (a) toda
descrição do README de DDL vem literalmente do cabeçalho do arquivo ou do texto anterior verdadeiro;
(b) a ordem descrita bate com `apply.sh`; (c) a tabela de `tools/README.md` bate com o `package.json`;
(d) fronteira (só os quatro arquivos + artefatos da rodada).

## Veredito

PASS · REVIEW · FAIL. Ciclo exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0018",
  "ctg": "CTG-0004",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 5,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": []
}
```
