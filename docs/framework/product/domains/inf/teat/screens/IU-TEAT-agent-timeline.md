---
id: IU-TEAT-agent-timeline
title: Timeline do agente
status: draft
apps: [teat]
updated: 2026-09-21
---

# Timeline do agente

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-012]; [JRN-TEAT-006]; [RN-TEAT-110]; [RN-TEAT-111]; [RN-TEAT-112].
- Identidade: screenId `agent-timeline`, uxCode `UX-WEB-082`, grupo `audit`, rota `/ux/web/agent-timeline`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `auditor`, `traffic-authority`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: reconstruir a atuação de um agente entre turnos e dispositivos, permitindo distinguir handoff declarado de concorrência anômala.
- Campos e dados: identidade do agente, meio de autenticação registrado nos atos, turnos/dispositivos utilizados, data/hora, veículo/local e número do aparelho em cada operação; incidente de falha e evento de handoff quando declarados.
- Ações/comandos: consultar a cronologia, abrir turnos ativos, eventos de auditoria ou anomalias relacionadas. A consulta não encerra sessão alheia nem decide a legitimidade de autos concorrentes.
- Validações e estados: consolidar o histórico dos dois dispositivos sem ocultar a declaração de troca. Registros do mesmo agente em aparelhos distintos no intervalo detectado ficam `SUSPEITO_CONCORRENCIA` até apuração; a tela não fixa a janela temporal nem expira a ocorrência.
- Critérios e fonte fechada: AC-TEAT-012-2/3/4/6 e [JRN-TEAT-006] passo 9 fecham contenção, autoria e incidente visível. [RN-TEAT-112] exige o aparelho no evento histórico, evitando atribuir atos antigos ao cadastro atual do agente.

## Navegação autoritativa

1. `active-shifts`
2. `audit-events`
3. `anomalies`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
