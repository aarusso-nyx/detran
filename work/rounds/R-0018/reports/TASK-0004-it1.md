Papel: Architect (transcrição)
Tarefa: TASK-0004 (iteração 1)
Arquivos criados/alterados:
- docs/meta/adr/ADR-0035-adr-numbering-policy.md (item 3, trecho da ilustração conforme A3)
- docs/meta/adr/ADR-0006-detran-ui-kit.md (1 linha após l. 6, conforme A4/§9)
Comandos executados e saída resumida:
- prettier --write/--check nos dois arquivos → OK
- pnpm docs:kb:check → OK (773 artifacts, 446 canonical tokens)
- grep -c 'Angular and STYNX pins superseded by' ADR-0006 → 1
- git diff --stat ADR-0006 → 1 insertion, 0 deletions
- pnpm docs:check → OK (build Docusaurus sem erro de link)
- pnpm verify:state-index → 1 achado C-01-15 DESIGN-DECISIONS.md:15 (dono: TASK-0003 iteração 1)
Critérios de aceitação: docs:kb:check PASS; grep = 1 PASS; diff 1/0 PASS; docs:check PASS; prettier PASS; verify:state-index relatado.
Citações sem slug revisadas: nenhuma (fora do escopo)
Fora do escopo / deixado: C-01-15 (TASK-0003 iteração 1)
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
