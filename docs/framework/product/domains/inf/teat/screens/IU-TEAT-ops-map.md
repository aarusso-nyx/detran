---
id: IU-TEAT-ops-map
title: Mapa de agentes/equipes
status: draft
apps: [teat]
updated: 2026-09-21
---

# Mapa de agentes/equipes

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [JRN-TEAT-002] passo 7; [ARCH-TEAT-FRONTENDS] §§5,6.3.
- Identidade: screenId `ops-map`, uxCode `UX-WEB-004`, grupo `operations`, rota `/ux/web/ops-map`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: localizar a atuação de agentes e equipes na operação acompanhada pelo supervisor.
- Campos e dados: representação geográfica das posições disponibilizadas pelo backend, associadas a agentes/equipes e ao contexto operacional; componente `OperationMap` com Leaflet. A fonte fecha o mapa operacional, mas não define frequência de coleta de GPS, precisão mínima ou percurso histórico.
- Ações/comandos: consultar a distribuição em campo e seguir para turnos ativos, detalhe da operação ou linha do tempo do agente, preservando o contexto disponível.
- Validações e estados: acesso ao mapa segue a autorização da operação e do tenant. Posição ausente não autoriza inventar coordenadas nem inferir a presença do agente; o mapa não altera localização registrada no ato legal.
- Critérios e fonte fechada: [JRN-TEAT-002] passo 7 exige acompanhamento de agentes/equipes e [ARCH-TEAT-FRONTENDS] §6.3 fixa `OperationMap`. A auditoria de local e aparelho permanece nos registros de [RN-TEAT-112], sem transformar esta visão em rastreamento contínuo não especificado.

## Navegação autoritativa

1. `active-shifts`
2. `operation-detail`
3. `agent-timeline`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
