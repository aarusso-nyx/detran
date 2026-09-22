---
id: IU-BOAT-S-10
title: AITs e medidas vinculados
status: draft
apps: [boat]
updated: 2026-09-22
---

# AITs e medidas vinculados

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Identidade: screenId crash-ait-links, ficha IU-BOAT-S-10, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-ait-links; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_ait_links; chave boat.screens.crash_ait_links.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- AITs e medidas vinculados ao sinistro
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- vincular alvo existente

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-004, UC-BOAT-006.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- LINK_TARGET_NOT_FOUND e VEHICLE_LINK_INVALID

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-evidence, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-review, ait-start, measure-start.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- vínculos aguardam sincronização

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- AITs e medidas vinculados

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
