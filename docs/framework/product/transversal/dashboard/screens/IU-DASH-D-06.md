---
id: IU-DASH-D-06
title: Saúde técnica — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-CONTRAN-808-2020, REF-CTB-sinistro-cena-renaest]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/integracoes` (`dashboard-frontends.md` §4, tela D-06; painel P-04
de [IU-DASH-001]).
Fontes: [UC-DASH-006], [JRN-DASH-001], [JRN-DASH-004], [RN-DASH-130], [RN-DASH-133].

## 1. Identidade

- `id`: `IU-DASH-D-06`; `path`: `/monitoramento/integracoes` (`route-manifest.md` #6).
- `screen`: P-04 ("Saúde técnica de integrações" de [IU-DASH-001] §A).
- camada de produto: Ação/Técnico (valor composto da §4).
- módulo: `integrations`.
- `slug`: `integracoes`; segmento i18n: `integracoes`.
- página: `IntegrationHealthPage`; componente inteligente principal: `SourceStatusTable`.

## 2. Acesso

- `policy`: `dashboard:source:read` (`policy.ts`, contrato §4 `GET sources`).
- `access`: N1 — "idade do lote mais antigo", filas e lag são "idade de fila, backlog"
  ([RN-DASH-170] linha N1; `route-manifest.md` §C linha D-06); sem conteúdo de domínio.
- `roles` (presença): `technical-admin`, `integration-operator`, `dash-operator`, AUDITOR (4).
  Todos os demais → sem-permissão.
- passe global: nenhuma mudança — `technical-admin` já está na matriz; GESTOR_DETRAN via §E
  (não na matriz, `route-manifest.md` §E); ADMIN/SUPORTE bloqueados pela camada.
- guardas: `authGuard` → `permissionGuard('dashboard:source:read')` → `layerGuard('N1')`.

## 3. Entrada

- de onde se chega: menu Ação/Técnico; deep-link de D-01 quando o item de triagem é técnico
  ([JRN-DASH-001] passo 5); [JRN-DASH-004] passo 1.
- filtros de URL: por sistema/painel.

## 4. Dados

- lê `GET sources` (contrato §4): frescor por fonte/painel, heartbeat, latência aceitável.
- projeção `dashboard.integration_health` (contrato §6, IND-DASH-401…403, 408): outbox lag,
  fila offline (idade do lote mais antigo), adapter por sistema nacional (latência p95, erro),
  custódia, pacotes normativos, faixas, homologação de dispositivo, disponibilidade por painel.
- selo de frescor + `asOf` em cada fonte; nenhum cálculo de latência no cliente.
- SSE `source.freshness`, `integration.health` atualizam a tabela; fallback de polling 30 s.

## 5. Estados

- **vazio**: `dashboard.screens.integracoes.empty`.
- **carregando** / **erro**: padrão M4.
- **indisponível**: `INDISPONIVEL` marca a fonte (bloco D marca, nunca oculta —
  [WF-DASH-003] §Duas estratégias, "marcar" para saúde técnica).
- **desatualizado**: `DESATUALIZADO_MARCADO`, "desde `{as_of}`".
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando de mutação nesta tela (registrar causa raiz vive em D-07). Ações: ver, filtrar,
  deep-link a D-07 para detalhe da fonte, encaminhar à administração técnica
  ([JRN-DASH-004] passo 1).

## 7. Saída

- clique numa fonte navega a D-07 (`/monitoramento/integracoes/:system`); a saúde reflete a
  normalização via SSE após a correção na infraestrutura real ([JRN-DASH-004] passo 4).

## 8. Segurança e LGPD

- N1, sem conteúdo de domínio ([RN-DASH-170] linha N1 — administração técnica "sem conteúdo de
  domínio"); nenhum registro individual de caso exibido.
- nada sensível em URL/log.

## 9. Acessibilidade

- severidade por forma + rótulo; `aria-live` na fila/lag, que muda via SSE.

## 10. Testes

- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado (não se aplica dado de
  domínio).
- os seis estados aplicáveis (bloqueado por decisão não se aplica) como critérios; ligados a
  [AC-DASH-006-1] (frescor antes de agir).

## Componentes compartilhados

`FreshnessSeal`, `SourceStatusTable`, `SeverityChip`, `DeepLinkButton`.

## Chaves i18n

- `dashboard.screens.integracoes.title` — "Saúde técnica"
- `dashboard.screens.integracoes.intro` — "Outbox lag, fila offline, adapter por sistema
  nacional, custódia e disponibilidade por painel."
- `dashboard.screens.integracoes.empty` — "Nenhuma fonte em alerta técnico."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.errors.*`, `dashboard.a11y.*`.
