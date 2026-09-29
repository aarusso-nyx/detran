---
id: IU-PEC-R-02
title: Dossiê do caso e parecer da junta
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Dossiê do caso e parecer da junta

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-005] e [WF-PEC-002].
- Rota proposta: `/regulatorio/juntas/:id/parecer`; papel do inventário: `JUNTA`.
- A tela consulta o caso e registra a decisão do colegiado designado pelas operações publicadas.

## Contrato transcrito

- Parecer pertence ao colegiado designado e a tela não substitui sua composição ou autorização.
- Estado, prazo e resultado são devolvidos pelo servidor; não há cálculo ou mapeamento local.

## Estados e proteção

- Caso e parecer são dados sensíveis sob tenant e papel autorizado.
- Carregamento, vazio e erro não antecipam decisão nem mudam o envelope publicado.
