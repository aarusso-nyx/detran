---
id: RN-TEAT-133
title: Alcoolemia — medição realizada e valor considerado são campos distintos; 0,05 mg/L é a infração, 0,34 mg/L é o crime
status: draft
apps: [teat]
sources:
  [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-432, REF-INMETRO-369-2021]
updated: 2026-08-24
---

**Regra.** **Qualquer concentração** de álcool por litro de sangue ou de ar alveolar sujeita o
condutor às penalidades do art. 165 do CTB — mas o CONTRAN disciplina a **margem de tolerância**
quando a infração é apurada por aparelho de medição. Em consequência, o TEAT registra **dois
valores distintos e nunca um só**: a **medição realizada** (leitura bruta do etilômetro) e o
**valor considerado** (medição menos o erro máximo admissível da "Tabela de Valores Referenciais
para Etilômetro"). Sobre o valor considerado incidem dois limiares:

- **≥ 0,05 mg/L** — caracteriza a **infração administrativa** do art. 165;
- **≥ 0,34 mg/L** — caracteriza também o **crime** do art. 306 do CTB, que **não elide** a
  infração administrativa e desloca a persecução para a Polícia Judiciária ([RN-TEAT-137]).
  Exame de sangue: **qualquer concentração** caracteriza a infração; **≥ 6 dg/L** caracteriza o crime.

**Base legal.**

- [REF-CTB-165-277-medidas-alcoolemia] art. 276: _"Qualquer concentração de álcool por litro de
  sangue ou por litro de ar alveolar sujeita o condutor às penalidades previstas no art. 165."_ ·
  parágrafo único: _"O Contran disciplinará as margens de tolerância quando a infração for apurada
  por meio de aparelho de medição, observada a legislação metrológica."_
- [REF-CONTRAN-432] art. 4º, parágrafo único: _"Do resultado do etilômetro (medição realizada)
  deverá ser descontada margem de tolerância, que será o erro máximo admissível, conforme
  legislação metrológica, de acordo com a 'Tabela de Valores Referenciais para Etilômetro'
  constante no Anexo I."_
- [REF-CONTRAN-432] art. 6º: _"A infração prevista no art. 165 do CTB será caracterizada por:
  I – exame de sangue que apresente qualquer concentração de álcool por litro de sangue; II – teste
  de etilômetro com medição realizada igual ou superior a 0,05 miligrama de álcool por litro de ar
  alveolar expirado (0,05 mg/L), descontado o erro máximo admissível […]; III – sinais de alteração
  da capacidade psicomotora obtidos na forma do art. 5º."_
- [REF-CONTRAN-432] art. 7º: _"O crime previsto no art. 306 do CTB será caracterizado por qualquer
  um dos procedimentos abaixo: I – exame de sangue que apresente resultado igual ou superior a 6
  (seis) decigramas […]; II - teste de etilômetro com medição realizada igual ou superior a 0,34
  miligrama […], descontado o erro máximo admissível […]"_
- [REF-INMETRO-369-2021] — Regulamento Técnico Metrológico que fixa o erro máximo admissível
  aplicável ([RN-TEAT-135]).

**Verificação.** `AlcoholTest` carrega, obrigatoriamente: `medicao_realizada`,
`erro_maximo_admissivel_aplicado`, `valor_considerado`, `limite_regulamentado` e a **versão da
tabela** de referência usada no cálculo — dado normativo versionado no pacote normativo
([WF-TEAT-003]), jamais constante de código, porque a tabela pode mudar e o AIT precisa
demonstrar, anos depois, qual regra o gerou ([INV-NORMATIVE-001]). O cálculo é do sistema, não do
agente. O enquadramento (art. 165) é derivado do **valor considerado**, e a sinalização de crime
(art. 306) é um **evento adicional**, não um enquadramento alternativo.

**Controvérsia/risco.** Há **tensão textual** entre o _caput_ do art. 276 do CTB ("qualquer
concentração") e o inciso II do art. 6º da Res. 432/2013 (piso de 0,05 mg/L): a resolução, ao
disciplinar a margem de tolerância, cria na prática um **piso de autuação** que a lei não previu
para o etilômetro — enquanto para o exame de sangue mantém "qualquer concentração". A delegação do
parágrafo único do art. 276 sustenta a solução, mas a assimetria entre meios de prova é real e é
argumento de defesa recorrente. Item 35 de `_intake/legal-assessment.md`.
