---
id: IU-PEC-R-01
title: Fila e dossiê para junta
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Fila e dossiê para junta

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: [IU-PEC-001] e [UC-PEC-004].
- Rota proposta: `/regulatorio/juntas`; atores do inventário: auditor e gestor.
- A tela consulta e cria casos de junta pelas operações publicadas.

## Contrato transcrito

- A fila e o dossiê são delimitados pelo tenant e pelas permissões do servidor.
- Prazo e prioridade vêm do servidor. A tela não calcula prazo, ordem ou elegibilidade localmente.
- A abertura do caso não decide parecer nem recurso, que pertencem às telas posteriores.

## Estados e proteção

- O dossiê é sensível e não é exposto em URL, cache persistente, log ou notificação.
- Vazio, erro e carregamento preservam a resposta publicada pelo backend.
