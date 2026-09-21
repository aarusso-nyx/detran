---
id: IU-DASH-D-15
title: Frescor das fontes — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-LEI-13460-2017]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/frescor` (`dashboard-frontends.md` §4, tela D-15; tela de apoio,
sem `P-nn` próprio).
Fontes: [RN-DASH-130].

## 1. Identidade

- `id`: `IU-DASH-D-15`; `path`: `/monitoramento/frescor` (`route-manifest.md` #15).
- `screen`: tela de apoio ([WF-DASH-003] — página de status por painel/fonte).
- camada de produto: Técnico.
- módulo: `catalogue`.
- `slug`: `frescor`; segmento i18n: `frescor`.
- página: `FreshnessStatusPage`; componente inteligente principal: `SourceStatusTable`.

## 2. Acesso

- `policy`: `dashboard:source:read` (contrato §4 "página de status por painel/fonte" — mesma
  chave de D-06/D-07).
- `access`: N0 — última leitura, latência aceitável, estado e heartbeat por fonte/painel
  ([WF-DASH-003]) sem conteúdo de domínio; abaixo de qualquer linha N1 de [RN-DASH-170]; a
  política restringe os papéis independentemente da camada (`route-manifest.md` §C linha D-15).
- `roles` (presença): `technical-admin`, `integration-operator`, `dash-operator`, AUDITOR (4).
- passe global: ADMIN, SUPORTE via §E (N0, não na matriz); `technical-admin` já na matriz.
- guardas: `authGuard` → `permissionGuard('dashboard:source:read')` → `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: menu Técnico; referenciada como página de status a partir de qualquer tela
  que dependa de frescor (D-06, D-15 é o detalhe consolidado).
- filtros de URL: por painel/fonte.

## 4. Dados

- lê `GET sources` (contrato §4, IND-DASH-408): última leitura, latência aceitável, estado,
  heartbeat.
- os quatro estados de [WF-DASH-003]: `FRESCO`, `ATRASADO`, `INDISPONIVEL`,
  `DESATUALIZADO_MARCADO`; latência aceitável declarada por painel, não genérica (minutos a
  poucas horas para bloco A, até 1 dia para bloco B, horas para bloco C, minutos para bloco D).
- indicador em `INDISPONIVEL`/`DESATUALIZADO_MARCADO` não gera `DETECTADO`
  ([WF-DASH-003] §Efeito).
- a indisponibilidade prolongada da própria fonte é, ela mesma, indicador de saúde técnica
  (IND-DASH-408) e gera seu próprio alerta.

## 5. Estados

- **vazio**: `dashboard.screens.frescor.empty`.
- **carregando** / **erro**: padrão M4.
- **indisponível**: `INDISPONIVEL` — esta é a tela onde o próprio estado de indisponibilidade é
  o conteúdo principal, não uma degradação a esconder.
- **desatualizado**: `DESATUALIZADO_MARCADO` com "desde `{as_of}`".
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando de mutação; ações: ver, filtrar por painel/fonte, deep-link a D-06/D-07 quando
  a fonte estiver degradada.

## 7. Saída

- clique numa fonte navega a D-07 quando aplicável (mesma fonte de integração); a tabela
  reflete a normalização via SSE.

## 8. Segurança e LGPD

- N0 — nenhum conteúdo de domínio; a política de recurso (`source:read`) restringe os papéis
  independentemente da camada.

## 9. Acessibilidade

- estado de frescor sempre com rótulo textual, nunca só ícone de cor; `aria-live` no heartbeat.

## 10. Testes

- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado (não se aplica).
- os quatro estados de frescor exibidos com honestidade — nunca número velho como atual
  ([WF-DASH-003] princípio central); selo em toda fonte listada.

## Componentes compartilhados

`FreshnessSeal`, `SourceStatusTable`.

## Chaves i18n

- `dashboard.screens.frescor.title` — "Frescor das fontes"
- `dashboard.screens.frescor.intro` — "Última leitura, latência aceitável, estado e heartbeat
  por painel e fonte."
- `dashboard.screens.frescor.empty` — "Nenhuma fonte cadastrada para monitoramento."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.a11y.*`.
