---
id: RN-TEAT-107
title: AIT vale como Notificação da Autuação apenas sob três condições cumulativas
status: draft
apps: [teat, rait, portal]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O AIT lavrado em campo **substitui a Notificação da Autuação** — dispensando a
expedição posterior da NA e iniciando desde logo o prazo de defesa — somente quando **todas** as
condições ocorrerem: (a) o AIT é **assinado pelo condutor**; (b) esse condutor **é o proprietário
do veículo ou o principal condutor previamente identificado**; e (c) do AIT **consta a data do
término do prazo para apresentação da defesa da autuação**. Faltando qualquer uma, o AIT é apenas
AIT e a NA deverá ser expedida no prazo do art. 4º da Res. 918/2022. A condição (c) é a única sob
controle integral do TEAT e é, na prática, a que mais falha: um AIT assinado pelo
condutor-proprietário **sem data-limite impressa não vale como NA** e não faz correr prazo algum.

**Base legal.**

- [REF-CONTRAN-918] art. 3º §5º: _"O AIT valerá como NA quando for assinado pelo condutor e este
  for o proprietário do veículo ou o principal condutor previamente identificado, desde que conste
  a data do término do prazo para a apresentação da defesa da autuação, nos termos do art. 281-A
  do CTB."_
- [REF-CTB-280-290] art. 281-A: _"Na notificação de autuação e no auto de infração, quando valer
  como notificação de autuação, deverá constar o prazo para apresentação de defesa prévia, que
  não será inferior a 30 (trinta) dias, contado da data de expedição da notificação."_
- [REF-CONTRAN-918] art. 4º _caput_ (a expedição da NA é ressalvada _"com exceção do disposto no
  § 5º do art. 3º"_) e art. 280, VI do CTB (a assinatura do infrator _"vale como notificação do
  cometimento da infração"_).

**Verificação.** O TEAT calcula e imprime `data_limite_defesa` **sempre que** as condições (a) e
(b) forem verificadas em campo, usando o piso de 30 dias de [RN-RAIT-101] sobre a data da
lavratura. Verificar (b) exige consulta ao vínculo de propriedade/principal condutor (RENAVAM) —
**indisponível offline**. Regra operacional derivada: quando o vínculo não puder ser confirmado
no ato, o AIT **não** é emitido como NA; o campo `vale_como_na` permanece falso e a retaguarda
expede a NA normalmente. Emitir com data-limite baseada em vínculo presumido é o pior desfecho
possível — cria aparência de ciência sem base legal.

**Controvérsia/risco.** A assinatura do art. 280, VI do CTB vale como notificação do **cometimento
da infração**; a do art. 3º §5º da Res. 918 vale como **NA** (ato que abre o prazo de defesa). Não
são a mesma coisa e a resolução acrescenta requisitos que a lei não traz. Adotamos o regime mais
exigente (o da resolução) porque é o que produz efeito processual oponível ao administrado. Ver
[RN-RAIT-104] para o tratamento do marco de ciência no lado do RAIT.
