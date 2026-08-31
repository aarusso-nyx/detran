---
id: RN-RAIT-126
title: Notificação eletrônica dispensa edital e substitui as demais formas de notificação
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931]
updated: 2026-08-24
---

**Regra.** A notificação por **edital** é medida **residual**: só cabe quando **esgotadas as
tentativas** de notificar por meio postal ou pessoal. Quando a notificação é enviada
eletronicamente, o **edital é dispensado**, e a utilização do SNE **substitui qualquer outra forma de
notificação para todos os efeitos legais**.

Quando cabível, o edital é publicado em diário oficial, respeitados o art. 282 §1º do CTB e os prazos
prescricionais da Lei 9.873/1999 ([RN-RAIT-113]), e deve conter, no mínimo, cabeçalho de
identificação, instruções e prazo para defesa ou recurso, e a lista com placa, número do AIT, data e
código da infração (e, na NP de multa, o valor). É facultado publicar **extrato resumido** no diário,
sendo **obrigatória** a publicação da íntegra no sítio eletrônico do órgão.

**Base legal.**

- [REF-CONTRAN-918] art. 14, _caput_ e §§1º a 4º — em especial o **§4º**: _"As notificações enviadas
  eletronicamente dispensam a publicação por edital."_
- [REF-CONTRAN-931] art. 4º §8º: _"A utilização do SNE substitui qualquer outra forma de notificação
  para todos os efeitos legais."_
- [REF-CONTRAN-918] art. 31: em caso de **falha** nas notificações, a autoridade **poderá refazer o
  ato**, observados os prazos prescricionais.

**Verificação.** O RAIT/TEAT só habilita a rotina de edital quando o processo registra tentativas
postal/pessoal esgotadas **e** o interessado não é aderente do SNE. Publicação de edital gera evento
com link para a íntegra no sítio do DETRAN-AM. Refazimento de ato por falha é ação motivada, com
verificação prévia dos relógios de [RN-RAIT-113] e [RN-RAIT-114].

**Controvérsia/risco.** O art. 31 permite **refazer** a notificação falha "observados os prazos
prescricionais", mas **não** menciona a decadência do art. 282 §§6º-7º do CTB. Como a decadência
extingue o direito de aplicar a penalidade, refazer a NP depois de vencidos os 180/360 dias é
juridicamente inócuo, ainda que dentro do prazo prescricional. O sistema deve **bloquear** o
refazimento nessa hipótese e não apenas alertar. Interpretação a validar —
`_intake/legal-assessment.md`, item 18.
