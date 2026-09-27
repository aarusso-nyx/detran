# TASK-0006 — adenda de verificacao do maestro (2026-09-27)

O bloqueio do primeiro relato foi resolvido sem enfraquecer o spec. O binario
Vitest existe no workspace `@detran/inf-rait-case`; a primeira tentativa
corrigida revelou que o scratch exigia os dois roles operacionais globais.
Com esses roles em PostGIS descartavel, o spec chegou ao segundo seed e
revelou um `ON CONFLICT DO UPDATE` na ata RAIT imutavel. A fixture passou
a usar `DO NOTHING` somente para essa ata. O mesmo seed foi reaplicado no
scratch com exit 0.

- `DETRAN_TEST_TIER=integration DETRAN_SEED_ADMIN_DATABASE_URL=.../postgres DETRAN_SEED_SCRATCH_DATABASE_URL=.../detran_r7_ctg1_a2_seed_profiles pnpm --filter @detran/inf-rait-case exec vitest run --config vitest.config.ts tests/integration/rait-seed-profiles.integration.spec.ts`: 3/3 PASS em 6,71 s.
- A fixture local tem duas linhas de jeton, membros `...61010001/2`, sessao `...63000001` e ata `...64000001`; o spec confirmou `jetonLines > 0`, zero FKs orfas e zero referencias aos seis IDs legados, com snapshot igual apos segunda aplicacao.
- Container descartavel `detran-r17-task0006-verify` parado/removido (`--rm`); scratch criado e removido pelo spec. Nenhum processo de teste ficou ativo.
- SHA-256 dos arquivos no fim da medicao: `40-fixtures-rait-org-fresh-local-stack.sql` = `c465743e86ccdd3eca39b15f4a1a370f66af557f82bde3bf2967fb7128e63f4f`; `60-fixtures-rait-integration-fresh-local-stack.sql` = `e4aa2bc97a461eb5e0e5cb8c9bb3496f2d5afb48e454aa1126ab1e7db9507fe6`. O host:port da conexao scratch foi abreviado no relato original e nao e verificavel de forma independente nesta adenda; a ratificacao deve declarar essa limitacao.

Resultado provisorio C-02-01: a prova scratch passou 3/3, mas a correcao
manual da ata ainda depende de ratificacao independente do Engineer sob
novo PC. O primeiro relato fica como historico da tentativa; esta adenda
nao encerra a tarefa.
