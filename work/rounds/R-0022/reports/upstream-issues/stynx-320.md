Requisito upstream do DETRAN, campanha C-0002, rodada consumidora **R-0022** (contrato
**CTG-0008**, migração integral da outbox). Todos os itens desta issue são **MUST**, conforme
OD-S15-01 e a adenda A1 da spec C-0002 (§8.1). Registro autorizado pelo Owner em 2026-09-29 (DETRAN
`work/rounds/R-0022/AUTHORIZATION.md`, Adenda B4 — modelo e autorização de issues; Adenda B12 —
decisões OD-R22-43 e OD-R22-44). Esta issue registra o contrato de consumo; implementação, release e
governança seguem o STYNX. Não é declaração de que a lacuna continua ausente na HEAD atual: verificar
a API efetivamente publicada e anexar evidência se já atendida.

Consumidor: **R-0022 / CTG-0008**. Alvo: grupo fixo `@stynx-nyx/*` **1.5.x final** (o DETRAN fixa a
maior 1.5.x final publicada; Adenda A-C2-13). Desenvolvimento pode usar `1.5.x-rc.N`; merge DETRAN
somente com final e conformidade preenchida. MUST ausente bloqueia o CTG consumidor (OD-R22-02 (a)),
sem _shim_ nem cópia do mecanismo genérico.

Esta issue **não reabre** https://github.com/stynx-nyx/stynx/issues/306 (UPS-OBX-01/02, fechados em
1.5.0) e **complementa** https://github.com/stynx-nyx/stynx/issues/316 (UPS-OBX-03…09). A #316 foi
escrita a partir dos `.d.ts` e das migrações publicadas; o `.js` publicado não tinha sido lido
(UPS-OBX-09 pedia o comportamento como contrato). A leitura do `.js` de 1.5.0 pelo DETRAN (spec
C-0002 §8.2, verificações V-02 e V-07) mostrou duas divergências que a #316 não cobre inteiramente:

- o papel `stynx_app` é exigido **em tempo de execução**, por comparação literal de `current_user`,
  em três pontos do código publicado — nenhuma migração parametrizável (UPS-OBX-08) resolve isso
  sozinha;
- toda anexação cria entrega e a entrega sem destino **bloqueia o agregado** indefinidamente — efeito
  mais grave que a pergunta de UPS-OBX-07.

Os IDs continuam a numeração da #316 (a partir de 10) e declaram o ID pai.

## Contexto do consumidor DETRAN

- Papel SQL da aplicação DETRAN: **`role_app_backend`**, criado como
  `NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS` (`backend/database/ddl/01-schemas.sql:15`) e assumido
  pela conexão de aplicação `STYNX_APP_DATABASE_URL … options=-c role=role_app_backend`
  (`.github/workflows/ci.yml:193`). Regra de arquitetura DETRAN ADR-0002: tenancy no caminho de
  requisição via contexto de tenant, **nunca** owner (`docs/meta/adr/ADR-0002-unified-backend-modular-monolith.md:33-35`).
- Decisão do Owner DETRAN **OD-R22-43 (b)** (Adenda B12): checkpoint do CTG-0008 (partes 1 e 2 de
  TASK-0015) e pedido de papel configurável em 1.5.x; o DETRAN **mantém** `role_app_backend`, sem
  mudança de DDL nem de ADR-0002 por este motivo. A alternativa (a) — o DETRAN renomear o seu papel
  para `stynx_app` — foi recusada.
- Decisão do Owner DETRAN **OD-R22-44 (a)** (Adenda B12): pedido de destino por `entity` em 1.5.x.
  A maioria dos tópicos DETRAN (RAIT, TEAT, Portal, DASHBOARD, parâmetros, provisionamento) é **log
  de eventos** lido por SSE e projeções, sem destino de despacho; só as filas RENACH
  (`ch.renach.exam-result`) e BOAT/RENAEST (`SINISTRO_TRANSMISSAO_PENDENTE`,
  `SINISTRO_RETIFICACAO_PENDENTE`) despacham (CTG-0008 §1; #316, "Contexto do consumidor DETRAN").
  OD-R22-19 (porta `sendEvent` roteando por `entity`) ficou condicionada a V-02 ("tópicos sem destino
  não viram entrega"), condição não atendida por 1.5.0.
- Despacho DETRAN: job técnico com ator técnico (OD-R22-41, que tornou UPS-OBX-06 sem objeto). Esta
  issue não reabre esse ponto.

## Base analisada

| Pacote                     | SHA-256 do tarball                                                 | Arquivos lidos                                                                                   |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `@stynx-nyx/outbox@1.5.0`  | `c894be7bd463e7ce53ea8ec42fc1e8deffd05194467af3cd5bff17ac06813952` | `package/dist/outbox/src/outbox.service.js`, `event-stream-source.js`, `types.d.ts`              |
| `@stynx-nyx/data@1.5.0`    | `f6435ce285a7caccb9678a64069976a4bab2dc36487212d6556606598dfeb793` | `package/dist/data/src/database.js`, `types.d.ts`, `migrations/platform/0021_outbox_event_log.sql` |
| `@stynx-nyx/backend@1.5.0` | `660aac91e1c934a5eeca2438ab8b1326f78ec4c4204a404c65a63d0318e30a7d` | `package/dist/backend/src/transactional-command/transactional-command.js` (só o ponto citado)    |

Somas conferidas com `~/.cache/detran-r22/stynx-1.5.0/SHA256SUMS` no ambiente DETRAN. Nesta issue o
`.js` publicado **foi** lido nos pontos citados (linhas abaixo), sem cópia.

## Contrato e provas (resumo)

| ID         | Nível | Origem                                                             | Comportamento exigido (resumo)                                                                                                                          |
| ---------- | ----- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPS-OBX-10 | MUST  | UPS-OBX-01/02; complementa UPS-OBX-08 (#316); CTG-0008 V-07, V-01, V-05 | Nome do papel SQL de aplicação configurável em `outbox` e `data`, com as mesmas garantias (sem owner, RLS, `read committed`, gravável, primário); políticas e _grants_ para esse papel |
| UPS-OBX-11 | MUST  | UPS-OBX-01/02; complementa UPS-OBX-07 (#316); CTG-0008 V-02         | Destino declarado por `entity`/tópico; evento sem destino não cria entrega, não é reclamado e não bloqueia o agregado                                    |

Os detalhes vinculantes de cada ID estão abaixo.

### UPS-OBX-10 — papel SQL de aplicação configurável

**Origem e ID.** UPS-OBX-01/02 exigem isolamento por tenant sob papel de aplicação com RLS; UPS-OBX-08
(#316) pediu migração com papel parametrizável. A leitura do `.js` mostrou que o nome `stynx_app`
também é exigido pelo código de serviço, o que UPS-OBX-08 não cobre. ID novo porque UPS-OBX-01/02
foram fechados e UPS-OBX-08 trata só do artefato de migração.

**Evidência (1.5.0 publicada).**

- `outbox.service.js:108-118` (`appendManyInTransaction`, usado também por `appendInTransaction`,
  `:102-105`): lê `current_user as sql_role` e lança `OutboxEventTransactionError` se
  `live.sql_role !== 'stynx_app'` (`:116`), junto das demais guardas (`trx.role`/`app.role` = `app`,
  `app.tenant_id` presente, `transaction_isolation` = `read committed`, `transaction_read_only` =
  `off`, fora de recuperação, `:116-117`).
- `event-stream-source.js:14-19` (`OutboxEventStreamSource.onPrimary`): `sql_role !== 'stynx_app'` →
  `OutboxEventTransactionError` (`:16`); chamado em `now()` (`:47-48`) e nos dois outros caminhos de
  leitura sob `withRequestContext` (`:68-69`, `:80-81`).
- `@stynx-nyx/data` `database.js:208-220` (`Database.assertLiveCommandIdentity`):
  `live.current_user !== 'stynx_app'` → `TransactionIdentityMismatchError('live app identity
  mismatch')` (`:215`); acionado por `TxOptions.requireActor` (`types.d.ts:15-16`, "verify its live
  PostgreSQL identity") em `database.js:104-105` (transação aninhada) e `:126-127` (transação nova).
  O mesmo literal atinge `@stynx-nyx/backend` `transactional-command.js:500`
  (`{ role: 'app', requireActor: true }`); o DETRAN não consome esse interceptor hoje, mas o registra
  por completude.
- `0021_outbox_event_log.sql:125-147`: políticas `ownership_read`, `ownership_lock`, `clock_tenant`,
  `events_tenant`, `delivery_tenant`, `attempts_tenant`, `acks_tenant`, `map_tenant` todas
  `TO stynx_app`; `:149-161`: _grants_ e _revokes_ só para `stynx_app`/`stynx_reader`.
- DETRAN CTG-0008 §2.3 V-07 ("O SQL do serviço roda com o papel app configurado no `Database` do
  DETRAN (`role_app_backend`)… divergência → checkpoint da parte 1"); spec C-0002 §8.2 V-01, V-05 e
  V-07 (**Divergente** pelo papel).

**Efeito DETRAN.** Sob `role_app_backend`, **toda** anexação publicada falha com
`OutboxEventTransactionError` e a fonte SSE da outbox recusa toda leitura, ainda que o papel tenha as
mesmas propriedades de segurança exigidas (não owner, sem `BYPASSRLS`, RLS forçada). CTG-0008 fica em
checkpoint nas partes 1 (armazenamento e anexação) e 2 (troca atômica) de TASK-0015 (OD-R22-43 (b));
a troca da leitura SSE interna para a outbox publicada (OD-R22-45) também espera este item.

**Comportamento exigido.**

1. **Nome configurável.** O nome do papel SQL de aplicação é configuração pública — por exemplo
   opção de `StynxDataModule`/`Database` herdada pelos pacotes, ou opção de `OutboxModuleOptions` —,
   com padrão `stynx_app` (comportamento de 1.5.0 inalterado para quem não configura). Um único ponto
   de configuração vale para `OutboxService.appendInTransaction`/`appendManyInTransaction`,
   `OutboxEventStreamSource` e `Database.assertLiveCommandIdentity` (e, por ele, para todo
   `requireActor`); nenhum literal `'stynx_app'` restante no caminho de requisição.
2. **Garantias preservadas.** As demais guardas continuam obrigatórias e independentes do nome:
   `app.role = 'app'`, `app.tenant_id` presente e igual a `Database.currentTenantId()`,
   `read committed`, transação gravável, primário, ator presente onde `requireActor`. O STYNX decide se
   acrescenta verificação de propriedade (por exemplo papel sem `BYPASSRLS` e não dono das tabelas da
   outbox); se acrescentar, documenta e testa.
3. **Políticas e _grants_.** As migrações publicadas aceitam o papel configurado (parâmetro de
   aplicação da migração, políticas sem `TO <papel>` fixo, ou equivalente); ou o STYNX publica a lista
   fechada de políticas e _grants_ equivalentes por papel para o consumidor aplicar na própria DDL,
   coerente com UPS-OBX-08 (#316).
4. **Erro distinguível.** Papel divergente do configurado continua recusado com erro tipado; a
   mensagem ou o código permite distinguir "papel errado" de "isolamento/leitura/recuperação errados".

**Prova exigida.** PostgreSQL real, FORCE RLS, papel de aplicação com nome **diferente** de
`stynx_app` (por exemplo `role_app_backend`, `NOSUPERUSER NOBYPASSRLS`), dois tenants: anexação,
idempotência e conflito de UPS-OBX-01 aceitos sob esse papel; leitura por `OutboxEventStreamSource`
(`listSince`, `findById`, `now`) aceita e isolada por tenant; transação com `requireActor` aceita;
o mesmo conjunto sob `stynx_app` sem configuração continua verde; sob o papel owner, sob papel não
configurado, em `repeatable read`, em transação somente leitura ou sem `app.tenant_id` → recusa tipada;
tenant A nunca lê nem grava evento, entrega ou relógio de B.

**Situação provisória DETRAN.** Nenhum contorno: o DETRAN não troca o nome do seu papel nem copia o
serviço (OD-R22-43 (b), A1 item 4). CTG-0008 partes 1 e 2 permanecem em checkpoint até a 1.5.x.

### UPS-OBX-11 — destino por `entity` e eventos sem destino

**Origem e ID.** UPS-OBX-01 exige "distinguir log de eventos e fila de despacho". UPS-OBX-07 (#316)
pediu roteamento por destino a partir do `.d.ts`; a leitura do `.js` confirma a divergência e mostra
que a entrega sem destino bloqueia o agregado e consome tentativas sem limite. Este item fixa o
comportamento confirmado e o efeito sobre o agregado; o STYNX pode atender UPS-OBX-07 e UPS-OBX-11
com a mesma entrega, informando evidência para os dois IDs.

**Evidência (1.5.0 publicada).**

- `outbox.service.js:157-178`: para toda linha nova inserida em `outbox.events` (`:160-163`), o
  serviço insere `outbox.event_delivery (tenant_id, event_id)` incondicionalmente (`:177-178`), sem noção de destino; o
  status padrão é `PENDING` (`0021_outbox_event_log.sql:37-49`, `:41`).
- `outbox.service.js:297-324` (`dispatchEventsDue`): reclama como owner toda entrega `PENDING`/`ERROR`
  vencida ou `SENT` com _lease_ vencido (`:305-306`), de todos os tenants, sem filtro por `entity` ou
  destino; passa a `SENT`, incrementa `attempts` e fixa `lease_until` (`:315-318`); registra tentativa
  `CLAIMED` em `outbox.event_attempts` (`:326-330`).
- `outbox.service.js:307-312`: a reclamação exige que **não exista** entrega anterior não `ACKED` do
  mesmo `(entity, entity_id)`; uma entrega que nunca recebe ACK bloqueia todas as posteriores do mesmo
  agregado.
- `outbox.service.js:342-345`: sem _dispatcher_ configurado, a entrega reclamada fica `SENT` com
  _lease_ e o resultado é `dispatched: false`; ao vencer o _lease_ (`eventLeaseMs`, padrão 300 000 ms,
  `:324`) volta a ser reclamada — `attempts` e tentativas `CLAIMED` crescem sem limite.
- `outbox.service.js:364-369`: depois de envio aceito, a entrega continua `SENT` com novo _lease_ até
  `ackEvent`; sem ACK, é reenviada a cada _lease_.
- `types.d.ts:105-108` e `:148`: um único `OutboxDispatcherPort` por módulo (`send`/`sendEvent?(row:
  OutboxRow)`), sem destino.
- Spec C-0002 §8.2 V-02 (**Divergente**: "Toda anexação nova cria linha `PENDING`… entrega sem ACK
  volta a ser reclamada a cada _lease_ e bloqueia as posteriores do mesmo `(entity, entity_id)`");
  CTG-0008 §2.3 V-02, §9 P-08-5.

**Efeito DETRAN.** Consumir a outbox publicada como log de eventos do DETRAN faria cada evento de
RAIT, TEAT, Portal, DASHBOARD etc. virar entrega eterna: reenviada (ou reclamada sem envio) a cada
5 min, contando tentativas, poluindo a saúde da fila e bloqueando os eventos seguintes do mesmo
agregado — inclusive, quando o mesmo `(entity, entity_id)` também tiver evento com destino, a entrega
RENACH/RENAEST desse agregado. A porta DETRAN `sendEvent` roteando por `entity` (OD-R22-19) não
resolve, porque não pode dar ACK de um evento sem destino sem inventar evidência de transporte.
CTG-0008 fica em checkpoint (OD-R22-44 (a), junto de OD-R22-43).

**Comportamento exigido.**

1. **Declaração de destino.** O consumidor declara, por `entity` (igualdade e prefixo) ou tópico,
   se o evento é despachável e para qual destino nomeado — por registro no módulo, predicado, ou
   opção de _append_ com precedência documentada. Padrão compatível: sem declaração, comportamento de
   1.5.0 (tudo despachável para o _dispatcher_ único).
2. **Evento sem destino.** Gravado no log (`outbox.events`, cursor SSE e idempotência intactos),
   **não** cria linha em `outbox.event_delivery`, nunca é reclamado, nunca chega ao _dispatcher_, não
   gera tentativa e não conta na saúde da fila.
3. **Sem bloqueio indevido.** O bloqueio por agregado considera só entregas existentes; evento sem
   destino nunca bloqueia evento com destino do mesmo `(entity, entity_id)`. Se o bloqueio for por
   destino, o STYNX documenta a regra.
4. **Destino nomeado.** Cada destino tem o seu _dispatcher_ (ou a porta recebe o destino), e o
   despacho é filtrável por destino, para que RENACH e RENAEST sejam drenados cada um pelo seu job sem
   reclamar itens do outro.
5. **Entregas já existentes.** Forma documentada de tratar entregas criadas antes da declaração para
   `entity` que passou a não ter destino (por exemplo marcação terminal sem tentativa), sem apagar
   evento nem trilha.

**Prova exigida.** PostgreSQL real, dois tenants: _append_ de `entity` com e sem destino na mesma
transação → só a com destino gera entrega; `dispatchEventsDue` (e a variante por destino) nunca
reclama, conta ou envia a sem destino (_dispatcher_ falso contando chamadas); evento sem destino
anterior no mesmo `(entity, entity_id)` não impede o despacho do evento com destino; despacho do
destino A não toca entrega do destino B; saúde da fila ignora eventos sem destino; sem declaração, o
comportamento de 1.5.0 continua verde.

**Situação provisória DETRAN.** Nenhum contorno. As filas RENACH/RENAEST continuam na tabela DETRAN
atual até a 1.5.x; CTG-0008 em checkpoint (OD-R22-44 (a)).

## Compatibilidade vinculante

- **Aditivo em 1.5.x.** Nenhuma assinatura publicada em 1.5.0 muda de forma incompatível; papel
  padrão `stynx_app` e "tudo despachável" continuam o comportamento sem configuração.
- **Garantias de isolamento inalteradas.** Configurar o nome do papel nunca relaxa RLS, tenant do
  contexto, `read committed`, primário ou ator; nenhuma via nova de requisição exige owner.
- **Log imutável e cursor.** Declarar destino não altera id, `created_at`, idempotência nem o que
  `OutboxEventStreamSource` entrega (UPS-SSE-03).
- **Owner só fora da requisição** (DDL, corte, _scheduler_ interno), coerente com #306 e OD-R22-41.

## Fora do escopo desta issue

- Os demais pedidos de outbox continuam na #316 (UPS-OBX-03…09); UPS-OBX-06 foi tornado sem objeto
  pelo Owner DETRAN (OD-R22-41).
- `stynx.audit_chain_key` e `outbox.legacy_ownership`, também exigidos por `appendManyInTransaction`
  (`outbox.service.js:129-134`), entram na lista fechada de objetos de UPS-OBX-08, não aqui.

## Critérios de conclusão

- [ ] UPS-OBX-10 atendido por API pública e testes verificáveis (PostgreSQL real, FORCE RLS, dois tenants, papel de aplicação com nome diferente de `stynx_app`, garantias preservadas).
- [ ] UPS-OBX-11 atendido por API pública e testes verificáveis (evento sem destino não cria entrega nem bloqueia o agregado; despacho por destino).
- [ ] Informar versão publicada, símbolos reais exportados, testes/CI e desvios da proposta para cada ID; nome de símbolo proposto pode mudar, comportamento e prova não.
- [ ] Documentar consumo e migração, incluindo a configuração do papel nas migrações e a declaração de destino; não marcar atendido somente por código local ou RC sem evidência de publicação.

## Rastreabilidade

DETRAN (`aarusso-nyx/detran`, branch `orchestra/stynx-sse-tenancy`): `work/rounds/R-0022/contracts/
CTG-0008.md` (SHA-256 `37a0bbb393dd89be28b083e694a11e88bb669b137d909f7fe42a8e403268c449`) §1, §2.3
(V-02, V-07, V-08), §9 (P-08-5); spec `work/campaigns/C-0002-stynx-upstream-spec.md` §8.2 (SHA-256
`c02c48433238e14ba1eb1a79193045f529f5ed9abe6d143cbbc4bb78ebd16d38`); `work/rounds/R-0022/
AUTHORIZATION.md` Adendas B4 e B12; `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002
"R-0022 — decisões do Owner" (OD-R22-19, -41, -43, -44, -45); `backend/database/ddl/01-schemas.sql:15`;
ADR-0002 do DETRAN: `docs/meta/adr/ADR-0002-unified-backend-modular-monolith.md`.

STYNX: https://github.com/stynx-nyx/stynx/issues/306 (fechada); https://github.com/stynx-nyx/stynx/issues/316
(UPS-OBX-07 e UPS-OBX-08, complementados aqui); ledger `work/rounds/R-0002/conformance-1.5.0.md`.

<!-- detran-c0002-upstream:R22-OBX-B12 -->

Índice: #319 · Índice anterior: https://github.com/stynx-nyx/stynx/issues/289
