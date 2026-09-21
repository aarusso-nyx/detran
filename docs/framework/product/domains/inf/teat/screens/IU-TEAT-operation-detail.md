---
id: IU-TEAT-operation-detail
title: Detalhe da operação
status: draft
apps: [teat]
updated: 2026-09-21
---

# Detalhe da operação

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [JRN-TEAT-002] passos 1–8; [ARCH-TEAT-FRONTENDS] §§3,5,7.
- Identidade: screenId `operation-detail`, uxCode `UX-WEB-006`, grupo `operations`, rota `/ux/web/operation-detail`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: reunir a preparação e o acompanhamento de uma operação específica, com equipe e recursos identificados.
- Campos e dados: tipo, objetivos, início/fim planejados e estado da `Operation`; `Team`/`TeamAgent`, viatura designada (`PatrolVehicle`), dispositivos participantes, catálogo/pacote normativo e reservas de numeração. O resumo de encerramento apresenta AITs, medidas e pendências de sincronização/conflito.
- Ações/comandos: supervisor/admin compõe equipe e designa viatura no planejamento; confere autorização dos dispositivos, pacote e numeração antes da abertura. Durante a execução, consulta turnos e mensagens; o agente tem acesso de leitura.
- Validações e estados: o checklist de campo verifica autorização interna de dispositivo/versão, incluindo equipamentos de corporação conveniada. A homologação SENATRAN do software é responsabilidade administrativa separada; sua caducidade segue aviso e registro H.55, sem criar bloqueio neste detalhe.
- Critérios e fonte fechada: [JRN-TEAT-002] fecha a sequência planejamento → recursos → abertura → acompanhamento → resumo; [RN-TEAT-003] distingue os dois controles de homologação. A fonte não define novos campos de aprovação ou um comando de encerramento coletivo dos turnos.

## Navegação autoritativa

1. `active-shifts`
2. `operation-messages`
3. `bi-enforcement`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
