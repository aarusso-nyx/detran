---
id: RN-TEAT-129
title: Recolhimento do documento de habilitação em campo — conflito entre o CTB e o MBFT sobre a competência do agente
status: draft
apps: [teat]
sources:
  [
    REF-CTB-165-277-medidas-alcoolemia,
    REF-CONTRAN-985-1003-MBFT,
    REF-CONTRAN-432,
  ]
updated: 2026-08-24
---

**Regra.** O recolhimento do documento de habilitação é medida administrativa do art. 269, III/IV
do CTB. Em campo, o TEAT deve reconhecer **três fundamentos distintos**, com regimes distintos:

1. **Flagrante do art. 162, II** (dirigir com CNH/PPD/ACC cassada ou com suspensão do direito de
   dirigir) — o agente recolhe **mediante recibo**, quando o documento for físico, para
   encaminhamento à autoridade responsável pela penalidade; sendo digital, **o bloqueio já está no
   Renach** e nada há a apreender;
2. **Alcoolemia (arts. 165 e 165-A)** — o documento de habilitação _"será recolhido pelo agente,
   mediante recibo"_, e fica sob custódia do órgão ([RN-TEAT-137]);
3. **Indícios de inautenticidade ou adulteração** — o documento é recolhido e encaminhado,
   **junto com o condutor**, à Polícia Judiciária (CTB art. 272).

Em qualquer caso, sendo o documento **digital**, a medida é executada por **registro no Renach**
([RN-TEAT-122], art. 269 §5º), nunca por apreensão.

**Base legal.**

- [REF-CTB-165-277-medidas-alcoolemia] art. 165 e art. 165-A: _"Medida administrativa -
  recolhimento do documento de habilitação e retenção do veículo, observado o disposto no § 4º do
  art. 270 […]"_
- [REF-CONTRAN-432] art. 10: _"O documento de habilitação será recolhido pelo agente, mediante
  recibo, e ficará sob custódia do órgão […] até que o condutor comprove que não está com a
  capacidade psicomotora alterada […] § 1º Caso o condutor não compareça […] no prazo de 5 (cinco)
  dias […] o documento será encaminhado ao órgão executivo de trânsito responsável pelo seu
  registro […]"_
- [REF-CONTRAN-985-1003-MBFT] Seção 8.3: _"A medida administrativa de recolhimento do documento de
  habilitação é aplicada pela autoridade de trânsito quando da imposição da penalidade de suspensão
  do direito de dirigir ou de cassação da CNH/PPD, **após o devido processo administrativo** […]"_;
  _"O agente da autoridade de trânsito **somente** aplicará a medida administrativa de recolhimento
  de documento de habilitação quando ele flagrar o cometimento das infrações previstas nos art.
  162, II […]"_; _"Quando o agente detectar indícios de inautenticidade ou adulteração, o documento
  de habilitação apresentado deverá ser recolhido e encaminhado, juntamente com o condutor, para a
  Polícia Judiciária, nos termos do art. 272 do CTB."_

**Verificação.** `AdministrativeTerm` de recolhimento de habilitação carrega
`fundamento` ∈ {ART_162_II, ALCOOLEMIA_165, ALCOOLEMIA_165A, INAUTENTICIDADE_272},
`suporte` ∈ {FISICO, DIGITAL}, `recibo_id` (obrigatório no suporte físico) e, no fundamento de
alcoolemia, o prazo de **5 dias** para o condutor comparecer antes do encaminhamento ao órgão de
registro. No suporte digital, o termo não se conclui com a coleta física, mas com a **confirmação
de registro no Renach**.

**Controvérsia/risco — conflito normativo direto, severidade alta.** O MBFT (Res. CONTRAN
985/2022) afirma que o agente **"somente"** aplica essa medida no flagrante do art. 162, II. Isso
colide frontalmente com: (a) o CTB arts. 165 e 165-A, que preveem o recolhimento do documento como
medida administrativa **da própria infração**, aplicada em campo; e (b) a Res. CONTRAN 432/2013
art. 10, que diz expressamente que _"o documento de habilitação será recolhido **pelo agente**,
mediante recibo"_ no procedimento de alcoolemia. Três normas, duas delas do mesmo CONTRAN, com
comandos incompatíveis sobre quem recolhe e quando. Leitura de trabalho adotada — **o "somente" do
MBFT alcança a medida do art. 269, III como decorrência de penalidade já imposta**, sem revogar as
hipóteses em que a própria lei prevê o recolhimento no ato (165/165-A) — porque resolução não
derroga lei e porque a Res. 432/2013 é norma especial expressa para alcoolemia. **É interpretação
sobre conflito real, não sobre silêncio.** Item 32 de `_intake/legal-assessment.md`, entre os cinco
riscos prioritários.
