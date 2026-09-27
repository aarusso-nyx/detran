Papel: Inspector  
Tarefa: TASK-0002 (correção delivery-review)  
Arquivos criados/alterados: `tools/stack/characterization.test.mjs`, `tools/stack/revision.test.mjs`  
Comandos executados e saída resumida:  
`node --test tools/stack/characterization.test.mjs` — PASS, 13/13 offline  
`node --test tools/stack/revision.test.mjs` — 15 PASS, 14 FAIL esperados, sem skip/todo; falhas correspondem às violações de override, validação/isolamento, `--no-mock`, limpeza e logs Compose  
`pnpm format:check` — PASS  
Critérios de aceitação: caracterização PASS; revisão com vermelhos novos esperados PASS; formato PASS  
Fora do escopo / deixado: produção e demais arquivos não alterados; nenhum Docker, Postgres, `db-reset` ou `apply.sh --full` real executado  
OD tocadas ou propostas: nenhuma  
Bloqueios: nenhum