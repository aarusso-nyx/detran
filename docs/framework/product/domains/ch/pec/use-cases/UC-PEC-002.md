---
id: UC-PEC-002
title: Abrir atendimento clínico (encounter)
status: approved
apps: [pec]
sources:
  - pec:domain/encounters-clinical-encounter/api/src/encounters/encounters.service.ts
  - pec:docs/framework/pec/flows/diagrams/atendimento-pec.mmd
  - pec:docs/framework/pec/rbac-matrix.md
updated: 2026-08-26
---

## Ator e objetivo

Recepção abre o encounter clínico que servirá de guarda-chuva para o exame médico e/ou
psicológico do paciente, formalizando o início do episódio. Origem: SUC-UC-10.

## Pré-condições

- Paciente tem um agendamento no estado `CHECKED_IN` (ou o mais recente `CHECKED_IN` é
  resolvido automaticamente se `appointmentId` não for informado) — ver [WF-PEC-003].
- Check-in biométrico já validado (com `MATCH` ou exceção aprovada — ver [UC-PEC-003]).

## Fluxo principal

1. Recepção chama `POST /encounters` com o `patientId` (e opcionalmente `appointmentId`).
2. Sistema valida que existe um agendamento `CHECKED_IN` associado; se não houver
   `appointmentId` explícito, busca o agendamento `CHECKED_IN` mais recente do paciente.
3. Encounter é criado com `status='OPEN'`.
4. Se o agendamento vinculado ainda não estava `CHECKED_IN`, o sistema o atualiza para esse
   status como efeito colateral.
5. A partir daqui, o encounter segue o ciclo de vida de [WF-PEC-001].

## Fluxos alternativos / exceções

- **Sem check-in biométrico válido**: `400 Biometric check-in is required before opening
encounter` — a abertura é bloqueada até que a biometria (ou uma exceção aprovada, ver
  [UC-PEC-003]) exista.

## Pós-condições

- Encounter criado em `OPEN`, pronto para registrar exame médico e/ou psicológico.

## Critérios de aceitação

**AC-PEC-002-1 — sem biometria válida o encounter não abre**

- **Dado** um paciente sem check-in biométrico válido e sem exceção aprovada
- **Quando** se tenta abrir o encounter
- **Então** a abertura é bloqueada ([RN-PEC-130], Portaria SENATRAN 968/2022 art. 4º) — a exceção
  é o caminho de [UC-PEC-003], não uma flag de contorno

**AC-PEC-002-2 — todo o núcleo de dados do encounter é dado sensível**

- **Dado** os dados clínicos do encounter
- **Quando** são persistidos
- **Então** recebem o regime de dado pessoal sensível ([RN-PEC-150]), o mesmo rigor do bloco
  LGPD do BOAT — não apenas os campos de laudo

**AC-PEC-002-3 — a hipótese legal é obrigação legal, declarada**

- **Dado** o tratamento dos dados do PEC
- **Quando** o sistema opera
- **Então** funda-se no art. 11, II, "a" da LGPD — obrigação legal ([RN-PEC-151]) — e não na
  alínea "f" (tutela da saúde), que **não** é a hipótese correta aqui

**AC-PEC-002-4 — biometria é dado sensível, inclusive no provedor externo**

- **Dado** a captura biométrica por provedor autorizado
- **Quando** ocorre
- **Então** o dado é tratado como sensível e o provedor está sujeito à LGPD por contrato
  ([RN-PEC-154]) — terceirizar a captura não terceiriza a responsabilidade

**AC-PEC-002-5 — o encounter cobre no máximo um exame de cada trilha**

- **Dado** um encounter aberto
- **Quando** exames são registrados
- **Então** vale a unicidade de um exame médico e um psicológico por encounter

## Regras aplicáveis

- [RN-PEC-130] (validação biométrica de presença obrigatória em todos os exames, coleta
  necessariamente presencial — é esta, e não [RN-PEC-005], a regra do check-in do candidato;
  [RN-PEC-005] rege a biometria do perito no momento de assinar)
- [RN-PEC-003] (exceção de biometria — aprovação de Supervisor, prazo/escopo limitados)
