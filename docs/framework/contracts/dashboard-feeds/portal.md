---
id: DASHBOARD-FEED-PORTAL
title: Proposta de feed de eventos do Portal para o DASHBOARD
status: draft
apps: [dashboard, portal]
updated: 2026-09-22
---

# Proposta de feed de eventos do Portal para o DASHBOARD

Transcrição (R-0011 TASK-0006, WP-D3). O Portal já publica `SOLICITACAO_CRIADA`, `SOLICITACAO_PROTOCOLADA`,
`SOLICITACAO_DESISTIDA`, `SOLICITACAO_CONCLUIDA`, `MANIFESTACAO_REGISTRADA`, `MANIFESTACAO_ENCERRADA`,
`AVALIACAO_REGISTRADA` (`portal-route-contract.md` §10; CTG-0001 §4.1.6), mas **os payloads não estão publicados**
como schema (`rait-events-sse-contract.md` §2.5: "payloads detalhados quando o blueprint for escrito"; CTG-0001
§4.1.6, OD-D21: a transcrição de `backend/domains/portal/*/src/handwritten/events.ts` cabe a TASK-0010/TASK-0006 de
uma rodada futura do Portal). `NOTIFICACAO_*` (indicador 208) não tem produtor (OD-P28).

## 1. Indicadores que dependem do Portal (CTG-0001 §4.2)

| Indicador    | Projeção                           | `connected` | Motivo quando `false`                                                            |
| ------------ | ---------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| IND-DASH-206 | `dashboard.portal_service_metrics` | `false`     | publicação do relatório anual não é evento do Portal                             |
| IND-DASH-207 | `dashboard.portal_service_metrics` | `true`      | — (`AVALIACAO_REGISTRADA`; publicação do ranking é evidência de dever, CTG-0002) |
| IND-DASH-208 | `dashboard.portal_service_metrics` | `false`     | `NOTIFICACAO_*` sem produtor (OD-P28)                                            |
| IND-DASH-209 | `NULL`                             | `false`     | checklist auditado pelo próprio DASHBOARD (estado próprio, CTG-0002)             |
| IND-DASH-301 | `dashboard.portal_service_metrics` | `true`      | — (`MANIFESTACAO_REGISTRADA`, `MANIFESTACAO_ENCERRADA`)                          |
| IND-DASH-302 | `dashboard.portal_service_metrics` | `false`     | resposta interna do agente não publicada (OD-P18, no PORTAL)                     |
| IND-DASH-303 | `dashboard.portal_service_metrics` | `false`     | `serviceKey` de pedido LAI não contratado (OD-D21)                               |

Sete indicadores dependem do Portal; dois já `connected: true` (207, 301), cinco `false`.

## 2. Evento proposto no formato do build pack (§WP-D3) para os cinco `connected: false`

Diferente do PEC (nenhum evento) e do TEAT (eventos existem, só faltam payloads catalogados), 206/208/209/302/303
não têm produtor algum hoje (209 é estado próprio do DASHBOARD, fora deste feed). Proposta no formato de
`pec.deadline.changed` para 206, 208, 302 e 303:

| Campo            | Fonte                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `type`           | x-source-pending — nenhum `type` proposto para este feed em CTG-0001/build pack                          |
| `indicadorId`    | um de `IND-DASH-206`, `IND-DASH-208`, `IND-DASH-302`, `IND-DASH-303` (80-fixtures-dashboard-catalog.sql) |
| `casoId`         | x-source-pending — id do pedido/manifestação no Portal; fora da lista de leitura fechada desta tarefa    |
| `estadoAnterior` | x-source-pending                                                                                         |
| `estadoNovo`     | x-source-pending                                                                                         |
| `timestamp`      | ISO 8601 UTC                                                                                             |
| `baseLegal`      | x-source-pending                                                                                         |

```json
{
  "type": "x-source-pending",
  "aggregate": {
    "kind": "x-source-pending",
    "id": "x-source-pending",
    "version": 1
  },
  "data": {
    "indicadorId": "IND-DASH-303",
    "casoId": "x-source-pending",
    "estadoAnterior": "x-source-pending",
    "estadoNovo": "x-source-pending",
    "timestamp": "2026-09-22T12:00:00Z",
    "baseLegal": "x-source-pending"
  }
}
```

IND-DASH-209 fica de fora desta proposta: é estado próprio do DASHBOARD (`transparency_audit`, sem projeção —
CTG-0001 §4.2), não um evento a receber do Portal. Nenhum prazo prometido para 206/208/302/303.

## 3. `source.heartbeat` proposto (OD-D07, build pack §4)

Sem linha própria em `81-fixtures-dashboard-state.sql` (as quatro fontes seedadas são `rait.outbox`,
`teat.offline-sync`, `pec.deadlines`, `boat.crashes`). A2.1 item 4 do plano registra que `portal.outbox` (e
`dashboard`) ficam ausentes do seed 81 e são inseridas pela suíte de superfície como `FRESCO` — `source_key`
proposto aqui, x-source-pending quanto ao id de `dashboard.source`:

```json
{
  "type": "source.heartbeat",
  "aggregate": {
    "kind": "source",
    "id": "x-source-pending",
    "version": "x-source-pending"
  },
  "data": {
    "sourceKey": "portal.outbox",
    "app": "portal",
    "observedAt": "2026-09-22T12:00:00Z"
  }
}
```

## 4. Evento de ciência/ACK (OD-D05)

Como em `pec.md` §4 e `teat.md` §4: nenhuma forma de evento de ciência nativo do Portal foi fixada em documento
canônico — x-source-pending. Enquanto isso, o reconhecimento é o comando manual do DASHBOARD
(`POST /v1/dashboard/alerts/{id}/ack`, `{ channel: 'manual' }`, `dashboardAlertAck`). Sem prazo prometido.
