---
id: IU-TEAT-context-help
title: Ajuda contextual MBFT
status: draft
apps: [teat]
updated: 2026-09-21
---

# Ajuda contextual MBFT

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: MBFT, [UC-TEAT-002], [RN-TEAT-115].
- Identidade: screenId `context-help`, uxCode `UX-MOB-C04`, grupo `complementares`, rota `/ux/mobile/context-help`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: tópico de ajuda e retorno contextual.
- Ações/comandos: consultar ajuda.
- Validações e estados: não muda dados do ato.
- Critérios e fonte fechada: MBFT.

## Navegação autoritativa

1. `__previous__`
2. `home`
3. `ait-start`
4. `measure-start`
5. `crash-start`
6. `sync`
7. `__previous__`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
