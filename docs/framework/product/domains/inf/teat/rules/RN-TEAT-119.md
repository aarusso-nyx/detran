---
id: RN-TEAT-119
title: Consistência do AIT — o que se corrige e o que obrigatoriamente se arquiva
status: draft
apps: [teat, rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-CONTRAN-985-1003-MBFT]
updated: 2026-08-24
---

**Regra.** A autoridade de trânsito **julga a consistência do auto de infração** antes de aplicar
qualquer penalidade. O AIT **será arquivado e seu registro julgado insubsistente** em duas
hipóteses legais e apenas nelas: (I) **se considerado inconsistente ou irregular**; (II) **se, no
prazo máximo de trinta dias, não for expedida a notificação da autuação**. O arquivamento da
hipótese (I) é **decisão vinculada**, não opção: constatada a inconsistência ou irregularidade, a
autoridade não pode "sanear" o auto para salvá-lo. Em consequência, o saneamento de [RN-TEAT-006]
só é legítimo no espaço que **antecede** o juízo do art. 281 §1º, I — correção de erro material
que **não afete elemento essencial** do auto (tipificação; local, data e hora; identificação do
veículo; identificação do autuador; forma de lavratura; enquadramento). Alterar qualquer desses é
lavrar auto novo, não corrigir o antigo — e auto novo em campo, não em gabinete.

**Base legal.**

- [REF-CTB-280-290] art. 281 _caput_: _"A autoridade de trânsito, na esfera da competência
  estabelecida neste Código e dentro de sua circunscrição, julgará a consistência do auto de
  infração e aplicará a penalidade cabível."_
- [REF-CTB-280-290] art. 281 §1º: _"O auto de infração será arquivado e seu registro julgado
  insubsistente: I - se considerado inconsistente ou irregular; II - se, no prazo máximo de trinta
  dias, não for expedida a notificação da autuação."_
- [REF-CONTRAN-918] art. 4º _caput_ e §1º: a NA é expedida _"após a verificação da regularidade e
  da consistência do AIT"_, no prazo de 30 dias do cometimento; _"A não expedição da NA no prazo
  previsto no caput ensejará o arquivamento do AIT."_
- [REF-CONTRAN-918] art. 4º §3º: _"A autoridade de trânsito poderá utilizar meios tecnológicos
  para verificação da regularidade e da consistência do AIT."_ — base legal expressa da validação
  automatizada do TEAT.
- [REF-CONTRAN-985-1003-MBFT] Seção 7 (materialidade e vedações — ver [RN-TEAT-102]).

**Verificação.** Fecha, **em parte**, o gap de base legal de [RN-TEAT-006]: a validação
automatizada tem fundamento expresso (art. 4º §3º) e o arquivamento tem hipóteses fechadas (art.
281 §1º). A fila de processamento do TEAT deve, portanto, produzir **três** desfechos juridicamente
distintos, nunca dois: **aceito**; **corrigido** (erro material, elemento não essencial,
`AitCorrection` com aprovação de `traffic-authority`); **arquivado/insubsistente** (inconsistência
ou irregularidade — decisão vinculada, ato da autoridade, registrado com fundamento no art. 281
§1º, I). "Rejeitado" no vocabulário atual de [WF-TEAT-001] deve ser mapeado ao terceiro desfecho e
carregar o fundamento legal, sob pena de o sistema produzir um estado sem correspondência
normativa. O prazo de 30 dias do inciso II **corre fora do TEAT** ([WF-INF-003], [RN-RAIT-115]),
mas o **relógio começa no cometimento**, registrado pelo TEAT — atraso de sincronização consome
prazo alheio.

**Controvérsia/risco — alto.** **Não existe norma federal que discipline o saneamento do AIT.**
Nem o CTB, nem a Res. 918/2022, nem a Portaria SENATRAN 997/2022, nem o MBFT tratam de correção
formal pós-lavratura: o CTB oferece apenas o par binário "consistente → penalidade" /
"inconsistente ou irregular → arquivamento". Toda a mecânica de `AitCorrection` é, hoje, **doutrina
operacional sem base normativa expressa** — e opera exatamente na zona cinzenta entre os dois
polos legais. Duas consequências: (a) a lista de campos "não essenciais" corrigíveis precisa ser
**decidida e formalizada pela autoridade de trânsito**, não inferida pelo produto; (b) qualquer
correção é atacável na defesa como saneamento de auto que deveria ter sido arquivado. Item 20 de
`_intake/legal-assessment.md`, entre os cinco riscos prioritários.
