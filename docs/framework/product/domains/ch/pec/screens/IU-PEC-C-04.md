---
id: IU-PEC-C-04
title: Aprovação de exceção biométrica
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Aprovação de exceção biométrica

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: [IU-PEC-001] e [UC-PEC-003].
- Rota proposta: `/clinico/biometria/excecoes/:id`; ator do inventário: Supervisor.
- A decisão usa a operação publicada para exceção biométrica.

## Contrato transcrito

- A tela apresenta a solicitação autorizada e registra a decisão auditável pelo comando publicado.
- Não substitui a captura biométrica, nem cria regra de aprovação fora do servidor.

## Estados e proteção

- A decisão e o contexto biométrico são sensíveis e respeitam tenant e autorização do servidor.
- Vazio, erro e carregamento permanecem explícitos; sucesso não é apresentado antes da resposta do comando.
