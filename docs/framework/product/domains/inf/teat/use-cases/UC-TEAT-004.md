---
id: UC-TEAT-004
title: Agente coleta assinatura, recusa ou impossibilidade de assinatura
status: approved
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/framework/product/workflows/ait-lifecycle.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    'REF-CONTRAN-918',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito oferece ao condutor/pessoa a ciência do ato lavrado (AIT ou termo de medida
administrativa) e registra um dos três resultados possíveis, sem impedir a finalização do ato em
nenhum dos casos.

## Pré-condições

Ato legal em rascunho, com condutor/pessoa identificado e presente (aplica-se apenas quando houve
abordagem — ver [UC-TEAT-001]; não se aplica ao fluxo de [UC-TEAT-002]).

## Fluxo principal

1. Agente apresenta o auto/termo ao condutor na tela de assinatura (`ait-signature`, UX-MOB-030).
2. Condutor assina digitalmente → `AitPerson.signed = true`; `AitSignature` criada com
   `signature_type`, `signature_evidence_id` (se capturada como evidência), `signed_at`,
   `location_json`.
3. Sistema grava `AitStatusHistory` refletindo o evento de ciência.
4. Fluxo prossegue para revisão e finalização ([UC-TEAT-001] passo 10).

## Fluxos alternativos / exceções

- **2a. Recusa.** Condutor se recusa a assinar → `AitPerson.refused_signature = true`;
  `AitSignature.refusal_or_impossibility_reason` registra o motivo da recusa. A assinatura
  representa apenas ciência do ato, não concordância com o mérito — recusa não invalida o AIT
  nem impede sua finalização (RN-AIT-007).
- **2b. Impossibilidade.** Condutor está ausente, incapacitado ou de outra forma impossibilitado
  de assinar → mesmo campo `refusal_or_impossibility_reason` registra motivo de impossibilidade,
  distinto de recusa (padrão replicado em `AdministrativeTerm` — RN-MED-012 — e no procedimento de
  etilômetro, onde falha de equipamento e recusa ao teste também são explicitamente distinguidas
  — RN-ALC-004, RN-ALC-010, por terem efeito jurídico diferente).
- **2c. Testemunha.** Quando aplicável, assinatura de testemunha pode ser coletada
  adicionalmente (fonte de protótipo, corpus UC-1.122 — não modelado como entidade própria nas
  fontes de blueprint lidas; fonte pendente para o runtime oficial).

## Pós-condições

Um dos três resultados (assinado/recusado/impossibilitado) está registrado antes da finalização
do ato; nenhum bloqueia a finalização.

## Critérios de aceitação

**AC-TEAT-004-1 — três resultados distintos, nunca um campo só**

- **Dado** a etapa de ciência de um auto ou termo
- **Quando** o agente a conclui
- **Então** o resultado é exatamente um entre assinado, **recusado** e **impossibilitado**, cada um
  persistido de forma distinguível ([RN-TEAT-005]) — recusa e impossibilidade têm efeito jurídico
  diferente e não podem compartilhar um único booleano

**AC-TEAT-004-2 — nenhum dos três bloqueia a finalização**

- **Dado** recusa ou impossibilidade registrada
- **Quando** o agente finaliza o ato
- **Então** a finalização ocorre normalmente — assinar é ciência, não concordância, e a recusa não
  invalida o auto

**AC-TEAT-004-3 — recusa exige motivo registrado**

- **Dado** uma recusa de assinatura
- **Quando** é registrada
- **Então** o sistema exige `refusal_or_impossibility_reason` e grava o `AitStatusHistory`
  correspondente

**AC-TEAT-004-4 — o mesmo padrão vale para termos de medida**

- **Dado** um Termo de Recolhimento ou termo de medida administrativa
- **Quando** a ciência é colhida
- **Então** vale o mesmo tríptico, e a recusa de assinatura **não invalida a notificação** quando a
  pessoa está presente ([RN-TEAT-126], Res. 1025/2026 art. 14 §2º)

**AC-TEAT-004-5 — a assinatura do condutor não se confunde com a do agente**

- **Dado** um auto assinado pelo condutor
- **Quando** o auto é composto
- **Então** a identificação eletrônica do agente ([RN-TEAT-110]) permanece registrada em campo
  próprio e distinto — as duas nunca compartilham representação

## Regras aplicáveis

- [RN-TEAT-005] (assinatura/recusa/impossibilidade como resultados distintos)
