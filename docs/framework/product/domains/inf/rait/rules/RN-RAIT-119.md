---
id: RN-RAIT-119
title: Encerramento da instância administrativa — três hipóteses taxativas e seus efeitos represados
status: reviewed
apps: [rait, portal, dashboard]
sources: [REF-CTB-280-290, REF-LEI-9784-1999]
updated: 2026-08-26
---

**Regra.** A instância administrativa de julgamento de infrações e penalidades encerra-se em **três
hipóteses, e apenas nelas**:

| #   | Hipótese                                                                                                                                                             | Fonte         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| I   | O **julgamento do recurso** de 2ª instância (arts. 288 e 289)                                                                                                        | art. 290, I   |
| II  | A **não interposição do recurso no prazo legal**                                                                                                                     | art. 290, II  |
| III | O **pagamento da multa com reconhecimento da infração e requerimento de encerramento** do processo na fase em que se encontra, sem apresentação de defesa ou recurso | art. 290, III |

O encerramento é o **gatilho único** de todos os efeitos represados durante o processo: incidência de
juros ([RN-RAIT-128]), possibilidade de restrição a licenciamento e transferência (cessa a proteção
de [RN-RAIT-108]) e cadastro da penalidade no RENACH com a pontuação ([RN-RAIT-131]).

**Base legal.** [REF-CTB-280-290] art. 290, _caput_ e incisos I a III _(Redação e inclusões pela Lei
nº 13.281, de 2016)_, e parágrafo único.

**Verificação.** `estado_instancia` é um campo de primeira classe do processo, com exatamente um dos
valores `ABERTA` / `ENCERRADA(motivo)`. Nenhum efeito financeiro ou de pontuação é derivado de estado
de recurso: todos derivam de `estado_instancia`. O motivo do encerramento é persistido e comunicado.

**Correção de leitura — "irrecorrível" não está no texto.** O art. 290 **não declara** a decisão do
CETRAN irrecorrível; declara que a **instância administrativa se encerra**. Consequências corretas:

- Não há 3ª instância recursal ordinária — coerente com [REF-LEI-9784-1999] art. 57 (máximo de três
  instâncias "salvo disposição legal diversa"; o CTB estrutura duas) e art. 63, IV (não conhecimento
  de recurso interposto "após exaurida a esfera administrativa").
- Encerramento **não** é imutabilidade absoluta: [REF-LEI-9784-1999] art. 65 admite **revisão a
  qualquer tempo**, de ofício ou a pedido, de processos de que resultem sanções, quando surgirem
  fatos novos ou circunstâncias relevantes, **vedado o agravamento da sanção**. Trata-se de aplicação
  **subsidiária** (art. 69) e, portanto, de construção interpretativa — não de texto do CTB.

**Controvérsia/risco.** Um canal de "revisão" pós-encerramento com base no art. 65 da Lei
9.784/1999 é fundamento subsidiário, sem previsão no CTB, e criaria uma fila operacional sem
prazo legal definido. `_intake/legal-assessment.md`, item 6.

**Decisão.** Owner, em steering (`_meta/steering.md` C.22, 2026-08-24), sem parecer jurídico
formal: **não oferecer** canal de revisão pós-encerramento — a decisão do CETRAN é tratada como
definitiva. O RAIT não modela `estado_instancia=ENCERRADA` como reabrível.
