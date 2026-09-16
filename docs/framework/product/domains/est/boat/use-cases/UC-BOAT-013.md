---
id: UC-BOAT-013
title: Órgão atende pedido de acesso, correção ou eliminação do titular
status: draft
apps: [boat, portal]
sources: [RN-BOAT-126, IU-BOAT-001, APP-BOAT]
updated: 2026-09-16
---

## Ator e objetivo

Encarregado e operadores autorizados do órgão recebem e tratam pedido do titular, de seu
representante ou familiar legitimado, relativo aos dados pessoais do registro de sinistro. O
caso cobre confirmação de tratamento, acesso, correção e anonimização, bloqueio ou eliminação
quando cabível, com finalidade declarada e trilha auditável ([RN-BOAT-126]). A interface de
retaguarda é W-05 ([IU-BOAT-001]).

## Pré-condições

O pedido identifica o titular e o registro a que se refere, e informa a finalidade do acesso ou
da operação solicitada. A legitimidade e o vínculo do solicitante são verificados antes da
entrega ou alteração de dados ([RN-BOAT-126]).

## Fluxo principal

1. O órgão recebe o pedido e registra o titular, o registro de sinistro, o tipo de pedido e a
   finalidade declarada.
2. O operador autorizado consulta os dados e a trilha de operações sob controle de acesso
   reforçado; qualquer acesso a dado de vítima é auditado com finalidade ([RN-BOAT-126]).
3. Para acesso, o sistema prepara a resposta com os dados do próprio titular e suprime dados
   sensíveis de terceiros, salvo requisição de autoridade ([RN-BOAT-126]).
4. Para correção, o pedido é encaminhado ao fluxo de análise do órgão e o resultado é registrado
   junto ao pedido. Para anonimização, bloqueio ou eliminação, o sistema registra a decisão e a
   execução quando cabível.
5. O órgão comunica ao solicitante a decisão e mantém a trilha do atendimento.

## Fluxos alternativos / exceções

- **1a. Prazo ou procedimento não confirmado.** O pedido permanece com prazo e procedimento
  `source_pending` até definição formal do órgão (OD proposta; [RN-BOAT-126]). Não se inventa
  prazo nesta ficha.
- **2a. Pedido sem legitimidade comprovada.** O órgão não entrega nem altera dados; registra a
  decisão e a justificativa no atendimento.
- **3a. Registro contém dado sensível de terceiro.** A resposta mantém a supressão desse dado,
  salvo requisição de autoridade ([RN-BOAT-126]).

## Pós-condições

Pedido com tipo, finalidade, decisão, resposta e trilha auditável registrados; dados entregues,
corrigidos, anonimizados, bloqueados ou eliminados somente quando a decisão do órgão determinar.

## Critérios de aceitação

**AC-BOAT-013-1 — pedido tem finalidade e trilha**

- **Dado** um pedido de titular
- **Quando** o órgão o recebe e processa
- **Então** registra tipo, finalidade, identidade do solicitante, decisão e operações realizadas
  ([RN-BOAT-126])

**AC-BOAT-013-2 — acesso não revela saúde de terceiro**

- **Dado** um pedido de acesso a registro com vítima
- **Quando** a resposta é preparada para outro titular
- **Então** os campos de saúde da vítima são suprimidos ([RN-BOAT-126])

**AC-BOAT-013-3 — prazo permanece pendente quando não há fonte**

- **Dado** um pedido cujo prazo aplicável ao órgão não está confirmado
- **Quando** o atendimento é registrado
- **Então** o prazo fica `source_pending` e gera OD, sem constante inventada

## Regras aplicáveis

- [RN-BOAT-126]
