---
id: ARCH-RAIT-EVENTS
title: Contrato de eventos de domínio e do fluxo SSE do RAIT
status: draft
apps: [rait, portal, dashboard]
updated: 2026-09-14
---

# Eventos de domínio e fluxo SSE

Fixa **nome, payload, produtor, consumidores, ordenação, replay e testes** de cada evento que o
RAIT e o agregado da infração publicam, e do fluxo `GET /v1/inf/rait/stream` que o console consome
(`rait-web-frontend.md` §8). Os nomes vêm de `inf.infraction_event_ref` (WF-INF-003 §6), de
`WF-RAIT-001` §Eventos e de `WF-RAIT-003`.

## 1. Envelope de evento (outbox)

Todo evento é gravado na mesma transação do comando que o gera, na `integration.outbox` do kernel
(`@stynx-nyx/integration-adapter`), e entregue a consumidores internos (SSE, dashboard, adapter)
e externos (senatran-adapter) por _workers_ idempotentes.

```json
{
  "id": "01J8ZK…",                       // ULID, ordena por tempo dentro do tenant
  "type": "rait.case.changed",            // nome técnico (§2); o nome de domínio vai em domainEvent
  "domainEvent": "RAIT_DECISAO_PUBLICADA", // token canônico do workflow
  "version": 1,
  "occurredAt": "2026-09-14T13:05:12.331Z",
  "tenantId": "…",                       // nunca exposto no SSE; usado para roteamento
  "actor": { "kind": "user|system|timer", "id": "…", "role": "rait-chair" },
  "correlationId": "<requestId do comando>",
  "causationId": "<id do evento que causou>",
  "aggregate": { "kind": "case|infraction|session|batch|clock|assignment|agenda-item|outbox", "id": "…", "version": 17 },
  "data": { … }                           // payload específico (§2), sem texto livre nem dados de terceiros
}
```

Regras: `data` só carrega ids, tokens e datas; `version` do evento só sobe com mudança
incompatível (consumidores aceitam a anterior por uma release); `aggregate.version` é o `ETag`
pós-transição, o que permite ao frontend descartar eventos velhos.

## 2. Catálogo

### 2.1 Caso (`rait-case`)

| `type`                    | `domainEvent`                       | `data`                                                                                   | Consumidores                          |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| `rait.case.created`       | `RAIT_CASO_PROTOCOLADO`             | `caseId, aitId, instance, circuit, protocolNumber, intakeChannel, markOn, originCaseId?` | infração, SSE, dashboard              |
| `rait.case.changed`       | `RAIT_CASO_ESTADO_ALTERADO`         | `caseId, fromState, toState, instance, reason?, decisionKind?`                           | SSE, dashboard, arquivo               |
| `rait.case.admitted`      | `RAIT_EFEITO_SUSPENSIVO_INSTAURADO` | `caseId, aitId, instance, admittedAt` (só `jari`/`cetran`)                               | infração (efeito suspensivo), adapter |
| `rait.case.received`      | `RAIT_RECURSO_RECEBIDO_JULGADOR`    | `caseId, body: jari                                                                      | cetran, receivedOn`                   | infração (`T-JUL-24M`), SSE |
| `rait.decision.published` | `RAIT_DECISAO_PUBLICADA`            | `caseId, decisionId, decisionKind, publishedOn, channel, sessionId?`                     | infração, portal, SSE, adapter        |
| `rait.case.transited`     | `RAIT_CASO_TRANSITADO`              | `caseId, instance, outcome, transitedOn`                                                 | infração, arquivo, adapter            |
| `rait.case.withdrawn`     | `ENCERRADO_DESISTENCIA`             | `caseId, instance, withdrawnOn, documentId`                                              | infração, SSE                         |
| `rait.inquiry.changed`    | —                                   | `caseId, inquiryId, addressee, dueOn, outcome?`                                          | SSE (retomar), painel                 |
| `rait.communication.sent` | `NOTIFICACAO_EXPEDIDA` (decisão)    | `caseId, communicationId, channel, sentAt, effectiveOn?, nextDeadlineOn?`                | infração, portal                      |

### 2.2 Distribuição e risco (`rait-worklist`)

| `type`                     | `domainEvent`            | `data`                                                                   | Consumidores                                           |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `rait.assignment.changed`  | —                        | `caseId, assignmentId, memberId, poolId, active, releaseReason?`         | SSE, painel, radar                                     |
| `rait.batch.changed`       | —                        | `batchId, orgao, state, itemsPending, claimDueAt?`                       | SSE (relatoria, secretaria)                            |
| `rait.clock.flag-changed`  | `RAIT_ALERTA_PRESCRICAO` | `caseId, clockId, clockCode, fromFlag, toFlag, daysRemaining, ceilingOn` | SSE, dashboard, infração (`RISCO_PRESCRICAO_ALTERADO`) |
| `rait.impediment.declared` | —                        | `caseId, memberId, basis, kind`                                          | sorteio, quorum, SSE                                   |
| `rait.schedule.published`  | —                        | `poolId, periodStart, periodEnd`                                         | elegibilidade                                          |

### 2.3 Sessão (`rait-session`)

| `type`                     | `domainEvent`                       | `data`                                                                                                                  | Consumidores              |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `rait.session.changed`     | —                                   | `sessionId, orgao, fromState, toState, quorumRequired, quorumObserved?, scheduledFor?`                                  | SSE (todos do colegiado)  |
| `rait.agenda-item.changed` | —                                   | `sessionId, agendaItemId, caseId, itemState, tally?: {provimento, naoProvimento, naoConhecimento, abstencao}, outcome?` | SSE                       |
| `rait.minutes.published`   | `RAIT_DECISAO_PUBLICADA` (por item) | `sessionId, minutesId, publishedOn, caseIds[]`                                                                          | infração (`T-R2`), portal |

### 2.4 Infração (agregado, WP-A)

| `type`                         | `domainEvent`              | `data`                                                                                                  | Consumidores                                  |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `inf.infraction.changed`       | `INFRACAO_ESTADO_ALTERADO` | `infractionId, aitId, fromState, toState, substate?, closureMotive?, triggerKind, triggerCode, ruleRef` | portal, dashboard, senatran-adapter (RENAINF) |
| `inf.infraction.penalty-final` | `PENALIDADE_DEFINITIVA`    | `infractionId, aitId, finalOn, points, amountTier`                                                      | senatran-adapter (RENACH)                     |
| `inf.infraction.refund-due`    | `RESTITUICAO_DEVIDA`       | `infractionId, paymentId, amount, reason`                                                               | financeiro                                    |
| `inf.timer.expired`            | `TIMER_VENCIDO`            | `ownerKind, ownerId, timerCode, dueOn, effect: transicao                                                | alerta                                        | marco | regra` | auditoria |
| `inf.timer.rescheduled`        | `TIMER_REPROGRAMADO`       | `ownerId, timerCode, oldDueOn, newDueOn, suspensionActId (obrigatório, nulo na prorrogação), reason`    | auditoria, SSE                                |

Eventos **consumidos** pela infração (produzidos fora): `AIT_INTEGRADO`, `AIT_CANCELADO_POSFINAL`
(TEAT), `NOTIFICACAO_EXPEDIDA`, `NOTIFICACAO_CIENCIA` (notificação), `CONDUTOR_INDICADO`
(Portal), `PAGAMENTO_CONFIRMADO` (arrecadação) — schemas em `docs/framework/schemas/events/`
(WP-A cria a partir desta tabela).

### 2.5 Eventos das fronteiras (ADR-0016…0019)

ADRs aceitas em 2026-09-13; nomes reservados: `NOTIFICACAO_EXPEDIDA`, `NOTIFICACAO_CIENCIA`
(notificação); `PAGAMENTO_CONFIRMADO`, `PAGAMENTO_ESTORNADO`, `RESTITUICAO_ORDENADA`,
`RESTITUICAO_PAGA`, `COBRANCA_ENCAMINHADA`, `DOCUMENTO_ARRECADACAO_EMITIDO` (arrecadação);
`NIVEL_ASSINATURA_ELEVADO`, `SOLICITACAO_*`, `INBOX_LIDO`, `MANIFESTACAO_*`,
`AVALIACAO_REGISTRADA` (portal). Payloads seguem o envelope da §1 e são detalhados quando o
blueprint correspondente for escrito.

## 3. Fluxo SSE `GET /v1/inf/rait/stream`

- Autenticação: sessão STYNX (bearer via `EventSource` polyfill com header, ou cookie de sessão);
  tenant do principal; **filtro por papel**: o servidor só entrega eventos de agregados que o
  papel pode ler (`inf:rait-<recurso>:read`) e, para `rait-analyst`/`rait-rapporteur`, só dos
  casos atribuídos ao membro ou do pool visível.
- Query: `?topics=case,assignment,clock,session,agenda-item,batch,outbox` (default: todos
  permitidos); `?caseId=`/`?sessionId=` para escopo (tela do caso, sessão ao vivo).
- Formato:

```text
id: 01J8ZK…
event: rait.agenda-item.changed
data: {"aggregate":{"kind":"agenda-item","id":"…","version":5},"data":{…}}

: heartbeat a cada 20 s
```

- Replay: cliente envia `Last-Event-ID`; servidor reenvia, em ordem, os eventos do tenant
  posteriores (janela de 24 h na outbox); além da janela responde `204` e o cliente recarrega.
- Ordenação: por `id` (ULID) dentro do tenant; o cliente descarta evento com `aggregate.version`
  ≤ versão em cache.
- Fallback: se o stream falhar duas vezes em 60 s, o frontend faz polling de 15 s nos recursos
  abertos (`rait-web-frontend.md` §8).
- Limites: 1 conexão por aba; 5 por usuário (429 acima); payload ≤ 8 KB.

## 4. Consumidores externos

| Consumidor       | Eventos                                                                                                  | Entrega                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| senatran-adapter | `inf.infraction.changed` (→ `SituacaoRenainf`, WF-INF-003 §8), `inf.infraction.penalty-final` (→ RENACH) | worker da outbox; recibo em `integration.outbox`; falhas em `/integracoes/falhas` |
| Portal           | `inf.infraction.changed`, `rait.decision.published`, `rait.communication.sent`                           | projeção de leitura do portal (sem vocabulário interno)                           |
| Dashboard        | `rait.clock.flag-changed`, `rait.case.changed`, `rait.session.changed`                                   | projeção agregada                                                                 |
| Auditoria        | tudo                                                                                                     | `audit.events` (hash-chain) via `@Audit` + outbox                                 |

## 5. Contrato de teste

1. Schema zod por `type` em `src/handwritten/events/*.schema.ts`; teste que valida os exemplos
   deste documento e rejeita `data` com campos de texto livre.
2. Teste integration: comando → evento na mesma transação (rollback do comando = sem evento).
3. Teste e2e do stream: conexão com papel `rait-analyst` recebe `rait.case.changed` do caso
   atribuído e **não** recebe de caso de outro pool; `Last-Event-ID` reproduz em ordem.
4. Teste do adapter: `inf.infraction.changed` para cada estado mapeia à `SituacaoRenainf` da tabela
   `infraction_state_ref.renainf_situacao`.
