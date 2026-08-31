---
id: RN-TEAT-110
title: Autenticação do agente autuador é requisito normativo do talão eletrônico, com três meios admitidos
status: draft
apps: [teat]
sources: [REF-SENATRAN-997, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** O acesso ao talão eletrônico deve seguir padrões de segurança da informação que
**permitam identificar o agente autuador responsável pela lavratura do AIT**, por um de três meios
normativamente admitidos: **código de usuário e senha**, **biometria** ou **assinatura digital**.
O talão eletrônico deve, além disso, **identificar o agente responsável** em cada AIT lavrado. A
identidade do agente não é metadado operacional: é **requisito de existência válida** do ato — sem
ela, o AIT não atende ao art. 280, V do CTB ([RN-TEAT-101]) nem ao art. 3º, III da Portaria.

**Base legal.**

- [REF-SENATRAN-997] art. 2º §3º: _"O acesso ao Talão Eletrônico deverá seguir padrões de
  segurança da informação que permitam a identificação do agente autuador."_
- [REF-SENATRAN-997] art. 3º, III: o talão eletrônico deverá _"identificar o agente da autoridade
  de trânsito responsável pela lavratura do AIT"_.
- [REF-SENATRAN-997] Anexo II, a): _"O acesso ao software do Talão Eletrônico deverá seguir
  padrões de segurança da informação que permitam a identificação do agente autuador responsável
  pela lavratura do AIT, por meio de código do usuário e senha, biometria ou assinatura digital"_.
- [REF-SENATRAN-997] Anexo II, i): _"O software deverá identificar o equipamento e impedir sua
  instalação ou uso não autorizado"_ — ver [RN-TEAT-003].

**Verificação.** Fecha a lacuna de base legal de [RN-TEAT-001], que exigia "identidade do agente"
em todo ato offline sem excerto normativo: o excerto existe e é o art. 2º §3º c/c Anexo II, a). A
plataforma STYNX permanece autoridade de identidade/sessão ([APP-TEAT]), mas o **atendimento ao
requisito é do TEAT**: cabe a ele registrar, por ato legal, qual dos três meios autenticou o
agente naquela sessão (`auth_method` ∈ {SENHA, BIOMETRIA, ASSINATURA_DIGITAL}) — dado exigível na
homologação SENATRAN ([RN-TEAT-117]) e na auditoria do Anexo II, j) ([RN-TEAT-112]). Um quarto
método (p.ex. SSO federado sem segundo fator vinculado à pessoa física do agente) **não está no
rol** e não deve ser adotado sem parecer.

**Controvérsia/risco.** O rol de três meios é redigido de forma exemplificativa na aparência
("por meio de") mas fechada na função — não há norma que autorize outro meio. Tratar o rol como
aberto é risco de conformidade na homologação. Registrado em `_intake/legal-assessment.md`,
item 9.
