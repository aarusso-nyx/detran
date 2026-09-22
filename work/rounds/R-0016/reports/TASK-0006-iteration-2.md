Papel: Engineer (Art. 6)
Tarefa: TASK-0006 (iteração 2, restrita — reatribuição da fronteira, A9)
Modelo/esforço: Sonnet 5 / baixo; 88 641 tokens brutos, 28 chamadas, 2,1 min.
Arquivos alterados: `forms/form-gate.ts`, `forms/finalidade-n2.schema.ts`, `forms/exportar.schema.ts`.
Comandos executados e saída resumida: `vitest run src/app/forms` → 10 arquivos, 58 testes verdes; `vitest run src/app/app.scaffold.spec.ts` → 8 testes verdes (C-02-80…83); `eslint src/app/forms` → 0; `tsc -p tsconfig.app.json --noEmit` → 0; `prettier --write/--check` → OK.
Critérios de aceitação: `exportar` não importa `finalidade-n2` PASS; `finalidade-n2` importa de `./form-gate` e reexporta PASS; tokens em `form-gate.ts` na ordem de `shared/models.ts` PASS; comentário de proveniência PASS; nove schemas folha PASS; specs e arquivos fora de `forms/` intocados PASS; gates PASS.
Fora do escopo / deixado: `forms/index.ts` não tocado; o `export *` duplo reexporta os mesmos símbolos de `form-gate` por duas vias — `tsc` não acusa (é a mesma declaração), conferido pelo maestro em `tsc -p tsconfig.spec.json` → 0.
OD tocadas ou propostas: nenhuma nova.
Bloqueios: nenhum.
