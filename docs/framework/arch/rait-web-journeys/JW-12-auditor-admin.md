# JW-12 — Auditor (`AUDITOR`) e administrador do órgão (`agency-admin`)

Origem: `UC-RAIT-022`, `UC-RAIT-042`, `UC-RAIT-043`, `RN-RAIT-133`…`RN-RAIT-137`. Rotas
`/auditoria/*`, `/arquivo/*` (leitura), `/admin/*`.

## Auditor — somente leitura

| #   | Rota                                   | Ação                                                         | Comando                   | Efeito                                   | Erros                                                     |
| --- | -------------------------------------- | ------------------------------------------------------------ | ------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| 1   | `/auditoria/trilha`                    | trilha por caso ou período (`EventTimeline`, `audit.events`) | `GET events`, `GET audit` | —                                        | `AUDIT_RANGE_TOO_WIDE`                                    |
| 2   | `/auditoria/exportacoes`               | exportação com finalidade; nominal em massa exige DPO        | `rait-export:create`      | arquivo assinado; registro da exportação | `EXPORT_PURPOSE_REQUIRED`, `EXPORT_DPO_APPROVAL_REQUIRED` |
| 3   | `/arquivo/busca`, `/arquivo/casos/:id` | consulta dossiê selado (terceiros suprimidos)                | `GET`                     | —                                        | —                                                         |

## Administrador do órgão

| #   | Rota                    | Ação                                                                                                                   | Comando                      | Efeito                               | Erros                                                                                   |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| 4   | `/admin/parametros`     | edita parâmetros operacionais versionados (WIP, lotes, escada, T-VOTO…); prazos legais somente leitura; simula impacto | `rait-parameter:update`      | nova versão com vigência             | `PARAMETER_LEGAL_READONLY`, `PARAMETER_EFFECTIVE_DATE_PAST`, `PARAMETER_SOURCE_PENDING` |
| 5   | `/admin/calendario`     | feriados nacional + AM                                                                                                 | `PUT calendar`               | vencimentos recalculados pelo motor  | `CALENDAR_OVERLAP`                                                                      |
| 6   | `/admin/atos/suspensao` | ato de força maior: casos, período, fundamento, prova (assinado pela autoridade/presidente)                            | `rait-suspension-act:create` | vencimentos reprogramados com trilha | `SUSPENSION_LEGAL_TIMER`, `SUSPENSION_EVIDENCE_REQUIRED`                                |
| 7   | `/organizacao/pools`    | pools e estratégias                                                                                                    | `PATCH pools`                | —                                    | `POOL_*`                                                                                |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j12-auditor-admin-telas -->

```mermaid
flowchart TB
    subgraph aud["AUDITOR — somente leitura"]
        trilha["/auditoria/trilha — EventTimeline por caso/período"] --> exp["/auditoria/exportacoes — ExportRequestForm"]
        exp --> g1{"finalidade informada?"}
        g1 -->|não| e1["EXPORT_PURPOSE_REQUIRED"] --> exp
        g1 -->|sim| g2{"nominal em massa?"}
        g2 -->|"sim"| dpo["aprovação do DPO"] --> arq(("arquivo assinado + registro"))
        g2 -->|não| arq
        busca["/arquivo/busca → /arquivo/casos/:id — dossiê selado"]
    end
    subgraph adm["agency-admin"]
        par["/admin/parametros — ParameterEditor (versionado)"] --> g3{"parâmetro legal?"}
        g3 -->|sim| e2["PARAMETER_LEGAL_READONLY"]
        g3 -->|não| sim["ImpactSimulator"] --> nova(("nova versão com vigência"))
        cal["/admin/calendario — feriados nacional + AM"] --> rec["motor recalcula vencimentos"]
        susp["/admin/atos/suspensao — SuspensionActForm"] --> g4{"timer de extinção?"}
        g4 -->|sim| e3["SUSPENSION_LEGAL_TIMER"]
        g4 -->|não| ato(("ato assinado — vencimentos reprogramados, trilha"))
    end
```

[Renderizado: ARCH-RAIT-WEB-j12-auditor-admin-telas.svg](../diagrams/ARCH-RAIT-WEB-j12-auditor-admin-telas.svg)

## Sequência: exportação com controle LGPD

<!-- svg: ARCH-RAIT-WEB-j12-auditor-admin-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant A as Auditor (UI)
    participant F as AuditFacade
    participant API as /v1/inf/rait
    participant E as exportações (pendente)
    participant D as DPO
    participant ST as storage / assinatura
    A->>F: exportar recorte (finalidade, período, campos)
    F->>API: POST exports {purpose, scope}
    API->>E: conta linhas nominais
    alt acima do limiar
        E-->>API: 422 EXPORT_DPO_APPROVAL_REQUIRED {rowCount, threshold}
        API-->>F: 422
        F-->>A: pedido enviado ao DPO
        D->>API: POST exports/{id}/approve
    end
    E->>ST: gera arquivo, suprime terceiros, assina
    ST-->>E: storage_key, signature_ref
    E-->>API: export pronta · audit.events registra finalidade e escopo
    API-->>F: 200 {downloadUrl (assinada, expira)}
```

[Renderizado: ARCH-RAIT-WEB-j12-auditor-admin-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j12-auditor-admin-sequencia.svg)
