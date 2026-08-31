---
id: RN-PEC-131
title: Ausência de impressão digital e fallback por reconhecimento facial — o desenho do PEC é compatível, mas a base legal citada tem ressalva de vigência
status: draft
apps: [pec]
sources: [REF-SENATRAN-PORTARIA-968-2022, REF-LEI-13709-2018]
updated: 2026-08-24
---

**Regra.** Quando a impressão digital não pode ser coletada, o desenho normativo **de referência**
prevê, em vez de dispensa da identificação, uma **substituição obrigatória de fator**:

- o sensor deve possuir tecnologia **LFD (Live Finger Detection)**;
- a **ausência temporária de impressão digital ou a impossibilidade de coleta** deve ser **informada
  em campo específico para cada um dos dedos** — registro estruturado, não observação livre;
- nesse caso, **torna-se obrigatória a validação por reconhecimento facial**.

**Ressalva de vigência — a regra deve ser citada com ela.** Esses três comandos são os §§ 1º, 3º e 4º
do art. 4º da Portaria SENATRAN 968/2022 na **redação de 2022**. A Portaria 495/2025 deu nova redação
ao art. 4º substituindo os parágrafos por reticências com cláusula "(NR)", e **não foi localizado o
anexo ou normativo complementar que hoje os substitui**. Tratar como **forte indício técnico do
desenho legal**, não como texto vigente certo.

**O que é norma e o que é decisão de produto.** A **aprovação por Supervisor**, o `expires_at` e o
escopo limitado da exceção biométrica de [RN-PEC-003] **não são exigidos por norma alguma** — são
governança adicional do PEC, acima do piso normativo. São legítimos (nada os proíbe) e devem ser
identificados como **decisão de produto**, não como decorrência da Portaria.

**Base legal (com a ressalva acima).**

- [REF-SENATRAN-PORTARIA-968-2022] art. 4º, § 1º _(texto de 2022)_: _"O sensor de leitura das
  impressões digitais [...] deverá possuir obrigatoriamente a tecnologia LFD (Live Finger
  Detection)."_
- [REF-SENATRAN-PORTARIA-968-2022] art. 4º, § 3º _(texto de 2022)_: _"A ausência temporária de
  impressão digital ou a impossibilidade de coleta deverá ser informada [...] por meio de campo
  específico para cada um dos dedos [...]."_
- [REF-SENATRAN-PORTARIA-968-2022] art. 4º, § 4º _(texto de 2022)_: _"No caso previsto no § 3º,
  torna-se obrigatória a validação por reconhecimento facial."_
- [REF-SENATRAN-PORTARIA-968-2022] art. 4º _(redação vigente, 2025)_: mantém a **obrigatoriedade da
  validação de presença** por comparação de _"impressões digitais e imagens faciais"_ — a
  **substituibilidade entre os dois fatores permanece no texto vigente**, ainda que o procedimento
  detalhado não.

**Verificação.**

1. **A exceção biométrica nunca é dispensa de identificação.** É **troca de fator**. Um fluxo de
   exceção que permita concluir o atendimento **sem nenhuma** validação biométrica contraria o art.
   4º na redação vigente — que continua exigindo a validação de presença.
2. **Registro por dedo, não por evento.** O § 3º descreve granularidade **por dedo**; um campo único
   de "falha na captura" perde a informação que a norma manda registrar.
3. **LFD é requisito de hardware**, não de software: entra na homologação do provedor biométrico
   ([APP-PEC] §Interfaces), não no código do PEC.
4. **`expires_at` e aprovação de Supervisor permanecem** — reclassificados como decisão de produto.
   Ver auditoria de [RN-PEC-003].
5. **Dado biométrico é dado sensível** e a exceção é justamente o ponto de maior risco de
   reidentificação e de abuso — a "auditoria reforçada" de [RN-PEC-003] é, sob a LGPD, obrigação
   ([RN-PEC-154]), não zelo extra.

**Controvérsia/risco.** _Severidade: média._ (a) A citação de §§ revogados como se vigentes é um vício
documental fácil de cometer e difícil de detectar — está registrado aqui de propósito. (b) Se o
normativo substitutivo tiver afrouxado ou endurecido o fallback facial, o desenho de [RN-PEC-003] pode
estar acima **ou abaixo** do piso atual; não é possível afirmar hoje. **Recuperar o Anexo da Portaria
968/2022 na redação de 2025 é item de pesquisa prioritário.** (c) A dependência exclusiva de
reconhecimento facial levanta questão de **acessibilidade e de viés** que nenhuma norma capturada
endereça, e que se agrava quando combinada à obrigação de acessibilidade do CTB art. 147-A
([RN-PEC-104]). Item 16 de `_intake/legal-assessment.md`.
