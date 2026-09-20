# TASK-0021 — Engineer 6/6, ponte de identidade e GREEN

Papel Art. 6: Engineer `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`; uma iteração 6/6, histórico 5/5 preservado,
um escritor global. Sem commit/push/PR/merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-IDENTITY-BRIDGE.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`,
`work/rounds/R-0007/reports/TASK-0021-C4-OD-V3-CHECKPOINT-5.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-8.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-9.md`,
`backend/app/src/detran-full-auth-roles.guard.spec.ts`,
`backend/app/src/detran-runtime.spec.ts`,
`backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
`backend/app/src/app.module.ts`, `backend/app/src/detran-runtime.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
`backend/database/ddl/02-auth.sql` e `20-rls-policies.sql`. Base D1/C4,
ADR-0024/0025 e papéis da matriz continuam vinculantes.

Allowlist EXATA de escrita:

- `backend/app/src/app.module.ts`
- `backend/app/src/detran-runtime.ts`
- `backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts`
- `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`

Implementar apenas a ponte contratada. O controller obtém principal
autenticado do request após guards e o passa como argumento interno do
protocolo, separado de body e headers. Serviço exige principal presente,
id igual a `RequestContext.actorId`, tenant compatível e papel canônico
secretary antes da transação; remover cast para `tenantContext` inexistente.
Não acrescentar sexto provider nem aceitar papel/ator de payload/header.
Preservar PolicyGuard secretary-only antes de atalhos e SQL de vínculo
dinâmico/tenant/unidade/instância, prioridade, Clock fail-closed.

No `DetranStynxAuthContextGuard` não local, somente para action `protocol`
de `inf:rait-case`, após o inner validar token e sessão: consultar membership
ativa e papéis diretos/de grupo do ator+tenant **verificados**, com
`Database.withRequestContext({tenantId,actorId}, fn)` envolvendo `tx`
`{role:'app', readonly:true}`. SQL parametrizado e filtros completos de
membership, usuário, grupo e papel por tenant; aplicar apenas papéis
canônicos ao mesmo principal que PolicyGuard/controller usam. Ausência,
inatividade, cross-tenant, erro/ambiguidade de DB ou principal divergente
nega, sem fallback em permissões/admin/owner/system. Verificar grants/RLS
reais com papel app; se não houver acesso, STOP, não elevar privilégio.
O teste full-auth mock exige também ausência de `withSystemContext`.
No verificador local/test, ler `DETRAN_LOCAL_ACTOR_ID` por verificação,
nunca do HTTP; produção não usa esse verificador.

Sensores congelados, PROIBIDO editar:

- Full-auth guard: `4a440e7b238afd28ca95a1b7ccf40cc63904b92bc060186924e7a0eb36f6f56d`
- Runtime local: `6d64aef92d28b289950eca0ee601f1625e01b03a1736effc5494ae56da1e085b`
- Unit contract: `718ba68eee450a1898915aaae378553af0da77883e19c77f9223683d31157603`
- Unit behavioral: `bc3684de5f9a777634c04496c7f283982302bd2ea6e9f8ec54f06a9899e2feeb`
- E2E: `fd8197987f011345397519a949a9280cec2cabcc3c902f25dc547842437d1974`
- Fixture: `b8c7b7a84dce543b6f4e7087b3713a55f513d7722f45eb040565b644b23b5a37`
- Policy: `3fdf45f47051797ecd26f82f5e2ece9d28a8fe24dcd6fe27ea7eb5429cba9179`

Execute unit full-auth, runtime e command contract, policy, C4 unit,
E2E RAIT completo no banco descartável `detran_r7_ctg1_a2` com owner URL
`postgresql://aarusso@localhost/detran_r7_ctg1_a2` e app efetivo
`role_app_backend`; typechecks app/rait-case, `pnpm verify:decorators`,
Prettier, `git diff --check`, hashes. Coleta zero, role/URL ausente, import
quebrado ou erro infra é BLOCKED, não GREEN. Se precisar path fora da
allowlist, mudar sensor, alterar DI, DDL/gerados ou produzir grant com owner,
STOP e relate. OWNER dispensou a revisão independente intermediária
repetida; Inspector observará GREEN integral no mesmo candidato antes de
TASK-0022. Delivery-review posterior permanece. Entrega: comandos/contagens,
produto alterado/hashes, identidade e RLS provadas, gaps e status honesto.
