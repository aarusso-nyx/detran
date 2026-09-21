---
id: IU-RAIT-002
title: Painel do turno — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `painel` (`rait-web-frontend.md` §4; tela T-01 de [IU-RAIT-001]).
Fontes: [UC-RAIT-003], [JRN-RAIT-001].

## 1. Identidade

- id: `IU-RAIT-002`; `path`: `painel` (`route-manifest.md` #2).
- `screen`: `T-01`; módulo: `painel` (`rait-web-frontend.md` §2).
- página: `ShiftDashboardPage`; componente inteligente: `ShiftSummaryCards` — vencendo em 5 dias,
  diligências expirando, parados há N dias (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `painel`.

## 2. Acesso

- papéis: `todos` (os 13 códigos canônicos de `roles` — `route-manifest.md` #2).
- guardas: `raitAuthGuard` (sessão STYNX ativa); `roleGuard` sem restrição adicional, pois a rota
  não exige papel específico (M4, `plan.md`).
- não há chave de política própria: a tela é de leitura agregada, sem ação de comando.
- pré-condição: sessão ativa; nenhuma pré-condição de estado do caso.

## 3. Entrada

- de onde se chega: `/` via `RoleHomeRedirect` para a maioria dos papéis — rota inicial de
  `rait-analyst`, `rait-rapporteur` e, provisoriamente, `rait-chair` (`route-manifest.md` §B;
  `OD-R12-002` para o destino definitivo do presidente); também alcançável pela navegação lateral
  para qualquer papel (`todos`).
- parâmetros de rota: nenhum.
- sem `?q=&ordem=&filtro=`: a tela é um resumo agregado, não uma lista paginada.
- deep-link canônico: `/painel`.

## 4. Dados

- resolver: "resumo do turno (fila, vencendo, diligências, parados)" (`route-manifest.md` #2;
  [UC-RAIT-003]).
- clientes gerados: `data/api/worklist.client.ts` (contagens de fila e atribuição),
  `data/api/case.client.ts` (contagens de casos vencendo/parados) — `rait-web-frontend.md` §8.
- campos calculados no backend: contagem de "vencendo em 5 dias" e "diligência expirando" vêm do
  motor de prazos único ([RN-RAIT-005]); a ordem e a bandeira de risco de cada item não são
  recalculadas no cliente (`rait-web-frontend.md` §1).
- SSE (`/v1/inf/rait/stream`) atualiza os cartões sem reload ([JRN-RAIT-001] passo 1;
  `rait-web-frontend.md` §8).

## 5. Estados

- **carregando**: skeleton dos três cartões de `ShiftSummaryCards`.
- **vazio**: nenhum caso vencendo/em diligência expirando/parado — cartões mostram zero, sem
  bloquear a navegação.
- **erro recuperável**: falha ao carregar o resumo — `RAIT.INTERNAL` (500, catálogo §3) ou erro de
  rede; botão de repetir.
- **sem permissão**: não se aplica dentro da tela — ausência de qualquer papel canônico é resolvida
  pelo `roleGuard` antes de chegar aqui, com `UrlTree('/sem-permissao')` (`rait.errors.forbidden`).
- **indisponível** (parcial): SSE fora do ar → banner `rait.states.stream_unavailable`, os cartões
  continuam atualizando por polling de 15 s (M10, `plan.md`; `rait-web-frontend.md` §8).

## 6. Comandos

Nenhum comando de mutação nesta tela — é um painel de leitura agregada. As ações disponíveis são
navegações para `/fila/defesa`, `/fila/recurso/:orgao`, `/painel/retomar` ou `/casos/:id`,
disparadas a partir dos cartões.

## 7. Saída

- clique num cartão navega à fila ou ao caso correspondente; a contagem do cartão de origem se
  atualiza via SSE/polling sem exigir novo carregamento da tela.

## 8. Segurança e LGPD

- a tela exibe apenas contagens agregadas, nunca o texto livre da petição de um caso específico
  ([RN-RAIT-134]: texto livre nunca em listas/painéis).
- nenhum dado de terceiro é exibido.

## 9. Acessibilidade e atalhos

- atalho `g p` navega ao painel a partir de qualquer tela (`rait-web-frontend.md` §10).
- `aria-live` nas contagens dos cartões, que mudam via SSE/polling.
- risco nunca comunicado só por cor — rótulo textual de dias restantes acompanha cada contagem
  ([IU-RAIT-001] §Requisitos transversais item 4).

## 10. Testes

- roteamento: qualquer um dos 13 papéis canônicos ativa a rota; sessão sem nenhum papel →
  `/sem-permissao` (M14).
- estados carregando/vazio/erro recuperável/indisponível (SSE) como critérios de aceitação,
  ligados a [UC-RAIT-003] (fila e atribuição do turno).
- `ShiftSummaryCards` nunca comunica urgência só por cor (critério transversal [IU-RAIT-001] §4).

## Componentes compartilhados

`ShiftSummaryCards`, `DeadlineChip`, `RiskFlag` (`rait-web-frontend.md` §5.2, §5.3).

## Chaves i18n

- `rait.screens.painel.title` — "Painel do turno"
- `rait.screens.painel.intro` — "Resumo do turno: vencendo, diligências expirando e casos parados."
- `rait.screens.painel.empty` — "Nenhum caso urgente no momento."
