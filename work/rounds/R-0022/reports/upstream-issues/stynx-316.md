
Requisito upstream do DETRAN, campanha C-0002, rodada consumidora **R-0022** (contrato
**CTG-0008**, migração integral da outbox). Todos os itens desta issue são **MUST**, conforme
OD-S15-01 e a adenda A1 da spec C-0002 (§8.1). Registro autorizado pelo Owner em 2026-09-29 (DETRAN
`work/rounds/R-0022/AUTHORIZATION.md`, Adenda B4). Esta issue registra o contrato de consumo;
implementação, release e governança seguem o STYNX. Não é declaração de que a lacuna continua
ausente na HEAD atual: verificar a API efetivamente publicada e anexar evidência se já atendida.

Consumidor: **R-0022 / CTG-0008**. Alvo: grupo fixo `@stynx-nyx/*` **1.5.x final** (o DETRAN fixa a
maior 1.5.x final publicada; Adenda A-C2-13). Desenvolvimento pode usar `1.5.x-rc.N`; merge DETRAN
somente com final e conformidade preenchida. MUST ausente bloqueia o CTG consumidor (OD-R22-02 (a)),
sem _shim_ nem cópia do mecanismo genérico.

Esta issue **não reabre** https://github.com/stynx-nyx/stynx/issues/306. UPS-OBX-01 e UPS-OBX-02
foram fechados em 1.5.0 com os símbolos `OutboxService.appendInTransaction`/
`appendManyInTransaction`, `OutboxEventStreamSource`, `dispatchEventsDue`, `ackEvent`,
`recordUnboundAck` e `cutoverLegacyMessages` (ledger STYNX `work/rounds/R-0002/conformance-1.5.0.md`).
Os itens abaixo são lacunas que o DETRAN encontrou ao mapear esses símbolos para o seu armazenamento
e para as suas rotas.

## Base analisada

- `@stynx-nyx/outbox@1.5.0`, tarball SHA-256
  `c894be7bd463e7ce53ea8ec42fc1e8deffd05194467af3cd5bff17ac06813952`: `.d.ts` em
  `package/dist/outbox/src/` (`outbox.service.d.ts`, `types.d.ts`, `errors.d.ts`,
  `event-stream-source.d.ts`, `constants.d.ts`).
- `@stynx-nyx/data@1.5.0`, tarball SHA-256
  `f6435ce285a7caccb9678a64069976a4bab2dc36487212d6556606598dfeb793`:
  `migrations/platform/0018_outbox.sql` e `0021_outbox_event_log.sql`.
- O `.js` publicado **não** foi lido pelo DETRAN; comportamento não fixado pelo `.d.ts` é pedido como
  contrato documentado e testado (UPS-OBX-09).

## Contexto do consumidor DETRAN

O DETRAN hoje grava e despacha pela tabela própria `integration.outbox` (fila com `topic`,
`aggregate_type`, `aggregate_id`, `status` em `pending`/`processing`/`acked`/`error`, `attempts`,
`last_error`, `available_at`, `dispatched_at`, `completed_at`, `created_at`, `idempotency_key`,
`UNIQUE (tenant_id, idempotency_key)`) e pelo ledger `integration.delivery_attempt` (DDL
`backend/database/ddl/04-integration-storage.sql`). Duas filas consomem esse armazenamento:

- RENACH: tópico `ch.renach.exam-result`, despacho por `POST v1/ch/transmissions/dispatch`
  (requisição HTTP autenticada com tenant), ACK por `POST v1/ch/transmissions/callbacks/renach`
  (`@Public` + HMAC); reclamação `skip locked`, `processing` ≥ 15 min, erro → +15 min.
- BOAT/RENAEST: tópicos `SINISTRO_TRANSMISSAO_PENDENTE`/`SINISTRO_RETIFICACAO_PENDENTE`.

A maioria dos demais tópicos (RAIT, TEAT, Portal, DASHBOARD, parâmetros, provisionamento) **não tem
destino de despacho**: é log de eventos lido por SSE e projeções. O operador usa
`GET v1/ops/integrations/outbox` (lista, 200 itens, filtros `system` = prefixo de tópico e `status`,
ordem `created_at desc, id`), `POST v1/ops/integrations/outbox/:id/retry` (`error` → `pending`; fora
de `error` → 409 `TEAT.INTEGRATION_ITEM_NOT_FAILED`), `GET v1/ops/integrations/health` (contagem
`pending`/`processing`/`error`) e as equivalentes RAIT `GET/POST v1/inf/rait/integrations/outbox…`
(lista de 500 e _retry_ `error` → `pending`). Inventário completo: CTG-0008 §1 (40 arquivos).

Regra de arquitetura DETRAN: **nenhuma operação de requisição roda como owner** (DETRAN ADR-0002;
CTG-0008 §3 regra 5). Papel de aplicação DETRAN: `role_app_backend`; tabela de tenant:
`auth.tenants`; `audit.write` de 10 parâmetros; DDL por inventário fechado em `apply.sh`.

## Contrato e provas (resumo)

| ID         | Nível | Origem                                          | Comportamento exigido (resumo)                                                                                              |
| ---------- | ----- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| UPS-OBX-03 | MUST  | UPS-OBX-02 (migração de storage); CTG-0008 V-06, P-08-2 | Corte idempotente de armazenamento **customizado** do consumidor para o log/fila/ledger publicados, preservando ids, `created_at`, pendências e trilha |
| UPS-OBX-04 | MUST  | UPS-OBX-02; CTG-0008 P-08-3, P-08-6, C-08-14/15  | Leitura publicada, sob tenant e RLS, de estado de entrega, ledger de tentativas, lista filtrada e saúde da fila             |
| UPS-OBX-05 | MUST  | UPS-OBX-02; CTG-0008 P-08-6, C-08-15             | _Retry_ de operador em modo evento, sob tenant e RLS, com recusa tipada fora de `ERROR`                                     |
| UPS-OBX-06 | MUST  | UPS-OBX-02 (restrição de isolamento de #306); CTG-0008 V-03, V-04, P-08-4 | Despacho e ACK utilizáveis no caminho de requisição sob papel de aplicação e tenant confiável, sem owner                    |
| UPS-OBX-07 | MUST  | UPS-OBX-01 (distinguir log e fila); CTG-0008 V-02, P-08-5 | Eventos sem destino não viram entrega; despacho filtrável por destino/`entity`                                              |
| UPS-OBX-08 | MUST  | UPS-OBX-01/02; CTG-0008 V-07, V-08, P-08-1       | Migração de outbox separável de `audit.*`, com papel de aplicação e tabela de tenant do consumidor e lista fechada de objetos |
| UPS-OBX-09 | MUST  | UPS-OBX-01/02; CTG-0008 V-01, V-03, V-04, V-05   | Comportamento hoje não fixado pelo `.d.ts` documentado no contrato e coberto por teste                                      |

Os detalhes vinculantes de cada ID estão abaixo.

### UPS-OBX-03 — corte de armazenamento customizado do consumidor

**Origem e ID.** Desdobra a cláusula de UPS-OBX-02 "migração de storage deve conservar pendências e
trilha histórica, sem entrega duplicada ou perda de evento". O símbolo publicado cobre só o
armazenamento de plataforma; ID novo porque UPS-OBX-02 foi fechado.

**Evidência (1.5.0 publicada).**
- `outbox.service.d.ts:33-37`: `cutoverLegacyMessages()` — "Explicit, idempotent owner cutover for
  the two platform legacy tables", sem parâmetro de origem.
- `errors.d.ts:32`: `OutboxCustomTableCutoverUnsupportedError`.
- `types.d.ts:143-147`: `OutboxModuleOptions.table`/`ackTable` (padrões `outbox.messages`/
  `outbox.acknowledgements`, `constants.d.ts:5-6`) — a tabela customizada existe no modo legado, mas
  o corte a recusa.
- `0021_outbox_event_log.sql:92-99`: `outbox.legacy_event_map (legacy_id, tenant_id, event_id,
  generation)`; `:107-108` acrescentam `migrated_event_id`/`cutover_generation` só a `outbox.messages`.
- DETRAN CTG-0008 §0 (UPS-OBX-02 "Divergente para o armazenamento DETRAN"), §2.1 linha "migração de
  storage" (**Ausente**), §2.3 V-06, §3 regras 7–8, §9 P-08-2.

**Comportamento exigido.** Uma via publicada de corte para armazenamento que o consumidor declara
(tabela de fila/log e tabela de tentativas próprias), em que o consumidor fornece o mapeamento de
colunas e de vocabulário de status e a plataforma executa o mecanismo:
1. Cada linha de origem vira exatamente um evento em `outbox.events` com **o mesmo id e o mesmo
   `created_at`** (continuidade de `Last-Event-ID`/cursor `(created_at, id)`), o mesmo tenant, a
   mesma `idempotency_key`, `entity`/`entityId`/`payload`/`metadata` pelo mapeamento.
2. Estado de entrega preservado: pendente e em erro continuam elegíveis e são despachados
   **exatamente uma vez** depois do corte; em processamento é tratado como pendente com _lease_
   vencido ou conforme regra documentada; **nenhum confirmado (`acked`) é reenviado**; `attempts`,
   `last_error` e próxima elegibilidade preservados.
3. Ledger histórico: as tentativas da tabela de origem ficam ligadas ao evento (importadas para
   `outbox.event_attempts` com marcação de origem, ou referenciadas pelo mapa de corte), sem apagar a
   origem.
4. Idempotente e reexecutável; registro durável do corte (como `legacy_event_map`/`generation`);
   escritores que ainda gravem na origem durante o corte são recusados ou tratados de forma
   documentada (sem perda).
5. Roda fora do caminho de requisição (operação de manutenção), com o papel que o STYNX documentar;
   nunca exposto a rota de aplicação.

**Prova exigida.** PostgreSQL real com FORCE RLS, **dois tenants**, tabela customizada com colunas e
vocabulário diferentes dos da plataforma: contagens por tenant e status antes/depois; ids e
`created_at` idênticos; pendente e erro despachados uma vez (dispatcher falso contando chamadas);
confirmado nunca reenviado; reexecução do corte sem efeito; tentativas históricas legíveis e ligadas
ao evento; evento de A nunca migra para B.

**Situação provisória DETRAN.** Por decisão explícita do Owner (OD-R22-16, "autorizo uma
transferência DETRAN idempotente como exceção explícita à A1"), o DETRAN faz a própria transferência
idempotente de `integration.outbox`/`integration.delivery_attempt` (ids, `created_at`, pendências;
trilha legada congelada, nunca apagada). É exceção **única, nominal e transitória até a 1.5.x**; não
autoriza outro contorno (AUTHORIZATION.md Adenda B2/B3).

### UPS-OBX-04 — leitura publicada de estado de entrega, ledger, lista e saúde

**Origem e ID.** UPS-OBX-02 exige ledger com hashes e protocolo e ACK com vínculo ao evento/tenant,
mas a 1.5.0 não publica leitura dessas informações em modo evento. ID novo.

**Evidência (1.5.0 publicada).**
- `outbox.service.d.ts:50-51` `getOne(entity, entityId): Promise<OutboxRow>` e `:79-81` `retry` são
  do **modo legado** (`OutboxRow`, `types.d.ts:58-73`, tabela `outbox.messages`); não há leitura de
  `outbox.event_delivery`, `outbox.event_attempts` nem `outbox.event_acks`.
- `event-stream-source.d.ts:11-27`: `OutboxStreamRow` expõe só `createdAt`, `id`, `event`, `payload`;
  sem estado de entrega.
- `0021_outbox_event_log.sql:37-90`: colunas existentes (`event_delivery.status/attempts/lease_until/
  next_attempt_at/last_error`; `event_attempts.attempt_ordinal/provider/protocol/request_sha256/
  response_sha256/response_status/result/error/leased_at/completed_at`).
- DETRAN CTG-0008 §1 #10, #12, #18 (`renach_acked` = dois itens RENACH do atendimento em `acked`),
  §2.1 linha "(DETRAN) _retry_ de operador, lista e saúde da fila" (**Ausente**), §4 C-08-14 (ledger)
  e C-08-15 (saúde), §9 P-08-3/P-08-6.

**Comportamento exigido.** API publicada, executada **na transação do chamador ou no `Database` do
consumidor sob papel de aplicação e `app.tenant_id` do contexto** (nunca owner), que ofereça:
1. Lista de eventos com estado de entrega: filtros por status de entrega e por `entity` (igualdade e
   prefixo), ordem `created_at desc, id`, limite e cursor; cada linha com id, `entity`, `entityId`,
   `metadata`, status, `attempts`, `last_error`, próxima elegibilidade, `created_at`.
2. Estado de entrega por evento (id) e por agregado (`entity`, `entityId`), incluindo ausência de
   entrega para evento sem destino (UPS-OBX-07).
3. Tentativas de um evento: ordinal, provedor, protocolo, `request_sha256`, `response_sha256`,
   `response_status`, resultado, erro, instantes; bytes brutos só por opção explícita.
4. Saúde da fila por tenant: contagem por status de entrega (e por `entity` opcional).
Evento de outro tenant: `null`/ausente, nunca erro que revele existência.

**Prova exigida.** PostgreSQL real, FORCE RLS, papel de aplicação, dois tenants: listas, contagens e
tentativas de B invisíveis sob A; filtros e ordem estáveis com empate de `created_at`; tentativa
registrada depois de sucesso e de falha aparece com hashes e protocolo; evento sem destino não aparece
na saúde da fila.

**Situação provisória DETRAN.** Por decisão do Owner (OD-R22-17 e OD-R22-20: "autorizo a leitura
DETRAN somente leitura"), o DETRAN mantém uma **leitura somente leitura** (sob RLS, `security_invoker`)
sobre as tabelas publicadas para estado de entrega, ledger, lista e saúde da fila. É a segunda
exceção nominal à A1 item 4, **transitória até a 1.5.x**; sai quando este item for publicado.

### UPS-OBX-05 — _retry_ de operador em modo evento

**Origem e ID.** Rotas DETRAN #10–#12 (CTG-0008 §1). A 1.5.0 só tem _retry_ no modo legado. ID novo.

**Evidência (1.5.0 publicada).** `outbox.service.d.ts:73-81`: `retry(id, { immediate? }):
Promise<OutboxRow>` documentado como "Manually resets a row to `PENDING` for redelivery — an operator
action", sobre `OutboxRow` (modo legado). Nenhum equivalente sobre `outbox.event_delivery`. DETRAN
CTG-0008 §2.1 (**Ausente** → P-08-6), §4 C-08-15.

**Comportamento exigido.** Operação publicada sobre o estado de entrega de um evento, sob papel de
aplicação e tenant do contexto:
1. Entrega em `ERROR` → elegível imediatamente (ou pela política de _backoff_, por opção), `attempts`
   e ledger preservados, `last_error` tratado de forma documentada.
2. Entrega fora de `ERROR` (pendente, enviada, `SENT_UNRESOLVED`, confirmada) ou evento sem entrega →
   erro tipado e distinguível (o DETRAN o traduz para 409 `TEAT.INTEGRATION_ITEM_NOT_FAILED` na rota
   TEAT e para a recusa atual na rota RAIT); confirmado nunca volta a ser despachado.
3. Evento de outro tenant → mesmo resultado de "não encontrado".
4. Concorrência com `dispatchEventsDue` sem entrega duplicada (respeita _lease_).

**Prova exigida.** PostgreSQL real, FORCE RLS, dois tenants: _retry_ de `ERROR` seguido de despacho
entrega uma vez; _retry_ de cada outro estado recusado sem efeito; _retry_ de evento de B sob A
recusado e B intacto; _retry_ concorrente com despacho não duplica envio.

**Situação provisória DETRAN.** O Owner aceitou **perder temporariamente o _retry_ manual da fila
RENACH** ("Sim, aceito perder temporariamente o retry manual da fila RENACH"): depois do corte, as
rotas de _retry_ de operador ficam indisponíveis **até a 1.5.x** (AUTHORIZATION.md Adenda B4).

### UPS-OBX-06 — despacho e ACK sem owner no caminho de requisição

**Origem e ID.** Restrição adicional de isolamento transcrita em #306 ("O request path DETRAN deve
operar sob tenant/ator confiáveis e papel de aplicação com RLS…"). A decisão do Owner registrada em
#306 aceitou despacho/ACK em contexto owner como controle interno **para a conformidade de UPS-OBX-02
na plataforma**, e esse fechamento não é contestado aqui. Para o consumidor DETRAN, porém, a OD-R22-18
decidiu **checkpoint** do despacho se ele rodar como owner (ADR-0002 do DETRAN: o despacho DETRAN é
requisição HTTP com tenant). Este item pede uma **via adicional**; não pede remover a via owner. ID
novo.

**Evidência.**
- #306, comentário de fechamento: "`dispatchEventsDue`/`ackEvent` rodam como owner e tocam só tabelas
  do outbox"; "`ackEvent` recebe `tenantId` do input"; "O isolamento de ACK entre tenants é provado no
  nível de schema…, não por teste de API com dois tenants".
- `outbox.service.d.ts:14-15` (demais métodos "own[s] its own transaction via the injected
  `Database`"), `:58-61` (`dispatchDue` legado: "Claiming spans all tenants (system context, `owner`
  role)"), `:84-87` (`ack` legado em "system context / `owner` role"); `:39-40` sem documentação de
  papel para `ackEvent`/`dispatchEventsDue`.
- `types.d.ts:49-56`: `OutboxEventAckInput.tenantId: string` fornecido pelo chamador; `hmacVerified?`.
- DETRAN CTG-0008 §2.3 V-03 ("Owner no caminho de requisição → P-08-4 (ADR-0002)") e V-04; §3 regra 5;
  §9 P-08-4; OD-R22-18 (a).

**Comportamento exigido.**
1. Despacho em escopo de tenant: variante publicada que reclama, envia e registra tentativa **só do
   tenant de `app.tenant_id`**, executável na conexão/transação do consumidor sob papel de aplicação
   com FORCE RLS; mesmas garantias de UPS-OBX-02 (_lease_, _backoff_, ledger por tentativa, sem
   reenvio após falha de persistência).
2. ACK em escopo de tenant: variante que resolve o alvo **só dentro do tenant do contexto** (tenant
   derivado de contexto confiável — por exemplo o resultado do `WebhookSignatureGuard`/UPS-HOOK — e
   não de campo do corpo), sob papel de aplicação; replay idempotente; `ERROR` depois de `ACKED` não
   regride; identidade por `eventId`/`idempotencyKey` documentada.
3. A via owner/sistema existente continua disponível para _schedulers_ internos.

**Prova exigida.** PostgreSQL real, FORCE RLS, papel de aplicação (sem `BYPASSRLS`), **dois tenants e
teste de API** (não só de schema): despacho sob A nunca reclama nem registra tentativa de B; ACK sob A
com chave/id de B → alvo não encontrado e B intacto; replay de ACK sem novo efeito; dois despachos
concorrentes do mesmo tenant enviam cada evento uma vez.

**Nota.** Se o Owner preferir resolver este item do lado DETRAN (CTG-0008 P-08-4 (b): mover o
disparo para job técnico fora da requisição, com emenda de ADR, em R-0024), ele o registra em decisão
própria; até lá, o item permanece MUST aberto.

### UPS-OBX-07 — roteamento por destino e eventos sem destino

**Origem e ID.** UPS-OBX-01 exige "distinguir log de eventos e fila de despacho". A 1.5.0 separa as
tabelas, mas não fixa quais eventos viram entrega nem permite despachar por destino. ID novo.

**Evidência (1.5.0 publicada).**
- `types.d.ts:105-109`: um único `OutboxDispatcherPort` com `sendEvent?(row: OutboxRow)`; `:148`
  `OutboxModuleOptions.dispatcher` (um por módulo).
- `outbox.service.d.ts:40`: `dispatchEventsDue(limit?: number)` sem filtro por `entity`/destino.
- `0021_outbox_event_log.sql:37-50`: `outbox.event_delivery` com FK para `outbox.events`; o `.d.ts` não
  diz se todo _append_ cria entrega.
- DETRAN CTG-0008 §2.3 V-02 ("Todo append cria linha em `event_delivery`? Como fica um evento sem
  destino…?"), §4 C-08-12, §9 P-08-5; OD-R22-19 (porta `sendEvent` roteando por `entity`,
  condicionada a V-02).

**Comportamento exigido.**
1. O consumidor declara quais `entity` são despacháveis (predicado, registro ou opção de _append_);
   evento não despachável é gravado no log e **nunca** cria entrega, nunca é reclamado, nunca chega ao
   _dispatcher_ e não conta na saúde da fila.
2. Despacho filtrável por conjunto de `entity` (ou por destino nomeado), para que cada fila
   (RENACH, RENAEST) seja drenada pela sua rota/_job_ sem reclamar itens da outra.
3. `sendEvent` recebe a linha do evento do log (id, tenant, `entity`, `entityId`, `payload`,
   `metadata`, tentativa), não só `OutboxRow` do modo legado — ou o STYNX documenta a correspondência.

**Prova exigida.** PostgreSQL real: _append_ de tópicos com e sem destino; só os com destino geram
entrega; despacho filtrado por `entity` A não toca entrega de `entity` B; _dispatcher_ falso nunca
recebe evento sem destino; dois tenants.

### UPS-OBX-08 — migração de outbox separável, com papel e tenant do consumidor

**Origem e ID.** Pré-condição de consumo de UPS-OBX-01/02 por aplicação que não usa o esquema de
plataforma completo do STYNX. ID novo.

**Evidência (1.5.0 publicada).**
- `0018_outbox.sql:5` (`CREATE SCHEMA … AUTHORIZATION stynx_owner`), `:31`/`:62` (FK
  `tenancy.tenants(id)`), `:81-90` (_grants_ e _default privileges_ a `stynx_app`/`stynx_reader`).
- `0021_outbox_event_log.sql:11`, `:17` (FK `tenancy.tenants`), `:125-147` (políticas
  `TO stynx_app` sobre `app.tenant_id`), `:149-161` (_grants_ estreitos a `stynx_app`), e, no mesmo
  arquivo, reescrita de `audit.*`: `:167-205` `audit.lock_chain`, `:208` `audit.write` (nova
  sobrecarga), `:306` `audit.fn_row_change`, `:456` `audit.write_command_event`, `:532-560`
  `audit.events.epoch_id`, `audit.chain_diagnostics`, `audit.chain_epoch_seals`.
- DETRAN CTG-0008 §3 ("os arquivos publicados **não** se aplicam como estão"), §2.3 V-07 e V-08, §9
  P-08-1; OD-R22-15 (a).

**Comportamento exigido.**
1. Artefato de migração da outbox **separado** das mudanças de `audit.*` e de outros módulos, aplicável
   sozinho.
2. Tabela de tenant da FK e papel(éis) de aplicação/leitura **parametrizáveis** pelo consumidor (ou
   políticas sem `TO <papel>` fixo, como `offline_tenant_isolation` de `offline-sync` 0001, com
   _grants_ documentados por papel).
3. Lista fechada e publicada dos objetos de banco que o SQL do serviço referencia (tabelas, colunas,
   `outbox.event_order_seq`, `outbox.event_uuid`, gatilho `outbox_events_immutable`, colunas de
   `outbox.messages` usadas no modo evento), com o alcance mínimo de _grants_ por papel.
4. Idempotente na reaplicação, ou forma documentada de verificação de estado, compatível com um
   aplicador de DDL que reaplica o inventário inteiro.

**Prova exigida.** Aplicar a migração separável num banco sem o esquema `audit.*` do STYNX, com
tabela de tenant e papel de aplicação diferentes de `tenancy.tenants`/`stynx_app`; rodar as suítes de
UPS-OBX-01/02 sob esse papel com FORCE RLS e dois tenants; reaplicação sem erro; verificador que falha
se o serviço referenciar objeto fora da lista publicada.

**Situação provisória DETRAN.** OD-R22-15 (a): o DETRAN escreve DDL própria só com os objetos de
outbox da verificação V-08, com `auth.tenants` e `role_app_backend`, sem tocar `audit.*`. É
transcrição de contrato de armazenamento, a substituir pela migração separável publicada.

### UPS-OBX-09 — comportamento fixado em contrato e teste

**Origem e ID.** Verificações do contrato DETRAN que o `.d.ts` não responde e que decidem se o
consumo é conforme. ID novo, sem mudança de API necessária se o comportamento já for o esperado.

| Verificação DETRAN | O que o STYNX deve documentar (contrato `docs/framework/contracts/…`) e cobrir por teste nomeado                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V-01               | `appendInTransaction` usa só a `trx` do chamador (papel de aplicação, tenant de `app.tenant_id`), sem `Database` próprio nem owner; mesma chave e mesmo conteúdo devolve a linha existente; conteúdo divergente lança `OutboxEventConflictError`; `created_at` monotônico por tenant |
| V-03               | `dispatchEventsDue`: papel e contexto, ordem de reclamação, uso de `eventLeaseMs` e da `OutboxBackoffPolicy`, conteúdo de `event_attempts` gerado a partir de `OutboxTransportEvidence` (em especial `request_sha256` = SHA-256 de `requestBytes`) |
| V-04               | `ackEvent`: transação própria ou composta; papel; deduplicação de replay; `ERROR` depois de `ACKED` não regride; identidade por `eventId`/`idempotencyKey`; semântica de `hmacVerified`                                          |
| V-05               | `OutboxEventStreamSource`: origem de `event` (derivado de `entity`?), escopo por conexão em contexto de requisição (papel de aplicação), `listSince` estritamente `>` cursor, `findById` de outro tenant → `null`                  |
| V-06               | `cutoverLegacyMessages` recusa tabela customizada com `OutboxCustomTableCutoverUnsupportedError` e roda como owner fora da requisição (vale até UPS-OBX-03)                                                                       |

Fonte: DETRAN CTG-0008 §2.3 (tabela V-01…V-08). V-02, V-07 e V-08 estão nos itens UPS-OBX-07/08.

## Compatibilidade vinculante

- **Aditivo em 1.5.x.** Nenhuma assinatura publicada em 1.5.0 muda de forma incompatível
  (`appendInTransaction`, `appendManyInTransaction`, `OutboxEventStreamSource`, `dispatchEventsDue`,
  `ackEvent`, `recordUnboundAck`, `cutoverLegacyMessages`, modo legado `enqueue`/`dispatchDue`/`ack`/
  `retry`/`getOne`). As vias novas são opções ou métodos adicionais.
- **Tenant do contexto.** Tenant vem sempre de contexto confiável (`app.tenant_id` da transação ou
  contexto verificado); campo de corpo nunca o substitui. Nenhuma via nova de requisição exige owner.
- **Continuidade de ids.** Id e `created_at` de evento migrado são preservados (cursor SSE
  `(created_at, id)`, UPS-SSE-03); nenhum confirmado é reenviado; nenhuma pendência se perde.
- **Vocabulário do consumidor.** A plataforma não traduz códigos DETRAN; devolve erros tipados que o
  adaptador DETRAN mapeia (`TEAT.*`, recusa RAIT). Status DETRAN (`pending`/`processing`/`acked`/
  `error`) são mapeados pelo consumidor no corte (UPS-OBX-03), não impostos à plataforma.
- **Trilha nunca apagada.** Corte e leitura não apagam a origem nem as tentativas históricas.
- **Owner só fora da requisição** (DDL, corte, _scheduler_ interno), coerente com a decisão de #306.

## Fora do escopo desta issue

- Inbox de entrada não-ACK (toxicologia RENACH, `integration.inbox_receipt`): permanece local no
  DETRAN, sem símbolo publicado pedido (CTG-0008 §1 #8). A correlação `delivery_attempt` ↔
  `inbox_receipt`, que #306 atribui ao consumidor, continua do lado DETRAN.
- Filtro de escopo no SQL para SSE (Portal/DASHBOARD; CTG-0008 achado F-05) é assunto de CTG-0004
  (SSE); se exigir pedido upstream, virá em issue própria.

## Critérios de conclusão

- [ ] UPS-OBX-03 atendido por API pública e testes verificáveis (PostgreSQL real, FORCE RLS, dois tenants, tabela customizada).
- [ ] UPS-OBX-04 atendido por API pública e testes verificáveis (papel de aplicação, dois tenants).
- [ ] UPS-OBX-05 atendido por API pública e testes verificáveis (recusa tipada, sem entrega duplicada).
- [ ] UPS-OBX-06 atendido por API pública e testes verificáveis (teste de API com dois tenants, sem owner), ou decisão do Owner registrada que o torne sem objeto.
- [ ] UPS-OBX-07 atendido por API pública e testes verificáveis (evento sem destino nunca vira entrega).
- [ ] UPS-OBX-08 atendido por migração publicada separável e teste com papel/tabela de tenant do consumidor.
- [ ] UPS-OBX-09 atendido por contrato publicado e teste nomeado para cada verificação V-01, V-03, V-04, V-05, V-06.
- [ ] Informar versão publicada, símbolos reais exportados, testes/CI e desvios da proposta para cada ID; nome de símbolo proposto pode mudar, comportamento e prova não.
- [ ] Documentar consumo e migração, incluindo restrições de contexto/tenant e de papel; não marcar atendido somente por código local ou RC sem evidência de publicação.

## Rastreabilidade

DETRAN (`aarusso-nyx/detran`, branch `orchestra/stynx-sse-tenancy`): `work/rounds/R-0022/contracts/
CTG-0008.md` (SHA-256 `37a0bbb393dd89be28b083e694a11e88bb669b137d909f7fe42a8e403268c449`) §0, §1,
§2.1, §2.3, §3, §4, §9 e Adenda A1; `work/rounds/R-0022/AUTHORIZATION.md` Adendas B2/B3/B4;
`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 "R-0022 — decisões do Owner"
(OD-R22-02, -15, -16, -17, -18, -19, -20); spec `work/campaigns/C-0002-stynx-upstream-spec.md` §8.1
(SHA-256 `291f18da6d2cc9d381c855d45bca3d61da59bbb424b93523bdde195b0137383d`). ADR-0002 do DETRAN:
`docs/meta/adr/ADR-0002-unified-backend-modular-monolith.md`.

STYNX: https://github.com/stynx-nyx/stynx/issues/306 (fechada; decisão do Owner sobre contexto
owner); ledger `work/rounds/R-0002/conformance-1.5.0.md`.

<!-- detran-c0002-upstream:R22-OBX -->

Índice: #319 · Índice anterior: https://github.com/stynx-nyx/stynx/issues/289

