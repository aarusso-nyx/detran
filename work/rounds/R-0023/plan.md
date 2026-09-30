# R-0023 — frente `authz-unification` (C-0002, ação 7d: autorização com fonte única no STYNX)

**Status:** **O1 concluída sob autorização do Owner de 2026-09-30** (`AUTHORIZATION.md`); O2–O5 aguardam nova sessão após o checkpoint. Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase C) e da inspeção (d)
(`work/campaigns/C-0002-inspecao-2026-09-25/d-stynx.md` §4.2–§4.3, lacuna A3, M3, candidatos U6/U7). Nenhum
`AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: nascem no bootstrap, depois da
autorização. Maestro **Sol 6** (Codex); workers da escada Codex (Sol 6 grande; Terra e Luna
vigentes no médio e pequeno — ids confirmados com `codex --help` no bootstrap); reviewer **Opus 5.5
nível grande** pela ponte (`tools/orchestra/bridge.sh claude <id-opus-5.5> …`, id confirmado com
`claude --help`). Frente de **segurança**: reviewer grande em toda delivery-review, **sem waiver**.
Worktree `/Volumes/Thiamat II/stech/detran-worktrees/authz-unification`, branch
`orchestra/authz-unification`.
**Concorrência:** a rodada inteira pode abrir **empilhada** em `origin/orchestra/stynx-sse-tenancy`
(R-0022: pin `@stynx-nyx/*` = 1.5.0, SSE e tenancy canônicos); cada CTG começa quando a onda de
R-0022 de que depende existir no branch publicado, e o PR final espera o merge de **R-0022**
(OD-C2-005, que subsume a adenda A-C2-11 em §Adendas; §Execução OD-C2-005). Upstream externo: **STYNX 1.5.0** com os itens
de autorização e sessão da especificação `work/campaigns/C-0002-stynx-upstream-spec.md` (S-1.5;
§5: `UPS-AUTHZ-01…06` MUST, `UPS-AUTHZ-07` e `UPS-SES-01…03` SHOULD; regra de consumo em §7). R-0024 (`orchestra/stynx-dedup`)
corre em paralelo **só** nos CTGs de frontend (locks disjuntos: esta rodada não toca `apps/` nem
`packages/ui`); o CTG de backend de R-0024 começa após o CTG-0003 e o CTG-0004 desta rodada
existirem no branch publicado (empilhar); o PR final dela espera o merge desta. Lock partilhado com a fase D:
`MOD-shared-policy` (R-0025 e R-0027 acrescentam chaves) — nenhuma rodada da fase D abre antes de
R-0024, então não há disputa em C-0002.
**Janelas previstas:** 2 (campanha §3); recalibradas em §Execução OD-C2-005. 1: bootstrap + CTG-0001 + CTG-0002;
2: CTG-0003 + CTG-0004 (condicional) + CTG-0005 + fechamento.

## Execução OD-C2-005 (Owner, 2026-09-27)

Esta seção **prevalece sobre qualquer menção a um PR/merge/evidência/delivery-review por CTG neste
plano** (C-0002 §12). A rodada corre na branch única `orchestra/authz-unification`, com um commit por
tarefa ou por CTG. Entre CTGs não há PR, CI remoto, `devai evidence record`, `audit observe`,
`pnpm check` completo nem delivery-review. Os critérios de aceitação não mudam; muda só o momento:

- os `acceptance_commands` de cada tarefa rodam ao fim da tarefa. Entre eles, `pnpm verify:authz-matrix`
  com diff vazio em TASK-0005, TASK-0007 e TASK-0008;
- os critérios formulados "por CTG", "no fim de cada CTG" ou "no sha de cada merge" rodam **uma vez**,
  na sequência final;
- o `<sha-merge-CTG-0001>` do critério da matriz passa a ser o sha do **commit** do CTG-0001 na branch
  ou, se houver, o da última regeneração atribuída a R-0022 (ver abaixo), registrado em §Concorrência
  e em `evidence-R-0023.json`.

**Ondas.** O DAG desta rodada é **linear**: cada tarefa depende da anterior, e as de código partilham
`MOD-app-module`/`MOD-shared-policy`. Não há paralelismo interno sem violar dependência. O ganho vem
de três fontes: a ausência de ciclos intermediários, o empilhamento sobre R-0022 e os CTGs de
frontend de R-0024 correndo ao lado. Push sem PR ao fim de cada onda, porque R-0024 empilha sobre
este branch.

| Onda | CTGs / tarefas                              | Fronteiras de escrita                                                                                                                                                                                                                  | Depende de                                                                                                                                     |
| ---- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| O1   | CTG-0001: TASK-0001 → TASK-0002             | `work/rounds/R-0023/contracts/`, `open-decisions-rait.md` §C-0002; depois `tools/authz/`, `docs/framework/arch/fixtures/authz-route-role-matrix.json`, `backend/app/tests/e2e/authz-route-matrix.e2e.spec.ts`, `package.json` (script) | bootstrap e prompt-review única com `PASS`; base: branch publicado de R-0022 (qualquer onda) ou `main` com R-0021                              |
| O2   | CTG-0002: TASK-0003 → TASK-0004 → TASK-0005 | `contracts/CTG-0002.md`, `contracts/CTG-0003.md`, rascunho da ADR; `policy-provider.parity.spec.ts`; `backend/domains/shared/src/policy/`                                                                                              | O1 **commitada** (matriz antes de qualquer troca); O3 de R-0022 (pin 1.5.0 RC ou final, com `UPS-AUTHZ-01…06` nos `.d.ts`) no branch publicado |
| O3   | CTG-0003: TASK-0006 → TASK-0007             | specs a migrar (lista de TASK-0006); `app.module.ts`, guardas de autorização, filtros SSE (`teat-stream.service.ts`, `dashboard-stream.service.ts`)                                                                                    | O2; O5 e O6 de R-0022 no branch publicado (R-0022 reescreve `app.module.ts` e os serviços SSE)                                                 |
| O4   | CTG-0004: TASK-0008                         | `backend/app/src/detran-session-policy.ts` e as opções de `@stynx-nyx/sessions`                                                                                                                                                        | O3                                                                                                                                             |
| O5   | CTG-0005: TASK-0009                         | ADR final, `docs/meta/adr/README.md`, `dashboard-build-pack.md`, `waves.md`, `backlog.md`                                                                                                                                              | O3 e O4                                                                                                                                        |

**Abertura empilhada.**

- **Base:** `origin/orchestra/stynx-sse-tenancy`
  (`git worktree add -b orchestra/authz-unification "/Volumes/Thiamat II/stech/detran-worktrees/authz-unification" origin/orchestra/stynx-sse-tenancy`).
  Se R-0022 ainda não tiver publicado o branch, a base é `origin/main` com R-0021, só para O1.
  Revisões de R-0022 entram por `git merge --no-edit origin/orchestra/stynx-sse-tenancy`, nunca por
  rebase de branch publicado.
- **Pode ser feito antes do merge de R-0022:** a rodada inteira, O1…O5, sobre `1.5.0-rc.N` quando for
  o caso (OD-S15-01), respeitando a coluna "Depende de".
- **Espera o merge de R-0022:** só o PR final. Ele também exige a STYNX 1.5.0 **final** com os itens
  de autorização e sessão e o pin `1.5.0` final (OD-S15-01).
- **Matriz e integrações de R-0022 (regra de A-C2-11, mantida):** a matriz só é regenerada em modo
  de caracterização, nunca por Engineer. Cada vez que uma revisão de R-0022, ou de `main` no fim,
  entra na branch e muda a saída de `pnpm verify:authz-matrix`, o maestro regenera a matriz numa
  worktree temporária destacada. Essa worktree fica no commit que fixou a matriz vigente, integrado
  localmente ao upstream por merge não publicado, portanto sem as trocas desta rodada. O diff é
  atribuído linha a linha a mudanças documentadas de R-0022 em §Concorrência. A matriz regenerada é
  commitada na branch (`test(authz): …`, citando o sha de R-0022). Linha sem atribuição é regressão
  de R-0022: triagem `plant-bug`, comunicada a R-0022, e bloqueio do PR final. Em seguida,
  `pnpm verify:authz-matrix` no HEAD da rodada tem de sair com diff vazio.
- **Caracterização commitada antes de qualquer troca:** o commit do CTG-0001 precede qualquer
  commit de O2. Nenhum Engineer toca guarda antes dele.

**Sequência final** (C-0002 §12, nesta ordem):

1. Com R-0022 em `main`: `git fetch -q origin`, `git merge --no-edit origin/main` e a regeneração
   atribuída da matriz sobre `main` (acima); se a rodada correu em RC, pin `1.5.0` final e
   `pnpm install --frozen-lockfile`.
2. CI local completo: `pnpm check`; `pnpm backend:test:ci`; `pnpm verify:authz-matrix` (diff vazio) e
   `git diff --exit-code <sha da matriz> -- docs/framework/arch/fixtures/authz-route-role-matrix.json`;
   `pnpm --filter @detran/shared test`; `pnpm --filter @detran/app test:e2e`; `pnpm backend:rls-smoke`;
   `pnpm verify:rls-ddl`; `pnpm verify:stynx-pin`; `pnpm verify:role-catalog`; `pnpm verify:decorators`;
   os `grep` dos critérios; `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`;
   `pnpm devai:rc:prepare` quando aplicável.
3. **Uma** delivery-review (Opus 5.5, nível grande, pela ponte) sobre o diff inteiro, com o diff da
   matriz e a saída de `verify:authz-matrix` anexados. Ampliação de acesso é `FAIL`, sem ciclo de
   `REVIEW`; `REVIEW` pede correções restritas, no máximo 2 ciclos. Não há waiver.
4. **Um** PR contra `main`, pelo template, com a tabela CTG → tarefas → commits e os gates.
5. CI remoto; falha de código volta à tarefa responsável; merge só com CI verde e `PASS`.
6. Publicação: `evidence-R-0023.json` com os 5 CTGs e a âncora (sha da matriz),
   `devai evidence record` e `evidence verify`, `devai audit observe` no sha do merge,
   `closure.json`, `devai round close`, `devai round seal`, `waves.md` e `backlog.md`. Avisar
   R-0024 do merge.

**Janelas recalibradas:** 2 → **≈ 2 de trabalho, ≈ ½–1 depois do merge de R-0022**. O DAG linear e
o reviewer grande não encolhem o volume. O1 e O2 correm empilhadas enquanto R-0022 faz O4…O7, e O3…O5
correm a partir do push de O6 de R-0022. Depois do merge de R-0022, resta a sequência final, que
inclui a regeneração atribuída da matriz sobre `main`, a delivery-review grande e o CI. Se O5/O6 de
R-0022 atrasarem, O3 espera; esse risco vem de R-0022, não do trabalho desta rodada.

## Decisões do Owner — OD-S15-01 (2026-09-26)

Decisão registrada em `work/campaigns/C-0002-stynx-upstream-spec.md` §Decisões do Owner. Efeito nesta
rodada:

- UPS-AUTHZ-07 e UPS-SES-01…03 passam a ser **MUST**. O CTG-0004 (sessão) deixa de ser condicional:
  `detran-session-policy.ts` é substituído pela política de sessão única e fator forte do STYNX. Os
  ramos "SHOULD ausente → desvio na ADR" desta rodada ficam sem efeito; item ausente → checkpoint
  (OD-R22-02).
- Consumo por RC permitido; merge só com o pin `1.5.0` final.

## Metas

1. **Caracterização antes da troca (âncora da prova).** Gerar e versionar a **matriz completa papel ×
   rota × método** pela cadeia real de guardas do `AppModule`, com positivos e negativos, **antes** de
   qualquer mudança de código de autorização. A mesma matriz, regenerada no fim, é **idêntica**
   (diff vazio); divergência é `FAIL`, nunca adenda.
2. **Fonte única de decisão.** `StynxAuthorizationModule` (1.5.0) registrado globalmente é o **único**
   guarda de política; a política DETRAN entra como **dados + provider** (`PolicyEvaluator`
   injetado). Saem `DetranPolicyGuard` (`backend/domains/shared/src/policy.guard.ts`),
   `DetranPolicyErrorGuard` (`backend/app/src/detran-policy-error.guard.ts`), a lógica de papéis de
   `ProvisioningPolicyGuard` (`backend/app/src/app.module.ts:618`) e `DetranPolicyEvaluator`
   (`backend/app/src/detran-runtime.ts:596`).
3. **`policy.ts` como dados.** A matriz (`PEC_RULES`, `TEAT_RULES`, `EST_*`, `OPS_SURFACE_RULES`,
   `INF_SURFACE_RULES`, `RAIT_SURFACE_RULES`, `RAIT_COMMAND_RULES`, `DASHBOARD_RULES`, `PORTAL_RULES`),
   as ilhas estritas (`RAIT_STRICT_COMMAND_RULES`, `OPS_PROVISIONING_STRICT_RULES`), as chaves
   desligadas (`RAIT_DISABLED_POLICY_KEYS`) e as exceções hoje _hard-coded_ em
   `isDetranActionAllowed` (`ch:retention:review` → DPO; `inf:rait-case:protocol` → só
   `rait-secretary`; `ops:parameter:{read,update}` → `agency-admin`) viram **entradas de dados** com
   semântica explícita (estrita, sem atalho global, sem curinga). O motor genérico (curinga
   `recurso:*`/`*`, casamento de papéis) passa a ser o do STYNX 1.5.0.
4. **Invariantes preservadas.** **OD-D76**: `GLOBAL_ADMIN_ROLES` (`ADMIN`, `GESTOR_DETRAN`, `SUPORTE`,
   `technical-admin`) continuam recebendo `'*'` (`permissionsForRoles`) e o atalho de administrador
   global — a pergunta segue aberta ao Owner e **não** é decidida aqui. **OD-309**: os dois grants
   nomeados (`inf:rait-suspension-act:create` → `rait-signing-authority`/`rait-chair`;
   `inf:rait-export:create` → `AUDITOR`) permanecem, e as demais ações CRUD desses recursos seguem
   negadas a papéis não administrativos. Camadas DASHBOARD (`dashboardLayerFor`,
   `dashboardLayerAllows`, N3 sempre negado) continuam teto, nunca grant (RN-DASH-170).
   `canDecideAitCancelRequest` continua segunda camada por claim (`decision_body`).
5. **Consumidores fora do guarda com fonte única.** Filtros de SSE que decidem por política
   (`teat-stream.service.ts:68` via `isDetranActionAllowed`; `dashboard-stream.service.ts:177` lê
   `DETRAN_POLICY_MATRIX` direto) passam ao mesmo provider (token exportado pelo STYNX, se publicado;
   senão a fachada `isDetranActionAllowed` delegando ao provider). `permissionsForRoles`
   (`detran-runtime.ts:326`) continua a fonte das permissões do principal. A especificação §2 lista
   `apps/dashboard/web/src/app/core/can.directive.ts` entre os consumidores de U6 nesta rodada; para
   manter os locks disjuntos com os CTGs de frontend de R-0024, a troca do `dashCan` pelo
   `*stynxHasPermission` com curinga (`UPS-AUTHZ-06`) fica em R-0024 CTG-0003.
6. **Sessão (incondicional desde OD-S15-01).** Se 1.5.0 publicar sessão única ativa e fator forte em
   `@stynx-nyx/sessions`, `backend/app/src/detran-session-policy.ts` (162 l.:
   `DetranSessionStrongFactorGuard`, `DetranSingleSessionInterceptor`) passa às opções do pacote;
   senão fica, pela regra de consumo da especificação (§7: SHOULD ausente), com desvio na ADR
   "Divisão STYNX × DETRAN" criada por R-0021 e item de volta ao _backlog_ de upstream (próxima minor).
7. **Documentação:** ADR nova "Autorização única pelo STYNX" e emenda da ADR "Divisão STYNX ×
   DETRAN" de R-0021 (desvios de `UPS-AUTHZ-07`/`UPS-SES-*` se ausentes; número conferido em
   `docs/meta/adr/README.md` e `ls docs/meta/adr`; em 2026-09-26 o próximo livre é 0035 — 0029–0033
   existem fora do índice, que R-0018 racionaliza; R-0021/R-0022 podem ocupar números antes); emenda de
   texto em `dashboard-build-pack.md` (linha de política), `waves.md` §Histórico, `backlog.md`
   (OD-D16-015 e o item de autorização), ODs no registro canônico.

## Estado verificado em 2026-09-26 (linha de base para o contrato; o bootstrap reconfere após R-0022)

- `StynxAuthorizationModule.forRoot({ policyEvaluator: new DetranPolicyEvaluator() })`
  (`app.module.ts:748`) só **provê** `AuthorizationGuard`; nenhum controlador usa
  `@RequirePermissions`/`@RequireRoles`, então o guarda STYNX **nunca decide** (1.4.0 no workspace
  STYNX: `packages/backend/src/authorization/authorization.guard.ts` retorna `true` sem
  `STYNX_AUTHZ_METADATA` e passa `resource = classe`, `action = handler`; `PolicyEvaluationContext`
  sem `tenantId`; `DefaultPolicyEvaluator` sem curinga).
- Decisão real: `APP_GUARD` → `ProvisioningPolicyGuard` → `DetranPolicyErrorGuard` → `DetranPolicyGuard`
  → `isDetranActionAllowed` (`policy.ts:1899`). Metadados `detran:resource`/`detran:action`/`detran:public`
  (`decorators.ts`); `@Action` também aplica `@Idempotent()` e `@RateLimit` a mutações.
- Envelopes de negação hoje: 403 genérico `Access denied for <r>:<a>` (maioria; OD-T62); 403
  `RAIT.FORBIDDEN_ACTION` para `inf:rait-*` com principal; 401 `TEAT.AUTH_REQUIRED` e 403
  `TEAT.FORBIDDEN_ACTION` na ilha de provisionamento (claims `device_id`, `agent_id`).
- Outros pontos de decisão (inventário a fechar no contrato): `APP_GUARD`s de auth/sessão
  (`DetranLegacyAuthContextGuard` no perfil local; `DetranStynxAuthContextGuard`,
  `DetranSessionStrongFactorGuard` no completo), `ProvisioningIfMatchGuard`, `PortalCitizenGuard`
  (`portal/identity/src/handwritten/citizen.guard.ts`), `DashboardLayerGate`
  (`dashboard/monitor/src/handwritten/surface/layer-gate.ts`), `RenachWebhookGuard`, filtros SSE,
  ~20 checagens `roles.includes/some` em código de domínio (fora de specs e gerados).
- Escala: 36 papéis em `roles.ts` (10 RAIT, 2 DASHBOARD); ≈ 1.021 `@Action(` e 325 arquivos com
  `@Resource(` fora de specs; 10 `@Public()`. Provas existentes: `policy-routes.e2e.spec.ts`
  (matriz ⇔ rotas TEAT nos dois sentidos, via `ModulesContainer`), `dashboard-policy.e2e.spec.ts`
  (presença/ausência por papel, camadas), `policy.spec.ts` (inclui OD-309), `policy.guard.spec.ts`,
  `detran-policy-error.guard.spec.ts`, `detran-runtime.spec.ts`, `parameter-contract.spec.ts:446`
  (instancia `DetranPolicyGuard`), `detran-session-policy.spec.ts`.

## Tarefas

**Leitura A-C2-14 para esta sessão.** Nas linhas TASK-0001/0002 abaixo, a
linha de base é `origin/main` pós-#159 e a inspeção de `.d.ts` é da versão
1.4.0 instalada. Referências históricas ao HEAD pós-R-0022 e à conformidade
1.5.0 aplicam-se à regeneração atribuída na retomada, antes de O2. A matriz
integral cobre cada combinação de rota, principal e perfil que o guarda real
consegue materializar; variantes impossíveis em um perfil são inventariadas
explicitamente, sem resultado fabricado.

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                              | Depende de         | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | -------------------- | ------------------- | -------------- | ----------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r23-contracts`, `MOD-kb-open-decisions`                      | —                  | `contracts/CTG-0001.md`: inventário fechado dos pontos de decisão (acima) com arquivo:linha; **formato da matriz** (JSON: uma linha por rota montada × principal, campos `method`, `path`, `controller`, `handler`, `resource`, `action`, `public`, `principal`, `profile`, `outcome` ∈ {`allow`, `401`, `403`}, `code`, `layer`); **conjunto fechado de principais** (36 papéis isolados; os 4 de `GLOBAL_ADMIN_ROLES` isolados; `permissions:['*']` sem papel; `permissions:['<recurso>:*']` por domínio; sem principal; principal sem vínculo ao tenant; variantes de claim `device_id`, `agent_id`, `decision_body`); os **dois perfis de runtime** (local e completo); decisão do nível de execução (in-process pela cadeia de `APP_GUARD` do `AppModule` real para a matriz inteira + amostra HTTP `supertest` estratificada que ancora o harness); tabela de conformidade de 1.5.0 lida dos `.d.ts` instalados (`node_modules/@stynx-nyx/{backend,contracts,sessions,angular-auth}`), nunca da proposta; critérios C-01-nn; OD-R23-01 no registro canônico (`open-decisions-rait.md` §C-0002) |
| TASK-0002 | Inspector            | inspector-tests     | Terra / alto   | `MOD-authz-matrix`, `MOD-app-tests-authz`, `MOD-root-scripts`     | TASK-0001          | gerador `tools/authz/route-role-matrix.ts`; matriz **antes** em `docs/framework/arch/fixtures/authz-route-role-matrix.json` (determinística, ordenada, formatada para `format:check`); `backend/app/tests/e2e/authz-route-matrix.e2e.spec.ts` (regenera e compara byte a byte; amostra HTTP; nenhum `skip`); script `verify:authz-matrix` no `package.json` raiz; relatório com a saída verde sobre o HEAD pós-R-0022 (sha citado)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| TASK-0003 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r23-contracts`, `MOD-adr`                                    | TASK-0002          | `contracts/CTG-0002.md` (modelo de dados da política: tabelas, ilhas estritas, chaves desligadas, exceções nomeadas como dados com flags `strict`/`noGlobalAdmin`/`noWildcard`; provider sobre os símbolos **publicados** de 1.5.0; fachada `isDetranActionAllowed` e `permissionsForRoles` preservadas); `contracts/CTG-0003.md` (registro global do guarda STYNX, resolução de alvo pelos metadados `detran:*`, metadado público, fábrica de negação que reproduz os três envelopes, ilha de provisionamento por claims no provider, ordem dos `APP_GUARD`, consumidores SSE); rascunho da ADR nova                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| TASK-0004 | Inspector            | inspector-tests     | Terra / médio  | `MOD-shared-policy-tests`                                         | TASK-0003          | `backend/domains/shared/src/policy-provider.parity.spec.ts`: paridade exaustiva provider × `isDetranActionAllowed` atual sobre **todas** as chaves (`DETRAN_POLICY_MATRIX` ∪ ilhas ∪ desligadas ∪ exceções ∪ 1 chave inexistente por domínio) × 36 papéis × variantes de permissão; OD-D76 e OD-309 com presença e ausência; vermelho até TASK-0005                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| TASK-0005 | Engineer             | engineer-backend    | Sol 6 / médio  | `MOD-shared-policy`                                               | TASK-0004          | `policy.ts` dividido em dados + provider (`backend/domains/shared/src/policy/`); `isDetranActionAllowed`/`permissionsForRoles`/`dashboardLayer*` reexportados com a mesma assinatura; nenhum guarda muda; paridade e `policy.spec.ts` verdes **sem edição**; matriz inalterada                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0006 | Inspector            | inspector-tests     | Terra / médio  | `MOD-app-tests-authz`, `MOD-shared-policy-tests`                  | TASK-0005          | migração dos specs que instanciam classes a remover (`policy.guard.spec.ts`, `detran-policy-error.guard.spec.ts`, `detran-runtime.spec.ts` §evaluator, `parameter-contract.spec.ts:446`) para o ponto de entrada novo, **com as mesmas asserções de resultado** (lista de casos antes/depois no relatório); `policy-routes.e2e.spec.ts` e `dashboard-policy.e2e.spec.ts` só trocam a origem dos metadados se o contrato mudar a chave (não previsto)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0007 | Engineer             | engineer-backend    | Sol 6 / alto   | `MOD-app-module`, `MOD-app-authz-guards`, `MOD-app-streams-authz` | TASK-0006          | `StynxAuthorizationModule` global com o provider; remoção de `DetranPolicyGuard`, `DetranPolicyErrorGuard`, `DetranPolicyEvaluator` e da lógica de papéis de `ProvisioningPolicyGuard` (o `ProvisioningIfMatchGuard` fica); filtros SSE no provider; **matriz regenerada com diff vazio**; todos os specs verdes sem edição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| TASK-0008 | Engineer             | engineer-backend    | Sol 6 / médio  | `MOD-app-session-policy`                                          | TASK-0007          | **condicional** a UPS-SES publicado: `detran-session-policy.ts` substituído pelas opções de `@stynx-nyx/sessions`; `detran-session-policy.spec.ts` verde sem edição (ou migrado por Inspector em adenda se só o ponto de entrada mudar); sem publicação → `cancelled` com registro e item no backlog da próxima minor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| TASK-0009 | Architect (transcr.) | transcriber-docs    | Luna / médio   | `MOD-docs`, `MOD-adr`                                             | TASK-0007 (e 0008) | ADR final; `docs/meta/adr/README.md`; `dashboard-build-pack.md` linha Política; `waves.md` §Histórico; `backlog.md` (OD-D16-015 aponta para R-0024; item de autorização fechado); lacunas não publicadas registradas para a próxima minor do STYNX                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

CTG-0001 = 0001 → 0002 (caracterização; **commitada antes de qualquer troca**). CTG-0002 = 0003 → 0004 →
0005 (dados + provider, sem mudança de guarda). CTG-0003 = 0006 → 0007 (troca do guarda). CTG-0004 =
0008 (condicional). CTG-0005 = 0009. Commits por CTG na branch única; um PR no fim (OD-C2-005).

**Tríade e ordem de prova.** A matriz de TASK-0002 é o artefato de aceitação da rodada: nesta O1,
gerada em `main` pós-#159 e commitada no CTG-0001; no futuro, regenerada com diff atribuído após
R-0022, **nunca** por Engineer para "atualizar". Em
CTG-0002 e CTG-0003 o gate é `pnpm verify:authz-matrix` com diff vazio contra o arquivo commitado no
CTG-0001 (ou na última regeneração atribuída a R-0022, §Execução OD-C2-005).
Contradição teste × contrato: adenda numerada do Architect antes de redespachar.

**Checkpoints do maestro (Engineer):** (a) bootstrap — `node -e` sobre os `package.json` confirma
`@stynx-nyx/*` = 1.5.0 e leitura dos `.d.ts` de `@stynx-nyx/backend` (authorization) e `sessions`;
item MUST de autorização ausente (`UPS-AUTHZ-01…06`) → `checkpoint` e parada pela regra de consumo
da especificação (§7, OD-R22-02: sem shim novo, sem cópia local do código STYNX); (b) após TASK-0002, script novo
no `package.json` → `pnpm install --frozen-lockfile` sem diff de lockfile; (c) `pnpm check` e
`pnpm backend:test:ci` uma vez, na sequência final (OD-C2-005).

## Critérios de aceitação (comandos → resultado)

Todos existem hoje, salvo `verify:authz-matrix`, entregável de TASK-0002 (gate novo).

- `pnpm verify:authz-matrix` → `OK (<n> rotas × <m> principais × 2 perfis, 0 divergências)` a partir
  do CTG-0002; no CTG-0001, a primeira execução grava a matriz e a segunda sai com diff vazio.
- `git diff --exit-code <sha-merge-CTG-0001> -- docs/framework/arch/fixtures/authz-route-role-matrix.json`
  → exit 0 no fim de CTG-0002, CTG-0003 e CTG-0004 (**matriz idêntica**).
- `pnpm --filter @detran/shared test` → verde, com `policy-provider.parity.spec.ts` e `policy.spec.ts`
  (OD-309) sem `skip`.
- `pnpm --filter @detran/app test:e2e` → verde, com `authz-route-matrix.e2e.spec.ts`,
  `policy-routes.e2e.spec.ts` e `dashboard-policy.e2e.spec.ts` presentes e sem `skip`.
- `pnpm backend:test:ci` → verde; `pnpm backend:rls-smoke` → OK; `pnpm verify:rls-ddl` → OK.
- `pnpm verify:stynx-pin` (gate de R-0021, 1.5.0 desde R-0022) → OK, 0 divergências.
- `pnpm verify:role-catalog` → `check-role-catalog: OK (36 roles, 10 RAIT, 2 dashboard)` (inalterado).
- `pnpm verify:decorators` → OK (metadados `@Resource/@Action/@Public` continuam visíveis).
- Verificações de arquivo após CTG-0003: `grep -rn "DetranPolicyGuard\|DetranPolicyErrorGuard\|DetranPolicyEvaluator" backend --include='*.ts'`
  → vazio fora de comentários históricos; `grep -c "StynxAuthorizationModule.forRoot" backend/app/src/app.module.ts`
  → `1`; `grep -rn "DETRAN_POLICY_MATRIX\[" backend/app/src` → vazio.
- `pnpm docs:kb:check` → OK; `pnpm docs:kb:publish-check` → OK; `pnpm format:check` → OK.
- `pnpm check` → verde no fim de cada CTG.
- DEVAI: `devai evidence record` por CTG e `evidence verify` OK; `audit observe` no sha exato de cada
  merge; fechamento com `devai round close` **e** `devai round seal`, com a âncora (sha da matriz
  antes) na cadeia.

## Mapa entregável → definições

| Entregável               | Definição                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| matriz de caracterização | C-0002 §4 (caracterização antes da troca); `policy-routes.e2e.spec.ts` (coleta por `ModulesContainer`, precedência método > classe); `dashboard-policy.e2e.spec.ts` (negativos por papel)           |
| política como dados      | `backend/domains/shared/src/{policy,roles}.ts`; ADR-0015 (catálogo de papéis); `tools/check-role-catalog.ts`; `backend/database/ddl/05-role-catalog.sql`; `docs/framework/product/shared/actors.md` |
| guarda único             | STYNX 1.5.0 `.d.ts` (`@stynx-nyx/backend` authorization, `@stynx-nyx/contracts` `PolicyEvaluator`); `C-0002-stynx-upstream-spec.md` (itens de autorização); ADR-0005 (kernel)                       |
| envelopes de negação     | `backend/app/src/detran-error.filter.ts`; `rait-error-catalog.md` (`RAIT.FORBIDDEN_ACTION`); `teat-error-catalog.md` (`TEAT.AUTH_REQUIRED`, `TEAT.FORBIDDEN_ACTION`); OD-T62                        |
| invariantes              | OD-D76 (`dashboard-build-pack.md` §Decisões); OD-309 (`open-decisions-rait.md` §D); RN-DASH-170/171; H.39/OD-T01 (`canDecideAitCancelRequest`); A5 (ilha de provisionamento)                        |
| sessão                   | `backend/app/src/detran-session-policy.ts`; `UPS-SES-01…03` (spec §5)                                                                                                                               |

## Riscos

- **Segurança — ampliação silenciosa de acesso é crítica.** Qualquer célula `403 → allow` ou
  `401 → allow` na matriz é `FAIL` do CTG e parada da rodada (triagem `plant-bug` ou `policy-issue`);
  reviewer grande em toda delivery-review; nenhum waiver do Owner substitui o PASS (antiexemplo:
  SQL2 de R-0007).
- **Curinga do STYNX × exceções DETRAN.** O curinga de 1.5.0 não pode alcançar as ilhas estritas, as
  chaves desligadas nem `inf:rait-case:protocol`/`ch:retention:review`; a paridade de TASK-0004 prova
  `recurso:*` e `*` contra cada uma.
- **Ordem de guardas.** Mudar a posição do guarda de política em relação a
  `ProvisioningIfMatchGuard`, aos guardas de sessão e ao `DashboardLayerGate` altera o código de
  erro (428 × 403, 401 × 403) sem mudar allow/deny; a matriz registra `outcome` **e** `code`.
- **Cobertura de rotas atrás de flag** (ex.: `SpeedModule` com `teat.speed_meters`): o gerador sobe as
  mesmas instâncias extras que `policy-routes.e2e.spec.ts` já sobe; rota não montada não é "provada".
- **API publicada ≠ proposta.** Contratos de CTG-0002/0003 só a partir dos `.d.ts` instalados; MUST
  ausente → checkpoint; SHOULD ausente (sessão, token do avaliador) → desvio na ADR de divisão
  (R-0021) + _backlog_ da próxima minor.
- **Volume da matriz.** ≈ 1.000 rotas × ≈ 50 principais × 2 perfis: o gerador roda in-process; a
  amostra HTTP é estratificada (por domínio, verbo, público e ilha), fixada no contrato.

## Lições aplicadas (C-0001 e C-0002 §4)

- **Relatórios versionados:** `work/rounds/R-0023/reports/` com `git add -f` enquanto R-0018 não
  corrigir o `.gitignore`; depois de cada `git add`, comparar `find <dir> -type f` com
  `git ls-files <dir>` (R-0016: `add` que ignora diretório não falha e esconde do Prettier).
- **Critérios imutáveis:** mudança só por adenda numerada com decisão do Owner; critério substituído
  aparece no closure como **não cumprido**; proibido reproduzir as substituições de R-0013/R-0014 e o
  waiver SQL2 de R-0007.
- **ODs no registro canônico:** OD-R23-01 em `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002
  no commit do CTG-0001 (entra no PR final); OD só em `contracts/` não conta.
- **Âncora da prova:** `audit observe` no sha exato do merge; `round close` e `round seal`; se outra
  rodada fechar antes, aceitar a cadeia de `main`, observar o HEAD integrado e repetir `round close`.
- **Orçamento:** `budget.json` desde o bootstrap; a 80 % da janela, checkpoint e parada.
- **Caracterização antes de troca:** nenhum Engineer toca guarda antes do commit do CTG-0001; o
  Engineer nunca edita teste nem a matriz.
- Testes cobrem presença **e** ausência (R-0011, R-0016); listas de leitura dos workers fechadas,
  incluindo `policy-routes.e2e.spec.ts` como referência (`reference-gap` de R-0010).
- Conflito em `policy.ts`/`roles.ts` na integração: manter os dois blocos e rodar
  `pnpm --filter @detran/shared test`.

## Decisões pendentes do Owner (ODs novas desta proposta)

| OD        | Pergunta                                 | Opções                                                                                                                                                                                     | Recomendação do Architect                                                                     |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| OD-R23-01 | Envelope de negação depois da unificação | (a) preservar exatamente os três envelopes atuais (403 genérico; `RAIT.FORBIDDEN_ACTION`; `TEAT.*` do provisionamento) pela fábrica de negação; (b) padronizar um código único por domínio | (a): a rodada prova identidade; padronizar é mudança de contrato de erro dos apps, fora de 7d |

Respeitadas sem reabrir: OD-C2-001…004, OD-S15-01, OD-R22-02 (regra de MUST ausente), OD-D76 (pergunta segue com o Owner), OD-309, OD-T62, H.39/OD-T01.

## Decisões do maestro

**M1 — bootstrap O1 (Architect, autorização A-C2-14 do Owner).** Base
`origin/main` em `c4d5417ccaa510422f5f4ac0d326af2219001799` (PR #159,
hotfix B2). Branch `orchestra/authz-unification`. A ajuda de `codex` aceita
`-m/--model` e a de `claude` aceita `--model`; o catálogo de IDs confirmado em
`model-ladder.md` é `gpt-6-sol` (maestro e TASK-0001),
`gpt-5.6-terra` (TASK-0002), `gpt-6-luna` (escada restante) e
`claude-opus-5-5` (reviewer pela ponte). As ajudas não enumeram IDs; a
confirmação operacional ocorre ao despachar. O1 usa STYNX 1.4.0 tal como em
`main`, sem antecipar o pin da R-0022. Só TASK-0001/0002 são ativas nesta
sessão; `acceptance_commands` permanecem por tarefa. A prompt-review única
cobre os prompts ativos de O1 e o plano integral. Sem PR ou delivery-review.
`pnpm install --frozen-lockfile`, `devai doctor` (1.5.6) e `pnpm check` de
linha de base sobre o HEAD anterior às mudanças passaram (exit 0).
Prompt-review da O1: ciclo 1 `REVIEW` (quatro achados altos, oito baixos),
ciclo 2 `PASS` pelo Opus 5.5 via `bridge.sh`; a primeira serialização do
ciclo 2 foi rejeitada pela ponte por JSON inválido e repetida sem ampliar o
escopo da revisão. Os prompts corrigidos cobrem a pipeline Nest completa,
decisões internas, materialização real dos principais e curingas das ilhas.

## Concorrência

No bootstrap, `origin/main` inclui R-0021 e o hotfix B2 (#159). O PR #160
(A-C2-14) está aberto; o prompt do Owner é a autorização vinculante. A
R-0020 tem CTG-0001…0003 mesclados e mantém as branches
`orchestra/devai-sensors` e de preparação CTG5/6; o CTG-0004 espera o
`reference-gap` DEVAI #168. Esta rodada não altera seus locks
`.github/workflows/`, `.devai/config`, `law/register` e `record/`. A R-0022 tem
`origin/orchestra/stynx-sse-tenancy` publicado em `ca4fe44f`; seu checkpoint
registra pin e ondas O4–O9 ainda pendentes. Nenhum arquivo de `app.module.ts`,
`detran-runtime.ts`, serviços SSE ou pin STYNX entra em O1. A base da matriz é
`main` pós-#159: o pedido oportunista do Portal com Host e `X-Tenant-Id`
cruzados responde `201 anonymous:true`. O2 espera o pin 1.5.x e a tenancy
canônica de R-0022; a integração futura exige regeneração e diff atribuído
pela A-C2-11.

## Triagem

## Adendas

**A-C2-14 (Owner, 2026-09-30; prompt de abertura enquanto PR #160 aberto).**
Esta sessão executa somente O1 sobre `origin/main` pós-#159. A linha de base
da matriz inclui `201 anonymous:true` no caso Host/`X-Tenant-Id` cruzado do
Portal oportunista. Ao concluir TASK-0001/0002, fazer push sem PR e parar.
Não há delivery-review nesta sessão; só a prompt-review do bootstrap. Não
editar os locks R-0020 nem os arquivos R-0022 listados em §Concorrência.

**A-R23-05 (Owner, 2026-09-30; decisão nesta sessão).** Adotado o escopo de
execução do plano para O1: toda tupla materializável percorre a cadeia real
de guardas; amostras HTTP estratificadas registram o resultado final em
seção separada da matriz. `pass` significa apenas passagem das guardas,
jamais `allow` final. O contrato CTG-0001 §Adenda A-R23-05 substitui os
critérios incompatíveis de execução integral de handler/serviço. Os três
`acceptance_commands` de TASK-0002 permanecem intactos. A decisão não
autoriza push antes do aceite nem altera o escopo O1/O2 de A-C2-14.

**A-C2-11 (Owner, 2026-09-27): abertura antecipada do CTG-0001.** Esta rodada pode **abrir antes
do merge de R-0022**, somente para o CTG-0001, que gera a matriz papel × rota × método e os testes de
caracterização antes de qualquer troca de guarda.

- **Base:** o CTG-0001 nasce em `origin/main` (com R-0021 mesclada) ou **empilhado** em
  `origin/orchestra/stynx-sse-tenancy` (R-0022), sempre integrando por `git merge --no-edit`.
- **O que pode ser feito antes do merge de R-0022:** TASK-0001 (inventário e formato da matriz),
  TASK-0002 (gerador `tools/authz/route-role-matrix.ts`, matriz "antes" e e2e), a prompt-review e a
  delivery-review do CTG-0001.
- **O que espera o merge de R-0022:** o PR do CTG-0001 contra `main`. Depois do merge, o maestro
  integra `origin/main` e **regenera a matriz** sobre o estado pós-R-0022 (pin 1.5.0, middleware de
  contexto, rejeição de conflito Host × `X-Tenant-Id`). A matriz versionada é a regenerada. O diff
  entre a versão antecipada e a regenerada vai para o PR e para `plan.md` §Concorrência, com cada
  linha atribuída a uma mudança documentada de R-0022. Uma linha sem atribuição é regressão de R-0022
  (triagem `plant-bug`, comunicada a R-0022) e bloqueia o merge. Nenhuma linha é "aceita" sem
  atribuição.
- **O que não muda:** o CTG-0001 continua a **mesclar antes de qualquer troca** (CTG-0002 em diante),
  e os CTG-0002 em diante continuam exigindo R-0022 em `main` e os itens de autorização e sessão da
  1.5.0 final (OD-S15-01).
- **Locks:** `MOD-authz-matrix`, `MOD-app-tests-authz` e `MOD-root-scripts` não são comuns com R-0022,
  exceto `package.json` na raiz (script do gerador), resolvido por merge.
- **Subsumida por OD-C2-005 (2026-09-27):** a rodada inteira pode abrir empilhada, não só o CTG-0001.
  Deixam de existir o PR e a delivery-review próprios do CTG-0001. Continuam valendo a regeneração
  atribuída da matriz sobre `main` antes do PR final, em cada integração de R-0022, e a regra
  "caracterização commitada antes de qualquer troca" dentro da branch (§Execução OD-C2-005).

## Bloqueios

**M2 — escopo da matriz resolvido pelo Owner (A-R23-05).** O gerador e o e2e
direcionado produzem, sobre `origin/main` `c4d5417c`, 42.482 células de
guarda (1.114 `401`, 32.857 `403`, 8.511 `pass`) e 12 amostras HTTP
separadas. `verify:authz-matrix` regenera a fixture byte a byte e passa.
`pass` não é `allow` de handler. No perfil completo STYNX 1.4.0, token
aceito e sessão ativa ainda retornam 500
`REQUEST_CONTEXT_MUTATION_FORBIDDEN` antes da política; esses pares estão
em `notMaterializable` (A-R23-02).

**M3 — TASK-0002 aceita (Inspector, O1).** Os cinco testes que
falhavam sobre banco novo com fixtures `fresh` (três Portal, um isolamento
OPS e um SSE TEAT) tinham uma única causa no ambiente de teste: sem
`STYNX_APP_DATABASE_URL`, a conexão de app herdava `DATABASE_URL` do
superusuário `postgres` e contornava RLS. Um login descartável sem
`BYPASSRLS`, membro de `role_app_backend`, eliminou as cinco falhas: os
três arquivos afetados passaram 20/20 e a suíte completa não voltou a
falhar nesses casos. A matriz permaneceu idêntica. O baseline legado de
20 casos no banco dedicado `detran_r7_ctg1_a2`, com URLs de owner/app
separadas, satisfez os testes RAIT. O comando integral passou 39/39
arquivos, 1.692 testes, 3 todos; ver `reports/TASK-0002.md`. Os
`acceptance_commands` permaneceram intactos.

## Retomada

O1 concluída; aguardando R-0022 (pin 1.5.x e tenancy canônica) para O2;
matriz será regenerada com diff atribuído (A-C2-11).

## Leitura

Bootstrap O1 sobre `c4d5417ccaa510422f5f4ac0d326af2219001799`:
`AGENTS.md`, `CODESTYLE.md`, `README.md`, `law/constitution.md`,
`BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `docs/start/index.md`,
`.devai/config/project.json`, `docs/meta/agents/{README.md,architect-blueprint.md,inspector-tests.md}`,
`docs/meta/agents/orchestra/{README.md,model-ladder.md,task.template.json,worker-prompt.template.md,reviewer-prompt.template.md}`,
`work/campaigns/C-0002-consolidacao.md` §12–§14 e §15 no branch do PR #160,
`work/rounds/R-0023/{plan.md,prompts/00-maestro.md}`,
`work/rounds/R-0022/plan.md` §Adendas/§Retomada, e os comandos de descoberta
de branches/PRs. §15 da campanha ainda não existe em `main` porque PR #160
segue aberto; A-C2-14 é aplicada pelo prompt do Owner.
