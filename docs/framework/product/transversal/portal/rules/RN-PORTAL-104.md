---
id: RN-PORTAL-104
title: Documento enviado assinado eletronicamente presume-se autêntico — vedado exigir reconhecimento de firma ou autenticação cartorial
status: draft
apps: [portal, rait]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-MP-2200-2-2001,
    REF-DETRANAM-PORTARIA-5046,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-08-24
---

**Regra.** Documento enviado pelo cidadão por meio do PORTAL, com envio **assinado eletronicamente**
no nível exigido pelo ato ([RN-PORTAL-101]), **presume-se autêntico**. Em consequência, o PORTAL:

- **não exige reconhecimento de firma**, salvo caso concreto de dúvida de autenticidade, que deve ser
  motivado e registrado — nunca uma exigência padronizada de checklist;
- **não exige autenticação cartorial** de cópia, nem "endosso" em cartório do Amazonas de documento
  autenticado em outro estado (exigência hoje publicada na carta de serviço "Recurso à JARI" do
  DETRAN-AM e já autorizada a ser corrigida);
- **não exige o original em papel** como condição de admissibilidade do que foi enviado digitalmente.

A presunção é **relativa**: cede à dúvida fundada de autenticidade, caso em que o órgão instaura
diligência ([RN-RAIT-004]) em vez de recusar o protocolo — a dúvida é matéria de instrução, não de
admissibilidade.

**Base legal.**

- [REF-LEI-14129-2021] art. 26: _"Presume-se a autenticidade de documentos apresentados por usuários
  dos serviços públicos ofertados por meios digitais, desde que o envio seja assinado
  eletronicamente."_
- [REF-LEI-13460-2017] art. 5º, IX: _"autenticação de documentos pelo próprio agente público, à
  vista dos originais apresentados pelo usuário, **vedada a exigência de reconhecimento de firma,
  salvo em caso de dúvida de autenticidade**"_.
- [REF-LEI-14129-2021] art. 3º, XV: _"a presunção de boa-fé do usuário dos serviços públicos"_; XI:
  _"a eliminação de formalidades e de exigências cujo custo econômico ou social seja superior ao
  risco envolvido"_ — e a mesma diretriz, em lei sem cláusula de adesão, em [REF-LEI-13460-2017]
  art. 5º, XI.
- [REF-DETRANAM-PORTARIA-5046] art. 2º, I e § 2º: dispensa o reconhecimento cartorial e autoriza o
  **próprio servidor do DETRAN-AM** a atestar a autenticidade da firma — ou seja, a exigência de
  cartório não decorre sequer da norma local do órgão.
- [REF-MP-2200-2-2001] art. 10, § 2º: outros meios de comprovação de autoria e integridade, inclusive
  sem certificado ICP-Brasil, são válidos _"desde que admitido pelas partes como válido ou aceito
  pela pessoa a quem for oposto o documento"_ — o órgão que disponibiliza o canal digital **aceita**,
  por definição, o meio que ele próprio oferece.

**Verificação.** (a) Nenhum checklist de anexos do PORTAL pode conter as expressões "firma
reconhecida", "autenticado em cartório" ou "endosso". (b) A dúvida de autenticidade é um **evento
motivado** no processo, com autor, data e razão, que abre diligência com prazo — não um bloqueio
silencioso na tela de upload. (c) Aceitar formatos de captura por celular (foto de documento) é
requisito funcional derivado desta regra, não conveniência de UX: recusar foto de documento e exigir
digitalização "de qualidade cartorial" é reintroduzir a formalidade eliminada.

**Interação com a representação por procurador.** Esta regra **não** revoga [RN-RAIT-121]: a
procuração particular segue exigindo firma reconhecida **por autenticidade**, na forma da lei civil e
da [REF-DETRANAM-PORTARIA-5046]. A distinção é precisa e deve ser preservada na UX: o regime
simplificado alcança os **documentos comprobatórios do pedido**; o instrumento de **representação**
tem regime próprio, e a alternativa digital para ele é a procuração assinada eletronicamente em nível
compatível, não a dispensa da formalidade.

**Decisão registrada.** Owner, em steering (`_meta/steering.md` D.28, 2026-08-24): autorizada a
correção imediata das duas exigências sem base legal documentadas em [REF-DETRANAM-SERVICOS] —
endosso cartorial e juntada do parecer da JARI —, sem aguardar validação jurídica formal. Esta regra
é o fundamento consolidado da primeira delas; a segunda está em [RN-PORTAL-106].

**Controvérsia/risco.** O art. 26 da Lei 14.129/2021 é o fundamento mais forte e mais direto, mas
depende da adesão estadual não confirmada ([RN-PORTAL-106], "Controvérsia/risco"). O art. 5º, IX da
Lei 13.460/2017 **não** tem essa dependência e sustenta sozinho a vedação de reconhecimento de firma;
o que se perde, no cenário de não adesão, é apenas a _presunção_ legal expressa de autenticidade do
art. 26 — que continuaria derivável da boa-fé do administrado e da própria [REF-MP-2200-2-2001], em
fundamento mais argumentativo e menos literal. A regra sobrevive nos dois cenários, com força
diferente. Item 1 de `_intake/legal-assessment.md`.
