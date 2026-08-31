---
id: RN-PEC-101
title: O exame de aptidão física e mental e a avaliação psicológica são exigência de lei, com ato pericial privativo de especialista titulado
status: draft
apps: [pec]
sources:
  [
    REF-CTB-147-148-habilitacao,
    REF-CONTRAN-927-2022,
    REF-CONTRAN-789-2020,
    REF-CFM-1636-2002,
  ]
updated: 2026-08-24
---

**Regra.** O objeto de negócio do PEC — o exame de aptidão física e mental e a avaliação
psicológica — **não é um serviço contratado pelo candidato**: é uma **etapa obrigatória do
processo de habilitação imposta por lei federal**, cujo resultado e cujo examinador a lei manda
registrar no RENACH. Três consequências normativas fixam o núcleo do domínio:

1. **O exame é exigido por lei, não por resolução.** CTB art. 147, I. As resoluções CONTRAN
   apenas o regulamentam.
2. **O ato pericial é privativo de profissional titulado.** Médico com título de especialista em
   **Medicina de Tráfego** e psicólogo com título de especialista em **Psicologia do Trânsito**,
   conferidos pelo respectivo conselho — exigência hoje de **nível legal** (CTB art. 148, § 6º,
   incluído pela Lei 15.428/2026), antes apenas resolutiva.
3. **O registro no RENACH é obrigação legal, não integração de conveniência.** CTB art. 147, § 1º
   manda registrar _o resultado_ **e** _a identificação do examinador_.

O exame é, ainda, o **procedimento irredutível** da renovação: mesmo o condutor cadastrado no RNPC,
que a Lei 15.428/2026 dispensa automaticamente de todos os demais procedimentos do art. 147,
continua obrigado ao exame de aptidão física e mental (CTB art. 340-A, § 7º).

**Base legal.**

- [REF-CTB-147-148-habilitacao] art. 147, _caput_: _"O candidato à habilitação deverá submeter-se
  a exames realizados pelo órgão executivo de trânsito, na ordem descrita a seguir, e os exames de
  aptidão física e mental e a avaliação psicológica deverão ser realizados por médicos e psicólogos
  peritos examinadores, respectivamente, com titulação de especialista em medicina do tráfego e em
  psicologia do trânsito, conferida pelo respectivo conselho profissional [...]: I - de aptidão
  física e mental;"_ _(Redação dada pela Lei nº 14.071, de 2020)_
- [REF-CTB-147-148-habilitacao] art. 147, § 1º: _"Os resultados dos exames e a identificação dos
  respectivos examinadores serão registrados no RENACH."_
- [REF-CTB-147-148-habilitacao] art. 148, § 6º _(Incluído pela Lei nº 15.428, de 2026)_ — mesma
  exigência de titulação, agora em lei.
- [REF-CTB-147-148-habilitacao] art. 340-A, § 7º _(Redação dada pela Lei nº 15.428, de 2026)_.
- [REF-CONTRAN-927-2022] art. 19, II e III (titulação exigida no credenciamento) e art. 10
  (_"são, respectivamente, de exclusiva responsabilidade do médico perito examinador de trânsito e
  do psicólogo perito examinador de trânsito"_).
- [REF-CFM-1636-2002] art. 1º: _"O exame de aptidão física e mental para condutores de veículos
  automotores deverá ser realizado exclusivamente por médico."_

**Verificação.** Fecha o "(fonte pendente)" de [APP-PEC] §Missão e, sobretudo, o de [RN-PEC-008]:
a transmissão ao RENACH tem **base legal expressa** (art. 147, § 1º) — o que continua sem base
normativa é apenas o SLA de 15 minutos, que é decisão de engenharia. Consequências verificáveis:

1. `pec.reports.signer_council` (CRM/CRP) e `signer_name` não são apenas evidência de assinatura:
   são o **cumprimento do art. 147, § 1º** ("identificação dos respectivos examinadores"). Não
   podem ser opcionais nem anonimizáveis.
2. A validação de habilitação profissional contra CRM/CFM e CRP/CFP descrita em [APP-PEC]
   §Interfaces precisa verificar **título de especialista**, não apenas registro ativo — são
   requisitos distintos, e só o primeiro satisfaz o art. 148, § 6º.
3. A carência do art. 19, § 1º da [REF-CONTRAN-927-2022] (exercício sem titulação até **12/04/2024**)
   **já expirou**; qualquer perito ativo hoje sem título de especialista está irregular, e o
   sistema deveria bloquear a vinculação de laudo nesse caso. A mesma carência aparece, com a mesma
   data, no art. 34, § 10 da [REF-DETRANAM-PORTARIA-005-2021].

**Controvérsia/risco.** Nenhuma quanto à obrigatoriedade. Registra-se apenas que o art. 148, § 6º
introduz uma **autorização federal do perito** (_"autorizados pelo órgão máximo executivo de
trânsito da União"_) ao lado do credenciamento estadual do art. 16 da [REF-CONTRAN-927-2022] — dois
atos habilitantes de entes distintos, cuja articulação nenhuma norma capturada explica. Se a
autorização federal for constitutiva, o cadastro de peritos do PEC precisa de um segundo atributo
de habilitação, hoje inexistente. Item 9 de `_intake/legal-assessment.md`.
