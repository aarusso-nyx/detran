---
id: IU-TEAT-ait-inbox
title: Fila de AIT recebidos
status: draft
apps: [teat]
updated: 2026-09-21
---

# Fila de AIT recebidos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §6.3; [WF-TEAT-001]; [UC-TEAT-005]; [UC-TEAT-006].
- Identidade: screenId `ait-inbox`, uxCode `UX-WEB-020`, grupo `ait`, rota `/ux/web/ait-inbox`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: localizar os AITs recebidos na retaguarda e orientar seu acompanhamento até validação e integração.
- Campos e dados: `AitInbox` com identificação do auto, estado do AIT e filtros por estado, unidade e agente; protocolo de recebimento e contexto do auto vêm do backend. O estado do item de sincronização e o estado legal do AIT mantêm significados distintos.
- Ações/comandos: consultar e filtrar a fila, abrir o auto selecionado, acessar a validação ou acompanhar sua integração. A chegada de um auto à caixa de entrada não equivale a aceite pela autoridade.
- Validações e estados: distinguir `RECEBIDO`, `VALIDANDO`, `ACEITO` e os demais estados retornados por [WF-TEAT-001]; `SUSPEITO_CONCORRENCIA` não segue para processamento enquanto não apurado. Reenvio idempotente não cria outra linha como se fosse um novo auto.
- Critérios e fonte fechada: componente e filtros em [ARCH-TEAT-FRONTENDS] §6.3; AC-TEAT-005-1/3 para unicidade do auto/protocolo e AC-TEAT-012-2 para contenção de concorrência. A fonte não estabelece ordenação por prazo ou prioridade calculada no navegador.

## Navegação autoritativa

1. `ait-detail`
2. `ait-validation`
3. `ait-integration`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
