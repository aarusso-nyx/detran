---
id: UC-PEC-010
title: Conduzir recurso à Junta Especial de Saúde (terceira instância, CETRAN)
status: reviewed
apps: [pec]
sources:
  - REF-CONTRAN-927-2022
  - WF-PEC-002
  - RN-PEC-110
  - RN-PEC-111
  - RN-PEC-112
updated: 2026-08-31
---

## Ator e objetivo

Candidato/condutor cuja Junta Médica ou Psicológica manteve o resultado de inaptidão permanente
recorre ao CETRAN (ou CONTRANDIFE), que designa uma **Junta Especial de Saúde** — colegiado
técnico distinto, com maioria de especialistas — para julgar o mérito do recurso. Origem: Res.
CONTRAN 927/2022 arts. 13 e 15. Ver [WF-PEC-002] §"Estados — trilha legal" para a máquina de
estados completa.

**Decisão de modelagem aprovada.** O alvo implementa o processo normativo com Junta Especial
distinta. O `escalateToCetran` da origem é apenas evidência de uma divergência histórica e não é
um mecanismo permitido no alvo.

## Pré-condições

- Junta Médica ou Psicológica de 1ª instância decidiu e **manteve** o resultado de inaptidão
  permanente ([UC-PEC-005]/estado `JUNTA_DECIDIU` de [WF-PEC-002]).
- Candidato ainda está dentro do prazo de 30 dias corridos do conhecimento do resultado da
  revisão (art. 13).

## Fluxo principal

1. Candidato apresenta recurso ao órgão executivo de trânsito, dirigido ao CETRAN/CONTRANDIFE,
   no prazo de 30 dias (art. 13).
2. Órgão remete os documentos ao CETRAN/CONTRANDIFE no prazo de 20 dias úteis do recebimento do
   recurso (art. 14 §2º).
3. CETRAN/CONTRANDIFE designa a Junta Especial de Saúde: no mínimo 3 profissionais, sendo 2
   especialistas em Medicina de Tráfego (recurso médico) ou em Psicologia de Trânsito (recurso
   psicológico) (art. 15, parágrafo único).
4. Junta Especial de Saúde analisa o dossiê e profere decisão final sobre o recurso.
5. Decisão é comunicada ao candidato e ao processo RENACH.

## Fluxos alternativos / exceções

- **Prazo de designação/decisão da Junta Especial de Saúde**: nenhum prazo numérico foi
  localizado para estas duas etapas (distinto dos prazos de 15du/30d da Junta de 1ª instância) —
  **(fonte pendente)**, ver [WF-PEC-002] §"Escada de escalonamento".
- **Decisão mantém a inaptidão**: a norma capturada não descreve instância recursal adicional —
  a decisão da Junta Especial de Saúde é, aparentemente, definitiva. Não confirmado com LEGAL.

## Pós-condições

- Recurso decidido pela Junta Especial de Saúde, decisão registrada e comunicada.
- Se a decisão reverte a inaptidão: resultado de aptidão atualizado no processo/RENACH.
- Se mantém: resultado de inaptidão permanece, sem via recursal adicional identificada.

## Critérios de aceitação

**AC-PEC-010-1 — a terceira instância é órgão distinto, com composição própria**

- **Dado** um recurso à Junta Especial de Saúde
- **Quando** é instaurado
- **Então** o CETRAN **designa** o colegiado — no mínimo três profissionais, sendo dois
  especialistas em Medicina de Tráfego ou Psicologia de Trânsito conforme a trilha
  ([RN-PEC-110], [RN-PEC-111]) — o CETRAN designa, não julga tecnicamente

**AC-PEC-010-2 — os prazos com fonte são aplicados; os sem fonte não são inventados**

- **Dado** o rito recursal
- **Quando** os prazos são calculados
- **Então** aplicam-se os 30 dias para recorrer e os 20 dias úteis para remessa ([RN-PEC-112]); o
  prazo de designação e o de decisão da Junta Especial **não têm fonte** e são exibidos como
  pendência, nunca como número presumido

**AC-PEC-010-3 — a composição designada fica registrada no caso**

- **Dado** uma Junta Especial designada
- **Quando** decide
- **Então** os membros e suas especialidades constam do caso — sem isso não é verificável que a
  composição exigida foi observada

**AC-PEC-010-4 — reverter a inaptidão atualiza o RENACH**

- **Dado** uma decisão que reverte
- **Quando** é registrada
- **Então** o resultado é atualizado e transmitido ([UC-PEC-009])

**AC-PEC-010-5 — o esgotamento da via administrativa é declarado**

- **Dado** uma decisão que mantém a inaptidão
- **Quando** é comunicada
- **Então** informa que não há instância administrativa adicional identificada — afirmação
  rotulada como leitura a confirmar por LEGAL, não como certeza

## Regras aplicáveis

- [RN-PEC-110] (as três instâncias, com o CETRAN como designador e não julgador técnico)
- [RN-PEC-111] (composição da Junta Especial de Saúde)
- [RN-PEC-112] (escada de prazos; prazo de designação/decisão da própria Junta Especial de Saúde
  segue **(fonte pendente)** mesmo após a rodada LEGAL)
