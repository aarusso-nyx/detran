---
id: RN-PEC-130
title: Validação biométrica de presença é obrigatória em todos os exames do processo, e a coleta é necessariamente presencial
status: draft
apps: [pec]
sources:
  [
    REF-SENATRAN-PORTARIA-968-2022,
    REF-CTB-147-148-habilitacao,
    REF-LEI-13709-2018,
  ]
updated: 2026-08-24
---

**Regra.** A verificação biométrica de presença que o PEC executa **não é um controle antifraude
interno**: é **obrigação normativa federal**. A norma determina:

1. **Validação obrigatória da presença** dos candidatos e condutores **em todos os cursos e exames**
   do processo de habilitação, mudança ou adição de categoria e renovação da CNH — por **comparação**
   entre os dados biométricos coletados na abertura do formulário RENACH e os dados lidos **no ato
   do comparecimento** para a etapa.
2. **Coleta somente presencial**, sempre, com validação **no momento da coleta** e indexação por CPF
   e número do formulário/registro RENACH (redação de 2025).
3. **Dados biométricos** compreendem **imagem facial, assinatura e impressões digitais**.
4. **Validade dos dados capturados = validade da CNH**, com reutilização permitida no mesmo período
   — **não mais os "10 anos" do texto original de 2022**, revogados pela Portaria 495/2025.

**Base legal.**

- [REF-SENATRAN-PORTARIA-968-2022] art. 4º _(redação dada pela Portaria 495/2025)_: _"É obrigatória
  a validação da presença dos candidatos e condutores em todos os cursos e exames do processo de
  habilitação, mudança ou adição de categoria e renovação da CNH, por meio da comparação dos dados
  biométricos de impressões digitais e imagens faciais coletados no momento da abertura do formulário
  Renach [...] com a leitura dos dados biométricos coletados no ato do comparecimento para a
  realização da etapa do processo."_
- [REF-SENATRAN-PORTARIA-968-2022] art. 2º, § 2º _(redação dada pela Portaria 495/2025)_: _"Os dados
  biométricos somente serão coletados presencialmente e serão indexados [...] pelo número de
  inscrição no CPF e pelo respectivo número do formulário ou do registro Renach, devendo ser validados
  no momento de sua coleta."_
- [REF-SENATRAN-PORTARIA-968-2022] art. 1º, parágrafo único (definição) e art. 3º (validade =
  validade da CNH).
- [REF-SENATRAN-PORTARIA-968-2022] art. 2º, § 5º (texto de 2022): as empresas coletoras assumem _"a
  responsabilidade pela salvaguarda e sigilo dos dados biométricos coletados, nos termos da Lei nº
  13.709 [...] (LGPD)"_.
- [REF-CTB-147-148-habilitacao] art. 147, § 1º (registro do resultado **e do examinador** no RENACH).

**Verificação.** Fecha o "(fonte pendente)" de [RN-PEC-003] e de [RN-PEC-005] quanto ao **fundamento**
da exigência de presença — mas com uma delimitação importante:

1. **A norma cobre a presença do CANDIDATO.** O texto fala em _"candidatos e condutores"_. A
   biometria de encerramento **do perito** ([RN-PEC-005]) **não** é exigida por esta Portaria; seu
   fundamento é outro — a pessoalidade do ato pericial ([RN-PEC-107]) e a identificação do examinador
   no RENACH (CTB art. 147, § 1º). A regra continua correta; a base legal é diferente da suposta.
2. **A validação é comparativa, contra o RENACH**, não contra um cadastro local: a referência é o
   dado coletado na **abertura do formulário RENACH**. O PEC compara contra base de terceiro.
3. **"Todos os exames"** inclui **cada um** dos dois exames clínicos, não apenas o check-in do
   episódio — o que sustenta a biometria de estação que avança o `encounter` para `IN_PROGRESS`
   descrita em [WF-PEC-001].
4. **Telessaúde** ([APP-PEC] §Escopo/Dentro) é **incompatível** com o art. 2º, § 2º para qualquer ato
   que envolva coleta biométrica — e, se a validação de presença é obrigatória em todos os exames, é
   incompatível com o próprio exame. Contradição de escopo não registrada em nenhum artefato.
5. **A validade "= validade da CNH"** substitui os 10 anos fixos: qualquer regra de reuso de captura
   baseada em prazo fixo está desatualizada desde 04/07/2025.
6. **O provedor biométrico é operador sujeito à LGPD por norma expressa** (art. 2º, § 5º) — ver
   [RN-PEC-154].

**Controvérsia/risco.** _Severidade: média._ (a) A Portaria 495/2025 alterou o art. 4º substituindo
seus parágrafos por reticências com a cláusula "(NR)" — os detalhes técnicos do texto de 2022 (LFD,
tratamento da ausência de digital) **não podem ser citados como vigentes**; ver [RN-PEC-131]. (b) A
norma disciplina o **RENACH**, sistema federal; sua incidência sobre o sistema da **clínica
credenciada** é por decorrência (a clínica executa a etapa cuja presença deve ser validada), não por
menção expressa. (c) Não foi localizado o normativo que hoje detalha o procedimento de validação —
possivelmente Anexo da própria Portaria, não capturado. Item 16 de `_intake/legal-assessment.md`.
