# Prompt-review R-0032 — ciclo 2 restrito

Papel: **Auditor**, Claude Code Opus 5.5, somente leitura. Responda **apenas um objeto JSON válido**, começando por `{` e terminando por `}`. Sem Markdown, preâmbulo ou pós-escrito.

Leia `work/rounds/R-0032/reviews/prompt-review-1.json` e **reavalie somente as correções dos dez achados high daquele ciclo**, nos arquivos indicados ali e nos arquivos novos de apoio `AUTHORIZATION.md`, `plan.md` §Decisões/§Bloqueios/§Concorrência, `env-detran-r32.sh`, tasks e compositions. Não abra achado novo sobre texto inalterado, salvo contradição `FAIL` com Constituição, ADR ou decisão do Owner; nesse caso explique por que não foi visto no primeiro ciclo. Os achados low são opcionais e só podem impedir PASS se houver contradição canônica.

Conferir especialmente: caminho real de `docs/meta/knowledge-base/import-manifest.json`; operationIds de consultas toxicologia/restrições; leituras fechadas da TASK-0001 e TASK-0008; semântica fail-closed M3; bloqueio de i18n OD-R32-006 antes da O7; fronteiras distintas TASK-0008/0009; e2e no DB isolado com limpeza; critérios RED do Inspector; runbook local real. A autorização limita esta sessão a O1–O2. Nada de PR ou delivery-review.

Saída exigida:

```json
{
  "mode": "prompt-review",
  "round": "R-0032",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
