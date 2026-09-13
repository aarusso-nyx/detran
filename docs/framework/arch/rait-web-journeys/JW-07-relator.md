# JW-07 — Membro / conselheiro relator (`rait-rapporteur`)

Origem: `JRN-RAIT-002`, `UC-RAIT-004`, `UC-RAIT-006`, `UC-RAIT-019`, `UC-RAIT-026`. Telas T-01, T-02,
T-10, T-12; rotas `/fila/recurso/:orgao`, `/colegiado/:orgao/relatoria*`, `/colegiado/:orgao/sessoes/:id`.

## Passos

| #   | Rota                                       | Ação                                                            | Comando                              | Efeito                                          | Erros                                                                                     |
| --- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | `/colegiado/:orgao/relatoria`              | lote sorteado: "aceitar" ou "declarar impedimento" em `T-CLAIM` | `rait-batch:accept` / `impede`       | `[EM_INSTRUCAO]` com `T-VOTO` \| redistribuição | `BATCH_CLAIM_EXPIRED`, `MEMBER_IMPEDED`                                                   |
| 2   | `/fila/recurso/:orgao`                     | meus casos distribuídos, `T-VOTO` por caso                      | `GET assignments?member=me`          | —                                               | —                                                                                         |
| 3   | `/casos/:id/dossie` (leitura)              | lê dossiê; abre diligência se necessário                        | `rait-case:open-inquiry`             | `[DILIGENCIA]`                                  | `INQUIRY_ADDRESSEE_FORBIDDEN`                                                             |
| 4   | `/colegiado/:orgao/relatoria/:caseId/voto` | `OpinionEditor`: resumo, análise, voto conclusivo               | `rait-opinion:register`              | `[PRONTO_P_DECISAO]`                            | `DRAFT_INCOMPLETE` (parecer), `DECISION_GROUNDS_REQUIRED`                                 |
| 5   | `/colegiado/:orgao/sessoes/:id`            | na sessão: relatoria lida; vota nos demais itens; pede vista    | `rait-session:vote` / `view-request` | tally; item reprogramado                        | `VOTE_MEMBER_IMPEDED`, `VOTE_ITEM_NOT_OPEN`, `VOTE_DUPLICATE`, `VIEW_REQUEST_NOT_ALLOWED` |
| 6   | `/colegiado/:orgao/vistas`                 | devolve item com vista dentro do prazo                          | `PATCH agenda-items/{id}`            | item volta à pauta seguinte                     | `VIEW_DEADLINE_EXCEEDED`                                                                  |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j07-relator-telas -->

```mermaid
flowchart TB
    rel["/colegiado/:orgao/relatoria  T-10 — lote sorteado"] --> d1{"aceitar em T-CLAIM?"}
    d1 -->|"declarar impedimento"| imp["ImpedimentDialog — tipo e fundamento"] --> redis["caso redistribuído ao próximo da ordem"]
    d1 -->|aceitar| fila["/fila/recurso/:orgao  T-02 — meus casos, T-VOTO"]
    fila --> dos["/casos/:id/dossie  T-04 (leitura) — [EM_INSTRUCAO]"]
    dos -->|"prova externa"| dil["/casos/:id/diligencias — [DILIGENCIA]"] -. "resposta / T-DIL" .-> dos
    dos --> voto["/colegiado/:orgao/relatoria/:caseId/voto — OpinionEditor"]
    voto -->|"resumo + análise + voto"| pron["[PRONTO_P_DECISAO] — aguarda pauta"]
    pron -. "presidente fecha pauta (JW-08)" .-> live["/colegiado/:orgao/sessoes/:id  T-12"]
    live -->|"relatoria lida, votação"| vt["voto nos itens (não impedido)"]
    live -->|"pedir vista"| vista["/colegiado/:orgao/vistas — devolver no prazo"] -. "pauta seguinte" .-> live
    vt --> fim(("DECISAO_PROCLAMADA → ata (JW-04)"))
```

[Renderizado: ARCH-RAIT-WEB-j07-relator-telas.svg](../diagrams/ARCH-RAIT-WEB-j07-relator-telas.svg)

## Sequência: registrar parecer e votar em sessão

<!-- svg: ARCH-RAIT-WEB-j07-relator-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant R as Relator (UI)
    participant F as SessionFacade
    participant API as /v1/inf/rait
    participant SE as rait-session
    participant C as rait-case
    participant S as SSE
    R->>F: registrar parecer (resumo, análise, voto=nao_provimento)
    F->>API: PATCH agenda-items/{id} (opinion) ou POST cases/{id}/commands/ready (If-Match)
    API->>SE: guarda: relator = assignment ativo, EM_INSTRUCAO, voto obrigatório
    SE-->>C: caso PRONTO_P_DECISAO
    API-->>F: 200
    Note over R,S: sessão aberta pelo presidente (JW-08), item corrente lido
    S-->>F: agenda-item.changed (VOTACAO)
    R->>F: votar (provimento)
    F->>API: POST votes {agendaItemId, vote}
    API->>SE: guardas: item em VOTACAO, membro presente, não impedido, sem voto anterior
    SE-->>API: tally atualizado
    API-->>F: 201
    S-->>F: agenda-item.changed (tally)
```

[Renderizado: ARCH-RAIT-WEB-j07-relator-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j07-relator-sequencia.svg)
