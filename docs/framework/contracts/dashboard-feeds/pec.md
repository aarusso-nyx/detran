---
id: DASHBOARD-FEED-PEC
title: Proposta de feed de eventos do PEC para o DASHBOARD
status: draft
apps: [dashboard, pec]
updated: 2026-09-22
---

# Proposta de feed de eventos do PEC para o DASHBOARD

Transcrição (R-0011 TASK-0006, WP-D3). O PEC **não publica eventos hoje** (`dashboard-route-contract.md` §7:
"eventos do ciclo de junta/recurso, prazos por instância, pendências da Junta Especial"; CTG-0001 §4.1.4: "o PEC
não publica eventos"). Tudo abaixo é proposta — nenhum prazo prometido; o Owner/time PEC decide.

## 1. Indicadores que dependem do PEC (CTG-0001 §4.2)

| Indicador    | Projeção                  | `connected` | Motivo quando `false`                                           |
| ------------ | ------------------------- | ----------- | --------------------------------------------------------------- |
| IND-DASH-106 | `dashboard.pec_deadlines` | `false`     | PEC não publica eventos                                         |
| IND-DASH-107 | `dashboard.pec_deadlines` | `false`     | PEC não publica eventos                                         |
| IND-DASH-306 | `dashboard.pec_deadlines` | `false`     | PEC não publica eventos                                         |
| IND-DASH-307 | `dashboard.pec_deadlines` | `false`     | PEC não publica eventos                                         |
| IND-DASH-308 | `dashboard.pec_deadlines` | `false`     | PEC não publica eventos                                         |
| IND-DASH-309 | `dashboard.pec_deadlines` | `false`     | PEC não publica eventos; `T-DASH-PENDING-FLOOR` (CTG-0001 §4.2) |

Seis dos 42 indicadores do catálogo dependem só do PEC; nenhum está `connected` hoje.

## 2. Evento proposto — `pec.deadline.changed` (CTG-0001 §4.1.4; build pack §WP-D3)

Já **nomeado e com forma fixada** por `CTG-0001.md` §4.1.4 (não é uma nova proposta desta ficha — transcrito):

- `type`: `pec.deadline.changed`
- `aggregate.kind`: `exam-process` (proposta, CTG-0001 §4.1.4)
- `version`: `1`
- `data` (formato `{indicador_id, caso_id, estado_anterior, estado_novo, timestamp, base_legal}` do build pack
  §WP-D3, em camelCase no envelope): `{ indicadorId, casoId, estadoAnterior, estadoNovo, timestamp, baseLegal }`

| Campo            | Fonte                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `indicadorId`    | um de `IND-DASH-106`, `IND-DASH-107`, `IND-DASH-306`…`IND-DASH-309` (80-fixtures-dashboard-catalog.sql); outro valor → `ignored: not_relevant` (CTG-0001 §4.1.4) |
| `casoId`         | x-source-pending — id do processo/recurso no PEC; fora da lista de leitura fechada desta tarefa (nenhum fixture do PEC foi lido)                                 |
| `estadoAnterior` | x-source-pending — token de estado do PEC (CTG-0001 §4.1.4: "tokens do PEC (sem check)")                                                                         |
| `estadoNovo`     | x-source-pending — idem                                                                                                                                          |
| `timestamp`      | ISO 8601 UTC, momento da transição no PEC                                                                                                                        |
| `baseLegal`      | x-source-pending — a forma de WP-D3 não fixa um valor; `due_on` da projeção fica nulo (CTG-0001 §4.1.4, OD-D20)                                                  |

Exemplo ilustrativo (`indicadorId` de fixture; os demais campos são x-source-pending, nenhum valor inventado):

```json
{
  "type": "pec.deadline.changed",
  "domainEvent": "PEC.deadline.changed",
  "aggregate": {
    "kind": "exam-process",
    "id": "x-source-pending",
    "version": 1
  },
  "data": {
    "indicadorId": "IND-DASH-106",
    "casoId": "x-source-pending",
    "estadoAnterior": "x-source-pending",
    "estadoNovo": "x-source-pending",
    "timestamp": "2026-09-22T12:00:00Z",
    "baseLegal": "x-source-pending"
  }
}
```

`domainEvent` acima também é x-source-pending: nem CTG-0001 nem o build pack fixam o token de domínio deste
evento proposto (só o `type` técnico `pec.deadline.changed`); registrado aqui como lacuna, não decisão.

## 3. `source.heartbeat` proposto (OD-D07, build pack §4)

Genérico a todas as fontes (`dashboard-build-pack.md` OD-D07: "evento `source.heartbeat` a cada latência
aceitável/2; ausência = `ATRASADO`"). Fonte do PEC no seed: `pec.deadlines` (`81-fixtures-dashboard-state.sql`,
`dashboard.source` id `00000000-0000-7000-8000-000081000403`, estado `INDISPONIVEL`, sem `heartbeat_contract`).

```json
{
  "type": "source.heartbeat",
  "aggregate": {
    "kind": "source",
    "id": "00000000-0000-7000-8000-000081000403",
    "version": "x-source-pending"
  },
  "data": {
    "sourceKey": "pec.deadlines",
    "app": "pec",
    "observedAt": "2026-09-22T12:00:00Z"
  }
}
```

Sem `heartbeat_contract` publicado hoje (`dashboard.source.heartbeat_contract` nulo no seed) — `DASH.SOURCE_HEARTBEAT_UNDEFINED`
enquanto o PEC não fixar um contrato ([WF-DASH-003]).

## 4. Evento de ciência/ACK (OD-D05)

`dashboard-build-pack.md` OD-D05: "ACK manual rotulado até existir; contrato proposto em WP-D3". Este documento
**não** propõe um novo `type` de evento de ciência do PEC (nenhuma forma foi fixada em nenhum documento canônico
lido) — enquanto isso, o reconhecimento é o comando manual do próprio DASHBOARD (`POST /v1/dashboard/alerts/{id}/ack`,
`{ channel: 'manual', note }`, `BP-DASH-MONITOR-001.commands.openapi.json` `dashboardAlertAck`). A forma de um
evento de ciência nativo do PEC fica **x-source-pending**; sem prazo prometido.
