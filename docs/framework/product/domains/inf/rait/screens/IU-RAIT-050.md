---
id: IU-RAIT-050
title: Espelhamento RENAINF — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `integracoes/renainf` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-029].

## 1. Identidade

- id `IU-RAIT-050`; `path`: `integracoes/renainf` (route-manifest.md #53); `screen`: `—`.
- módulo `integracoes`; página `RenainfMirrorPage` (§5.3).
- nível `L0`; slug i18n `integracoes-renainf`.

## 2. Acesso

- papéis: `integration-operator`, `rait-manager` (route-manifest.md linha 53).
- guardas: `raitAuthGuard`; `roleGuard(['integration-operator', 'rait-manager'])`.

## 3. Entrada

- chega-se pelo redirect de `/integracoes` para `integration-operator`/`rait-manager`
  (route-manifest.md §B) ou pela navegação.

## 4. Dados

- resolver da rota: "espelhamento e recibos — §11 linha 6 (painel de integrações pendente)"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 6 — "Painel de integrações (adapter/outbox:
  filas, recibos, divergências)" — módulo FE `integracoes` — situação **pendente**.
- desenho pretendido ([UC-RAIT-029] fluxo 1-4; `rait-web-journeys/JW-11-operador-integracao.md` #1):
  estado local × `SituacaoRenainf` por infração, recibo nacional, `consultado_em`/`fonte`
  ([RN-PORTAL-117]).

## 5. Estados

- **indisponível nesta versão** (`rait.states.unavailable_in_version`) citando §11 linha 6.
- quando disponível: `503 UPSTREAM_RENAINF_UNAVAILABLE` → badge "pendente de retransmissão"
  (`rait-error-catalog.md` §4), sem bloquear a instrução do caso ([UC-RAIT-029] AC-RAIT-029-3).

## 6. Comandos

Tela de leitura. Retransmissão e conciliação vivem em `/integracoes/falhas` ([IU-RAIT-052]).

## 7. Saída

- divergência entre estado local e RENAINF abre tarefa de conciliação em `/integracoes/falhas`
  ([UC-RAIT-029] fluxo 3 → [UC-RAIT-031]).

## 8. Segurança e LGPD

- nenhuma chamada ao RENAINF fora de `packages/senatran-adapter` (ADR-0003;
  [UC-RAIT-029] AC-RAIT-029-1).

## 9. Acessibilidade e atalhos

- padrão: contraste AA, foco visível; sem atalho dedicado.

## 10. Testes

- AC-RAIT-029-1 — só o senatran-adapter emite a chamada nacional.
- AC-RAIT-029-2 — atualização idempotente (mesmo evento reenviado → um recibo).
- AC-RAIT-029-3 — falha nacional não trava o processo local.
- roteamento: `integration-operator`/`rait-manager` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente nesta rodada (tabela padrão STYNX).

## Chaves i18n

- `rait.screens.integracoes-renainf.title` — "Espelhamento RENAINF"
