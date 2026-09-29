---
id: IU-PEC-C-10
title: Checklist de encerramento do episódio
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Checklist de encerramento do episódio

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-008] e [RN-PEC-006].
- Rota proposta: `/clinico/atendimentos/:id/encerrar`; papéis do inventário: `MEDICO` e `PSICOLOGO`.
- A tela lê o encontro e solicita seu encerramento pelas operações publicadas.

## Contrato transcrito

- O checklist apresenta apenas condições e estado devolvidos pelo servidor.
- ACK do RENACH é guarda do servidor; a tela não chama RENACH nem decide encerramento localmente.

## Estados e proteção

- O episódio e seus dados são sensíveis e permanecem no contexto autorizado do tenant.
- Carregamento, erro e impedimento de encerramento preservam a resposta publicada.
