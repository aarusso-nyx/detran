---
id: RN-TEAT-006
title: Saneamento de AIT só nos limites da norma, sempre auditável e nunca sobre fato essencial
status: draft
apps: [teat]
sources:
  [
    'teat:docs/framework/product/workflows/ait-lifecycle.md',
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    'teat:docs/framework/product/workflows/phase-d-web.md',
    REF-CTB-280-290,
    REF-CONTRAN-918,
    REF-CONTRAN-985-1003-MBFT,
  ]
updated: 2026-08-24
---

> **Nota de revisão (2026-08-24, especialista LEGAL).** Regra **confirmada**, com **base legal
> parcialmente fechada e uma advertência acrescentada**. Fechado: a **validação automatizada** tem
> fundamento expresso ([REF-CONTRAN-918] art. 4º §3º), e o **arquivamento** tem hipóteses legais
> fechadas ([REF-CTB-280-290] art. 281 §1º). **Não fechado, e agora qualificado como lacuna
> normativa e não como lacuna de pesquisa:** nenhuma norma federal disciplina o **saneamento** do
> AIT — o CTB só conhece o par consistente/insubsistente. Detalhamento e fronteiras em
> [RN-TEAT-119]; regra de consolidação de enquadramentos, que precede a validação, em
> [RN-TEAT-103].

**Regra.** Um AIT recebido passa por validação automatizada (integridade, assinatura, número,
campos mínimos, competência, enquadramento, duplicidade). Inconsistência encontrada é classificada
como **saneável** ou **não saneável** — nunca tratada informalmente. Saneamento só ocorre dentro
dos limites permitidos pela norma e pelo órgão, e **não pode alterar fato essencial** do auto
(o que caracterizaria novo ato, não correção). Toda ação de saneamento registra, na mesma
operação: campo alterado, valor anterior, valor novo, usuário responsável, data/hora e
justificativa. Rejeição exige motivo padronizado e observação; o AIT rejeitado nunca é excluído —
mantém o ato original, motivo e trilha. Decisões sensíveis (rejeição legal, cancelamento,
inconsistência grave) exigem intervenção de `traffic-authority`, nunca automatizadas.

**Base legal.**

- **Validação automatizada — fundamento expresso:** [REF-CONTRAN-918] art. 4º §3º — _"A autoridade
  de trânsito poderá utilizar meios tecnológicos para verificação da regularidade e da consistência
  do AIT."_ O _caput_ condiciona a expedição da NA à _"verificação da regularidade e da consistência
  do AIT"_.
- **Competência do juízo de consistência:** [REF-CTB-280-290] art. 281 _caput_ — _"A autoridade de
  trânsito […] julgará a consistência do auto de infração e aplicará a penalidade cabível."_
- **Desfecho negativo — hipóteses fechadas:** [REF-CTB-280-290] art. 281 §1º — _"O auto de infração
  será arquivado e seu registro julgado insubsistente: I - se considerado inconsistente ou
  irregular; II - se, no prazo máximo de trinta dias, não for expedida a notificação da autuação."_
- **Checklist de consistência:** [REF-CTB-280-290] art. 280 (ver [RN-TEAT-101]);
  [REF-CONTRAN-985-1003-MBFT] Seção 7 (materialidade, vedações e consolidação de enquadramentos —
  [RN-TEAT-102], [RN-TEAT-103]).
- **Reserva de competência de mérito:** [REF-CONTRAN-918] art. 2º, IV (o órgão autuador é
  competente para julgar a defesa da autuação) — a correção formal não pode invadir esse juízo.
- **(fonte pendente — lacuna normativa, não de pesquisa):** **nenhuma norma federal disciplina o
  saneamento/correção formal do AIT após a lavratura**. Confirmado nesta rodada contra CTB, Res.
  CONTRAN 918/2022, Portaria SENATRAN 997/2022 e MBFT. A mecânica de `AitCorrection` permanece
  doutrina operacional, exercida na zona entre os dois únicos polos legais — e a Portaria SENATRAN
  997/2022 (art. 3º, V) ainda **impede a alteração do AIT após o término da lavratura**, sem
  ressalva de correção. Ver [RN-TEAT-119] e [RN-TEAT-004].

**Verificação.** Comandos `.../:id/correction-request` (de `validating`/`rejected`; atores
`processing-operator`, `traffic-authority`) e `.../:id/corrections/:correctionId/approve` (ator
`traffic-authority`) — ver [WF-TEAT-001]. Entidade `AitCorrection` grava `changed_field`,
`previous_value`, `new_value`, `justification`, `operator_user_ref`, `approved_by_user_ref`,
`corrected_at`. Tela web de processamento reúne fila de saneamento, ações de
correção/aceite/rejeição/transmissão e linha do tempo legal
("teat:docs/framework/product/workflows/phase-d-web.md"). Corpus de protótipo: RN-PRO-001, 002,
004, 005, 006, 007, 008, 009, 010, 013.

**Advertência de conformidade.** O vocabulário atual de [WF-TEAT-001] tem dois desfechos negativos
("rejeitado", "cancelado") que **não correspondem a nenhuma categoria do CTB**. O desfecho negativo
legalmente existente na fase de processamento é um só: **arquivamento com registro julgado
insubsistente**, fundado no art. 281 §1º, I. Todo desfecho negativo produzido pelo TEAT deve
carregar `fundamento_legal` explícito e ser mapeável a essa categoria — sob pena de o sistema
criar ato administrativo atípico e de a lista de motivos padronizados de rejeição virar norma de
fato sem norma de direito. A **lista de campos corrigíveis** (elementos não essenciais) precisa ser
decidida e formalizada pela autoridade de trânsito, não inferida pelo produto. Ver [RN-TEAT-119] e
`_intake/legal-assessment.md`, item 20.
