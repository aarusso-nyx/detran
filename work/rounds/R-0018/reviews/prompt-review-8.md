# Prompt do reviewer — modo `prompt-review` (CTG-0003: TASK-0008…0011)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Contexto mínimo

1. `docs/meta/agents/orchestra/README.md` §4 e §5; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` (Meta 6, §Tarefas TASK-0008…0011, §Critérios)
3. `work/rounds/R-0018/prompts/00-maestro.md` §0 (locks)
4. `work/rounds/R-0018/contracts/CTG-0003.md` e o relatório `work/rounds/R-0018/reports/TASK-0006.md`
5. Em revisão: `work/rounds/R-0018/prompts/TASK-0008.md` … `TASK-0011.md`; `tasks/TASK-0008…0011.json`;
   entradas de `compositions.json`

Escopo: esses quatro prompts (transcrição a partir de contrato fechado; fronteiras disjuntas do
contrato §7; execução paralela até três por vez). O relatório é a resposta final do worker e o
maestro o grava em `reports/` (método §6). A fase 2 do TASK-0011 será um prompt de iteração próprio.

## Rubrica

Itens 1, 2, 3, 4, 5, 6, 10 e 12 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`.

## Veredito

PASS · REVIEW · FAIL. Primeiro ciclo: exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0008…0011",
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
