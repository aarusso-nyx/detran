---
id: IU-TEAT-probative-package
title: Pacote probatório
status: draft
apps: [teat]
updated: 2026-09-21
---

# Pacote probatório

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [RN-TEAT-002], [RN-TEAT-142].
- Identidade: screenId `probative-package`, uxCode `UX-WEB-073`, grupo `evidence`, rota `/ux/web/probative-package`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `auditor`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: itens do pacote, hash e completude.
- Ações/comandos: montar e consultar pacote probatório.
- Validações e estados: pacote incompleto é bloqueado.
- Critérios e fonte fechada: TEAT.PROBATIVE_PACKAGE_INCOMPLETE.

## Navegação autoritativa

1. `audit-events`
2. `ait-timeline`
3. `evidence-search`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
