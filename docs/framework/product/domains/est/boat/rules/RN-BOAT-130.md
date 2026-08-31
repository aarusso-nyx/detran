---
id: RN-BOAT-130
title: Divulgação estatística é agregada e federal — o registro individual de sinistro não é dado de publicação
status: draft
apps: [boat, dashboard, portal]
sources:
  [
    REF-CONTRAN-808-2020,
    REF-CTB-sinistro-cena-renaest,
    REF-SENATRAN-PORTARIA-139-2025,
    REF-LEI-13709-2018,
  ]
updated: 2026-08-24
---

**Regra.** A norma distingue com clareza **duas coisas que o produto tende a confundir**: a
**divulgação estatística** — agregada, periódica, pública, e atribuída ao órgão máximo executivo da
União — e o **registro individual de sinistro**, que é dado administrativo com dado pessoal
sensível dentro e **não é objeto de publicação**. O dever de publicar é federal e mensal (Res.
808/2020, art. 8º, V); o índice do Pnatrans é divulgado até 30 de abril de cada ano (CTB art. 326-A,
§ 12); e a abertura de dados segue o Plano de Dados Abertos do Ministério dos Transportes
([REF-SENATRAN-PORTARIA-139-2025] art. 20). Nada disso autoriza publicar `CrashRecord`.

**Base legal.**

- [REF-CONTRAN-808-2020] art. 8º: _"Caberá ao órgão máximo executivo de trânsito da União: [...]
  V - **publicar, atualizar mensalmente e promover a divulgação das informações referentes a
  acidentes e estatísticas de trânsito no sítio eletrônico do órgão**;"_
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 12: _"Os índices serão divulgados oficialmente até o
  dia 30 de abril de cada ano."_ _(Redação dada pela Lei nº 14.599, de 2023)_
- [REF-CONTRAN-808-2020] art. 2º, parágrafo único: a base nacional existe _"de modo a subsidiar o
  desenvolvimento de estudos, pesquisas e ações que visem à melhoria da segurança no trânsito no
  país"_.
- [REF-SENATRAN-PORTARIA-139-2025] art. 20: _"Os dados abertos, estruturados em formato aberto, na
  forma disposta no Decreto nº 8.777, de 11 de maio de 2016, serão disponibilizados conforme o Plano
  de Dados Abertos instituído pelo Ministério dos Transportes. [...] § 2º Os dados abertos da
  Senatran, constantes do Plano de Dados Abertos, serão processáveis por máquina, referenciados na
  internet e disponibilizados sob licença aberta, que permita sua livre utilização, consumo ou
  cruzamento, independentemente de solicitações por parte do interessado."_
- [REF-SENATRAN-PORTARIA-139-2025] art. 6º, VI e VII (dado **público** × dado **restrito**) e art.
  17, § 2º: _"A classificação do grupo de informação como público ou restrito, pela Senatran,
  dependerá da conjugação entre os parâmetros de entrada e de saída."_

**Verificação.** Consequências para o painel estadual e para o portal:

1. **Publicação estadual é possível, mas é decisão do DETRAN-AM** — o dever normativo de publicar é
   da União. Se o Estado publicar, publica **agregado** e sob sua própria responsabilidade de
   controlador ([RN-BOAT-127]).
2. **Nenhuma visão pública deve permitir chegar ao indivíduo.** O art. 17, § 2º da Portaria 139/2025
   enuncia o princípio que governa isso: público ou restrito depende da **conjugação** de entradas e
   saídas — ou seja, um dado inofensivo isolado torna-se restrito quando combinado com outro. Em
   sinistro, a combinação local + instante + veículo reidentifica a vítima com facilidade
   ([RN-BOAT-131]).
3. **Granularidade mínima** e supressão de células pequenas devem ser regra do painel: em município
   pequeno, "1 óbito em maio" identifica a pessoa para a comunidade inteira.
4. A periodicidade mensal federal (art. 8º, V) é referência útil para o ciclo estadual, mas **não é
   prazo do Estado** — ver [RN-BOAT-106].

**Controvérsia/risco.** _Severidade: média._ (a) Nenhuma norma localizada disciplina o que o **órgão
estadual** pode ou deve publicar sobre sinistros — há dever federal de publicar e há LAI, mas não há
regra de granularidade ou de anonimização estatística aplicável ao DETRAN. (b) A LAI e o interesse
público em transparência de mortalidade no trânsito pressionam em direção à abertura; a LGPD e o
dado sensível, em direção à restrição. O ponto de equilíbrio — dado agregado com granularidade
segura — é **decisão do órgão com apoio do Encarregado**, e deve ser documentada, não improvisada
por dashboard. (c) Atenção a pedidos de imprensa e de pesquisa sobre sinistros específicos: são
tratados por LAI e, quanto ao dado de saúde, por acesso restrito — nunca por publicação aberta.
