---
id: IU-DASH-D-13
title: Estatística de sinistros — especificação de tela
status: draft
apps: [dashboard]
sources:
  [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025, REF-CONTRAN-808-2020]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/sinistros` (`dashboard-frontends.md` §4, tela D-13; painel P-09 de
[IU-DASH-001]).
Fontes: [UC-DASH-005], [RN-DASH-160], [RN-DASH-161].

## 1. Identidade

- `id`: `IU-DASH-D-13`; `path`: `/monitoramento/sinistros` (`route-manifest.md` #13).
- `screen`: P-09 ("Estatística agregada de sinistros" de [IU-DASH-001] §A — destravado com
  supressão secundária ativa, OD-D02/DT-029, steering H.54).
- camada de produto: Contexto.
- módulo: `crashes`.
- `slug`: `sinistros`; segmento i18n: `sinistros`.
- página: `CrashStatisticsPage`; componente inteligente principal: `DistributionChart` com
  `SuppressedCell`.

## 2. Acesso

- `policy`: `dashboard:comparison:read` (prov., `OD-D16-002` — compartilhada com D-10,
  [UC-DASH-005]).
- `access`: N0 — estatística **agregada** com supressão primária e secundária (OD-D02,
  `dashboard.cell_threshold = 10`; [RN-DASH-161]) equivale a "séries anonimizadas"
  ([RN-DASH-170] linha N0; `route-manifest.md` §C linha D-13); dado de saúde de vítima é N3 e
  nunca é servido ([RN-DASH-170] linha N3).
- `roles` (presença): `agency-admin`, AREA-MANAGERS, `bi-analyst`, AUDITOR (8).
- passe global: `technical-admin`, GESTOR_DETRAN, ADMIN, SUPORTE via §E (não na matriz, todos
  N0) — divergência `OD-D16-005`.
- guardas: `authGuard` → `permissionGuard('dashboard:comparison:read')` → `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: menu Contexto.
- filtros de URL: `dimension` (contrato §4), município/período/gravidade com parcimônia
  deliberada — a combinação de três dessas dimensões aciona revisão obrigatória
  ([RN-DASH-161] "dimensões de alto risco").

## 4. Dados

- lê `GET comparisons` com `dimension` voltada a sinistros (`OD-D16-002`); projeção
  `dashboard.crashes` (contrato §6, IND-DASH-203, 204, 310).
- limiar mínimo de célula **10**, aplicado antes da renderização e da exportação
  (`dashboard.cell_threshold`, OD-D02/DT-029 respondido; steering H.54); supressão primária e
  secundária obrigatórias — suprimir só a célula pequena não basta se o total permite recuperar
  o valor por subtração ([RN-DASH-161] verificação 2); célula suprimida sempre visível, marcada
  "suprimida (limiar)", nunca zero.
- generalização geográfica é o padrão recomendado quando possível (agrupar municípios pequenos
  em mesorregião, mês em trimestre) ([RN-DASH-161] verificação 3).
- selo de frescor + `asOf`; classificação P1/P2/P3 antes de exibir — a estatística agregada é
  P2 no máximo, publicável só por decisão documentada do órgão com apoio do Encarregado
  ([RN-DASH-142] linha P2).

## 5. Estados

- **vazio**: `dashboard.screens.sinistros.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: `DASH.PANEL_BLOCKED_BY_DECISION` como o estado **genérico** dos
  seis obrigatórios (WP-D4) — residual, sem decisão pendente atribuída a ele: a rota é real e
  serve com supressão secundária ativa (OD-D02/DT-029 já respondido); o estado só ocorreria se
  uma leitura específica dependesse de outra decisão futura, não a que já destravou a tela.
- DT-066 (adesão à Lei 14.129/2021) não condiciona esta tela — condiciona apenas D-12
  (`dashboard-frontends.md` M4).

## 6. Comandos

- Nenhum comando de mutação; nenhum formulário próprio (`route-manifest.md` linha 13, coluna
  `forms`: "—"). Ações: ver, filtrar por dimensão com parcimônia.

## 7. Saída

- não há deep-link de mérito a partir desta tela — a estatística é institucional, sem objeto de
  processo individual a acionar.

## 8. Segurança e LGPD

- N0 — série anonimizada com supressão dupla; N3 nunca (dado de saúde de vítima,
  [RN-DASH-162]); agregar não é anonimizar ([RN-DASH-160] verificação 1) — a proteção do art. 12
  é condicional e reavaliada periodicamente.
- teste de cruzamento com o que já é público antes de qualquer nova publicação
  ([RN-DASH-161] verificação 4); nenhuma consulta parametrizada livre na superfície pública
  ([RN-DASH-161] verificação 5).

## 9. Acessibilidade

- célula suprimida com marca textual "suprimida (limiar)" e nota de rodapé, nunca só visual;
  `aria-live` na distribuição.

## 10. Testes

- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin`/
  GESTOR_DETRAN/ADMIN/SUPORTE via passe global como caso adicional de C-01-05.
- célula suprimida sempre visível quando houver agregado, nunca zero ([AC-DASH-005-1]); estado
  "bloqueado por decisão" nunca aparece atribuído a uma decisão pendente nesta tela (D-13 já
  destravada).
- os cinco controles de [RN-DASH-161] como critérios do pipeline de exibição.

## Componentes compartilhados

`DistributionChart`, `SuppressedCell`, `ClassificationBadge`, `FreshnessSeal`.

## Chaves i18n

- `dashboard.screens.sinistros.title` — "Estatística de sinistros"
- `dashboard.screens.sinistros.intro` — "Séries agregadas de sinistros com supressão de célula
  primária e secundária."
- `dashboard.screens.sinistros.empty` — "Nenhum recorte com contagem acima do limiar de
  supressão."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.a11y.*`.

OD tocada: `OD-D16-002` (política provisória), `OD-D16-005` (passe global); OD-D02/DT-029
transcrita (não reaberta).
