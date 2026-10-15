# Prompt-review R-0022 — ciclo 3 de TASK-0029 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Architect: `work/rounds/R-0022/prompts/TASK-0029.md` e `tasks/TASK-0029.json` — parte D0 da
assinatura (edição do blueprint `BP-INF-NORMATIVE-001` 1.1.0 → 1.2.0 conforme §A.2.1 da Adenda A de
`contracts/CTG-0006.md`) e a leitura ampliada de OD-R22-64 (a) (Adenda B16) com a "Adenda C" de CTG-0006.

Ciclo 3, **restrito à única constatação** de `work/rounds/R-0022/reviews/prompt-review-17.json`: acrescentado o
critério executável `node tools/orchestra/validate-blueprints.mjs BP-INF-NORMATIVE-001.json` (leia o script: valida
contra `docs/framework/blueprints/module-blueprint.schema.json` com o AJV 2020 já instalado, `@redocly/ajv`; o
maestro conferiu 48/48 blueprints válidos hoje e recusa de um blueprint sem `id`/`module`), no prompt e nos
`acceptance_commands`. Verifique se foi resolvida sem problema novo (PC/hash inclusive). Não reabra outros itens.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 18,
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
