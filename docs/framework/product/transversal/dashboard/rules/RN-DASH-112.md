---
id: RN-DASH-112
title: Repasse de 5% ao FUNSET — dever contínuo sem periodicidade própria, monitorado por conciliação e não por calendário
status: draft
apps: [dashboard, rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O recolhimento de **5% do valor arrecadado com multas de trânsito à conta do FUNSET é
responsabilidade do órgão arrecadador** — do DETRAN-AM, portanto, quanto às multas de sua competência
e às de terceiros que arrecade. A norma **não fixa periodicidade nem data-limite próprios** para o
repasse: ele é **acessório da arrecadação** e, no desenho normativo, deve ocorrer de forma
**automática**, pelo uso do documento próprio de arrecadação estabelecido pela União. Consequência
para o painel: este **não é um relógio de calendário** e não deve ser modelado como tal. É um
**indicador de conciliação contínua** — arrecadado × repassado —, cuja anomalia é a divergência, não
o atraso.

**Base legal.** [REF-CONTRAN-918] art. 24, _caput_ e § 1º _(verbatim)_:

> Art. 24. Os órgãos e entidades executivos de trânsito e executivos rodoviários dos Estados, do
> Distrito Federal e dos Municípios, integrantes do SNT, para arrecadarem multas de trânsito de sua
> competência ou de terceiros, deverão utilizar o **documento próprio de arrecadação de multas de
> trânsito estabelecido pelo órgão máximo executivo de trânsito da União**, com vistas a garantir o
> **repasse automático** dos valores relativos ao FUNSET.
> § 1º O recolhimento do percentual de **5% (cinco por cento)** do valor arrecadado com as multas de
> trânsito à conta do FUNSET **é de responsabilidade do órgão de trânsito arrecadador**.
> § 2º O pagamento das multas de trânsito será efetuado na rede bancária arrecadadora.

Definição correlata — [REF-CONTRAN-918] art. 2º, V: _"órgão arrecadador: órgão ou entidade que efetua
a cobrança e o recebimento da multa de trânsito [...] responsável pelo repasse dos 5% (cinco por
cento) do valor da multa de trânsito à conta do Fundo Nacional de Segurança e Educação de Trânsito
(FUNSET)"_. Base legal de primeiro grau: CTB art. 320, § 1º.

**Periodicidade / prazo.** **Nenhuma própria.** Decorre da arrecadação e é operacionalizada pelo
documento de arrecadação padronizado. Qualquer prazo interno adotado pelo órgão é política interna e
deve ser rotulado como tal no painel — nunca apresentado como prazo legal ([RN-DASH-113] aplica o
mesmo princípio de honestidade ao vazio do RENAEST).

**Consequência do descumprimento.** **Não localizada nesta rodada.** A Resolução 918/2022 não comina
sanção ao órgão estadual pelo não repasse. O risco é de outra natureza — apropriação indevida de
receita vinculada da União, com repercussão em prestação de contas e responsabilização do gestor pelo
controle externo —, mas essa consequência **não está no texto pesquisado** e não deve ser afirmada no
corpus como se estivesse.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Painel de conciliação por competência**: total arrecadado no período × 5% teórico × 5%
   efetivamente creditado ao FUNSET × divergência absoluta e percentual.
2. **Tolerância declarada, não implícita.** Divergências de centavos por arredondamento são normais;
   o painel deve ter um limiar de materialidade **configurado e visível**, e tudo acima dele vira
   achado nomeado, com responsável e prazo interno de tratamento.
3. **Rastreabilidade até o documento de arrecadação.** Como o repasse é _automático pelo documento
   padronizado_ (art. 24, _caput_), a divergência quase sempre revela **arrecadação feita fora do
   documento próprio** — que é, em si, descumprimento do _caput_. O painel deve conseguir segregar
   arrecadação "por documento padrão" × "por outro meio", porque essa segregação é o diagnóstico.
4. **Ligação explícita com [RN-DASH-110] e [RN-DASH-111].** O art. 26 informa e o art. 27 § 6º
   controla exatamente este repasse. Os três indicadores devem viver na mesma tela: informação
   prestada, relatório de cartão enviado, valor conciliado. É esse trio que demonstra regularidade —
   nenhum deles isolado o faz.
5. **Estado explícito "sem prazo legal"** no cabeçalho do indicador, para impedir que consumidores do
   painel leiam o verde como "dentro do prazo" quando o correto é "sem divergência".

**Controvérsia/risco.** _Severidade: média._ Item 17 do steering (desconto de 40% sem adesão ao SNE)
e a arrecadação parcelada por cartão ([RN-DASH-111]) criam **fluxos de arrecadação fora do documento
padronizado**, cuja mecânica de repasse automático dos 5% não está resolvida no corpus. A conciliação
é justamente onde isso aparece — e por isso o indicador deve existir mesmo antes de o procedimento
estar definido.
