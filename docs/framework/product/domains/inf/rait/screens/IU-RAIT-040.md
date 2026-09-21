---
id: IU-RAIT-040
title: Drill-down de caso em risco — especificação de tela
status: draft
apps: [rait]
sources:
  [
    REF-CTB-extracts-raw,
    REF-LEI-9873-1999,
    REF-CONTRAN-357,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-09-21
---

Ficha da rota `gestao/radar/:caseId` (`rait-web-frontend.md` §4; tela T-15 de [IU-RAIT-001]).
Fontes: [UC-RAIT-010], [UC-RAIT-011], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-040`; `path`: `gestao/radar/:caseId` (route-manifest.md #41); `screen`: `T-15`.
- módulo `gestao`; página `RiskCaseDrilldownPage`, componente inteligente `ReassignDialog` (§5.3).
- nível `L2`; slug i18n `gestao-radar-caseId`.

## 2. Acesso

- papel: `rait-manager` (route-manifest.md linha 41).
- guardas: `raitAuthGuard`; `roleGuard(['rait-manager'])`.
- chaves de política das ações: `inf:rait-assignment:reassign`, `inf:rait-clock:acknowledge-alert`
  (`rait-web-frontend.md` §7).
- pré-condição: caso em `DISTRIBUIDO`, `EM_INSTRUCAO` ou `DILIGENCIA` para reatribuição
  ([UC-RAIT-011] Pré-condições).

## 3. Entrada

- chega-se pela linha do radar (`/gestao/radar`, [IU-RAIT-039]); parâmetro de rota `:caseId`.
- sem deep-link de filtro; a URL do caso é o formato canônico.

## 4. Dados

- resolver: "drill-down e ação (reatribuir, priorizar, escalar)" (route-manifest.md).
- leitura via `RadarFacade`: causa do atraso, histórico de responsáveis, relógio que ameaça o
  caso, tempo sem movimentação (`rait-web-journeys/JW-09-gestor.md` #2).
- ações previstas em [JRN-RAIT-004] passo 3: reatribuir, priorizar em pauta, escalar ao
  presidente/coordenador, abrir incidente.

## 5. Estados

- **carregando / erro recuperável / sem permissão**: padrão (`rait-error-catalog.md` §4).
- **conflito (409)**: `RAIT.ASSIGNMENT_ALREADY_ACTIVE` ou `RAIT.CLOCK_ALERT_ALREADY_ACKNOWLEDGED`
  → recarrega e reabre com os dados atuais, toast "o estado mudou desde a sua última leitura".

## 6. Comandos

| Ação (`recurso:ação`)          | Papel                                                                        | Pré-estado → pós-estado                                                         | Comando                                                      | Confirmação                                                                                          | Erros esperados                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `rait.assignment:reassign`     | `rait-coordinator`, `rait-manager`, `rait-chair` (`rait-web-frontend.md` §7) | `DISTRIBUIDO`/`EM_INSTRUCAO`/`DILIGENCIA` → inalterado, responsável muda (§6.6) | `PATCH assignments/{id}` (release) + `POST assignments` (§7) | "a reatribuição não reinicia o caso; o trabalho já feito é preservado" ([UC-RAIT-011] AC-RAIT-011-1) | `RAIT.REASSIGN_REASON_REQUIRED`, `RAIT.REASSIGN_TO_SAME_MEMBER`, `RAIT.MEMBER_IMPEDED` |
| `rait.clock:acknowledge-alert` | responsável do nível (`rait-web-journeys/JW-02` #3)                          | alerta aberto → reconhecido                                                     | `PATCH clock-alerts/{id}` (§7)                               | —                                                                                                    | `RAIT.CLOCK_ALERT_ALREADY_ACKNOWLEDGED`, `RAIT.CLOCK_ALERT_ROLE_MISMATCH`              |

- ambos os comandos: `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre
  (`rait-web-frontend.md` §7 último parágrafo).
- motivo tipado obrigatório em `{impedimento, afastamento, rebalanceamento, risco_prescricao}`
  ([UC-RAIT-011] AC-RAIT-011-2).
- "abrir incidente" (citado em `rait-web-journeys/JW-09-gestor.md` #2/#3) e "priorizar em
  pauta"/"escalar ao presidente" ([JRN-RAIT-004] passo 3) não têm nome de comando nem endpoint no
  catálogo `rait-web-frontend.md` §7 — proposto **OD-R12-014**: nomear e documentar os comandos
  `rait-incident:open` e o de escalonamento/priorização a partir do radar.

## 7. Saída

- após reatribuir: linha atualizada por SSE `assignment.changed`; evento registrado na trilha do
  caso (`rait-web-journeys/JW-02-coordenador.md`, sequência).
- pool esgotado (nenhum membro elegível) escala incidente de capacidade ao gestor RAIT
  ([UC-RAIT-011] AC-RAIT-011-5), em vez de deixar o caso sem responsável silenciosamente.

## 8. Segurança e LGPD

- texto livre da petição nunca em painéis ([RN-RAIT-134]); terceiros suprimidos ([RN-RAIT-137]).
- motivo da reatribuição fica no histórico do caso, auditável ([UC-RAIT-011] AC-RAIT-011-2).

## 9. Acessibilidade e atalhos

- diálogo de reatribuição navegável por teclado; motivo obrigatório com foco no primeiro erro.
- risco não depende só de cor ([IU-RAIT-001] §4); contraste AA.

## 10. Testes

- AC-RAIT-010-1, AC-RAIT-010-4 (herdadas do radar) — causa e teto legal visíveis.
- AC-RAIT-011-1 — reatribuir preserva trabalho e estado.
- AC-RAIT-011-2 — motivo obrigatório e tipado.
- AC-RAIT-011-3 — nunca reatribui a quem declarou impedimento.
- AC-RAIT-011-4 — reatribuição em massa prioriza risco.
- AC-RAIT-011-5 — pool esgotado vira incidente de capacidade.
- roteamento: `rait-manager` ativa; demais papéis → `/sem-permissao` (M14).

## Componentes compartilhados

`RiskFlag`, `DeadlineChip` (§5.2); `ReassignDialog` (§5.3, gestao).

## Chaves i18n

- `rait.screens.gestao-radar-caseId.title` — "Causa do atraso"
- `rait.screens.gestao-radar-caseId.cmd.reassign` — "Reatribuir"
- `rait.screens.gestao-radar-caseId.cmd.acknowledge-alert` — "Reconhecer alerta"
- `rait.screens.gestao-radar-caseId.field.motivo` — "Motivo da reatribuição"

Rótulos de estado do caso (`rait.caseState.*`) e de erro (`rait.errors.*`) são referenciados da
semente, nunca redefinidos.
