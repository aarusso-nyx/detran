---
id: RN-RAIT-107
title: Remessa do recurso tempestivo à JARI em 10 dias da interposição
status: draft
apps: [rait]
sources: [REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** Recebido recurso **tempestivo** contra a penalidade, a autoridade que a impôs deve
remetê-lo à JARI **no prazo de 10 dias, contado da data de sua interposição**. Este é um prazo do
**órgão**, não do administrado, e é a primeira etapa cronometrada do circuito recursal interno.

**Base legal.** [REF-CTB-280-290] art. 285 §2º _(Redação dada pela Lei nº 14.229, de 2021)_:
_"Recebido o recurso tempestivo, a autoridade o remeterá à Jari, no prazo de 10 (dez) dias, contado
da data de sua interposição."_

**Verificação.** Estado `AGUARDANDO_REMESSA_JARI` no [WF-RAIT-001], com timer de 10 dias corridos
([RN-RAIT-005]) a partir de `data_interposicao`. O evento de remessa registra `data_recebimento_jari`
como campo **próprio e distinto**, porque é ele — e não a interposição — que inicia o teto de 24
meses de [RN-RAIT-110] e o relógio de prescrição de [RN-RAIT-112].

**Controvérsia/risco.** A lei **não comina sanção** ao descumprimento do prazo de 10 dias. Como o
teto de 24 meses conta do _recebimento pelo órgão julgador_, atraso na remessa **empurra para a
frente** o início do relógio de prescrição em vez de agravar a posição do órgão — resultado
sistemicamente perverso, que só se corrige por controle interno. O RAIT deve tratar a violação do
prazo de 10 dias como **indicador de gestão de alta severidade** e expor `dias_ate_remessa` no
dashboard, ainda que sem efeito jurídico direto. `_intake/legal-assessment.md`, item 4.
