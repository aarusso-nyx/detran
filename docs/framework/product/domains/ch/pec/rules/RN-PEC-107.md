---
id: RN-PEC-107
title: O ato pericial é pessoal e indelegável — vedada a assinatura de laudo produzido por outro profissional
status: draft
apps: [pec]
sources:
  [
    REF-CFM-1636-2002,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-CONTRAN-927-2022,
    REF-CTB-147-148-habilitacao,
  ]
updated: 2026-08-24
---

**Regra.** A realização e o resultado do exame são de **exclusiva responsabilidade** do perito que
os praticou. Duas vedações expressas decorrem disso e vinculam o desenho do PEC:

1. **É vedado ao perito assinar laudo realizado por outro profissional** — regra do CFM para o
   médico (2002), replicada e **estendida ao psicólogo** pela norma estadual do DETRAN-AM (2021).
2. **O exame de aptidão física e mental é privativo de médico** — não pode ser realizado, nem
   parcialmente conduzido como ato pericial, por outro profissional.

Em consequência, **signatário e executor do exame são necessariamente a mesma pessoa**, e a
identidade dessa pessoa é dado que a lei manda registrar no RENACH (CTB art. 147, § 1º —
[RN-PEC-101]). Supervisão, revisão de qualidade e aprovação administrativa **não convertem** o
revisor em autor: quem assina é quem periciou.

**Base legal.**

- [REF-CFM-1636-2002] art. 1º: _"O exame de aptidão física e mental para condutores de veículos
  automotores deverá ser realizado exclusivamente por médico. Parágrafo único - É vedado ao médico
  perito assinar laudos realizados por outros profissionais."_
- [REF-DETRANAM-PORTARIA-005-2021] art. 34, § 8º (novo): _"É vedado aos peritos médicos e/ou
  psicólogos a assinatura de laudos realizados por outros profissionais."_
- [REF-CONTRAN-927-2022] art. 10: _"A realização e o resultado do exame de aptidão física e mental
  e da avaliação psicológica são, respectivamente, de exclusiva responsabilidade do médico perito
  examinador de trânsito e do psicólogo perito examinador de trânsito."_
- [REF-CTB-147-148-habilitacao] art. 147, § 1º (identificação do examinador registrada no RENACH).

**Verificação.** Fecha o "(fonte pendente)" de [RN-PEC-001] quanto ao **porquê** da assinatura
pessoal e do adendo: o laudo não pode ser reassinado por outro profissional porque a norma o
proíbe — a retificação por adendo **do próprio autor** não é preferência de arquitetura, é a única
forma disponível. Consequências verificáveis:

1. **Vínculo executor↔signatário é invariante de dados**, não regra de tela: `pec.reports` precisa
   garantir que o signatário do laudo é o profissional vinculado ao exame correspondente
   (`exams_medical` / `exams_psych`), e a violação deve ser erro de integridade.
2. **Interação com [RN-PEC-004] (estagiário).** A dupla validação de estagiário + supervisor **não
   pode** significar que o supervisor assina o laudo de avaliação conduzida pelo estagiário — isso
   é exatamente o que o art. 34, § 8º proíbe. A leitura compatível é: o estagiário **não é perito**
   e **não produz laudo**; a avaliação é do psicólogo supervisor, que a conduz com participação do
   estagiário sob sua presença ([REF-DETRANAM-PORTARIA-005-2021] art. 48). Ver auditoria de
   [RN-PEC-004].
3. **Interação com a junta.** O parecer da junta ([RN-PEC-110]) é ato **novo** de outros
   profissionais, não assinatura do laudo original — não colide com esta regra.
4. **Adendo herda a autoria.** Um adendo a laudo cujo autor esteja indisponível (descredenciado,
   afastado, falecido) **não pode ser assinado por substituto**; o caso exige novo exame, não
   retificação. Hipótese não tratada em [RN-PEC-001].

**Controvérsia/risco.** A [REF-CFM-1636-2002] é resolução de **conselho profissional**: vincula o
médico sob regime ético-disciplinar do CFM, não o órgão de trânsito. Sua replicação pelo art. 34,
§ 8º da [REF-DETRANAM-PORTARIA-005-2021] é o que lhe dá força administrativa no Amazonas — e essa
Portaria está com vigência não confirmada (ver [RN-PEC-113] e item 5 de
`_intake/legal-assessment.md`). Ainda que a Portaria caísse, a vedação permaneceria como dever do
profissional; o que se perderia é a base para o **órgão** exigi-la do sistema. Registrado.
