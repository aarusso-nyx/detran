---
id: RN-PEC-120
title: Exame toxicológico C/D/E — a base legal é o CTB art. 148-A e a Res. CONTRAN 923/2022, não a Res. 1.009/2024; gate de etapa anterior e validade de 90 dias
status: draft
apps: [pec, portal]
sources:
  [
    REF-CTB-147-148-habilitacao,
    REF-CONTRAN-923-1009-toxicologico,
    REF-CONTRAN-927-2022,
  ]
updated: 2026-08-24
---

**Regra.** Para as categorias **C, D e E**, o condutor deve comprovar **resultado negativo em exame
toxicológico de larga janela** para obtenção e renovação da CNH, e esse exame **deve ser realizado
em etapa anterior** aos exames do art. 147 do CTB — isto é, antes do exame de aptidão física e
mental e da avaliação psicológica que o PEC realiza. É o único "antes de" com força de **bloqueio**
em todo o corpus do PEC ([RN-PEC-108]).

- **Validade do resultado: 90 (noventa) dias**, contados da **data da coleta da amostra** — não da
  emissão do laudo, não do início do processo.
- **Janela de detecção mínima: 90 dias** (art. 148-A, § 1º do CTB) — parâmetro do _exame_, que **não
  se confunde** com a validade do _resultado_, embora ambos sejam 90 dias.
- O exame é produzido por **laboratório credenciado pelo órgão máximo executivo de trânsito da
  União**, em **regime de livre concorrência**, com prazo de **30 dias** para entrega do laudo ao
  condutor e inserção do resultado no RENACH.

**Correção de citação (obrigatória).** [RN-PEC-007] e [APP-PEC] citam _"[REF-CONTRAN-1009] —
Resolução CONTRAN 1.009/2024"_ como a norma do exame toxicológico. **Está errado em dois níveis:**
a Res. 1.009/2024 é **resolução alteradora** (altera as Res. 789/2020, 923/2022 e 985/2022), não a
norma-base; e a norma-base de nível superior é a **lei** — CTB art. 148-A. A citação correta é
**CTB art. 148-A + Res. CONTRAN 923/2022 (com as alterações da Res. 1.009/2024)**.

**Base legal.**

- [REF-CTB-147-148-habilitacao] art. 148-A, _caput_: _"Os condutores das categorias C, D e E
  deverão comprovar resultado negativo em exame toxicológico para a obtenção e a renovação da
  Carteira Nacional de Habilitação."_ _(Redação dada pela Lei nº 14.071, de 2020)_
- [REF-CTB-147-148-habilitacao] art. 148-A, § 1º: _"[...] deverá ter janela de detecção mínima de 90
  (noventa) dias, nos termos das normas do Contran."_
- [REF-CONTRAN-923-1009-toxicologico] art. 10: _"O exame toxicológico de larga janela de detecção,
  exigido para a habilitação, renovação ou mudança para as categorias C, D e E [...] deverá ser
  realizado em etapa anterior aos exames realizados pelo órgão executivo de trânsito, previstos no
  art. 147 do Código de Trânsito Brasileiro (CTB). § 1º A validade do exame toxicológico será de 90
  (noventa) dias, contados a partir da data da coleta da amostra [...]."_
- [REF-CONTRAN-923-1009-toxicologico] art. 9º (redação dada pela Res. 1.009/2024): entrega do laudo
  em **30 dias** da coleta e inserção do resultado no RENACH; §§ 1º-2º: retenção de **5 anos** do
  resultado eletrônico e do material biológico no laboratório.
- [REF-CONTRAN-923-1009-toxicologico] art. 3º: cadeia de custódia **com validade forense** em todas
  as etapas.

**Verificação.** Confirma [RN-PEC-007] no mérito e o corrige na citação e no prazo:

1. **O gate está certo.** O bloqueio do processo até resultado válido é exatamente o que a norma
   determina; `pec.process_blocks` é a materialização correta.
2. **Fecha o "(fonte pendente) — nenhum prazo numérico"** de [RN-PEC-007] e da linha
   "Pré-condição toxicológica" de [WF-PEC-001]: **90 dias**.
3. **O prazo é de validade do resultado, não prazo para obter o exame.** O bloqueio não tem prazo
   de expiração próprio; o que expira é o resultado. Um resultado com 91 dias **não bloqueia por
   atraso** — deixou de existir como resultado válido.
4. **A contagem é da coleta.** O PEC precisa persistir a **data da coleta**, não a data de
   recebimento do resultado nem a de emissão do laudo. Se a integração fornecer apenas a data do
   laudo, o cálculo de validade estará sistematicamente errado — em até 30 dias, pelo art. 9º.
5. **O resultado é de terceiro.** Laboratório credenciado **pela União**, sem vínculo com a clínica
   nem com o DETRAN-AM; o PEC **consome** o fato, não o produz. Ver [RN-PEC-122] quanto ao que pode
   e ao que não pode ser armazenado.
6. **Livre concorrência** ([REF-CTB-147-148-habilitacao] art. 148-A, § 7º): o condutor **escolhe** o
   laboratório — em contraste deliberado com o exame clínico ([RN-PEC-113]).

**Controvérsia/risco.** _Severidade: baixa quanto ao mérito; média quanto à integração._ (a) A
[REF-CONTRAN-789-2020] capturada é a publicação **original** de 2020, sem as alterações da Res.
1.009/2024 — não afeta esta regra, mas afeta qualquer leitura conjunta das duas. (b) A norma diz
"etapa anterior aos exames do art. 147", e o art. 147 inclui as etapas teóricas e práticas: a
leitura estrita é que o toxicológico antecede **todo** o bloco, o que é o que o PEC já faz. (c) Não
há norma que diga **quem verifica** a validade dos 90 dias no momento do exame clínico — o PEC
assume esse papel por consequência do gate, sem atribuição expressa. Item 15 de
`_intake/legal-assessment.md`.
