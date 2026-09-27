# Prompt do reviewer — modo `prompt-review` (CTG-0004: TASK-0012, TASK-0013)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state` (branch `orchestra/index-state-ctg4`).
> Responda **apenas** com o JSON do §Saída.

## Contexto mínimo

1. `docs/meta/agents/orchestra/README.md` §4 e §5; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` §Decisões do maestro M9 (grupo pós-fechamento, autorização do Owner)
3. `work/rounds/R-0018/contracts/CTG-0003.md` §3.6 e §4 (regras de origem)
4. Em revisão: `work/rounds/R-0018/prompts/TASK-0012.md`, `TASK-0013.md`; `tasks/TASK-0012.json`,
   `tasks/TASK-0013.json`; entradas de `compositions.json`
5. Para conferir fatos: `backend/database/ddl/`, `backend/database/apply.sh`, `tools/README.md`,
   `package.json`, `tools/`, `docs/dev/operations/`

Escopo: somente esses dois prompts (Architect → transcriber, a partir de fontes fechadas; sem código
nem testes: são documentos). O contrato `contracts/CTG-0004.md` ainda não existe (é a saída de
TASK-0012). O relatório é a resposta final do worker, gravado pelo maestro.

## Rubrica

Itens 1, 2, 3, 4, 5, 6, 10 e 12 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`.

## Veredito

PASS · REVIEW · FAIL. Ciclo exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0012, TASK-0013",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 2,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": []
}
```
