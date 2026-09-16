---
id: ARCH-TEAT-ERRORS
title: Catálogo de erros do TEAT — códigos estáveis, envelope, sincronização offline e tratamento nos frontends
status: draft
apps: [teat]
updated: 2026-09-13
---

# Catálogo de erros do TEAT

Mesmo envelope, famílias e regras do catálogo do RAIT (`rait-error-catalog.md` §1–§2), com prefixo
`TEAT.`. Diferença essencial: no mobile, a maior parte dos erros chega **assíncrona**, no recibo
do item da fila (`receipts[].error_code`), e nunca bloqueia a lavratura seguinte; a UI mostra o
código no `QueueItemCard` e oferece a ação de recuperação (corrigir e reenviar, escalar ao
supervisor, aguardar). Os códigos do protocolo de sincronização preservam os nomes do repositório
de origem para manter compatibilidade com o cliente móvel já validado.

## 1. Protocolo de sincronização e numeração (síncronos no `POST sync-batches` ou por item)

| Código                                                                                                                                                                              | Status/onde     | Quando                                                                | `context`                                      | Recuperação na UI                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `TEAT.SYNC_BATCH_SEQUENCE_REPLAYED`                                                                                                                                                 | 409             | `batch_sequence` repetido sob novo `device_batch_id`                  | `expectedSequence`, `received`                 | descarta lote, reenvia com a sequência esperada |
| `TEAT.SYNC_BATCH_SEQUENCE_GAP`                                                                                                                                                      | 422             | sequência além de `last accepted + 1`                                 | `expectedSequence`, `received`                 | reenvia lotes anteriores primeiro               |
| `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`                                                                                                                                           | 409             | mesmo `device_batch_id` com itens ou sequência diferentes             | `deviceBatchId`                                | incidente técnico; não reenviar; suporte        |
| `TEAT.SYNC_INTEGRITY_ERROR`                                                                                                                                                         | item `rejected` | mesma `idempotency_key` com hash canônico diferente                   | `idempotencyKey`, `storedHash`, `receivedHash` | conflito de integridade → `sync-conflict`       |
| `TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE`                                                                                                                                                 | item `rejected` | `entity_type` fora da lista                                           | `supported[]`                                  | atualizar app                                   |
| `TEAT.SYNC_INVALID_CANONICAL_AIT`                                                                                                                                                   | item `rejected` | payload do AIT não passa no schema canônico                           | `fields[]`                                     | corrigir localmente e reenviar                  |
| `TEAT.SYNC_INVALID_ADMINISTRATIVE_MEASURE_RECORD` · `TEAT.SYNC_INVALID_CRASH_RECORD` · `TEAT.SYNC_INVALID_ALCOHOL_SIGNS_TERM_RECORD` · `TEAT.SYNC_INVALID_AIT_CANCELLATION_REQUEST` | item `rejected` | idem por tipo                                                         | `fields[]`                                     | idem                                            |
| `TEAT.SYNC_DESTINATION_NOT_WIRED`                                                                                                                                                   | 500 por item    | tipo suportado sem destino montado (falha de implantação)             | `entityType`                                   | suporte; item permanece `received`              |
| `TEAT.SYNC_ITEM_CONFLICT`                                                                                                                                                           | item `conflict` | divergência local × servidor                                          | `conflictId`, `conflictType`                   | supervisor resolve em `sync-conflict`           |
| `TEAT.SYNC_CONCURRENCY_SUSPECT`                                                                                                                                                     | item `conflict` | mesmo agente, dispositivos distintos, mesmo intervalo ([RN-TEAT-111]) | `otherDeviceId`, `windowStart`, `windowEnd`    | bloqueado até apuração da autoridade (web)      |
| `TEAT.SYNC_RECEIPT_NOT_FOUND`                                                                                                                                                       | 404             | recibo por `idempotency_key` inexistente no tenant                    | —                                              | reenviar item                                   |
| `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`                                                                                                                                                 | item `received` | item sem `idempotency_key` (caminho legado) nunca é aplicado          | —                                              | atualizar app                                   |
| `TEAT.NUMBERING_RANGE_EXHAUSTED`                                                                                                                                                    | 422             | faixa `ESGOTADA`                                                      | `rangeId`, `series`                            | supervisor cria faixa                           |
| `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS`                                                                                                                                          | 409             | reserva ativa para o mesmo dispositivo/turno                          | `reservationId`                                | usa a existente                                 |
| `TEAT.NUMBERING_RESERVATION_EXPIRED`                                                                                                                                                | 422 / item      | número de reserva `EXPIRADA`/`CANCELADA` usado em AIT                 | `reservationId`, `number`                      | AIT vai a conflito; número nunca reatribuído    |
| `TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT`                                                                                                                                          | 422             | reserva de turno anterior usada                                       | `reservationId`, `shiftId`                     | pede nova reserva                               |
| `TEAT.NUMBERING_NUMBER_ALREADY_APPLIED`                                                                                                                                             | item `rejected` | número já consumido por AIT aplicado                                  | `number`, `aitId`                              | conflito; nunca renumerar                       |
| `TEAT.NUMBERING_RECONCILE_MISMATCH`                                                                                                                                                 | 422             | `claimed_numbers` fora do intervalo da reserva                        | `outOfRange[]`                                 | supervisor                                      |

## 2. Bootstrap, sessão, dispositivo e turno

| Código                                                                               | Status                                     | Quando                                                             | `context`                      | UI                                                  |
| ------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------ | --------------------------------------------------- |
| `TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH`                                               | 403                                        | tenant/principal/dispositivo não conferem                          | —                              | `device-blocked`                                    |
| `TEAT.SESSION_NOT_EXCLUSIVE`                                                         | 409                                        | sessão do agente ativa em outro dispositivo                        | `otherDeviceId`, `since`       | `device-handoff` (D-01) ou aguardar                 |
| `TEAT.DEVICE_NOT_AUTHORIZED` · `TEAT.DEVICE_BLOCKED` · `TEAT.DEVICE_TAMPER_DETECTED` | 403                                        | postura do dispositivo                                             | `deviceId`, `status`           | `device-blocked`                                    |
| `TEAT.DEVICE_NOT_HOMOLOGATED` · `TEAT.APP_VERSION_NOT_ALLOWED`                       | 403                                        | homologação/versão fora de validade ([RN-TEAT-003], [RN-TEAT-117]) | `homologationId`, `appVersion` | `device-blocked` com orientação                     |
| `TEAT.PROTOCOL_VERSION_UNSUPPORTED`                                                  | 426                                        | `protocol_version` antiga                                          | `supported[]`                  | atualizar app                                       |
| `TEAT.AGENT_NOT_ACTIVE` · `TEAT.AGENT_NOT_IN_UNIT` · `TEAT.AGENT_CREDENTIAL_EXPIRED` | 403                                        | perfil funcional                                                   | `agentId`                      | bloqueio com orientação                             |
| `TEAT.SHIFT_ALREADY_OPEN`                                                            | 409                                        | turno aberto no mesmo ou em outro dispositivo                      | `shiftId`, `deviceId`          | retomar turno / handoff                             |
| `TEAT.SHIFT_NOT_OPEN`                                                                | 409                                        | ato legal sem turno                                                | —                              | `open-shift`                                        |
| `TEAT.SHIFT_CLOSE_PENDING_QUEUE`                                                     | 422                                        | fechar turno com itens `pending`                                   | `pendingCount`                 | sincronizar antes (ou fechar com pendência marcada) |
| `TEAT.NORMATIVE_PACKAGE_MISSING` · `…_HASH_MISMATCH`                                 | 422                                        | pacote ausente ou adulterado ([RN-TEAT-003])                       | `packageId`, `manifestHash`    | reinstalar pacote                                   |
| `TEAT.NORMATIVE_PACKAGE_EXPIRED`                                                     | aviso (`readiness.warnings[]`), nunca erro | pacote vencido em campo sem conectividade (steering E.29)          | `packageId`, `validUntil`      | banner persistente; o ato registra o pacote usado   |
| `TEAT.OFFLINE_GRANT_EXPIRED` · `…_REVOKED` · `…_LIMIT_REACHED`                       | 403                                        | provisionamento offline (WP-T5)                                    | `grantId`, `limit`             | reconciliar/renovar                                 |

## 3. AIT — ciclo de vida, conteúdo e correção

| Código                                                          | Status | Quando                                                                    | `context`                                       | Base                         |
| --------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| `TEAT.AIT_STATE_INVALID`                                        | 409    | comando incompatível com `current_status`                                 | `aitId`, `currentState`, `allowed[]`, `command` | [WF-TEAT-001]                |
| `TEAT.AIT_IMMUTABLE`                                            | 409    | tentativa de alterar conteúdo legal após finalização                      | `contentHash`                                   | [RN-TEAT-004]                |
| `TEAT.AIT_FINALIZE_VALIDATION_BLOCKED`                          | 422    | regra bloqueante do pacote falhou                                         | `rules[]{code, message}`                        | `ait-validations`            |
| `TEAT.AIT_FINALIZE_NUMBER_MISSING`                              | 422    | sem número reservado                                                      | —                                               | [RN-TEAT-113]                |
| `TEAT.AIT_MINIMUM_CONTENT`                                      | 422    | rol do art. 280 incompleto                                                | `missing[]`                                     | [RN-TEAT-101]                |
| `TEAT.AIT_FRAMING_INACTIVE` · `TEAT.AIT_FRAMING_NOT_IN_PACKAGE` | 422    | enquadramento inativo ou fora do pacote instalado                         | `framingId`, `packageId`                        | [WF-TEAT-003]                |
| `TEAT.AIT_NO_APPROACH_NOT_ALLOWED`                              | 422    | "sem abordagem" em enquadramento Caso 1                                   | `approachClass`                                 | [RN-TEAT-108]                |
| `TEAT.AIT_NO_APPROACH_JUSTIFICATION_REQUIRED`                   | 422    | Caso 3 sem justificativa                                                  | —                                               | [RN-TEAT-108]                |
| `TEAT.AIT_OBSERVATION_REQUIRED`                                 | 422    | `requires_observation` sem observação                                     | `framingId`                                     | [RN-TEAT-109]                |
| `TEAT.AIT_EQUIPMENT_REQUIRED`                                   | 422    | `requires_equipment` sem instrumento vinculado                            | `framingId`                                     | [RN-TEAT-138]                |
| `TEAT.AIT_PLATE_NOT_CONFIRMED`                                  | 422    | placa proposta não confirmada pelo agente                                 | —                                               | [RN-TEAT-115]                |
| `TEAT.AIT_MULTIPLE_FRAMINGS`                                    | 422    | mais de um enquadramento no mesmo auto                                    | `framings[]`                                    | [RN-TEAT-103]                |
| `TEAT.AIT_COMPETENCE_MISMATCH`                                  | 403    | agente/órgão sem competência na circunscrição                             | `circumscriptionId`                             | [RN-TEAT-104], AC-TEAT-001-4 |
| `TEAT.AIT_SIGNATURE_OUTCOME_INVALID`                            | 400    | assinatura com recusa e impossibilidade ao mesmo tempo, ou motivo ausente | `signatureType`                                 | [RN-TEAT-005]                |
| `TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED`                        | 422    | reimpressão fora do dia da lavratura                                      | `issuedOn`                                      | [RN-TEAT-116]                |
| `TEAT.AIT_CORRECTION_FIELD_FORBIDDEN`                           | 422    | saneamento de fato essencial                                              | `field`, `allowed[]`                            | [RN-TEAT-006], [RN-TEAT-119] |
| `TEAT.AIT_CORRECTION_JUSTIFICATION_REQUIRED`                    | 422    | correção sem justificativa                                                | —                                               | [UC-TEAT-006]                |
| `TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT`                         | 404    | `correctionId` de outro AIT                                               | —                                               | serviço atual                |
| `TEAT.AIT_REJECT_REASON_REQUIRED`                               | 422    | rejeição sem motivo/base legal                                            | —                                               | [WF-TEAT-001]                |
| `TEAT.AIT_CONCURRENCY_PENDING_REVIEW`                           | 409    | aceitar/rejeitar AIT em `SUSPEITO_CONCORRENCIA`                           | `conflictId`                                    | [RN-TEAT-111]                |
| `TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN`                           | 403    | decidir pedido pós-final sem ser a Diretoria (ou rascunho sem autoridade) | `addressedTo`, `roles`                          | [UC-TEAT-011] AC-2, OD-T01   |
| `TEAT.AIT_CANCEL_ALREADY_DECIDED`                               | 409    | segunda decisão                                                           | `decidedAt`                                     | [UC-TEAT-011]                |
| `TEAT.AIT_CANCEL_TARGET_NOT_FOUND`                              | 404    | `targetLocalActId` sem AIT no servidor (ainda) — pedido fica `requested`  | —                                               | [RN-TEAT-123]                |
| `TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE`                           | 409    | `receipt_protocol` repetido no tenant                                     | `receiptProtocol`                               | invariante do módulo         |

## 4. Medidas administrativas

| Código                                                              | Status | Quando                                                                    | Base                         |
| ------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- | ---------------------------- |
| `TEAT.MEASURE_STATE_INVALID`                                        | 409    | comando fora do estado (`WF-TEAT-004`)                                    | [WF-TEAT-004]                |
| `TEAT.MEASURE_TYPE_NOT_IN_CATALOG`                                  | 422    | medida fora do rol do art. 269                                            | [RN-TEAT-122]                |
| `TEAT.MEASURE_TERM_MINIMUM_CONTENT`                                 | 422    | termo sem os 11 elementos / 7 do caput / 4 do §1º                         | [RN-TEAT-126]                |
| `TEAT.MEASURE_TERM_DEADLINE_MISSING`                                | 422    | termo sem os dois prazos de retirada                                      | OD-T05                       |
| `TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED`                             | 422    | prazo de liberação com prazo > 30 dias (art. 270 §2º) ou > 15 (271 §9º-A) | [RN-TEAT-124], [RN-TEAT-125] |
| `TEAT.MEASURE_RELEASE_NOT_ALLOWED`                                  | 403    | liberação por papel não autorizado                                        | política                     |
| `TEAT.MEASURE_MONITORED_CUSTODY_DISABLED`                           | 422    | guarda monitorada com o parâmetro desligado                               | DT-015                       |
| `TEAT.MEASURE_AIT_LINK_BEFORE_FINALIZE`                             | 422    | vincular medida a AIT não finalizado                                      | [RN-TEAT-118]                |
| `TEAT.MEASURE_TOW_PROVIDER_INACTIVE` · `TEAT.MEASURE_YARD_INACTIVE` | 422    | prestador/pátio inativo                                                   | cadastro                     |

## 5. Alcoolemia

| Código                                       | Status | Quando                                                 | Base          |
| -------------------------------------------- | ------ | ------------------------------------------------------ | ------------- |
| `TEAT.ALCOHOL_STATE_INVALID`                 | 409    | comando fora do estado (`WF-TEAT-005`)                 | [WF-TEAT-005] |
| `TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED`     | 422    | etilômetro sem verificação metrológica vigente         | [RN-TEAT-135] |
| `TEAT.ALCOHOL_RESULT_PAIR_REQUIRED`          | 400    | resultado sem medido+considerado                       | [RN-TEAT-133] |
| `TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING`    | 422    | pacote sem tabela para o instrumento                   | [WF-TEAT-003] |
| `TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED`         | 400    | recusa sem distinguir recusa × impossibilidade técnica | [RN-TEAT-134] |
| `TEAT.ALCOHOL_SIGNS_SET_REQUIRED`            | 422    | sinais isolados (não conjunto)                         | [RN-TEAT-132] |
| `TEAT.ALCOHOL_TERM_MINIMUM_CONTENT`          | 422    | termo sem os nove elementos                            | [RN-TEAT-136] |
| `TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME` | 422    | resultado ≥ 0,34 sem encaminhamento                    | [RN-TEAT-137] |

## 6. Evidência, custódia e bodycam

| Código                                                        | Status  | Quando                                                      | Base                            |
| ------------------------------------------------------------- | ------- | ----------------------------------------------------------- | ------------------------------- |
| `TEAT.EVIDENCE_HASH_REQUIRED` · `TEAT.EVIDENCE_HASH_MISMATCH` | 400/422 | sem hash ou hash do objeto ≠ declarado                      | [RN-TEAT-002], INV-EVIDENCE-001 |
| `TEAT.EVIDENCE_INTENT_EXPIRED`                                | 410     | URL assinada expirada; renovar mantendo `storage_intent_id` | protocolo                       |
| `TEAT.EVIDENCE_ENTITY_NOT_APPLIED`                            | 409     | intenção antes do AIT `applied`                             | ordem estrita                   |
| `TEAT.EVIDENCE_TYPE_NOT_IN_CATALOG`                           | 422     | tipo fora do catálogo                                       | [RN-TEAT-122]                   |
| `TEAT.EVIDENCE_MANDATORY_MISSING`                             | 422     | evidência obrigatória do enquadramento ausente (ex.: placa) | [RN-TEAT-139]                   |
| `TEAT.EVIDENCE_BODYCAM_CONTENT_RESTRICTED`                    | 403     | leitura de conteúdo de bodycam sem requisição aprovada      | [RN-TEAT-142]                   |
| `TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL`                   | 422     | requerente fora do rol do art. 13                           | [RN-TEAT-142]                   |
| `TEAT.EVIDENCE_ACCESS_STATE_INVALID`                          | 409     | aprovar/entregar fora da ordem                              | fluxo                           |
| `TEAT.EVIDENCE_QUARANTINED`                                   | 409     | evidência em quarentena                                     | custódia                        |
| `TEAT.PROBATIVE_PACKAGE_INCOMPLETE`                           | 422     | pacote sem itens obrigatórios                               | [RN-TEAT-002]                   |

## 7. Catálogo normativo, pacote, homologação e numeração administrativa

| Código                                                      | Status | Quando                                                  | Base                  |
| ----------------------------------------------------------- | ------ | ------------------------------------------------------- | --------------------- |
| `TEAT.CATALOG_STATE_INVALID` · `TEAT.PACKAGE_STATE_INVALID` | 409    | publish/retire/validate fora do estado                  | [WF-TEAT-003]         |
| `TEAT.PACKAGE_CATALOG_NOT_ACTIVE`                           | 422    | pacote de catálogo não ativo                            | [WF-TEAT-003]         |
| `TEAT.PACKAGE_MANIFEST_MISMATCH`                            | 422    | validação com hash divergente                           | [RN-TEAT-003]         |
| `TEAT.HOMOLOGATION_STATE_INVALID`                           | 409    | renovar/cancelar fora do estado                         | [WF-TEAT-003]         |
| `TEAT.HOMOLOGATION_RENEWAL_DUE`                             | 422    | renovação quadrienal vencida — lavratura bloqueada      | [RN-TEAT-117], OD-T04 |
| `TEAT.HOMOLOGATION_FUNCTIONAL_CHANGE_REQUIRES_NEW`          | 422    | versão com `altera_funcionalidade` sem nova homologação | 997 Anexo VII         |
| `TEAT.NUMBERING_RANGE_OVERLAP`                              | 409    | faixa sobreposta na mesma série                         | [WF-TEAT-002]         |

## 8. Consultas e integrações

| Código                               | Status | Quando                                 | UI                                |
| ------------------------------------ | ------ | -------------------------------------- | --------------------------------- |
| `TEAT.QUERY_UPSTREAM_UNAVAILABLE`    | 503    | adapter sem resposta                   | `query-failure`; prossegue manual |
| `TEAT.QUERY_NOT_FOUND`               | 404    | placa/CPF inexistente na base nacional | `query-failure`; prossegue manual |
| `TEAT.QUERY_PURPOSE_REQUIRED`        | 400    | consulta sem finalidade                | —                                 |
| `TEAT.INTEGRATION_ITEM_NOT_FAILED`   | 409    | retry de item não falho                | `/tecnico/filas`                  |
| `TEAT.INTEGRATION_UPSTREAM_REJECTED` | 502    | sistema nacional rejeitou              | painel                            |

## 9. Genéricos (compartilhados com o RAIT)

`TEAT.AUTH_REQUIRED` 401, `TEAT.FORBIDDEN_ACTION` 403, `TEAT.TENANT_MISMATCH` 404,
`TEAT.VALIDATION_FAILED` 400, `TEAT.ENUM_INVALID` 400, `TEAT.IF_MATCH_REQUIRED` 428,
`TEAT.VERSION_CONFLICT` 412, `TEAT.IDEMPOTENCY_REPLAY` 409, `TEAT.INTERNAL` 500.

## 10. Mapeamento para a interface

| Situação                                          | Mobile                                                             | Web                               |
| ------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| erro de forma (400)                               | inline no campo; `ValidationPanel`                                 | inline                            |
| bloqueio de postura/sessão (403/409 do bootstrap) | `device-blocked` ou `device-handoff`, texto do bloqueador          | —                                 |
| erro por item de sincronização                    | `QueueItemCard` com código e ação; nunca bloqueia nova lavratura   | `ConflictQueue`                   |
| estado inválido (409)                             | recarrega o ato; mensagem "o estado mudou"                         | recarrega e reabre                |
| regra de negócio (422)                            | diálogo com regra e base legal (`LegalBasisTooltip`)               | idem                              |
| indisponibilidade nacional (503)                  | `query-failure`; fluxo segue com dado manual marcado como proposta | badge "pendente de retransmissão" |

Chaves i18n: `teat.errors.<code minúsculo sem prefixo>` em `i18n/teat.pt-BR.json` (WP-T4).
