---
id: IU-BOAT-S-12
title: Danos materiais e testemunhas
status: draft
apps: [boat]
updated: 2026-09-22
---

# Danos materiais e testemunhas

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§4,8, JRN-BOAT-001…002.
- Identidade: screenId crash-damages, ficha IU-BOAT-S-12, grupo crashes.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-damages; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_damages; chave boat.screens.crash_damages.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- danos materiais e testemunhas
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- registrar danos/testemunhas e seguir para revisão

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-012.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- DAMAGE_ASSET_KIND_INVALID e WITNESS_IS_INVOLVED

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-ait-links, crash-review.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- captura incremental offline

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- Danos materiais e testemunhas

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§4,8, JRN-BOAT-001…002.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
