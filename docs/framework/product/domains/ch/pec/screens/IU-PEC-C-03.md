---
id: IU-PEC-C-03
title: Falha e solicitação de exceção biométrica
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Falha e solicitação de exceção biométrica

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: [IU-PEC-001], [UC-PEC-003] e [RN-PEC-003].
- Rota proposta: `/clinico/biometria/excecoes/nova`; ator do inventário: Técnico Biométrico.
- A ação publicada solicita exceção biométrica; não há bypass silencioso de presença.

## Contrato transcrito

- A tela mostra a falha devolvida pela porta e permite encaminhar a solicitação de exceção ao fluxo publicado.
- Não confirma presença, nem altera decisão de exceção. A aprovação pertence a C-04.

## Estados e proteção

- O motivo da falha é dado sensível e fica no contexto autorizado do tenant.
- Carregamento, erro e envio recusado mantêm estado explícito e a resposta publicada do backend.
