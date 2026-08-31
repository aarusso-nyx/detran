---
id: RN-TEAT-104
title: Competência para lavrar — rol taxativo, circunscrição e presunção de veracidade do ato
status: draft
apps: [teat]
sources:
  [
    REF-CONTRAN-985-1003-MBFT,
    REF-CTB-280-290,
    REF-CTB-165-277-medidas-alcoolemia,
  ]
updated: 2026-08-24
---

**Regra.** Só pode lavrar AIT quem se enquadra no **rol taxativo** de agentes da autoridade de
trânsito — e a mera designação por portaria **não basta**. São, cumulativa ou isoladamente:
(I) agentes de trânsito dos órgãos/entidades executivos de trânsito ou rodoviário; (II) policiais
rodoviários federais; (III) policiais militares do serviço ativo **mediante convênio** (CTB art.
23, III); (IV) guardas municipais (Lei 13.022/2014 art. 5º, VI); (V) agentes dos órgãos policiais
da Câmara e do Senado **mediante convênio** (CTB art. 25-A). São **pressupostos de legitimidade**
do ato, não formalidades: o agente deve estar **devidamente uniformizado** e **no regular
exercício de suas funções**, e o veículo de fiscalização deve estar **caracterizado**. A
competência é ainda limitada pela **circunscrição** e pelas competências do CTB. Atendidos esses
pressupostos, a declaração do agente é, por si, meio de comprovação da infração (art. 280 §2º), e
o auto goza de presunção de veracidade — presunção **relativa**, desconstituível na defesa.

**Base legal.**

- [REF-CONTRAN-985-1003-MBFT] Seção 4: _"O agente da autoridade de trânsito, competente para
  realizar a fiscalização, deve se enquadrar em uma das seguintes categorias, com atuação isolada
  ou cumulativa, **não bastando mera designação mediante portaria ou outro ato administrativo**:
  I - agentes de trânsito dos órgãos ou entidades executivos de trânsito ou rodoviário; II -
  policiais rodoviários federais; III - policiais militares do serviço ativo, quando firmado
  convênio para esta finalidade […]; IV - guardas municipais […]; e V - agentes dos órgãos
  policiais da Câmara dos Deputados e do Senado Federal, quando firmado convênio […]"_ ·
  _"Para que possa exercer suas atribuições, o agente da autoridade de trânsito deverá estar
  devidamente uniformizado, conforme padrão da instituição, e no regular exercício de suas
  funções."_ · _"Todo veículo utilizado na fiscalização de trânsito deverá estar caracterizado na
  forma definida pelo órgão ou entidade."_
- [REF-CTB-280-290] art. 280 §4º: _"O agente da autoridade de trânsito competente para lavrar o
  auto de infração poderá ser servidor civil, estatutário ou celetista ou, ainda, policial
  militar designado pela autoridade de trânsito com jurisdição sobre a via no âmbito de sua
  competência."_
- [REF-CTB-280-290] art. 280 §2º (declaração do agente como meio de comprovação) e art. 281
  _caput_ (a autoridade julga a consistência do auto).
- [REF-CTB-165-277-medidas-alcoolemia] art. 269 _caput_: as medidas administrativas são adotadas
  _"na esfera das competências estabelecidas neste Código e dentro de sua circunscrição"_.

**Verificação.** `field-agent` não é um papel único no plano jurídico: é um papel funcional
ocupado por **categorias distintas** com **fundamentos de competência distintos**. O TEAT precisa
registrar, no ato legal e não apenas no cadastro do usuário: a categoria do rol (I a V), o vínculo
institucional de origem, e — nas categorias III e V — o **instrumento de convênio** que a habilita
([RN-TEAT-143]). A circunscrição autuante é atributo do ato, validável contra a competência
territorial parametrizada pelo `agency-admin` ([APP-TEAT]).

**Controvérsia/risco.** **"Fé pública" não é termo de nenhuma das normas pesquisadas.** O corpus
TEAT o vinha usando como se fosse categoria normativa; não é. O que existe é (a) o rol taxativo
de competência acima e (b) a presunção de veracidade dos atos administrativos, cuja consequência
processual está no art. 281 _caput_ e §1º, I do CTB (o auto inconsistente ou irregular é
arquivado). Nenhuma norma atribui ao agente de trânsito fé pública no sentido técnico do
tabelionato. Segundo risco: **uniformização e caracterização do veículo são pressupostos de
legitimidade que o sistema não tem como verificar** — não devem ser modelados como validação
automática, apenas como declaração do agente sujeita a auditoria. Ambos em
`_intake/legal-assessment.md`, itens 1 e 3.
