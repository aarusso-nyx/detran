# Prompt-review R-0022 — tarefa nova TASK-0027 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Architect: `work/rounds/R-0022/prompts/TASK-0027.md` e `tasks/TASK-0027.json` — adenda de
`contracts/CTG-0006.md` exigida pelo plano (§Adendas A3, A4, A5, A6/M8) antes de TASK-0021 parte 1 e
TASK-0009: OD-R22-07 (o app grava em `signed-documents`), OD-R22-08 (estrutura da matriz aprovada),
OD-R22-40 (checkpoint das espécies clínicas com LTA), M8 (escritor atual da outbox), OD-R22-06/13.

Primeiro ciclo exaustivo **restrito a este prompt e ao seu JSON**. Rubrica (cite arquivo e linha):
papel e fronteira (só a seção de adenda; nada de código/DDL/blueprint/registro); leitura fechada
suficiente e com caminhos existentes; coerência com as decisões do Owner citadas (registro §C-0002 e
`AUTHORIZATION.md` B5, B6, B12) e com A1/OD-R22-02 (nenhum mecanismo genérico reconstruído; nenhum valor
normativo inventado); critérios executáveis; PC/hash em `compositions.json`.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 12,
  "scope": ["TASK-0027"],
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
