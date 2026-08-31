---
id: RN-BOAT-102
title: RENAEST — existência, cadeia normativa em três níveis e dever estadual de alimentar a base nacional
status: draft
apps: [boat]
sources:
  [
    REF-CTB-sinistro-cena-renaest,
    REF-LEI-13614-2018,
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
  ]
updated: 2026-08-24
---

**Regra.** O RENAEST não é convenção técnica de integração: é **sistema de registro instituído por
lei**, com cadeia normativa completa em três níveis — (a) **CTB**: o órgão máximo executivo da
União tem competência para _"organizar e manter"_ o registro (art. 19, XXXII) e para _"estabelecer
modelo padrão de coleta"_ (art. 19, XI); (b) **Lei 13.614/2018 (Pnatrans)**, que criou o art. 326-A
e a mecânica de consolidação estadual→federal; (c) **Resolução CONTRAN 808/2020**, regulamentação
infralegal vigente que institui o sistema, o BAT, a validação em três níveis e os coordenadores. O
**dever do DETRAN-AM de enviar** os dados coletados à base nacional é expresso e incondicional
(art. 9º, II da Resolução) — não depende de convênio, adesão ou contrapartida.

**Base legal.**

- [REF-CTB-sinistro-cena-renaest] art. 19: _"XI - estabelecer modelo padrão de coleta de informações
  sobre as ocorrências de sinistros de trânsito e as estatísticas de trânsito;"_ e _"XXXII -
  organizar e manter o Registro Nacional de Sinistros e Estatísticas de Trânsito (Renaest)."_
  _(Incluído pela Lei nº 14.599, de 2023)_
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 9º: _"Os dados estatísticos coletados em cada Estado
  e no Distrito Federal serão tratados e consolidados pelos respectivos órgãos ou entidades
  executivos de trânsito, que os repassarão ao órgão máximo executivo de trânsito da União, conforme
  regulamentação do Contran."_
- [REF-CONTRAN-808-2020] art. 2º: _"O RENAEST é o sistema de registro, gestão e controle de dados e
  informações sobre acidentes e estatísticas de trânsito, coletados pelos órgãos que compõem o
  Sistema Nacional de Trânsito (SNT) e pelos demais órgãos e entidades que efetuam o registro de
  acidentes de trânsito, que apuram suas circunstâncias ou prestam atendimento às suas vítimas.
  Parágrafo único. Os dados e informações de que trata o caput serão consolidados em base nacional,
  organizada e mantida pelo órgão máximo executivo de trânsito da União, de modo a subsidiar o
  desenvolvimento de estudos, pesquisas e ações que visem à melhoria da segurança no trânsito no
  país."_
- [REF-CONTRAN-808-2020] art. 9º, I e II: _"Caberá aos órgãos e entidades executivos de trânsito dos
  Estados e do Distrito Federal: I - organizar e manter os dados e as informações referentes a
  acidentes e estatísticas de trânsito, de acordo com as regras dos Manuais [...]; II - enviar ao
  órgão máximo executivo de trânsito da União os dados [...]"_
- [REF-SENATRAN-PORTARIA-139-2025] art. 7º, § 1º: lista o _"Registro Nacional de Sinistros e
  Estatísticas de Trânsito - Renaest"_ entre os sistemas informatizados **controlados pela
  Senatran** — confirmação cruzada, em norma de 2025, da identidade do sistema.

**Verificação.** Fecha o "(fonte pendente)" de [APP-BOAT] §Âncoras legais e de [WF-BOAT-001]. A
máquina de estados nacional hoje documentada apenas por contrato do mock `senatran`
(RECEBIDO→EM_ANALISE→CONSOLIDADO|REJEITADO) tem origem normativa no art. 5º da Resolução
("serão homologados e, então, consolidados") — ver [RN-BOAT-104]. Consequência de produto: a
transmissão ao RENAEST **não é um recurso opcional de integração** e não pode ser tratada como
"onda futura" ou feature-flag; é execução de dever normativo vencido desde 04/01/2022
([RN-BOAT-108]).

**Controvérsia/risco — dissonância nominal lei × resolução.** A Res. 808/2020 chama o sistema de
_"Registro Nacional de **Acidentes** e Estatísticas de Trânsito"_ e usa "acidente" em todo o seu
texto; o CTB, desde a Lei 14.599/2023, chama o mesmo sistema de _"Registro Nacional de **Sinistros**
e Estatísticas de Trânsito"_. **Nenhuma resolução CONTRAN de atualização terminológica foi
localizada.** A identidade entre os dois é de altíssima probabilidade — mesmo acrônimo, mesmo órgão,
mesma função, e a [REF-SENATRAN-PORTARIA-139-2025] (2025) usa a nomenclatura nova para o mesmo
sistema —, mas nenhum instrumento único amarra formalmente as duas designações. Enquanto isso não
for confirmado por parecer humano, a Res. 808/2020 deve ser citada como **regulamentação vigente do
RENAEST**, com a ressalva nominal expressa; e nenhuma regra de produto deve depender de o nome
antigo e o novo designarem sistemas idênticos em **escopo de campos**. Item 1 de
`_intake/legal-assessment.md`.
