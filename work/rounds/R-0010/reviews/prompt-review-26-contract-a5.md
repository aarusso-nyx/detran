Papel constitucional: Auditor. Modo prompt-review, rodada R-0010, somente leitura.

Revise `work/rounds/R-0010/contracts/CTG-0002.md` §Adenda A-5,
`prompts/TASK-0022.md`, `tasks/TASK-0022.json`, `prompts/TASK-0011.md`,
`tasks/TASK-0011.json`, `compositions.json`, o contrato BOAT atual e
`tools/contracts/tests/check-commands.test.mjs`. Confirme:

1. TASK-0022 corrige exclusivamente os enums ausentes das respostas 4xx/5xx,
   com fontes fechadas e sem permitir códigos inventados;
2. a exceção de retentativa do Inspector permite mudar apenas o baseline
   legado C-5-16 de 139 para 152, preservando os novos REDs e os 92 TEAT;
3. TASK-0010 continua responsável apenas pelo catálogo BOAT por prefixo e
   pela raiz dos controladores est/crash;
4. hash, PC ID, modelo, esforço, status e limites de iteração conferem.

PASS se não houver achado high. REVIEW para high local corrigível. FAIL para
contradição de fonte, decisão Owner, ADR, Constituição ou fronteira. Responda
somente JSON válido no formato:
{"mode":"prompt-review","round":"R-0010","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"path","line":1,"claim":"fato","fix":"correcao"}],"notes":[]}
