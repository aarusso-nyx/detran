---
id: IU-PEC-P-04
title: Solicitar junta médica
status: draft
apps: [portal]
sources: [IU-PEC-001, UC-PEC-004, RN-PEC-112, RN-PEC-150, RN-PEC-151]
updated: 2026-09-30
---

# Solicitar junta médica

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 04. Módulo `exames`; rota `exames/:examId/junta/nova`. App `portal`.

## Acesso

Reutiliza a rota existente. Exige CIDADAO, vínculo válido, `junta_medica` e nível `avancada` vigente, mais ciência do resultado registrada pelo dono. OD-R27-002 = (b) autoriza `junta_medica` nesta rodada; ausência de ciência ou janela fechada impede o ingresso.

## Dados e comandos

A tela apresenta os dados do resultado estritamente necessários e o prazo `dueOn` fornecido pelo servidor. O requerimento corresponde a `POST /v1/ch/juntas/cases` por delegação backend, com o candidato como requerente e o cidadão em `onBehalfOf`; frontend chama somente a API Portal.

O servidor confirma a janela de 30 dias corridos desde ciência registrada pelo dono; a interface não calcula prazo, termo inicial ou elegibilidade. Fora da janela, apresentar `PORTAL.BOARD_REQUEST_WINDOW_CLOSED` e a data do servidor. Nenhuma clínica ou perito é selecionável.

## Estados e conteúdo

Carregando; formulário habilitado quando guarda, vínculo, nível e ciência forem válidos; sem vínculo; nível insuficiente; ciência ausente; janela encerrada; serviço indisponível; confirmação e protocolo. A tela existente pode exibir indisponibilidade real até a implementação do backend.

## Prazo e acessibilidade

Apresentar o prazo como direito: “até quando você pode agir”, com termo inicial e data fornecidos pelo dono. O `DeadlineCard` anuncia a data sem roubar foco. Validar erros associados aos campos e explicar bloqueios textualmente.

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
