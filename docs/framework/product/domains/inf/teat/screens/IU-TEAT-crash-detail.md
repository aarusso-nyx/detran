---
id: IU-TEAT-crash-detail
title: Detalhe de sinistro
status: draft
apps: [teat]
updated: 2026-09-21
---

# Detalhe de sinistro

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [APP-BOAT], [teat-frontends.md] §5.
- Identidade: screenId `crash-detail`, uxCode `UX-WEB-061`, grupo `crashes`, rota `/ux/web/crash-detail`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- **BOAT:** esta superfície de sinistro pertence ao BOAT; TEAT apenas expõe a extensão ou vínculo autorizado, sem redefinir o domínio.

## Contrato transcrito

- Campos e dados: dados, comandos e estados de sinistro de Detalhe de sinistro pertencem ao BOAT.
- Ações/comandos: abrir somente a extensão BOAT ou vínculo autorizado para crash-detail.
- Validações e estados: TEAT não redefine contrato, decisão ou estado de sinistro.
- Critérios e fonte fechada: [APP-BOAT], [teat-frontends.md] §5.

## Navegação autoritativa

1. `crash-complement`
2. `evidence-viewer`
3. `ait-inbox`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
