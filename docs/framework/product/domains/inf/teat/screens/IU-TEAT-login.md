---
id: IU-TEAT-login
title: Login Web
status: draft
apps: [teat]
updated: 2026-09-21
---

# Login Web

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§1,3,5.
- Identidade: screenId `login`, uxCode `UX-WEB-001`, grupo `entry`, rota `/ux/web/login`; implementação `implemented` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`, `technical-admin`, `auditor`, `bi-analyst`, `integration-operator`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: iniciar uma sessão autenticada para o console de retaguarda e chegar ao painel com o contexto de acesso do usuário.
- Campos e dados: identidade e sessão fornecidas por STYNX/OIDC Cognito, contexto de tenant e os nove papéis canônicos do console. O bootstrap é `provideDetranAuthenticatedApp`; a ficha não cria cadastro nem credenciais próprias do TEAT.
- Ações/comandos: iniciar o fluxo de autenticação da plataforma e, após seu retorno válido, abrir o painel inicial. Os campos e etapas do formulário de credenciais pertencem ao provedor; a fonte não especifica outro formulário web de senha ou MFA.
- Validações e estados: `authGuard`, `tenantGuard` e `roleGuard` governam a entrada nas páginas protegidas. Falha de autenticação mantém o acesso pendente; TEAT.AUTH_REQUIRED, TEAT.FORBIDDEN_ACTION e TEAT.TENANT_MISMATCH preservam o significado retornado pelo backend.
- Critérios e fonte fechada: autenticação e tenancy usam o substrato definido em [ARCH-TEAT-FRONTENDS] §§1,3; o sucesso conduz a `dashboard-home` conforme a matriz. O login web não executa abertura de turno nem finalização de AIT.

## Navegação autoritativa

1. `dashboard-home`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
