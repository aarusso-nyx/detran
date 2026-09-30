# Prompt-review R-0022 — ciclo 2 dos efeitos da Adenda B12 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Ciclo 2, **restrito às 7 constatações** de `work/rounds/R-0022/reviews/prompt-review-7.json` e às
correções delas nos prompts `work/rounds/R-0022/prompts/TASK-0006.md`, `TASK-0007.md`, `TASK-0008.md`,
`TASK-0019.md`, `TASK-0024.md`, `TASK-0025.md` e seus `tasks/*.json`. Correções aplicadas:

- Contexto comum dos seis prompts atualizado (só TEAT web migra; outbox e offline-sync em checkpoint;
  item "Tríade com vermelho verificável").
- TASK-0007 sem referência literal à outbox publicada.
- Novo gate `tools/orchestra/expect-red.mjs` (leia-o): roda o comando vitest com reporter JSON e sai 0
  só se ≥ 1 teste coletado, 0 skipped/todo e o conjunto de falhos for exatamente a lista
  `work/rounds/R-0022/reports/<TASK>.expected-red.txt`. Usado nos `acceptance_commands` de TASK-0024,
  TASK-0025, TASK-0019 (listas escritas pelos Inspectors) e TASK-0008 (lista do maestro,
  `reports/TASK-0008.expected-red.txt`, com o `fullName` do `it.fails` C-01-39, obtido do reporter JSON
  atual). Verificação do maestro: com lista vazia sobre W4 → `OK (5 coletados…)`; com um nome
  inexistente → exit 1.
- TASK-0008: suíte completa na forma `run test --passWithNoTests=false`.

Verifique se cada constatação foi resolvida sem criar problema novo (Art. 10, fronteiras, coerência com
B12/A6, PC/hash em `compositions.json`). Não reabra itens fora das 7.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 8,
  "scope": [
    "TASK-0006",
    "TASK-0007",
    "TASK-0008",
    "TASK-0019",
    "TASK-0024",
    "TASK-0025"
  ],
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
