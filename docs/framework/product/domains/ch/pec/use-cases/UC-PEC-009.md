---
id: UC-PEC-009
title: Transmitir resultado ao RENACH e tratar ACK/erro
status: approved
apps: [pec]
sources:
  - pec:domain/transmissions-detran-transmissions/api/src/transmissions/transmissions.service.ts
  - pec:docs/framework/pec/flows/transmissoes-ack.md
updated: 2026-08-26
---

## Ator e objetivo

O sistema enfileira e transmite eventos relevantes do encounter (encounter, laudo, restrição)
ao RENACH/DETRAN, tratando confirmação (ACK) ou erro de forma idempotente. Origem:
SUC-UC-18 ("Gerar transmissão de janela ≤15min"), SUC-UC-19 ("Receber ACK do DETRAN"),
SUC-UC-20 ("Reprocessar transmissão com erro").

## Pré-condições

- Entidade relevante (encounter/laudo/restrição) pronta para publicação (ex.: laudo assinado).

## Fluxo principal

1. Sistema enfileira o evento: `integration.renach_outbox` recebe uma linha `status='PENDING'`
   com `next_attempt_at = now() + 15min`.
2. `POST /transmissions/events` envia o evento ao DETRAN dentro da janela de até 15 minutos.
3. DETRAN confirma via webhook: `status` muda para `ACKED` (sucesso) ou `ERROR` (falha),
   registrado de forma idempotente (`ON CONFLICT (outbox_id) DO NOTHING` em
   `integration.renach_acks`).
4. Em caso de `ACKED`, a entidade é considerada publicada — habilita, por exemplo, o
   fechamento do encounter (ver [WF-PEC-001]).

## Fluxos alternativos / exceções

- **`ERROR`**: `POST /transmissions/retry/:id` reprocessa com correções; o encounter
  associado permanece bloqueado para fechamento enquanto a linha não estiver `ACKED`.
- **Retransmissão do mesmo evento**: idempotente por natureza (chave `entity:entityId` e
  `ON CONFLICT`) — não duplica publicação.

## Pós-condições

- Evento com `status='ACKED'` (ou em ciclo de retry até ser).
- `ack_time` e status registrados de forma idempotente.

## Critérios de aceitação

**AC-PEC-009-1 — vai o resultado, nunca o prontuário**

- **Dado** a transmissão ao RENACH
- **Quando** o payload é montado
- **Então** contém o **resultado** e os dados estritamente necessários à habilitação
  ([RN-PEC-152]) — o prontuário clínico não é compartilhado, e a minimização é verificável no
  contrato

**AC-PEC-009-2 — a janela de 15 minutos é o alvo, e o atraso é visível**

- **Dado** um evento enfileirado
- **Quando** a transmissão ocorre
- **Então** parte em até 15 minutos ([RN-PEC-008]); ultrapassado o alvo, a pendência é visível ao
  operador, não silenciosa

**AC-PEC-009-3 — ACK é idempotente**

- **Dado** um webhook de confirmação repetido
- **Quando** chega
- **Então** o registro do ACK não duplica

**AC-PEC-009-4 — `ERROR` bloqueia o encerramento até resolver**

- **Dado** um evento em erro
- **Quando** o encounter tenta encerrar
- **Então** permanece bloqueado até o `ACKED` ([RN-PEC-006])

**AC-PEC-009-5 — retransmitir não republica**

- **Dado** um reenvio do mesmo evento
- **Quando** ocorre
- **Então** é idempotente pela chave `entity:entityId` — não gera segunda publicação

## Regras aplicáveis

- [RN-PEC-008]
