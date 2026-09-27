# Reviewer — prompt-review TASK-0007 delivery fix

Papel: Auditor externo (`claude-opus-5-5`), somente leitura. Sua resposta
deve comecar por `{` e terminar por `}`. Responda um objeto JSON estrito,
sem Markdown nem quebras literais em strings.

Leia `work/rounds/R-0017/reviews/delivery-review-CTG-0002.json`,
`work/rounds/R-0017/contracts/CTG-0002.md`,
`work/rounds/R-0017/reports/TASK-0011.md`,
`work/rounds/R-0017/prompts/TASK-0007-delivery-fix.md` e, para confirmar
as fronteiras, `tools/stack/smoke.mjs`,
`tools/stack/sefaz-adapter-smoke.mjs`, `tools/detran-stack.sh`.
Verifique se o Engineer pode ratificar/corrigir toda producao antes feita
pelo maestro sob PC proprio, se os vermelhos do Inspector sao atribuiveis
sem editar testes, se a autorizacao A6 e o default actor A7 sao
preservados e se as instrucoes de SEFAZ satisfazem o comando literal e os
erros de C-02-02. Procure omissoes de lifecycle, guards, RLS e evidencias.
Primeiro ciclo exaustivo. `PASS` sem alto; `REVIEW` com alto corrigivel;
`FAIL` so se houver violacao insanavel. Cite arquivo e linha.

{"mode":"prompt-review","round":"R-0017","verdict":"PASS | REVIEW | FAIL","findings":[],"notes":[]}
