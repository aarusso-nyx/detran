# Reviewer — `prompt-review` TASK-0006 iteracao corretiva

> Auditor da familia oposta (`claude-opus-5-5`), somente leitura na
> worktree. A resposta deve comecar pelo caractere `{` e terminar por `}`:
> somente um objeto JSON estrito, sem cercas Markdown e sem quebras
> literais em strings.

Leia `work/rounds/R-0017/reviews/delivery-review-CTG-0002.json` somente
o achado de `40-fixtures-rait-org-fresh-local-stack.sql`,
`work/rounds/R-0017/contracts/CTG-0002.md` C-02-01,
`work/rounds/R-0017/reports/TASK-0006-maestro-adenda.md` e
`work/rounds/R-0017/prompts/TASK-0006-delivery-ratify.md`.
Verifique: o Engineer do seed pode avaliar/ratificar independentemente a
correcao da ata imutavel sob novo PC, sem tocar teste, contrato ou outro
modulo; comandos e isolamento scratch sao honestos; nenhum gate e
afrouxado. Primeiro ciclo exaustivo. `PASS` sem alto, `REVIEW` com alto
corrigivel, `FAIL` so violacao de fronteira ou fonte canonica. Cite arquivo
e linha.

```json
{
  "mode": "prompt-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": ["observacoes curtas"]
}
```
