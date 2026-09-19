# CTG-0001 C4 — ponte de identidade/contexto do protocolo RAIT

Papel Art. 6: **Architect**. Contrato corretivo delimitado, autorizado pelo OWNER
em 2026-09-17. Complementa `CTG-0001-C4-OD.md` §§4–5, ADR-0024/0025 e o
checkpoint `TASK-0021-C4-OD-V3-CHECKPOINT-5.md`; não altera política de produto,
sensores congelados, SQL de prioridade ou contadores históricos. Estado atual:
TASK-0021 5/5 em checkpoint, E2E 83/98 PASS e 15 RED; não há GREEN.

## Invariantes de implementação

1. `RequestContext` STYNX 1.3.1 contém `tenantId` e `actorId`, **não papéis**.
   Remover o cast para `requestContext.tenantContext`. O controller de protocolo
   recebe o principal autenticado do request já processado pelos guards (API
   publicada `getPrincipalFromRequest` ou `request.principal`) e passa ao serviço
   um argumento **interno, separado** de `payload`, `headers` e `input.context`.
   Não criar sexto provider no construtor de `RaitCaseCommandService`. Antes de
   qualquer escrita, o serviço exige contexto ativo, tenant/ator presentes,
   principal presente, `principal.id === RequestContext.actorId`, papel canônico
   `rait-secretary` no principal e tenant compatível; ausência ou divergência
   falha fechada. Não inferir papel de permission, payload, header ou ambiente.
2. Preservar o `PolicyGuard` exigindo `rait-secretary` **antes** de wildcard,
   permission específica ou atalho ADMIN. União com secretary é permitida; só
   permission/ADMIN não é. Preservar a consulta SQL dinâmica de membro `ATIVO`
   de `secretaria`, mesma pessoa/tenant, pool ativo, instância e unidade exata
   (`IS NOT DISTINCT FROM`); 403 `RAIT.FORBIDDEN_ACTION` para papel negado e
   403 `RAIT.FORBIDDEN_CASE_SCOPE` para vínculo negado. Nunca usar GUC de ator
   como prova independente de autenticação, owner/system context ou BYPASSRLS.
3. No perfil não local, `StynxAuthGuard` entrega `principal.roles=[]`; o JWT de
   sessão verificado não transporta papéis. Depois de autenticar token **e sessão**
   e antes do `DetranPolicyErrorGuard`, o wrapper de autenticação do app resolve,
   apenas para `inf:rait-case:protocol`, os papéis canônicos atuais do ator e
   tenant verificados. Fonte: membership ativa em `auth.memberships`, papéis
   diretos (`membership_roles`/`roles`) e papéis de grupo
   (`group_memberships`/`group_roles`/`roles`), limitados ao tenant e sem
   membership inativa/cross-tenant. Usar leitura parametrizada, read-only,
   `role_app_backend` com tenant/RLS; nunca credencial owner, claims Cognito
   antigos, permissions cache ou ID de header/payload como fonte de papéis.
   Aplicar o resultado ao principal autenticado que `PolicyGuard` e controller
   consomem. Erro de banco, resultado ambíguo ou identidade divergente = deny,
   sem fallback permissivo. Confirmar em ensaio que grants e RLS permitem essa
   leitura no papel app; ausência de acesso bloqueia, não autoriza elevação.
4. Só em `local-sandbox`/`test`, o verificador local lê
   `DETRAN_LOCAL_ACTOR_ID` **dentro** de `verifyAuthorizationHeader`, por request,
   em vez de fixá-lo no import. Isso corrige o snapshot E2E, mas não é mecanismo
   de identidade de produção. Testes que mutam env de processo rodam serializados.
   Datas 15–16/09 das escalas E2E não demonstram disponibilidade em 17/09:
   Inspector ajusta fixture temporal controlada, mantendo negativos off-duty.

## Allowlist proposta, separada por autoridade

- Architect neste ciclo: **somente este contrato**.
- Inspector RED/fixture: `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
  `backend/app/tests/shared/rait-case-command.fixture.ts`,
  `backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts`,
  `backend/domains/shared/src/policy.guard.spec.ts`; se necessário teste novo
  nominal de resolução no app, declarar path exato antes do dispatch.
- Engineer GREEN: `backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts`,
  `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
  `backend/app/src/app.module.ts`, `backend/app/src/detran-runtime.ts`;
  helper novo para resolução de papéis exige nome e allowlist aprovados antes
  da escrita. Não editar vendor, `policy.ts`, DDL, BP/gerados, seed, `.devai/`,
  `record/` ou sibling. Esta lista é proposta para os prompts de execução,
  **não** autorização implícita para outro papel tocar arquivos.

## Sensores e sequência

Inspector RED primeiro: HTTP real e unidade devem discriminar secretary positivo,
direto/grupo no perfil não local, revogação/inatividade, outro tenant, ADMIN e
permission-only (inclusive `*`), sem autenticação, erro de DB, principal/contexto
discordantes, payload/header spoofed e ausência de efeitos persistentes em todos
os negativos. Provar ator local por request e escalas positiva/off-duty no dia
do Clock. Engineer GREEN depois, sem alterar sensores; Inspector observa testes
coletados e GREEN integral no **mesmo candidato** com hashes congelados, app DB
`role_app_backend`, typechecks e gates C4. Só então TASK-0022 torna-se elegível.
Por decisão OWNER, não repetir review independente intermediário; permanece o
delivery-review independente após TASK-0022.

STOP se faltar identidade/tenant verificados, principal sem papéis não locais,
acesso RLS/grant, banco dedicado ou caso de teste coletado; se qualquer RED
persistir; se surgir path fora da allowlist, sexto provider, privilégio elevado
ou mudança de política/SQL; ou se o perfil de produção não provar papéis atuais.
Infra ausente/zero testes é BLOCKED, nunca PASS/RED contratual. Sem DB, commit,
push, PR ou merge neste documento Architect.
