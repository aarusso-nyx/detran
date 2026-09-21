---
id: IU-TEAT-admin-orgs
title: Órgãos
status: draft
apps: [teat]
updated: 2026-09-21
---

# Órgãos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§3,5; [ARCH-TEAT-BUILD-PACK] WP-T1/OD-T02; [RN-TEAT-112]; [RN-TEAT-143].
- Identidade: screenId `admin-orgs`, uxCode `UX-WEB-100`, grupo `admin`, rota `/ux/web/admin-orgs`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar o contexto do órgão responsável pela fiscalização e sua relação com unidades, circunscrição e competências.
- Campos e dados: identificação do órgão autuador e contexto de unidades, competências e circunscrições do módulo mínimo `ops/agency`. As fontes não fecham um formulário cadastral de CNPJ, endereço ou contatos nesta página; o corte H.40 não inclui cadastro de convênios.
- Ações/comandos: consultar o órgão e seguir para unidades, competências ou auditoria. [ARCH-TEAT-FRONTENDS] §5 define as páginas administrativas derivadas de cadastros como leitura; esta ficha não acrescenta criação/alteração de órgãos.
- Validações e estados: contexto do órgão permanece limitado ao tenant autorizado. Dados do AIT pertencem ao órgão autuador; consultar um cadastro não comprova instrumento de delegação nem autoriza atuação fora da circunscrição.
- Critérios e fonte fechada: [ARCH-TEAT-BUILD-PACK] WP-T1/OD-T02 fecha unidade, competência e circunscrição; [RN-TEAT-112] protege o destino dos autos e [RN-TEAT-143] exige prova de delegação por ato quando aplicável. O limite de convênios é preservado, sem supor seu instrumento a partir do cadastro.

## Navegação autoritativa

1. `admin-units`
2. `admin-competencies`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
