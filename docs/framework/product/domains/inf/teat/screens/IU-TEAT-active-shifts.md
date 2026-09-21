---
id: IU-TEAT-active-shifts
title: Turnos ativos
status: draft
apps: [teat]
updated: 2026-09-21
---

# Turnos ativos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [JRN-TEAT-001] passos 1,10; [JRN-TEAT-002] passo 7; [JRN-TEAT-006]; [UC-TEAT-012].
- Identidade: screenId `active-shifts`, uxCode `UX-WEB-007`, grupo `operations`, rota `/ux/web/active-shifts`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: acompanhar os turnos em andamento e reconhecer pendências ou trocas de dispositivo que afetem a equipe.
- Campos e dados: turno ativo associado a agente, dispositivo, unidade, equipe, viatura e operação quando houver; contexto de sessão, atos sincronizados/pendentes e incidente de handoff declarado, provenientes do backend.
- Ações/comandos: consultar o turno e navegar para histórico do agente, mapa ou mensagens. A abertura e o fechamento individuais permanecem no fluxo de turno; esta listagem não cria encerramento em massa.
- Validações e estados: `Shift.status = open` identifica a abertura documentada em [JRN-TEAT-001]; a fonte não fornece enum completo de turno. Handoff declarado deve permanecer distinguível de concorrência entre dispositivos, cujos registros ficam bloqueados até apuração.
- Critérios e fonte fechada: [JRN-TEAT-002] passo 7 exige acompanhamento; [JRN-TEAT-006] passo 9 exige consolidação com incidente visível. AC-TEAT-012-2/4 impede ocultar concorrência ou tratar troca autorizada como ausência de contexto.

## Navegação autoritativa

1. `agent-timeline`
2. `ops-map`
3. `operation-messages`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
