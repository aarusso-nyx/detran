Papel: Inspector
Tarefa: TASK-0002 (iteração 3)
Arquivos criados/alterados: tools/docs/state-index/tests/gate.test.mjs (só acréscimos)
Comandos executados e saída resumida:
- prettier --write/--check tools/docs/state-index/tests → OK
- node --test (state-index + adr) → anteriores verdes; 4 negativos novos falham (não detectados pelo check.mjs atual)
Critérios de aceitação: node --test PASS (falhas esperadas relatadas); prettier PASS
Negativos novos (falham hoje):
1. C-01-05 — segunda linha idêntica em §Aliases para o mesmo stub (gate.test.mjs:444); causa check.mjs:470 `aliasRows.find(...)` só vê a primeira linha
2. C-01-05 — segunda linha com alvo divergente para o mesmo stub (gate.test.mjs:473)
3. C-01-11 — migrated, coluna 1 do alias de stub law/adr divergente (gate.test.mjs:895); causa check.mjs:682-699 só confere a coluna 4
4. C-01-11 — migrated, coluna 3 divergente (gate.test.mjs:920)
Fora do escopo / deixado: nada
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
