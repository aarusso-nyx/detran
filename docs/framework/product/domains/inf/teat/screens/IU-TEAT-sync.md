---
id: IU-TEAT-sync
title: Fila de sincronização
status: draft
apps: [teat]
updated: 2026-09-21
---

# Fila de sincronização

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-005], [WF-TEAT-002], [RN-TEAT-001].
- Identidade: screenId `sync`, uxCode `UX-MOB-080`, grupo `sincronizacao-suporte-e-diagnostico`, rota `/ux/mobile/sync`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: itens locais, lote, sequência e recibos.
- Ações/comandos: enviar lote e consultar a fila.
- Validações e estados: erro por item não bloqueia nova lavratura.
- Critérios e fonte fechada: [UC-TEAT-005], [WF-TEAT-002].

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync-item`
8. `sync-conflict`
9. `sync`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
