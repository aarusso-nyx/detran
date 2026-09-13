---
id: UC-TEAT-006
title: Operador saneia AIT com inconsistência tratável
status: reviewed
apps: [teat]
sources:
  [
    'teat:docs/framework/product/workflows/ait-lifecycle.md',
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    'teat:docs/framework/product/workflows/phase-d-web.md',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Operador de processamento (processing-operator) identifica inconsistência saneável em AIT
recebido e solicita correção; autoridade de trânsito (traffic-authority) aprova a correção,
preservando trilha completa da alteração.

## Pré-condições

AIT em `received`/`validating` com inconsistência detectada pela validação automatizada
(integridade, assinatura, número, campos mínimos, competência, enquadramento ou duplicidade —
RN-PRO-001/002).

## Fluxo principal

1. Validação automatizada classifica a inconsistência como **saneável** (RN-PRO-004); AIT
   permanece em `validating`, exibido na fila de saneamento (`ait-sanitization-queue`, tela web).
2. Operador de processamento analisa o AIT (`ait-detail`) e decide solicitar correção —
   `POST /v1/ait-lifecycle/aits/:id/correction-request` → AIT move para `pending_correction`;
   evento `ait.correction-requested`.
3. Operador (ou autoridade) prepara a correção na tela `ait-sanitize`: campo alterado, valor
   anterior, valor novo e justificativa obrigatória (RN-PRO-006) — nunca sobre fato essencial do
   auto (RN-PRO-005).
4. Autoridade de trânsito aprova — `POST /v1/ait-lifecycle/aits/:id/corrections/:correctionId/
approve` → grava `AitCorrection` completa (`operator_user_ref`, `changed_field`,
   `previous_value`, `new_value`, `justification`, `corrected_at`, `approved_by_user_ref`); AIT
   move para `corrected`; evento `ait.correction-approved`.
5. Autoridade de trânsito aceita o AIT corrigido — `.../:id/accept` → move para `accepted`,
   autorizando integração downstream ([WF-INF-003]).

## Fluxos alternativos / exceções

- **1a. Inconsistência não saneável:** classificação como não saneável direciona a fluxo de
  rejeição em vez de correção — `.../:id/reject` (ator traffic-authority), com motivo padronizado
  e observação (RN-PRO-007). AIT rejeitado nunca é excluído; motivo e trilha são preservados
  (RN-PRO-008).
- **2a. Rejeitado recebe pedido de correção:** de `rejected` também é possível
  `correction-request`, reabrindo para saneamento formal (ver [WF-TEAT-001]).
- **Decisão sensível:** rejeição legal, cancelamento ou inconsistência grave sempre exige
  intervenção de traffic-authority, nunca decisão automatizada (RN-PRO-010).

## Pós-condições

AIT corrigido com trilha de auditoria completa da alteração, aceito e apto a integrar
[WF-INF-003]; ou rejeitado com motivo e histórico preservados, sem exclusão do ato original.

## Critérios de aceitação

**AC-TEAT-006-1 — o que se corrige e o que obrigatoriamente se arquiva**

- **Dado** uma inconsistência detectada em AIT recebido
- **Quando** ela é classificada
- **Então** o sistema aplica a fronteira de [RN-TEAT-119]: vício sobre elemento **essencial** do
  auto não é saneável e segue para arquivamento/rejeição, enquanto vício formal saneável segue
  para correção — a classificação é registrada, nunca implícita

**AC-TEAT-006-2 — fato essencial nunca é objeto de saneamento**

- **Dado** um pedido de correção sobre enquadramento, data/hora ou local do fato
- **Quando** o operador o submete
- **Então** o sistema recusa: saneamento não alcança fato essencial do auto ([RN-TEAT-006])

**AC-TEAT-006-3 — toda correção carrega valor anterior, novo e justificativa**

- **Dado** uma `AitCorrection` aprovada
- **Quando** é persistida
- **Então** contém `changed_field`, `previous_value`, `new_value`, `justification`,
  `operator_user_ref` e `approved_by_user_ref` — nenhum deles opcional

**AC-TEAT-006-4 — decisão sensível exige autoridade humana**

- **Dado** rejeição legal, cancelamento ou inconsistência grave
- **Quando** a decisão é tomada
- **Então** é sempre de `traffic-authority`, jamais automatizada — o sistema pode classificar e
  sugerir, nunca decidir

**AC-TEAT-006-5 — rejeitado não é excluído**

- **Dado** um AIT rejeitado
- **Quando** o registro é consultado
- **Então** motivo padronizado, observação e trilha completa permanecem; o ato original nunca é
  apagado, e pode reabrir para saneamento formal

**AC-TEAT-006-6 — o conteúdo congelado permanece verificável**

- **Dado** um AIT corrigido
- **Quando** o pacote probatório é montado
- **Então** o `content_hash` original e o conteúdo pós-correção coexistem com a trilha entre eles
  ([RN-TEAT-004]) — corrigir nunca reescreve o congelado

## Regras aplicáveis

- [RN-TEAT-004] (imutabilidade — correção só por procedimento formal)
- [RN-TEAT-006] (limites e auditabilidade do saneamento)
