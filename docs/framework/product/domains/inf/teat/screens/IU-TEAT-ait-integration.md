---
id: IU-TEAT-ait-integration
title: Integração RENAINF/estadual
status: draft
apps: [teat]
updated: 2026-09-21
---

# Integração RENAINF/estadual

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [WF-TEAT-001] §Ponte; [ARCH-TEAT-FRONTENDS] §§1,7,9; [ARCH-TEAT-ERRORS] §8.
- Identidade: screenId `ait-integration`, uxCode `UX-WEB-027`, grupo `ait`, rota `/ux/web/ait-integration`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: acompanhar a passagem de AIT aceito à integração downstream e localizar falhas de entrega/processamento.
- Campos e dados: identificação do AIT, estado legal, protocolo de recebimento e resultado de integração associado; lotes/itens e respectivas falhas são consultados nas superfícies técnicas. O protocolo de chegada do dispositivo não comprova a integração downstream.
- Ações/comandos: consultar a situação do auto e seguir para filas, integrações técnicas ou BI de integrações. A retransmissão pertence ao fluxo técnico autorizado; esta página não cria nova infração por reenvio nem consulta sistema nacional diretamente.
- Validações e estados: [WF-TEAT-001] exige `ACEITO → INTEGRADO → PROCESSADO`; `ACEITO → INTEGRADO` emite AIT_INTEGRADO para o ciclo de infração. Rejeição legal bloqueia integração. Indisponibilidade externa permanece pendência explícita e preserva o código do backend.
- Critérios e fonte fechada: [WF-TEAT-001] §Ponte e [ARCH-TEAT-FRONTENDS] §§1,7,9 fecham evento, fronteira e acompanhamento. TEAT.INTEGRATION_UPSTREAM_REJECTED identifica rejeição externa; TEAT.INTEGRATION_ITEM_NOT_FAILED impede retry indevido na fila técnica. Prazos legais downstream não são recalculados aqui.

## Navegação autoritativa

1. `tech-queues`
2. `tech-integrations`
3. `bi-integrations`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
