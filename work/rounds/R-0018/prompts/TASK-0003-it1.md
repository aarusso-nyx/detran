# Iteração restrita 1 — `TASK-0003` (`engineer-backend`) — Adenda A2

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca altere testes. Declare na primeira linha: **Papel: Engineer**.

Esta iteração vale como continuação de `work/rounds/R-0018/prompts/TASK-0003.md` (mesmas regras e
formato de entrega), restrita a **um** item.

## Leitura (lista fechada)

1. `work/rounds/R-0018/contracts/CTG-0001.md` §6.5 e §Adendas (A2)
2. `tools/docs/state-index/check.mjs`; os testes de C-01-36 em `tools/docs/state-index/tests/`

## Pode tocar

`tools/docs/state-index/check.mjs` — somente a divisão de linha de tabela em células.

## Tarefa

Implementar a Adenda A2: `\|` dentro de uma linha de tabela não separa células e vira `|` literal no
conteúdo da célula. Nada mais muda.

## Critérios de aceitação

- `pnpm test:state-index` → todos os testes passam, 0 falhas (inclusive C-01-36).
- `pnpm verify:state-index` sobre a worktree → a linha `C-01-15 DESIGN-DECISIONS.md:15 …` desaparece;
  relate a saída integral (outros achados, se houver, são do TASK-0004 e só são relatados).
- `node_modules/.bin/prettier --check tools/docs/state-index` → OK.

Entrega: relatório no formato de `TASK-0003.md` §Entrega, com `Tarefa: TASK-0003 (iteração 1)`.
