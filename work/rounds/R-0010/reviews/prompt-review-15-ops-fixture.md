# Revisão restrita das correções de TASK-0021

Papel constitucional: Auditor. Modo `prompt-review`, rodada R-0010. Somente leitura; devolva apenas JSON válido sem Markdown. Leia `reviews/prompt-review-14-ops-fixture.json` (REVIEW, dois highs e cinco lows), `prompts/TASK-0021.md`, `tasks/TASK-0021.json`, entrada de TASK-0021 em `compositions.json`, `contracts/CTG-0002.md` adenda A-4, `plan.md` §Tarefas/§Triagem, e as fontes locais citadas pelos achados. Julgue **somente as correções** desses sete achados. Texto não alterado só admite achado novo `FAIL` por contradição canônica, decisão Owner, ADR, Constituição ou fronteira, com justificativa por que não apareceu na revisão exaustiva.

Confira: ambiente dirigido `detran_boat_r0010_opsfixture` com app/reader `role_app_backend`; 403 ou lista cross-tenant não muda asserção; referência à A-4 correta; IDs/slug/e-mail/membership canônicos; convenção de fixture compartilhada sem cleanup de identidade; leitura fechada parcimoniosa; `git diff --check` só maestro; lock TASK-0021 registrado no plano e agrupamento CTG-0002 justificado. Confira hash/PC atualizado.

Formato: {"mode":"prompt-review","round":"R-0010","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":4,"file":"work/rounds/R-0010/prompts/TASK-0021.md","line":1,"claim":"fato verificável","fix":"correção localizada"}],"notes":[]}
