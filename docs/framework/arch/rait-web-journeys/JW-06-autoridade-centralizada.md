# JW-06 — Autoridade centralizada do recurso vinculado (`rait-central-authority`)

Origem: `UC-RAIT-008`, `RN-RAIT-130`, `WF-INF-003` #23-#24, decisão OD-001 (pendente). Tela T-16;
rota `/autoridade/provimentos`.

## Passos

| #   | Rota                      | Ação                                                          | Comando                                                    | Efeito                                                                       | Erros                                                                                                 |
| --- | ------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | `/autoridade/provimentos` | lista provimentos da JARI a avaliar, dias restantes de `T-R2` | `GET cases?instance=jari&outcome=provido&state=COMUNICADO` | —                                                                            | —                                                                                                     |
| 2   | idem (drawer do caso)     | lê parecer, voto e ata; fundamento                            | `GET` decisão, ata                                         | —                                                                            | —                                                                                                     |
| 3a  | idem                      | "recorrer ao CETRAN" com fundamento                           | `rait-appeal:authority-decide`                             | novo caso `cetran` nasce `[ADMITIDO]`; infração `RECURSO_2A_INSTANCIA`       | `AUTHORITY_APPEAL_WINDOW_CLOSED`, `AUTHORITY_APPEAL_NOT_PROVIDED`, `AUTHORITY_APPEAL_ALREADY_DECIDED` |
| 3b  | idem                      | "não recorrer" (declaração)                                   | `rait-appeal:waive`                                        | caso `[TRANSITADO]`; infração `CANCELADO_DEFINITIVO` (+ restituição se pago) | idem                                                                                                  |
| 3c  | —                         | silêncio até `T-R2`                                           | timer                                                      | igual a 3b, automático                                                       | —                                                                                                     |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j06-autoridade-centralizada-telas -->

```mermaid
flowchart TB
    lista["/autoridade/provimentos  T-16 — provimentos, dias restantes de T-R2"] --> caso["drawer: parecer, voto, ata, fundamento"]
    caso --> d{"recorrer?"}
    d -->|"sim, com fundamento"| rec["comando authority-appeal"]
    rec -->|"dentro de T-R2"| novo["novo caso cetran [ADMITIDO] — infração RECURSO_2A_INSTANCIA (EM_JULGAMENTO_CETRAN)"]
    rec -->|"fora de T-R2"| e["AUTHORITY_APPEAL_WINDOW_CLOSED"] --> lista
    d -->|"não recorrer"| ren["comando waive"] --> fim(("[TRANSITADO] — infração CANCELADO_DEFINITIVO (restituição se pago)"))
    lista -. "silêncio até T-R2" .-> fim
```

[Renderizado: ARCH-RAIT-WEB-j06-autoridade-centralizada-telas.svg](../diagrams/ARCH-RAIT-WEB-j06-autoridade-centralizada-telas.svg)

## Sequência: recorrer ao CETRAN

<!-- svg: ARCH-RAIT-WEB-j06-autoridade-centralizada-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant A as Autoridade centralizada (UI)
    participant F as AuthorityFacade
    participant API as /v1/inf/rait
    participant C as rait-case
    participant I as infração
    participant S as secretaria executiva CETRAN
    A->>F: recorrer (fundamento)
    F->>API: POST cases/{id}/commands/authority-appeal (If-Match)
    API->>C: guardas: instance=jari, outcome=provido, T-R2 aberto, sem decisão anterior
    C-->>API: caso cetran criado ADMITIDO (origin_case_id), sem triagem cidadã
    C-->>I: RAIT_CASO_PROTOCOLADO(cetran) por recurso da autoridade
    I-->>I: AGUARDANDO_RECURSO_2A.PROVIDO_1A → RECURSO_2A_INSTANCIA.EM_JULGAMENTO_CETRAN
    API-->>F: 201 {cetranCaseId}
    C-->>S: fila F-C-0: registrar recebimento (JW-04 passo 7) → T-JUL-24M
```

[Renderizado: ARCH-RAIT-WEB-j06-autoridade-centralizada-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j06-autoridade-centralizada-sequencia.svg)
