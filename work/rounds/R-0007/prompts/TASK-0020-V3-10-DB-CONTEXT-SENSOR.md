# TASK-0020 — Inspector 10/11, correção técnica do mock DB full-auth

Papel Art. 6: Inspector Terra/High. OWNER autorizou o ciclo de identidade;
histórico 9/10 preservado, sem reset. Worktree `orchestra/rait-backend`,
um escritor. Escopo EXATO de escrita:

- `backend/app/src/detran-full-auth-roles.guard.spec.ts`

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-IDENTITY-BRIDGE.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-9.md`,
`backend/app/node_modules/@stynx-nyx/data/dist/data/src/database.d.ts`
e `.js` (somente `tx`, `withRequestContext`, `resolveExecutionContext`),
`backend/app/src/app.module.ts` e o sensor permitido.

Corrija apenas o mock: `Database.tx` com role app requer RequestContext
ativo; a API publicada `Database.withRequestContext({tenantId,actorId}, fn)`
estabelece o escopo antes da transação. O sensor deve modelar e exigir que
o guard faça a leitura read-only sob esse contexto derivado **somente** do
principal+tenant já verificados, antes de `tx`; assertar tenant/actor exatos,
`role:'app'`, `readonly:true`, filtros SQL e negações existentes. Não
afrouxar as 12 expectativas, não aceitar owner context, não permitir
fallback quando `withRequestContext`/DB falhar. Manter RED funcional de
produto com coleta positiva e sem import quebrado. Não editar serviço,
runtime, guard, outros sensores ou produto. Prettier/typecheck e SHA final;
sem commit/push/PR/merge. Parar em 10/11; Inspector 11/11 fica reservado
para observar GREEN após Engineer.
