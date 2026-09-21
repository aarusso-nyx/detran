---
id: IU-TEAT-bi-crashes
title: BI sinistros
status: draft
apps: [teat]
updated: 2026-09-21
---

# BI sinistros

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [teat-frontends.md] §5.
- Identidade: screenId `bi-crashes`, uxCode `UX-WEB-091`, grupo `bi`, rota `/ux/web/bi-crashes`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `bi-analyst`, `traffic-authority`, `agency-admin`, `technical-admin`.
- **BOAT:** esta superfície de sinistro pertence ao BOAT; TEAT apenas expõe a extensão ou vínculo autorizado, sem redefinir o domínio.

## Contrato transcrito

- Campos e dados: dados, comandos e estados de sinistro de BI sinistros pertencem ao BOAT.
- Ações/comandos: abrir somente a extensão BOAT ou vínculo autorizado para bi-crashes.
- Validações e estados: TEAT não redefine contrato, decisão ou estado de sinistro.
- Critérios e fonte fechada: [APP-BOAT], [teat-frontends.md] §5.

## Navegação autoritativa

1. `crashes-list`
2. `crash-detail`
3. `bi-quality`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
