---
id: RN-DASH-118
title: LAI — relógio de resposta a pedido de acesso: imediato se possível, senão 20 dias prorrogáveis por 10
status: draft
apps: [dashboard, portal]
sources: [REF-LEI-12527-2011, REF-LEI-14129-2021, REF-DECRETO-8777-2016]
updated: 2026-08-24
---

**Regra.** O pedido de acesso à informação tem **três estados de prazo**, nessa ordem de preferência
legal: **(1) acesso imediato**, sempre que a informação estiver disponível; **(2) 20 dias** para
comunicar consulta, negar motivadamente ou informar que não detém a informação; **(3) prorrogação por
mais 10 dias**, mediante **justificativa expressa cientificada ao requerente** — 30 dias no limite
absoluto. O acesso imediato não é cortesia: é o comando do _caput_ do art. 11, e os 20 dias são a
exceção para quando ele **não for possível**.

Três vedações acompanham o relógio e são igualmente monitoráveis: **não se exige motivo** do pedido;
**não se impõe exigência de identificação que inviabilize** a solicitação; e a **negativa deve
informar a possibilidade de recurso, prazos e condições**.

Este mesmo relógio governa, por remissão expressa, os **pedidos de abertura de base de dados**
([RN-DASH-151]).

**Base legal.** [REF-LEI-12527-2011] art. 11 _(verbatim)_:

> **Art. 11. O órgão ou entidade pública deverá autorizar ou conceder o acesso imediato à informação
> disponível.**
> § 1º Não sendo possível conceder o acesso imediato [...] o órgão ou entidade que receber o pedido
> deverá, **em prazo não superior a 20 (vinte) dias**: I - comunicar a data, local e modo para se
> realizar a consulta [...]; II - **indicar as razões de fato ou de direito da recusa**, total ou
> parcial, do acesso pretendido; ou III - comunicar que não possui a informação [...]
> **§ 2º O prazo referido no § 1º poderá ser prorrogado por mais 10 (dez) dias, mediante justificativa
> expressa, da qual será cientificado o requerente.**
> § 4º Quando não for autorizado o acesso [...] o requerente deverá ser informado sobre a
> **possibilidade de recurso, prazos e condições** para sua interposição [...]

[REF-LEI-12527-2011] art. 10, §§ 1º e 3º _(verbatim)_:

> § 1º Para o acesso a informações de interesse público, a **identificação do requerente não pode
> conter exigências que inviabilizem a solicitação**.
> § 3º São **vedadas quaisquer exigências relativas aos motivos determinantes** da solicitação de
> informações de interesse público.

[REF-LEI-12527-2011] art. 15: _"No caso de indeferimento [...] poderá o interessado interpor recurso
contra a decisão **no prazo de 10 (dez) dias** a contar da sua ciência."_

Remissões que reaproveitam este relógio: [REF-LEI-14129-2021] art. 30, § 2º e [REF-DECRETO-8777-2016]
art. 6º — _"aplicam-se os prazos e os procedimentos previstos para o processamento de pedidos de
acesso à informação, nos termos da Lei nº 12.527"_.

**Periodicidade / prazo.** Por evento. **Imediato / 20 dias / +10 dias.** Recurso do interessado: **10
dias** da ciência. O prazo de decisão do recurso pela CGU (5 dias, art. 16) é do **regime federal** —
para o DETRAN-AM a instância recursal é a definida na legislação estadual de acesso à informação,
**não localizada nesta rodada** (ver `_intake/legal-assessment.md`).

**Consequência do descumprimento.** A LAI não comina sanção pecuniária ao órgão pelo estouro do prazo,
mas o **art. 32** tipifica como conduta ilícita, sujeita a responsabilização do agente, _"retardar
deliberadamente o acesso à informação"_ e "negar acesso injustificadamente" — este é, junto com a
recusa de manifestação do art. 11 da Lei 13.460/2017 ([RN-DASH-116]), um dos **poucos pontos do corpus
onde a consequência é pessoal do agente público**, e não apenas institucional.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Fila por idade com os três marcos** (D-0 imediato possível, D-20, D-30), e não por volume.
2. **Taxa de atendimento imediato** como indicador de primeira linha. Ela mede, na prática, a
   qualidade da **transparência ativa**: quanto mais completo o rol publicado ([RN-DASH-140]), maior a
   parcela de pedidos respondível na hora — e menor a fila. É o indicador que liga os dois módulos.
3. **Prorrogação com justificativa registrada e ciência comprovada.** Prorrogar sem cientificar o
   requerente não prorroga — o prazo continua sendo 20 dias.
4. **Negativas classificadas por fundamento**, com contagem por hipótese de restrição invocada.
   Negativa sem fundamento identificado é achado, porque o § 1º, II exige _"as razões de fato ou de
   direito"_.
5. **Prova de que o recurso foi informado** em toda negativa (§ 4º) — checkbox auditável por pedido,
   não texto padrão presumido.
6. **Pedidos recorrentes sobre o mesmo assunto** — é o sinal operacional de que aquele conteúdo deve
   migrar para transparência ativa. Reduzir a fila publicando é a única estratégia sustentável.
7. **Zero exibido para exigências vedadas**: nenhum campo obrigatório de "motivo do pedido" no
   formulário do PORTAL. Se existir, é violação direta do art. 10, § 3º.

**Controvérsia/risco.** _Severidade: média._ O procedimento recursal aplicável a uma autarquia
estadual do Amazonas não foi localizado — a LAI federal desenha a cadeia CGU, que não vincula o
Estado. Sem isso, o item 5 acima ("informar prazos e condições de recurso") **não pode ser preenchido
com conteúdo correto**. É gap de pesquisa prioritário, e enquanto durar o painel deve exibir o campo
como pendente, não preenchê-lo com o modelo federal.
