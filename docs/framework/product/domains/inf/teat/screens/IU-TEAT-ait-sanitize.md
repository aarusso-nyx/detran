---
id: IU-TEAT-ait-sanitize
title: Saneamento de AIT
status: draft
apps: [teat]
updated: 2026-09-21
---

# Saneamento de AIT

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [UC-TEAT-006], [UC-TEAT-011], [WF-TEAT-001], [RN-TEAT-006].
- Identidade: screenId `ait-sanitize`, uxCode `UX-WEB-025`, grupo `ait`, rota `/ux/web/ait-sanitize`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: Preparar correção saneável preservando o conteúdo congelado e a trilha de alteração.
- Campos e dados: campo alterado, valor anterior, valor novo, justificativa, operador, autoridade aprovadora e data de correção.
- Ações/comandos: Solicitar e submeter correção; encaminhar para aprovação de traffic-authority.
- Validação, guardas e estados: Fato essencial (enquadramento, data/hora ou local) é proibido; justificativa, valores anterior/novo e atores são obrigatórios.
- Critério de aceite: AC-TEAT-006-1…6; [RN-TEAT-006].

## Navegação autoritativa

1. `ait-detail`
2. `ait-validation`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
