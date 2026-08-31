---
id: RN-TEAT-118
title: Medida administrativa vincula-se ao AIT após a finalização — e o dado do AIT só vai para o órgão autuador
status: draft
apps: [teat]
sources: [REF-SENATRAN-997, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** O talão eletrônico deve permitir, **após a finalização do preenchimento do AIT**, a
**vinculação da medida administrativa adotada**. A ordem é normativa, não apenas operacional:
finaliza-se o auto e **depois** se vincula a medida — coerente com o fato de a medida ser
providência **complementar** à infração (CTB art. 269 §2º) e de o conteúdo do auto ser congelado na
finalização ([RN-TEAT-004]). Complementarmente, os dados do AIT **somente podem ser enviados e
armazenados no banco de dados do órgão autuador**.

**Base legal.**

- [REF-SENATRAN-997] Anexo V, f): _"Permitir, após a finalização do preenchimento do AIT, a
  vinculação da medida administrativa adotada."_
- [REF-SENATRAN-997] Anexo V, e): _"Os dados dos AIT somente poderão ser enviados e armazenados no
  banco de dados do órgão autuador."_
- [REF-CTB-165-277-medidas-alcoolemia] art. 269 §2º: _"As medidas administrativas previstas neste
  artigo não elidem a aplicação das penalidades impostas por infrações estabelecidas neste Código,
  possuindo caráter complementar a estas."_

**Verificação.** Confirma o desenho de [WF-TEAT-001]: `AdministrativeTerm` referencia o AIT
finalizado, e não o contrário. Consequência prática que o desenho atual precisa observar: a
vinculação **pós-finalização** não pode alterar o `content_hash` do auto — a medida é entidade
apensa, com seu próprio ciclo de vida e seus próprios prazos ([RN-TEAT-124], [RN-TEAT-125]), o que
é exatamente o que torna verdadeira a independência de [RN-TEAT-123]. Um AIT pode ser finalizado e
transmitido **antes** de a medida ser concluída; a medida pendente não bloqueia a transmissão.

**Controvérsia/risco.** Nem toda medida administrativa nasce vinculada a um AIT: a remoção de
veículo em estado de abandono ou acidentado ocorre _"independentemente da existência de infração
à legislação de trânsito"_ ([REF-CONTRAN-985-1003-MBFT] Seção 8.2), e o Termo de Recolhimento
admite fundamento em **ordem judicial ou ato administrativo** ([REF-CONTRAN-1025-2026] art. 14,
III). O modelo do TEAT precisa, portanto, admitir `AdministrativeTerm` **sem** AIT de origem —
hoje a restrição inversa (medida sempre apensa a um ato legal) tornaria essas hipóteses
irrepresentáveis. Item 19 de `_intake/legal-assessment.md`.
