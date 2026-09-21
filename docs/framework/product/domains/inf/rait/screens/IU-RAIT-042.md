---
id: IU-RAIT-042
title: Capacidade e planejamento do período — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-DETRANAM-SERVICOS]
updated: 2026-09-21
---

Ficha da rota `gestao/capacidade` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-038], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-042`; `path`: `gestao/capacidade` (route-manifest.md #43); `screen`: `—`.
- módulo `gestao`; página `CapacityPlanPage`, componente inteligente `CapacitySimulator` (§5.3).
- nível `L1`; slug i18n `gestao-capacidade`.

## 2. Acesso

- papéis: `rait-coordinator`, `rait-manager` (route-manifest.md linha 43).
- guardas: `raitAuthGuard`; `roleGuard(['rait-coordinator', 'rait-manager'])`.
- chave de política: `inf:rait-capacity-plan:publish` (comando citado em
  `rait-web-journeys/JW-02-coordenador.md` #6 e `JW-09-gestor.md` #5; não consta na tabela §7 de
  `rait-web-frontend.md` — mesma pendência de endpoint registrada em §11).

## 3. Entrada

- chega-se pela navegação do módulo ou pelo redirect de `/gestao`.
- aceita `?q=&ordem=&filtro=` para o período planejado.

## 4. Dados

- resolver: "projeção e plano do período" (route-manifest.md).
- leitura pelo cliente CRUD do worklist (nível L1); séries do dashboard: chegada por semana,
  decididas por revisor, `WIP`, idade da fila, ausências programadas ([WF-RAIT-004] §8).
- projeção da fila do próximo período com chegada média e capacidade escalada, destacando semanas
  com capacidade abaixo da chegada ([UC-RAIT-038] fluxo 1).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.
- **dados insuficientes**: início de operação usa valores institucionais de referência marcados
  como hipótese ([UC-RAIT-038] 1a).

## 6. Comandos

| Ação (`recurso:ação`)        | Papel                           | Pré-estado → pós-estado            | Comando                                    | Confirmação                                                              | Erros esperados |
| ---------------------------- | ------------------------------- | ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ | --------------- |
| `rait-capacity-plan:publish` | `rait-coordinator` (`JW-02` #6) | plano rascunhado → plano publicado | não sourceado em `rait-web-frontend.md` §7 | "o plano registra medidas, responsáveis e datas" ([UC-RAIT-038] fluxo 3) | —               |

- `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre.
- lacuna estrutural (capacidade abaixo da chegada por 3 meses) **exige** registrar medida ou
  pedido de reforço ([UC-RAIT-038] AC-RAIT-038-2) — bloqueio de forma, não de servidor.

## 7. Saída

- pedido de reforço estrutural vai ao gestor com a memória de cálculo; gestor decide reforço,
  hora extra ou proposta de nova turma ([UC-RAIT-038] fluxo 4 → [UC-RAIT-039], [IU-RAIT-043]).

## 8. Segurança e LGPD

- nenhum dado pessoal de terceiro nesta tela; projeções agregadas por pool/unidade.

## 9. Acessibilidade e atalhos

- `CapacitySimulator` com resultado textual explícito (não só gráfico); contraste AA.

## 10. Testes

- AC-RAIT-038-1 — projeção explícita (chegada, capacidade, fila por semana).
- AC-RAIT-038-2 — lacuna estrutural exige medida ou pedido de reforço.
- roteamento: `rait-coordinator`/`rait-manager` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`KpiTile`, `TrendChart` (§5.2); `CapacitySimulator` (§5.3, gestao).

## Chaves i18n

- `rait.screens.gestao-capacidade.title` — "Capacidade e planejamento"
- `rait.screens.gestao-capacidade.cmd.publish` — "Publicar plano do período"
