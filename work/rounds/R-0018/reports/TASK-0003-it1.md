Papel: Engineer
Tarefa: TASK-0003 (iteração 1)
Arquivos criados/alterados: tools/docs/state-index/check.mjs (splitRow: `\|` dentro de célula não separa colunas e vira `|` literal)
Comandos executados e saída resumida:
- prettier --write check.mjs; prettier --check tools/docs/state-index → OK
- pnpm test:state-index → 86/86 pass (inclui C-01-36 + e −)
- pnpm verify:state-index → `verify:state-index OK: 39 ADRs, 3 redirecionamentos, 33 rodadas, 14 closures`, exit 0
Critérios de aceitação: test:state-index PASS; C-01-15 de DESIGN-DECISIONS.md:15 desaparece PASS; prettier PASS
Fora do escopo / deixado: nenhum
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
