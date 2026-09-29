---
id: IU-PEC-C-06
title: Avaliação psicológica
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Avaliação psicológica

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-002] e [RN-PEC-104].
- Rota proposta: `/clinico/atendimentos/:id/psicologico`; papel do inventário: `PSICOLOGO`.
- A tela lê o encontro e registra a avaliação psicológica pelas operações publicadas.

## Contrato transcrito

- Campos clínicos e avaliação seguem a taxonomia psicológica própria.
- A taxonomia psicológica não é fundida à médica e não apresenta `CONDICIONADO` como resultado legal.
- A tela não calcula prazo, estado ou autorização.

## Estados e proteção

- Dados psicológicos são sensíveis e não são colocados em URL, cache persistente, log ou notificação.
- Vazio, erro e carregamento mantêm a resposta autorizada do backend.
