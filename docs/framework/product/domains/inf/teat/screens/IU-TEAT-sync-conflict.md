---
id: IU-TEAT-sync-conflict
title: Conflito de sincronização
status: draft
apps: [teat]
updated: 2026-09-21
---

# Conflito de sincronização

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-005], [WF-TEAT-002], [RN-TEAT-001].
- Identidade: screenId `sync-conflict`, uxCode `UX-MOB-082`, grupo `sincronizacao-suporte-e-diagnostico`, rota `/ux/mobile/sync-conflict`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: conflictId, conflictType, item local e recibo.
- Ações/comandos: corrigir e reenviar; descartar lote; escalar ao supervisor; aguardar apuração.
- Validações e estados: integridade, concorrência, numeração e divergência transitam conforme o recibo.
- Critérios e fonte fechada: TEAT.SYNC_INTEGRITY_ERROR, TEAT.SYNC_CONCURRENCY_SUSPECT, TEAT.SYNC_ITEM_CONFLICT.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `messages`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
