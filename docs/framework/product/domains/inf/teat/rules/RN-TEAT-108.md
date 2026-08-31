---
id: RN-TEAT-108
title: Constatação sem abordagem é classificação do enquadramento (Casos 1/2/3), não motivo de texto livre
status: draft
apps: [teat]
sources: [REF-CONTRAN-985-1003-MBFT, REF-SENATRAN-997, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O agente deve, **sempre que possível**, abordar o condutor para constatar a infração.
A dispensa da abordagem não é discricionária nem justificada caso a caso: é **determinada pelo
enquadramento**, segundo três classes fixadas pelo MBFT ficha a ficha —

- **Caso 1 — "possível sem abordagem":** a infração pode ser constatada sem abordagem e **é
  desnecessária justificativa no AIT** quanto ao motivo de não ter abordado;
- **Caso 2 — "mediante abordagem":** a infração **só** pode ser constatada com abordagem;
- **Caso 3 — "vide procedimentos":** há situações em que só cabe com abordagem e outras em que
  cabe sem — **é a única classe que exige justificativa condicional**.

Em consequência, o atributo `allows_no_approach` do `Framing` **não é booleano**: é um enumerado
de três valores, e `no_approach_reason` **não é campo de texto livre de preenchimento geral** —
só é exigível no Caso 3. Regra distinta e cumulativa: **não sendo possível a autuação em
flagrante**, o agente relata o fato à autoridade no próprio auto, informando os dados do veículo
além dos incisos I, II e III do art. 280.

**Base legal.**

- [REF-CONTRAN-985-1003-MBFT] Seção 7: _"O agente da autoridade de trânsito, sempre que possível,
  deverá abordar o condutor do veículo para constatar a infração, ressalvados os casos em que a
  infração poderá ser comprovada sem a abordagem. […] Caso 1: 'possível sem abordagem' - significa
  que a infração pode ser constatada sem a abordagem do condutor, sendo desnecessária a
  justificativa no AIT quanto ao motivo de não ter sido abordado. Caso 2: 'mediante abordagem' –
  significa que a infração só pode ser constatada se houver a abordagem do condutor. Caso 3: 'vide
  procedimentos' – significa que há situações em que só é possível constatar a infração mediante
  abordagem, porém há outras situações em que é possível constatá-la sem abordagem."_
- [REF-CONTRAN-985-1003-MBFT] Seção 7: _"considera-se em flagrante quem está cometendo a infração
  de trânsito ou acaba de cometê-la, **com ou sem abordagem**"_ — logo, **sem abordagem ≠ sem
  flagrante**.
- [REF-CTB-280-290] art. 280 §3º: _"Não sendo possível a autuação em flagrante, o agente de
  trânsito relatará o fato à autoridade no próprio auto de infração, informando os dados a
  respeito do veículo, além dos constantes nos incisos I, II e III, para o procedimento previsto
  no artigo seguinte."_
- [REF-SENATRAN-997] Anexo I, h): o talão eletrônico _"deverá permitir o registro de AIT com
  abordagem e sem abordagem ao condutor ou infrator."_

**Verificação.** `Framing.approach_class` ∈ {POSSIVEL_SEM_ABORDAGEM, MEDIANTE_ABORDAGEM,
VIDE_PROCEDIMENTOS}, dado normativo importado das fichas do MBFT e versionado no pacote normativo
([WF-TEAT-003]). A UI deriva o comportamento: Caso 1 não pergunta nada; Caso 2 **bloqueia** a
finalização sem registro de abordagem; Caso 3 exige justificativa **apenas** se o agente indicar
que não houve abordagem. Separadamente, o campo `relato_ausencia_flagrante` (art. 280 §3º) é
exigido quando o agente marcar que a autuação não é em flagrante — condição **independente** da
abordagem, dada a definição do MBFT.

**Controvérsia/risco.** Duas confusões estruturais que o corpus TEAT anterior carregava e que esta
regra corrige: (1) **abordagem ≠ flagrante** — o MBFT é explícito, e tratá-los como sinônimos
produziria exigência indevida do relato do §3º em toda constatação remota; (2) `no_approach_reason`
como texto livre universal força o agente a redigir justificativa que a norma **expressamente
dispensa** no Caso 1, criando passivo argumentativo gratuito na defesa. Ver Handoff UX do
`_intake/research-dossier.md`, item 1.
