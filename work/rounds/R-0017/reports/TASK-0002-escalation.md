Papel: Inspector  
Tarefa: TASK-0002 (escalada)

Arquivos criados/alterados:
- [characterization.test.mjs](/Users/aarusso/.codex/worktrees/local-stack/detran/tools/stack/characterization.test.mjs)
- [revision.test.mjs](/Users/aarusso/.codex/worktrees/local-stack/detran/tools/stack/revision.test.mjs)

Comandos executados e saída resumida:
- `node --test tools/stack/characterization.test.mjs` — PASS, 13/13.
- `node --test tools/stack/revision.test.mjs` — 3 PASS, 10 falhas esperadas.
- `pnpm format:check` — PASS, exit 0.
- `pnpm exec prettier --write` nos dois testes — PASS.

Critérios de aceitação:
- Caracterização offline e sem runtime real — PASS.
- Revisão vermelha somente por funcionalidade pendente — PASS: C-01-05, C-01-07, C-01-08, C-01-09, C-01-10, C-01-11 e C-01-13.
- `skip`/`todo` — nenhum.
- Formatação — PASS.

Fora do escopo / deixado: nenhuma produção, contrato ou relatório foi alterado. Os testes usam estado temporário isolado; `PATH` não consegue substituir os stubs de Docker, pnpm ou psql.

OD tocadas ou propostas: nenhuma.

Bloqueios: nenhum.