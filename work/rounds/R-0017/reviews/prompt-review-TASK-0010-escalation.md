# Prompt-review da escalada TASK-0010

Papel: Auditor externo Claude Opus 5.5, somente leitura. Leia `work/rounds/R-0017/prompts/TASK-0010-escalation.md`, o prompt original `TASK-0010.md`, o relatorio `reports/TASK-0010-retry-1.md`, `work/rounds/R-0017/plan.md` §Triagem e `docs/meta/agents/orchestra/reviewer-prompt.template.md`. O PC esperado e `PC-5ad5c237bbcdadae`; SHA-256 completo `5ad5c237bbcdadae9b05812e1bd2aa122e1930077db00553a07ddf23d5346a05`.

Verifique se a escalada Terra/alto restringe a leitura e a escrita aos quatro registros, preserva a secao OD decidida pelo Owner, mantem os criterios e gates da TASK-0010 e evita afirmar fechamento antecipado. A insercao da linha R-0017 em `waves.md` foi feita pelo maestro com patch exato para contornar a linha R-0018 longa; a escalada deve ratificar a linha. PASS sem high, REVIEW por high corrigivel, FAIL por contradicao canonica/Owner/fronteira.

Responda uma linha de JSON cru, primeiro caractere `{`, ultimo `}`, sem bloco Markdown, com chaves mode=`prompt-review`, round=`R-0017`, verdict, findings=[{severity,item,file,line,claim,fix}], notes=[strings]. Formato: {"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
