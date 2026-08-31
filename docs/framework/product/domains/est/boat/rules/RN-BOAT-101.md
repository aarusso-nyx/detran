---
id: RN-BOAT-101
title: A coleta de dados de sinistro pelo DETRAN-AM é competência legal própria (CTB art. 22, IX), não delegação
status: draft
apps: [boat]
sources:
  [
    REF-CTB-sinistro-cena-renaest,
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
  ]
updated: 2026-08-24
---

**Regra.** O DETRAN-AM coleta dados de sinistro de trânsito no exercício de **competência legal
própria**, atribuída diretamente pelo CTB ao órgão executivo de trânsito estadual — não por
delegação da União nem por conveniência estatística. A competência é **de coleta e de estudo**
("coletar dados estatísticos e elaborar estudos sobre sinistros de trânsito e suas causas"),
e é a mesma competência que a Resolução CONTRAN 808/2020 converte em **dever de envio** ao RENAEST
([RN-BOAT-102]). A mesma competência existe, em textos idênticos, para a PRF (art. 20, VII), para
os órgãos rodoviários (art. 21, IV) e para os municípios (art. 24, IV) — o que significa que, na
circunscrição do Amazonas, **o dado de sinistro nasce em mais de uma fonte**, e o DETRAN-AM é o
ponto de consolidação estadual (CTB art. 326-A, §10).

**Base legal.**

- [REF-CTB-sinistro-cena-renaest] art. 22: _"Compete aos órgãos ou entidades executivos de trânsito
  dos Estados e do Distrito Federal, no âmbito de sua circunscrição: [...] IX - coletar dados
  estatísticos e elaborar estudos sobre sinistros de trânsito e suas causas;"_ _(Redação dada pela
  Lei nº 14.599, de 2023)_
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 10: _"Os dados estatísticos sujeitos à consolidação
  pelo órgão ou entidade executivos de trânsito do Estado ou do Distrito Federal compreendem os
  coletados naquela circunscrição: I - pela Polícia Rodoviária Federal e pelo órgão executivo
  rodoviário da União; II - pela Polícia Militar e pelo órgão ou entidade executivos rodoviários do
  Estado ou do Distrito Federal; III - pelos órgãos ou entidades executivos rodoviários e pelos
  órgãos ou entidades executivos de trânsito dos Municípios."_ _(Incluído pela Lei nº 13.614, de 2018)_
- [REF-CONTRAN-808-2020] art. 9º, II: _"enviar ao órgão máximo executivo de trânsito da União os
  dados referentes a acidentes e estatísticas de trânsito coletados **conforme disposto no inciso IX
  do art. 22 do CTB**, em conformidade com os Manuais previstos no parágrafo único do art. 3º"_ —
  citação nominal que fecha a cadeia entre competência (CTB) e obrigação de envio (Resolução).

**Verificação.** Fecha o "(fonte pendente)" de [APP-BOAT] §Missão e §Âncoras legais: a existência do
BOAT tem fundamento legal expresso e específico, não deduzido. Consequência de modelagem: o
`CrashRecord` do DETRAN-AM não é apenas um registro operacional — é o instrumento de cumprimento de
uma competência legal, o que sujeita o seu conteúdo às regras de consistência ([RN-BOAT-103]) e o
seu dado pessoal ao regime do art. 23 da LGPD (finalidade pública / execução de competência legal —
[RN-BOAT-123]). Consequência de arquitetura: como o § 10 prevê consolidação **multi-fonte**
(PRF, PM, órgãos rodoviários, municípios), o modelo de dados precisa admitir **origem do registro**
como atributo de primeira classe e um mecanismo de conciliação por chave natural — hoje inexistente
no corpus ([WF-BOAT-001] usa `(uf, codigoMunicipio, dataHoraSinistro, orgaoResponsavel)` apenas na
fronteira de submissão nacional).

**Controvérsia/risco.** A [REF-SENATRAN-PORTARIA-139-2025] art. 7º, §3º, ao tratar do tratamento de
dados restritos pelos DETRANs, refere-se a atribuições _"delegadas pela Senatran, nos termos do art.
22, incisos II e III"_ — **habilitação e registro de veículo**, e **não** o inciso IX. A omissão é
significativa: sugere que, quanto a sinistro, o DETRAN-AM **não** age como processador de dado
delegado, mas como titular de competência própria — com consequência direta sobre o papel LGPD do
órgão (controlador × operador), tratada em [RN-BOAT-127]. Não há norma que resolva a questão
expressamente. Item 3 de `_intake/legal-assessment.md`.
