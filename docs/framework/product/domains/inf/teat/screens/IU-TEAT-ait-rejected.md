---
id: IU-TEAT-ait-rejected
title: AIT rejeitados
status: draft
apps: [teat]
updated: 2026-09-21
---

# AIT rejeitados

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-006] exceção 1a e AC-TEAT-006-4/5; [RN-TEAT-119]; [WF-TEAT-001].
- Identidade: screenId `ait-rejected`, uxCode `UX-WEB-023`, grupo `ait`, rota `/ux/web/ait-rejected`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: manter consultáveis os autos rejeitados e a decisão que impediu sua integração.
- Campos e dados: identificação e conteúdo original do AIT, estado `REJEITADO`, motivo padronizado, observação, fundamento legal, autoridade responsável e trilha da decisão. A rejeição por inconsistência corresponde ao arquivamento com registro insubsistente.
- Ações/comandos: consultar o histórico, abrir o detalhe do auto ou o registro de rejeição e acessar a auditoria. A listagem não apaga o auto nem repete automaticamente a decisão.
- Validações e estados: o evento `ait.rejected` conserva motivo e trilha; o ato rejeitado não é integrado. A abertura da tela de rejeição respeita o estado atual e a competência de `traffic-authority`, mesmo quando o usuário tem acesso de leitura à lista.
- Critérios e fonte fechada: AC-TEAT-006-4/5 exige decisão humana e preservação do registro; [RN-TEAT-119] e a ponte de [WF-TEAT-001] vinculam a inconsistência ao CTB art. 281 §1º I. Estado vazio significa ausência de autos rejeitados no contexto consultado, não exclusão dos já decididos.

## Navegação autoritativa

1. `ait-reject`
2. `ait-detail`
3. `audit-events`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
