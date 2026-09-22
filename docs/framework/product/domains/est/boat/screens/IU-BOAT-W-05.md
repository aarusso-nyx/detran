---
id: IU-BOAT-W-05
title: Atendimento a pedido do titular
status: draft
apps: [boat]
updated: 2026-09-22
---

# Atendimento a pedido do titular

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§3,5,8.
- Identidade: screenId source_pending (OD-R15-003; proposta, não canônica), ficha IU-BOAT-W-05, grupo crashes.
- Dados de vítima somente após perfil, finalidade (purpose) e auditoria; esta ficha não concede acesso.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /fiscalizacao/sinistros/titular; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_subject_request; chave boat.screens.crash_subject_request.title.

## Papéis, finalidade e auditoria

- Papéis: processing-operator, AUDITOR; purpose declarada e trilha auditada.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- Pedido do titular: acesso, correção ou eliminação; finalidade e identificação do titular.
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- Registrar e responder ao pedido com finalidade declarada e trilha auditável.

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: RN-BOAT-126; eliminação bloqueada até retenção aplicável.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- Eliminação fica bloqueada até a retenção aplicável; a tela é proposta com `screenId` ainda pendente.

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: rota de entrada, resposta do pedido.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- A especificação descreve atendimento na retaguarda web; não fixa operação offline.

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- As fontes fechadas não fixam texto adicional de interface para esta tela.

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§3,5,8.
- Proposta: OD-R15-003 (screenId), permanece pendente e não canônica, sem decisão.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
