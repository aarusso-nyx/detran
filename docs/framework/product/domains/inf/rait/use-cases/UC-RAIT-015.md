---
id: UC-RAIT-015
title: Secretaria confirma a banca da sessão e convoca suplentes
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria do colegiado, com o presidente, garante antes da sessão que a banca terá quorum,
presidente ou suplente e, no CETRAN-AM, paridade de representação, convocando suplentes quando
necessário.

## Pré-condições

- Pauta fechada ([UC-RAIT-005]); sessão em `PAUTA_FECHADA`/`CONVOCACAO_ENVIADA` ([WF-RAIT-003]).
- Suplente de plantão designado para a sessão ([UC-RAIT-013]).

## Fluxo principal

1. Ao fechar a pauta, sistema forma a banca prevista (`BANCA_PREVISTA`): titulares escalados +
   suplente de plantão; para cada item, marca os membros impedidos.
2. Membros confirmam presença até `T-CONV`; sistema recalcula quorum (maioria simples), presença do
   presidente ou suplente e, no CETRAN-AM, a paridade dos blocos.
3. Requisitos atendidos → `BANCA_CONFIRMADA`; a sessão pode abrir (`SESSAO_ABERTA`).
4. Na abertura, quorum é reverificado item a item: membro impedido no item sai da contagem daquele
   item.

## Fluxos alternativos / exceções

- **2a.** Confirmações abaixo do quorum → `BANCA_INSUFICIENTE`; secretaria convoca o suplente de
  plantão e, se insuficiente, os demais suplentes na ordem do regimento (pendente); presidente pode
  remarcar dentro do calendário.
- **2b.** Presidente ausente sem suplente → sessão não abre; escalonamento ao gestor.
- **4a.** Item sem quorum por impedimentos → item retirado da pauta e devolvido a `PRONTO_P_DECISAO`
  com prioridade na próxima sessão; a sessão prossegue nos demais.
- **3a.** Sem quorum na abertura → `SESSAO_ADIADA` ([WF-RAIT-003]); faltas injustificadas
  registradas ([RN-RAIT-142]).

## Pós-condições

Banca registrada em `rait_attendance` com presidente/suplente e suplentes convocados; sessão apta a
abrir ou adiada com registro.

## Critérios de aceitação

**AC-RAIT-015-1 — a banca é verificada antes e na abertura**

- **Dado** uma sessão com pauta fechada
- **Quando** `T-CONV` vence
- **Então** a banca está `BANCA_CONFIRMADA` ou `BANCA_INSUFICIENTE`, nunca indefinida, e a abertura repete a verificação

**AC-RAIT-015-2 — suplente de plantão é o primeiro convocado**

- **Dado** banca `BANCA_INSUFICIENTE`
- **Quando** a secretaria convoca
- **Então** o suplente de plantão da sessão é convocado antes de qualquer outro

**AC-RAIT-015-3 — impedimento retira o item, não a sessão**

- **Dado** um item cujo quorum cai abaixo da maioria por impedimentos
- **Quando** a sessão está aberta
- **Então** só aquele item é retirado e reprogramado com prioridade

**AC-RAIT-015-4 — paridade no CETRAN-AM**

- **Dado** uma sessão do CETRAN-AM
- **Quando** a banca é confirmada
- **Então** os três blocos de representação estão presentes na proporção exigida, ou a sessão não abre

## Regras aplicáveis

- [RN-RAIT-142] (suplência, substituição, perda de mandato)
- [RN-RAIT-140] (impedimento por item)
- [RN-RAIT-116], [RN-RAIT-117] (quorum da JARI e do CETRAN)
