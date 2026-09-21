---
id: IU-TEAT-tech-health
title: Saúde do sistema
status: draft
apps: [teat]
updated: 2026-09-21
---

# Saúde do sistema

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [teat-frontends.md] §9, [WF-TEAT-002].
- Identidade: screenId `tech-health`, uxCode `UX-WEB-124`, grupo `technical`, rota `/ux/web/tech-health`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `integration-operator`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: indicadores de saúde do sistema e dependências.
- Ações/comandos: consultar saúde e navegar ao diagnóstico responsável.
- Validações e estados: não executa retransmissão, renovação de certificado ou job.
- Critérios e fonte fechada: [teat-frontends.md] §5.

## Navegação autoritativa

1. `tech-queues`
2. `tech-integrations`
3. `bi-integrations`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
