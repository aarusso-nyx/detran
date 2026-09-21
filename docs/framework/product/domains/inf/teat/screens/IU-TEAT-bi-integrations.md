---
id: IU-TEAT-bi-integrations
title: BI integração
status: draft
apps: [teat]
updated: 2026-09-21
---

# BI integração

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; journeys.json (bi-dashboard, integration-monitoring); [UC-TEAT-005]; [WF-TEAT-001]; [ARCH-TEAT-FRONTENDS] §§7,9.
- Identidade: screenId `bi-integrations`, uxCode `UX-WEB-093`, grupo `bi`, rota `/ux/web/bi-integrations`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `bi-analyst`, `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: acompanhar resultados e pendências de integração, permitindo localizar os lotes/itens que explicam falhas ou atraso de processamento.
- Campos e dados: projeções do backend sobre lotes, itens, recibos e resultados de integração; distinguir recebimento/aplicação da sincronização e integração downstream do AIT aceito. Falhas conservam o código recebido e a relação com o item/auto.
- Ações/comandos: consultar o panorama e abrir filas técnicas, integrações técnicas ou acompanhamento de integração de AIT. Retransmissão ocorre na operação técnica autorizada, não como ação implícita da visão BI.
- Validações e estados: item recebido não equivale a item aplicado; AIT aceito não equivale a AIT integrado. Retry idempotente não aumenta o número de atos e pendência externa não é contada como sucesso. A tela não define SLA, limiar de alerta ou fórmula de taxa não fornecidos pela fonte.
- Critérios e fonte fechada: AC-TEAT-005-1/3/4/5 fecha unicidade, recibo e falhas visíveis; [WF-TEAT-001] fecha `ACEITO → INTEGRADO`. [ARCH-TEAT-FRONTENDS] §§7,9 e journeys.json ligam a leitura analítica ao acompanhamento técnico sem chamadas nacionais diretas.

## Navegação autoritativa

1. `tech-queues`
2. `tech-integrations`
3. `ait-integration`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
