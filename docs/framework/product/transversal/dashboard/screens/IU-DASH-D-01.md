---
id: IU-DASH-D-01
title: Triagem do turno — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/monitoramento` (`dashboard-frontends.md` §4, tela D-01; painel P-01 de [IU-DASH-001]).
Fontes: [UC-DASH-002], [JRN-DASH-001], [RN-DASH-101], [RN-DASH-135], [RN-DASH-142].

## 1. Identidade

- `id`: `IU-DASH-D-01`; `path`: `/monitoramento` (`route-manifest.md` #1).
- `screen`: P-01 ("Triagem do turno — fila de alertas cross-app" de [IU-DASH-001] §A).
- camada de produto: Ação (primeira do menu, `route-manifest.md` §I; ordem fixa [IU-DASH-001] §B).
- módulo: `triage` (`dashboard-frontends.md` §9).
- `slug`: `triagem`; segmento i18n: `triagem`.
- página: `ShiftTriagePage`; componente inteligente principal: `AlertQueue` (lista ordenada por
  severidade combinada — legal × operacional × técnica, `dashboard-frontends.md` §4).

## 2. Acesso

- `policy`: `dashboard:alert:read` (`policy.ts`, `route-manifest.md` §D/§G nota 1).
- `access`: N1 — a fila cruza "alertas por família" e "contagens por pool", conteúdo N1 de
  [RN-DASH-170]; derivação em `route-manifest.md` §C linha D-01.
- `roles` (presença): `dash-operator`, `rait-manager`, `rait-coordinator`, `rait-chair`,
  `traffic-authority`, GESTOR, `agency-admin`, `technical-admin`, AUDITOR (9,
  `route-manifest.md` §D). Todos os demais códigos de DETRAN_ROLES (36 - 9 = 27) →
  `/monitoramento/sem-permissao?de=/monitoramento`.
- passe global (`route-manifest.md` §E): GESTOR_DETRAN alcança esta rota só pelo passe global
  (não está na matriz de `dashboard:alert:read`), porque sua camada (N2) ≥ N1; ADMIN e SUPORTE
  ficam bloqueados pela camada (N0 < N1). Divergência com [RN-DASH-170] verificação 3 registrada
  como `OD-D16-005` — não decidida aqui.
- guardas na ordem: `authGuard` → `permissionGuard('dashboard:alert:read')` →
  `layerGuard('N1')`. N3 nunca é servido (`dashboardLayerAllows(_, 'N3') === false`).
- não há conteúdo N2 nesta tela (a fila mostra apenas dono, severidade e tempo restante; o
  objeto do alerta só se identifica em D-02).

## 3. Entrada

- de onde se chega: primeira rota do menu Ação (`route-manifest.md` §I); é a rota raiz de
  `/monitoramento` e o destino do login para os papéis com acesso.
- parâmetros de rota: nenhum.
- filtros de URL: `state`, `severity`, `block`, `indicator`, `app`, `owner`, `unit`, `pool`
  (contrato §2, rota `GET alerts`).
- sem rota filha de detalhe nesta linha (o detalhe é a rota irmã D-02).

## 4. Dados

- lê `GET alerts` (contrato §2) com os filtros acima; lista ordenada por severidade combinada
  (legal × operacional × técnica), camada servida por papel.
- projeções de origem por bloco: `dashboard.prescription_risk` (RAIT, bloco A),
  `dashboard.pec_deadlines` (PEC, bloco A/C), `dashboard.integration_health` (bloco D) —
  `dashboard-route-contract.md` §6; `dashboard-frontends.md` §8.
- cada item carrega dono, severidade (N1/N2/N3/CRÍTICO), selo de frescor + `asOf`
  (`meta.freshness { state, asOf, acceptableLatency, source }`, contrato §1 regra 3); nenhum
  cálculo de prazo, severidade ou ordem de fila no cliente — tudo vem calculado do backend.
- indicador em `INDISPONIVEL` ou `DESATUALIZADO_MARCADO` não gera `DETECTADO`
  (`dashboard-route-contract.md` §2, nota).
- classificação P1/P2/P3 é atributo visível de cada indicador antes de exibição
  ([RN-DASH-142]).
- SSE `GET /v1/dashboard/stream` eventos `alert.changed`, `alert.escalated` atualizam a fila sem
  reload; fallback de polling 30 s (contrato §5).
- blocos exibidos: A, B, C, D — [IU-DASH-001] §A P-01 "agregado de todas as escadas"
  (`route-manifest.md` §G nota 2).

## 5. Estados

- **vazio**: `dashboard.screens.triagem.empty` — nenhum alerta pendente no turno.
- **carregando**: `dashboard.states.loading`, skeleton do kit sobre a lista.
- **erro**: `dashboard.states.error` + `dashboard.errors.<code>` (`DASH.INTERNAL` ou rede);
  botão de repetir.
- **indisponível**: selo `INDISPONIVEL` oculta o valor do item afetado (bloco A);
  `dashboard.states.unavailable`.
- **desatualizado**: `DESATUALIZADO_MARCADO`, `dashboard.states.stale` com "dado desatualizado
  desde `{as_of}`".
- **bloqueado por decisão**: não se aplica a esta tela (nenhum indicador de P-01 depende de
  decisão pendente).
- sem permissão (403, guarda de rota) e conflito (409/412) não se aplicam — a tela não tem
  comando de mutação própria; os comandos de item (ACK, encerrar) vivem em D-02.

## 6. Comandos

- Nenhum comando de mutação nesta tela — é lista de leitura agregada. As ações disponíveis
  navegam para D-02 (`/monitoramento/alertas/:id`), para D-06 quando o item é de integração, ou
  fazem `DeepLinkButton` direto ao objeto na origem quando a camada permite ([RN-DASH-101]:
  nenhum botão pratica ato de negócio).
- "Fechar turno" ([JRN-DASH-001] passo 7) é critério de completude do próprio agregado que a
  tela já lê (todo item com dono ou confirmação registrada) — não é um comando com rota própria
  no contrato; nenhum prazo é recalculado para produzi-lo.

## 7. Saída

- clique num item navega a D-02 (`/monitoramento/alertas/:id`); item de integração navega a D-06
  (`/monitoramento/integracoes`); `DeepLinkButton` leva ao app de origem preservando ali
  autenticação e trilha próprias ([RN-DASH-101]).
- a fila reflete o efeito das ações tomadas em D-02/app de origem via SSE, sem exigir reload
  ([JRN-DASH-002] passo 6).

## 8. Segurança e LGPD

- camada N1: fila por família e pool, sem identificação de objeto de processo (N2, só em D-02
  sob `LayerGate`); N3 nunca ([RN-DASH-170]).
- segregação horizontal por domínio: gestor de área só vê a fatia do seu domínio
  ([RN-DASH-170] verificação 2).
- classificação P1/P2/P3 antes de exibir ([RN-DASH-142] verificação 1: "todo indicador nasce
  P3").
- nada sensível em URL/log; filtros da query não carregam identificador de pessoa.

## 9. Acessibilidade

- severidade por forma + rótulo (`SeverityChip`, `dashboard.a11y.severity.*`), nunca só cor
  ([IU-DASH-001] §C.4); CRITICO_EXTINCAO/INCIDENTE_REGISTRADO com cor e ícone próprios
  ([WF-DASH-001] §Distinção).
- `aria-live` na contagem da fila, que muda via SSE/polling.
- selo de frescor legível por leitor de tela em cada item.

## 10. Testes

- roteamento: os 9 papéis ativos (presença, `route-manifest.md` §D) e todos os demais 27 códigos
  de DETRAN_ROLES (ausência) → `/monitoramento/sem-permissao`; `N3` sempre bloqueado.
- os seis estados de M4 como critérios (vazio, carregando, erro, indisponível, desatualizado —
  bloqueado por decisão não se aplica aqui e não deve aparecer).
- selo de frescor em todo item da fila; severidade nunca só por cor.
- ligados a [AC-DASH-002-2] (anatomia mínima do item) e [AC-DASH-001-6] (selo de frescor).

## Componentes compartilhados

`FreshnessSeal`, `SeverityChip`, `AlertCard`, `DeepLinkButton`, `ClassificationBadge`.

## Chaves i18n

- `dashboard.screens.triagem.title` — "Triagem do turno"
- `dashboard.screens.triagem.intro` — "Fila de alertas cross-app ordenada por severidade
  combinada; cada item com dono."
- `dashboard.screens.triagem.empty` — "Nenhum alerta pendente no turno."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.alert_states.*`, `dashboard.blocks.*`, `dashboard.errors.*`, `dashboard.common.*`,
`dashboard.a11y.*`.
