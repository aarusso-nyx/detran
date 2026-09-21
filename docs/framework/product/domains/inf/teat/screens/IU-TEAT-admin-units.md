---
id: IU-TEAT-admin-units
title: Unidades
status: draft
apps: [teat]
updated: 2026-09-21
---

# Unidades

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§5,8–9; [ARCH-TEAT-BUILD-PACK] WP-T1; [JRN-TEAT-001].
- Identidade: screenId `admin-units`, uxCode `UX-WEB-101`, grupo `admin`, rota `/ux/web/admin-units`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar as unidades do órgão que compõem o contexto operacional de agentes e turnos.
- Campos e dados: registros `agency_unit` do contexto `ops/agency`, relação com o órgão e vínculos de agentes/unidades disponibilizados pelo backend. A unidade também integra o catálogo de bootstrap e a seleção de abertura de turno, distinta de equipe, viatura e operação.
- Ações/comandos: consultar a unidade e navegar para usuários/agentes, órgão ou competências. A página administrativa é de leitura; não cria vínculo funcional ou movimenta um agente entre unidades por navegação.
- Validações e estados: abertura de turno usa unidade do catálogo autorizado; vínculo inválido mantém o erro TEAT.AGENT_NOT_IN_UNIT. A consulta não substitui a checagem de competência territorial do ato nem introduz enum de unidade não publicado.
- Critérios e fonte fechada: [ARCH-TEAT-BUILD-PACK] WP-T1 fecha `agency_unit`; [ARCH-TEAT-FRONTENDS] §§8–9 fecha unidade no contexto do turno. [JRN-TEAT-001] passo 1 distingue unidade/equipe/viatura, e §5 limita a superfície administrativa a leitura.

## Navegação autoritativa

1. `admin-users-agents`
2. `admin-orgs`
3. `admin-competencies`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
