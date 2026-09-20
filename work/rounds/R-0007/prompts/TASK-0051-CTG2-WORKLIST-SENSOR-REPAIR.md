# TASK-0051 — reparo estrito de sensor CTG-0002 worklist

Papel Art. 6: Inspector. Modelo `gpt-5.6-terra`/high. Uma iteração nova,
sem reiniciar TASK-0045 2/2. Leia `docs/meta/agents/inspector-tests.md`
integralmente. Worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Leitura fechada: `AGENTS.md`, `CODESTYLE.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`,
`work/rounds/R-0007/reports/CTG-0002-CORRECTIVE-PLAN.md`,
`backend/domains/inf/rait-worklist/tests/unit/rait-worklist-corrective.spec.ts`,
`backend/domains/inf/rait-worklist/tests/integration/rait-worklist-corrective.integration.spec.ts`,
`backend/app/tests/e2e/rait-worklist-corrective.e2e.spec.ts`.

Pode editar apenas os dois arquivos `rait-worklist-corrective` unit/integration
acima. Proibidos E2E, política, runtime, blueprints, gerados, plano/tarefas,
Git, DB reset, `record/**`, `.devai/**` e irmãos.

Repare exatamente dois defeitos:

1. Após a negação SQL esperada, a transação está abortada. Use
   SAVEPOINT/ROLLBACK TO SAVEPOINT (ou transações distintas com snapshot
   confiável) para comparar outbox/audit antes/depois sem esconder a negação.
   Preserve role_app_backend, tenant sem contexto e nenhum efeito de sucesso.
2. `create-schedule` e `approve-batch` não têm tipo de evento nominal no
   contrato/matriz (`—`). Não exija tipo inventado; preserve envelope,
   atomicidade e os tipos contratados nos outros quatro comandos.

Não altere outros critérios. Rode Prettier/typecheck, unit e integração
focados com URLs owner/app explícitas e `--passWithNoTests=false`. Sem URLs é
BLOCKED; RED de produto não é defeito de sensor. Entregue hashes e contagens.
