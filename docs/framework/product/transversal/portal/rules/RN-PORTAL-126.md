---
id: RN-PORTAL-126
title: Parcelamento é operação de cartão, não moratória do órgão — sem limite normativo de parcelas, com exclusões taxativas e dupla habilitação prévia
status: draft
apps: [portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-CONTRAN-809-2020]
updated: 2026-08-24
---

**Regra.** O "parcelamento" de multas do art. 27 da Res. 918/2022 **não é parcelamento do crédito
público**. O órgão recebe **à vista e integralmente**; o que se parcela é a operação de **cartão de
crédito**, por conta e risco da instituição do SPB, com encargos a cargo do titular do cartão. Cinco
consequências vinculantes para o PORTAL:

1. **A tela nunca diz "parcele sua multa com o DETRAN".** Diz que é possível pagar à vista o débito
   usando um cartão que o cidadão parcela com a sua administradora — e que **os encargos são dele**.
   Apresentar como moratória concedida pelo órgão é informação incorreta com consequência econômica.
2. **Não existe limite normativo de parcelas.** Nenhum dispositivo da Res. 918/2022 fixa número
   máximo — a norma fala apenas em _"parcelas mensais"_. O número é definido pelo plano de pagamento
   apresentado pela credenciadora (art. 27, § 4º). **Qualquer afirmação de "até 12x por força da
   Res. 918" é incorreta** e foi expressamente afastada na conferência textual integral do PDF
   oficial (ver [REF-CONTRAN-918], anotação do Capítulo VIII).
3. **O plano de pagamento é exibido antes da escolha.** A norma exige que a empresa apresente os
   planos _"possibilitando ao titular do cartão conhecer previamente os custos adicionais de cada
   forma de pagamento e decidir pela opção que melhor atenda às suas necessidades"_ — é dever
   normativo de transparência de custo, e o PORTAL é onde ele se cumpre.
4. **Exclusões taxativas devem ser verificadas antes de oferecer.** Ficam excluídos: multas inscritas
   em **dívida ativa**; parcelamentos inscritos em **cobrança administrativa**; **veículos licenciados
   em outras UF**; e multas de **outros órgãos autuadores** que não autorizam o parcelamento.
   Oferecer para depois recusar é atrito evitável e verificável a priori.
5. **O efeito jurídico útil é imediato**: aprovado e efetivado o parcelamento, **libera-se o
   licenciamento e a emissão do CRLV-e** ([RN-PORTAL-116]) — este é o principal motivo de o
   parcelamento existir no produto.

E uma vedação categórica: **o SNE não permite parcelamento** (Res. 931/2022 art. 9º, § 4º). O
parcelamento existe no canal próprio do órgão, nunca no canal SNE.

**Base legal.**

- [REF-CONTRAN-918] art. 24, § 3º: _"O recebimento de multas pela rede arrecadadora será feito
  exclusivamente à vista e de forma integral, podendo ser realizado parcelamento, por meio de cartão
  de crédito, **por conta e risco de instituições integrantes do Sistema de Pagamentos Brasileiro
  (SPB)**."_
- [REF-CONTRAN-918] art. 27, _caput_: os órgãos arrecadadores _"**poderão** firmar, sem ônus para si,
  acordos e parcerias técnico-operacionais para viabilizar o pagamento [...] com cartões de débito ou
  crédito, disponibilizando aos infratores ou proprietários de veículos alternativas para quitar seus
  débitos à vista ou em parcelas mensais, com a imediata regularização da situação do veículo."_
- [REF-CONTRAN-918] art. 27, § 4º: as empresas devem _"apresentar ao interessado os planos de
  pagamento dos débitos em aberto, possibilitando ao titular do cartão conhecer previamente os custos
  adicionais de cada forma de pagamento e decidir pela opção que melhor atenda às suas
  necessidades"_; § 5º: _"Os encargos e eventuais diferenças de valores a serem cobrados por conta do
  parcelamento via cartão de crédito ficam a cargo do titular do cartão de crédito que aderir a essa
  modalidade de pagamento."_
- [REF-CONTRAN-918] art. 27, § 8º: o parcelamento _"poderá englobar uma ou mais multas de trânsito
  vinculadas ao veículo"_; § 9º: a aprovação e efetivação _"libera o licenciamento do veículo e a
  respectiva emissão do [...] CRLV-e"_; § 10: multas já vencidas são acrescidas de juros SELIC nos
  termos dos arts. 22 e 23; § 12: rol de exclusões (I a IV); § 13: _"O órgão autuador é o competente
  para autorizar o parcelamento, **em caráter facultativo**"_.
- [REF-CONTRAN-918] art. 27, §§ 1º-2º: o órgão arrecadador **deve solicitar autorização** ao órgão
  máximo executivo de trânsito da União, expedida por ofício ao dirigente máximo; §§ 3º-4º e 15:
  habilitação e credenciamento das empresas processadoras **exclusivamente** pelo órgão máximo, com
  comprovação de habilitação jurídica, regularidade fiscal e trabalhista, qualificação
  econômico-financeira e técnica.
- [REF-CONTRAN-918] art. 27, § 6º: **relatórios mensais** ao órgão máximo com o montante arrecadado
  discriminado; § 7º: a ausência de prestação de contas **autoriza a suspensão da autorização**.
- [REF-CONTRAN-931] art. 9º, § 4º: _"O SNE não permitirá o parcelamento das multas de trânsito."_
- [REF-CONTRAN-809-2020] art. 4º: o CRLV-e só é expedido após quitação — o que o § 9º acima destrava.

**Verificação.** (a) O fluxo só é habilitado se `autorizacao_senatran_parcelamento = true` no
cadastro do órgão — ver Controvérsia. (b) As quatro exclusões do § 12 são checadas **antes** de
exibir a opção, débito a débito. (c) Os planos de pagamento com custo total e custo adicional são
exibidos antes da confirmação, e a escolha do cidadão é registrada. (d) A tela não usa vocabulário de
moratória ("parcelar com o DETRAN", "acordo de dívida"). (e) A liberação do licenciamento e a emissão
do CRLV-e são disparadas pela **efetivação** confirmada pela operadora, não pela solicitação. (f)
Existe rotina de composição do **relatório mensal** do § 6º — obrigação periódica do órgão,
monitorável pelo DASHBOARD junto com o art. 26 (prestação de informações até o **20º dia do mês
subsequente**).

**Controvérsia/risco (ALTO — pré-condição de existência).** A funcionalidade depende de **dupla
habilitação**: autorização específica do órgão máximo executivo de trânsito da União ao DETRAN-AM
(§§ 1º-2º) e credenciamento das processadoras por aquele mesmo órgão (§§ 4º e 15). **Nenhum dos dois
atos foi localizado neste corpus.** Isso não é detalhe de implementação: sem eles, oferecer
parcelamento por cartão é operar sem autorização normativa. É verificação administrativa barata e de
resposta binária, e deve preceder qualquer investimento de desenvolvimento no módulo.

Riscos secundários: (a) o § 7º permite **suspender a autorização** por falta de prestação de contas
mensal — a funcionalidade pode ser desligada por descumprimento administrativo do próprio órgão, o
que exige que o relatório mensal seja tratado como obrigação de primeira classe, e não como tarefa
de fim de mês; (b) o § 12, III exclui **veículos licenciados em outras UF**, o que num estado com
frota flutuante produz recusa frequente — a mensagem precisa explicar a razão, sob pena de ser lida
como falha do sistema; (c) o § 11 manda considerar como receita arrecadada o valor total **excluída a
taxa de cartão**, o que tem efeito sobre a base de cálculo do FUNSET e do art. 320 do CTB — matéria
de contabilidade pública que o produto não decide, mas cujo dado precisa expor corretamente.
Ver `_intake/legal-assessment.md`.
