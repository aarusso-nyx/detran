---
id: IU-PEC-C-07
title: Entrevista devolutiva
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Entrevista devolutiva

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-011] e [RN-PEC-153].
- Rota proposta: `/clinico/atendimentos/:id/devolutiva`; o inventário cita `MEDICO` e `PSICOLOGO`.
- As operações publicadas agendam e concluem a devolutiva do dossiê.

## Contrato transcrito

- A tela permite somente as ações autorizadas pelo servidor para o papel corrente.
- O manifesto de rotas registra concessão atual para `PSICOLOGO`; esta ficha não amplia a política para `MEDICO`.
- A devolutiva não altera o dossiê nem expõe dados fora do contexto autorizado.

## Estados e proteção

- Dados do dossiê são sensíveis. Titular autorizado lê seu próprio dossiê sem máscara; suporte autorizado recebe dados mascarados, conforme [RN-PEC-153].
- Falha, vazio e carregamento permanecem explícitos e preservam a resposta publicada.
