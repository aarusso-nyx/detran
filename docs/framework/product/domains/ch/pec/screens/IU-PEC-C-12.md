---
id: IU-PEC-C-12
title: Registro de resultado e código de restrição
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Registro de resultado e código de restrição

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-011] e [RN-PEC-105].
- Rota proposta: `/clinico/atendimentos/:id/resultado`; papel do inventário: `MEDICO`.
- A tela consulta códigos de restrição e registra restrição ou exame pelas operações publicadas.

## Contrato transcrito

- Estado inicial: `bloqueado_por_decisao` por DT-022 e OD-PW-002. Rótulos residuais e códigos do Anexo XV permanecem `source_pending`.
- Quando a autoridade fechar os rótulos, a exibição usa somente apto, apto com restrições, inapto temporário e inapto. `CONDICIONADO` e `PENDENTE` não são resultado exibível.
- A taxonomia médica não é fundida à psicológica e a tela não inventa mapeamento.

## Estados e proteção

- Resultado e restrição são dados sensíveis e ficam no contexto autorizado do tenant.
- O bloqueio, o erro e o carregamento são explícitos e não apresentam rótulo não decidido.
