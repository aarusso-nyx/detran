---
id: IU-PEC-P-05
title: Acompanhar meu recurso
status: draft
apps: [portal]
sources:
  [IU-PEC-001, UC-PEC-010, RN-PEC-112, RN-PEC-150, RN-PEC-151, RN-PEC-153]
updated: 2026-09-30
---

# Acompanhar meu recurso

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 05. Módulo `exames`; rota `exames/:examId/revisao e exames/:examId/recurso/novo`. App `portal`.

## Acesso

A leitura exige `consulta_exame` e vínculo válido. Ações de recurso exigiriam nível próprio; nenhuma linha nova de nível é ativada enquanto OD-R32-002 estiver pendente.

## Dados e comandos

Acompanhar somente metadados da `portal.pec_review_view`: etapa, decisão e prazos atestados pelo dono. Junta Especial sem prazo normativo para designação/decisão deve mostrar “sem prazo definido em norma”. Não criar prazo por analogia.

O recurso a Junta Especial permanece bloqueado por OD-R32-004/002. Se futuramente autorizado, depende de decisão UPHELD, ciência registrada da decisão e prazo calculado pelo dono; remessa tem prazo de 20 dias úteis calculado pelo servidor.

## Estados e conteúdo

Carregando; andamento disponível; nenhum caso; erro; sem vínculo; nível insuficiente; ação bloqueada por decisão; prazo do órgão sem número normativo. Não inferir estado jurídico a partir de ausência de evento.

## Prazos

Exibir prazo do candidato como “até quando você pode agir”, separado do prazo do órgão. A interface não calcula dias corridos/úteis; todas as datas vêm do servidor com seu marco inicial.

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
