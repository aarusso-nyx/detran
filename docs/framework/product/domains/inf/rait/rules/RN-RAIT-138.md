---
id: RN-RAIT-138
title: Natureza do compartilhamento de dado com JARI-AM e CETRAN-AM — mesmo controlador ou uso compartilhado entre entes distintos, questão em aberto
status: draft
apps: [rait]
sources: [REF-LEI-13709-2018, REF-CONTRAN-357]
updated: 2026-08-26
---

**Regra.** Quando um caso escala de defesa (1º circuito, autoridade de trânsito) para recurso JARI,
e de JARI para CETRAN-AM ([WF-RAIT-001] §Reentrância), dado pessoal do requerente e do procurador
([RN-RAIT-135]) circula entre órgãos colegiados distintos. A Res. CONTRAN 357/2010 descreve a JARI
e, por extensão, o CETRAN, como **órgãos colegiados com composição, presidência e regimento
próprios** ([WF-RAIT-003]) — não como setores internos da autoridade de trânsito que os convoca.
Esse mesmo padrão de dúvida institucional já apareceu no BOAT, entre DETRAN-AM e SENATRAN
([RN-BOAT-127]): a pergunta "quem decide sobre o tratamento" nem sempre coincide com "quem opera o
processo".

**O corpus não resolve** se a JARI-AM e o CETRAN-AM têm personalidade jurídica própria (ex.
autarquia distinta vinculada ao Estado, não ao DETRAN-AM) ou se são órgãos colegiados **sem**
personalidade própria, funcionando junto ao DETRAN-AM e por ele mantidos — o regimento local, que
resolveria a questão institucional, segue não localizado (`refs/INDEX.md` §Gaps; `_meta/open-
issues.md` DT-060). A resposta determina se a transmissão de dado entre autoridade→JARI→CETRAN é
**tratamento interno de um único controlador** (LGPD não impõe formalidade adicional) ou **uso
compartilhado entre controladores distintos**, sujeito ao regime do art. 26.

**Base legal.**

- [REF-LEI-13709-2018] art. 26, _caput_: _"O uso compartilhado de dados pessoais pelo Poder Público
  deve atender a finalidades específicas de execução de políticas públicas e atribuição legal pelos
  órgãos e pelas entidades públicas, respeitados os princípios de proteção de dados pessoais
  elencados no art. 6º desta Lei."_
- [REF-LEI-13709-2018] art. 5º, VI: controlador é _"a quem competem as decisões referentes ao
  tratamento"_ — teste que só pode ser aplicado à JARI-AM/CETRAN-AM depois de saber se eles, e não
  apenas o DETRAN-AM, decidem autonomamente sobre o tratamento do dado que julgam.
- [REF-CONTRAN-357] itens 2.2-2.3 (dimensionamento e coordenação de mais de uma JARI) e 4.1
  (composição) — indícios de estrutura colegiada própria, não decisivos quanto à personalidade
  jurídica.

**Postura provisória adotada (proposta, não posição).** Até confirmação institucional, tratar a
transmissão autoridade→JARI→CETRAN de forma **conservadora**, como se fosse compartilhamento entre
controladores distintos sujeito ao art. 26: exigir finalidade documentada (a própria remessa do
recurso, já prevista em [WF-RAIT-001]) e não estender o dado transmitido além do necessário à
instrução daquela instância. É postura mais protetiva que o mínimo eventualmente exigível — se a
resposta institucional confirmar controlador único, a exigência apenas deixa de ser obrigatória,
sem gerar retrabalho.

**Verificação.** (a) A remessa de caso entre instâncias ([RN-RAIT-104], [RN-RAIT-105]) já registra
formalmente o ato de remessa — suficiente, na postura provisória, como "instrumento" do art. 26 se
a leitura de compartilhamento entre controladores prevalecer. (b) Nenhum dado além do necessário à
instrução da nova instância deveria acompanhar a remessa — mesmo princípio de minimização já usado
em [RN-RAIT-134].

**Controvérsia/risco.** _Severidade: MÉDIA — depende inteiramente de uma pergunta institucional já
identificada, não de interpretação legal adicional._ Não é item de parecer jurídico isolado: é
subordinado à obtenção do regimento JARI-AM/CETRAN-AM (`_meta/open-issues.md` DT-060,
`institutional-ask`) e à confirmação da natureza jurídica desses colegiados junto ao DETRAN-AM.
Enquanto isso não vem, a postura conservadora acima evita tanto sub- quanto sobre-engenharia. Ver
`_meta/lgpd-assessment.md` §RAIT.
