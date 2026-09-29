# R-0031 prompt-review — ciclo 3 excepcional, somente TASK-0010.json

Papel: Auditor (soft gate), Claude Code Opus 5.5, família oposta à do maestro Codex. Somente leitura.

O Owner autorizou novas revisões nesta sessão. Sua resposta deve ser exatamente um objeto JSON válido, começando com `{` e terminando com `}`. Sem Markdown, preâmbulo ou pós-escrito.

Leia nesta ordem:

1. `work/rounds/R-0031/reviews/prompt-review-1.json`.
2. `work/rounds/R-0031/reviews/prompt-review-2.json`.
3. `work/rounds/R-0031/prompts/TASK-0010.md`, sobretudo §Tarefa e §Critérios.
4. `work/rounds/R-0031/tasks/TASK-0010.json`, sobretudo `description` e `acceptance_commands`.

Verifique somente o único achado `high` do ciclo 2: a descrição de `TASK-0010.json` ainda ordenava `parameters:generate` na O6, escrevendo `backend/database/seed/05-parameters.sql` fora do lock; o prompt já havia removido essa instrução. A correção deve alinhar JSON e prompt, marcar `pec.` provisório sob OD-PW-004 e deixar a geração para TASK-0012. Não reavalie os demais achados, já resolvidos no ciclo 2. Um achado novo sobre texto inalterado só cabe se for contradição canônica `FAIL`, com justificativa de por que não foi apontado antes.

Retorne somente JSON neste formato:

{"mode":"prompt-review","round":"R-0031","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":3,"file":"work/rounds/R-0031/tasks/TASK-0010.json","line":8,"claim":"...","fix":"..."}],"notes":["..."]}
