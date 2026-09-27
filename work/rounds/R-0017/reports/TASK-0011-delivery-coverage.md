Papel: Inspector  
PC: PC-8ac951eac4ff9e9d  
Tarefa: TASK-0011 iteracao 2  
Arquivos alterados: `tools/stack/contract.test.mjs`, `tools/stack/revision.test.mjs`, `backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`  
Sensores novos/corrigidos: adapter SEFAZ via `lookupDebt({})`, envelopes 400/404/405; fixture Portal auth/idempotência; ordem de preflight/CLI e limpeza de overrides; PEC com espaço/symlink; `readyz`, `tail -n`, lifecycle SEFAZ limitado; RAIT com três scratchs isolados e FKs/IDs legados. Todos os sensores offline passaram.  
Comandos e resultados:  
`node --test tools/stack/contract.test.mjs` — 13/13 PASS  
`node --test tools/stack/revision.test.mjs` — 32/32 PASS  
`DETRAN_TEST_TIER=integration ... vitest ... rait-seed-profiles.integration.spec.ts` — 5/5 PASS em PostGIS efêmero; container removido confirmado  
`pnpm --filter @detran/inf-rait-case typecheck` — PASS  
`node --check` nos JS alterados — PASS  
`prettier --check` nos três arquivos — PASS  
`pnpm format:check` — iniciado duas vezes, mas não concluiu no limite de execução; verificação direcionada passou  
`pnpm test:stack` — não executado, pois a suíte pode acionar Compose/stack persistente real  
Vermelhos de producao: nenhum  
Bloqueios e risco residual: positivo de `legacy-upgrade` não medido; o baseline `v1.1.0` não contém `19-rait-priority-enforce.sql`, portanto C-02-01 permanece pendente para esse perfil. O spec agora deriva scratchs somente da URL admin; se CI/local ainda depender de `DETRAN_SEED_SCRATCH_DATABASE_URL`, isso exigirá ajuste de invocação.