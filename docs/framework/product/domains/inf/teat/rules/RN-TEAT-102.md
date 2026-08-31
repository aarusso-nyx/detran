---
id: RN-TEAT-102
title: A autuação é ato vinculado sobre fato materialmente constatado — nunca sobre presunção do agente
status: draft
apps: [teat]
sources: [REF-CONTRAN-985-1003-MBFT, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** A lavratura do AIT é **ato administrativo vinculado**: constatada a infração, o agente
deve lavrar; não constatada com materialidade suficiente, não pode lavrar. Três vedações
decorrem diretamente do Manual e valem como regra de sistema: (a) **não se lavra AIT com base em
presunção subjetiva** do agente — o fato circunstancial precisa revestir-se da materialidade da
infração efetivamente cometida; (b) **não se lavra AIT quando a infração depender de sinalização
específica e esta não estiver suficiente, legível e visível** — nesse caso o agente comunica a
irregularidade à autoridade com circunscrição sobre a via, em vez de autuar; (c) **é vedada a
lavratura por solicitação de terceiros**, salvo a hipótese única de operação de fiscalização em
que um agente constata e informa a outro agente da mesma operação — e, nesse caso, a informação
**deve constar do campo Observações**.

**Base legal.** [REF-CONTRAN-985-1003-MBFT] Seção 7:

> "A autuação é ato administrativo, vinculado na forma da lei, da autoridade de trânsito ou seus
> agentes quando da constatação do cometimento de infração de trânsito, devendo ser formalizado
> por meio da lavratura do Auto de Infração de Trânsito (AIT)."
>
> "Quando a configuração de uma infração depender da existência de sinalização específica, esta
> deverá revelar-se suficiente e corretamente implantada de forma legível e visível. Caso
> contrário, o agente não deverá lavrar o AIT, comunicando à autoridade de trânsito com
> circunscrição sobre a via a irregularidade observada."
>
> "É vedada a lavratura do AIT por solicitação de terceiros, excetuando-se o caso em que o órgão
> ou entidade de trânsito realiza operação de fiscalização de trânsito, em que um agente de
> trânsito constate a infração e a informe a outro agente que esteja na operação, devendo tal
> informação constar do campo observações do AIT."
>
> "[No atendimento de sinistros] o fato circunstancial terá que se revestir de toda a
> materialidade relativa à infração efetivamente cometida e não de mera presunção subjetiva do
> agente."

Complementa [REF-CTB-280-290] art. 280 §2º (a infração _deverá_ ser comprovada por declaração do
agente ou meio tecnológico regulamentado).

**Verificação.** (a) e (c) são regras de **captura**, não de validação automática: o TEAT deve
oferecer, no fluxo de lavratura originada em operação, um campo estruturado
`constatado_por_outro_agente` que, quando marcado, **exige** o registro do agente constatador e
**escreve automaticamente** a informação no campo Observações — atendendo à exigência do MBFT sem
depender de o agente lembrar de digitá-la. (b) é regra de catálogo: enquadramentos cuja
configuração dependa de sinalização (`requires_signage`) devem exibir, antes da finalização, a
confirmação explícita de que a sinalização foi verificada; a resposta negativa **não gera AIT** —
gera uma **comunicação de irregularidade de sinalização** à autoridade da via, artefato distinto
hoje inexistente no TEAT.

**Controvérsia/risco.** A comunicação de irregularidade de sinalização é obrigação normativa do
agente ("comunicando à autoridade de trânsito com circunscrição sobre a via") sem forma, prazo ou
destinatário definidos em norma. Modelá-la como saída do app é decisão de produto, não imposição
legal — mas **não modelá-la** deixa o agente sem meio de cumprir um dever expresso. Registrado em
`_intake/legal-assessment.md`, item 5.
