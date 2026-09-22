---
id: IU-BOAT-S-03
title: Condições
status: draft
apps: [boat]
updated: 2026-09-22
---

# Condições

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Identidade: screenId crash-conditions, ficha IU-BOAT-S-03, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-conditions; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_conditions; chave boat.screens.crash_conditions.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- condition_road, condition_weather, condition_lighting e condition_signage
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- registrar as quatro condições

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: AC-BOAT-001-4; quatro condições obrigatórias.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- CONDITIONS_INCOMPLETE e ENUM_INVALID

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-location, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-vehicles.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- completar em campo sem rede

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- quatro condições obrigatórias

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
