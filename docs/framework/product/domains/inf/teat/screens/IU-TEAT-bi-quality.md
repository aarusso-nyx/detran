---
id: IU-TEAT-bi-quality
title: BI qualidade
status: draft
apps: [teat]
updated: 2026-09-21
---

# BI qualidade

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; journeys.json (bi-dashboard); [UC-TEAT-006]; [RN-TEAT-119]; [ARCH-TEAT-FRONTENDS] §§3,5,6.3.
- Identidade: screenId `bi-quality`, uxCode `UX-WEB-092`, grupo `bi`, rota `/ux/web/bi-quality`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `bi-analyst`, `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: permitir a análise da qualidade dos autos pela consistência, tratamento de erros e rastreabilidade das decisões.
- Campos e dados: resultados de validação, classificação saneável/não saneável, correções aprovadas e rejeições com fundamento; os dados vêm das projeções do backend e se relacionam às filas e à auditoria. A fonte não fecha denominador, meta ou fórmula para uma taxa de qualidade.
- Ações/comandos: consultar a visão analítica e aprofundar a análise na validação, nos autos rejeitados ou nos eventos de auditoria; a página não corrige nem rejeita autos por resultado de indicador.
- Validações e estados: distinguir os desfechos aceito, corrigido e arquivado/insubsistente, preservando a classificação e a decisão humana. Vício essencial não é contabilizado como saneamento autorizado nem resolvido por score automático.
- Critérios e fonte fechada: AC-TEAT-006-1/3/4/5/6 fecha classificação, trilha e preservação do conteúdo; [RN-TEAT-119] define os três desfechos. [ARCH-TEAT-FRONTENDS] §6.3 fornece `KpiTile`, sem fixar indicadores ou limites adicionais.

## Navegação autoritativa

1. `ait-validation`
2. `ait-rejected`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
