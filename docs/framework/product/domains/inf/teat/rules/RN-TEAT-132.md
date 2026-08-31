---
id: RN-TEAT-132
title: Sinais de alteração da capacidade psicomotora — conjunto de sinais e termo específico anexo ao AIT
status: draft
apps: [teat]
sources: [REF-CONTRAN-432, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** Os sinais de alteração da capacidade psicomotora podem ser verificados por **exame
clínico com laudo conclusivo firmado por médico perito** ou por **constatação do próprio agente**,
nos termos do Anexo II da Res. 432/2013. Duas exigências vinculam o agente: (a) **não basta um
sinal isolado** — deve ser considerado um **conjunto de sinais** que comprovem a situação do
condutor; (b) os sinais **deverão ser descritos no auto de infração ou em termo específico** que
contenha as informações mínimas do Anexo II, **o qual deverá acompanhar o auto de infração**.

**Base legal.** [REF-CONTRAN-432] art. 5º:

> "Art. 5º Os sinais de alteração da capacidade psicomotora poderão ser verificados por: I – exame
> clínico com laudo conclusivo e firmado por médico perito; ou II – constatação, pelo agente da
> Autoridade de Trânsito, dos sinais de alteração da capacidade psicomotora nos termos do Anexo II."
>
> "§ 1º Para confirmação da alteração da capacidade psicomotora pelo agente da Autoridade de
> Trânsito, deverá ser considerado não somente um sinal, mas um conjunto de sinais que comprovem a
> situação do condutor."
>
> "§ 2º Os sinais de alteração da capacidade psicomotora de que trata o inciso II deverão ser
> descritos no auto de infração ou em termo específico que contenha as informações mínimas
> indicadas no Anexo II, o qual deverá acompanhar o auto de infração."

Ver [REF-CTB-165-277-medidas-alcoolemia] art. 277 §2º (a infração do art. 165 também se caracteriza
por constatação de sinais, "na forma disciplinada pelo Contran") e [REF-CONTRAN-985-1003-MBFT]
Seção 7 (materialidade, não presunção subjetiva — [RN-TEAT-102]).

**Verificação.** O TEAT deve produzir um **artefato próprio** — o termo de constatação de sinais —
vinculado formalmente ao AIT (vínculo análogo ao `EvidenceLink`), com o catálogo de sinais do Anexo
II como **lista estruturada de seleção múltipla**, não texto livre. Duas validações decorrem do
§1º: a seleção de **um único sinal** não sustenta, por si, a caracterização — o sistema deve exigir
conjunto e, no mínimo, alertar; e a caracterização apenas por sinais deve exigir registro do
conjunto **antes** da finalização. O modelo de documento do termo é dado normativo versionado
([WF-TEAT-003]), porque o Anexo II pode ser alterado por resolução futura.

**Controvérsia/risco.** (a) A norma diz "no auto de infração **ou** em termo específico" —
alternativa, não cumulação. Descrever no campo Observações é juridicamente suficiente, mas
destrói a estruturação do dado e enfraquece a instrução probatória; a recomendação de produto é
**sempre o termo**, com espelho no auto. (b) "Conjunto de sinais" **não tem número mínimo** na
norma — exigir um número específico é regra inventada; o sistema deve alertar, não bloquear por
contagem. Item 34 de `_intake/legal-assessment.md`.
