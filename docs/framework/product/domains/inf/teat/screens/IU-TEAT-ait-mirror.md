---
id: IU-TEAT-ait-mirror
title: Espelho do AIT
status: draft
apps: [teat]
updated: 2026-09-21
---

# Espelho do AIT

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [RN-TEAT-004]; [RN-TEAT-101]; [RN-TEAT-105]; [RN-TEAT-109]; [RN-TEAT-116].
- Identidade: screenId `ait-mirror`, uxCode `UX-WEB-028`, grupo `ait`, rota `/ux/web/ait-mirror`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar a representação documental do AIT lavrado, preservando o conteúdo que sustenta o ato e sua prova.
- Campos e dados: número e autoria, tipificação, local/data/hora, identificação veicular, dados de condutor/ciência conforme obtidos, observações exigidas pelo enquadramento e referência à versão normativa. Conteúdo congelado e `content_hash` sustentam o espelho; correções permanecem apensas.
- Ações/comandos: consultar o documento, retornar ao detalhe do AIT ou acessar seu pacote probatório. Visualizar o espelho não finaliza novamente o auto nem consome outra numeração.
- Validações e estados: preservar todos os dados de caracterização da infração, sem converter segunda via em resumo. Quando a representação corresponder à impressão diferida/reimpressão, aplica identificação eletrônica do agente; assinatura manual do agente é da variante impressa no ato da lavratura.
- Critérios e fonte fechada: [RN-TEAT-004] impede edição do congelado; [RN-TEAT-101] fixa conteúdo mínimo; [RN-TEAT-109] exige caracterização em todas as vias; [RN-TEAT-105]/[RN-TEAT-116] distinguem variantes e comprovante. A fonte não especifica um novo formato de exportação nem comando de impressão web para esta página.

## Navegação autoritativa

1. `ait-detail`
2. `probative-package`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
