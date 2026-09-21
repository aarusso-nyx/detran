---
id: IU-DASH-D-03
title: Radar de prescrição RAIT — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-CTB-280-290, REF-LEI-9873-1999, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/radar/rait` (`dashboard-frontends.md` §4, tela D-03; painel P-02
de [IU-DASH-001]).
Fontes: [UC-DASH-001], [JRN-DASH-002], [RN-DASH-130], [RN-DASH-131].

## 1. Identidade

- `id`: `IU-DASH-D-03`; `path`: `/monitoramento/radar/rait` (`route-manifest.md` #3).
- `screen`: P-02 ("Radar de prescrição RAIT" de [IU-DASH-001] §A).
- camada de produto: Ação.
- módulo: `radar`.
- `slug`: `radar-rait`; segmento i18n: `radar_rait`.
- página: `RaitRadarPage`; componente inteligente principal: lista de casos por faixa com
  `ClockGovernorBadge` (relógio governante nomeado por processo).

## 2. Acesso

- `policy`: `dashboard:alert:read` (prov., `OD-D16-002` — o radar não tem rota `GET` própria no
  contrato §4; lê `GET alerts` filtrada por `app`/`block`).
- `access`: N1 — "casos por faixa", contagens e filtros pool/circuito/unidade
  (`route-manifest.md` §C linha D-03); o card com número do processo e o drill-down ao RAIT são
  N2, via `LayerGate` ([RN-DASH-142] verificação 3).
- `roles` (presença): os 9 de `route-manifest.md` §D (`dash-operator`, AREA-MANAGERS,
  `agency-admin`, `technical-admin`, AUDITOR).
- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados pela camada (`OD-D16-005`).
- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`;
  `LayerGate` no drill-down N2; gestor de área só no próprio domínio
  (`DASH.DOMAIN_SCOPE_MISMATCH`).

## 3. Entrada

- de onde se chega: menu do grupo Ação (`route-manifest.md` §I); deep-link a partir de D-01
  quando o item é RAIT.
- parâmetros de rota: nenhum.
- filtros de URL: pool, circuito, unidade (`dashboard-frontends.md` §4).

## 4. Dados

- lê `GET alerts` filtrada por `app=rait` (contrato §2, `OD-D16-002`); projeção
  `dashboard.prescription_risk` (`dashboard-route-contract.md` §6, IND-DASH-101…105).
- por caso: nível de severidade (N1/N2/N3/CRÍTICO), base legal citada explicitamente
  ("CTB art. 289-A"), dono, tempo restante, selo de frescor da leitura ([UC-DASH-001] passo 3).
- os quatro relógios A/B/C/D são monitorados em paralelo por processo, com o menor tempo
  restante promovido a indicador de urgência ([RN-DASH-131]: "o mais curto governa" —
  [AC-DASH-001-1]); relógio B distingue 1ª/2ª instância por `instancia`, nunca por letra própria.
- indicador sem escada calibrada (IND-DASH-105) aparece com o marco absoluto, sinalizado "sem
  escada calibrada" ([UC-DASH-001] fluxo alternativo).
- gap de dado do CETRAN (IND-DASH-103, sem `data_recebimento_cetran`) aparece como "sem leitura
  — integração pendente", nunca como falso `SEM_RISCO`.
- letras dos relógios são exclusivamente as do RAIT ([IU-DASH-001] §C.1, [AC-DASH-001-2]);
  rótulos de `b`/`c` vêm de `dashboard.clocks`; `a`/`d` mostram só a letra (`OD-D16-007`).

## 5. Estados

- **vazio**: `dashboard.screens.radar_rait.empty` — nenhum caso acima de risco mínimo no
  recorte.
- **carregando**: `dashboard.states.loading`.
- **erro**: `dashboard.states.error` + `dashboard.errors.<code>`.
- **indisponível**: `INDISPONIVEL` oculta o número (bloco A, default de [WF-DASH-003]) — "sem
  leitura desde `{as_of}` — fonte indisponível".
- **desatualizado**: não se aplica por padrão (bloco A oculta em vez de marcar); só ocorre se o
  painel for parametrizado fora do default.
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando de mutação. Ações: ver detalhe (drill-down N2 via `LayerGate`, formulário
  `finalidade-n2`), filtrar por pool/circuito/unidade, deep-link ao dossiê no RAIT
  ([RN-DASH-101]). Nenhum ato de negócio (declarar prescrição, julgar) nasce aqui.

## 7. Saída

- clique no card com finalidade declarada leva ao dossiê do processo no RAIT
  ([JRN-DASH-002] passo 3); ao retornar, o card reflete o estado lido, sem exigir atualização
  manual ([JRN-DASH-002] passo 6).

## 8. Segurança e LGPD

- N1 nos agregados; N2 (nº do processo) só sob `LayerGate` com finalidade registrada
  ([RN-DASH-171]); N3 nunca.
- gestor de área só no próprio domínio; divergência entre o relógio do painel e o do RAIT é
  sempre incidente de dado do painel, nunca do RAIT ([RN-DASH-131] verificação 4).
- risco processual (contagem de casos por relógio) é P2 no máximo, nunca P1
  ([RN-DASH-142] verificação 6).

## 9. Acessibilidade

- severidade por forma + rótulo, nunca só cor; relógio governante identificado por letra visível
  ([AC-DASH-001-1]).
- base legal sempre ao lado do número, nunca número solto ([AC-DASH-001-5]).
- `aria-live` na contagem por faixa.

## 10. Testes

- roteamento: 9 papéis (presença) e demais (ausência); N3 bloqueado.
- os quatro relógios exibidos separadamente, menor tempo restante promovido a urgência
  ([AC-DASH-001-1]); letras exclusivamente as do RAIT ([AC-DASH-001-2]).
- estados vazio/carregando/erro/indisponível como critérios; selo de frescor em todo número
  ([AC-DASH-001-6]).
- N2 nunca aparece sem `LayerGate` ([C-01-09]).

## Componentes compartilhados

`FreshnessSeal`, `SeverityChip`, `ClockGovernorBadge`, `LegalBasisTag`, `LayerGate`,
`DeepLinkButton`, `ClassificationBadge`.

## Chaves i18n

- `dashboard.screens.radar_rait.title` — "Radar de prescrição RAIT"
- `dashboard.screens.radar_rait.intro` — "Casos por faixa de risco, relógio governante A/B/C/D
  nomeado, base legal e tempo restante."
- `dashboard.screens.radar_rait.empty` — "Nenhum caso em risco de prescrição no recorte atual."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.clocks.*`, `dashboard.errors.*`, `dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.

OD tocada: `OD-D16-002` (política provisória), `OD-D16-007` (rótulos dos relógios a/d).
