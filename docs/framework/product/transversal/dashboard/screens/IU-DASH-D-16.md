---
id: IU-DASH-D-16
title: Relatórios — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/relatorios` (`dashboard-frontends.md` §4, tela D-16; tela de
apoio, origem `generated-report`, sem `P-nn` próprio).
Fontes: [RN-DASH-172].

## 1. Identidade

- `id`: `IU-DASH-D-16`; `path`: `/monitoramento/relatorios` (`route-manifest.md` #16; rota
  filha de detalhe `/monitoramento/relatorios/:id` em `route-manifest.md` §B, mesma ficha,
  mesmas guardas).
- `screen`: tela de apoio (absorvida de `BP-BI-REPORTING-001`, decisão OD-D13 vigente).
- camada de produto: Contexto.
- módulo: `reports`.
- `slug`: `relatorios`; segmento i18n: `relatorios`.
- página: `GeneratedReportsPage`; componente inteligente principal: lista de relatórios com
  status.

## 2. Acesso

- `policy`: `dashboard:generated-report:read` (contrato §4).
- `access`: N1 — analista de BI N1 "relatórios" (`dashboard-frontends.md` §3);
  relatório gerado herda a camada do recorte que o gerou ([RN-DASH-172] regra 1), marca d'água
  com a camada (regra 3); o app não abre relatório acima da camada do usuário
  (`route-manifest.md` §C linha D-16).
- `roles` (presença): `bi-analyst`, `agency-admin`, `technical-admin`, AUDITOR (4).
- passe global: GESTOR_DETRAN via §E (não na matriz); `technical-admin` já na matriz.
- guardas: `authGuard` → `permissionGuard('dashboard:generated-report:read')` →
  `layerGuard('N1')`.

## 3. Entrada

- de onde se chega: menu Contexto.
- parâmetros de rota: `:id` na rota filha de detalhe (acompanhar, baixar por relatório,
  `route-manifest.md` §B).

## 4. Dados

- relatórios gerados: solicitar, acompanhar, baixar com marca d'água; status
  `processing → completed`/`failed` (`dashboard-frontends.md` §4).
- backend: `POST generated-reports` (contrato §4, request), `POST
generated-reports/{id}/complete|fail` (sistema). **Lacuna**: o contrato §4 não lista rota
  `GET` de lista nem de detalhe para acompanhar um relatório já solicitado — proposta
  `OD-D16-010` no relatório desta tarefa.
- selo de frescor + `asOf` no status; marca d'água e cabeçalho de classificação em todo arquivo
  gerado ([RN-DASH-172] regra 3).

## 5. Estados

- **vazio**: `dashboard.screens.relatorios.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.
- **indisponível nesta versão**: `dashboard.states.unavailable_in_version` enquanto o cliente
  gerado de R-0011 não publicar a rota de acompanhamento (`OD-D16-010`) — nunca mock silencioso
  (`contracts/CTG-0002.md` §Decisões 6).

## 6. Comandos

| Rota (contrato §4)       | Ação      | Papel                                           | Payload                                      | Efeito                 | Erro esperado                |
| ------------------------ | --------- | ----------------------------------------------- | -------------------------------------------- | ---------------------- | ---------------------------- |
| `POST generated-reports` | `request` | `bi-analyst`, `agency-admin`, `technical-admin` | `report_type`, `filters`                     | `processing`           | `DASH.REPORT_TYPE_INVALID`   |
| `POST exports`           | `create`  | EXPORT-ROLES                                    | `{ scope, filters, format, purpose?, rows }` | registro, marca d'água | `DASH.EXPORT_LAYER_EXCEEDED` |

- Solicitar relatório exige tipo do catálogo ([dashboard-frontends.md] §7); relatório não é
  editável após `completed` (`dashboard-route-contract.md` §8 divergência 2).

## 7. Saída

- relatório concluído baixa com marca d'água; exportar a partir daqui leva a D-17.

## 8. Segurança e LGPD

- N1 na leitura; herda a camada do recorte, nunca a expande; marca d'água identifica órgão,
  camada, usuário, data-hora e recorte ([RN-DASH-172] regra 3).

## 9. Acessibilidade

- status do relatório (`processing`/`completed`/`failed`) com rótulo textual, não só ícone.

## 10. Testes

- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado.
- `request` exige `report_type` do catálogo; relatório concluído não é reeditável.
- estado "indisponível nesta versão" enquanto a lacuna `OD-D16-010` não for suprida.

## Componentes compartilhados

`ExportDialog`, `ClassificationBadge`, `DeepLinkButton`, `FreshnessSeal`.

## Chaves i18n

- `dashboard.screens.relatorios.title` — "Relatórios"
- `dashboard.screens.relatorios.intro` — "Relatórios gerados: solicitar, acompanhar e baixar com
  marca d'água."
- `dashboard.screens.relatorios.empty` — "Nenhum relatório solicitado."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.forms.solicitar_relatorio.*`, `dashboard.forms.exportar.*`, `dashboard.a11y.*`.

OD proposta: `OD-D16-010` — D-16 (Relatórios) lista e acompanha `generated-reports`, mas o
contrato §4 só documenta `POST generated-reports` e `POST …/complete|fail`; falta rota `GET
generated-reports` (lista) e `GET generated-reports/{id}` (detalhe/acompanhamento) para R-0011
publicar.
