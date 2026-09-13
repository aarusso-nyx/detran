# JW-05 — Autoridade de trânsito signatária (`rait-signing-authority`)

Origem: `UC-RAIT-016`, `RN-RAIT-143`, `WF-RAIT-004` §3 (escala de assinatura). Telas T-07 (lado
decisão); rotas `/assinatura`, `/assinatura/:caseId`.

## Passos

| #   | Rota                  | Ação                                                             | Comando                                   | Efeito                                                                                   | Erros                                                                                                                        |
| --- | --------------------- | ---------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/assinatura`         | fila F-DP-5 da circunscrição, ordem única, `T-ASS` por linha     | `GET cases?state=PRONTO_P_DECISAO&unit=…` | —                                                                                        | `FORBIDDEN_CASE_SCOPE`                                                                                                       |
| 2   | `/assinatura/:caseId` | lê minuta e dossiê lado a lado                                   | `GET` caso, minuta, documentos            | —                                                                                        | —                                                                                                                            |
| 3a  | idem                  | "acolher" / "indeferir" com fundamentação → assinatura PAdES+TSA | `rait-decision:sign`                      | `[DECIDIDO_AUTORIDADE]`; comunicação; infração `AIT_CANCELADO` \| `PENALIDADE_A_APLICAR` | `DECISION_JURISDICTION`, `DECISION_NOT_ON_DUTY`, `DECISION_GROUNDS_REQUIRED`, `DRAFT_AUTHOR_CANNOT_SIGN`, `SIGNATURE_FAILED` |
| 3b  | idem                  | "devolver com orientação" (uma vez)                              | `rait-decision:return-draft`              | `[EM_INSTRUCAO]`; revisor notificado                                                     | `DRAFT_RETURN_LIMIT`                                                                                                         |
| 3c  | idem                  | "declarar impedimento"                                           | `rait-impediment:declare`                 | caso roteado ao substituto de plantão                                                    | —                                                                                                                            |
| 4   | `/gestao/incidentes`  | declara decadência de ofício quando `T-DEC` vence (com o gestor) | `rait-extinction:declare`                 | infração `EXTINTO_DECADENCIA`; incidente                                                 | `EXTINCTION_CEILING_NOT_REACHED`                                                                                             |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j05-autoridade-signataria-telas -->

```mermaid
flowchart TB
    fila["/assinatura — fila F-DP-5 da circunscrição, T-ASS"] --> caso["/assinatura/:caseId  T-07 — minuta × dossiê"]
    caso --> d{"decisão"}
    d -->|"acolher + fundamentação"| sig["SignatureDialog — PAdES + TSA"]
    d -->|"indeferir + fundamentação"| sig
    d -->|"devolver com orientação (1x)"| dev["[EM_INSTRUCAO] — revisor notificado"] -.-> fila
    d -->|"declarar impedimento"| imp["ImpedimentDialog — roteia ao substituto"] --> fila
    sig -->|"assinatura ok"| dec["[DECIDIDO_AUTORIDADE]"]
    sig -->|"falha do kernel"| err["SIGNATURE_FAILED — tentar novamente"] --> caso
    dec -. "comunicação (secretaria)" .-> com(("[COMUNICADO]"))
    dec -. "infração" .-> inf["acolhida → AIT_CANCELADO · indeferida → PENALIDADE_A_APLICAR"]
```

[Renderizado: ARCH-RAIT-WEB-j05-autoridade-signataria-telas.svg](../diagrams/ARCH-RAIT-WEB-j05-autoridade-signataria-telas.svg)

## Sequência: decidir e assinar

<!-- svg: ARCH-RAIT-WEB-j05-autoridade-signataria-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant A as Autoridade (UI)
    participant F as SigningFacade
    participant API as /v1/inf/rait
    participant G as DetranPolicyGuard
    participant C as rait-case
    participant K as kernel signature (PAdES+TSA)
    participant I as infração
    A->>F: indeferir, fundamentação
    F->>API: POST decisions (kind=indeferida, grounds)
    API->>G: inf:rait-decision:sign (rait-signing-authority)
    API->>C: guardas: PRONTO_P_DECISAO, circunscrição do AIT, escala do dia, autor ≠ signatário
    C-->>API: decisão criada (sem assinatura)
    API-->>F: 201 {decisionId, documentToSign}
    F->>K: assinar (certificado do usuário)
    K-->>F: signature_ref, carimbo de tempo
    F->>API: POST cases/{id}/commands/decide {decisionId, signatureRef} (If-Match)
    API->>C: DECIDIDO_AUTORIDADE, evento
    C-->>I: RAIT_DECISAO_PUBLICADA(indeferida) após comunicação
    I-->>I: DEFESA_EM_JULGAMENTO → PENALIDADE_A_APLICAR
    API-->>F: 200
    F-->>A: próximo da fila
```

[Renderizado: ARCH-RAIT-WEB-j05-autoridade-signataria-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j05-autoridade-signataria-sequencia.svg)
