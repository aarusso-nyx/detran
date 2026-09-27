Papel: Architect (transcrição)
Tarefa: TASK-0009 (iteração 1 — escape de `*`/`_` literais, preâmbulo do contrato CTG-0003)
Arquivos criados/alterados: backend/domains/dashboard/monitor/README.md; backend/domains/integration/renaest-mirror/README.md (só `## Purpose`)
Comandos executados e saída resumida:
- Purpose reescrito com module.description literal, `*` → `\*`, `_` → `\_`
- prettier --write → unchanged; --check → OK (também nos 26 da fronteira)
- comparação literal (desfeitos só os escapes) contra o blueprint → MATCH nos dois
- nenhum `*`/`_` sem escape no parágrafo
Critérios de aceitação: C-03-05 PASS nos 26; demais inalterados (PASS)
Fora do escopo / deixado: nada
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
