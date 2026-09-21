---
id: IU-RAIT-063
title: Calendário de feriados — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `admin/calendario` (`rait-web-frontend.md` §4).
Fontes: [RN-RAIT-005]. Sem `[UC-RAIT-nnn]` — o manifesto não cita UC para esta linha
(`route-manifest.md`, regra da coluna `uc`); o conteúdo de calendário nacional + AM aparece dentro
do fluxo de [UC-RAIT-043] (passo 1), citado aqui só em prosa, não como fonte desta ficha, porque a
linha específica de `admin/calendario` no manifesto não o traz.

## 1. Identidade

- id `IU-RAIT-063`; `path`: `admin/calendario` (route-manifest.md #70); `screen`: `—`.
- módulo `admin`; página `HolidayCalendarPage` (§5.3).
- nível `L0`; slug i18n `admin-calendario`.

## 2. Acesso

- papel: `agency-admin` (route-manifest.md linha 70).
- guardas: `raitAuthGuard`; `roleGuard(['agency-admin'])`.

## 3. Entrada

- chega-se pelo redirect de `/admin` ou pela navegação.

## 4. Dados

- resolver da rota: "feriados nacional + AM — §11 linha 7 (calendário de feriados pendente)"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 7 — mesma do [IU-RAIT-062] — pendente.
- desenho pretendido (`JW-12-auditor-admin.md` #5): cadastro de feriados nacional e do AM; o
  motor recalcula vencimentos a partir do calendário; contagem em dias consecutivos com
  prorrogação ao 1º dia útil ([RN-RAIT-005]) — mencionado também em [UC-RAIT-043]
  AC-RAIT-043-3, embora essa linha do manifesto não cite o UC diretamente.

## 5. Estados

- **indisponível nesta versão** citando §11 linha 7.
- **feriado duplicado**: `RAIT.CALENDAR_OVERLAP` (409) na mesma data.

## 6. Comandos

| Ação                 | Papel          | Pré-estado → pós-estado                                              | Comando                                          | Confirmação                                                                   | Erros esperados         |
| -------------------- | -------------- | -------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------- |
| atualizar calendário | `agency-admin` | calendário vigente → calendário atualizado, vencimentos recalculados | `PUT calendar` (não sourceado em §7; `JW-12` #5) | "vencimentos afetados são recalculados pelo motor" (`JW-12-auditor-admin.md`) | `RAIT.CALENDAR_OVERLAP` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 7; `If-Match`
  sempre.

## 7. Saída

- vencimentos afetados são recalculados automaticamente pelo motor de prazos, sem intervenção
  manual caso a caso.

## 8. Segurança e LGPD

- nenhum dado pessoal; calendário é parâmetro institucional.

## 9. Acessibilidade e atalhos

- calendário navegável por teclado; contraste AA.

## 10. Testes

- critério do catálogo de erros: `RAIT.CALENDAR_OVERLAP` para feriado duplicado na mesma data.
- roteamento: `agency-admin` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente; `HolidayCalendarPage` (§5.3, admin) é a única página.

## Chaves i18n

- `rait.screens.admin-calendario.title` — "Calendário de feriados"
- `rait.screens.admin-calendario.cmd.update` — "Salvar calendário"
