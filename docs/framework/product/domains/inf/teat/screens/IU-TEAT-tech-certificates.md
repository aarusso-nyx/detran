---
id: IU-TEAT-tech-certificates
title: Certificados
status: draft
apps: [teat]
updated: 2026-09-21
---

# Certificados

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [teat-frontends.md] §9, [WF-TEAT-002].
- Identidade: screenId `tech-certificates`, uxCode `UX-WEB-122`, grupo `technical`, rota `/ux/web/tech-certificates`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `integration-operator`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: certificado, validade e estado de verificação.
- Ações/comandos: consultar certificado e estado técnico.
- Validações e estados: não retransmite fila nem publica pacote normativo.
- Critérios e fonte fechada: [teat-frontends.md] §5.

## Navegação autoritativa

1. `tech-integrations`
2. `tech-health`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
