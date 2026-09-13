---
id: UC-PEC-005
title: Registrar decisão da junta e formalizar recurso ao CETRAN
status: reviewed
apps: [pec]
sources:
  - pec:domain/juntas-medical-board/api/src/juntas/juntas.service.ts
  - pec:domain/juntas-medical-board/api/src/juntas/dto/register-decision.dto.ts
  - pec:database/ddl/02-pec.sql
  - pec:docs/framework/pec/flows/junta-recursos.md
updated: 2026-08-31
---

## Ator e objetivo

Junta Médica ou Psicológica registra o parecer formal sobre o caso; se mantida a inaptidão, o
candidato pode interpor recurso dirigido ao CETRAN, que designará a Junta Especial descrita em
[UC-PEC-010]. Origem: UCAP-UC-41 ("Registrar Parecer da Junta") e
UCAP-UC-42 ("Registrar Recurso e Decisão CETRAN/CONTRANDIFE"). Ver [WF-PEC-002].

## Pré-condições

- Caso de junta existente em `SUBMITTED` ou `UNDER_REVIEW`, com colegiado designado e composição
  válida registrada.

## Fluxo principal

1. O colegiado designado analisa o dossiê; cada membro e especialidade estão vinculados ao caso.
2. Registra decisão fundamentada (`APROVADA`, `NEGADA` ou `SOLICITAR_COMPLEMENTO`) e seu recibo
   de assinatura PAdES.
3. `SOLICITAR_COMPLEMENTO` leva a `UNDER_REVIEW`; decisão conclusiva leva a `DECIDED`.
4. Se a inaptidão permanente for mantida, a comunicação informa o prazo de 30 dias para recurso.
5. Recurso tempestivo cria ato próprio, passa a `RECURSO_CETRAN_APRESENTADO` e inicia a remessa documental
   ao CETRAN; nunca altera o signatário da decisão anterior.

## Fluxos alternativos / exceções

- Recurso fora do prazo falha fechado e conserva a decisão anterior.
- `SOLICITAR_COMPLEMENTO` não encerra o caso e não libera o gate do encounter.

## Pós-condições

- Caso conclusivamente decidido, com decisão, composição e assinatura persistidas; ou caso em
  recurso formal, ainda bloqueando o encounter até a decisão final.
- O gate de encerramento só libera após decisão conclusiva sem recurso pendente.

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
