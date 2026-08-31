---
id: RN-RAIT-125
title: SNE como canal de interposição de defesa/recurso e de ciência do resultado do julgamento
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-931, REF-CTB-280-290, REF-CONTRAN-900]
updated: 2026-08-24
---

**Regra.** Os órgãos integrantes do SNT **devem** disponibilizar e receber no SNE, entre outros
itens: **interposição de defesa prévia** (IV), **interposição de recursos administrativos de
infrações de trânsito** (V), **resultado de julgamentos** (VI), **indicação de condutor infrator**
(VII) e **resultado da identificação do condutor infrator** (VIII), além das notificações de autuação
e de penalidade (I a III). O SNE disponibiliza também o **Formulário de Identificação do Condutor
Infrator** relativo às notificações de autuação informadas eletronicamente.

Em nível legal, o sistema de notificação eletrônica **deve** disponibilizar, **na mesma plataforma**,
campo destinado à apresentação de defesa prévia e de recurso quando o infrator não reconhecer o
cometimento da infração.

**Base legal.**

- [REF-CONTRAN-931] art. 4º, incisos I a VIII; art. 11.
- [REF-CTB-280-290] art. 284 §5º _(Redação dada pela Lei nº 14.440, de 2022)_: _"O sistema de
  notificação eletrônica … deve disponibilizar, na mesma plataforma, campo destinado à apresentação
  de defesa prévia e de recurso, quando o infrator não reconhecer o cometimento da infração, na forma
  regulamentada pelo Contran."_
- [REF-CONTRAN-900] art. 12: a apresentação de defesa ou recurso pelo SNE obedece à regulamentação
  específica do CONTRAN — que é justamente a Res. 931/2022.
- [REF-CONTRAN-900] art. 6º §4º: protocolização por meio eletrônico disponibilizado pelo órgão
  autuador (canal próprio, alternativo ao SNE — [RN-RAIT-106]).

**Verificação.** O RAIT trata o SNE como **canal de entrada e de saída** de primeira classe: peças
recebidas pelo SNE entram na mesma fila e com o mesmo modelo de `canal_entrada` das demais
([RN-RAIT-106]); a comunicação do resultado do julgamento ([RN-RAIT-130]) é publicada no SNE quando o
interessado for aderente, com registro do evento.

**Controvérsia/risco.** Convivem **dois** canais eletrônicos juridicamente distintos: o **SNE**
(nacional, art. 4º da Res. 931/2022) e o **canal eletrônico próprio do órgão** (art. 6º §4º da Res.
900/2022 — hoje, no Amazonas, o Protocolo Virtual do Estado). Eles têm marcos de tempestividade e
trilhas de auditoria diferentes. O desenho do PORTAL deve deixar explícito por qual dos dois o
cidadão está protocolando, sob pena de o órgão não conseguir provar a data do protocolo.

**Adesão pelo canal digital.** A adesão de proprietários e condutores ao SNE _"poderá ser realizada
junto aos órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal ou via outros
mecanismos disponibilizados"_ ([REF-CONTRAN-931] art. 7º) — base normativa suficiente para o PORTAL
oferecer a adesão sem exigir comparecimento a balcão.
