# JW-09 — Gestor RAIT (`rait-manager`)

Origem: `JRN-RAIT-004`, `UC-RAIT-010`, `UC-RAIT-011`, `UC-RAIT-023`, `UC-RAIT-038`, `UC-RAIT-039`,
`UC-RAIT-040`. Telas T-14, T-15; rotas `/gestao/*`, `/integracoes/*` (leitura).

## Passos

| #   | Rota                       | Ação                                                                                            | Comando                                                                          | Efeito                                                        | Erros                                                        |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | `/gestao/radar`            | segmenta por relógio (A/B/C/D), pool, nível; dias restantes por linha                           | `GET clocks?flag>=ALERTA_N1`; SSE                                                | —                                                             | —                                                            |
| 2   | `/gestao/radar/:caseId`    | causa do atraso; reatribuir, priorizar em pauta, escalar ao presidente, abrir incidente         | `rait-assignment:reassign`, `rait-incident:open`, `rait-clock:acknowledge-alert` | ação registrada no caso                                       | `REASSIGN_*`, `CLOCK_ALERT_ALREADY_ACKNOWLEDGED`             |
| 3   | `/gestao/incidentes`       | `PRESCRITO_OPERACIONAL`: declara extinção de ofício com a autoridade/presidente; abre incidente | `rait-extinction:declare`                                                        | infração `EXTINTO_PRESCRICAO`/`EXTINTO_DECADENCIA`; incidente | `EXTINCTION_CEILING_NOT_REACHED`, `EXTINCTION_DECISION_LATE` |
| 4   | `/gestao/producao`         | tempo por fase, SLA local, taxa de provimento por enquadramento; relatório ao TEAT              | `GET` indicadores; `rait-export:create` (via auditor)                            | relatório de problemas sistemáticos                           | —                                                            |
| 5   | `/gestao/capacidade`       | projeção, plano, pedido de reforço                                                              | `rait-capacity-plan:publish`                                                     | plano                                                         | —                                                            |
| 6   | `/gestao/turmas`           | constitui nova turma/JARI; designa coordenador; ativa                                           | `rait-unit:constitute` / `activate`                                              | `TURMA_EM_CONSTITUICAO` → `TURMA_ATIVA`                       | `UNIT_TRIGGER_NOT_MET`, `UNIT_COORDINATOR_REQUIRED`          |
| 7   | `/integracoes/*` (leitura) | acompanha filas e divergências                                                                  | `GET`                                                                            | —                                                             | —                                                            |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j09-gestor-telas -->

```mermaid
flowchart TB
    radar["/gestao/radar  T-14 — relógios A/B/C/D × pool × nível"] --> drill["/gestao/radar/:caseId  T-15 — causa do atraso"]
    drill --> a1["reatribuir (motivo tipado)"]
    drill --> a2["priorizar em pauta → presidente"]
    drill --> a3["escalar ao presidente / coordenador"]
    drill --> a4["abrir incidente"]
    radar -->|"PRESCRITO_OPERACIONAL"| inc["/gestao/incidentes"]
    inc --> g{"teto atingido?"}
    g -->|não| e["EXTINCTION_CEILING_NOT_REACHED"] --> inc
    g -->|sim| ext(("declarar extinção de ofício — EXTINTO_PRESCRICAO / EXTINTO_DECADENCIA + incidente"))
    radar --> prod["/gestao/producao — fases, SLA-30, provimento por enquadramento"]
    prod --> teat["relatório de problemas sistemáticos → TEAT"]
    prod --> cap["/gestao/capacidade — projeção e plano"]
    cap -->|"fila > capacidade 3 meses"| turmas["/gestao/turmas — UnitWizard"]
    turmas -->|"coordenador designado, membros nomeados"| ativa(("TURMA_ATIVA"))
```

[Renderizado: ARCH-RAIT-WEB-j09-gestor-telas.svg](../diagrams/ARCH-RAIT-WEB-j09-gestor-telas.svg)

## Sequência: radar → drill-down → declarar extinção

<!-- svg: ARCH-RAIT-WEB-j09-gestor-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant M as Gestor (UI)
    participant F as RadarFacade
    participant API as /v1/inf/rait
    participant W as rait-worklist (clocks)
    participant I as infração
    participant AU as Autoridade / presidente
    W-->>F: SSE clock.flag-changed (CRITICO → PRESCRITO_OPERACIONAL, relógio B)
    F-->>M: incidente obrigatório no radar
    M->>F: abrir incidente, reconhecer alerta
    F->>API: PATCH clock-alerts/{id} (acknowledged) + POST incidents
    API-->>F: 200
    M->>AU: solicita declaração de ofício
    AU->>API: POST infractions/{id}/commands/declare-extinction (If-Match)
    API->>I: guarda: T-JUL-24M vencido, recurso não julgado
    I-->>I: RECURSO_*_INSTANCIA → EXTINTO_PRESCRICAO · TIMER_VENCIDO, INFRACAO_ESTADO_ALTERADO
    API-->>AU: 200
    I-->>F: SSE case.changed / clock.flag-changed
    F-->>M: caso sai do radar · incidente vinculado à extinção
```

[Renderizado: ARCH-RAIT-WEB-j09-gestor-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j09-gestor-sequencia.svg)
