---
id: IU-BOAT-W-02
title: Detalhe de sinistro
status: draft
apps: [boat]
updated: 2026-09-22
---

# Detalhe de sinistro

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§3,5.
- Identidade: screenId crash-detail, ficha IU-BOAT-W-02, grupo crashes.
- Dados de vítima somente após perfil, finalidade (purpose) e auditoria; esta ficha não concede acesso.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /fiscalizacao/sinistros/:id; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_detail; chave boat.screens.crash_detail.title.

## Papéis, finalidade e auditoria

- Papéis: field-supervisor, processing-operator, traffic-authority, agency-admin; purpose antes da aba vítimas.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- As abas de detalhe apresentam dados, veículos, pessoas, vítimas protegidas, condutas, danos/testemunhas, croqui/evidências, AITs/medidas, histórico e RENAEST.
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- Abrir o sinistro em qualquer estado local e navegar pelas abas; a aba de vítimas requer finalidade declarada e acesso auditado.

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: qualquer estado.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- Estado de entrada: qualquer estado local.

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: W-01, W-03, W-04.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- A especificação não fixa requisito adicional de operação offline para esta tela web.

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- As fontes fechadas não fixam texto adicional de interface para esta tela.

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§3,5.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
