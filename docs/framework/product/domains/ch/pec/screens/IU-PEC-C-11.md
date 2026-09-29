---
id: IU-PEC-C-11
title: Painel de transmissão RENACH
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Painel de transmissão RENACH

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-009] e [RN-PEC-008].
- Rota proposta: `/clinico/transmissoes`; o inventário cita administração da clínica e gestor.
- A operação publicada dispara transmissão. O callback RENACH é operação de integração, nunca chamada pelo navegador.

## Contrato transcrito

- A tela não chama RENACH diretamente; toda integração nacional permanece no backend por `packages/senatran-adapter`.
- A leitura de ACK ou erro depende de consulta HTTP ainda ausente. Sem ela, o estado de consulta é `source_pending`.
- C-11 usa somente polling do padrão, sem stream novo, até OD-PW-003. A ficha não amplia a permissão atual para administração da clínica.

## Estados e proteção

- Mensagens e dados da transmissão preservam o envelope publicado e o contexto autorizado.
- Carregamento, indisponibilidade e erro não geram retry, cálculo de estado ou sucesso simulado no navegador.
