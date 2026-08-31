---
id: UC-TEAT-011
title: Diretoria de Fiscalização decide cancelamento de AIT pós-finalização
status: reviewed
apps: [teat]
sources: [REF-DETRANAM-TALAO-BODYCAM, REF-SENATRAN-997]
updated: 2026-08-26
---

## Ator e objetivo

Agente ou autoridade de trânsito submete pedido de cancelamento de um AIT já finalizado/
sincronizado; a **Diretoria de Fiscalização** do órgão decide, preservando a imutabilidade do
conteúdo legal do ato original — o cancelamento é um ato **novo e apenso**, nunca uma reescrita.
Distinto do cancelamento de rascunho em curso ([REF-SENATRAN-997] Anexo II, k), coberto dentro do
próprio fluxo de lavratura, [UC-TEAT-001]).

## Pré-condições

- AIT em qualquer estado a partir de `FINALIZADO_LOCAL` em [WF-TEAT-001] (finalizado, recebido,
  em validação, aceito, ou já integrado).
- Motivo justificado para o pedido de cancelamento (erro material grave, duplicidade não
  detectada automaticamente, ou outra hipótese que a instrução formal considere cabível).

## Fluxo principal

1. Agente ou traffic-authority identifica a necessidade de cancelar um AIT já finalizado —
   diferente de erro saneável por [UC-TEAT-006] (que corrige campo, não cancela o ato).
2. Solicitante submete pedido formal de cancelamento, com justificativa, endereçado à Diretoria de
   Fiscalização — `SOLICITADO_CANCEL_POSFINAL` em [WF-TEAT-001].
3. Diretoria de Fiscalização analisa o pedido (fora do fluxo padrão de saneamento/aceite/rejeição
   de [WF-TEAT-001], que trata de mérito da infração e inconsistências formais, não de
   cancelamento pós-ato).
   4a. **Defere**: AIT marcado `CANCELADO_POSFINAL`; conteúdo legal original permanece **imutável e
   preservado** ([RN-TEAT-004]) — o cancelamento é registrado como evento apenso, com motivo,
   responsável e data, nunca como edição do AIT original.
   4b. **Indefere**: AIT retorna ao estado em que estava antes do pedido, sem alteração.
4. Sistema comunica o solicitante do desfecho.

## Fluxos alternativos / exceções

- **Base de confiança da fonte**: este fluxo decorre de prática operacional real do DETRAN-AM
  (notícia institucional, não portaria numerada) — marcado **prática-pendente-de-norma**, confiança
  moderada. Recomenda-se ao Owner buscar portaria/regimento interno específico do DETRAN-AM que
  formalize a competência da Diretoria de Fiscalização antes de tratar este fluxo como definitivo
  de produto (ver `_intake/bpo-notes.md` §2).
- **Diferença de UX com [UC-TEAT-001] cancelamento de rascunho**: cancelamento de rascunho é ação
  imediata do agente no próprio app, com aprovação simples da autoridade; cancelamento
  pós-finalização é um fluxo de **submissão formal**, deliberadamente mais lento e visível — não
  deve parecer uma ação imediata do agente (recomendação de UX do dossiê de pesquisa).
- **Efeito sobre medida administrativa vinculada**: cancelamento do AIT não prejudica
  necessariamente medida administrativa já aplicada e concluída ([RN-TEAT-004];
  [REF-CONTRAN-985-1003-MBFT] Seção 8) — Diretoria de Fiscalização avalia separadamente se a
  medida também deve ser desfeita.

## Pós-condições

AIT permanece `CANCELADO_POSFINAL` (com histórico completo preservado) ou retorna ao estado de
origem sem alteração; em nenhum dos dois casos o conteúdo legal original é reescrito.

## Critérios de aceitação

**AC-TEAT-011-1 — cancelar é apensar, nunca reescrever**

- **Dado** um AIT com cancelamento deferido
- **Quando** o estado muda para `CANCELADO_POSFINAL`
- **Então** o conteúdo legal original e seu `content_hash` permanecem intactos e verificáveis
  ([RN-TEAT-004], [RN-TEAT-121]); o cancelamento existe como evento apenso com motivo, responsável
  e data

**AC-TEAT-011-2 — competência é da Diretoria de Fiscalização**

- **Dado** um pedido de cancelamento pós-finalização
- **Quando** ele é decidido
- **Então** só a Diretoria de Fiscalização defere ou indefere — nem o agente nem o operador de
  processamento têm essa ação disponível ([RN-TEAT-121])

**AC-TEAT-011-3 — é fluxo de submissão formal, e a UI mostra isso**

- **Dado** o agente no aplicativo
- **Quando** aciona o cancelamento de um auto já finalizado
- **Então** a interface o apresenta como submissão formal com justificativa obrigatória e
  acompanhamento, deliberadamente distinta do cancelamento de rascunho, que é ação imediata
  ([RN-TEAT-120])

**AC-TEAT-011-4 — indeferir devolve ao estado exato de origem**

- **Dado** um pedido indeferido
- **Quando** a decisão é registrada
- **Então** o AIT retorna ao estado anterior sem qualquer alteração de conteúdo, e o indeferimento
  fica no histórico

**AC-TEAT-011-5 — a medida vinculada é avaliada à parte**

- **Dado** um AIT cancelado com medida administrativa já concluída
- **Quando** o cancelamento é deferido
- **Então** a medida **não** é desfeita automaticamente ([RN-TEAT-123]); a Diretoria decide
  separadamente, e a decisão fica registrada

**AC-TEAT-011-6 — a base normativa frágil é visível**

- **Dado** este fluxo em produção
- **Quando** um operador o consulta
- **Então** o sistema o rotula como prática do DETRAN-AM sem base normativa federal
  ([RN-TEAT-121]) — pendência de portaria local, não certeza jurídica

## Regras aplicáveis

- [RN-TEAT-004] (imutabilidade pós-finalização — cancelamento é apenso, não reescrita)
- [RN-TEAT-121] (cancelamento de AIT finalizado — prática do DETRAN-AM sem base normativa
  federal); para o cancelamento de auto ainda em preenchimento, ver [RN-TEAT-120]
