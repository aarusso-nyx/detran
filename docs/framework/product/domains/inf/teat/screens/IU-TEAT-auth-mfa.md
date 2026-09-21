---
id: IU-TEAT-auth-mfa
title: MFA/Reautenticação
status: draft
apps: [teat]
updated: 2026-09-21
---

# MFA/Reautenticação

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [JRN-TEAT-001], [JRN-TEAT-006], [UC-TEAT-012], [RN-TEAT-003].
- Identidade: screenId `auth-mfa`, uxCode `UX-MOB-002`, grupo `autenticacao-e-turno`, rota `/ux/mobile/auth-mfa`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: fator adicional de autenticação.
- Ações/comandos: confirmar reautenticação.
- Validações e estados: fator válido para continuar.
- Critérios e fonte fechada: [JRN-TEAT-001].

## Navegação autoritativa

1. `context-help`
2. `shift-context`
3. `auth-login`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
