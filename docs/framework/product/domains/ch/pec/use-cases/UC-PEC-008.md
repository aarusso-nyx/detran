---
id: UC-PEC-008
title: Encerrar episódio clínico
status: approved
apps: [pec]
sources:
  - pec:domain/encounters-clinical-encounter/api/src/encounters/encounters.service.ts
  - pec:docs/framework/pec/flows/encerramento-exportacao.md
  - pec:database/ddl/80-cross-objects.sql
updated: 2026-08-26
---

## Ator e objetivo

Profissional autorizado (papel gatekeeper de "Encerrar episódio" na matriz RBAC) fecha o
encounter depois que todas as condições clínicas, regulatórias e de transmissão estão
satisfeitas, consolidando o episódio. Origem: UCAP-UC-17 ("Encerrar Episódio Médico"). Ver
[WF-PEC-001] §"Gate de encerramento" para o detalhamento normativo completo.

## Pré-condições

Todas simultaneamente (lidas de `pec.v_episode_summary`):

1. Exame médico e exame psicológico realizados.
2. Laudo médico e laudo psicológico assinados.
3. Nenhum `process_block` ativo.
4. Nenhum caso de junta pendente (`status ≠ DECIDED`).
5. Se resultado médico é `CONDICIONADO`, ao menos uma restrição de CNH aplicada.
6. Transmissão ao RENACH já `ACKED` (nenhuma linha `PENDING`/`ERROR` no outbox).

## Fluxo principal

1. Profissional chama `PATCH /encounters/:id/close`.
2. Sistema valida todas as pré-condições via `assertClosureReady()`.
3. Sistema gera sumário e evidências do episódio.
4. Episódio é exportado em PDF/A, assinado PAdES com TSA, validado via OCSP (fallback CRL).
5. Resultado já publicado no RENACH (publicação ocorre antes do fechamento, não durante).
6. `status='CLOSED'`, `closed_at=now()`; métricas do episódio são atualizadas.

## Fluxos alternativos / exceções

- **Qualquer pré-condição não satisfeita**: `400 Bad Request` listando cada item faltante —
  o fechamento é tudo-ou-nada, não parcial.
- **Cancelamento em vez de fechamento**: não há caminho implementado para `CANCELLED` — ver
  [WF-PEC-001] (gap reportado).

## Pós-condições

- Encounter em `CLOSED`, com sumário/evidências exportados e assinados.
- Nenhuma alteração clínica adicional é esperada após o fechamento (o encounter é terminal).

## Critérios de aceitação

**AC-PEC-008-1 — o gate de encerramento é tudo-ou-nada, e lista o que falta**

- **Dado** um encounter com pendências
- **Quando** se tenta encerrar
- **Então** o sistema recusa listando **cada** item faltante ([RN-PEC-006]) — exames completos,
  laudos assinados, sem bloqueios ativos, sem junta pendente, RENACH confirmado

**AC-PEC-008-2 — resultado com restrição exige restrição aplicada**

- **Dado** um resultado equivalente a "apto com restrições"
- **Quando** o encerramento é tentado
- **Então** exige ao menos uma restrição registrada ([RN-PEC-006] item 5, [UC-PEC-011])

**AC-PEC-008-3 — publicar no RENACH precede o fechamento**

- **Dado** um encounter pronto
- **Quando** é encerrado
- **Então** o resultado já foi publicado e confirmado (`ACKED`) antes — o fechamento não é o
  gatilho da publicação ([UC-PEC-009])

**AC-PEC-008-4 — o episódio encerrado é exportado, assinado e verificável**

- **Dado** o encerramento
- **Quando** ocorre
- **Então** sumário e evidências são exportados em PDF/A, assinados em PAdES com TSA e validados

**AC-PEC-008-5 — `CANCELLED` existe ou não existe, mas não fica morto**

- **Dado** o enum de status do encounter
- **Quando** o sistema é implementado
- **Então** ou há rota que grave `CANCELLED`, ou o valor sai do enum — hoje é estado morto e é
  débito registrado (DT-104)

## Regras aplicáveis

- [RN-PEC-006]
- [RN-PEC-007]
- [RN-PEC-008]
