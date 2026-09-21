---
id: IU-DASH-D-08
title: Deveres periódicos — especificação de tela
status: draft
apps: [dashboard]
sources:
  [
    REF-CONTRAN-918,
    REF-CONTRAN-808-2020,
    REF-LEI-13460-2017,
    REF-LEI-12527-2011,
  ]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/deveres` (`dashboard-frontends.md` §4, tela D-08; painel P-05 de
[IU-DASH-001]).
Fontes: [UC-DASH-003], [UC-DASH-008], [JRN-DASH-003], [RN-DASH-113], [RN-DASH-120].

## 1. Identidade

- `id`: `IU-DASH-D-08`; `path`: `/monitoramento/deveres` (`route-manifest.md` #8).
- `screen`: P-05 ("Catálogo e calendário de deveres periódicos" de [IU-DASH-001] §A).
- camada de produto: Ação/Vigilância (valor composto da §4).
- módulo: `duties`.
- `slug`: `deveres`; segmento i18n: `deveres`.
- página: `DutyCalendarPage`; componente inteligente principal: `DutyCalendar`.

## 2. Acesso

- `policy`: `dashboard:duty:read` (contrato §3, "todos autenticados (N0)").
- `access`: N0 — 14 linhas institucionais ([RN-DASH-120]; `route-manifest.md` §C linha D-08).
- `roles` (presença): N0-ROLES (34 — DETRAN_ROLES menos CANDIDATO e CIDADAO).
- passe global: sem efeito adicional — N0-ROLES já inclui GESTOR_DETRAN, ADMIN e SUPORTE.
- guardas: `authGuard` → `permissionGuard('dashboard:duty:read')` → `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: menu Ação/Vigilância; alcançável por qualquer papel autenticado.
- filtros de URL: por dever, por estado do ciclo.

## 4. Dados

- lê `GET duties` (contrato §3): as 14 linhas de [RN-DASH-120] com ciclo corrente; distingue as
  **9 indicadores do bloco B** do catálogo ([APP-DASHBOARD] §Catálogo) das **14 linhas da
  tabela-mestra** ([RN-DASH-120] — inclui SLA e Pnatrans; `dashboard-build-pack.md` §5
  inconsistência 4) — os dois conjuntos são nomeados separadamente na tela.
- projeção `dashboard.duty_evidence` (contrato §6).
- 10 das 14 linhas têm prazo numérico explícito ([RN-DASH-120] "leitura honesta"); as demais
  aparecem em seção separada "sem prazo definido", nunca misturadas com as de data certa
  ([UC-DASH-008] fluxo alternativo).
- deveres sem relógio vigente (204, 205, 208) exibem "sem prazo definido"
  ([RN-DASH-113]; `dashboard-frontends.md` M4).
- dever com sanção automática (202) recebe destaque visual permanente, mesmo antes de
  `ATRASADO` ([UC-DASH-008] fluxo alternativo).
- estado atual de cada ciclo: `JANELA_ABERTA`, `EM_APURACAO`, `PREPARADO`,
  `SUBMETIDO_PUBLICADO`, `COMPROVADO`, `ARQUIVADO`, `ATRASADO`, `NAO_CUMPRIDO` ([WF-DASH-002]).
- dever próprio × derivado declarado como atributo ([AC-DASH-003-4]); selo de frescor em toda
  contagem.

## 5. Estados

- **vazio**: `dashboard.screens.deveres.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4 (bloco B marca em
  vez de ocultar, [WF-DASH-003] §Duas estratégias).
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando de mutação nesta tela — os comandos de avanço de ciclo vivem em D-09. Ações:
  ver calendário, filtrar, acionar o dono diretamente antecipando o alerta automático
  ([UC-DASH-008] passo 3).

## 7. Saída

- clique num dever navega a D-09 (`/monitoramento/deveres/:id/ciclos/:period`).

## 8. Segurança e LGPD

- N0 — agregado institucional, sem dado pessoal; qualquer papel autenticado acessa.
- classificação P1/P2/P3 do dever como atributo visível.

## 9. Acessibilidade

- "sem prazo definido" como valor de primeira classe, nunca ausência silenciosa
  (`dashboard-frontends.md` §9); os dois conjuntos ("9 indicadores do bloco B" e "14 linhas da
  tabela-mestra") nomeados com rótulo textual, não só numérico.
- `aria-live` no estado do ciclo corrente.

## 10. Testes

- roteamento: N0-ROLES (34, presença) e CANDIDATO/CIDADAO (ausência) → sem-permissão; N3
  bloqueado.
- as 14 linhas exibidas, distinguindo as 10 com prazo numérico ([AC-DASH-008-1]); dever sem
  relógio vigente exibido, nunca silenciado ([AC-DASH-008-2]).
- os seis estados aplicáveis como critérios.

## Componentes compartilhados

`FreshnessSeal`, `DutyCalendar`, `SeverityChip`, `ClassificationBadge`, `DeepLinkButton`.

## Chaves i18n

- `dashboard.screens.deveres.title` — "Deveres periódicos"
- `dashboard.screens.deveres.intro` — "14 linhas da tabela-mestra em calendário e lista; estado
  do ciclo corrente."
- `dashboard.screens.deveres.empty` — "Nenhum dever com ciclo aberto."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.duty_states.*`,
`dashboard.errors.*`, `dashboard.common.fixed.no_deadline_defined`, `dashboard.a11y.*`.
