---
id: IU-TEAT-custody-chain
title: Cadeia de custódia
status: draft
apps: [teat]
updated: 2026-09-21
---

# Cadeia de custódia

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [RN-TEAT-002], [RN-TEAT-142].
- Identidade: screenId `custody-chain`, uxCode `UX-WEB-072`, grupo `evidence`, rota `/ux/web/custody-chain`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `auditor`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: eventos de custódia, ator, finalidade e entrega.
- Ações/comandos: consultar cadeia e registrar requisição autorizada.
- Validações e estados: integridade, confidencialidade e autenticidade são preservadas.
- Critérios e fonte fechada: [RN-TEAT-002], [RN-TEAT-142].

## Navegação autoritativa

1. `probative-package`
2. `audit-events`
3. `evidence-viewer`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
