Papel: Architect (transcrição)
Tarefa: TASK-0009 (iteração 2 — delivery-review-CTG-0003, 3 achados)
Arquivos criados/alterados: backend/domains/dashboard/crashes/README.md; backend/domains/integration/renaest-mirror/README.md; packages/api-clients/README.md (só `## Tests`: `- —` → `—`)
Comandos executados e saída resumida:
- grep '^- —$' nos 25 → 3 ocorrências (as apontadas); nenhuma em DDL/Routes dos demais
- prettier --write → unchanged; --check → OK
- varredura final '^- —$' → vazio
Critérios de aceitação: C-03-07 PASS nos 25; demais inalterados (PASS)
Fora do escopo / deixado: nada
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum
Nota do maestro: o status `A` observado pelo worker vem do `git add -N` (intent-to-add) do maestro para montar o diff da review.
