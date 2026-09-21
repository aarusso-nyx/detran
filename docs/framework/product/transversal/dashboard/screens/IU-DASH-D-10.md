---
id: IU-DASH-D-10
title: Comparativo — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/comparativo` (`dashboard-frontends.md` §4, tela D-10; painel P-06
de [IU-DASH-001]).
Fontes: [UC-DASH-005], [JRN-DASH-006], [RN-DASH-142], [RN-DASH-160], [RN-DASH-161].

## 1. Identidade

- `id`: `IU-DASH-D-10`; `path`: `/monitoramento/comparativo` (`route-manifest.md` #10).
- `screen`: P-06 ("Comparativo de unidades e circuitos" de [IU-DASH-001] §A).
- camada de produto: Vigilância.
- módulo: `comparison`.
- `slug`: `comparativo`; segmento i18n: `comparativo`.
- página: `ComparisonPage`; componente inteligente principal: `DistributionChart` (distribuição
  antes de qualquer ranking nomeado — [dashboard-frontends.md] §2 invariante 8).

## 2. Acesso

- `policy`: `dashboard:comparison:read` (contrato §4 `GET comparisons`).
- `access`: N1 — distribuição por pool/circuito/unidade/clínica é agregado por fila
  (`route-manifest.md` §C linha D-10); indicador individual nomeado só em N2 com finalidade.
- `roles` (presença): `agency-admin`, AREA-MANAGERS, `bi-analyst`, AUDITOR (8).
- passe global: `technical-admin` e GESTOR_DETRAN alcançam via §E (não estão na matriz) —
  divergência com [RN-DASH-170] verificação 3, `OD-D16-005`.
- guardas: `authGuard` → `permissionGuard('dashboard:comparison:read')` → `layerGuard('N1')`;
  `LayerGate` para indicador individual nomeado (N2, `X-Purpose`).

## 3. Entrada

- de onde se chega: menu Vigilância; deep-link de investigação a partir de uma unidade
  destacada.
- filtros de URL: `dimension: pool|circuit|unit|clinic` (contrato §4).

## 4. Dados

- lê `GET comparisons` (contrato §4): agregados com supressão de célula.
- projeções `dashboard.production`, `dashboard.prescription_risk` (contrato §6): distribuição do
  acervo por faixa de risco, % dentro da meta (IND-DASH-304/305), MTTA/MTTR ([WF-DASH-001]), %
  de deveres cumpridos ([WF-DASH-002]).
- a tela nunca abre em ranking — distribuição primeiro ([JRN-DASH-006] passo 1); detalhe por
  unidade vem com contexto (volume, rotatividade), nunca o número isolado ([JRN-DASH-006]
  passo 2); produtividade nunca aparece sozinha, sempre pareada com qualidade
  ([JRN-DASH-006] passo 3).
- meta operacional (bloco C) e teto legal (bloco A) nunca na mesma métrica, em colunas/seções
  distintas ([UC-DASH-005] fluxo alternativo; `TargetVsCeiling`).
- grupo com fonte parcialmente conectada: "comparação parcial — indicador X sem fonte
  conectada", nunca completa com zero implícito ([UC-DASH-005] fluxo alternativo).
- célula abaixo do limiar (`dashboard.cell_threshold = 10`) suprimida, com supressão secundária,
  nunca zero ([RN-DASH-161]; [AC-DASH-005-1]).
- selo de frescor + `asOf` em todo número; classificação P1/P2/P3 antes de exibir.

## 5. Estados

- **vazio**: `dashboard.screens.comparativo.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

| Rota (contrato §4) | Ação     | Papel        | Payload                                      | Efeito                            | Erro esperado                                                                                       |
| ------------------ | -------- | ------------ | -------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `POST exports`     | `create` | EXPORT-ROLES | `{ scope, filters, format, purpose?, rows }` | registro, marca d'água, supressão | `DASH.EXPORT_LAYER_EXCEEDED`, `DASH.EXPORT_VOLUME_APPROVAL_REQUIRED`, `DASH.EXPORT_FORMAT_NOT_OPEN` |

- Exportação herda a camada, nunca a expande ([RN-DASH-172] regra 1); acima de
  `dashboard.export.approval_rows` (5.000 linhas, OD-D09) fica `pending-approval`.
- `LayerGate`/`finalidade-n2` para indicador individual nomeado ([JRN-DASH-006] passo 4).

## 7. Saída

- exportar leva a D-17 (registro de exportações) após concluir; acionar o gestor de área destacado
  leva ao canal de gestão fora do sistema, nunca a um botão disciplinar automático
  ([JRN-DASH-006] passo 6).

## 8. Segurança e LGPD

- N1 no agregado; N2 sob `LayerGate` para indicador individual nomeado; N3 nunca.
- nenhum ranking individual de servidor a partir de indicador de acervo ([AC-DASH-005-4]);
  reidentificação impedida pela supressão primária e secundária ([AC-DASH-005-1]); teste de
  reversibilidade, não presença de agregação ([AC-DASH-005-2]).
- exportação herda a camada e a supressão ([RN-DASH-172]).

## 9. Acessibilidade

- meta operacional e teto legal em componentes distintos, nunca no mesmo ([WF-RAIT-002] §4.5,
  `TargetVsCeiling`); célula suprimida visível, nunca zero (marca "suprimida (limiar)" e nota de
  rodapé).
- `aria-live` na distribuição atualizada.

## 10. Testes

- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin`/
  GESTOR_DETRAN via passe global (`OD-D16-005`) como caso adicional de C-01-05.
- célula suprimida visível quando houver agregado; produtividade nunca isolada de qualidade
  ([JRN-DASH-006] métricas de sucesso).
- exportação registra filtros, linhas, formato, finalidade ([AC-DASH-005-1] a [AC-DASH-005-5]).

## Componentes compartilhados

`DistributionChart`, `SuppressedCell`, `TargetVsCeiling`, `ExportDialog`, `LayerGate`,
`ClassificationBadge`, `FreshnessSeal`.

## Chaves i18n

- `dashboard.screens.comparativo.title` — "Comparativo"
- `dashboard.screens.comparativo.intro` — "Distribuição por pool/circuito/unidade/clínica; faixa
  de risco, % na meta, MTTA/MTTR e % de deveres no prazo."
- `dashboard.screens.comparativo.empty` — "Nenhum grupo comparável no recorte atual."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.errors.*`, `dashboard.forms.finalidade_n2.*`, `dashboard.forms.exportar.*`,
`dashboard.a11y.*`.

OD tocada: `OD-D16-005` (passe global sobre conteúdo de domínio).
