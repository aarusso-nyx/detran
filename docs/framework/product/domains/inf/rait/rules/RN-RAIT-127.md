---
id: RN-RAIT-127
title: Descontos de 20% e de 40% — condições e a única hipótese em que pagar implica renunciar ao questionamento
status: reviewed
apps: [portal, rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-CONTRAN-931]
updated: 2026-08-26
---

**Regra.** Há **duas** faixas de desconto, com pressupostos e consequências diferentes:

| Faixa               | Valor a pagar             | Condições                                                                                                                                                                                                                                                 | Renúncia?                                                                                                            |
| ------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Desconto de 20%** | **80%** do valor original | Pagamento **até a data de vencimento** expressa na NP                                                                                                                                                                                                     | **Não.** O recolhimento não implica renúncia ao questionamento administrativo, que pode ser feito a qualquer momento |
| **Desconto de 40%** | **60%** do valor original | O infrator **declara pelo SNE** a opção por **não apresentar defesa prévia nem recurso**, reconhecendo o cometimento da infração; pagamento em **qualquer fase**, até o vencimento; **adesão ao SNE realizada antes do envio da notificação da autuação** | **Sim.** É a única hipótese em que o pagamento pressupõe abrir mão de defesa e recurso                               |

Fórmulas normativas: `valor original × 0,80` e `valor original × 0,60`.

**Base legal.**

- [REF-CTB-280-290] art. 284, _caput_ (80%) e §1º _(Redação dada pela Lei nº 14.599, de 2023)_ (60%).
- [REF-CTB-280-290] art. 284 §2º: _"O recolhimento do valor da multa não implica renúncia ao
  questionamento administrativo, que pode ser realizado a qualquer momento, **respeitado o disposto no
  § 1º**."_ — a ressalva final é o que torna a faixa de 40% excludente do direito de recorrer.
- [REF-CONTRAN-918] arts. 20 e 21 (fórmulas e condições).
- [REF-CONTRAN-931] art. 9º §1º, I e II (documentos de arrecadação com desconto de 40% e de 20%);
  §4º: _"O SNE não permitirá o parcelamento das multas de trânsito."_

**Nota de leitura — 40% ou 60%?** As normas usam duas convenções para a mesma coisa: a Res. 931/2022
fala em **desconto de 40%**, a Res. 918/2022 e o CTB falam em **pagar 60% do valor**. São idênticos.
O mesmo vale para 20% de desconto = pagar 80%. A UX deve fixar **uma** convenção e nunca alternar.

**Verificação.** O PORTAL calcula as faixas a partir de `valor_original`, `data_vencimento`,
`adesao_sne` e `declaracao_reconhecimento`, e exibe de forma inequívoca que optar pela faixa de 40%
**encerra** a possibilidade de defesa e recurso. Escolhida essa faixa, o RAIT bloqueia a abertura de
defesa/recurso para aquele AIT e registra o fundamento.

**Controvérsia/risco (ALTO — conflito vertical).** O **§6º do art. 284**, incluído pela Lei
14.599/2023, determina que o desconto do §1º _"será concedido ainda que o órgão responsável pela
aplicação da penalidade de multa não tiver aderido ao sistema de notificação eletrônica … desde que o
infrator tenha cumprido os requisitos nele descritos"_. Já [REF-CONTRAN-918] art. 21 e
[REF-CONTRAN-931] art. 9º §1º, I — ambos de **2022**, anteriores — estruturam o benefício em torno de
um documento de arrecadação **gerado e disponibilizado pelo SNE**, o que pressupõe órgão aderente.
Não foi localizada resolução CONTRAN pós-2023 harmonizando a matéria. Lei posterior prevalece sobre
resolução anterior, mas a operacionalização (emissão do documento de arrecadação com o desconto fora
do SNE) **não tem procedimento normatizado**. Ver `_intake/legal-assessment.md`, item 2.

**Decisão.** Owner, em steering (`_meta/steering.md` C.17, 2026-08-24), sem parecer jurídico
formal: **aplicar o desconto de 40% mesmo sem adesão do órgão ao SNE**, seguindo a lei mais
recente (CTB art. 284 §6º, pós-2023). ⚠️ O **procedimento operacional** para emitir o documento
de arrecadação com esse desconto fora do SNE continua **indefinido** — a decisão de política foi
tomada, mas falta desenhar o mecanismo técnico de emissão antes de implementar o cálculo. Ver
`_meta/steering.md` §"Pontos que a múltipla escolha não fechou".
