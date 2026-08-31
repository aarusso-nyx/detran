---
id: RN-PEC-114
title: Vedações de local e de forma do exame — nunca em CFC, nunca em grupo, sem cota-limite por período
status: draft
apps: [pec]
sources: [REF-CFM-1636-2002, REF-DETRANAM-PORTARIA-005-2021, REF-CFP-01-2019]
updated: 2026-08-24
---

**Regra.** Três vedações objetivas incidem sobre **onde** e **como** o exame pode ser realizado:

1. **Local de atividade médica exclusiva.** Os locais de realização dos exames devem ser de
   atividade médica exclusiva para esse tipo de procedimento.
2. **Nunca em Centro de Formação de Condutores** — nem em qualquer outro local, público ou privado,
   _"cujos agentes tenham interesse no resultado positivo desses exames periciais"_. Regra federal
   do CFM (2002), **replicada expressamente** pela norma estadual do DETRAN-AM (art. 48-D), e
   estendida por ela também à **avaliação psicológica**.
3. **Exame individualizado, sem cota-limite.** É vedado estabelecer **cota-limite por período de
   tempo** para a realização dos exames, e é vedado o **exame simultâneo em grupos de pacientes**.
   Para a avaliação psicológica, a exigência de individualidade vem da própria norma do CFP
   (entrevista _"de caráter individual e obrigatório"_ — [RN-PEC-104]).

**Base legal.**

- [REF-CFM-1636-2002] art. 2º: _"Os locais de realização dos exames [...] devem ser de atividade
  médica exclusiva para este tipo de procedimento. Parágrafo único - Não poderão, em hipótese
  nenhuma, serem realizados em centros de formação de condutores ou em qualquer outro local público
  ou privado, cujos agentes tenham interesse no resultado positivo desses exames periciais."_
- [REF-CFM-1636-2002] art. 4º: _"É vedado o estabelecimento de cota-limite por período de tempo
  para a realização dos exames [...]. Parágrafo único - O exame é individualizado, não sendo
  permitido exames simultâneos em grupos de pacientes [...]."_
- [REF-DETRANAM-PORTARIA-005-2021] art. 48-D (novo): _"A Avaliação Psicológica e o exame de aptidão
  física e mental não poderão ser realizados em Centros de Formação de Condutores."_
- [REF-CFP-01-2019] art. 2º, § 9º (entrevista individual obrigatória).

**Verificação.**

1. **A vedação do CFC é um invariante do cadastro de unidades**, não uma regra de agendamento: uma
   unidade credenciada não pode ter CFC no mesmo estabelecimento. Verificável no credenciamento
   ([RN-PEC-115]), não no `encounter`.
2. **"Interesse no resultado positivo" é um teste de finalidade**, mais amplo que a menção literal a
   CFC — alcança, por exemplo, unidade que também venda serviço de despachante ou de curso.
3. **A vedação de exame em grupo é estrutural ao modelo do PEC** e já está satisfeita: o `encounter`
   é individual, com biometria de presença do paciente ([RN-PEC-130]).
4. **A vedação de cota-limite (art. 4º) merece atenção de produto.** Um sistema de agendamento
   trabalha, por natureza, com **slots por período** — e um limite de slots pode ser lido como cota.
   Leitura de trabalho adotada: a vedação alcança **cota administrativa artificial** (teto imposto
   ao prestador para racionar exames), **não** o limite decorrente da capacidade física real de
   atendimento. O que a distingue é a **origem**: capacidade instalada é fato; cota é decisão.
5. **A janela obrigatória de 08h-13h** da [REF-DETRANAM-PORTARIA-005-2021] art. 40 ([RN-PEC-116])
   é, materialmente, um **limite por período de tempo imposto por ato do órgão** — a tensão com o
   art. 4º do CFM é real e está registrada abaixo.

**Controvérsia/risco.** _Severidade: média._ (a) A tensão entre a **janela estadual de cinco horas**
(Portaria DETRAN-AM 005/2021 art. 40) e a **vedação federal de cota-limite por período** (CFM 1.636
art. 4º) não é resolvida por nenhuma norma. A leitura conciliatória possível é que o art. 40 fixa
**horário de funcionamento** (organização do serviço) e não **quantidade de exames** (racionamento)
— mas o efeito prático de uma janela de 5 horas sobre a capacidade diária é indistinguível de uma
cota, e o dimensionamento de agenda de [WF-PEC-003] tornará esse efeito explícito e mensurável. É
matéria de handoff para BPO tanto quanto para LEGAL. (b) O art. 2º, _caput_ ("atividade médica
exclusiva") é de difícil aplicação literal a uma clínica que realiza **também** avaliação
psicológica — atividade que não é médica. A leitura adotada é que "exclusiva" opõe-se a atividade
de **interesse no resultado** (o parágrafo único explicita a _ratio_), não a atividades periciais
conexas. Interpretação, rotulada. Item 14 de `_intake/legal-assessment.md`.
