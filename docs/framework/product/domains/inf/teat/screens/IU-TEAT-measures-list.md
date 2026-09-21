---
id: IU-TEAT-measures-list
title: Lista de medidas
status: draft
apps: [teat]
updated: 2026-09-21
---

# Lista de medidas

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-008]; [UC-TEAT-009]; [WF-TEAT-004]; [RN-TEAT-123].
- Identidade: screenId `measures-list`, uxCode `UX-WEB-040`, grupo `measures`, rota `/ux/web/measures-list`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: acompanhar as medidas administrativas registradas em campo e localizar a providência que requer consulta ou liberação.
- Campos e dados: identificação da medida/termo, tipo do rol fechado do CTB art. 269, fundamento, veículo/documento alcançado, vínculo com AIT quando existente, recibo e desfecho. Prazo de regularização e estado vêm do backend.
- Ações/comandos: consultar a coleção e abrir detalhe da medida, relação de remoções ou fluxo de liberação. A seleção da medida não altera o AIT vinculado.
- Validações e estados: retenção distingue `RETIDO`, `LIBERADO_LOCAL`, `LIBERADO_COM_PRAZO`, `REGULARIZADO` e `CONVERTIDO_REMOCAO`; remoção segue sua própria submáquina. Documento digital é registro eletrônico, sem apreensão física; a medida pode existir sem AIT.
- Critérios e fonte fechada: AC-TEAT-008-1/4/7 e [WF-TEAT-004] fecham tipo, suporte e destinos independentes. Falha de sincronização ou arquivamento do AIT não reverte automaticamente a medida; guarda monitorada permanece fora do MVP conforme [UC-TEAT-009].

## Navegação autoritativa

1. `measure-detail`
2. `removals`
3. `release`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
