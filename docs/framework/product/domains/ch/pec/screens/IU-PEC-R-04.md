---
id: IU-PEC-R-04
title: Escada de prazos do caso
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Escada de prazos do caso

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001] e [RN-PEC-112].
- Rota proposta: `/regulatorio/juntas/:id/prazos`; atores do inventário: Junta e gestor.
- O caso e, para gestor autorizado, os parâmetros de processo são consultados pelas operações publicadas.

## Contrato transcrito

- Para a junta, prazo já calculado vem do servidor. A tela não mantém literal de prazo nem o calcula no navegador.
- Informação de prazo sem fonte fica `source_pending` até ser publicada pelo dono do parâmetro.
- Consulta a parâmetros de processo permanece reservada ao gestor autorizado.

## Estados e proteção

- Dados do caso são sensíveis e permanecem limitados ao tenant e papel.
- Carregamento, erro e ausência de parâmetro preservam a resposta publicada.
