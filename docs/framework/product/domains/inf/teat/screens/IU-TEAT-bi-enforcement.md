---
id: IU-TEAT-bi-enforcement
title: BI fiscalização
status: draft
apps: [teat]
updated: 2026-09-21
---

# BI fiscalização

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; journeys.json (bi-dashboard); [JRN-TEAT-001] §Métricas; [JRN-TEAT-002] passo 8; [ARCH-TEAT-FRONTENDS] §§3,5,6.3.
- Identidade: screenId `bi-enforcement`, uxCode `UX-WEB-090`, grupo `bi`, rota `/ux/web/bi-enforcement`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `bi-analyst`, `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: apoiar a leitura da atividade de fiscalização a partir dos atos e resultados operacionais registrados.
- Campos e dados: projeções fornecidas pelo backend sobre AITs lavrados, medidas aplicadas e atos sincronizados/pendentes, que compõem os resumos de turno/operação; `KpiTile` é o componente previsto para indicadores. Não há meta quantitativa de produtividade ou fórmula de agregação definida para esta página.
- Ações/comandos: consultar os dados de fiscalização e seguir para a caixa de entrada de AIT, painel operacional ou qualidade, verificando os registros que sustentam a leitura.
- Validações e estados: reenvio do mesmo ato não representa nova autuação; atos pendentes não são apresentados como recebidos. A visão respeita tenant/papel e não toma decisões de mérito nem calcula prazo legal no navegador.
- Critérios e fonte fechada: [JRN-TEAT-002] passo 8 fecha os dados de resumo; [JRN-TEAT-001] §Métricas e AC-TEAT-005-1 sustentam unicidade e acompanhamento da sincronização. journeys.json fecha a jornada BI; não autoriza inventar séries, ranking de agentes ou metas de autuação.

## Navegação autoritativa

1. `ait-inbox`
2. `ops-dashboard`
3. `bi-quality`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
