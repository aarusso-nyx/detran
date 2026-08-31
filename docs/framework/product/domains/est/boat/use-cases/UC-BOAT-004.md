---
id: UC-BOAT-004
title: Agente captura croqui, evidências e associa AITs/medidas
status: approved
apps: [boat, teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json',
    'teat:docs/framework/product/workflows/crash-records.md',
    'teat:docs/framework/product/ux-parity/mobile-matrix.json',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente documenta o sinistro visualmente (croqui, fotos) e associa AITs e medidas administrativas
lavrados no mesmo atendimento.

## Pré-condições

`CrashRecord` em `in_attendance`, `recorded` ou `pending_complement`.

## Fluxo principal

1. Agente anexa croqui (`crash-sketch`, UX-MOB-067): `CrashSketch.sketch_type`,
   `drawing_json` (croqui estruturado) e/ou `evidence_id` (referência a evidência TEAT — ver
   [UC-TEAT-003]).
2. Agente captura fotos/evidências do sinistro (`crash-evidence`, UX-MOB-068), seguindo o mesmo
   fluxo de hash e custódia do núcleo TEAT ([RN-TEAT-002]).
3. Agente associa AIT(s) lavrado(s) no mesmo atendimento (`crash-ait-links`, UX-MOB-069) —
   vínculo por `crash_record_id`, hoje **sem FK rígida** em nível de banco (nota de risco em
   [WF-BOAT-001]).
4. Agente associa medida(s) administrativa(s) relacionada(s) (ex.: remoção de veículo), mesma
   observação de vínculo não rígido.

## Fluxos alternativos / exceções

- **1a.** Sem editor de croqui dedicado disponível: sistema aceita `drawing_json` estruturado
  como alternativa até existir editor próprio (nota explícita de `crash-records.md`).
- **3a.** Nenhum AIT foi lavrado no atendimento: passo é opcional, sinistro segue sem vínculo.

## Pós-condições

Croqui e evidências vinculados ao registro; AITs/medidas do mesmo atendimento associados (quando
existentes), compondo o quadro probatório completo do sinistro.

## Critérios de aceitação

**AC-BOAT-004-1 — croqui aceita as duas formas**

- **Dado** um agente sem editor de croqui dedicado
- **Quando** documenta a cena
- **Então** o sistema aceita `drawing_json` estruturado **ou** referência a evidência TEAT — a
  ausência de editor próprio nunca bloqueia o registro

**AC-BOAT-004-2 — evidência de sinistro usa a mesma custódia do TEAT**

- **Dado** uma foto capturada na cena
- **Quando** é anexada
- **Então** segue hash na captura, `EvidenceLink` e evento de custódia ([RN-TEAT-002]) — o domínio
  de sinistro não tem regime probatório próprio, mais frouxo

**AC-BOAT-004-3 — fotografar a cena, não o sofrimento**

- **Dado** a captura de evidência com vítimas presentes
- **Quando** o agente fotografa
- **Então** a interface orienta o enquadramento da cena e desencoraja imagem identificável de
  vítima; imagem que capture vítima recebe a mesma marcação de dado sensível dos demais campos
  ([RN-BOAT-122], [RN-BOAT-124])

**AC-BOAT-004-4 — o vínculo frouxo com AIT é conhecido e visível**

- **Dado** a associação de um AIT ao sinistro
- **Quando** é registrada
- **Então** o `crash_record_id` é gravado sabendo que **não há FK rígida** hoje (DT-111) — o
  sistema valida a existência do AIT na aplicação e a lacuna está registrada, não esquecida

## Regras aplicáveis

- [RN-TEAT-002] (hash e custódia de evidência, reaplicado ao domínio de sinistro)
