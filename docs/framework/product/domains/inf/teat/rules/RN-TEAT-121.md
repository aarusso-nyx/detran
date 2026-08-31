---
id: RN-TEAT-121
title: Cancelamento de AIT finalizado — prática do DETRAN-AM sem base normativa federal
status: draft
apps: [teat]
sources: [REF-DETRANAM-TALAO-BODYCAM, REF-SENATRAN-997, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra (prática, não norma).** Finalizado/sincronizado o AIT, **não há cancelamento por ato
unilateral do agente**. Na operação real do DETRAN-AM — mesma organização-alvo do TEAT — a
necessidade de cancelar um auto já sincronizado é **submetida à Diretoria de Fiscalização** do
órgão. Esta regra é registrada como **prática operacional documentada em fonte secundária, sem
base normativa formal localizada**, e não como comando legal. O que **tem** base legal e deve
governar o desenho é o par: (a) imutabilidade pós-lavratura ([RN-TEAT-112], [RN-TEAT-004]) —
o auto finalizado não se reescreve; (b) arquivamento por insubsistência ([RN-TEAT-119]) — a via
legal de extinção do auto na fase de processamento é o art. 281 §1º, I do CTB, decidido pela
autoridade de trânsito, e não um "cancelamento" atípico.

**Base legal / base de fato.**

- [REF-SENATRAN-997] Anexo II, k) **não alcança** esta hipótese: cobre expressamente o
  cancelamento _"iniciado o preenchimento"_ ([RN-TEAT-120]).
- [REF-CTB-280-290] art. 281 §1º, I — o arquivamento por inconsistência/irregularidade é a via
  legal disponível após a lavratura.
- [REF-CONTRAN-918] art. 9º §1º — o **cancelamento do AIT** aparece na norma federal como efeito
  do **acolhimento da defesa da autuação** ("Acolhida a defesa da autuação, o AIT será cancelado,
  seu registro será arquivado…"), portanto em fase e por ator distintos (ver [RN-RAIT-132]).
- [REF-DETRANAM-TALAO-BODYCAM] §1 (**fonte secundária — notícia institucional, não ato
  normativo numerado**): concluídas as etapas do preenchimento, o Auto é sincronizado e _"deixa de
  ser possível reabri-lo para alterações"_; sendo necessário cancelá-lo, _"o agente deve submeter a
  decisão à Diretoria de Fiscalização do órgão"_.

**Verificação.** O estado `CANCELADO` a partir de `FINALIZADO_LOCAL` em [WF-TEAT-001] deve ser
remodelado como **solicitação formal** (`SOLICITADO_CANCEL_POSFINAL`, nome canônico em
[WF-TEAT-001]), com decisão de
`traffic-authority` em nível de Diretoria de Fiscalização, justificativa obrigatória, e **desfecho
mapeado a um fundamento legal**: acolhido, o auto vai para insubsistente/arquivado com fundamento
no art. 281 §1º, I; não acolhido, segue o fluxo normal. O ato original **nunca é excluído** — a
trilha permanece ([RN-TEAT-006]). Na UX, a solicitação pós-finalização não pode parecer uma ação
imediata do agente.

**Controvérsia/risco — alto.** Há aqui **duas lacunas empilhadas**: (1) nenhuma norma federal ou
estadual localizada disciplina o cancelamento de AIT finalizado antes do julgamento da defesa; (2)
a única fonte que descreve a prática é **notícia institucional**, não portaria — nem o instrumento
que institui a competência da Diretoria de Fiscalização foi localizado. Enquanto isso, o produto
não deve nomear o desfecho como "cancelamento" no plano jurídico: deve registrar a **decisão
administrativa** e o **fundamento legal** que a sustenta (art. 281 §1º, I), sob pena de criar um
ato administrativo atípico. Item 22 de `_intake/legal-assessment.md`, entre os cinco riscos
prioritários; pedido de busca dirigida por portaria/regimento do DETRAN-AM registrado em
[REF-DETRANAM-TALAO-BODYCAM] §Gaps.
