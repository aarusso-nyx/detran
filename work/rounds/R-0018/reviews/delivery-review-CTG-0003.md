# Prompt do reviewer — modo `delivery-review` (CTG-0003)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5 / Claude Code; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na
> worktree `/Users/aarusso/Development/detran-worktrees/index-state` (branch
> `orchestra/index-state-ctg3`, empilhado sobre o CTG-0002, PR #129 aberto). Responda **apenas** com o
> JSON do §Saída.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` (Meta 6; §Critérios; §Triagem T8)
3. `work/rounds/R-0018/contracts/CTG-0003.md` (critérios C-03-01…26; fronteiras §7)
4. Relatórios: `work/rounds/R-0018/reports/TASK-0008.md`, `TASK-0009.md`, `TASK-0009-it1.md`,
   `TASK-0010.md`, `TASK-0011.md` (e, só como histórico de T8, `TASK-000{8,9,10}-tentativa1.md`)
5. Diff: `work/rounds/R-0018/reviews/delivery-review-CTG-0003.diff` (base `7ef96d42` = cabeça do
   CTG-0002) e os arquivos que ele toca

Particularidades:

- TASK-0008/0009/0010 foram **redespachados de forma idêntica** (mesmo `PC-`) depois de T8 (as
  entregas da tentativa 1 foram apagadas por outro worker); julgue só a entrega atual.
- TASK-0011 é a **fase 1**; a fase 2 (substituir `source_pending (fechamento)` e a linha R-0018 de
  `work/rounds/README.md`, C-03-22/23) acontece no fechamento, no mesmo commit do PC — não é achado
  aqui.
- `backend/database/ddl/README.md` fica fora (lock de R-0017; OD-R18-005).
- Os `*`/`_` literais extraídos de blueprints estão escapados (`\*`) para o Prettier não criar
  ênfase (preâmbulo do contrato; TASK-0009 iteração 1).
- `pnpm check` e `pnpm docs:check` completos são do maestro (resultado no PR).

## Rubrica

Itens 1, 4, 5, 7, 10 e 11 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`, mais: (a)
fronteiras do contrato §7 (nenhum `src/`, `package.json`, blueprint, contrato, `backend/database/**`);
(b) nenhum valor inventado nos READMEs (tudo de `package.json`, blueprint, nomes de DDL/contrato ou
"pendente de fonte"); (c) contagens e listas (C-03-01…C-03-18) conferem.

## Veredito

PASS · REVIEW · FAIL. Primeiro ciclo: exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0018",
  "ctg": "CTG-0003",
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
