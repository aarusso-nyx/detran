---
id: RN-PEC-004
title: Atendimento conduzido por estagiário exige dupla validação biométrica no fechamento
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/archive-authoritative-sources.md
  - REF-DETRANAM-PORTARIA-005-2021
  - REF-CFP-01-2019
  - REF-CFM-1636-2002
  - REF-CONTRAN-927-2022
updated: 2026-08-24
---

**Regra.** Quando o atendimento (avaliação psicológica, no texto-fonte) é realizado por um
psicólogo estagiário, o sistema exige dupla validação no fechamento: login/biometria do
estagiário **e** login/biometria do Supervisor. Fluxo: o estagiário realiza a avaliação,
encaminha para supervisão, o Supervisor revisa e aprova, e só então o laudo é assinado. Esta
é a regra RF-013 ("Controle de Estagiários") do SRS arquivado do PEC — a única exigência
encontrada no corpus com dois aprovadores humanos distintos validados por biometria própria
(diferente da exceção de captura biométrica, [RN-PEC-003], que tem um único aprovador).

**Base legal.** _(Corrigida na rodada LEGAL de 2026-08-24 — a exigência de supervisão tem âncora
normativa; a exigência de dupla biometria NÃO tem.)_

- [REF-DETRANAM-PORTARIA-005-2021] art. 48 (novo): _"A participação de estagiários de psicologia nas
  clínicas credenciadas pelo DETRAN somente será autorizada mediante a presença de psicólogo
  especialista em trânsito para orientação e supervisão."_ — âncora **estadual explícita** da
  exigência de supervisão.
- [REF-CFP-01-2019] art. 1º, § 1º e art. 2º (a avaliação é **perícia psicológica** com exigências
  mínimas de qualidade, cuja desobediência é falta ético-disciplinar — art. 1º, § 3º).
- [REF-CONTRAN-927-2022] art. 10: o resultado é _"de exclusiva responsabilidade [...] do psicólogo
  perito examinador de trânsito"_.
- [REF-CFM-1636-2002] art. 1º, parágrafo único, e [REF-DETRANAM-PORTARIA-005-2021] art. 34, § 8º:
  vedada a assinatura de laudo realizado por outro profissional ([RN-PEC-107]).

**Correção de fundamento (CONTRADIÇÃO PARCIAL confirmada).** Nenhuma das fontes acima exige **dupla
validação biométrica** de estagiário + supervisor. O art. 48 exige **"presença [...] para orientação
e supervisão"** — presença física do supervisor, não duas leituras biométricas no fechamento. A
regra RF-013 do SRS arquivado **acrescenta uma exigência técnica de conformidade acima do piso
normativo**. Isso é permitido e é boa prática antifraude, mas passa a estar **identificado como
decisão de produto**, e não como decorrência direta da norma.

**Correção de modelagem (consequência de [RN-PEC-107]).** A leitura de que "o estagiário realiza a
avaliação e o Supervisor aprova, e então o laudo é assinado" **não pode significar que o supervisor
assina laudo de avaliação realizada por outro** — é exatamente o que o art. 34, § 8º da Portaria
DETRAN-AM e o art. 1º, parágrafo único da Res. CFM 1.636/2002 proíbem. A leitura compatível com a
norma é: **o estagiário não é perito e não produz laudo**; a perícia é do **psicólogo especialista**,
que a conduz com participação do estagiário sob sua presença e responsabilidade, e a assina como
autor. A dupla biometria, nessa leitura, é evidência de que **a presença exigida pelo art. 48
ocorreu** — o que lhe dá um propósito normativo legítimo, ainda que não obrigatório.

**Verificação.** Ambas as biometrias (estagiário + Supervisor) devem estar registradas antes
que o laudo possa ser assinado; ausência de qualquer uma bloqueia o fechamento. (fonte
pendente) — não foi encontrada, nesta pesquisa, a tabela/coluna específica que persiste esse
duplo registro no schema atual (`database/ddl/02-pec.sql`); confirmar se a regra está
efetivamente implementada ou apenas especificada no SRS arquivado (mesmo padrão de gap
observado em [WF-PEC-001] e [WF-PEC-002]) — item de backlog em `_intake/proposals.md`.

**Controvérsia/risco (acrescentada em 2026-08-24).** A norma estadual exige _"psicólogo
**especialista em trânsito**"_ como supervisor — qualificação específica, a mesma exigida para o
credenciamento ([RN-PEC-115]) e verificável no cadastro. O papel `Supervisor` da matriz RBAC do PEC
é **administrativo** ([APP-PEC] §Atores: _"ponto de escalonamento de qualidade clínica"_) e **não
garante** essa titulação. Se o Supervisor que valida biometricamente não for psicólogo especialista
em trânsito, a exigência do art. 48 **não está satisfeita**, por mais biometrias que se colham. É um
descompasso entre papel de sistema e qualificação profissional, e é o risco real desta regra.

**Revisão (2026-08-24, especialista LEGAL).** "(fonte pendente)" substituída por âncora estadual
explícita (art. 48). **CONTRADIÇÃO PARCIAL do dossiê confirmada e corrigida**: a dupla biometria
não decorre da norma e passa a estar rotulada como decisão de produto. Acrescentada a correção de
modelagem quanto à autoria do laudo e a controvérsia sobre a qualificação do supervisor.
