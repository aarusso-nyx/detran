---
id: IU-PEC-P-06
title: Meu exame toxicológico periódico
status: draft
apps: [portal]
sources: [IU-PEC-001, UC-PEC-012, RN-PEC-150, RN-PEC-151]
updated: 2026-09-30
---

# Meu exame toxicológico periódico

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 06. Módulo `exames`; rota `exames/toxicologico`. App `portal`.

## Acesso

Consulta com `consulta_exame` e vínculo do titular quando disponível.

## Dados e comandos

A projeção `portal.pec_tox_view` depende de produtor legítimo de evento, que ainda não existe. A base atual possui consultas e callback de integração, mas não evento consumível pelo Portal. Não inferir resultado a partir de callback nem mostrar dados laboratoriais.

Nenhum comando cidadão está definido. Consultas do domínio passam pelo backend Portal/porta; o navegador não chama `v1/ch/*`.

## Estados e conteúdo

Indisponível por falta de evento produtor; carregando; erro; sem vínculo. Não exibir sucesso, resultado, validade ou suspensão sem projeção autorizada.

## Privacidade

O alerta nacional é referência opaca e não deve expor material biológico ou valor laboratorial. Não gravar conteúdo sensível em cache persistente, telemetria, log ou SSE.

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
