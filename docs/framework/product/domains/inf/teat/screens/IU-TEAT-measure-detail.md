---
id: IU-TEAT-measure-detail
title: Detalhe de medida
status: draft
apps: [teat]
updated: 2026-09-21
---

# Detalhe de medida

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [UC-TEAT-008], [UC-TEAT-009], [WF-TEAT-004].
- Identidade: screenId `measure-detail`, uxCode `UX-WEB-041`, grupo `measures`, rota `/ux/web/measure-detail`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: medida, termo, prazo, custódia e desfecho.
- Ações/comandos: consultar e tratar a medida autorizada.
- Validações e estados: estado e liberação são controlados pelo backend.
- Critérios e fonte fechada: [WF-TEAT-004].

## Navegação autoritativa

1. `evidence-viewer`
2. `removals`
3. `release`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
