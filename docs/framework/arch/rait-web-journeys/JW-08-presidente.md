# JW-08 — Presidente da JARI-AM / CETRAN-AM (`rait-chair`)

Origem: `JRN-RAIT-002`, `UC-RAIT-005`, `UC-RAIT-006`, `UC-RAIT-014` (homologação), `UC-RAIT-015`,
`UC-RAIT-019`, `UC-RAIT-021`, `UC-RAIT-036` (aprovação). Telas T-09, T-11, T-12, T-13.

## Passos

| #   | Rota                                     | Ação                                                                                       | Comando                                         | Efeito                                          | Erros                                                                                                    |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | `/colegiado/:orgao/distribuicao/:loteId` | homologa o sorteio; exclusões manuais motivadas                                            | `rait-batch:approve`                            | `T-CLAIM` armado                                | `BATCH_SEED_TAMPERED`, `BATCH_STATE_INVALID`                                                             |
| 2   | `/colegiado/:orgao/pauta`                | `AgendaComposer`: arrasta itens com parecer; N3/CRÍTICO obrigatórios; fecha                | `rait-agenda:close`                             | `[PAUTADO]`; sessão `PAUTA_FECHADA`; convocação | `AGENDA_ITEM_WITHOUT_OPINION`, `AGENDA_CRITICAL_MISSING`, `AGENDA_SHORT_NOTICE`, `AGENDA_ITEM_DUPLICATE` |
| 3   | `/colegiado/:orgao/sessoes/:id/banca`    | verifica banca; convoca suplentes                                                          | (secretaria executa)                            | `BANCA_CONFIRMADA`                              | `BENCH_INSUFFICIENT`                                                                                     |
| 4   | `/colegiado/:orgao/sessoes/:id`          | abre a sessão (quorum, presidente, paridade no CETRAN)                                     | `rait-session:open` \| `adjourn`                | `SESSAO_ABERTA` \| `SESSAO_ADIADA`              | `SESSION_QUORUM_MISSING`, `SESSION_STATE_INVALID`                                                        |
| 5   | idem                                     | item a item: relatoria lida → votação → (vista) → empate → voto de qualidade → proclamação | `rait-session:vote`, `casting-vote`, `proclaim` | `DECISAO_PROCLAMADA`; caso `[JULGADO_SESSAO]`   | `CASTING_VOTE_NOT_TIED`, `PROCLAIM_NO_MAJORITY`, `VOTE_MEMBER_IMPEDED`                                   |
| 6   | `/colegiado/:orgao/sessoes/:id/ata`      | assina a ata                                                                               | `rait-minutes:sign`                             | `ATA_ASSINADA` → publicação pela secretaria     | `SIGNATURE_FAILED`                                                                                       |
| 7   | `/colegiado/:orgao/extraordinaria`       | convoca extraordinária por casos críticos                                                  | `rait-session:convene-extraordinary`            | sessão criada com `extraordinary=true`          | `EXTRAORDINARY_NO_CRITICAL`, `SESSION_PAID_CAP_REACHED`                                                  |
| 8   | `/organizacao/jeton`                     | aprova a folha                                                                             | `rait-jeton:approve`                            | folha aprovada                                  | `JETON_ALREADY_APPROVED`                                                                                 |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j08-presidente-telas -->

```mermaid
flowchart TB
    lote["/colegiado/:orgao/distribuicao/:loteId — homologar sorteio"] --> pauta["/colegiado/:orgao/pauta  T-11 — AgendaComposer"]
    pauta --> g1{"itens com parecer e N3/CRÍTICO incluídos?"}
    g1 -->|não| e1["AGENDA_* — fechamento bloqueado"] --> pauta
    g1 -->|sim| g2{"antecedência ≥ T-CONV?"}
    g2 -->|"não"| ack["confirmar convocação curta (registro em ata)"] --> fech
    g2 -->|sim| fech["PAUTA_FECHADA — [PAUTADO], convocação enviada"]
    fech --> banca["/colegiado/:orgao/sessoes/:id/banca"] --> live["/colegiado/:orgao/sessoes/:id  T-12"]
    live --> g3{"quorum, presidente, paridade (CETRAN)?"}
    g3 -->|não| adi["SESSAO_ADIADA — relógios seguem correndo"]
    g3 -->|sim| aberta["SESSAO_ABERTA"]
    aberta --> item["item corrente: RELATORIA_LIDA → VOTACAO"]
    item -->|"pedido de vista"| vista["item reprogramado"] --> item
    item -->|"retirada por impedimento"| item
    item -->|"empate"| des["DESEMPATE_PRESIDENTE — voto de qualidade"] --> proc
    item -->|"maioria"| proc["DECISAO_PROCLAMADA — [JULGADO_SESSAO]"]
    proc -->|"próximo item"| item
    proc -->|"todos os itens"| ata["/colegiado/:orgao/sessoes/:id/ata  T-13 — assinar"] --> fim(("publicação pela secretaria — marco T-R2"))
    extra["/colegiado/:orgao/extraordinaria — casos N3/CRÍTICO"] -.-> pauta
```

[Renderizado: ARCH-RAIT-WEB-j08-presidente-telas.svg](../diagrams/ARCH-RAIT-WEB-j08-presidente-telas.svg)

## Sequência: abrir sessão, votar item, proclamar

<!-- svg: ARCH-RAIT-WEB-j08-presidente-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant P as Presidente (UI)
    participant F as SessionFacade
    participant API as /v1/inf/rait
    participant SE as rait-session
    participant S as SSE (banca)
    P->>F: abrir sessão
    F->>API: POST sessions/{id}/commands/open (If-Match)
    API->>SE: quorum_observed ≥ quorum_required, presidente/suplente presente, paridade (cetran)
    SE-->>API: SESSAO_ABERTA
    S-->>F: session.changed (todos os membros)
    P->>F: ler relatoria do item 1
    F->>API: PATCH agenda-items/{id} (read_at)
    API->>SE: RELATORIA_LIDA → VOTACAO
    Note over P,S: membros votam (JW-07)
    P->>F: proclamar
    F->>API: POST agenda-items/{id}/commands/proclaim (If-Match)
    API->>SE: maioria ou desempate · quorum reverificado no item
    alt empate
        API-->>F: 422 PROCLAIM_NO_MAJORITY {tally}
        P->>F: voto de qualidade
        F->>API: POST votes (casting_vote=true)
        F->>API: POST agenda-items/{id}/commands/proclaim
    end
    SE-->>API: DECISAO_PROCLAMADA, outcome, caso JULGADO_SESSAO
    API-->>F: 200 {outcome}
    S-->>F: agenda-item.changed
```

[Renderizado: ARCH-RAIT-WEB-j08-presidente-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j08-presidente-sequencia.svg)
