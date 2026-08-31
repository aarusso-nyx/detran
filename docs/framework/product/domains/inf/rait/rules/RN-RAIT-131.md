---
id: RN-RAIT-131
title: Registro no RENACH e pontuação somente depois de esgotados os recursos
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** **Somente depois de esgotados os recursos** de 1ª e de 2ª instância as penalidades
aplicadas podem ser **cadastradas no RENACH**. Enquanto o processo estiver pendente, não há registro
no prontuário e, portanto, **não há pontuação** nem qualquer efeito dela derivado (por exemplo,
processo de suspensão do direito de dirigir por acúmulo de pontos).

Regra correlata: a **advertência por escrito** também só é registrada no prontuário do infrator
**depois de encerrada** a instância administrativa de julgamento, e sua aplicação **não implica
registro de pontuação**.

**Base legal.**

- [REF-CONTRAN-918] art. 18: _"Somente depois de esgotados os recursos de que tratam os arts. 15 e
  16, as penalidades aplicadas poderão ser cadastradas no RENACH."_
- [REF-CTB-280-290] art. 290, parágrafo único: _"Esgotados os recursos, as penalidades aplicadas nos
  termos deste Código serão cadastradas no RENACH."_
- [REF-CONTRAN-918] art. 10 §1º (advertência registrada no prontuário só após encerrada a instância) e
  §4º (advertência não implica pontuação).
- [REF-CONTRAN-918] art. 11 §3º: para análise de reincidência, considera-se **apenas** a infração
  cuja instância administrativa já foi encerrada.

**Verificação.** A integração com o RENACH é disparada **exclusivamente** pelo evento de encerramento
da instância ([RN-RAIT-119]), nunca pela aplicação da penalidade nem pela decisão de uma instância
isolada. O PORTAL exibe explicitamente, durante o processo, que a infração **não pontua** enquanto
pendente de julgamento — informação que reduz o principal medo do cidadão e evita atendimento
desnecessário.

**Coerência.** Esta regra é a face de prontuário do efeito suspensivo de [RN-RAIT-108] e compartilha
com [RN-RAIT-128] o mesmo gatilho único: `estado_instancia = ENCERRADA`.
