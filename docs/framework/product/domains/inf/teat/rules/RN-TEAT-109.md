---
id: RN-TEAT-109
title: Campo Observações — facultativo por regra, obrigatório por ficha, e integridade formal do auto
status: draft
apps: [teat]
sources: [REF-CONTRAN-985-1003-MBFT]
updated: 2026-08-24
---

**Regra.** O campo Observações do AIT tem **dois regimes**: (a) **facultativo**, para especificar a
conduta constatada ou acrescentar informação relevante; e (b) **obrigatório**, nas infrações cuja
ficha de fiscalização preveja expressamente que alguma informação é necessária para **caracterizar
a infração** (exemplo do próprio Manual: art. 169 do CTB — dirigir sem atenção). A
obrigatoriedade é, portanto, atributo do **enquadramento**, não do formulário. Regras acessórias
de integridade formal: as informações referentes à **caracterização da infração devem constar em
todas as vias** do AIT; e o AIT lavrado em suporte físico **não pode conter rasuras, emendas, uso
de corretivos ou qualquer tipo de adulteração**.

**Base legal.** [REF-CONTRAN-985-1003-MBFT] Seção 7:

> "O campo de Observações do AIT: a) poderá ser preenchido, consignando informações com o objetivo
> de especificar a conduta constatada e/ou adicionar outras informações relevantes, conforme
> exemplos constantes nas fichas de fiscalização; b) deverá ser preenchido, de forma obrigatória,
> nas infrações cuja ficha de fiscalização preveja de forma expressa, que é necessária alguma
> informação para caracterizar a infração, a exemplo do art. 169 do CTB […]"
>
> "As informações referentes à caracterização da infração devem constar em todas as vias do AIT."
>
> "O AIT, quando lavrado em suporte físico, não poderá conter rasuras, emendas, uso de corretivos,
> ou qualquer tipo de adulteração."

**Verificação.** `Framing.requires_observation` (já previsto em [APP-TEAT]) é o portador da
obrigatoriedade da alínea b) e deve vir do MBFT, não de configuração local do órgão. A
finalização é bloqueada quando `requires_observation = true` e o campo estiver vazio. A exigência
de "todas as vias" projeta-se sobre o modelo de documento impresso ([RN-TEAT-116]): a segunda via
não pode ser um resumo. A vedação de rasura é literal para **suporte físico**; seu equivalente
funcional no meio eletrônico é a **imutabilidade pós-lavratura** de [RN-TEAT-112]/[RN-TEAT-004] —
no digital não se rasura, reescreve-se, e é exatamente isso que a norma técnica proíbe.

**Controvérsia/risco.** O campo Observações é, ao mesmo tempo, o canal exigido por várias regras
distintas: caracterização da conduta (esta regra), informação do agente constatador em operação
([RN-TEAT-102]), condutas adicionais consolidadas ([RN-TEAT-103]), sinais psicomotores quando não
houver termo específico ([RN-TEAT-132]) e ciência do recolhimento digital do CRLV-e
([RN-TEAT-130]). Concentrar tudo em um único texto livre destrói a estruturação e a auditabilidade
do dado. Recomendação de modelagem: manter campos estruturados por finalidade e **compor** o texto
do campo Observações a partir deles na impressão — nunca o inverso. Registrado em
`_intake/legal-assessment.md`, item 8.
