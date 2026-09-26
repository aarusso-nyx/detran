# Iteração restrita 3 — `TASK-0002` (`inspector-tests`) — delivery-review-CTG-0001-2

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca escreva código de produção. Declare na primeira linha: **Papel: Inspector**.

Continuação de `work/rounds/R-0018/prompts/TASK-0002.md`, restrita ao achado único de
`work/rounds/R-0018/reviews/delivery-review-CTG-0001-2.json`.

## Leitura (lista fechada)

1. `work/rounds/R-0018/reviews/delivery-review-CTG-0001-2.json`
2. `work/rounds/R-0018/contracts/CTG-0001.md` §3.4, §7.1 (C-01-05), §7.2 (C-01-11)
3. `tools/docs/state-index/tests/gate.test.mjs`, `tools/docs/state-index/tests/fixture.mjs`

## Pode tocar

`tools/docs/state-index/tests/**` — somente **acrescentar** casos.

## Tarefa

Negativos com o id no nome: (1) **C-01-05** — segunda linha de §Aliases para o mesmo stub de
`docs/meta/adr` (duplicata) com ID ou alvo divergente → achado; segunda linha idêntica (duplicata
exata) → achado (o contrato exige uma linha por stub); (2) **C-01-05** ou **C-01-11** (use o id que o
contrato §7.1/§7.2 fixar para aliases de `law/adr`) — modo `migrated` com linha de alias do stub de
`law/adr` cuja coluna 1 (`Número antigo`) ou coluna 3 (`Número novo`) diverge → achado.

## Critérios de aceitação

- `node --test 'tools/docs/state-index/tests/*.test.mjs' 'tools/docs/adr/tests/*.test.mjs'` →
  anteriores verdes; novos negativos que o `check.mjs` atual não detecta **falham** (relate).
- `node_modules/.bin/prettier --check tools/docs/state-index/tests` → OK.

Entrega: formato de `TASK-0002.md` §Entrega, `Tarefa: TASK-0002 (iteração 3)`.
