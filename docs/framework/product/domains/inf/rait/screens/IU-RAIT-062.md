---
id: IU-RAIT-062
title: Parâmetros operacionais versionados — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `admin/parametros` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-043].

## 1. Identidade

- id `IU-RAIT-062`; `path`: `admin/parametros` (route-manifest.md #69); `screen`: `—`.
- módulo `admin`; página `ParametersPage`, componentes inteligentes `ParameterEditor`,
  `ImpactSimulator` (§5.3).
- nível `L0`; slug i18n `admin-parametros`.

## 2. Acesso

- papel: `agency-admin` (route-manifest.md linha 69).
- guardas: `raitAuthGuard`; `roleGuard(['agency-admin'])`.
- chave de política: `inf:rait-parameter:update` (`rait-web-frontend.md` §7).
- pré-condição: decisão do Owner ou do gestor para cada parâmetro (steering §A;
  [UC-RAIT-043] Pré-condições).

## 3. Entrada

- chega-se pelo redirect de `/admin` (route-manifest.md §B) ou pela navegação.

## 4. Dados

- resolver da rota: "timers operacionais, WIP, lotes, escada — §11 linha 7 (parâmetros
  versionados pendentes)" (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 7 — "Parâmetros versionados e calendário de
  feriados" — módulo FE `admin`/timers — situação **pendente**.
- desenho pretendido ([UC-RAIT-043] fluxo 1): pools e estratégia, limiares da escada por relógio,
  timers operacionais (`T-DIL`, `T-VOTO`, `T-CONV`, `T-CLAIM`, `T-ASS`, `T-TRI`, `T-REG`), limite
  de casos simultâneos (`WIP`), cadência e tamanho do lote, amostra de qualidade, regra de jeton,
  calendário, unidades/turmas e circunscrições. Prazos legais (`T-NA`, `T-DEF`, `T-DEC`,
  `T-NP-VENC`, `T-REM10`, `T-JUL-24M`, `T-R2`, `T-PAR-3A`) **não são editáveis**
  ([UC-RAIT-043] fluxo 3).
- enquanto a dependência não existe, valores como `WIP` (45/60, OD-004), timers propostos
  (`T-VOTO` 20d, `T-CONV` 5du, `T-ASS` 5du, `T-CLAIM` 2du — OD-005) entram como versão 1
  "proposta", vigentes por decisão do Owner (`open-decisions-rait.md` §A/§E; steering item 54/H.54).

## 5. Estados

- **indisponível nesta versão** citando §11 linha 7.
- **parâmetro legal**: tentativa de editar prazo legal → `RAIT.PARAMETER_LEGAL_READONLY` (422),
  campo somente leitura com a base legal exibida ([UC-RAIT-043] AC-RAIT-043-1).
- **parâmetro sem fonte**: cadastrado como "pendente de fonte", sinalizado em toda tela que o usa
  ([UC-RAIT-043] 1a) — marca "premissa de desenho — pendente de decisão"
  (`open-decisions-rait.md` §E).

## 6. Comandos

| Ação (`recurso:ação`)   | Papel          | Pré-estado → pós-estado                             | Comando                                            | Confirmação                                                                                      | Erros esperados                                                                                        |
| ----------------------- | -------------- | --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `rait.parameter:update` | `agency-admin` | valor vigente → nova versão com vigência programada | `PUT /v1/inf/rait/parameters/{key}` (pendente, §7) | "toda mudança tem motivo, decisão de referência, vigência e autor" ([UC-RAIT-043] AC-RAIT-043-2) | `RAIT.PARAMETER_LEGAL_READONLY`, `RAIT.PARAMETER_EFFECTIVE_DATE_PAST`, `RAIT.PARAMETER_SOURCE_PENDING` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 7; `If-Match`
  sempre; simulação de impacto (`ImpactSimulator`) antes de aplicar ([UC-RAIT-043] fluxo 4).

## 7. Saída

- versão anterior fica consultável; nenhuma edição retroage ([UC-RAIT-043] fluxo 2).

## 8. Segurança e LGPD

- nenhum dado pessoal; parâmetros operacionais e sua base legal quando aplicável.

## 9. Acessibilidade e atalhos

- `ParameterEditor` navegável por teclado; prazo legal com `LegalBasisTooltip` ao lado, nunca
  sozinho ([IU-RAIT-001] §1).

## 10. Testes

- AC-RAIT-043-1 — prazo legal não é parâmetro (somente leitura, base legal exibida).
- AC-RAIT-043-2 — toda mudança tem motivo, decisão, vigência e autor.
- AC-RAIT-043-3 — calendário combina feriado nacional + AM na prorrogação.
- roteamento: `agency-admin` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`LegalBasisTooltip` (§5.2); `ParameterEditor`, `ImpactSimulator` (§5.3, admin).

## Chaves i18n

- `rait.screens.admin-parametros.title` — "Parâmetros operacionais"
- `rait.screens.admin-parametros.cmd.update` — "Salvar nova versão"
- `rait.screens.admin-parametros.field.effective_from` — "Vigência a partir de"
