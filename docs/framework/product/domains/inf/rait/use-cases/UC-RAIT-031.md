---
id: UC-RAIT-031
title: Operador de integração trata falhas e conciliações com RENAINF, RENACH e SNE
status: draft
apps: [rait, teat, dashboard]
sources: [REF-CONTRAN-931, REF-CONTRAN-918]
updated: 2026-09-12
---

## Ator e objetivo

Operador de integração acompanha a fila de retransmissão e as divergências entre o estado local e os registros nacionais, retransmite, concilia e escala o que exige decisão humana, sem alterar decisões de mérito.

## Pré-condições

- Painel de integrações do dashboard com filas de retransmissão, recibos e divergências por sistema (RENAINF, RENACH, SNE).

## Fluxo principal

1. Operador vê itens em falha (por sistema, idade, caso) e a causa retornada.
2. Retransmite lotes idempotentes; itens com erro de dados (ex.: código RENAINF inválido) viram tarefa ao processamento/TEAT.
3. Concilia divergências de estado: compara estado local × nacional, aplica a regra de precedência (o local é a fonte da decisão; o nacional é a fonte do registro) e registra a conciliação.
4. Itens que dependem de marco jurídico (ex.: ciência ficta do SNE não confirmada, 931 art. 4º §6º) são escalados ao gestor com o impacto nos prazos.

## Fluxos alternativos / exceções

- **2a.** Falha persistente do SNE que impeça provar a ciência: o sistema mantém a trilha própria do DETRAN-AM (data de disponibilização e envio) como prova ([RN-RAIT-124]) e sinaliza o risco.
- **3a.** Divergência que altera o sujeito passivo ou a pontuação: nunca conciliada automaticamente; vai ao gestor.

## Pós-condições

Falhas retransmitidas ou encaminhadas; divergências conciliadas com registro; riscos de prazo escalados.

## Critérios de aceitação

**AC-RAIT-031-1 — retransmissão nunca duplica**

- **Dado** um lote retransmitido duas vezes
- **Quando** o sistema nacional responde
- **Então** recibos idênticos, sem registro duplicado

**AC-RAIT-031-2 — conciliação é registrada**

- **Dado** uma divergência de estado
- **Quando** é conciliada
- **Então** fica no histórico do caso com estado local, estado nacional e regra aplicada

**AC-RAIT-031-3 — mérito é intocável**

- **Dado** uma divergência que sugeriria mudar a decisão
- **Quando** o operador atua
- **Então** só pode escalar; nenhuma decisão é alterada pelo painel de integração

## Regras aplicáveis

- [RN-RAIT-124] (SNE: ciência ficta e trilha própria)
- [RN-PORTAL-121] (propagação de correções)
- [RN-TEAT-116] (código RENAINF)
