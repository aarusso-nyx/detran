---
id: IU-TEAT-ait-sanitization-queue
title: AIT pendentes de saneamento
status: draft
apps: [teat]
updated: 2026-09-21
---

# AIT pendentes de saneamento

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-006] passos 1–4; [RN-TEAT-006]; [RN-TEAT-119]; [WF-TEAT-001].
- Identidade: screenId `ait-sanitization-queue`, uxCode `UX-WEB-022`, grupo `ait`, rota `/ux/web/ait-sanitization-queue`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: reunir inconsistências tratáveis para análise do operador e encaminhamento ao procedimento formal de correção.
- Campos e dados: AIT recebido, resultado da validação, classificação saneável, estado atual e referência a pedido/correção quando existente. A classificação da inconsistência permanece explícita e consultável junto ao auto.
- Ações/comandos: selecionar o AIT, abrir seu detalhe e entrar no formulário de saneamento. Pedido `request-correction` e aprovação têm dados e guardas no procedimento específico; selecionar uma linha da fila não aprova a correção.
- Validações e estados: [UC-TEAT-006] mantém o auto saneável em `VALIDANDO` antes do pedido, que o move a `PENDENTE_CORRECAO`; aprovação pela autoridade resulta em `CORRIGIDO`. Elemento essencial não pode ser tratado como erro material corrigível.
- Critérios e fonte fechada: AC-TEAT-006-1/2/3 fecha a elegibilidade e a trilha que o procedimento deverá produzir. [RN-TEAT-119] reserva à autoridade a lista formal de campos corrigíveis; esta fila não amplia essa lista nem inventa prioridade ou prazo de saneamento.

## Navegação autoritativa

1. `ait-sanitize`
2. `ait-detail`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
