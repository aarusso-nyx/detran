# Prompt-review R-0022 — ciclo 3 dos efeitos da Adenda B12 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Ciclo 3, **restrito à única constatação** de `work/rounds/R-0022/reviews/prompt-review-8.json`
(`tools/orchestra/expect-red.mjs` ignorava o exit do vitest). Correção: o gate agora exige exit 0 sem
falhas e exit 1 com falhas (nunca outro código, sinal ou erro de spawn), recusa saída com "Unhandled
Errors/Rejection" ou linha de resumo "Errors N error(s)" e `numRuntimeErrorTestSuites` > 0, além das
regras anteriores. Verificação do maestro: lista vazia sobre W4 → OK; nome inexistente → exit 1;
arquivo inexistente → "nenhum teste coletado" e "exit 1 incompatível com 0 falha(s)". Verifique se a
constatação foi resolvida sem criar problema novo. Não reabra outros itens.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 9,
  "scope": ["tools/orchestra/expect-red.mjs"],
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
