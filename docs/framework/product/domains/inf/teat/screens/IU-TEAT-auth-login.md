---
id: IU-TEAT-auth-login
title: Login
status: draft
apps: [teat]
updated: 2026-09-21
---

# Login

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [JRN-TEAT-001], [JRN-TEAT-006], [UC-TEAT-012], [RN-TEAT-003].
- Identidade: screenId `auth-login`, uxCode `UX-MOB-001`, grupo `autenticacao-e-turno`, rota `/ux/mobile/auth-login`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: credencial e contexto de autenticação STYNX.
- Ações/comandos: autenticar e carregar bootstrap.
- Validações e estados: sessão válida antes da transição.
- Critérios e fonte fechada: [JRN-TEAT-001].

## Navegação autoritativa

1. `context-help`
2. `auth-mfa`
3. `shift-context`
4. `device-blocked`
5. `support`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
