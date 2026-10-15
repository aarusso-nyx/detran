# R-0022 — handoff real aos appliers de destino

Architect/F1, 2026-10-13. Extensão técnica fechada da lane O8aabcf5a/CTG0009,
não cutover ou alteração de decisões de produto. Published1.6.1 types/SQL lidos:
OfflineSyncItemApplier.apply(trx,item,context) recebe payloadJson/context reais;
OfflineSyncApplyResult.consumerAttributes persiste no recibo stynx na mesma
transação. receiptId nativo é storage key, não UUID consumidor. SDK reclama
numeração antes do apply e finaliza applied depois dele na mesma trx.

## Interfaces e caminhos

Em backend/domains/ops/core/src/sync-applier.ts:

- SyncEntityApplierItem acrescenta `payloadJson?:Readonly<Record<string,unknown>>`
  e `storageMode?:'stynx-ctg9'`. Modo explícito é discriminador trusted interno
  e exige payloadJson/UUID consumidor coerentes; payloadJson sozinho não muda
  guarda/storage. Ausência de ambos preserva legado; combinação parcial recusa.
  Não é switch do body/rota nem permite caller escolher storage.
- Exportar SyncEntityApplierResult exatamente
  `{serverEntityId:string,detailsJson?:Record<string,unknown>}` e usar no retorno
  apply. Validação/regra existente não se modifica.
- Exportar SyncAitNumberingRulePort com único método
  `assertAitNumbering(item:SyncEntityApplierItem,tx:Transaction,
number:number,shiftId:string):Promise<void>`.
  AitSyncApplierDeps acrescenta `numberingRules?:SyncAitNumberingRulePort`.

F2 paths adicionais exatos: backend/domains/inf/ait/src/handwritten/sync-applier.ts;
backend/domains/est/crash/src/handwritten/crash-sync-applier.ts. ops/core path e
ops/offline-sync/src/handwritten/stynx-offline.ports.ts já são lane O. Shared
dependência outbox e offline dependency no owning blueprint são explícitas;
nenhum deep import/código gerado/test edit por F2.

Adapter passa o payloadJson real recebido pelo public port e trusted context
tenant/actor/business-agent/dispositivo/órgão/concurrency, sem ler ops.sync_queue_item
no caminho novo. Usa o parser/validator de domínio existente. Gera um **novo UUID
consumidor real** ao iniciar o apply real; esse UUID é receiptId do handoff para
receipt_protocol/evento AIT, não conversão/hash/coerção da key nativa.

Sucesso retorna consumerAttributes.detranOffline exatamente
`{version:1,receiptId,queueItemId,detailsJson}`; detailsJson ausente no resultado
é omitido, não preenchido com fatos inventados. SDK persiste esse metadata junto
ao efeito/recibo. Mapper só projeta UUID/details originais gravados e confere
queue/tenant/item identity; replay não chama apply nem gera novo UUID. Em falha
na trx esse candidate UUID não é apresentado como receipt confirmado. Outros
attributes/provenance previamente decididos são preservados, sem sobrescrever
namespace stynx. Limite JSON do public port é checado, não truncado.

Crash no caminho novo devolve warnings em detailsJson em vez de UPDATE
ops.sync_receipt; legado sem modo/payloadJson mantém comportamento atual. Resultado
e metadata não concedem atomicidade para outras transações. Dublês são TEST_ONLY.

## Guarda AIT e autoridade da numeração

Nova chamada AIT exige numberingRules e falha fechada se ausente; nunca volta
às tabelas legadas. Port implementation fica no stynx-offline.ports.ts, usa apenas
SELECT fixo na **mesma trx recebida**, sob app role/RLS, sobre published
offline.numbering_reservations/numbering_consumption. Não usa service que abre
tx independente, owner, raw SQL caller, FOR UPDATE novo, lease/counter/claim
próprio ou escrita nessas tabelas.

SELECT confere reserva única que o SDK já cobre/trava para tenant/dispositivo/
orgUnit/entity/number, e seu shift_id contra shiftId canônico. Ambiguidade/
ausência/foreign shift ou estado/vigência divergente recusam com códigos atuais
da guarda AIT, preservando a tabela total de tradução do protocolo. Nada vindo
do payload é tratado como snapshot confiável da reserva. Query/column shape
é byte-bound ao storage publicado, não API privada ou cópia do store SDK.

Adapter fornece reservedNumber a partir do mesmo ait.ait_number canônico antes
do native submit; não omite o número para evitar a guarda SDK. Nova AIT path não
escreve ops.numbering_consumption nem offline consumption: SDK executa claim,
apply e finalized applied atomicamente. Domínio insere AIT/satélites/história/
evento na trx recebida. Legado sem modo/payloadJson continua guarda/consumo existentes.
Nenhum dado de faixa/shift é fabricado do body para substituir leitura real.

## F3 antes de implementação e limites

Novos sensores F3 fechados:
backend/domains/inf/ait/src/handwritten/sync-applier-stynx.spec.ts;
backend/domains/est/crash/src/handwritten/crash-sync-applier-stynx.spec.ts;
backend/domains/ops/offline-sync/src/handwritten/stynx-offline.ports.spec.ts;
backend/domains/inf/ait/tests/integration/r22-stynx-161-ait-sync.integration.spec.ts.
Live usa normal schema/lease posterior, nunca referência auth-minimal ou owner
request. Assertions antigas ficam intactas; legado é observado separadamente.

RED/positivos: payload novo usado sem SELECT queue legado; legacy fallback
inalterado; warnings retornados sem UPDATE receipt legado; consumer UUID real
distinto de key/public receiptId, mesmo em AIT row/event/replay; details lossless;
numberingRules required; shift/tenant/device/org/number mismatch; zero novas
escritas/locks no package protocol; SDK claim e real domain/outbox rollback em
falha; replay zero apply/novo UUID/consumo/evento. Negative details grande/JSON
inválido não pode produzir efeito confirmado com metadata perdido.

Este handoff resolve preparação do sucesso aplicado. Não declara identidade
UUID já resolvida para pending/received/rejected/integrity antes de apply, nem
origem de UUID histórico. Persistência de fatos novos desses caminhos deve ser
fechada por seam público real ou custódia consumidora explícita, com testes
atômicos próprios; não rotular automaticamente missing upstream nem inventar
recibo. Full raw/read/HTTP parity, hash/bytes e remaining blockers continuam
acceptance gates; não ativar produto só porque este bridge passa unit tests.
