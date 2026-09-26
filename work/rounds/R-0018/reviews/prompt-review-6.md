# Prompt do reviewer — modo `prompt-review` (CTG-0002: TASK-0005, TASK-0007)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state` (branch `orchestra/index-state-ctg2`).
> Responda **apenas** com o JSON do §Saída.

## Contexto mínimo

1. `docs/meta/agents/orchestra/README.md` §4 e §5; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` (Metas 5, 7, 8, 9; §Tarefas; §Critérios)
3. `work/rounds/R-0018/prompts/00-maestro.md` §0 (locks, OD-R18-003)
4. `work/rounds/R-0018/contracts/CTG-0002.md` (contrato do Architect, TASK-0006) e o relatório
   `work/rounds/R-0018/reports/TASK-0006.md`
5. Em revisão: `work/rounds/R-0018/prompts/TASK-0005.md`, `TASK-0007.md`; `tasks/TASK-0005.json`,
   `tasks/TASK-0007.json`; entradas de `compositions.json`

Escopo: somente esses dois prompts (execução paralela, fronteiras disjuntas). O próprio contrato
também pode ser apontado se um prompt herdar dele um defeito que impeça a execução. Nota conhecida:
dois critérios do `plan.md` sobre `git check-ignore -v` não provam o que pretendem (relatório do
TASK-0006, "Fora do escopo"); o maestro os registrará como **não cumpridos** no closure (critérios
imutáveis), com a prova substituta C-02-20…23 — não é achado destes prompts.

## Rubrica

Itens 1, 2, 3, 4, 5, 6, 10 e 12 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`.
Esta é transcrição e configuração a partir de contrato fechado: não há testes de Inspector nesta
dupla (o contrato traz os critérios verificáveis por comando; `orchestra/README.md` §4.14 exige
Inspector para verificadores e contratos de código, não para transcrição).

## Veredito

PASS · REVIEW · FAIL. Primeiro ciclo: exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0005, TASK-0007",
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
