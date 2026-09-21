---
id: IU-DASH-D-07
title: Detalhe da integração — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-SENATRAN-997, REF-CONTRAN-1025-2026]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/integracoes/:system` (`dashboard-frontends.md` §4, tela D-07; tela
de apoio, drill-down de P-04).
Fontes: [JRN-DASH-004], [RN-DASH-134].

## 1. Identidade

- `id`: `IU-DASH-D-07`; `path`: `/monitoramento/integracoes/:system` (`route-manifest.md` #7).
- `screen`: tela de apoio (drill-down de P-04; sem `P-nn` próprio).
- camada de produto: Técnico.
- módulo: `integrations`.
- `slug`: `integracoes-system`; segmento i18n: `integracoes_system`.
- página: `IntegrationDetailPage`; componente inteligente principal: painel de causa provável
  (transporte × aceite × conteúdo, [JRN-DASH-004] passo 2).

## 2. Acesso

- `policy`: `dashboard:source:read`.
- `access`: N1 — detalhe da mesma fonte (contrato §4 `GET sources/{id}`); itens isolados são
  registros de integração, não objetos de processo (`route-manifest.md` §C linha D-07).
- `roles` (presença): `technical-admin`, `integration-operator`, `dash-operator`, AUDITOR (4).
- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados.
- guardas: `authGuard` → `permissionGuard('dashboard:source:read')` → `layerGuard('N1')`.

## 3. Entrada

- de onde se chega: clique numa fonte em D-06 ([JRN-DASH-004] passo 1).
- parâmetros de rota: `:system`.

## 4. Dados

- lê `GET sources/{id}` (contrato §4): triagem transporte × aceite × conteúdo, causa raiz, itens
  isolados, telas dependentes marcadas desatualizadas.
- distingue três categorias de falha ([JRN-DASH-004] passo 2): falha de transporte (canal fora
  do ar), falha de aceite no destino, falha de conteúdo (payload malformado de subconjunto).
- selo de frescor + `asOf`; enquanto a fila estava travada, qualquer tela dependente mostra
  "dado desatualizado desde `{as_of}`" ([JRN-DASH-004] passo 6).
- um item PEC isolado por payload malformado reaparece isolado mesmo com a fila zerada, sem
  fechar junto com o resto ([JRN-DASH-004] passo 5).

## 5. Estados

- **vazio**: `dashboard.screens.integracoes_system.empty`.
- **carregando** / **erro**: padrão M4.
- **indisponível** / **desatualizado**: idênticos a D-06, por fonte.
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

| Rota (contrato §2)            | Ação       | Papel                                     | Pré-estado | Payload                                                     | Pós-estado     | Erro esperado                      |
| ----------------------------- | ---------- | ----------------------------------------- | ---------- | ----------------------------------------------------------- | -------------- | ---------------------------------- |
| `POST alerts/{id}/root-cause` | `annotate` | `technical-admin`, `integration-operator` | qualquer   | `{ category: transport\|acceptance\|payload, description }` | nota na trilha | `DASH.ROOT_CAUSE_CATEGORY_INVALID` |

- Registrar causa raiz anexa nota ao alerta ([JRN-DASH-004] passo 7); não altera o app de
  origem; alimenta o indicador de saúde técnica e a trilha que o auditor pode reconstruir
  ([UC-DASH-004]).

## 7. Saída

- a correção acontece na infraestrutura real, fora do DASHBOARD ([JRN-DASH-004] passo 4); a
  fila baixa em tempo real via SSE conforme os `ERROR` reprocessam; item isolado permanece
  visível até resolução individual.

## 8. Segurança e LGPD

- N1, sem conteúdo clínico ([JRN-DASH-004] passo 1: "sem raio-x de dados clínicos que não são
  da alçada" do técnico); nenhum registro individual de caso exposto além do necessário ao
  diagnóstico técnico.

## 9. Acessibilidade

- categorias de falha distinguidas por rótulo, não só cor; `aria-live` na fila que baixa via SSE.

## 10. Testes

- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado.
- `root-cause` exige categoria válida ([DASH.ROOT_CAUSE_CATEGORY_INVALID]); item isolado nunca
  fecha silenciosamente junto com o agregado ([JRN-DASH-004] métricas de sucesso).

## Componentes compartilhados

`FreshnessSeal`, `SourceStatusTable`, `DeepLinkButton`.

## Chaves i18n

- `dashboard.screens.integracoes_system.title` — "Detalhe da integração"
- `dashboard.screens.integracoes_system.intro` — "Triagem transporte × aceite × conteúdo, causa
  raiz e itens isolados da fonte."
- `dashboard.screens.integracoes_system.empty` — "Nenhum item pendente nesta fonte."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.forms.causa_raiz.*`, `dashboard.a11y.*`.
