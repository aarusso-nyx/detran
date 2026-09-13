# JW-11 — Operador de integração (`integration-operator`)

Origem: `UC-RAIT-029`, `UC-RAIT-030`, `UC-RAIT-031`, `WF-INF-003` §8, ADR-0003. Rotas
`/integracoes/*`. O browser nunca fala com RENAINF/RENACH/SNE: tudo passa pelo senatran-adapter e
pela outbox do kernel (`integration.outbox`).

## Passos

| #   | Rota                   | Ação                                                                 | Comando                      | Efeito                                   | Erros                                                             |
| --- | ---------------------- | -------------------------------------------------------------------- | ---------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| 1   | `/integracoes/renainf` | espelhamento por infração: estado local × `SituacaoRenainf`, recibos | `GET outbox?system=renainf`  | —                                        | —                                                                 |
| 2   | `/integracoes/renach`  | penalidades definitivas enviadas, estornos                           | `GET outbox?system=renach`   | —                                        | —                                                                 |
| 3   | `/integracoes/falhas`  | retransmite item falho                                               | `rait-integration:retry`     | item reenfileirado; recibo               | `RETRY_NOT_FAILED`, `UPSTREAM_REJECTED`, `UPSTREAM_*_UNAVAILABLE` |
| 4   | idem                   | concilia divergência (local × nacional) com decisão registrada       | `rait-integration:reconcile` | divergência fechada; evento de auditoria | `RECONCILIATION_DIVERGENCE` (exige decisão)                       |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j11-operador-integracao-telas -->

```mermaid
flowchart TB
    renainf["/integracoes/renainf — RenainfMirrorPage: estado local × SituacaoRenainf, recibos"]
    renach["/integracoes/renach — penalidades definitivas, estornos"]
    falhas["/integracoes/falhas — RetryQueueTable"]
    renainf --> falhas
    renach --> falhas
    falhas --> d{"tipo da falha"}
    d -->|"indisponível (503)"| retry["retransmitir — item reenfileirado"] --> ok(("recibo registrado"))
    d -->|"rejeitado (502)"| corr["corrigir na origem (caso / infração) e retransmitir"] --> retry
    d -->|"divergência de estado"| diff["ReconciliationDiff — local × nacional"]
    diff --> dec{"decisão do operador"}
    dec -->|"local prevalece"| re["reenvio do estado local"] --> ok
    dec -->|"nacional prevalece"| inc["incidente ao gestor — nunca altera a máquina local pela UI"]
```

[Renderizado: ARCH-RAIT-WEB-j11-operador-integracao-telas.svg](../diagrams/ARCH-RAIT-WEB-j11-operador-integracao-telas.svg)

## Sequência: retransmissão e conciliação

<!-- svg: ARCH-RAIT-WEB-j11-operador-integracao-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant O as Operador (UI)
    participant F as IntegrationsFacade
    participant API as /v1/inf/rait
    participant OB as integration.outbox
    participant AD as senatran-adapter
    participant R as RENAINF
    O->>F: retransmitir item falho
    F->>API: POST integrations/outbox/{id}/retry
    API->>OB: status FAILED → PENDING
    OB->>AD: entrega (IntegrationContext)
    AD->>R: espelho (SituacaoRenainf)
    alt aceito
        R-->>AD: recibo
        AD-->>OB: DELIVERED + recibo
    else rejeitado
        R-->>AD: código nacional
        AD-->>OB: FAILED (UPSTREAM_REJECTED, upstreamCode)
    end
    API-->>F: 202 {outboxId}
    OB-->>F: SSE (outbox.changed) — status e recibo
```

[Renderizado: ARCH-RAIT-WEB-j11-operador-integracao-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j11-operador-integracao-sequencia.svg)
