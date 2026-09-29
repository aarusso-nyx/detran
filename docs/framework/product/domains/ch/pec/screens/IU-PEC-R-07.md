---
id: IU-PEC-R-07
title: Retenção e eliminação de prontuário
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Retenção e eliminação de prontuário

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-014] e [RN-PEC-141].
- Rota proposta: `/regulatorio/retencao`; papel do inventário: `DPO`.
- Operações publicadas consultam casos e registram avaliação, proposta de disposição e revisão.

## Contrato transcrito

- Estado inicial: `bloqueado_por_decisao` por DT-023 e OD-PW-002.
- A proposta permanece bloqueada; eliminação é desabilitada até PAdES-LTA, conforme PEC-RETENTION-001.
- A tela não inventa responsável pela guarda, regra de eliminação, prazo ou efeito de disposição.

## Estados e proteção

- Prontuário e retenção são dados sensíveis e respeitam tenant e papel do servidor.
- O bloqueio, erro, vazio e carregamento ficam explícitos; nenhuma eliminação é simulada.
