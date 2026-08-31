---
id: RN-TEAT-105
title: Assinatura do agente no AIT eletrônico — dispensada por regra, obrigatória apenas na impressão no ato
status: draft
apps: [teat]
sources: [REF-CONTRAN-918, REF-SENATRAN-997, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** No AIT lavrado em talão eletrônico, a assinatura da autoridade de trânsito ou de seu
agente é **dispensada** — a identificação eletrônica do agente autuador ([RN-TEAT-110]) supre a
subscrição. A assinatura torna-se **obrigatória em uma única hipótese**: quando o AIT do talão
eletrônico for **impresso no ato de sua lavratura**. Consequência de negócio: a decisão de
imprimir no ato **muda o conteúdo formal exigido do documento**; não é escolha neutra de UX.
Distinta e não confundível com esta é a assinatura do **infrator** ([RN-TEAT-005]), que é
qualificada por "sempre que possível" e vale como notificação do cometimento da infração.

**Base legal.**

- [REF-CONTRAN-918] art. 3º §2º: _"O órgão autuador, sempre que possível, deverá imprimir o AIT
  lavrado nas formas previstas nos incisos II e III do § 1º para início do processo
  administrativo previsto no Capítulo XVIII do CTB, sendo dispensada a assinatura da autoridade
  ou de seu agente."_
- [REF-SENATRAN-997] art. 4º, parágrafo único: _"A assinatura da autoridade de trânsito ou de seu
  agente será obrigatória somente quando o AIT do Talão Eletrônico for impresso no ato do seu
  preenchimento."_
- [REF-SENATRAN-997] Anexo III, e): _"A assinatura da autoridade de trânsito ou de seu agente
  será obrigatória quando o AIT do Talão Eletrônico for impresso no ato de sua lavratura"_;
  f): _"O AIT impresso deverá possuir campo para a assinatura do infrator"_.
- [REF-CTB-280-290] art. 280, VI (assinatura do infrator, _"sempre que possível, valendo esta como
  notificação do cometimento da infração"_).

**Verificação.** O modelo de documento do AIT impresso ([WF-TEAT-003], `document templates` do
`NormativeCatalog`) tem **duas variantes**: impressão no ato (com bloco de assinatura do agente
preenchido) e impressão diferida/reimpressão (sem esse bloco, com a identificação eletrônica do
agente). A variante é determinada pelo momento da impressão registrado pelo `MobilePrinterPort`,
não por configuração do usuário. Ambas as variantes contêm campo para assinatura do infrator
(Anexo III, f). O ato digital finalizado é válido sem qualquer assinatura obtida — ver
[RN-TEAT-116] e [RN-TEAT-005].

**Controvérsia/risco.** O art. 3º §2º da Res. 918/2022 dispensa a assinatura como consequência da
**impressão** ("deverá imprimir […] sendo dispensada a assinatura"), enquanto a Portaria SENATRAN
997/2022 a torna obrigatória **exatamente na impressão**, quando esta ocorre no ato. Lidos
isoladamente, os dois textos apontam em direções opostas. Leitura harmônica adotada: a Res. 918
dispensa a assinatura **manuscrita da autoridade na peça processual** produzida pela retaguarda
(impressão para instrução do processo); a Portaria 997, norma específica e posterior, exige a
assinatura quando a via é entregue **em campo, no ato**, porque ali ela cumpre função de
autenticação presencial. É interpretação, não texto expresso — item 4 de
`_intake/legal-assessment.md`.
