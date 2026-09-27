# Prompt-review do retry TASK-0010

Papel: Auditor externo Claude Opus 5.5, somente leitura. Leia
`work/rounds/R-0017/prompts/TASK-0010-retry-1.md` e o prompt original
`TASK-0010.md`, `work/rounds/R-0017/plan.md` §Triagem/Retomada e
`docs/meta/agents/orchestra/reviewer-prompt.template.md`.
O PC esperado e `PC-48f5fe279eaffb43`; SHA-256 completo
`48f5fe279eaffb439bbe39eaa1c6dbffdf86a8e3fca2d5e4d7bb9a847c489e67`.
A primeira tentativa de Luna ficou sem saida apos leitura ampla de linhas
historicas gigantes, sem editar alvos; confira se o retry reduz a leitura
sem reduzir tarefa, fronteira, gates ou respeito as ODs. O token de estado
e `aberta` e o PC fica `—` ate round close. PASS sem high, REVIEW por high
corrigivel, FAIL por contradicao canonica/Owner/fronteira.

Responda uma linha de JSON cru, primeiro caractere `{`, ultimo `}`,
sem bloco Markdown, com chaves mode=`prompt-review`, round=`R-0017`,
verdict, findings=[{severity,item,file,line,claim,fix}], notes=[strings].
Formato: {"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
