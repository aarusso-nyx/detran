---
id: IU-BOAT-S-05
title: Pessoas envolvidas
status: draft
apps: [boat]
updated: 2026-09-22
---

# Pessoas envolvidas

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Identidade: screenId crash-people, ficha IU-BOAT-S-05, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-people; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_people; chave boat.screens.crash_people.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- pessoas envolvidas e papel da pessoa
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- associar pessoa/condutor

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-002.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- PERSON_ROLE_INVALID e MINIMUM_DATA_MISSING

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-vehicles, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-victims, driver-search.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- operação interrompível e offline

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- Pessoas envolvidas

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
