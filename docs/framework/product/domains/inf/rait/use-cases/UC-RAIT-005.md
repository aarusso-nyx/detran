---
id: UC-RAIT-005
title: Presidente monta e fecha a pauta de julgamento
status: approved
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-08-26
---

## Ator e objetivo

Presidente da JARI (ou do CETRAN-AM, ou coordenador quando houver mais de uma JARI — CONTRAN-357
item 2.3) seleciona os casos `PRONTO_P_DECISAO` do pool 2º circuito para a próxima sessão,
priorizando risco de prescrição, e formaliza a pauta.

## Pré-condições

Existem casos em `PRONTO_P_DECISAO` com parecer/voto do relator já registrado ([UC-RAIT-004]).

## Fluxo principal

1. Presidente abre a fila `PRONTO_P_DECISAO` do pool (JARI ou CETRAN).
2. Sistema destaca os casos com bandeira `ALERTA_N3`/`CRITICO` ([WF-RAIT-002] §4) — entrada
   obrigatória na próxima pauta.
3. Presidente completa a pauta com os demais casos por ordem FIFO (ou critério local
   equivalente).
4. Presidente fecha a pauta → caso(s) passam a `PAUTADO`, sessão entra em
   `FORMANDO_PAUTA`→`PAUTA_FECHADA` ([WF-RAIT-003]).
5. Secretaria dispara convocação aos membros do colegiado ([WF-RAIT-003] `CONVOCACAO_ENVIADA`).

## Fluxos alternativos / exceções

- **2a.** Volume de casos em `CRITICO` excede a capacidade de uma sessão ordinária: presidente
  pode convocar sessão extraordinária ([WF-RAIT-002] §6, escalonamento `CRITICO`).
- **4a.** Caso incluído em pauta sofre desistência do requerente antes da sessão: removido da
  pauta, segue [UC-RAIT-012].

## Pós-condições

Pauta fechada e publicada; casos em `PAUTADO`; convocação disparada.

## Critérios de aceitação

**AC-RAIT-005-1 — casos em risco entram na pauta obrigatoriamente**

- **Dado** casos em `PRONTO_P_DECISAO` com bandeira `ALERTA_N3` ou `CRITICO` ([WF-RAIT-002] §4)
- **Quando** o presidente fecha a pauta sem incluí-los
- **Então** o sistema bloqueia o fechamento e exige inclusão ou justificativa registrada — a escada de SLA só é efetiva se a pauta a respeitar

**AC-RAIT-005-2 — só entra em pauta caso com parecer registrado**

- **Dado** um caso `PRONTO_P_DECISAO` sem parecer do relator ([UC-RAIT-004])
- **Quando** o presidente tenta incluí-lo na pauta
- **Então** o sistema recusa a inclusão

**AC-RAIT-005-3 — fechar a pauta pauta os casos e dispara a convocação**

- **Dado** uma pauta com N casos elegíveis
- **Quando** o presidente a fecha
- **Então** os N casos passam a `PAUTADO`, a sessão vai a `PAUTA_FECHADA` ([WF-RAIT-003]) e a convocação aos membros é disparada no mesmo ato, sem etapa manual adicional

**AC-RAIT-005-4 — antecedência mínima de convocação é verificada**

- **Dado** uma sessão marcada para menos de 5 dias úteis à frente (T-CONV, [WF-RAIT-003])
- **Quando** a pauta é fechada
- **Então** o sistema alerta sobre a antecedência insuficiente e exige confirmação explícita do presidente, registrada em ata

**AC-RAIT-005-5 — desistência remove da pauta**

- **Dado** um caso `PAUTADO` cuja desistência é registrada antes da abertura da sessão
- **Quando** a desistência é processada ([UC-RAIT-012])
- **Então** o caso é removido da pauta automaticamente e a pauta permanece válida para os demais

## Regras aplicáveis

- Referência de priorização: [WF-RAIT-002] §4 (escada de SLA anti-prescrição)
- [WF-RAIT-003] §Formação de pauta
