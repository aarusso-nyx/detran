---
id: UC-RAIT-022
title: Autoridade registra suspensão de prazo por força maior como ato motivado e auditado
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-LEI-9784-1999]
updated: 2026-09-12
---

## Ator e objetivo

Autoridade de trânsito ou presidente do colegiado registra, excepcionalmente, suspensão de prazo processual por força maior comprovada, como ato motivado, auditado e revisável — nunca como regra automática (decisão do Owner C.20).

## Pré-condições

- Evento de força maior comprovado (documento anexo); regulamento do CONTRAN sobre força maior (CTB art. 290-A) **não localizado** — o ato assume o risco e o registra.

## Fluxo principal

1. Autoridade abre o ato de suspensão: casos alcançados, prazo suspenso, termo inicial e final, fundamento, prova.
2. Sistema reprograma os vencimentos afetados, mantém os valores originais no histórico e marca cada caso com o ato.
3. O ato entra na trilha de auditoria e gera item de revisão obrigatória ao gestor e ao LEGAL.
4. Ao término, os prazos retomam a contagem; o Portal exibe a nova data-limite ao cidadão.

## Fluxos alternativos / exceções

- **1a.** Tentativa de suspender prazos legais de decadência ou prescrição por motivo operacional (greve, recesso, indisponibilidade): o sistema recusa ([RN-RAIT-105]).
- **2a.** Ato revogado em revisão: vencimentos originais restaurados, com registro.

## Pós-condições

Suspensão registrada como ato, auditável; prazos reprogramados; revisão pendente.

## Critérios de aceitação

**AC-RAIT-022-1 — suspensão nunca é automática**

- **Dado** um sistema indisponível por 3 dias
- **Quando** os prazos correm
- **Então** nenhum prazo é suspenso sem ato motivado

**AC-RAIT-022-2 — o ato é rastreável caso a caso**

- **Dado** um ato de suspensão sobre 12 casos
- **Quando** um caso é consultado
- **Então** o histórico mostra o ato, o fundamento e os vencimentos antes e depois

## Regras aplicáveis

- [RN-RAIT-105] (não suspensão, salvo força maior)
- [RN-RAIT-005] (contagem)
