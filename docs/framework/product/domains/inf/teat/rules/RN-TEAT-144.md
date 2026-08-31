---
id: RN-TEAT-144
title: Base legal LGPD do núcleo identificador do AIT — obrigação legal e regulatória, não consentimento
status: draft
apps: [teat]
sources:
  [REF-LEI-13709-2018, REF-CTB-280-290, REF-CONTRAN-918, REF-SENATRAN-997]
updated: 2026-08-27
---

**Regra.** Placa e demais identificadores do veículo, prontuário/CNH do condutor e os dados de
identificação pessoal estritamente necessários para vincular condutor, proprietário e agente ao
AIT são tratados para cumprir obrigação legal e regulatória do ato de fiscalização. A hipótese é
a LGPD art. 7º, II, combinada com a finalidade pública do art. 23; o TEAT não solicita nem registra
consentimento como fundamento para lavrar, sincronizar ou conservar o núcleo do AIT.

**Base legal.** [REF-LEI-13709-2018] arts. 7º, II, e 23; [REF-CTB-280-290] art. 280, III-VI;
[REF-CONTRAN-918] art. 3º; [REF-SENATRAN-997] art. 4º. CPF só integra o núcleo quando necessário
para a identificação exigida pelo ato ou por integração regulamentada; não é inferido como campo
universal a partir do silêncio do art. 280.

**Verificação.** Cada campo identificador declara finalidade, dispositivo normativo e necessidade.
O fluxo impede usar `consent` como base do tratamento do AIT, minimiza dados além do rol obrigatório
e registra indisponibilidade dos elementos qualificados por "sempre que possível", conforme
[RN-TEAT-101]. Exportações e integrações preservam tenant, autor, finalidade e versão normativa.

**Controvérsia/risco.** A base do núcleo é direta; a extensão a campos adicionais depende da norma
específica do enquadramento ou integração. Esta regra não autoriza coleta preventiva, reutilização
para finalidade incompatível nem retenção indefinida, especialmente de evidências audiovisuais.
