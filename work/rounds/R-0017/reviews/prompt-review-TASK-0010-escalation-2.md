# Prompt-review da escalada TASK-0010, precisao final

Papel: Auditor externo Claude Opus 5.5, somente leitura. Leia `work/rounds/R-0017/prompts/TASK-0010-escalation.md`, o prompt original `TASK-0010.md`, o veredito `reviews/prompt-review-TASK-0010-escalation.json` e `docs/meta/agents/orchestra/reviewer-prompt.template.md`. PC esperado `PC-675d04b3195b293c`, SHA-256 completo `675d04b3195b293c024abf80372cccfc18d5f53362c787b440fff050b8d63677`.

Revise apenas as duas observacoes low do veredito anterior: instrucao explicita para a linha R-0017 cobrir M1, OD-R17-001…004 e a cadeia ancorada; instrucao de Prettier limitada as linhas R-0017 de `waves.md` e `work/rounds/README.md`. Confirme que a fronteira e os gates seguem intactos. PASS sem high, REVIEW por high corrigivel, FAIL por contradicao canonica/Owner.

Responda uma linha de JSON cru, primeiro caractere `{`, ultimo `}`, sem bloco Markdown, com chaves mode=`prompt-review`, round=`R-0017`, verdict, findings=[{severity,item,file,line,claim,fix}], notes=[strings]. Formato: {"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
