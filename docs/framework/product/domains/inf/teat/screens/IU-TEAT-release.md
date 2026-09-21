---
id: IU-TEAT-release
title: Liberação
status: draft
apps: [teat]
updated: 2026-09-21
---

# Liberação

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [UC-TEAT-008], [UC-TEAT-009], [WF-TEAT-004].
- Identidade: screenId `release`, uxCode `UX-WEB-043`, grupo `measures`, rota `/ux/web/release`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: medida elegível, motivo e registro de liberação.
- Ações/comandos: registrar liberação autorizada.
- Validações e estados: liberação só ocorre no estado permitido.
- Critérios e fonte fechada: TEAT.MEASURE_RELEASE_NOT_ALLOWED.

## Navegação autoritativa

1. `measure-detail`
2. `measures-list`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
