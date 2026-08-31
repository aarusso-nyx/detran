---
id: WF-INF-001
title: Ciclo de vida da infração — da lavratura ao encerramento da instância administrativa
status: draft
apps: [teat, rait, portal, dashboard]
sources: [REF-CONTRAN-918, REF-CONTRAN-900, REF-DETRANAM-TALAO-BODYCAM]
updated: 2026-08-27
---

## Estados

```mermaid
stateDiagram-v2
    [*] --> AIT_LAVRADO : agente lavra (teat)\n918 art.3
    AIT_LAVRADO --> ARQUIVADO : NA não expedida em 30d\n918 art.4 §1º (T1)
    AIT_LAVRADO --> CANCELADO_POS_INTEGRACAO : Diretoria de Fiscalização decide\ncancelamento pós-finalização\nprática local, norma de competência pendente
    AIT_LAVRADO --> NOTIFICADO_AUTUACAO : NA expedida ≤30d\n918 art.4 (ou AIT≡NA, art.3 §5º)
    NOTIFICADO_AUTUACAO --> DEFESA_APRESENTADA : defesa prévia no prazo ≥30d\n918 art.4 §2º / 900
    NOTIFICADO_AUTUACAO --> PENALIDADE_APLICADA : sem defesa → NP ≤180d do cometimento\n918 art.9 §2º (T3)
    NOTIFICADO_AUTUACAO --> CANCELADO_POS_INTEGRACAO : cancelamento pós-finalização\nantes da decisão de defesa
    NOTIFICADO_AUTUACAO --> NOTIFICADO_AUTUACAO : indicação de condutor\n918 art.5 (redireciona sujeito)
    DEFESA_APRESENTADA --> AIT_CANCELADO : defesa acolhida\n918 art.9 §1º
    DEFESA_APRESENTADA --> PENALIDADE_APLICADA : indeferida → NP ≤360d\n918 art.9 §3º (T3')
    PENALIDADE_APLICADA --> RECURSO_JARI : recurso 1ª inst. até vencimento NP\n918 arts.12,15
    PENALIDADE_APLICADA --> CANCELADO_POS_INTEGRACAO : cancelamento pós-finalização\nantes do encerramento definitivo
    PENALIDADE_APLICADA --> ENCERRADO_PAGO : pagamento 80% (ou 60% SNE)\n918 arts.20-21
    PENALIDADE_APLICADA --> ENCERRADO_DEFINITIVO : sem recurso após vencimento
    RECURSO_JARI --> PROVIDO_JARI : JARI dá provimento
    RECURSO_JARI --> NEGADO_JARI : JARI nega
    RECURSO_JARI --> ENCERRADO_DESISTENCIA : desistência escrita até julgamento\n900 art.11
    PROVIDO_JARI --> RECURSO_2A : autoridade recorre\nCTB art.288 (fonte: excerto pendente)
    NEGADO_JARI --> RECURSO_2A : recorrente recorre em 30d\nCTB art.288
    PROVIDO_JARI --> CANCELADO_DEFINITIVO : autoridade não recorre
    NEGADO_JARI --> ENCERRADO_DEFINITIVO : sem recurso no prazo
    RECURSO_2A --> CANCELADO_DEFINITIVO : CETRAN dá provimento\nCTB arts.288-290
    RECURSO_2A --> ENCERRADO_DEFINITIVO : CETRAN nega — irrecorrível\nCTB art.290
    ENCERRADO_DEFINITIVO --> [*] : penalidade → RENACH\n918 art.18
    CANCELADO_DEFINITIVO --> [*]
    AIT_CANCELADO --> [*]
    CANCELADO_POS_INTEGRACAO --> [*]
    ARQUIVADO --> [*]
    ENCERRADO_PAGO --> [*]
```

`CANCELADO_POS_INTEGRACAO` é terminal e **não se confunde** com `AIT_CANCELADO`, que decorre do
acolhimento de defesa. Ele recebe o cancelamento administrativo de um AIT já finalizado no TEAT e
integrado a este ciclo ([WF-TEAT-001], [RN-TEAT-121]). A competência da Diretoria de Fiscalização
vem de prática local documentada por [REF-DETRANAM-TALAO-BODYCAM] e permanece sujeita à validação
jurídica DT-046. AITs oriundos de violação de guarda monitorada ou de alcoolemia entram pelo estado
comum `AIT_LAVRADO`; a origem não cria estado processual especial.

## Prazos e timers (base legal por prazo)

| Timer               | Prazo                                                                             | Gatilho           | Consequência                                                                          | Base                             |
| ------------------- | --------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| T1 expedição NA     | 30 dias do cometimento                                                            | lavratura         | não expedida → arquivamento do AIT                                                    | 918 art.4 §1º                    |
| T2 defesa/indicação | ≥30 dias da expedição da NA                                                       | NA                | fim do prazo → segue p/ penalidade                                                    | 918 art.4 §2º                    |
| T3 NP sem defesa    | 180 dias do cometimento                                                           | sem defesa        | NP fora do prazo → (consequência a confirmar: prescrição intercorrente? Lei 9.873/99) | 918 art.9 §2º                    |
| T3' NP com defesa   | 360 dias do cometimento                                                           | defesa tempestiva | idem                                                                                  | 918 art.9 §3º                    |
| T4 recurso JARI     | até o vencimento da NP                                                            | NP                | intempestivo → não conhecimento + juros desde vencimento                              | 918 arts.12, 23 §5º; 900 art.4 I |
| T5 recurso 2ª inst. | 30 dias da ciência da decisão                                                     | decisão JARI      | (excerto CTB art.288 pendente)                                                        | CTB art.288                      |
| Contagem            | dias consecutivos; exclui dia inicial; inclui vencimento; prorroga p/ 1º dia útil | —                 | —                                                                                     | 918 art.29                       |

## Decisões de modelagem pendentes

- RESOLVIDO (2026-08-24): prazos de julgamento pelas instâncias = 24 meses por instância — CTB art. 285 §6º (JARI) e art. 289 _caput_ (CETRAN); não julgamento → prescrição da pretensão punitiva (art. 289-A, Lei 14.229/2021). O antigo art. 285 §3º está REVOGADO. Ver [REF-CTB-280-290] e [RN-RAIT-110..112]; detalhamento operacional em [WF-RAIT-001/002].
- Efeito suspensivo do recurso: 918 art.13 garante ausência de restrição até vencimento/efeito suspensivo — confirmar alcance no CTB arts. 285-288.
- Restituição de multa paga em caso de provimento (CTB art. 286 §2º) — excerto pendente.
