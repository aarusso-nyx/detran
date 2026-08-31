---
id: RN-PEC-108
title: Ordem legal das etapas e prazo de doze meses do processo de habilitação — sequência administrativa, não bloqueio entre os dois exames clínicos
status: draft
apps: [pec, portal]
sources:
  [
    REF-CONTRAN-789-2020,
    REF-CTB-147-148-habilitacao,
    REF-CONTRAN-923-1009-toxicologico,
  ]
updated: 2026-08-24
---

**Regra.** A norma fixa uma **ordem** para as etapas do processo de habilitação e um **prazo de
vida** para o processo:

- **Ordem** (Res. 789/2020 art. 2º, § 1º): _Avaliação Psicológica → Exame de Aptidão Física e
  Mental → Curso Teórico-técnico → Exame Teórico-técnico → Curso de Prática de Direção → Exame de
  Prática de Direção_, **nesta ordem**. Para as categorias C/D/E, o **exame toxicológico antecede
  todas elas** ([RN-PEC-120]).
- **Prazo**: o processo do candidato **fica ativo por doze meses**, contados da data do
  requerimento.

**Leitura de trabalho adotada quanto à ordem.** O dispositivo governa a **sequência administrativa
do processo perante o órgão**, e **não impõe bloqueio técnico** de um exame clínico sobre o outro
dentro de um mesmo atendimento. Fundamento: a norma **lista** a sequência sem cominar nulidade,
sem prever guarda de estado e sem qualquer dispositivo que invalide exame realizado fora de ordem;
e o art. 2º, § 2º da mesma resolução admite **um único par de exames** servindo a dois pedidos
simultâneos (ACC + categoria B), o que pressupõe tratamento do par como unidade, não como
encadeamento. O modelo do PEC — um `encounter` com **até dois exames paralelos** — é, portanto,
**compatível**, e não precisa ser alterado.

**A recíproca não vale para o toxicológico**: ali a norma diz expressamente _"em etapa anterior
aos exames [...] previstos no art. 147"_, com verbo de dever — esse **é** bloqueio, e é o que
[RN-PEC-007]/[RN-PEC-120] modelam.

**Base legal.**

- [REF-CONTRAN-789-2020] art. 2º, § 1º: _"[...] o candidato deverá realizar Avaliação Psicológica,
  Exame de Aptidão Física e Mental, Curso Teórico-técnico, Exame Teórico-técnico, Curso de Prática
  de Direção Veicular e Exame de Prática de Direção Veicular, nesta ordem."_
- [REF-CONTRAN-789-2020] art. 2º, § 2º: _"O candidato poderá requerer simultaneamente a ACC e a
  habilitação na categoria B [...], submetendo-se a um único Exame de Aptidão Física e Mental e
  Avaliação Psicológica [...]"_.
- [REF-CONTRAN-789-2020] art. 2º, § 3º: _"O processo do candidato à habilitação ficará ativo no
  órgão [...] pelo prazo de doze meses, contados da data do requerimento do candidato."_
- [REF-CTB-147-148-habilitacao] art. 147, _caput_: _"[...] deverá submeter-se a exames realizados
  pelo órgão executivo de trânsito, **na ordem descrita a seguir** [...]"_ — a ordem tem, portanto,
  assento **legal**, não apenas resolutivo; mas a lista do art. 147 começa pelo exame de aptidão
  física e mental (inciso I) e **não menciona a avaliação psicológica como etapa numerada**, o que
  enfraquece a leitura de ordem estrita entre os dois exames clínicos.
- [REF-CONTRAN-923-1009-toxicologico] art. 10 (o único "antes de" com força de bloqueio).

**Verificação.**

1. **Nada a alterar em [WF-PEC-001] quanto à ordem** — a modelagem paralela dos dois exames fica
   confirmada, agora com fundamentação, e deixa de ser silêncio.
2. **Há algo a acrescentar quanto ao prazo.** Os **doze meses de vida do processo** são um timer
   real, ausente de todo o corpus: um `renach_process_key` vinculado a um `encounter` pode
   **expirar**, e o PEC não tem nenhum comportamento definido para isso. Candidato direto a linha
   nova na tabela de prazos de [WF-PEC-001] — este sim, ao contrário da validade do exame médico
   (ver [RN-PEC-102], onde a recomendação do dossiê estava errada).
3. **Ordem e agendamento.** Se o DETRAN-AM optar por observar a ordem estritamente, o efeito recai
   sobre [WF-PEC-003] (agendar psicológico antes de médico), não sobre o `encounter`. É decisão de
   produto disponível, não exigência apurada.

**Controvérsia/risco.** _Severidade: baixa-média._ A tensão é textual: o CTB art. 147 diz _"na
ordem descrita a seguir"_ e descreve uma lista em que a avaliação psicológica **não figura como
inciso**; a Res. 789/2020 descreve uma ordem em que ela figura **em primeiro lugar**. As duas
leituras não se contradizem frontalmente (a resolução detalha o processo administrativo, a lei
enumera os exames), mas nenhuma delas resolve se um exame médico realizado **antes** da avaliação
psicológica é inválido. Como não há cominação de nulidade em nenhum dos textos, adota-se a leitura
não invalidante — **rotulada como interpretação**. Item 13 de `_intake/legal-assessment.md`.
