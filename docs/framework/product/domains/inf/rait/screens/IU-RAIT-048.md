---
id: IU-RAIT-048
title: Pools e estratégias de distribuição — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357]
updated: 2026-09-21
---

Ficha da rota `organizacao/pools` (`rait-web-frontend.md` §4).
Fontes: [RN-RAIT-141]. Sem `[UC-RAIT-nnn]` — o manifesto não cita UC para esta linha
(`route-manifest.md`, regra da coluna `uc`: nenhuma das duas fontes cita para
`/organizacao/pools`); conteúdo derivado de [WF-RAIT-004] §2 e das jornadas
`rait-web-journeys/JW-02-coordenador.md` #2 e `JW-12-auditor-admin.md` #7.

## 1. Identidade

- id `IU-RAIT-048`; `path`: `organizacao/pools` (route-manifest.md #50); `screen`: `—`.
- módulo `organizacao`; página `PoolsPage`, componente inteligente `PoolStrategyForm` (§5.3).
- nível `L1` — lista/leitura pelo cliente CRUD de `BP-INF-RAIT-WORKLIST-001`; slug i18n
  `organizacao-pools`.

## 2. Acesso

- papéis: `rait-coordinator`, `agency-admin` (route-manifest.md linha 50).
- guardas: `raitAuthGuard`; `roleGuard(['rait-coordinator', 'agency-admin'])`.
- sem chave de política nomeada em `rait-web-frontend.md` §7 para este recurso; a ação usa
  `PATCH pools/{id}` diretamente (`JW-02-coordenador.md` #2; `JW-12-auditor-admin.md` #7).

## 3. Entrada

- chega-se pelo redirect de `/organizacao` (`agency-admin` **não** está nos papéis da raiz
  `/organizacao` na §4 — só em `/organizacao/pools` — acesso direto ao filho; divergência
  registrada em `OD-R12-003`, `route-manifest.md` §B) ou pela navegação.

## 4. Dados

- resolver: "pools e estratégias" (route-manifest.md).
- leitura pelo cliente CRUD do worklist: estratégia por pool (`pull`, `round_robin`,
  `load_balanced`), limites, instância ([WF-RAIT-004] §2).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.

## 6. Comandos

| Ação                       | Papel                              | Pré-estado → pós-estado                      | Comando                                  | Confirmação                                                   | Erros esperados                                              |
| -------------------------- | ---------------------------------- | -------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| ajustar estratégia/limites | `rait-coordinator`, `agency-admin` | parâmetros do pool inalterados → atualizados | `PATCH pools/{id}` (não sourceado em §7) | "a ordem única de consumo das filas não muda" ([RN-RAIT-141]) | `RAIT.POOL_STRATEGY_INVALID`, `RAIT.POOL_INSTANCE_DUPLICATE` |

- `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre.
- sem UC dedicado citado pelo manifesto para esta rota; critérios de teste derivam do catálogo de
  erros e de [WF-RAIT-004] §2, não de `AC-RAIT-*`.

## 7. Saída

- alteração de estratégia reflete na próxima distribuição da fila coletiva.

## 8. Segurança e LGPD

- nenhum dado pessoal; parâmetros operacionais do pool.

## 9. Acessibilidade e atalhos

- `PoolStrategyForm` navegável por teclado; contraste AA.

## 10. Testes

- critérios do catálogo de erros: `RAIT.POOL_STRATEGY_INVALID` (estratégia fora do enum),
  `RAIT.POOL_INSTANCE_DUPLICATE` (segundo pool ativo para a mesma instância).
- roteamento: `rait-coordinator`/`agency-admin` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`PoolStrategyForm` (§5.3, organizacao); nenhum de §5.2 aplica diretamente.

## Chaves i18n

- `rait.screens.organizacao-pools.title` — "Pools e estratégias"
- `rait.screens.organizacao-pools.cmd.update` — "Salvar estratégia do pool"
