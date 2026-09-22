---
id: DASHBOARD-FEED-ADAPTER
title: Proposta de feed de eventos do adapter SENATRAN para o DASHBOARD
status: draft
apps: [dashboard]
updated: 2026-09-22
---

# Proposta de feed de eventos do adapter SENATRAN para o DASHBOARD

Transcrição (R-0011 TASK-0006, WP-D3). `packages/senatran-adapter` é a única fronteira para sistemas nacionais
(ADR-0003); a projeção `dashboard.integration_health` consome hoje só `sync.batch.received`
(`schemas/events/sync.batch.received.schema.json`, produtor `ops/offline-sync` — **não** o adapter em si; CTG-0001
§4.1.3). "Status da outbox, `UPSTREAM_*` e telemetria do adapter não são eventos publicados"
(`dashboard-route-contract.md` §7: "latência e erro por sistema nacional"; CTG-0001 §4.1.3, OD-D22) — nada a
transcrever além do que segue, sem inventar.

## 1. Indicadores que dependem do adapter (CTG-0001 §4.2)

| Indicador    | Projeção                       | `connected` | Motivo quando `false`                                                                      |
| ------------ | ------------------------------ | ----------- | ------------------------------------------------------------------------------------------ |
| IND-DASH-401 | `dashboard.integration_health` | `false`     | status da outbox não é evento (OD-D22)                                                     |
| IND-DASH-402 | `dashboard.integration_health` | `false`     | idade do lote pendente não é publicada (OD-D22); só `sync.batch.received` (auxiliar) chega |
| IND-DASH-403 | `dashboard.integration_health` | `false`     | adapter sem telemetria publicada                                                           |

Três indicadores dependem do adapter; nenhum está `connected` hoje.

## 2. Evento proposto no formato do build pack (§WP-D3)

Como no PEC (nenhum evento próprio do adapter existe), proposta no mesmo formato:

| Campo            | Fonte                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `type`           | x-source-pending — nenhum `type` proposto para este feed em CTG-0001/build pack                                |
| `indicadorId`    | um de `IND-DASH-401`, `IND-DASH-402`, `IND-DASH-403` (80-fixtures-dashboard-catalog.sql)                       |
| `casoId`         | x-source-pending — id da requisição/sistema nacional no adapter; fora da lista de leitura fechada desta tarefa |
| `estadoAnterior` | x-source-pending                                                                                               |
| `estadoNovo`     | x-source-pending                                                                                               |
| `timestamp`      | ISO 8601 UTC                                                                                                   |
| `baseLegal`      | x-source-pending                                                                                               |

```json
{
  "type": "x-source-pending",
  "aggregate": {
    "kind": "x-source-pending",
    "id": "x-source-pending",
    "version": 1
  },
  "data": {
    "indicadorId": "IND-DASH-403",
    "casoId": "x-source-pending",
    "estadoAnterior": "x-source-pending",
    "estadoNovo": "x-source-pending",
    "timestamp": "2026-09-22T12:00:00Z",
    "baseLegal": "x-source-pending"
  }
}
```

Sem prazo prometido.

## 3. `source.heartbeat` proposto (OD-D07, build pack §4)

Sem `source_key` de adapter em `80-fixtures-dashboard-catalog.sql`/`81-fixtures-dashboard-state.sql` (as quatro
fontes seedadas são `rait.outbox`, `teat.offline-sync`, `pec.deadlines`, `boat.crashes`) — x-source-pending por
completo (nenhum `sourceKey` canônico do adapter foi lido em nenhum documento desta lista fechada):

```json
{
  "type": "source.heartbeat",
  "aggregate": {
    "kind": "source",
    "id": "x-source-pending",
    "version": "x-source-pending"
  },
  "data": {
    "sourceKey": "x-source-pending",
    "app": "x-source-pending",
    "observedAt": "2026-09-22T12:00:00Z"
  }
}
```

## 4. Evento de ciência/ACK (OD-D05)

Não se aplica no mesmo sentido dos apps de origem com ator humano: o adapter é uma fronteira técnica
(`packages/senatran-adapter`), não um app com operador que reconhece uma pendência de negócio. Registrado aqui
por completude do formato do build pack: nenhuma forma de evento de ciência do adapter foi fixada em documento
canônico — x-source-pending. Enquanto isso, alertas de indicadores 401-403 seguem o ciclo padrão do DASHBOARD
(`POST /v1/dashboard/alerts/{id}/ack`, `{ channel: 'manual' }`, `dashboardAlertAck`, dono `technical-admin`/`integration-operator`).
