---
id: RN-DASH-173
title: Dever de publicidade da relação de medidores de velocidade — obrigação contínua, verificável de fora, hoje não monitorada
status: draft
apps: [dashboard, teat]
sources: [REF-CONTRAN-798-804-equipamentos, REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** O órgão deve **dar publicidade, em seu site, ANTES do início da operação**, da relação de
**todos os medidores de velocidade** existentes em sua circunscrição, contendo, por equipamento:
**tipo**, **número de série** e **identificação estabelecida pelo órgão** — e, nos do tipo **fixo**,
também o **local de instalação**.

É um dever de **publicidade prévia e contínua**, não um relatório periódico: a relação tem de estar
correta no instante em que qualquer medidor entra em operação. Um equipamento que começa a operar
antes de constar da relação publicada está em operação irregular desde o primeiro registro.

**Base legal.** [REF-CONTRAN-798-804-equipamentos] — Res. CONTRAN 798/2020 art. 9º, na redação
vigente; correlato ao regime de lavratura por medidor de [REF-CONTRAN-918] art. 3º §1º.

**Por que é do DASHBOARD e não do TEAT.** É dever **institucional do órgão**, não ato de campo — o
TEAT lavra com o equipamento ([UC-TEAT-013], [RN-TEAT-138]), mas não publica nada. A metade de
[RN-TEAT-139] que trata da **imagem com a placa** é do ato e fica no TEAT; a metade que trata da
**publicidade da relação** é deste indicador. Ver `inf/teat/APP.md` §Fronteira.

**Natureza da vigilância.** Diferente das cinco famílias de [RN-DASH-134], que vigiam **validade que
caduca**, este é um dever de **transparência ativa** cuja quebra é verificável **de fora** — por
qualquer cidadão, jornalista ou órgão de controle, a qualquer momento, comparando a relação
publicada com a operação real. Isso o torna um dos poucos indicadores do catálogo cujo
descumprimento **não depende de auditoria interna para ser descoberto**, e portanto de risco
reputacional imediato.

**Indicador.** Tipo `dever` ([WF-DASH-002]), sem data-limite de calendário: a janela abre quando um
medidor é cadastrado ou tem seu local alterado, e o dever está cumprido quando a relação publicada
reflete o parque em operação. O estado `NAO_CUMPRIDO` deve nomear **quais** equipamentos estão
operando fora da relação, não apenas sinalizar divergência.

**Verificação.** Cruzar o cadastro de medidores vinculado às operações do TEAT com a relação
efetivamente publicada no site do órgão. Divergência em qualquer direção é achado: equipamento em
operação e ausente da relação (irregularidade que contamina os autos do período), e equipamento na
relação e inexistente na operação (informação pública incorreta).

**Pendência do Owner.** O parque de medidores do DETRAN-AM não foi levantado nesta rodada — não se
sabe hoje se a relação existe publicada, nem se há medidores fixos na circunscrição. Enquanto o
inciso III estiver fora do portfólio (`inf/teat/APP.md` §Fronteira), o dever continua sendo do órgão
e o DASHBOARD continua sendo o lugar onde ele é vigiado.
