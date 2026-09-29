---
id: IU-PEC-P-02
title: Meu resultado e meu dossiê
status: draft
apps: [portal]
sources:
  [
    IU-PEC-001,
    IU-PORTAL-T20,
    RN-PEC-105,
    RN-PEC-142,
    RN-PEC-150,
    RN-PEC-151,
    RN-PEC-153,
  ]
updated: 2026-09-30
---

# Meu resultado e meu dossiê

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 02. Módulo `exames`; rota `exames (T-20) e exames/:examId`. App `portal`.

## Acesso

Consulta de resultado segue `consulta_exame`; leitura de dossiê exige vínculo e porta do dono. O dossiê permanece bloqueado enquanto OD-R32-005 estiver pendente; não simular conteúdo para titular.

## Dados e comandos

A lista/detalhe pode exibir somente metadados realmente fornecidos por `portal.exam_view`, como rótulo legal e validade. O contrato proposto para `/v1/portal/exams/{id}/dossier` não habilita acesso clínico nesta etapa. Não apresentar instrumento, anotação técnica, laudo ou adendo enquanto a decisão estiver pendente.

A ação de ciência do resultado (`pec_ciencia_resultado`) está bloqueada por OD-R32-003/004; emissão e disponibilização não iniciam prazo. Entrevista devolutiva fica indisponível por OD-R32-004.

## Estados e conteúdo

Carregando; lista vazia; resultado disponível como metadado; erro; sem vínculo; nível insuficiente; dossiê indisponível por decisão. Rótulos seguem a trilha: médica “apto”, “apto com restrições”, “inapto temporário” ou “inapto”; psicológica “apto”, “inapto temporário” ou “inapto”. “Apto com validade diminuída” é atributo, não resultado. Nunca exibir `CONDICIONADO` ou `PENDENTE`.

## Assinatura, prazo e titularidade

Exibir nível de assinatura aplicado apenas quando informado pelo dono ([RN-PEC-142]); não presumir selo. Sem ciência registrada pelo dono, informar que o prazo começa quando houver ciência válida; não mostrar contador ou vencimento. O titular habilitado acessará o dossiê sem máscara após decisão; SUPORTE continua mascarado ([RN-PEC-153]).

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
