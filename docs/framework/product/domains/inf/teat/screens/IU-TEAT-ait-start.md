---
id: IU-TEAT-ait-start
title: Novo AIT — início
status: draft
apps: [teat]
updated: 2026-09-21
---

# Novo AIT — início

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-001]…[UC-TEAT-004], [WF-TEAT-001], [RN-TEAT-004].
- Identidade: screenId `ait-start`, uxCode `UX-MOB-020`, grupo `ait-completo`, rota `/ux/mobile/ait-start`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: rascunho, turno e número de reserva.
- Ações/comandos: criar ou retomar rascunho de AIT.
- Validações e estados: sem reserva válida não há lavratura, inclusive offline.
- Critérios e fonte fechada: AC-TEAT-001-9.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `measure-start`
5. `crash-start`
6. `sync`
7. `ait-vehicle`
8. `ait-vehicle`
9. `ait-vehicle`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
