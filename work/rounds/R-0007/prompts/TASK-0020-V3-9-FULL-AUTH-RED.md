# TASK-0020 — Inspector 9/10, RED full-auth e principal do protocolo

Papel Art. 6: Inspector `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`; um escritor global. Iteração 9 do teto OWNER 10,
sem zerar as oito anteriores. Sem commit/push/PR/merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-IDENTITY-BRIDGE.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-8.md`,
`work/rounds/R-0007/reports/TASK-0021-C4-OD-V3-CHECKPOINT-5.md`,
`backend/app/src/app.module.ts`,
`backend/app/src/detran-policy-error.guard.spec.ts`,
`backend/app/src/detran-runtime.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
`backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`,
`backend/database/ddl/02-auth.sql` e `20-rls-policies.sql`.

Allowlist EXATA de escrita:

- `backend/app/src/detran-full-auth-roles.guard.spec.ts` (novo)
- `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`

Objetivo: escrever sensores funcionais RED para o contrato de identidade.
No wrapper `DetranStynxAuthContextGuard`, simule `inner.canActivate` já
validando token/sessão e `request.principal.roles=[]`. Prove que rota
`inf:rait-case:protocol` recebe somente papéis canônicos atuais de membership
ativa do ator e tenant verificados: direto e por grupo; negue membership
inativa/revogada, cross-tenant, permission-only/wildcard/ADMIN sem secretary,
principal ausente/discordante e erro de DB; nenhum fallback permissivo.
Capturar SQL/opções para exigir consulta parametrizada, tenant+ator
verificados, `role_app_backend` read-only e filtros ativos/tenant; não
afirmar prova de RLS real a partir de mock. Testar que controller/serviço
exigem principal autenticado separado do payload e ID igual ao
`RequestContext.actorId`, sem sexta dependência no construtor; preservar
os demais cenários do unit spec. Se a API atual não permitir sensor
funcional sem import quebrado, STOP e relate; não editar produto.

Executar unit specs direcionados com coleta positiva, demonstrando RED
específico (não zero testes/import quebrado), typecheck quando aplicável,
Prettier e `git diff --check`. Preservar hashes congelados da iteração 8
exceto o unit spec autorizado; registrar novos SHA. Não editar runtime,
guard, controller, serviço, fixture, E2E, policy, DDL, gerados, record,
`.devai` ou sibling. A revisão intermediária repetida foi dispensada pelo
OWNER, mas não o GREEN observado depois do Engineer nem delivery-review
pós-TASK-0022. Pare ao fim desta iteração.
