---
id: IU-DASH-D-11
title: Trilha de auditoria — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-997, REF-TCEAM-MANUAL-AUDITORIA-TI]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/auditoria` (`dashboard-frontends.md` §4, tela D-11; painel P-07 de
[IU-DASH-001]).
Fontes: [UC-DASH-004], [JRN-DASH-005], [RN-DASH-171], [RN-DASH-172].

## 1. Identidade

- `id`: `IU-DASH-D-11`; `path`: `/monitoramento/auditoria` (`route-manifest.md` #11).
- `screen`: P-07 ("Trilha de auditoria consolidada" de [IU-DASH-001] §A).
- camada de produto: Contexto.
- módulo: `audit`.
- `slug`: `auditoria`; segmento i18n: `auditoria`.
- página: `AuditTrailPage`; componente inteligente principal: linha do tempo consolidada.

## 2. Acesso

- `policy`: `dashboard:audit-trail:read` (contrato §4 `GET audit-trail`).
- `access`: N2 — partir de um caso identificado é N2 ([RN-DASH-170] linha N2;
  `route-manifest.md` §C linha D-11); auditor/DPO N2 transversal, sempre logado
  ([RN-DASH-170] verificação 1).
- `roles` (presença): AUDITOR, DPO, `agency-admin`, AREA-MANAGERS (8).
- passe global: GESTOR_DETRAN via §E (não na matriz); `technical-admin` bloqueado pela camada
  (N1 < N2).
- guardas: `authGuard` → `permissionGuard('dashboard:audit-trail:read')` →
  `layerGuard('N2')`; `LayerGate` na entrada (finalidade, `X-Purpose`).

## 3. Entrada

- de onde se chega: menu Contexto; investigação a partir de um desfecho (ex. caso
  `PRESCRITO_OPERACIONAL`, [JRN-DASH-005] passo 1).
- filtros de URL: por caso, indicador, período, app de origem.

## 4. Dados

- lê `GET audit-trail` (contrato §4): linha do tempo por caso/indicador/período/app; fato do
  acesso sem conteúdo sensível; lacuna exibida como lacuna.
- transições registradas com timestamp e destinatário, para alertas ([WF-DASH-001]) e ciclos de
  dever ([WF-DASH-002]); histórico de janelas `FRESCO`/`ATRASADO`/`INDISPONIVEL` por fonte
  ([WF-DASH-003]) — para avaliar se um número era confiável naquele momento
  ([AC-DASH-004-4]).
- falha de alerta (o sistema não avisou) é distinta de falha de ação (avisou e ninguém agiu) —
  duas perguntas separadas, nunca confundidas ([JRN-DASH-005] passo 4).
- acesso a dado sensível (ex. saúde de vítima) mostra o fato do acesso e a finalidade declarada,
  nunca o conteúdo clínico ([JRN-DASH-005] passo 3).
- evento sem registro (ex. notificação por telefone) aparece como lacuna, nunca preenchido por
  suposição ([JRN-DASH-005] passo 5).
- indicador nunca conectado aparece "catalogado, sem histórico — fonte não conectada no período"
  ([UC-DASH-004] fluxo alternativo).
- consultar esta tela é, ela mesma, tratamento e é registrado ([AC-DASH-004-1]; [RN-DASH-171]).

## 5. Estados

- **vazio**: `dashboard.screens.auditoria.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.
- **sem permissão** (N2 sem finalidade): `DASH.PURPOSE_REQUIRED`, diálogo `LayerGate`.

## 6. Comandos

| Rota (contrato §4) | Ação     | Papel        | Payload                                      | Efeito                            | Erro esperado                                                                            |
| ------------------ | -------- | ------------ | -------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `POST exports`     | `create` | EXPORT-ROLES | `{ scope, filters, format, purpose?, rows }` | registro, marca d'água, supressão | `DASH.EXPORT_LAYER_EXCEEDED`, `DASH.EXPORT_PURPOSE_REQUIRED`, `DASH.EXPORT_N3_FORBIDDEN` |

- Exportação de recorte da trilha sujeita às mesmas regras de supressão de célula da publicação
  ([AC-DASH-004-2]; [RN-DASH-172], [RN-DASH-161]).

## 7. Saída

- exportar leva a D-17 (registro de exportações); drill-down pontual a RAIT/BOAT/PEC para
  confirmar um evento na origem ([JRN-DASH-005] pontos de contato).

## 8. Segurança e LGPD

- N2 transversal, com finalidade registrada ([RN-DASH-171]); N3 nunca — acesso a dado sensível
  mostra o fato, não o conteúdo ([JRN-DASH-005] passo 3; [RN-DASH-170]).
- classificação P1/P2/P3 antes de exibir; cada papel vê apenas sua fatia
  ([AC-DASH-004-5]).

## 9. Acessibilidade

- distinção visual entre falha de alerta e falha de ação; lacuna de registro exibida como texto,
  não como espaço vazio ambíguo; `aria-live` na linha do tempo.

## 10. Testes

- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin` bloqueado
  pela camada mesmo com passe global parcial (só GESTOR_DETRAN entra via §E).
- N2 sem finalidade nunca revela conteúdo ([C-01-09]); consulta à trilha é registrada
  ([AC-DASH-004-1]).
- exportação classificada e sujeita à supressão ([AC-DASH-004-2]).

## Componentes compartilhados

`FreshnessSeal`, `LayerGate`, `ExportDialog`, `ClassificationBadge`, `DeepLinkButton`.

## Chaves i18n

- `dashboard.screens.auditoria.title` — "Trilha de auditoria"
- `dashboard.screens.auditoria.intro` — "Linha do tempo por caso, indicador, período e app, com
  fato do acesso sem conteúdo sensível."
- `dashboard.screens.auditoria.empty` — "Nenhum evento no recorte consultado."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.forms.finalidade_n2.*`, `dashboard.forms.exportar.*`, `dashboard.a11y.*`.
