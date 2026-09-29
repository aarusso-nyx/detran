# Prompt-review R-0027 — A-C2-15, tarefas liberadas

Papel: Auditor, somente leitura. Reviewer Claude Code `claude-opus-5-5`, família
oposta ao maestro Codex Sol 6. Avalie o plano, os JSON e prompts de
TASK-0001…0005 antes de qualquer worker de execução. Não implemente, não edite
arquivos e responda somente JSON no esquema abaixo.

## Leitura fechada

- `AGENTS.md`, `.devai/pin/constitution.md` Artigos 6, 7, 10 e 24;
- `work/rounds/R-0027/AUTHORIZATION.md`, `plan.md`, `budget.json`,
  `tasks/TASK-0001.json`…`TASK-0005.json`, `prompts/TASK-0001.md`…`TASK-0005.md`,
  `compositions.json`;
- `work/campaigns/C-0002-consolidacao.md` §12 e a adenda A-C2-15 presente no
  `plan.md` (o PR #161 pode estar aberto);
- `docs/meta/agents/orchestra/README.md` §§4–9,
  `worker-prompt.template.md`, `reviewer-prompt.template.md`,
  `model-ladder.md`; `law/schemas/task.schema.json`;
- `backend/domains/inf/collection/src/handwritten/index.ts`,
  `backend/domains/inf/collection/src/collection.module.ts`,
  `backend/app/src/detran-runtime.ts` linhas 66–90 e
  `backend/app/tests/e2e/runtime-profiles.e2e.spec.ts` para conferir a fronteira
  da composição bancária; `docs/meta/adr/ADR-0001*` e `ADR-0017*`.

## Rubrica

1. TASK-0001/0002 definem matriz de oito serviços, ODs vigentes e registro
   canônico; TASK-0003 caracteriza o mock antes da troca; TASK-0005 escreve
   apenas testes RED até TASK-0006. Nenhuma tarefa fora de 0001…0005 executa.
2. TASK-0004 só pode implementar dentro de `inf/collection`, usando o perfil
   existente sem fazer domínio depender do app. Se isso exigir composição no
   app, deve ficar esperando R-0022. Não aceite duplicação silenciosa do
   parser de perfil nem importação profunda do app pelo domínio.
3. Papéis e fronteiras: Architect define contratos, Inspector escreve testes,
   Engineer escreve código; nenhum Engineer edita os próprios testes. Arquivos
   proibidos de R-0020/R-0022/R-0023/R-0024 não constam nas fronteiras.
4. Dependências, locks e `acceptance_commands` são explícitos, existentes e
   executáveis. Testes RED esperados são distinguidos de erro de harness.
5. Prompt-review único, sem PR, sem delivery-review e sem `pnpm check`
   intermediário. ODs novas são pedidas na sessão e registradas no lugar
   canônico. Hashes dos prompts após formatação batem com `compositions.json`.
6. Aponte todos os achados high já no primeiro ciclo, com arquivo, linha,
   evidência e correção concreta. PASS se nenhum high; REVIEW se corrigível;
   FAIL se houver contradição constitucional ou decisão do Owner.

Saída exata:
{"mode":"prompt-review","round":"R-0027","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}
