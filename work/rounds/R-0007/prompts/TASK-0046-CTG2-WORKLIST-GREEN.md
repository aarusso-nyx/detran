# TASK-0046 — runtime corretivo dos seis comandos de worklist

Papel Art. 6: Engineer. Modelo `gpt-5.6-terra`/high; até duas iterações
próprias, sem reiniciar TASK-0007 (1/2). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Leia integralmente
`docs/meta/agents/engineer-backend.md` antes de agir.

Dependência: TASK-0045 2/2 e reparo TASK-0051 1/1, com RED executável
congelado. E2E de rota permanece RED até TASK-0008. Leitura fechada:
`AGENTS.md`, `CODESTYLE.md`, `work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`,
`work/rounds/R-0007/reports/CTG-0002-CORRECTIVE-PLAN.md`,
todos os novos sensores TASK-0045, `backend/domains/shared/src/policy.ts`,
`backend/domains/inf/rait-worklist/src/handwritten/**`,
`backend/domains/inf/rait-worklist/package.json`.

Pode editar somente
`backend/domains/inf/rait-worklist/src/handwritten/**` e
`backend/domains/shared/src/policy.ts`. Proibidos testes, blueprints,
gerados, módulos/índices gerados, package/lockfile, plano/tarefas/budget,
Git, `record/**`, `.devai/**` e irmãos. Nenhum novo route hook: TASK-0008
é dono da geração. As quatro criações de rota ainda colidem com CRUD gerado;
implemente controllers/serviço manuscritos sem declarar HTTP GREEN até
TASK-0008 desativar as rotas CRUD conflitantes e ligar hooks.

Satisfaça os seis comandos e sensores congelados com implementação real:
RequestContext, tenant RLS, vínculo/escopo, transação, versionamento/ETag,
idempotência, outbox/auditoria e rollback. Alinhe `@Resource/@Action/@Audit`
às chaves nominais, não à política antiga genérica. Prove o mesmo candidato
com worklist unit/integration, shared policy, typechecks, decorators,
Prettier e hashes idênticos dos sensores. Use URLs explícitas e role_app_backend
no caminho da aplicação. Sem mocks/test-only branch na produção. Se a
allowlist ou schema impedir uma guarda real, pare e reporte o bloqueio
estrutural; não forje GREEN. Entrega com comandos, contagens, gaps e hashes.
