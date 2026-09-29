# R-0027 — frente `portal-delegations` (ação 6 da C-0002 — Portal: defesa, recursos, indicação, pagamento, junta e diligência religados)

**Status:** **autorizada para a Sessão A da A-C2-15 — TASK-0001…0005** (`AUTHORIZATION.md`). Planejada em 2026-09-26 pelo
Architect (`work/campaigns/C-0002-consolidacao.md` §2, fase D). Maestro **Sol 6** (Codex CLI), workers
da escada Codex (Sol 6 / Terra / Luna vigentes) por subagentes nativos, reviewer **Opus 5.5** pela
ponte `tools/orchestra/bridge.sh claude` (C-0002 §4; ids de CLI confirmados no bootstrap). Worktree
`/Users/aarusso/.codex/worktrees/portal-delegations/detran`, branch `orchestra/portal-delegations`.
Issue da frente: [#164](https://github.com/aarusso-nyx/detran/issues/164), criada pela TASK-0002; ela entra no PR final (OD-C2-005).
`AUTHORIZATION.md`, `tasks/` e `compositions.json` foram criados no bootstrap da Sessão A.
**Concorrência:** abre sobre **R-0024 `stynx-dedup`** mesclada ou publicada em
`origin/orchestra/stynx-dedup` (abertura empilhada, §Execução OD-C2-005; o PR final espera o merge) (cliente de comando, costura SSE, shell
e error boundary únicos em `@detran/ui`; `docs/framework/arch/frontend-wiring-pattern.md`, entregável
de R-0024 — **ainda não existe em 2026-09-26**; se ausente no bootstrap, a rodada não abre). Lock
compartilhado **`MOD-shared-policy`** e backend RAIT com **R-0025 `rait-web-wiring`** (C-0002 §3.5):
o CTG-0003 escreve em `backend/domains/shared/src/policy.ts` no próprio branch, sob a regra de
convivência de §Execução OD-C2-005 (OD-C2-005: o lock não serializa PRs); os demais CTGs correm livres. Esquema do manifesto de disponibilidade:
`work/rounds/R-0030/availability-manifest.schema.md` (fixado por R-0030; se ainda não mesclado,
empilhar ou aguardar só o CTG-0005). Paralelas da fase D com locks disjuntos: R-0026, R-0028, R-0029.
**Janelas previstas:** 3. Recalibradas para ≈ 2,5 pela OD-C2-005 (ver §Execução OD-C2-005).

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-15 (Owner, 2026-09-30; prevalece).** Abertura antecipada na **sessão A** (Codex
> Sol 6; reviewer Opus 5.5), **primeira da sequência**. Tarefas liberadas: **TASK-0001/0002**
> (matriz de delegação com OD-R27-001 = a e OD-R27-002 = b, ODs e issue) e **TASK-0003/0004**
> (`BANK_PORT` fail-closed por perfil). A composição fica **dentro de `inf/collection`**, usando a API
> de perfil existente (`isLocalRuntimeProfile`, `backend/app/src/detran-runtime.ts:87`, somente
> leitura), sem editar `app.module.ts`/`detran-runtime.ts`. Se o contrato exigir composição no app,
> TASK-0004 espera R-0022. Também liberada: **TASK-0005** (testes das delegações reais; ficam
> vermelhos até TASK-0006). Esperam: TASK-0006 (`policy.ts`, R-0023) e TASK-0007 em diante (R-0024).
>
> - **Base:** `origin/main`, branch `orchestra/portal-delegations`. Push sem PR ao fim de cada tarefa
>   liberada; checkpoint em §Retomada com o que falta e o que espera; parada.
> - **Não tocar:** `backend/app/src/app.module.ts`, `backend/app/src/detran-runtime.ts`, serviços
>   SSE, `backend/domains/shared/src/policy.ts`, `backend/domains/shared/src/documents`, outbox
>   (`integration.*`), offline-sync e pin STYNX (R-0022/R-0023); `packages/ui` e shells ou
>   núcleos dos apps (R-0024); locks de R-0020 (`.github/workflows/`, `.devai/config`,
>   `law/register`, `record/`).
> - **Reconferência na retomada:** todo contrato produzido agora é reconferido contra `origin/main`
>   quando a rodada retomar depois da R-0024. Divergência vira adenda numerada do Architect, sem
>   reescrever o já aprovado.
> - Tarefas válidas em `pnpm verify:round-tasks`; um prompt-review no bootstrap cobrindo só as tarefas
>   liberadas; `acceptance_commands` por tarefa; sem PR e sem delivery-review (OD-C2-005).

**Precedência.** Esta seção aplica `work/campaigns/C-0002-consolidacao.md` §12 e **prevalece sobre
qualquer menção a um PR/merge/evidência/delivery-review por CTG neste plano**.

- A rodada corre numa branch única, `orchestra/portal-delegations`, com commits por tarefa ou por CTG.
- Entre CTGs não há:
  - PR, CI remoto;
  - `devai evidence record`, `devai audit observe`;
  - `pnpm check` completo;
  - delivery-review.
- Ficam mantidos:
  - os `acceptance_commands` de cada tarefa;
  - o checkpoint (c) como gate de tarefa;
  - **um** prompt-review no bootstrap.
- O checkpoint (b), que conferia lock livre por PR, deixa de bloquear e segue a regra de
  convivência abaixo.
- Os critérios de aceitação não mudam, só o momento em que rodam: no fim da rodada. Onde um critério
  cita "PR do CTG-x", "por CTG" ou "cada merge", leia-se o PR final, a evidência única e o SHA do
  merge final.

**Ondas.** Derivadas da coluna "Depende de" e dos locks da tabela de tarefas. No máximo 3 workers
simultâneos. O maestro serializa os commits e faz push sem PR ao fim de cada onda.

| Onda | CTGs / tarefas em paralelo                                                  | Fronteiras de escrita (disjuntas)                                                                                                                                                  | Dependência                                              |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| O1   | CTG-0001: TASK-0001 → TASK-0002                                             | `MOD-r27-delegation-matrix` → `MOD-portal-build-pack-od`, `MOD-kb-backlog`                                                                                                         | —                                                        |
| O2   | CTG-0002: TASK-0003 → TASK-0004 ∥ CTG-0003: TASK-0005 ∥ CTG-0004: TASK-0007 | `MOD-inf-collection-tests`, `MOD-app-e2e-runtime` → `MOD-inf-collection-bank`, `MOD-app-composition` ∥ `MOD-portal-requests-tests`, `MOD-app-e2e-portal` ∥ `MOD-r27-contract-ctg4` | TASK-0001 (contratos de CTG-0002/0003 e matriz)          |
| O3   | CTG-0003: TASK-0006                                                         | `MOD-app-portal-delegation`, `MOD-portal-requests`, `MOD-shared-policy`                                                                                                            | TASK-0004 e TASK-0005 commitadas                         |
| O4   | CTG-0004: TASK-0008 → TASK-0009 → TASK-0010                                 | `MOD-portal-web-tests` → `MOD-portal-web-features` → `MOD-r27-stack-smoke`                                                                                                         | TASK-0006 e TASK-0007; checkpoint (c) antes de TASK-0010 |
| O5   | CTG-0005: TASK-0011                                                         | `MOD-docs-portal`, `MOD-r27-availability`                                                                                                                                          | TASK-0010 (`reports/TASK-0010.md`)                       |

**Lock `MOD-shared-policy` partilhado na fase D (C-0002 §12).** O CTG-0003 partilha o lock com o
CTG-0002/0003 de R-0025 e com o CTG-0003 de R-0026 (produtores RAIT). Sob a OD-C2-005, o lock deixa
de serializar PRs por CTG. Regra de convivência:

- TASK-0006 edita `backend/domains/shared/src/policy.ts` (chaves `…-portal` da OD-R27-001) no próprio
  branch, sem esperar PR de outra rodada.
- Quem mesclar depois integra `origin/main` por merge, mantém os blocos das duas rodadas no formato
  de dados de R-0023 e roda de novo `pnpm --filter @detran/shared test` e `policy-routes.e2e`
  (`pnpm backend:test:e2e`).
- Ordem de merge final recomendada: **R-0025 → R-0026 → R-0027**. R-0027 é a última porque:
  - acrescenta um ator técnico e chaves `…-portal` sobre comandos RAIT que R-0025 readequa (`protocol`,
    `withdraw`, `answer-inquiry`);
  - consome `rait.decision.published`, produzido por R-0026.
- Integrar as duas rodadas por último reduz o conflito a um único passo. A ordem não bloqueia o
  desenvolvimento paralelo: se R-0027 ficar pronta antes, mescla antes, e as outras aplicam a mesma
  regra.

**Abertura empilhada.**

- A rodada pode abrir e trabalhar sobre `origin/orchestra/stynx-dedup` (R-0024) assim que esse
  branch estiver publicado com `docs/framework/arch/frontend-wiring-pattern.md`. O teste do
  checkpoint (a) passa a olhar essa base.
- Novas revisões de R-0024 entram por `git merge --no-edit origin/orchestra/stynx-dedup`, nunca por
  rebase de branch publicado.
- Não é preciso empilhar sobre R-0025 nem R-0026. Os comandos-alvo já existem em `main`, e o
  consumo de `rait.decision.published` pelo Portal já existe.
- Só o **PR final** espera o merge de R-0024 em `main`, que exige R-0022 e R-0023.
- A rodada não troca implementação STYNX. O requisito de STYNX 1.5.0 final chega por
  transitividade: R-0022 só mescla com 1.5.0 final (OD-S15-01).
- O esquema do manifesto (CTG-0005) segue a regra do prompt: em `main` ou empilhado em
  `orchestra/user-docs`.

**Sequência final** (C-0002 §12, na ordem):

1. `git merge --no-edit origin/main`, com R-0024 (e, transitivamente, R-0022/R-0023) em `main`.
   - Conflito em `policy.ts` segue a regra de convivência acima.
   - TASK-0011 regrava o delta de disponibilidade sobre o `main` integrado se tiver medido na base
     empilhada.
2. CI local completo, com os greps dos critérios:
   - `pnpm check`;
   - `pnpm --filter @detran/shared test`;
   - `pnpm --filter @detran/portal-requests test:unit` e `pnpm --filter @detran/inf-collection test:unit`;
   - `pnpm backend:test:ci`;
   - `pnpm backend:test:e2e` (`policy-routes.e2e`);
   - `pnpm --filter @detran/app test:e2e` (jornadas e perfil bancário);
   - `pnpm --filter @detran/portal-web typecheck`, `lint`, `test` e `build`;
   - `pnpm contracts:check`, e `pnpm contracts:openapi` + `pnpm contracts:test` se houver contrato
     novo de junta;
   - `pnpm verify:parameter-catalogue`;
   - `pnpm docs:kb:check` e `pnpm docs:kb:publish-check`;
   - `pnpm format:check`;
   - `pnpm stack:start` + `pnpm stack:smoke`, com `reports/TASK-0010.md` refeito se o `main`
     integrado mudou código tocado;
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma** delivery-review (Opus 5.5 pela ponte) sobre o diff inteiro:
   - `REVIEW`: correções só nos itens apontados, no máximo 2 ciclos;
   - `FAIL`: `escalated`.
4. **Um** PR contra `main`, com a tabela CTG → tarefas → commits e os gates. A issue da frente é
   referenciada nele.
5. CI remoto e merge só com CI verde e `PASS`.
6. Publicação final:
   - `evidence-R-0027.json` com os 5 CTGs;
   - `devai evidence record` + `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json` (junta como exceção declarada, OD-R27-002);
   - `devai round close` + `round seal`;
   - `waves.md` e `backlog.md` atualizados.

**Janelas recalibradas:** 3 → **≈ 2,5** (2 a 3). Estimativa por onda:

| Etapa                | Janelas |
| -------------------- | ------- |
| O1 + O2              | ≈ 1     |
| O3 + O4              | ≈ 1     |
| O5 + sequência final | ≈ 0,5   |

- O caminho crítico é serial: TASK-0006 → TASK-0008 → TASK-0009 → TASK-0010.
- O ganho vem da remoção de 5 ciclos de PR/CI/evidência e da espera pelo lock partilhado.

## Decisões do Owner (2026-09-26)

- **OD-R27-001 = (a), ator técnico `portal-delegation`.** A delegação executa o comando de servidor
  com um ator técnico próprio do Portal e com chaves de política dedicadas (`…-portal`) em
  `policy.ts`, no formato de dados da R-0023. O cidadão fica registrado como `onBehalfOf` na
  auditoria (`details`/`correlation`) e como parte do caso (requerente). O prazo parte do
  `protocolled_at` emitido pelo Portal. O ramo de ingresso é o do comando de protocolo do domínio
  alvo, executado pelo ator técnico, sem abrir rotas de servidor ao login gov.br. Fica vetada a
  chamada in-process sem avaliação de política. A fila assíncrona (d) fica registrada como evolução
  futura, fora da C-0002. Este padrão vale também para os comandos cidadãos da R-0032 (C-0002 A9).
- **OD-R27-002 = (b).** `junta_medica` permanece indisponível nesta rodada (fail-closed) e é
  entregue inteira pela R-0032, com contrato, vínculo, marco de ciência e prazo calculados no
  servidor. O fechamento de R-0027 registra a junta como **exceção declarada** ao critério C-0002 §5
  "sem `SERVICE_UNAVAILABLE` de delegação disponível", por decisão do Owner, e não como PASS.
- O CTG-0003 está liberado quanto à identidade. Continua serializado com a R-0025 em
  `MOD-shared-policy`.

## Estado de partida (verificado em 2026-09-26 sobre `a92ef731`)

- **Alvos indisponíveis:** `backend/app/src/portal-delegation.providers.ts:118-124` compõe
  `defesa_previa` (`ait`), `recurso_jari` (`ait`,`case`), `recurso_cetran` (`case`),
  `indicacao_condutor` (`ait`), `pagamento` (`ait`), `junta_medica` (`exam`) e
  `DILIGENCE_DELEGATION_KEY = 'inf:rait-case:answer-inquiry'` (`case`) como
  `UnavailableDelegationTarget(…, 'delegacao_indisponivel_r0007')`. O comentário das linhas 5-12
  ("R-0007 não está em `main`… tarefa de R-0014 (M23)") está obsoleto: R-0007 está em `main`.
  Efeito: `POST /v1/portal/requests` → 422 `PORTAL.SERVICE_UNAVAILABLE`
  (`backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts:71-93`).
  Interface: `DelegationTarget { serviceKey; targetKinds; availability(); delegate(input) }`
  (`delegation.service.ts:58-65`); padrão de alvo real já em uso: `SneEnrollmentDelegationTarget`
  (`portal-delegation.providers.ts:55-99`).
- **Fora de escopo, permanecem indisponíveis (decisão do coordenador; #125):** `lgpd_declaracao`
  (`privacy_endpoint_pendente`, OD-P17) e `emissao_crlv` (`documento_assinado_pendente_r0014`). O
  critério "nenhum `SERVICE_UNAVAILABLE` de delegação disponível" (C-0002 §5) não os alcança; o
  delta de disponibilidade os registra como `indisponivel-nesta-versao` com a OD/issue.
- **Testes pendentes:** `backend/domains/portal/requests/src/handwritten/requests.service.spec.ts:1398-1416`
  (`describe('CTG-0002 §3.2 — delegações reais (C-0002-28, R-0007)')`, 6 `it.todo`: defesa →
  `inf:rait-case:protocol`; indicação → `inf:infraction:indicate-driver`; pagamento →
  `inf:collection:issue`; diligência → `inf:rait-case:answer-inquiry`; withdraw → `inf:rait-case:withdraw`;
  `AGUARDANDO_PAGAMENTO` → `PROTOCOLADO` por `PAGAMENTO_CONFIRMADO`); e2e
  `backend/app/tests/e2e/portal-requests.e2e.spec.ts:776` (withdraw) e `:868` (diligência). O e2e
  C-0002-70 (`:780`) hoje **assere** o 422 `delegacao_indisponivel_r0007` — substituição declarada aqui.
  O `it.todo` de `:1417` (`emissao_crlv` com débito → `AGUARDANDO_PAGAMENTO`, R-0014) **fica** (fora de
  escopo, #125). `withdraw` (`requests.service.ts:942-990`) hoje não chama alvo algum; a diligência
  passa por `respondDiligence` (`:1207-1223`); `DILIGENCE_DELEGATION_KEY` está duplicada em
  `requests.service.ts:305`.
- **Política × cidadão (bloqueio estrutural):** `PORTAL_RULES` (`policy.ts:1681-1710`) é só `CIDADAO`;
  os comandos-alvo são de papéis de servidor — `inf:rait-case:protocol` só `rait-secretary`
  (`policy.ts:1916`, sem curinga), `answer-inquiry` (`:1466`), `withdraw` (`:1469`),
  `indicate-driver` (`:1811`), `collection:issue` (`:1821`), junta `create` (`:332`); e
  `RaitCaseCommandService.protocol` confere `principal.id === actorId` (`rait-case-command.service.ts:919-924`).
  A identidade sob a qual a delegação executa (ator técnico do Portal com chave própria × principal
  do cidadão × chamada in-process sem política) é decisão de Architect com efeito de segurança —
  **OD-R27-001**, decidida pelo Owner em 2026-09-26: (a) ator técnico `portal-delegation`.
- **Comandos-alvo existentes** (contratos em `docs/framework/contracts`; clientes tipados em
  `packages/api-clients/src/generated/`):

  | Serviço Portal                                    | Operação                                                                                       | Contrato                                                                       | Serviço in-process                                                                              |
  | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
  | `defesa_previa`, `recurso_jari`, `recurso_cetran` | `raitCaseProtocol` `POST /v1/inf/rait/cases`                                                   | `BP-INF-RAIT-CASE-001.commands.openapi.json`                                   | `RaitCaseCommandService` (`inf/rait-case/src/handwritten/rait-case-command.service.ts:510`)     |
  | withdraw (desistência)                            | `raitCaseWithdraw` `POST …/cases/{id}/commands/withdraw`                                       | idem                                                                           | idem                                                                                            |
  | diligência                                        | `raitInquiryAnswer` `POST /v1/inf/rait/inquiries/{id}/commands/answer`                         | idem                                                                           | `RaitInquiryCommandService` (`rait-inquiry-command.service.ts:88`)                              |
  | `indicacao_condutor`                              | `infractionIndicateDriver` `POST /v1/inf/infraction/infractions/{id}/commands/indicate-driver` | `BP-INF-INFRACTION-001.commands.openapi.json`                                  | `InfractionCommandService` (`inf/infraction/src/handwritten/infraction-command.service.ts:145`) |
  | `pagamento`                                       | `collectionDocumentIssue` `POST /v1/inf/collection/collection-documents`                       | `BP-INF-COLLECTION-001.commands.openapi.json`                                  | `CollectionCommandsController` / serviço de `@detran/inf-collection`                            |
  | `junta_medica`                                    | `POST /v1/ch/juntas/cases` (`@Action('create')`, `ch:junta`)                                   | **sem** `*.commands.openapi.json` (só CRUD em `BP-CH-JUNTAS-001.openapi.json`) | `JuntaLifecycleService.submit` (`ch/juntas/src/junta-lifecycle.service.ts:131`)                 |

  Pontos abertos que TASK-0001 confirma: distinção JARI × CETRAN × defesa no corpo de
  `raitCaseProtocol`; OD-P19 ("`junta_medica` delegação PEC sem comando") está desatualizada pelo
  controlador acima, mas a rota manuscrita não tem contrato; **nenhum produtor de
  `PAGAMENTO_CONFIRMADO`** em `backend/domains/inf/collection/src` (OD-P28 segue aberta — só o
  consumidor em `portal/projections`).

- **Porta bancária:** `backend/domains/inf/collection/src/handwritten/index.ts:18-21` —
  `BANK_PORT = { provide: 'BANK_PORT', useFactory: () => createMockBankPort(new SystemClock()) }`,
  incondicional em **todos** os perfis (ADR-0017 §Decision 4). Padrão fail-closed existente:
  `backend/app/src/detran-runtime.ts:67-88` (`DETRAN_RUNTIME_PROFILE` ∈ `local-sandbox|test|staging-like|production`;
  `isLocalRuntimeProfile`), provado por `backend/app/tests/e2e/runtime-profiles.e2e.spec.ts`.
- **Cartão:** `portal.card_payment` = `false` (`parameter-catalogue.md:86`, OD-P05/DT-031, DT-072);
  `apps/portal/web/src/app/features/pagamento/payment-flags.ts` (`cardPayment: false`,
  `installments: false`). Permanece **off**; nada aqui liga cartão.
- **Portal web** (`@detran/portal-web`): rotas afetadas no `app.route-manifest.ts` (8):
  `autos/:aitId/defesa/nova` (`defesa_previa`), indicação (`indicacao_condutor`),
  `autos/:aitId/pagamento` e `…/pagamento/preservando-recurso` (`pagamento`),
  `processos/:requestId/diligencia/:diligenceId`, recurso JARI e CETRAN (`recurso_*`),
  `exames/:examId/junta/nova` (`junta_medica`). Superfícies "indisponível" em
  `features/{defesa,indicacao,pagamento,processos,exames}/pages/*`, `core/guards/service-availability.guard.ts`,
  `core/pages/service-unavailable.page.ts`; schemas já existem em `forms/`
  (`defesa-previa`, `recurso-jari`, `recurso-cetran`, `indicacao-condutor`, `pagamento`,
  `junta-medica`, `resposta-diligencia`, `desistencia`).
- **ODs do Portal** (registro canônico `docs/framework/arch/portal-build-pack.md` §4) que tocam a
  rodada: OD-P05 (cartão), OD-P17 (LGPD, fora), OD-P19 (junta), OD-P28 (evento de pagamento), OD-P32
  (pré-preenchimento), OD-P41 (tiers de pagamento), OD-P43 (vocabulário decisão/diligência), OD-P67
  (nível de assinatura da diligência — Owner/LEGAL), OD-P72 (formas de pedido/diligência), OD-P74
  (meios de pagamento), OD-P76 (prorrogação de diligência). **Bloqueantes candidatas:** OD-P67 (nível
  de assinatura da resposta de diligência) e OD-P28 (confirmação de pagamento) — TASK-0001 classifica
  cada uma como bloqueante (serviço fica fail-closed com OD) ou não.

## Metas

1. **Matriz de delegação** (CTG-0001): uma linha por serviço (7 delegações + withdraw), com comando,
   operação, serviço in-process, mapeamento `draft → DTO`, `targetKinds`, `externalId`, pré-estado,
   Idempotency-Key, papel/ator técnico e chave de política, erros → `portal-error-catalog.md`, e
   classificação `ligado` | `fail-closed-OD`. ODs novas `OD-R27-nnn` no registro canônico no mesmo PR.
2. **Porta bancária explícita por perfil** (CTG-0002): mock **explícito** só em `local-sandbox`/`test`;
   em `staging-like`/`production` a composição falha fechada enquanto não houver provedor real
   (C-0002 §4: nenhuma integração bancária real). Cartão continua off.
3. **Delegações reais no backend** (CTG-0003): `UnavailableDelegationTarget` de
   `delegacao_indisponivel_r0007` = 0; os 6 `it.todo` do spec de serviço e os 2 do e2e viram testes;
   e2e de jornada por serviço contra mocks (SENATRAN mock, banco mock, sem rede externa).
4. **Telas do Portal** (CTG-0004): as 8 rotas saem do estado indisponível pelo padrão de ligação de
   R-0024 (cliente de comando, If-Match/Idempotency-Key, mapeamento de erros, estados de tela, SSE
   canônico, guarda por política), sem variantes; `lgpd`/`crlv` inalterados.
5. **Documentação e delta** (CTG-0005): `docs/framework/arch/availability/portal-web.availability.json`, build pack, `portal-frontends.md`
   §6/§10, backlog, comentário obsoleto de `portal-delegation.providers.ts` (feito em CTG-0003).

## Tarefas (proposta — o maestro deriva `tasks/*.json` e `prompts/TASK-nnnn.md` no bootstrap)

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                                                                                | Depende de           | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | -------------------- | ------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r27-delegation-matrix`                                                                                                         | —                    | `delegation-matrix.md` (8 linhas, colunas da meta 1; JARI×CETRAN×defesa no corpo de `raitCaseProtocol`; ator da delegação conforme OD-R27-001 e chaves novas em `policy.ts`); triagem das OD-P da lista (bloqueante/não/fechada por fonte); decisão sobre a junta sem contrato (contrato de comando novo × consumo in-process tipado — recomendação na OD); `contracts/CTG-0002.md` (porta bancária) e `contracts/CTG-0003.md` (alvos, eventos, e2e de jornada, critérios C-27-3-nn) |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-portal-build-pack-od`, `MOD-kb-backlog`                                                                                        | TASK-0001            | `portal-build-pack.md` §4: situação das OD-P triadas e novas `OD-R27-nnn` (texto de TASK-0001); `backlog.md:103-107` reescrito; corpo da issue da frente (o maestro a abre com `gh issue create`)                                                                                                                                                                                                                                                                                    |
| TASK-0003 | Inspector            | inspector-tests     | Terra / médio  | `MOD-inf-collection-tests`, `MOD-app-e2e-runtime`                                                                                   | TASK-0001            | testes: por perfil, `BANK_PORT` resolve mock explícito (`local-sandbox`, `test`) e a composição **falha** em `staging-like`/`production` sem provedor; caso novo em `runtime-profiles.e2e.spec.ts`; caracterização prévia do comportamento atual (antes da troca)                                                                                                                                                                                                                    |
| TASK-0004 | Engineer             | engineer-backend    | Terra / médio  | `MOD-inf-collection-bank` (A-C2-15; `MOD-app-composition` espera R-0022)                                                            | TASK-0003            | fábrica de `BANK_PORT` por perfil conforme `contracts/CTG-0002.md` somente se couber integralmente em `inf/collection`; se o contrato exigir composição no app, tarefa em espera por R-0022, sem edição                                                                                                                                                                                                                                                                              |
| TASK-0005 | Inspector            | inspector-tests     | Terra / médio  | `MOD-portal-requests-tests`, `MOD-app-e2e-portal`                                                                                   | TASK-0001            | converte os 6 `it.todo` de `requests.service.spec.ts:1398-1416` e os 2 de `portal-requests.e2e.spec.ts:776,868`; substitui a asserção 422 de C-0002-70 pela delegação real (declarado aqui, não é enfraquecimento); e2e de jornada por serviço (pedido → delegação → `externalId` → estado → evento/SSE) em `portal-journeys.e2e.spec.ts` contra mocks; negativos: sem papel, pré-estado inválido, idempotência repetida, `lgpd`/`crlv` ainda 422                                    |
| TASK-0006 | Engineer             | engineer-backend    | Sol 6 / médio  | `MOD-app-portal-delegation`, `MOD-portal-requests`, `MOD-shared-policy` (OD-R27-001 (a) exige chaves novas; serializado com R-0025) | TASK-0005, TASK-0004 | alvos reais em `portal-delegation.providers.ts` (um `DelegationTarget` por linha `ligado`; `fail-closed-OD` com motivo novo `OD-R27-nnn`, nunca `delegacao_indisponivel_r0007`); comentário 1-12 corrigido; entradas de política se previstas; testes verdes                                                                                                                                                                                                                         |
| TASK-0007 | Architect            | architect-blueprint | Terra / alto   | `MOD-r27-contract-ctg4`                                                                                                             | TASK-0001            | `contracts/CTG-0004.md`: aplicação de `frontend-wiring-pattern.md` às 8 rotas (estados, erros, If-Match/Idempotency-Key, SSE de andamento, remoção das superfícies "indisponível" só onde a matriz diz `ligado`), `payment-flags.ts` × `payment.methods` (OD-P74), critérios C-27-4-nn                                                                                                                                                                                               |
| TASK-0008 | Inspector            | inspector-tests     | Terra / médio  | `MOD-portal-web-tests`                                                                                                              | TASK-0007, TASK-0006 | specs das 8 páginas/facades: submissão emite a requisição do contrato, estados (carregando, erro, fail-closed com OD), cartão/parcelamento sempre indisponíveis, `lgpd`/`crlv` inalterados; guarda por política presença **e** ausência                                                                                                                                                                                                                                              |
| TASK-0009 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-portal-web-features`                                                                                                           | TASK-0008            | ligação das telas pelo padrão de R-0024; testes verdes                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0010 | Inspector            | inspector-tests     | Luna / médio   | `MOD-r27-stack-smoke`                                                                                                               | TASK-0009            | smoke das 8 jornadas na stack local (`pnpm stack:start`, runbook de R-0017) com requisição, resposta e evento; `reports/TASK-0010.md`; nenhum código                                                                                                                                                                                                                                                                                                                                 |
| TASK-0011 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs-portal`, `MOD-r27-availability`                                                                                           | TASK-0010            | `docs/framework/arch/availability/portal-web.availability.json` (esquema de R-0030: 8 rotas `disponivel` ou `indisponivel-nesta-versao`+OD; `lgpd`/`crlv` com #125); `portal-build-pack.md` §1/§3/WP-P2; `portal-frontends.md` §6/§10; `apps/portal/web/README.md`; `waves.md` §Histórico; backlog                                                                                                                                                                                   |

- CTG-0001 = 0001 → 0002. CTG-0002 = 0003 → 0004 (porta bancária; livre, sem `MOD-shared-policy`).
- CTG-0003 = 0005 → 0006 (TASK-0005 pode correr em paralelo à TASK-0003; só a TASK-0006 espera o CTG-0002 commitado na branch; OD-R27-001 = (a), decidida; lock `policy.ts` partilhado com R-0025/R-0026 sob a regra de convivência de §Execução OD-C2-005).
- CTG-0004 = 0007 → 0008 → 0009 → 0010. CTG-0005 = 0011.
- Commits por CTG na branch única; um PR no fim (OD-C2-005). TASK-0003 ∥ TASK-0005 ∥ TASK-0007 (locks disjuntos); no máximo três por vez.

**Checkpoints do maestro (Engineer):** (a) bootstrap: `test -f docs/framework/arch/frontend-wiring-pattern.md`
(ausente → não abre); linha de base `pnpm --filter @detran/portal-requests test:unit` e
`pnpm --filter @detran/portal-web test` com a contagem de `todo` em §Leitura; (b) antes de TASK-0006:
`gh pr list --state open --search "policy.ts"` e estado de `orchestra/rait-web-wiring`, só para registro
em §Concorrência. Sob a OD-C2-005, TASK-0006 não espera; o conflito se resolve na sequência final; (c) antes de TASK-0010: `pnpm stack:start` e `pnpm stack:status` verdes.

## Critérios de aceitação (comandos → resultado)

- `grep -rn "delegacao_indisponivel_r0007\|delegationR0007" backend apps/portal/web/src` → nenhuma linha.
- `grep -n "unavailable(" backend/app/src/portal-delegation.providers.ts` → só `lgpd_declaracao` e
  `emissao_crlv` (mais alvos `fail-closed-OD` listados na matriz, cada um citando `OD-R27-nnn`).
- `grep -n "it.todo" backend/domains/portal/requests/src/handwritten/requests.service.spec.ts backend/app/tests/e2e/portal-requests.e2e.spec.ts | grep R-0007`
  → nenhuma linha.
- `pnpm --filter @detran/portal-requests test:unit`, `pnpm --filter @detran/inf-collection test:unit`
  → verdes; `pnpm --filter @detran/app test:e2e` → verde com as jornadas novas e o caso de perfil
  bancário; `pnpm backend:test:ci` → verde.
- Perfil bancário: com `DETRAN_RUNTIME_PROFILE=production` (ou `staging-like`) a composição do app
  falha com erro explícito sobre `BANK_PORT`; em `local-sandbox`/`test` compõe o mock (teste de TASK-0003).
- `pnpm --filter @detran/portal-web typecheck`, `lint`, `test`, `build` → verdes.
- `grep -n "cardPayment: false\|installments: false" apps/portal/web/src/app/features/pagamento/payment-flags.ts`
  → 2 linhas; `portal.card_payment` segue `false` em `parameter-catalogue.md`.
- `pnpm contracts:check` → sem diff (salvo contrato novo de junta decidido pelo Owner, então
  `pnpm contracts:openapi` + `pnpm contracts:test` verdes); `pnpm verify:parameter-catalogue` →
  `0 errors`; `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check` → OK.
- `node -e 'JSON.parse(require("fs").readFileSync("`docs/framework/arch/availability/portal-web.availability.json`","utf8"))'`
  → sem erro; conformidade ao esquema de R-0030 pelo gate que R-0030 entregar (se já em `main`).
- Smoke na stack (TASK-0010): 8 jornadas com resultado por serviço; o CTG-0004 não abre PR sem o relatório.
- `pnpm check` → verde. DEVAI: `evidence record`/`verify` por CTG, `audit observe` no SHA de cada
  merge, `round close` + `round seal` com âncora na cadeia.

## Mapa entregável → definições

| Entregável          | Definição                                                                                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| matriz de delegação | `portal-build-pack.md` §2 WP-P2, §4; `work/rounds/R-0009/plan.md` M8/M23; `portal-route-contract.md`; `BP-INF-RAIT-CASE-001`, `BP-INF-INFRACTION-001`, `BP-INF-COLLECTION-001` (`*.commands.openapi.json`); `BP-CH-JUNTAS-001.openapi.json` + `ch/juntas/src/junta-commands.controller.ts` |
| erros               | `portal-error-catalog.md`; `rait-error-catalog.md`                                                                                                                                                                                                                                         |
| porta bancária      | ADR-0017; `backend/domains/inf/collection/src/handwritten/ports/bank/{bank.port.ts,bank.mock.ts}`; `backend/app/src/detran-runtime.ts:67-88`                                                                                                                                               |
| pagamento/cartão    | OD-P05/DT-031/DT-072; `parameter-catalogue.md:86`; `payment-flags.ts`; OD-P74                                                                                                                                                                                                              |
| telas               | `portal-frontends.md` §4, §6, §7, §10; fichas `docs/framework/product/transversal/portal/screens/IU-PORTAL-T*.md`; `apps/portal/web/src/app/app.route-manifest.ts`                                                                                                                         |
| padrão de ligação   | `docs/framework/arch/frontend-wiring-pattern.md` (R-0024)                                                                                                                                                                                                                                  |
| delta               | `work/rounds/R-0030/availability-manifest.schema.md` (R-0030); C-0002 §3.5                                                                                                                                                                                                                 |

## Decisões pendentes (propostas; TASK-0002 registra em `portal-build-pack.md` §4)

| OD         | Pergunta                                                                                                                                                                           | Opções                                                                                                                                                                                                                     | Recomendação do Architect                                                                                       | Decisor                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| OD-R27-001 | **Decidida pelo Owner em 2026-09-26 — ver §Decisões do Owner.** Sob que identidade a delegação executa o comando de servidor                                                       | (a) ator técnico `portal-delegation` com chaves próprias em `policy.ts` (auditoria com `onBehalfOf` = cidadão); (b) principal do cidadão com chaves novas `CIDADAO` nos domínios-alvo; (c) chamada in-process sem política | (a): mantém a política como fonte única (R-0023) e a trilha de auditoria; (c) é vetada (contorna a autorização) | Architect (efeito de segurança: reviewer confirma) |
| OD-R27-002 | **Decidida pelo Owner em 2026-09-26 — ver §Decisões do Owner.** `junta_medica`: rota manuscrita `POST /v1/ch/juntas/cases` sem contrato e fora do catálogo de 15 serviços (OD-P19) | (a) contrato `BP-CH-JUNTAS-001.commands.openapi.json` + serviço no catálogo; (b) manter `fail-closed-OD` até R-0031 (PEC web, ADR-0034)                                                                                    | (b) se o Owner não incluir a junta no catálogo; (a) caso contrário                                              | Owner                                              |
| OD-R27-003 | Confirmação de pagamento sem produtor de `PAGAMENTO_CONFIRMADO` (OD-P28)                                                                                                           | (a) produtor em `inf/collection` ao reconciliar (`collectionPaymentReconcile`), com esquema de evento; (b) guia emitida e avanço de estado adiado                                                                          | (a), com contrato de evento fixado por TASK-0001                                                                | Architect                                          |
| OD-R27-004 | Nível de assinatura da resposta de diligência (OD-P67) e das peças (OD-P01: ouro)                                                                                                  | (a) manter o manifesto vigente; (b) elevar                                                                                                                                                                                 | não decidir: segue OD-P67 (Owner/LEGAL); a UI aplica o nível do manifesto                                       | Owner/LEGAL                                        |

## Riscos

- **Vocabulário JARI/CETRAN/defesa** no protocolo RAIT não fechado por fonte → linha `fail-closed-OD`,
  nunca inferência.
- **Confirmação de pagamento sem produtor** (OD-P28): o pagamento pode emitir guia (`collectionDocumentIssue`)
  mas o avanço `AGUARDANDO_PAGAMENTO → PROTOCOLADO` fica sem evento; TASK-0001 decide se o `it.todo`
  correspondente sai por OD ou por produtor novo em `inf/collection` (este, só com contrato).
- **Junta sem contrato de comando:** criar `BP-CH-JUNTAS-001.commands.openapi.json` altera contratos
  (ADR-0003); se o Owner não decidir, `junta_medica` fica `fail-closed-OD` e o critério de C-0002 §5
  registra a exceção no closure como não cumprido.
- **Lock `MOD-shared-policy`** com R-0025/R-0026: edição em branches separados; o conflito se resolve
  no merge final pela regra de convivência de §Execução OD-C2-005, nunca com `--force`.
- **Fail-closed bancário** pode quebrar um perfil `staging-like` usado em CI/stack: o Inspector
  caracteriza antes e o runbook de R-0017 recebe a variável explícita.

## Lições aplicadas (C-0001; C-0002 §4)

- Relatórios em `reports/` versionados (`git add -f` até R-0018 corrigir o `.gitignore`); após cada
  `git add`, comparar `find <dir> -type f` com `git ls-files <dir>` (R-0016).
- Critérios imutáveis: mudança só por adenda numerada com decisão do Owner; critério substituído
  aparece no closure como não cumprido (vetadas as substituições de R-0013/R-0014 e o waiver SQL2 de R-0007).
- ODs no registro canônico (`portal-build-pack.md` §4) no mesmo PR; OD só em `contracts/` não conta.
- Âncora da prova: `evidence record`/`verify`, `audit observe` no SHA exato do merge, `round close`
  - `round seal` (DEVAI 1.5.6).
- Orçamento: `budget.json`; a 80 % da janela, checkpoint e parada.
- Caracterização antes de troca: o comportamento atual de `BANK_PORT` e das delegações é fixado em
  teste antes da troca (TASK-0003/TASK-0005).
- Nenhum Engineer entrega o teste do próprio artefato; nenhum arquivo gerado editado; nenhum `--force`;
  nenhum valor normativo inventado (`source_pending`); nenhuma integração externa real.

## Adendas

## Decisões do maestro

- **M1 (bootstrap da sessão A).** Maestro Codex `gpt-6-sol`; Architect e tarefas
  grandes no mesmo modelo; escada de workers `gpt-5.6-terra` e `gpt-6-luna`.
  Reviewer Claude Code `claude-opus-5-5` pela ponte. `codex --help` e
  `claude --help` expõem `--model`; os ids exatos vêm da escada verificada em
  R-0018 (`docs/meta/agents/orchestra/model-ladder.md`). A ponte validará o id
  Claude na chamada do prompt-review. Base: `origin/main` em `38c7971`.
- **M2 (escopo A-C2-15).** A composição de `BANK_PORT` será especificada primeiro.
  TASK-0004 só prossegue se couber integralmente em `inf/collection` sem importar
  o app no domínio e sem editar `app.module.ts` ou `detran-runtime.ts`.
- **M3 (prompt-review).** Opus 5.5 devolveu `PASS`, sem achado high, no único
  ciclo de prompt-review da Sessão A. O primeiro transporte falhou porque a
  resposta veio em cerca Markdown; o retry do mesmo ciclo produziu JSON válido
  em `reviews/prompt-review-1.json`.

## Concorrência

- R-0020: `orchestra/devai-sensors` remoto publicado; locks de CI,
  `.devai/config`, `law/register` e `record/` intocados nesta sessão.
- R-0022: `orchestra/stynx-sse-tenancy` remoto publicado; composição do app,
  serviços SSE, outbox, offline-sync e pin STYNX intocados.
- R-0023: `orchestra/authz-unification` em worktree local; `policy.ts` intocado.
- R-0032: `orchestra/portal-pec` em worktree local; seus contratos de junta
  aguardam R-0022. R-0024 não está publicada.

## Bloqueios

## Triagem

- TASK-0003 e TASK-0005: código não zero é RED aceito somente quando o relatório
  enumera os casos novos e a falha corresponde ao comportamento ainda ausente.
  Falha de DB, Redis, Cognito, importação ou timeout é bloqueio de harness.
- TASK-0004 em `blocked` por necessidade de composição no app dispensa os
  `acceptance_commands` do caminho implementado. O maestro confere que a
  fronteira de produção não tem diff atribuível à tarefa e registra R-0022.

## Retomada

## Leitura

- Bootstrap em `origin/main` `38c79714b9a48b1c66ee693817e200f1aeba8324`.
  Lidos `AGENTS.md`, `README.md`, `CODESTYLE.md`, Constituição Artigos 6–7,
  C-0002 §12/§14/§15/§16 do branch `origin/docs/c0002-a-c2-15`, este plano e
  `prompts/00-maestro.md`, ADR-0001/0017, método e escada da orquestra,
  `collection.module.ts`, `handwritten/index.ts`, porta bancária e perfil do app.
- Linhas de base: `@detran/inf-collection test:unit` 10/10; `@detran/portal-requests
test:unit` 97 PASS + 7 TODO; após compilar `@detran/ui` sem mudar fontes,
  `@detran/portal-web test` 1314 PASS + 14 TODO. O e2e focal de perfil teve
  4 PASS + 3 falhas de harness por ausência da tabela local
  `portal.public_hostname`; isso não é RED bancário.
- `pnpm exec devai doctor --repo-root . --format human`: OK; versão instalada
  DEVAI 1.5.6; `pnpm verify:round-tasks`: OK (320 tarefas) após a revisão.
