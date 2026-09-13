---
id: ARCH-PORTAL-ROUTES
title: Contrato de rotas do Portal — /v1/portal/*, comandos delegados, projeções, payloads, política e auditoria
status: draft
apps: [portal]
updated: 2026-09-13
---

# Contrato de rotas do Portal

Todas as rotas que `apps/portal/web` consome, no domínio `portal` do backend unificado (ADR-0017),
lendo projeções (ADR-0018) e delegando comandos aos domínios donos (ADR-0014, 0015, RAIT). Nenhuma
rota do Portal escreve estado de infração, caso, pagamento ou dado nacional. Convenções de payload:
`rait-build-pack.md` §0. Referência de implementação: os 12 endpoints de `PortalApiService` do
repositório de origem (não publicados no contrato de lá) e as entidades de
`domain/appeals-administrative-appeals` (`appeal.*`, `portal.*`, `platform.*`), aqui reorganizadas.

## 1. Regras

1. Prefixo único `/v1/portal`; recursos em forma cidadã (`aits`, `requests`, `inbox`, `documents`,
   `services`), sem tokens internos nos payloads (`RN-PORTAL-112`).
2. **Autorização por vínculo**: toda leitura de AIT/processo/veículo/CNH/sinistro/exame passa por
   `portal.entitlement` (`owner|driver|representative|interested_party`); ausência de vínculo →
   `404 PORTAL.NOT_FOUND` (disfarce de inexistência), nunca 403 com detalhe.
3. **Nível de assinatura** vem da claim assinada `assurance_level` do principal (gov.br via
   Cognito); nunca do corpo; ausente → `PORTAL.ASSURANCE_NOT_VERIFIED`. Cada comando de ato
   declara o nível mínimo em `portal.act_level_policy` (dados).
4. **Idempotência**: comandos de criação usam `Idempotency-Key` determinística
   (`<ato>:<alvo>:<fingerprint do corpo>`), como no cliente de origem; reuso com corpo diferente →
   `409 PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY`.
5. **Tenant pelo Host** (`platform.public_hostname`); `X-Tenant-Id` do cliente só semeia a sessão.
6. Política: `portal:<recurso>:<ação>` com papel `CIDADAO`; leituras públicas com `@Public()`.
7. Auditoria: todo comando e toda leitura de dado pessoal (`documents`, `crashes`, `exams`, `me`)
   gera `@Audit` com finalidade (`RN-PORTAL-118`, `UC-PORTAL-013` AC-3).

## 2. Público (sem sessão)

| Rota                           | Resposta                                                                                                                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET brand`                    | `{ displayName, shortName, legalName, primaryColor, supportUrl, privacyUrl, accessibilityUrl, serviceContact, locale, timeZone }` (`platform.tenant_brand_profile`)                                        |
| `GET services`                 | Carta de Serviços: `[{ serviceKey, route, category, title, summary, requirements[], deliveryChannel, legalDeadline, cost, accessibilityNote, responsibleParty, normativeReference, availability: available | partially_available | unavailable, unavailableReason?, alternativeChannelNote, minimumAssurance, version, effectiveFrom }]`(11 campos de`RN-PORTAL-108`) |
| `GET services/{serviceKey}`    | idem, um serviço                                                                                                                                                                                           |
| `GET content/points-explainer` | conteúdo versionado de T-15                                                                                                                                                                                |
| `GET health`                   | kernel                                                                                                                                                                                                     |

## 3. Identidade e conta — `portal/identity`

| Rota                                                 | Ação (`portal:identity:*`) | Payload                                             | Resposta / efeito                                                                            |
| ---------------------------------------------------- | -------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET me`                                             | `read`                     | —                                                   | `{ subjectId, cpfMasked?: never (titular vê sem máscara: cpf), name, assuranceLevel: simples | avancada                                          | qualificada, govbrLevelObservedAt, actRequirements[]{ actKey, minimumAssurance, allowed, reason? }, representations[]{ id, representedName, scope, validUntil }, preferences{ channel }, heldDataSummary[] }` |
| `POST assurance/elevations`                          | `elevate`                  | `{ targetLevel: avancada, method: biographic        | biometric                                                                                    | icp, resumeRoute }`                               | `{ redirectUrl, resumeToken }` — redirect gov.br; nada armazenado além do token de retomada                                                                                                                   |
| `POST assurance/elevations/{id}/complete`            | `elevate`                  | `{ resumeToken }` (retorno do gov.br)               | nível atualizado a partir da claim; `NIVEL_ASSINATURA_ELEVADO`                               |
| `POST representations`                               | `represent`                | `{ representedCpf, instrumentDocumentId, scope: ait | all, validUntil? }`                                                                          | `PROCURACAO_APRESENTADA` → validação → `validated | refused{reason}`                                                                                                                                                                                              |
| `GET representations`, `DELETE representations/{id}` | `read` / `represent`       | —                                                   | —                                                                                            |
| `PUT preferences`                                    | `update`                   | `{ channel: push                                    | email                                                                                        | sne, pushSubscription? }` (`If-Match`)            | `@stynx-nyx/preferences`                                                                                                                                                                                      |

## 4. Autuações (projeção) — `portal/aits`

| Rota                           | Resposta                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `GET aits?vehicle&status&page` | `{ items[]{ aitId, aitNumber, plate, occurredAt, framingLabel, amount, situation: aguardando_defesa | em_defesa | penalidade_aplicada                                                                                                                                                                                                          | em_recurso | encerrada | cancelada | arquivada, deadlines[]{ kind, dueOn, ownedBy }, pointsStatus: em_disputa | definitivo | none, actions[]{ key: defend | indicate_driver | pay | appeal_jari | appeal_cetran, available, reason?, minimumAssurance } }, total, page, pageSize }`— de`portal.infraction_view` |
| `GET aits/{aitId}`             | detalhe: campos acima + `notices[]{ kind: NA                                                        | NP        | decisao, channel, dispatchedOn, effectiveOn, fictitious, printedDeadline }`, `payment{ tiers[]{ code, percent, amount, availableUntil, requiresSne, waivesAppeal }, paid, paidTier }`, `openRequestId?`, `evidenceAvailable` |
| `GET aits/{aitId}/points`      | pontos definitivos × em disputa (`RN-RAIT-131`)                                                     |
| `GET points-summary`           | T-14: total, por veículo, últimos 12 meses                                                          |

## 5. Pedidos (ciclo comum) — `portal/requests`

Máquina `WF-PORTAL-001`: `IDENTIFICADO → SERVICO_SELECIONADO → ELEGIBILIDADE_VERIFICADA |
INELEGIVEL → PEDIDO_EM_COMPOSICAO → AGUARDANDO_NIVEL_ASSINATURA → AGUARDANDO_PAGAMENTO? →
PROTOCOLADO → EM_ANDAMENTO_NO_ORGAO → RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA → CONCLUIDO`;
`DESISTIDO` antes do protocolo.

| Rota                                            | Ação (`portal:request:*`) | Payload                                                                                          | Efeito / delegação                                                                                                                                                                                                                                               |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST requests`                                 | `create`                  | `{ serviceKey, targetKind: ait                                                                   | case                                                                                                                                                                                                                                                             | vehicle                                                                                                                                                                                  | exam                                  | none, targetId?, channel: portal }` | verifica vínculo e catálogo; devolve `{ requestId, state: PEDIDO_EM_COMPOSICAO, prefilled{…}, requirements[], minimumAssurance }` ou `INELEGIVEL{ reason, alternative }` |
| `PUT requests/{id}/draft`                       | `compose`                 | corpo do ato (§5.1), `If-Match`                                                                  | rascunho no servidor                                                                                                                                                                                                                                             |
| `POST requests/{id}/attachments`                | `compose`                 | intenção `{ filename, mimeType, sizeBytes, sha256 }` → URL assinada; `…/{attachmentId}/complete` | anexo com hash                                                                                                                                                                                                                                                   |
| `POST requests/{id}/submit`                     | `submit`                  | `{ signature: { method: govbr                                                                    | upload, signatureRef }, consequenceAck?: { textVersion, acceptedAt } }` (`Idempotency-Key`)                                                                                                                                                                      | protocolo imediato (`portal.protocol`: número, data-hora, canal, hash do recibo) → `PROTOCOLADO` → delegação síncrona ao comando do domínio dono (tabela §5.2) → `EM_ANDAMENTO_NO_ORGAO` |
| `POST requests/{id}/withdraw`                   | `withdraw`                | `{ confirm: true, reason? }`                                                                     | `DESISTIDO` (antes do protocolo) ou delegação `inf:rait-case:withdraw` (caso RAIT em curso) → `ENCERRADO_DESISTENCIA`                                                                                                                                            |
| `GET requests?state&kind&period`                | `read`                    | —                                                                                                | T-06: `{ items[]{ requestId, protocol, serviceKey, targetLabel, situation, nextAction{ by: citizen                                                                                                                                                               | agency                                                                                                                                                                                   | none, label, dueOn? }, updatedAt } }` |
| `GET requests/{id}`                             | `read`                    | —                                                                                                | T-07: `{ request, timeline[] (visibility=citizen), deadlines[]{ ownedBy }, documents[], diligences[], decision?, actions{ canRespondDiligence, canWithdraw, withdrawalBlockedReason, canAppeal, nextInstanceServiceKey } }` — projeção `portal.process_timeline` |
| `GET requests/{id}/receipt`                     | `read`                    | —                                                                                                | recibo PDF assinado (ADR-0016)                                                                                                                                                                                                                                   |
| `GET requests/{id}/decision`                    | `read`                    | —                                                                                                | T-10: `{ outcome: deferido                                                                                                                                                                                                                                       | indeferido                                                                                                                                                                               | parcialmente_deferido                 | provido                             | negado                                                                                                                                                                   | nao_conhecido → rótulo, summary, publishedOn, documentUrl, nextStep{ kind, serviceKey?, dueOn? }, refundDue?, finalInstance }` |
| `POST requests/{id}/diligences/{did}/responses` | `respond`                 | `{ text, attachmentIds[] }` (`Idempotency-Key`)                                                  | delegação `inf:rait-case:answer-inquiry`; status muda na hora                                                                                                                                                                                                    |
| `POST requests/{id}/evaluation`                 | `evaluate`                | `{ satisfaction, quality, deadline, clarity, channel, comment? }`                                | `AVALIADA`; alimenta `citizen-service`                                                                                                                                                                                                                           |

### 5.1 Corpos por ato (`serviceKey`)

| `serviceKey`         | Corpo do rascunho                                                                                                   | Nível                      | Delegação (`submit`)                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------- |
| `defesa_previa`      | `{ facts, grounds, attachmentIds[], requestType: cancelamento                                                       | outro }`                   | avançada                                                         | `inf:rait-case:protocol` (`instance=defesa_previa`, `intake_channel=portal`, marco = data-hora do protocolo) |
| `recurso_jari`       | `{ grounds, attachmentIds[] }`                                                                                      | avançada                   | `inf:rait-case:protocol` (`instance=jari`)                       |
| `recurso_cetran`     | `{ additionalText?, attachmentIds[] }` (parecer e conclusão da JARI anexados de ofício pelo servidor)               | avançada                   | `inf:rait-case:protocol` (`instance=cetran`, origem = caso JARI) |
| `indicacao_condutor` | `{ driver{ cpf, cnhNumber, cnhUf, category, name }, signatures{ owner: govbr                                        | upload, driver: govbr      | upload                                                           | pending }, consequenceAck }`                                                                                 | avançada         | `inf:infraction:indicate-driver`          |
| `pagamento`          | `{ tier: desconto_80                                                                                                | desconto_60_reconhecimento | desconto_40_fora_sne                                             | integral_juros, method: pix                                                                                  | debito           | boleto                                    | cartao, installments?, waiverAck? }` | simples | `inf:collection:issue` → `{ documentId, barcode | pixCopyPaste, amount, validUntil }` |
| `adesao_sne`         | `{ email, phone, consent{ textVersion, effectsAck: [ciencia_ficta, canal_exclusivo, desconto_60, cancelamento] } }` | simples                    | `SnePort.enrollCitizen` via módulo de notificação; `ADERIDO_SNE` |
| `cancelamento_sne`   | `{ reason? }`                                                                                                       | simples                    | `SnePort` cancelamento; notificações anteriores seguem válidas   |
| `junta_medica`       | `{ examId, reason, attachmentIds[] }`                                                                               | avançada                   | delegação PEC (`ch:...:request-board`)                           |
| `lgpd_declaracao`    | `{ scope: confirmacao                                                                                               | declaracao_completa        | correcao                                                         | eliminacao, fields? }`                                                                                       | simples/avançada | `@stynx-nyx/privacy` (`/privacy/exports`) |

## 6. Caixa do cidadão — `portal/inbox`

| Rota                                           | Resposta / efeito                                                                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET inbox?kind&read`                          | `{ items[]{ id, kind: acao_necessaria                                                                                                                                  | informativo, source: sne | portal, subject, summary, aitId?, requestId?, availableOn, readOn?, fictitiousAcknowledgementOn? (só SNE), deadline?{ dueOn, ownedBy } } }` |
| `POST inbox/{id}/read`                         | registra leitura; para itens SNE registra **evidência de ciência** (hash do que foi exibido, quando) e emite `NOTIFICACAO_CIENCIA` ao módulo de notificação (ADR-0014) |
| `GET sne/enrollment`                           | `{ enrolled, since, channel, cancelable: true }`                                                                                                                       |
| `POST sne/enrollment`, `DELETE sne/enrollment` | ver §5.1 (`adesao_sne`, `cancelamento_sne`)                                                                                                                            |
| `POST push-subscriptions`                      | assinatura web push                                                                                                                                                    |

## 7. Documentos, veículos, sinistros e exames (leituras cacheadas e projeções)

| Rota                              | Fonte                                                | Resposta                                                                      |
| --------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `GET documents/cnh`               | `RenachPort`/`CdtPort.getCitizenLicense` (cache TTL) | `{ status: valida                                                             | vencida                                                                        | suspensa | cassada, validUntil, categories[], restrictions[], documentBytes (PDF/A assinado), qrVerification, cachedAt }`                             |
| `GET vehicles`                    | `CdtPort.listCitizenVehicles`                        | `[{ vehicleId, plate, renavamMasked: never, model }]`                         |
| `GET vehicles/{id}/clearance`     | RENAVAM leitura + `inf/collection` + infração        | `{ items[]{ kind: tributo                                                     | encargo                                                                        | multa    | dpvat, amount, status, blocking, reason }, restrictions[]{ kind, blocking }, suspendedEnforceability[] (não bloqueia, DT-027), canIssue }` |
| `POST vehicles/{id}/crlv-e`       | idem                                                 | `{ documentBytes, qrVerification, issuedAt }` ou `PORTAL.CRLV_BLOCKED_BY_DEBT | _RESTRICTION`                                                                  |
| `GET crashes`, `GET crashes/{id}` | projeção BOAT (`FECHADO                              | INTEGRADO`)                                                                   | titular sem máscara; dado de saúde de terceiro suprimido; acesso auditado      |
| `GET exams`, `GET exams/{id}`     | projeção PEC (`SIGNED                                | CLOSED`)                                                                      | rótulo legal (nunca `CONDICIONADO`), validade por faixa etária, prazo de junta |

## 8. Atendimento — `portal/citizen-service`

| Rota                                            | Ação          | Payload                 | Efeito                                                                                                                    |
| ----------------------------------------------- | ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `POST manifestations` (anônimo admitido)        | `manifest`    | `{ kind: reclamacao     | denuncia                                                                                                                  | sugestao                                            | elogio | solicitacao, text, confidential?, attachmentIds[], anonymous? }` | `MANIFESTACAO_REGISTRADA` → comprovante imediato `{ protocol, receivedAt }`; relógios `T-OUV-RESPOSTA` 30+30 |
| `GET manifestations`, `GET manifestations/{id}` | `read`        | —                       | `{ state (traduzido), protocol, deadlines{ agencyDueOn, extended?{ justification, on } }, decision?, evaluationOffered }` |
| `POST manifestations/{id}/acknowledge`          | `acknowledge` | —                       | `CIENCIA_AO_USUARIO` → `ENCERRADA` → convite de avaliação                                                                 |
| `POST evaluations`                              | `evaluate`    | `{ subjectKind: request | manifestation, subjectId, scores{…5}, comment? }`                                                                         | alimenta consolidação anual e projeção do dashboard |
| `GET service-charter/{serviceKey}/deadline`     | `read`        | —                       | prazo máximo do serviço (Lei 13.460 art. 7º)                                                                              |

## 9. Fluxo SSE — `GET /v1/portal/stream`

Eventos `inbox.item` (novo item, `kind`), `request.changed` (`requestId`, `situation`, `nextAction`),
`decision.published` (`requestId`), `payment.confirmed` (`aitId`); envelope de
`rait-events-sse-contract.md` §1; escopo = sujeito da sessão; replay 24 h; fallback polling 60 s.

## 10. Eventos publicados pelo domínio `portal`

`SOLICITACAO_CRIADA`, `SOLICITACAO_PROTOCOLADA`, `SOLICITACAO_DESISTIDA`, `SOLICITACAO_CONCLUIDA`,
`NIVEL_ASSINATURA_ELEVADO`, `REPRESENTACAO_VALIDADA`, `INBOX_LIDO`, `NOTIFICACAO_CIENCIA` (itens
SNE), `MANIFESTACAO_REGISTRADA`, `MANIFESTACAO_ENCERRADA`, `AVALIACAO_REGISTRADA`,
`SNE_ADESAO_SOLICITADA`, `SNE_CANCELAMENTO_SOLICITADO`. Consumidos: `INFRACAO_ESTADO_ALTERADO`,
`NOTIFICACAO_EXPEDIDA`, `NOTIFICACAO_CIENCIA`, `RAIT_CASO_*`, `RAIT_DECISAO_PUBLICADA`,
`rait.inquiry.changed`, `PAGAMENTO_CONFIRMADO`, `RESTITUICAO_ORDENADA`.

## 11. Mapeamento das entidades de origem (`appeal.*`, `portal.*`, `platform.*`)

| Origem                                                                                                             | Destino no monorepo                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `appeal_case`, `_protocol`, `_party`, `_document`, `_assignment`, `_deadline`, `_diligence`, `_event`, `_decision` | **não portadas**: o caso é `inf.rait_case` (`WF-RAIT-001`); o Portal guarda só `portal.request` + protocolo e a projeção `process_timeline` |
| `portal_action_policy`                                                                                             | `portal.act_level_policy` (ADR-0017) com níveis `simples                                                                                    | avancada | qualificada` |
| `portal.ait_entitlement`                                                                                           | `portal.entitlement` (alvo genérico: ait, case, vehicle, license, crash, exam)                                                              |
| `portal.service_catalog`                                                                                           | `portal.service_catalog` (11 campos de `RN-PORTAL-108`, check de motivo quando indisponível)                                                |
| `platform.tenant_brand_profile`, `platform.public_hostname`                                                        | `portal.brand_profile`, `portal.public_hostname` (sem RLS, por desenho)                                                                     |
| `custom:teat_assurance_level` (low/substantial/high)                                                               | claim `assurance_level` (simples/avançada/qualificada) do gov.br federado                                                                   |
