---
id: RN-DASH-114
title: Pnatrans — meta anual de redução de mortes e divulgação oficial do índice até 30 de abril
status: draft
apps: [dashboard, boat]
sources: [REF-CTB-sinistro-cena-renaest, REF-LEI-13614-2018]
updated: 2026-08-24
---

**Regra.** A atuação do DETRAN-AM, enquanto integrante do SNT, **deve ser direcionada
prioritariamente ao cumprimento da meta anual de redução do índice de mortes por grupo de
habitantes**, apurado **anualmente por Estado**. Os índices são **divulgados oficialmente até o dia
30 de abril de cada ano**. Para o DASHBOARD isso significa duas coisas distintas, e é essencial não
confundi-las: (a) o índice do Amazonas é um **indicador de desempenho institucional** com data de
publicação certa e comparação interestadual embutida; (b) o **dado que o alimenta** vem da
consolidação estadual do art. 326-A, § 9º — cujo relógio de repasse está extinto ([RN-DASH-113]).
Ou seja: **a publicação tem data; a alimentação, não.**

**Base legal.** [REF-CTB-sinistro-cena-renaest] art. 326-A _(redação da Lei nº 14.599/2023,
verbatim)_:

> Art. 326-A. A atuação dos integrantes do Sistema Nacional de Trânsito, no que se refere ao Plano
> Nacional de Redução de Mortes e Lesões no Trânsito (Pnatrans), deverá ser direcionada
> prioritariamente para o **cumprimento da meta anual de redução do índice de mortes por grupo de
> habitantes, apurado anualmente por Estado e pelo Distrito Federal**, detalhando-se os dados
> levantados e as ações realizadas em vias federais, estaduais, distritais e municipais, na forma
> regulamentada pelo Contran.
> § 8º O Contran [...] definirá as **fórmulas para apuração do índice** [...], assim como a
> metodologia para a coleta e o tratamento dos dados estatísticos necessários para a composição dos
> termos das fórmulas.
> § 10. Os dados estatísticos sujeitos à consolidação pelo órgão ou entidade executivos de trânsito
> do Estado [...] compreendem os coletados naquela circunscrição: I - pela Polícia Rodoviária Federal
> e pelo órgão executivo rodoviário da União; II - pela Polícia Militar e pelo órgão ou entidade
> executivos rodoviários do Estado [...]; III - pelos órgãos ou entidades executivos rodoviários e
> pelos órgãos ou entidades executivos de trânsito dos Municípios.
> **§ 12. Os índices serão divulgados oficialmente até o dia 30 de abril de cada ano.**

**Periodicidade / prazo.** **Anual.** Apuração anual por Estado; **divulgação oficial até 30 de
abril**. O sujeito da divulgação é o órgão federal — o DETRAN-AM é **objeto** da apuração, não autor
da publicação. O prazo é, para o painel, uma **data de exposição pública do desempenho estadual**,
não uma obrigação do órgão.

**Consequência do descumprimento.** **Não localizada** como sanção. A consequência do art. 326-A é de
natureza diversa e mais aguda: o índice é **público, comparável entre Estados e anual** — o
descumprimento da meta é exposto por construção. É a única obrigação da tabela cuja "sanção" é
reputacional e automática.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Contagem regressiva para 30 de abril** com foco invertido: o alerta não é _"publicar até"_, é
   _"a consolidação estadual precisa estar completa e conciliada **antes** de 30 de abril"_. O prazo
   útil interno é anterior à data legal, e por margem confortável.
2. **Completude das quatro fontes do § 10** — PRF/órgão rodoviário federal, PM/órgão rodoviário
   estadual, municípios integrados e municípios não integrados. O painel deve mostrar **qual fonte
   está faltando**, porque a consolidação é multi-fonte por lei ([RN-BOAT-104], [RN-BOAT-113]) e a
   lacuna típica é uma fonte inteira ausente, não registros esparsos.
3. **Série do índice do Amazonas** com a meta anual e a posição relativa — o indicador é comparativo
   por desenho legal ("por grupo de habitantes", "por Estado").
4. **Rastreabilidade da fórmula.** O § 8º delega ao CONTRAN a definição das fórmulas e da
   metodologia. Enquanto o painel não puder citar a norma da fórmula vigente, o índice exibido deve
   ser rotulado como **estimativa interna**, não como "o índice do Pnatrans".
5. **Divergência entre o índice interno e o divulgado oficialmente** deve ser exibida quando ocorrer.
   É o sinal mais forte de que a consolidação estadual está incompleta.

**Controvérsia/risco.** _Severidade: média._ A fórmula e a metodologia do § 8º **não foram
localizadas** no corpus. Sem elas, o DASHBOARD pode monitorar a completude do insumo e a data, mas
**não pode reproduzir o índice oficial** com fidelidade garantida. Publicar um número como se fosse o
índice do Pnatrans, sem a fórmula normativa, é risco de desinformação institucional — ver
`_intake/legal-assessment.md`.
