# Prompt-review da correcao TASK-0008

Papel: Auditor externo Claude Opus 5.5, somente leitura. Leia
`work/rounds/R-0017/prompts/TASK-0008-retry-1.md`, o prompt original
`TASK-0008.md`, `work/rounds/R-0017/reports/TASK-0008.md`, e
`docs/meta/agents/orchestra/reviewer-prompt.template.md`. O PC do retry
e `PC-05b1089be1f67fac`; hash SHA-256 completo
`05b1089be1f67fac5fd7f6d36b39c087455ea8fae508b8365b5271d506ca792f`.
Confirme que a fronteira se limita ao runbook, o exemplo `stack:logs`
recebe um servico, os dois comandos de build sao reais e os gates existem.
Nao reavalie outros pontos ja aceitos de CTG-0003. PASS se nao houver
high; REVIEW por high corrigivel; FAIL por violacao canonica ou fronteira.

Responda UMA LINHA de JSON cru, primeiro caractere `{`, ultimo `}`,
sem bloco Markdown, sem texto fora do JSON e com aspas internas escapadas.
Chaves: mode=`prompt-review`, round=`R-0017`, verdict,
findings=[{severity,item,file,line,claim,fix}], notes=[strings].
Formato: {"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
