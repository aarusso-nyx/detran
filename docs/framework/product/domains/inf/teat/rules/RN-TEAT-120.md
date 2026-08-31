---
id: RN-TEAT-120
title: Cancelamento de AIT em preenchimento — pedido do agente, decisão da autoridade, no próprio software
status: draft
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** Iniciado o preenchimento do AIT, o seu **cancelamento poderá ser solicitado à
Autoridade de Trânsito, no próprio software, com a devida justificativa**. Três elementos são
normativos e não negociáveis: (a) o agente **solicita**, não cancela — a decisão é da autoridade
de trânsito; (b) o pedido tramita **no próprio software**, e não por canal externo (ofício,
e-mail, chamado); (c) **a justificativa é obrigatória**. O alcance da regra é o **preenchimento em
curso** — rascunho ainda não finalizado. Cancelamento **após** a finalização não é regido por esta
norma: ver [RN-TEAT-121].

**Base legal.** [REF-SENATRAN-997] Anexo II, k):

> "Iniciado o preenchimento do AIT, o seu cancelamento poderá ser solicitado à Autoridade de
> Trânsito, no próprio software, com a devida justificativa."

**Verificação.** Fecha **parcialmente** o gap "(fonte pendente) condições e ator autorizado para
`CANCELADO`" de [WF-TEAT-001] — mas em um ponto diferente do que o diagrama supõe: a transição que
a norma cobre parte de `RASCUNHO_OFFLINE`, **não** de `FINALIZADO_LOCAL`. Modelagem correta:
`RASCUNHO_OFFLINE → CANCELAMENTO_SOLICITADO → CANCELADO | RASCUNHO_OFFLINE`, com
`justificativa` obrigatória e `traffic-authority` como ator decisor. Como o cancelamento pode ser
pedido em campo e offline, a decisão da autoridade é assíncrona: o rascunho fica **bloqueado para
edição e para finalização** enquanto pendente. O número reservado consumido pelo rascunho
cancelado segue o regime de [RN-TEAT-113] (a norma nada diz sobre devolução).

**Controvérsia/risco.** A norma exige decisão da autoridade **no próprio software**, o que
pressupõe conectividade — mas o preenchimento é expressamente offline (Anexo I, e). A norma não
resolve o intervalo: um rascunho cujo cancelamento foi pedido em campo, sem rede, fica pendente
por tempo indeterminado, ocupando número reservado e impedindo, por força de [RN-TEAT-114], o
início de novo AIT pelo mesmo agente no mesmo aparelho. Essa combinação de dois requisitos da
mesma Portaria produz um **bloqueio operacional real** que o texto não previu. Registrado em
`_intake/legal-assessment.md`, item 21.
