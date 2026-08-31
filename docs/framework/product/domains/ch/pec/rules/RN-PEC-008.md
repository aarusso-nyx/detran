---
id: RN-PEC-008
title: Transmissão de eventos ao RENACH em até 15 minutos, idempotente, com reprocessamento em caso de erro
status: draft
apps: [pec]
sources:
  - pec:domain/transmissions-detran-transmissions/api/src/transmissions/transmissions.service.ts
  - pec:docs/framework/pec/flows/transmissoes-ack.md
  - REF-CTB-147-148-habilitacao
  - REF-CONTRAN-927-2022
  - REF-LEI-13709-2018
updated: 2026-08-24
---

**Regra.** Todo evento relevante do encounter (encounter, laudo, restrição) destinado ao
RENACH é enfileirado (`integration.renach_outbox`, `status='PENDING'`) e deve ser transmitido
dentro de uma janela de até 15 minutos (`next_attempt_at = now() + 15min`), via canal mTLS,
com chave de idempotência (`entity:entityId`) que evita duplicidade em reenvios. O DETRAN
confirma de forma assíncrona por webhook (`ACKED` ou `ERROR`); o registro do ACK é ele próprio
idempotente (`ON CONFLICT (outbox_id) DO NOTHING`). Em caso de `ERROR`, o evento é
reprocessado com correções via retry dedicado. O encerramento do encounter associado (ver
[RN-PEC-006]) depende de que a transmissão relevante já esteja `ACKED`.

**Base legal.** _(Parcialmente resolvida na rodada LEGAL de 2026-08-24 — a **obrigação** tem base
legal; o **SLA** não.)_

- [REF-CTB-147-148-habilitacao] art. 147, § 1º: _"Os resultados dos exames e a identificação dos
  respectivos examinadores serão registrados no RENACH."_ — a transmissão ao RENACH **é obrigação
  legal**, não integração de conveniência; e o **examinador** é elemento obrigatório do registro.
- [REF-CONTRAN-927-2022] art. 9º, § 1º e § 2º: o **prazo de inaptidão** e a **validade reduzida**
  constam da **planilha RENACH** — dados obrigatórios do payload, hoje não descritos no corpus.
- [REF-CONTRAN-927-2022] art. 10, § 2º: na inaptidão, comunicação aos setores médico e psicológico
  do órgão para **bloqueio imediato do cadastro nacional** — evento distinto, com destinatário e
  urgência próprios ([RN-PEC-106]).
- [REF-LEI-13709-2018] art. 26 (uso compartilhado entre entes públicos) e art. 6º, I e III
  (finalidade e necessidade) — delimitam **o que** pode ser transmitido: ver [RN-PEC-152].
- **Permanece "(fonte pendente)"**: a **janela de 15 minutos**, o p95 de 10s, a idempotência e o
  canal mTLS. Nenhuma norma capturada fixa SLA de transmissão — são decisões de engenharia, e agora
  estão identificadas como tais.

**Verificação.** `integration.renach_outbox` e `integration.renach_acks` são a fonte de
verdade; o gate de fechamento do encounter falha explicitamente se houver qualquer linha
`PENDING`/`ERROR` para o encounter. Ver [UC-PEC-009].

**Lacunas identificadas na auditoria legal (2026-08-24).**

1. **A fila é única; as obrigações não são.** A comunicação de inaptidão do art. 10, § 2º tem
   qualificador de urgência ("imediato bloqueio") e **destinatário próprio** (setores médico e
   psicológico do órgão). Tratá-la como mais uma linha da fila de 15 minutos é decisão que a norma
   **não autoriza expressamente** — no mínimo exige prioridade e evidência de entrega próprias.
2. **O dever é do perito, e o sistema o executa por ele.** O art. 10, § 2º atribui a comunicação ao
   **perito examinador**, pessoa física. Se o PEC a automatiza, o comprovante de cumprimento precisa
   ser **acessível ao próprio perito** — é ele quem responde por uma falha de transmissão.
3. **Fronteira de conteúdo não definida.** O corpus não descreve o payload real. Vai o **resultado**,
   sua qualificação (Anexo XV, prazo de inaptidão, validade), a identificação do examinador e os
   metadados de integridade — **não** o prontuário, a anamnese, os protocolos de teste nem o
   conteúdo toxicológico ([RN-PEC-122], [RN-PEC-152]). Verificar contra a especificação de integração
   é pré-requisito de conformidade.
4. **O vocabulário do payload é o federal**, não o interno ([RN-PEC-105]) — e não foi confirmado
   contra nenhuma especificação técnica.

**Revisão (2026-08-24, especialista LEGAL).** "(fonte pendente)" **parcialmente** resolvida: a
obrigação de transmitir tem base legal expressa (CTB art. 147, § 1º); o SLA de 15 minutos permanece
sem base normativa e passa a estar rotulado como decisão de engenharia. Quatro lacunas acrescentadas.
