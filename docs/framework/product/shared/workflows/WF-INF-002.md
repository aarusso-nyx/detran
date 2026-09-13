---
id: WF-INF-002
title: Modelo de Processo de Negócio (BPM) das infrações — da lavratura ao encerramento da instância, com timers automáticos
status: draft
apps: [teat, rait, portal, dashboard]
sources:
  [
    REF-CTB-280-290,
    REF-CONTRAN-918,
    REF-CONTRAN-900,
    REF-CONTRAN-931,
    REF-CONTRAN-357,
    REF-CONTRAN-901-2022,
    REF-LEI-9873-1999,
    REF-LEI-9784-1999,
    REF-DETRANAM-SERVICOS,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-SENATRAN-997,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-09-13
---

## O que este documento é

Modelo de Processo de Negócio (notação BPMN, desenhada em Mermaid) de **todos os fluxos
pertinentes à infração de trânsito** no ecossistema DETRAN: lavratura do AIT pelo agente
([WF-TEAT-001]), notificação da autuação, indicação de condutor, defesa prévia, notificação da
penalidade, recurso à JARI, recurso ao CETRAN-AM, encerramento da instância e consulta/pagamento pelo
Portal Público. O foco é o **processo interno** de recebimento, admissibilidade, distribuição e
decisão em cada nível, e a **modelagem dos prazos e timers automáticos**.

Ele não substitui as máquinas de estado existentes — ele as **costura**:

| Máquina existente | O que possui                                             | Onde entra aqui                                  |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------ |
| [WF-TEAT-001]     | ciclo técnico do AIT no talão eletrônico até `INTEGRADO` | processo P1 (pool TEAT)                          |
| [WF-INF-001]      | estados legais da infração (antigo, ponteiro)            | substituído por [WF-INF-003] (Owner, 2026-09-12) |
| [WF-RAIT-001]     | ciclo operacional do caso (defesa, JARI, CETRAN)         | processos P4, P5, P7                             |
| [WF-RAIT-002]     | distribuição, pools e escada de SLA anti-prescrição      | sub-processo "Distribuir"                        |
| [WF-RAIT-003]     | sessão colegiada (pauta, quorum, votação, ata)           | processo P6                                      |
| [WF-PORTAL-001]   | ciclo genérico de solicitação do cidadão                 | pool Cidadão (P8)                                |
| [WF-PORTAL-003]   | adesão/notificação eletrônica do Portal                  | pool Cidadão (P2, P8)                            |

A **máquina de estados consolidada da infração**, derivada destes processos, está em
[WF-INF-003] — que, por decisão do Owner (2026-09-12), substitui [WF-INF-001]. Este documento
segue `draft` até revisão própria do Owner.

## Convenções de notação (BPMN em Mermaid)

| Elemento BPMN                         | Forma neste documento                              | Exemplo                        |
| ------------------------------------- | -------------------------------------------------- | ------------------------------ |
| Evento de início / fim                | círculo `((…))`                                    | `((AIT integrado))`            |
| Evento intermediário de tempo (timer) | círculo com código `T-…`                           | `((T-NA 30d))`                 |
| Evento de mensagem                    | círculo com prefixo `msg`                          | `((msg: NA))`                  |
| Tarefa (humana ou de sistema)         | retângulo `[…]`                                    | `[Triagem de admissibilidade]` |
| Sub-processo                          | retângulo duplo `[[…]]`                            | `[[Notificar]]`                |
| Gateway exclusivo (XOR)               | losango `{…}`                                      | `{tempestivo?}`                |
| Gateway baseado em evento             | losango com prefixo `⧖`                            | `{⧖ o que ocorre primeiro?}`   |
| Fluxo de sequência                    | seta cheia `-->`                                   |                                |
| Fluxo de mensagem entre pools         | seta tracejada `-.->`                              |                                |
| Pool / raia                           | `subgraph` (pool) com `subgraph` aninhados (raias) |                                |

Códigos de timer são os do catálogo da §9 — os que já existem em [WF-RAIT-001] (`T-REM10`, `T-DIL`,
`T-R2`, `T-JUL-24M`, `T-PAR-3A`, `T-DEC`, `T-VOTO`, `T-CONV`) e em [WF-PORTAL-003]
(`T-SNE-CIENCIA`) foram **preservados** com o mesmo significado; os novos (`T-NA`, `T-DEF`,
`T-IND`, `T-NA-IND`, `T-NP-VENC`, `T-PRESC-5A`) cobrem o trecho do ciclo que o antigo [WF-INF-001] desenhava (com os nomes T1…T5).

## §0 — Mapa de colaboração (pools e mensagens)

```mermaid
flowchart LR
    subgraph pool_cid["Pool: Cidadão / Parte legítima (Portal, balcão, postal, SNE)"]
        direction TB
        C0((recebe NA)) --> C1{"o que faz?"}
        C1 -->|indica condutor| C2[Indicar condutor]
        C1 -->|defende-se| C3[Interpor defesa prévia]
        C1 -->|nada / paga| C4[Pagar ou aguardar NP]
        C5[Interpor recurso JARI] --> C6[Interpor recurso CETRAN]
        C7[Consultar infrações e pagar]
    end

    subgraph pool_org["Pool: Órgão autuador — DETRAN-AM"]
        direction TB
        subgraph l_teat["Raia: Agente de trânsito (TEAT)"]
            O1[[P1 Lavrar e integrar AIT]]
        end
        subgraph l_aut["Raia: Autoridade de trânsito"]
            O2[Julgar consistência do AIT]
            O4[Decidir defesa prévia]
            O5[Aplicar penalidade e expedir NP]
            O8[Decidir se recorre do provimento]
        end
        subgraph l_not["Raia: Processamento / Notificação"]
            O3[[P2 Notificar - NA / NP / decisão]]
        end
        subgraph l_sec["Raia: Secretaria RAIT (multicanal)"]
            O6[[Receber, protocolar, triar admissibilidade]]
        end
        subgraph l_ana["Raia: Analista 1º circuito"]
            O7[[Distribuir, instruir, diligenciar]]
        end
    end

    subgraph pool_jari["Pool: JARI (colegiado 1ª instância)"]
        direction TB
        J1[Receber recurso - marco T-JUL-24M]
        J2[[P6 Sessão de julgamento]]
    end

    subgraph pool_cet["Pool: CETRAN-AM (colegiado 2ª instância)"]
        direction TB
        K1[Receber recurso - marco T-JUL-24M]
        K2[[P6 Sessão de julgamento]]
    end

    subgraph pool_nac["Pool: Sistemas nacionais (via senatran-adapter)"]
        direction TB
        N1[(RENAINF)]
        N2[(RENACH)]
        N3[(SNE)]
        N4[(Rede arrecadadora)]
    end

    O1 --> O2 --> O3
    O3 -. "msg: NA" .-> C0
    C2 -. "msg: indicação" .-> O3
    C3 -. "msg: defesa" .-> O6
    O6 --> O7 --> O4 --> O5 --> O3
    O3 -. "msg: NP" .-> C4
    C5 -. "msg: recurso 1ª" .-> O6
    O6 -. "remessa T-REM10" .-> J1
    J1 --> J2
    J2 -. "msg: decisão JARI" .-> O3
    O3 -. "msg: decisão" .-> C5
    O8 -. "recurso da autoridade" .-> K1
    C6 -. "msg: recurso 2ª" .-> O6
    O6 -. "remessa" .-> K1
    K1 --> K2
    K2 -. "msg: decisão CETRAN" .-> O3
    O1 -. "AIT" .-> N1
    O3 -. "notificações" .-> N3
    O5 -. "penalidade definitiva" .-> N2
    C7 -. "pagamento" .-> N4
```

Leitura: a infração é o **objeto de negócio que atravessa os cinco pools**; cada pool tem seu próprio
processo e sua própria máquina, e a coordenação se faz por **mensagens** (NA, NP, defesa, recurso,
remessa, decisão) e por **timers**. Os pools de JARI e CETRAN são desenhados separados do DETRAN-AM
porque são órgãos colegiados com competência própria (CTB arts. 285 e 289; [REF-CONTRAN-357] item
4.1.c veda a dupla composição), ainda que o apoio administrativo seja do DETRAN-AM.

## §1 — P1: Lavratura, consistência e expedição da NA

Cobre o trecho entre o cometimento e a notificação da autuação. O timer `T-NA` corre **desde o
cometimento** — parte dele já foi consumida enquanto o AIT tramitava no talão eletrônico.

```mermaid
flowchart LR
    subgraph p1_teat["Raia: Agente / TEAT ([WF-TEAT-001])"]
        direction LR
        S0((cometimento da infração)) --> T1[Lavrar AIT no talão eletrônico]
        T1 --> G1{"condutor identificado e assina como proprietário?"}
        G1 -->|sim - 918 art.3 §5º| T2["AIT vale como NA (data-limite de defesa impressa)"]
        G1 -->|não| T3[Finalizar e sincronizar]
        T2 --> T3
        T3 --> S1((AIT integrado))
    end

    subgraph p1_aut["Raia: Autoridade de trânsito"]
        direction LR
        S1 --> T4["Julgar consistência e regularidade do AIT - CTB art.281"]
        T4 --> G2{consistente?}
        G2 -->|não - art.281 §1º I| E1((AIT arquivado / insubsistente))
        G2 -->|sim| G3{"AIT já valeu como NA?"}
    end

    subgraph p1_not["Raia: Processamento / Notificação"]
        direction LR
        G3 -->|não| T5[[P2 Notificar - NA ao proprietário]]
        T5 --> S2((NA expedida - inicia T-DEF e T-IND))
        G3 -->|sim| S2
    end

    subgraph p1_timer["Timer de fronteira"]
        direction LR
        TM1((T-NA: 30 dias do cometimento sem expedir NA)) --> E2((AIT arquivado - 918 art.4 §1º))
    end

    subgraph p1_canc["Exceção: cancelamento pós-integração (prática local)"]
        direction LR
        X1[Diretoria de Fiscalização defere cancelamento] --> E3((cancelado pós-integração))
    end

    T4 -. "interrompe" .-> TM1
    S1 -. "pode ocorrer a qualquer momento antes da decisão de defesa" .-> X1
```

Regras que o desenho aplica:

- **Consistência antes de notificar** — a autoridade "julgará a consistência do auto de infração"
  ([REF-CTB-280-290] art. 281). A fila produz **três** desfechos: aceito; corrigido (erro material em
  elemento não essencial, com aprovação da autoridade); arquivado e julgado **insubsistente**
  (art. 281 §1º, I) — este último é decisão vinculada, distinta do arquivamento por decurso do prazo
  da NA (§1º, II), embora ambos sejam terminais sem penalidade ([RN-TEAT-119]).
- **`T-NA` é fatal e automático** — a não expedição da NA em 30 dias do cometimento arquiva o AIT
  ([REF-CONTRAN-918] art. 4º §1º; CTB art. 281 §1º, II). O sistema deve produzir esse arquivamento
  **sem provocação do interessado**. Para autuações **não flagrantes**, o termo inicial é a data do
  conhecimento pelo órgão (CTB art. 282 §6º-A), critério de flagrante conforme
  [REF-CONTRAN-985-1003-MBFT] Seção 7 — o procedimento de contagem fora do flagrante segue
  **(fonte pendente)**, ver [RN-TEAT-108].
- **AIT que vale como NA** — quando o condutor autuado é o proprietário (ou principal condutor
  previamente identificado) e assina o AIT com a data-limite de defesa, dispensa-se a NA
  ([REF-CONTRAN-918] art. 3º §5º; CTB art. 281-A). O marco de ciência é a assinatura
  ([RN-RAIT-104]).
- **Cancelamento pós-integração** — competência da Diretoria de Fiscalização é prática local
  documentada em [REF-DETRANAM-TALAO-BODYCAM], pendente de norma de competência ([RN-TEAT-121]);
  o conteúdo legal do AIT é imutável, o cancelamento é ato apenso.

## §2 — P2: Notificar (sub-processo reutilizável: NA, NP e decisões)

Um único sub-processo serve às três notificações do ciclo (NA, NP, comunicação de decisão). O que
muda é **qual timer o evento de saída inicia**. O ponto crítico é que **cada canal fixa um marco
diferente** ([RN-RAIT-104]).

```mermaid
flowchart LR
    S0((solicitação de notificação)) --> G0{"destinatário aderente ao SNE?"}

    subgraph p2_sne["Canal eletrônico (SNE) — [REF-CONTRAN-931]"]
        direction LR
        G0 -->|sim| A1["Disponibilizar no SNE + enviar mensagem (e-mail/celular)"]
        A1 --> A2((expedida = disponibilização - 931 art.5º))
        A2 --> tm_sne((T-SNE-CIENCIA: 30 dias))
        tm_sne --> A3((ciência ficta - CTB 282-A §2º))
    end

    subgraph p2_post["Canal postal / pessoal — [REF-CONTRAN-918] arts.30-32"]
        direction LR
        G0 -->|não| B1[Gerar documento e entregar à empresa de remessa]
        B1 --> B2((expedida = entrega à ECT - 918 art.30 I))
        B2 --> G1{"retorno da remessa?"}
        G1 -->|entregue| B3((ciência))
        G1 -->|devolvida: endereço desatualizado ou recusa| B4((vale como notificada - CTB 282 §1º))
        G1 -->|falha por outro motivo| B5{"refazer o ato? - 918 art.31"}
        B5 -->|"sim e T-NA / T-DEC não vencidos"| B1
        B5 -->|"tentativas postal/pessoal esgotadas"| C1
    end

    subgraph p2_edit["Canal residual: edital — [REF-CONTRAN-918] art.14"]
        direction LR
        C1[Publicar edital no diário oficial + íntegra no sítio] --> C2((publicada - marco do prazo))
    end

    A3 --> S1((notificação eficaz - inicia o timer do administrado))
    B3 --> S1
    B4 --> S1
    C2 --> S1
    A2 -. "marco do órgão (T-NA / T-DEC)" .-> S2((expedição registrada))
    B2 -. "marco do órgão (T-NA / T-DEC)" .-> S2
```

Regras:

- **Dois marcos, sempre persistidos separadamente**: a **expedição** (relevante para os prazos do
  órgão — `T-NA`, `T-DEC`) e a **ciência** (relevante para os prazos do administrado — `T-DEF`,
  `T-NP-VENC`). No SNE eles distam 30 dias ([REF-CONTRAN-931] arts. 4º §6º e 5º) — confundi-los
  encurta o prazo do cidadão ([RN-RAIT-104]).
- **Leitura pelo cidadão é irrelevante** para a contagem ([REF-CONTRAN-931] art. 4º §7º).
- **Edital é residual e dispensado pelo SNE** ([REF-CONTRAN-918] art. 14 §4º; [RN-RAIT-126]).
- **Refazimento** de notificação falha só dentro dos prazos ([REF-CONTRAN-918] art. 31) — e o sistema
  **bloqueia** refazer a NP depois de vencida a decadência ([RN-RAIT-126], interpretação a validar).

## §3 — P3: Indicação do condutor infrator

```mermaid
flowchart LR
    S0((NA expedida)) --> tm_ind((T-IND: 30 dias da NA - CTB 257 §7º))
    S0 --> C1[Proprietário / principal condutor preenche formulário - 918 art.5º]

    subgraph p3_cid["Raia: Cidadão (Portal, [UC-PORTAL-004])"]
        direction LR
        C1 --> C2{"assinatura do condutor indicado?"}
        C2 -->|gov.br avançada no Portal| C3[Protocolar indicação]
        C2 -->|documento assinado por ambos| C3
    end

    subgraph p3_org["Raia: Processamento (DETRAN-AM)"]
        direction LR
        C3 -. "msg: indicação" .-> O1[Validar conteúdo mínimo e legitimidade - 918 art.5º I-X, art.6º]
        O1 --> G1{regular?}
        G1 -->|não| O2[Devolver com campo apontado - RN-PORTAL uso único]
        O2 -.-> C1
        G1 -->|sim| O3[Registrar indicação no RENACH - 918 art.5º §6º]
        O3 --> O4[[P2 Notificar - NA ao condutor indicado]]
        O4 --> S1((sujeito passivo = condutor; novo T-DEF))
        G1 -->|"enquadra CTB art.162"| O5[Gerar novos AITs - 918 art.5º §2º]
    end

    tm_ind --> G2{"proprietário é PJ?"}
    G2 -->|sim| O6["Lavrar nova multa ao proprietário (2x) - CTB 257 §8º, com defesa e recurso"]
    G2 -->|não| S2((responsável = principal condutor ou proprietário))
    O4 --> tm_nai((T-NA-IND: 30 dias do protocolo da indicação para expedir a nova NA))
```

Regras:

- O prazo de indicação é de **30 dias contados da notificação da autuação** (CTB art. 257 §7º); o
  formulário acompanha a NA ([REF-CONTRAN-918] art. 5º). Na prática, `T-IND` e `T-DEF` vencem juntos.
- A **nova NA ao condutor indicado** tem prazo próprio de expedição de 30 dias contados do protocolo
  da indicação — inclusive quando feita por canal digital (modelo CETRAN-PR,
  [REF-CETRAN-PROCESSO-INTERNO]; [REF-CONTRAN-918] art. 5º §3º).
- **Pessoa jurídica** que não indica sofre **multa dobrada em novo AIT**, com direito a defesa e
  recurso — o RAIT deve aceitar processos com esse objeto ([REF-CTB-280-290] art. 257 §8º).
- O possuidor por arrendamento/comodato/aluguel (contrato ≥180 dias) e o principal condutor
  **equiparam-se ao proprietário** ([REF-CONTRAN-918] arts. 5º §8º e 8º; [RN-RAIT-120]).

## §4 — P4: Defesa prévia (1º circuito) — do recebimento à NP

Este é o processo interno central da 1ª fase. Os estados entre colchetes são os do caso RAIT
([WF-RAIT-001]); o evento de saída alimenta a máquina da infração ([WF-INF-003]).

```mermaid
flowchart TB
    subgraph p4_cid["Raia: Requerente (Portal / balcão / postal / órgão do domicílio)"]
        direction LR
        C0((NA recebida)) --> C1["Compor requerimento - 900 art.3º: um AIT por requerimento"]
        C1 --> C2["Assinar (nível avançado) e protocolar - 900 art.6º"]
        C2 --> C3((protocolo imediato - Lei 14.129 art.27 IV))
        C9[Responder diligência]
        C10[Desistir por escrito até o julgamento - 900 art.11]
    end

    subgraph p4_sec["Raia: Secretaria RAIT"]
        direction LR
        C3 -. "msg: defesa" .-> S1["[PROTOCOLADO] Registrar canal e marco de tempestividade - RN-RAIT-106"]
        S1 --> S2["[TRIAGEM_ADMISSIBILIDADE] 4 critérios - 900 art.4º"]
        S2 --> G1{"tempestiva, legítima, assinada, pedido compatível?"}
        G1 -->|não| S3["[NAO_CONHECIDO] motivo registrado; se intempestiva: arquivada"]
        G1 -->|sim| S4["[ADMITIDO] estende T-DEC para 360d - 918 art.9 §3º"]
        S3 --> S8
        S13["Suprir de ofício documentos do próprio órgão - 900 art.10; CTB 285 §4º"]
    end

    subgraph p4_ana["Raia: Analista (pool defesa prévia, [WF-RAIT-002])"]
        direction LR
        S4 --> S5["[DISTRIBUIDO] claim-next / round-robin"]
        S5 --> S6["[EM_INSTRUCAO] analisar fatos, AIT, evidências"]
        S6 --> G2{"precisa de prova do requerente?"}
        G2 -->|sim| S7["[DILIGENCIA] fixar prazo T-DIL (15 dias úteis, +1x)"]
        S7 -. "msg: diligência" .-> C9
        C9 -. "resposta" .-> S6
        S7 --> tm_dil((T-DIL expira)) --> S9
        G2 -->|não| S9["[PRONTO_P_DECISAO] parecer"]
    end

    subgraph p4_aut["Raia: Autoridade de trânsito"]
        direction LR
        S9 --> S10{"decisão - 918 art.9º, inclusive mérito"}
        S10 -->|acolhida| S11["[DECIDIDO_AUTORIDADE] cancelar AIT, arquivar registro - 918 art.9 §1º"]
        S10 -->|indeferida| S12["[DECIDIDO_AUTORIDADE] aplicar penalidade"]
    end

    subgraph p4_not["Raia: Processamento / Notificação"]
        direction LR
        S11 --> S8[[P2 Notificar resultado - 918 art.9 §1º / art.17]]
        S12 --> S14[[P2 Notificar NP - 918 art.12: valor, desconto, data-limite única]]
        S8 --> E1((AIT cancelado))
        S14 --> E2((NP expedida - inicia T-NP-VENC))
    end

    subgraph p4_timers["Timers de fronteira do 1º circuito"]
        direction LR
        tm_def((T-DEF: data-limite da NA, ≥30d)) -->|sem defesa| S12
        tm_dec((T-DEC: 180d / 360d do cometimento)) -->|NP não expedida| E3((decadência - CTB 282 §7º))
        sla30((SLA local: parecer em 30 dias - meta, não prazo)) -.-> S6
    end

    C10 -. "msg: desistência" .-> S15["[ENCERRADO_DESISTENCIA]"]
    S15 --> S12
```

Regras que o desenho aplica:

- **Admissibilidade é rol fechado** — intempestividade, ilegitimidade, falta de assinatura, pedido
  ausente/incompatível ([REF-CONTRAN-900] art. 4º; [RN-RAIT-001], [RN-RAIT-122]). A tempestividade
  usa o **marco do canal** (postagem na ECT, protocolo no órgão do domicílio, protocolo eletrônico) —
  nunca a data em que a peça chega ao julgador ([RN-RAIT-106]).
- **Nunca exigir documento do próprio órgão**; o órgão supre de ofício ([REF-CTB-280-290] art. 285
  §4º; [REF-CONTRAN-900] arts. 5º p.ú. e 10; [RN-RAIT-003]).
- **Diligência não arquiva**: expirado `T-DIL`, julga-se no estado em que se encontra
  ([REF-CONTRAN-900] art. 9º p.ú.; [RN-RAIT-004]).
- **Defesa tempestiva estende a decadência** de 180 para 360 dias ([REF-CONTRAN-918] art. 9º §3º;
  [RN-RAIT-114]). Defesa **não conhecida por intempestividade** não estende — não foi "apresentada em
  tempo hábil".
- **Defesa não conhecida segue o rito de "sem defesa"**: aplica-se a penalidade e o direito recursal
  nasce da NP (caminho adotado em [WF-RAIT-001] §Decisões pendentes, a confirmar com LEGAL).
- **A NP carrega uma única data** que vale, ao mesmo tempo, para recorrer e para pagar com desconto
  ([REF-CONTRAN-918] art. 12 IV; CTB art. 282 §§4º-5º; [RN-RAIT-102]).
- **Pagamento antecipado** em qualquer fase não interrompe o processo; a NP sai "sem código de
  barras", com o prazo de recurso ([REF-CONTRAN-918] art. 33).

## §5 — P5: Recurso à JARI (2º circuito, 1ª instância)

```mermaid
flowchart TB
    subgraph p5_cid["Raia: Recorrente (parte legítima / procurador)"]
        direction LR
        C0((NP recebida)) --> C1["Interpor recurso perante a autoridade que impôs a penalidade - CTB 285 caput"]
        C1 --> C2((protocolo))
        C3[Desistir por escrito até o julgamento]
        C4[Pagar 80% até o vencimento sem renunciar - CTB 284 §2º]
    end

    subgraph p5_sec["Raia: Secretaria RAIT / Autoridade"]
        direction LR
        C2 -. "msg: recurso 1ª" .-> S1["[PROTOCOLADO] marco de tempestividade por canal"]
        S1 --> S2["[TRIAGEM_ADMISSIBILIDADE]"]
        S2 --> G1{"tempestivo e legítimo?"}
        G1 -->|"intempestivo"| S3["[NAO_CONHECIDO] arquivado - CTB 285 §5º; sem efeito suspensivo; juros desde o vencimento - 918 art.23 §5º"]
        G1 -->|"ilegítimo / sem assinatura / sem pedido"| S3b["[NAO_CONHECIDO] sem efeito suspensivo - CTB 285 §1º"]
        G1 -->|sim| S4["[ADMITIDO] evento RAIT_EFEITO_SUSPENSIVO_INSTAURADO"]
        S4 --> S5["[AGUARDANDO_REMESSA_JARI] anexar de ofício AIT, evidências, decisão da defesa"]
        S5 --> tm_rem((T-REM10: 10 dias da interposição - CTB 285 §2º))
        S5 --> S6[Remeter à JARI]
    end

    subgraph p5_jari["Pool: JARI"]
        direction LR
        S6 -. "remessa" .-> J1["[DISTRIBUIDO] recebimento = marco de T-JUL-24M - CTB 285 §6º"]
        J1 --> J2["Sortear/atribuir relator (round-robin auditável) - [WF-RAIT-002] §3"]
        J2 --> J3["[EM_INSTRUCAO] relator prepara parecer e voto - T-VOTO"]
        J3 --> G2{diligência?}
        G2 -->|sim| J4["[DILIGENCIA] T-DIL"] --> J3
        G2 -->|não| J5["[PRONTO_P_DECISAO]"]
        J5 --> J6[["P6 Sessão colegiada - [PAUTADO] → [JULGADO_SESSAO]"]]
        J6 --> G3{resultado}
        G3 -->|provido| J7((provido))
        G3 -->|negado| J8((negado))
        G3 -->|não conhecido| J9((não conhecido))
    end

    subgraph p5_not["Raia: Processamento / Notificação"]
        direction LR
        J7 --> N1[[P2 Notificar decisão - 918 art.17; informar se a autoridade recorrerá - art.17 p.ú.]]
        J8 --> N1
        J9 --> N1
        S3 --> N1
        S3b --> N1
        N1 --> E1(("[COMUNICADO] - inicia T-R2 (30d) - CTB 288"))
    end

    subgraph p5_timers["Timers de fronteira"]
        direction LR
        tm_np((T-NP-VENC: vencimento da NP sem recurso)) --> E2((instância encerrada - CTB 290 II))
        tm_jul((T-JUL-24M: 24 meses sem julgamento)) --> E3((prescrição da pretensão punitiva - CTB 289-A))
        tm_par((T-PAR-3A: 3 anos parado)) --> E4((prescrição por paralisação - Lei 9.873 art.1 §1º))
        slaj((SLA local: 30 dias úteis - meta)) -.-> J3
    end

    C3 -. "msg" .-> S9["[ENCERRADO_DESISTENCIA] - 900 art.11; não encerra a instância por si - RN-RAIT-123"]
    S9 --> G5{"prazo de recurso ainda aberto?"}
    G5 -->|não| E2
    G5 -->|sim| C0
```

Regras:

- **Interposição perante a autoridade** que impôs a penalidade, não perante a JARI; efeito suspensivo
  **automático, _ope legis_** ([REF-CTB-280-290] art. 285 _caput_; [RN-RAIT-108]). Enquanto vigente,
  **nenhuma restrição** (licenciamento, transferência) e **nenhum encargo moratório**
  ([REF-CONTRAN-918] art. 13; CTB art. 284 §3º).
- **Duas datas obrigatórias**: interposição (marco de `T-REM10`) e **recebimento pela JARI** (marco de
  `T-JUL-24M`). Só a segunda inicia o relógio do art. 289-A ([REF-CTB-280-290] art. 285 §§2º e 6º;
  [RN-RAIT-107], [RN-RAIT-110]). O descumprimento dos 10 dias **não tem sanção legal expressa** — é
  alerta, não transição.
- **Intempestivo é arquivado** (lei) e **ilegítimo é não conhecido** (resolução) — motivos distintos,
  nunca uniformizados ([RN-RAIT-109]). Se o vencimento já passou, a instância já se encerrou pela
  não interposição (art. 290 II); o não conhecimento não a reabre.
- **Advertência por escrito**: não cabe recurso à JARI da decisão que aplica advertência solicitada
  pelo infrator, salvo se concomitante à defesa ([REF-CONTRAN-918] art. 11 §2º) — guarda de entrada do
  processo, não estado.
- **Pagar não é desistir** ([REF-CTB-280-290] art. 284 §2º; art. 286 _caput_ veda _solve et repete_);
  a única hipótese em que pagar equivale a reconhecer é o desconto de 40% pelo SNE (art. 284 §1º).

## §6 — P6: Sessão de julgamento colegiado (JARI e CETRAN-AM)

Sub-processo comum aos dois colegiados, parametrizado por `orgao_julgador`. Detalhamento completo
(pauta, convocação, quorum, votação, empate, ata) em [WF-RAIT-003]; aqui, o esqueleto com os timers.

```mermaid
flowchart LR
    S0((casos PRONTO_P_DECISAO)) --> P1["[FORMANDO_PAUTA] presidente prioriza ALERTA_N3 / CRITICO"]
    P1 --> P2["[PAUTA_FECHADA]"] --> tmc((T-CONV: 5 dias úteis mín. - pendente regimento))
    tmc --> P3["[CONVOCACAO_ENVIADA]"] --> P4["[SESSAO_ABERTA]"]
    P4 --> G1{"quorum? - 357 item 8.2 / 901 item 12.2"}
    G1 -->|não| P5["[SESSAO_ADIADA] - relógios continuam correndo"] --> P1
    G1 -->|sim| P6["[RELATORIA_LIDA] parecer + voto do relator"]
    P6 --> P7["[VOTACAO] maioria simples"]
    P7 --> G2{empate?}
    G2 -->|sim| P8["[DESEMPATE_PRESIDENTE] voto de qualidade - 901 item 12.3"] --> P9
    G2 -->|não| P9["[DECISAO_PROCLAMADA] fundamentada - 357 item 8.3"]
    P9 --> P10["[ATA_LAVRADA]"] --> P11["[ATA_ASSINADA] PAdES+TSA"]
    P11 --> S1(("retorna ao caso: [JULGADO_SESSAO]"))
    P6 -. "vedada por padrão (decisão Owner DT-011)" .-> P12["[SUSTENTACAO_ORAL]"]
```

- **Impedimento**: membro que lavrou o AIT não julga o próprio recurso ([REF-CONTRAN-357] item
  5.1.c) — tratado na distribuição ([WF-RAIT-002] §5).
- **Sessão adiada não suspende nenhum relógio** — adiamentos repetidos são sinal de risco a
  monitorar no dashboard.

## §7 — P7: Recurso ao CETRAN-AM (2ª instância), encerramento da instância e efeitos

```mermaid
flowchart TB
    subgraph p7_cid["Raia: Recorrente"]
        direction LR
        C0(("[COMUNICADO] decisão JARI")) --> tmr2((T-R2: 30 dias da publicação/notificação - CTB 288))
        C0 --> G0{"quem recorre? - CTB 288 §1º"}
        G0 -->|"negado / não conhecido → responsável pela infração"| C1[Interpor recurso ao CETRAN]
        C1 --> C2((protocolo))
    end

    subgraph p7_aut["Raia: Autoridade de trânsito"]
        direction LR
        G0 -->|"provido → autoridade que impôs a penalidade"| A1["Autoridade centralizada verifica cabimento - recurso vinculado, sem contrarrazões (DT-010; RN-RAIT-130)"]
        A1 --> G1{"cabível e dentro de T-R2? - silêncio = renúncia"}
        G1 -->|não| E0((cancelado definitivo: penalidade insubsistente))
        G1 -->|sim| A2["Remessa interna - novo caso nasce em [ADMITIDO], sem triagem cidadã"]
    end

    subgraph p7_sec["Raia: Secretaria RAIT"]
        direction LR
        C2 -. "msg: recurso 2ª" .-> S1["[PROTOCOLADO] → [TRIAGEM_ADMISSIBILIDADE] - tempestividade = 30d do marco de ciência"]
        S1 --> G2{admissível?}
        G2 -->|não| S2["[NAO_CONHECIDO]"]
        G2 -->|sim| S3["[ADMITIDO] anexar de ofício parecer e conclusão da JARI - CTB 285 §4º"]
        A2 --> S3
        S3 --> S4[Remeter ao CETRAN-AM]
    end

    subgraph p7_cet["Pool: CETRAN-AM"]
        direction LR
        S4 -. "remessa" .-> K1["[DISTRIBUIDO] recebimento = marco de T-JUL-24M - CTB 289 caput"]
        K1 --> K2["Relator (round-robin) → [EM_INSTRUCAO] / [DILIGENCIA]"]
        K2 --> K3[["P6 Sessão colegiada"]]
        K3 --> G3{resultado}
        G3 -->|"favorável ao administrado"| K4((provido))
        G3 -->|"penalidade mantida (negado / não conhecido / provido o recurso da autoridade)"| K5((mantida))
    end

    subgraph p7_not["Raia: Processamento / Notificação"]
        direction LR
        K4 --> N1[[P2 Notificar decisão - 918 art.17]]
        K5 --> N1
        S2 --> N1
        N1 --> E1(("[TRANSITADO] - instância encerrada - CTB 290 I - irrecorrível na via administrativa"))
    end

    subgraph p7_efe["Efeitos do encerramento (automáticos)"]
        direction LR
        E1 --> G4{"penalidade subsiste?"}
        G4 -->|sim| F1["Cadastrar penalidade e pontuação no RENACH - 918 art.18; CTB 290 p.ú."]
        F1 --> F2["Liberar restrições; juros Selic + 1% a partir do encerramento - CTB 284 §4º; 918 art.23 §4º"]
        F2 --> G5{paga?}
        G5 -->|sim| E2((quitada))
        G5 -->|não| F3["Cobrança - encaminhar à dívida ativa (fora do escopo; prescrição executória 5 anos - Lei 9.873 art.1º-A)"]
        G4 -->|não| F4{"multa já paga?"}
        F4 -->|sim| F5["Restituir corrigido - CTB 286 §2º (índice pendente - RN-RAIT-129)"] --> E3((cancelado definitivo))
        F4 -->|não| E3
    end

    tmr2 -->|"sem recurso de nenhuma parte"| G6{"decisão JARI era…"}
    G6 -->|provido| E0
    G6 -->|"negado / não conhecido"| E1
    tmj((T-JUL-24M: 24 meses no CETRAN)) --> E4((prescrição - CTB 289-A))
```

Regras:

- **Legitimidade bilateral** ([REF-CTB-280-290] art. 288 §1º): não provimento → recorre o
  responsável; provimento → recorre a autoridade. O regime do recurso da autoridade não tem
  disciplina normativa ([RN-RAIT-130]); **decisão do Owner (DT-010)**: recurso **vinculado**,
  exercido por **autoridade centralizada** (não pelas 55 autoridades investidas), **sem
  contrarrazões** do cidadão; o cargo/setor competente e o prazo próprio seguem sem resposta — os
  casos de uso operam com a janela de 30 dias do art. 288 e **silêncio = renúncia** ([UC-RAIT-008]).
- **Recurso do cidadão** ao CETRAN passa por triagem completa (nova petição); **recurso da autoridade**
  nasce admitido (legitimidade presumida pelo cargo) — [WF-RAIT-001] §Reentrância.
- **O CETRAN encerra a instância** ([REF-CTB-280-290] art. 290 I); não há 3ª instância ordinária.
  A revisão pós-encerramento por fato novo ([REF-LEI-9784-1999] art. 65, subsidiário) fica
  registrada como possibilidade jurídica, mas **o Owner decidiu não oferecer canal de revisão
  pós-encerramento** (steering C.22; [RN-RAIT-119]) — não há transição para isso em [WF-INF-003].
- **Um relógio de 24 meses por instância**, cada um contado do recebimento naquela instância; o
  intervalo entre instâncias **não é computado** ([RN-RAIT-111], [RN-RAIT-112]).
- **RENACH só depois de esgotados os recursos** ([REF-CONTRAN-918] art. 18; [RN-RAIT-131]).
- **Restituição corrigida** é consequência automática do provimento com pagamento prévio, não
  requerimento do cidadão ([REF-CTB-280-290] art. 286 §2º; [RN-RAIT-129]).

## §8 — P8: Portal Público — consulta de infrações, adesão ao SNE e pagamento

```mermaid
flowchart LR
    subgraph p8_cid["Pool: Cidadão (Portal, [WF-PORTAL-001])"]
        direction LR
        C0((login gov.br)) --> C1["Consultar multas, pontuação e situação - [UC-PORTAL-010]"]
        C1 --> C2{"estado da infração?"}
        C2 -->|"NA em prazo"| C3["Defender / indicar condutor / pagar - [JRN-PORTAL-001]"]
        C2 -->|"NP em prazo"| C4["Recorrer à JARI / pagar 80% / reconhecer e pagar 60% (SNE ou termo digital no Portal - DT-026)"]
        C2 -->|"recurso em curso"| C5["Acompanhar andamento (SLA local, nunca '24 meses') - [UC-PORTAL-005]; responder diligência - [UC-PORTAL-009]; desistir - [UC-PORTAL-006]"]
        C2 -->|"decisão JARI comunicada"| C6["Recorrer ao CETRAN em 30d - [UC-PORTAL-003]"]
        C2 -->|"instância encerrada"| C7["Pagar com juros / parcelar por cartão - [UC-PORTAL-015]"]
        C8["Aderir ao SNE - [UC-PORTAL-007] / [WF-PORTAL-003]"]
    end

    subgraph p8_pag["Pool: Arrecadação (rede bancária / SPB)"]
        direction LR
        P1{"quando paga?"}
        P1 -->|"até o vencimento"| P2["80% do valor - CTB 284 caput; 918 art.20"]
        P1 -->|"reconhecimento + renúncia a defesa e recurso, adesão ao SNE antes do envio da NA"| P3["60% do valor - CTB 284 §1º e §6º; 918 art.21; emissão do documento fora do SNE ainda não construída (DT-012)"]
        P1 -->|"após vencimento, instância encerrada"| P4["valor original + Selic + 1% - 918 arts.22-23"]
        P2 --> P5((pagamento confirmado - repasse 5% FUNSET))
        P3 --> P6((pagamento com reconhecimento = encerramento da instância - CTB 290 III))
        P4 --> P5
    end

    subgraph p8_inf["Pool: Infração ([WF-INF-003]) — leitura e eventos"]
        direction LR
        I1[(estado da infração, prazos, marcos, efeito suspensivo)]
        I2((evento: pagamento))
        I3((evento: reconhecimento SNE))
    end

    C1 -. "consulta (espelho RENAINF)" .-> I1
    C3 -. "msg: defesa / indicação" .-> I1
    C4 -. "msg: recurso" .-> I1
    C4 --> P1
    C7 --> P1
    P5 -. "pago=true (não renuncia - CTB 284 §2º)" .-> I2
    P6 -. "encerra" .-> I3
```

Regras:

- **Consultar não exige elevação de nível**; defender, indicar condutor e recorrer exigem assinatura
  **avançada** ([REF-DECRETO-10543-2020] art. 4º II; [RN-PORTAL-101]).
- O Portal **nunca decide mérito** ([WF-PORTAL-001]); ele exibe o estado da infração, os prazos do
  cidadão (data-limite impressa) e os efeitos (efeito suspensivo, "sem restrição enquanto tramita").
- **Pagar não renuncia** ao questionamento (CTB art. 284 §2º) — exceto no reconhecimento pelo SNE, que
  **encerra a instância** (CTB art. 290 III) e por isso é evento de transição em [WF-INF-003].
- **Parcelamento é operação de cartão**, à vista para o órgão; não altera data de quitação nem é
  moratória ([REF-CONTRAN-918] arts. 24 §3º e 27; [RN-PORTAL-126]).

## §9 — Catálogo de timers automáticos

Todos os timers são **eventos de tempo do sistema**: o motor de prazos os cria ao entrar no estado
que os ativa, cancela-os ao sair e dispara a transição ou o alerta indicado quando vencem. Nenhum
depende de ação humana para vencer.

### 9.1 Regras gerais de contagem

| Regra                      | Conteúdo                                                                                                            | Base                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Unidade                    | dias **consecutivos** (corridos); exclui o dia da notificação/publicação, inclui o do vencimento                    | [REF-CONTRAN-918] art. 29; [RN-RAIT-005]                |
| Vencimento em dia não útil | prorroga ao 1º dia útil (calendário **nacional + AM**, porta injetável)                                             | [REF-CONTRAN-918] art. 29 p.ú.; [WF-RAIT-002] §7        |
| `T-DIL`                    | única exceção em **dias úteis** (parâmetro operacional do Owner)                                                    | [WF-RAIT-001]; steering A.7                             |
| Suspensão                  | **nunca automática**; só força maior por ato motivado e auditado, enquanto o regulamento CONTRAN não é localizado   | [REF-CTB-280-290] art. 290-A; [RN-RAIT-105]             |
| Data impressa              | `T-DEF` e `T-NP-VENC` usam a **data impressa** na NA/NP como valor autoritativo; o piso legal (30 dias) é validação | CTB arts. 281-A e 282 §4º; [RN-RAIT-101], [RN-RAIT-102] |
| Marco por canal            | expedição (postal/SNE) × ciência ficta (SNE +30d) × publicação (edital) × assinatura (AIT≡NA)                       | [RN-RAIT-104]                                           |
| Tempestividade de peça     | postagem na ECT / protocolo no órgão do domicílio / protocolo eletrônico / balcão                                   | [REF-CONTRAN-900] art. 6º; [RN-RAIT-106]                |

### 9.2 Timers do ciclo da infração

| Código          | Antigo ([WF-INF-001]) | Prazo                                          | Termo inicial                                                                                                                                                                              | Ativo no estado ([WF-INF-003])                 | Ao vencer                                                                          | Base                                                                           |
| --------------- | --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `T-NA`          | T1                    | 30 dias                                        | cometimento (não flagrante: conhecimento pelo órgão — contagem pendente)                                                                                                                   | `AIT_LAVRADO`                                  | **transição** → `ARQUIVADO` (motivo `na_nao_expedida`)                             | [REF-CONTRAN-918] art. 4º §1º; CTB art. 281 §1º II                             |
| `T-SNE-CIENCIA` | —                     | 30 dias                                        | disponibilização no SNE + envio da mensagem                                                                                                                                                | qualquer notificação por SNE                   | **marco**: fixa a ciência do administrado                                          | CTB art. 282-A §2º; [REF-CONTRAN-931] art. 4º §6º                              |
| `T-DEF`         | T2                    | data impressa na NA (≥30 dias da expedição)    | expedição da NA / ciência conforme canal                                                                                                                                                   | `NOTIFICADO_AUTUACAO`                          | **transição** → `PENALIDADE_A_APLICAR` (sem defesa)                                | [REF-CONTRAN-918] art. 4º §2º; CTB art. 281-A; [RN-RAIT-101]                   |
| `T-IND`         | —                     | 30 dias                                        | notificação da autuação                                                                                                                                                                    | `NOTIFICADO_AUTUACAO`                          | **regra**: responsável = principal condutor/proprietário; PJ → novo AIT dobrado    | CTB art. 257 §§7º-8º                                                           |
| `T-NA-IND`      | —                     | 30 dias                                        | protocolo da indicação de condutor                                                                                                                                                         | `INDICACAO_EM_PROCESSAMENTO`                   | **transição** → `ARQUIVADO` quanto ao condutor indicado (a validar)                | [REF-CONTRAN-918] art. 5º §3º; [REF-CETRAN-PROCESSO-INTERNO] (PR)              |
| `T-DEC`         | T3 / T3'              | 180 dias; 360 dias se defesa tempestiva        | cometimento (não flagrante: §6º-A)                                                                                                                                                         | `AIT_LAVRADO` → `PENALIDADE_A_APLICAR`         | **transição** → `EXTINTO_DECADENCIA` se NP não expedida                            | CTB art. 282 §§6º-7º; [REF-CONTRAN-918] art. 9º §§2º-3º; [RN-RAIT-114]         |
| `T-NP-VENC`     | T4                    | data impressa na NP (≥30 dias da notificação)  | notificação da penalidade (ciência conforme canal)                                                                                                                                         | `NOTIFICADO_PENALIDADE`                        | **transição** → `INSTANCIA_ENCERRADA` (não interposição); fim do desconto          | CTB art. 282 §§4º-5º e 290 II; [REF-CONTRAN-918] art. 12 IV                    |
| `T-REM10`       | —                     | 10 dias                                        | interposição do recurso à JARI                                                                                                                                                             | `RECURSO_1A_INSTANCIA` (sub `remessa`)         | **alerta** (SLA legal do órgão, sem sanção expressa)                               | CTB art. 285 §2º; [RN-RAIT-107]                                                |
| `T-JUL-24M`     | —                     | 24 meses (um por instância)                    | recebimento do recurso pelo órgão julgador (JARI; depois CETRAN)                                                                                                                           | `RECURSO_1A_INSTANCIA`, `RECURSO_2A_INSTANCIA` | **transição** → `EXTINTO_PRESCRICAO`; escada de alertas 12/18/21/23 meses          | CTB arts. 285 §6º, 289, 289-A; [RN-RAIT-110]…[RN-RAIT-112]; [WF-RAIT-002] §4.1 |
| `T-DIL`         | —                     | 15 dias úteis, prorrogável 1x                  | abertura da diligência                                                                                                                                                                     | caso RAIT em `DILIGENCIA`                      | **transição** do caso → `PRONTO_P_DECISAO` (julga no estado)                       | [REF-CONTRAN-900] art. 9º p.ú.; [RN-RAIT-004]                                  |
| `T-R2`          | T5                    | 30 dias fixos                                  | **publicação** da decisão da JARI (decisão Owner C.24; para a autoridade, o mesmo marco)                                                                                                   | `AGUARDANDO_RECURSO_2A`                        | **transição** → `INSTANCIA_ENCERRADA` (negado) ou `CANCELADO_DEFINITIVO` (provido) | CTB art. 288; [RN-RAIT-103], [RN-RAIT-130]                                     |
| `T-PAR-3A`      | —                     | 3 anos sem movimentação                        | último ato registrado (reinicia a cada movimentação)                                                                                                                                       | qualquer estado pendente de julgamento         | **transição** → `EXTINTO_PRESCRICAO` (validade para órgão estadual a validar)      | [REF-LEI-9873-1999] art. 1º §1º; [RN-RAIT-113]                                 |
| `T-PRESC-5A`    | —                     | 5 anos                                         | prática do ato; **interrompido** só pelas hipóteses do art. 2º (notificação, inclusive edital; ato inequívoco de apuração); se a NP interrompe é questão aberta — **sem auto-reset na NP** | todo o ciclo até o encerramento                | **transição** → `EXTINTO_PRESCRICAO` (idem); escada 30/45/54/60 meses              | [REF-LEI-9873-1999] arts. 1º e 2º; [REF-CONTRAN-918] art. 36; [RN-RAIT-113]    |
| `T-VOTO`        | —                     | 20 dias (proposta)                             | distribuição ao relator                                                                                                                                                                    | caso RAIT em `EM_INSTRUCAO` (2º circuito)      | **alerta** → advertência do relator (modelo CETRAN-ES)                             | [WF-RAIT-003] (pendente regimento)                                             |
| `T-CONV`        | —                     | 5 dias úteis (proposta)                        | fechamento da pauta                                                                                                                                                                        | sessão em `PAUTA_FECHADA`                      | **guarda**: convocação insuficiente invalida a sessão                              | [WF-RAIT-003] (pendente regimento)                                             |
| SLA-30          | —                     | 30 dias (defesa) / 30 dias úteis (JARI) — meta | protocolo / entrada na JARI                                                                                                                                                                | 1º e 2º circuitos                              | **indicador** de qualidade; nunca transição                                        | [REF-DETRANAM-SERVICOS]; [WF-RAIT-002] §4.4                                    |

### 9.3 Linha do tempo de referência (dia 0 = cometimento, caso sem atrasos)

```mermaid
gantt
    title Relógios da infração — cometimento hipotético em 01/01/2026, cada prazo usado até o limite
    dateFormat YYYY-MM-DD
    axisFormat %m/%Y
    section Órgão
    T-NA expedir NA (30d)                   :crit, tna, 2026-01-01, 30d
    T-DEC sem defesa (180d)                 :tdec1, 2026-01-01, 180d
    T-DEC com defesa tempestiva (360d)      :tdec2, 2026-01-01, 360d
    section Administrado
    T-SNE-CIENCIA ciência ficta (se SNE)         :tsne, after tna, 30d
    T-DEF defesa / T-IND indicação (≥30d)   :tdef, after tsne, 30d
    T-NP-VENC recurso e desconto (≥30d)     :tnp, after tdec1, 30d
    section Instâncias
    T-REM10 remessa à JARI (10d)            :trem, after tnp, 10d
    T-JUL-24M JARI (24 meses)               :crit, tjul1, after trem, 730d
    T-R2 recurso ao CETRAN (30d)            :tr2, after tjul1, 30d
    T-JUL-24M CETRAN (24 meses)             :crit, tjul2, after tr2, 730d
    section Extinção
    T-PAR-3A paralisação (3 anos, reinicia) :tpar, after trem, 1095d
    T-PRESC-5A quinquenal (interrompível)   :tpre, 2026-01-01, 1825d
```

A linha do tempo é **ilustrativa**: mostra que o teto legal somado (24 + 24 meses) ultrapassa em
muito os prazos do cidadão, e por que a escada de alertas de [WF-RAIT-002] existe. O SLA local
(30 dias) não aparece porque não é prazo.

## §10 — Eventos de mensagem entre pools (contrato)

| Evento                              | De → Para               | Conteúdo mínimo                                                     | Efeito em [WF-INF-003]                                 |
| ----------------------------------- | ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| `AIT_INTEGRADO`                     | TEAT → INF              | ait_id, cometimento, flagrante?, sujeito, AIT≡NA?                   | cria a infração em `AIT_LAVRADO`; arma `T-NA`, `T-DEC` |
| `NOTIFICACAO_EXPEDIDA`              | P2 → INF                | tipo (NA/NP/decisão), canal, data_expedicao, data_limite impressa   | marco do órgão                                         |
| `NOTIFICACAO_CIENCIA`               | P2 → INF                | data_ciencia (efetiva/ficta/publicação/assinatura)                  | arma `T-DEF` ou `T-NP-VENC`                            |
| `CONDUTOR_INDICADO`                 | Portal → INF            | condutor, protocolo, assinaturas                                    | `INDICACAO_EM_PROCESSAMENTO`                           |
| `RAIT_CASO_PROTOCOLADO`             | RAIT → INF, Portal      | caso_id, instancia, canal, marco de tempestividade                  | `DEFESA_EM_JULGAMENTO` / `RECURSO_*`                   |
| `RAIT_EFEITO_SUSPENSIVO_INSTAURADO` | RAIT → INF              | caso_id                                                             | `efeito_suspensivo=true`; bloqueia restrições          |
| `RAIT_RECURSO_RECEBIDO_JULGADOR`    | RAIT → INF, Dashboard   | caso_id, órgão, data_recebimento                                    | arma `T-JUL-24M` da instância                          |
| `RAIT_DECISAO_PUBLICADA`            | RAIT → INF, Portal, SNE | caso_id, decisão (acolhida/indeferida/provido/negado/não conhecido) | transição de fase                                      |
| `RAIT_CASO_TRANSITADO`              | RAIT → INF              | caso_id                                                             | `INSTANCIA_ENCERRADA` / `CANCELADO_DEFINITIVO`         |
| `PAGAMENTO_CONFIRMADO`              | Arrecadação → INF       | valor, faixa (80/60/100+juros), reconhecimento?                     | `pago=true`; se reconhecimento SNE → encerra instância |
| `PENALIDADE_DEFINITIVA`             | INF → RENACH (adapter)  | ait_id, pontuação, sujeito                                          | efeito de `INSTANCIA_ENCERRADA`                        |
| `RESTITUICAO_DEVIDA`                | INF → Arrecadação       | valor pago, índice                                                  | efeito de `CANCELADO_DEFINITIVO` com `pago=true`       |

## Diagramas renderizados (SVG)

Renderizados a partir dos blocos Mermaid deste documento (Mermaid 11.4.1, tema neutro); regenerar
sempre que um bloco mudar.

| Seção | Arquivo                                                                   |
| ----- | ------------------------------------------------------------------------- |
| §0    | [mapa de colaboração](./diagrams/WF-INF-002-s0-mapa-colaboracao.svg)      |
| §1    | [lavratura e NA](./diagrams/WF-INF-002-s1-lavratura-na.svg)               |
| §2    | [notificar](./diagrams/WF-INF-002-s2-notificar.svg)                       |
| §3    | [indicação de condutor](./diagrams/WF-INF-002-s3-indicacao-condutor.svg)  |
| §4    | [defesa prévia](./diagrams/WF-INF-002-s4-defesa-previa.svg)               |
| §5    | [recurso à JARI](./diagrams/WF-INF-002-s5-recurso-jari.svg)               |
| §6    | [sessão colegiada](./diagrams/WF-INF-002-s6-sessao-colegiada.svg)         |
| §7    | [CETRAN e encerramento](./diagrams/WF-INF-002-s7-cetran-encerramento.svg) |
| §8    | [portal público](./diagrams/WF-INF-002-s8-portal.svg)                     |
| §9.3  | [linha do tempo](./diagrams/WF-INF-002-s9-linha-do-tempo.svg)             |

Página consolidada com todos os diagramas embutidos (este documento e [WF-INF-003]):
[Trilha da Infração de Trânsito](./diagrams/trilha-infracao.html).

## Decisões de modelagem pendentes

- **Contagem de `T-NA`/`T-DEC` fora do flagrante** (CTB art. 282 §6º-A) — procedimento CONTRAN não
  localizado; até lá, o motor usa o cometimento e registra a data de conhecimento pelo órgão para
  auditoria ([RN-TEAT-108]).
- **Desfecho de `T-NA-IND` vencido** (NA ao condutor indicado não expedida em 30 dias) — a norma dá o
  termo inicial, não a consequência; proposta: a indicação perde efeito quanto ao condutor e a
  responsabilidade retorna ao proprietário, **sem** reabrir `T-NA` do AIT original. Validar com LEGAL.
- **Prazo e cargo do recurso vinculado da autoridade** ([RN-RAIT-130], DT-010; prazo de 30 dias decidido em 2026-09-13, steering H.47) — natureza e
  ausência de contrarrazões já decididas pelo Owner; prazo próprio e setor competente seguem
  abertos; o desenho usa a janela de 30 dias do art. 288 contada da publicação.
- **Escada do relógio B**: [RN-RAIT-112] fixa quatro degraus (crítico em 21 meses) e [WF-RAIT-002]
  §4.1 cinco (crítico em 23 meses) — este documento segue [WF-RAIT-002] (aprovado em steering A.1);
  reconciliar a RN.
- **Efeito da desistência da defesa prévia sobre a extensão a 360 dias** — em aberto
  (legal-assessment, item 17); o desenho mantém 360 dias porque a defesa foi apresentada em tempo
  hábil.
- **Efeito de `T-JUL-24M` vencido** — prescrição automática declarável de ofício (leitura de
  [RN-RAIT-112]); se o julgamento tardio é nulo ou ineficaz segue em aberto.
- **Validade de `T-PAR-3A` e `T-PRESC-5A`** para órgão estadual via [REF-CONTRAN-918] art. 36 —
  questão jurídica aberta ([RN-RAIT-113]); modelados como relógios com alerta, transição a confirmar.
- **Desconto de 40% sem adesão do órgão ao SNE** (Lei 14.599/2023) — conflito com [REF-CONTRAN-918]
  art. 21 ([RN-RAIT-127]); o gateway de pagamento do P8 expõe a condição como parâmetro.
- **Prazo institucional de "120 dias"** citado pela Sub Gerência de Infração ([APP-RAIT]) — não
  reconciliado; não adotado.

## Decisões

- **2026-09-12** — redação inicial (rodada de modelagem BPM, Owner). Sem decisões vinculantes; o
  documento propõe a costura dos workflows existentes e o catálogo unificado de timers, e serve de
  base à máquina de estados consolidada em [WF-INF-003].
- **2026-09-12** — Owner: [WF-INF-003] substitui [WF-INF-001] (ADR-0014). Referências deste
  documento ao antigo artefato passam a ser históricas.
