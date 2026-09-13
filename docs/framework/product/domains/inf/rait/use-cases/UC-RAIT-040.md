---
id: UC-RAIT-040
title: Gestor acompanha a produção e a aderência às metas e retroalimenta o TEAT e a autoridade
status: draft
apps: [rait, dashboard]
sources: [REF-CONTRAN-357, REF-DETRANAM-SERVICOS, REF-LEI-13460-2017]
updated: 2026-09-12
---

## Ator e objetivo

Gestor RAIT (e coordenadores/presidentes no seu nível) acompanha, em painel, a produção por fase, por pessoa e por unidade, a aderência às metas operacionais e aos tetos legais, a qualidade e as taxas de provimento, e usa isso para decisões de gestão e para a Carta de Serviços.

## Pré-condições

- KPIs de [APP-RAIT] §KPIs alimentados pelo dashboard; escala, filas e relógios registrados.

## Fluxo principal

1. Painel apresenta: tempo por fase (mediana, p90), backlog por fila com idade, casos por revisor/relator, aderência ao SLA local (30 dias / 30 dias úteis), % em risco por relógio, sessões realizadas/adiadas, taxa de provimento por enquadramento, achados de qualidade ([UC-RAIT-025]).
2. Gestor compara períodos e unidades; identifica gargalos (fila específica, autoridade com `T-ASS` alto, relator com retenção) e aciona a ação cabível (reatribuição, escala, extraordinária, plano de capacidade).
3. Indicadores públicos (prazo prometido × cumprido) alimentam a Carta de Serviços e a avaliação do usuário ([WF-PORTAL-001] §Carta; Lei 13.460 art. 7º).
4. Relatório periódico da JARI/CETRAN ao órgão sobre problemas sistemáticos nas autuações (357 item 3.1.c) é gerado a partir da taxa de provimento por enquadramento e enviado ao TEAT.

## Fluxos alternativos / exceções

- **2a.** Indicador de teto legal em risco: tratado no radar de prescrição ([UC-RAIT-010]), nunca só como métrica de produção.
- **1a.** Produtividade individual: exibida ao coordenador e ao próprio membro; comparação nominal entre membros só em nível de gestão, com finalidade registrada (LGPD).

## Pós-condições

Decisões de gestão fundamentadas em dados; relatórios periódicos emitidos; Carta de Serviços coerente com a medição.

## Critérios de aceitação

**AC-RAIT-040-1 — meta operacional e teto legal são indicadores distintos**

- **Dado** um caso em 40 dias
- **Quando** o painel é aberto
- **Então** aparece fora da meta de 30 dias e `SEM_RISCO` no teto legal, sem confusão

**AC-RAIT-040-2 — o relatório de problemas sistemáticos é gerado**

- **Dado** um trimestre com provimentos concentrados num enquadramento
- **Quando** o relatório roda
- **Então** lista o enquadramento, os AITs e o motivo predominante de provimento

**AC-RAIT-040-3 — o prazo publicado é o medido**

- **Dado** a Carta promete 30 dias
- **Quando** o indicador é calculado
- **Então** usa a mesma definição de início e fim do processo

## Regras aplicáveis

- [REF-CONTRAN-357] item 3.1.c (informar problemas sistemáticos)
- [RN-RAIT-112] (radar de prescrição)
- [RN-PORTAL-108] (Carta de Serviços)
