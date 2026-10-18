# Prompt-review R-0025 — ciclo de correção

Papel: Auditor, somente leitura. Esta é a revisão das correções aos achados do
`prompt-review-1.json`; não amplie o escopo além dos quatro prompts liberados
pela A-C2-15. Leia o veredito anterior, o diff desde `e3d54745`, os prompts,
JSONs de tarefa e `compositions.json`. Não edite arquivos. Responda somente um
objeto JSON válido, sem cerca Markdown, prólogo ou epílogo.

Confirme especificamente:

1. `TASK-0006.md` deixa OD-R25-007 e OD-R25-011 como pendentes e não escolhe
   papel, prazo, coluna ou evento por inferência.
2. `TASK-0002.md` cita a allowlist i18n do catálogo e para se uma chave não
   estiver permitida.
3. Os quatro `acceptance_commands` usam argv sem shell; TASK-0002 cobre
   OD-R25-001…015 e seção RAIT-WEB; TASK-0003 cobre F-01…F-05 e A-1…A-6;
   TASK-0006 cobre F-06…F-16.
4. TASK-0003/0006 marcam o formato ainda não integrado de R-0023 como
   proposta `source_pending`. Hashes e PC IDs correspondem aos prompts finais.

Saída exata:
{"mode":"prompt-review","round":"R-0025","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}
