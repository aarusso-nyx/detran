# TASK-0003 — tentativa 1

Papel: Inspector. Foram criados `backend/database/seed/70-fixtures-est-crash.sql` e `backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts`, além dos testes de política, unidade e rota da tentativa anterior.

`apply.sh --full` passou; `seed.sh` aplicou a fixture BOAT duas vezes sem erro; `test:integration` executou 1 spec e 4 testes verdes. O maestro repetiu `@detran/shared test`: 185 PASS e 1 FAIL esperado por grants `est:*` ausentes; `@detran/est-crash test:unit`: 1 FAIL esperado pelo grant de `CIDADAO` ainda ausente; integração: 4 PASS.

Triagem `sensor-error`: os testes de integração só contam tabelas, RLS habilitado, constraints e fixtures. Faltam provas comportamentais de checks, derivação, rejeição por tenant, duplicidade e transições; a fixture não contém retificação em `crash_renaest_submission`. Escalada ao Inspector Terra, mantendo todos os testes existentes.
