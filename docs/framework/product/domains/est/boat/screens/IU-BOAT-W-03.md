---
id: IU-BOAT-W-03
title: Complementação
status: draft
apps: [boat]
updated: 2026-09-22
---

# Complementação

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §§5,8, boat-route-contract.md §3.
- Identidade: screenId crash-complement, ficha IU-BOAT-W-03, grupo crashes.
- Dados de vítima somente após perfil, finalidade (purpose) e auditoria; esta ficha não concede acesso.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /fiscalizacao/sinistros/:id/complementar; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_complement; chave boat.screens.crash_complement.title.

## Papéis, finalidade e auditoria

- Papéis: processing-operator, traffic-authority para validate; purpose se abrir vítima.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- Campos faltantes para a complementação dos dados mínimos.
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- Complementar os dados mínimos e acionar validar.

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: PENDENTE_COMPLEMENTO → REGISTRADO → VALIDADO.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- A complementação leva `PENDENTE_COMPLEMENTO` a `REGISTRADO`; validar leva a `VALIDADO`.

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: W-02, W-04.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- A especificação descreve fluxo de retaguarda web e não fixa comportamento offline.

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- A especificação não fixa texto adicional de interface para esta tela.

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §§5,8, boat-route-contract.md §3.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
