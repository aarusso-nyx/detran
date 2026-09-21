---
id: IU-TEAT-removals
title: Remoções
status: draft
apps: [teat]
updated: 2026-09-21
---

# Remoções

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-009]; [WF-TEAT-004] submáquina B; [RN-TEAT-126].
- Identidade: screenId `removals`, uxCode `UX-WEB-042`, grupo `measures`, rota `/ux/web/removals`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: acompanhar veículos removidos e o Termo de Recolhimento que fundamenta sua guarda e futura restituição.
- Campos e dados: órgão, veículo, AIT/ordem judicial/ato administrativo determinante, local/data/hora da remoção, fundamento, local de guarda e proprietário/condutor quando identificados. Termo também conserva inventário, equipamentos ausentes, estado de conservação e os dois prazos de retirada definidos no contrato.
- Ações/comandos: consultar remoção e seu termo, abrir detalhe da medida ou encaminhar ao fluxo próprio de liberação; consultar a competência do órgão quando necessário. Esta relação não concede restituição por simples seleção.
- Validações e estados: no MVP, remoção segue `REMOVIDO → EM_DEPOSITO`; proprietário presente é notificado mesmo recusando assinatura, enquanto ausência mantém a pendência de notificação. Restituição depende das condições do backend; a página não executa leilão nem ativa guarda monitorada.
- Critérios e fonte fechada: AC-TEAT-009-1/2/3/4/8 e [RN-TEAT-126] exigem hipótese legal, termo completo e notificação distinguível. [WF-TEAT-004] separa o marco da remoção dos prazos e da decisão de liberação, que não são calculados nesta lista.

## Navegação autoritativa

1. `measure-detail`
2. `release`
3. `admin-competencies`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
