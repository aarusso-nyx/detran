---
id: IU-RAIT-006
title: Layout do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id` (`rait-web-frontend.md` §4; tela T-04 de [IU-RAIT-001], layout com
`CaseHeader` fixo + `router-outlet` filho). Fontes: [UC-RAIT-003], [JRN-RAIT-001].

## 1. Identidade

- id: `IU-RAIT-006`; `path`: `casos/:id` (`route-manifest.md` #6); `kind: layout`.
- `screen`: `T-04`; módulo: `caso` (`rait-web-frontend.md` §2).
- página: `CaseLayoutPage`; componente inteligente fixo: `CaseHeader` (`rait-web-frontend.md`
  §5.2, §5.3); as abas filhas (`resumo`, `triagem`, `dossie`, `diligencias`, `minuta`, `decisao`,
  `prazos`, `partes`, `comunicacoes`, `impedimentos`, `historico`) têm ficha própria.
- nível: `—` (layout, sem nível M13 próprio — `route-manifest.md` regra 7).
- slug i18n: `casos-id`.

## 2. Acesso

- papéis: `todos` — registrada como "todos com acesso" na §4: o `caseAccessGuard` (o caso pertence
  ao pool/unidade/circunscrição do usuário, ou o papel é transversal) fica **`todo` citando R-0007
  CTG-0004** (M4, `plan.md`; `rait-web-frontend.md` §3).
- guardas: `raitAuthGuard` + `roleGuard` (qualquer um dos 13 papéis canônicos) + `caseAccessGuard`
  (pendente).
- chave de política: nenhuma própria do layout; cada aba filha declara a chave da sua ação.
- pré-condição: nenhuma de estado — o layout é válido para qualquer estado de [WF-RAIT-001].
- aba inicial por papel (`canMatch`, sem carregar o caso — `route-manifest.md` §C): `rait-analyst`
  → `triagem`; `rait-signing-authority` → `decisao`; `rait-rapporteur` → `dossie`; demais →
  `resumo`. Aplicado só quando a URL termina em `/casos/:id`; deep-link com aba explícita não é
  reescrito.

## 3. Entrada

- de onde se chega: `/fila/*` (após "puxar próximo" ou aceitar lote), `/painel/retomar`,
  `/assinatura/:caseId`, `/gestao/radar/:caseId`, buscas por protocolo/AIT no topo do shell
  (`rait-web-frontend.md` §5.1 `RaitShellComponent`).
- parâmetros de rota: `:id` (identificador do caso).
- sem `?q=&ordem=&filtro=` no próprio layout (aplica-se dentro de abas de lista, como histórico).
- deep-link canônico: `/casos/:id` (redireciona à aba inicial do papel) ou `/casos/:id/<aba>`
  (formato canônico de compartilhamento interno, `rait-web-frontend.md` §4).

## 4. Dados

- resolver: "layout do caso com abas (resolver: caso, partes, prazos, bandeiras)"
  (`route-manifest.md` #6).
- clientes: `data/api/case.client.ts` (`RaitCase`, `RaitDeadline`) via `CaseFacade`
  (`rait-web-frontend.md` §8).
- calculado do backend: bandeiras de risco, prazos e ordem de exibição de próximas ações — o
  frontend não recalcula prazo legal ([RN-RAIT-005]).

## 5. Estados

- **carregando**: skeleton do `CaseHeader`.
- **vazio**: não se aplica — a rota sempre resolve um caso existente ou falha.
- **erro recuperável**: falha transitória ao carregar o cabeçalho; retry.
- **sem permissão**: `RAIT.FORBIDDEN_CASE_SCOPE` (403, catálogo §3.1) quando o
  `caseAccessGuard` (pendente R-0007 CTG-0004) rejeita — banner "sem permissão para esta ação".
- **não encontrado**: `RAIT.TENANT_MISMATCH` (404, catálogo §3.1) — caso inexistente ou de outro
  tenant.
- **conflito**: `RAIT.CASE_STATE_INVALID` (409, catálogo §3.5) — ação tentada fora do estado
  admitido; recarrega e reabre a aba com os dados atuais.

## 6. Comandos

Nenhum comando de mutação no próprio layout — cada aba filha declara as suas ações e chaves
`inf:rait-<recurso>:<ação>` (§7). `If-Match` sempre exigido nos comandos das abas filhas
(`rait-web-frontend.md` §7).

## 7. Saída

- `title` da rota gera o título da janela e o breadcrumb (`DetranBreadcrumbsComponent`,
  `rait-web-frontend.md` §4).
- SSE (`case.changed`) atualiza o `CaseHeader` (estado, bandeiras, próximas ações) sem reload
  (`rait-web-frontend.md` §8).

## 8. Segurança e LGPD

- `CaseHeader` não exibe texto livre da exposição de fatos ([RN-RAIT-134]); dados de terceiros
  citados na narrativa ficam suprimidos ([RN-RAIT-137]).
- token interno de estado só em `title`/`data-token` de `CaseStateBadge`, nunca no texto visível
  (`rait-web-frontend.md` §5.2).

## 9. Acessibilidade e atalhos

- `t` abre a aba de triagem, `d` a de diligência, quando aplicáveis ao papel
  (`rait-web-frontend.md` §10).
- risco nunca só por cor no `CaseHeader` ([IU-RAIT-001] §4); foco visível ao trocar de aba.

## 10. Testes

- roteamento: os 13 papéis ativam o layout ("todos com acesso"); sessão sem papel → `/sem-permissao`
  (M14); aba inicial por papel conforme `route-manifest.md` §C.
- critérios ligados a [UC-RAIT-003] (instrução) e ao requisito de "quem instrui não é quem assina"
  ([IU-RAIT-001] §3, materializado por `CaseHeader`/`MinutaEditor`/`DecisionPanel` distintos).
- conflito de versão (`If-Match`) recarrega o layout com os dados atuais.

## Componentes compartilhados

`CaseHeader`, `CaseStateBadge`, `DeadlineChip`, `RiskFlag` (`rait-web-frontend.md` §5.1, §5.2).

## Chaves i18n

- `rait.screens.casos-id.title` — "Caso {aitNumber}"
- `rait.screens.casos-id.tab.resumo` — "Resumo"
- `rait.screens.casos-id.tab.triagem` — "Triagem"
- `rait.screens.casos-id.tab.dossie` — "Dossiê"
- `rait.screens.casos-id.tab.diligencias` — "Diligências"
- `rait.screens.casos-id.tab.minuta` — "Minuta"
- `rait.screens.casos-id.tab.decisao` — "Decisão"
- `rait.screens.casos-id.tab.prazos` — "Prazos"
- `rait.screens.casos-id.tab.partes` — "Partes"
- `rait.screens.casos-id.tab.comunicacoes` — "Comunicações"
- `rait.screens.casos-id.tab.impedimentos` — "Impedimentos"
- `rait.screens.casos-id.tab.historico` — "Histórico"
