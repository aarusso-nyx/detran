---
id: IU-TEAT-ops-dashboard
title: Dashboard operacional
status: draft
apps: [teat]
updated: 2026-09-21
---

# Dashboard operacional

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [JRN-TEAT-002] passos 7–8; [ARCH-TEAT-FRONTENDS] §§5,6.3,9.
- Identidade: screenId `ops-dashboard`, uxCode `UX-WEB-003`, grupo `operations`, rota `/ux/web/ops-dashboard`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: permitir ao supervisor acompanhar a execução da fiscalização e identificar pendências operacionais da equipe.
- Campos e dados: turnos ativos e mapa de agentes/equipes; resumo da operação com AITs lavrados, medidas aplicadas e itens ainda em sincronização ou conflito. Em operações de alcoolemia/remoção, acompanhar disponibilidade de etilômetro e espera por reboque nos termos de [JRN-TEAT-002].
- Ações/comandos: consultar o acompanhamento e abrir mapa, turnos ou mensagens da operação. Os dados de acompanhamento vêm do backend; esta visão não finaliza os atos de campo.
- Validações e estados: pendência de sincronização ou conflito permanece visível no resumo. Atualização web usa SSE de [ARCH-TEAT-FRONTENDS] §9 com fallback de polling de 15 s; ausência de atualização não equivale a operação sem pendências.
- Critérios e fonte fechada: [JRN-TEAT-002] passos 7–8 fecha o acompanhamento e o resumo; [UC-TEAT-005] AC-TEAT-005-4/5 exige conflitos e falhas explícitos. As fontes não definem metas numéricas nem fórmulas adicionais de produtividade para este painel.

## Navegação autoritativa

1. `ops-map`
2. `active-shifts`
3. `operation-messages`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
