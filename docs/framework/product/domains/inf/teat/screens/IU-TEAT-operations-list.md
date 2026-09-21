---
id: IU-TEAT-operations-list
title: Lista de operações
status: draft
apps: [teat]
updated: 2026-09-21
---

# Lista de operações

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [JRN-TEAT-002] passos 1–6; [ARCH-TEAT-FRONTENDS] §§3,5,7.
- Identidade: screenId `operations-list`, uxCode `UX-WEB-005`, grupo `operations`, rota `/ux/web/operations-list`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: localizar operações de fiscalização programadas e iniciar o planejamento autorizado de uma nova operação.
- Campos e dados: coleção de `Operation` com tipo (`operation_type`), início/fim planejados (`planned_start_at`, `planned_end_at`), objetivos e estado informado pelo backend; criação parte de `status = planned` conforme [JRN-TEAT-002].
- Ações/comandos: consultar e selecionar operação; `field-supervisor` ou `agency-admin` cria o planejamento com os dados citados. A leitura do agente não habilita esse comando; composição de equipe e acompanhamento seguem no contexto da operação.
- Validações e estados: separar operação planejada de operação em execução usando o estado retornado. A fonte não fecha um enum completo de estados, regras de sobreposição de horário ou comando de exclusão, que não são adicionados por esta ficha.
- Critérios e fonte fechada: [JRN-TEAT-002] passos 1 e 6 fecha os dados de planejamento e a abertura para execução; [ARCH-TEAT-FRONTENDS] §§3,7 separa consulta de campo e configuração por supervisor/admin.

## Navegação autoritativa

1. `operation-detail`
2. `ops-dashboard`
3. `operation-messages`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
