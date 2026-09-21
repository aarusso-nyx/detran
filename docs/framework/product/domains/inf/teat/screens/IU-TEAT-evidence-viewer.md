---
id: IU-TEAT-evidence-viewer
title: Visualizador de evidência
status: draft
apps: [teat]
updated: 2026-09-21
---

# Visualizador de evidência

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [RN-TEAT-002], [RN-TEAT-142].
- Identidade: screenId `evidence-viewer`, uxCode `UX-WEB-071`, grupo `evidence`, rota `/ux/web/evidence-viewer`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `auditor`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: evidência, hash, metadados e restrição de acesso.
- Ações/comandos: consultar evidência e abrir custódia/pacote autorizado.
- Validações e estados: bodycam não é acervo de consulta livre; acesso exige requisição formal.
- Critérios e fonte fechada: [RN-TEAT-142].

## Navegação autoritativa

1. `custody-chain`
2. `probative-package`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
