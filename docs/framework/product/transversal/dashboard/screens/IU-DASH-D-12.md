---
id: IU-DASH-D-12
title: Transparência ativa — especificação de tela
status: draft
apps: [dashboard]
sources:
  [REF-LEI-12527-2011, REF-LEI-14129-2021, REF-LEI-13146-2015-acessibilidade]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/transparencia` (`dashboard-frontends.md` §4, tela D-12; painel
P-08 de [IU-DASH-001]).
Fontes: [UC-DASH-007], [RN-DASH-140], [RN-DASH-150].

## 1. Identidade

- `id`: `IU-DASH-D-12`; `path`: `/monitoramento/transparencia` (`route-manifest.md` #12).
- `screen`: P-08 ("Transparência ativa e dados abertos" de [IU-DASH-001] §A — "o módulo é, ele
  mesmo, superfície do painel").
- camada de produto: Vigilância.
- módulo: `transparency`.
- `slug`: `transparencia`; segmento i18n: `transparencia`.
- página: `TransparencyAuditPage`; componente inteligente principal: checklist do art. 8º §1º/§3º.

## 2. Acesso

- `policy`: `dashboard:transparency-audit:read` (contrato §4 `GET transparency/checklist`).
- `access`: N0 — checklist LAI, ciclo mensal, datasets abertos e indicadores de serviço art. 22
  são conteúdo público/institucional ([RN-DASH-142] P1; `route-manifest.md` §C linha D-12);
  nenhum objeto de processo.
- `roles` (presença): `technical-admin`, `agency-admin`, AUDITOR (3).
- passe global: GESTOR_DETRAN, ADMIN, SUPORTE via §E (não na matriz, todos N0) — divergência
  registrada `OD-D16-005`.
- guardas: `authGuard` → `permissionGuard('dashboard:transparency-audit:read')` →
  `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: menu Vigilância.
- filtros de URL: por bloco do checklist.

## 4. Dados

- lê `GET transparency/checklist` (contrato §4); comando `POST transparency/audits` fecha o
  ciclo mensal.
- checklist art. 8º §1º (6 blocos: estrutura/competências, repasses, despesas, licitações,
  acompanhamento de programas, perguntas frequentes) e checklist técnico do §3º (8 requisitos:
  pesquisa, exportação em formato aberto, acesso automatizado legível por máquina, formatos
  divulgados, autenticidade/integridade, atualização mantida, canal de comunicação,
  acessibilidade — [RN-DASH-140]).
- ciclo mensal de auditoria (IND-DASH-209); datasets abertos com os 7 requisitos de
  [RN-DASH-151]; indicadores de serviço do art. 22 ([REF-LEI-14129-2021], condicionado à adesão
  estadual — [RN-DASH-150]).
- itens 14.129 marcados "base estadual" (DT-066/OD-D03, `dashboard-build-pack.md`; steering
  H.54) — condiciona só esta tela, não D-13.
- selo de frescor da própria publicação (autoinstrumentação do inciso VI, [RN-DASH-140]
  verificação 3).

## 5. Estados

- **vazio**: `dashboard.screens.transparencia.empty`.
- **carregando** / **erro**: padrão M4.
- **indisponível** / **desatualizado**: publicação desatualizada é descumprimento contínuo e
  visível ([RN-DASH-140] verificação 3).
- **bloqueado por decisão**: `DASH.PANEL_BLOCKED_BY_DECISION` — só os itens do checklist 14.129
  condicionados a DT-066 (adesão estadual, `OD-D03`); placeholder com a decisão pendente e o
  link para o registro, os demais itens (LAI, art. 8º) permanecem ativos.

## 6. Comandos

| Rota (contrato §4)         | Ação    | Papel                             | Payload               | Efeito                       | Erro esperado |
| -------------------------- | ------- | --------------------------------- | --------------------- | ---------------------------- | ------------- |
| `POST transparency/audits` | `audit` | `technical-admin`, `agency-admin` | checklist, evidências | ciclo mensal do IND-DASH-209 | —             |

- Itens ausentes/quebrados viram pendências, não bloqueiam o ciclo ([UC-DASH-007] passo 3).

## 7. Saída

- correções de item ausente/quebrado acontecem fora do painel (no site público); o ciclo é
  comprovado e arquivado ([WF-DASH-002]).

## 8. Segurança e LGPD

- N0 — conteúdo público/institucional por dever (P1); estatística agregada envolvendo saúde de
  vítima exige camada de anonimização documentada antes de publicar, bloqueada sem ela
  ([UC-DASH-007] fluxo alternativo).
- classificação P1 declarada antes de exibir/publicar.

## 9. Acessibilidade

- checklist item VIII (acessibilidade) é ele mesmo requisito de aceitação da tela, não só do
  conteúdo publicado ([RN-DASH-140] verificação 4).

## 10. Testes

- roteamento: 3 papéis (presença) e demais (ausência); N3 bloqueado; GESTOR_DETRAN/ADMIN/SUPORTE
  via passe global como caso adicional de C-01-05.
- checklist do art. 8º §1º e §3º verificado item a item ([AC-DASH-007-1]); os oito requisitos do
  §3º como critérios verificáveis, não texto livre.
- estado "bloqueado por decisão" só nos itens 14.129 (DT-066); os demais nunca bloqueiam.

## Componentes compartilhados

`FreshnessSeal`, `ClassificationBadge`, `EvidenceAttach`, `DeepLinkButton`.

## Chaves i18n

- `dashboard.screens.transparencia.title` — "Transparência ativa"
- `dashboard.screens.transparencia.intro` — "Checklist art. 8º §1º/§3º, ciclo mensal de
  auditoria, datasets abertos e indicadores de serviço art. 22."
- `dashboard.screens.transparencia.empty` — "Nenhum item de checklist pendente neste ciclo."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.forms.auditoria_transparencia.*`, `dashboard.a11y.*`.

OD tocada: `OD-D16-005` (passe global); DT-066/OD-D03 transcrita (não reaberta).
