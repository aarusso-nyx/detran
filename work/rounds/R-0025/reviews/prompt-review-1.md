# Prompt-review R-0025 — Sessão A, A-C2-15

Papel: Auditor, somente leitura. Reviewer Claude Code `claude-opus-5-5`,
família oposta ao maestro Codex `gpt-6-sol`. Revise apenas o bootstrap e os
prompts das tarefas liberadas. Não implemente nem edite arquivos. Responda
somente com um objeto JSON válido, sem cerca Markdown, prólogo ou epílogo.

## Leitura fechada

- `AGENTS.md`, `.devai/pin/constitution.md` Artigos 6, 7, 10 e 24;
- `work/campaigns/C-0002-consolidacao.md` §12, §14, §15 e §16;
- `work/rounds/R-0025/AUTHORIZATION.md`, `plan.md`, `budget.json`,
  `compositions.json`, `command-gap-analysis.md`;
- `work/rounds/R-0025/tasks/TASK-0001.json`, `TASK-0002.json`,
  `TASK-0003.json`, `TASK-0006.json`, e os respectivos prompts;
- `docs/meta/agents/orchestra/README.md` §§4–9,
  `worker-prompt.template.md`, `reviewer-prompt.template.md`,
  `model-ladder.md`; `law/schemas/task.schema.json`.

## Rubrica

1. O recorte A-C2-15 libera TASK-0001/0002/0003/0006 somente para
   documentos; não deve haver código backend, `policy.ts`, shell, kit ou arquivos
   de R-0020/R-0022/R-0023/R-0024.
2. TASK-0001 deriva da análise dos 64 comandos e das 13 rotas L0, reconfere
   contra `origin/main` e tria OD-R12-001…054. TASK-0002 transcreve as ODs no
   registro canônico e acrescenta i18n apenas nos namespaces permitidos.
3. TASK-0003 especifica F-01…F-05 e A-1…A-6; TASK-0006 especifica F-06…F-16.
   Cada F-nn requer verbo/path, `operationId`, DTO, transição com fonte WF/RN/UC,
   papéis, erros do catálogo e DDL, ou `source_pending` com OD quando a fonte
   não fecha a regra. Não converter decisão pendente em fato.
4. Dependências, locks, papéis, `acceptance_commands` executáveis e critérios
   estão explícitos. Prompt e JSON cobrem fronteiras de escrita e esperas de
   upstream. Hashes em `compositions.json` correspondem aos prompts finais.
5. Um prompt-review nesta sessão, nenhum PR ou delivery-review. Proibição de
   alterar `record/`, `.devai/config`, `.github/workflows/`, `law/register`.
6. Liste todos os achados de gravidade alta com caminho, linha, prova e correção
   concreta. PASS sem achados high; REVIEW se corrigíveis; FAIL para violação
   constitucional ou decisão do Owner.

Saída exata:
{"mode":"prompt-review","round":"R-0025","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}
