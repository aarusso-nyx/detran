---
id: UC-RAIT-021
title: Presidente convoca sessão extraordinária por acúmulo de casos críticos
status: draft
apps: [rait, dashboard]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022, REF-JARI-ORGANIZACAO-BENCHMARK]
updated: 2026-09-12
---

## Ator e objetivo

Presidente da JARI ou do CETRAN-AM convoca sessão extraordinária quando a fila de prontos para julgamento em `ALERTA_N3`/`CRITICO` excede a capacidade das sessões ordinárias do calendário.

## Pré-condições

- Escalonamento `CRITICO` recebido ([WF-RAIT-002] §6) ou projeção do gestor ([UC-RAIT-040]) indicando que a fila F-J-3 não cabe nas ordinárias antes dos marcos.

## Fluxo principal

1. Sistema apresenta ao presidente a fila F-J-3 por dias restantes e a capacidade das próximas ordinárias.
2. Presidente convoca extraordinária com data, pauta restrita aos casos em risco e antecedência mínima (`T-CONV`, ou menor com registro em ata).
3. Secretaria forma a banca e convoca suplentes ([UC-RAIT-015]); sessão segue [WF-RAIT-003].
4. Sistema registra a sessão como extraordinária para fins de teto de sessões remuneradas ([UC-RAIT-036]).

## Fluxos alternativos / exceções

- **2a.** Teto mensal de sessões remuneradas já atingido **(pendente regimento/legislação do AM)**: presidente decide entre sessão não remunerada, com anuência registrada, ou escalonamento ao gestor para nova turma ([UC-RAIT-039]).
- **3a.** Sem quorum: `SESSAO_ADIADA` e incidente de capacidade ao gestor.

## Pós-condições

Sessão extraordinária realizada com os casos críticos; relógios respeitados; registro para remuneração.

## Critérios de aceitação

**AC-RAIT-021-1 — a extraordinária só leva casos em risco**

- **Dado** uma convocação extraordinária
- **Quando** a pauta é fechada
- **Então** só casos `ALERTA_N3`/`CRITICO` (ou vista prioritária) entram, salvo justificativa

**AC-RAIT-021-2 — o teto remuneratório é visível na convocação**

- **Dado** um mês com N sessões já realizadas
- **Quando** o presidente convoca
- **Então** o sistema mostra quantas sessões remuneradas restam no mês

## Regras aplicáveis

- [RN-RAIT-112] (prescrição por inércia)
- [RN-RAIT-139] (dimensionamento ao prazo legal)
- [RN-RAIT-142] (banca e suplentes)
