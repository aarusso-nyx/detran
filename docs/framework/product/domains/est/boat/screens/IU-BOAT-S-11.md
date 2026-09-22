---
id: IU-BOAT-S-11
title: Revisão do sinistro
status: draft
apps: [boat]
updated: 2026-09-22
---

# Revisão do sinistro

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§2,4,8, matriz.
- Identidade: screenId crash-review, ficha IU-BOAT-S-11, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-review; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_review; chave boat.screens.crash_review.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- resumo do sinistro, com pelo menos um veículo ou pessoa
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- revisar e finalizar para fila

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: finalizar para fila; ≥1 veículo ou pessoa.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- CLOSE_REQUIRES_REVIEW e MINIMUM_DATA_MISSING

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-ait-links, crash-review, crash-damages, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, sync, crash-review.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- finalização aguarda sincronização

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- revisão sem alterar o registro capturado

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§2,4,8, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
