---
id: IU-PEC-C-08
title: Emissão e assinatura de laudo
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Emissão e assinatura de laudo

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-006], [RN-PEC-005] e [RN-PEC-142].
- Rota proposta: `/clinico/atendimentos/:id/laudo`; papéis do inventário: `MEDICO` e `PSICOLOGO`.
- A tela aciona verificação biométrica por porta e criação de laudo pelas operações publicadas.

## Contrato transcrito

- Antes da emissão, a tela mostra o nível aplicado, avançada ou qualificada, e seu motivo.
- Sem PAdES, TSA ou provedor exigido, a assinatura falha fechada: nenhum laudo é emitido e o estado é explícito.
- A biometria somente passa pela porta; homologação usa a faixa persistente e não representa captura real.

## Estados e proteção

- Laudo e biometria são dados sensíveis e ficam fora de URL, cache persistente, log e notificação.
- Erro de assinatura ou biometria não é convertido em sucesso simulado.
