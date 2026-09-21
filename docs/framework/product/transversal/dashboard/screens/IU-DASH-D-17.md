---
id: IU-DASH-D-17
title: Exportações — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/exportacoes` (`dashboard-frontends.md` §4, tela D-17; tela de
apoio, sem `P-nn` próprio).
Fontes: [RN-DASH-172].

## 1. Identidade

- `id`: `IU-DASH-D-17`; `path`: `/monitoramento/exportacoes` (`route-manifest.md` #17).
- `screen`: tela de apoio (registro de exportações — [RN-DASH-172]).
- camada de produto: Contexto.
- módulo: `reports`.
- `slug`: `exportacoes`; segmento i18n: `exportacoes`.
- página: `ExportRegistryPage`; componente inteligente principal: painel de exportações (quem
  mais exportou, maiores volumes, exportações fora de horário — [RN-DASH-172] verificação 2).

## 2. Acesso

- `policy`: `dashboard:audit-trail:read` (prov., `OD-D16-001` — D-17 não tem rota de leitura
  própria no contrato §4 nem chave `dashboard:export:read` em DASHBOARD_RULES; a exportação é
  evento de trilha, [RN-DASH-171]/[RN-DASH-172] regra 2).
- `access`: N1 (`route-manifest.md` §C linha D-17, `OD-D16-001`).
- `roles` (presença): AUDITOR, DPO, `agency-admin`, AREA-MANAGERS (8).
- passe global: GESTOR_DETRAN, `technical-admin` via §E (não na matriz) — divergência
  `OD-D16-005`.
- guardas: `authGuard` → `permissionGuard('dashboard:audit-trail:read')` →
  `layerGuard('N1')`.

## 3. Entrada

- de onde se chega: menu Contexto; destino após exportar em D-10/D-11/D-16.

## 4. Dados

- registro de exportações: quem, quando, filtros, linhas, formato, finalidade
  ([RN-DASH-172] regra 2) — nenhum desses campos é objeto de processo; aprovações nominais
  pendentes ("aguardando aprovação nominal" quando volume excede `dashboard.export.approval_rows`
  = 5.000 linhas, OD-D09).
- **lacuna já registrada** (`OD-D16-001`): sem `GET exports` no contrato nem chave de leitura
  própria; a leitura hoje é modelada sobre `dashboard:audit-trail:read` como evento de trilha.
- selo de frescor + `asOf` em todo registro.

## 5. Estados

- **vazio**: `dashboard.screens.exportacoes.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.
- **conflito**: não se aplica (leitura pura).

## 6. Comandos

| Rota (contrato §4)          | Ação      | Papel          | Payload | Pós-estado                 | Erro esperado                          |
| --------------------------- | --------- | -------------- | ------- | -------------------------- | -------------------------------------- |
| `POST exports/{id}/approve` | `approve` | `agency-admin` | —       | libera exportação volumosa | `DASH.EXPORT_VOLUME_APPROVAL_REQUIRED` |

- Aprovação nominal é ação de mérito sobre a própria exportação (não sobre objeto de domínio),
  permitida no painel por ser tratamento próprio do DASHBOARD ([RN-DASH-101] verificação 3: "a
  única escrita legítima é em seu próprio acervo").

## 7. Saída

- exportação aprovada libera o download registrado em D-10/D-11/D-16, sem sair desta tela de
  revisão.

## 8. Segurança e LGPD

- N1 no registro; exportação volumosa é revisão periódica do Encarregado, não relatório sob
  demanda ([RN-DASH-172] verificação 2); N3 nunca é exportável, em nenhum formato, para nenhum
  papel ([RN-DASH-172] regra 4).

## 9. Acessibilidade

- estado "aguardando aprovação nominal" com rótulo textual explícito, não só cor.

## 10. Testes

- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin`/
  GESTOR_DETRAN via passe global como caso adicional de C-01-05.
- exportação acima do limite fica `pending-approval`; aprovação só por `agency-admin`.

## Componentes compartilhados

`ExportDialog`, `ClassificationBadge`, `FreshnessSeal`.

## Chaves i18n

- `dashboard.screens.exportacoes.title` — "Exportações"
- `dashboard.screens.exportacoes.intro` — "Registro de exportações: quem, quando, filtros,
  linhas, formato e finalidade."
- `dashboard.screens.exportacoes.empty` — "Nenhuma exportação registrada."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
`dashboard.a11y.*`.

OD tocada: `OD-D16-001` (rota de leitura provisória), `OD-D16-005` (passe global).
