---
id: ARCH-PORTAL-ERRORS
title: Catálogo de erros do Portal — códigos estáveis, envelope, linguagem cidadã e caminho alternativo
status: draft
apps: [portal]
updated: 2026-09-13
---

# Catálogo de erros do Portal

Mesmo envelope e famílias de `rait-error-catalog.md` §1–§2, prefixo `PORTAL.`. Regras próprias:
(1) **toda mensagem é cidadã** e traz o próximo passo e o canal alternativo (`context.alternative`
com endereço/horário do presencial, `RN-PORTAL-105`); (2) **inelegibilidade e nível insuficiente
nunca são "acesso negado"** — o `context` explica o motivo e o caminho ([WF-PORTAL-001],
[UC-PORTAL-019]); (3) **inexistência disfarça falta de vínculo** (`404`), sem revelar que o
recurso existe; (4) **indisponibilidade de integração nunca altera prazo nem decisão** — o erro
diz o que o cidadão pode fazer enquanto isso.

## 1. Sessão, identidade e nível

| Código                                      | Status | Quando                                                      | `context`                                                            | UI                                               |
| ------------------------------------------- | ------ | ----------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| `PORTAL.AUTH_REQUIRED`                      | 401    | sem sessão gov.br                                           | `loginUrl`                                                           | entrada gov.br preservando a rota                |
| `PORTAL.IDENTITY_NOT_CITIZEN`               | 403    | identidade sem papel `CIDADAO`                              | —                                                                    | "esta conta não acessa o Portal"                 |
| `PORTAL.ASSURANCE_NOT_VERIFIED`             | 403    | claim de nível ausente/inválida (fail-closed)               | —                                                                    | reautenticar                                     |
| `PORTAL.ASSURANCE_INSUFFICIENT`             | 403    | nível da conta < nível do ato                               | `actKey`, `required`, `current`, `elevationMethods[]`, `resumeRoute` | T-27 com explicação e retomada ([UC-PORTAL-019]) |
| `PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED` | 500    | política exigindo qualificada (violação de `RN-PORTAL-101`) | `actKey`                                                             | suporte                                          |
| `PORTAL.REPRESENTATION_REFUSED`             | 422    | instrumento não comprova representação                      | `reason`                                                             | reenvio sem reinício ([WF-PORTAL-002])           |
| `PORTAL.REPRESENTATION_EXPIRED`             | 422    | representação vencida                                       | `validUntil`                                                         | nova procuração                                  |
| `PORTAL.TENANT_UNRESOLVED`                  | 421    | `Host` não mapeado                                          | —                                                                    | página neutra                                    |
| `PORTAL.SESSION_TENANT_MISMATCH`            | 403    | tenant da sessão ≠ tenant do host                           | —                                                                    | reautenticar                                     |

## 2. Vínculo e elegibilidade

| Código                               | Status | Quando                                            | `context`                                     | UI                                      |
| ------------------------------------ | ------ | ------------------------------------------------- | --------------------------------------------- | --------------------------------------- |
| `PORTAL.NOT_FOUND`                   | 404    | recurso inexistente **ou** sem vínculo (disfarce) | `kind`                                        | "por que não vejo isto" + ouvidoria     |
| `PORTAL.ENTITLEMENT_REQUIRED`        | 422    | pedido de ato sobre alvo sem vínculo comprovável  | `targetKind`, `howToProve`                    | idem, com caminho presencial            |
| `PORTAL.INELIGIBLE`                  | 422    | serviço não disponível para o perfil/alvo         | `reason`, `alternative`, `serviceKey`         | tela de inelegibilidade explicada       |
| `PORTAL.SERVICE_UNAVAILABLE`         | 422    | catálogo marca `unavailable`                      | `unavailableReason`, `alternativeChannelNote` | indisponibilidade com motivo; nunca 404 |
| `PORTAL.SERVICE_PARTIALLY_AVAILABLE` | —      | aviso, não erro                                   | `limitations[]`                               | banner                                  |

## 3. Pedidos (ciclo comum) e atos

| Código                                       | Status | Quando                                                                       | `context`                 | Base                                                               |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| `PORTAL.REQUEST_STATE_INVALID`               | 409    | comando fora do estado do pedido                                             | `state`, `allowed[]`      | [WF-PORTAL-001]                                                    |
| `PORTAL.REQUEST_DRAFT_EXISTS`                | 409    | segundo rascunho do mesmo ato/alvo                                           | `requestId`               | um por AIT ([UC-PORTAL-001] 1a)                                    |
| `PORTAL.REQUEST_ONE_PER_AIT`                 | 422    | segundo requerimento para o mesmo AIT na mesma instância                     | `existingProtocol`        | Res. 900 art. 3º p.ú.                                              |
| `PORTAL.REQUEST_SIGNATURE_REQUIRED`          | 422    | `submit` sem assinatura do nível exigido                                     | `required`                | [RN-PORTAL-104]                                                    |
| `PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED`    | 422    | ato com consequência sem confirmação (desistência, renúncia, indicação, SNE) | `textVersion`             | [UC-PORTAL-006] AC-1                                               |
| `PORTAL.REQUEST_OUT_OF_DEADLINE`             | —      | aviso: fora do prazo (protocola e informa efeito)                            | `dueOn`, `effect`         | [UC-PORTAL-002] 1a                                                 |
| `PORTAL.APPEAL_CETRAN_WINDOW_CLOSED`         | 422    | recurso ao CETRAN após `T-R2`                                                | `dueOn`                   | [UC-PORTAL-003] 1a                                                 |
| `PORTAL.ATTACHMENT_INVALID`                  | 400    | tipo/tamanho/hash                                                            | `allowed[]`, `maxBytes`   | [UC-PORTAL-001] 3a                                                 |
| `PORTAL.ATTACHMENT_AGENCY_DOCUMENT`          | 422    | anexo classificado como documento do órgão (NA/AIT/NP)                       | `kind`                    | [RN-PORTAL-106]                                                    |
| `PORTAL.WITHDRAWAL_AFTER_JUDGMENT`           | 409    | desistência após julgamento/pauta do dia                                     | `state`                   | [UC-PORTAL-006] 1a                                                 |
| `PORTAL.DILIGENCE_NOT_OPEN`                  | 409    | resposta a diligência respondida/expirada                                    | `outcome`                 | [UC-PORTAL-009] 4a                                                 |
| `PORTAL.DILIGENCE_ASKS_AGENCY_DOCUMENT`      | 500    | diligência pedindo documento do órgão (falha interna, reportada)             | `inquiryId`               | [UC-PORTAL-009] 1a                                                 |
| `PORTAL.INDICATION_DRIVER_INVALID`           | 422    | CPF/CNH inválidos ou condutor inelegível                                     | `fields[]`                | [UC-PORTAL-004]                                                    |
| `PORTAL.INDICATION_SECOND_SIGNATURE_PENDING` | —      | rascunho aguardando assinatura do condutor                                   | `pendingSigner`           | [UC-PORTAL-004] 5a                                                 |
| `PORTAL.INDICATION_WINDOW_CLOSED`            | 422    | `T-IND` vencido                                                              | `dueOn`                   | CTB art. 257 §7º                                                   |
| `PORTAL.DELEGATION_FAILED`                   | 502    | domínio dono recusou a delegação após o protocolo                            | `protocol`, `retryPolicy` | protocolo mantido; pedido fica `PROTOCOLADO` com pendência interna |
| `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY` | 409    | mesma chave, corpo diferente                                                 | `key`                     | protocolo                                                          |
| `PORTAL.EVALUATION_NOT_OFFERED`              | 409    | avaliar antes do resultado                                                   | `state`                   | [UC-PORTAL-017]                                                    |

## 4. Pagamento e SNE

| Código                                                    | Status | Quando                                                    | `context`                   | Base                                     |
| --------------------------------------------------------- | ------ | --------------------------------------------------------- | --------------------------- | ---------------------------------------- |
| `PORTAL.PAYMENT_TIER_NOT_AVAILABLE`                       | 422    | faixa fora da fase da infração (ex.: 80% após vencimento) | `tier`, `availableTiers[]`  | [RN-PORTAL-128], CTB art. 284            |
| `PORTAL.PAYMENT_SNE_TIER_REQUIRES_ENROLLMENT`             | 422    | 60% sem adesão ao SNE                                     | `enrollmentRoute`           | [RN-RAIT-127]                            |
| `PORTAL.PAYMENT_WAIVER_ACK_REQUIRED`                      | 422    | faixa de 40% sem declaração de reconhecimento             | `textVersion`               | [RN-PORTAL-128], DT-026                  |
| `PORTAL.PAYMENT_WAIVER_DISABLED`                          | 422    | faixa de 40% desligada (OD-003)                           | —                           | —                                        |
| `PORTAL.PAYMENT_METHOD_UNAVAILABLE`                       | 422    | cartão/parcelamento sem autorização do órgão (DT-031)     | `available[]`               | [RN-PORTAL-126]                          |
| `PORTAL.PAYMENT_ALREADY_PAID`                             | 409    | documento já quitado                                      | `paidOn`, `tier`            | —                                        |
| `PORTAL.PAYMENT_PROVIDER_UNAVAILABLE`                     | 503    | módulo de arrecadação/banco indisponível                  | `retryAfter`, `alternative` | prazo não muda                           |
| `PORTAL.SNE_CONTACT_REQUIRED`                             | 422    | adesão sem e-mail/celular                                 | `missing[]`                 | [UC-PORTAL-007] 1a                       |
| `PORTAL.SNE_ALREADY_ENROLLED` · `PORTAL.SNE_NOT_ENROLLED` | 409    | estado incompatível                                       | —                           | [WF-PORTAL-003]                          |
| `PORTAL.SNE_UPSTREAM_UNAVAILABLE`                         | 503    | SNE nacional indisponível                                 | `retryAfter`                | pedido fica pendente; nada de prazo muda |

## 5. Documentos, veículos, sinistros e exames

| Código                                                      | Status  | Quando                                                          | `context`                 | Base                          |
| ----------------------------------------------------------- | ------- | --------------------------------------------------------------- | ------------------------- | ----------------------------- |
| `PORTAL.CNH_NOT_FOUND` · `PORTAL.CNH_NOT_VALID_FOR_DIGITAL` | 404/422 | sem CNH ou CNH em situação que impede o documento digital       | `status`                  | [UC-PORTAL-011] 2a            |
| `PORTAL.CNH_CLEARANCE_PENDING`                              | 422     | pendência de quitação (art. 159 §8º) com link de pagamento      | `paymentRoute`            | [UC-PORTAL-011] 2b            |
| `PORTAL.CRLV_BLOCKED_BY_DEBT`                               | 422     | débito exigível impede emissão                                  | `items[]`, `paymentRoute` | [RN-PORTAL-116]               |
| `PORTAL.CRLV_BLOCKED_BY_RESTRICTION`                        | 422     | restrição administrativa/judicial                               | `restrictions[]`          | [UC-PORTAL-012] 2a            |
| `PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING`         | —       | aviso: multa sob recurso não bloqueia (DT-027)                  | `aitIds[]`                | [UC-PORTAL-012] AC-2          |
| `PORTAL.NATIONAL_READ_UNAVAILABLE`                          | 503     | RENACH/RENAVAM/CDT indisponível; dado em cache exibido com data | `cachedAt`, `retryAfter`  | [RN-PORTAL-117]               |
| `PORTAL.CRASH_NOT_FINAL`                                    | 422     | BAT em `RASCUNHO`/`EM_ATENDIMENTO`                              | `state (traduzido)`       | [UC-PORTAL-013] 2a            |
| `PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED`                  | —       | campos de terceiro suprimidos (aviso)                           | `suppressedFields[]`      | [RN-PORTAL-118], LGPD art. 13 |
| `PORTAL.EXAM_PROCESSING`                                    | —       | resultado psicológico ainda em processamento (até 2 dias úteis) | `expectedBy`              | [UC-PORTAL-014] AC-3          |
| `PORTAL.BOARD_REQUEST_WINDOW_CLOSED`                        | 422     | junta após 30 dias do conhecimento                              | `dueOn`                   | Res. 927/2022 art. 12         |

## 6. Atendimento, avaliação e LGPD

| Código                                    | Status | Quando                                                       | `context`               | Base                 |
| ----------------------------------------- | ------ | ------------------------------------------------------------ | ----------------------- | -------------------- |
| `PORTAL.MANIFESTATION_KIND_INVALID`       | 400    | tipo fora da taxonomia                                       | `allowed[]`             | Lei 13.460 art. 2º V |
| `PORTAL.MANIFESTATION_STATE_INVALID`      | 409    | ciência fora de `CIENCIA_AO_USUARIO`                         | `state`                 | [WF-PORTAL-004]      |
| `PORTAL.MANIFESTATION_NEVER_REFUSED`      | 500    | qualquer recusa no recebimento (violação de `RN-PORTAL-109`) | —                       | invariante           |
| `PORTAL.EVALUATION_ALREADY_SUBMITTED`     | 409    | segunda avaliação                                            | —                       | [UC-PORTAL-017]      |
| `PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE` | 403    | declaração completa/dado sensível com nível simples          | `required`              | [UC-PORTAL-018]      |
| `PORTAL.PRIVACY_NO_DATA`                  | —      | "nenhum dado" é resposta válida (aviso)                      | —                       | [UC-PORTAL-018] 2a   |
| `PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED`   | 422    | campo não corrigível (dado de origem nacional)               | `field`, `howToCorrect` | [RN-PORTAL-121]      |

## 7. Genéricos

`PORTAL.VALIDATION_FAILED` 400 (`fields[]`), `PORTAL.ENUM_INVALID` 400, `PORTAL.IF_MATCH_REQUIRED`
428, `PORTAL.VERSION_CONFLICT` 412, `PORTAL.RATE_LIMITED` 429, `PORTAL.INTERNAL` 500 (com
`requestId`).

## 8. Mapeamento para a interface

| Situação                             | Tratamento                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `ASSURANCE_INSUFFICIENT`             | T-27 com "qual nível falta e como obter", botão único, retomada do ato                     |
| `NOT_FOUND` / `ENTITLEMENT_REQUIRED` | tela "por que não vejo isto": como comprovar vínculo, ouvidoria, presencial                |
| `INELIGIBLE` / `SERVICE_UNAVAILABLE` | motivo + alternativa; nunca 404 nem "acesso negado"                                        |
| `REQUEST_OUT_OF_DEADLINE` (aviso)    | protocola e explica o efeito (sem efeito suspensivo, por exemplo)                          |
| `*_UNAVAILABLE` (503)                | banner "estamos sem acesso ao sistema nacional; seus prazos não mudam" + canal alternativo |
| `DELEGATION_FAILED` (502)            | recibo mantido; "seu pedido foi protocolado e está sendo encaminhado"                      |
| 400 com `fields[]`                   | inline, foco no primeiro campo, `aria-describedby`                                         |

Chaves i18n: `portal.errors.<code minúsculo sem prefixo>` em `i18n/portal.pt-BR.json`.
