# Prompt-review R-0022 — ciclo 2 de TASK-0027 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Architect: `work/rounds/R-0022/prompts/TASK-0027.md` e `tasks/TASK-0027.json` — adenda de
`contracts/CTG-0006.md` exigida pelo plano (§Adendas A3, A4, A5, A6/M8) antes de TASK-0021 parte 1 e
TASK-0009: OD-R22-07 (o app grava em `signed-documents`), OD-R22-08 (estrutura da matriz aprovada),
OD-R22-40 (checkpoint das espécies clínicas com LTA), M8 (escritor atual da outbox), OD-R22-06/13.

Ciclo 2, **restrito às 5 constatações** de `work/rounds/R-0022/reviews/prompt-review-12.json`:
`@stynx-nyx/documents` retirado da leitura; `backend/app/src/detran-runtime.ts` e
`backend/database/ddl/04-integration-storage.sql` incluídos, com a instrução de que não há blueprint de
`storage.objects`; trava de despacho `TASK-0027` acrescentada às pré-condições e ao contexto de
`prompts/TASK-0009.md` e `prompts/TASK-0021.md` (e JSONs); #17 escritor / #18 leitor; critério e
`acceptance_commands` com contagem exata = 1. Verifique se foram resolvidas sem problema novo (PC/hash dos
três prompts inclusive). Não reabra outros itens.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 13,
  "scope": ["TASK-0027", "TASK-0009", "TASK-0021"],
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
