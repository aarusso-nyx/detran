# JW-03 — Secretaria: protocolo e intake multicanal (`rait-secretary`)

Origem: `JRN-RAIT-003`, `UC-RAIT-001`, `UC-RAIT-012`, `UC-RAIT-017`, `UC-RAIT-027`, `UC-RAIT-028`.
Telas T-08, T-17; rotas `/protocolo/*`.

## Passos

| #   | Rota                           | Ação                                                                                           | Comando                                         | Efeito                                                          | Erros                                                                                                                             |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/protocolo`                   | lista do intake do dia (balcão 8h-14h, postal, portal)                                         | `GET cases?state=PROTOCOLADO`                   | —                                                               | —                                                                                                                                 |
| 2   | `/protocolo/novo`              | assistente: canal e marco → partes e legitimidade → documentos digitalizados → conteúdo mínimo | `rait-case:protocol`                            | `[PROTOCOLADO]`, protocolo exibido no ato                       | `INTAKE_MULTIPLE_AIT`, `INTAKE_DUPLICATE_INSTANCE`, `INTAKE_CHANNEL_MARK_MISSING`, `DOCUMENT_INVALID`, `PARTY_LEGITIMACY_INVALID` |
| 3   | `/protocolo/pendencias`        | abre pendência de conteúdo com prazo; registra juntadas datadas                                | `rait-case:resolve-pending-content`             | pendência fechada sem consumir prazo                            | `PENDING_CONTENT_EXPIRED`                                                                                                         |
| 4   | `/protocolo/redirecionamentos` | peça de outro órgão: redireciona com devolução de prazo                                        | `rait-case:redirect`                            | caso encerrado por redirecionamento; ofício gerado              | `REDIRECT_SAME_BODY`                                                                                                              |
| 5   | `/protocolo/remessas`          | F-J-0: checklist de ofício; remeter; registrar recebimento pela JARI                           | `rait-case:remit-jari` / `receive-judging-body` | `[AGUARDANDO_REMESSA_JARI] → [DISTRIBUIDO]`; marco `T-JUL-24M`  | `REMIT_NOT_ADMITTED`, `REMIT_CHECKLIST_INCOMPLETE`, `RECEIPT_ALREADY_REGISTERED`                                                  |
| 6   | `/protocolo/desistencias`      | termo assinado, legitimidade; homologa                                                         | `rait-case:withdraw`                            | `[ENCERRADO_DESISTENCIA]`; diligências encerradas; sai da pauta | `WITHDRAWAL_AFTER_DECISION`, `WITHDRAWAL_LEGITIMACY`                                                                              |
| 7   | `/casos/:id/comunicacoes`      | expede decisão pelo canal de ciência; registra marcos                                          | `POST communications`                           | `[COMUNICADO]`; marcos por canal                                | `UPSTREAM_SNE_UNAVAILABLE`                                                                                                        |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j03-secretaria-protocolo-telas -->

```mermaid
flowchart TB
    lista["/protocolo  T-08 — intake do dia"] --> novo["/protocolo/novo — assistente"]
    novo --> c1["1. canal e marco (postal = data da postagem)"]
    c1 --> c2["2. partes e legitimidade (procuração verificada)"]
    c2 --> c3["3. documentos digitalizados + campos extraídos"]
    c3 --> c4{"conteúdo mínimo presente?"}
    c4 -->|"não"| pend["/protocolo/pendencias — pendência com prazo"]
    pend -->|"juntada datada"| prot
    c4 -->|"sim"| prot["protocolo imediato — [PROTOCOLADO]"]
    novo -->|"peça com > 1 AIT"| rec["recusa com orientação (INTAKE_MULTIPLE_AIT)"]
    novo -->|"destinado a outro órgão"| red["/protocolo/redirecionamentos — devolução de prazo"]
    prot -. "analista admite recurso (jari)" .-> rem["/protocolo/remessas — F-J-0 checklist, T-REM10"]
    rem -->|remeter| ag["[AGUARDANDO_REMESSA_JARI]"]
    ag -->|"recebimento pela JARI"| dist["[DISTRIBUIDO] — marco T-JUL-24M"]
    lista --> des["/protocolo/desistencias  T-17"]
    des -->|"termo + legitimidade"| g{"antes da decisão?"}
    g -->|sim| enc(("[ENCERRADO_DESISTENCIA]"))
    g -->|não| e["WITHDRAWAL_AFTER_DECISION"]
    lista --> com["/casos/:id/comunicacoes — expedir decisão, marcos"]
```

[Renderizado: ARCH-RAIT-WEB-j03-secretaria-protocolo-telas.svg](../diagrams/ARCH-RAIT-WEB-j03-secretaria-protocolo-telas.svg)

## Sequência: intake físico até o protocolo

<!-- svg: ARCH-RAIT-WEB-j03-secretaria-protocolo-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant S as Secretaria (UI)
    participant F as IntakeFacade
    participant API as /v1/inf/rait
    participant ST as storage (kernel)
    participant C as rait-case
    participant I as infração (WF-INF-003)
    S->>F: canal=balcao, marco=hoje, AIT único, requerente, docs
    F->>ST: upload por URL assinada (PDF/JPEG), hash
    ST-->>F: storage_key, content_hash
    F->>API: POST cases (Idempotency-Key) + parties + documents
    API->>C: guarda: um requerimento por AIT/instância, conteúdo mínimo ou pendência
    C-->>API: caso PROTOCOLADO, protocol_number
    API-->>F: 201 {caseId, protocolNumber}
    C-->>I: RAIT_CASO_PROTOCOLADO(defesa_previa)
    I-->>I: NOTIFICADO_AUTUACAO → DEFESA_EM_JULGAMENTO (T-DEC 360 se tempestiva)
    F-->>S: comprovante de protocolo para impressão
```

[Renderizado: ARCH-RAIT-WEB-j03-secretaria-protocolo-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j03-secretaria-protocolo-sequencia.svg)
