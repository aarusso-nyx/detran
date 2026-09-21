---
id: IU-TEAT-dashboard-home
title: Dashboard inicial
status: draft
apps: [teat]
updated: 2026-09-21
---

# Dashboard inicial

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§3,5,10.
- Identidade: screenId `dashboard-home`, uxCode `UX-WEB-002`, grupo `entry`, rota `/ux/web/dashboard-home`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`, `technical-admin`, `auditor`, `bi-analyst`, `integration-operator`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: apresentar a entrada do console conforme o papel autenticado, reunindo os acessos a acompanhamento operacional, processamento de AIT e inteligência de fiscalização.
- Campos e dados: contexto de usuário/tenant e permissões da sessão, no shell `@detran/ui` com `role-home`. Os três acessos de produto são painel operacional, caixa de entrada de AIT e BI de fiscalização; não há fórmula de indicador inicial definida nas fontes fechadas.
- Ações/comandos: escolher um desses acessos e navegar para a área autorizada. O painel de entrada não aceita, rejeita ou altera autos e não substitui os comandos das áreas de destino.
- Validações e estados: cada acesso aplica os papéis da tela de destino; estar autenticado no painel não confere permissão de processamento, administração ou BI. A ausência de permissão é distinguida da ausência de registros de uma área.
- Critérios e fonte fechada: [ARCH-TEAT-FRONTENDS] §§3,5,10 e matriz web fecham shell, contexto de papel e os três destinos. Não há fonte para acrescentar cartões com metas, contagens ou ações administrativas ao painel.

## Navegação autoritativa

1. `ops-dashboard`
2. `ait-inbox`
3. `bi-enforcement`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
