---
id: IU-BOAT-S-07
title: Condutas de cena (176/177/178)
status: draft
apps: [boat]
updated: 2026-09-22
---

# Condutas de cena (176/177/178)

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§2,4, matriz.
- Identidade: screenId crash-dynamics, ficha IU-BOAT-S-07, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-dynamics; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_dynamics; chave boat.screens.crash_dynamics.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- conduta de cena e regime 176/177/178 derivado da presença de vítima
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- registrar o dever aplicável

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-007; regime derivado da presença de vítima.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- DUTY_CODE_INVALID, DUTY_REGIME_MISMATCH e DUTY_177_REQUIRES_DISTINCT_SUBJECT

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-victims, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-sketch.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- linguagem simples sob pressão

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- regime ativo claramente nomeado

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§2,4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
