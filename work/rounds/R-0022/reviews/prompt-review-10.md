# Prompt-review R-0022 — tarefa nova TASK-0026 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova de Inspector criada depois da decisão do Owner B14 (`work/rounds/R-0022/AUTHORIZATION.md`
§Adenda B14, OD-R22-61 (c): _fallback_ do TEAT web no `tick$`) e do relatório parcial de TASK-0008
(`work/rounds/R-0022/reports/TASK-0008.partial.md`): `work/rounds/R-0022/prompts/TASK-0026.md` e
`tasks/TASK-0026.json`. Contrato: `contracts/CTG-0005.md` §"Adenda B14". A implementação de TASK-0008
está na worktree sem commit (`apps/teat/web/src/app/core/sse.service.ts`).

Primeiro ciclo exaustivo **restrito a este prompt e ao seu JSON**. Rubrica (cite arquivo e linha):

1. Art. 10 (só Inspector edita teste; nenhum arquivo de produção na fronteira);
2. regra de retirada (caso retirado só com C-nn correspondente; migrados preservam título e
   comportamento provado; o `it.fails` C-01-39 fica para TASK-0020);
3. fronteira fechada (só `chainSetup`/comentário de W4, os 8 casos nomeados e utilitário de teste novo);
4. critérios executáveis com o gate `tools/orchestra/expect-red.mjs` e a lista de TASK-0008 (única
   falha esperada = C-01-39), forma `run test --passWithNoTests=false`;
5. coerência com B12/B14 (só TEAT web; F005 ajustado ao tempo do cliente publicado: _tick_ 15 000 ms
   depois da entrada em _polling_, conforme o relatório parcial);
6. PC/hash em `compositions.json`.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 10,
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
