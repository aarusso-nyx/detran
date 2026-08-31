---
id: RN-RAIT-114
title: Decadência do direito de aplicar a penalidade — 180 dias, ou 360 com defesa prévia tempestiva
status: approved
apps: [rait, teat, dashboard]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** O prazo para **expedição da notificação da penalidade** é de **180 dias contados do
cometimento da infração**; havendo **interposição de defesa prévia**, o prazo passa a **360 dias**. O
descumprimento implica **decadência do direito de aplicar a penalidade** — o órgão perde o direito
material, não apenas o prazo processual.

Para as penalidades do art. 256 diversas de advertência e multa, o prazo conta da **conclusão do
processo administrativo da penalidade que lhe der causa** (art. 282 §6º, II).

**Base legal.**

- [REF-CTB-280-290] art. 282 §6º _(Redação dada pela Lei nº 14.229, de 2021)_ e incisos I e II.
- [REF-CTB-280-290] art. 282 §6º-A: nas autuações **que não sejam em flagrante**, o prazo conta _"da
  data do conhecimento da infração pelo órgão de trânsito responsável pela aplicação da penalidade,
  na forma definida pelo Contran"_.
- [REF-CTB-280-290] art. 282 §7º: _"O descumprimento dos prazos previstos no § 6º deste artigo
  implicará a decadência do direito de aplicar a respectiva penalidade."_
- [REF-CONTRAN-918] art. 9º §2º (180 dias) e §3º (_"Em caso de apresentação da defesa prévia em tempo
  hábil, o prazo previsto no § 2º será de 360 (trezentos e sessenta) dias"_).

**Distinção conceitual obrigatória.** Decadência ≠ prescrição. A decadência do art. 282 §7º extingue
o **direito de aplicar** a penalidade e opera na fase **anterior** ao recurso; a prescrição de
[RN-RAIT-112] e [RN-RAIT-113] extingue a **pretensão punitiva** já constituída. O RAIT deve modelar
os desfechos como estados terminais **distintos**, com fundamentos e comunicações próprias — não
como sinônimos.

**Verificação.** O relógio de decadência é do TEAT/fase de defesa, mas o RAIT o **consome**: ao
receber a defesa, o sistema estende o teto de 180 para 360 dias e expõe `dias_restantes_decadencia`
ao julgador da defesa ([RN-RAIT-115]). Decisão de defesa proferida após a decadência não pode gerar
NP válida.

**Controvérsia/risco.** O §6º-A remete a "forma definida pelo Contran" para o termo inicial nas
autuações **não flagranciais** — que são a maior parte do volume em fiscalização eletrônica. Essa
regulamentação **não foi localizada** no corpus; a Res. 918/2022 não a supre expressamente (seu art.
9º §2º repete o marco "data do cometimento"). `_intake/legal-assessment.md`, item 11.

**Decisão.** Owner, em steering (`_meta/steering.md` C.18, 2026-08-24), sem parecer jurídico
formal: usar **"data do cometimento"** (Res. 918 art. 9º §2º) como marco também para as
autuações não flagranciais, enquanto a regulamentação específica do CONTRAN não é localizada.
Risco residual permanece — afeta a maior fatia do volume de autuações.
