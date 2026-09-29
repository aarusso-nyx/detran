# Prompt-review R-0029 — ciclo de correção

Papel: Auditor, somente leitura. Esta é a conferência dos quatro achados de `prompt-review-1.json` dentro do único processo de prompt-review da A-C2-15. Leia somente o veredito anterior, os arquivos corrigidos, `compositions.json` e `tasks/TASK-0001.json`/`TASK-0002.json`. Não edite arquivos e não amplie o escopo para TASK-0003+. Responda só um JSON válido, sem cerca Markdown, prólogo ou epílogo.

Confirme:

1. TASK-0001 agora lê tanto os contratos de consulta quanto os de comando que existem em disco; o contrato inexistente de comando AGENCY não é pressuposto.
2. AUTHORIZATION explicita sem PR e sem delivery-review nesta sessão.
3. TASK-0002 põe a issue só em `work/rounds/R-0029/issue-body.md`; o backlog com lock concorrente fica intacto. O catálogo i18n TEAT é reconferido após R-0024.
4. M3 justifica Sol 6 alto para TASK-0001. `compositions.json` e ambos os JSONs de tarefa têm hashes e PC IDs dos prompts corrigidos.

Saída exata:

{"mode":"prompt-review","round":"R-0029","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}
