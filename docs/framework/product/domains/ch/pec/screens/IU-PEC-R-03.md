---
id: IU-PEC-R-03
title: Recurso à Junta Especial de Saúde
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Recurso à Junta Especial de Saúde

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-010] e [RN-PEC-110].
- Rota proposta: `/regulatorio/juntas/:id/recurso`; papel do inventário: `CETRAN`.
- As operações publicadas criam recurso, designam Junta Especial e encaminham o recurso; as etapas próprias também dependem de gestor DETRAN.

## Contrato transcrito

- A Junta Especial é colegiado distinto. A tela não reutiliza nem presume a composição da junta originária.
- O encaminhamento observa os comandos e guardas publicados; prazo e elegibilidade vêm do servidor.

## Estados e proteção

- Caso, recurso e parecer são sensíveis e permanecem no contexto autorizado do tenant.
- Erro, vazio e carregamento são explícitos e não representam designação ou encaminhamento como concluídos antes da resposta.
