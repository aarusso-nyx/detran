---
id: IU-TEAT-ait-timeline
title: Timeline do AIT
status: draft
apps: [teat]
updated: 2026-09-21
---

# Timeline do AIT

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [WF-TEAT-001]; [RN-TEAT-004]; [UC-TEAT-006]; [UC-TEAT-011]; [RN-TEAT-112].
- Identidade: screenId `ait-timeline`, uxCode `UX-WEB-081`, grupo `audit`, rota `/ux/web/ait-timeline`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `auditor`, `traffic-authority`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: reconstruir cronologicamente a história de um AIT, da finalização às decisões e ao processamento na retaguarda.
- Campos e dados: `AitStatusHistory`, finalização e `content_hash`, protocolo de recebimento, resultados de validação, decisões de aceite/rejeição, correções apensas e eventos de impressão/integração. Correção expõe campo, valor anterior/novo, justificativa, operador e autoridade aprovadora.
- Ações/comandos: consultar os eventos do auto e abrir seu detalhe, a auditoria de consultas externas ou o pacote probatório. A linha do tempo não reaplica comandos antigos ao navegar.
- Validações e estados: a sequência usa os estados de [WF-TEAT-001] e preserva conteúdo original verificável; pedido e decisão pós-finalização permanecem apensos. Evento de impressão com falha não desfaz finalização nem gera outro auto.
- Critérios e fonte fechada: AC-TEAT-006-3/6 e AC-TEAT-011-1/4 exigem trilha completa e preservação do estado/conteúdo; [RN-TEAT-004] e AC-TEAT-001-7 preservam o ato diante da impressão. Cada operação mantém o mínimo auditável de [RN-TEAT-112].

## Navegação autoritativa

1. `ait-detail`
2. `external-queries-audit`
3. `probative-package`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
