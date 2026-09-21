---
id: IU-RAIT-051
title: Penalidades e estornos RENACH — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `integracoes/renach` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-030].

## 1. Identidade

- id `IU-RAIT-051`; `path`: `integracoes/renach` (route-manifest.md #54); `screen`: `—`.
- módulo `integracoes`; página `RenachPage` (§5.3).
- nível `L0`; slug i18n `integracoes-renach`.

## 2. Acesso

- papéis: `integration-operator`, `rait-manager` (route-manifest.md linha 54).
- guardas: `raitAuthGuard`; `roleGuard(['integration-operator', 'rait-manager'])`.

## 3. Entrada

- chega-se pelo redirect de `/integracoes` ou pela navegação.

## 4. Dados

- resolver da rota: "penalidades definitivas e estornos — §11 linha 6"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 6, mesma do [IU-RAIT-050] — pendente.
- desenho pretendido ([UC-RAIT-030] fluxo 1-4; `JW-11-operador-integracao.md` #2): penalidades
  definitivas enviadas ao RENACH somente após `INSTANCIA_ENCERRADA` ([RN-RAIT-131]), pontuação,
  estornos em cancelamento definitivo posterior.

## 5. Estados

- **indisponível nesta versão** citando §11 linha 6.
- quando disponível: indicador de "penalidades definitivas não cadastradas" visível ao operador
  em falha de cadastro ([UC-RAIT-030] 2a).

## 6. Comandos

Tela de leitura. Nada é cadastrado antes do encerramento da instância
([UC-RAIT-030] AC-RAIT-030-1); estorno é automático ao cancelamento definitivo
([UC-RAIT-030] AC-RAIT-030-3), sem ação humana nesta tela.

## 7. Saída

- falha de cadastro segue para retransmissão em `/integracoes/falhas` ([IU-RAIT-052]).

## 8. Segurança e LGPD

- nenhuma chamada ao RENACH fora de `packages/senatran-adapter` (ADR-0003).

## 9. Acessibilidade e atalhos

- padrão: contraste AA, foco visível.

## 10. Testes

- AC-RAIT-030-1 — nada vai ao RENACH antes do encerramento.
- AC-RAIT-030-2 — advertência não pontua.
- AC-RAIT-030-3 — estorno automático em cancelamento definitivo.
- roteamento: `integration-operator`/`rait-manager` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente nesta rodada.

## Chaves i18n

- `rait.screens.integracoes-renach.title` — "Penalidades e estornos RENACH"
