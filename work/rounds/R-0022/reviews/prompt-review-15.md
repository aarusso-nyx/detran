# Prompt-review R-0022 — ciclo 2 de TASK-0028 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Inspector: `work/rounds/R-0022/prompts/TASK-0028.md` e `tasks/TASK-0028.json` — retirar
`backend/app/src/portal-opportunistic-auth.spec.ts` (mecanismo removido por TASK-0006) com mapa para casos C-03
verdes, e escrever C-03-18 (Adenda B15 de `contracts/CTG-0003.md`, OD-R22-63).

Ciclo 2, **restrito às 3 constatações** de `work/rounds/R-0022/reviews/prompt-review-14.json`: tabela
individual dos 10 casos com relação (i) mesmo comportamento ou (ii) comportamento substituído por decisão do
Owner citada, na mesma condição; lacuna → parar e reportar (sem criar critério); C-03-18 coletado por
`-t C-03-18` e controle P1 no próprio caso; `boat-victim-audit-tenant` nos comandos de aceitação. Verifique
se foram resolvidas sem problema novo (PC/hash inclusive). Não reabra outros itens.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 15,
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
