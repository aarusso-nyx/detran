---
id: UC-PEC-001
title: Abrir processo RENACH e agendar exame
status: approved
apps: [pec]
sources:
  - pec:domain/integration-renach/api/src/renach/renach-processes.service.ts
  - pec:database/ddl/02-pec.sql
  - pec:domain/appointments-scheduling/api/src/appointments/appointments.service.ts
  - pec:docs/framework/pec/archive-authoritative-sources.md
updated: 2026-08-26
---

## Ator e objetivo

Recepção (ou o processo já aberto pelo DETRAN/AM) liga o candidato/condutor a um processo
RENACH e agenda o atendimento na clínica credenciada, dando início à trilha clínica que o PEC
controla. Origem: UCAP-UC-01 ("Abrir Processo de Habilitação no RENACH") + SUC-UC-08 ("Criar
agendamento").

## Pré-condições

- Candidato cadastrado como paciente no PEC (CPF, nome, data de nascimento).
- Clínica credenciada e ativa no tenant.

## Fluxo principal

1. Recepção consulta/abre o processo RENACH para o paciente: `POST /integrations/renach/processes`.
2. O adaptador RENACH retorna `renachProcessKey`, `status` (`OPENED`|`ALREADY_OPEN`) e um
   `requestId`.
3. O PEC grava `renach_process_key` em `pec.encounters` (ou o mantém disponível para quando o
   encounter for aberto) — unicidade garantida por `(tenant_id, patient_id,
renach_process_key)`.
4. Recepção cria o agendamento: `POST /appointments` — estado inicial `SCHEDULED` — ver
   [WF-PEC-003].
5. Consultas de identidade complementares (`findDriverByCpf` etc.) podem retornar indicadores
   de negócio (`requiresMedical`, `requiresPsychological`, `requiresBiometrics`,
   `requiresPaymentClearance`) que orientam quais etapas subsequentes são necessárias.

## Fluxos alternativos / exceções

- **Processo já aberto** (`ALREADY_OPEN` / encounter já tem `renach_process_key`): operação é
  idempotente, retorna `LOCAL_ALREADY_LINKED`, nenhum novo vínculo é criado.
- **Conflito de vínculo**: se o RENACH devolve uma chave que já está ligada a outro encounter
  local do mesmo paciente, o sistema rejeita com `ConflictException` — previne duplicidade.
- **Agendamento duplicado**: `POST /appointments` para o mesmo `(tenant, clínica, paciente,
horário)` já existente é rejeitado pela restrição de unicidade.

## Pós-condições

- Paciente tem `renach_process_key` disponível para uso no encounter.
- Agendamento em `SCHEDULED`, pronto para check-in no dia do atendimento.

## Critérios de aceitação

**AC-PEC-001-1 — o vínculo com o RENACH é idempotente**

- **Dado** um paciente cujo processo já está aberto
- **Quando** a recepção tenta abrir de novo
- **Então** o sistema retorna `LOCAL_ALREADY_LINKED` sem criar novo vínculo ([RN-PEC-008])

**AC-PEC-001-2 — chave já ligada a outro encounter é conflito, não sobrescrita**

- **Dado** uma `renachProcessKey` já vinculada a outro encounter do mesmo paciente
- **Quando** o vínculo é tentado
- **Então** o sistema rejeita com conflito — nunca reaponta a chave em silêncio

**AC-PEC-001-3 — quais etapas são exigidas vem da norma, não do balcão**

- **Dado** uma renovação
- **Quando** o sistema determina as etapas
- **Então** a exigência de avaliação psicológica deriva das hipóteses legais ([RN-PEC-103]) e não
  é oferecida como escolha da clínica — psicológica não é exigida em toda renovação

**AC-PEC-001-4 — categoria C/D/E tem gate toxicológico antes das demais etapas**

- **Dado** um processo de categoria C, D ou E
- **Quando** o agendamento é criado
- **Então** o exame toxicológico é pré-condição das demais etapas ([RN-PEC-007], [WF-PEC-005]) e o
  sistema não permite agendar as etapas subsequentes sem ele

**AC-PEC-001-5 — agendamento duplicado é rejeitado pela unicidade**

- **Dado** um agendamento existente para o mesmo tenant, clínica, paciente e horário
- **Quando** outro é criado
- **Então** a restrição de unicidade o rejeita

## Regras aplicáveis

- [RN-PEC-008] (transmissão/idempotência com o RENACH aplica-se também à abertura de processo)
- (fonte pendente) regras de elegibilidade de categoria de habilitação que determinam
  `requiresMedical`/`requiresPsychological` — não documentadas em detalhe no PEC, apenas
  consumidas como indicadores vindos do RENACH.
