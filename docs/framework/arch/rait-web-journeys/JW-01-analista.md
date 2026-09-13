# JW-01 — Analista / revisor da defesa prévia (`rait-analyst`)

Origem: `JRN-RAIT-001`, `UC-RAIT-002`, `UC-RAIT-003`, `UC-RAIT-026`, `UC-RAIT-028`. Telas T-01, T-02,
T-03, T-04, T-05, T-06, T-07 (lado minuta). Estados do caso: `WF-RAIT-001`.

## Passos

| #   | Rota                      | Ação do usuário                                                            | Comando (`inf:rait-*`)                         | Efeito                                                           | Erros relevantes                                                                |
| --- | ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `/painel`                 | vê o resumo do turno (vencendo, diligências, parados)                      | `GET` resumo; SSE                              | cartões atualizados                                              | —                                                                               |
| 2   | `/fila/defesa`            | "puxar próximo" (`n`)                                                      | `rait-case:claim-next`                         | `[ADMITIDO] → [DISTRIBUIDO] → [EM_INSTRUCAO]`; redireciona       | `QUEUE_EMPTY`, `ASSIGNMENT_WIP_LIMIT`, `MEMBER_NOT_AVAILABLE`, `MEMBER_IMPEDED` |
| 3   | `/casos/:id/triagem`      | registra 4 vereditos (tempestividade calculada)                            | `rait-case:triage`                             | checklist salvo                                                  | `TRIAGE_TIMELINESS_READONLY`, `PROCURATION_UNVERIFIED`                          |
| 4   | `/casos/:id/triagem`      | "admitir" ou "não conhecer" (com inciso)                                   | `rait-case:admit` \| `rait-case:reject`        | `[ADMITIDO]` (efeito suspensivo se recurso) \| `[NAO_CONHECIDO]` | `TRIAGE_INCOMPLETE`, `NON_ADMISSION_REASON_REQUIRED`                            |
| 5   | `/casos/:id/dossie`       | instrui; "anexar de ofício" documento do órgão                             | `POST documents` (origem `oficio`)             | dossiê completo                                                  | `CASE_OFFICIAL_DOCUMENT_REQUIRED`, `DOCUMENT_HASH_MISMATCH`                     |
| 6   | `/casos/:id/diligencias`  | abre diligência (15 du), prorroga 1x, responde                             | `rait-case:open-inquiry` / `extend` / `answer` | `[DILIGENCIA]`; some da mesa; volta por T-06                     | `INQUIRY_ADDRESSEE_FORBIDDEN`, `INQUIRY_EXTENSION_LIMIT`                        |
| 7   | `/painel/retomar`         | retoma caso respondido ou vencido (`T-DIL`)                                | —                                              | `[EM_INSTRUCAO]` \| `[PRONTO_P_DECISAO]` (julga no estado)       | —                                                                               |
| 8   | `/casos/:id/minuta`       | redige fatos, fundamentos, dispositivo; versiona; "enviar para assinatura" | `rait-case:submit-draft`                       | `[PRONTO_P_DECISAO]`; "aguardando assinatura"                    | `DRAFT_INCOMPLETE`, `CASE_STATE_INVALID`                                        |
| 9   | `/casos/:id/decisao`      | recebe devolução com orientação (1x) ou lê a decisão assinada              | —                                              | volta ao passo 8 ou encerra                                      | —                                                                               |
| 10  | `/casos/:id/impedimentos` | declara impedimento a qualquer momento                                     | `rait-impediment:declare`                      | caso devolvido à fila com motivo                                 | `MEMBER_IMPEDED` (já registrado)                                                |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j01-analista-telas -->

```mermaid
flowchart TB
    painel["/painel  T-01 — resumo do turno"] --> fila["/fila/defesa  T-02"]
    fila -->|"puxar próximo (n)"| g1{"WIP < limite e disponível?"}
    g1 -->|não| bloq["botão bloqueado — conclua uma minuta"]
    g1 -->|sim| tri["/casos/:id/triagem  T-03 — [DISTRIBUIDO]"]
    tri -->|"4 vereditos"| g2{"admitir?"}
    g2 -->|"não conhecer + inciso"| nc(("[NAO_CONHECIDO] → comunicação"))
    g2 -->|admitir| dos["/casos/:id/dossie  T-04 — [ADMITIDO] → [EM_INSTRUCAO]"]
    dos -->|"documento do órgão falta"| oficio["anexar de ofício (tarefa interna)"] --> dos
    dos -->|"precisa de prova externa"| dil["/casos/:id/diligencias  T-05 — [DILIGENCIA]"]
    dil -. "resposta ou T-DIL vence" .-> ret["/painel/retomar  T-06"]
    ret --> dos
    dos -->|"instrução completa"| min["/casos/:id/minuta  T-07 — fatos, fundamentos, dispositivo"]
    min -->|"enviar para assinatura"| pron["[PRONTO_P_DECISAO] — aguardando autoridade"]
    pron -. "devolvida com orientação (1x)" .-> min
    pron -. "assinada" .-> dec(("/casos/:id/decisao — somente leitura"))
    tri -. "impedimento" .-> imp["/casos/:id/impedimentos"] --> fila
```

[Renderizado: ARCH-RAIT-WEB-j01-analista-telas.svg](../diagrams/ARCH-RAIT-WEB-j01-analista-telas.svg)

## Sequência do caminho principal (puxar → admitir → minuta)

<!-- svg: ARCH-RAIT-WEB-j01-analista-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant A as Analista (UI)
    participant F as QueueFacade / CaseFacade
    participant API as /v1/inf/rait
    participant G as DetranPolicyGuard
    participant D as rait-case / rait-worklist
    participant S as SSE
    A->>F: puxar próximo
    F->>API: POST pools/{id}/claim-next (Idempotency-Key)
    API->>G: inf:rait-case:claim-next (rait-analyst)
    G-->>API: permitido
    API->>D: primeiro elegível da ordem única, WIP, impedimento
    D-->>API: assignment ativo, caso DISTRIBUIDO → EM_INSTRUCAO
    API-->>F: 201 {caseId, assignment} + ETag
    S-->>F: assignment.changed / case.changed
    F-->>A: redireciona /casos/{id}/triagem
    A->>F: 4 vereditos, admitir
    F->>API: POST cases/{id}/admissibility · POST cases/{id}/commands/admit (If-Match)
    API->>D: guarda TRIAGEM_ADMISSIBILIDADE, 4 critérios
    D-->>API: ADMITIDO (+ evento efeito suspensivo se jari)
    API-->>F: 200 caso
    A->>F: enviar minuta para assinatura
    F->>API: POST cases/{id}/commands/ready (If-Match)
    API->>D: guarda EM_INSTRUCAO, minuta com dispositivo
    D-->>API: PRONTO_P_DECISAO, T-ASS armado
    API-->>F: 200
    F-->>A: "aguardando assinatura da autoridade"
```

[Renderizado: ARCH-RAIT-WEB-j01-analista-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j01-analista-sequencia.svg)
