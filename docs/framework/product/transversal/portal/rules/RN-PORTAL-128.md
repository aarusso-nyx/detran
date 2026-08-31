---
id: RN-PORTAL-128
title: Faixas de desconto no PORTAL — a de 40% é a única em que pagar encerra defesa e recurso, e exige advertência inequívoca antes da confirmação
status: draft
apps: [portal, rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-CONTRAN-931, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** O regime de descontos está integralmente descrito em [RN-RAIT-127] e não é repetido aqui.
Esta regra fixa o **delta do PORTAL**: como as faixas são apresentadas ao cidadão, e o que precisa
acontecer antes de ele optar pela faixa que extingue o seu direito de recorrer.

| Faixa               | Paga            | Condições                                                                                                                                                                                            | Efeito sobre defesa/recurso                                                          |
| ------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Sem desconto        | 100% + encargos | Após o vencimento                                                                                                                                                                                    | Nenhum                                                                               |
| **Desconto de 20%** | **80%**         | Pagamento até a data de vencimento da NP                                                                                                                                                             | **Nenhum** — pode questionar a qualquer momento                                      |
| **Desconto de 40%** | **60%**         | Declaração, pelo SNE, de opção por **não** apresentar defesa nem recurso, reconhecendo o cometimento da infração; adesão ao SNE anterior ao envio da NA; pagamento em qualquer fase até o vencimento | **Extingue** — é a única hipótese em que pagar implica abrir mão de defesa e recurso |

Cinco deveres de apresentação:

1. **Exibir sempre as duas faixas lado a lado** quando ambas couberem, com o valor calculado de cada
   uma — nunca esconder a faixa de 80% atrás de um clique extra. Ocultá-la faz parecer que o desconto
   só existe pela via que custa o recurso.
2. **Nomear a renúncia pelo que ela é.** O rótulo da ação da faixa de 40% descreve a consequência
   ("pagar 60% e abrir mão de defesa e recurso"), não apenas o benefício ("pagar com 40% de
   desconto"). O rótulo da outra é explícito no sentido inverso ("pagar 80% e manter o direito de
   recorrer").
3. **Confirmação em duas etapas para a faixa de 40%**, com o texto da renúncia visível na etapa de
   confirmação e o registro de qual versão foi exibida — é consentimento informado sobre extinção de
   direito, e a prova disso é do órgão.
4. **Fixar uma convenção de percentual e nunca alternar.** As normas usam duas: a Res. 931/2022 fala
   em _desconto de 40%_; a Res. 918/2022 e o CTB falam em _pagar 60%_. São idênticos. Alternar leva o
   cidadão a ler "60%" como desconto.
5. **Bloquear a abertura de defesa/recurso** para o AIT após a opção pela faixa de 40%, registrando o
   fundamento — e informar isso na tela **antes**, não ao tentar recorrer depois.

**Base legal.**

- [REF-CTB-280-290] art. 284, _caput_ (80%) e § 1º _(Redação dada pela Lei nº 14.599, de 2023)_ (60%).
- [REF-CTB-280-290] art. 284, § 2º: _"O recolhimento do valor da multa não implica renúncia ao
  questionamento administrativo, que pode ser realizado a qualquer momento, **respeitado o disposto no
  § 1º**"_ — a ressalva final é o que torna a faixa de 40% excludente do direito de recorrer.
- [REF-CONTRAN-918] arts. 20 e 21: fórmulas `valor original × 0,80` e `valor original × 0,60`, e a
  condição de opção pelo recebimento da NP pelo SNE com renúncia a defesa e recurso.
- [REF-CONTRAN-931] art. 9º, § 1º, I e II: documentos de arrecadação com desconto de quarenta e de
  vinte por cento, este último _"facultada ao infrator a possibilidade de apresentar defesa ou
  recurso"_.
- [REF-LEI-13460-2017] art. 5º, XIV: linguagem simples — pressuposto para que a renúncia seja
  informada, e não apenas formalmente declarada.

**Verificação.** (a) Toda tela de pagamento em que ambas as faixas caibam exibe as duas, com valores
calculados. (b) A opção pela faixa de 40% registra `declaracao_reconhecimento`, `versao_texto_exibido`
e `confirmado_em`, e o RAIT bloqueia a abertura de defesa/recurso para aquele AIT com o fundamento
registrado ([RN-RAIT-127]). (c) Teste de conteúdo: nenhuma tela alterna entre as convenções 40/60 e
20/80. (d) A tela de adesão ao SNE não oferece a faixa de 40% no mesmo passo ([RN-PORTAL-123]) — são
decisões separadas.

**Controvérsia/risco (ALTO — herdado, e agora com consequência de produto).** O **§ 6º do art. 284**,
incluído pela Lei 14.599/2023, determina que o desconto do § 1º _"será concedido ainda que o órgão
responsável pela aplicação da penalidade de multa não tiver aderido ao sistema de notificação
eletrônica [...] desde que o infrator tenha cumprido os requisitos nele descritos"_. Já a
[REF-CONTRAN-918] art. 21 e a [REF-CONTRAN-931] art. 9º, § 1º, I — ambas de 2022, anteriores —
estruturam o benefício em torno de documento de arrecadação **gerado e disponibilizado pelo SNE**.
Lei posterior prevalece sobre resolução anterior, e o Owner decidiu (`_meta/steering.md` C.17,
2026-08-24, sem parecer jurídico formal) **aplicar o desconto mesmo sem adesão do órgão ao SNE**.

O que muda aqui, e que o registro anterior não explicitava: o **procedimento operacional** para emitir
o documento de arrecadação com esse desconto fora do SNE **continua indefinido**, e é o PORTAL que
teria de emiti-lo. Enquanto não houver desenho desse mecanismo, a decisão de política não é
implementável — e há um problema adicional de **prova**: fora do SNE, não existe o campo normativo em
que o infrator "declara" a opção por não recorrer (Res. 918 art. 21). A declaração teria de ser
colhida pelo próprio PORTAL, com valor jurídico não normatizado. Como se trata de renúncia a direito
de defesa, essa fragilidade probatória é o risco mais sério do módulo de pagamento. Ver
`_meta/steering.md` §"Pontos que a múltipla escolha não fechou" e `_intake/legal-assessment.md`.
