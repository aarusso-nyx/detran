Papel: Inspector
Tarefa: TASK-0002 (iteração 2)
Arquivos criados/alterados: tools/docs/state-index/tests/gate.test.mjs (só acréscimos)
Comandos executados e saída resumida:
- node --test (state-index + adr) → 94 testes, 86 PASS, 8 FAIL (os 8 negativos novos, AssertionError por achado ausente no check.mjs atual)
- prettier --check tools/docs/state-index/tests → OK
Critérios de aceitação: anteriores verdes PASS; negativos novos falham PASS; prettier PASS
Matriz achado → teste:
- Achado 1 (C-01-05): coluna 1 trocada; coluna 3 trocada; linha obsoleta
- Achado 2: C-01-15 (DESIGN-DECISIONS, law/adr entre crases, status divergente); C-01-16 (README); C-01-09 (id exibido LAW-ADR-0002 citando ADR-0001)
- Achado 3 (C-01-11, migrated): stub sem linha em §Aliases; linha remanescente da série entre crases
Fora do escopo / deixado: check.mjs (Engineer); tools/docs/adr/** intocado
OD tocadas ou propostas: proposta de rotulagem (id exibido → C-01-09 × C-01-15/16). Decisão do maestro (Architect): C-01-09, leitura literal de §6.5/§7.2; sem OD.
Bloqueios: nenhum

Iteração 2b (restrita, maestro): comentário de gate.test.mjs (~l. 1109-1112) passa a registrar a rotulagem C-01-09 confirmada pelo maestro, sem menção a OD-R18-101; nenhum teste/asserção/fixture muda. node --test → 94/94; prettier → OK.
