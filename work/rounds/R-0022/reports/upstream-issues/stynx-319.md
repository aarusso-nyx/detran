
Índice dos pedidos do DETRAN para uma release **`@stynx-nyx/*` 1.5.x** que feche as lacunas de
**outbox**, **offline-sync** e **assinatura** que a rodada consumidora **R-0022** encontrou na **1.5.0 final
publicada**. Registro autorizado explicitamente pelo Owner em 2026-09-29: "Leve esses pedidos ao
STYNX através de github issues no repositório STYNX detalhados, seguindo o modelo adotado de forma
que possibilite aos agentes o seu completo entendimento e contextualização" (DETRAN
`work/rounds/R-0022/AUTHORIZATION.md`, Adenda B4). A autorização cobre o registro de issues; não
autoriza código, branch ou release no STYNX pelo DETRAN.

Este índice continua o índice fechado https://github.com/stynx-nyx/stynx/issues/289 (76 requisitos,
18 grupos). As issues de área anteriores https://github.com/stynx-nyx/stynx/issues/305 (UPS-SIG),
https://github.com/stynx-nyx/stynx/issues/306 (UPS-OBX) e
https://github.com/stynx-nyx/stynx/issues/307 (UPS-OFS) foram fechadas com evidência por ID na 1.5.0;
**nada aqui as reabre**. Os pedidos novos recebem IDs novos, com a origem de cada um (ID pai,
verificação `V-nn` ou divergência `D-nn` do contrato DETRAN) declarada no próprio item.

<!-- detran-c0002-upstream:R22-TRACKER -->

## Regra de consumo (inalterada)

- Todos os itens são **MUST** (OD-S15-01; adenda A1 da spec C-0002 §8.1 para SIG/OBX/OFS).
- MUST ausente ou divergente na versão fixada → **checkpoint e parada do CTG consumidor** (DETRAN
  OD-R22-02 (a)), sem _shim_, cópia do mecanismo genérico ou contorno local. Adaptadores finos podem
  traduzir nomes/envelopes e aplicar regra de negócio DETRAN; não podem reconstruir o mecanismo.
- Pin DETRAN: a **maior 1.5.x final** publicada, exata, pela fonte única `tools/stynx-version.json`
  (Adenda A-C2-13 de R-0022). RC serve ao desenvolvimento; merge DETRAN só com final. Uma versão fora
  da linha 1.5.x exige nova decisão do Owner DETRAN.
- Conformidade se comprova por ID: versão publicada, símbolos reais exportados, testes/CI e desvios.
  Código local ou RC sem publicação não fecha item.

## Base analisada

Tarballs 1.5.0 final (SHA-256, `~/.cache/detran-r22/stynx-1.5.0/SHA256SUMS` no ambiente DETRAN):

| Pacote                      | SHA-256 do tarball                                                 |
| --------------------------- | ------------------------------------------------------------------ |
| `@stynx-nyx/outbox@1.5.0`   | `c894be7bd463e7ce53ea8ec42fc1e8deffd05194467af3cd5bff17ac06813952` |
| `@stynx-nyx/data@1.5.0`     | `f6435ce285a7caccb9678a64069976a4bab2dc36487212d6556606598dfeb793` |
| `@stynx-nyx/offline-sync@1.5.0` | `d4892e4bce39c0d8caa1e9eab3f4507759fa8b6ab8c4d7af30a8c3432d2c6e4b` |
| `@stynx-nyx/signature@1.5.0` | `813490dd0276161e524a238523d986ea797f06de8c9c0a919eaf1cade35f158b` |

Para outbox e offline-sync, o DETRAN leu **só** os `.d.ts` publicados e as migrações SQL publicadas
(`data/migrations/platform/0018_outbox.sql`, `0021_outbox_event_log.sql`;
`offline-sync/migrations/0001_offline_sync.sql`, `0002_durable_sync.sql`); todo comportamento que
`.d.ts` e SQL não fixam aparece nas issues como verificação `V-nn`, pedida ao STYNX como contrato
documentado e testado. Para assinatura, o `.js` publicado foi lido nos pontos citados em #318.

## O que a 1.5.0 atendeu (símbolos declarados pelo STYNX)

Fonte: ledger STYNX `work/rounds/R-0002/conformance-1.5.0.md` (§CTG9 A1 §8.1) e comentários de
fechamento de #306/#307. O DETRAN confirmou a presença desses símbolos nos `.d.ts` publicados; a
equivalência de comportamento no consumidor continua sendo prova DETRAN.

| ID         | Símbolos publicados em 1.5.0                                                                                                                                                                                                                    | Situação DETRAN (R-0022)                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| UPS-SIG-01 | `SignatureRequest.minimumSignatureLevel`, `SignatureTrustProfile`, `createCmsTrustVerifier`                                                                                                                                                   | Símbolos presentes (CTG-0006 §0); `QUALIFIED` só por _callback_ do consumidor                   |
| UPS-SIG-02 | `SignatureService.checkReadiness`, `SignatureReadinessIndicator`, `SignatureHealthIntegration`, `SignatureCapabilityError`                                                                                                                    | Divergente em comportamento para LTA: `stynx-cms` informa `lta: false` fixo (desvio já declarado em #305) |
| UPS-SIG-03 | `canonicalRfc8785Json`; `SignatureManifestService.prepareSession`/`prepareBatch`/`appendVerifiedSigner`/`verifyManifest`                                                                                                                      | Símbolos presentes; prova M-06-P pendente                                                        |
| UPS-SIG-04 | `SignatureWithdrawalVerifier.verifyWithdrawalEvidence`                                                                                                                                                                                         | Símbolos presentes; prova M-06-P pendente                                                        |
| UPS-OBX-01 | `OutboxService.appendInTransaction`/`appendManyInTransaction`; `OutboxEventStreamSource.now`/`findById`/`listSince`; `outbox.events` `UNIQUE (tenant_id, idempotency_key)`                                                                    | Mapeado (CTG-0008 §0), sob verificações de comportamento                                        |
| UPS-OBX-02 | `OutboxService.dispatchEventsDue`, `.ackEvent`, `.recordUnboundAck`, `.cutoverLegacyMessages`; ledger `outbox.event_attempts`                                                                                                                  | Mapeado **em parte**: corte só de `outbox.messages`/`outbox.acknowledgements`                   |
| UPS-OFS-01 | `OfflineSyncService.reserveNumbering`, `.cancel/.block/.close/.reconcile/.settleNumberingReservation`, `.getNumberingConsumption`; `OfflineSyncPolicyResolver`, `OfflineSyncAgentResolver`                                                    | Divergente: reserva sem chave de idempotência                                                   |
| UPS-OFS-02 | `OfflineSyncService.submitSyncBatch`, `.getSyncBatchReceipt`, `.getSyncItemReceipt`; `OfflineSyncDurableStore`, `CTG9SubmitSyncBatchInput`                                                                                                    | Divergente: campos não armazenados, `payload_hash` restrito, sem listagens                      |
| UPS-OFS-03 | `OfflineSyncItemApplier`, `OfflineSyncEventPort`, `OfflineSyncDurableStore.submitDurableSyncBatch`                                                                                                                                             | Divergente: contexto do _applier_ sem `receiptId`/suspeita; fila sem `pending`                  |
| UPS-OFS-04 | `OfflineSyncConcurrencyDetector`, `OfflineSyncHandoffPort`, `OfflineSyncConflictResolver`, `OfflineSyncService.resolveConflict`                                                                                                                | Divergente: `CHECK` impede `manual_review` com conflito aberto; `retry_after_correction`→`pending` |

## O que falta — issues novas

- [ ] #316 — outbox: UPS-OBX-03 (corte de tabela customizada), UPS-OBX-04 (leitura de
  estado de entrega, ledger, lista e saúde), UPS-OBX-05 (_retry_ de operador em modo evento),
  UPS-OBX-06 (despacho/ACK sem owner no caminho de requisição), UPS-OBX-07 (roteamento por destino e
  eventos sem destino), UPS-OBX-08 (migração de outbox separável, papel e tabela de tenant do
  consumidor), UPS-OBX-09 (comportamento fixado em contrato e teste).
- [ ] #317 — offline-sync: UPS-OFS-05 (reserva idempotente), UPS-OFS-06 (estado `pending`),
  UPS-OFS-07 (`manual_review` com conflito aberto), UPS-OFS-08 (campos dos envelopes persistidos),
  UPS-OFS-09 (contexto do _applier_), UPS-OFS-10 (`payload_hash` compatível), UPS-OFS-11
  (listagens), UPS-OFS-12 (faixa de numeração compatível e administrável), UPS-OFS-13 (migração
  separável, papel e tabela de tenant do consumidor), UPS-OFS-14 (comportamento fixado em contrato e
  teste).
- [ ] #318 — assinatura: UPS-SIG-05 (LTA / PAdES-B-LTA no verificador `stynx-cms`),
  UPS-SIG-06 (nível `QUALIFIED` declarativo e contratado), UPS-SIG-07 (vários perfis por tenant/UF e
  espécie num módulo montado uma vez: prontidão, _health_, âncoras e artefato de desafio).

**Por que IDs novos, e não subitens:** #305, #306 e #307 foram fechadas com evidência publicada por ID e,
no caso de UPS-OBX-02, com decisão do Owner sobre o contexto owner. Subitens (`UPS-OBX-02a`…)
misturariam o que foi entregue com o que falta e tornariam ambíguo o estado de IDs já fechados. Os
IDs novos continuam a numeração existente (OBX a partir de 03, OFS e SIG a partir de 05) e cada um
declara seu ID pai em "Origem".

## Efeito no DETRAN enquanto a 1.5.x não sai

| CTG DETRAN (R-0022)                  | Estado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CTG-0008 — migração integral da outbox | Prossegue com **duas exceções nominais e transitórias do Owner** à regra A1 item 4, válidas **só até a 1.5.x**: (1) OD-R22-16 — transferência DETRAN idempotente de `integration.outbox`/`delivery_attempt` para o armazenamento publicado (ids, `created_at`, pendências; trilha legada congelada); (2) OD-R22-17/20 — leitura DETRAN **somente leitura** (sob RLS, `security_invoker`) das tabelas publicadas para estado de entrega, ledger, lista e saúde da fila. O Owner aceitou **perder temporariamente o _retry_ manual da fila RENACH** depois do corte, até a 1.5.x. O despacho publicado em contexto owner leva o despacho DETRAN a checkpoint pela OD-R22-18, a confirmar pela verificação V-03. |
| CTG-0006 — migração integral da assinatura | Sem MUST ausente por símbolo (CTG-0006 §0); conformidade de comportamento provada só por M-06-P depois da troca. Com o verificador `stynx-cms` (OD-R22-06) e o módulo montado uma vez (OD-R22-13), nenhum perfil com LTA fica pronto (prontidão clínica exige LTA), o que é divergência de UPS-SIG-02 e leva a checkpoint OD-R22-02 do CTG-0006 nesse ponto. TASK-0009 aguarda ainda OD-R22-07 e OD-R22-08 (valores normativos dos perfis, pendentes). |
| CTG-0009 — migração integral do offline-sync | **Checkpoint OD-R22-02** (OD-R22-22/24/25/26/27/30 = checkpoint). A caracterização (TASK-0017) está entregue; a migração (TASK-0018) não é despachada até a 1.5.x fechar as lacunas de #317.                                                                                                                                                                                                                                                                                |

As exceções de CTG-0008 são código DETRAN que **sai** quando a 1.5.x publicar os itens UPS-OBX-03,
-04 e -05; não são alternativa permanente e não se estendem a outros itens.

## Outro conteúdo esperado na 1.5.x

O comentário de fechamento de #289 registra que UPS-SES-01/02 (#294) só ficaram completos com o PR
STYNX #310 (merge `018d496f`, pós-1.5.0) e "entram na próxima release". O DETRAN fixará a 1.5.x que
contiver também esse PR.

## Rastreabilidade

Fontes DETRAN (repositório `aarusso-nyx/detran`, branch `orchestra/stynx-sse-tenancy`; SHA-256 dos
arquivos lidos em 2026-09-29):

| Arquivo                                                        | SHA-256                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `work/rounds/R-0022/contracts/CTG-0008.md`                     | `37a0bbb393dd89be28b083e694a11e88bb669b137d909f7fe42a8e403268c449` |
| `work/rounds/R-0022/contracts/CTG-0009.md`                     | `a57c2cb9c1381df609912f886768269457faac5ec30d1174495d80c5fc25deb2` |
| `work/rounds/R-0022/contracts/CTG-0006.md`                     | `b0df64f68f895faeea0a2a5927e0378972900c7ad16dfebdc05430242accc8c6` |
| `work/rounds/R-0022/AUTHORIZATION.md`                          | `69376662c5182e3e635b73d8b68aaabbbaa5930e35b9a21937dc1aa482709505` |
| `docs/meta/knowledge-base/open-decisions-rait.md`              | `1f86817b76f04f30ac45ca49a4b25ddbc2e59d08b2f6cd88b7c233c163c1aef4` |
| `work/campaigns/C-0002-stynx-upstream-spec.md` (§8.1, A1)      | `291f18da6d2cc9d381c855d45bca3d61da59bbb424b93523bdde195b0137383d` |

Fonte STYNX (só leitura): `work/rounds/R-0002/conformance-1.5.0.md`. Registro de issues não declara
execução, aprovação de release ou início de rodada STYNX.

Índice anterior: https://github.com/stynx-nyx/stynx/issues/289

