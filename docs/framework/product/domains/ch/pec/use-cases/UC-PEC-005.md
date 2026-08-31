---
id: UC-PEC-005
title: Registrar decisão da junta (com escalonamento a CETRAN)
status: reviewed
apps: [pec]
sources:
  - pec:domain/juntas-medical-board/api/src/juntas/juntas.service.ts
  - pec:domain/juntas-medical-board/api/src/juntas/dto/register-decision.dto.ts
  - pec:database/ddl/02-pec.sql
  - pec:docs/framework/pec/flows/junta-recursos.md
updated: 2026-08-26
---

## Ator e objetivo

Junta (ou CETRAN, em caso de recurso) registra o parecer/decisão formal sobre um caso
submetido, assinado digitalmente. Origem: UCAP-UC-41 ("Registrar Parecer da Junta") e
UCAP-UC-42 ("Registrar Recurso e Decisão CETRAN/CONTRANDIFE"). Ver [WF-PEC-002].

## Pré-condições

- Caso de junta existente em `SUBMITTED` (ou `UNDER_REVIEW`, caminho documentado mas não
  implementado — ver [WF-PEC-002]).

## Fluxo principal

1. Junta (ou CETRAN, ou Gestor DETRAN) analisa o dossiê do caso.
2. Chama `POST /juntas/:id/decision` com `decision` (`APROVADA` | `NEGADA` |
   `SOLICITAR_COMPLEMENTO`) e, opcionalmente, `escalateToCetran=true`.
3. Sistema assina o parecer (PAdES) atribuindo `signerName`/`signerCr` a `'JUNTA'` — ou a
   `'CETRAN'` se `escalateToCetran=true`.
4. Caso passa a `status='DECIDED'`.
5. A flag `escalatedToCetran` é publicada no evento de transmissão ao RENACH.

## Fluxos alternativos / exceções

- **Escalonamento a CETRAN**: não é um novo caso — é a mesma linha de decisão com a
  assinatura reatribuída. Não há, nos documentos capturados, um segundo ato formal de "abrir
  recurso" com prazo próprio.
- **`SOLICITAR_COMPLEMENTO`**: a decisão final ainda ocorre (`status='DECIDED'`); não há, no
  código, um caminho de reabertura automática do caso para acompanhar o complemento
  solicitado — comportamento operacional pós-complemento não documentado (fonte pendente).

## Pós-condições

- Caso `DECIDED`, com decisão e assinatura persistidas.
- Gate de encerramento do encounter associado deixa de listar "junta pendente".

## Critérios de aceitação

**AC-PEC-005-1 — a decisão é assinada e atribuída ao órgão que decidiu**

- **Dado** uma decisão de junta
- **Quando** é registrada
- **Então** o parecer é assinado em PAdES com a atribuição correta do órgão signatário

**AC-PEC-005-2 — escalonar ao CETRAN não é reatribuir assinatura**

- **Dado** um recurso à instância seguinte
- **Quando** é interposto
- **Então** existe **ato formal próprio** com prazo e composição própria ([RN-PEC-110],
  [RN-PEC-112]) — o comportamento atual, em que `escalateToCetran=true` apenas troca o nome do
  signatário na mesma linha de decisão, **não implementa a terceira instância** e é divergência
  conhecida entre o construído e a norma (DT-025)

**AC-PEC-005-3 — a escada de prazos é a da Res. 927/2022**

- **Dado** um recurso em curso
- **Quando** os prazos correm
- **Então** aplicam-se 30 dias / 15 dias úteis / 30 / 30 / 20 dias úteis ([RN-PEC-112]),
  distinguindo prazo preclusivo do administrado de SLA do órgão

**AC-PEC-005-4 — `SOLICITAR_COMPLEMENTO` não pode encerrar o caso**

- **Dado** uma decisão de solicitar complemento
- **Quando** é registrada
- **Então** o caso permanece aberto aguardando o complemento — hoje ele vai a `DECIDED`, o que
  torna `UNDER_REVIEW` inatingível e é débito registrado (DT-106)

**AC-PEC-005-5 — decisão que mantém a inaptidão comunica a via recursal restante**

- **Dado** uma decisão desfavorável
- **Quando** é comunicada
- **Então** informa qual instância ainda cabe e em que prazo, ou declara o esgotamento

## Regras aplicáveis

- (fonte pendente) regimento/composição formal da junta e do CETRAN aplicável — ver
  `_intake/proposals.md`.
