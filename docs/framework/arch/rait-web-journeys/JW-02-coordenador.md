# JW-02 — Coordenador e subcoordenador da defesa prévia (`rait-coordinator`)

Origem: `WF-RAIT-004` §3-§4, `UC-RAIT-011`, `UC-RAIT-013`, `UC-RAIT-025`, `UC-RAIT-038`. Telas T-01,
T-02 (visão do pool), T-14/T-15 (leitura), escala, qualidade, capacidade.

## Passos

| #   | Rota                               | Ação                                                                             | Comando                        | Efeito                                                 | Erros                                                                   |
| --- | ---------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1   | `/organizacao/escala`              | monta a escala semanal: dias/turnos, ausências, meta, `WIP`; designa plantonista | `rait-schedule:publish`        | membros `DISPONIVEL`/`EM_PLANTAO`/`AUSENTE_PROGRAMADO` | `SCHEDULE_NO_DUTY_MEMBER`, `SCHEDULE_PERIOD_LOCKED`                     |
| 2   | `/organizacao/pools`               | ajusta estratégia (`pull`) e limites do pool `defesa_previa`                     | `PATCH pools/{id}`             | parâmetros do pool                                     | `POOL_STRATEGY_INVALID`, `POOL_INSTANCE_DUPLICATE`                      |
| 3   | `/gestao/radar` (plantão de risco) | recebe `ALERTA_N2`+ do pool, diligências vencidas, parados                       | `rait-clock:acknowledge-alert` | alerta reconhecido                                     | `CLOCK_ALERT_ROLE_MISMATCH`                                             |
| 4   | `/gestao/radar/:caseId`            | reatribui com motivo tipado (afastamento, rebalanceamento, risco)                | `rait-assignment:reassign`     | novo responsável; nunca ao impedido                    | `REASSIGN_REASON_REQUIRED`, `REASSIGN_TO_SAME_MEMBER`, `MEMBER_IMPEDED` |
| 5   | `/gestao/qualidade`                | revisa amostra de 5% das decisões assinadas; registra achado                     | `rait-quality-sample:review`   | achado registrado; não reabre decisão (C.22)           | —                                                                       |
| 6   | `/gestao/capacidade`               | projeta fila × capacidade; simula; publica plano; pede reforço                   | `rait-capacity-plan:publish`   | plano do período; gatilho de turma ao gestor           | —                                                                       |
| 7   | `/gestao/producao`                 | acompanha tempo por fase e aderência ao SLA local                                | `GET` indicadores              | —                                                      | —                                                                       |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j02-coordenador-telas -->

```mermaid
flowchart TB
    esc["/organizacao/escala — semana, ausências, WIP, plantonista"] -->|publicar| g1{"plantonista em todo dia útil?"}
    g1 -->|não| e1["erro SCHEDULE_NO_DUTY_MEMBER"] --> esc
    g1 -->|sim| pub["escala publicada — elegibilidade atualizada"]
    pub --> radar["/gestao/radar — plantão de risco: N2+, diligências vencidas, parados"]
    radar --> drill["/gestao/radar/:caseId — causa do atraso"]
    drill -->|reatribuir| re{"motivo tipado e novo responsável elegível?"}
    re -->|não| e2["REASSIGN_* / MEMBER_IMPEDED"] --> drill
    re -->|sim| ok["assignment liberado e novo criado — estado do caso inalterado"]
    radar --> qual["/gestao/qualidade — amostra 5% (F-DP-Q)"]
    qual --> ach["achado registrado (treinamento / recurso de ofício) — decisão não reabre"]
    radar --> cap["/gestao/capacidade — projeção e simulação"]
    cap -->|"fila > capacidade 3 meses"| ges(("gatilho de nova turma → gestor (JW-09)"))
    cap --> prod["/gestao/producao — tempo por fase, SLA-30"]
```

[Renderizado: ARCH-RAIT-WEB-j02-coordenador-telas.svg](../diagrams/ARCH-RAIT-WEB-j02-coordenador-telas.svg)

## Sequência: reatribuição por risco

<!-- svg: ARCH-RAIT-WEB-j02-coordenador-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant C as Coordenador (UI)
    participant F as RadarFacade
    participant API as /v1/inf/rait
    participant W as rait-worklist
    participant S as SSE
    S-->>F: clock.flag-changed (ALERTA_N2, relógio A)
    F-->>C: linha sobe no radar, "faltam N dias"
    C->>F: abrir drill-down, reatribuir (motivo=risco_prescricao)
    F->>API: PATCH assignments/{id} (release) + POST assignments (If-Match)
    API->>W: guarda: novo membro DISPONIVEL, sem impedimento, WIP < limite
    W-->>API: assignment anterior inativo, novo ativo
    API-->>F: 200 {assignment}
    S-->>F: assignment.changed
    F-->>C: novo responsável exibido · evento na trilha do caso
```

[Renderizado: ARCH-RAIT-WEB-j02-coordenador-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j02-coordenador-sequencia.svg)
