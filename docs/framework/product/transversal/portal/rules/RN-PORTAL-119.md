---
id: RN-PORTAL-119
title: Canal único de exercício dos direitos do titular no PORTAL — quais incisos do art. 18 são acionáveis contra o DETRAN-AM e quais não são
status: draft
apps: [portal, boat, teat, rait, pec]
sources: [REF-LEI-13709-2018, REF-LEI-14129-2021, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** O PORTAL é o **canal de exercício dos direitos do titular** perante o DETRAN-AM, articulado
com o Encarregado do órgão. Nem todos os nove incisos do art. 18 da LGPD são acionáveis aqui, e o
produto deve dizer com precisão o que oferece e o que não oferece — enunciar direito que não se pode
exercer é pior do que não enunciá-lo.

| Inciso | Direito                                                                                             | Aplicável ao DETRAN-AM? | Tratamento no PORTAL                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| I      | Confirmação da existência de tratamento                                                             | **Sim**                 | Resposta imediata na própria tela                                                                           |
| II     | Acesso aos dados                                                                                    | **Sim**                 | Autosserviço ([RN-PORTAL-118]); declaração completa por requerimento ([RN-PORTAL-120])                      |
| III    | Correção de dado incompleto, inexato ou desatualizado                                               | **Sim**                 | Ação de primeira classe, com fluxo próprio ([RN-PORTAL-121])                                                |
| IV     | Anonimização, bloqueio ou eliminação de dado desnecessário, excessivo ou tratado em desconformidade | **Sim, com limite**     | Requerimento analisado; **não** alcança dado cuja guarda decorre de obrigação legal ou de processo em curso |
| V      | Portabilidade                                                                                       | **Duvidoso**            | Ver [RN-PORTAL-121] — sem regulamentação da ANPD para o setor público                                       |
| VI     | Eliminação de dado tratado **com consentimento**                                                    | **Não**                 | O tratamento é fundado em competência legal, não em consentimento — inciso materialmente inaplicável        |
| VII    | Informação sobre entidades com que houve uso compartilhado                                          | **Sim**                 | Deriva também do dever de publicidade do art. 23, I                                                         |
| VIII   | Informação sobre a possibilidade de não consentir e suas consequências                              | **Não**                 | Pressupõe consentimento                                                                                     |
| IX     | Revogação do consentimento                                                                          | **Não**                 | Idem                                                                                                        |

Duas travas de honestidade na UX: (a) o PORTAL **não** exibe botão de "excluir meus dados" que
sugira eliminação plena — o que existe é requerimento de eliminação do dado _desnecessário ou
excessivo_, com resposta motivada; (b) o PORTAL **não** apresenta o tratamento como baseado em
consentimento, e não pede consentimento para o que faz por competência legal — pedir consentimento
onde ele não é a base legal cria a falsa impressão de que a recusa é possível.

**Base legal.**

- [REF-LEI-13709-2018] art. 18, incisos I a IX e §§ 1º a 6º (transcritos integralmente no REF).
  Destaque: § 3º — os direitos _"serão exercidos mediante requerimento expresso do titular ou de
  representante legalmente constituído, a agente de tratamento"_; § 4º — em caso de impossibilidade
  de adoção imediata, o controlador responde indicando _"as razões de fato ou de direito que impedem
  a adoção imediata da providência"_; § 5º — o requerimento é atendido **sem custos para o titular**.
- [REF-LEI-13709-2018] art. 23, _caput_: o tratamento pelo Poder Público é realizado _"para o
  atendimento de sua finalidade pública, na persecução do interesse público, com o objetivo de
  executar as competências legais ou cumprir as atribuições legais do serviço público"_ — é essa
  base, e não o consentimento, que sustenta o tratamento do DETRAN-AM; inciso I: dever de informar as
  hipóteses de tratamento _"em veículos de fácil acesso, preferencialmente em seus sítios
  eletrônicos"_; inciso III: dever de indicar **encarregado**.
- [REF-LEI-13709-2018] art. 16: hipóteses em que a conservação é autorizada mesmo após o término do
  tratamento — _"I - cumprimento de obrigação legal ou regulatória pelo controlador"_ entre elas — e
  que sustentam a recusa motivada de eliminação.
- [REF-LEI-14129-2021] art. 21, X: a ferramenta digital deve ter _"funcionalidade para solicitar
  acesso a informações acerca do tratamento de dados pessoais"_.
- [REF-LEI-13460-2017] art. 12, parágrafo único: as cinco etapas da resolução efetiva (recepção,
  comprovante, análise, decisão final, ciência) — modelo procedimental reaproveitado aqui.

**Verificação.** (a) Existe um ponto único no PORTAL ("Meus dados") de onde partem todos os
requerimentos do art. 18, com protocolo, estado e histórico — e não um formulário genérico de contato.
(b) Todo requerimento produz **decisão motivada**, inclusive o indeferido: "não é possível eliminar
porque o dado é objeto de obrigação legal de guarda (art. 16, I)" é resposta válida; silêncio ou
"indeferido" seco não é. (c) Nenhum requerimento do art. 18 pode gerar cobrança. (d) A identidade e o
contato do **Encarregado** estão publicados e alcançáveis a partir do PORTAL (art. 41, § 1º). (e) O
exercício dos direitos é rastreável como evento de tratamento, para compor o registro do art. 37.

**Delta frente a [RN-BOAT-126].** Aquela regra estabelece os **deveres do órgão** quanto ao dado de
vítima e aponta o portal como canal natural, sem descrever o canal. Esta regra descreve o canal e
delimita, com precisão inédita no corpus, **quais incisos são acionáveis** — recorte que [RN-BOAT-126]
não fazia e que evita o erro de expor no produto direitos que pressupõem consentimento. As duas são
complementares: [RN-BOAT-126] responde "o que o órgão deve fazer"; esta responde "o que o cidadão
pode pedir e por onde".

**Controvérsia/risco.** (a) O § 3º exige **requerimento expresso**, o que em tese admitiria exigir
formalidade; a leitura adotada é a mínima compatível com o art. 5º, IV da Lei 13.460/2017 — clicar em
"solicitar correção" numa sessão autenticada **é** requerimento expresso. (b) A fronteira entre
"exercício de direito LGPD" e "vista do próprio processo" ([RN-PORTAL-112]) precisa ser clara: a
segunda é acesso corrente, sem requerimento e sem prazo; a primeira é requerimento com decisão
motivada. Rotear a vista de processo para a fila de LGPD é regressão funcional. (c) O inciso IV é o
mais litigioso: o cidadão que pede eliminação de infração prescrita ou de dado de processo encerrado
receberá recusa fundada no art. 16, I — e essa recusa precisa estar redigida em linguagem simples,
sob pena de gerar manifestação de ouvidoria evitável. Ver `_intake/legal-assessment.md`.
