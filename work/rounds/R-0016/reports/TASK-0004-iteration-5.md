Papel: Inspector (Art. 6)
Tarefa: TASK-0004 (iteração 5, restrita — formatação)
Modelo/esforço: Sonnet 5 / baixo; 72 735 brutos, 13 chamadas, 1,3 min.
Arquivos alterados: `features/reports/pages/{exportacoes,relatorios}.page.spec.ts` (só quebra de linha e vírgula final; diff conferido linha a linha).
Comandos: `prettier --write/--check` → OK; `vitest run src/app/features/reports` → 2 arquivos, 14 testes verdes; `tsc -p tsconfig.spec.json` → 0.
Critérios: todos PASS.
Bloqueios: nenhum.
