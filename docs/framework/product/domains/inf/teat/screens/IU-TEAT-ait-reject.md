---
id: IU-TEAT-ait-reject
title: Rejeição de AIT
status: draft
apps: [teat]
updated: 2026-09-21
---

# Rejeição de AIT

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-006] exceção 1a e AC-TEAT-006-4/5; [RN-TEAT-006]; [RN-TEAT-119]; [WF-TEAT-001].
- Identidade: screenId `ait-reject`, uxCode `UX-WEB-026`, grupo `ait`, rota `/ux/web/ait-reject`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: registrar a rejeição formal do AIT pela autoridade, com fundamento legal e histórico preservado.
- Campos e dados: identificação e conteúdo original do auto, motivo padronizado, observação, base legal da rejeição e autoridade responsável pela decisão; o resultado fica apenso à trilha do ato.
- Ações/comandos: `traffic-authority` confirma `reject`, que registra `ait.rejected` e impede a integração. Os demais papéis com acesso à página não recebem poder de decisão por esse acesso.
- Validações e estados: a rejeição exige motivo/base legal; ausência retorna TEAT.AIT_REJECT_REASON_REQUIRED. O desfecho `REJEITADO` por inconsistência corresponde a arquivamento com registro insubsistente, CTB art. 281 §1º I. TEAT.AIT_STATE_INVALID impede decisão em estado incompatível; nenhuma rejeição é automatizada.
- Critérios e fonte fechada: [WF-TEAT-001] fecha o comando da autoridade e o bloqueio de integração; [RN-TEAT-119] fecha o fundamento de arquivamento. AC-TEAT-006-4/5 exige decisão humana, motivo, observação e consultabilidade permanente da trilha, sem apagar o ato original.

## Navegação autoritativa

1. `ait-rejected`
2. `ait-detail`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
