---
id: RN-BOAT-127
title: Papel LGPD do DETRAN-AM no RENAEST — controlador do registro estadual, não operador da SENATRAN
status: draft
apps: [boat]
sources:
  [
    REF-SENATRAN-PORTARIA-139-2025,
    REF-CTB-sinistro-cena-renaest,
    REF-LEI-13709-2018,
    REF-CONTRAN-808-2020,
  ]
updated: 2026-08-24
---

**Regra.** A SENATRAN declara-se **controladora** dos dados do RENAEST e aponta o **SERPRO** como
operador. Isso disciplina a **base nacional** — não converte o DETRAN-AM em operador. O DETRAN-AM
coleta dado de sinistro no exercício de **competência legal própria** (CTB art. 22, IX —
[RN-BOAT-101]), decide sobre a coleta, a validação estadual e a guarda local, e por isso é, quanto
ao **registro estadual**, **controlador** na definição do art. 5º, VI da LGPD (_"a quem competem as
decisões referentes ao tratamento"_). No **envio** ao RENAEST há compartilhamento entre entes
públicos (LGPD art. 26), com cada órgão respondendo pelo tratamento que realiza — não uma relação
de controlador↔operador.

**Base legal.**

- [REF-SENATRAN-PORTARIA-139-2025] art. 7º: _"A Senatran exercerá o papel de controladora dos dados
  de seus sistemas e subsistemas informatizados, cabendo-lhe as decisões referentes ao tratamento de
  dados [...] § 1º Constituem-se nos sistemas informatizados controlados pela Senatran [...] o
  Registro Nacional de Sinistros e Estatísticas de Trânsito - Renaest [...]"_
- [REF-SENATRAN-PORTARIA-139-2025] art. 7º, § 3º: _"Considerando as competências definidas no art.
  19, do Código de Trânsito Brasileiro, o tratamento de dados restritos pelos órgãos ou entidades
  executivos de trânsito dos Estados e do Distrito Federal, no âmbito de suas circunscrições,
  coletados para o desempenho de **atribuições delegadas pela Senatran, nos termos do art. 22,
  incisos II e III**, do Código de Trânsito Brasileiro, observará o disposto no art. 2º."_ — cita os
  incisos **II e III** (habilitação e registro de veículo); **não cita o inciso IX** (coleta de
  sinistro).
- [REF-SENATRAN-PORTARIA-139-2025] art. 11: _"O Serviço Federal de Processamento de Dados - Serpro é
  o operador responsável pela operacionalização do acesso aos dados [...]"_
- [REF-LEI-13709-2018] art. 5º, VI e VII (controlador × operador); art. 26 (uso compartilhado pelo
  Poder Público); art. 23 (finalidade pública).
- [REF-CONTRAN-808-2020] art. 5º, § 5º: no envio entre órgãos integrados, _"serão observados os
  dispositivos da [...] LGPD"_.

**Verificação.** Consequências práticas da qualificação — e elas são materiais:

1. Como **controlador**, o DETRAN-AM responde diretamente por: base legal do tratamento
   ([RN-BOAT-123]), minimização ([RN-BOAT-124]), retenção e eliminação ([RN-BOAT-125]), atendimento
   aos direitos do titular e publicidade ([RN-BOAT-126]), segurança e comunicação de incidente. Não
   pode invocar "cumprir instruções da SENATRAN" como fundamento — o que um operador poderia.
2. O **Encarregado** competente para o dado de vítima é o do **DETRAN-AM** (designado por Portaria
   319/2023/DETRAN/AM, fonte secundária), não o da SENATRAN — e é ele quem deve figurar como canal
   público para esse tratamento.
3. Papel distinto do **Coordenador de RENAEST** ([RN-BOAT-105]): coordenador é figura da norma de
   trânsito, responsável pelo fluxo de dado ao sistema nacional; encarregado é figura da LGPD, canal
   com titulares e ANPD. **Não devem ser fundidos** — nem, necessariamente, ser a mesma pessoa.
4. No fluxo estadual→federal, cada ente é controlador do seu tratamento; a **base do
   compartilhamento** é o art. 26 (execução de política pública e atribuição legal), com o registro
   das finalidades específicas.

**Controvérsia/risco.** _Severidade: média-alta._ A qualificação **não está resolvida em norma**: é
inferida do silêncio do art. 7º, § 3º da Portaria 139/2025 quanto ao inciso IX do art. 22 do CTB.
Duas leituras alternativas existem e devem ser consideradas pelo parecer humano: (a)
**co-controladoria** — SENATRAN e DETRAN-AM decidiriam conjuntamente sobre finalidades do RENAEST,
já que a metodologia, os campos e os manuais são definidos pela União ([RN-BOAT-103]); (b)
**operador quanto ao envio** — o DETRAN-AM apenas executaria, no envio, decisões federais. A leitura
(b) é a mais frágil, porque a coleta é competência própria e não delegada; a leitura (a) é
plausível e, se adotada, exigiria instrumento formal de repartição de responsabilidades entre os
entes, que **não existe**. A consequência prática da dúvida é direta: **quem responde perante a
ANPD e perante o titular por um vazamento de dado de vítima**. Item 3 de
`_intake/legal-assessment.md`.
