---
id: IU-TEAT-norm-catalogs
title: Catálogos normativos
status: draft
apps: [teat]
updated: 2026-09-21
---

# Catálogos normativos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [WF-TEAT-003]; [ARCH-TEAT-FRONTENDS] §§3,5–7.
- Identidade: screenId `norm-catalogs`, uxCode `UX-WEB-110`, grupo `normative`, rota `/ux/web/norm-catalogs`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: acompanhar a versão normativa usada pelos atos e controlar a publicação/retirada do catálogo do órgão.
- Campos e dados: catálogo e versão, estado, enquadramentos, regras e templates que o compõem, com referência ao pacote mobile derivado. O histórico permanece consultável para atos já emitidos mesmo após retirada.
- Ações/comandos: consultar componentes e pacotes; `agency-admin` e `technical-admin` executam `publish` ou `retire` conforme o estado permitido. Autoridade tem leitura normativa; publicar catálogo não publica automaticamente um pacote mobile.
- Validações e estados: publicação aceita catálogo em rascunho ou já ativo, resultando em `ATIVO_CAT`; retirada aceita somente ativo e resulta em `RETIRADO_CAT`. Pacote mobile só pode ser publicado se o catálogo referenciado estiver ativo; retirar catálogo impede novas referências, sem reescrever o pacote registrado em atos antigos.
- Critérios e fonte fechada: [WF-TEAT-003] fecha estados, atores, eventos de publicação/retirada e rastreabilidade por versão. TEAT.CATALOG_STATE_INVALID trata comando incompatível e TEAT.PACKAGE_CATALOG_NOT_ACTIVE preserva o vínculo de publicação. A fonte não fixa política de expurgo de versões retiradas.

## Navegação autoritativa

1. `norm-violations`
2. `norm-mobile-packages`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
