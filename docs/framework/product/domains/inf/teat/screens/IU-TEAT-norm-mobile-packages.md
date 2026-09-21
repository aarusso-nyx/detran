---
id: IU-TEAT-norm-mobile-packages
title: Pacotes mobile
status: draft
apps: [teat]
updated: 2026-09-21
---

# Pacotes mobile

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: matriz web de paridade, [WF-TEAT-003], [RN-TEAT-108].
- Identidade: screenId `norm-mobile-packages`, uxCode `UX-WEB-114`, grupo `normative`, rota `/ux/web/norm-mobile-packages`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: catálogo ativo, versão, validade, manifest_hash e conteúdo.
- Ações/comandos: gerar, publicar, validar, retirar e consultar pacote.
- Validações e estados: ciclo fechado: RASCUNHO_PKG → PUBLICADO_PKG → VALIDADO_PKG ou RETIRADO_PKG; catálogo ativo e manifest_hash conferente são obrigatórios.
- Critérios e fonte fechada: [WF-TEAT-003], TEAT.PACKAGE_CATALOG_NOT_ACTIVE, TEAT.PACKAGE_MANIFEST_MISMATCH.

## Navegação autoritativa

1. `tech-queues`
2. `tech-health`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
