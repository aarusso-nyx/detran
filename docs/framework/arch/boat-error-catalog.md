---
id: ARCH-BOAT-ERRORS
title: Catálogo de erros do BOAT — registro de sinistro, dado de vítima, sincronização e RENAEST
status: draft
apps: [boat, teat, portal]
updated: 2026-09-13
---

# Catálogo de erros do BOAT

Mesmo envelope e famílias de `rait-error-catalog.md` §1–§2, prefixo `BOAT.`. Como no TEAT, os
erros do item de sincronização chegam no recibo (`receipts[].error_code`) e nunca bloqueiam o
atendimento seguinte. Regra própria: nenhum erro expõe dado de vítima em `context`
([RN-BOAT-003]); `context` só carrega ids, tokens e contagens.

## 1. Registro e ciclo de vida

| Código                                    | Status | Quando                                                                          | `context`                                          | Base                         |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------- |
| `BOAT.CRASH_STATE_INVALID`                | 409    | comando fora do estado ([WF-BOAT-001])                                          | `recordId`, `currentState`, `allowed[]`, `command` | [WF-BOAT-001]                |
| `BOAT.CRASH_TYPE_NOT_IN_CATALOG`          | 422    | `crash_type` fora do catálogo do órgão                                          | `allowed[]`                                        | [RN-BOAT-109]                |
| `BOAT.CRASH_TERM_ACIDENTE_FORBIDDEN`      | 400    | campo livre contendo "acidente" em rótulo/termo oficial (lint de conteúdo)      | `field`                                            | [RN-BOAT-110]                |
| `BOAT.OCCURRED_AFTER_RECORDED`            | 422    | `occurred_at` posterior a `recorded_at`                                         | `occurredAt`, `recordedAt`                         | AC-BOAT-001-3                |
| `BOAT.CONDITIONS_INCOMPLETE`              | 422    | menos de quatro condições                                                       | `missing[]`                                        | AC-BOAT-001-4                |
| `BOAT.LOCATION_REQUIRED`                  | 422    | sem GPS nem localização manual                                                  | —                                                  | [UC-BOAT-001]                |
| `BOAT.MINIMUM_DATA_MISSING`               | 422    | registrar/fechar sem ≥ 1 veículo ou pessoa                                      | `missing[]`                                        | [RN-BOAT-004]                |
| `BOAT.SEVERITY_INVALID`                   | 400    | gravidade fora do enum federal                                                  | `allowed[]`                                        | [RN-BOAT-111]                |
| `BOAT.SEVERITY_REQUIRES_VICTIMS`          | 422    | gravidade com vítima sem nenhuma vítima ao fechar/transmitir                    | `severity`                                         | [RN-BOAT-002]                |
| `BOAT.VICTIMS_WITHOUT_SEVERITY`           | 422    | vítima registrada com gravidade `SEM_VITIMA`                                    | —                                                  | [RN-BOAT-001]                |
| `BOAT.VICTIM_PERSON_REQUIRED`             | 422    | vítima sem `crash_person_id`                                                    | —                                                  | invariante da origem         |
| `BOAT.VICTIM_SEVERITY_REQUIRED`           | 422    | vítima sem `severity`                                                           | —                                                  | [RN-BOAT-001]                |
| `BOAT.VICTIM_DEATH_INCONSISTENT`          | 422    | `death_at` sem `death_at_scene`/atendimento coerente                            | —                                                  | [UC-BOAT-003]                |
| `BOAT.VICTIM_NOTES_TOO_LONG`              | 400    | `health_notes` acima do mínimo permitido                                        | `maxChars`                                         | [RN-BOAT-124]                |
| `BOAT.PERSON_ROLE_INVALID`                | 400    | papel fora de condutor/passageiro/pedestre/ciclista                             | `allowed[]`                                        | [UC-BOAT-002] AC-3           |
| `BOAT.VEHICLE_LINK_INVALID`               | 422    | pessoa vinculada a veículo inexistente no registro                              | `crashVehicleId`                                   | [UC-BOAT-002]                |
| `BOAT.EVADED_FIELD_FORBIDDEN`             | 400    | payload com `evaded`                                                            | —                                                  | [RN-BOAT-117], AC-BOAT-002-2 |
| `BOAT.DUTY_REGIME_MISMATCH`               | 422    | conduta de regime incompatível com a gravidade (176 sem vítima; 178 com vítima) | `regime`, `severity`                               | [RN-BOAT-114]…[116]          |
| `BOAT.DUTY_CODE_INVALID`                  | 400    | `duty_code` fora de 176_I…V, 177, 178                                           | `allowed[]`                                        | [UC-BOAT-007]                |
| `BOAT.DUTY_177_REQUIRES_DISTINCT_SUBJECT` | 422    | art. 177 registrado sem sujeito distinto do condutor                            | —                                                  | [RN-BOAT-115]                |
| `BOAT.SKETCH_TYPE_INVALID`                | 400    | tipo fora de desenho/anexo/mapa, ou anexo sem `evidence_id`                     | —                                                  | [UC-BOAT-004] AC-1           |
| `BOAT.DAMAGE_ASSET_KIND_INVALID`          | 400    | natureza do bem fora do catálogo                                                | `allowed[]`                                        | [UC-BOAT-012]                |
| `BOAT.WITNESS_IS_INVOLVED`                | 422    | testemunha que é pessoa envolvida                                               | `crashPersonId`                                    | [UC-BOAT-012] AC-2           |
| `BOAT.LINK_TARGET_NOT_FOUND`              | 404    | AIT/medida inexistente ou de outro tenant                                       | `kind`                                             | DT-111                       |
| `BOAT.CLOSE_REQUIRES_REVIEW`              | 422    | fechar sem revisão explícita                                                    | —                                                  | [UC-BOAT-005]                |
| `BOAT.CANCEL_ONLY_DRAFT`                  | 409    | cancelar fora de `RASCUNHO`                                                     | `currentState`                                     | [WF-BOAT-001]                |

## 2. Dado de vítima, acesso e titular

| Código                              | Status | Quando                                                                                      | `context`            | Base                         |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------- | -------------------- | ---------------------------- |
| `BOAT.VICTIM_PURPOSE_REQUIRED`      | 400    | leitura de vítima sem finalidade declarada                                                  | —                    | [RN-BOAT-003], [RN-BOAT-126] |
| `BOAT.VICTIM_ACCESS_FORBIDDEN`      | 403    | papel sem acesso a dado de saúde                                                            | `roles`              | [RN-BOAT-003]                |
| `BOAT.RETENTION_UNDEFINED`          | 422    | operação que exige prazo de retenção definido (publicar, exportar) enquanto DT-049 pendente | `parameterKey`       | [RN-BOAT-125]                |
| `BOAT.SUBJECT_REQUEST_KIND_INVALID` | 400    | pedido fora de acesso/correção/eliminação                                                   | `allowed[]`          | [RN-BOAT-126]                |
| `BOAT.SUBJECT_ERASURE_BLOCKED`      | 422    | eliminação sem prazo de retenção decidido                                                   | —                    | DT-049                       |
| `BOAT.SUBJECT_NOT_INVOLVED`         | 404    | titular sem vínculo com o registro (disfarce)                                               | —                    | [RN-BOAT-126]                |
| `BOAT.THIRD_PARTY_DATA_MASKED`      | —      | aviso: campos de terceiro suprimidos                                                        | `suppressedFields[]` | [RN-PORTAL-118]              |

## 3. Sincronização (recibo do item `crash-record`)

| Código                            | Onde                     | Quando                                                            | Recuperação                    |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------- | ------------------------------ |
| `BOAT.SYNC_INVALID_CRASH_RECORD`  | item `rejected`          | payload canônico inválido                                         | corrigir localmente e reenviar |
| `BOAT.SYNC_VICTIMS_INCONSISTENT`  | item `rejected`          | gravidade × vítimas incoerentes no lote                           | corrigir localmente            |
| `BOAT.SYNC_EVIDENCE_PENDING`      | item `applied` com aviso | evidências ainda não concluídas                                   | fila conclui uploads           |
| `BOAT.SYNC_LINK_UNRESOLVED`       | item `applied` com aviso | AIT/medida vinculado ainda não aplicado (independência recíproca) | vínculo resolvido depois       |
| `BOAT.SYNC_DUPLICATE_NATURAL_KEY` | item `conflict`          | outro registro com a mesma chave natural                          | supervisor concilia            |

## 4. RENAEST e retificação

| Código                             | Status | Quando                                                                                        | `context`                  | Base                         |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------- |
| `BOAT.TRANSMIT_NOT_CLOSED`         | 409    | transmitir antes de `FECHADO`                                                                 | `currentState`             | [WF-BOAT-001]                |
| `BOAT.TRANSMIT_INCOMPLETE_DATA`    | 422    | `local` ausente ou vítimas faltando (gate local que antecipa `RENAEST.CRASH.INCOMPLETE_DATA`) | `missing[]`                | [RN-BOAT-002], AC-BOAT-005-2 |
| `BOAT.TRANSMIT_LAYOUT_UNSUPPORTED` | 422    | `layout_version` não suportada (espelha `INVALID_LAYOUT`)                                     | `supported[]`              | mock RENAEST                 |
| `BOAT.TRANSMIT_DUPLICATED`         | 409    | chave natural já enviada sem `Idempotency-Key` (espelha `RENAEST.CRASH.DUPLICATED`)           | `protocol`                 | AC-BOAT-005-3                |
| `BOAT.RENAEST_UNAVAILABLE`         | 503    | adapter sem resposta; item enfileirado                                                        | `outboxId`, `retryAfter`   | ADR-0003                     |
| `BOAT.RENAEST_REJECTED`            | 502    | União rejeitou                                                                                | `upstreamCode`, `protocol` | [UC-BOAT-011]                |
| `BOAT.RECTIFY_TERMINAL`            | 409    | complemento/correção sobre `CONSOLIDADO`/`REJEITADO` (espelha `CORRECTION_NOT_ALLOWED`)       | `nationalStatus`           | DT-020, [WF-BOAT-003]        |
| `BOAT.RECTIFY_REASON_REQUIRED`     | 422    | retificação sem motivo                                                                        | —                          | [UC-BOAT-009] AC-4           |
| `BOAT.VALIDATION_LEVEL_INVALID`    | 422    | nível municipal para município não integrado ao SNT                                           | `municipalityCode`         | [RN-BOAT-104], AC-BOAT-009-1 |
| `BOAT.ARCHIVE_NOT_TERMINAL`        | 409    | arquivar antes da situação nacional terminal                                                  | `nationalStatus`           | [WF-BOAT-001]                |
| `BOAT.PARTNER_INTAKE_DISABLED`     | 422    | submissão de parceiro com a onda desligada                                                    | —                          | steering F.31                |

## 5. Publicação e estatística

| Código                                  | Status | Quando                                              | Base                  |
| --------------------------------------- | ------ | --------------------------------------------------- | --------------------- |
| `BOAT.PUBLICATION_INDIVIDUAL_FORBIDDEN` | 403    | exportação/publicação de registro individual        | [RN-BOAT-130]         |
| `BOAT.PUBLICATION_CELL_BELOW_THRESHOLD` | 422    | célula agregada abaixo do limiar de reidentificação | [RN-DASH-161], DT-029 |

## 6. Genéricos

`BOAT.AUTH_REQUIRED` 401, `BOAT.FORBIDDEN_ACTION` 403, `BOAT.TENANT_MISMATCH` 404,
`BOAT.VALIDATION_FAILED` 400, `BOAT.ENUM_INVALID` 400, `BOAT.IF_MATCH_REQUIRED` 428,
`BOAT.VERSION_CONFLICT` 412, `BOAT.IDEMPOTENCY_REPLAY` 409, `BOAT.INTERNAL` 500.

## 7. Mapeamento para a interface

| Situação                         | Mobile                                            | Web / Portal                                         |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| gravidade × vítimas              | `crash-review` bloqueia finalizar e aponta a tela | W-03 complementar                                    |
| acesso a vítima sem finalidade   | diálogo de finalidade antes de abrir S-06         | `VictimPanel` pede finalidade                        |
| RENAEST indisponível / rejeitado | —                                                 | W-04 badge "pendente de retransmissão" / "rejeitado" |
| terminal nacional                | —                                                 | W-04 texto fixo "registro definitivo, sem correção"  |
| retenção indefinida              | S-06 não afirma permanência                       | W-05 eliminação desabilitada com motivo              |

Chaves i18n: `boat.errors.<code>` em `i18n/boat.pt-BR.json`.
