---
id: IU-PEC-P-03
title: Entender minha restrição
status: draft
apps: [portal]
sources: [IU-PEC-001, UC-PEC-011, RN-PEC-105, RN-PEC-150, RN-PEC-151]
updated: 2026-09-30
---

# Entender minha restrição

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 03. Módulo `exames`; rota `exames/:examId/restricoes`. App `portal`.

## Acesso

Consulta com `consulta_exame` e vínculo do titular; a rota de restrições passa pela porta do dono. Novo acesso a conteúdo clínico aguarda decisão de OD-R32-005.

## Dados e comandos

Códigos e explicações de restrição só podem ser mostrados se a porta devolver conteúdo autorizado. A explicação baseada no Anexo XV não está confirmada (DT-022); não inventar descrição ou código. Nenhuma leitura direta de `ch` no navegador.

Sem comando nesta tela. A consulta de códigos e restrições aplicadas ocorre somente pelo backend Portal/porta do dono.

## Estados e conteúdo

Carregando; restrições disponíveis quando autorizadas; nenhuma restrição; erro; sem vínculo; nível insuficiente; conteúdo bloqueado por OD-R32-005; explicação de Anexo XV bloqueada por DT-022/`source_pending`. Não tratar 403, 404 ou 422 como lista vazia.

## Apresentação

Usar apenas vocabulário legal por trilha e não exibir `CONDICIONADO` ou `PENDENTE`. Se houver documento/laudo autorizado, mostrar o nível de assinatura efetivamente aplicado. Explicar cada bloqueio por texto, não só cor ou ícone.

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
