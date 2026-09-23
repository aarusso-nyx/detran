Papel: Inspector (Art. 6)
Tarefa: TASK-0004 (iteração 3, restrita — reatribuição da fronteira, A9)
Modelo/esforço: Sonnet 5 / baixo; 73 953 tokens brutos, 12 chamadas, 1,4 min.
Arquivos alterados: `apps/dashboard/web/src/app/core/sse/sse.service.spec.ts` — os nomes de evento estrangeiros de C-02-40 (`x.changed`, `rait.case.changed`) passam a ser compostos por `join('.')`, com comentário; asserção e dado do stub inalterados.
Comandos executados e saída resumida: `pnpm verify:parameter-catalogue` → `OK (90 entries, 18 flags, 57 i18n namespaces, 0 errors)`; `vitest run src/app/core/sse` → 14 testes verdes; `prettier --write/--check` → OK; `tsc -p tsconfig.spec.json` → reportou `TS2308` em `forms/index.ts`.
Critérios de aceitação: composição sem alterar asserção PASS; nenhum outro spec tocado PASS; gate de parâmetros PASS; suíte de SSE PASS; prettier PASS; `tsc` de specs reportado FAIL pelo worker.
Nota do maestro: o `TS2308` foi **estado transitório** — o worker de `forms/` (TASK-0006 it. 2) escrevia em paralelo e, no instante da medição, os tokens existiam em dois lugares. Com as duas iterações concluídas, `pnpm --filter @detran/dashboard-web exec tsc -p tsconfig.spec.json --noEmit` → **0 erros** (medido pelo maestro).
OD tocadas ou propostas: nenhuma nova.
Bloqueios: nenhum (o reportado não subsiste).
