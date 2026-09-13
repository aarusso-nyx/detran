---
id: RN-RAIT-142
title: Suplência, substituição e perda de mandato na formação da banca
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-12
---

**Regra.** A banca de cada sessão é formada por titulares e, na ausência ou impedimento destes,
por **suplentes**; a sessão só abre com **maioria simples dos integrantes** e com o **presidente ou
seu suplente** (JARI) e, no CETRAN, observada a **paridade de representação**. O presidente da JARI
pode ser qualquer integrante, designado pela autoridade competente; o regimento do CETRAN deve
prever a substituição do presidente. Faltas injustificadas contam para a **perda do mandato**
(três consecutivas ou quatro intercaladas) e o membro perde o direito a receber distribuição
enquanto `AFASTADO_TEMP` ou `MANDATO_ENCERRADO`.

**Base legal.**

- [REF-CONTRAN-357] itens 4.1.b.2 (presidência), 4.1.b.3 (suplência facultada), 7.1 (mandato de 1 a
  2 anos), 7.3 (perda do mandato por faltas), 8.2 (quorum com presidente ou suplente).
- [REF-CONTRAN-901-2022] Anexo 5.1 (membros com respectivos suplentes), 6.3 (substituição do
  presidente), 8 (mandato de dois anos) e 12.2 (maioria simples, observada a paridade).

**Verificação.** A banca prevista de cada sessão inclui o suplente de plantão ([WF-RAIT-004] §3);
a confirmação de presenças verifica quorum, presença do presidente/suplente e, no CETRAN, a
paridade dos três blocos; falta injustificada incrementa `unjustified_absence_count` e, atingido o
limite do item 7.3, o membro passa a `AFASTADO_TEMP` com reatribuição em lote ([UC-RAIT-011]). Um
suplente só recebe lote de sorteio quando o titular está `AUSENTE_PROGRAMADO` além do prazo do
lote ou afastado.

**Controvérsia/risco.** Regimento local não localizado (DT-060): critérios de convocação de
suplentes, ordem entre suplentes e antecedência são desenho de fato (steering A.4).
