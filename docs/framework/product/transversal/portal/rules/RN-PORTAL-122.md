---
id: RN-PORTAL-122
title: Transparência do tratamento no ponto de coleta e revisão de decisão automatizada — o que o PORTAL informa e o que a triagem automática exige
status: draft
apps: [portal, rait, dashboard]
sources:
  [REF-LEI-13709-2018, REF-LEI-14129-2021, REF-CONTRAN-900, REF-LEI-9784-1999]
updated: 2026-08-24
---

**Regra — transparência no ponto de coleta.** O PORTAL disponibiliza, de forma _"clara, adequada e
ostensiva"_ e **onde o dado é coletado**, as sete informações do art. 9º da LGPD: finalidade
específica, forma e duração do tratamento, identificação e contato do controlador, uso compartilhado
e sua finalidade, responsabilidades dos agentes, e os direitos do titular com menção explícita ao art. 18. Duas precisões que separam esta regra de uma política de privacidade genérica:

1. **É informação de tela, não documento à parte.** Um link para "Política de Privacidade" no rodapé
   não cumpre o art. 9º para um formulário que coleta dado de saúde ou que atribui infração a
   terceiro. A informação relevante àquele tratamento acompanha aquele tratamento.
2. **Dever reforçado quando o tratamento é condição do exercício de direito.** O § 3º manda informar
   _"com destaque"_ nessa hipótese — que é exatamente a situação de quase todo serviço do PORTAL:
   sem tratar o dado, não há como defender-se, indicar condutor, licenciar ou renovar CNH.

Isso se soma — e não substitui — ao dever de **publicidade ativa** do art. 23, I: publicar, em
veículo de fácil acesso, as hipóteses em que o órgão trata dados, com previsão legal, finalidade,
procedimentos e práticas. Achado a corrigir: a página institucional de LGPD do DETRAN-AM não menciona
dado de saúde nem vítima de sinistro ([RN-BOAT-126], item 3).

**Regra — decisão automatizada.** Toda decisão do PORTAL tomada **unicamente** por tratamento
automatizado que afete interesses do cidadão é (a) **identificada como tal** na tela, (b) acompanhada
de **informações claras sobre os critérios e procedimentos** usados, e (c) **revisável mediante
solicitação**. No PORTAL, os candidatos concretos são: triagem automática de admissibilidade, cálculo
automático de tempestividade, bloqueio automático de emissão de documento por débito, e classificação
automática de manifestação de ouvidoria.

Duas travas, e a segunda é mais forte que a LGPD:

- **A revisão é humana.** A LGPD **não** exige revisão por pessoa natural (ver Controvérsia), mas o
  processo administrativo de trânsito exige **decisão fundamentada de autoridade competente** — a
  admissibilidade é juízo do órgão ([RN-RAIT-001], [REF-CONTRAN-900] art. 4º), não do algoritmo.
  Logo, no PORTAL, a revisão é humana por força do regime processual, e não por força da LGPD.
- **Não conhecer é decisão, não filtro.** Nenhum requerimento pode ser recusado automaticamente antes
  de gerar protocolo ([RN-PORTAL-107], [RN-PORTAL-111] item 1). O automatismo pode **classificar** e
  **propor**; a decisão de não conhecer é ato administrativo motivado.

**Base legal.**

- [REF-LEI-13709-2018] art. 9º, _caput_, I a VII e § 3º (transcritos integralmente no REF).
- [REF-LEI-13709-2018] art. 20 _(Redação dada pela Lei nº 13.853, de 2019)_: _"O titular dos dados tem
  direito a solicitar a revisão de decisões tomadas unicamente com base em tratamento automatizado de
  dados pessoais que afetem seus interesses [...]"_; § 1º: _"O controlador deverá fornecer, sempre que
  solicitadas, informações claras e adequadas a respeito dos critérios e dos procedimentos utilizados
  para a decisão automatizada [...]"_
- [REF-LEI-13709-2018] art. 23, I: dever de informar as hipóteses de tratamento _"fornecendo
  informações claras e atualizadas sobre a previsão legal, a finalidade, os procedimentos e as
  práticas utilizadas [...], em veículos de fácil acesso, preferencialmente em seus sítios
  eletrônicos"_.
- [REF-LEI-14129-2021] art. 21, X: _"funcionalidade para solicitar acesso a informações acerca do
  tratamento de dados pessoais"_.
- [REF-CONTRAN-900] art. 4º: rol taxativo de não conhecimento — juízo do órgão; a anotação legal
  daquele REF já registra que o inciso IV é o único que exige juízo de conteúdo, com **risco de
  julgamento antecipado de mérito por via de triagem** ([RN-RAIT-122]). Automatizar esse inciso
  agravaria exatamente o risco já identificado.
- [REF-LEI-9784-1999] art. 3º, II (aplicação subsidiária): direito do administrado de _"conhecer as
  decisões proferidas"_ — que pressupõe decisão identificável e motivada, não desfecho anônimo de
  rotina automática.
- **Decisão de steering** (`_meta/steering.md` C.23, 2026-08-24): o critério de "pedido incompatível
  com a situação fática" fica **restrito à ausência formal de pedido**, nunca aplicado por juízo de
  conteúdo — o que torna esse inciso, e só nessa extensão restrita, automatizável com segurança.

**Verificação.** (a) Todo formulário que coleta dado pessoal exibe, no próprio contexto, finalidade e
base legal daquele tratamento, com link para o detalhamento do art. 9º. (b) Toda decisão exibida ao
cidadão carrega `origem_decisao ∈ {automatizada, humana, automatizada_revisada}`; quando automatizada,
a tela oferece "pedir revisão" e o texto dos critérios aplicados. (c) Nenhum caminho de código produz
`nao_conhecido` sem ato humano registrado. (d) O inventário público de tratamentos do órgão cobre
todos os serviços do catálogo — a métrica de conformidade é `serviços com hipótese de tratamento
publicada ÷ serviços do catálogo`, monitorável pelo DASHBOARD.

**Controvérsia/risco.** (a) **O art. 20 não garante revisão humana.** A redação original dizia
"revisão, **por pessoa natural**"; a expressão foi suprimida pela Lei 13.853/2019 e a tentativa de
reintroduzi-la foi **vetada**. Quem sustentar que a LGPD obriga revisão humana está citando texto que
não vigora. A garantia, no PORTAL, vem do regime processual administrativo — fundamento diferente e,
neste domínio, mais forte. (b) O § 1º ressalva _"segredos comercial e industrial"_: num órgão público
essa ressalva é de aplicação muito estreita, e não deve ser usada para recusar explicação sobre
critérios de triagem — a transparência de critérios de decisão administrativa é regra, e o sigilo,
exceção ([REF-LEI-12527-2011] art. 3º, I). (c) Risco de produto: um sistema que classifica
automaticamente e apresenta a classificação como resultado tende a induzir a decisão humana
subsequente. A mitigação é registrar separadamente a **sugestão automática** e a **decisão do
servidor**, permitindo auditar divergência — e é também o que torna a revisão do art. 20 verificável.
Ver `_intake/legal-assessment.md`.
