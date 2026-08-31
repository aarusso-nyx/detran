---
id: RN-TEAT-130
title: Recolhimento do CLA/CRLV-e é lançamento em sistema, com ciência por recibo ou por campo do próprio AIT
status: draft
apps: [teat]
sources: [REF-CONTRAN-985-1003-MBFT, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** O recolhimento do Certificado de Licenciamento Anual, hoje digital (CRLV-e), **consiste
na inserção, em sistema informatizado, de restrição do documento** — não em apreensão de papel.
Cabe em duas situações: (a) quando **não for possível sanar a irregularidade no local** nos casos
em que esteja prevista retenção ou remoção e o veículo tenha sido liberado nos termos do art. 270
§2º ou do art. 271 §9º-A do CTB ([RN-TEAT-124], [RN-TEAT-125]); e (b) quando houver **fundada
suspeita de inautenticidade ou adulteração**, hipótese em que o documento e o **condutor** são
encaminhados à Polícia Judiciária (CTB art. 274). A **ciência** do recolhimento digital dá-se por
**recibo entregue ao condutor** ou por **lançamento da medida em campo próprio ou no campo de
observações do AIT** — e é ela que faz correr o prazo de regularização.

**Base legal.** [REF-CONTRAN-985-1003-MBFT] Seção 8.4:

> "Consiste na inserção, em sistema informatizado, de restrição do documento que certifica o
> licenciamento do veículo, com o objetivo de garantir que o proprietário promova a regularização
> de uma infração constatada. Deve ser aplicado nas seguintes situações: a) quando não for possível
> sanar a irregularidade no local da infração, nos casos em que esteja prevista a medida
> administrativa de retenção ou de remoção do veículo e este tenha sido liberado nos termos do § 2º
> do art. 270 e § 9º-A do art. 271 do CTB. b) quando houver fundada suspeita quanto à
> inautenticidade ou adulteração, devendo ser encaminhado, juntamente com o condutor, para a
> Polícia Judiciária, nos termos do art. 274 do CTB."
>
> "A ciência do recolhimento digital do CLA/CRLV-e dar-se-á por meio de recibo entregue ao condutor
> ou de lançamento dessa medida administrativa em campo próprio ou no de observações do AIT."

[REF-CONTRAN-985-1003-MBFT] Seção 8.1: _"O recolhimento do CRLV-e se dará com o lançamento, pelo
órgão responsável pela fiscalização, desta medida administrativa no cadastro do veículo junto ao
Renavam."_ Ver [REF-CTB-165-277-medidas-alcoolemia] art. 269 §5º e art. 270 §§2º-3º.

**Verificação.** O TEAT deve produzir, para esta medida, **um recibo** (documento impresso ou
registro estruturado) contendo o prazo assinalado ([RN-TEAT-124]: ≤30 dias na retenção;
[RN-TEAT-125]: ≤15 dias na remoção) — porque é do **recibo** que a norma faz correr o prazo. A
alternativa admitida (lançamento no campo de observações do AIT) é aceitável juridicamente mas
**inferior operacionalmente**: mistura a medida com o auto e degrada a estruturação do dado
([RN-TEAT-109]). Recomendação: gerar sempre o campo próprio; usar Observações apenas como
espelho na impressão. A conclusão da medida depende de confirmação do lançamento no Renavam —
integração auditada, não ato local.

**Controvérsia/risco.** O par "recolhimento do CLA" e "restrição administrativa no Renavam" tem
**dois momentos distintos** que a operação frequentemente funde: o recolhimento ocorre **no ato**
(início do prazo); a restrição administrativa ocorre **no vencimento** do prazo sem regularização
(art. 270 §6º / art. 271 §9º-C). Modelar os dois como o mesmo lançamento produz restrição indevida
no dia da abordagem. Item 33 de `_intake/legal-assessment.md`.
