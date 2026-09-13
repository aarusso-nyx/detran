---
id: UC-TEAT-002
title: Agente lavra AIT sem abordagem (constatação indireta)
status: approved
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    'teat:docs/meta/prototypes/docs/GL-1_Glossario_Talonario_Eletronico.md',
    'REF-CONTRAN-918',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito constata infração sem contato direto com o condutor (`had_approach = false`)
— por exemplo veículo estacionado sem condutor presente, ou constatação por equipamento — e lavra
o AIT registrando o motivo da ausência de abordagem.

## Pré-condições

Mesmas de [UC-TEAT-001]. Enquadramento selecionável deve admitir constatação sem abordagem
(`Framing.allows_no_approach = true`).

## Fluxo principal

1. Agente registra que não houve abordagem (`Ait.had_approach = false`).
2. Sistema exige `no_approach_reason` — RN-AIT-008: "AIT sem abordagem deve registrar condição ou
   motivo, quando exigido pela regra" (ex.: veículo estacionado sem condutor —
   GL-1 define "sem abordagem" como situação em que a infração é registrada sem contato com o
   condutor, exigindo motivo/justificativa em alguns fluxos).
3. Agente seleciona enquadramento compatível com constatação sem abordagem — RN-AIT-009 bloqueia
   enquadramento que exige abordagem quando `had_approach = false`.
4. Segue o mesmo fluxo de [UC-TEAT-001] a partir do passo 4 (enquadramento) até a finalização,
   exceto pela etapa de assinatura/ciência do condutor, que é omitida (não há condutor presente
   para colher ciência no ato).
5. Sistema identifica condutor/proprietário por consulta de veículo, quando possível
   (`AitPerson.identified_by = "consulta_veicular"`), para fins de posterior notificação em
   [WF-INF-003] — a identificação do condutor no ato, quando possível, é preceito de
   [REF-CONTRAN-918] art. 3º §4º.

## Fluxos alternativos / exceções

- **2a.** Enquadramento não admite `no_approach_reason` vazio → validação bloqueia finalização.
- **3a.** Agente tenta selecionar enquadramento que exige abordagem com `had_approach = false` →
  sistema impede (RN-AIT-009).

## Pós-condições

AIT finalizado com `constatation_type` registrado e `no_approach_reason` preenchido quando
exigido; sem registro de assinatura/recusa do condutor (não aplicável).

## Critérios de aceitação

**AC-TEAT-002-1 — "sem abordagem" é classificação derivada, não texto livre**

- **Dado** um auto com `had_approach = false`
- **Quando** o agente informa a condição
- **Então** o sistema deriva a classificação Caso 1/2/3 do próprio enquadramento
  ([RN-TEAT-108], MBFT Seção 7) e só pede justificativa quando o caso a exige — não existe campo
  de motivo em texto livre

**AC-TEAT-002-2 — enquadramento que exige abordagem é bloqueado**

- **Dado** `had_approach = false`
- **Quando** o agente seleciona um enquadramento cuja ficha exige contato com o condutor
- **Então** o sistema bloqueia a seleção e explica qual condição não se verifica

**AC-TEAT-002-3 — a etapa de ciência é omitida, não falseada**

- **Dado** um auto sem abordagem
- **Quando** ele avança para revisão
- **Então** o sistema omite a coleta de assinatura e **não** registra recusa nem impossibilidade —
  não há condutor presente, e marcar recusa nesse caso seria registro falso ([RN-TEAT-005])

**AC-TEAT-002-4 — identificação por consulta é rotulada como tal**

- **Dado** que o veículo permite identificar proprietário por consulta veicular
- **Quando** o sistema preenche a pessoa
- **Então** grava `identified_by = "consulta_veicular"`, distinguindo-a de identificação presencial
  ([REF-CONTRAN-918] art. 3º §4º)

**AC-TEAT-002-5 — sem abordagem o AIT não vale como NA**

- **Dado** um auto sem abordagem
- **Quando** ele é finalizado
- **Então** o sistema não o marca como valendo por Notificação da Autuação ([RN-TEAT-107]) — a NA
  é expedida pela retaguarda em [WF-INF-003]

## Regras aplicáveis

- [RN-TEAT-004] (imutabilidade pós-finalização)
- (fonte pendente) catálogo fechado de valores de `no_approach_reason` — não localizado nas
  fontes lidas; hoje é campo de texto livre orientado por regra, não enum fechado.
