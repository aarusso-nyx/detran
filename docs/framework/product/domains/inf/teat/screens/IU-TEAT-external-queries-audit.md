---
id: IU-TEAT-external-queries-audit
title: Consultas externas
status: draft
apps: [teat]
updated: 2026-09-21
---

# Consultas externas

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§1,5,9; [ARCH-TEAT-ERRORS] §8; [RN-TEAT-115]; [RN-TEAT-112].
- Identidade: screenId `external-queries-audit`, uxCode `UX-WEB-083`, grupo `audit`, rota `/ux/web/external-queries-audit`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `auditor`, `traffic-authority`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: rastrear as consultas externas usadas para identificar veículo/condutor e distinguir a resposta consultada do dado confirmado no AIT.
- Campos e dados: registro `external_query`, finalidade exigida para a consulta e snapshot congelado retornado; no auto, origem do dado, validação pelo agente e divergência registrada. A visão preserva a relação entre a consulta e a identificação utilizada.
- Ações/comandos: consultar o registro e sua relação com a linha do tempo do AIT, auditoria geral ou integração técnica. Consultar auditoria não dispara automaticamente nova consulta nacional nem atualiza o snapshot do auto.
- Validações e estados: ausência de finalidade corresponde a TEAT.QUERY_PURPOSE_REQUIRED; indisponibilidade e não localização são resultados distintos. Dado consultado continua proposta até confirmação campo a campo pelo agente; erro externo não é transformado em confirmação.
- Critérios e fonte fechada: [ARCH-TEAT-FRONTENDS] §9 fecha `ops/snapshots/external-queries` através do adapter; [RN-TEAT-115] fecha origem/validação auditáveis e [RN-TEAT-112] protege o registro do ato. As fontes não definem filtros ou prazo próprio de retenção desta auditoria.

## Navegação autoritativa

1. `audit-events`
2. `ait-timeline`
3. `tech-integrations`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
