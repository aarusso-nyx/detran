---
id: IU-PEC-R-06
title: Relatórios regulatórios e trilha de auditoria
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Relatórios regulatórios e trilha de auditoria

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [RN-PEC-150] e [RN-PEC-151].
- Rota proposta: `/regulatorio/auditoria`; atores do inventário: auditor e DPO.
- As operações publicadas consultam eventos, exportação de eventos e painel operacional.

## Contrato transcrito

- A tela é somente leitura e não reaplica comandos, altera retenção ou cria trilha de auditoria.
- A permissão publicada de eventos é para auditor; a ficha não amplia acesso ao DPO sem decisão.
- Exportação e painel obedecem às autorizações do servidor.

## Estados e proteção

- Eventos e relatórios são sensíveis e respeitam mínimo necessário, tenant e papel.
- Vazio, erro e carregamento não expõem dado fora do envelope autorizado.
