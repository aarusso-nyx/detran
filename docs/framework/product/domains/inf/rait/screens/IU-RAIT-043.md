---
id: IU-RAIT-043
title: Turmas e unidades de julgamento — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-21
---

Ficha da rota `gestao/turmas` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-039], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-043`; `path`: `gestao/turmas` (route-manifest.md #44); `screen`: `—`.
- módulo `gestao`; página `UnitsPage`, componente inteligente `UnitWizard` (§5.3).
- nível `L1`; slug i18n `gestao-turmas`.

## 2. Acesso

- papel: `rait-manager` (route-manifest.md linha 44).
- guardas: `raitAuthGuard`; `roleGuard(['rait-manager'])`.
- chave de política: `inf:rait-unit:constitute`, `inf:rait-unit:activate` (`rait-web-frontend.md` §7).
- pré-condição: gatilho de capacidade atingido — fila > capacidade por 3 meses consecutivos
  ([WF-RAIT-004] §8; [RN-RAIT-139]; OD-008 vigente, `open-decisions-rait.md` §A/§E).

## 3. Entrada

- chega-se pela navegação do módulo `gestao` ou pelo pedido de reforço de `/gestao/capacidade`
  ([UC-RAIT-038] fluxo 4).

## 4. Dados

- resolver: "unidades e constituição" (route-manifest.md).
- leitura pelo cliente CRUD do worklist (nível L1): dimensionamento (recursos/mês, capacidade
  atual, fila projetada), composição pretendida (≥3 integrantes por categoria — [RN-RAIT-139]).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.
- **composição incompleta**: unidade permanece `TURMA_EM_CONSTITUICAO`, sem efeito na
  distribuição ([UC-RAIT-039] 2a).

## 6. Comandos

| Ação (`recurso:ação`)  | Papel          | Pré-estado → pós-estado                        | Comando                                  | Confirmação                                                        | Erros esperados                  |
| ---------------------- | -------------- | ---------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| `rait.unit:constitute` | `rait-manager` | — → `TURMA_EM_CONSTITUICAO` ([WF-RAIT-004] §9) | `POST /v1/inf/rait/units` (pendente, §7) | "abre a constituição da unidade; sem efeito na distribuição ainda" | `RAIT.UNIT_TRIGGER_NOT_MET`      |
| `rait.unit:activate`   | `rait-manager` | `TURMA_EM_CONSTITUICAO` → `TURMA_ATIVA`        | `POST /v1/inf/rait/units` (pendente, §7) | "unidade passa a receber casos nos lotes seguintes"                | `RAIT.UNIT_COORDINATOR_REQUIRED` |

- `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre.
- ativação com duas ou mais unidades exige coordenador designado ([UC-RAIT-039]
  AC-RAIT-039-2; Res. 357 item 2.3).

## 7. Saída

- unidade ativada aparece nos lotes de sorteio seguintes ([UC-RAIT-039] fluxo 4).
- divergência de entendimento entre turmas: mecanismo de uniformização **(pendente regimento —
  OD-108, `open-decisions-rait.md` §B)**, registrado no backlog.

## 8. Segurança e LGPD

- nenhum dado pessoal de terceiro; composição por papel/mandato, não por dado sensível.

## 9. Acessibilidade e atalhos

- `UnitWizard` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-039-1 — unidade em constituição não recebe casos.
- AC-RAIT-039-2 — ativação sem coordenador é bloqueada.
- roteamento: `rait-manager` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente; `UnitWizard` (§5.3, gestao) é o único componente inteligente.

## Chaves i18n

- `rait.screens.gestao-turmas.title` — "Turmas e unidades de julgamento"
- `rait.screens.gestao-turmas.cmd.constitute` — "Constituir turma"
- `rait.screens.gestao-turmas.cmd.activate` — "Ativar turma"
