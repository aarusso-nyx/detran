---
id: IU-BOAT-S-08
title: Croqui
status: draft
apps: [boat]
updated: 2026-09-22
---

# Croqui

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Identidade: screenId crash-sketch, ficha IU-BOAT-S-08, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-sketch; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_sketch; chave boat.screens.crash_sketch.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- tipo e representação do croqui
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- criar e salvar croqui

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-004.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- SKETCH_TYPE_INVALID

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-dynamics, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-evidence, crash-evidence.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- edição local sem rede e retomada após interrupção

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- controles acessíveis para uma mão

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
