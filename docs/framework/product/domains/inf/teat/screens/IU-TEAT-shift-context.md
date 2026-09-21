---
id: IU-TEAT-shift-context
title: Selecionar unidade/equipe/viatura
status: draft
apps: [teat]
updated: 2026-09-21
---

# Selecionar unidade/equipe/viatura

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [JRN-TEAT-001], [JRN-TEAT-006], [UC-TEAT-012], [RN-TEAT-003].
- Identidade: screenId `shift-context`, uxCode `UX-MOB-004`, grupo `autenticacao-e-turno`, rota `/ux/mobile/shift-context`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: unidade, equipe, viatura e operação.
- Ações/comandos: selecionar contexto de turno.
- Validações e estados: contexto é carregado pelo bootstrap e não é inferido no cliente.
- Critérios e fonte fechada: [JRN-TEAT-001].

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `operation-select`
4. `home`
5. `ait-start`
6. `measure-start`
7. `crash-start`
8. `sync`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
