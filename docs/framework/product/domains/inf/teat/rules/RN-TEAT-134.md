---
id: RN-TEAT-134
title: Recusa ao procedimento de verificação é infração autônoma do art. 165-A — nunca mero metadado do teste
status: draft
apps: [teat]
sources: [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-432]
updated: 2026-08-24
---

**Regra.** Recusar-se a ser submetido a **teste, exame clínico, perícia ou outro procedimento** que
permita certificar influência de álcool ou substância psicoativa é, por si só, **infração de
trânsito autônoma — art. 165-A do CTB**, gravíssima, com multa (dez vezes), suspensão do direito de
dirigir por 12 meses e as medidas administrativas de **recolhimento do documento de habilitação e
retenção do veículo**; multa em dobro em caso de reincidência em até 12 meses. A recusa alcança
**qualquer** dos procedimentos do art. 277, não apenas o etilômetro. Consequência de sistema: na
recusa, o TEAT **produz um AIT por art. 165-A** — não registra "recusa" como atributo de um teste
que não houve. Se, além da recusa, houver sinais de alteração da capacidade psicomotora, incide
também o **crime do art. 306** ([RN-TEAT-137]).

**Base legal.**

- [REF-CTB-165-277-medidas-alcoolemia] art. 165-A: _"Recusar-se a ser submetido a teste, exame
  clínico, perícia ou outro procedimento que permita certificar influência de álcool ou outra
  substância psicoativa, na forma estabelecida pelo art. 277: Infração - gravíssima; Penalidade -
  multa (dez vezes) e suspensão do direito de dirigir por 12 (doze) meses; Medida administrativa -
  recolhimento do documento de habilitação e retenção do veículo, observado o disposto no § 4º do
  art. 270."_
- [REF-CTB-165-277-medidas-alcoolemia] art. 277 §3º: _"Serão aplicadas as penalidades e medidas
  administrativas estabelecidas no art. 165-A deste Código ao condutor que se recusar a se submeter
  a qualquer dos procedimentos previstos no caput deste artigo."_
- [REF-CONTRAN-432] art. 6º, parágrafo único: _"Serão aplicadas as penalidades e medidas
  administrativas previstas no art. 165 do CTB ao condutor que recusar a se submeter a qualquer um
  dos procedimentos previstos no art. 3º, sem prejuízo da incidência do crime previsto no art. 306
  do CTB caso o condutor apresente os sinais de alteração da capacidade psicomotora."_

**Verificação.** **Upgrade de fonte de [RN-TEAT-005]**, que registrava "(fonte pendente)" para a
recusa: a base existe e é o art. 165-A c/c art. 277 §3º. `AlcoholRefusal` deixa de ser um flag e
passa a ser **gatilho de lavratura**: registrada a recusa, o fluxo abre um AIT com enquadramento
165-A, com as duas medidas administrativas vinculadas ([RN-TEAT-129] e [RN-TEAT-124]). A distinção
frente à **impossibilidade técnica** do aparelho é jurídica, não semântica ([RN-TEAT-135]): a
impossibilidade **não gera** o 165-A — apenas obriga o uso de outro meio de prova do art. 277. A
interface deve tornar a escolha entre os dois inequívoca e não reversível por engano.

**Controvérsia/risco.** A Res. CONTRAN 432/2013 é **anterior** à Lei 13.281/2016, que criou o art.
165-A. Por isso seu art. 6º, parágrafo único ainda manda aplicar à recusa _"as penalidades e
medidas administrativas previstas no art. 165"_. **A remissão está desatualizada**: o art. 277 §3º,
com redação da mesma Lei 13.281/2016, determina expressamente a aplicação do **art. 165-A**.
Prevalece a lei posterior — e a consequência prática é relevante porque o enquadramento correto do
AIT muda (165-A, não 165). Nenhuma resolução CONTRAN posterior harmonizando o texto da 432/2013 foi
localizada. Item 36 de `_intake/legal-assessment.md`, entre os cinco riscos prioritários.
