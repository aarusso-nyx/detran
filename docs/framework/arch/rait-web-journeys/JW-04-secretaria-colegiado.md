# JW-04 — Secretaria do colegiado: sorteio, banca, ata, jeton e arquivo (`rait-secretary`)

Origem: `UC-RAIT-014`, `UC-RAIT-015`, `UC-RAIT-018`, `UC-RAIT-020`, `UC-RAIT-024`, `UC-RAIT-036`.
Telas T-09, T-12 (registro), T-13; rotas `/colegiado/:orgao/*`, `/organizacao/jeton`, `/arquivo/*`.

## Passos

| #   | Rota                                      | Ação                                                                    | Comando                                      | Efeito                                             | Erros                                                              |
| --- | ----------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | `/colegiado/:orgao/distribuicao`          | abre lote (semanal/extraordinário) com casos sem relator                | `rait-batch:open`                            | `LOTE_ABERTO`                                      | `BATCH_STATE_INVALID`                                              |
| 2   | idem                                      | roda o sorteio (round-robin aleatorizado + carga)                       | `rait-batch:draw`                            | `LOTE_SORTEADO`; ata gerada com semente            | `BATCH_NO_ELIGIBLE_MEMBERS`                                        |
| 3   | `/colegiado/:orgao/distribuicao/:loteId`  | acompanha aceites e impedimentos até `T-CLAIM`; presidente homologa     | (`rait-batch:approve` pelo chair)            | `LOTE_ACEITO`; casos `[DISTRIBUIDO]` com relator   | `BATCH_SEED_TAMPERED`, `BATCH_CLAIM_EXPIRED`                       |
| 4   | `/colegiado/:orgao/sessoes/:id/banca`     | confirma presenças; convoca suplente de plantão                         | `POST attendance`                            | `BANCA_CONFIRMADA` \| `BANCA_INSUFICIENTE`         | `BENCH_INSUFFICIENT`                                               |
| 5   | `/colegiado/:orgao/sessoes/:id`           | registra ao vivo (presenças, leitura, votos, vista) junto ao presidente | `POST attendance`, `votes` (do chair)        | ata alimentada                                     | `SESSION_STATE_INVALID`                                            |
| 6   | `/colegiado/:orgao/sessoes/:id/ata`       | gera, colhe assinaturas (presidente + secretaria), publica              | `rait-minutes:generate` / `sign` / `publish` | `ATA_ASSINADA`; casos `[COMUNICADO]`; marco `T-R2` | `MINUTES_NOT_READY`, `MINUTES_SIGNERS_MISSING`, `SIGNATURE_FAILED` |
| 7   | `/protocolo/remessas` (CETRAN)            | secretaria executiva registra recebimento e devolve decisão             | `rait-case:receive-judging-body`             | marco `T-JUL-24M` da 2ª instância                  | `RECEIPT_ALREADY_REGISTERED`                                       |
| 8   | `/organizacao/jeton`                      | apura sessões com ata assinada; gera folha                              | `rait-jeton:generate`                        | folha para aprovação do presidente                 | `JETON_MINUTES_UNSIGNED`, `PARAMETER_SOURCE_PENDING`               |
| 9   | `/arquivo/retencao`, `/arquivo/casos/:id` | sela dossiê final; aplica retenção/anonimização                         | `rait-archive:seal` / `apply-retention`      | dossiê selado com hash; terceiros suprimidos       | `ARCHIVE_NOT_CLOSED`, `RETENTION_NOT_DUE`                          |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j04-secretaria-colegiado-telas -->

```mermaid
flowchart TB
    dist["/colegiado/:orgao/distribuicao  T-09"] -->|"abrir lote"| ab["LOTE_ABERTO — casos sem relator"]
    ab -->|"sortear"| so["LOTE_SORTEADO — ata com semente e ordem"]
    so --> lote["/colegiado/:orgao/distribuicao/:loteId — aceites em T-CLAIM"]
    lote -. "presidente homologa (JW-08)" .-> ac["LOTE_ACEITO — [DISTRIBUIDO] com relator, T-VOTO"]
    lote -. "T-CLAIM vence" .-> so
    cal["/colegiado/:orgao/sessoes — calendário"] --> banca["/colegiado/:orgao/sessoes/:id/banca"]
    banca -->|"confirmações ≥ quorum"| bc["BANCA_CONFIRMADA"]
    banca -->|"abaixo do quorum"| bi["BANCA_INSUFICIENTE — convoca suplente de plantão"] --> banca
    bc --> live["/colegiado/:orgao/sessoes/:id  T-12 — registro ao vivo"]
    live -->|"DECISAO_PROCLAMADA em todos os itens"| ata["/colegiado/:orgao/sessoes/:id/ata  T-13"]
    ata -->|gerar| g1["ATA_LAVRADA"] -->|"assinar (presidente + secretaria)"| g2["ATA_ASSINADA"] -->|publicar| pub(("casos [COMUNICADO] — marco T-R2"))
    pub --> jeton["/organizacao/jeton — folha das sessões com ata assinada"]
    pub -. "trânsito / encerramento" .-> arq["/arquivo/casos/:id — selar; /arquivo/retencao"]
```

[Renderizado: ARCH-RAIT-WEB-j04-secretaria-colegiado-telas.svg](../diagrams/ARCH-RAIT-WEB-j04-secretaria-colegiado-telas.svg)

## Sequência: sorteio em lote e homologação

<!-- svg: ARCH-RAIT-WEB-j04-secretaria-colegiado-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant S as Secretaria (UI)
    participant P as Presidente (UI)
    participant F as BatchFacade
    participant API as /v1/inf/rait
    participant W as rait-worklist (lotes)
    participant R as Relatores
    S->>F: abrir lote (pool jari)
    F->>API: POST batches
    API->>W: casos ADMITIDO/DISTRIBUIDO sem relator
    W-->>API: LOTE_ABERTO
    S->>F: sortear
    F->>API: POST batches/{id}/draw
    API->>W: elegíveis = ATIVO ∧ DISPONIVEL/EM_PLANTAO ∧ sem impedimento · round-robin aleatorizado + carga
    W-->>API: LOTE_SORTEADO, ata (semente, ordem, membro por caso)
    API-->>F: 200 {batch, minutesDocumentId}
    P->>F: homologar
    F->>API: POST batches/{id}/approve (If-Match)
    API->>W: T-CLAIM armado por item
    W-->>R: notificação: aceitar ou declarar impedimento
    R->>API: POST batches/{id}/items/{caseId}/accept | impediment
    API->>W: aceito → assignment ativo, T-VOTO · impedido → redistribui ao próximo da ordem
    W-->>API: LOTE_ACEITO quando todos resolvidos
    API-->>F: batch.changed (SSE)
```

[Renderizado: ARCH-RAIT-WEB-j04-secretaria-colegiado-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j04-secretaria-colegiado-sequencia.svg)
