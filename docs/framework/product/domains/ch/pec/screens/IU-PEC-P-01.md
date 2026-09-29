---
id: IU-PEC-P-01
title: Meu agendamento de exame
status: draft
apps: [portal]
sources: [IU-PEC-001, UC-PEC-013, RN-PEC-113]
updated: 2026-09-30
---

# Meu agendamento de exame

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 01. Módulo `exames`; rota `exames/agendamento`. App `portal`.

## Acesso

Consulta com `consulta_exame`; vínculo do exame quando disponível. Acesso de leitura parcial conforme DT-021 e OD-PW-002.

## Dados e comandos

A projeção `portal.pec_appointment_view` pode apresentar data, janela, região e informação de alocação somente quando houver evento válido do dono. Não apresenta clínica ou perito como escolha.

Não há comando cidadão nesta tela. Solicitar ou reagendar por região/janela permanece bloqueado por DT-021, UC-PEC-013 em `draft` e OD-PW-002/OD-R32-004. Operações internas de agendamento não são autorização de comando cidadão.

## Estados e conteúdo

Carregando; agendamento disponível; nenhum agendamento; erro; sem vínculo; leitura indisponível; ação bloqueada por decisão. Ausência de evento não produz data estimada. A leitura pode ser parcial; o formato final aguarda DT-021.

## Prazo e acessibilidade

Não calcular prazo no cliente. Se uma data de ação for fornecida pelo servidor, apresentá-la como “até quando você pode agir”. Explicar o bloqueio em texto com os ids DT/OD; não oferecer seletor de clínica ou perito.

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
