Papel: Inspector (Art. 7).

Alterados somente:

- [tools/stack/contract.test.mjs](/Users/aarusso/.codex/worktrees/local-stack/detran/tools/stack/contract.test.mjs)
- [backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts](/Users/aarusso/.codex/worktrees/local-stack/detran/backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts)

Resultados:

- `node --check`: passou nos três testes `.mjs`.
- `pnpm format:check`: passou.
- `pnpm test:stack`: 40 verdes, 9 vermelhos.
  - 6 novos vermelhos exclusivamente por produção ausente: mock SEFAZ e `smoke.mjs`.
  - 3 antigos vermelhos por produção ainda ausente: perfil `fresh-local-stack`/health SEFAZ.
- RAIT bloqueado por URLs PostgreSQL obrigatórias ausentes; nenhuma falha de sintaxe ou harness.
- `minutes_id` agora é contado como órfão somente quando não nulo e sem ata correspondente.

Os sensores novos cobrem porta efêmera IPv4, DTOs, request IDs, `SefazAdapterError`, proxy/health/PEC/CH, evidências sem segredos e `blocked_before_adapter`. A tarefa permanece incompleta por bloqueios reais de produção ausente.