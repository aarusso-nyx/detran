---
id: DASHBOARD-FEED-TEAT
title: Proposta de feed de eventos do TEAT para o DASHBOARD
status: draft
apps: [dashboard, teat]
updated: 2026-09-22
---

# Proposta de feed de eventos do TEAT para o DASHBOARD

Transcrição (R-0011 TASK-0006, WP-D3). Ao contrário do PEC, o TEAT **já publica** eventos reais consumidos por
`dashboard.teat_measures` (CTG-0001 §4.1.5): `measure.changed`, `alcohol.changed`, `ait.changed`,
`ait.concurrency-suspected`, `custody.event`, `evidence.changed`, `package.published`,
`numbering.reservation.changed`, `device.posture-changed` — todos com schema em
`docs/framework/schemas/events/*.schema.json` (`schemas/README.md`) e produtor em `main`. Esta ficha cobre só o
que falta: indicadores ainda `connected: false` (§1) e as duas propostas transversais (§3, §4).

## 1. Indicadores que dependem do TEAT (CTG-0001 §4.2)

| Indicador    | Projeção                  | `connected` | Motivo quando `false`                                              |
| ------------ | ------------------------- | ----------- | ------------------------------------------------------------------ |
| IND-DASH-108 | `dashboard.teat_measures` | `true`      | — (`measure.changed`: `TERMO_EMITIDO`, `MEDIDA_CONCLUIDA`)         |
| IND-DASH-109 | `dashboard.teat_measures` | `true`      | — (idem)                                                           |
| IND-DASH-110 | `dashboard.teat_measures` | `false`     | ciclo de homologação SENATRAN não publica evento                   |
| IND-DASH-111 | `dashboard.teat_measures` | `false`     | marco fixo 01/01/2027 (roadmap, não evento)                        |
| IND-DASH-311 | `dashboard.teat_measures` | `true`      | — (token do termo x-source-pending, OD-D23)                        |
| IND-DASH-312 | `dashboard.teat_measures` | `true`      | — (idem)                                                           |
| IND-DASH-313 | `dashboard.teat_measures` | `true`      | — (idem)                                                           |
| IND-DASH-314 | `dashboard.teat_measures` | `true`      | — (`T-DASH-PENDING-FLOOR`)                                         |
| IND-DASH-404 | `dashboard.teat_measures` | `true`      | — (`custody.event`, `evidence.changed`)                            |
| IND-DASH-405 | `dashboard.teat_measures` | `false`     | dispositivo × pacote não publicado (OD-D23)                        |
| IND-DASH-406 | `dashboard.teat_measures` | `false`     | capacidade da faixa `AitNumberingRange` não vem no evento (OD-D23) |
| IND-DASH-407 | `dashboard.teat_measures` | `false`     | `eventType` de par não homologado não contratado (OD-D23)          |

Doze indicadores dependem do TEAT; sete já `connected: true`, cinco `false` (110, 111, 405, 406, 407).

## 2. Evento proposto no formato do build pack (§WP-D3) para os cinco `connected: false`

Nenhum evento existente cobre 110, 111, 405, 406 e 407 hoje (§4.1.5). Proposta no mesmo formato de
`pec.deadline.changed` (build pack §WP-D3: `{indicador_id, caso_id, estado_anterior, estado_novo, timestamp,
base_legal}`), **sem nome de `type` fixado em nenhum documento canônico lido** — x-source-pending:

| Campo            | Fonte                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | x-source-pending — nenhum `type` proposto para este feed em CTG-0001/build pack (diferente do PEC, que já tem `pec.deadline.changed` nomeado) |
| `indicadorId`    | um de `IND-DASH-110`, `IND-DASH-111`, `IND-DASH-405`, `IND-DASH-406`, `IND-DASH-407` (80-fixtures-dashboard-catalog.sql)                      |
| `casoId`         | x-source-pending — id do dispositivo/faixa/pacote no TEAT; fora da lista de leitura fechada desta tarefa                                      |
| `estadoAnterior` | x-source-pending                                                                                                                              |
| `estadoNovo`     | x-source-pending                                                                                                                              |
| `timestamp`      | ISO 8601 UTC                                                                                                                                  |
| `baseLegal`      | x-source-pending                                                                                                                              |

```json
{
  "type": "x-source-pending",
  "aggregate": {
    "kind": "x-source-pending",
    "id": "x-source-pending",
    "version": 1
  },
  "data": {
    "indicadorId": "IND-DASH-405",
    "casoId": "x-source-pending",
    "estadoAnterior": "x-source-pending",
    "estadoNovo": "x-source-pending",
    "timestamp": "2026-09-22T12:00:00Z",
    "baseLegal": "x-source-pending"
  }
}
```

Nenhum prazo prometido para os cinco indicadores acima passarem a `connected: true`.

## 3. `source.heartbeat` proposto (OD-D07, build pack §4)

Fonte do TEAT no seed: `teat.offline-sync` (`81-fixtures-dashboard-state.sql`, `dashboard.source` id
`00000000-0000-7000-8000-000081000402`, estado `ATRASADO`, `heartbeat_contract = 'source.heartbeat'` já marcado).

```json
{
  "type": "source.heartbeat",
  "aggregate": {
    "kind": "source",
    "id": "00000000-0000-7000-8000-000081000402",
    "version": "x-source-pending"
  },
  "data": {
    "sourceKey": "teat.offline-sync",
    "app": "teat",
    "observedAt": "2026-09-22T12:00:00Z"
  }
}
```

## 4. Evento de ciência/ACK (OD-D05)

Como em `pec.md` §4: nenhuma forma de evento de ciência nativo do TEAT foi fixada em documento canônico —
x-source-pending. Enquanto isso, o reconhecimento é o comando manual do DASHBOARD
(`POST /v1/dashboard/alerts/{id}/ack`, `{ channel: 'manual' }`, `dashboardAlertAck`). Sem prazo prometido.
