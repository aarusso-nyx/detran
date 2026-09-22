---
id: IU-BOAT-S-02
title: Local e horário
status: draft
apps: [boat]
updated: 2026-09-22
---

# Local e horário

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Identidade: screenId crash-location, ficha IU-BOAT-S-02, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-location; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_location; chave boat.screens.crash_location.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- localização, occurred_at e recorded_at, mantendo-os distintos
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- salvar local/horário

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: AC-BOAT-001-3; occurred_at ≠ recorded_at.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- LOCATION_REQUIRED e OCCURRED_AFTER_RECORDED

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-start, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-conditions.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- posição pode ser retomada offline

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- Local e horário, com labels acessíveis

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
