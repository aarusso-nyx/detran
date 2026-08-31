---
id: RN-RAIT-111
title: Teto legal de julgamento em 2ª instância — 24 meses do recebimento pelo CETRAN-AM
status: approved
apps: [rait, dashboard]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** O recurso de 2ª instância deve ser julgado no prazo de **24 meses, contado do recebimento
do recurso pelo órgão julgador** — no caso do DETRAN-AM, o **CETRAN-AM** ([RN-RAIT-117]). É um teto
**independente** do teto de 1ª instância: cada instância tem seu próprio período de 24 meses, e o
tempo consumido na JARI não abate o do CETRAN.

**Base legal.**

- [REF-CTB-280-290] art. 289, _caput_ _(Redação dada pela Lei nº 14.229, de 2021)_: _"O recurso de
  que trata o art. 288 deste Código deverá ser julgado no prazo de 24 (vinte e quatro) meses, contado
  do recebimento do recurso pelo órgão julgador"_.
- [REF-CONTRAN-918] art. 16: _"Das decisões da JARI caberá recurso em segunda instância na forma dos
  arts. 288 e 289 do CTB."_

**Verificação.** `prazo_teto_cetran = data_recebimento_cetran + 24 meses`. O RAIT registra a data de
recebimento pelo CETRAN-AM mesmo quando a tramitação de 2ª instância ocorrer fora do sistema, por
ser o marco inicial do relógio de [RN-RAIT-112] naquela instância.

**Controvérsia/risco.** Somados os dois tetos, um processo pode legalmente permanecer **até 48 meses
em julgamento** sem que nenhum dispositivo seja violado — além do tempo de defesa da autuação, do
prazo de remessa e dos intervalos não computados entre instâncias. Esse horizonte colide frontalmente
com o **prazo de prescrição por paralisação de 3 anos** da Lei 9.873/1999 ([RN-RAIT-113]): um
processo dentro do teto do CTB pode já estar prescrito pela lei geral. Conflito material registrado
em `_intake/legal-assessment.md`, item 9.

**Decisão.** Owner, em steering (`_meta/steering.md` C.14, 2026-08-24), sem parecer jurídico
formal: **o relógio mais curto governa** — a prescrição por paralisação de 3 anos ([RN-RAIT-113])
prevalece como teto de SLA institucional sobre o teto somado de até 48 meses deste artigo. Este
teto de 24 meses/instância continua valendo como teto **legal** de julgamento (o não-julgamento
dentro dele ainda gera a prescrição própria de [RN-RAIT-112]) — a decisão do Owner é sobre qual
relógio a escada de alertas operacional ([WF-RAIT-002] §4) deve priorizar como mais restritivo,
não uma revogação deste artigo.

**Gap operacional.** O CETRAN-AM não é órgão do DETRAN-AM; a captura da `data_recebimento_cetran`
depende de integração ou de comunicação formal. Sem ela, o RAIT fica **cego** justamente na
instância onde o relógio de prescrição continua correndo.
