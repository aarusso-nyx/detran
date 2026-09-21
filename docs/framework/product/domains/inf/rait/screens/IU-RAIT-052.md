---
id: IU-RAIT-052
title: Falhas de integração e conciliação — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-931, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `integracoes/falhas` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-031].

## 1. Identidade

- id `IU-RAIT-052`; `path`: `integracoes/falhas` (route-manifest.md #55); `screen`: `—`.
- módulo `integracoes`; página `IntegrationFailuresPage`, componentes inteligentes
  `RetryQueueTable`, `ReconciliationDiff` (§5.3).
- nível `L0`; slug i18n `integracoes-falhas`.

## 2. Acesso

- papéis: `integration-operator`, `rait-manager` (route-manifest.md linha 55).
- guardas: `raitAuthGuard`; `roleGuard(['integration-operator', 'rait-manager'])`.
- chave de política: `inf:rait-integration:retry` (`rait-web-frontend.md` §7, ação análoga
  citada como `rait-integration:retry`/`rait-integration:reconcile` em
  `JW-11-operador-integracao.md` #3-#4).

## 3. Entrada

- chega-se pelo redirect de `/integracoes` ou pelas telas de espelhamento
  ([IU-RAIT-050], [IU-RAIT-051]).

## 4. Dados

- resolver da rota: "retransmissão e conciliação — §11 linha 6" (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 6 — pendente.
- desenho pretendido ([UC-RAIT-031] fluxo 1-4): itens em falha por sistema, idade, caso e causa
  retornada; retransmissão idempotente em lote; conciliação de divergência local × nacional com
  regra de precedência (local decide, nacional registra).

## 5. Estados

- **indisponível nesta versão** citando §11 linha 6.
- quando disponível: `503 UPSTREAM_*` → badge "pendente de retransmissão"
  (`rait-error-catalog.md` §4).

## 6. Comandos

| Ação (`recurso:ação`)        | Papel                                               | Pré-estado → pós-estado                               | Comando             | Confirmação                                                               | Erros esperados                                                                  |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------- | ------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `rait-integration:retry`     | `integration-operator`, `rait-manager` (`JW-11` #3) | item falho → reenfileirado                            | não sourceado em §7 | "recibos idênticos, sem registro duplicado" ([UC-RAIT-031] AC-RAIT-031-1) | `RAIT.RETRY_NOT_FAILED`, `RAIT.UPSTREAM_REJECTED`, `RAIT.UPSTREAM_*_UNAVAILABLE` |
| `rait-integration:reconcile` | `integration-operator`, `rait-manager` (`JW-11` #4) | divergência aberta → divergência fechada com registro | não sourceado em §7 | "mérito é intocável; só pode escalar" ([UC-RAIT-031] AC-RAIT-031-3)       | `RAIT.RECONCILIATION_DIVERGENCE`                                                 |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 6.
- divergência que altera o sujeito passivo ou a pontuação nunca é conciliada automaticamente; vai
  ao gestor ([UC-RAIT-031] 3a).

## 7. Saída

- conciliação registrada fica no histórico do caso com estado local, nacional e regra aplicada
  ([UC-RAIT-031] AC-RAIT-031-2).
- itens que dependem de marco jurídico (ex.: ciência ficta do SNE) são escalados ao gestor com o
  impacto nos prazos ([UC-RAIT-031] fluxo 4).

## 8. Segurança e LGPD

- painel de integração nunca altera decisão de mérito ([UC-RAIT-031] AC-RAIT-031-3).

## 9. Acessibilidade e atalhos

- `RetryQueueTable`/`ReconciliationDiff` navegáveis por teclado; contraste AA.

## 10. Testes

- AC-RAIT-031-1 — retransmissão nunca duplica.
- AC-RAIT-031-2 — conciliação registrada com estado local/nacional/regra.
- AC-RAIT-031-3 — mérito é intocável pelo painel.
- roteamento: `integration-operator`/`rait-manager` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`RetryQueueTable`, `ReconciliationDiff` (§5.3, integracoes).

## Chaves i18n

- `rait.screens.integracoes-falhas.title` — "Falhas de integração e conciliação"
- `rait.screens.integracoes-falhas.cmd.retry` — "Retransmitir"
- `rait.screens.integracoes-falhas.cmd.reconcile` — "Conciliar divergência"
