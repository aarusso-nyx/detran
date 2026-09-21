---
id: IU-RAIT-007
title: Resumo do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/resumo` (`rait-web-frontend.md` §4; sem tela própria em [IU-RAIT-001],
aba padrão do layout T-04). Fontes: [JRN-RAIT-001] (herdadas de `/casos/:id`).

## 1. Identidade

- id: `IU-RAIT-007`; `path`: `casos/:id/resumo` (`route-manifest.md` #7).
- `screen`: `—` (sem tela própria no inventário).
- módulo: `caso`; a página não tem nome próprio em §5.3 além do conjunto de abas de
  `CaseLayoutPage`; componentes inteligentes: `CaseHeader` (reexibido em corpo de página) e
  `ClocksPanel` (`rait-web-frontend.md` §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-resumo`.

## 2. Acesso

- papéis: `todos` — herda os papéis de `/casos/:id` (M4, `route-manifest.md` #7).
- guardas: as de `/casos/:id` (`raitAuthGuard`, `roleGuard`, `caseAccessGuard` pendente).
- é a aba padrão para todo papel sem aba própria (`route-manifest.md` §C: "demais → `resumo`").
- sem chave de política própria (leitura).

## 3. Entrada

- de onde se chega: aba inicial de `/casos/:id` para todo papel sem aba própria (`rait-secretary`,
  `rait-coordinator`, `rait-central-authority`, `rait-chair`, `rait-manager`, `rait-hr`,
  `rait-finance`, `integration-operator`, AUDITOR, `agency-admin` — `route-manifest.md` §C).
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/resumo`.

## 4. Dados

- resolver: "cabeçalho, estado, relógios, próximas ações" (`route-manifest.md` #7).
- clientes: `data/api/case.client.ts` (`RaitCase`, `RaitClock`).
- calculado do backend: os quatro relógios A/B/C/D com base legal e dias restantes
  (`ClocksPanel`, `rait-web-frontend.md` §5.2); próximas ações permitidas ao papel logado.

## 5. Estados

- **carregando**: skeleton do cabeçalho e do painel de relógios.
- **vazio**: não se aplica — sempre há um caso resolvido pelo layout pai.
- **erro recuperável**: falha ao carregar; retry.
- **sem permissão**: herdada do layout — `RAIT.FORBIDDEN_CASE_SCOPE` (403).
- **conflito**: `RAIT.CASE_STATE_INVALID` (409) — recarrega a aba.

## 6. Comandos

Nenhum comando de mutação — é a visão de leitura consolidada do caso. As "próximas ações"
exibidas navegam para a aba correspondente (triagem, diligências, minuta, decisão), onde os
comandos reais são disparados.

## 7. Saída

- clique numa "próxima ação" navega à aba responsável pelo comando.
- SSE (`case.changed`, `clock.flag-changed`) atualiza o painel de relógios sem reload.

## 8. Segurança e LGPD

- não exibe texto livre da petição ([RN-RAIT-134]); terceiros suprimidos ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- herda os atalhos do layout (`t`, `d`); risco nunca só por cor ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: aba padrão para papéis sem aba própria; presente para `todos`, herdando o layout
  (M14).
- estados carregando/erro/conflito como critérios de aceitação.

## Componentes compartilhados

`CaseHeader`, `ClocksPanel`, `DeadlineChip`, `RiskFlag` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-resumo.title` — "Resumo do caso"
- `rait.screens.casos-id-resumo.intro` — "Estado, relógios e próximas ações."
- `rait.screens.casos-id-resumo.empty` — "Nenhuma ação pendente no momento."
