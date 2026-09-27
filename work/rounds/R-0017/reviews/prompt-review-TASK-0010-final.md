# Confirmacao de prompt TASK-0010

Papel: Auditor externo Claude Opus 5.5, somente leitura. O prompt-review
CTG-0003 aprovado ja examinou TASK-0010. Desde entao, a unica alteracao
foi adicionar `reports/TASK-0008-retry-1.md` e
`reports/TASK-0009-retry-1.md` a leitura fechada; os dois retries foram
prompt-reviewed PASS e entregues. Leia o prompt final
`work/rounds/R-0017/prompts/TASK-0010.md` e sua task JSON. SHA-256
esperado `3b71a75336e97ec3427d69355a88723cd34d03a3cea920e00968901831b3ee08`,
PC `PC-3b71a75336e97ec3`. Confirme que a leitura adicional nao muda
fronteira, definicao ou gate; `aberta` continua token valido e nenhum
`PC-*` de fechamento e inventado. PASS sem high; REVIEW por high
corrigivel; FAIL por violacao canonica/Owner/fronteira.

Responda uma linha de JSON cru, primeiro caractere `{`, ultimo `}`,
sem bloco Markdown. Chaves mode=`prompt-review`, round=`R-0017`,
verdict, findings=array de severity/item/file/line/claim/fix,
notes=array. Formato:
{"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
