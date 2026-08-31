---
id: RN-TEAT-116
title: Impressão do AIT — duas vias em tempo real, reimpressão garantida no dia e legibilidade por dois anos
status: draft
apps: [teat]
sources: [REF-SENATRAN-997, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** O talão eletrônico deve permitir a **impressão do AIT em duas vias, em tempo real, no
ato da lavratura**, de modo que **uma via possa ser entregue ao infrator, caso esteja presente**.
O AIT deve permanecer armazenado no equipamento **no mínimo durante o dia da lavratura**, para
viabilizar **reimpressão** em momento diverso do da autuação, na quantidade de vias necessária. O
**papel** deve manter as informações legíveis por **no mínimo 2 anos**, com comprovação em
documentação do fabricante. O AIT impresso deve possuir **campo para assinatura do infrator** e
conter **aviso de que é obrigatória a presença do código RENAINF nas notificações, sob pena de
invalidade da multa**. A impressão é **comprovante**, não condição de existência do ato digital
válido.

**Base legal.** [REF-SENATRAN-997] art. 3º, IV e Anexo III:

> art. 3º "IV - permitir a impressão do AIT em duas vias;"
>
> Anexo III "a) Deverá permitir a impressão do AIT em duas vias, em tempo real, no ato da sua
> lavratura, de forma que uma das vias possa entregue ao infrator, caso esteja presente." ·
> "b) O AIT deverá permanecer armazenado no equipamento, no mínimo, durante o dia da lavratura do
> AIT, de modo a viabilizar sua reimpressão por meio do equipamento, conforme quantidade de vias
> necessárias, em momento diverso do da autuação;" · "d) A qualidade do papel utilizado na
> impressão do AIT deverá permitir que as informações impressas permaneçam legíveis por no mínimo
> 2 (dois) anos, sendo essa comprovação indicada em documentação do fabricante do papel;" ·
> "f) O AIT impresso deverá possuir campo para a assinatura do infrator; e" · "g) O AIT impresso
> deverá conter aviso que é obrigatória a presença do código RENAINF nas notificações, sob pena de
> invalidade da multa."

Ver [REF-CONTRAN-918] art. 3º §2º (impressão "sempre que possível") e [RN-TEAT-105] (regime de
assinatura do agente conforme o momento da impressão).

**Verificação.** Confirma [RN-TEAT-004] com fonte específica e acrescenta um **piso legal de
retenção local**: o ato deve permanecer no equipamento **pelo menos até o fim do dia da
lavratura**, ainda que já transmitido — o que impede política de expurgo imediato pós-sincronismo
e interage com o remote wipe do runtime móvel (o wipe não pode apagar AIT do próprio dia sem
comprometer a alínea b). Falha de impressão gera evento e reimpressão controlada, **nunca**
duplicação do ato ([RN-TEAT-113]: o número não se refaz). O aviso RENAINF e o campo de assinatura
do infrator são elementos do **modelo de documento**, versionados no `NormativeCatalog`
([WF-TEAT-003]), não literais de código.

**Controvérsia/risco.** A exigência de legibilidade por 2 anos com comprovação do fabricante do
papel é **requisito de suprimento**, não de software — mas é verificada na homologação
([RN-TEAT-117]). Se o órgão trocar de papel/insumo sem essa comprovação, a conformidade do
conjunto cai, ainda que o software esteja intacto. Item de governança de contrato, registrado em
`_intake/legal-assessment.md`, item 15.
