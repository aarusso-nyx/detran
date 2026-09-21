---
id: IU-TEAT-tech-jobs
title: Jobs
status: draft
apps: [teat]
updated: 2026-09-21
---

# Jobs

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [teat-frontends.md] §9, [WF-TEAT-002].
- Identidade: screenId `tech-jobs`, uxCode `UX-WEB-123`, grupo `technical`, rota `/ux/web/tech-jobs`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `integration-operator`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: job, execução, resultado e falha.
- Ações/comandos: consultar execução e resultado de job.
- Validações e estados: não opera certificados ou itens de fila pela mesma ação.
- Critérios e fonte fechada: [teat-frontends.md] §5.

## Navegação autoritativa

1. `tech-health`
2. `tech-queues`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
