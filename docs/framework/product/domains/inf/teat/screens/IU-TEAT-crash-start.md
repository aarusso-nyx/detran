---
id: IU-TEAT-crash-start
title: Novo sinistro
status: draft
apps: [teat]
updated: 2026-09-21
---

# Novo sinistro

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [APP-BOAT], [IU-TEAT-001] §A.
- Identidade: screenId `crash-start`, uxCode `UX-MOB-060`, grupo `sinistros`, rota `/ux/mobile/crash-start`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- **BOAT:** esta é uma superfície de sinistro pertencente ao BOAT; o TEAT limita-se ao atalho, link ou extensão explicitamente autorizada.

## Contrato transcrito

- Campos e dados: Novo sinistro é superfície BOAT; nenhum campo de sinistro é definido pelo TEAT.
- Ações/comandos: o TEAT somente abre o atalho, vínculo ou extensão BOAT previsto para `crash-start`.
- Validações e estados: dados e transições de sinistro permanecem no BOAT; TEAT não os replica.
- Critérios e fonte fechada: [APP-BOAT], [IU-TEAT-001] §A.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `sync`
7. `crash-location`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- A extensão BOAT preserva sua própria fronteira; o TEAT não adiciona comportamento de homologação.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
