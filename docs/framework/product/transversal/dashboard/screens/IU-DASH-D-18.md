---
id: IU-DASH-D-18
title: KPIs do painel — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-12527-2011, REF-LEI-13460-2017]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/kpis` (`dashboard-frontends.md` §4, tela D-18; tela de apoio, sem
`P-nn` próprio).
Fontes: [APP-DASHBOARD].

## 1. Identidade

- `id`: `IU-DASH-D-18`; `path`: `/monitoramento/kpis` (`route-manifest.md` #18).
- `screen`: tela de apoio ([APP-DASHBOARD] §KPIs do próprio painel — o DASHBOARD mede a si
  mesmo).
- camada de produto: Contexto.
- módulo: `catalogue`.
- `slug`: `kpis`; segmento i18n: `kpis`.
- página: `SelfKpiPage`; componente inteligente principal: cartões de KPI com
  `TargetVsCeiling` quando aplicável.

## 2. Acesso

- `policy`: `dashboard:kpi:read` (contrato §4 `GET kpis`).
- `access`: N0 — cobertura, MTTA, MTTR, % deveres no prazo, frescor médio
  ([APP-DASHBOARD] §KPIs) são agregados institucionais (`route-manifest.md` §C linha D-18).
- `roles` (presença): `agency-admin`, `dash-operator`, AUDITOR (3).
- passe global: GESTOR_DETRAN, ADMIN, SUPORTE, `technical-admin` via §E (nenhum na matriz;
  todos N0/N1 ≥ N0) — divergência `OD-D16-005`.
- guardas: `authGuard` → `permissionGuard('dashboard:kpi:read')` → `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: menu Contexto.

## 4. Dados

- lê `GET kpis` (contrato §4): cobertura de indicadores (% dos 42 com fonte conectada), MTTA
  (tempo médio até `RECONHECIDO`), MTTR (tempo médio até `ENCERRADO`), % deveres cumpridos no
  prazo, frescor médio dos painéis ([APP-DASHBOARD] §KPIs).
- meta de cobertura MVP: 100% do bloco A (legal-ceiling), demais por onda
  ([APP-DASHBOARD] §KPIs; `dashboard-build-pack.md` §3).
- selo de frescor + `asOf` em cada KPI; metas propostas ainda sem calibração fina em alguns
  itens (`APP-DASHBOARD` §KPIs marca "a calibrar").

## 5. Estados

- **vazio**: `dashboard.screens.kpis.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando — tela de leitura pura.

## 7. Saída

- não há navegação de mérito a partir daqui; os KPIs são indicadores de resultado do próprio
  módulo de monitoramento.

## 8. Segurança e LGPD

- N0 — agregados institucionais, sem dado pessoal nem objeto de processo.

## 9. Acessibilidade

- meta e valor atual nunca no mesmo componente sem distinção quando o KPI envolver teto legal
  (ex. % de processos julgados dentro do teto de 24 meses é, ao mesmo tempo, indicador interno
  de risco e indicador público — [RN-DASH-117] verificação 3).

## 10. Testes

- roteamento: 3 papéis (presença) e demais (ausência); N3 bloqueado; GESTOR_DETRAN/ADMIN/
  SUPORTE/`technical-admin` via passe global como caso adicional de C-01-05.
- os cinco KPIs de [APP-DASHBOARD] §KPIs exibidos com selo de frescor.

## Componentes compartilhados

`FreshnessSeal`, `TargetVsCeiling`, `ClassificationBadge`.

## Chaves i18n

- `dashboard.screens.kpis.title` — "KPIs do painel"
- `dashboard.screens.kpis.intro` — "Cobertura de indicadores, MTTA, MTTR, % de deveres no prazo
  e frescor médio."
- `dashboard.screens.kpis.empty` — "Nenhum KPI disponível para o período."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.a11y.*`.

OD tocada: `OD-D16-005` (passe global).
