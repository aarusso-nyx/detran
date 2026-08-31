---
id: RN-TEAT-135
title: Validade metrológica do etilômetro é precondição da prova — aparelho sem verificação vigente não produz AIT por medição
status: draft
apps: [teat]
sources:
  [REF-CONTRAN-432, REF-INMETRO-369-2021, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** O etilômetro deve, cumulativamente: **ter modelo aprovado pelo INMETRO** e **ser
aprovado nas verificações metrológicas** (inicial, eventual, em serviço e anual) realizadas pelo
INMETRO ou por órgão da RBMLQ. Para cada exemplar aprovado é emitido **Certificado de Verificação
contendo data de validade, que deve acompanhar o etilômetro**; a **verificação periódica deve ser
realizada a cada doze meses**; exemplares reprovados recebem **selo de interdição** e só voltam a
ser usados após aprovação em verificação após reparo. Consequência de negócio: **um etilômetro sem
certificado de verificação vigente não produz prova válida** — o TEAT não deve permitir registrar
uma medição vinculada a aparelho cuja validade metrológica esteja vencida ou desconhecida. Isso
**não impede a autuação**: impede apenas aquele **meio de prova**, restando os demais do art. 277
([RN-TEAT-131]).

**Base legal.**

- [REF-CONTRAN-432] art. 4º: _"O etilômetro deve atender aos seguintes requisitos: I – ter seu
  modelo aprovado pelo INMETRO; II – ser aprovado na verificação metrológica inicial, eventual, em
  serviço e anual realizadas pelo Instituto Nacional de Metrologia, Qualidade e Tecnologia -
  INMETRO ou por órgão da Rede Brasileira de Metrologia Legal e Qualidade - RBMLQ"_.
- [REF-INMETRO-369-2021] art. 1º §1º: o regulamento aplica-se aos etilômetros usados na
  fiscalização de trânsito _"com fins probatórios"_.
- [REF-INMETRO-369-2021] Anexo, itens 4.1 e 6.3 (verbatim do PDF oficial): _"4.1.1.1 Para cada
  exemplar aprovado, deve ser emitido Certificado de Verificação contendo data de validade, que
  deve acompanhar o etilômetro."_ · _"4.1.2 Etilômetros reprovados devem receber selo de
  interdição."_ · _"4.1.2.2 No caso de reprovação em verificação subsequente, a marca de
  verificação anterior deve ser removida."_ · _"6.3.1 A verificação periódica deve ser realizada a
  cada doze meses."_ · _"6.3.3 Etilômetros reprovados em verificação periódica devem ser utilizados
  somente após aprovação em verificação após reparo."_
- [REF-CTB-165-277-medidas-alcoolemia] art. 276, parágrafo único (margem de tolerância "observada a
  legislação metrológica").

**Verificação.** Requisito **não modelado** em nenhum blueprint TEAT lido. O `NormativeCatalog`/
cadastro operacional precisa de uma entidade de **instrumento de medição** com `marca`, `modelo`,
`numero_de_serie`, `registro_inmetro`, `certificado_verificacao_id`, `verificacao_valida_ate` e
`status` ∈ {APROVADO, INTERDITADO}. Ao registrar um teste, o TEAT valida
`data_do_teste ≤ verificacao_valida_ate` e `status = APROVADO`. Em campo, sem conectividade, a
validação usa o cadastro embarcado no pacote normativo — o que exige que o dado do parque de
etilômetros seja **distribuído**, e não apenas consultado online. É a mesma arquitetura de
homologação de [RN-TEAT-003]/[RN-TEAT-117], mas com **órgão certificador diferente** (INMETRO/RBMLQ,
não SENATRAN) e **periodicidade diferente** (12 meses, não 4 anos).

**Controvérsia/risco.** A Res. 432/2013 exige verificação _"inicial, eventual, em serviço e
anual"_; o RTM do INMETRO estrutura o regime como _verificação inicial_, _verificação subsequente
(periódica, a cada 12 meses)_ e _inspeção_. A nomenclatura não coincide, embora o conteúdo
substancialmente sim. Adotamos como controle operacional único a **data de validade do Certificado
de Verificação** que acompanha o aparelho — é o dado que a própria norma metrológica torna
oponível. Item 37 de `_intake/legal-assessment.md`.
