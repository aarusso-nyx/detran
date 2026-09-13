---
id: ARCH-RAIT-ERRORS
title: Catálogo de erros do RAIT — códigos estáveis, envelope, tratamento na UI e base legal
status: draft
apps: [rait, portal, dashboard]
updated: 2026-09-12
---

# Catálogo de erros do RAIT

Fonte de verdade dos códigos de erro devolvidos pelos endpoints do RAIT (`/v1/inf/rait/*`,
gerados e de comando) e consumidos por `apps/rait/web`. Complementa `rait-web-frontend.md`
(§7 comandos, §9 formulários) e é insumo direto dos pacotes de trabalho B (rotas), C (payloads) e
E (gates de transição) de `rait-build-pack.md`. Regras de negócio citadas: `RN-RAIT-*`; estados do
caso: `WF-RAIT-001`; estados da infração: `WF-INF-003`; sessão: `WF-RAIT-003`.

## 1. Envelope (STYNX 1.3.1)

Todo erro sai pelo `StynxErrorFilter` do kernel (`@stynx-nyx/core`), que serializa qualquer
subclasse de `StynxError`:

```json
{
  "code": "RAIT.CASE_STATE_INVALID",
  "status": 409,
  "message": "O caso não está em um estado que admite esta ação.",
  "messageKey": "rait.errors.case_state_invalid",
  "requestId": "01J8…",
  "context": {
    "caseId": "…",
    "currentState": "DILIGENCIA",
    "allowedStates": ["EM_INSTRUCAO"],
    "command": "submit-draft"
  }
}
```

Regras:

1. `code` é estável, em maiúsculas, com prefixo `RAIT.` e forma `RAIT.<RECURSO>_<MOTIVO>`. Nunca
   muda de significado; um código aposentado permanece no catálogo com a marca "descontinuado".
2. `status` segue a família HTTP da §2; a UI decide o tratamento pelo `code`, nunca só pelo status.
3. `messageKey` é a chave do catálogo pt-BR do frontend (`i18n/pt-BR.json`, namespace
   `rait.errors.*`); `message` é o texto de fallback em pt-BR gerado no servidor.
4. `context` carrega apenas identificadores, tokens canônicos e números — nunca texto livre de
   petição nem dados pessoais de terceiros (`RN-RAIT-134`, `RN-RAIT-137`).
5. Erros de validação de forma (`400`) carregam `context.fields[]` com `{ path, rule, params }`;
   a UI os exibe inline no campo (`rait-web-frontend.md` §9).
6. Erros de estado/concorrência (`409`, `412`) fazem a UI recarregar o recurso e reabrir a tela
   com os dados atuais; erros `422` mostram diálogo com a base legal (`context.legalBasis`).
7. Erros não catalogados (bug) saem como `RAIT.INTERNAL` com `status 500` e `requestId`; a UI
   mostra o `requestId` para suporte.

## 2. Famílias

| Família        | Status      | Quando                                                                 | Tratamento padrão na UI                                           |
| -------------- | ----------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `VALIDATION`   | 400         | forma do payload (campos, formatos, enums)                             | inline por campo; foco no primeiro erro                           |
| `AUTH`         | 401         | sessão ausente/expirada                                                | redireciona ao login preservando a rota                           |
| `FORBIDDEN`    | 403         | papel sem a chave `inf:rait-*:*`; caso fora do pool/unidade do usuário | mensagem "sem permissão para esta ação"; botão some               |
| `NOT_FOUND`    | 404         | recurso inexistente ou de outro tenant                                 | página "não encontrado" com busca por protocolo                   |
| `STATE`        | 409         | guarda de estado da máquina falhou; concorrência                       | recarrega e reabre; toast "o estado mudou"                        |
| `PRECONDITION` | 412/428     | `If-Match` divergente/ausente                                          | recarrega; pede nova confirmação                                  |
| `BUSINESS`     | 422         | regra de negócio com base legal                                        | diálogo com a regra e a base legal                                |
| `RATE_LIMIT`   | 429         | limite do `@stynx-nyx/ratelimit`                                       | aguarda `Retry-After`                                             |
| `UPSTREAM`     | 502/503/504 | RENAINF/RENACH/SNE/storage/assinatura indisponíveis                    | ação fica "pendente de retransmissão"; nunca bloqueia a instrução |
| `INTERNAL`     | 500         | falha não catalogada                                                   | `requestId` visível                                               |

## 3. Códigos

Colunas: código · status · quando ocorre · `context` · base · comandos/telas que o produzem.

### 3.1 Sessão, permissão e tenant

| Código                      | Status | Quando                                                         | `context`                     | Base                        | Onde                        |
| --------------------------- | ------ | -------------------------------------------------------------- | ----------------------------- | --------------------------- | --------------------------- |
| `RAIT.AUTH_REQUIRED`        | 401    | sem principal STYNX                                            | —                             | ADR-0005                    | todas                       |
| `RAIT.FORBIDDEN_ACTION`     | 403    | `isDetranActionAllowed` falso para `inf:rait-<r>:<a>`          | `resource`, `action`, `roles` | ADR-0005; ADR-0015          | todas                       |
| `RAIT.FORBIDDEN_CASE_SCOPE` | 403    | caso não pertence ao pool/unidade/circunscrição do usuário     | `caseId`, `poolId`, `unitId`  | RN-RAIT-143; WF-RAIT-004 §1 | `/casos/:id`, `/assinatura` |
| `RAIT.FORBIDDEN_ORGAO`      | 403    | papel de colegiado atuando no órgão errado (`jari` × `cetran`) | `orgao`, `memberBodies`       | RN-RAIT-141                 | `/colegiado/:orgao/*`       |
| `RAIT.TENANT_MISMATCH`      | 404    | recurso de outro tenant (tratado como inexistente)             | —                             | ADR-0005 (RLS)              | todas                       |

### 3.2 Forma dos payloads

| Código                       | Status | Quando                                              | `context`                    | Base                     | Onde                |
| ---------------------------- | ------ | --------------------------------------------------- | ---------------------------- | ------------------------ | ------------------- |
| `RAIT.VALIDATION_FAILED`     | 400    | qualquer violação de schema                         | `fields[]{path,rule,params}` | contratos OpenAPI        | todas               |
| `RAIT.ENUM_INVALID`          | 400    | token fora do vocabulário canônico                  | `field`, `allowed[]`         | WF-INF-003; WF-RAIT-001  | todas               |
| `RAIT.DOCUMENT_INVALID`      | 400    | CPF/CNPJ inválido                                   | `field`                      | UC-RAIT-001              | intake, partes      |
| `RAIT.DATE_IN_FUTURE`        | 400    | data de marco (postagem/protocolo) posterior a hoje | `field`, `max`               | RN-RAIT-106              | intake              |
| `RAIT.FILE_TYPE_UNSUPPORTED` | 400    | upload fora de PDF/JPEG/PNG                         | `allowed[]`                  | UC-RAIT-001              | dossiê, intake      |
| `RAIT.FILE_TOO_LARGE`        | 400    | acima do limite de storage                          | `maxBytes`                   | kernel storage           | dossiê, intake      |
| `RAIT.IF_MATCH_REQUIRED`     | 428    | comando sem `If-Match`                              | —                            | rait-web-frontend §7     | todos os comandos   |
| `RAIT.VERSION_CONFLICT`      | 412    | `If-Match` diferente da versão atual                | `currentVersion`             | rait-web-frontend §7     | todos os comandos   |
| `RAIT.IDEMPOTENCY_REPLAY`    | 409    | mesma `Idempotency-Key` com payload diferente       | `key`                        | `@stynx-nyx/idempotency` | comandos de criação |

### 3.3 Protocolo e intake (`rait-case:protocol`, pendências, redirecionamento, desistência)

| Código                                 | Status | Quando                                                                                                                                                                                                                                    | `context`                        | Base                                    | Onde                           |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------- | ------------------------------ |
| `RAIT.INTAKE_MULTIPLE_AIT`             | 422    | requerimento cita mais de um AIT                                                                                                                                                                                                          | `aitNumbers[]`                   | Res. 900/2022 art. 3º p.ú.; RN-RAIT-002 | `/protocolo/novo`, Portal      |
| `RAIT.INTAKE_DUPLICATE_INSTANCE`       | 409    | já existe caso ativo do mesmo AIT na mesma instância                                                                                                                                                                                      | `existingCaseId`, `instance`     | RN-RAIT-002; WF-INF-003 §5.9            | `/protocolo/novo`, Portal      |
| `RAIT.INTAKE_INFRACTION_STATE_INVALID` | 422    | infração não está em estado que admite a peça (ex.: defesa após `T-DEF`) — o caso ainda é protocolado e triado como intempestivo quando a norma exige; este erro só bloqueia peças logicamente impossíveis (instância encerrada por C.22) | `infractionState`, `instance`    | WF-INF-003 §5.5; Owner C.22             | `/protocolo/novo`, Portal      |
| `RAIT.INTAKE_CHANNEL_MARK_MISSING`     | 400    | canal postal/balcão sem data do marco                                                                                                                                                                                                     | `channel`                        | RN-RAIT-106                             | `/protocolo/novo`              |
| `RAIT.INTAKE_SIGNATURE_MISSING`        | 422    | peça sem assinatura (bloqueia protocolo? não — registra pendência); erro só quando a secretaria tenta _admitir_ sem assinatura                                                                                                            | `caseId`                         | RN-RAIT-001 (critério assinatura)       | triagem                        |
| `RAIT.INTAKE_MINIMUM_CONTENT`          | 422    | conteúdo mínimo ausente e secretaria pediu protocolo sem abrir pendência                                                                                                                                                                  | `missing[]`                      | RN-RAIT-002; UC-RAIT-028                | `/protocolo/novo`              |
| `RAIT.PENDING_CONTENT_EXPIRED`         | 409    | juntada após o prazo da pendência                                                                                                                                                                                                         | `pendingId`, `dueOn`             | UC-RAIT-028                             | `/protocolo/pendencias`        |
| `RAIT.REDIRECT_SAME_BODY`              | 422    | redirecionamento para o próprio órgão                                                                                                                                                                                                     | `targetBody`                     | RN-RAIT-106; UC-RAIT-027                | `/protocolo/redirecionamentos` |
| `RAIT.WITHDRAWAL_AFTER_DECISION`       | 409    | desistência após decisão/proclamação                                                                                                                                                                                                      | `caseState`                      | RN-RAIT-123; UC-RAIT-012                | `/protocolo/desistencias`      |
| `RAIT.WITHDRAWAL_LEGITIMACY`           | 422    | signatário do termo não é parte legítima nem procurador válido                                                                                                                                                                            | `partyId`                        | Res. 900/2022 art. 2º §2º               | `/protocolo/desistencias`      |
| `RAIT.PARTY_LEGITIMACY_INVALID`        | 422    | base de legitimidade incompatível com o sujeito passivo                                                                                                                                                                                   | `legitimacyBasis`, `subjectKind` | RN-RAIT-120; Res. 900/2022 art. 2º      | partes                         |
| `RAIT.PROCURATION_UNVERIFIED`          | 422    | procurador sem instrumento verificado                                                                                                                                                                                                     | `partyId`                        | Res. 900/2022 art. 2º §2º               | partes, triagem                |

### 3.4 Fila, distribuição e atribuição

| Código                           | Status | Quando                                                                           | `context`                            | Base                               | Onde                              |
| -------------------------------- | ------ | -------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | --------------------------------- |
| `RAIT.QUEUE_EMPTY`               | 409    | "puxar próximo" sem caso elegível                                                | `poolId`                             | WF-RAIT-004 §4                     | `/fila/defesa`                    |
| `RAIT.ASSIGNMENT_WIP_LIMIT`      | 422    | revisor no limite de casos simultâneos                                           | `wip`, `limit`                       | WF-RAIT-004 §4; RN-RAIT-139        | `/fila/defesa`                    |
| `RAIT.MEMBER_NOT_AVAILABLE`      | 422    | membro fora da escala (`AUSENTE_PROGRAMADO`, `AFASTADO_TEMP`, mandato encerrado) | `memberId`, `availability`, `status` | WF-RAIT-004 §3; WF-RAIT-002 §5     | fila, sorteio, reatribuição       |
| `RAIT.MEMBER_IMPEDED`            | 422    | membro com impedimento/suspeição registrada no caso                              | `memberId`, `caseId`, `basis`        | RN-RAIT-140; Lei 9.784 arts. 18-21 | fila, sorteio, reatribuição, voto |
| `RAIT.ASSIGNMENT_ALREADY_ACTIVE` | 409    | caso já tem responsável ativo                                                    | `assignmentId`, `memberId`           | WF-RAIT-002 §2                     | claim, sorteio                    |
| `RAIT.REASSIGN_REASON_REQUIRED`  | 400    | reatribuição sem motivo tipado                                                   | `allowed[]`                          | UC-RAIT-011                        | `/gestao/radar/:caseId`           |
| `RAIT.REASSIGN_TO_SAME_MEMBER`   | 422    | novo responsável = anterior, ou ao impedido                                      | `memberId`                           | RN-RAIT-140; UC-RAIT-011           | reatribuição                      |
| `RAIT.ORDER_OVERRIDE_FORBIDDEN`  | 403    | tentativa de escolher caso fora da ordem única sem papel de plantão              | —                                    | RN-RAIT-141                        | `/fila/*`                         |
| `RAIT.BATCH_STATE_INVALID`       | 409    | operação de lote fora de `LOTE_ABERTO`/`LOTE_SORTEADO`/`LOTE_ACEITO`             | `batchId`, `batchState`              | WF-RAIT-004 §5                     | `/colegiado/:orgao/distribuicao`  |
| `RAIT.BATCH_NO_ELIGIBLE_MEMBERS` | 422    | sorteio sem membros elegíveis suficientes                                        | `required`, `eligible`               | RN-RAIT-141; RN-RAIT-142           | sorteio                           |
| `RAIT.BATCH_SEED_TAMPERED`       | 422    | semente/ordem informada não confere com a ata                                    | `batchId`                            | RN-RAIT-141                        | homologação                       |
| `RAIT.BATCH_CLAIM_EXPIRED`       | 409    | aceite após `T-CLAIM`                                                            | `batchId`, `caseId`, `expiredAt`     | WF-RAIT-004 §5                     | relatoria                         |
| `RAIT.SCHEDULE_NO_DUTY_MEMBER`   | 422    | escala sem plantonista em dia útil                                               | `date`                               | UC-RAIT-013                        | `/organizacao/escala`             |
| `RAIT.SCHEDULE_PERIOD_LOCKED`    | 409    | escala de período já iniciado                                                    | `periodStart`                        | UC-RAIT-013                        | `/organizacao/escala`             |

### 3.5 Caso: triagem, instrução, diligência, minuta

| Código                                 | Status | Quando                                                      | `context`                                              | Base                          | Onde                      |
| -------------------------------------- | ------ | ----------------------------------------------------------- | ------------------------------------------------------ | ----------------------------- | ------------------------- |
| `RAIT.CASE_STATE_INVALID`              | 409    | comando incompatível com o estado do caso                   | `caseId`, `currentState`, `allowedStates[]`, `command` | WF-RAIT-001                   | todos os comandos do caso |
| `RAIT.TRIAGE_INCOMPLETE`               | 422    | admitir/não conhecer sem os 4 vereditos                     | `missingCriteria[]`                                    | RN-RAIT-001; RN-RAIT-122      | `/casos/:id/triagem`      |
| `RAIT.TRIAGE_TIMELINESS_READONLY`      | 422    | tentativa de alterar o veredito de tempestividade calculado | `computedVerdict`                                      | RN-RAIT-005; RN-RAIT-105      | triagem                   |
| `RAIT.NON_ADMISSION_REASON_REQUIRED`   | 422    | não conhecimento sem inciso do art. 4º da Res. 900          | `allowed[]`                                            | Res. 900/2022 art. 4º         | triagem                   |
| `RAIT.INQUIRY_ADDRESSEE_FORBIDDEN`     | 422    | diligência ao requerente pedindo documento do órgão         | `documentKind`                                         | RN-RAIT-003; RN-RAIT-004      | `/casos/:id/diligencias`  |
| `RAIT.INQUIRY_EXTENSION_LIMIT`         | 422    | segunda prorrogação                                         | `inquiryId`                                            | RN-RAIT-004; Res. 900 art. 9º | diligências               |
| `RAIT.INQUIRY_ALREADY_CLOSED`          | 409    | resposta a diligência expirada/respondida                   | `inquiryId`, `outcome`                                 | UC-RAIT-003                   | diligências               |
| `RAIT.DRAFT_INCOMPLETE`                | 422    | minuta sem fatos/fundamentos/dispositivo                    | `missing[]`                                            | UC-RAIT-003; IU-RAIT-001 §3   | `/casos/:id/minuta`       |
| `RAIT.DRAFT_AUTHOR_CANNOT_SIGN`        | 403    | autor da minuta tentando decidir                            | `draftAuthorId`                                        | IU-RAIT-001 §3                | `/assinatura/:caseId`     |
| `RAIT.DRAFT_RETURN_LIMIT`              | 422    | segunda devolução com orientação                            | `caseId`                                               | UC-RAIT-016                   | `/assinatura/:caseId`     |
| `RAIT.CASE_OFFICIAL_DOCUMENT_REQUIRED` | 422    | pedido ao requerente de documento que o órgão detém         | `documentKind`                                         | RN-RAIT-003                   | dossiê                    |
| `RAIT.DOCUMENT_HASH_MISMATCH`          | 422    | hash declarado ≠ conteúdo                                   | `documentId`                                           | UC-RAIT-001                   | dossiê, intake            |

### 3.6 Decisão e assinatura

| Código                                    | Status | Quando                                                                          | `context`                       | Base                     | Onde                  |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------- | ------------------------------- | ------------------------ | --------------------- |
| `RAIT.DECISION_JURISDICTION`              | 403    | autoridade fora da circunscrição do AIT                                         | `aitUnitId`, `authorityUnits[]` | RN-RAIT-143              | `/assinatura/:caseId` |
| `RAIT.DECISION_NOT_ON_DUTY`               | 422    | autoridade fora da escala de assinatura do dia                                  | `date`                          | WF-RAIT-004 §3           | `/assinatura/:caseId` |
| `RAIT.DECISION_GROUNDS_REQUIRED`          | 422    | fundamentação vazia                                                             | —                               | Lei 9.784/1999 art. 50   | decisão, voto         |
| `RAIT.DECISION_KIND_INVALID_FOR_INSTANCE` | 422    | `acolhida/indeferida` fora da defesa prévia; `provido/negado` fora do colegiado | `decisionKind`, `instance`      | WF-RAIT-001              | decisão, proclamação  |
| `RAIT.SIGNATURE_FAILED`                   | 502    | kernel de assinatura PAdES+TSA indisponível ou rejeitou                         | `provider`, `reason`            | steering A.8             | assinatura, ata       |
| `RAIT.SIGNATURE_CERT_MISMATCH`            | 422    | certificado não corresponde ao usuário autenticado                              | —                               | steering A.8             | assinatura, ata       |
| `RAIT.DECISION_ALREADY_SIGNED`            | 409    | segunda assinatura do mesmo ato                                                 | `decisionId`                    | UC-RAIT-016              | assinatura            |
| `RAIT.EXTINCTION_CEILING_NOT_REACHED`     | 422    | declarar decadência/prescrição antes do teto                                    | `timerCode`, `ceilingOn`        | UC-RAIT-023; RN-RAIT-112 | `/gestao/incidentes`  |
| `RAIT.EXTINCTION_DECISION_LATE`           | 422    | decisão proferida após o teto sem parecer ("extemporânea")                      | `timerCode`, `expiredOn`        | UC-RAIT-023 (DT-044)     | decisão, proclamação  |

### 3.7 Colegiado: pauta, sessão, votação, ata, vista

| Código                             | Status | Quando                                                                        | `context`                                      | Base                             | Onde                               |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------- | ---------------------------------- |
| `RAIT.SESSION_STATE_INVALID`       | 409    | comando incompatível com o estado da sessão                                   | `sessionId`, `currentState`, `allowedStates[]` | WF-RAIT-003                      | `/colegiado/:orgao/sessoes/:id`    |
| `RAIT.AGENDA_ITEM_WITHOUT_OPINION` | 422    | pautar item sem parecer registrado                                            | `caseId`                                       | UC-RAIT-005                      | `/colegiado/:orgao/pauta`          |
| `RAIT.AGENDA_CRITICAL_MISSING`     | 422    | fechar pauta deixando `ALERTA_N3`/`CRITICO` de fora                           | `missingCaseIds[]`                             | WF-RAIT-002 §4; UC-RAIT-005      | pauta                              |
| `RAIT.AGENDA_SHORT_NOTICE`         | 422    | pauta fechada com menos de `T-CONV`; exige `shortNoticeAck`                   | `daysUntilSession`, `minimum`                  | WF-RAIT-003 (pendente regimento) | pauta, extraordinária              |
| `RAIT.AGENDA_ITEM_DUPLICATE`       | 409    | caso já pautado em outra sessão aberta                                        | `sessionId`                                    | WF-RAIT-003                      | pauta                              |
| `RAIT.SESSION_QUORUM_MISSING`      | 422    | abertura/votação sem quorum, sem presidente/suplente ou sem paridade (CETRAN) | `required`, `observed`, `parity`               | RN-RAIT-142; Res. 357; Res. 901  | abertura, item                     |
| `RAIT.BENCH_INSUFFICIENT`          | 422    | banca abaixo do quorum até `T-CONV`                                           | `confirmed`, `required`                        | WF-RAIT-004 §6; UC-RAIT-015      | `/sessoes/:id/banca`               |
| `RAIT.VOTE_MEMBER_IMPEDED`         | 422    | voto de membro impedido/ausente                                               | `memberId`                                     | RN-RAIT-140; RN-RAIT-142         | sessão                             |
| `RAIT.VOTE_ITEM_NOT_OPEN`          | 409    | voto em item não lido ou já proclamado                                        | `agendaItemId`, `itemState`                    | WF-RAIT-003                      | sessão                             |
| `RAIT.VOTE_DUPLICATE`              | 409    | segundo voto do mesmo membro no item                                          | `memberId`                                     | WF-RAIT-003                      | sessão                             |
| `RAIT.CASTING_VOTE_NOT_TIED`       | 422    | voto de qualidade sem empate                                                  | `tally`                                        | Res. 901/2022 Anexo 12.4         | sessão                             |
| `RAIT.CASTING_VOTE_NOT_CHAIR`      | 403    | voto de qualidade por quem não preside                                        | —                                              | WF-RAIT-003                      | sessão                             |
| `RAIT.PROCLAIM_NO_MAJORITY`        | 422    | proclamar sem maioria nem desempate                                           | `tally`                                        | WF-RAIT-003                      | sessão                             |
| `RAIT.VIEW_REQUEST_NOT_ALLOWED`    | 422    | pedido de vista fora da leitura ou vedado pelo regimento (parâmetro)          | `itemState`                                    | UC-RAIT-019 (pendente regimento) | sessão                             |
| `RAIT.VIEW_DEADLINE_EXCEEDED`      | 409    | devolução de vista após o prazo                                               | `dueOn`                                        | UC-RAIT-019                      | `/colegiado/:orgao/vistas`         |
| `RAIT.ORAL_ARGUMENT_DISABLED`      | 422    | sustentação oral com o parâmetro desligado                                    | —                                              | backlog (sustentação oral)       | sessão                             |
| `RAIT.MINUTES_NOT_READY`           | 409    | gerar/assinar ata antes de `DECISAO_PROCLAMADA` de todos os itens             | `pendingItems[]`                               | UC-RAIT-020                      | `/sessoes/:id/ata`                 |
| `RAIT.MINUTES_SIGNERS_MISSING`     | 422    | publicar ata sem assinatura do presidente e da secretaria                     | `missingSigners[]`                             | UC-RAIT-020                      | ata                                |
| `RAIT.MINUTES_ALREADY_PUBLISHED`   | 409    | republicação                                                                  | `publishedAt`                                  | RN-RAIT-103                      | ata                                |
| `RAIT.EXTRAORDINARY_NO_CRITICAL`   | 422    | convocação extraordinária sem casos `ALERTA_N3`/`CRITICO`                     | —                                              | UC-RAIT-021                      | `/colegiado/:orgao/extraordinaria` |
| `RAIT.SESSION_PAID_CAP_REACHED`    | 422    | teto mensal de sessões remuneradas atingido (parâmetro pendente de fonte)     | `cap`, `count`                                 | UC-RAIT-021 (pendente regimento) | extraordinária                     |

### 3.8 Recurso da autoridade, remessa e recebimento

| Código                                  | Status | Quando                                                   | `context`               | Base                      | Onde                      |
| --------------------------------------- | ------ | -------------------------------------------------------- | ----------------------- | ------------------------- | ------------------------- |
| `RAIT.REMIT_NOT_ADMITTED`               | 409    | remessa de caso não admitido ou de instância errada      | `caseState`, `instance` | UC-RAIT-017               | `/protocolo/remessas`     |
| `RAIT.REMIT_CHECKLIST_INCOMPLETE`       | 422    | remessa sem os documentos de ofício                      | `missing[]`             | UC-RAIT-017 (F-J-0)       | remessas                  |
| `RAIT.RECEIPT_ALREADY_REGISTERED`       | 409    | segundo recebimento pelo órgão julgador                  | `receivedAt`            | RN-RAIT-111               | remessas, CETRAN          |
| `RAIT.AUTHORITY_APPEAL_WINDOW_CLOSED`   | 409    | recurso vinculado após `T-R2`                            | `dueOn`                 | RN-RAIT-130; CTB art. 288 | `/autoridade/provimentos` |
| `RAIT.AUTHORITY_APPEAL_NOT_PROVIDED`    | 422    | recurso da autoridade contra decisão não provida         | `outcome`               | RN-RAIT-130               | provimentos               |
| `RAIT.AUTHORITY_APPEAL_ALREADY_DECIDED` | 409    | segunda decisão (recorrer/renunciar) no mesmo provimento | `decidedAt`             | UC-RAIT-008               | provimentos               |

### 3.9 Prazos, relógios, suspensão e parâmetros

| Código                                  | Status | Quando                                                                         | `context`       | Base                        | Onde                    |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------ | --------------- | --------------------------- | ----------------------- |
| `RAIT.DEADLINE_LEGAL_READONLY`          | 422    | tentativa de editar prazo legal ou marco de ciência pela UI                    | `timerCode`     | RN-RAIT-005; RN-RAIT-105    | prazos, parâmetros      |
| `RAIT.PARAMETER_LEGAL_READONLY`         | 422    | parâmetro de origem legal (T-DEF piso, T-JUL-24M…) não editável                | `key`           | UC-RAIT-043                 | `/admin/parametros`     |
| `RAIT.PARAMETER_EFFECTIVE_DATE_PAST`    | 422    | vigência retroativa                                                            | `effectiveFrom` | UC-RAIT-043                 | parâmetros              |
| `RAIT.PARAMETER_SOURCE_PENDING`         | 422    | parâmetro marcado "pendente de fonte" usado em comando que exige valor (jeton) | `key`           | UC-RAIT-036; UC-RAIT-043    | jeton, extraordinária   |
| `RAIT.SUSPENSION_LEGAL_TIMER`           | 422    | ato de suspensão sobre `T-DEC`/`T-JUL-24M`/`T-PRESC-5A` (prazos de extinção)   | `timerCode`     | RN-RAIT-105; CTB art. 290-A | `/admin/atos/suspensao` |
| `RAIT.SUSPENSION_EVIDENCE_REQUIRED`     | 422    | ato sem prova de força maior                                                   | —               | UC-RAIT-022                 | suspensão               |
| `RAIT.CLOCK_ALERT_ALREADY_ACKNOWLEDGED` | 409    | reconhecimento repetido                                                        | `alertId`       | UC-RAIT-010                 | radar                   |
| `RAIT.CLOCK_ALERT_ROLE_MISMATCH`        | 403    | reconhecimento por papel diferente do notificado                               | `notifiedRole`  | WF-RAIT-002 §4              | radar                   |
| `RAIT.CALENDAR_OVERLAP`                 | 409    | feriado duplicado na mesma data                                                | `date`          | WF-RAIT-002 §7              | `/admin/calendario`     |

### 3.10 Organização: membros, mandatos, turmas, jeton

| Código                            | Status | Quando                                                                    | `context`                       | Base                           | Onde                   |
| --------------------------------- | ------ | ------------------------------------------------------------------------- | ------------------------------- | ------------------------------ | ---------------------- |
| `RAIT.MANDATE_ACT_REQUIRED`       | 422    | nomeação/posse sem ato publicado                                          | —                               | UC-RAIT-037; Res. 357 item 6   | `/organizacao/membros` |
| `RAIT.MANDATE_DUAL_BODY`          | 422    | mesma pessoa titular em JARI e CETRAN                                     | `personId`                      | RN-RAIT-142                    | membros                |
| `RAIT.MANDATE_OVERLAP`            | 409    | mandatos sobrepostos no mesmo órgão                                       | `personId`, `overlapWith`       | UC-RAIT-037                    | membros                |
| `RAIT.MANDATE_ACTIVE_ASSIGNMENTS` | 409    | encerrar mandato com casos ativos sem redistribuição                      | `activeCaseIds[]`               | UC-RAIT-037; UC-RAIT-011       | membros                |
| `RAIT.POOL_STRATEGY_INVALID`      | 400    | estratégia fora de `pull`/`round_robin`/`load_balanced`                   | `allowed[]`                     | BP-INF-RAIT-WORKLIST-001       | `/organizacao/pools`   |
| `RAIT.POOL_INSTANCE_DUPLICATE`    | 409    | segundo pool ativo para a mesma instância                                 | `instance`                      | BP-INF-RAIT-WORKLIST-001       | pools                  |
| `RAIT.UNIT_COORDINATOR_REQUIRED`  | 422    | ativar turma sem coordenador designado                                    | `unitId`                        | RN-RAIT-139; Res. 357 item 2.3 | `/gestao/turmas`       |
| `RAIT.UNIT_TRIGGER_NOT_MET`       | 422    | constituir turma sem gatilho de capacidade (3 meses de fila > capacidade) | `months`, `backlog`, `capacity` | WF-RAIT-004 §7-8               | turmas                 |
| `RAIT.JETON_MINUTES_UNSIGNED`     | 422    | folha inclui sessão sem ata assinada                                      | `sessionIds[]`                  | UC-RAIT-036                    | `/organizacao/jeton`   |
| `RAIT.JETON_ALREADY_APPROVED`     | 409    | reaprovação                                                               | `sheetId`                       | UC-RAIT-036                    | jeton                  |

### 3.11 Integrações, financeiro, arquivo e auditoria

| Código                              | Status | Quando                                                                        | `context`                             | Base                          | Onde                       |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------- | ------------------------------------- | ----------------------------- | -------------------------- |
| `RAIT.UPSTREAM_RENAINF_UNAVAILABLE` | 503    | adapter sem resposta; ação enfileirada                                        | `outboxId`, `retryAfter`              | ADR-0003; UC-RAIT-029         | integrações                |
| `RAIT.UPSTREAM_RENACH_UNAVAILABLE`  | 503    | idem para pontuação/estorno                                                   | `outboxId`                            | UC-RAIT-030                   | integrações                |
| `RAIT.UPSTREAM_SNE_UNAVAILABLE`     | 503    | idem para ciência/expedição por SNE                                           | `outboxId`                            | Res. 931/2022                 | comunicações               |
| `RAIT.UPSTREAM_REJECTED`            | 502    | sistema nacional rejeitou o registro (conteúdo)                               | `system`, `upstreamCode`, `outboxId`  | UC-RAIT-031                   | integrações                |
| `RAIT.RECONCILIATION_DIVERGENCE`    | 422    | estado local ≠ nacional; exige decisão do operador                            | `local`, `remote`                     | UC-RAIT-031                   | `/integracoes/falhas`      |
| `RAIT.RETRY_NOT_FAILED`             | 409    | retransmitir item que não falhou                                              | `outboxId`, `status`                  | UC-RAIT-031                   | integrações                |
| `RAIT.COLLECTION_PHASE_INVALID`     | 422    | documento de arrecadação incompatível com o estado da infração                | `infractionState`, `tier`             | UC-RAIT-032; CTB art. 284     | `/financeiro/arrecadacao`  |
| `RAIT.COLLECTION_DISCOUNT_SNE_ONLY` | 422    | desconto de 60% sem adesão ao SNE                                             | —                                     | RN-RAIT-127                   | arrecadação                |
| `RAIT.REFUND_NOT_DUE`               | 422    | restituição sem `RESTITUICAO_DEVIDA` (não pago, ou penalidade mantida)        | `infractionState`, `paid`             | CTB art. 286 §2º; UC-RAIT-033 | `/financeiro/restituicoes` |
| `RAIT.REFUND_BANK_DATA_MISSING`     | 422    | ordem sem dados bancários; fica pendente com alerta                           | `refundId`                            | UC-RAIT-033                   | restituições               |
| `RAIT.REFUND_INDEX_PENDING`         | 422    | índice de correção não parametrizado (UFIR extinta)                           | `parameterKey`                        | RN-RAIT-129                   | restituições               |
| `RAIT.DEBT_HANDOFF_NOT_FINAL`       | 422    | cobrança/dívida ativa antes de `INSTANCIA_ENCERRADA` ou com efeito suspensivo | `infractionState`, `suspensiveEffect` | UC-RAIT-034; CTB art. 284 §3º | `/financeiro/cobranca`     |
| `RAIT.PAYMENT_UNMATCHED`            | 422    | retorno bancário sem documento correspondente                                 | `paymentRef`                          | UC-RAIT-035                   | `/financeiro/conciliacao`  |
| `RAIT.ARCHIVE_NOT_CLOSED`           | 409    | selar/arquivar caso não transitado/encerrado                                  | `caseState`                           | UC-RAIT-024                   | `/arquivo/*`               |
| `RAIT.ARCHIVE_SEAL_MISMATCH`        | 422    | hash do dossiê selado divergente                                              | `documentId`                          | UC-RAIT-024                   | arquivo                    |
| `RAIT.RETENTION_NOT_DUE`            | 422    | retenção/anonimização antes do prazo                                          | `retainUntil`                         | UC-RAIT-024; RN-RAIT-136      | `/arquivo/retencao`        |
| `RAIT.EXPORT_PURPOSE_REQUIRED`      | 422    | exportação sem finalidade                                                     | —                                     | UC-RAIT-042; RN-RAIT-133      | `/auditoria/exportacoes`   |
| `RAIT.EXPORT_DPO_APPROVAL_REQUIRED` | 422    | exportação nominal em massa sem aprovação do DPO                              | `rowCount`, `threshold`               | UC-RAIT-042; RN-RAIT-137      | exportações                |
| `RAIT.AUDIT_RANGE_TOO_WIDE`         | 422    | trilha por período acima do limite                                            | `maxDays`                             | UC-RAIT-042                   | `/auditoria/trilha`        |

### 3.12 Infração (agregado `WF-INF-003`, endpoints do módulo pendente)

| Código                                  | Status | Quando                                                              | `context`                                 | Base                        | Onde                      |
| --------------------------------------- | ------ | ------------------------------------------------------------------- | ----------------------------------------- | --------------------------- | ------------------------- |
| `RAIT.INFRACTION_STATE_INVALID`         | 409    | evento/comando incompatível com o estado da infração                | `infractionId`, `currentState`, `trigger` | WF-INF-003 §2               | NP, indicação, pagamentos |
| `RAIT.INFRACTION_TIMER_EXPIRED`         | 422    | ato fora do relógio (ex.: NP após `T-DEC`)                          | `timerCode`, `expiredOn`                  | WF-INF-003 §3; CTB 282 §7º  | `UC-RAIT-041`             |
| `RAIT.INFRACTION_NOTICE_DEADLINE_SHORT` | 422    | data-limite impressa < 30 dias                                      | `printedDeadline`, `minimum`              | RN-RAIT-101; RN-RAIT-102    | expedição                 |
| `RAIT.INFRACTION_CLOSED_NO_REVISION`    | 409    | qualquer ato sobre `INSTANCIA_ENCERRADA` além de pagamento/cobrança | `infractionState`                         | Owner C.22; WF-INF-003 §5.5 | todas                     |
| `RAIT.INFRACTION_TERMINAL`              | 409    | ato sobre estado terminal                                           | `infractionState`                         | WF-INF-003 §1               | todas                     |

## 4. Mapeamento para a interface

| Situação                                    | Componente / comportamento                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `400` com `fields[]`                        | erro inline no campo (`DetranFeedbackComponent` de campo), foco no primeiro; botão desabilitado até corrigir |
| `403`                                       | `ErrorBoundary` → banner "sem permissão para esta ação"; ação removida da tela após o retorno                |
| `409` `*_STATE_INVALID`, `VERSION_CONFLICT` | recarrega o recurso, reabre a aba, toast "o estado mudou desde a sua última leitura"                         |
| `422` com `legalBasis`                      | diálogo de confirmação bloqueante com a regra e a base legal (`LegalBasisTooltip`)                           |
| `503` `UPSTREAM_*`                          | badge "pendente de retransmissão" no item; a tela local prossegue                                            |
| `500`                                       | página de erro com `requestId` copiável                                                                      |

## 5. Regras para novos códigos

1. Um código por causa jurídica ou por guarda distinta; não reutilizar `CASE_STATE_INVALID` para
   regras de negócio que tenham base legal própria.
2. Registrar aqui antes de lançar no código; `pnpm docs:kb:check` não valida este arquivo, mas o
   pacote de construção (WP-B) exige que todo `throw` de `RaitError` cite um código deste catálogo.
3. Chaves `messageKey` seguem `rait.errors.<code em minúsculas sem prefixo>`.
