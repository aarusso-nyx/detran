---
id: IU-TEAT-ait-notes
title: AIT — observações
status: draft
apps: [teat]
updated: 2026-09-21
---

# AIT — observações

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-001]…[UC-TEAT-004], [WF-TEAT-001], [RN-TEAT-004].
- Identidade: screenId `ait-notes`, uxCode `UX-MOB-026`, grupo `ait-completo`, rota `/ux/mobile/ait-notes`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: observação obrigatória e complementar.
- Ações/comandos: registrar observação.
- Validações e estados: observação exigida pelo enquadramento bloqueia avanço.
- Critérios e fonte fechada: TEAT.AIT_OBSERVATION_REQUIRED.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `ait-validations`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
