---
id: IU-PEC-R-05
title: Credenciamento de clínicas e profissionais
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Credenciamento de clínicas e profissionais

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: [IU-PEC-001]; a ação de credenciamento não possui UC fechado.
- Rota proposta: `/regulatorio/credenciamento`; ator do inventário: gestor DETRAN.
- Operações existentes consultam clínicas e profissionais e permitem criação ou atualização de profissional.

## Contrato transcrito

- Estado inicial: `bloqueado_por_decisao` por OD-PW-005 para qualquer ação sem UC fechado.
- A tela pode transcrever somente leituras e comandos existentes de clinical-network; não inventa workflow, regra de elegibilidade ou dados cadastrais.
- Campos, prazos e condições sem fonte permanecem `source_pending`.

## Estados e proteção

- Dados de clínicas e profissionais permanecem no contexto autorizado do tenant.
- O bloqueio por decisão é visível e nenhum comando é apresentado como autorizado sem definição fechada.
