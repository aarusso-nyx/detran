# JW-10 — RH / gabinete (`rait-hr`) e financeiro / tesouraria (`rait-finance`)

Origem: `UC-RAIT-032`…`UC-RAIT-037`, `RN-RAIT-127`…`RN-RAIT-129`. Rotas `/organizacao/membros`,
`/organizacao/jeton` (apoio), `/financeiro/*`. Os módulos financeiro e de mandatos dependem de
entidades pendentes (build pack WP-A/WP-B); as rotas existem e exibem "indisponível nesta versão".

## RH — mandatos

| #   | Rota                   | Ação                                                                      | Comando               | Efeito                                    | Erros                                                          |
| --- | ---------------------- | ------------------------------------------------------------------------- | --------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| 1   | `/organizacao/membros` | cadastra nomeação (ato publicado, representação, titular/suplente, datas) | `rait-member:mandate` | membro `ATIVO` no pool do órgão           | `MANDATE_ACT_REQUIRED`, `MANDATE_DUAL_BODY`, `MANDATE_OVERLAP` |
| 2   | idem                   | registra posse, recondução, perda de mandato                              | `rait-member:mandate` | `MANDATO_ENCERRADO`; casos redistribuídos | `MANDATE_ACTIVE_ASSIGNMENTS`                                   |
| 3   | `/organizacao/jeton`   | apoia a apuração da folha (secretaria gera, presidente aprova)            | leitura               | —                                         | `PARAMETER_SOURCE_PENDING`                                     |

## Financeiro

| #   | Rota                       | Ação                                                                             | Comando                  | Efeito                                                  | Erros                                                                |
| --- | -------------------------- | -------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------- |
| 4   | `/financeiro/arrecadacao`  | emite/atualiza documento por fase (80% até `T-NP-VENC`, 60% SNE, integral+juros) | `rait-collection:issue`  | documento vinculado ao estado da infração               | `COLLECTION_PHASE_INVALID`, `COLLECTION_DISCOUNT_SNE_ONLY`           |
| 5   | `/financeiro/conciliacao`  | concilia retornos bancários com documentos                                       | `rait-payment:reconcile` | `PAGAMENTO_CONFIRMADO` → infração `pago=true`/`QUITADA` | `PAYMENT_UNMATCHED`                                                  |
| 6   | `/financeiro/restituicoes` | ordem de restituição corrigida após `RESTITUICAO_DEVIDA`                         | `rait-refund:order`      | ordem emitida; pendente se sem dados bancários          | `REFUND_NOT_DUE`, `REFUND_BANK_DATA_MISSING`, `REFUND_INDEX_PENDING` |
| 7   | `/financeiro/cobranca`     | handoff à cobrança/dívida ativa (Fazenda)                                        | `rait-debt:handoff`      | infração `EM_COBRANCA`                                  | `DEBT_HANDOFF_NOT_FINAL`                                             |

## Fluxo de telas

<!-- svg: ARCH-RAIT-WEB-j10-rh-financeiro-telas -->

```mermaid
flowchart TB
    subgraph rh["RH / gabinete"]
        memb["/organizacao/membros — MandateForm"] --> g1{"ato publicado, sem dupla composição, sem sobreposição?"}
        g1 -->|não| e1["MANDATE_*"] --> memb
        g1 -->|sim| ativo["membro ATIVO — elegível na escala"]
        ativo -->|"perda / fim de mandato"| g2{"casos ativos?"}
        g2 -->|sim| e2["MANDATE_ACTIVE_ASSIGNMENTS — redistribuir antes"] --> memb
        g2 -->|não| enc(("MANDATO_ENCERRADO"))
    end
    subgraph fin["Financeiro / tesouraria"]
        arr["/financeiro/arrecadacao — ChargeTierCard por fase"] --> conc["/financeiro/conciliacao — retornos bancários"]
        conc -->|"PAGAMENTO_CONFIRMADO"| pago["infração pago=true (80%) ou QUITADA"]
        conc -->|"sem documento"| e3["PAYMENT_UNMATCHED — fila de conciliação"]
        rest["/financeiro/restituicoes — RESTITUICAO_DEVIDA"] --> g3{"dados bancários e índice?"}
        g3 -->|não| pend["ordem pendente com alerta"]
        g3 -->|sim| ordem(("ordem de restituição emitida"))
        cob["/financeiro/cobranca — HandoffChecklist"] --> g4{"INSTANCIA_ENCERRADA sem efeito suspensivo?"}
        g4 -->|não| e4["DEBT_HANDOFF_NOT_FINAL"]
        g4 -->|sim| da(("EM_COBRANCA — dívida ativa"))
    end
```

[Renderizado: ARCH-RAIT-WEB-j10-rh-financeiro-telas.svg](../diagrams/ARCH-RAIT-WEB-j10-rh-financeiro-telas.svg)

## Sequência: conciliação de pagamento até a infração

<!-- svg: ARCH-RAIT-WEB-j10-rh-financeiro-sequencia -->

```mermaid
sequenceDiagram
    autonumber
    participant T as Tesouraria (UI)
    participant F as FinanceFacade
    participant API as /v1/inf/rait
    participant FI as módulo financeiro (pendente)
    participant I as infração
    participant N as senatran-adapter (RENAINF)
    T->>F: importar retorno bancário
    F->>API: POST payments/reconcile {file}
    API->>FI: casa documento × retorno · faixa (80% até T-NP-VENC)
    FI-->>I: PAGAMENTO_CONFIRMADO (sem reconhecimento)
    I-->>I: NOTIFICADO_PENALIDADE ↻ pago=true (não encerra)
    I-->>N: INFRACAO_ESTADO_ALTERADO (espelho)
    API-->>F: 200 {matched, unmatched[]}
    F-->>T: pendências de conciliação (PAYMENT_UNMATCHED) listadas
```

[Renderizado: ARCH-RAIT-WEB-j10-rh-financeiro-sequencia.svg](../diagrams/ARCH-RAIT-WEB-j10-rh-financeiro-sequencia.svg)
