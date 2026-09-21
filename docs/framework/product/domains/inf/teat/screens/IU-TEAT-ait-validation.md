---
id: IU-TEAT-ait-validation
title: Fila de validação
status: draft
apps: [teat]
updated: 2026-09-21
---

# Fila de validação

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-006]; [RN-TEAT-006]; [RN-TEAT-119]; [WF-TEAT-001].
- Identidade: screenId `ait-validation`, uxCode `UX-WEB-021`, grupo `ait`, rota `/ux/web/ait-validation`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: apresentar a verificação de regularidade e consistência dos autos recebidos, permitindo o juízo da autoridade sobre o resultado.
- Campos e dados: auto e resultados de integridade, assinatura, número, conteúdo mínimo, competência, enquadramento e duplicidade; inconsistência classificada explicitamente como saneável ou não saneável, com fundamento e histórico disponíveis.
- Ações/comandos: analisar o resultado automatizado, abrir o detalhe ou o saneamento quando cabível e consultar os rejeitados. O comando `accept` pertence a `traffic-authority` e autoriza a integração somente a partir de estado permitido.
- Validações e estados: o auto passa de `RECEBIDO` a `VALIDANDO`; aceite pode partir de `RECEBIDO`, `VALIDANDO` ou `CORRIGIDO` conforme [WF-TEAT-001]. Vício essencial exige decisão de arquivamento/rejeição; classificação automática não toma a decisão sensível. Concorrência suspeita bloqueia antes dessa validação.
- Critérios e fonte fechada: AC-TEAT-006-1/2/4 e [RN-TEAT-119] fecham classificação, limites e autoridade humana. TEAT.AIT_STATE_INVALID exige recarregar o recurso; TEAT.AIT_CONCURRENCY_PENDING_REVIEW mantém a apuração obrigatória.

## Navegação autoritativa

1. `ait-sanitize`
2. `ait-detail`
3. `ait-rejected`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
