---
id: IU-TEAT-admin-profiles
title: Perfis/permissões
status: draft
apps: [teat]
updated: 2026-09-21
---

# Perfis/permissões

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§3,5; [UC-TEAT-006] AC-TEAT-006-4; [RN-TEAT-142].
- Identidade: screenId `admin-profiles`, uxCode `UX-WEB-103`, grupo `admin`, rota `/ux/web/admin-profiles`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: tornar consultável a separação de responsabilidades e permissões dos nove papéis canônicos do console.
- Campos e dados: códigos de papel e respectivos alcances funcionais: atuação de campo, supervisão, processamento, autoridade, administração do órgão, administração técnica, auditoria, BI e integração. Guardas de página e autorização de ação são conceitos distintos.
- Ações/comandos: consultar perfis e navegar para usuários/agentes, auditoria ou órgãos. [ARCH-TEAT-FRONTENDS] §5 define leitura; esta ficha não cria um editor de política nem comando de concessão de privilégios.
- Validações e estados: entrar em uma tela não habilita toda ação nela; decisões sensíveis continuam de `traffic-authority`, auditor permanece em leitura e acesso a metadados de bodycam não libera gravações. A Diretoria usa o mapeamento já definido em §3, sem nascer um décimo papel.
- Critérios e fonte fechada: [ARCH-TEAT-FRONTENDS] §3 fecha a matriz de responsabilidades e `isDetranActionAllowed`; AC-TEAT-006-4 protege a decisão humana e [RN-TEAT-142] mantém a requisição formal para conteúdo de bodycam. Não se deriva permissão de negócio apenas do título do perfil.

## Navegação autoritativa

1. `admin-users-agents`
2. `audit-events`
3. `admin-orgs`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
