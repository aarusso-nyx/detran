---
id: IU-PEC-C-02
title: Check-in biométrico
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Check-in biométrico

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: [IU-PEC-001], [UC-PEC-002] e [RN-PEC-130].
- Rota proposta: `/clinico/check-in`; ator do inventário: Técnico Biométrico.
- Os comandos publicados registram verificação biométrica e condição de dedo. A captura ocorre somente pela porta biométrica.

## Contrato transcrito

- A tela inicia captura e valida presença sem acessar driver ou provedor diretamente.
- A implementação de homologação é restrita ao perfil de homologação e mostra a faixa persistente “Homologação — captura biométrica simulada”.
- Falha ou ausência da porta não equivale a captura válida; a exceção segue para C-03.

## Estados e proteção

- A biometria é dado sensível e não é exposta em URL, cache persistente, log ou notificação.
- Erro, ausência de porta e carregamento são explícitos e não simulam êxito.
