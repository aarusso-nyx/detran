# Prompt-review R-0022 — ciclo 2 de TASK-0029 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Architect: `work/rounds/R-0022/prompts/TASK-0029.md` e `tasks/TASK-0029.json` — parte D0 da
assinatura (edição do blueprint `BP-INF-NORMATIVE-001` 1.1.0 → 1.2.0 conforme §A.2.1 da Adenda A de
`contracts/CTG-0006.md`) e a leitura ampliada de OD-R22-64 (a) (Adenda B16) com a "Adenda C" de CTG-0006.

Ciclo 2, **restrito às 2 constatações** de `work/rounds/R-0022/reviews/prompt-review-16.json`: campos normativos
anuláveis e sem default distintos de `revision` (`not null default 1`), com `schemaVersion` do documento em
`1.0.0`; `blueprints:check` retirado dos critérios (divergência esperada até a parte D) e substituído por geração
numa pasta temporária (`BLUEPRINTS_OUTPUT=$(mktemp -d) node tools/blueprints/generate.mjs`), que valida a forma.
Verifique se foram resolvidas sem problema novo (PC/hash inclusive). Não reabra outros itens.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 17,
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
