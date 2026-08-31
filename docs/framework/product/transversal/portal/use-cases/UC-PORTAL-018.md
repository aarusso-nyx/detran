---
id: UC-PORTAL-018
title: Cidadão solicita acesso aos próprios dados tratados pelo DETRAN-AM (LGPD)
status: reviewed
apps: [portal]
sources: [REF-LEI-13709-2018, REF-LEI-14129-2021]
updated: 2026-08-26
---

## Ator e objetivo

Titular de dados exerce o direito de confirmação de existência de tratamento e de acesso aos
próprios dados pessoais mantidos pelo DETRAN-AM em qualquer sistema (TEAT, RAIT, BOAT, PEC), nos
termos da LGPD, sem precisar identificar previamente em qual sistema o dado está.

## Pré-condições

- Cidadão identificado; nível de assinatura consistente com a sensibilidade do dado solicitado —
  consulta simples para confirmação de existência, avançada se envolver dado sensível (ex. clínico
  do PEC) por prudência, mesmo sem norma específica cruzando os dois eixos para este ato
  ([WF-PORTAL-002]).

## Fluxo principal

1. Cidadão acessa "Meus dados" / "Solicitar acesso aos meus dados" (funcionalidade exigida pela Lei
   14.129/2021 art.21, X — "funcionalidade para solicitar acesso a informações acerca do tratamento
   de dados pessoais").
2. Sistema oferece, de imediato e sem prazo de espera, a confirmação simplificada de existência de
   tratamento (LGPD art.19, I) — ex.: "sim, temos dados seus nos seguintes sistemas: [lista]".
3. Se o cidadão quiser a declaração completa (origem dos dados, critérios utilizados, finalidade
   do tratamento), o sistema protocola o pedido com o prazo aplicável ao **Poder Público**, que
   não é o de 15 dias do art. 19, II da LGPD ([RN-PORTAL-120]) — o prazo exibido é o correto para
   o regime público, já contando e visível.
4. Sistema entrega a declaração completa dentro do prazo, por meio eletrônico seguro (LGPD art.19
   §2º, I).

## Fluxos alternativos / exceções

- **2a.** Nenhum dado encontrado vinculado ao CPF: sistema informa isso como resposta válida e
  completa, não como erro.
- **3a.** Dado envolve segredo comercial/industrial de terceiro ou dado de saúde de outra pessoa
  (ex. BAT com vítima terceira — ver [UC-PORTAL-013]): sistema aplica a mesma minimização já
  descrita para o BAT, sem expor dado de terceiro sob o pedido do próprio titular.
- **4a.** Prazo de 15 dias insuficiente por complexidade do pedido (múltiplos sistemas de origem):
  sistema explicita o atraso e a justificativa — LGPD não prevê prorrogação expressa para este
  prazo, então atraso sem entrega é tratado como item de escalonamento a DPO, não como algo a
  esconder do cidadão.

## Pós-condições

Cidadão com confirmação de existência de tratamento (imediata) e, se solicitada, declaração
completa entregue dentro de 15 dias; pedido registrado para fins de auditoria de conformidade LGPD.

## Critérios de aceitação

**AC-PORTAL-018-1 — a confirmação de existência é imediata**

- **Dado** um pedido de acesso
- **Quando** é feito
- **Então** a confirmação simplificada de que há tratamento é dada na hora, sem prazo de espera
  (LGPD art.19, I)

**AC-PORTAL-018-2 — o prazo da declaração completa é o do Poder Público**

- **Dado** um pedido de declaração completa
- **Quando** o prazo é calculado
- **Então** aplica-se o prazo do regime **público**, que não é o de 15 dias do art. 19, II
  ([RN-PORTAL-120]) — exibir 15 dias aqui é erro que gera expectativa indevida

**AC-PORTAL-018-3 — é canal único, com escopo declarado**

- **Dado** os direitos do art. 18 da LGPD
- **Quando** o cidadão os exerce
- **Então** o PORTAL é o canal único e declara **quais** incisos atende e quais não
  ([RN-PORTAL-119]) — silêncio sobre o escopo é pior que recusa explícita

**AC-PORTAL-018-4 — correção é ação de primeira classe**

- **Dado** um dado incorreto
- **Quando** o titular pede correção
- **Então** há ação direta para isso ([RN-PORTAL-121]) — não um formulário genérico de contato;
  portabilidade, por outro lado, é direito enunciado sem procedimento, e o sistema o diz

**AC-PORTAL-018-5 — o titular vê o próprio dado sem máscara**

- **Dado** a resposta ao pedido
- **Quando** é entregue
- **Então** vem sem mascaramento ([RN-PORTAL-118]) e por meio eletrônico seguro

**AC-PORTAL-018-6 — transparência no ponto de coleta, e revisão de decisão automatizada**

- **Dado** qualquer coleta de dado no PORTAL
- **Quando** ocorre
- **Então** a finalidade é informada ali mesmo; havendo decisão automatizada, o direito à revisão é
  ofertado ([RN-PORTAL-122])

## Regras aplicáveis

- [REF-LEI-13709-2018] art.18 (direitos do titular)
- [REF-LEI-13709-2018] art.19 (prazos de confirmação/acesso — imediato e 15 dias)
- [REF-LEI-14129-2021] art.21, X (funcionalidade obrigatória da plataforma)
