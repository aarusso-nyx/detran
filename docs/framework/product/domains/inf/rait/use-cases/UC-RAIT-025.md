---
id: UC-RAIT-025
title: Subcoordenador revisa a qualidade das minutas por amostragem e retroalimenta a equipe
status: draft
apps: [rait, dashboard]
sources: [REF-CONTRAN-918, REF-CONTRAN-357]
updated: 2026-09-12
---

## Ator e objetivo

Subcoordenador da defesa prévia seleciona amostra aleatória de decisões do período, revisa fundamentação, enquadramento e coerência entre revisores, e devolve achados à equipe e ao TEAT (problemas sistemáticos de autuação).

## Pré-condições

- Casos em `DECIDIDO_AUTORIDADE` no período; amostra configurada (proposta: 5% ou mínimo 10/mês — [WF-RAIT-004] §2.1 F-DP-Q).

## Fluxo principal

1. Sistema sorteia a amostra estratificada por revisor e enquadramento.
2. Subcoordenador revisa cada item com checklist (fundamento, prova, coerência com decisões similares, linguagem) e registra achados tipados.
3. Achados individuais vão ao revisor como feedback; achados sistemáticos (ex.: mesmo vício de autuação) vão ao TEAT e à JARI (357 item 3.1.c) e alimentam a taxa de provimento por enquadramento ([APP-RAIT] §KPIs).
4. Coordenador acompanha o indicador de divergência por revisor no dashboard.

## Fluxos alternativos / exceções

- **2a.** Achado grave em decisão já comunicada: não reabre a decisão (Owner C.22); registra para eventual recurso de ofício da autoridade quando cabível, e para treinamento.
- **1a.** Revisor com achados recorrentes: coordenador ajusta `WIP` e escala; nunca altera a distribuição impessoal ([RN-RAIT-141]).

## Pós-condições

Amostra revisada; achados registrados e distribuídos; indicadores de qualidade atualizados.

## Critérios de aceitação

**AC-RAIT-025-1 — a amostra é aleatória e estratificada**

- **Dado** um período com 300 decisões
- **Quando** a amostra é gerada
- **Então** cobre todos os revisores e os enquadramentos mais frequentes

**AC-RAIT-025-2 — achados sistemáticos saem do RAIT**

- **Dado** três achados com o mesmo vício de autuação
- **Quando** o subcoordenador consolida
- **Então** o sistema gera comunicação ao TEAT e à JARI com os AITs envolvidos

## Regras aplicáveis

- [RN-RAIT-132] (decisão fundamentada)
- [REF-CONTRAN-357] item 3.1.c (problemas sistemáticos nas autuações)
