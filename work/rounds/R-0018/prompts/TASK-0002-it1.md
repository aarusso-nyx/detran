# Iteração restrita 1 — `TASK-0002` (`inspector-tests`) — Adenda A2

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca escreva código de produção. Declare na primeira linha: **Papel: Inspector**.

Esta iteração vale como continuação de `work/rounds/R-0018/prompts/TASK-0002.md` (mesmas regras,
fronteira e formato de entrega), restrita a **um** item.

## Leitura (lista fechada)

1. `work/rounds/R-0018/contracts/CTG-0001.md` §6.5 e §Adendas (A2)
2. `tools/docs/state-index/tests/gate.test.mjs` e `tools/docs/state-index/tests/fixture.mjs`

## Pode tocar

`tools/docs/state-index/tests/**` — somente para **acrescentar** os casos de C-01-36. Nenhum teste
existente é removido, relaxado ou alterado.

## Tarefa

Codificar **C-01-36** (Adenda A2): (+) célula de título com `` `a\|b` `` lida com as quatro colunas
corretas, fixture íntegra sem achados; (−) a mesma linha com `a|b` cru desloca colunas e o gate acusa
o critério correspondente (C-01-15 ou C-01-07/08). Nomes "dado … quando … então …" com o id.

## Critérios de aceitação

- `node --test 'tools/docs/state-index/tests/*.test.mjs' 'tools/docs/adr/tests/*.test.mjs'` → todos
  os testes anteriores continuam passando; o caso (+) de C-01-36 **falha** contra o
  `check.mjs` atual (ainda sem desescape) — é o sinal de que o teste detecta; relate a saída.
- `grep -c 'C-01-36' tools/docs/state-index/tests/*.test.mjs` → ≥ 1.
- `node_modules/.bin/prettier --check tools/docs/state-index/tests` → OK.

Entrega: relatório no formato de `TASK-0002.md` §Entrega, com `Tarefa: TASK-0002 (iteração 1)`.
