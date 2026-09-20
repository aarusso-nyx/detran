# TASK-0003 — primeira tentativa

Papel: Inspector. Foram alterados `backend/domains/shared/src/policy.spec.ts`, `backend/domains/est/crash/tests/unit/boat-contract.unit.spec.ts` e `backend/app/tests/e2e/policy-routes.e2e.spec.ts`.

`pnpm --filter @detran/shared test` executou e falhou nos grants `est:*` ainda não implementados. `pnpm --filter @detran/est-crash test:unit` executou e falhou nas ações de comando ainda ausentes. `apply.sh --full` e duas execuções de `seed.sh` passaram em `detran_r10`; porém não havia fixture BOAT para o script aplicar. Prettier dos arquivos tocados passou.

Triagem: `reference-gap` na lista fechada de leitura do prompt. Faltavam blueprint, DDL 19/70 e `seed.sh` para construir `70-fixtures-est-crash.sql`. Faltou cobertura substantiva de C-1-nn. `Portal (titular)` não foi traduzido para um papel canônico. Reenvio com fontes explícitas; nenhum teste foi relaxado.
