---
id: WF-PORTAL-002
title: Identidade e autorização por ato — login gov.br, elevação de nível e representação
status: reviewed
apps: [portal, rait]
sources:
  [
    REF-DECRETO-10543-2020,
    REF-DECRETO-8936-2016,
    REF-LEI-14063-2020,
    REF-LEI-13460-2017,
    REF-LEI-14129-2021,
    REF-CONTRAN-900,
  ]
updated: 2026-08-26
---

## Escopo e fronteira (leia primeiro)

Este workflow é a **ponte de entrada** de [WF-PORTAL-001] — todo `SERVICO_SELECIONADO` passa por
aqui antes de chegar a `PEDIDO_EM_COMPOSICAO`. Modela duas coisas distintas que o briefing tratava
como uma só pergunta:

1. **Nível de assinatura eletrônica exigido pelo ato** (Decreto 10.543/2020 art.4º) —
   simples/avançada/qualificada, eixo **normativo**.
2. **Nível de confiabilidade da conta gov.br** (bronze/prata/ouro) — eixo **operacional da própria
   Plataforma gov.br**, sem Decreto/Portaria específico como fundamento formal (achado do dossiê de
   pesquisa). Modelado aqui como o _mecanismo_ pelo qual o nível de assinatura normativo é obtido na
   prática, não como exigência normativa autônoma — ver anotação em cada transição.

**Princípio de desenho não negociável**: nível insuficiente nunca é beco sem saída. Toda transição
de "insuficiente" tem uma transição de saída guiada para "elevado" — o cidadão nunca vê um erro
sem um próximo passo acionável.

## Estados

`ANONIMO` · `AUTENTICADO_GOVBR` · `ATO_SELECIONADO` · `NIVEL_VERIFICADO` · `NIVEL_SUFICIENTE` ·
`NIVEL_INSUFICIENTE` · `ELEVACAO_GUIADA` · `NIVEL_ELEVADO` · `ELEVACAO_ABANDONADA` ·
`ATUANDO_EM_NOME_PROPRIO` · `PROCURACAO_APRESENTADA` · `PROCURACAO_VALIDADA` ·
`PROCURACAO_RECUSADA` · `VINCULO_VERIFICADO`.

## Transições e gatilhos

```mermaid
stateDiagram-v2
    [*] --> ANONIMO
    ANONIMO --> AUTENTICADO_GOVBR : login gov.br — Plataforma gov.br\n[REF-DECRETO-8936-2016]; CPF como\nidentificador único — Lei 13.460 art.10-A

    AUTENTICADO_GOVBR --> ATO_SELECIONADO : cidadão escolhe serviço\n[WF-PORTAL-001] SERVICO_SELECIONADO

    ATO_SELECIONADO --> NIVEL_VERIFICADO : sistema consulta a matriz\nato→nível — Decreto 10.543/2020 art.4º\n(ver tabela em [WF-PORTAL-001])

    NIVEL_VERIFICADO --> NIVEL_SUFICIENTE : nível de assinatura da conta atual\n≥ nível exigido pelo ato
    NIVEL_VERIFICADO --> NIVEL_INSUFICIENTE : nível abaixo do exigido\n(ex.: conta bronze/simples tentando\nassinar defesa — exige avançada)

    NIVEL_INSUFICIENTE --> ELEVACAO_GUIADA : sistema explica QUAL nível falta\ne COMO obtê-lo — nunca "acesso negado"\nseco — Lei 13.460 art.4º (adequação\nmeios/fins) · Lei 14.129 art.3º XVIII

    ELEVACAO_GUIADA --> NIVEL_ELEVADO : validação concluída — biográfica/\ndocumental (agente/remota) OU\nbiométrica (base governamental) OU\ncertificado ICP-Brasil — Decreto\n10.543/2020 art.5º, I-III
    ELEVACAO_GUIADA --> ELEVACAO_ABANDONADA : cidadão interrompe o processo\nde elevação — indicador de produto\n(taxa de elevação abandonada)
    ELEVACAO_ABANDONADA --> ELEVACAO_GUIADA : cidadão retoma depois —\nnunca expira sem novo convite

    NIVEL_ELEVADO --> NIVEL_SUFICIENTE
    NIVEL_SUFICIENTE --> ATUANDO_EM_NOME_PROPRIO : parte legítima é o próprio\ncidadão — [REF-CONTRAN-900] art.2º I-II

    NIVEL_SUFICIENTE --> PROCURACAO_APRESENTADA : cidadão atua como procurador/\nrepresentante de terceiro ou PJ\n[REF-CONTRAN-900] art.2º §2º

    PROCURACAO_APRESENTADA --> PROCURACAO_VALIDADA : documento de representação\nconferido (upload assinado OU\ne-CPF/procuração eletrônica do\noutorgante, quando disponível)
    PROCURACAO_APRESENTADA --> PROCURACAO_RECUSADA : documento não comprova\nrepresentação — risco de não\nconhecimento a jusante [RN-RAIT-121]
    PROCURACAO_RECUSADA --> PROCURACAO_APRESENTADA : cidadão reenvia documento\ncorrigido — nunca reinício completo

    ATUANDO_EM_NOME_PROPRIO --> VINCULO_VERIFICADO : checa vínculo cidadão↔veículo/\nprocesso/CNH antes de liberar\n[WF-PORTAL-001] PEDIDO_EM_COMPOSICAO
    PROCURACAO_VALIDADA --> VINCULO_VERIFICADO

    VINCULO_VERIFICADO --> [*] : segue a [WF-PORTAL-001]
```

## Prazos e timers (base legal por prazo)

Nenhum prazo legal numérico localizado para autenticação/elevação de nível — a Plataforma gov.br
opera esses processos de forma assíncrona, sem teto normativo capturado nesta rodada. Nenhum timer
proposto; a métrica relevante aqui é de **taxa**, não de prazo — ver KPI "taxa de elevação de
nível abandonada" em [APP-PORTAL].

## Atores por transição

| Ator                                                           | Transições onde atua                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Cidadão / Condutor / Proprietário / Procurador                 | login, escolhe ato, completa (ou abandona) elevação, apresenta procuração                 |
| Plataforma gov.br (validador externo, [REF-DECRETO-8936-2016]) | autentica, opera a validação biométrica/biográfica/certificado da elevação                |
| Sistema PORTAL                                                 | consulta matriz ato→nível, guia a elevação, valida documento de procuração, checa vínculo |

## Matriz "ato → nível de assinatura" (referência normativa, ver detalhe em [REF-DECRETO-10543-2020])

| Ato                                           | Nível mínimo (Decreto 10.543/2020 art.4º)                                         | Base                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| Consultar multas/pontuação/CNH-e/CRLV-e       | Simples                                                                           | art.4º I, "b"                         |
| Autocadastro / adesão ao SNE                  | Simples a Avançada                                                                | art.4º II, "d"                        |
| Indicar condutor                              | Avançada                                                                          | art.4º II, "f"                        |
| Defesa prévia / recurso JARI / recurso CETRAN | Avançada                                                                          | art.4º II, "h" (nomeia expressamente) |
| Pagamento (solicitação de guia)               | Simples — segurança da transação em si é do meio de pagamento, fora deste Decreto | —                                     |

**Confiança da matriz: alta** para a coluna de assinatura (texto normativo verbatim). A
equivalência operacional com bronze/prata/ouro da conta gov.br é **inferência razoável, não
normativa** (nenhuma norma cruza os dois eixos explicitamente) — recomenda-se validação com LEGAL
antes de travar qualquer UX que apresente bronze/prata/ouro como "exigência legal".

## Decisões de modelagem pendentes

- **Equivalência bronze/prata/ouro ↔ simples/avançada/qualificada** — tratada aqui como
  inferência de produto, não como norma. Se uma norma futura cruzar os dois eixos explicitamente,
  este workflow precisa de revisão.
- **Prazo de validade da elevação** (uma vez elevado, por quanto tempo a conta mantém o nível?) —
  não é pergunta deste workflow (é política da Plataforma gov.br, fora do controle do DETRAN-AM),
  mas o PORTAL deve tratar `NIVEL_ELEVADO` como reconsultado a cada ato, não como cache permanente.
- **Procuração eletrônica interoperável** (e-CPF do outorgante validando automaticamente, sem
  upload) — não confirmado como disponível hoje; `PROCURACAO_APRESENTADA→PROCURACAO_VALIDADA` via
  upload manual é o caminho garantido; o caminho automático é aspiracional.

## Decisões

- **2026-08-24** — BPO, rodada CRAWLER→BPO (`_intake/research-dossier.md`): desenho inicial a
  partir da matriz ato→nível do Decreto 10.543/2020 art.4º e da correção de premissa sobre a origem
  de bronze/prata/ouro (não é este Decreto, é padrão operacional da Plataforma gov.br).
