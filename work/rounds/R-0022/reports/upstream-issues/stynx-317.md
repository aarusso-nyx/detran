
Requisito upstream do DETRAN, campanha C-0002, rodada consumidora **R-0022** (contrato
**CTG-0009**, migração integral do offline-sync). Todos os itens desta issue são **MUST**, conforme
OD-S15-01 e a adenda A1 da spec C-0002 (§8.1, inclusive "Compatibilidade offline vinculante").
Registro autorizado pelo Owner em 2026-09-29 (DETRAN `work/rounds/R-0022/AUTHORIZATION.md`, Adenda
B4). Esta issue registra o contrato de consumo; implementação, release e governança seguem o STYNX.
Não é declaração de que a lacuna continua ausente na HEAD atual: verificar a API efetivamente
publicada e anexar evidência se já atendida.

Consumidor: **R-0022 / CTG-0009**. Alvo: grupo fixo `@stynx-nyx/*` **1.5.x final** (o DETRAN fixa a
maior 1.5.x final publicada; Adenda A-C2-13). Desenvolvimento pode usar `1.5.x-rc.N`; merge DETRAN
somente com final e conformidade preenchida. MUST ausente bloqueia o CTG consumidor (OD-R22-02 (a)),
sem _shim_, sem cópia do STYNX e sem _store_ customizado que reimplemente `submitDurableSyncBatch`.

Esta issue **não reabre** https://github.com/stynx-nyx/stynx/issues/307. UPS-OFS-01…04 foram
fechados em 1.5.0 com os símbolos `reserveNumbering`/`cancel`/`block`/`close`/`reconcile`/
`settleNumberingReservation`, `getNumberingConsumption`, `OfflineSyncPolicyResolver`,
`OfflineSyncAgentResolver`, `submitSyncBatch`, `getSyncBatchReceipt`/`getSyncItemReceipt`,
`OfflineSyncDurableStore`, `OfflineSyncItemApplier`, `OfflineSyncEventPort`,
`OfflineSyncConcurrencyDetector`, `OfflineSyncHandoffPort`, `OfflineSyncConflictResolver` e
`resolveConflict` (ledger STYNX `work/rounds/R-0002/conformance-1.5.0.md`). Os itens abaixo são
divergências definitivas que o DETRAN encontrou entre o `.d.ts`/SQL publicados e o protocolo público
DETRAN que a A1 manda preservar.

## Estado DETRAN

**CTG-0009 está em checkpoint OD-R22-02** (OD-R22-22, -24, -25, -26, -27 e -30 = checkpoint;
plano R-0022 Adenda A3). A caracterização antes/depois (TASK-0017) está entregue: 44 casos HTTP reais
(TEAT e BOAT) e 3 de integração SQL sob `role_app_backend`, critérios C-09-01…26. A migração
(TASK-0018) só é despachada quando a 1.5.x fechar os itens abaixo e as verificações V-01…V-15 forem
conformes. **Não há exceção provisória do Owner para offline-sync**: o protocolo DETRAN existente
continua em produção, sem novo contorno, até a 1.5.x.

## Base analisada

- `@stynx-nyx/offline-sync@1.5.0`, tarball SHA-256
  `d4892e4bce39c0d8caa1e9eab3f4507759fa8b6ab8c4d7af30a8c3432d2c6e4b`: `.d.ts` em
  `package/dist/offline-sync/src/` (`types.d.ts`, `offline-sync.service.d.ts`, `errors.d.ts`,
  `postgres-offline-sync.store.d.ts`, `postgres-durable.d.ts`, `transport.d.ts`,
  `ctg9-offline-sync.controller.d.ts`) e `package/migrations/0001_offline_sync.sql`,
  `0002_durable_sync.sql`.
- O `.js` publicado **não** foi lido pelo DETRAN; comportamento não fixado é pedido como contrato
  documentado e testado (UPS-OFS-14).

## Contexto do consumidor DETRAN

Protocolo DETRAN: 12 rotas em `v1/ops/offline-sync` (controlador DETRAN com `@Resource`/`@Action`/
`@Audit`; o `CTG9OfflineSyncController` publicado não é montado, `mountControllers: false`), fachada
`OfflineSyncCommands`, porta de aplicação `SyncEntityApplier` (_appliers_ AIT e BOAT/_crash_),
armazenamento gerado `ops.*` (7 tabelas; BP-OPS-OFFLINE-SYNC-001), contrato público
`docs/framework/schemas/teat-offline-sync-batch.schema.json` (`items` `minItems: 1` sem `maxItems`;
`payload_hash` string 1–128; `idempotency_key` opcional 1–160; `batch_sequence` opcional ≥ 1).
Parâmetros de catálogo: `teat.numbering.reservation_ttl_hours` (72) e
`sync.concurrency_window_minutes` (proposta, `source_pending`). Inventário: CTG-0009 §1 (20 itens).

## Contrato e provas (resumo)

| ID         | Nível | Origem (ID pai; contrato DETRAN)        | Comportamento exigido (resumo)                                                                                          |
| ---------- | ----- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| UPS-OFS-05 | MUST  | UPS-OFS-01; D-01, P-09-3, C-09-04        | Reserva de numeração idempotente por chave do pedido                                                                    |
| UPS-OFS-06 | MUST  | UPS-OFS-03/04; D-02, P-09-4, C-09-10     | Estado de fila `pending` (materialização e depois de `retry_after_correction`)                                          |
| UPS-OFS-07 | MUST  | UPS-OFS-04; D-03, P-09-4, C-09-10        | `manual_review` registra a ação e mantém o conflito aberto                                                              |
| UPS-OFS-08 | MUST  | UPS-OFS-02; D-04, P-09-9, C-09-01/07/17/18 | Persistir e expor os campos que os envelopes públicos devolvem                                                        |
| UPS-OFS-09 | MUST  | UPS-OFS-03/04; D-05, P-09-5, C-09-08/09  | Contexto do _applier_ com identificador do recibo e resultado de suspeita de concorrência                               |
| UPS-OFS-10 | MUST  | UPS-OFS-02; D-08, P-09-6, B-10, C-09-12/17 | `payload_hash` compatível com o contrato público (string 1–128), sem limite novo                                       |
| UPS-OFS-11 | MUST  | UPS-OFS-02/04; D-09, P-09-9, C-09-07/11/18 | Listagens de recibos, fila e conflitos sob tenant e RLS                                                                |
| UPS-OFS-12 | MUST  | UPS-OFS-01; D-06, F-05, P-09-11, V-11    | Faixa de numeração compatível (chave, turno opcional, atributos do consumidor) e administrável                          |
| UPS-OFS-13 | MUST  | UPS-OFS-01…04; V-09, P-09-1, §6          | Migração separável com papel e tabela de tenant do consumidor; importação suportada do estado de protocolo existente     |
| UPS-OFS-14 | MUST  | UPS-OFS-01…04; V-01…V-15 (exceto V-09)   | Comportamento hoje não fixado pelo `.d.ts` documentado no contrato e coberto por teste                                  |

**Por que IDs novos.** #307 foi fechada com evidência por ID; subitens (`UPS-OFS-01a`…) confundiriam o
estado de IDs fechados. Cada item novo declara o ID pai. A divergência **D-07** (`queueItemId`
obrigatório e fornecido pelo cliente, parte de `batchContextFingerprint`) **não** é pedida como mudança:
o Owner decidiu usar a chave do item como `queueItemId` (OD-R22-23 (a)), condicionado à verificação
V-05, que está em UPS-OFS-14.

### UPS-OFS-05 — reserva de numeração idempotente

**Evidência (1.5.0).** `types.d.ts:37-46`: `ReserveNumberingInput { orgUnitId, deviceId, shiftId,
entityType, requestedSize, rangeId?, series?, validUntil? }` — sem chave de idempotência;
`offline-sync.service.d.ts:7` `reserveNumbering(input)`. DETRAN CTG-0009 §2.4 D-01 (**Ausente**),
§1 #10 (`reserve-numbering.command.ts`: reserva idempotente por `idempotency_key` do corpo),
§4 C-09-04, §11 P-09-3; OD-R22-24 (a) checkpoint.

**Comportamento exigido.**
1. Chave de idempotência opcional no pedido de reserva, com escopo de tenant.
2. Mesma chave e mesmo pedido → devolve **a mesma reserva**, sem consumir números nem emitir novo
   evento.
3. Mesma chave e pedido diferente → erro tipado e distinguível dos demais (o DETRAN o traduz para 409
   `TEAT.IDEMPOTENCY_REPLAY`); a reserva original fica intacta.
4. Os erros de reserva ativa no mesmo dispositivo/turno e de esgotamento da faixa permanecem
   distinguíveis entre si e deste (o DETRAN traduz para 409
   `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS` e 422 `TEAT.NUMBERING_RANGE_EXHAUSTED`).
5. Sem chave → comportamento atual da 1.5.0 (compatível).

**Prova exigida.** PostgreSQL real, FORCE RLS, dois tenants: replay da mesma chave e pedido devolve a
mesma reserva sob concorrência (N requisições simultâneas, um único intervalo consumido); chave
reusada com outro pedido recusada; mesma chave em tenants distintos → reservas independentes;
intervalos de reservas concorrentes em dispositivos distintos disjuntos e dentro da faixa.

### UPS-OFS-06 — estado de fila `pending`

**Evidência (1.5.0).** `types.d.ts:1` `OfflineSyncQueueStatus = 'received' | 'applied' | 'conflict' |
'rejected'`; `0001_offline_sync.sql:75-76` e `0002_durable_sync.sql:68`, `:87` (`CHECK (status IN
('received','applied','conflict','rejected'))` em fila, recibos e tentativas). DETRAN CTG-0009 §2.4
D-02 (o DETRAN usa `pending` na materialização e depois de `retry_after_correction`, e
`GET sync-queue-items` o expõe), §1 #5 e #13, §4 C-09-10 (`retry_after_correction` → conflito
`resolved`, item `pending`); OD-R22-25 (a).

**Comportamento exigido.** O estado `pending` representado no tipo, no `CHECK` e nas transições do
_store_ durável: item materializado aguardando aplicação; item devolvido a `pending` pela resolução
`retry_after_correction`; consultas e recibos o devolvem. As transições de/para `pending` são
documentadas e não quebram as garantias de UPS-OFS-02/03 (replay sem novo efeito, transação por item).

**Prova exigida.** PostgreSQL real: resolução `retry_after_correction` leva o item a `pending` e o
conflito a `resolved` na mesma transação; item `pending` visível na consulta com o status; replay
depois de `pending` não duplica efeito; dois tenants.

### UPS-OFS-07 — `manual_review` com conflito aberto

**Evidência (1.5.0).** `0001_offline_sync.sql:113-116`: `CHECK ((status = 'open' AND resolution IS
NULL AND resolved_at IS NULL) OR (status = 'resolved' AND resolution IS NOT NULL AND resolved_at IS
NOT NULL))`; `0002_durable_sync.sql:15-20` amplia a lista de `resolution` (inclui `manual_review`) e
acrescenta `resolution_reason`/`resolution_user_ref`, sem mudar essa regra. DETRAN CTG-0009 §2.4 D-03,
§1 #13 (`manual_review` registra e mantém aberto), §4 C-09-10 (`manual_review` → 200 `status: open`,
`resolved_at: null`); OD-R22-25 (a).

**Comportamento exigido.** Uma ação de resolução pode ser **registrada sem encerrar** o conflito:
`manual_review` grava ação, autor (`userRef`) e instante, mantém `status = open` e `resolved_at` nulo,
e o conflito continua aceitando uma ação final depois. O resolvedor do consumidor
(`OfflineSyncConflictResolver`) decide quais ações encerram; `allowedActions` continua governando a
recusa. Histórico das ações preservado.

**Prova exigida.** PostgreSQL real: `manual_review` → conflito aberto com a ação registrada; ação
final posterior → `resolved`; ação fora de `allowedActions` recusada; `accept_server` em conflito
`concurrency` recusado quando o resolvedor assim declara; dois tenants.

### UPS-OFS-08 — campos dos envelopes públicos persistidos e expostos

**Evidência (1.5.0).** `types.d.ts:232-237` `SyncItemReceipt { queueItemId, status, errorCode?,
context? }`; `0002_durable_sync.sql:61-76` (`offline.sync_item_receipts`: `idempotency_key`,
`queue_item_id`, `device_id`, `device_batch_id`, `payload_hash`, `status`, `error_code`,
`context_json`, `received_at`, `updated_at`); `0001_offline_sync.sql:62-83` (`offline.sync_queue_items`)
e `:93-117` (`offline.sync_conflicts`); `0002_durable_sync.sql:111-121`
(`offline.sync_conflict_evidence.evidence jsonb`). DETRAN CTG-0009 §2.4 D-04, §5 B-03, §12 F-02;
OD-R22-30 (b).

**Campos devolvidos hoje pelos envelopes DETRAN e sem coluna/símbolo publicado** (CTG-0009 D-04):
- Item de fila: `server_entity_id`, `error_code`, `error_message`, `attempts`, `sent_at`,
  `traffic_agency_id` (UUID).
- Recibo: identificador do recibo, `reason_code`, `details_json`, `applied_at`.
- Conflito: `reason_code`, `safe_message`, `correlation_id`, `local_hash`, `server_hash`,
  `retryable`.

**Comportamento exigido.** Esses dados persistidos pelo _store_ durável e devolvidos pelos símbolos
de consulta (recibo por chave, consultas de UPS-OFS-11), de forma tipada. Se o STYNX optar por
carregá-los em `context_json`/`evidence`, o formato é documentado, estável, preenchido pela plataforma
nos caminhos correspondentes (aplicação, recusa, integridade, concorrência) e exposto no tipo. Em
replay, `server_entity_id` do recibo é o da aplicação original.

**Prova exigida.** PostgreSQL real: lote aplicado → recibo com id, `applied_at` e `server_entity_id`;
recusa por integridade → conflito com `local_hash` = recebido e `server_hash` = gravado; item com
erro → `error_code`/`error_message`/`attempts`; replay devolve os mesmos valores; dois tenants.

### UPS-OFS-09 — contexto do _applier_: recibo e suspeita de concorrência

**Evidência (1.5.0).** `types.d.ts:163-169` `OfflineSyncItemContext { tenantId, actorId, agentId,
orgUnitId, deviceId, batchId, now }`; `:155-158` `CTG9SyncBatchItemInput` (sem `receiptId`);
`:180-182` `OfflineSyncItemApplier.apply(trx, item, context)` → `{ serverEntityId }`; `:191-197`
`OfflineSyncConcurrencyDetector.detect` → `{ suspected, pairs }` sem via documentada até o _applier_.
DETRAN CTG-0009 §2.4 D-05 (`receiptId` é o `receiptProtocol` do evento `AIT_RECEBIDO`; com suspeita o
AIT **é aplicado** e o recibo fica `conflict`), §1 #15 (`SyncEntityApplierItem` inclui `receiptId` e
`concurrencySuspect`), §4 C-09-08/C-09-09; OD-R22-26 (a).

**Comportamento exigido.**
1. O contexto de aplicação carrega o identificador estável do recibo do item (o mesmo exposto por
   UPS-OFS-08 e devolvido em replay).
2. O contexto de aplicação carrega o resultado da detecção de concorrência do item (suspeito ou não,
   pares).
3. Desfecho "aplicado com suspeita": o efeito do _applier_ é confirmado e o recibo/fila ficam
   `conflict` com conflito `concurrency` nos **dois** itens do par, na mesma transação do item.

**Prova exigida.** PostgreSQL real: _applier_ de teste recebe `receiptId` igual ao do recibo
persistido; par suspeito → efeito aplicado, recibo `conflict`, conflito nos dois itens; _handoff_
autorizado → sem suspeita; falha do _applier_ reverte efeito, consumo e eventos do item; dois tenants.

### UPS-OFS-10 — `payload_hash` compatível com o contrato público

**Evidência (1.5.0).** `0001_offline_sync.sql:72` (`offline.sync_queue_items.payload_hash CHECK
(payload_hash ~ '^sha256:[0-9a-f]{64}$')`) e `:98` (`offline.sync_conflicts.payload_hash`, mesmo
`CHECK`). DETRAN contrato público `teat-offline-sync-batch.schema.json`: `payload_hash` string 1–128
(CTG-0009 §1 #19); hash canônico DETRAN = `sha256:` + hex (`canonical-hash.ts`, §1 #7); §2.4 D-08;
§5 B-10; OD-R22-27 (b) checkpoint (spec §8.1: "novos limites exigem decisão do Owner, não tradução
silenciosa").

**Comportamento exigido.** O armazenamento aceita e persiste o `payload_hash` recebido dentro do
contrato do consumidor (configurável; para o DETRAN, string de 1 a 128). Um valor fora do formato
canônico não pode virar erro de banco: segue o caminho de integridade por item (recibo recusado e
conflito `integrity` com o hash recebido registrado), como qualquer divergência entre `payload_hash` e
o hash canônico de `payload_json`. O padrão atual (`sha256:<64 hex>`) pode continuar como padrão.

**Prova exigida.** PostgreSQL real: lote com item de `payload_hash` fora do formato canônico (ex.: 1 e
128 caracteres) → 200 com recibo recusado por integridade, conflito com `local_hash` = valor recebido,
demais itens processados; item com hash canônico correto aplicado; nenhum erro de `CHECK`.

### UPS-OFS-11 — listagens de recibos, fila e conflitos

**Evidência (1.5.0).** `offline-sync.service.d.ts:2-19` e `types.d.ts:272-281`
(`OfflineSyncDurableStore`): só consultas pontuais (`getSyncItemReceipt(idempotencyKey)`,
`getSyncBatchReceipt(deviceId, deviceBatchId)`, `getNumberingConsumption(id)`); nenhuma listagem.
DETRAN CTG-0009 §2.4 D-09, §1 #4 (`offline-sync.reads.ts`: rotas `GET receipts/:tenantId`,
`GET sync-queue-items`, `GET sync-conflicts`; filtros `device_id`/`status`; recibos em
`created_at desc`; `{tenantId}` ≠ principal → 404 `TEAT.TENANT_MISMATCH`), §4 C-09-07/11/18;
OD-R22-30 (b).

**Comportamento exigido.** Listagens publicadas, sob papel de aplicação e tenant do contexto (sem
owner), de recibos de item, itens de fila e conflitos, com filtros por dispositivo, status (e tipo de
conflito), ordem `created_at desc` com desempate estável, limite e cursor; linhas com os campos de
UPS-OFS-08. Dados de outro tenant nunca aparecem.

**Prova exigida.** PostgreSQL real, FORCE RLS, dois tenants: filtros por `device_id` e `status`
corretos (inclusive o filtro por dispositivo em recibos); ordem e paginação estáveis; listas de B
vazias sob A.

### UPS-OFS-12 — faixa de numeração compatível e administrável

**Evidência (1.5.0).** `types.d.ts:10-20` `NumberingRange { id, tenantId, orgUnitId, entityType,
series, startNumber, endNumber, nextNumber, status }`; `0001_offline_sync.sql:10-12` (`org_unit_id`,
`entity_type`, `series` texto), `:38` (`numbering_reservations.shift_id text NOT NULL`);
`types.d.ts:37-46` (`shiftId` obrigatório); nenhum símbolo de criação/administração de faixa em
`OfflineSyncService`. DETRAN CTG-0009 §2.4 D-06 (faixa DETRAN por `(traffic_agency_id, series)` com
`usage_mode`, administrada por CRUD gerado sobre `ops.ait_numbering_range`), §12 F-05 (no DETRAN
`shift_id` aceita nulo e a busca de reserva ativa usa `is not distinct from`), §3 V-11, §11 P-09-11.

**Comportamento exigido.**
1. `shiftId` opcional na reserva, com regra documentada de reserva ativa por dispositivo e turno
   quando o turno é nulo (equivalente a `is not distinct from`).
2. Chave de faixa que admita a do consumidor (unidade + série, com `entityType` fixo pelo
   consumidor) e ids de unidade em formato UUID sem perda.
3. Meio publicado de administrar faixas sob RLS (API de criação/consulta/listagem/cancelamento) **ou**
   contrato documentado e suportado de escrita pelo consumidor em `offline.numbering_ranges`
   (colunas, invariantes de `next_number`, concorrência com reservas).
4. Atributos de faixa do consumidor (o DETRAN usa `usage_mode`) representáveis e preservados.

**Prova exigida.** PostgreSQL real: reserva sem turno e recusa de segunda reserva ativa no mesmo
dispositivo sem turno; faixa criada pelo meio publicado usada por reserva concorrente sem
sobreposição; atributos do consumidor preservados; dois tenants.

**Nota.** A semântica exata de `usage_mode` depende de leitura DETRAN ainda não feita (CTG-0009 §13
A-3); o DETRAN a anexará como comentário antes de o STYNX fechar o item 4.

### UPS-OFS-13 — migração separável, papel e tenant do consumidor, importação do estado existente

**Evidência (1.5.0).** `0001_offline_sync.sql:5` (esquema com dono `stynx_owner`), FK
`tenancy.tenants(id)` em todas as tabelas (ex.: `:64`, `:95`), `:158-160` (_grants_ a
`stynx_app`/`stynx_reader`); `0002_durable_sync.sql:23`…`:112` (FK `tenancy.tenants`), `:170-171`
(_grants_), `:125-137` (conversão de linhas 0001 em lotes `legacy_closed_unverified`). As políticas
`offline_tenant_isolation` são `FOR ALL` sem `TO <papel>` (0001 `:127-131`), o que já independe do
nome do papel. DETRAN CTG-0009 §3 V-09, §6 (regras 1–6, inclusive migração de dados `ops.*` →
`offline.*` preservando ids, `created_at`, estados, recibos, conflitos, consumo, `declared_keys` e
sequências), §11 P-09-1 (opção (b) — _store_ DETRAN sobre `ops.*` — vedada, L-08 de R-0021);
OD-R22-22 (c) checkpoint.

**Comportamento exigido.**
1. Tabela de tenant da FK e papéis de _grant_ parametrizáveis pelo consumidor (DETRAN:
   `auth.tenants`, `role_app_backend`); lista fechada publicada dos objetos que o SQL do _store_
   referencia; aplicação idempotente ou verificável.
2. O SQL do _store_ roda no `Database` do consumidor sob papel de aplicação com `app.tenant_id`, sem
   owner, em todas as operações de requisição.
3. Via suportada de **importação do estado de protocolo existente** do consumidor (lotes com
   `declared_keys` e sequência, recibos, itens, conflitos, reservas e consumo), com mapeamento
   fornecido pelo consumidor, preservando ids e `created_at` e permitindo replay exato do ACK quando o
   consumidor fornece a evidência da resposta original (sem cair obrigatoriamente em
   `legacy_closed_unverified`).

**Prova exigida.** Migração aplicada com tabela de tenant e papel diferentes dos do STYNX; suítes
UPS-OFS-01…04 sob esse papel com FORCE RLS e dois tenants; importação de estado com contagens por
tenant e estado antes/depois, 0 perda, 0 duplicata, replay de lote importado devolvendo a resposta
original.

**Nota.** A importação (item 3) é o análogo, para offline-sync, do corte de UPS-OBX-03. Nenhuma
exceção do Owner autoriza o DETRAN a fazê-la por conta própria (OD-R22-22 = checkpoint).

### UPS-OFS-14 — comportamento fixado em contrato e teste

Verificações do contrato DETRAN (CTG-0009 §3) que o `.d.ts` e o SQL não respondem. O STYNX documenta
cada uma no contrato publicado e aponta o teste que a cobre; onde o comportamento divergir do
esperado pela compatibilidade vinculante, o item exige a correção.

| Verificação | O que documentar e testar                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| V-01        | `OfflineSyncPolicy.maxBatchItems: null` remove o limite de itens; nenhum caminho do modo durável mantém o limite fixo de 100 da 1.4.0 (lote de 101 itens aceito)                                                                                   |
| V-02        | Item sem `idempotencyKey` com `legacyItemIdentityResolver` fica `received`, não é aplicado e o recibo carrega código neutro (`OFFLINE_SYNC_LEGACY_ITEM_NOT_APPLIED`, segundo #307); lote sem `batchSequence` aceito sem consumir sequência               |
| V-03        | Códigos, status e contexto de sequência repetida (409), lacuna (422 com sequência esperada, recebida e `deviceBatchId`), replay com outro conjunto ou outra sequência (409) e integridade; `OFFLINE_SYNC_BATCH_SEQUENCE` distingue repetição de lacuna |
| V-04        | Uma transação por item (efeito do _applier_, consumo, recibo, eventos); erro do _applier_ → _rollback_ do item e recibo de recusa gravado depois; mapeamento de `code`/`context` do erro de domínio para `errorCode`/`context`/`status` (`rejected` × `conflict`) |
| V-05        | Replay de item em outro lote devolve o recibo sem `apply`; hash divergente → recibo recusado e conflito `integrity` com os dois hashes; origem de `server_entity_id` no replay; semântica de `queueItemId` reutilizado entre lotes (D-07, OD-R22-23) |
| V-06        | `policyResolver` chamado por operação com `at` do relógio injetado (`options.now`); `reservationTtlMs` da política prevalece sobre `options.reservationTtlMs` e sobre o padrão de 24 h; `validUntil` do pedido respeitado; efeito de política sem TTL |
| V-07        | Detector chamado por item; os dois itens do par ficam `conflict` com conflito `concurrency`; `concurrencyWindowMinutes: null` desliga; _handoff_ consultado por par; sinal para o aviso de janela sem fonte (DETRAN `SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING`) |
| V-08        | `resolveWithPort`: `allowedActions` governa a recusa; o resolvedor pode manter o conflito aberto (UPS-OFS-07); transação e evento da resolução                                                                                                    |
| V-10        | `agentId` persistido vem do `agentResolver` e é distinto de `audit_actor_id`; como o resolvedor recebe o `agent_id` de negócio do pedido (a assinatura `resolve(scope, operation)` não o recebe)                                                  |
| V-11        | Reserva: limite de `requestedSize` (1.4.0: 1–100; limite novo exige decisão do Owner DETRAN), obrigatoriedade de `shiftId` (UPS-OFS-12), reserva ativa por dispositivo/turno, código de esgotamento, ausência de sobreposição sob concorrência             |
| V-12        | `cancel`/`block`/`close`: estados de origem, repetição idempotente sem novo evento, recusa de reserva totalmente consumida, devolução da cauda à faixa, marcação do consumo não aplicado                                                          |
| V-13        | Reconciliação: estados admitidos, número fora do intervalo, uma linha por número, `missingOnServer`/`unexpectedOnServer`, registro da reconciliação                                                                                               |
| V-14        | Quais eventos o serviço entrega ao `eventPort`, quando (na `trx` do item, em recusa, na abertura de conflito) e com que chave; o consumidor consegue manter os seus envelopes como os únicos da trilha pública                                   |
| V-15        | `stableStringify`/`batchContextFingerprint` × hash canônico do consumidor (ordem de chaves, `undefined` omitido): mesmo _hash_ para o mesmo _payload_, ou porta para o consumidor fornecer o seu                                                    |

V-09 está em UPS-OFS-13. Fonte: DETRAN CTG-0009 §3 (tabela V-01…V-15) e §5 (B-01…B-13).

## Compatibilidade vinculante

Transcrita da spec C-0002 §8.1 e de #307; vale para todos os IDs desta issue.

- Preservar rotas, status HTTP, envelopes e códigos públicos existentes; a caracterização DETRAN
  (R-0021 C-01-20…30 e R-0022 C-09-01…26, HTTP real TEAT e BOAT) é a prova antes/depois. O tenant
  provém do contexto confiável; campos enviados pelo cliente não o substituem. Preservar `agent_id` de
  negócio e `actorId` auditável sem assumir igualdade; associação/autorização continuam verificadas
  pelo app.
- Lotes legados sem `batch_sequence` continuam aceitos; itens sem `idempotency_key` usam a chave
  sintética existente (`legacy:<device_id>:<local_entity_id>`) e ficam `received` com
  `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`, sem aplicar ao domínio. A plataforma representa esse estado,
  não inventa chaves para aplicar o legado.
- A entrada aceita `items` com ao menos um item, sem máximo de 100; lote com mais de 100 itens é
  provado. Limites do contrato público para strings, hashes, UUIDs e numeração são mantidos; limite
  novo exige decisão do Owner, não tradução silenciosa (UPS-OFS-10, V-11).
- Operações de faixa, resolução e lote preservam efeitos e recibos; método com nome semelhante não é
  equivalência semântica (UPS-OFS-05, -06, -07, -09).
- TTL e janela de concorrência são dados do catálogo, variáveis por escopo, resolvidos por operação
  com relógio testável; sem configuração global fixa nem cálculo de novos valores de negócio; política
  existente para parâmetro ausente preservada.
- **Aditivo em 1.5.x**: símbolos publicados em 1.5.0 e o modo E6 continuam válidos; as mudanças de
  `CHECK` e colunas vêm como migração _forward-only_ documentada.
- Códigos neutros `OFFLINE_SYNC_*` são traduzidos pelo adaptador DETRAN; nunca vazam nas respostas
  DETRAN.

## Critérios de conclusão

- [ ] UPS-OFS-05 atendido por API pública e testes verificáveis (concorrência com banco real, dois tenants).
- [ ] UPS-OFS-06 atendido por API pública e testes verificáveis.
- [ ] UPS-OFS-07 atendido por API pública e testes verificáveis.
- [ ] UPS-OFS-08 atendido por API pública e testes verificáveis (todos os campos listados, inclusive em replay).
- [ ] UPS-OFS-09 atendido por API pública e testes verificáveis (aplicado com suspeita; _rollback_ real).
- [ ] UPS-OFS-10 atendido por API pública e testes verificáveis (hash fora do formato canônico sem erro de banco).
- [ ] UPS-OFS-11 atendido por API pública e testes verificáveis (filtros, ordem, paginação, dois tenants).
- [ ] UPS-OFS-12 atendido por API pública ou contrato de escrita suportado, e testes verificáveis.
- [ ] UPS-OFS-13 atendido por migração publicada separável, importação suportada e testes com papel/tabela de tenant do consumidor.
- [ ] UPS-OFS-14 atendido por contrato publicado e teste nomeado para cada verificação V-01…V-08, V-10…V-15.
- [ ] Informar versão publicada, símbolos reais exportados, testes/CI e desvios da proposta para cada ID; nome de símbolo proposto pode mudar, comportamento e prova não.
- [ ] Documentar consumo e migração, incluindo restrições de contexto/tenant e de papel; não marcar atendido somente por código local ou RC sem evidência de publicação.

## Rastreabilidade

DETRAN (`aarusso-nyx/detran`, branch `orchestra/stynx-sse-tenancy`): `work/rounds/R-0022/contracts/
CTG-0009.md` (SHA-256 `a57c2cb9c1381df609912f886768269457faac5ec30d1174495d80c5fc25deb2`) §0, §1,
§2.1, §2.4 (D-01…D-09), §3 (V-01…V-15), §4, §5, §6, §11 (P-09-*), §12, §13;
`work/rounds/R-0022/AUTHORIZATION.md` Adendas B3/B4; `work/rounds/R-0022/plan.md` Adenda A3;
`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 "R-0022 — decisões do Owner"
(OD-R22-02, -22…-30); spec `work/campaigns/C-0002-stynx-upstream-spec.md` §8.1 (SHA-256
`291f18da6d2cc9d381c855d45bca3d61da59bbb424b93523bdde195b0137383d`).

STYNX: https://github.com/stynx-nyx/stynx/issues/307 (fechada); ledger
`work/rounds/R-0002/conformance-1.5.0.md`; ADR `law/adr/ADR-MOBILE-OFFLINE-0002-sync-parity.md`.

<!-- detran-c0002-upstream:R22-OFS -->

Índice: #319 · Índice anterior: https://github.com/stynx-nyx/stynx/issues/289

