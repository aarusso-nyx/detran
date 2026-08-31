---
id: RN-PEC-103
title: A avaliação psicológica não é exigida em toda renovação — hipóteses, validade reduzida e prazo de dois dias úteis para o resultado
status: draft
apps: [pec, portal]
sources:
  [REF-CTB-147-148-habilitacao, REF-CONTRAN-927-2022, REF-CONTRAN-789-2020]
updated: 2026-08-24
---

**Regra.** A avaliação psicológica tem **hipóteses de exigência próprias e mais estreitas** que as
do exame médico. É exigida:

- na **obtenção** da ACC e da CNH (primeira habilitação);
- na **renovação**, **apenas** se o condutor exercer atividade remunerada ao veículo — para o qual
  ela é _preliminar e complementar_, sempre;
- na **substituição** de documento de habilitação obtido no exterior;
- **por solicitação do próprio perito examinador médico**, em qualquer caso.

Fora dessas hipóteses — notadamente na renovação de condutor **não** remunerado — a avaliação
psicológica **não é devida**, e um `encounter` sem trilha psicológica é o estado legalmente
correto, não um episódio incompleto.

Dois prazos próprios da trilha psicológica:

- **Disponibilização do resultado: dois dias úteis** ([REF-CONTRAN-927-2022] art. 9º, § 3º) — o
  único prazo numérico de produção de resultado em todo o corpus normativo do PEC; não há
  equivalente para o exame médico.
- **Validade diminuída**: quando o candidato apresentar distúrbios ou comprometimentos
  psicológicos temporariamente sob controle, é considerado **apto com prazo de validade reduzido**,
  que **constará da planilha RENACH** (art. 9º, § 2º).

**Base legal.**

- [REF-CTB-147-148-habilitacao] art. 147, § 3º: _"O exame previsto no § 2º incluirá avaliação
  psicológica preliminar e complementar sempre que a ele se submeter o condutor que exerce
  atividade remunerada ao veículo, incluindo-se esta avaliação para os demais candidatos apenas no
  exame referente à primeira habilitação."_
- [REF-CONTRAN-789-2020] art. 5º, § 2º: _"A Avaliação Psicológica será exigida nos seguintes casos:
  I - obtenção da ACC e da CNH; II - renovação [...], se o condutor exercer atividade de transporte
  remunerado [...]; III - substituição do documento de habilitação obtido em país estrangeiro; e
  IV - por solicitação do perito examinador."_
- [REF-CONTRAN-927-2022] art. 9º, § 2º: _"Quando apresentar distúrbios ou comprometimentos
  psicológicos que estejam temporariamente sob controle, o candidato será considerado apto, com
  diminuição do prazo de validade da avaliação, que constará na planilha RENACH."_
- [REF-CONTRAN-927-2022] art. 9º, § 3º: _"O resultado da avaliação psicológica deverá ser
  disponibilizado pelo psicólogo no prazo de dois dias úteis."_

**Verificação.**

1. **Corrige um gate.** [RN-PEC-006] exige, para encerrar o episódio, que _"exame médico e exame
   psicológico foram realizados"_ — condição **impossível de satisfazer legalmente** na renovação de
   condutor não remunerado, onde o psicológico não é devido. O gate precisa ser condicional às
   hipóteses acima, e a fonte da condição é o motivo do processo + o indicador de atividade
   remunerada. Ver auditoria de [RN-PEC-006].
2. **O indicador de atividade remunerada é dado de entrada, não derivado.** CTB art. 147, § 5º
   manda registrar essa informação na própria CNH; a integração RENACH de [APP-PEC] já expõe
   indicadores (`requiresPsychological`) — este é o campo que deve governá-los.
3. **Acionamento cruzado (art. 5º, § 2º, IV).** O médico pode **solicitar** a avaliação psicológica
   fora do fluxo padrão. Nenhum RBAC ou workflow do PEC prevê esse ato; é uma transição real
   ausente de [WF-PEC-001].
4. **Prazo de 2 dias úteis** é um SLA legal com destinatário identificado (o psicólogo), não uma
   meta de plataforma: preenche a lacuna que [WF-PEC-001] registrava como _"nenhum prazo/SLA
   numérico foi encontrado"_. Contagem pela convenção de dias úteis já adotada no corpus
   ([RN-RAIT-005], calendário nacional + AM).
5. **Validade reduzida** exige campo próprio no laudo psicológico, distinto da validade-regra —
   mesmo mecanismo que o § 4º do art. 147 cria para o exame médico ([RN-PEC-102]).

**Controvérsia/risco.** O art. 147, § 3º do CTB diz _"preliminar e complementar"_ para o condutor
remunerado — expressão que a doutrina administrativa lê como **duas avaliações** (uma na
habilitação, outra a cada renovação), e não como uma avaliação de dois módulos. A
[REF-CONTRAN-789-2020] art. 4º, § 1º repete a expressão sem esclarecê-la, e nenhuma norma capturada
define o que distingue a "complementar" da "preliminar" em conteúdo. Se houver diferença de
conteúdo, o PEC precisa de **dois subtipos de avaliação psicológica**; hoje tem um só. Registrado
como ambiguidade textual não resolvida — item 10 de `_intake/legal-assessment.md`.
