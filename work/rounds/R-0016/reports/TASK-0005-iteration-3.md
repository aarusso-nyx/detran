Papel: Engineer (Art. 6)
Tarefa: TASK-0005 (iteração 3, restrita — reatribuição da fronteira, A9)
Modelo/esforço: Sonnet 5 / baixo; 70 037 tokens brutos, 14 chamadas, 1,2 min.
Arquivos alterados: `apps/dashboard/web/src/app/core/layer-table.ts` (linha 4, comentário), `apps/dashboard/web/src/app/shared/export-dialog.component.ts` (linha 155, JSDoc).
Comandos executados e saída resumida: `vitest run src/app/core/layer-table.spec.ts src/app/i18n/i18n.spec.ts` → 2 arquivos, 126 testes verdes; `tsc -p tsconfig.app.json --noEmit` → 0; `eslint src/app` → 0; `prettier --write/--check` → OK; `grep` dos dois literais → 0 ocorrências.
Critérios de aceitação: C-02-24 PASS; C-02-75 PASS; tsc PASS; eslint PASS; prettier PASS.
Fora do escopo / deixado: nada além dos dois comentários; `forms/` e specs intocados.
OD tocadas ou propostas: nenhuma decisão nova (OD-D16-006 e OD-D09 apenas reescritas em prosa).
Bloqueios: nenhum.
