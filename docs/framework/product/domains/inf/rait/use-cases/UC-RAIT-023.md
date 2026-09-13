---
id: UC-RAIT-023
title: Órgão declara decadência ou prescrição de ofício e abre incidente
status: draft
apps: [rait, dashboard]
sources: [REF-CTB-280-290, REF-LEI-9873-1999]
updated: 2026-09-12
---

## Ator e objetivo

Autoridade de trânsito (decadência) ou presidente do colegiado (prescrição por não julgamento ou paralisação) declara de ofício a extinção da punibilidade quando um relógio legal é atingido, encerra o caso e abre incidente com causa raiz — desfecho que a escada de alertas existe para impedir.

## Pré-condições

- Bandeira `PRESCRITO_OPERACIONAL` ([WF-RAIT-002] §4) ou `T-DEC` vencido sem NP ([WF-INF-003] #10).

## Fluxo principal

1. Sistema bloqueia movimentações de mérito no caso e abre tarefa de declaração ao responsável competente.
2. Responsável lavra a declaração fundamentada (relógio atingido, datas, base legal) e assina.
3. Caso encerra sem decisão de mérito; infração vai a `EXTINTO_DECADENCIA` ou `EXTINTO_PRESCRICAO`; efeitos: sem penalidade, sem RENACH, restituição se houver pagamento ([UC-RAIT-033]).
4. Gestor registra incidente com causa raiz e comunica LEGAL/auditoria ([UC-RAIT-010] AC-4); indicador de prescrição do dashboard é atualizado.

## Fluxos alternativos / exceções

- **2a.** Divergência sobre o marco (ex.: data de recebimento pelo julgador contestada): o LEGAL revisa antes da declaração; o caso permanece bloqueado.
- **3a.** Julgamento proferido após o teto: efeito jurídico em aberto (DT-044); o sistema registra a decisão como "extemporânea" e não a executa sem parecer.

## Pós-condições

Extinção declarada e comunicada; incidente registrado; caso e infração encerrados sem penalidade.

## Critérios de aceitação

**AC-RAIT-023-1 — mérito bloqueado após o teto**

- **Dado** um caso em `PRESCRITO_OPERACIONAL`
- **Quando** um relator tenta registrar voto
- **Então** o sistema bloqueia e aponta a tarefa de declaração

**AC-RAIT-023-2 — a declaração cita o relógio**

- **Dado** uma declaração de extinção
- **Quando** é assinada
- **Então** contém relógio, termo inicial, data do teto e base legal

**AC-RAIT-023-3 — incidente é obrigatório**

- **Dado** uma extinção declarada
- **Quando** o caso encerra
- **Então** existe incidente com causa raiz vinculado, sem o qual o encerramento não conclui

## Regras aplicáveis

- [RN-RAIT-112] (art. 289-A)
- [RN-RAIT-113] (Lei 9.873)
- [RN-RAIT-114] (decadência)
- [RN-RAIT-129] (restituição)
