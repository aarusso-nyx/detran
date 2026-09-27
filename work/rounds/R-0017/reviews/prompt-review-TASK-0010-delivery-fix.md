# Prompt-review da correcao TASK-0010

Papel: Auditor externo Claude Opus 5.5, somente leitura. Leia `work/rounds/R-0017/prompts/TASK-0010-delivery-fix.md`, `work/rounds/R-0017/reviews/delivery-review-CTG-0003.json` e `docs/meta/agents/orchestra/reviewer-prompt.template.md`. PC esperado `PC-91cc7233d82b04c0`, SHA-256 `91cc7233d82b04c0ed9e7a421d073aaf95abc57dc8739cfa79b282d5b5d90e4f`.

Revise apenas se o prompt corrige os dois high do delivery-review dentro da fronteira do backlog, com leitura fechada, sem inventar rodada/dono ou tocar codigo/ADR; gates nao reduzidos. PASS sem high, REVIEW por high corrigivel, FAIL por contradicao canonica/Owner/fronteira.

Responda JSON cru numa linha, sem Markdown: {"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
