---
id: IU-TEAT-tech-queues
title: Filas
status: draft
apps: [teat]
updated: 2026-09-21
---

# Filas

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [teat-frontends.md] §9, [WF-TEAT-002].
- Identidade: screenId `tech-queues`, uxCode `UX-WEB-121`, grupo `technical`, rota `/ux/web/tech-queues`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `integration-operator`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: item de integração, falha e recibo.
- Ações/comandos: retransmitir somente item falho e consultar fila.
- Validações e estados: retry de item que não falhou é rejeitado; não altera configuração de integração.
- Critérios e fonte fechada: TEAT.INTEGRATION_ITEM_NOT_FAILED.

## Navegação autoritativa

1. `tech-jobs`
2. `ait-integration`
3. `renaest-integration`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
