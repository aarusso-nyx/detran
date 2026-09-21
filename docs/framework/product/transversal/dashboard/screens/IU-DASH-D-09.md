---
id: IU-DASH-D-09
title: Ciclo do dever — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-CONTRAN-918, REF-LEI-13709-2018]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/deveres/:id/ciclos/:period` (`dashboard-frontends.md` §4, tela
D-09; tela de apoio, drill-down de P-05).
Fontes: [UC-DASH-003], [JRN-DASH-003], [RN-DASH-113], [RN-DASH-120], [RN-DASH-135].

## 1. Identidade

- `id`: `IU-DASH-D-09`; `path`: `/monitoramento/deveres/:id/ciclos/:period`
  (`route-manifest.md` #9).
- `screen`: tela de apoio (drill-down de P-05; sem `P-nn` próprio).
- camada de produto: Ação.
- módulo: `duties`.
- `slug`: `deveres-id-ciclos-period`; segmento i18n: `deveres_id_ciclos_period`.
- página: `DutyCyclePage`; componente inteligente principal: `DutyCycleStepper`.

## 2. Acesso

- `policy`: `dashboard:duty-cycle:read` (contrato §3, N0).
- `access`: N0 — avançar o ciclo é permissão de comando (`duty-cycle:start…archive`), não
  camada (`route-manifest.md` §C linha D-09).
- `roles` (presença): N0-ROLES (34).
- passe global: sem efeito adicional.
- guardas: `authGuard` → `permissionGuard('dashboard:duty-cycle:read')` → `layerGuard('N0')`.

## 3. Entrada

- de onde se chega: clique num dever em D-08.
- parâmetros de rota: `:id` (dever), `:period` (competência).

## 4. Dados

- lê `GET duties/{id}/cycles/{period}` (contrato §3): histórico do ciclo.
- estado do ciclo: `JANELA_ABERTA → EM_APURACAO → PREPARADO → SUBMETIDO_PUBLICADO → COMPROVADO →
ARQUIVADO`, com desvios `ATRASADO`/`NAO_CUMPRIDO` ([WF-DASH-002]).
- evidência anexada (protocolo, captura, hash) exibida por transição ([AC-DASH-003-1]:
  "cumprido é comprovado, nunca marcado" — `SUBMETIDO_PUBLICADO` não é `COMPROVADO` sem
  evidência).
- deveres 204/205/208 exibem "sem prazo definido" ([RN-DASH-113]); dever com sanção automática
  (202) mantém rótulo de risco de suspensão mesmo antes de `ATRASADO`.
- histórico de atrasos por ciclo anterior, sem herdar o histórico como desculpa
  ([JRN-DASH-003] passo 6).

## 5. Estados

- **vazio**: `dashboard.screens.deveres_id_ciclos_period.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.
- **conflito** (409/412): `DASH.DUTY_STATE_INVALID`, `DASH.DUTY_ALREADY_ARCHIVED`.

## 6. Comandos

| Rota (contrato §3)                       | Ação      | Papel                             | Pré-estado              | Payload                                          | Pós-estado            | Erro esperado                                                    |
| ---------------------------------------- | --------- | --------------------------------- | ----------------------- | ------------------------------------------------ | --------------------- | ---------------------------------------------------------------- |
| `POST duties/{id}/cycles/{period}/start` | `start`   | `dash-duty-owner`, `agency-admin` | `JANELA_ABERTA`         | —                                                | `EM_APURACAO`         | `DASH.DUTY_STATE_INVALID`                                        |
| `POST …/prepare`                         | `prepare` | idem                              | `EM_APURACAO`           | `{ draftRef? }`                                  | `PREPARADO`           | idem                                                             |
| `POST …/submit`                          | `submit`  | idem                              | `PREPARADO`, `ATRASADO` | `{ submittedAt, protocol? }`                     | `SUBMETIDO_PUBLICADO` | idem                                                             |
| `POST …/prove`                           | `prove`   | idem                              | `SUBMETIDO_PUBLICADO`   | `{ evidence: { protocol?, captureUri?, hash } }` | `COMPROVADO`          | `DASH.DUTY_EVIDENCE_REQUIRED`, `DASH.DUTY_EVIDENCE_HASH_INVALID` |
| `POST …/archive`                         | `archive` | `dash-operator`, `agency-admin`   | `COMPROVADO`            | —                                                | `ARQUIVADO`           | `DASH.DUTY_ALREADY_ARCHIVED`                                     |

- `If-Match` em todas as transições. Nenhum comando altera dado fora do próprio acervo de
  deveres do DASHBOARD ([RN-DASH-101]). `prove` exige **ao menos uma** evidência — protocolo,
  captura **ou** hash do arquivo publicado ([UC-DASH-003] critério [AC-DASH-003-1]); ausência
  total → `DASH.DUTY_EVIDENCE_REQUIRED` com `missing[]`; hash presente mas malformado ou que não
  confere com a captura → `DASH.DUTY_EVIDENCE_HASH_INVALID`. Onde `dashboard-frontends.md` §7
  ("evidência completa") e o contrato §3 (`hash` sem `?`) divergem do caso de uso, vale o artefato
  de produto (cabeçalho de `dashboard-frontends.md`); divergência registrada como OD-D16-011.

## 7. Saída

- após `archive`, o ciclo permanece visível em D-08 no histórico; o calendário de D-08 reflete
  o novo período aberto.

## 8. Segurança e LGPD

- N0 — sem dado pessoal; `DASH.DUTY_NOT_OWNER` quando quem avança não é dono do dever
  ([AC-DASH-002 análogo, UC-DASH-003]).

## 9. Acessibilidade

- estágios do `DutyCycleStepper` com rótulo textual, não só posição visual; "sem prazo definido"
  como valor de primeira classe (D-08/D-09).

## 10. Testes

- roteamento: N0-ROLES (presença) e CANDIDATO/CIDADAO (ausência); N3 bloqueado.
- transições respeitam pré-estado ([WF-DASH-002]); `prove` com só protocolo, só captura ou só
  hash avança a `COMPROVADO` (três casos válidos, isolados); `prove` sem nenhuma evidência falha
  com `DASH.DUTY_EVIDENCE_REQUIRED` ([AC-DASH-003-1]); ligados a [AC-DASH-003-2] (relógio do FUNSET) e [AC-DASH-003-3] (sanção
  expressa do IND-DASH-202).

## Componentes compartilhados

`DutyCycleStepper`, `EvidenceAttach`, `FreshnessSeal`, `DeepLinkButton`.

## Chaves i18n

- `dashboard.screens.deveres_id_ciclos_period.title` — "Ciclo do dever"
- `dashboard.screens.deveres_id_ciclos_period.intro` — "Janela de apuração até arquivamento,
  com evidência de cumprimento anexada."
- `dashboard.screens.deveres_id_ciclos_period.empty` — "Nenhum ciclo aberto para este dever e
  período."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.duty_states.*`,
`dashboard.errors.*`, `dashboard.common.fixed.no_deadline_defined`,
`dashboard.forms.avancar_ciclo.*`, `dashboard.a11y.*`.
