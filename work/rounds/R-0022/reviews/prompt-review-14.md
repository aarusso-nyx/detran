# Prompt-review R-0022 — tarefa nova TASK-0028 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Inspector: `work/rounds/R-0022/prompts/TASK-0028.md` e `tasks/TASK-0028.json` — retirar
`backend/app/src/portal-opportunistic-auth.spec.ts` (mecanismo removido por TASK-0006) com mapa para casos C-03
verdes, e escrever C-03-18 (Adenda B15 de `contracts/CTG-0003.md`, OD-R22-63).

Primeiro ciclo exaustivo **restrito a este prompt e ao seu JSON**. Rubrica (cite arquivo e linha): Art. 10
(só Inspector; nenhum `src/` de produção); regra de retirada (caso só sai com C-03 correspondente verde; caso
sem correspondente exige caso novo antes); C-03-18 com controle negativo e limpeza; fronteira fechada;
critérios executáveis com coleta efetiva; PC/hash em `compositions.json`.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 14,
  "scope": ["TASK-0028"],
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
