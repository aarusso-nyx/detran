---
id: IU-TEAT-norm-rules
title: Regras de validação
status: draft
apps: [teat]
updated: 2026-09-21
---

# Regras de validação

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [WF-TEAT-003], [RN-TEAT-108].
- Identidade: screenId `norm-rules`, uxCode `UX-WEB-112`, grupo `normative`, rota `/ux/web/norm-rules`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: regra normativa, versão e estado.
- Ações/comandos: consultar ou administrar regra autorizada.
- Validações e estados: regra integra catálogo ativo e pacote verificável.
- Critérios e fonte fechada: [WF-TEAT-003].

## Navegação autoritativa

1. `norm-templates`
2. `norm-mobile-packages`
3. `ait-validation`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
