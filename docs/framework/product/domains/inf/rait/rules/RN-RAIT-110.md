---
id: RN-RAIT-110
title: Teto legal de julgamento em 1ª instância — 24 meses do recebimento pela JARI
status: draft
apps: [rait, dashboard]
sources: [REF-CTB-280-290, REF-LEI-9784-1999, REF-DETRANAM-SERVICOS]
updated: 2026-08-24
---

**Regra.** O recurso de 1ª instância **deve ser julgado no prazo de 24 meses, contado do recebimento
do recurso pelo órgão julgador (a JARI)**. Não é um SLA de atendimento: é o **teto legal** cuja
violação dispara a prescrição da pretensão punitiva ([RN-RAIT-112]).

**Base legal.** [REF-CTB-280-290] art. 285 §6º _(Incluído pela Lei nº 14.229, de 2021)_: _"O recurso
de que trata o caput deste artigo deverá ser julgado no prazo de 24 (vinte e quatro) meses, contado
do recebimento do recurso pelo órgão julgador."_

**Verificação.** `prazo_teto_jari = data_recebimento_jari + 24 meses`, contados de data a data
([REF-LEI-9784-1999] art. 66 §3º, subsidiário, para prazos em meses). O campo `data_recebimento_jari`
é o registrado no evento de remessa de [RN-RAIT-107] — **jamais** a data de interposição, que é
anterior e produziria um teto artificialmente curto. O dashboard expõe `dias_restantes_ate_teto` e a
distribuição do acervo por faixa de risco.

**Distinção obrigatória na comunicação.** O SLA operacional anunciado pelo DETRAN-AM (30 dias úteis
para a JARI, [REF-DETRANAM-SERVICOS]) é **meta interna**, compatível com o teto e muitíssimo abaixo
dele. Os dois números convivem, mas nunca devem ser apresentados ao cidadão como se fossem a mesma
coisa: "prazo esperado" ≠ "teto legal".

**Controvérsia/risco.** A carta de serviço do DETRAN-AM e o [WF-RAIT-001] atribuíam o prazo de
julgamento ao **art. 285 §3º do CTB**, dispositivo **revogado pela Lei 14.229/2021**. A citação
correta é o §6º. Correção registrada em [REF-CTB-280-290] e em `_intake/legal-assessment.md`,
item 1.
