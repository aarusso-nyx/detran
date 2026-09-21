---
id: IU-TEAT-alcohol-procedures
title: Procedimentos de alcoolemia
status: draft
apps: [teat]
updated: 2026-09-21
---

# Procedimentos de alcoolemia

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-007]; [WF-TEAT-005]; [RN-TEAT-133]; [RN-TEAT-134]; [RN-TEAT-135]; [RN-TEAT-136].
- Identidade: screenId `alcohol-procedures`, uxCode `UX-WEB-050`, grupo `alcohol`, rota `/ux/web/alcohol-procedures`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: revisar os procedimentos de alcoolemia e os elementos que sustentam seu desfecho administrativo ou encaminhamento.
- Campos e dados: condutor/veículo, meio de prova, AIT e medidas vinculadas; no teste, aparelho (marca/modelo/série), certificado, número do teste, medição realizada, valor considerado e referência da tabela. Conservar recusa, impossibilidade técnica, sinais/termo, testemunhas, mídias e encaminhamento conforme o procedimento.
- Ações/comandos: consultar o procedimento, verificar o etilômetro cadastrado e acessar evidências ou a visão de qualidade. A revisão web não fabrica um teste ausente nem muda recusa em resultado de medição.
- Validações e estados: medido e considerado aparecem juntos; recusa e impossibilidade são ramos distintos. Recusa sustenta AIT 165-A, falha técnica exige outro meio de prova; o resultado e o encaminhamento retornados seguem [WF-TEAT-005]. A via de medição exige certificado vigente na data do teste.
- Critérios e fonte fechada: AC-TEAT-007-1/2/4/5/8/10 fecha validade metrológica, par de valores, distinção dos ramos, conteúdo mínimo e ausência de espera por laboratório. [RN-TEAT-136] torna campos condicionais ao meio de prova, sem impor número de teste a procedimento de recusa.

## Navegação autoritativa

1. `breathalyzers`
2. `evidence-viewer`
3. `bi-quality`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
