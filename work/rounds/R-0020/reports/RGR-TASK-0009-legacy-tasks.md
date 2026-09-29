# RGR — TASK-0009: tarefas históricas versus schema 2.0.0

**Emissor:** Engineer, com caracterização Inspector e triagem Architect. **Classe:** `reference-gap`. **Estado:** decisão do Owner pendente; TASK-0009 em `rgr_pending`. Este relatório não altera os critérios, o schema, as TASKs históricas ou o gate.

## Artefato, ambiguidade e risco

O contrato de CTG-0003 exige preservar toda a informação e os IDs históricos, não inventar isolamento, execução ou dependências, e obter zero TASK inválida em R-0003…R-0020 antes de TASK-0010 e dos selos. O schema `law/schemas/task.schema.json` 2.0.0 proíbe campos extras, IDs com sufixo, isolamento `none` e outras formas presentes no acervo. `source_pending` preserva a verdade do acervo, mas não satisfaz `verify:round-tasks`. Forçar conversões para atingir zero violaria Art. 22/41, o contrato e o gate. **Risco alto:** falsa prova de conformidade histórica, perda de dados de execução e alteração de identidade de tarefa.

## Evidência fechada

- `pnpm devai:baseline --out-dir /tmp/r20-ctg3-taskinventory` mediu 330 TASKs, 187 válidas, 143 inválidas, zero ilegíveis. A baseline de abertura era 294/151/143/0; as 36 tarefas novas são válidas.
- `pnpm verify:round-tasks` encontra exatamente 143 arquivos inválidos. Os 8 testes do Inspector para o normalizador e o gate passam; `normalize-tasks` recusa conversões sem fonte e não grava nenhum arquivo histórico.
- Erros sobrepostos: 93 ocorrências de `target_invariants` não `INV-*` em 37 arquivos; 56 `db_isolation` (54 `none`, duas instâncias com nome de banco); 31 `execution_evidence`; 31 `coupled_task_group` com sufixo; 15 `executor`; 12 títulos longos; 10 `iteration_trail`; 10 posições de pipeline; 8 predecessores; 7 `closure_reconciliation`; 6 IDs corretivos; 5 IDs de composição; 2 status; 2 disciplinas.
- Seis subtarefas corretivas de R-0007 usam IDs `TASK-0004-S*`, enquanto `TASK-0004` já existe. `additionalProperties: false` rejeita as 31 provas de execução e as sete reconciliações. O schema só aceita `db_isolation: database|cluster`; `none` não prova nenhum dos dois.
- O contrato já autoriza mover referências não `INV-*` para `tags: ref:<literal>`, e isso por si só tornaria 17 arquivos válidos. Planos das R-0012/R-0013/R-0014 documentam os grupos-base, e R-0007 documenta banco dedicado; ainda falta destino autorizado para os sufixos e nomes literais. Quatro alegações `INV-*` de R-0005 não são confirmadas por `law/trace.json`.

Inventário por rodada e exemplos: `reports/CTG-0003-task-inventory-2026-09-28.md`. Saídas completas do gate e normalizador foram retidas em `/tmp/r20-verify-tasks-stderr.txt` e `/tmp/r20-normalize-stderr.txt` nesta worktree; o gate foi executado sem escrita.

## Superfícies afetadas

`work/rounds/R-0003…R-0019/tasks/TASK-*.json`, `law/schemas/task.schema.json`, `tools/devai/normalize-tasks.mjs`, `tools/devai/verify-round-tasks.mjs`, `work/rounds/R-0020/contracts/CTG-0003.md`, `plan.md` §Critérios, TASK-0010, os selos históricos e o fechamento de R-0020. O schema e o gate permanecem intactos enquanto a decisão não existir.

## Perguntas estruturadas ao Owner

| qid | Pergunta | Candidatos e consequência |
| --- | --- | --- |
| RGR-R20-0009-Q1 | Autoriza uma **adenda A3** para normalização arquivística das 143 TASKs legadas, preservando byte a byte cada original em sidecar imutável com SHA-256, vínculo verificável na TASK canônica e tabela antes/depois por caminho? | **A (proposta):** autorizar essa preservação e exigir que cada novo valor tenha fonte ou decisão específica, sem relaxar schema/gate. **B:** manter originais sem migração; TASK-0009 e selos ficam bloqueados pelo critério zero. |
| RGR-R20-0009-Q2 | Qual semântica canônica autoriza para os 54 `db_isolation: none` e demais valores sem correspondente demonstrado no schema? | **A (proposta):** decidir mapeamento explícito por classe/arquivo após tabela de fontes; até lá `source_pending`. **B:** mudar a especificação por nova decisão constitucional/ADR, registrando o critério original como não cumprido; não é uma correção técnica automática. |
| RGR-R20-0009-Q3 | Autoriza reservar seis IDs numéricos inéditos para as subtarefas corretivas de R-0007 e remapear as referências, com os IDs literais antigos preservados no sidecar e em índice de aliases? | **A (proposta):** reserva governada após lista de colisões. **B:** manter IDs antigos e não declarar gate verde. |

Uma resposta a Q1 não resolve Q2/Q3 por inferência. Mesmo com A3, o Engineer só retoma após a tabela canônica, os aliases e as decisões de semântica serem materializados e revistos. O critério zero permanece RED até validação real; nenhum `round seal` é antecipado.
