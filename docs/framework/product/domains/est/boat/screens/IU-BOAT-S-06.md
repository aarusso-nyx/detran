---
id: IU-BOAT-S-06
title: Vítimas
status: draft
apps: [boat]
updated: 2026-09-22
---

# Vítimas

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001] §C, boat-frontends.md §§3–4, matriz.
- Identidade: screenId crash-victims, ficha IU-BOAT-S-06, grupo crashes.
- Dados de vítima somente após perfil, finalidade (purpose) e auditoria; esta ficha não concede acesso.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /crash-victims; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_victims; chave boat.screens.crash_victims.title.

## Papéis, finalidade e auditoria

- Papéis: field-agent, field-supervisor; purpose declarada.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- Para cada pessoa vítima: `severity` (enum federal), `death_at_scene`, `death_at`, `medical_care`, `hospital_destination` e `health_notes` mínimo; todos são dados de saúde.
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- Registrar dados da vítima somente após perfil e finalidade declarada; auditar cada abertura e ação sensível. A gravidade compatível com vítima abre esta tela.

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: UC-BOAT-003; acesso por perfil + purpose + auditoria.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- A gravidade usa `SEM_VITIMA`, `COM_VITIMA_FERIDA` ou `COM_VITIMA_FATAL`; dados da vítima só aparecem quando o gate de gravidade com vítima for satisfeito.

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: crash-people, crash-victims, `__previous__`, context-help, home, ait-start, measure-start, crash-start, sync, crash-dynamics, crash-victims.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- A falta de rede não bloqueia a captura da vítima; preservar a fila offline conforme a jornada mobile.

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- `health_notes` orienta ao mínimo necessário; não apresentar retenção como permanente.

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001] §C, boat-frontends.md §§3–4, matriz.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
