---
id: RN-PEC-003
title: Exceção de biometria requer aprovação de Supervisor, com prazo/escopo limitados e auditoria reforçada
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/flows/biometria-excecao.md
  - pec:docs/framework/pec/rbac-matrix.md
  - pec:docs/framework/pec/catalogo-uc.md
  - REF-SENATRAN-PORTARIA-968-2022
  - REF-LEI-13709-2018
updated: 2026-08-24
---

**Regra.** Quando a captura biométrica não atinge a qualidade mínima, o Técnico Biométrico
registra a falha com justificativa; a liberação temporária controlada só pode ser concedida
mediante aprovação do Supervisor, e é limitada em prazo e escopo (`expires_at`). Toda a
sequência — falha, justificativa, aprovação, liberação — gera trilha de auditoria reforçada,
vinculando ID biométrico, IP/estação e hash. A matriz RBAC do PEC modela um único papel
aprovador (Supervisor) para esta exceção — não há, na documentação capturada, exigência de
segundo aprovador humano distinto para a decisão em si (contraste com [RN-PEC-004], que exige
dupla biometria de duas pessoas para atendimentos conduzidos por estagiário).

**Base legal.** _(Parcialmente resolvida na rodada LEGAL de 2026-08-24; ver ressalva de vigência.)_
Das quatro portarias antes citadas por número, **duas estão revogadas** e não devem mais ser
citadas: a DENATRAN 1.515/2018 (revogada pelo art. 12, II da própria Portaria 968/2022) e a
DENATRAN 2.145/2020 (revogada pela Portaria SENATRAN 357/2022, e de matéria diversa — cursos EAD).

- [REF-SENATRAN-PORTARIA-968-2022] art. 4º _(redação dada pela Portaria 495/2025)_: _"É obrigatória
  a validação da presença dos candidatos e condutores em **todos os cursos e exames** do processo de
  habilitação [...], por meio da comparação dos dados biométricos de impressões digitais e imagens
  faciais coletados no momento da abertura do formulário Renach [...] com a leitura dos dados
  biométricos coletados no ato do comparecimento [...]."_ — ver [RN-PEC-130].
- [REF-SENATRAN-PORTARIA-968-2022] art. 4º, §§ 1º, 3º e 4º _**(texto de 2022 — ver ressalva)**_:
  sensor com tecnologia **LFD**; ausência de digital informada _"por meio de campo específico para
  cada um dos dedos"_; e _"torna-se obrigatória a validação por reconhecimento facial"_.
- [REF-LEI-13709-2018] art. 5º, II (dado biométrico é dado sensível), art. 37 e art. 46 — a
  auditoria reforçada descrita nesta regra é **obrigação legal**, não zelo adicional ([RN-PEC-154]).

**⚠ Ressalva de vigência.** Os §§ 1º/3º/4º acima são a **redação de 2022**. A Portaria 495/2025 deu
nova redação ao art. 4º substituindo os parágrafos por reticências com cláusula "(NR)", e o
normativo que hoje os detalha **não foi localizado**. Tratar como forte indício técnico do desenho
legal, **não como texto vigente certo** — ver [RN-PEC-131].

**Verificação.** `pec.biometric_exceptions` tem `expires_at` e um status `EXPIRED`; índice
`idx_bioex_status_expires` sugere varredura periódica de expiração. Auditoria obrigatória por
operação sensível. Ver [UC-PEC-003] e [JRN-PEC-003].

**Delimitação norma × produto (auditoria legal, 2026-08-24).**

1. **A exceção nunca é dispensa de identificação — é troca de fator.** O texto vigente do art. 4º
   continua exigindo a validação de presença. Um fluxo de exceção que permita concluir o atendimento
   **sem nenhuma** validação biométrica contraria a norma federal.
2. **A aprovação por Supervisor, o `expires_at` e o escopo limitado NÃO são exigidos por norma
   alguma** — são governança adicional do PEC, acima do piso normativo. Legítimos, e agora
   **identificados como decisão de produto**, não como decorrência da Portaria.
3. **O registro deve ser por dedo**, não por evento: um campo único de "falha na captura" perde a
   granularidade que o § 3º manda registrar.

**Revisão (2026-08-24, especialista LEGAL).** "(fonte pendente)" substituída por base legal com
ressalva de vigência; duas portarias revogadas removidas da fundamentação; camada de governança
reclassificada como decisão de produto. Regra **confirmada em mérito**, com as delimitações acima.
