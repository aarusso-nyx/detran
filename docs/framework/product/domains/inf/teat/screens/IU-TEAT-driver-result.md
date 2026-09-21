---
id: IU-TEAT-driver-result
title: Resultado de condutor
status: draft
apps: [teat]
updated: 2026-09-21
---

# Resultado de condutor

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-001], [RN-TEAT-115].
- Identidade: screenId `driver-result`, uxCode `UX-MOB-014`, grupo `consultas`, rota `/ux/mobile/driver-result`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: snapshot, identificação e confirmação do agente.
- Ações/comandos: confirmar condutor/infrator.
- Validações e estados: resultado de consulta não substitui constatação.
- Critérios e fonte fechada: [UC-TEAT-001].

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `ait-driver`
9. `alcohol-start`
10. `query-failure`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
