---
id: IU-RAIT-044
title: Incidentes e extinções declaradas — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-LEI-9873-1999]
updated: 2026-09-21
---

Ficha da rota `gestao/incidentes` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-023], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-044`; `path`: `gestao/incidentes` (route-manifest.md #45); `screen`: `—`.
- módulo `gestao`; página `IncidentsPage`, componente inteligente `IncidentForm` (§5.3).
- nível `L2`; slug i18n `gestao-incidentes`.

## 2. Acesso

- papel: `rait-manager` (route-manifest.md linha 45).
- guardas: `raitAuthGuard`; `roleGuard(['rait-manager'])`.
- pré-condição: bandeira `PRESCRITO_OPERACIONAL` ([WF-RAIT-002] §4) ou `T-DEC` vencido sem NP
  ([WF-INF-003] #10; [UC-RAIT-023] Pré-condições).

## 3. Entrada

- chega-se pelo radar quando um caso atinge `PRESCRITO_OPERACIONAL`
  (`rait-web-journeys/JW-09-gestor.md`, fluxo de telas) ou pela navegação do módulo.

## 4. Dados

- resolver: "`PRESCRITO_OPERACIONAL`, extinções declaradas" (route-manifest.md).
- leitura via `RadarFacade`/`CaseFacade`: casos bloqueados para mérito, tarefa de declaração
  pendente ([UC-RAIT-023] fluxo 1).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.
- **mérito bloqueado**: um relator que tenta registrar voto em caso `PRESCRITO_OPERACIONAL` é
  bloqueado e direcionado à tarefa de declaração ([UC-RAIT-023] AC-RAIT-023-1) — bloqueio ocorre
  na tela do caso, não aqui; esta tela lista a fila de declaração pendente.

## 6. Comandos

| Ação (`recurso:ação`)     | Papel                                        | Pré-estado → pós-estado                                                            | Comando                                             | Confirmação                                                                                         | Erros esperados                                                        |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `rait.extinction:declare` | `rait-signing-authority` / `rait-chair` (§7) | teto atingido → infração `EXTINTO_PRESCRICAO`/`EXTINTO_DECADENCIA`; caso encerrado | `POST …/commands/declare-extinction` (pendente, §7) | "a declaração cita relógio, termo inicial, data do teto e base legal" ([UC-RAIT-023] AC-RAIT-023-2) | `RAIT.EXTINCTION_CEILING_NOT_REACHED`, `RAIT.EXTINCTION_DECISION_LATE` |

- nesta tela, `rait-manager` **abre o incidente e solicita** a declaração à autoridade/presidente
  (`rait-web-journeys/JW-09-gestor.md`, sequência); quem executa `rait.extinction:declare` é a
  autoridade/presidente, não o gestor — a ação de "abrir incidente" em si (`rait-incident:open`)
  não tem nome de comando sourceado em `rait-web-frontend.md` §7 (mesma lacuna de
  [IU-RAIT-040], **OD-R12-014**).
- `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre.
- incidente com causa raiz é **obrigatório**, sem ele o encerramento não conclui
  ([UC-RAIT-023] AC-RAIT-023-3).

## 7. Saída

- extinção declarada: infração vai a `EXTINTO_DECADENCIA`/`EXTINTO_PRESCRICAO`, sem penalidade,
  sem RENACH, restituição se houver pagamento ([UC-RAIT-023] fluxo 3 → [UC-RAIT-033]).
- indicador de prescrição do dashboard é atualizado ([UC-RAIT-023] fluxo 4).

## 8. Segurança e LGPD

- comunicação a LEGAL/auditoria não expõe dado de terceiro além do necessário ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- `IncidentForm` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-023-1 — mérito bloqueado após o teto.
- AC-RAIT-023-2 — declaração cita relógio, termo inicial, teto e base legal.
- AC-RAIT-023-3 — incidente obrigatório para concluir o encerramento.
- roteamento: `rait-manager` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`RiskFlag`, `DeadlineChip` (§5.2); `IncidentForm` (§5.3, gestao).

## Chaves i18n

- `rait.screens.gestao-incidentes.title` — "Incidentes e extinções declaradas"
- `rait.screens.gestao-incidentes.cmd.declare-extinction` — "Declarar extinção"
