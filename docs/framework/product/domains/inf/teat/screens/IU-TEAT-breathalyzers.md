---
id: IU-TEAT-breathalyzers
title: Etilômetros
status: draft
apps: [teat]
updated: 2026-09-21
---

# Etilômetros

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [UC-TEAT-007], [RN-TEAT-133]…[RN-TEAT-136].
- Identidade: screenId `breathalyzers`, uxCode `UX-WEB-051`, grupo `alcohol`, rota `/ux/web/breathalyzers`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: etilômetro, verificação e cadeia metrológica.
- Ações/comandos: consultar instrumento e sua verificação.
- Validações e estados: instrumento não verificado não pode suportar o procedimento.
- Critérios e fonte fechada: TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED.

## Navegação autoritativa

1. `alcohol-procedures`
2. `norm-rules`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
