---
id: IU-BOAT-S-01
title: Novo sinistro
status: draft
apps: [boat]
updated: 2026-09-22
---

# Novo sinistro

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Identidade: screenId crash-start, ficha IU-BOAT-S-01, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-start; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_start; chave boat.screens.crash_start.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- identificador mínimo do sinistro e contexto de atendimento
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- iniciar rascunho e transicionar RASCUNHO para EM_ATENDIMENTO

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: RASCUNHO → EM_ATENDIMENTO (start).
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- MINIMUM_DATA_MISSING e IDEMPOTENCY_REPLAY conforme catálogo

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: `__previous__`, context-help, home, ait-start, measure-start, sync, crash-location.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- captura local sem rede

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- Novo sinistro e vocabulário sinistro

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
