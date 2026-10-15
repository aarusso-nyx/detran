# Prompt-review R-0022 — ciclo 2 de TASK-0026 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Inspector criada depois da decisão do Owner B14 (`work/rounds/R-0022/AUTHORIZATION.md`
§Adenda B14, OD-R22-61 (c): _fallback_ do TEAT web no `tick$`) e do relatório parcial de TASK-0008
(`work/rounds/R-0022/reports/TASK-0008.partial.md`): `work/rounds/R-0022/prompts/TASK-0026.md` e
`tasks/TASK-0026.json`. Contrato: `contracts/CTG-0005.md` §"Adenda B14". A implementação de TASK-0008
está na worktree sem commit (`apps/teat/web/src/app/core/sse.service.ts`).

Ciclo 2, **restrito às 2 constatações** de `work/rounds/R-0022/reviews/prompt-review-10.json`: pacote
dos stubs de sessão corrigido para `@stynx-nyx/angular-auth/testing` (e seus `.d.ts` na leitura); F005
excluído da opção de retirada e obrigado a migrar com título e comportamento preservados, ajustado ao
tempo do cliente publicado. Verifique se foram resolvidas sem problema novo (PC/hash inclusive). Não
reabra outros itens.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 11,
  "scope": ["TASK-0026"],
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
