# Prompt-review R-0022 — tarefa nova TASK-0029 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Architect: `work/rounds/R-0022/prompts/TASK-0029.md` e `tasks/TASK-0029.json` — parte D0 da
assinatura (edição do blueprint `BP-INF-NORMATIVE-001` 1.1.0 → 1.2.0 conforme §A.2.1 da Adenda A de
`contracts/CTG-0006.md`) e a leitura ampliada de OD-R22-64 (a) (Adenda B16) com a "Adenda C" de CTG-0006.

Primeiro ciclo exaustivo **restrito a este prompt e ao seu JSON**. Rubrica (cite arquivo e linha): papel e
fronteira (blueprint só §A.2.1; contrato só a seção nova; nada de código/DDL/gerado — a regeneração é da parte D,
Engineer); leitura fechada suficiente com caminhos existentes; nenhum valor normativo inventado (OD-R22-08,
B6); critérios executáveis (atenção: `blueprints:check` com gerado ainda não regenerado); PC/hash em
`compositions.json`.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 16,
  "scope": ["TASK-0029"],
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
