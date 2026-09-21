---
id: IU-TEAT-admin-competencies
title: Convênios e competências
status: draft
apps: [teat]
updated: 2026-09-21
---

# Convênios e competências

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [WF-TEAT-003], [RN-TEAT-003], [RN-TEAT-143].
- Identidade: screenId `admin-competencies`, uxCode `UX-WEB-105`, grupo `admin`, rota `/ux/web/admin-competencies`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: convênio, circunscrição e competência.
- Ações/comandos: administrar competência parametrizada.
- Validações e estados: cadeia de delegação é auditável e antecede ato de campo.
- Critérios e fonte fechada: [RN-TEAT-143].

## Navegação autoritativa

1. `norm-rules`
2. `admin-orgs`
3. `operations-list`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
