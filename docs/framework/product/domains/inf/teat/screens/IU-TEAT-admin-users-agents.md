---
id: IU-TEAT-admin-users-agents
title: Usuários/agentes
status: draft
apps: [teat]
updated: 2026-09-21
---

# Usuários/agentes

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§1,3,5; [ARCH-TEAT-BUILD-PACK] WP-T1; [RN-TEAT-104]; [RN-TEAT-110].
- Identidade: screenId `admin-users-agents`, uxCode `UX-WEB-102`, grupo `admin`, rota `/ux/web/admin-users-agents`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar a identidade funcional de usuários/agentes e os vínculos que sustentam sua atuação operacional.
- Campos e dados: identidade de usuário fornecida por STYNX, perfil `agent_profile`, unidade, situação funcional e credencial reconhecidas pelo backend; para o agente autuador, categoria e vínculo institucional necessários à competência. Papel técnico e fundamento jurídico da atuação permanecem identificáveis.
- Ações/comandos: consultar usuário/agente, abrir perfis de acesso, dispositivos ou histórico do agente. Não há comando de criar senha ou editar identidade fora do provedor; os cadastros administrativos desta superfície são de leitura.
- Validações e estados: agente inativo, sem vínculo na unidade ou com credencial expirada mantém os bloqueios TEAT.AGENT_NOT_ACTIVE, TEAT.AGENT_NOT_IN_UNIT e TEAT.AGENT_CREDENTIAL_EXPIRED. Um papel de sistema não concede, por si, competência legal para lavrar.
- Critérios e fonte fechada: [RN-TEAT-104] fecha categoria/vínculo/circunscrição; [RN-TEAT-110] mantém STYNX como autoridade de identidade e exige autoria identificável. [ARCH-TEAT-FRONTENDS] §§1,3,5 e o catálogo de erros fecham leitura e tratamento da situação funcional, sem inventar fluxo de admissão de agentes.

## Navegação autoritativa

1. `admin-profiles`
2. `admin-devices`
3. `agent-timeline`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
