---
id: RN-DASH-141
title: Transparência passiva — SIC, vedação de exigir motivo, negativa fundamentada e o dever de informar o recurso
status: draft
apps: [dashboard, portal]
sources: [REF-LEI-12527-2011, REF-LEI-13709-2018]
updated: 2026-08-24
---

**Regra.** Transparência **passiva** é o regime do pedido: qualquer interessado pede, o órgão
responde. Ela é regida por quatro comandos que, juntos, definem o que o DASHBOARD deve instrumentar —
o **relógio** está em [RN-DASH-118]; aqui está o **regime**:

1. **Canal obrigatório.** O acesso é assegurado mediante **criação de Serviço de Informações ao
   Cidadão (SIC)** no órgão — não é opcional, e não se substitui por caixa de e-mail genérica.
2. **Nenhuma exigência de motivo.** São **vedadas quaisquer exigências relativas aos motivos** do
   pedido, e a identificação do requerente **não pode conter exigências que inviabilizem** a
   solicitação. Um formulário com campo obrigatório "finalidade do pedido" é ilegal, não é boa prática
   de triagem.
3. **Negativa é ato motivado.** Recusa total ou parcial exige **razões de fato ou de direito**
   declaradas, e não pode ser genérica.
4. **Dever de informar o recurso.** Negado o acesso, o requerente **deve ser informado** sobre a
   possibilidade de recurso, prazos e condições de interposição — informar o direito de recorrer é
   parte da própria negativa.

**Base legal.** [REF-LEI-12527-2011] _(verbatim)_:

> Art. 9º O acesso a informações públicas será assegurado mediante: I - **criação de serviço de
> informações ao cidadão**, nos órgãos e entidades do poder público [...]; e II - realização de
> audiências ou consultas públicas [...]
>
> Art. 10. Qualquer interessado poderá apresentar pedido de acesso a informações [...], **por qualquer
> meio legítimo**, devendo o pedido conter a identificação do requerente e a especificação da
> informação requerida.
> § 1º Para o acesso a informações de interesse público, a **identificação do requerente não pode
> conter exigências que inviabilizem a solicitação**.
> § 3º São **vedadas quaisquer exigências relativas aos motivos determinantes** da solicitação de
> informações de interesse público.
>
> Art. 11. [...] § 1º [...] II - **indicar as razões de fato ou de direito da recusa**, total ou
> parcial, do acesso pretendido [...]
> § 4º Quando não for autorizado o acesso [...] o requerente deverá ser **informado sobre a
> possibilidade de recurso, prazos e condições** para sua interposição [...]
>
> Art. 5º É **dever do Estado** garantir o direito de acesso à informação, que será franqueada,
> mediante procedimentos objetivos e ágeis, de forma transparente, clara e **em linguagem de fácil
> compreensão**.
>
> Art. 40. [...] o dirigente máximo de cada órgão [...] designará **autoridade** que lhe seja
> diretamente subordinada para [...] [monitorar a implementação da LAI].

**Verificação.**

1. **Auditoria do formulário do PORTAL** como item permanente do painel de conformidade: nenhum campo
   obrigatório de motivo/finalidade; nenhuma exigência de documento além da identificação; nenhuma
   restrição de canal ("por qualquer meio legítimo"). Cada um desses é um teste automatizável, e o
   resultado deve aparecer no DASHBOARD como verde/vermelho — não como suposição.
2. **Negativas com fundamento estruturado**, classificadas por hipótese legal invocada. O painel exibe
   a distribuição: uma hipótese que responde por 80% das negativas é um sinal a investigar, não uma
   estatística neutra.
3. **Prova de que o recurso foi informado** em 100% das negativas (§ 4º) — campo auditável por pedido.
4. **Autoridade de monitoramento (art. 40)** identificada e exibida. A LAI federal cria a figura para a
   administração federal; para o DETRAN-AM ela é **precedente e boa prática**, e converge com o
   **encarregado pelo tratamento de dados** da LGPD, cuja identidade e contato **devem ser divulgados
   publicamente** ([REF-LEI-13709-2018] art. 41, § 1º; ver [RN-BOAT-127]). Um painel público que não
   exibe quem é o encarregado descumpre um dever expresso e barato de cumprir.
5. **Linguagem de fácil compreensão (art. 5º)** aplica-se à resposta, e também ao painel: um indicador
   público rotulado apenas com sigla interna não cumpre o comando.
6. **Interseção com LGPD.** Pedido de LAI que solicite **dado pessoal de terceiro** não se responde
   pela LAI pura — dado pessoal tem regime próprio de restrição, e dado **sensível** (saúde de vítima
   de sinistro, condição clínica de candidato) tem proteção reforçada. O fluxo correto é: classificar
   o pedido, aplicar o regime de restrição, negar **motivadamente** a parte protegida, e **conceder o
   restante** ([RN-DASH-142], [RN-DASH-162]). Negar o pedido inteiro por conter parte protegida é
   negativa excessiva.

**Controvérsia/risco.** _Severidade: média-alta._ A instância recursal aplicável a uma autarquia
estadual do Amazonas **não foi localizada** — a cadeia CGU do art. 16 é federal. Sem essa informação,
o item 3 acima não pode ser preenchido com conteúdo correto, e o órgão está informando ao cidadão um
direito de recurso cujo endereço desconhece. É o gap de pesquisa mais operacionalmente urgente deste
bloco. Segundo risco: pedidos de imprensa e de pesquisa sobre **sinistros específicos** são o vetor
clássico de vazamento por LAI — tratam-se por restrição de dado sensível, nunca por publicação aberta
([RN-BOAT-130], [RN-DASH-162]).
