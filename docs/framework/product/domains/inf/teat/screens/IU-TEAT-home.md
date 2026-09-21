---
id: IU-TEAT-home
title: Home do turno
status: draft
apps: [teat]
updated: 2026-09-21
---

# Home do turno

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [JRN-TEAT-001], [JRN-TEAT-006], [UC-TEAT-012], [RN-TEAT-003].
- Identidade: screenId `home`, uxCode `UX-MOB-007`, grupo `autenticacao-e-turno`, rota `/ux/mobile/home`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: resumo do turno e atalhos do fluxo.
- Ações/comandos: iniciar os fluxos autorizados.
- Validações e estados: somente ações permitidas ao papel e turno aberto.
- Critérios e fonte fechada: [JRN-TEAT-001].

## Navegação autoritativa

1. `context-help`
2. `close-shift`
3. `ait-start`
4. `vehicle-search`
5. `driver-search`
6. `measure-start`
7. `alcohol-start`
8. `crash-start`
9. `sync`
10. `diagnostics`
11. `messages`
12. `approach-no-ait`
13. `document-check`
14. `special-inspection`
15. `local-settings`
16. `ait-start`
17. `measure-start`
18. `crash-start`
19. `sync`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
