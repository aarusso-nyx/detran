---
id: UC-PEC-004
title: Submeter caso à junta médica
status: reviewed
apps: [pec]
sources:
  - pec:domain/juntas-medical-board/api/src/juntas/juntas.service.ts
  - pec:domain/juntas-medical-board/api/src/juntas/dto/create-junta-case.dto.ts
  - pec:domain/shared/api/src/pec-policy.ts
  - pec:docs/framework/pec/flows/junta-recursos.md
updated: 2026-08-31
---

## Ator e objetivo

Candidato/condutor requer revisão do resultado; um operador autorizado protocola o ato e o
órgão designa uma junta médica ou psicológica, bloqueando o encerramento do encounter até a
decisão.
Origem: UCAP-UC-15 ("Enviar à Junta Médica"), rastreado internamente como UC-J1. Ver
[JRN-PEC-002] para a narrativa completa e [WF-PEC-002] para a máquina de estados.

## Pré-condições

- Encounter existente (`encounterId`) com achado, inconsistência ou pedido que motive dúvida
  clínica.
- Dossiê/evidências reunidos por quem submete.

## Fluxo principal

1. O candidato apresenta requerimento dentro de 30 dias da ciência do resultado.
2. Operador autorizado protocola `encounterId`, trilha médica/psicológica, candidato requerente,
   data de ciência, motivo taxonomizado e complemento textual opcional.
3. Sistema cria o caso em `SUBMITTED`, calcula somente os prazos com fonte e registra o ator que
   protocolou sem substituí-lo pelo requerente.
4. Enquanto o caso não estiver `DECIDED`, o encounter associado não pode ser encerrado
   ([WF-PEC-001] §"Gate de encerramento").

## Fluxos alternativos / exceções

- Não há criação automática de caso por regra de sistema: a submissão é um ato humano deliberado
  em nome do candidato identificado.
- Motivo não reconhecido falha fechado; detalhe livre complementa, mas não substitui, a taxonomia.

## Pós-condições

- Caso de junta criado, vinculado ao encounter, em `SUBMITTED`.
- Encounter bloqueado para encerramento até a decisão.

## Critérios de aceitação

**AC-PEC-004-1 — junta é sempre ato humano deliberado**

- **Dado** um exame com resultado inconclusivo
- **Quando** o encounter avança
- **Então** nenhum caso de junta é aberto automaticamente — a submissão é sempre ato de pessoa
  identificada

**AC-PEC-004-2 — junta pendente bloqueia o encerramento**

- **Dado** um caso de junta não decidido
- **Quando** se tenta encerrar o encounter
- **Então** o gate de encerramento o recusa ([RN-PEC-006] item 4)

**AC-PEC-004-3 — o ator da submissão é o correto**

- **Dado** a submissão de um caso
- **Quando** é registrada
- **Então** o ator segue [RN-PEC-110]; o `SUBMITTED` atribuído hoje ao operador está errado e é
  débito registrado (DT-103) — o requerimento de revisão é do candidato

**AC-PEC-004-4 — o motivo deixa de ser texto livre puro**

- **Dado** a criação de um caso
- **Quando** o motivo é informado
- **Então** existe taxonomia mínima de causa além do texto livre — sem ela não há estatística de
  junta nem detecção de padrão, e a Res. 927/2022 estrutura o instituto

**AC-PEC-004-5 — a junta tem composição, e ela é registrada**

- **Dado** um caso submetido
- **Quando** a junta o aprecia
- **Então** seus membros são registrados ([RN-PEC-111]: três profissionais na 2ª instância) — hoje
  a junta não tem composição, membros nem pauta modeladas, débito registrado (DT-106)

## Regras aplicáveis

- [RN-PEC-006] (gate de encerramento do encounter inclui "sem junta pendente")
