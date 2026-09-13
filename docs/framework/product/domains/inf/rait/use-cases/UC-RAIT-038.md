---
id: UC-RAIT-038
title: Coordenador planeja a capacidade do período e solicita reforço
status: draft
apps: [rait, dashboard]
sources: [REF-CONTRAN-357, REF-DETRANAM-SERVICOS]
updated: 2026-09-12
---

## Ator e objetivo

Coordenador da defesa prévia (e, para os colegiados, o presidente com a secretaria) projeta, por mês e trimestre, chegada, capacidade e fila, considera ausências e sazonalidade, e decide medidas: redistribuição, escala reforçada, pedido de reforço de pessoal ou proposta de nova turma.

## Pré-condições

- Séries do dashboard: chegada por semana, decididas por revisor, `WIP`, idade da fila, ausências programadas ([WF-RAIT-004] §8).

## Fluxo principal

1. Sistema projeta a fila do próximo período com a chegada média e a capacidade escalada (revisores disponíveis × meta diária), destacando semanas com capacidade abaixo da chegada.
2. Coordenador simula medidas (mais um revisor, ajuste de `WIP`, meta diária) e vê o efeito na meta de 30 dias e nos relógios legais.
3. Coordenador registra o plano do período (medidas, responsáveis, datas) e, quando a lacuna é estrutural, emite pedido de reforço ao gestor com a memória de cálculo.
4. Gestor decide: reforço de pessoal, hora extra, ou proposta de nova turma ([UC-RAIT-039]).

## Fluxos alternativos / exceções

- **1a.** Dados de chegada insuficientes (início de operação): usa os valores institucionais de referência ([APP-RAIT] §Volumes) marcados como hipótese.
- **3a.** Plano não cumprido: o indicador de aderência ao plano aparece no acompanhamento gerencial ([UC-RAIT-040]).

## Pós-condições

Plano de capacidade registrado; pedidos de reforço fundamentados; escala do período coerente com a projeção.

## Critérios de aceitação

**AC-RAIT-038-1 — a projeção é explícita**

- **Dado** um período planejado
- **Quando** o plano é aberto
- **Então** mostra chegada estimada, capacidade escalada e fila projetada por semana

**AC-RAIT-038-2 — a lacuna estrutural vira pedido formal**

- **Dado** capacidade abaixo da chegada por 3 meses
- **Quando** o coordenador fecha o plano
- **Então** o sistema exige registrar medida ou pedido de reforço

## Regras aplicáveis

- [RN-RAIT-139] (dimensionamento ao prazo legal)
- [RN-RAIT-141] (distribuição impessoal — o plano não escolhe casos)
