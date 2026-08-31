---
id: RN-PEC-007
title: Pré-condição toxicológica obrigatória para categorias C/D/E antes das demais etapas
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/flows/happy-path.md
  - pec:docs/framework/pec/archive-authoritative-sources.md
  - REF-CTB-147-148-habilitacao
  - REF-CONTRAN-923-1009-toxicologico
updated: 2026-08-24
---

**Regra.** Para candidatos/condutores de categorias de habilitação C, D ou E, o resultado do
exame toxicológico deve ser válido antes que o processo prossiga para as demais etapas do
PEC — o processo é bloqueado até que haja um resultado toxicológico válido. O happy-path do
PEC modela explicitamente o gate `{Pré-condição Toxicológico válido? — Não → Bloqueio do
processo até resultado válido}` entre a emissão dos laudos e a liberação do encerramento pelo
orquestrador.

**⚠ Correção de citação (CONTRADIÇÃO confirmada — rodada LEGAL, 2026-08-24).** A base legal antes
citada — _"[REF-CONTRAN-1009] — Resolução CONTRAN 1.009/2024"_ — **está errada em dois níveis**:
a Res. 1.009/2024 é **resolução alteradora** (altera as Res. 789/2020, 923/2022 e 985/2022), não a
norma que instituiu o exame; e a norma-base é de **nível legal**. A citação correta é
**CTB art. 148-A + Res. CONTRAN 923/2022 (com as alterações da Res. 1.009/2024)**. A mesma correção
é devida em [APP-PEC] §Âncoras legais, fora da fronteira de escrita desta rodada — ver
`_intake/legal-assessment.md` §Handoff.

**Base legal.** _(Resolvida e corrigida.)_

- [REF-CTB-147-148-habilitacao] art. 148-A, _caput_: _"Os condutores das categorias C, D e E deverão
  comprovar resultado negativo em exame toxicológico para a obtenção e a renovação da [CNH]."_
  _(Redação dada pela Lei nº 14.071, de 2020)_; § 1º: janela de detecção mínima de **90 dias**.
- [REF-CONTRAN-923-1009-toxicologico] art. 10: _"O exame toxicológico de larga janela de detecção,
  exigido para a habilitação, renovação ou mudança para as categorias C, D e E [...] **deverá ser
  realizado em etapa anterior aos exames realizados pelo órgão executivo de trânsito, previstos no
  art. 147 do [CTB]**."_ — confirmação quase literal do gate.
- [REF-CONTRAN-923-1009-toxicologico] art. 10, § 1º: _"A validade do exame toxicológico será de 90
  (noventa) dias, contados a partir da data da coleta da amostra [...]."_
- Detalhamento completo em [RN-PEC-120]; exame **periódico** pós-CNH em [RN-PEC-121]; regime de
  sigilo do resultado em [RN-PEC-122].

**Verificação.** Bloqueio materializado como um `pec.process_blocks` ativo, que por sua vez é
um dos itens verificados pelo gate de encerramento ([RN-PEC-006]).

**Prazo (lacuna fechada).** A lacuna _"nenhum prazo numérico"_ deixa de existir: **90 dias**. Três
precisões que a implementação precisa observar:

1. **É validade do resultado, não prazo para obter o exame.** Um resultado com 91 dias não bloqueia
   "por atraso" — deixou de existir como resultado válido.
2. **A contagem é da DATA DA COLETA**, não da emissão do laudo nem do recebimento. O laboratório tem
   até **30 dias** da coleta para entregar o laudo ([REF-CONTRAN-923-1009-toxicologico] art. 9º,
   redação da Res. 1.009/2024) — usar a data errada produz erro sistemático de até 30 dias.
3. **O resultado é de terceiro.** Laboratório credenciado **pela União**, em regime de livre
   concorrência (CTB art. 148-A, § 7º), sem vínculo com a clínica nem com o DETRAN-AM. O PEC
   **consome o fato**, não o produz — e, por força do art. 148-A, § 6º, **não deve armazenar o laudo
   detalhado nem as substâncias** ([RN-PEC-122]).

**Revisão (2026-08-24, especialista LEGAL).** **CONTRADIÇÃO nº 2 do dossiê corrigida** (base legal
do toxicológico: 923/2022 + CTB art. 148-A, não 1.009/2024). Prazo de 90 dias incorporado com as
três precisões de contagem. Regra **confirmada em mérito** — o gate estava correto.
