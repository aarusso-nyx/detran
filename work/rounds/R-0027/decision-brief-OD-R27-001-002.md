# Brief de decisão — OD-R27-001 e OD-R27-002 (R-0027 `portal-delegations`)

**Papel:** Architect (Constitution Art. 6), somente leitura do código. **Data:** 2026-09-26, sobre
`a92ef731`. **Pedido do Owner:** apresentar possibilidades e consequências de cada OD para decidir.
**Registro canônico:** as decisões vão para `docs/framework/arch/portal-build-pack.md` §4 no PR do
CTG-0001 de R-0027 (TASK-0002); este brief é insumo, não registro.

## 0. Fatos verificados no código (base comum das duas ODs)

| #   | Fato                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Onde                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| F1  | O `submit` do Portal **protocola primeiro** (`portal.protocol`, hash do recibo, evento `SOLICITACAO_PROTOCOLADA` no outbox) e **delega depois**, dentro da transação do Portal. Falha do alvo → 502 `PORTAL.DELEGATION_FAILED` com protocolo mantido (`retryPolicy: 'pendencia_interna'`).                                                                                                                                                                                                                                                                            | `requests.service.ts:754-935`                                                                                                     |
| F2  | O alvo recebe `identity` (claims gov.br: CPF, nível), `subject`, `protocol {number, issuedAt, receiptHash}` e o rascunho **não validado** pelo Portal.                                                                                                                                                                                                                                                                                                                                                                                                                | `delegation.service.ts:34-65`                                                                                                     |
| F3  | O vínculo cidadão ↔ alvo (dono/condutor/procurador do AIT, exame, caso) é verificado **só no Portal** (`portal.entitlement`, `representation`). Os domínios-alvo não conhecem o cidadão.                                                                                                                                                                                                                                                                                                                                                                              | `requests.service.ts:1512-1542`; `ddl/61-portal-identity.sql:70-85`                                                               |
| F4  | Os serviços-alvo abrem **transação própria** (`withTenantContext`, papel `app`, contexto do `RequestContext`): a delegação in-process **não é atômica** com a transação do Portal.                                                                                                                                                                                                                                                                                                                                                                                    | `shared/src/tenant-context.ts`; `rait-case-command.service.ts:926-928`                                                            |
| F5  | `RaitCaseCommandService.protocol` exige `principal.id === actorId`, tenant no principal, papel `rait-secretary` **e** vínculo ativo `inf.rait_pool_member` com `member_role='secretaria'` no pool da instância. A política tem regra especial: `inf:rait-case:protocol` não herda curinga nem admin global.                                                                                                                                                                                                                                                           | `rait-case-command.service.ts:919-924, 591-610`; `policy.ts:1916-1918`                                                            |
| F6  | O protocolo RAIT já prevê o canal e a tempestividade de origem: `intake_channel ∈ {balcao, portal, sne, postal}`, `protocol_number` e `protocolled_at` **vêm do chamador**; `instance ∈ {defesa_previa, jari, cetran}` com `circuit` 1/2. O requerente é dado (`inf.rait_party`: `requerente`/`procurador`, `legitimacy_basis`, `representation_verified`), não o ator.                                                                                                                                                                                               | `rait-case-command.service.ts:1001-1045`; `ddl/34-inf-rait-case.sql:66-82`                                                        |
| F7  | Demais alvos: `answer-inquiry` (analista/relator; exige `documentIds` já em `inf.rait_document`), `withdraw` (secretaria), `inf:rait-infraction:indicate-driver` (secretaria), `inf:rait-collection:issue` (`rait-finance`; o controlador grava `issued_by = actorId` e a política só existe no guarda HTTP via `@Resource/@Action`), `ch:junta:create` (`AUDITOR`, `GESTOR`, `GESTOR_DETRAN`). **Nenhum** admite `CIDADAO`.                                                                                                                                          | `policy.ts:332-337, 1466-1469, 1811, 1821`; `collection-commands.controller.ts:34-52`                                             |
| F8  | Auditoria: `audit.write(tenant, actor, role, action, entity, id, details, ip, station, correlation)` com cadeia de hash por tenant; **não há coluna `on_behalf_of`** — cabe em `details` (jsonb) e `correlation` (uuid). `StynxAuditModule` com `detranAuditSink` no app. Eventos de domínio levam `actor {kind, id, role}`.                                                                                                                                                                                                                                          | `ddl/12-audit-functions.sql:24-64`; `app.module.ts:752`; `infraction-command.service.ts:230-236`                                  |
| F9  | Precedente de **ator técnico**: job RENAEST (BOAT) e sweeper do Dashboard executam sob `RequestContextMutator.runWithRequestContext` com um `actorId` técnico por tenant (usuário em `auth.users` com papel dedicado), respeitando RLS.                                                                                                                                                                                                                                                                                                                               | `boat-renaest-job.service.ts:130`; `dashboard-sweep.providers.ts:105-120`; `@stynx-nyx/core` `request-context.d.ts`               |
| F10 | Junta: `POST /v1/ch/juntas/cases` (`@Action('create')`) chama `JuntaLifecycleService.submit({encounterId, applicantPatientId, track, reasonCode, reasonDetail?, resultKnownAt, requestedAt})`; grava `submitted_by = actorId`; sem Idempotency-Key; erros Nest em texto livre (sem código catalogado); prazo de 30 dias contado de `resultKnownAt` **informado pelo chamador**. Contrato só CRUD (`BP-CH-JUNTAS-001.openapi.json`), **sem** `*.commands.openapi.json`.                                                                                                | `ch/juntas/src/junta-commands.controller.ts`; `junta-lifecycle.service.ts:131-180`                                                |
| F11 | Formulário do Portal (`junta-medica.schema.ts`) envia só `{examId, reason (texto livre), attachmentIds}` com nível `avancada`; o comando PEC exige `encounterId`, `applicantPatientId`, `track` (MEDICAL/PSYCH), `reasonCode` taxonomizado e `resultKnownAt`. `portal.exam_view` é **esqueleto sem produtor** (`ch.exam.*` não é emitido pelo PEC). `junta_medica` tem linha em `act_level_policy` (seed) mas **não** está nos 15 serviços de `portal.service_catalog`.                                                                                               | `apps/portal/web/src/app/forms/junta-medica.schema.ts`; `exam-view.projection.ts:1-7`; `seed/70-fixtures-portal.sql:119, 202-221` |
| F12 | Norma de produto: o requerimento de junta é **do candidato** (RN-PEC-110 §1; Res. CONTRAN 927/2022 art. 12); "o ato administrativo interno pode continuar como canal de entrada (protocolo), mas o requerente é o cidadão" e o sistema precisa registrá-lo; UC-PEC-004 AC-3 registra como débito (DT-103) o `SUBMITTED` atribuído ao operador. Prazos do administrado (30 dias, arts. 12 e 13) são **preclusivos**, do conhecimento do resultado (RN-PEC-112). IU-PEC-001 P-04 = "Solicitar junta"; ADR-0034 §2 põe P-04 no Portal e §3 exige contrato antes da tela. | `RN-PEC-110.md`; `RN-PEC-112.md`; `UC-PEC-004.md`; `IU-PEC-001.md:62`; `ADR-0034`                                                 |

**Leitura jurídica comum (vale para toda opção).** Defesa, recursos, indicação de condutor, resposta
a diligência e requerimento de junta são **atos do administrado**; o protocolo/recebimento é **ato do
órgão**. O modelo de dados já separa as duas coisas (F6, F12): o requerente é **parte registrada**, o
ator é **quem recebeu/registrou pelo canal**. A tempestividade se ancora no protocolo do Portal
(`issuedAt`), que é emitido **antes** da delegação (F1) e pode ser repassado (`protocolled_at`,
`requestedAt`). Nenhuma opção abaixo precisa mudar o momento do protocolo; algumas precisam
**garantir** que o alvo use o carimbo do Portal e não o relógio da delegação.

---

## 1. OD-R27-001 — sob que identidade a delegação executa

### Opção 1a — Ator técnico `portal-delegation` com chaves próprias; cidadão como `onBehalfOf`

**Como funciona.** O `DelegationTarget` (no app, `portal-delegation.providers.ts`) resolve o ator
técnico do tenant corrente (usuário `auth.users` por tenant, papel novo `portal-delegation`, sem login
humano, como F9), abre `runWithRequestContext({tenantId: <do cidadão>, actorId: <técnico>})`, **avalia
explicitamente** a chave de política pelo provider único (hoje `isDetranActionAllowed`; após R-0023 o
provider do `StynxAuthorizationModule`) e chama o serviço tipado do domínio. O payload leva
`intake_channel='portal'`, `protocol_number`/`protocolled_at` do Portal, o requerente como parte
(`rait_party` com CPF/representação vindos do Portal) e um bloco `onBehalfOf {subjectId, cpfHash,
assuranceLevel, portalRequestId, portalProtocol, receiptHash}` que vai para `audit.details` e para o
`actor` dos eventos (`kind: 'service'`, `onBehalfOf`). `correlation` = `portal.request.id`.
Idempotency-Key determinística (`portal:<requestId>:<serviceKey>`).

**Mudanças.** `roles.ts` (+`portal-delegation`, fora de `GLOBAL_ADMIN_ROLES` e sem curinga); `policy.ts`
(chaves **novas e estreitas**, não o papel nas chaves de staff: `inf:rait-case:protocol-portal`,
`inf:rait-inquiry:answer-portal`, `inf:rait-case:withdraw-portal`, `inf:rait-infraction:indicate-driver-portal`,
`inf:rait-collection:issue-portal`, e `ch:junta:request-portal` se 002 ligar a junta); seed/DDL do
usuário técnico por tenant (padrão do sweeper); `RaitCaseCommandService.protocol` ganha ramo "ingresso
por canal" que troca o vínculo de pool da secretaria (F5) por `intake_channel='portal'` + papel técnico
(o pool é escolhido por instância/unidade, não pelo ator); o mesmo para `answer`/`withdraw`
(documentos do Portal registrados em `inf.rait_document` com `origin='requerente'`); coleta passa a
checar política no serviço (hoje só no guarda HTTP, F7); `audit.details`/evento com `onBehalfOf`.
Sem contrato HTTP novo para RAIT (in-process tipado; os contratos HTTP de staff ficam como estão).

**Consequências.**

- _Segurança/LGPD:_ o cidadão **nunca** recebe permissão de staff; superfície HTTP de staff inalterada.
  O vínculo cidadão ↔ alvo continua no Portal (F3), que é quem o conhece. Risco concentrado: o ator
  técnico é um "super-requerente" do tenant — mitigação: chaves só para canal `portal`, sem rota HTTP
  que as use, sem curinga, papel não atribuível por UI de provisionamento, e teste negativo de que
  nenhuma rota montada aceita `portal-delegation`. CPF só como hash em `audit.details`.
- _Autoria / não-repúdio:_ `audit.events.actor_id` = robô; o **autor do ato** fica provado pela
  cadeia Portal (claim gov.br com nível no momento, `consequence_ack`, recibo com hash, `onBehalfOf`
  com `receiptHash`) e pela parte `requerente` no RAIT. É o mesmo desenho do protocolo de balcão
  (servidor registra, cidadão é requerente) — juridicamente coerente com F6/F12. Assinatura PAdES da
  peça continua sob OD-P01/OD-P67 (não muda com a opção).
- _Tempestividade:_ `protocolled_at` = `issuedAt` do Portal; atraso/falha da delegação não afeta o
  prazo.
- _RLS/tenancy:_ tenant vem do contexto do cidadão (hostname → tenant), nunca do payload; o técnico
  precisa de vínculo em cada tenant; RLS intacta (papel `app`).
- _Acoplamento (ADR-0016/0020):_ Portal depende dos **serviços** públicos dos pacotes-alvo (já previsto
  em ADR-0019 §2); nenhuma leitura de tabela alheia. Domínios-alvo ganham só o conceito "canal" (já
  existente em RAIT).
- _R-0023:_ encaixa — as chaves são dados em `policy/` e avaliadas pelo provider único; a matriz
  papel × rota de R-0023 **não muda** (chaves sem rota). Exige que o provider seja chamável
  programaticamente (API já existe hoje; conferir na 1.5.0). O "conjunto fechado de principais" do
  gerador de matriz ganha `portal-delegation` (delta declarado, todas as linhas `403`).
- _R-0031/ADR-0034:_ é exatamente o padrão proposto para OD-PW-001 ("delegação pelo backend do Portal
  com vínculo de exame, sem conceder `CANDIDATO` à sessão") — uma regra só para RAIT e PEC.
- _Esforço:_ **+0,5 a 1 janela** sobre as 3 de R-0027 (TASK-0001 e TASK-0006 crescem; tarefa de
  Inspector nova para os negativos do ator técnico). Toca backend RAIT → lock com R-0025.
- _Reversibilidade:_ alta — trocar a identidade é trocar a fábrica do alvo; os dados (parte, canal,
  `onBehalfOf`) servem a qualquer opção futura.
- _Riscos:_ vazamento do ator técnico por uso fora do Portal; ramo "ingresso por canal" no protocolo
  RAIT mal delimitado (mitigar: só `intake_channel='portal'` com papel técnico; teste que secretaria
  humana não usa o ramo e técnico não usa o ramo de balcão).

### Opção 1b — Cidadão como principal direto, com `CIDADAO` nas regras dos comandos-alvo

**Como funciona.** O alvo chama o serviço sob o contexto do próprio cidadão (já ativo). `policy.ts`
acrescenta `CIDADAO` às chaves `inf:rait-case:protocol`, `answer-inquiry`, `withdraw`,
`indicate-driver`, `collection:issue`, `ch:junta:create`.

**Mudanças.** Política (6+ chaves de staff); `protocolContext` aceita `CIDADAO` e dispensa o vínculo
de pool (F5); cada serviço-alvo passa a precisar de **autorização por objeto** (o cidadão é dono do
AIT/caso/exame?), que hoje só o Portal sabe (F3) → ou lê `portal.entitlement` (vedado por ADR-0020 §4)
ou ganha projeção própria de vínculos; DTOs de staff aceitam campos que o cidadão não pode definir
(`unit_id`, `circuit`, `proofs`/prioridade, documentos `origin='oficio'`) → filtragem por papel.

**Consequências.**

- _Segurança:_ **as rotas HTTP de staff passam a aceitar a sessão gov.br** (`POST /v1/inf/rait/cases`
  etc.), porque a chave é a mesma para rota e chamada in-process: qualquer cidadão autenticado alcança
  a API de staff; risco de IDOR e de _mass assignment_; mistura dos pools Cognito cidadão × servidor.
  Exigiria guardas adicionais por rota para desfazer o que a política abriu.
- _Autoria:_ melhor rastro direto (`actor_id` = cidadão), mas **some o ato de recebimento do órgão** e
  a distinção requerente × registrador que o modelo RAIT e RN-PEC-110 pedem; procurador vira caso
  especial (quem é o ator: procurador ou representado?).
- _R-0023:_ a matriz papel × rota muda em dezenas de rotas RAIT/PEC (`CIDADAO` passa a `allow`),
  contra o objetivo "matriz idêntica" e a regra especial de `inf:rait-case:protocol`.
- _R-0031:_ leva naturalmente à alternativa "papel `CANDIDATO` na sessão" de OD-PW-001 (mudança de
  política com decisão do Owner).
- _Acoplamento:_ domínios `inf`/`ch` passam a conhecer identidade cidadã e vínculos do Portal.
- _Esforço:_ **+2 a 3 janelas**; alto risco de regressão de autorização. _Reversibilidade:_ baixa
  (abre superfície que depois precisa ser fechada com migração de matriz).
- **Não recomendada.**

### Opção 1c — Comandos de ingresso cidadão nos domínios-alvo, separados dos de staff

**Como funciona.** Cada domínio publica um comando estreito de ingresso, só in-process (sem rota HTTP),
com DTO mínimo e semântica de "petição recebida por canal": `inf:rait-case:file-petition`
(defesa/JARI/CETRAN), `inf:rait-inquiry:file-answer`, `inf:rait-case:file-withdrawal`,
`inf:infraction:file-driver-indication`, `inf:collection:issue-citizen-slip`, `ch:junta:file-request`.
Executado sob o **cidadão** como principal (variante 1c-i) ou sob o **ator técnico** de 1a (variante
1c-ii). O comando cria a parte `requerente`, liga documentos, dispara o fluxo de staff (ex.: o caso
nasce em estado de triagem pela secretaria).

**Mudanças.** 5–6 comandos novos com contrato tipado (interface de porta + teste de contrato; se
exposto em HTTP, `*.commands.openapi.json` e cliente gerado), chaves novas, DDL mínima (canal/parte
onde faltar — junta), testes por domínio.

**Consequências.**

- _Segurança:_ sem abrir comandos de staff; DTO estreito elimina _mass assignment_. Em 1c-i o problema
  de autorização por objeto de 1b volta (o domínio precisa saber que o cidadão é dono); em 1c-ii não.
- _Autoria:_ o nome do comando já diz "ato do administrado recebido"; em 1c-i o `actor_id` é o
  cidadão, em 1c-ii o robô + `onBehalfOf`.
- _Jurídico:_ o melhor encaixe semântico (petição ≠ protocolo de balcão); facilita que a secretaria
  admita/rejeite depois (admissibilidade continua ato de servidor).
- _R-0023:_ chaves novas sem rota → matriz inalterada (1c-ii) ou com linhas novas só para os comandos
  de ingresso (1c-i, se houver rota).
- _Acoplamento:_ um contrato por domínio — mais superfície, mas cada domínio decide o que aceita do
  canal. Toca `inf/rait-case`, `inf/infraction`, `inf/collection`, `ch/juntas` → locks com R-0025 e
  R-0031.
- _Esforço:_ **+2 janelas** (1c-ii) a **+3** (1c-i). _Reversibilidade:_ média (comandos novos ficam).
- _Nota:_ 1c-ii é a **evolução natural de 1a** no ponto onde o comando de staff não serve (F5: o
  protocolo RAIT exige secretaria de pool).

### Opção 1d — Fila/outbox assíncrona processada por worker técnico

**Como funciona.** O `submit` protocola e **não** chama o alvo: o evento `SOLICITACAO_PROTOCOLADA` (já
emitido no outbox, F1) é consumido por um worker que, por tenant, abre contexto com o ator técnico (F9)
e executa o comando-alvo (identidade de 1a ou 1c-ii); o resultado volta por evento e move o pedido para
`EM_ANDAMENTO_NO_ORGAO` com `externalId`.

**Mudanças.** Worker (jobs/outbox STYNX após R-0021/R-0022), estado intermediário "aguardando
delegação" no pedido (ou `PROTOCOLADO` estendido), evento de retorno, SSE do andamento; os 6 `it.todo`
e o e2e passam a esperar resultado assíncrono.

**Consequências.**

- _Robustez:_ elimina a não-atomicidade de F4 (at-least-once + idempotência), retentativa sem 502 ao
  cidadão, isola indisponibilidade dos domínios-alvo.
- _Tempestividade:_ preservada (protocolo síncrono), **desde que** o worker use `protocolled_at` do
  Portal — obrigatório, não opcional.
- _UX:_ o cidadão recebe o protocolo imediatamente, mas o número/estado do órgão chega depois (SSE).
- _Identidade:_ não resolve a OD sozinha — é transporte; herda 1a ou 1c-ii.
- _R-0023:_ igual a 1a. _R-0022:_ depende do log de eventos/outbox unificado.
- _Esforço:_ **+1,5 a 2 janelas** além da identidade. _Reversibilidade:_ alta (pode ser adotado depois
  de 1a sem mudar identidade nem dados).

### Opção 1e — Laço HTTP interno com credencial de serviço (M2M) pelo guarda real

**Como funciona.** O alvo faz `POST` à própria API (rota de staff ou de ingresso) com token de cliente
de serviço (Cognito _client credentials_; perfil local: verificador local), passando pela cadeia
`APP_GUARD` inteira.

**Consequências.** Máxima fidelidade à autorização única (a matriz de R-0023 cobre literalmente a
chamada); custo: segredo M2M por ambiente, latência, erro HTTP a mapear, credencial ainda inexistente
(OD-P15 análoga). Identidade = técnico (como 1a). **+1 janela.** Útil se o app for dividido em
serviços; hoje (monólito modular) é custo sem ganho material sobre 1a com avaliação explícita pelo
provider.

### Opção vetada — Chamada in-process sem política ("c" do plano)

Chamar o serviço-alvo sem avaliar política (ou construindo um `principal` sintético com
`rait-secretary`) **contorna a autorização**, falsifica o papel no `audit.events` e quebra o
objetivo de R-0023. Registrada apenas para constar como rejeitada.

### Matriz comparativa — OD-R27-001

| Critério                                  | 1a técnico + chaves próprias | 1b cidadão direto        | 1c-i ingresso sob cidadão   | 1c-ii ingresso sob técnico | 1d fila + worker (com 1a) | 1e HTTP M2M     |
| ----------------------------------------- | ---------------------------- | ------------------------ | --------------------------- | -------------------------- | ------------------------- | --------------- |
| Superfície HTTP de staff exposta a gov.br | não                          | **sim**                  | não                         | não                        | não                       | não             |
| Autorização por objeto                    | Portal (existente)           | domínio-alvo (nova)      | domínio-alvo (nova)         | Portal                     | Portal                    | Portal          |
| Autor do ato registrado                   | parte + `onBehalfOf`         | `actor_id`               | `actor_id` + parte          | parte + `onBehalfOf`       | parte + `onBehalfOf`      | idem 1a         |
| Ato de recebimento do órgão               | sim (canal `portal`)         | não                      | sim                         | sim                        | sim                       | sim             |
| Tempestividade pelo protocolo do Portal   | sim                          | sim                      | sim                         | sim                        | sim (obrigatório)         | sim             |
| Matriz R-0023                             | inalterada (+1 principal)    | muda em dezenas de rotas | linhas novas se houver rota | inalterada                 | inalterada                | inalterada      |
| Coerência com OD-PW-001 (R-0031)          | padrão proposto              | força papel na sessão    | parcial                     | padrão proposto            | padrão proposto           | padrão proposto |
| Atomicidade/retentativa                   | 502 + pendência              | 502 + pendência          | 502 + pendência             | 502 + pendência            | **at-least-once**         | 502 + pendência |
| Esforço extra (janelas)                   | 0,5–1                        | 2–3                      | 3                           | 2                          | +1,5–2 sobre 1a           | 1               |
| Reversibilidade                           | alta                         | baixa                    | média                       | média                      | alta                      | alta            |
| Risco principal                           | abuso do ator técnico        | IDOR / _mass assignment_ | acoplamento cidadão-domínio | volume de contratos        | complexidade assíncrona   | segredo M2M     |

---

## 2. OD-R27-002 — junta médica sem contrato de comando e fora do catálogo

**Estado real (F10–F12).** A rota existe mas: (i) não tem contrato de comando (ADR-0003; ADR-0034 §3
proíbe consumo sem contrato); (ii) o formulário do Portal não carrega os campos que o comando exige
(`track`, `reasonCode`, `resultKnownAt`, `encounterId`, `applicantPatientId`); (iii) o Portal não
consegue provar vínculo com o exame nem obter a data de ciência, porque `exam_view` não tem produtor
PEC; (iv) o comando não tem idempotência nem códigos de erro catalogados; (v) `submitted_by` registra
quem chamou — com delegação, seria o ator da OD-001, e RN-PEC-110 exige registrar o **candidato** como
requerente (DT-103). Ligar a junta em R-0027 é, portanto, trabalho de **PEC**, não só de Portal.

### Opção 2a — Contrato + catálogo agora, em R-0027 (junta ligada nesta rodada)

**Como funciona.** R-0027 escreve `BP-CH-JUNTAS-001.commands.openapi.json` (pelo menos `cases` e
`appeals`), acrescenta `junta_medica` como 16º serviço do catálogo, amplia o formulário do Portal
(trilha, motivo taxonomizado, data de ciência) e liga o alvo com a identidade da OD-001.

**Mudanças.** Contrato + cliente gerado (`pnpm contracts:openapi`); idempotência e códigos de erro na
junta (catálogo de erro PEC ainda não existe — é entregável de R-0031 TASK-0001); coluna de canal/
requerente em `ch.junta_case` (DDL) ou convenção `submitted_by` técnico + `applicant_patient_id`;
mapeamento CPF → `ch.patient` e `examId` → `encounterId` (exige leitura de PEC: projeção nova ou
porta tipada); produtor de `ch.exam.*` para `exam_view`; seed do catálogo; OD-P55 (15 serviços) e
OD-P19 revistas.

**Consequências.**

- _Jurídico:_ o cidadão exerce o prazo preclusivo de 30 dias (RN-PEC-112) online, com protocolo
  imediato; **mas** `resultKnownAt` sem produtor PEC seria autodeclarado pelo cidadão — tempestividade
  frágil (o prazo corre da ciência, que o sistema não saberia provar).
- _LGPD:_ dado de saúde (motivo, anexos clínicos) passa a transitar pelo Portal — exige tratamento
  de dado sensível já neste ciclo (RN-PEC-150/151), antes das fixtures e testes de integração PEC que
  R-0031 entrega.
- _Acoplamento/concorrência:_ R-0027 invade locks de R-0031 (`MOD-pec-contracts`, `ch/juntas`,
  seed `ch`) e antecipa decisões de OD-PW-001.
- _Esforço:_ **+1,5 a 2 janelas** e dependência de produtor PEC que não existe; risco alto de a
  rodada fechar com a junta "ligada" mas sem vínculo provável (fail-closed de fato).
- _Reversibilidade:_ média (contrato publicado só evolui por versão).

### Opção 2b — `fail-closed` com OD em R-0027; junta inteira em R-0031 (ADR-0034)

**Como funciona.** O alvo `junta_medica` troca `delegacao_indisponivel_r0007` por motivo novo
`OD-R27-002` (critério de aceitação de R-0027 já admite `fail-closed-OD`); a tela
`exames/:examId/junta/nova` fica "indisponível nesta versão" com a OD no manifesto. R-0031 entrega
contrato (TASK-0001), fixtures/integração `ch-juntas` (TASK-0004/0006/0007) e liga P-04 no Portal
(CTG-0006) com a identidade decidida em OD-R27-001 = OD-PW-001.

**Consequências.**

- _Governança:_ respeita ADR-0034 §3 (contrato antes da tela) e a ordem da campanha; sem invasão de
  locks.
- _Critério C-0002 §5:_ R-0027 fecha com **exceção declarada** (junta `indisponivel-nesta-versao`),
  como o plano já prevê nos Riscos; a campanha só cumpre o critério se R-0031 ligar a junta — o
  closure de R-0027 registra "não cumprido nesta rodada", não substituição de critério.
- _Cidadão:_ o direito continua exercido pelo canal presencial até R-0031 (sem regressão: hoje já é
  422).
- _Esforço em R-0027:_ ~0 (uma linha no mapa, uma OD). _Reversibilidade:_ total.
- _Risco:_ R-0031 é a última rodada; se escorregar, P-04 fica fora da versão.

### Opção 2c — Divisão: R-0027 fixa o comando de ingresso cidadão da junta; R-0031 acende

**Como funciona.** R-0027 escreve o contrato **do comando de ingresso** (`ch:junta:file-request`:
requerente = candidato, canal `portal`, `requestedAt` = protocolo do Portal, Idempotency-Key, códigos
de erro) e o `DelegationTarget` com `availability()` que devolve `OD-P19` enquanto `exam_view` não for
alimentado; R-0031 entrega produtor, fixtures e testes, e a disponibilidade vira `null` sem tocar o
Portal.

**Consequências.** Antecipa a parte que é do Portal e da OD-001; deixa com R-0031 o que é do PEC.
Resolve DT-103/RN-PEC-110 no desenho (candidato requerente, técnico/servidor como registrador). Exige
coordenação de lock `ch/juntas` e `MOD-pec-contracts` com R-0031 (R-0031 abre depois de R-0027: sem
conflito temporal, mas R-0031 TASK-0001 herda o contrato). **+0,5 a 1 janela.** Reversibilidade alta.

### Opção 2d — Junta fora do Portal (só canal presencial/clínica)

**Como funciona.** O Owner decide que o requerimento de junta é protocolado apenas no balcão ou na
clínica pelo operador (UC-PEC-004 como está); a rota `exames/:examId/junta/nova` vira página
informativa ("como solicitar"), `junta_medica` sai de `act_level_policy`/catálogo.

**Consequências.** Contradiz IU-PEC-001 P-04 e ADR-0034 §2 → **exige emenda de ADR** pelo Owner;
reduz fluxo de dado de saúde pelo Portal (LGPD mais simples); o cidadão perde a via digital de um prazo
preclusivo (art. 14 da Res. 927 exige apresentação "no órgão do domicílio" — ponto a confirmar com
LEGAL se o Portal satisfaz a competência territorial, RN-PEC-110 §5). Esforço baixo; reversível só com
nova decisão.

### Matriz comparativa — OD-R27-002

| Critério                                   | 2a ligar em R-0027       | 2b fail-closed → R-0031  | 2c ingresso em R-0027, acende em R-0031 | 2d fora do Portal    |
| ------------------------------------------ | ------------------------ | ------------------------ | --------------------------------------- | -------------------- |
| ADR-0034 §3 (contrato antes da tela)       | cumpre, com pressa       | cumpre                   | cumpre                                  | n/a (emenda ADR)     |
| Prova de vínculo e da data de ciência      | **não** (sem produtor)   | R-0031                   | R-0031                                  | balcão               |
| RN-PEC-110 / DT-103 (candidato requerente) | parcial                  | R-0031                   | **sim, no contrato**                    | não muda             |
| Critério C-0002 §5 ao fim de R-0027        | cumprido (nominal)       | exceção declarada        | exceção declarada (fail-closed com OD)  | serviço removido     |
| Locks com R-0031                           | **conflito**             | nenhum                   | herança de contrato                     | nenhum               |
| Esforço extra em R-0027 (janelas)          | 1,5–2                    | ~0                       | 0,5–1                                   | ~0,25 (+ emenda ADR) |
| Risco                                      | alto                     | baixo (atraso de R-0031) | baixo-médio                             | jurídico/produto     |
| Decisor                                    | Owner (catálogo, OD-P55) | Owner                    | Owner + Architect                       | Owner (+ LEGAL)      |

---

## 3. Dependências entre OD-R27-001, OD-R27-002 e outras

1. **001 → 002.** Se a junta vier pelo Portal (2a/2c), a chave `ch:junta:*` do canal segue a
   identidade escolhida em 001. Com 1a/1c-ii: `ch:junta:file-request-portal` para o técnico,
   `submitted_by` = técnico, requerente = `applicant_patient_id` + canal — o que **resolve** DT-103.
   Com 1b: exigiria dar `CIDADAO` a `ch:junta:create` (hoje `AUDITOR/GESTOR/GESTOR_DETRAN`) e
   decidir `CANDIDATO` na sessão (OD-PW-001).
2. **001 = OD-PW-001.** As duas são a mesma pergunta em domínios diferentes. Decidir 001 por 1a
   **fecha de fato** o padrão de OD-PW-001 ("delegação pelo backend do Portal com vínculo, sem papel
   novo na sessão"); decidir 1b empurra OD-PW-001 para a alternativa de papel na sessão.
3. **002 × catálogo (OD-P55, OD-P19).** 2a/2c tornam `junta_medica` o 16º serviço (seed e
   `portal-build-pack.md` §4); 2b mantém 15 até R-0031; 2d o remove também de `act_level_policy`.
4. **001 × R-0023.** Qualquer opção exige chaves novas no formato de dados de R-0023
   (`policy/`), escritas **depois** de R-0023/R-0025 (lock `MOD-shared-policy`). 1b é a única que
   altera a matriz papel × rota.
5. **001 × OD-R27-003 (pagamento).** O produtor de `PAGAMENTO_CONFIRMADO` em `inf/collection` roda como
   ator de conciliação (`rait-finance` ou técnico), não sob o cidadão — reforça 1a.
6. **001 × OD-P67/OD-P01 (nível de assinatura).** Independentes: o nível é exigido no Portal antes do
   protocolo (F1) e viaja em `onBehalfOf.assuranceLevel` em qualquer opção.

---

## 4. Recomendação do Architect

**OD-R27-001 → 1a, com o ingresso estreito de 1c-ii onde o comando de staff não serve, e 1d como
evolução opcional.** Concretamente:

- Identidade: ator técnico `portal-delegation` por tenant, papel fora de curinga/admin, **chaves
  próprias** `…-portal` (não acrescentar papel às chaves de staff), avaliadas explicitamente pelo
  provider único de política (compatível com R-0023).
- Autor: requerente registrado como **parte** (`inf.rait_party`; na junta,
  `ch.junta_case.applicant_patient_id` com canal) e `onBehalfOf` (`subjectId`, `cpfHash`,
  `assuranceLevel`, `portalRequestId`, `portalProtocol`, `receiptHash`) em `audit.details`;
  `correlation` = pedido do Portal; `actor.kind='service'` nos eventos.
- Tempestividade: `protocolled_at`/`requestedAt` = `issuedAt` do protocolo do Portal, sempre.
- RAIT `protocol`: ramo "ingresso por canal portal" (ou comando `file-petition`, 1c-ii) no lugar do
  vínculo de pool de secretaria, que é semântica de balcão.
- Justificativa: não expõe API de staff a gov.br; mantém a autorização por objeto onde ela já existe
  (Portal); preserva a distinção jurídica requerente × recebedor que o modelo RAIT e RN-PEC-110 já
  adotam; matriz de R-0023 inalterada; fecha o mesmo padrão para OD-PW-001; custo +0,5–1 janela;
  reversível. 1d (worker) fica como melhoria posterior se a taxa de 502 de delegação justificar.
- Condições de aceitação a pôr no `contracts/CTG-0003.md`: teste negativo de que nenhuma rota HTTP
  aceita `portal-delegation`; teste de que `protocolled_at` ≠ relógio da delegação; teste de
  idempotência repetida; auditoria com `onBehalfOf` sem CPF em claro.

**OD-R27-002 → 2b (fail-closed com OD em R-0027; junta inteira em R-0031), aceitando 2c se o Owner
quiser o contrato de ingresso fixado já nesta rodada.** Justificativa: o bloqueio real não é só o
contrato, é a ausência de produtor PEC para vínculo e data de ciência — sem ele a tempestividade de um
prazo **preclusivo** seria autodeclarada; ADR-0034 §3 e a ordem da campanha põem contratos PEC em
R-0031; 2a invade locks de R-0031 e traz dado de saúde ao Portal antes das fixtures e testes de
integração PEC. O closure de R-0027 registra a junta como exceção declarada ao critério C-0002 §5
(`indisponivel-nesta-versao`, `OD-R27-002`), e R-0031 CTG-0006 fica responsável por acendê-la com a
identidade de 1a. 2d só se o Owner quiser tirar a junta do Portal — exige emenda da ADR-0034.

**Decisões pedidas ao Owner:** (1) aceitar 1a (efeito de segurança: reviewer confirma); (2) escolher
entre 2b e 2c para a junta; (3) confirmar que a decisão de 001 vale também como padrão de OD-PW-001.
