---
id: IU-TEAT-admin-devices
title: Dispositivos
status: draft
apps: [teat]
updated: 2026-09-21
---

# Dispositivos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [WF-TEAT-003], [RN-TEAT-003], [RN-TEAT-143].
- Identidade: screenId `admin-devices`, uxCode `UX-WEB-104`, grupo `admin`, rota `/ux/web/admin-devices`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: dispositivo, postura, versão e homologação interna.
- Ações/comandos: administrar dispositivo conforme política.
- Validações e estados: alteração mantém trilha de auditoria e não substitui homologação federal.
- Critérios e fonte fechada: [RN-TEAT-003], [WF-TEAT-003].

## Navegação autoritativa

1. `tech-health`
2. `admin-users-agents`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
