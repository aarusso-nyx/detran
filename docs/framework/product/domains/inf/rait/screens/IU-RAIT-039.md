---
id: IU-RAIT-039
title: Radar de prescrição — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-extracts-raw, REF-LEI-9873-1999]
updated: 2026-09-21
---

Ficha da rota `gestao/radar` (`rait-web-frontend.md` §4; tela T-14 de [IU-RAIT-001]).
Fontes: [UC-RAIT-010], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-039`; `path`: `gestao/radar` (route-manifest.md #40); `screen`: `T-14`.
- módulo `gestao` (`rait-web-frontend.md` §2); página `RiskRadarPage`, componente inteligente
  `ClockRadar` (§5.3).
- nível `L2` (route-manifest.md, M13); slug i18n `gestao-radar`.

## 2. Acesso

- papel: `rait-manager` (route-manifest.md linha 40).
- guardas: `raitAuthGuard`; `roleGuard(['rait-manager'])`. Sem `caseAccessGuard` (tela agregada,
  não um caso específico).
- pré-condição: existem casos ativos com bandeira de risco calculada pela plataforma
  ([WF-RAIT-002] §4/§6, citado em [UC-RAIT-010] Pré-condições).

## 3. Entrada

- chega-se pelo redirect de `/gestao` (primeiro filho permitido a `rait-manager`,
  route-manifest.md §B) ou pela navegação (`rait.nav.gestao`).
- sem parâmetro de rota; aceita `?q=&ordem=&filtro=` (`rait-web-frontend.md` §4) para segmentar
  por relógio (A/B/C), pool e nível de alerta ([UC-RAIT-010] AC-RAIT-010-1); deep-link com filtro
  é o formato canônico de compartilhamento.

## 4. Dados

- resolver: "radar de prescrição por relógio" (route-manifest.md).
- leitura via `RadarFacade` sobre `GET clocks?flag>=ALERTA_N1` e SSE `clock.flag-changed`
  (`rait-web-journeys/JW-09-gestor.md` #1; `rait-web-frontend.md` §8).
- campos: relógio (A — decadência 180/360d; B — inércia recursal 24 meses; C — paralisação
  3 anos), pool, nível de alerta (`ALERTA_N1`…`CRITICO`), dias restantes até o teto legal — nunca
  só a cor da bandeira ([UC-RAIT-010] AC-RAIT-010-1).
- dias restantes, nível de alerta e ordenação são **calculados no backend**, nunca recalculados no
  cliente ([RN-RAIT-005], [RN-RAIT-105]; `rait-web-frontend.md` §1).

## 5. Estados

- **carregando**: esqueleto da tabela.
- **vazio**: "nenhum caso em alerta no momento" (`rait.screens.gestao-radar.empty`).
- **erro recuperável**: retry, mantém o filtro aplicado.
- **sem permissão**: 403 `RAIT.FORBIDDEN_ACTION` → banner "sem permissão para esta ação"
  (`rait.errors.forbidden`; `rait-error-catalog.md` §4).
- **atualização ao vivo**: caso que atinge `ALERTA_N3`/`CRITICO` notifica ativamente a cadeia de
  escalonamento ([UC-RAIT-010] AC-RAIT-010-2, evento `RAIT_ALERTA_PRESCRICAO`); quando o SSE cai,
  fallback por polling de 15s (`rait-web-frontend.md` §8/M10).

## 6. Comandos

Tela primariamente de leitura. Não expõe comando de escrita próprio; a ação corretiva
(reatribuir, reconhecer alerta, abrir incidente) fica no drill-down (`/gestao/radar/:caseId`,
[IU-RAIT-040]) alcançado pela linha do caso.

## 7. Saída

- clique na linha abre `/gestao/radar/:caseId` ([IU-RAIT-040]).
- nada é descartado ao sair; o filtro da URL persiste.

## 8. Segurança e LGPD

- a lista não exibe texto livre da petição em nenhuma coluna ([RN-RAIT-134]).
- dados de terceiros suprimidos campo a campo ([RN-RAIT-137]).
- nenhum segredo ou identificador sensível em URL/log.

## 9. Acessibilidade e atalhos

- `j`/`k` navega a lista; `enter` abre o drill-down (`rait-web-frontend.md` §10).
- urgência comunicada por ordenação **e** rótulo textual "faltam N dias", nunca só por cor
  ([UC-RAIT-010] AC-RAIT-010-5; [IU-RAIT-001] §4).
- contraste AA; foco visível.

## 10. Testes

- AC-RAIT-010-1 — segmentação por relógio, pool e nível, com dias restantes visíveis.
- AC-RAIT-010-2 — notificação ativa quando um caso atinge `ALERTA_N3`/`CRITICO`.
- AC-RAIT-010-5 — urgência não depende só de cor.
- roteamento: `rait-manager` ativa `data.screen === 'T-14'`; demais papéis canônicos →
  `UrlTree('/sem-permissao')` (M14).

## Componentes compartilhados

`RiskFlag`, `DeadlineChip`, `ClocksPanel` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.gestao-radar.title` — "Radar de prescrição"
- `rait.screens.gestao-radar.intro` — "Casos posicionados pela proximidade ao relógio que mais os ameaça"
- `rait.screens.gestao-radar.empty` — "Nenhum caso em alerta no momento"

Rótulos de bandeira (`rait.riskFlag.*`), de papel e de erro são referenciados pela semente
(`rait-i18n-glossary.md` §1), nunca redefinidos aqui.
