---
id: IU-DASH-D-14
title: Catálogo de indicadores — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-LEI-12527-2011]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/indicadores` (`dashboard-frontends.md` §4, tela D-14; tela de
apoio, origem `indicator-config`, sem `P-nn` próprio).
Fontes: [RN-DASH-120], [RN-DASH-142].

## 1. Identidade

- `id`: `IU-DASH-D-14`; `path`: `/monitoramento/indicadores` (`route-manifest.md` #14; rota
  filha de detalhe `/monitoramento/indicadores/:id` em `route-manifest.md` §B, mesma ficha,
  mesmas guardas).
- `screen`: tela de apoio (sem painel dedicado; conteúdo transversal aos blocos A–D).
- camada de produto: Contexto.
- módulo: `catalogue`.
- `slug`: `indicadores`; segmento i18n: `indicadores`.
- página: `IndicatorCataloguePage`; componente inteligente principal: tabela dos 42
  indicadores.

## 2. Acesso

- `policy`: `dashboard:indicator:read` (contrato §4 `GET indicators`, N0).
- `access`: N0 — catálogo sem dado de caso (`route-manifest.md` §C linha D-14).
- `roles` (presença): N0-ROLES (34).
- passe global: sem efeito adicional.
- guardas: `authGuard` → `permissionGuard('dashboard:indicator:read')` →
  `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: menu Contexto.
- parâmetros de rota: nenhum na lista; `:id` na rota filha de detalhe (`route-manifest.md` §B).
- filtros de URL: por bloco, por classificação.

## 4. Dados

- lê `GET indicators`, `GET indicators/{code}` (contrato §4): os **42 indicadores** com bloco,
  fonte, limiar, dono, classificação P1/P2/P3, latência aceitável, `connected` (fonte conectada
  ou não).
- distingue os dois conjuntos nomeados junto com D-08: **"9 indicadores do bloco B"**
  ([APP-DASHBOARD] §Catálogo B) e **"14 linhas da tabela-mestra"** ([RN-DASH-120] — inclui SLA e
  Pnatrans; `dashboard-build-pack.md` §5 inconsistência 4).
- classificação P1/P2/P3 como atributo obrigatório antes de exibir ([RN-DASH-142]
  verificação 1: "todo indicador nasce P3"); indicador sem P1/P2/P3 não é exibido nem exportado
  (`DASH.CLASSIFICATION_MISSING`).
- os 42 nomes vêm do seed de R-0011, transcritos sem edição — divergência futura é `plant-bug`
  de quem divergir (`plan.md` M5).

## 5. Estados

- **vazio**: `dashboard.screens.indicadores.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica ao catálogo em si (a rota é de leitura de metadados,
  sempre servida).

## 6. Comandos

| Rota (contrato §4)                    | Ação      | Papel                                           | Payload                                           | Efeito                   | Erro esperado                                                                                                       |
| ------------------------------------- | --------- | ----------------------------------------------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `PATCH indicator-configs/{id}`        | `update`  | `bi-analyst`, `agency-admin`, `technical-admin` | limiar, dono, latência, classificação, estratégia | rascunho de configuração | `DASH.INDICATOR_LATENCY_INVALID`                                                                                    |
| `POST indicator-configs/{id}/publish` | `publish` | idem                                            | —                                                 | configuração vigente     | `DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED`, `DASH.INDICATOR_TARGET_AND_CEILING_MIXED`, `DASH.CLASSIFICATION_MISSING` |

- classificação obrigatória antes de publicar; meta operacional e teto legal nunca no mesmo
  componente de configuração ([WF-RAIT-002] §4.5).
- os dois recursos da origem (`bi-panel`, `generated-report`) permanecem como telas de apoio
  D-14/D-16 por decisão OD-D13 (steering H.54).

## 7. Saída

- clique num indicador navega à rota filha de detalhe (`:id`, `route-manifest.md` §B); a
  publicação de configuração reflete nas telas que exibem aquele indicador.

## 8. Segurança e LGPD

- N0 — metadados de configuração, sem dado de caso; classificação declarada antes de exibir ou
  exportar.

## 9. Acessibilidade

- os dois conjuntos ("9 indicadores do bloco B", "14 linhas da tabela-mestra") nomeados com
  rótulo textual explícito, não apenas por contagem numérica.

## 10. Testes

- roteamento: N0-ROLES (presença) e CANDIDATO/CIDADAO (ausência); N3 bloqueado.
- indicador sem classificação nunca exibido nem exportável (`DASH.CLASSIFICATION_MISSING`);
  publicação rejeita mistura de meta e teto no mesmo componente.
- os dois conjuntos nomeados distintamente, ligados à inconsistência 4 do build pack.

## Componentes compartilhados

`FreshnessSeal`, `ClassificationBadge`, `TargetVsCeiling`, `SourceStatusTable`.

## Chaves i18n

- `dashboard.screens.indicadores.title` — "Catálogo de indicadores"
- `dashboard.screens.indicadores.intro` — "42 indicadores com bloco, fonte, limiar, dono,
  classificação e latência aceitável."
- `dashboard.screens.indicadores.empty` — "Nenhum indicador corresponde ao filtro atual."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.blocks.*`,
`dashboard.classification.*`, `dashboard.indicators.*`, `dashboard.errors.*`,
`dashboard.forms.configurar_indicador.*`, `dashboard.a11y.*`.
