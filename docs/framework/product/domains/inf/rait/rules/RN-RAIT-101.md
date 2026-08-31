---
id: RN-RAIT-101
title: Prazo de defesa da autuação — piso legal de 30 dias contados da expedição da NA
status: approved
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** O prazo para apresentação da defesa da autuação é **o impresso na Notificação da
Autuação** (ou no AIT quando este valer como NA) e **não pode ser inferior a 30 dias contados da
data de expedição da notificação**. A data impressa é o dado vinculante; os 30 dias são piso de
validação, não o prazo em si. Se a data impressa resultar em prazo inferior ao piso, o vício é do
órgão e **não pode ser oposto ao administrado** — a defesa apresentada dentro dos 30 dias legais é
tempestiva ainda que fora da data impressa.

**Base legal.**

- [REF-CTB-280-290] art. 281-A: _"deverá constar o prazo para apresentação de defesa prévia, que
  não será inferior a 30 (trinta) dias, contado da data de expedição da notificação."_
- [REF-CONTRAN-918] art. 4º §2º: _"Na NA constará a data do término do prazo para a apresentação da
  defesa da autuação … que não será inferior a 30 (trinta) dias, contados da data de expedição da
  NA ou publicação por edital"_.
- [REF-CONTRAN-918] art. 4º §6º: para NA **expedidas antes de 12/04/2021**, o piso é de **15 dias**
  (regra de transição — aplicável apenas a acervo histórico).
- [REF-CONTRAN-918] art. 3º §5º: o AIT vale como NA quando assinado pelo condutor que seja o
  proprietário ou o principal condutor previamente identificado, **desde que dele conste a data do
  término do prazo de defesa**.

**Verificação.** O motor de prazos recebe (data_expedicao_NA, data_limite_impressa) e calcula
`piso = data_expedicao_NA + 30 dias` pela contagem de [RN-RAIT-005]; tempestividade =
`data_protocolo <= max(data_limite_impressa, piso)`. Alerta de conformidade sempre que
`data_limite_impressa < piso` (defeito de emissão a corrigir a montante, no TEAT). Para AIT que
vale como NA sem data-limite impressa, a NA é inválida como ciência do prazo — não corre prazo de
defesa.

**Controvérsia/risco.** _Expedição_ (art. 281-A) e _notificação_ ([REF-CONTRAN-918] art. 29, que
exclui da contagem "o dia da notificação") **não são o mesmo evento**: [REF-CONTRAN-918] art. 30
define expedição como a entrega à empresa de remessa postal ou o envio eletrônico. Adotamos como
termo inicial a **expedição**, por ser o marco expresso nos dois dispositivos que fixam o piso.
Divergência textual registrada em `_intake/legal-assessment.md`, item 3.

**Decisão.** Owner, em steering (`_meta/steering.md` C.21, 2026-08-24): confirma **expedição**
como termo inicial, sem parecer jurídico formal — risco residual permanece caso um parecer
futuro divirja.
