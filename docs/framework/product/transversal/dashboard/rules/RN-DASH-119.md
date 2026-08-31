---
id: RN-DASH-119
title: Aviso eletrônico de vencimento da CNH com 30 dias de antecedência — dever estadual expresso, de execução massiva
status: draft
apps: [dashboard, portal, pec]
sources: [REF-CONTRAN-809-2020, REF-CTB-147-148-habilitacao]
updated: 2026-08-24
---

**Regra.** Os órgãos executivos de trânsito dos Estados **enviarão, por meio eletrônico, com 30
(trinta) dias de antecedência, aviso de vencimento da validade da Carteira Nacional de Habilitação a
todos os condutores cadastrados no RENACH**. É um dever **estadual, expresso, com prazo numérico e
universo definido** — e é o único da tabela cuja execução é **massiva e automática** (uma notificação
por condutor, todo dia, indefinidamente), o que muda completamente a natureza do monitoramento: aqui
não se monitora um evento por mês, monitora-se uma **taxa de cobertura de uma população**.

**Base legal.** CTB art. 159, § 12 _(redação da Lei nº 15.428/2026 — capturado em
[REF-CONTRAN-809-2020], verbatim)_:

> § 12. Os órgãos ou entidades executivos de trânsito dos Estados e do Distrito Federal **enviarão por
> meio eletrônico, com 30 (trinta) dias de antecedência, aviso de vencimento da validade da Carteira
> Nacional de Habilitação a todos os condutores cadastrados no Renach** [...]

**Periodicidade / prazo.** **Contínua, por condutor.** O prazo é de **antecedência**: D-30 da data de
vencimento da CNH de cada titular. Não é periódico no sentido de calendário do órgão — é um prazo por
sujeito, replicado sobre toda a base do RENACH estadual.

**Consequência do descumprimento.** **Não localizada.** O dispositivo é impositivo e sem cominação.
A consequência material, porém, é significativa e recai sobre o cidadão: CNH vencida há mais de 30
dias expõe o condutor à infração gravíssima do art. 162, V do CTB. Um dever sem sanção para o órgão
cujo descumprimento produz autuação do administrado é **assimetria relevante**, e merece registro
como risco reputacional e de contencioso.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Cobertura, não contagem.** O indicador primário é: _dos condutores cujo vencimento ocorreu em
   D, qual percentual recebeu aviso em D-30?_ Volume de avisos enviados, isoladamente, não prova
   cumprimento — prova atividade.
2. **Coorte diária com janela de tolerância.** Uma coorte por dia de vencimento, avaliada em D-30.
   Falha na janela (envio em D-25, por exemplo) é **cumprimento defeituoso**, não cumprimento —
   e deve ser contabilizada à parte de "não enviado".
3. **Condutores sem meio eletrônico cadastrado** — o subconjunto para o qual o dever é
   **materialmente inexequível**. Este número deve ser exibido de forma destacada: é a medida exata
   da lacuna entre o dever legal e a capacidade do órgão, e é o insumo para uma campanha de
   atualização cadastral. Ocultá-lo faz a cobertura parecer melhor do que é.
4. **Falhas de entrega** (bounce, número inválido, canal indisponível) separadas de "não tentado". Do
   ponto de vista de diligência, tentar e falhar é posição defensável; não tentar não é.
5. **Trilha por condutor**: data-hora do envio, canal, identificador da mensagem. É o que permite
   responder individualmente a uma reclamação — e é dado pessoal, portanto sujeito a
   [RN-DASH-170] e [RN-DASH-171] (acesso segregado e registro de consulta).
6. **Série histórica de cobertura mensal** — o artefato que demonstra diligência continuada.

**Controvérsia/risco.** _Severidade: média._ (a) A redação vigente do art. 159 é da **Lei nº
15.428/2026**, muito recente; recomenda-se reconferir o texto compilado antes de promover esta regra a
`approved`. (b) A expressão _"por meio eletrônico"_ não é definida — e-mail, SMS, aplicativo oficial e
push de app são todos candidatos, com custos e taxas de entrega muito diferentes. A escolha do canal é
decisão do órgão e determina a exequibilidade do dever. (c) O envio massivo de aviso a toda a base do
RENACH é **tratamento de dados pessoais em escala**, com base legal no cumprimento de obrigação legal
(LGPD art. 7º, II / art. 23) — deve constar do registro de operações de tratamento ([RN-DASH-171]), e
o canal não pode ser aproveitado para conteúdo diverso do aviso (princípio da finalidade,
[REF-LEI-13709-2018] art. 6º, I).
