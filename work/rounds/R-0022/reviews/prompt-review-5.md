# Prompt-review R-0022 — TASK-0021 e TASK-0022, ciclo 2 (restrito)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Avalie **somente** a correção dos 4 achados de `work/rounds/R-0022/reviews/prompt-review-4.json` e o
texto introduzido por elas em `prompts/TASK-0021.md`, `prompts/TASK-0022.md`, `tasks/TASK-0021.json`,
`tasks/TASK-0022.json` e `compositions.json`. Achado novo sobre texto não alterado só se for FAIL por
definição, dizendo por que não apareceu no ciclo anterior.

Correções: (1) leitura de TASK-0021 inclui nominalmente os specs da classe P de `CTG-0006.md` §7;
(2) pré-condições por parte explícitas no prompt, `after:TASK-0009 (só para a parte 2)` nas tags, e a
declaração de que os `acceptance_commands` do JSON são os da parte 2 (a parte 1 é "coletado e vermelho
só pela implementação pendente"); (3) comando e2e com `r22-trust-profiles.e2e.spec.ts`; (4) TASK-0022
com `run test --passWithNoTests=false` dos três apps web alterados, no prompt e no JSON.

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 5,
  "scope": ["TASK-0021", "TASK-0022"],
  "verdict": "PASS | REVIEW | FAIL",
  "resolved": [1, 2, 3, 4],
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
