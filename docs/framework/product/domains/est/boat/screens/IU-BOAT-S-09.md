---
id: IU-BOAT-S-09
title: Evidências do sinistro
status: draft
apps: [boat]
updated: 2026-09-22
---

# Evidências do sinistro

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§2,4, matriz.
- Identidade: screenId crash-evidence, ficha IU-BOAT-S-09, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-evidence; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_evidence; chave boat.screens.crash_evidence.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- evidências do sinistro e metadados de captura
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.
- Texto fixo: “fotografar a cena, não o sofrimento”.

## Ações, comandos e efeitos

- anexar evidência e sincronizar depois

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-004; “fotografar a cena, não o sofrimento”.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- SYNC_EVIDENCE_PENDING e ENUM_INVALID

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-sketch, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-ait-links.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- câmera pode operar offline

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- fotografar a cena, não o sofrimento

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.
- Texto fixo: “fotografar a cena, não o sofrimento”.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§2,4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
