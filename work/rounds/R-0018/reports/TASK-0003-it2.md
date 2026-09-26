Papel: Engineer
Tarefa: TASK-0003 (iteração 2)
Arquivos criados/alterados: tools/docs/state-index/check.mjs
Comandos executados e saída resumida:
- node --test (state-index + adr) → 94/94
- pnpm test:state-index → 94/94
- pnpm verify:state-index → `verify:state-index OK: 39 ADRs, 3 redirecionamentos, 33 rodadas, 14 closures`
- prettier --write/--check tools/docs/state-index → OK
Critérios de aceitação: test:state-index PASS; verify:state-index PASS; prettier PASS
Mudanças:
1. C-01-05: §Aliases valida colunas 1 e 3 (além de 2/4) e acusa linha que não corresponde a stub válido (docs/meta/adr ou law/adr em modo migrated).
2. Série law/adr: `extractCitation` reconhece link ou caminho entre crases em checkIndexRows (C-01-09/10) e checkStatusColumn (C-01-15/16); `lawAdrRowsElsewhere` recolhe linhas da série fora da tabela oficial sem duplicar achados.
3. C-01-11 (migrated): exige linha do stub law/adr em §Aliases (col. 2 stub, col. 4 alvo); linha remanescente da série reconhecida também entre crases.
Id exibido divergente em linha law/adr classificado como C-01-09 (nota vinculante do maestro).
Fora do escopo / deixado: nada
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
