Papel: Engineer
Tarefa: TASK-0003 (iteração 3, escalada a Opus 5.5)
Arquivos criados/alterados: tools/docs/state-index/check.mjs (só a validação de §Aliases)
Mudança: `checkAliasRowsForStub(stubRelPath, targetRelPath, findingId)` recolhe todas as linhas de §Aliases cuja coluna 2 cita o stub; 0 → "sem linha"; >1 → duplicata (na 2ª ocorrência); em cada linha col. 1 = id do stub (ADR-nnnn/LAW-ADR-nnnn), col. 3 = id do alvo, col. 4 cita o alvo. Stubs de docs/meta/adr → C-01-05; stubs de law/adr em migrated → C-01-11 (substitui o `aliasRows.find` que só conferia a col. 4). A checagem de linha sem stub válido (C-01-05) já percorria todas as linhas.
Comandos executados e saída resumida:
- pnpm test:state-index → 98/98 (inclui os 4 da iteração 3)
- pnpm verify:state-index → `verify:state-index OK: 39 ADRs, 3 redirecionamentos, 33 rodadas, 14 closures`
- prettier --check tools/docs/state-index → OK
Critérios de aceitação: todos PASS
Fora do escopo / deixado: modos pending/distinct não exigem alias (contrato §7.2)
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
