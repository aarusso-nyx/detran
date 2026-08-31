---
id: RN-BOAT-113
title: O DETRAN-AM é hub estadual do RENAEST — recebe a integração obrigatória dos demais órgãos do SNT no Estado
status: draft
apps: [boat]
sources: [REF-CONTRAN-808-2020, REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** Além de coletar e enviar os próprios dados ([RN-BOAT-101], [RN-BOAT-102]), o DETRAN-AM é
o **ponto de integração obrigatório** dos demais órgãos e entidades do SNT sediados no Amazonas —
que **deverão** se integrar ao RENAEST _por meio do_ órgão executivo de trânsito estadual — e o
consolidador dos dados coletados na circunscrição pela PRF, pelo órgão rodoviário federal, pela
**Polícia Militar**, pelos órgãos rodoviários estaduais e pelos municípios. Não é papel opcional:
combina obrigação de recebimento (Res. 808/2020, art. 6º, § 4º), obrigação de consolidação (CTB art.
326-A, § 10) e obrigação de articulação (art. 9º, VI e VIII).

**Base legal.**

- [REF-CONTRAN-808-2020] art. 6º, § 4º: _"Ressalvados os órgãos e entidades elencados no § 2º, os
  demais órgãos e entidades integrantes do SNT **deverão** se integrar ao RENAEST por meio do órgão
  ou entidade executivo de trânsito do Estado ou do Distrito Federal, de acordo com a respectiva
  circunscrição."_
- [REF-CONTRAN-808-2020] art. 9º: _"VI - incentivar a integração dos órgãos e entidades de que trata
  o art. 6º; [...] VIII - organizar e realizar reuniões periódicas com os órgãos ou entidades
  integradas ao RENAEST em nível estadual."_
- [REF-CONTRAN-808-2020] art. 14: _"Caberá aos órgãos executivos rodoviários dos Estados, do
  Distrito Federal e dos municípios enviar ao órgão ou entidade executivo de trânsito da respectiva
  Unidade Federativa os dados referentes a acidentes e estatísticas de trânsito coletados conforme
  disposto no inciso IV do art. 21 do CTB [...]"_
- [REF-CONTRAN-808-2020] art. 10, II: os órgãos municipais enviam _"ao órgão ou entidade executivo
  de trânsito do respectivo Estado"_ os dados coletados conforme o art. 24, IV do CTB.
- [REF-CONTRAN-808-2020] art. 15: _"Caberá aos Conselhos Estaduais de Trânsito (CETRAN): I - mediar
  e fomentar a comunicação entre os municípios e os órgãos e entidades executivos de trânsito dos
  Estados; e II - estimular os municípios a coletarem e fornecerem os dados [...]"_
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 10 (âmbito da consolidação estadual: PRF e órgão
  rodoviário da União; **Polícia Militar** e órgãos rodoviários estaduais; órgãos municipais).

**Verificação.** Consequência arquitetural, hoje ausente do corpus: o BOAT precisa de uma
**fronteira de recepção** (intake) distinta da captura de campo — um canal por onde registros de
outras origens entram, são validados no nível estadual ([RN-BOAT-104]) e seguem para a base
nacional. Isso muda o desenho: [WF-BOAT-001] hoje modela **um** ciclo, que começa no `field-agent`
em `draft`. Um registro recebido da PM ou de um município **não nasce em rascunho de campo** — nasce
já registrado, na origem, e o que o DETRAN-AM faz sobre ele é validação, não captura. O modelo deve
admitir `CrashRecord` **sem** `field-agent` de origem, exatamente como o TEAT precisou admitir
`AdministrativeTerm` sem AIT de origem ([RN-TEAT-118]).

**Controvérsia/risco.** (a) A Polícia Militar aparece nominalmente no CTB art. 326-A, § 10, II, como
fonte de dado a consolidar pelo Estado, mas **não** figura no rol do art. 6º da Res. 808/2020 —
nem entre os obrigados (§ 2º), nem entre os facultativos (§ 1º, que cita polícias **civis** e corpos
de bombeiros). Como no Amazonas a PM atua em trânsito por convênio com o DETRAN-AM (ver
[REF-DETRANAM-TALAO-BODYCAM] e [RN-TEAT-143]), a via de entrada do dado da PM é provavelmente o
próprio convênio — cujo instrumento formal, contudo, **não foi localizado**. Lacuna real, com efeito
sobre a completude do dado estadual. (b) A norma impõe articulação (reuniões periódicas, fomento),
mas **não fixa formato, prazo nem consequência** — o dever existe sem procedimento, e o produto não
pode supri-lo.
