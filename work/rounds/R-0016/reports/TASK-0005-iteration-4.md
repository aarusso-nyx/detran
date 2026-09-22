Papel: Engineer (Art. 6)
Tarefa: TASK-0005 (iteração 4, restrita — formatação)
Modelo/esforço: Sonnet 5 / baixo; 68 537 brutos, 11 chamadas, 1,6 min.
Arquivos alterados: `features/reports/pages/relatorios.page.ts` (única mudança: quebra do import de `@angular/core`).
Comandos: `prettier --check` antes → 3 avarias; `--write` na página → 1 arquivo; `--check` depois → OK; `tsc -p tsconfig.app.json` → 0; `vitest run src/app/features/reports` → 14 verdes; `eslint` → 0.
Critérios: todos PASS.
Bloqueios: nenhum.
