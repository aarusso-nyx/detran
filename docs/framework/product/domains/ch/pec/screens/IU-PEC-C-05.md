---
id: IU-PEC-C-05
title: Anamnese e exame médico
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Anamnese e exame médico

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-002] e [WF-PEC-001].
- Rota proposta: `/clinico/atendimentos/:id/medico`; papel do inventário: `MEDICO`.
- A tela lê o encontro e registra o exame médico pelas operações publicadas.

## Contrato transcrito

- Campos clínicos vêm do encontro autorizado e o resultado usa a taxonomia médica própria.
- `CONDICIONADO` é interno e não é exposto como resultado legal. A taxonomia médica não é fundida à psicológica.
- Prazo, estado e autorização são devolvidos pelo servidor; a tela não os calcula.

## Estados e proteção

- Informações de anamnese e exame são sensíveis e não são colocadas em URL, cache persistente, log ou notificação.
- Carregamento, vazio e erro preservam o envelope publicado do backend.
