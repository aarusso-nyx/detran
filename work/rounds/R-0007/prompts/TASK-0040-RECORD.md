# TASK-0040 — registro normalizado do sensor Inspector fresh/legacy

Este arquivo documenta após despacho direto as instruções executadas; **não
é o byte stream original**. Papel Inspector Art. 6, Terra/High, worktree
`orchestra/rait-backend`, um escritor. Ler AGENTS.md, manual Inspector,
ADR-0024, C4-OD, checkpoint TASK-0038 e os arquivos seed/runner aprovados.

Allowlist exclusiva:
`backend/domains/inf/rait-case/tests/integration/rait-case-runtime.integration.spec.ts`
e novo
`backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`.
Remover o falso sensor fresh que executa só o primeiro INSERT; preservar os
dois casos runtime. Novo sensor deve executar apply.sh/seed.sh integrais em
scratch explicitamente autorizado, criado somente se ausente e removido
somente se criado pelo próprio teste. Exigir URLs admin/scratch explícitas,
trigger DDL19 ativo, 1 case/1 assessment revision=1 none/0 bases,
assessed_at=protocolled_at, 20 legados ausentes, fresh padrão e explícito
idempotentes, legacy-upgrade recusado antes de escrever sem baseline.
Zero testes, falta de URL ou erro de infra não são PASS.

Resultado: teste focado coletou 1/1 PASS com --passWithNoTests=false,
typecheck/Prettier/git diff --check PASS e scratch removido. Correção pontual
posterior passou a exercitar realmente o default sem SEED_PROFILE herdado.
Sensor final SHA-256
`8c6b746b0075ac101dbcf9fc6c53d35f90b45265a0d6d0063257725c6b05c8a3`.
Revisão independente posterior PASS. Sem commit/push/merge.
