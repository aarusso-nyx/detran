Papel: Inspector
Tarefa: TASK-0002 (iteração 1)
Arquivos criados/alterados: tools/docs/state-index/tests/gate.test.mjs (dois testes C-01-36 acrescentados ao final; nenhum teste existente alterado)
Comandos executados e saída resumida:
- prettier --write/--check tools/docs/state-index/tests → OK
- node --test (state-index + adr) → 86 testes, 85 pass, 1 fail (o (+) de C-01-36, esperado contra check.mjs sem desescape: `C-01-15 DESIGN-DECISIONS.md:7 status "b`"…`, `C-01-16 docs/meta/adr/README.md:8 …`)
- grep -c 'C-01-36' gate.test.mjs → 3
Critérios de aceitação: node --test (anteriores verdes, (+) falha) PASS; grep ≥ 1 PASS; prettier PASS
Matriz critério → teste:
- C-01-36 (+) → gate.test.mjs: "dado … `a\|b` (escapado) … então lê as quatro colunas corretas e a fixture íntegra continua sem achados"
- C-01-36 (−) → gate.test.mjs: "dado a mesma linha com `a|b` cru … então desloca as colunas e acusa C-01-15"
Fora do escopo / deixado: segundo negativo para docs/meta/adr/README.md (C-01-16) não escrito (iteração restrita).
OD tocadas ou propostas: proposta de esclarecimento sobre "C-01-07/08" × C-01-16 — resolvida pelo maestro como Esclarecimento A2.1 no contrato (sem OD).
Bloqueios: nenhum
