# Prompt-review R-0029 — A-C2-15, CTG-0001

Papel: Auditor, somente leitura. Revise exclusivamente o bootstrap e os prompts de TASK-0001 e TASK-0002 da R-0029. Leia `AUTHORIZATION.md`, `plan.md` §Execução OD-C2-005/§Decisões do maestro/§Retomada, `budget.json`, `compositions.json`, `tasks/TASK-0001.json`, `tasks/TASK-0002.json`, `prompts/TASK-0001.md`, `prompts/TASK-0002.md`, a adenda A-C2-15 em `work/campaigns/C-0002-consolidacao.md` §16 e as fontes de produto citadas nos prompts. Não edite arquivos. Responda somente um objeto JSON válido, sem cerca Markdown, prólogo ou epílogo.

Verifique:

1. A autorização é fiel à A-C2-15 e à data efetiva de recebimento; somente TASK-0001/0002 são liberadas, sem PR nem delivery-review.
2. TASK-0001 inventaria as rotas existentes e novas, produz a classificação `ligada`/`somente-leitura`/`fail-closed-OD` e os contratos CTG-0002…0004 sem tratar a documentação como implementação liberada. OD-R29-001 = (a) é decisão do Owner; OD-R29-002…004 não ganham decisões do Owner por inferência.
3. TASK-0002 transcreve ODs em `teat-build-pack.md` §4, só copia i18n de fonte fechada e, se criar fichas, atualiza `artifactIdCount` no mesmo lote. Não inventa permissão, endpoint, texto, estado, prazo ou retenção.
4. O lock de `apps/teat/web/src/app/features/sinistros/` e os locks de R-0020/22/23/24 são respeitados. TASK-0003+ espera R-0024; contratos atuais exigem reconferência contra `origin/main` na retomada.
5. As duas tarefas têm `acceptance_commands` executáveis, com argumentos de processo sem shell e alinhados aos prompts. JSONs e composição atendem ao schema vigente; orçamento e modelo seguem a escada Codex vigente.

Reporte achados concretos com arquivo e linha. Evite sugestões de implementação fora da sessão A. Saída exata:

{"mode":"prompt-review","round":"R-0029","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}
