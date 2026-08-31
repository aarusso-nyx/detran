---
id: RN-PEC-005
title: Biometria de encerramento do perito — presença física obrigatória para habilitar a assinatura
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/archive-authoritative-sources.md
  - pec:domain/biometrics-biometric-capture/api/src/biometrics/biometrics.service.ts
  - REF-CTB-147-148-habilitacao
  - REF-CFM-1636-2002
  - REF-CONTRAN-927-2022
  - REF-SENATRAN-PORTARIA-968-2022
updated: 2026-08-24
---

**Regra.** Antes de finalizar um laudo, o sistema deve garantir que o médico/psicólogo
signatário está fisicamente presente na clínica: ao clicar em "Finalizar Laudo", o sistema
invoca o SDK biométrico e exige que o profissional coloque o dedo no leitor, validando contra
a digital cadastrada em seu próprio perfil. Sucesso habilita a assinatura digital ICP-Brasil e
o envio ao RENACH. Falha bloqueia o envio e registra uma tentativa de fraude no log. Esta é a
regra RF-014 do SRS arquivado do PEC.

Distinta da biometria de check-in do paciente (que abre o encounter, ver [UC-PEC-002] e
[RN-PEC-003]) e da biometria de estação que avança o encounter para `IN_PROGRESS`
([WF-PEC-001]) — esta é especificamente a biometria **do profissional**, no momento de
assinar.

**Base legal.** _(Resolvida na rodada LEGAL de 2026-08-24 — mas por fundamento diferente do
suposto.)_ A biometria do **perito** **não** decorre da Portaria SENATRAN 968/2022, cujo art. 4º
exige validação de presença dos **"candidatos e condutores"** ([RN-PEC-130]). O fundamento correto é
a **pessoalidade do ato pericial** somada à obrigação legal de identificar o examinador:

- [REF-CTB-147-148-habilitacao] art. 147, § 1º: _"Os resultados dos exames e **a identificação dos
  respectivos examinadores** serão registrados no RENACH."_
- [REF-CONTRAN-927-2022] art. 10: _"A realização e o resultado [...] são, respectivamente, de
  exclusiva responsabilidade do médico perito examinador de trânsito e do psicólogo perito
  examinador de trânsito."_
- [REF-CFM-1636-2002] art. 1º e parágrafo único: exame privativo de médico; vedada a assinatura de
  laudo realizado por outro profissional — ver [RN-PEC-107].
- [REF-SENATRAN-PORTARIA-968-2022] art. 2º, § 2º _(redação dada pela Portaria 495/2025)_: _"Os dados
  biométricos somente serão coletados presencialmente"_ — princípio geral de presencialidade do
  sistema, **consistente** com esta regra, mas cujo destinatário direto é o candidato.

**Verificação.** `BiometricsService.record` com `kind` correspondente à estação/momento de
assinatura; falha de match gera evento de log de tentativa de fraude, distinto do log de
auditoria padrão. Ver [UC-PEC-006].

**Delimitação e lacunas (auditoria legal, 2026-08-24).**

1. **Duas biometrias, duas finalidades, dois titulares.** A do candidato cumpre a Portaria 968/2022;
   a do perito cumpre o CTB art. 147, § 1º e a pessoalidade do ato. **Não podem compartilhar
   política de retenção nem de acesso** — ver [RN-PEC-154].
2. **Biometria de profissional é dado de prestador**, com a assimetria de poder típica da relação de
   trabalho, e nenhuma norma capturada a disciplina. Risco silencioso do modelo antifraude.
3. **A verificação de presença não verifica habilitação.** Confirmar que _aquela pessoa_ está no
   local não confirma que ela **podia** periciar (credenciamento vigente, título de especialista —
   [RN-PEC-115]). São dois gates distintos e hoje só um existe.

**Revisão (2026-08-24, especialista LEGAL).** "(fonte pendente)" resolvida, **com correção de
fundamento**: a base não é a portaria de biometria do candidato, e sim a identificação legal do
examinador e a pessoalidade do ato pericial. Regra **confirmada em mérito**.
