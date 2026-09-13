---
id: RN-DASH-161
title: Reidentificação em recortes pequenos — município, ano e gravidade são, combinados, um identificador
status: draft
apps: [dashboard, boat]
sources:
  [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025, REF-CONTRAN-808-2020]
updated: 2026-09-13
---

**Regra.** No domínio do sinistro de trânsito o risco de reidentificação é **estruturalmente alto**,
não circunstancial: o evento é **raro, localizado, datado e associado a um veículo**. Basta cruzar
poucas dimensões de baixa cardinalidade para chegar ao indivíduo — e a combinação
**município × período × gravidade** é, no Amazonas, um identificador prático na maior parte do
território.

O Amazonas agrava o problema de forma específica e mensurável: são **62 municípios**, muitos com
população de poucos milhares de habitantes e acessíveis apenas por via fluvial. Numa comunidade
assim, _"1 óbito em maio de 2025"_ não é estatística — **é o nome de uma pessoa**, conhecido por toda
a cidade. O mesmo recorte publicado sobre Manaus é inócuo. Portanto: **o limiar de segurança não pode
ser uniforme; ele depende do denominador populacional do recorte.**

**Base legal.**

- [REF-LEI-13709-2018] art. 12: a proteção cai quando a anonimização _"com esforços razoáveis, puder
  ser revertido"_ — e "esforços razoáveis", numa cidade pequena, significa **perguntar ao vizinho**.
  Não é preciso técnica de reidentificação; basta conhecimento local.
- [REF-SENATRAN-PORTARIA-139-2025] art. 17, § 2º _(verbatim)_: _"A classificação do grupo de
  informação como público ou restrito, pela Senatran, dependerá da **conjugação entre os parâmetros de
  entrada e de saída**."_ — é a formulação normativa do princípio: o risco é da **combinação**.
- [REF-LEI-13709-2018] art. 6º, III: **necessidade** — dados _"pertinentes, proporcionais e **não
  excessivos**"_. Uma dimensão publicada sem uso analítico real é, por definição, excessiva.
- [REF-CONTRAN-808-2020] art. 2º, parágrafo único: a base nacional existe _"de modo a subsidiar o
  desenvolvimento de estudos, pesquisas e ações que visem à melhoria da segurança no trânsito"_ — a
  finalidade legítima é **estudo agregado**, não consulta a caso individual.

**Verificação — cinco controles que devem existir no pipeline de publicação.**

1. **Limiar mínimo de célula, declarado e aplicado antes da renderização.** Células com contagem
   abaixo do limiar são **suprimidas**, não exibidas com valor pequeno. O limiar é decisão documentada
   do órgão ([RN-DASH-160], controvérsia) — o corpus não tem norma que o fixe, e inventar um número
   aqui seria inventar norma.
2. **Supressão secundária obrigatória.** Suprimir só a célula pequena não basta: se a linha tem total
   publicado e apenas uma célula suprimida, o valor suprimido é **recuperável por subtração**. É
   preciso suprimir uma segunda célula, ou não publicar o total. Este é o erro técnico mais comum e o
   menos percebido.
3. **Generalização em vez de supressão, quando possível.** Agrupar municípios pequenos em
   mesorregião, mês em trimestre, idade em faixa larga. Preserva utilidade analítica e elimina a
   célula perigosa — quase sempre é a solução superior.
4. **Teste de cruzamento com o que já é público.** Antes de publicar, verificar se o conjunto, cruzado
   com fontes públicas correlatas (estatísticas nacionais do RENAEST, dados de saúde, noticiário
   local), permite chegar ao indivíduo. O teste é sobre o **ecossistema de informação**, não sobre o
   conjunto isolado.
5. **Nenhuma consulta parametrizada livre na superfície pública.** A API e os filtros públicos servem
   **conjuntos derivados pré-agregados e revisados**. Um filtro que aceite município + intervalo de
   datas arbitrário reconstrói, por composição de consultas, exatamente a granularidade que a
   supressão tentou impedir ([RN-DASH-151], controvérsia).

**Dimensões de alto risco no domínio — usar com parcimônia deliberada:** município (baixa cardinalidade
populacional); data/hora exata; trecho de via ou km; gravidade (a categoria "óbito" é rara por
construção); tipo e placa de veículo; idade exata; sexo combinado a qualquer das anteriores. A
combinação de **três** dessas dimensões já deve acionar revisão obrigatória.

**Conexão com o corpus BOAT.** Esta regra é a aplicação, no painel, do que [RN-BOAT-130] e
[RN-BOAT-131] estabelecem no domínio: o registro individual de sinistro **não é dado de publicação**,
e a anonimização é problema de engenharia. O DASHBOARD é o lugar onde essas duas regras encontram sua
consequência técnica concreta — e é também o lugar onde elas serão contornadas por acidente, se o
pipeline não tiver os cinco controles acima.

**Controvérsia/risco.** _Severidade: alta — este é o risco de reidentificação mais concreto de todo o
ecossistema._ Três agravantes específicos: (a) a pressão por transparência de mortalidade no trânsito é
legítima e crescente, e empurra por granularidade municipal; (b) o índice do Pnatrans é, por desenho
legal, **apurado por Estado** e comparativo — o que cria demanda por recortes cada vez mais finos para
"explicar" o índice; (c) a reidentificação num município pequeno não exige competência técnica, apenas
conhecimento local, o que a torna indetectável por qualquer controle técnico. A mitigação sustentável é
**generalização geográfica como padrão**, com desagregação municipal apenas onde o denominador
populacional a suporte. Recomenda-se parecer formal antes da primeira publicação.

**Decisão do Owner (2026-08-28, DT-029; confirmada em 2026-09-13, steering.md H.54).** Limiar
mínimo de célula **10**, com supressão primária e secundária, aplicado antes da renderização e da
exportação; parâmetro `dashboard.cell_threshold` vigente. O parecer sobre o limiar valida o
número depois (consulta jurídica única, item 14); não bloqueia a primeira publicação.
